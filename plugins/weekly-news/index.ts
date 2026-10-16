// ash-wiki: 주간 소식(content/news/<ISO 주차>.md)을 읽고 그리는 로컬 플러그인이다. 주간 소식은 위키 콘텐츠
// 밖의 페이지라(ADR 0015) 위키 규약을 따르지 않고, 형식은 docs/weekly-news.md에 있다.
//
// 형식의 정본은 순수 함수 parseWeeklyNews 하나다. 주간 소식 파일 하나(이름과 원본)를 받아 소식 항목 목록과
// 형식 오류를 돌려준다. 이 플러그인은 transformer이자 페이지 타입이다.
// - transformer: 호 파일을 parseWeeklyNews로 읽어 vfile 데이터(weeklyNews)에 둔다. 형식 오류가 있으면 빌드를
//   멈춘다. 대문(plugins/front-page)은 이 데이터에서 최신 호를 고르고, 피드(plugins/feeds)는 호의 기간을 읽는다.
//   html 단계에서는 호와 지난 호 목록의 설명(메타 설명과 피드)과 호의 검색 본문을 정한다.
// - 페이지 타입: 호 페이지를 제목 아래 줄(기간과 이웃 호), 정렬·거르기 줄, 발행일 최근순 목록, 이전·다음 링크로
//   그리고, 지난 호 목록(content/news/index.md, 본문 없음)에 피드 링크와 달별 목록을 그린다. 구역 칩의 이름은
//   태그 표시 이름 파일(tags/<구역>)의 제목이다. 정렬, 거르기, 키 이동은 브라우저의 스크립트가 한다.
//
// 요약은 마크다운이라 위키 링크를 쓸 수 있다. 카드는 요약을 다시 그리지 않고, 파이프라인이 그린 본문 트리에서
// 요약이 차지하는 원본 줄(parseWeeklyNews가 준다)의 요소를 옮겨 온다. 그래서 위키 링크는 다른 페이지와 같이
// 풀리고, Backlinks도 본문을 그대로 본다. 검색 본문은 같은 줄에서 원어 제목과 요약만 모은다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
import GithubSlugger from "github-slugger"
import type { Element, ElementContent, Root as HastRoot, RootContent as HastContent } from "hast"
import type { Heading, List, Root as MdastRoot, RootContent } from "mdast"
import remarkParse from "remark-parse"
import { unified } from "unified"
import type { VFile } from "vfile"
import { ContentBody } from "@quartz-community/content-page"
import { escapeHTML, formatDate, pathToRoot, resolveRelative } from "@quartz-community/utils"
import type { QuartzComponent, QuartzComponentProps } from "../../quartz/components/types"
import type { QuartzPluginData } from "../../quartz/plugins/vfile"

export const manifest = {
  name: "weekly-news",
  displayName: "Weekly news",
  description: "주간 소식을 읽어 발행일 순 목록과 지난 호 목록으로 그린다",
  version: "1.0.0",
  category: ["transformer", "pageType"],
}

// 소식 항목 하나. regions는 구역 태그(network)의 목록이고 기타는 빈 목록이다. id는 카드의 앵커로, 위키 링크의 절
// 링크(`[[news/2026-w41#원어 제목]]`)가 가리키는 값과 같다. featured는 주요 소식인지다. summary의 start와
// end는 요약이 차지하는 원본의 첫 줄과 끝 줄(1부터)이다.
export interface NewsItem {
  id: string
  regions: string[]
  title: string
  url: string
  outlet: string
  date: string
  image: string | null
  featured: boolean
  summary: { markdown: string; start: number; end: number }
}

export interface NewsError {
  line: number
  message: string
}

// transformer가 주간 소식 파일의 vfile 데이터에 두는 값. period는 호가 다루는 기간(weekDays)이다.
export interface WeeklyNewsData {
  week: string
  items: NewsItem[]
  period: { start: string; end: string }
}

const OTHER = "기타"
const FIELDS = {
  region: "구역",
  outlet: "매체",
  date: "발행일",
  image: "이미지",
  featured: "주요",
} as const
const FEATURED_VALUE = "예"
const REQUIRED = [FIELDS.region, FIELDS.outlet, FIELDS.date]

// 주간 소식의 슬러그 접두. news/index는 지난 호 목록이다.
const NEWS_PREFIX = "news/"
const INDEX_SLUG = "news/index"

const WEEK = /^(\d{4})-w(\d{2})$/

// ISO 8601에서 53주가 있는 해는 1월 1일이 목요일이거나, 윤년이면서 1월 1일이 수요일인 해다
function weeksInYear(year: number): number {
  const jan1 = new Date(Date.UTC(year, 0, 1)).getUTCDay()
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  return jan1 === 4 || (leap && jan1 === 3) ? 53 : 52
}

function parseWeek(name: string): { year: number; week: number } | null {
  const match = name.match(WEEK)
  if (!match) return null
  const year = Number(match[1])
  const week = Number(match[2])
  return week >= 1 && week <= weeksInYear(year) ? { year, week } : null
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10)

/** 호의 제목. ISO 주차(2026-w41)에서 만든다(2026년 41주차 주간 소식). */
export function issueTitle(name: string): string {
  const parsed = parseWeek(name)
  if (!parsed) throw new Error(`ISO 주차가 아니다: ${name}`)
  return `${parsed.year}년 ${parsed.week}주차 주간 소식`
}

/** ISO 주차(2026-w41)의 월요일과 일요일(YYYY-MM-DD). 1주는 1월 4일이 든 주다. */
export function weekDays(name: string): { start: string; end: string } {
  const parsed = parseWeek(name)
  if (!parsed) throw new Error(`ISO 주차가 아니다: ${name}`)
  const jan4 = new Date(Date.UTC(parsed.year, 0, 4))
  const monday = new Date(jan4)
  monday.setUTCDate(4 - ((jan4.getUTCDay() + 6) % 7) + (parsed.week - 1) * 7)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return { start: isoDay(monday), end: isoDay(sunday) }
}

function parseMonth(name: string): { year: number; monthIndex: number } | null {
  const match = name.match(/^(\d{4})-(\d{2})$/)
  if (!match) return null
  const monthIndex = Number(match[2]) - 1
  return monthIndex >= 0 && monthIndex <= 11 ? { year: Number(match[1]), monthIndex } : null
}

/** 달(2026-02)의 ISO 주차 목록. 목요일이 그 달에 드는 주차다(달의 경계에 걸친 주도 하나의 달에만 든다). */
export function monthWeeks(month: string): string[] {
  const parsed = parseMonth(month)
  if (!parsed) throw new Error(`달이 아니다: ${month}`)
  const { year, monthIndex } = parsed
  const thursday = new Date(Date.UTC(year, monthIndex, 1))
  thursday.setUTCDate(1 + ((4 - thursday.getUTCDay() + 7) % 7))
  const weeks: string[] = []
  while (thursday.getUTCMonth() === monthIndex) {
    // 목요일이 든 해가 그 주의 ISO 연도이고, 1주의 목요일은 1월 1~7일이다
    const week = Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / 86400000 / 7) + 1
    weeks.push(`${year}-w${String(week).padStart(2, "0")}`)
    thursday.setUTCDate(thursday.getUTCDate() + 7)
  }
  return weeks
}

/** 호를 두는 달(2026-10). monthWeeks가 그 주차를 두는 달이다. */
export function issueMonth(week: string): string {
  const { start, end } = weekDays(week)
  const month = [start, end]
    .map((day) => day.slice(0, 7))
    .find((candidate) => monthWeeks(candidate).includes(week))
  return month!
}

/** 지난 호 목록의 달 묶음. 최근 달부터, 달 안에서는 최근 호부터 둔다. */
export function indexMonths(weeks: string[]): { month: string; weeks: string[] }[] {
  const months: { month: string; weeks: string[] }[] = []
  for (const week of [...weeks].sort().reverse()) {
    const month = issueMonth(week)
    if (months.at(-1)?.month !== month) months.push({ month, weeks: [] })
    months.at(-1)!.weeks.push(week)
  }
  return months
}

// 호의 이웃 호. 없는 쪽은 null이다.
export type Neighbors = { prev: string | null; next: string | null }

/**
 * 호의 이웃 호. weeks는 빌드에 있는 호의 주차이고, 그 가운데 주차순으로 바로 앞(prev, 오래된 호)과 뒤(next)를
 * 준다. 파일이 없는 주는 건너뛰고 해를 넘어서도 잇는다. 없는 쪽은 null이다. ISO 주차(2026-w41)는 글자 순서가
 * 주차 순서와 같다.
 */
export function issueNeighbors(weeks: string[], week: string): Neighbors {
  const sorted = [...new Set(weeks)].sort()
  const index = sorted.indexOf(week)
  return {
    prev: index > 0 ? sorted[index - 1] : null,
    next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null,
  }
}

/** 주차의 이름(2026년 40주차). from(기준 호)과 같은 해면 연도를 뺀다(40주차). */
export function weekLabel(week: string, from?: string): string {
  const parsed = parseWeek(week)
  if (!parsed) throw new Error(`ISO 주차가 아니다: ${week}`)
  const sameYear = from !== undefined && parseWeek(from)?.year === parsed.year
  return sameYear ? `${parsed.week}주차` : `${parsed.year}년 ${parsed.week}주차`
}

/** 날짜(YYYY-MM-DD)를 사이트의 날짜 꼴로 쓴다. year(기준 해)와 같은 해면 연도를 뺀다. */
export function dayLabel(day: string, locale: string, year?: number): string {
  const date = new Date(`${day}T00:00:00`)
  if (Number(day.slice(0, 4)) !== year) return formatDate(date, locale)
  return date.toLocaleDateString(locale, { month: "short", day: "2-digit" })
}

const periodLabel = (week: string, locale: string) => {
  const { start, end } = weekDays(week)
  return `${dayLabel(start, locale)} ~ ${dayLabel(end, locale)}`
}

/**
 * 호의 설명. 메타 설명과 피드 항목이 쓴다. 기간과 소식 수에, 주요 소식이 있으면 그 원어 제목을 호 페이지의
 * 기본 정렬(최근순)대로 잇는다.
 */
export function issueDescription(week: string, items: NewsItem[], locale: string): string {
  const head = `${periodLabel(week, locale)}, 자동차 임베디드 업계 소식 ${items.length}건.`
  const featured = byDate(items, "newest").filter((item) => item.featured)
  return featured.length === 0
    ? head
    : `${head} 주요: ${featured.map((item) => item.title).join(", ")}`
}

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && isoDay(date) === value
}

const isUrl = (value: string) => /^https?:\/\/\S+$/.test(value)

// 마크다운 노드의 글자. 링크 제목에 든 강조나 코드도 글자만 모은다.
function plainText(node: { type: string; value?: string; children?: unknown[] }): string {
  if (typeof node.value === "string") return node.value
  return (node.children ?? []).map((child) => plainText(child as typeof node)).join("")
}

// 프론트매터를 같은 수의 빈 줄로 바꾼다. 줄 번호는 원본과 같다.
function maskFrontmatter(source: string): string {
  const lines = source.split("\n")
  if (lines[0]?.trim() !== "---") return source
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---")
  if (end < 0) return source
  return lines.map((line, i) => (i <= end ? "" : line)).join("\n")
}

/**
 * 주간 소식 파일 하나를 소식 항목 목록으로 읽는다. name은 확장자를 뗀 파일 이름(2026-w41)이고, source는
 * 프론트매터를 포함한 원본이다. 형식은 docs/weekly-news.md에 있고, 어긴 곳은 errors에 원본의 줄과 함께 준다.
 * - 소식 항목은 `## [원어 제목](원문 URL)` 제목으로 시작해 다음 `##`까지다. 첫 항목 앞에는 아무것도 없다.
 * - 제목 바로 다음은 필드 목록(`- 구역: network`)이다. 구역, 매체, 발행일은 반드시 있고 이미지는 없어도 된다.
 *   구역은 구역 태그를 쉼표로 나눠 여럿 쓰거나 기타 하나로 쓴다. 주요는 예 하나로만 쓰고, 없으면 주요 소식이
 *   아니다.
 * - 필드 목록 뒤의 블록이 모두 한국어 요약이다. 요약 안에는 제목을 두지 않는다.
 * - 항목의 id는 제목 글자를 github-slugger로 바꾼 값이다. 사이트가 제목에 붙이는 id와 같은 규칙이다.
 */
export function parseWeeklyNews(
  name: string,
  source: string,
): { items: NewsItem[]; errors: NewsError[] } {
  const errors: NewsError[] = []
  const error = (line: number, message: string) => errors.push({ line, message })
  if (!parseWeek(name)) error(1, `파일 이름은 소문자 ISO 주차(예: 2026-w41)로 쓴다: ${name}`)

  const text = maskFrontmatter(source)
  const tree = unified().use(remarkParse).parse(text) as MdastRoot
  const lineOf = (node: RootContent) => node.position?.start.line ?? 1
  const slice = (from: RootContent, to: RootContent) =>
    text.slice(from.position?.start.offset ?? 0, to.position?.end.offset ?? 0)

  // 블록을 항목마다 나눈다. 첫 `##` 앞의 블록은 머리말이다.
  const groups: { heading: Heading; blocks: RootContent[] }[] = []
  const preamble: RootContent[] = []
  for (const node of tree.children) {
    if (node.type === "heading" && node.depth === 2) groups.push({ heading: node, blocks: [] })
    else if (groups.length === 0) preamble.push(node)
    else groups.at(-1)!.blocks.push(node)
  }
  if (preamble.length > 0) {
    error(lineOf(preamble[0]), "첫 소식 항목(## [원어 제목](원문 URL)) 앞에는 아무것도 두지 않는다")
  }

  const slugger = new GithubSlugger()
  const items: NewsItem[] = []
  for (const { heading, blocks } of groups) {
    const headingLine = lineOf(heading)
    const id = slugger.slug(plainText(heading))
    const content = heading.children.filter(
      (child) => !(child.type === "text" && child.value.trim() === ""),
    )
    const link = content[0]
    if (content.length !== 1 || link.type !== "link" || !isUrl(link.url)) {
      error(headingLine, "소식 항목의 제목은 원문 링크 하나다: ## [원어 제목](원문 URL)")
      continue
    }
    const before = errors.length

    const [list, ...summary] = blocks
    const fields = new Map<string, { value: string; line: number }>()
    if (list?.type !== "list") {
      error(headingLine, "제목 다음에 필드 목록(- 구역: …)을 둔다")
    } else {
      for (const entry of (list as List).children) {
        const line = entry.position?.start.line ?? headingLine
        const raw = entry.children[0] ? slice(entry.children[0], entry.children.at(-1)!) : ""
        const match = raw.match(/^([^:\n]+):\s*(.*)$/)
        const key = match?.[1].trim() ?? raw
        if (!match || !(Object.values(FIELDS) as string[]).includes(key)) {
          error(line, `모르는 필드다: ${key}`)
        } else {
          fields.set(key, { value: match[2].trim(), line })
        }
      }
      const missing = REQUIRED.filter((key) => !fields.get(key)?.value)
      if (missing.length > 0) error(lineOf(list), `필드가 빠졌다: ${missing.join(", ")}`)
    }

    const region = fields.get(FIELDS.region)
    const regions = [...new Set((region?.value ?? "").split(",").map((tag) => tag.trim()))]
    const isOther = regions.length === 1 && regions[0] === OTHER
    if (region?.value && !isOther && !regions.every((tag) => /^[a-z0-9-]+$/.test(tag))) {
      error(
        region.line,
        `구역은 구역 태그(예: network)를 쉼표로 나눠 쓰거나 ${OTHER} 하나로 쓴다: ${region.value}`,
      )
    }
    const date = fields.get(FIELDS.date)
    if (date?.value && !isDate(date.value)) {
      error(date.line, `발행일은 YYYY-MM-DD로 쓴다: ${date.value}`)
    }
    const image = fields.get(FIELDS.image)
    if (image?.value && !isUrl(image.value)) {
      error(image.line, `이미지는 http(s) URL로 쓴다: ${image.value}`)
    }
    const featured = fields.get(FIELDS.featured)
    if (featured && featured.value !== FEATURED_VALUE) {
      error(
        featured.line,
        `${FIELDS.featured}는 ${FEATURED_VALUE}로만 쓰고, 주요 소식이 아니면 필드를 뺀다: ${featured.value}`,
      )
    }

    const subheading = summary.find((node) => node.type === "heading")
    if (subheading) error(lineOf(subheading), "소식 항목 안에는 제목을 두지 않는다")
    else if (summary.length === 0) error(headingLine, "요약이 없다")

    if (errors.length > before) continue
    const first = summary[0]
    const last = summary.at(-1)!
    items.push({
      id,
      regions: isOther ? [] : regions,
      title: plainText(link),
      url: link.url,
      outlet: fields.get(FIELDS.outlet)!.value,
      date: date!.value,
      image: image?.value || null,
      featured: featured !== undefined,
      summary: {
        markdown: slice(first, last),
        start: lineOf(first),
        end: last.position?.end.line ?? lineOf(first),
      },
    })
  }
  return { items, errors }
}

// 호 페이지의 정렬 방향
export type SortOrder = "newest" | "oldest"

/** 소식 항목을 발행일 순으로 늘어놓는다. 같은 날은 어느 쪽이든 파일에 적은 순서를 지킨다. */
export function byDate(items: NewsItem[], order: SortOrder): NewsItem[] {
  const sign = order === "newest" ? -1 : 1
  return [...items].sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? -sign : sign))
}

// 호 페이지의 거르기 줄에 놓을 칩. region이 null이면 기타다.
export interface IssueFilters {
  featured: number
  regions: { region: string | null; count: number }[]
}

/**
 * 호 하나의 거르기 칩. 주요 소식 수와, 구역마다 항목 수를 준다. 구역은 known(사이트의 모든 구역)과 항목이 단
 * 구역에 기타를 더한 것이고, 항목이 없으면 0이다. 0인 칩은 다른 호에서 이어받은 거르기 상태를 보일 때만
 * 쓴다(docs/weekly-news.md). 구역은 regionOrder(대문 구역 표의 순서) 대로 두고, 거기 없는 구역은 그 뒤에
 * 이름순으로, 기타는 맨 뒤에 둔다. 구역을 여럿 단 항목은 구역마다 센다.
 */
export function issueFilters(
  items: NewsItem[],
  regionOrder: string[],
  known: string[],
): IssueFilters {
  const counts = new Map<string | null, number>([...known, null].map((region) => [region, 0]))
  for (const item of items) {
    for (const region of item.regions.length > 0 ? item.regions : [null]) {
      counts.set(region, (counts.get(region) ?? 0) + 1)
    }
  }
  const rank = (region: string | null) => {
    if (region === null) return Infinity
    const index = regionOrder.indexOf(region)
    return index < 0 ? regionOrder.length : index
  }
  const regions = [...counts.keys()].sort(
    (a, b) => rank(a) - rank(b) || (a ?? "").localeCompare(b ?? ""),
  )
  return {
    featured: items.filter((item) => item.featured).length,
    regions: regions.map((region) => ({ region, count: counts.get(region)! })),
  }
}

// ---------------------------------------------------------------------------------------------------
// 그리기

const el = (
  tagName: string,
  properties: Element["properties"],
  children: ElementContent[] = [],
): Element => ({ type: "element", tagName, properties, children })
const text = (value: string): ElementContent => ({ type: "text", value })

// 지난 호 목록의 설명. 메타 설명과 주간 소식 피드의 채널 설명이 쓴다. 지난 호 목록에는 본문이 없어 description
// 플러그인이 만들 글이 없다.
const INDEX_DESCRIPTION =
  "자동차 임베디드 업계의 소식을 주마다 모아 짧게 요약한다. 위키 페이지와 달리 요약의 주장을 다른 출처로 검증하지 않으므로, 자세한 내용은 소식마다 붙은 원문 링크에서 확인한다."

const isNews = (slug: string) => slug.startsWith(NEWS_PREFIX)
const isIssue = (slug: string) => isNews(slug) && slug !== INDEX_SLUG
const newsOf = (file: QuartzPluginData) => file.weeklyNews as WeeklyNewsData | undefined

// 본문 트리에서 원본의 start~end 줄 안에 통째로 드는 요소를 바깥 것부터 모은다. 절 접기
// (plugins/collapsible-sections)가 씌운 감싸개처럼 자리 정보가 없거나 범위를 넘는 요소는 안으로 들어간다.
function nodesInLines(tree: HastRoot, start: number, end: number): ElementContent[] {
  const found: ElementContent[] = []
  const walk = (nodes: HastContent[]) => {
    for (const node of nodes) {
      if (node.type === "doctype") continue
      const position = node.position
      if (position && position.start.line >= start && position.end.line <= end) {
        found.push(node as ElementContent)
      } else if ("children" in node) {
        walk(node.children as HastContent[])
      }
    }
  }
  walk(tree.children)
  return found
}

// hast 노드의 글자. 블록 사이는 한 칸 띄운다.
function hastText(nodes: ElementContent[]): string {
  const collect = (node: ElementContent): string =>
    node.type === "text"
      ? node.value
      : "children" in node
        ? node.children.map(collect).join("")
        : ""
  return nodes.map(collect).join(" ").replace(/\s+/g, " ").trim()
}

// 구역의 표시 이름. 태그 표시 이름 파일(tags/<구역>)의 제목이다.
function regionNames(allFiles: QuartzPluginData[]): Map<string, string> {
  const names = new Map<string, string>()
  for (const file of allFiles) {
    const slug = file.slug ?? ""
    const tag = slug.startsWith("tags/") ? slug.slice("tags/".length) : null
    if (tag && tag !== "index" && !tag.includes("/")) {
      names.set(tag, String(file.frontmatter?.title ?? tag))
    }
  }
  return names
}

const externalLink = (href: string, className: string, children: ElementContent[]) =>
  el(
    "a",
    { href, className: [className], target: "_blank", rel: ["noopener", "noreferrer"] },
    children,
  )

// 칩의 색. 구역 색이고, 토큰이 없는 구역과 기타는 중립색이다.
const regionColor = (region: string | null) =>
  `var(--region-${region ?? "other"}, var(--region-other))`

// 구역 칩. 구역마다 칩 하나이고 기타는 기타 칩 하나다. 칩의 꼴은 아래 CSS의 .news-chip이고, 대문의 주간 소식
// 칸(plugins/front-page)도 같은 클래스를 쓴다.
export function regionChips(regions: string[], names: Map<string, string>): Element[] {
  const chip = (region: string | null, name: string) =>
    el("span", { className: ["news-chip"], style: `--region: ${regionColor(region)}` }, [
      text(name),
    ])
  return regions.length === 0
    ? [chip(null, OTHER)]
    : regions.map((region) => chip(region, names.get(region) ?? region))
}

// 주요 칩. 구역 칩과 같은 꼴에 색만 링크 색이다(소유자 결정, #404). 칩 묶음의 맨 앞에 둔다.
const FEATURED_LABEL = "주요"
const FEATURED_COLOR = "var(--secondary)"
const featuredChip = () =>
  el("span", { className: ["news-chip"], style: `--region: ${FEATURED_COLOR}` }, [
    text(FEATURED_LABEL),
  ])

function card(
  item: NewsItem,
  index: number,
  names: Map<string, string>,
  summary: ElementContent[],
  locale: string,
) {
  const date = formatDate(new Date(`${item.date}T00:00:00`), locale)
  const body = el("div", { className: ["news-card-body"] }, [
    el("p", { className: ["news-card-meta"] }, [
      el("span", { className: ["news-card-chips"] }, [
        ...(item.featured ? [featuredChip()] : []),
        ...regionChips(item.regions, names),
      ]),
      el("span", {}, [
        text(item.outlet),
        el("span", { className: ["news-card-sep"], ariaHidden: "true" }, [text("·")]),
        el("time", { dateTime: item.date }, [text(date)]),
      ]),
    ]),
    el("h3", { className: ["news-card-title"] }, [
      externalLink(item.url, "news-card-link", [text(item.title)]),
    ]),
    el("div", { className: ["news-card-summary"] }, summary),
  ])
  // 이미지는 원문의 og:image를 핫링크한다. 불러오지 못하면 스크립트가 숨긴다. 제목 링크와 같은 곳으로 가는
  // 링크라 탭 순서와 스크린 리더에서는 뺀다.
  const image = item.image
    ? [
        el(
          "a",
          {
            href: item.url,
            className: ["news-card-image"],
            target: "_blank",
            rel: ["noopener", "noreferrer"],
            tabIndex: -1,
            ariaHidden: "true",
          },
          [
            el("img", {
              src: item.image,
              alt: "",
              loading: "lazy",
              decoding: "async",
              referrerPolicy: "no-referrer",
            }),
          ],
        ),
      ]
    : []
  // 정렬·거르기 스크립트가 읽는 값이다. data-index는 파일에 적은 순서이고, data-regions는 구역 태그를 띄어 쓰거나
  // 기타다.
  return el(
    "article",
    {
      className: ["news-card"],
      id: item.id,
      dataDate: item.date,
      dataIndex: String(index),
      dataRegions: item.regions.length > 0 ? item.regions.join(" ") : OTHER,
      dataFeatured: item.featured ? "" : undefined,
    },
    [body, ...image],
  )
}

// 정렬·거르기 줄. 첫 줄은 주요 칩과 구역 칩(누르면 거르는 버튼)이고, 그 아래 상태 줄은 왼쪽에 소식 수, 오른쪽에
// 정렬을 둔다(소유자 결정, #404). 소식 수는 거르지 않을 때 "N건", 거를 때 "N건 중 M건"이고 스크립트가
// 바꾼다. 칩은 카드의 칩과 같은 꼴(.news-chip)이다. 거르기가 무엇을 남기는지는 docs/weekly-news.md의 사이트에
// 보이는 범위에 있다. 항목이 없는 칩(주요 소식이 없는 호의 주요 칩 포함)도 숨겨 두고, 쿼리로 이어받은 상태가
// 그 칩을 고르면 스크립트가 0으로 보인다.
function toolbar(filters: IssueFilters, names: Map<string, string>, total: number): Element {
  const chip = (label: string, count: number, color: string, data: Element["properties"]) =>
    el(
      "button",
      {
        type: "button",
        className: ["news-chip", "news-filter"],
        style: `--region: ${color}`,
        ariaPressed: "false",
        hidden: count === 0,
        dataCount: String(count),
        ...data,
      },
      [text(label), el("span", { className: ["news-filter-count"] }, [text(String(count))])],
    )
  const featured = [chip(FEATURED_LABEL, filters.featured, FEATURED_COLOR, { dataFeatured: "" })]
  const regions = filters.regions.map(({ region, count }) =>
    chip(region === null ? OTHER : (names.get(region) ?? region), count, regionColor(region), {
      dataRegion: region ?? OTHER,
    }),
  )
  const sort = (order: SortOrder, label: string) =>
    el(
      "button",
      {
        type: "button",
        className: ["news-sort-option"],
        dataOrder: order,
        ariaPressed: order === "newest" ? "true" : "false",
      },
      [text(label)],
    )
  return el("div", { className: ["news-tools"] }, [
    el("div", { className: ["news-filters"], role: "group", ariaLabel: "거르기" }, [
      ...featured,
      ...regions,
    ]),
    el("div", { className: ["news-status"] }, [
      el(
        "span",
        { className: ["news-tools-count"], ariaLive: "polite", dataTotal: String(total) },
        [text(`${total}건`)],
      ),
      el("span", { className: ["news-sort"], role: "group", ariaLabel: "정렬" }, [
        sort("newest", "최근순"),
        el("span", { ariaHidden: "true" }, [text("·")]),
        sort("oldest", "오래된순"),
      ]),
    ]),
  ])
}

// 대문 구역 표의 구역 순서. 대문의 링크 가운데 구역(tags/<구역>)을 나온 순서대로 모은다. 탐색기
// (plugins/explorer-tree)의 explorerInputs와 같은 규칙이다. 플러그인끼리는 타입만 가져올 수 있어(plugins/front-page의
// 칩 주석) 함수를 나눠 쓰지 못한다.
function regionOrder(allFiles: QuartzPluginData[]): string[] {
  const front = allFiles.find((file) => file.slug === "index")
  const links = (front?.links ?? []) as string[]
  const order: string[] = []
  for (const link of links) {
    const region = link.startsWith("tags/") ? link.slice("tags/".length) : null
    if (region && !region.includes("/") && !order.includes(region)) order.push(region)
  }
  return order
}

// 호 사이를 잇는 링크. 거르기와 정렬 상태를 쿼리로 이어받도록 스크립트가 href에 쿼리를 붙이고, ←/→ 키는
// rel이 prev·next인 아래 링크를 누른다. 이웃 호가 없는 쪽은 링크를 두지 않는다.

// 빌드에 있는 호. 주차마다 파일과 데이터다. 이웃 호, 이전·다음 링크의 소식 수, 지난 호 목록이 쓴다.
function buildIssues(allFiles: QuartzPluginData[]) {
  return new Map(
    allFiles.flatMap((file) => {
      const issue = isIssue(file.slug ?? "") ? newsOf(file) : undefined
      return issue ? [[issue.week, { file, issue }] as const] : []
    }),
  )
}

const issueHref = (props: QuartzComponentProps, week: string) =>
  resolveRelative(props.fileData.slug!, `${NEWS_PREFIX}${week}` as never)

const periodTimes = (week: string, locale: string, year?: number): ElementContent[] => {
  const { start, end } = weekDays(week)
  return [
    el("time", { dateTime: start }, [text(dayLabel(start, locale, year))]),
    text(" ~ "),
    el("time", { dateTime: end }, [text(dayLabel(end, locale, year))]),
  ]
}

// 제목 아래 줄. 왼쪽에 호의 기간, 오른쪽에 "← 40주차 · 42주차 →"를 둔다(소유자 결정, #419). 기간은 지난 호
// 목록의 줄과 같은 꼴로, 호의 해와 같은 해의 날짜는 연도를 뺀다(제목에 연도가 있다). 화살표는 ←/→ 키와 같은
// 방향이다. 이웃 호가 다른 해면 연도를 붙인다. 이웃 링크는 오른쪽 끝에 맞추므로, 이웃 호가 없는 쪽은 빈
// 자리도 두지 않는다.
function issueHead(props: QuartzComponentProps, week: string, neighbors: Neighbors): Element {
  const side = (target: string, rel: "prev" | "next") =>
    el("a", { href: issueHref(props, target), className: ["news-nav-link"], dataNewsNav: rel }, [
      text(rel === "prev" ? `← ${weekLabel(target, week)}` : `${weekLabel(target, week)} →`),
    ])
  const sep = () => el("span", { className: ["news-nav-sep"], ariaHidden: "true" }, [text("·")])
  const links = [
    ...(neighbors.prev ? [side(neighbors.prev, "prev")] : []),
    ...(neighbors.next ? [side(neighbors.next, "next")] : []),
  ]
  const year = Number(week.slice(0, 4))
  return el("div", { className: ["news-head"] }, [
    el("p", { className: ["news-period"] }, periodTimes(week, props.cfg.locale, year)),
    el(
      "nav",
      { className: ["news-nav"], ariaLabel: "이웃 호" },
      links.flatMap((link, i) => (i === 0 ? [link] : [sep(), link])),
    ),
  ])
}

// 마지막 카드 뒤의 이전·다음 링크. 작은 글씨 "← 이전 호"·"다음 호 →" 아래에 연도를 붙인 주차를 두고, 그 아래
// 보조 글자 줄에 그 호의 기간과 소식 수를 둔다(지난 호 목록의 줄과 같은 글). counts는 주차마다 소식 수다.
function issuePager(
  props: QuartzComponentProps,
  neighbors: Neighbors,
  counts: Map<string, number>,
): Element {
  const side = (target: string | null, rel: "prev" | "next") =>
    target
      ? el(
          "a",
          {
            href: issueHref(props, target),
            rel: [rel],
            className: ["news-pager-link", `news-pager-${rel}`],
            dataNewsNav: rel,
          },
          [
            el("span", { className: ["news-pager-label"] }, [
              text(rel === "prev" ? "← 이전 호" : "다음 호 →"),
            ]),
            el("span", { className: ["news-pager-week"] }, [text(weekLabel(target))]),
            el("span", { className: ["news-pager-meta"] }, [
              ...periodTimes(target, props.cfg.locale, Number(target.slice(0, 4))),
              el("span", { className: ["news-card-sep"], ariaHidden: "true" }, [text("·")]),
              text(`${counts.get(target) ?? 0}건`),
            ]),
          ],
        )
      : el("span", { className: ["news-pager-link", `news-pager-${rel}`], ariaHidden: "true" })
  return el("nav", { className: ["news-pager"], ariaLabel: "이전 호와 다음 호" }, [
    side(neighbors.prev, "prev"),
    side(neighbors.next, "next"),
  ])
}

// 주간 소식 한 호의 본문. 제목 아래 줄(기간과 이웃 호), 정렬·거르기 줄, 소식 항목을 발행일 최근순으로 늘어놓은
// 한 목록(한 목록은 소유자 결정, #367. 최근순 기본은 #404), 이전·다음 링크 순이다. 거른 결과가 없을 때의 안내
// 줄은 스크립트가 보인다.
function issueTree(props: QuartzComponentProps, data: WeeklyNewsData): HastRoot {
  const names = regionNames(props.allFiles)
  const unknown = [
    ...new Set(data.items.flatMap((item) => item.regions).filter((region) => !names.has(region))),
  ]
  if (unknown.length > 0) {
    throw new Error(
      `${props.fileData.relativePath}: 태그 표시 이름 파일이 없는 구역이다: ${unknown.join(", ")}`,
    )
  }
  const tree = props.tree as HastRoot
  const fileOrder = new Map(data.items.map((item, i) => [item, i]))
  const cards = byDate(data.items, "newest").map((item) =>
    card(
      item,
      fileOrder.get(item)!,
      names,
      nodesInLines(tree, item.summary.start, item.summary.end),
      props.cfg.locale,
    ),
  )
  const issues = buildIssues(props.allFiles)
  const counts = new Map([...issues].map(([week, { issue }]) => [week, issue.items.length]))
  const neighbors = issueNeighbors([...issues.keys()], data.week)
  const filters = issueFilters(data.items, regionOrder(props.allFiles), [...names.keys()])
  return {
    type: "root",
    children: [
      issueHead(props, data.week, neighbors),
      toolbar(filters, names, data.items.length),
      el("div", { className: ["news-cards"] }, cards),
      el("p", { className: ["news-empty"], hidden: true }, [text("조건에 맞는 소식이 없습니다.")]),
      issuePager(props, neighbors, counts),
    ],
  }
}

// RSS 아이콘. Tabler Icons의 rss(MIT)다.
const rssIcon = (): Element =>
  el(
    "svg",
    {
      className: ["news-feed-icon"],
      viewBox: "0 0 24 24",
      ariaHidden: "true",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    [
      el("path", { d: "M5 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }),
      el("path", { d: "M4 4a16 16 0 0 1 16 16" }),
      el("path", { d: "M4 11a9 9 0 0 1 9 9" }),
    ],
  )

// news/ 색인. 제목 아래에 주간 소식 피드 링크와 지난 호 목록을 둔다(본문은 비워 둔다, 소유자 결정 #419). 목록은
// 대문의 타임라인과 같은 꼴로, 달마다 마디와 소제목(2026년 10월)을 두고 그 아래에 주차 역순으로 주차, 기간, 소식
// 수를 보인다. 소제목의 해와 같은 해의 날짜는 연도를 뺀다. 달은 본문의 절(plugins/collapsible-sections)처럼 펼친
// <details>로 감싸 소제목을 눌러 접고 편다. 접은 상태는 저장하지 않는다.
function indexTree(props: QuartzComponentProps): HastRoot {
  const issues = buildIssues(props.allFiles)
  const months = indexMonths([...issues.keys()]).flatMap(({ month, weeks }) => {
    const year = Number(month.slice(0, 4))
    const heading = `${year}년 ${Number(month.slice(5))}월`
    const rows = weeks.map((week) => {
      const { file, issue } = issues.get(week)!
      return el("li", {}, [
        el(
          "a",
          {
            href: resolveRelative(props.fileData.slug!, file.slug!),
            className: ["internal", "news-index-week"],
          },
          // 달 소제목에 연도가 있어 주차만 쓴다(같은 해를 기준으로 주면 연도를 뺀다)
          [text(weekLabel(week, week))],
        ),
        el("span", { className: ["news-index-meta"] }, [
          ...periodTimes(week, props.cfg.locale, year),
          el("span", { className: ["news-card-sep"], ariaHidden: "true" }, [text("·")]),
          text(`${issue.items.length}건`),
        ]),
      ])
    })
    return [
      el("details", { className: ["news-month"], open: true }, [
        el("summary", {}, [
          el("h2", { id: month, className: ["news-index-month"] }, [text(heading)]),
        ]),
        el("ul", { className: ["news-index"] }, rows),
      ]),
    ]
  })
  const feed = el("p", { className: ["news-feed"] }, [
    // 주간 소식 피드의 경로는 plugins/feeds의 NEWS_FEED다
    el("a", { href: `${pathToRoot(props.fileData.slug!)}/news/index.xml`, dataRouterIgnore: "" }, [
      rssIcon(),
      text("RSS"),
    ]),
  ])
  const list =
    months.length > 0
      ? [el("div", { className: ["news-archive"] }, months)]
      : [el("p", {}, [text("아직 주간 소식이 없다.")])]
  const tree = props.tree as HastRoot
  return { ...tree, children: [...tree.children, feed, ...list] }
}

// 소식 목록의 모양이다.
// - 항목 사이는 대문 구역 표의 행 선과 같은 1px --lightgray 줄로 가르고, 목록 위아래에도 긋는다. 테두리 상자는
//   두지 않는다.
// - 왼쪽에 글, 오른쪽에 이미지를 두고, 좁은 화면에서는 이미지를 글 위로 올린다. 이미지는 잘라 채우고
//   (object-fit: cover) 비율을 고정해 항목 높이가 원문마다 들쭉날쭉하지 않다. 모서리는 사이트의 5px다.
// - 구역 칩은 본문 태그(note-properties의 .tag-link)와 같은 꼴이다. 모서리 3px, 같은 여백에, 바탕은 구역 색을
//   옅게 깔고 글자는 구역 색으로 쓴다. 대비 하한은 docs/palette.md의 "구역 칩"이다.
// - 첫 줄은 칩 묶음과 "매체 · 발행일"이다. 칩끼리는 좁게, 칩 묶음과 매체 사이는 넓게 띄운다. 매체와 날짜는
//   보조 글자색이다.
// - 정렬·거르기 줄은 목록 위에 둔다. 거르기 칩은 카드의 칩과 같은 꼴의 버튼이고, 주요 칩 뒤만 넓게 띄운다.
//   아무것도 고르지 않으면 모든 칩이 카드의 칩과 같고, 하나라도 고르면 고른 칩은 제 색으로 채우고 나머지는 보조
//   글자색과 1px --lightgray 테두리로 물린다. 고르지 않은 칩에 올리면 바탕은 두고 테두리와 글자를 구역 색으로
//   바꾼다. 바탕을 진하게 하지 않는 까닭은 docs/palette.md의 구역 칩 바탕 메모에 있다.
// - 칩 줄 아래의 상태 줄은 왼쪽에 소식 수, 오른쪽에 정렬을 둔다. 늘 보여서 거를 때 목록이 움직이지 않는다. 칩
//   줄보다 목록 윗선에 가깝게 두어(글자 상자 기준 14px와 6px) 목록의 머리줄로 읽힌다(소유자 결정, #404). 글자는
//   대문 소식 칸 제목 줄의 링크("N건 모두 보기 · 지난 호")와 같은 꼴이고, 고른 정렬은 제목색으로 굵게 쓴다.
// - 거른 결과가 없을 때의 안내 줄은 아랫선을 두지 않는다. 바로 아래 페이지 끝의 hr과 두 겹이 된다.
// - 제목 아래 줄은 content-meta 자리의 기간과 오른쪽 끝의 이웃 호 링크이고, 둘은 기준선으로 맞춘다. 이웃 호
//   링크는 상태 줄의 정렬과 같은 보조 글자 꼴이다.
// - 이전·다음 링크와 지난 호 목록은 대문 최근 변경의 짜임(제목색 제목과 그 아래나 옆의 작은 보조 글자 줄)을
//   따른다(소유자 결정, #419). 보조 글자 줄(기간 · 건수)의 가운뎃점은 카드 첫 줄과 같은 간격이다. 이전·다음
//   링크는 1px --lightgray 테두리의 5px 상자이고, 갈 곳이 먼저 보이도록 주차를 굵게 쓴다. 올리면 테두리와
//   주차가 링크색이 된다. 지난 호 목록의 주차도 짧은 이름표라 굵게 써서 왼쪽 열이 목차처럼 훑어진다. 지난 호 목록은 대문 타임라인의
//   선과 마디를 그대로 쓰고, 달 소제목은 날짜 마디의 글자 꼴에 본문 절과 같은 꺾쇠를 붙인다. 주차 칸 폭을
//   고정해 기간이 한 열로 서고, 피드 줄과 첫 달 사이는 달과 달 사이와 같게 둔다. 줄이 한 줄씩 촘촘해, 달
//   소제목과 첫 줄 사이는 줄과 줄 사이보다 조금 넓게 띄워 소제목이 묶음 전체의 머리로 읽히게 한다.
// - 글자 대비는 docs/palette.md의 쌍에 든다. 구역 칩은 구역 칩, 고르지 않고 거를 때의 칩은 구역 이름, 고른 칩은
//   구역 이름과 강조색 위 글자(전경과 배경을 바꿔도 대비는 같다), 주요 칩은 내부 링크, 상태 줄은 보조 글자, 링크,
//   제목이다. 제목 아래 줄, 이전·다음 링크, 지난 호 목록, 피드 링크도 보조 글자, 링크, 제목 쌍만 쓴다. hover의
//   테두리와 타임라인의 선·마디는 글자가 아니다.
const CSS = `.news-tools {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.4rem;
}
.news-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.2rem;
}
.news-filter {
  border: 0;
  font-family: inherit;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}
.news-filter[data-featured] {
  margin-right: 0.6rem;
}
.news-filters.has-selection .news-filter {
  background-color: transparent;
  box-shadow: inset 0 0 0 1px var(--lightgray);
  color: var(--gray);
}
.news-filters .news-filter:not([aria-pressed="true"]):hover {
  box-shadow: inset 0 0 0 1px var(--region);
  color: var(--region);
}
.news-filters .news-filter[aria-pressed="true"] {
  background-color: var(--region);
  box-shadow: none;
  color: var(--light);
}
.news-filter-count {
  margin-left: 0.3em;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}
.news-status {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.4rem 1rem;
  color: var(--gray);
  font-size: 0.85em;
  line-height: 1;
  white-space: nowrap;
}
.news-sort {
  display: flex;
  gap: 0.4rem;
  margin-left: auto;
}
.news-tools-count {
  font-variant-numeric: tabular-nums;
}
.news-sort-option {
  padding: 0;
  border: 0;
  background: none;
  color: var(--gray);
  font: inherit;
  cursor: pointer;
}
.news-sort-option:hover {
  color: var(--secondary);
  text-decoration: underline;
}
.news-sort-option[aria-pressed="true"] {
  color: var(--dark);
  font-weight: 600;
  text-decoration: none;
  cursor: default;
}
.news-card[hidden],
.news-empty[hidden] {
  display: none;
}
.news-empty {
  margin: 0;
  padding: 1rem 0;
  color: var(--gray);
}
.news-cards {
  border-top: 1px solid var(--lightgray);
}
.news-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--lightgray);
}
.news-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.6rem;
  margin: 0;
  color: var(--gray);
  font-size: 0.85em;
}
.news-card-sep {
  margin: 0 0.35em;
}
.news-card-chips {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}
.news-chip {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  background-color: color-mix(in srgb, var(--region) 8%, transparent);
  color: var(--region);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}
.news-card-title {
  margin: 0.3rem 0 0.4rem;
  font-size: 1.05rem;
  line-height: 1.35;
}
.news-card-title a.news-card-link {
  color: var(--dark);
}
.news-card-title a.news-card-link:hover {
  color: var(--secondary);
  text-decoration: underline;
}
.news-card-summary > :first-child {
  margin-top: 0;
}
.news-card-summary > :last-child {
  margin-bottom: 0;
}
.news-card-image {
  display: block;
  width: 9rem;
  align-self: start;
  background-color: transparent;
  padding: 0;
}
.news-card-image img {
  display: block;
  width: 100%;
  aspect-ratio: 1.91;
  object-fit: cover;
  border-radius: 5px;
  margin: 0;
}
.news-card-image[hidden] {
  display: none;
}
@media (max-width: 800px) {
  .news-card {
    grid-template-columns: minmax(0, 1fr);
  }
  .news-card-image {
    order: -1;
    width: 100%;
  }
}
.news-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.25rem 1rem;
  margin: 0 0 1.5rem;
  color: var(--darkgray);
}
.news-period {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.news-nav {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  color: var(--gray);
  font-size: 0.85em;
  white-space: nowrap;
}
.news-nav a.news-nav-link,
.news-feed a {
  color: var(--gray);
  font-weight: 400;
}
.news-nav a.news-nav-link:hover,
.news-feed a:hover {
  color: var(--secondary);
  text-decoration: underline;
}
.news-pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding-top: 1.5rem;
}
.news-pager a.news-pager-link {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--lightgray);
  border-radius: 5px;
  color: var(--gray);
  font-weight: 400;
  line-height: 1.35;
  transition: border-color 0.2s ease;
}
.news-pager a.news-pager-link:hover {
  border-color: var(--secondary);
}
.news-pager-next {
  align-items: flex-end;
  text-align: right;
}
.news-pager-label {
  font-size: 0.75em;
}
.news-pager-week {
  color: var(--dark);
  font-size: 0.95em;
  font-weight: 600;
}
.news-pager-meta {
  font-size: 0.75em;
  font-variant-numeric: tabular-nums;
}
.news-pager a.news-pager-link:hover .news-pager-week {
  color: var(--secondary);
}
.news-feed {
  font-size: 0.85em;
}
.news-feed-icon {
  width: 0.95em;
  height: 0.95em;
  margin-right: 0.3em;
  vertical-align: -0.12em;
}
.news-archive {
  --rail: 1.1rem;
  --day-line: 1.5rem;
  position: relative;
  margin-top: 1rem;
  padding-left: var(--rail);
}
.news-archive::before {
  content: "";
  position: absolute;
  left: 0.3rem;
  top: calc(var(--day-line) / 2);
  bottom: 0.4rem;
  width: 1px;
  background-color: var(--lightgray);
}
.news-month {
  padding-bottom: 0.9rem;
}
.news-month > summary {
  position: relative;
  display: block;
  list-style: none;
  cursor: pointer;
  border-radius: 5px;
}
.news-month > summary::-webkit-details-marker {
  display: none;
}
.news-month > summary:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: 2px;
}
.news-month > summary::before {
  content: "";
  position: absolute;
  box-sizing: border-box;
  width: 7px;
  height: 7px;
  left: calc(0.3rem + 0.5px - var(--rail) - 3.5px);
  top: calc(var(--day-line) / 2 - 3.5px);
  border: 1.5px solid var(--secondary);
  border-radius: 50%;
  background-color: var(--light);
}
.news-archive h2.news-index-month {
  display: inline-block;
  margin: 0;
  color: var(--gray);
  font-size: 0.85em;
  font-weight: 600;
  line-height: var(--day-line);
}
.news-archive h2.news-index-month::after {
  content: "";
  display: inline-block;
  width: 0.9em;
  height: 0.9em;
  margin-left: 0.3rem;
  vertical-align: -0.12em;
  background-color: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    center / contain no-repeat;
  transition:
    transform 0.3s ease,
    background-color 0.2s ease;
}
.news-month > summary:hover h2.news-index-month {
  color: var(--secondary);
}
.news-month:not([open]) h2.news-index-month::after {
  transform: rotateZ(-90deg);
}
@media (prefers-reduced-motion: reduce) {
  .news-archive h2.news-index-month::after {
    transition: none;
  }
}
.news-archive ul.news-index {
  margin: 0;
  padding: 0.3rem 0 0;
  list-style: none;
}
.news-archive .news-index > li {
  display: grid;
  grid-template-columns: 4em minmax(0, 1fr);
  align-items: baseline;
  margin: 0;
  padding: 0.25rem 0;
  line-height: 1.35;
}
.news-archive a.news-index-week {
  justify-self: start;
  font-size: 0.95em;
  padding: 0;
  background-color: transparent;
  color: var(--dark);
  font-weight: 600;
}
.news-archive a.news-index-week:hover {
  color: var(--secondary);
  text-decoration: underline;
}
.news-index-meta {
  color: var(--gray);
  font-size: 0.75em;
  font-variant-numeric: tabular-nums;
}
`

// 원문 이미지를 불러오지 못한 카드는 이미지 칸을 숨긴다. 스크립트가 돌기 전에 이미 실패한 이미지도 있어
// 불러오기가 끝난 이미지의 크기도 본다.
//
// 정렬·거르기 줄의 버튼을 누르면 카드를 다시 늘어놓고 거른다. 순서는 byDate와 같이 발행일(data-date) 순이고 같은
// 날은 파일에 적은 순서(data-index)다. 고른 상태를 주소의 쿼리에 담고 이웃 호가 이어받는 규칙, ←/→ 키가
// 동작하지 않는 때는 docs/weekly-news.md의 사이트에 보이는 범위에 있다. 상태는 페이지를 그릴 때마다 주소의
// 쿼리에서 읽고, 바꿀 때마다 replaceState로 주소와 이웃 호 링크(data-news-nav)의 쿼리를 고친다. 사이트에 없는
// 구역은 쿼리에서 버린다. 키는 rel이 prev·next인 아래 링크를 누른다.
//
// SPA 이동은 본문을 새로 그리므로 nav 이벤트마다 다시 건다. 첫 불러오기에서는 setup과 nav가 모두 돌 수 있어,
// 이미 건 줄은 data-ready로 건너뛴다. SPA는 본문을 갈아 끼우지 않고 같은 자리의 요소를 고쳐 쓰므로(micromorph),
// 떠날 때(prenav) 처리기와 data-ready를 거둔다. 거두지 않으면 다음 호에서 옛 처리기가 옛 호의 카드로 목록을 다시
// 그린다. 거두는 일을 window.addCleanup에 맡기지 않는 까닭은, 페이지를 처음 불러올 때 이 스크립트가 SPA 라우터
// 스크립트보다 먼저 돌아 그 함수가 아직 없기 때문이다. 처리기는 한 벌만 두고, 새로 걸 때도 앞의 것을 거둔다.
const SCRIPT = `(() => {
  let controller = null

  function hide() {
    this.closest(".news-card-image")?.setAttribute("hidden", "")
  }

  function readState(regionButtons) {
    const params = new URLSearchParams(location.search)
    const known = new Set(regionButtons.map((button) => button.dataset.region))
    const regions = (params.get("region") ?? "").split(",").filter((region) => known.has(region))
    return {
      order: params.get("sort") === "oldest" ? "oldest" : "newest",
      regions: new Set(regions),
      featured: params.get("featured") === "1",
    }
  }

  // 구역은 칩 순서대로 쓴다. 구역 태그는 [a-z0-9-]라 기타만 인코딩된다.
  function queryOf(state, regionButtons) {
    const parts = []
    const regions = regionButtons
      .map((button) => button.dataset.region)
      .filter((region) => state.regions.has(region))
    if (regions.length > 0) parts.push("region=" + regions.map(encodeURIComponent).join(","))
    if (state.featured) parts.push("featured=1")
    if (state.order !== "newest") parts.push("sort=" + state.order)
    return parts.length > 0 ? "?" + parts.join("&") : ""
  }

  function setupTools(tools) {
    if (tools.dataset.ready !== undefined) return
    tools.dataset.ready = ""
    const list = tools.parentElement.querySelector(".news-cards")
    const empty = tools.parentElement.querySelector(".news-empty")
    const filters = tools.querySelector(".news-filters")
    const count = tools.querySelector(".news-tools-count")
    const cards = [...list.querySelectorAll(".news-card")]
    const regionButtons = [...tools.querySelectorAll(".news-filter[data-region]")]
    const state = readState(regionButtons)

    function render() {
      const sign = state.order === "newest" ? -1 : 1
      const sorted = [...cards].sort((a, b) =>
        a.dataset.date === b.dataset.date
          ? a.dataset.index - b.dataset.index
          : a.dataset.date < b.dataset.date ? -sign : sign,
      )
      let shown = 0
      for (const card of sorted) {
        const regions = card.dataset.regions.split(" ")
        const visible =
          (state.regions.size === 0 || regions.some((region) => state.regions.has(region))) &&
          (!state.featured || card.dataset.featured !== undefined)
        card.hidden = !visible
        if (visible) shown++
        list.append(card)
      }
      const filtering = state.regions.size > 0 || state.featured
      filters.classList.toggle("has-selection", filtering)
      const total = count.dataset.total + "건"
      count.textContent = filtering ? total + " 중 " + shown + "건" : total
      empty.hidden = shown > 0
      for (const button of tools.querySelectorAll(".news-filter")) {
        const pressed =
          button.dataset.featured !== undefined
            ? state.featured
            : state.regions.has(button.dataset.region)
        button.setAttribute("aria-pressed", String(pressed))
        button.hidden = button.dataset.count === "0" && !pressed
      }
      for (const button of tools.querySelectorAll(".news-sort-option")) {
        button.setAttribute("aria-pressed", String(button.dataset.order === state.order))
      }
      const search = queryOf(state, regionButtons)
      if (location.search !== search) {
        history.replaceState(history.state, "", location.pathname + search + location.hash)
      }
      for (const link of document.querySelectorAll("a[data-news-nav]")) link.search = search
    }

    controller?.abort()
    controller = new AbortController()
    function select(event) {
      const button = event.target.closest("button")
      if (!button) return
      if (button.dataset.order) state.order = button.dataset.order
      else if (button.dataset.featured !== undefined) state.featured = !state.featured
      else if (button.dataset.region) {
        const region = button.dataset.region
        if (!state.regions.delete(region)) state.regions.add(region)
      }
      render()
    }
    function move(event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
      if (event.defaultPrevented || event.isComposing) return
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      const focus = document.activeElement
      if (focus?.isContentEditable || focus?.closest?.("input, textarea, select")) return
      if (document.querySelector(".search-container.active")) return
      const rel = event.key === "ArrowLeft" ? "prev" : "next"
      const link = document.querySelector('.news-pager a[rel~="' + rel + '"]')
      if (!link) return
      event.preventDefault()
      link.click()
    }
    tools.addEventListener("click", select, { signal: controller.signal })
    document.addEventListener("keydown", move, { signal: controller.signal })
    render()
  }

  function setup() {
    for (const image of document.querySelectorAll(".news-card-image img")) {
      if (image.complete && image.naturalWidth === 0) hide.call(image)
      else image.addEventListener("error", hide, { once: true })
    }
    for (const tools of document.querySelectorAll(".news-tools")) setupTools(tools)
  }

  function teardown() {
    controller?.abort()
    controller = null
    for (const tools of document.querySelectorAll(".news-tools")) delete tools.dataset.ready
  }

  setup()
  document.addEventListener("nav", setup)
  document.addEventListener("prenav", teardown)
})()
`

const WeeklyNewsBody = () => {
  const Body = ContentBody() as QuartzComponent
  const Component: QuartzComponent = (props: QuartzComponentProps) => {
    if (props.tree.type !== "root") return Body(props)
    // 트리를 새로 만들어 넘긴다. 원래 트리를 고치면 다시 그릴 때(--serve) 목록이 거듭 붙는다.
    if (props.fileData.slug === INDEX_SLUG) return Body({ ...props, tree: indexTree(props) })
    const data = newsOf(props.fileData)
    return data ? Body({ ...props, tree: issueTree(props, data) }) : Body(props)
  }
  Component.css = CSS
  return Component
}

const WeeklyNews = () => ({
  // transformer: 주간 소식 파일을 읽어 데이터를 두고, 제목을 파일 이름에서 만들어 프론트매터에 넣는다. 제목을
  // 쓰는 탭 제목, 검색, 지난 호 목록이 모두 같은 꼴을 본다. 이 플러그인이 도는 순서는 quartz.config.yaml의
  // order에 있다. 형식을 어기면 그 파일의 처리를 실패시켜 빌드를 멈춘다.
  name: "WeeklyNews",
  markdownPlugins() {
    return [
      () => (_tree: MdastRoot, file: VFile) => {
        const slug = String(file.data.slug ?? "")
        if (!isIssue(slug)) return
        const week = String(file.data.relativePath ?? "")
          .slice(NEWS_PREFIX.length)
          .replace(/\.md$/, "")
        const { items, errors } = parseWeeklyNews(week, String(file.value))
        if (errors.length > 0) {
          const lines = errors.map((e) => `${e.line}: ${e.message}`).join("; ")
          throw new Error(`주간 소식 형식 오류(docs/weekly-news.md): ${lines}`)
        }
        file.data.weeklyNews = { week, items, period: weekDays(week) } as WeeklyNewsData
        file.data.frontmatter = { ...file.data.frontmatter, title: issueTitle(week) } as never
      },
    ]
  },
  // 호와 지난 호 목록의 설명(메타 설명과 피드)과 호의 검색 본문을 정한다. description 플러그인이 본문
  // 전체에서 만든 값을 덮어쓴다(순서는 quartz.config.yaml). 검색 본문은 소식 항목마다 원어 제목과 요약이다.
  // 설명을 프론트매터가 아닌 vfile 데이터에 두어 호 페이지에 속성 칸(note-properties)이 생기지 않는다. 두 값은
  // description 플러그인처럼 이스케이프한다.
  htmlPlugins(ctx: { cfg: { configuration: { locale: string } } }) {
    const locale = ctx.cfg.configuration.locale
    return [
      () => (tree: HastRoot, file: VFile) => {
        if (file.data.slug === INDEX_SLUG) {
          file.data.description = escapeHTML(INDEX_DESCRIPTION)
          return
        }
        const data = file.data.weeklyNews as WeeklyNewsData | undefined
        if (!data) return
        file.data.description = escapeHTML(issueDescription(data.week, data.items, locale))
        file.data.text = escapeHTML(
          data.items
            .map((item) =>
              [item.title, hastText(nodesInLines(tree, item.summary.start, item.summary.end))].join(
                " ",
              ),
            )
            .join(" "),
        )
      },
    ]
  },
  externalResources() {
    return { js: [{ loadTime: "afterDOMReady", contentType: "inline", script: SCRIPT }] }
  },
  // 페이지 타입: 주간 소식과 news/ 색인을 그린다. 대문, 태그 목록과 겹치지 않으므로 priority는 content-page
  // 보다 높기만 하면 된다.
  priority: 1,
  match: ({ slug }: { slug: string }) => isNews(slug),
  layout: "news",
  body: WeeklyNewsBody,
})

export default WeeklyNews
