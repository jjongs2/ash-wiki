import fs from "node:fs"
import path from "node:path"
import { LineCounter, parseDocument, isMap, isSeq, type Document, type Node } from "yaml"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { visit } from "unist-util-visit"
import type { Root } from "mdast"
import { BibSyntaxError, parseBibtex, type BibEntry } from "./bibtex"

export interface Violation {
  file: string
  line?: number
  message: string
}

export interface Frontmatter {
  data: unknown
  // 필드(와 목록 항목)가 있는 파일의 줄 번호. 필드가 없으면 프론트매터 첫 줄을 준다.
  lineOf(field?: string, index?: number): number
}

export interface Page {
  file: string // 트리 루트 기준 경로. 예: content/can-bus.md
  rel: string // content/ 기준 경로. 예: can-bus.md
  name: string // rel에서 .md를 뗀 것. 예: can-bus, tags/network/can
  kind: "page" | "index" | "tag"
  source: string
  frontmatter: Frontmatter | { error: Violation }
  // 프론트매터, 코드, HTML 주석을 공백으로 지운 본문. 줄 번호는 원본과 같다.
  masked: string
  mdast: Root
}

export interface BibFile {
  file: string
  stem: string
  entries: BibEntry[] | { error: Violation }
}

export interface SvgFile {
  file: string // 트리 루트 기준 경로. 예: content/diagrams/can-bus-topology.svg
  source: string
}

export interface Tree {
  root: string
  pages: Page[]
  files: Set<string> // content/ 기준 경로. 페이지가 아닌 파일(도해 등)도 든다.
  svgs: SvgFile[]
  tags: Set<string>
  bib: BibFile[]
  readme: string | null // 트리 루트의 README.md. 없으면 null이다.
}

// 주간 소식(content/news/)은 위키 콘텐츠 밖의 페이지라 검사하지 않는다(ADR 0015). 빌드에는 든다.
const NEWS_DIR = "news/"

export function loadTree(root: string): Tree {
  const contentDir = path.join(root, "content")
  const files = walk(contentDir).filter((rel) => !rel.startsWith(NEWS_DIR))
  const pages = files.filter((rel) => rel.endsWith(".md")).map((rel) => loadPage(root, rel))
  const svgs = files
    .filter((rel) => rel.endsWith(".svg"))
    .map((rel) => ({
      file: `content/${rel}`,
      source: fs.readFileSync(path.join(contentDir, rel), "utf8"),
    }))
  const tags = new Set(
    pages.filter((page) => page.kind === "tag").map((page) => page.name.slice("tags/".length)),
  )
  const bibDir = path.join(root, "bib")
  const bib = walk(bibDir)
    .filter((rel) => rel.endsWith(".bib"))
    .map((rel) => loadBib(`bib/${rel}`, fs.readFileSync(path.join(bibDir, rel), "utf8")))
  const readmePath = path.join(root, "README.md")
  const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : null
  return { root, pages, files: new Set(files), svgs, tags, bib, readme }
}

function walk(dir: string, prefix = ""): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name), `${prefix}${entry.name}/`)
        : [`${prefix}${entry.name}`],
    )
}

function loadPage(root: string, rel: string): Page {
  return parsePage(rel, fs.readFileSync(path.join(root, "content", rel), "utf8"))
}

// content/ 기준 경로와 원문으로 페이지를 읽는다. 반영 뒤 점검은 기준 커밋의 원문도 이것으로 읽는다.
export function parsePage(rel: string, source: string): Page {
  const file = `content/${rel}`
  const kind = rel === "index.md" ? "index" : rel.startsWith("tags/") ? "tag" : "page"
  const lines = source.split("\n")
  let bodyStart = 0
  let frontmatter: Page["frontmatter"] = { data: {}, lineOf: () => 1 }
  if (lines[0]?.trim() === "---") {
    const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---")
    if (end < 0) {
      frontmatter = { error: { file, line: 1, message: "프론트매터가 닫히지 않았다" } }
    } else {
      bodyStart = end + 1
      frontmatter = parseFrontmatter(file, lines.slice(1, end).join("\n"))
    }
  }
  const body = lines.map((line, i) => (i < bodyStart ? "" : line)).join("\n")
  const mdast = unified().use(remarkParse).parse(body)
  const name = rel.slice(0, -".md".length)
  return { file, rel, name, kind, source, frontmatter, masked: maskCode(body, mdast), mdast }
}

// 프론트매터 필드. 프론트매터가 없거나 깨졌거나 매핑이 아니면 빈 객체를 준다.
export function fieldsOf(page: Page): Record<string, unknown> {
  if ("error" in page.frontmatter) return {}
  const data = page.frontmatter.data
  return typeof data === "object" && data !== null && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {}
}

// 페이지가 주제 태그나 구역 태그에 드는가. 구역 태그는 그 하위 태그를 단 페이지도 담는다.
// 태그를 주지 않으면 모든 페이지가 든다.
export function inTopic(page: Page, topic: string | undefined): boolean {
  const tags = fieldsOf(page)["tags"]
  return (
    topic === undefined ||
    (Array.isArray(tags) &&
      tags.some((tag) => tag === topic || String(tag).startsWith(`${topic}/`)))
  )
}

// 프론트매터 YAML의 1행은 파일의 2행이다.
function parseFrontmatter(file: string, yamlText: string): Page["frontmatter"] {
  const lineCounter = new LineCounter()
  const doc: Document = parseDocument(yamlText, { lineCounter, prettyErrors: false })
  const lineAt = (offset: number) => lineCounter.linePos(offset).line + 1
  if (doc.errors.length > 0) {
    const error = doc.errors[0]
    return { error: { file, line: lineAt(error.pos[0]), message: `YAML 오류: ${error.message}` } }
  }
  return {
    data: doc.toJS(),
    lineOf(field?: string, index?: number) {
      if (field === undefined || !isMap(doc.contents)) return 1
      const pair = doc.contents.items.find((item) => (item.key as Node | null)?.toJSON() === field)
      if (!pair) return 1
      const value = pair.value as Node | null
      if (index !== undefined && isSeq(value) && value.items[index]) {
        return lineAt((value.items[index] as Node).range![0])
      }
      return lineAt((pair.key as Node).range![0])
    },
  }
}

function maskCode(body: string, mdast: Root): string {
  let masked = body
  visit(mdast, (node) => {
    const isComment = node.type === "html" && node.value.startsWith("<!--")
    if (node.type !== "code" && node.type !== "inlineCode" && !isComment) return
    const start = node.position!.start.offset!
    const end = node.position!.end.offset!
    masked =
      masked.slice(0, start) + masked.slice(start, end).replace(/[^\n]/g, " ") + masked.slice(end)
  })
  return masked
}

function loadBib(file: string, text: string): BibFile {
  const stem = path.basename(file, ".bib")
  try {
    return { file, stem, entries: parseBibtex(text) }
  } catch (error) {
    if (!(error instanceof BibSyntaxError)) throw error
    return { file, stem, entries: { error: { file, line: error.line, message: error.message } } }
  }
}
