import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { slugifyFilePath, slugTag } from "@quartz-community/utils"
import { mergeBib, mergedBibPath } from "../bib"
import { repoRoot } from "../repo"
import { bibKeys, citations } from "./source-checks"
import { fieldsOf, type Tree, type Violation } from "./tree"

export interface BuildResult {
  violations: Violation[]
  outDir?: string
}

// 트리를 임시 폴더로 빌드한다. 합본 bib는 이 트리의 bib/로 바꿔 빌드하고, 끝나면 원래대로 되돌린다.
export function build(tree: Tree): BuildResult {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "ash-wiki-check-"))
  const previousBib = fs.existsSync(mergedBibPath) ? fs.readFileSync(mergedBibPath) : null
  try {
    mergeBib(tree.root)
    const result = spawnSync(
      process.execPath,
      [
        path.join(repoRoot, "quartz", "bootstrap-cli.mjs"),
        "build",
        "-d",
        path.join(tree.root, "content"),
        "-o",
        outDir,
      ],
      { cwd: repoRoot, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
    )
    if (result.status === 0) return { violations: [], outDir }
    fs.rmSync(outDir, { recursive: true, force: true })
    return { violations: buildErrors(tree, `${result.stdout}\n${result.stderr}`) }
  } finally {
    if (previousBib === null) fs.rmSync(mergedBibPath, { force: true })
    else fs.writeFileSync(mergedBibPath, previousBib)
  }
}

function buildErrors(tree: Tree, log: string): Violation[] {
  const plain = log.replace(/\x1b\[[0-9;]*m/g, "")
  const failures = [...plain.matchAll(/Failed to process \w+ `([^`]+)`: (.*)/g)].map((match) => ({
    file: path.relative(tree.root, match[1]).split(path.sep).join("/"),
    message: match[2].trim(),
  }))
  if (failures.length > 0) return failures
  const lastLines = plain
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-3)
  return [{ file: "build", message: lastLines.join(" / ") }]
}

// 산출물 검사: 수식과 인용이 렌더됐는지, 태그 목록에 페이지가 나오는지 본다.
export function checkOutput(tree: Tree, outDir: string): Violation[] {
  const violations: Violation[] = []
  const keys = bibKeys(tree)
  for (const page of tree.pages) {
    if (page.kind !== "page") continue
    const slug = slugifyFilePath(page.rel as never)
    const htmlPath = path.join(outDir, `${slug}.html`)
    if (!fs.existsSync(htmlPath)) {
      violations.push({ file: page.file, message: `산출물이 없다: ${slug}.html` })
      continue
    }
    // 본문만 본다. <meta> 설명에는 description 플러그인이 [@키] 원문을 그대로 넣는다.
    const pageHtml = fs.readFileSync(htmlPath, "utf8")
    const html = (pageHtml.match(/<article[\s>][\s\S]*<\/article>/)?.[0] ?? pageHtml)
      .replace(/<pre[\s>][\s\S]*?<\/pre>/g, "")
      .replace(/<code[\s>][\s\S]*?<\/code>/g, "")
    const sourceLines = page.source.split("\n")
    const lineOf = (text: string) => {
      const index = sourceLines.findIndex((line) => line.includes(text))
      return index >= 0 ? index + 1 : undefined
    }
    for (const marker of new Set([...html.matchAll(/\[@[^\]<]*\]/g)].map((m) => m[0]))) {
      violations.push({
        file: page.file,
        line: lineOf(marker),
        message: `번호로 렌더되지 않은 인용: ${marker}`,
      })
    }
    // 디스플레이 식은 여러 줄이라, 식의 첫 줄로 원문 줄을 찾는다.
    for (const { kind, tex } of katexErrors(html)) {
      const message = `${kind}: ${tex}`
      if (violations.some((v) => v.file === page.file && v.message === message)) continue
      violations.push({ file: page.file, line: lineOf(tex.trim().split("\n")[0]), message })
    }
    // 키마다 본문의 번호 링크가 모두 같은 번호이고, 그 번호가 참고문헌 항목의 번호와 같아야 한다.
    const cited = new Map<string, number>()
    for (const { key, line } of citations(page)) {
      if (key && keys.has(key) && !cited.has(key)) cited.set(key, line)
    }
    for (const [key, line] of cited) {
      const at = (message: string) => violations.push({ file: page.file, line, message })
      const escapedKey = escapeRegExp(key)
      const entry = html.match(
        new RegExp(`id="bib-${escapedKey}">\\s*<div class="csl-left-margin">\\[(\\d+)\\]`),
      )
      const numbers = new Set(
        [...html.matchAll(new RegExp(`href="#bib-${escapedKey}"[^>]*>(\\d+)</a>`, "g"))].map(
          (m) => m[1],
        ),
      )
      if (!entry) at(`참고문헌에 항목이 없다: ${key}`)
      else if (numbers.size === 0) at(`번호 인용이 없다: ${key}`)
      else if (numbers.size > 1 || !numbers.has(entry[1])) {
        at(`인용 번호 ${[...numbers].join(", ")}가 참고문헌 번호 [${entry[1]}]와 다르다: ${key}`)
      }
    }
    const frontmatter = page.frontmatter
    if ("error" in frontmatter) continue
    const tags = fieldsOf(page).tags
    if (!Array.isArray(tags)) continue
    // 계층 태그(<구역>/<주제>)를 단 페이지는 주제 목록과 구역 목록 모두에 나와야 한다.
    const linked = new RegExp(`href="(?:\\.\\./)+${escapeRegExp(slug)}"`)
    tags.forEach((tag, index) => {
      if (typeof tag !== "string") return
      const line = frontmatter.lineOf("tags", index)
      const segments = tag.split("/")
      for (let depth = segments.length; depth > 0; depth--) {
        const listed = segments.slice(0, depth).join("/")
        const tagPath = path.join(outDir, "tags", `${slugTag(listed)}.html`)
        if (!fs.existsSync(tagPath)) {
          violations.push({ file: page.file, line, message: `태그 목록이 없다: tags/${listed}` })
        } else if (!linked.test(fs.readFileSync(tagPath, "utf8"))) {
          violations.push({
            file: page.file,
            line,
            message: `태그 목록 tags/${listed}에 페이지가 없다`,
          })
        }
      }
    })
  }
  return violations
}

// KaTeX는 렌더 오류를 빌드 실패로 올리지 않고 페이지에 남긴다. 문법 오류는 식 전체를
// .katex-error로, 정의되지 않은 명령은 .katex 안에서 그 이름만 오류 색으로 그린다.
const katexErrorColor = "#cc0000"

function katexErrors(html: string): { kind: string; tex: string }[] {
  // title 속성에 식 원문이 그대로 들어가 >가 있을 수 있으므로, 따옴표 안은 통째로 넘긴다.
  const errorSpan = /<span class="katex-error"(?:[^>"]|"[^"]*")*>([^<]*)<\/span>/g
  const errors = [...html.matchAll(errorSpan)].map((m) => ({
    kind: "KaTeX 문법 오류",
    tex: decodeEntities(m[1]),
  }))
  const errorText = new RegExp(`style="color:${katexErrorColor};?">([^<]+)<`, "g")
  for (const start of html.matchAll(/<span class="katex">/g)) {
    for (const m of spanAt(html, start.index).matchAll(errorText)) {
      errors.push({ kind: "KaTeX 정의되지 않은 명령", tex: decodeEntities(m[1]) })
    }
  }
  return errors
}

// index에서 여는 <span>부터 짝이 맞는 </span>까지를 돌려준다.
function spanAt(html: string, index: number): string {
  let depth = 0
  for (const tag of html.slice(index).matchAll(/<span[\s>]|<\/span>/g)) {
    depth += tag[0] === "</span>" ? -1 : 1
    if (depth === 0) return html.slice(index, index + tag.index + tag[0].length)
  }
  return html.slice(index)
}

function decodeEntities(text: string): string {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"' }
  return text.replace(/&(?:#x([0-9a-f]+)|#(\d+)|(\w+));/gi, (entity, hex, dec, name) =>
    hex
      ? String.fromCodePoint(parseInt(hex, 16))
      : dec
        ? String.fromCodePoint(Number(dec))
        : (named[name] ?? entity),
  )
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
