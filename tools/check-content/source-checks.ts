import { slugifyFilePath } from "@quartz-community/utils"
import GithubSlugger, { slug as anchorSlug } from "github-slugger"
import { visit } from "unist-util-visit"
import { pretendardStylesheet } from "../../quartz/util/localFonts"
import type { Conventions } from "./conventions"
import { marginTolerance, measureMargins, SvgRenderError } from "./diagram-margin"
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
    let text = ""
    visit(heading, (node) => {
      if (node.type === "text" || node.type === "inlineCode") text += node.value
    })
    ids.add(slugger.slug(text))
  })
  return ids
}

export const wikilink: SourceCheck = (tree) => {
  // 대문과 태그 표시 이름 파일도 링크 대상이므로 title을 모은다.
  const titles = new Map(tree.pages.map((p) => [p.name, fieldsOf(p).title]))
  const sections = new Map(tree.pages.map((p) => [p.name, sectionIds(p)]))
  const slugs = new Set(tree.pages.filter((p) => p.kind !== "tag").map((p) => p.name))
  const violations: Violation[] = []
  for (const page of tree.pages) {
    for (const { match, line } of matchLines(page, /(!?)\[\[([^[\]\n]+?)\]\]/g)) {
      const [link, embed, inner] = match
      const [path, display] = inner.split(/\\?\|/)
      const [target, anchor] = path.split("#").map((part) => part.trim())
      const at = (message: string) => violations.push({ file: page.file, line, message })
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

// 문단과 목록 항목의 끝이 종결 어미 "다"인데 마침표가 없으면 위반이다. 명사구로 끝나는 항목은
// 문장이 아니므로 보지 않는다. 끝에 붙은 인용은 떼고 본다(`…다.[@키]`는 마침표로 끝난다).
// remark-parse는 GFM 표를 문단으로 읽으므로, 구분 줄(`| --- |`)이 있는 문단은 표로 보고 건너뛴다.
const trailingCitations = /(?:\s*\[@[^[\]\n]*\])+\s*$/
const tableDelimiterRow = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/m

export const period: SourceCheck = (tree) => {
  const violations: Violation[] = []
  for (const page of tree.pages) {
    visit(page.mdast, "paragraph", (node, _index, parent) => {
      const { start, end } = node.position!
      const source = page.masked.slice(start.offset, end.offset)
      if (tableDelimiterRow.test(source)) return
      const text = source.replace(trailingCitations, "")
      if (!text.trimEnd().endsWith("다")) return
      const block = parent?.type === "listItem" ? "목록 항목" : "문단"
      violations.push({
        file: page.file,
        line: end.line,
        message: `문장으로 끝나는 ${block}에 마침표가 없다`,
      })
    })
  }
  return violations
}

// 도해 SVG 한 벌이 두 테마에서 읽히도록, 색은 규약 문서의 도해 팔레트 값만 쓴다.
const colorProperty = "fill|stroke|stop-color|flood-color|lighting-color|color"
const colorKeywords = /^(none|transparent|inherit|url\(#[^)]+\))$/i
// CSS 선언은 style 속성과 <style> 요소 안에만 있다. 글자 노드의 "fill: ..."는 보지 않는다.
const styleSources = [/\sstyle\s*=\s*(["'])(.*?)\1/gs, /<style[^>]*>([\s\S]*?)<\/style>/gi]

// 도해의 글자는 사이트와 같은 Pretendard로, 글리프 폭을 픽셀에 맞춰 반올림하지 않고 그린다.
// 브라우저와 검사기가 같은 폭으로 그려야 검사기가 잰 여백이 독자가 보는 여백과 맞는다.
// Linux의 Chromium은 geometricPrecision이 없으면 글리프 폭을 반올림해 여백이 한 변에서 4까지 달라진다.
// 합자를 끄지 않으면 Pretendard가 "0x"의 x를 ×로 그리는 때가 있다(예: "ID 0x8100").
const textProperties = {
  "font-family": "Pretendard, sans-serif",
  "text-rendering": "geometricPrecision",
  "font-variant": "none",
}
const fontImport = `@import url("${pretendardStylesheet}");`

// 속성(`fill="..."`)과 CSS 선언(`fill: ...`)으로 준 값을 모두 찾는다. offset은 속성 이름이 시작하는 곳이다.
function propertyValues(text: string, property: string) {
  const attribute = new RegExp(`\\s(${property})\\s*=\\s*(["'])(.*?)\\2`, "gi")
  const declaration = new RegExp(`(?:^|[\\s;{])(${property})\\s*:\\s*([^;}]+)`, "gi")
  const found = [...text.matchAll(attribute)].map((m) => ({
    value: m[3],
    offset: m.index + m[0].indexOf(m[1]),
  }))
  for (const pattern of styleSources) {
    for (const style of text.matchAll(pattern)) {
      const css = style[style.length - 1]
      const cssOffset = style.index + style[0].indexOf(css)
      for (const m of css.matchAll(declaration)) {
        found.push({ value: m[2], offset: cssOffset + m.index + m[0].indexOf(m[1]) })
      }
    }
  }
  return found.map(({ value, offset }) => ({
    value: value.replace(/!important/i, "").trim(),
    offset,
  }))
}

function normalizeHex(value: string): string | null {
  const hex = value.toLowerCase().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)?.[1]
  if (!hex) return null
  return `#${hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex}`
}

// 여백이 치우쳤거나 잴 수 없으면 그 이유를, 아니면 null을 준다.
async function marginViolation(source: string, root: string): Promise<string | null> {
  const viewBox = root
    .match(/\sviewBox\s*=\s*(["'])(.*?)\1/i)?.[2]
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  if (viewBox?.length !== 4 || viewBox.some((n) => !Number.isFinite(n))) {
    return "루트 <svg>에 viewBox가 없어 여백을 재지 못한다"
  }
  const [x, y, width, height] = viewBox
  let margins
  try {
    margins = await measureMargins(source, { width, height })
  } catch (error) {
    if (!(error instanceof SvgRenderError)) throw error
    return `SVG를 그리지 못해 여백을 재지 못했다: ${error.message}`
  }
  if (!margins) return null
  const { left, right, top, bottom } = margins
  if (Math.abs(left - right) <= marginTolerance && Math.abs(top - bottom) <= marginTolerance) {
    return null
  }
  // 그림을 가운데로 옮기려면 원점을 여백 차의 절반만큼 옮긴다. 0.5 단위로 반올림한다.
  const round = (n: number) => Math.round(n * 2) / 2
  const shifted = [round(x + (left - right) / 2), round(y + (top - bottom) / 2), width, height]
  return (
    `그림이 viewBox 가운데에서 치우쳤다(여백 좌 ${round(left)}, 우 ${round(right)}, ` +
    `상 ${round(top)}, 하 ${round(bottom)}, 허용 차 ${marginTolerance}). ` +
    `원점을 옮겨 viewBox="${shifted.join(" ")}"로 둔다`
  )
}

export const svg: SourceCheck = async (tree, conventions) => {
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
    for (const { value, offset } of propertyValues(text, colorProperty)) {
      if (colorKeywords.test(value) || palette.has(normalizeHex(value) ?? "")) continue
      violations.push({ file, line: lineAt(offset), message: `도해 팔레트 밖의 색: ${value}` })
    }
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
    const root = text.match(/<(?:[\w-]+:)?svg[\s>][^>]*>/i)
    if (root) {
      const atRoot = (message: string) =>
        violations.push({ file, line: lineAt(root.index!), message })
      if (!/\sfill\s*=|\sstyle\s*=\s*(["'])[^"']*\bfill\s*:/i.test(root[0])) {
        atRoot("루트 <svg>에 fill이 없다")
      }
      if (/<(?:[\w-]+:)?text[\s>]/i.test(text)) {
        for (const [property, expected] of Object.entries(textProperties)) {
          if (!new RegExp(`\\s${property}\\s*=`, "i").test(root[0])) {
            atRoot(`루트 <svg>에 ${property}="${expected}" 속성이 없다`)
          }
        }
        if (!text.includes(fontImport)) {
          atRoot(`Pretendard를 불러오지 않는다: <style>${fontImport}</style>`)
        }
      }
      const marginMessage = await marginViolation(source, root[0])
      if (marginMessage) atRoot(marginMessage)
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
  ["lead", lead],
  ["wikilink", wikilink],
  ["citation", citation],
  ["callout", callout],
  ["emphasis", emphasis],
  ["period", period],
  ["svg", svg],
]
