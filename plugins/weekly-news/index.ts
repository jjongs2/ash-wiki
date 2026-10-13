// ash-wiki: 주간 소식(content/news/<ISO 주차>.md)을 읽고 그리는 로컬 플러그인이다. 주간 소식은 위키 콘텐츠
// 밖의 페이지라(ADR 0015) 위키 규약을 따르지 않고, 형식은 docs/weekly-news.md에 있다.
//
// 형식의 정본은 순수 함수 parseWeeklyNews 하나다. 주간 소식 파일 하나(이름과 원본)를 받아 소식 항목 목록과
// 형식 오류를 돌려준다. 이 플러그인은 transformer이자 페이지 타입이다.
// - transformer: 주간 소식 파일을 parseWeeklyNews로 읽어 vfile 데이터(weeklyNews)에 둔다. 형식 오류가 있으면
//   빌드를 멈춘다. 대문(plugins/front-page)은 이 데이터에서 최신 호를 고른다.
// - 페이지 타입: 주간 소식 페이지를 발행일 순 목록으로 그리고, news/ 색인(content/news/index.md)의 본문 뒤에
//   지난 호 목록을 붙인다. 구역 칩의 이름은 태그 표시 이름 파일(tags/<구역>)의 제목이다.
//
// 요약은 마크다운이라 위키 링크를 쓸 수 있다. 카드는 요약을 다시 그리지 않고, 파이프라인이 그린 본문 트리에서
// 요약이 차지하는 원본 줄(parseWeeklyNews가 준다)의 요소를 옮겨 온다. 그래서 위키 링크는 다른 페이지와 같이
// 풀리고, Backlinks와 검색도 본문을 그대로 본다.
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
import { formatDate, resolveRelative } from "@quartz-community/utils"
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

// transformer가 주간 소식 파일의 vfile 데이터에 두는 값
export interface WeeklyNewsData {
  week: string
  items: NewsItem[]
}

const OTHER = "기타"
const FIELDS = {
  region: "구역",
  outlet: "매체",
  date: "발행일",
  image: "이미지",
  featured: "주요",
} as const
const FEATURED = "예"
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
    if (featured && featured.value !== FEATURED) {
      error(
        featured.line,
        `${FIELDS.featured}는 ${FEATURED}로만 쓰고, 주요 소식이 아니면 필드를 뺀다: ${featured.value}`,
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

/** 소식 항목을 발행일이 이른 것부터 늘어놓는다. 같은 날은 파일에 적은 순서를 지킨다. */
export function chronological(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

// ---------------------------------------------------------------------------------------------------
// 그리기

const el = (
  tagName: string,
  properties: Element["properties"],
  children: ElementContent[] = [],
): Element => ({ type: "element", tagName, properties, children })
const text = (value: string): ElementContent => ({ type: "text", value })

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

// 구역 칩. 구역마다 칩 하나이고 기타는 기타 칩 하나다. 칩의 꼴은 아래 CSS의 .news-chip이고, 대문의 주간 소식
// 칸(plugins/front-page)도 같은 클래스를 쓴다.
export function regionChips(regions: string[], names: Map<string, string>): Element[] {
  const chip = (region: string | null, name: string) =>
    el(
      "span",
      {
        className: ["news-chip"],
        style: `--region: var(--region-${region ?? "other"}, var(--region-other))`,
      },
      [text(name)],
    )
  return regions.length === 0
    ? [chip(null, OTHER)]
    : regions.map((region) => chip(region, names.get(region) ?? region))
}

function card(
  item: NewsItem,
  names: Map<string, string>,
  summary: ElementContent[],
  locale: string,
) {
  const date = formatDate(new Date(`${item.date}T00:00:00`), locale)
  const body = el("div", { className: ["news-card-body"] }, [
    el("p", { className: ["news-card-meta"] }, [
      el("span", { className: ["news-card-chips"] }, regionChips(item.regions, names)),
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
  return el("article", { className: ["news-card"], id: item.id }, [body, ...image])
}

// 주간 소식 한 호의 본문. 소식 항목을 발행일이 이른 것부터 한 목록으로 늘어놓는다(소유자 결정, #367).
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
  const cards = chronological(data.items).map((item) =>
    card(item, names, nodesInLines(tree, item.summary.start, item.summary.end), props.cfg.locale),
  )
  return { type: "root", children: [el("div", { className: ["news-cards"] }, cards)] }
}

// news/ 색인. 본문 뒤에 지난 호 목록을 붙인다. 주차 역순으로 호의 제목, 기간, 소식 수를 보인다.
function indexTree(props: QuartzComponentProps): HastRoot {
  const issues = props.allFiles
    .filter((file) => isIssue(file.slug ?? "") && newsOf(file))
    .sort((a, b) => newsOf(b)!.week.localeCompare(newsOf(a)!.week))
  const rows = issues.map((file) => {
    const { week, items } = newsOf(file)!
    const { start, end } = weekDays(week)
    const day = (value: string) => formatDate(new Date(`${value}T00:00:00`), props.cfg.locale)
    return el("li", {}, [
      el(
        "a",
        { href: resolveRelative(props.fileData.slug!, file.slug!), className: ["internal"] },
        [text(String(file.frontmatter?.title ?? week))],
      ),
      el("span", { className: ["news-index-meta"] }, [
        el("time", { dateTime: start }, [text(day(start))]),
        text(" ~ "),
        el("time", { dateTime: end }, [text(day(end))]),
        text(` · 소식 ${items.length}건`),
      ]),
    ])
  })
  const list =
    rows.length > 0
      ? el("ul", { className: ["news-index"] }, rows)
      : el("p", {}, [text("아직 주간 소식이 없다.")])
  const tree = props.tree as HastRoot
  return { ...tree, children: [...tree.children, list] }
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
const CSS = `.news-cards {
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
.news-index {
  padding-left: 1.2rem;
}
.news-index-meta {
  margin-left: 0.6rem;
  color: var(--gray);
  font-size: 0.85em;
}
`

// 원문 이미지를 불러오지 못한 카드는 이미지 칸을 숨긴다. 스크립트가 돌기 전에 이미 실패한 이미지도 있어
// 불러오기가 끝난 이미지의 크기도 본다. SPA 이동은 본문을 새로 그리므로 nav 이벤트마다 다시 건다.
const SCRIPT = `(() => {
  function hide() {
    this.closest(".news-card-image")?.setAttribute("hidden", "")
  }

  function setup() {
    for (const image of document.querySelectorAll(".news-card-image img")) {
      if (image.complete && image.naturalWidth === 0) hide.call(image)
      else image.addEventListener("error", hide, { once: true })
    }
  }

  setup()
  document.addEventListener("nav", setup)
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
  // 쓰는 탭 제목, 검색, 지난 호 목록이 모두 같은 꼴을 본다. frontmatter는 note-properties(order 5)가 읽으므로,
  // 이 플러그인은 기본 order(50)로 그 뒤에 돈다. 형식을 어기면 그 파일의 처리를 실패시켜 빌드를 멈춘다.
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
        file.data.weeklyNews = { week, items } as WeeklyNewsData
        file.data.frontmatter = { ...file.data.frontmatter, title: issueTitle(week) } as never
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
