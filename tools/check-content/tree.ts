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

export interface Tree {
  root: string
  pages: Page[]
  tags: Set<string>
  bib: BibFile[]
}

export function loadTree(root: string): Tree {
  const contentDir = path.join(root, "content")
  const pages = walk(contentDir)
    .filter((rel) => rel.endsWith(".md"))
    .map((rel) => loadPage(root, rel))
  const tags = new Set(
    pages.filter((page) => page.kind === "tag").map((page) => page.rel.slice(5, -3)),
  )
  const bibDir = path.join(root, "bib")
  const bib = walk(bibDir)
    .filter((rel) => rel.endsWith(".bib"))
    .map((rel) => loadBib(`bib/${rel}`, fs.readFileSync(path.join(bibDir, rel), "utf8")))
  return { root, pages, tags, bib }
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
  const file = `content/${rel}`
  const source = fs.readFileSync(path.join(root, file), "utf8")
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
  return { file, rel, kind, source, frontmatter, masked: maskCode(body, mdast), mdast }
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
