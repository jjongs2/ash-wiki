import { getAllSegmentPrefixes, slugifyFilePath } from "@quartz-community/utils"
import GithubSlugger, { slug as anchorSlug } from "github-slugger"
import type { Heading } from "mdast"
import type { Position } from "unist"
import { visit } from "unist-util-visit"
import { rootLabel } from "../../plugins/diagram-name/index"
import { diagramFontStylesheet } from "../../quartz/util/localFonts"
import { getFontSpecificationNames } from "../../quartz/util/theme"
import { latestPartYears, standardNumber } from "../edition-status/standard-number"
import { readTheme } from "../og-fonts"
import { loadDiagramConventions, type Conventions } from "./conventions"
import {
  marginTolerance,
  measureMargins,
  overflowed,
  paintedBounds,
  SvgRenderError,
  type Bounds,
  type ViewBox,
  withRootViewBox,
  withViewBox,
} from "./diagram-margin"
import { fieldsOf, type Page, type Tree, type Violation } from "./tree"

export type SourceCheck = (
  tree: Tree,
  conventions: Conventions,
) => Violation[] | Promise<Violation[]>

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

export const standardOnlyFields = (conventions: Conventions) =>
  conventions
    .table("frontmatter", ["필드", "개념"])
    .filter((row) => row["개념"] === "—")
    .map((row) => row["필드"])

// 표준 페이지에만 있는 필드가 하나라도 있으면 표준 페이지다. 판 확인(tools/edition-status)도 이것으로 가린다.
export const pageTypeOf = (fields: Record<string, unknown>, standardOnly: string[]) =>
  Object.keys(fields).some((field) => standardOnly.includes(field)) ? "표준" : "개념"

// 부마다 판이 다른 시리즈(docs/wiki-conventions.md의 프론트매터 표 아래 edition 줄)면 부마다 가장 새 판을,
// 아니면 null을 준다. 예: ISO/IEC/IEEE 29119 → 29119-1:2022, 29119-2:2021, …
function splitEditions(page: Page, title: unknown, titles: Map<string, string>): string[] | null {
  const series = typeof title === "string" ? standardNumber(title) : undefined
  if (!series) return null
  const cited = citations(page).flatMap(({ key }) => (key && titles.get(key)) || [])
  const latest = latestPartYears(series, cited)
  if (new Set(latest.values()).size < 2) return null
  return [...latest].map(([part, year]) => `${part}:${year}`)
}

export const frontmatter: SourceCheck = (tree, conventions) => {
  const schema = conventions.table("frontmatter", ["필드", "개념", "표준", "형식"])
  const statuses = conventions.column("status", "값")
  const standardOnly = standardOnlyFields(conventions)
  const titles = new Map(
    tree.bib.flatMap((bib) =>
      "error" in bib.entries
        ? []
        : bib.entries.map((entry) => [entry.key, entry.fields.get("title")?.value ?? ""] as const),
    ),
  )
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
    const pageType = pageTypeOf(fields, standardOnly)
    for (const field of Object.keys(fields)) {
      if (!schema.some((row) => row["필드"] === field)) at(`스키마 밖의 필드: ${field}`, field)
    }
    for (const row of schema) {
      const field = row["필드"]
      let required = row[pageType] === "필수"
      if (row[pageType] === "조건부") {
        if (field !== "edition")
          throw new Error(`규약 문서의 조건부 필드 "${field}"를 검사기가 모른다`)
        const split = splitEditions(page, fields.title, titles)
        required = split === null
        if (split && field in fields)
          at(
            `부마다 판이 다른 시리즈 표준 페이지에는 edition을 두지 않는다: ${split.join(", ")}`,
            field,
          )
      }
      if (!(field in fields)) {
        if (required) at(`필수 필드가 없다: ${field}`)
        continue
      }
      const reason = checkFormat(row["형식"], fields[field], statuses)
      if (reason) {
        at(`${field}: ${reason}`, field)
        continue
      }
      if (row["형식"] === "태그 목록") {
        // 태그 칩은 다른 구역의 주제 앞에 구역 이름을 붙이므로, 계층 태그는 상위 태그까지 표시 이름이 있어야 한다.
        ;(fields[field] as string[]).forEach((tag, index) => {
          for (const prefix of getAllSegmentPrefixes(tag)) {
            if (!tree.tags.has(prefix)) at(`표시 이름 파일이 없는 태그: ${prefix}`, field, index)
          }
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

const calloutMarker = /^\s*(?:>\s*)+\[!([^\]]+)\]/

const blockNames: Record<string, string> = {
  blockquote: "인용 블록",
  list: "목록",
  code: "코드 블록",
  html: "HTML",
  thematicBreak: "구분선",
}

// 머리말은 첫 제목 앞의 블록이다. HTML 주석을 건너뛴 첫 블록이 문단이어야 한다.
export const lead: SourceCheck = (tree) => {
  const violations: Violation[] = []
  for (const page of tree.pages) {
    if (page.kind !== "page") continue
    const blocks = page.mdast.children
    const heading = blocks.find((node) => node.type === "heading")
    const first = blocks
      .slice(0, heading ? blocks.indexOf(heading) : undefined)
      .find((node) => !(node.type === "html" && node.value.trimStart().startsWith("<!--")))
    if (first?.type === "paragraph") continue
    const message = "첫 ## 앞에 머리말 문단이 없다"
    if (!first) {
      violations.push({ file: page.file, line: heading?.position!.start.line ?? 1, message })
      continue
    }
    const line = first.position!.start.line
    const isCallout =
      first.type === "blockquote" && calloutMarker.test(page.masked.split("\n")[line - 1])
    const name = isCallout ? "콜아웃" : (blockNames[first.type] ?? first.type)
    violations.push({ file: page.file, line, message: `${message}(첫 블록: ${name})` })
  }
  return violations
}

// 제목의 글자. text와 inlineCode만 모은다.
function headingText(heading: Heading): string {
  let text = ""
  visit(heading, (node) => {
    if (node.type === "text" || node.type === "inlineCode") text += node.value
  })
  return text
}

// 표준 페이지의 첫 두 ##(docs/wiki-conventions.md 절). 제목은 앞머리로 맞춰 `개정 이력(2024)`도 받는다.
const standardSections = ["범위", "개정 이력"]

export const section: SourceCheck = (tree, conventions) => {
  const standardOnly = standardOnlyFields(conventions)
  const violations: Violation[] = []
  for (const page of tree.pages) {
    if (page.kind !== "page" || "error" in page.frontmatter) continue
    if (pageTypeOf(fieldsOf(page), standardOnly) !== "표준") continue
    const titles = page.mdast.children
      .filter((node): node is Heading => node.type === "heading" && node.depth === 2)
      .slice(0, standardSections.length)
    const mismatch = standardSections.findIndex(
      (name, index) => !titles[index] || !headingText(titles[index]).trim().startsWith(name),
    )
    if (mismatch < 0) continue
    const misplaced = titles[mismatch] ?? titles.at(-1)
    const written = titles.map((heading) => headingText(heading).trim()).join(", ") || "없음"
    violations.push({
      file: page.file,
      line: misplaced?.position!.start.line ?? 1,
      message: `표준 페이지의 첫 두 ##는 ${standardSections.join(", ")} 순서로 쓴다(지금: ${written})`,
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

// Quartz가 제목에 다는 id다. rehype-slug가 제목의 글자를 github-slugger로 바꾸고, 같은 값이 또
// 나오면 -1, -2를 붙인다. 위키링크의 앵커는 obsidian-flavored-markdown이 같은 slug로 #조각을 만든다.
// 제목의 글자는 text와 inlineCode만 모은다. 제목 안의 수식과 위키링크는 렌더된 글자가 원문과 달라
// id가 어긋나지만, 지금 그런 제목은 없다.
function sectionIds(page: Page): Set<string> {
  const slugger = new GithubSlugger()
  const ids = new Set<string>()
  visit(page.mdast, "heading", (heading) => {
    ids.add(slugger.slug(headingText(heading)))
  })
  return ids
}

const quoteMarker = /^\s*(?:>\s*)*/
const delimiterRow = /^\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/
const unescapedPipe = /(?<!\\)\|/

// GFM 표의 줄 번호. 머리 행 바로 다음에 구분 행(`--- | ---`)이 오면 표가 시작하고 빈 줄에서 끝난다.
// 행 앞뒤의 |는 없어도 되고, 콜아웃 안의 표는 줄 앞에 >가 붙는다.
export function tableLines(page: Page): Set<number> {
  const lines = page.masked.split("\n").map((line) => line.replace(quoteMarker, ""))
  const rows = new Set<number>()
  lines.forEach((line, index) => {
    if (!line.includes("|") || !delimiterRow.test(line) || !lines[index - 1]?.trim()) return
    for (let i = index - 1; i < lines.length && lines[i].trim() !== ""; i++) rows.add(i + 1)
  })
  return rows
}

// 한 자리로 보는 블록: 문단, 제목, 표의 행 하나. 목록과 콜아웃은 그 안의 문단마다 따로 센다. 검사기의
// mdast는 GFM 표를 읽지 않아 표 전체를 문단 하나로 잡으므로, 표의 줄은 줄마다 블록으로 센다. 받은 자리
// (줄과 0부터 센 열)가 든 블록을 가리키는 값을 주고, 블록 밖이면 null을 준다.
function blockLocator(
  page: Page,
  rows = tableLines(page),
): (line: number, column: number) => string | null {
  const blocks: Position[] = []
  visit(page.mdast, (node) => {
    if (node.type === "paragraph" || node.type === "heading") blocks.push(node.position!)
  })
  return (line, column) => {
    if (rows.has(line)) return `row ${line}`
    const index = blocks.findIndex(
      ({ start, end }) =>
        (line > start.line || (line === start.line && column >= start.column - 1)) &&
        (line < end.line || (line === end.line && column < end.column - 1)),
    )
    return index < 0 ? null : `block ${index}`
  }
}

interface ShownLink {
  link: string
  target: string
  anchor?: string
  text: string // 링크 글자
  line: number
  block: string | null
}

// 같은 블록에 같은 페이지로 가는 링크가 또 있으면, 절 링크의 링크 글자가 그 페이지의 title이나 다른
// 링크의 링크 글자와 같을 때 독자에게는 같은 링크가 두 번 걸린 것으로 보인다.
function confusableSectionLinks(links: ShownLink[], titles: Map<string, unknown>): ShownLink[] {
  return links.filter(
    (link) =>
      link.block !== null &&
      link.anchor &&
      !link.anchor.startsWith("^") &&
      links.some(
        (other) =>
          other !== link &&
          other.block === link.block &&
          other.target === link.target &&
          (other.text === link.text || titles.get(link.target) === link.text),
      ),
  )
}

export const wikilink: SourceCheck = (tree) => {
  // 대문과 태그 표시 이름 파일도 링크 대상이므로 title을 모은다.
  const titles = new Map(tree.pages.map((p) => [p.name, fieldsOf(p).title]))
  const sections = new Map(tree.pages.map((p) => [p.name, sectionIds(p)]))
  const slugs = new Set(tree.pages.filter((p) => p.kind !== "tag").map((p) => p.name))
  const violations: Violation[] = []
  for (const page of tree.pages) {
    const rows = tableLines(page)
    const blockOf = blockLocator(page, rows)
    const shownLinks: ShownLink[] = []
    for (const { match, line } of matchLines(page, /(!?)\[\[([^[\]\n]+?)\]\]/g)) {
      const [link, embed, inner] = match
      const [path, display] = inner.split(/\\?\|/)
      const [target, anchor] = path.split("#").map((part) => part.trim())
      const at = (message: string) => violations.push({ file: page.file, line, message })
      // 표 셀 안의 |는 prettier가 셀 경계로 보고 [[a | b]]로 갈라 열을 하나 더 만든다.
      if (rows.has(line) && unescapedPipe.test(inner)) {
        at(`표 셀 안의 위키링크는 |를 \\|로 쓴다: ${link} → ${link.replace(unescapedPipe, "\\|")}`)
      }
      // ^로 시작하는 앵커는 절이 아니라 블록을 가리킨다.
      const checkSection = (name: string) => {
        if (anchor && !anchor.startsWith("^") && !sections.get(name)!.has(anchorSlug(anchor)))
          at(`앵커가 가리키는 절이 없다: ${link}`)
      }
      if (target === "") {
        checkSection(page.name)
        continue
      }
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
      } else {
        checkSection(target)
      }
      // 표시 이름이 없으면 Quartz는 대상(앵커가 있으면 "대상 > 앵커")을 그대로 링크 글자로 쓴다.
      const title = titles.get(target)
      const shown = anchor ? `${target} > ${anchor}` : target
      if (!embed && !display?.trim() && typeof title === "string" && title !== shown) {
        at(`링크 글자가 title과 다른 "${shown}"로 나오니 표시 이름을 쓴다: ${link}`)
      }
      if (!embed) {
        const text = display?.trim() || shown
        shownLinks.push({ link, target, anchor, text, line, block: blockOf(line, match.index) })
      }
    }
    for (const { link, line } of confusableSectionLinks(shownLinks, titles)) {
      const message = `같은 블록에 같은 페이지 링크가 있으니 절 링크의 링크 글자가 title이나 그 링크 글자와 달라야 한다: ${link}`
      violations.push({ file: page.file, line, message })
    }
  }
  return violations
}

export interface Citation {
  raw: string
  key: string | null // 대괄호 하나에 키 하나가 아니면 null
  line: number
  column: number // 줄 안에서 [가 있는 곳
}

export function citations(page: Page): Citation[] {
  const found: Citation[] = []
  for (const { match, line } of matchLines(page, /\[([^[\]\n]*)\]/g)) {
    if (!/(^|[\s;])-?@\w/.test(match[1])) continue
    const key = match[1].match(/^@([^\s;,@]+)$/)?.[1] ?? null
    found.push({ raw: match[0], key, line, column: match.index })
  }
  return found
}

export function bibKeys(tree: Tree): Set<string> {
  return new Set(
    tree.bib.flatMap((bib) => ("error" in bib.entries ? [] : bib.entries.map((e) => e.key))),
  )
}

// 같은 문서를 가리키는 url을 맞춘다. 스킴, `www.`, 끝 슬래시만 맞추고 조각(같은 페이지의 다른 절),
// 쿼리(ITU처럼 쿼리로 갈리는 문서), Wayback 접두(시점이 다른 문서)는 그대로 둔다.
export function normalizeUrl(url: string): string {
  const [, base, rest] = url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .match(/^([^?#]*)(.*)$/s)!
  return base.replace(/\/+$/, "") + rest
}

// 한 문서에 키가 둘이면 같은 인용끼리의 페이지 사이 중복이 가려진다.
function duplicateUrls(tree: Tree): Violation[] {
  const owners = new Map<string, { file: string; key: string; line: number }[]>()
  for (const bib of tree.bib) {
    if ("error" in bib.entries) continue
    for (const entry of bib.entries) {
      const url = entry.fields.get("url")
      if (!url) continue
      const normalized = normalizeUrl(url.value)
      owners.set(normalized, [
        ...(owners.get(normalized) ?? []),
        { file: bib.file, key: entry.key, line: url.line },
      ])
    }
  }
  return [...owners.values()]
    .filter((group) => group.length > 1)
    .flatMap((group) =>
      group.map(({ file, key, line }) => ({
        file,
        line,
        message: `정규화한 url이 같은 엔트리가 있다: ${group
          .filter((other) => other.key !== key)
          .map((other) => other.key)
          .join(", ")}`,
      })),
    )
}

export const citation: SourceCheck = (tree, conventions) => {
  const required = conventions.table("bib-fields", ["필드", "형식"])
  const typeFields = conventions.table("bib-type-fields", ["엔트리 타입", "필드"])
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
      for (const row of typeFields) {
        if (entry.type === row["엔트리 타입"] && !entry.fields.get(row["필드"])?.value) {
          at(`@${entry.type}에는 ${row["필드"]} 필드를 둔다`)
        }
      }
    }
  }
  violations.push(...duplicateUrls(tree))
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
    violations.push(...citationOrder(page))
    violations.push(...citationPlace(page))
  }
  return violations
}

// 원문에서 from의 [부터 to의 [ 앞까지의 글. 코드를 가린 본문에서는 인라인 코드가 공백으로 보이므로
// 사이의 글은 원문에서 읽는다.
function sourceSpan(sourceLines: string[], from: Citation, to: Citation): string {
  const text = sourceLines.slice(from.line - 1, to.line).join("\n")
  return text.slice(from.column, text.length - sourceLines[to.line - 1].length + to.column)
}

// 한 자리는 한 블록 안에서 공백, 줄바꿈, HTML 주석만 사이에 둔 인용들이다. HTML 주석은 렌더되지 않으므로
// 빼고 본다.
export function citationRuns<T extends Citation>(page: Page, found: T[]): T[][] {
  const locate = blockLocator(page)
  const blockOf = ({ line, column }: Citation) => locate(line, column)
  const sourceLines = page.source.split("\n")
  const runs: T[][] = []
  found.forEach((citation, index) => {
    const previous = found[index - 1]
    const gap = previous && sourceSpan(sourceLines, previous, citation).slice(previous.raw.length)
    const joined =
      previous &&
      blockOf(previous) !== null &&
      blockOf(previous) === blockOf(citation) &&
      gap.replace(/<!--[\s\S]*?-->|\n[ \t]*(?:>[ \t]*)*/g, "").trim() === ""
    if (joined) runs.at(-1)!.push(citation)
    else runs.push([citation])
  })
  return runs
}

// 한 자리를 원문에 쓰인 대로 한 줄로 준다.
function writtenRun(sourceLines: string[], run: Citation[]): string {
  const last = run.at(-1)!
  return (sourceSpan(sourceLines, run[0], last) + last.raw).replace(/\s*\n[\s>]*/g, " ")
}

// 인용 자리는 쉼표 앞, 마침표 뒤다. 한 자리의 인용은 한 덩어리로 옮긴다. 앞뒤 글자도 원문에서 읽는다.
function citationPlace(page: Page): Violation[] {
  const sourceLines = page.source.split("\n")
  const violations: Violation[] = []
  for (const run of citationRuns(page, citations(page))) {
    const first = run[0]
    const last = run.at(-1)!
    const written = writtenRun(sourceLines, run)
    const add = (message: string) => violations.push({ file: page.file, line: first.line, message })
    const comma = sourceLines[first.line - 1].slice(0, first.column).match(/,[ \t]*$/)
    if (comma) add(`인용은 쉼표 앞에 둔다: ${comma[0]}${written} → ${written},`)
    if (sourceLines[last.line - 1][last.column + last.raw.length] === ".") {
      add(`인용은 마침표 뒤에 둔다: ${written}. → .${written}`)
    }
  }
  return violations
}

// 인용 번호는 키가 페이지에서 처음 나온 순서로 매겨진다. 한 자리의 키가 그 순서를 따라야 [2][1]이 아니라
// [1][2]로 렌더된다. 키가 하나가 아닌 대괄호는 앞의 검사가 맡는다.
function citationOrder(page: Page): Violation[] {
  const found = citations(page).filter(
    (citation): citation is Citation & { key: string } => citation.key !== null,
  )
  const first = new Map<string, number>()
  found.forEach(({ key }, index) => {
    if (!first.has(key)) first.set(key, index)
  })
  const sourceLines = page.source.split("\n")
  const violations: Violation[] = []
  for (const run of citationRuns(page, found)) {
    const sorted = [...run].sort((a, b) => first.get(a.key)! - first.get(b.key)!)
    if (sorted.every((citation, index) => citation === run[index])) continue
    violations.push({
      file: page.file,
      line: run[0].line,
      message: `여러 인용은 페이지에서 처음 나온 순서로 쓴다: ${writtenRun(sourceLines, run)} → ${sorted.map((c) => c.raw).join("")}`,
    })
  }
  return violations
}

export const callout: SourceCheck = (tree, conventions) => {
  const types = conventions.column("callout", "타입")
  const violations: Violation[] = []
  for (const page of tree.pages) {
    for (const { match, line } of matchLines(page, new RegExp(calloutMarker, "g"))) {
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

// 한 줄에 열고 닫은 `$$…$$`는 오류 없이 인라인 식으로 렌더되므로, 산출물 검사로는 잡히지 않는다.
export const math: SourceCheck = (tree) => {
  const violations: Violation[] = []
  for (const page of tree.pages) {
    for (const { line } of matchLines(page, /\$\$[^\n]*?\$\$/g)) {
      violations.push({
        file: page.file,
        line,
        message: "디스플레이 식은 $$를 식 앞뒤 줄에 따로 둔다",
      })
    }
  }
  return violations
}

// 도해 SVG는 색을 도해 규약의 도해 팔레트 토큰으로 쓴다(`var(--<이름>, <대체값>)`). 사이트가 현재 테마의
// 값을 도해 문서에 넣고(plugins/diagram-theme), 스크립트가 돌지 않는 곳에서는 대체값으로 그려진다.
const colorProperty = "fill|stroke|stop-color|flood-color|lighting-color|color"
const colorKeywords = /^(none|transparent|inherit|url\(#[^)]+\))$/i
const colorToken = /^var\(\s*--([\w-]+)\s*(?:,\s*(.*?))?\s*\)$/i
// SVG 안의 변수 선언. 여백 검사의 librsvg는 선언을 무시하고 대체값으로 그려, 브라우저와 다르게 그린다.
const variableDeclaration = /(?:^|[\s;{])(--[\w-]+)\s*:/g
// CSS 선언은 style 속성과 <style> 요소 안에만 있다. 글자 노드의 "fill: ..."는 보지 않는다.
const styleSources = [/\sstyle\s*=\s*(["'])(.*?)\1/gs, /<style[^>]*>([\s\S]*?)<\/style>/gi]

// 도해의 글자는 사이트 본문과 같은 폰트(quartz.config.yaml의 theme.typography.body)로, 글리프 폭을 픽셀에
// 맞춰 반올림하지 않고 그린다. 브라우저와 검사기가 같은 폭으로 그려야 검사기가 잰 여백이 독자가 보는 여백과
// 맞는다. Linux의 Chromium은 geometricPrecision이 없으면 글리프 폭을 반올림해 여백이 한 변에서 4까지 달라진다.
const theme = readTheme()
const textProperties = {
  "font-family": [...getFontSpecificationNames(theme.typography.body), "sans-serif"].join(", "),
  "text-rendering": "geometricPrecision",
}
// SVG는 XML이라 주소의 &를 &amp;로 쓴다.
const fontImport = `@import url("${diagramFontStylesheet(theme).replaceAll("&", "&amp;")}");`

// 속성(`fill="..."`)과 CSS 선언(`fill: ...`)으로 준 값을 찾는다. offset은 속성 이름이 시작하는 곳이다.
function attributeValues(text: string, property: string) {
  const attribute = new RegExp(`\\s(${property})\\s*=\\s*(["'])(.*?)\\2`, "gi")
  return [...text.matchAll(attribute)].map((m) => ({
    value: m[3].trim(),
    offset: m.index + m[0].indexOf(m[1]),
  }))
}

// CSS는 style 속성과 <style> 요소 안에만 있다. offset은 CSS가 시작하는 곳이다.
function styleBlocks(text: string) {
  return styleSources.flatMap((pattern) =>
    [...text.matchAll(pattern)].map((style) => {
      const css = style[style.length - 1]
      return { css, offset: style.index + style[0].indexOf(css) }
    }),
  )
}

function declarationValues(text: string, property: string) {
  const declaration = new RegExp(`(?:^|[\\s;{])(${property})\\s*:\\s*([^;}]+)`, "gi")
  return styleBlocks(text).flatMap(({ css, offset }) =>
    [...css.matchAll(declaration)].map((m) => ({
      value: m[2].replace(/!important/i, "").trim(),
      offset: offset + m.index + m[0].indexOf(m[1]),
    })),
  )
}

function propertyValues(text: string, property: string) {
  return [...attributeValues(text, property), ...declarationValues(text, property)]
}

function normalizeHex(value: string): string | null {
  const hex = value.toLowerCase().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)?.[1]
  if (!hex) return null
  return `#${hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex}`
}

// 표의 대체값(hex나 none)과 견줄 수 있게 맞춘다.
function normalizeColor(value: string): string {
  return normalizeHex(value) ?? value.trim().toLowerCase()
}

// 색 값이 틀렸으면 그 이유를, 맞으면 null을 준다. fallbacks는 토큰 이름마다 표의 대체값이다.
function colorViolation(value: string, fallbacks: Map<string, string>): string | null {
  if (colorKeywords.test(value)) return null
  const token = value.match(colorToken)
  if (!token) return `색은 var(--<이름>, <대체값>)으로 쓴다: ${value}`
  const [, name, fallback] = token
  const expected = fallbacks.get(name)
  if (expected === undefined) return `도해 팔레트에 없는 토큰이다: --${name}`
  if (fallback === undefined || normalizeColor(fallback) !== expected) {
    return `대체값이 표와 다르다. var(--${name}, ${expected})로 쓴다: ${value}`
  }
  return null
}

// 모양 척도(docs/wiki-diagrams.md의 도해의 모양 절). 점선은 선 두께와 짝을 이룬다.
const strokeWidths = [1, 1.5, 3]
const cornerRadii = [0, 2]
const dashes: Record<string, { fits: (width: number) => boolean; rule: string }> = {
  "3 3": { fits: (width) => width === 1, rule: "보조 점선 3 3은 폭 1에만 쓴다" },
  "5 4": { fits: (width) => width >= 1.5, rule: "윤곽 점선 5 4는 폭 1.5 이상에만 쓴다" },
}
const fontSizeMin = 11
// baseline-shift나 dy로 옮긴 첨자 <tspan>의 하한
const subscriptSizeMin = 9

interface SvgElement {
  name: string // 접두사를 뗀 이름
  source: string // 여는 태그
  offset: number
  attributes: Map<string, string>
  parent?: SvgElement
}

// 여는 태그마다 속성과 부모를 준다. 주석을 지운 글을 받는다.
function svgElements(text: string): SvgElement[] {
  const elements: SvgElement[] = []
  const open: SvgElement[] = []
  const tags = /<(\/?)(?:[\w-]+:)?([\w-]+)((?:\s+[\w:-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g
  for (const tag of text.matchAll(tags)) {
    const [source, closing, name, attributes, selfClosing] = tag
    if (closing) {
      const index = open.map((element) => element.name).lastIndexOf(name)
      if (index >= 0) open.length = index
      continue
    }
    const element: SvgElement = {
      name,
      source,
      offset: tag.index,
      attributes: new Map(
        [...attributes.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map((a) => [a[1], a[3].trim()]),
      ),
      parent: open.at(-1),
    }
    elements.push(element)
    if (!selfClosing) open.push(element)
  }
  return elements
}

function inherited(element: SvgElement | undefined, attribute: string): string | undefined {
  for (let e = element; e; e = e.parent) {
    const value = e.attributes.get(attribute)
    if (value !== undefined) return value
  }
}

const lengthOf = (value: string) => Number(value.replace(/px$/i, ""))
const dashOf = (value: string) =>
  value
    .trim()
    .split(/[\s,]+/)
    .join(" ")

// 값 하나가 척도 밖이면 그 이유를, 아니면 null을 준다. 속성과 CSS 선언이 함께 쓴다.
const strokeWidthViolation = (value: string) =>
  strokeWidths.includes(lengthOf(value))
    ? null
    : `선 두께는 ${strokeWidths.join(", ")}만 쓴다: ${value}`
const dashViolation = (value: string) =>
  value === "none" || dashes[dashOf(value)] ? null : `점선은 3 3(보조)과 5 4(윤곽)만 쓴다: ${value}`
const fontSizeViolation = (value: string, subscript = false) => {
  const min = subscript ? subscriptSizeMin : fontSizeMin
  if (lengthOf(value) >= min) return null
  return subscript
    ? `첨자 <tspan>의 글자 크기는 ${min} 이상이다: ${value}`
    : `글자 크기는 ${min} 이상이다(옮긴 첨자 <tspan>만 ${subscriptSizeMin}): ${value}`
}

// 척도 밖의 선 두께, 모서리 반경, 점선, 글자 크기를 찾는다. offset은 속성 이름이 시작하는 곳이다.
function shapeViolations(text: string): { offset: number; message: string }[] {
  const found: { offset: number; message: string }[] = []
  for (const element of svgElements(text)) {
    const { attributes } = element
    const add = (attribute: string, message: string | null) => {
      if (!message) return
      const index = element.source.search(new RegExp(`\\s${attribute}\\s*=`))
      found.push({ offset: element.offset + index + 1, message })
    }
    const width = attributes.get("stroke-width")
    if (width !== undefined) add("stroke-width", strokeWidthViolation(width))
    if (element.name === "rect") {
      for (const radius of ["rx", "ry"]) {
        const value = attributes.get(radius)
        if (value !== undefined && !cornerRadii.includes(lengthOf(value))) {
          add(
            radius,
            `<rect>의 모서리 반경은 ${cornerRadii.join(", ")}만 쓴다: ${radius}="${value}"`,
          )
        }
      }
    }
    const dasharray = attributes.get("stroke-dasharray")
    if (dasharray !== undefined) {
      const dash = dashes[dashOf(dasharray)]
      const drawnWidth = lengthOf(inherited(element, "stroke-width") ?? "1")
      add("stroke-dasharray", dashViolation(dasharray))
      if (dash && !dash.fits(drawnWidth)) {
        add("stroke-dasharray", `${dash.rule}(이 선의 폭: ${drawnWidth})`)
      }
    }
    const size = attributes.get("font-size")
    if (size !== undefined) {
      const subscript =
        element.name === "tspan" && (attributes.has("baseline-shift") || attributes.has("dy"))
      add("font-size", fontSizeViolation(size, subscript))
    }
  }
  // CSS로 준 값은 요소를 가리지 않고 값만 본다. 점선과 폭의 짝, 첨자의 하한은 속성으로만 판정한다.
  const declared: [string, (value: string) => string | null][] = [
    ["stroke-width", strokeWidthViolation],
    ["stroke-dasharray", dashViolation],
    ["font-size", (value) => fontSizeViolation(value)],
  ]
  for (const [property, violation] of declared) {
    for (const { value, offset } of declarationValues(text, property)) {
      const message = violation(value)
      if (message) found.push({ offset, message })
    }
  }
  return found
}

// 루트 <svg>의 여는 태그.
export const svgRootTag = /<(?:[\w-]+:)?svg[\s>][^>]*>/i

export function viewBoxOf(rootTag: string): ViewBox | null {
  const viewBox = rootTag
    .match(/\sviewBox\s*=\s*(["'])(.*?)\1/i)?.[2]
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  if (viewBox?.length !== 4 || viewBox.some((n) => !Number.isFinite(n))) return null
  return viewBox as ViewBox
}

// 0.5 단위로 반올림한다.
const roundHalf = (n: number) => Math.round(n * 2) / 2

// 그림이 viewBox 밖으로 나갔거나, 여백이 치우쳤거나, 잴 수 없으면 그 이유를, 아니면 null을 준다.
// 밖으로 나간 그림에는 여백 치우침을 알리지 않는다. 그 메시지대로 원점을 옮겨도 그림이 viewBox에 다
// 들어가지 않는다.
async function marginViolation(
  source: string,
  root: { index: number; tag: string },
): Promise<string | null> {
  const viewBox = viewBoxOf(root.tag)
  if (!viewBox) return "루트 <svg>에 viewBox가 없어 여백을 재지 못한다"
  const [x, y, width, height] = viewBox
  let margins
  try {
    margins = await measureMargins(source, root, viewBox)
  } catch (error) {
    if (!(error instanceof SvgRenderError)) throw error
    return `SVG를 그리지 못해 여백을 재지 못했다: ${error.message}`
  }
  if (!margins) return null
  const { left, right, top, bottom } = margins
  const sides: [string, number][] = [
    ["좌", left],
    ["우", right],
    ["상", top],
    ["하", bottom],
  ]
  const outside = sides.filter(([, margin]) => overflowed(margin))
  if (outside.length > 0) {
    const amounts = outside.map(([side, margin]) => `${side} ${roundHalf(-margin)}`)
    return `그림이 viewBox 밖으로 나갔다(${amounts.join(", ")}). 그림을 viewBox 안에 둔다`
  }
  if (Math.abs(left - right) <= marginTolerance && Math.abs(top - bottom) <= marginTolerance) {
    return null
  }
  // 그림을 가운데로 옮기려면 원점을 여백 차의 절반만큼 옮긴다.
  const shifted = [
    roundHalf(x + (left - right) / 2),
    roundHalf(y + (top - bottom) / 2),
    width,
    height,
  ]
  return (
    `그림이 viewBox 가운데에서 치우쳤다(여백 좌 ${roundHalf(left)}, 우 ${roundHalf(right)}, ` +
    `상 ${roundHalf(top)}, 하 ${roundHalf(bottom)}, 허용 차 ${marginTolerance}). ` +
    `원점을 옮겨 viewBox="${shifted.join(" ")}"로 둔다`
  )
}

// 두 상자 사이 글자의 잉크 세로 중심이 상자 세로 중심에서 벗어나도 되는 한도. font-size에 곱한다.
// 본문 폰트로 잰 어긋남(#612, 상자 세로 중심이 baseline보다 5 위인 배치): baseline 쪽에 앉는 `_`는 14에서
// 6.9(0.49배), 13에서 6.6(0.51배) 아래였고(e53a1e99가 고치기 전의 도해, #208), `…`는 14에서 4.3(0.30배),
// `:`는 14에서 1.4(0.10배) 아래였다. 가장 가까운 둘인 `…`와 `:`의 가운데인 0.2배(14에서 2.8)로 가른다.
const betweenBoxesTolerance = 0.2

// 그 안의 요소는 그려지지 않거나 다른 곳에 쓰여, 놓인 자리를 속성으로 알 수 없다.
const unplacedContainers = new Set(["defs", "clipPath", "mask", "marker", "pattern", "symbol"])

// 요소가 루트 좌표계에서 속성대로 놓였으면 true다. 자신이나 조상에 transform이 걸리거나 안쪽 <svg>가
// 좌표계를 새로 열면 속성만으로 자리를 정할 수 없어 false를 준다.
function placed(element: SvgElement): boolean {
  for (let e: SvgElement | undefined = element; e; e = e.parent) {
    if (e.attributes.has("transform") || unplacedContainers.has(e.name)) return false
    if (e.name === "svg" && e.parent) return false
  }
  return true
}

// 길이 하나로 된 좌표만 읽는다. 목록(x="10 20")이나 단위가 붙은 값이면 NaN을 준다.
function coordinate(element: SvgElement, attribute: string): number {
  const value = element.attributes.get(attribute) ?? "0"
  return /^-?(\d+\.?\d*|\.\d+)(px)?$/i.test(value) ? lengthOf(value) : NaN
}

const contains = (box: Bounds, x: number, y: number) =>
  box.left <= x && x <= box.right && box.top <= y && y <= box.bottom
const middle = (box: Bounds) => (box.top + box.bottom) / 2

// 다른 <rect>를 품지 않는 <rect>. 품는 것은 그룹 틀이다.
function boxesOf(elements: SvgElement[]): Bounds[] {
  const rects = elements
    .filter((element) => element.name === "rect" && placed(element))
    .map((element) => {
      const [x, y, width, height] = ["x", "y", "width", "height"].map((a) => coordinate(element, a))
      return { left: x, right: x + width, top: y, bottom: y + height }
    })
    .filter((box) => Object.values(box).every(Number.isFinite) && box.right > box.left)
  return rects.filter(
    (box) =>
      !rects.some(
        (other) =>
          other !== box &&
          contains(box, other.left, other.top) &&
          contains(box, other.right, other.bottom),
      ),
  )
}

// 두 상자 사이 칸을 볼 때 상자 쪽에서 덜어 내는 폭. 테두리(폭 1.5의 절반)와 그 가장자리의 앤티앨리어싱이
// 칸에 들어오지 않게 한다.
const gapInset = 2

// 칠한 영역을 주고, 그리지 못하면 undefined를 준다. 도해 전체를 그리지 못한 것은 여백 검사가 알린다.
async function paintedOrSkip(svg: string, viewBox: ViewBox) {
  try {
    return await paintedBounds(svg, viewBox)
  } catch (error) {
    if (!(error instanceof SvgRenderError)) throw error
  }
}

// 같은 줄에 놓인 두 상자 사이에서 어느 상자에도 들지 않는 글자는 잉크의 세로 중심을 상자 세로 중심에
// 맞춘다. 두 상자 사이 칸에 그 글자 말고도 그린 것(화살표 같은)이 있으면 글자는 그것의 라벨이라
// 위아래로 비켜 두므로 보지 않는다. 잉크의 가로 중심이 칸 가운데 절반 밖이면 한쪽 상자에 붙인 라벨이므로
// 보지 않는다. main의 구분자(`:`, `…`)와 고치기 전의 `_`는 모두 칸 가운데에 있었다.
// 글자는 조상과 <style>을 살려 홀로 그려 잉크를 잰다.
async function textBetweenBoxesViolations(
  text: string,
): Promise<{ offset: number; message: string }[]> {
  const elements = svgElements(text)
  const boxes = boxesOf(elements)
  const styles = [...text.matchAll(/<(?:[\w-]+:)?style[\s>][\s\S]*?<\/(?:[\w-]+:)?style\s*>/gi)]
    .map((m) => m[0])
    .join("")
  const closeTag = (e: SvgElement) => `</${e.source.match(/^<([\w:-]+)/)![1]}>`
  const found: { offset: number; message: string }[] = []
  for (const element of elements) {
    if (element.name !== "text" || element.source.endsWith("/>") || !placed(element)) continue
    const [x, y] = [coordinate(element, "x"), coordinate(element, "y")]
    if (!Number.isFinite(x) || !Number.isFinite(y) || boxes.some((box) => contains(box, x, y))) {
      continue
    }
    // 같은 줄은 두 상자가 baseline을 세로로 품고 세로 중심이 허용치 안에서 같은 것이다.
    const row = boxes.filter((box) => box.top <= y && y <= box.bottom)
    const before = row.filter((box) => box.right <= x).sort((a, b) => b.right - a.right)[0]
    const after = row.filter((box) => box.left >= x).sort((a, b) => a.left - b.left)[0]
    const fontSize = lengthOf(inherited(element, "font-size") ?? "16")
    const ancestors: SvgElement[] = []
    for (let e = element.parent; e; e = e.parent) ancestors.unshift(e)
    const root = ancestors[0]
    const viewBox = root && viewBoxOf(root.source)
    const end = /<\/(?:[\w-]+:)?text\s*>/g
    end.lastIndex = element.offset
    const close = end.exec(text)
    if (!before || !after || !Number.isFinite(fontSize) || !viewBox || !close) continue
    const tolerance = betweenBoxesTolerance * fontSize
    if (Math.abs(middle(before) - middle(after)) > tolerance) continue
    const elementEnd = close.index + close[0].length

    const top = Math.max(before.top, after.top)
    const gap: ViewBox = [
      before.right + gapInset,
      top,
      after.left - before.right - 2 * gapInset,
      Math.min(before.bottom, after.bottom) - top,
    ]
    if (gap[2] <= 0 || gap[3] <= 0) continue
    const gapWithoutText = withRootViewBox(
      text.slice(0, element.offset) + text.slice(elementEnd),
      { index: root.offset, tag: root.source },
      gap,
    )
    if ((await paintedOrSkip(gapWithoutText, gap)) !== null) continue

    const center = (middle(before) + middle(after)) / 2
    const bandHalf =
      Math.max(before.bottom - before.top, after.bottom - after.top) / 2 + 2 * fontSize
    const band: ViewBox = [viewBox[0], center - bandHalf, viewBox[2], 2 * bandHalf]
    const textAlone =
      withViewBox(root.source, band) +
      styles +
      ancestors
        .slice(1)
        .map((e) => e.source)
        .join("") +
      text.slice(element.offset, elementEnd) +
      [...ancestors].reverse().map(closeTag).join("")
    const ink = await paintedOrSkip(textAlone, band)
    if (!ink) continue
    const gapMiddle = (before.right + after.left) / 2
    const gapQuarter = (after.left - before.right) / 4
    if (Math.abs((ink.left + ink.right) / 2 - gapMiddle) > gapQuarter) continue
    const offset = (ink.top + ink.bottom) / 2 - center
    if (Math.abs(offset) <= tolerance) continue
    const content = text
      .slice(element.offset + element.source.length, close.index)
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
    const roundTenth = (n: number) => Math.round(n * 10) / 10
    found.push({
      offset: element.offset,
      message:
        `두 상자 사이 글자 \`${content}\`의 잉크 중심이 상자 세로 중심에서 ` +
        `${roundTenth(Math.abs(offset))} ${offset > 0 ? "아래" : "위"}에 있다(허용 ${roundTenth(tolerance)}). ` +
        `글자를 옮기거나, 구분자는 상자 세로 중심의 선으로 그린다`,
    })
  }
  return found
}

export const svg: SourceCheck = async (tree) => {
  const fallbacks = new Map(
    loadDiagramConventions()
      .table("diagram-palette", ["이름", "대체값"])
      .map((row) => {
        const fallback = normalizeColor(row["대체값"])
        if (!normalizeHex(fallback) && fallback !== "none") {
          throw new Error(`도해 규약의 도해 팔레트 대체값이 hex나 none이 아니다: ${row["대체값"]}`)
        }
        return [row["이름"], fallback]
      }),
  )
  const violations: Violation[] = []
  for (const { file, source } of tree.svgs) {
    const lineAt = (offset: number) => source.slice(0, offset).split("\n").length
    const add = (offset: number, message: string) =>
      violations.push({ file, line: lineAt(offset), message })
    // 주석 안의 색은 그려지지 않으므로, 길이를 지켜 지운 뒤 찾는다.
    const text = source.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, " "))
    for (const { value, offset } of propertyValues(text, colorProperty)) {
      const message = colorViolation(value, fallbacks)
      if (message) add(offset, message)
    }
    for (const { css, offset } of styleBlocks(text)) {
      for (const m of css.matchAll(variableDeclaration)) {
        add(
          offset + m.index + m[0].indexOf(m[1]),
          `SVG 안에서 변수를 선언하지 않는다(여백 검사의 librsvg는 선언을 무시한다): ${m[1]}`,
        )
      }
    }
    for (const { offset, message } of shapeViolations(text)) add(offset, message)
    for (const [property, expected] of Object.entries(textProperties)) {
      for (const { value, offset } of propertyValues(text, property)) {
        if (value.replace(/\s+/g, " ") === expected) continue
        violations.push({
          file,
          line: lineAt(offset),
          message: `${property}="${expected}"로 둔다: ${value}`,
        })
      }
    }
    // fill을 적지 않은 도형과 글자는 검정으로 그려져 다크 테마에서 보이지 않는다. 루트가 fill을
    // 정하면 모든 요소가 루트까지 거슬러 올라가 팔레트 색이나 none을 물려받는다.
    const root = text.match(svgRootTag)
    if (root) {
      const atRoot = (message: string) =>
        violations.push({ file, line: lineAt(root.index!), message })
      // style의 --ink-fill 같은 변수 선언은 fill이 아니다.
      if (!/\sfill\s*=|\sstyle\s*=\s*(["'])[^"']*(?<![\w-])fill\s*:/i.test(root[0])) {
        atRoot("루트 <svg>에 fill이 없다")
      }
      // 사이트가 이 이름을 도해 <object>의 접근성 이름으로 쓴다. 이름을 읽는 법은 사이트와 같다.
      if (rootLabel(root[0]) === null) {
        atRoot("루트 <svg>에 도해가 보이는 것을 적은 aria-label이 없거나 비었다")
      }
      if (/<(?:[\w-]+:)?text[\s>]/i.test(text)) {
        for (const [property, expected] of Object.entries(textProperties)) {
          if (!new RegExp(`\\s${property}\\s*=`, "i").test(root[0])) {
            atRoot(`루트 <svg>에 ${property}="${expected}" 속성이 없다`)
          }
        }
        if (!text.includes(fontImport)) {
          atRoot(`본문 폰트를 불러오지 않는다: <style>${fontImport}</style>`)
        }
      }
      const marginMessage = await marginViolation(source, { index: root.index!, tag: root[0] })
      if (marginMessage) atRoot(marginMessage)
    }
    for (const { offset, message } of await textBetweenBoxesViolations(text)) add(offset, message)
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
  ["lead", lead],
  ["section", section],
  ["wikilink", wikilink],
  ["citation", citation],
  ["callout", callout],
  ["emphasis", emphasis],
  ["math", math],
  ["svg", svg],
]
