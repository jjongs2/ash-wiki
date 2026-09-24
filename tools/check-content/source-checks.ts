import { slugifyFilePath } from "@quartz-community/utils"
import { visit } from "unist-util-visit"
import type { Conventions } from "./conventions"
import type { Page, Tree, Violation } from "./tree"

export type SourceCheck = (tree: Tree, conventions: Conventions) => Violation[]

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const citationKey = /^[a-z0-9]+-[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}$/

// 규약 문서의 "형식" 열 값마다 검사 방법이 하나씩 있다. 틀리면 이유를, 맞으면 null을 준다.
function checkFormat(
  format: string,
  value: unknown,
  context: { tags: Set<string>; statuses: string[] },
): string | null {
  const isText = (v: unknown) => typeof v === "string" && v.trim() !== ""
  switch (format) {
    case "문자열":
      return isText(value) ? null : "비어 있지 않은 문자열이어야 한다"
    case "문자열 목록":
    case "태그 목록":
      return Array.isArray(value) && value.length > 0 && value.every(isText)
        ? null
        : "비어 있지 않은 문자열의 목록이어야 한다"
    case "날짜":
      return typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(value))
        ? null
        : "YYYY-MM-DD 꼴의 날짜여야 한다"
    case "연도":
      return Number.isInteger(value) && String(value).length === 4
        ? null
        : "네 자리 정수(연도)여야 한다"
    case "상태":
      return context.statuses.includes(value as string)
        ? null
        : `상태 표의 값(${context.statuses.join(", ")})이어야 한다`
    case "URL":
      return typeof value === "string" && /^https?:\/\/\S+$/.test(value)
        ? null
        : "http:// 또는 https://로 시작하는 URL이어야 한다"
    default:
      throw new Error(`규약 문서의 형식 "${format}"을 검사기가 모른다`)
  }
}

export const frontmatter: SourceCheck = (tree, conventions) => {
  const schema = conventions.table("frontmatter", ["필드", "개념", "표준", "형식"])
  const statuses = conventions.column("status", "값")
  const standardOnly = schema.filter((row) => row["개념"] === "—").map((row) => row["필드"])
  const violations: Violation[] = []
  for (const page of tree.pages) {
    if ("error" in page.frontmatter) {
      violations.push(page.frontmatter.error)
      continue
    }
    const { data, lineOf } = page.frontmatter
    const at = (message: string, field?: string, index?: number) =>
      violations.push({ file: page.file, line: lineOf(field, index), message })
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      at("프론트매터는 필드의 매핑이어야 한다")
      continue
    }
    const fields = data as Record<string, unknown>
    if (page.kind !== "page") {
      for (const field of Object.keys(fields)) {
        if (field !== "title") at(`대문과 태그 표시 이름 파일에는 title만 둔다: ${field}`, field)
      }
      const reason = checkFormat("문자열", fields.title, { tags: tree.tags, statuses })
      if (reason) at(`title: ${reason}`, "title")
      continue
    }
    const pageType = Object.keys(fields).some((field) => standardOnly.includes(field))
      ? "표준"
      : "개념"
    for (const field of Object.keys(fields)) {
      if (!schema.some((row) => row["필드"] === field)) at(`스키마 밖의 필드: ${field}`, field)
    }
    for (const row of schema) {
      const field = row["필드"]
      if (!(field in fields)) {
        if (row[pageType] === "필수") at(`필수 필드가 없다: ${field}`)
        continue
      }
      const reason = checkFormat(row["형식"], fields[field], { tags: tree.tags, statuses })
      if (reason) {
        at(`${field}: ${reason}`, field)
        continue
      }
      if (row["형식"] === "태그 목록") {
        ;(fields[field] as string[]).forEach((tag, index) => {
          if (!tree.tags.has(tag)) at(`표시 이름 파일이 없는 태그: ${tag}`, field, index)
        })
      }
    }
  }
  return violations
}

export const namespace: SourceCheck = (tree) => {
  const violations: Violation[] = []
  const slugOwners = new Map<string, Page>()
  for (const page of tree.pages) {
    slugOwners.set(slugifyFilePath(page.rel as never), page)
    const segments = page.rel.slice(0, -3).split("/")
    if (page.kind === "page" && segments.length > 1) {
      violations.push({
        file: page.file,
        line: 1,
        message: "페이지는 폴더 없이 content/ 바로 아래에 둔다",
      })
    } else if (!segments.every((segment) => kebab.test(segment))) {
      violations.push({
        file: page.file,
        line: 1,
        message: "파일 이름이 영문 소문자 kebab-case가 아니다",
      })
    }
  }
  const aliasOwners = new Map<string, Page>()
  for (const page of tree.pages) {
    if ("error" in page.frontmatter) continue
    const aliases = (page.frontmatter.data as Record<string, unknown> | null)?.aliases
    if (!Array.isArray(aliases)) continue
    const { lineOf } = page.frontmatter
    aliases.forEach((alias, index) => {
      if (typeof alias !== "string") return
      const slug = slugifyFilePath(`${alias}.md` as never)
      const slugOwner = slugOwners.get(slug)
      const aliasOwner = aliasOwners.get(slug)
      const line = lineOf("aliases", index)
      if (slugOwner && slugOwner !== page) {
        violations.push({
          file: page.file,
          line,
          message: `alias "${alias}"가 ${slugOwner.file}의 슬러그와 겹친다`,
        })
      } else if (aliasOwner && aliasOwner !== page) {
        violations.push({
          file: page.file,
          line,
          message: `alias "${alias}"가 ${aliasOwner.file}의 alias와 겹친다`,
        })
      }
      aliasOwners.set(slug, page)
    })
  }
  return violations
}

function* matchLines(page: Page, pattern: RegExp) {
  const lines = page.masked.split("\n")
  for (let i = 0; i < lines.length; i++) {
    for (const match of lines[i].matchAll(pattern)) yield { match, line: i + 1 }
  }
}

export const wikilink: SourceCheck = (tree) => {
  const slugs = new Set(tree.pages.filter((p) => p.kind !== "tag").map((p) => p.rel.slice(0, -3)))
  const files = new Set(tree.pages.map((p) => p.rel))
  const violations: Violation[] = []
  for (const page of tree.pages) {
    for (const { match, line } of matchLines(page, /(!?)\[\[([^[\]\n]+?)\]\]/g)) {
      const [link, embed, inner] = match
      const target = inner.split(/\\?\|/)[0].split("#")[0].trim()
      const at = (message: string) => violations.push({ file: page.file, line, message })
      if (target === "") continue
      if (target.startsWith("tags/")) {
        if (!tree.tags.has(target.slice(5))) at(`표시 이름 파일이 없는 태그 목록: ${link}`)
      } else if (embed && /\.\w+$/.test(target) && !target.endsWith(".md")) {
        if (!files.has(target)) at(`대상 파일이 없다: ${link}`)
      } else if (!kebab.test(target)) {
        at(`위키링크 대상은 슬러그로만 쓴다: ${link}`)
      } else if (!slugs.has(target)) {
        at(`대상 페이지가 없다: ${link}`)
      }
    }
  }
  return violations
}

export interface Citation {
  raw: string
  key: string | null // 대괄호 하나에 키 하나가 아니면 null
  line: number
}

export function citations(page: Page): Citation[] {
  const found: Citation[] = []
  for (const { match, line } of matchLines(page, /\[([^[\]\n]*)\]/g)) {
    if (!/(^|[\s;])-?@\w/.test(match[1])) continue
    found.push({ raw: match[0], key: match[1].match(/^@([^\s;,@]+)$/)?.[1] ?? null, line })
  }
  return found
}

export function bibKeys(tree: Tree): Set<string> {
  return new Set(
    tree.bib.flatMap((bib) => ("error" in bib.entries ? [] : bib.entries.map((e) => e.key))),
  )
}

export const citation: SourceCheck = (tree, conventions) => {
  const required = conventions.table("bib-fields", ["필드", "형식"])
  const violations: Violation[] = []
  for (const bib of tree.bib) {
    if ("error" in bib.entries) {
      violations.push(bib.entries.error)
      continue
    }
    if (bib.entries.length !== 1) {
      violations.push({
        file: bib.file,
        line: 1,
        message: `엔트리가 하나여야 한다(${bib.entries.length}개)`,
      })
    }
    for (const entry of bib.entries) {
      const at = (message: string, line = entry.line) =>
        violations.push({ file: bib.file, line, message })
      if (entry.key !== bib.stem) at(`엔트리 키 ${entry.key}가 파일 이름과 다르다`)
      if (!citationKey.test(entry.key))
        at(`키가 <발행기관>-<식별자>-<연도> 꼴이 아니다: ${entry.key}`)
      for (const row of required) {
        const field = entry.fields.get(row["필드"])
        if (!field) {
          at(`필수 필드가 없다: ${row["필드"]}`)
          continue
        }
        const reason = checkFormat(row["형식"], field.value, { tags: tree.tags, statuses: [] })
        if (reason) at(`${row["필드"]}: ${reason}`, field.line)
      }
    }
  }
  const keys = bibKeys(tree)
  for (const page of tree.pages) {
    for (const { raw, key, line } of citations(page)) {
      const at = (message: string) => violations.push({ file: page.file, line, message })
      if (key === null) {
        at(`대괄호 하나에 키 하나만 쓴다: ${raw}`)
        continue
      }
      if (!citationKey.test(key)) at(`키가 <발행기관>-<식별자>-<연도> 꼴이 아니다: ${key}`)
      if (!keys.has(key)) at(`bib/에 엔트리가 없는 키: ${key}`)
    }
  }
  return violations
}

export const callout: SourceCheck = (tree, conventions) => {
  const types = conventions.column("callout", "타입")
  const violations: Violation[] = []
  for (const page of tree.pages) {
    for (const { match, line } of matchLines(page, /^\s*(?:>\s*)+\[!([^\]]+)\]/g)) {
      const type = match[1].trim().toLowerCase()
      if (!types.includes(type)) {
        violations.push({
          file: page.file,
          line,
          message: `콜아웃 타입은 ${types.join(", ")}만 쓴다: ${type}`,
        })
      }
    }
  }
  return violations
}

// 닫는 **가 강조로 풀리지 않으면 remark가 글자 그대로 남긴다. 렌더 결과로 판정하므로 오탐이 적다.
export const emphasis: SourceCheck = (tree) => {
  const violations: Violation[] = []
  for (const page of tree.pages) {
    const lines = new Set<number>()
    visit(page.mdast, "text", (node) => {
      let index = node.value.indexOf("**")
      while (index >= 0) {
        lines.add(node.position!.start.line + node.value.slice(0, index).split("\n").length - 1)
        index = node.value.indexOf("**", index + 2)
      }
    })
    for (const line of lines) {
      violations.push({ file: page.file, line, message: "강조가 렌더되지 않고 **가 그대로 남는다" })
    }
  }
  return violations
}

export const sourceChecks: [string, SourceCheck][] = [
  ["frontmatter", frontmatter],
  ["namespace", namespace],
  ["wikilink", wikilink],
  ["citation", citation],
  ["callout", callout],
  ["emphasis", emphasis],
]
