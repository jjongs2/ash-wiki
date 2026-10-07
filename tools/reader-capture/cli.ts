import fs from "node:fs"
import http from "node:http"
import type { AddressInfo } from "node:net"
import path from "node:path"
import { parseArgs } from "node:util"
import handler from "serve-handler"
import { chromium, type Browser } from "playwright"
import { inTopic, loadTree } from "../check-content/tree"
import { repoRoot } from "../repo"
import { diagramSources, readerText, svgLines } from "./text"

// Reader Testing의 캡처(.claude/skills/reader-testing). 페이지마다 데스크톱 폭과 390px 폭 스크린샷,
// 독자 텍스트를 받고, 본문이 위키링크로 가리키는 페이지는 독자 텍스트만 받는다.
// 사용: npm run reader-capture -- --out <폴더> (--topic <태그> | <슬러그>...) [--site <빌드 폴더>]
// --site가 없으면 배포 사이트에서 받는다. --site는 로컬 빌드 폴더를 이 프로세스 안의 서버로 띄워 받는다. 따로 띄운 서버는 셸이 끝나면 죽기 때문이다.
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: "string" },
    topic: { type: "string" },
    site: { type: "string" },
  },
})
if (values.out === undefined) throw new Error("--out <폴더>가 필요하다")
const out = path.resolve(values.out)

// 폭마다 뷰포트와 스크린샷 조각의 크기. 긴 페이지를 한 장으로 찍으면 읽을 때 줄어 글자가 뭉개지므로
// 조각으로 나눈다. 조각은 이미지 하나가 줄지 않고 읽히는 크기(긴 변 1568px, 약 115만 화소) 안에 둔다.
const views = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "390", width: 390, height: 1560 },
] as const
// 이미지 토큰 어림. 가로 × 세로 / 750.
const imageTokens = (width: number, height: number) => Math.ceil((width * height) / 750)

function targetSlugs(): string[] {
  if (values.topic !== undefined && positionals.length > 0)
    throw new Error("--topic과 슬러그 목록 가운데 하나만 준다")
  if (values.topic === undefined) {
    if (positionals.length === 0) throw new Error("--topic <태그>나 슬러그 목록이 필요하다")
    return positionals
  }
  const slugs = loadTree(repoRoot)
    .pages.filter((page) => page.kind === "page" && inTopic(page, values.topic))
    .map((page) => page.name)
  if (slugs.length === 0) throw new Error(`${values.topic} 태그를 단 페이지가 없다`)
  return slugs
}

// 배포 사이트 주소. quartz.config.yaml의 baseUrl이다.
function siteUrl(): string {
  const config = fs.readFileSync(path.join(repoRoot, "quartz.config.yaml"), "utf8")
  const baseUrl = /^\s*baseUrl:\s*(\S+)/m.exec(config)?.[1]
  if (baseUrl === undefined) throw new Error("quartz.config.yaml에 baseUrl이 없다")
  return `https://${baseUrl}`
}

async function serve(dir: string): Promise<{ base: string; close: () => void }> {
  const server = http.createServer((req, res) =>
    handler(req, res, { public: dir, cleanUrls: true, directoryListing: false }),
  )
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  const { port } = server.address() as AddressInfo
  return { base: `http://127.0.0.1:${port}`, close: () => server.close() }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return response.text()
}

// 페이지 하나의 독자 텍스트. 도해는 SVG를 받아 글자를 넣는다.
async function pageText(base: string, slug: string): Promise<{ text: string; links: string[] }> {
  const url = `${base}/${slug}`
  const html = await fetchText(url)
  const diagrams = new Map<string, string[]>()
  for (const src of diagramSources(html))
    diagrams.set(src, svgLines(await fetchText(new URL(src, url).href)))
  return readerText(html, diagrams)
}

// 폭 하나의 스크린샷 조각을 찍고 파일 이름을 돌려준다.
async function screenshots(
  browser: Browser,
  base: string,
  slug: string,
  view: (typeof views)[number],
): Promise<{ files: string[]; tokens: number }> {
  const context = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    colorScheme: "light",
  })
  const page = await context.newPage()
  await page.addInitScript(() =>
    document.addEventListener("nav", () => {
      ;(window as { readerNav?: boolean }).readerNav = true
    }),
  )
  try {
    // load는 그래프가 부르는 바깥 리소스를 기다리다 멈추므로 본문이 나올 때까지만 기다린다.
    await page.goto(`${base}/${slug}`, { waitUntil: "commit" })
    await page.waitForSelector("article")
    // 본문이 나온 직후에는 스크립트가 아직 돌지 않아, 390px에서 펼친 탐색기가 본문을 덮는다.
    // 컴포넌트는 Quartz가 처음 보내는 nav 이벤트에서 자리를 잡으므로 그 이벤트를 기다린다.
    await page.waitForFunction(() => (window as { readerNav?: boolean }).readerNav === true)
    await page.evaluate(async () => {
      await document.fonts.ready
      const objects = [...document.querySelectorAll("article object")] as HTMLObjectElement[]
      await Promise.all(
        objects.map(
          (object) =>
            new Promise<void>((resolve) => {
              if (object.contentDocument?.readyState === "complete") resolve()
              else {
                object.addEventListener("load", () => resolve(), { once: true })
                setTimeout(resolve, 5_000)
              }
            }),
        ),
      )
    })
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    const files: string[] = []
    let tokens = 0
    // 뷰포트 단위로 찍으면 고정된 머리글이 조각마다 본문을 가리므로, 전체 페이지에서 잘라 찍는다.
    for (let y = 0, n = 1; y < height; y += view.height, n++) {
      const file = `${slug}-${view.name}-${n}.png`
      const clip = { x: 0, y, width: view.width, height: Math.min(view.height, height - y) }
      await page.screenshot({ path: path.join(out, file), fullPage: true, clip })
      files.push(file)
      tokens += imageTokens(clip.width, clip.height)
    }
    return { files, tokens }
  } finally {
    await context.close()
  }
}

async function main() {
  const slugs = targetSlugs()
  const local = values.site === undefined ? undefined : await serve(path.resolve(values.site))
  const base = (local?.base ?? siteUrl()).replace(/\/$/, "")
  fs.mkdirSync(path.join(out, "linked"), { recursive: true })
  const browser = await chromium.launch()
  try {
    const pages = []
    const linked = new Set<string>()
    const texts = new Map<string, string>()
    for (const slug of slugs) {
      const { text, links } = await pageText(base, slug)
      fs.writeFileSync(path.join(out, `${slug}.txt`), text)
      texts.set(slug, text)
      // 대상 페이지끼리 링크해도 linked/에 둔다. 독자는 linked/만 링크로 연다.
      for (const link of links) linked.add(link)
      const shots: Record<string, { files: string[]; tokens: number }> = {}
      for (const view of views) {
        shots[view.name] = await screenshots(browser, base, slug, view)
      }
      pages.push({ slug, text: `${slug}.txt`, chars: text.length, links, screenshots: shots })
      console.log(
        `${slug}: 텍스트 ${text.length}자, ` +
          views
            .map(
              (view) =>
                `${view.name} ${shots[view.name].files.length}장(~${shots[view.name].tokens} 토큰)`,
            )
            .join(", ") +
          `, 링크 ${links.length}`,
      )
    }
    const linkedPages = []
    for (const slug of linked) {
      const text = texts.get(slug) ?? (await pageText(base, slug)).text
      fs.writeFileSync(path.join(out, "linked", `${slug}.txt`), text)
      linkedPages.push({ slug, text: `linked/${slug}.txt`, chars: text.length })
    }
    console.log(`링크된 페이지 ${linkedPages.length}개`)
    const manifest = { base: local ? `local:${values.site}` : base, pages, linked: linkedPages }
    fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
  } finally {
    await browser.close()
    local?.close()
  }
}

await main()
