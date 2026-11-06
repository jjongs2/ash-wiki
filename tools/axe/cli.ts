import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { parseArgs } from "node:util"
import { chromium, type Browser } from "playwright"
import { repoRoot } from "../repo"
import { serve } from "../serve"
import { axeTargets, EXCEPTIONS, splitExceptions, type Violation } from "./targets"

// 접근성 자동 검사(docs/engine.md의 화면을 고칠 때 절). 로컬 빌드의 대표 페이지에 axe-core를 두 폭, 두 테마로
// 돌리고, 예외가 아닌 위반이 있으면 exit 1이다. CI는 돌리지 않는다. 화면을 고칠 때 사람이 돌린다.
// 사용: npm run axe -- --site <빌드 폴더> [--json <파일>]
const { values } = parseArgs({
  options: { site: { type: "string" }, json: { type: "string" } },
})
if (values.site === undefined) throw new Error("--site <빌드 폴더>가 필요하다")

const axeSource = fs.readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
)
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]
const views = [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
] as const
const themes = ["light", "dark"] as const

type Result = { target: string; width: number; theme: string; violations: Violation[] }

async function check(
  browser: Browser,
  base: string,
  target: ReturnType<typeof axeTargets>[number],
  view: (typeof views)[number],
  theme: (typeof themes)[number],
): Promise<Violation[]> {
  const context = await browser.newContext({
    viewport: view,
    colorScheme: theme,
    locale: "ko-KR",
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  // 테마는 처음 불러오기 전에 넣는다. 불러온 뒤 바꾸면 도해가 다른 경로로 칠해진다.
  await page.addInitScript((theme) => {
    localStorage.setItem("theme", theme)
    document.addEventListener("nav", () => {
      ;(window as { axeNav?: boolean }).axeNav = true
    })
  }, theme)
  try {
    // load는 그래프가 부르는 바깥 리소스를 기다리다 멈추므로 본문이 나올 때까지만 기다린다.
    // 태그 목록의 <article>은 hidden이라 attached로 기다린다.
    await page.goto(`${base}${target.path}`, { waitUntil: "commit" })
    await page.waitForSelector("article", { state: "attached" })
    await page.waitForFunction(() => (window as { axeNav?: boolean }).axeNav === true)
    await page.evaluate(() => document.fonts.ready)
    if (target.search !== undefined) {
      await page.getByRole("button", { name: "검색" }).first().click()
      await page.getByRole("textbox", { name: "검색어를 입력하세요" }).fill(target.search)
      await page.waitForSelector(".result-card:not(.no-match)")
    }
    // 전환(테마 색, 링크 색)이 끝난 색을 재도록 잠시 기다린다.
    await page.waitForTimeout(500)
    await page.addScriptTag({ content: axeSource })
    // 노드마다 예외 선택자에 걸리는지(노드 자신이나 조상) 적어 온다. 규칙과 맞춰 거르는 것은 splitExceptions다.
    return await page.evaluate(
      async ({ tags, exceptions }) => {
        const axe = (window as unknown as { axe: typeof import("axe-core") }).axe
        const result = await axe.run({ runOnly: { type: "tag", values: tags }, elementRef: true })
        return result.violations.map((v) => ({
          id: v.id,
          help: v.help,
          nodes: v.nodes.map((n) => ({
            target: n.target.join(" "),
            html: n.html.slice(0, 200),
            summary: (n.failureSummary ?? "").split("\n").slice(1).join(" ").trim(),
            exceptions: exceptions
              .filter((e) => (n.element as Element | undefined)?.closest(e.selector))
              .map((e) => e.name),
          })),
        }))
      },
      { tags, exceptions: EXCEPTIONS },
    )
  } finally {
    await context.close()
  }
}

async function main() {
  const local = await serve(path.resolve(values.site!))
  const browser = await chromium.launch()
  const results: Result[] = []
  let failures = 0
  try {
    for (const target of axeTargets(repoRoot)) {
      for (const view of views) {
        for (const theme of themes) {
          const raw = await check(browser, local.base, target, view, theme)
          const { violations, excepted } = splitExceptions(raw)
          results.push({ target: target.name, width: view.width, theme, violations })
          const count = violations.reduce((n, v) => n + v.nodes.length, 0)
          const skipped = excepted.reduce((n, v) => n + v.nodes.length, 0)
          failures += count
          console.log(
            `${target.name} ${view.width}px ${theme}: 위반 ${count}곳` +
              (skipped > 0 ? `, 예외 ${skipped}곳` : "") +
              violations
                .map((v) => `\n  ${v.id} ×${v.nodes.length}: ${v.nodes[0].target}`)
                .join(""),
          )
        }
      }
    }
  } finally {
    await browser.close()
    local.close()
  }
  if (values.json !== undefined)
    fs.writeFileSync(path.resolve(values.json), JSON.stringify(results, null, 2) + "\n")
  if (failures > 0) {
    console.error(`예외가 아닌 위반 ${failures}곳`)
    process.exitCode = 1
  }
}

await main()
