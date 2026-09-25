import { slugifyFilePath } from "@quartz-community/utils"
import { visit } from "unist-util-visit"
import type { Conventions } from "./conventions"
import { fieldsOf, type Page, type Tree, type Violation } from "./tree"

export type SourceCheck = (tree: Tree, conventions: Conventions) => Violation[]

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const citationKey = /^[a-z0-9]+-[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}$/

// 규약 문서의 "형식" 열 값마다 검사 방법이 하나씩 있다. 틀리면 이유를, 맞으면 null을 준다.
function checkFormat(format: string, value: unknown, statuses: string[]): string | null {
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
      return statuses.includes(value as string)
        ? null
        : `상태 표의 값(${statuses.join(", ")})이어야 한다`
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
      const reason = checkFormat("문자열", fields.title, statuses)
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
      const reason = checkFormat(row["형식"], fields[field], statuses)
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
    const segments = page.name.split("/")
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
    const aliases = fieldsOf(page).aliases
    if ("error" in page.frontmatter || !Array.isArray(aliases)) continue
    const { lineOf } = page.frontmatter
    aliases.forEach((alias, index) => {
      if (typeof alias !== "string") return
      const slug = slugifyFilePath(`${alias}.md` as never)
      const slugOwner = slugOwners.get(slug)
      const aliasOwner = aliasOwners.get(slug)
      const at = (message: string) =>
        violations.push({ file: page.file, line: lineOf("aliases", index), message })
      // 슬러그 변환이 소문자로 바꾸므로 대소문자만 다른 alias도 자기 슬러그가 된다.
      if (slugOwner === page)
        at(`alias "${alias}"가 자기 슬러그와 겹쳐 리다이렉트가 페이지를 덮어쓴다`)
      else if (slugOwner) at(`alias "${alias}"가 ${slugOwner.file}의 슬러그와 겹친다`)
      else if (aliasOwner && aliasOwner !== page)
        at(`alias "${alias}"가 ${aliasOwner.file}의 alias와 겹친다`)
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
  // 대문과 태그 표시 이름 파일도 링크 대상이므로 title을 모은다.
  const titles = new Map(tree.pages.map((p) => [p.name, fieldsOf(p).title]))
  const slugs = new Set(tree.pages.filter((p) => p.kind !== "tag").map((p) => p.name))
  const violations: Violation[] = []
  for (const page of tree.pages) {
    for (const { match, line } of matchLines(page, /(!?)\[\[([^[\]\n]+?)\]\]/g)) {
      const [link, embed, inner] = match
      const [path, display] = inner.split(/\\?\|/)
      const [target, anchor] = path.split("#").map((part) => part.trim())
      const at = (message: string) => violations.push({ file: page.file, line, message })
      if (target === "") continue
      // 대상이 없거나 잘못되면 거기서 멈춘다. 태그 목록은 대상을 확인한 뒤 표시 이름도 본다.
      if (target.startsWith("tags/")) {
        if (!tree.tags.has(target.slice("tags/".length)))
          at(`표시 이름 파일이 없는 태그 목록: ${link}`)
      } else if (embed && /\.\w+$/.test(target) && !target.endsWith(".md")) {
        if (!tree.files.has(target)) at(`대상 파일이 없다: ${link}`)
        continue
      } else if (!kebab.test(target)) {
        at(`위키링크 대상은 슬러그로만 쓴다: ${link}`)
        continue
      } else if (!slugs.has(target)) {
        at(`대상 페이지가 없다: ${link}`)
        continue
      }
      // 표시 이름이 없으면 Quartz는 대상(앵커가 있으면 "대상 > 앵커")을 그대로 링크 글자로 쓴다.
      const title = titles.get(target)
      const shown = anchor ? `${target} > ${anchor}` : target
      if (!embed && !display?.trim() && typeof title === "string" && title !== shown) {
        at(`링크 글자가 title과 다른 "${shown}"로 나오니 표시 이름을 쓴다: ${link}`)
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
        const reason = checkFormat(row["형식"], field.value, [])
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

// 도해 SVG 한 벌이 두 테마에서 읽히도록, 색은 규약 문서의 도해 팔레트 값만 쓴다.
const colorProperty = "fill|stroke|stop-color|flood-color|lighting-color|color"
const colorAttribute = new RegExp(`\\s(${colorProperty})\\s*=\\s*(["'])(.*?)\\2`, "gi")
const colorDeclaration = new RegExp(`(?:^|[\\s;{])(${colorProperty})\\s*:\\s*([^;}]+)`, "gi")
// CSS 선언은 style 속성과 <style> 요소 안에만 있다. 글자 노드의 "fill: ..."는 보지 않는다.
const styleSources = [/\sstyle\s*=\s*(["'])(.*?)\1/gs, /<style[^>]*>([\s\S]*?)<\/style>/gi]
const colorKeywords = /^(none|transparent|inherit|url\(#[^)]+\))$/i

function normalizeHex(value: string): string | null {
  const hex = value.toLowerCase().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)?.[1]
  if (!hex) return null
  return `#${hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex}`
}

export const svg: SourceCheck = (tree, conventions) => {
  const palette = new Set(
    conventions.column("diagram-palette", "값").map((value) => {
      const hex = normalizeHex(value)
      if (!hex) throw new Error(`규약 문서의 도해 팔레트 값이 hex가 아니다: ${value}`)
      return hex
    }),
  )
  const violations: Violation[] = []
  for (const { file, source } of tree.svgs) {
    const lineAt = (offset: number) => source.slice(0, offset).split("\n").length
    // 주석 안의 색은 그려지지 않으므로, 길이를 지켜 지운 뒤 찾는다.
    const text = source.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, " "))
    // 찾은 색마다 값과 속성 이름이 시작하는 위치
    const found = [...text.matchAll(colorAttribute)].map((m) => ({
      value: m[3],
      offset: m.index + m[0].indexOf(m[1]),
    }))
    for (const pattern of styleSources) {
      for (const style of text.matchAll(pattern)) {
        const css = style[style.length - 1]
        const cssOffset = style.index + style[0].indexOf(css)
        for (const m of css.matchAll(colorDeclaration)) {
          found.push({ value: m[2], offset: cssOffset + m.index + m[0].indexOf(m[1]) })
        }
      }
    }
    for (const { value, offset } of found) {
      const color = value.replace(/!important/i, "").trim()
      if (colorKeywords.test(color) || palette.has(normalizeHex(color) ?? "")) continue
      violations.push({ file, line: lineAt(offset), message: `도해 팔레트 밖의 색: ${color}` })
    }
    // fill을 적지 않은 도형과 글자는 검정으로 그려져 다크 테마에서 보이지 않는다. 루트가 fill을
    // 정하면 모든 요소가 루트까지 거슬러 올라가 팔레트 색이나 none을 물려받는다.
    const root = text.match(/<(?:[\w-]+:)?svg[\s>][^>]*>/i)
    if (root && !/\sfill\s*=|\sstyle\s*=\s*(["'])[^"']*\bfill\s*:/i.test(root[0])) {
      violations.push({ file, line: lineAt(root.index!), message: "루트 <svg>에 fill이 없다" })
    }
    // 접두사(<svg:image>)가 붙어도, 필터 요소(<feImage>)로 넣어도 같다.
    for (const match of text.matchAll(/<(?:[\w-]+:)?(?:image|feImage)[\s/>]/gi)) {
      violations.push({
        file,
        line: lineAt(match.index),
        message: "<image>나 <feImage>로 래스터나 외부 파일을 넣지 않는다",
      })
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
  ["svg", svg],
]
