// ash-wiki: 대문(index)만 그리는 페이지 타입 로컬 플러그인이다. 대문의 구역 표(docs/engine.md 대문 절)에 빌드할
// 때 구역 색과 주제별 페이지 수를 붙이고, 본문 아래 2단의 오른쪽에 최근 변경을 그린다. 왼쪽 칸은 이번 주
// 소식의 자리로, 그 티켓(#367)이 채울 때까지 비워 둔다.
//
// 계산 규칙은 순수 함수 frontPage 하나에 모은다. 페이지 목록과 커밋 목록을 받아 주제별 페이지 수와 최근 변경
// 묶음을 돌려주고, 이번 주 소식은 다른 티켓이 같은 함수에 더한다(#364). 커밋 목록은 그릴 때 content 폴더의
// git 기록에서 읽는다. 배포 빌드는 shallow clone이라 prebuild가 먼저 전체 기록을 받는다(docs/deploy.md).
// 저장소 밖에서 빌드하면(콘텐츠 검사기의 픽스처) 최근 변경을 그리지 않는다.
//
// 대문은 content-page 플러그인의 본문(ContentBody)을 그대로 쓰고, 그리기 전에 본문 트리만 고친다. 페이지 수에는
// 모든 페이지의 태그가 있어야 하는데, transformer는 파일마다 따로 돌아 다른 페이지를 모른다. 본문 컴포넌트는
// 그릴 때 allFiles를 받으므로 페이지 타입으로 대문만 가져온다. content-page(priority 0)보다 높은 priority로
// 대문을 먼저 잡고, 레이아웃은 content-page와 같은 content를 써서 사이드바와 머리말은 다른 페이지와 같다.
//
// 구역 색을 고르는 규칙은 docs/palette.md의 구역 색 절에 있다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
import { execFileSync } from "node:child_process"
import path from "node:path"
import type { Element, ElementContent, Root } from "hast"
import { ContentBody } from "@quartz-community/content-page"
import { formatDate } from "@quartz-community/utils"
import type { QuartzComponent, QuartzComponentProps } from "../../quartz/components/types"
import type { QuartzPageTypePlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "front-page",
  displayName: "Front page",
  description: "대문의 구역 표에 구역 색과 주제별 페이지 수를 붙이고 최근 변경을 그린다",
  version: "1.0.0",
  category: "pageType",
}

export interface FrontPagePage {
  slug: string
  title: string
  tags: string[]
}

// 커밋 하나. date는 ISO 8601 시각이고, files는 content 폴더 기준 경로(`can-frame.md`)다.
export interface FrontPageCommit {
  subject: string
  date: string
  files: string[]
}

// pr은 묶음의 PR 번호이고, 번호가 없는 커밋이면 null이다. pages는 바뀐 위키 페이지의 slug다.
export interface RecentChange {
  title: string
  pr: number | null
  date: string
  pages: string[]
}

export const RECENT_CHANGES_LIMIT = 5

// 대문, 태그 목록 페이지, 주간 소식(news/)은 위키 페이지가 아니라 세지 않는다
const isWikiPage = (slug: string) =>
  slug !== "index" && !slug.startsWith("tags/") && slug !== "news" && !slug.startsWith("news/")

/**
 * 대문에 그릴 값을 계산한다.
 * - 주제별 페이지 수: 주제 태그(<구역>/<주제>)마다 그 태그나 하위 태그를 단 페이지 수. 태그 목록 페이지가
 *   보이는 목록과 같다. 페이지 하나는 한 주제에 한 번만 세고, 여러 주제에 걸치면 주제마다 센다. 구역 태그만
 *   단 페이지는 어느 주제에도 세지 않는다. 태그 목록 페이지(tags/)와 대문은 세지 않는다.
 * - 최근 변경: `content:` 커밋을 제목 끝의 PR 번호(`(#N)`)로 묶는다. 번호가 없는 커밋은 따로 묶는다. 묶음의
 *   제목은 타입과 번호를 뗀 커밋 제목이고, 날짜는 묶음에서 가장 늦은 커밋의 시각이다. 바뀐 페이지는 지금
 *   있는 위키 페이지만 세고, 그런 페이지가 없는 묶음은 뺀다. 최근 날짜부터 RECENT_CHANGES_LIMIT 묶음까지 준다.
 *   bib/처럼 content 폴더 밖의 파일은 커밋 목록에 오지 않는다(readCommits).
 */
export function frontPage(input: { pages: FrontPagePage[]; commits?: FrontPageCommit[] }): {
  topicCounts: Record<string, number>
  recentChanges: RecentChange[]
} {
  const topicCounts: Record<string, number> = {}
  for (const page of input.pages) {
    if (!isWikiPage(page.slug)) continue
    const topics = new Set<string>()
    for (const tag of page.tags) {
      const [region, topic] = tag.split("/")
      if (topic) topics.add(`${region}/${topic}`)
    }
    for (const topic of topics) topicCounts[topic] = (topicCounts[topic] ?? 0) + 1
  }
  return { topicCounts, recentChanges: recentChanges(input.pages, input.commits ?? []) }
}

function recentChanges(pages: FrontPagePage[], commits: FrontPageCommit[]): RecentChange[] {
  const wikiPages = new Set(pages.map((page) => page.slug).filter(isWikiPage))
  const bundles = new Map<
    string,
    { title: string; pr: number | null; time: number; date: string; slugs: Set<string> }
  >()
  commits.forEach((commit, i) => {
    const match = commit.subject.match(/^content: (.*?)(?: \(#(\d+)\))?$/)
    if (!match) return
    const key = match[2] ? `#${match[2]}` : `commit ${i}`
    const time = Date.parse(commit.date)
    let bundle = bundles.get(key)
    if (!bundle) {
      const pr = match[2] ? Number(match[2]) : null
      bundle = { title: match[1], pr, time, date: commit.date, slugs: new Set() }
      bundles.set(key, bundle)
    } else if (time > bundle.time) {
      Object.assign(bundle, { title: match[1], time, date: commit.date })
    }
    for (const file of commit.files) {
      const slug = file.replace(/\.md$/, "")
      if (file.endsWith(".md") && wikiPages.has(slug)) bundle.slugs.add(slug)
    }
  })
  return [...bundles.values()]
    .filter((bundle) => bundle.slugs.size > 0)
    .sort((a, b) => b.time - a.time)
    .slice(0, RECENT_CHANGES_LIMIT)
    .map((bundle) => ({
      title: bundle.title,
      pr: bundle.pr,
      date: bundle.date,
      pages: [...bundle.slugs].sort(),
    }))
}

// 구역 표의 모양이다. 표 머리(구역, 주제)는 스크린 리더에만 남기고 화면에서는 숨긴다. 표 위에 제목을 두지
// 않으므로, 구역 이름 앞의 점과 칩 모양이 열의 뜻을 대신한다.
// - 구역 이름은 구역 색(--region, 행마다 플러그인이 붙인다)으로 굵게 쓰고, 내부 링크의 배경을 지운다. 이름
//   앞의 점도 같은 색이다. 대비 하한은 docs/palette.md의 "구역 이름"이다.
// - 주제 칩은 같은 태그 목록으로 가는 본문 페이지 속성 칸의 태그(note-properties의 .tag-link)와 같은 꼴이다.
//   모서리 3px, 같은 여백에, 마우스를 올리면 배경과 글자색이 뒤집힌다. 페이지 수는 보조 글자색으로 붙이고,
//   대비 하한은 docs/palette.md의 "주제 칩의 페이지 수"다.
// - 두 칸은 기준선으로 맞춘다. 구역 이름의 글자와 첫 줄 칩의 글자가 같은 기준선에 서고, 칩이 여러 줄로
//   꺾여도 구역 이름은 첫 줄에 맞는다. 점은 vertical-align으로 한글 글자 높이의 가운데에 둔다.
// - 마지막 행에도 아래 선을 긋는다. 업스트림은 마지막 행의 선을 지우는데, 대문에서는 표 바로 아래가 페이지
//   꼬리의 구분선(hr, 위 여백 2rem)이라, 선이 없으면 마지막 행이 그 구분선까지 늘어나 보인다.
// - 구역 이름은 한 줄로 두고 구역 칸은 그 폭만 차지한다. 링크에는 다른 규칙이 white-space를 normal로 걸어,
//   칸이 아니라 링크에 nowrap을 건다. 칩은 칸 안에서 줄을 바꿔, 폰 폭에서도 표가 가로로 넘치지 않는다.
const CSS = `.front-regions {
  width: 100%;
}
.front-regions thead {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.front-regions tbody tr:last-child {
  border-bottom: 1px solid var(--lightgray);
}
.front-regions td {
  vertical-align: baseline;
  padding-block: 0.5rem;
}
.front-regions td:first-child {
  width: 1%;
  min-width: 0;
}
.front-regions a.front-region-name {
  white-space: nowrap;
  color: var(--region);
  background-color: transparent;
  font-weight: 600;
  padding: 0;
}
.front-regions a.front-region-name::before {
  content: "";
  display: inline-block;
  width: 0.55em;
  height: 0.55em;
  margin-right: 0.45em;
  border-radius: 50%;
  background-color: currentColor;
  vertical-align: 0.08em;
}
.front-regions a.front-topic {
  display: inline-block;
  margin: 0.15rem 0.2rem 0.15rem 0;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  line-height: 1.4rem;
  white-space: nowrap;
}
.front-regions a.front-topic:hover {
  background-color: var(--secondary);
  color: var(--light);
}
.front-regions .front-count {
  margin-left: 0.4em;
  color: var(--gray);
  font-size: 0.85em;
  font-variant-numeric: tabular-nums;
}
.front-regions a.front-topic:hover .front-count {
  color: var(--light);
}
`

// 본문 아래 2단의 모양이다.
// - 두 칸은 같은 폭이고, 모바일 폭(800px 이하, quartz/styles/variables.scss의 $mobile)에서는 1단으로 쌓는다.
//   1단에서는 비어 있는 이번 주 소식 칸을 숨겨 그 자리의 틈을 없앤다.
// - 칸 제목은 본문 h2보다 작게, Backlinks 제목(1rem)보다 조금 크게 둔다. 대문 본문에는 다른 제목이 없다.
// - 묶음은 제목 한 줄과 그 아래 날짜·쪽수 한 줄이다. 칸이 좁아 한 줄에 두면 제목이 여러 줄로 꺾인다. 날짜와
//   쪽수는 보조 글자색이고, 대비 하한은 docs/palette.md의 "주제 칩의 페이지 수"와 같은 --gray다. 묶음
//   사이의 선은 구역 표의 행 선과 같다.
const COLUMNS_CSS = `.front-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
@media (max-width: 800px) {
  .front-columns {
    grid-template-columns: minmax(0, 1fr);
  }
  .front-columns > section:empty {
    display: none;
  }
}
.front-columns h2 {
  font-size: 1.15rem;
  margin: 0 0 0.5rem;
}
.front-recent > ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.front-recent > ul > li {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--lightgray);
}
.front-change-meta {
  color: var(--gray);
  font-size: 0.85em;
  font-variant-numeric: tabular-nums;
}
`

function elements(node: Root | Element, tagName: string): Element[] {
  const found: Element[] = []
  const walk = (parent: Root | Element) => {
    for (const child of parent.children) {
      if (child.type !== "element") continue
      if (child.tagName === tagName) found.push(child)
      walk(child)
    }
  }
  walk(node)
  return found
}

function addClass(element: Element, name: string) {
  const current = element.properties.className
  const names = Array.isArray(current) ? current : current ? [String(current)] : []
  element.properties.className = [...names, name]
}

// 태그 목록 링크(tags/<구역>, tags/<구역>/<주제>)의 태그. crawl-links 플러그인은 링크의 대상을 속성 이름
// "data-slug"로 그대로 둔다(hast의 dataSlug로 바꾸지 않는다).
function linkedTag(link: Element): string | null {
  const slug = link.properties["data-slug"]
  return typeof slug === "string" && slug.startsWith("tags/") ? slug.slice("tags/".length) : null
}

// 대문 본문에서 구역 링크가 든 표를 구역 표로 보고, 행에 구역 색을, 주제 칩에 페이지 수를 붙인다.
function decorateRegionTable(tree: Root, topicCounts: Record<string, number>) {
  for (const table of elements(tree, "table")) {
    let isRegionTable = false
    for (const row of elements(table, "tr")) {
      for (const link of elements(row, "a")) {
        const tag = linkedTag(link)
        if (!tag) continue
        const [region, topic] = tag.split("/")
        if (!topic) {
          isRegionTable = true
          addClass(link, "front-region-name")
          row.properties.style = `--region: var(--region-${region}, var(--region-other))`
        } else {
          addClass(link, "front-topic")
          const count: ElementContent = {
            type: "element",
            tagName: "span",
            properties: { className: ["front-count"] },
            children: [{ type: "text", value: String(topicCounts[`${region}/${topic}`] ?? 0) }],
          }
          link.children.push(count)
        }
      }
    }
    if (isRegionTable) addClass(table, "front-regions")
  }
}

// 최근 변경 묶음을 찾으려고 거슬러 읽는 커밋 수. content 폴더를 건드린 커밋만 센다.
const COMMIT_SCAN_LIMIT = 200

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: "pipe" })
}

// content 폴더를 건드린 최근 커밋. 경로는 content 폴더 기준이다(--relative).
function readCommits(directory: string): FrontPageCommit[] {
  const cwd = path.resolve(directory)
  try {
    git(cwd, ["rev-parse", "--is-inside-work-tree"])
  } catch {
    return []
  }
  const log = git(cwd, [
    "-c",
    "core.quotePath=false",
    "log",
    `--max-count=${COMMIT_SCAN_LIMIT}`,
    "--no-renames",
    "--name-only",
    "--relative",
    "--format=%x1e%cI%x1f%s",
    "--",
    ".",
  ])
  return log
    .split("\x1e")
    .filter(Boolean)
    .map((record) => {
      const [head = "", ...files] = record.split("\n")
      const [date = "", subject = ""] = head.split("\x1f")
      return { subject, date, files: files.filter(Boolean) }
    })
}

const el = (
  tagName: string,
  properties: Element["properties"],
  children: ElementContent[] = [],
): Element => ({ type: "element", tagName, properties, children })
const text = (value: string): ElementContent => ({ type: "text", value })

// 묶음 제목이 링크하는 PR의 주소. 저장소가 비공개인 동안 독자에게는 404다(#366의 소유자 결정).
const PULL_URL = "https://github.com/jjongs2/ash-wiki/pull/"

// 본문 아래 2단. 왼쪽은 이번 주 소식의 자리(#367), 오른쪽은 최근 변경이다. 묶음은 제목과 그 아래 날짜·쪽수의
// 두 줄이고, 제목은 PR로 링크한다. 본문의 외부 링크처럼 external로 두어 새 탭에서 연다. PR 번호가 없는
// 묶음은 제목을 글자로만 둔다.
function frontColumns(changes: RecentChange[], locale: string): Element {
  const items = changes.map((change) =>
    el("li", {}, [
      change.pr === null
        ? el("span", { className: ["front-change-title"] }, [text(change.title)])
        : el(
            "a",
            {
              href: `${PULL_URL}${change.pr}`,
              className: ["external", "front-change-title"],
              target: "_blank",
              rel: ["noopener", "noreferrer"],
            },
            [text(change.title)],
          ),
      el("span", { className: ["front-change-meta"] }, [
        el("time", { dateTime: change.date }, [text(formatDate(new Date(change.date), locale))]),
        text(` · ${change.pages.length}쪽`),
      ]),
    ]),
  )
  return el("div", { className: ["front-columns"] }, [
    el("section", { className: ["front-news"] }),
    el("section", { className: ["front-recent"] }, [
      el("h2", { id: "최근-변경" }, [text("최근 변경")]),
      el("ul", {}, items),
    ]),
  ])
}

const FrontPageBody = () => {
  const Body = ContentBody() as QuartzComponent
  const Component: QuartzComponent = (props: QuartzComponentProps) => {
    const pages = props.allFiles.map((file) => ({
      slug: file.slug ?? "",
      title: String(file.frontmatter?.title ?? ""),
      tags: (file.frontmatter?.tags ?? []) as string[],
    }))
    const commits = readCommits(props.ctx.argv.directory)
    const { topicCounts, recentChanges } = frontPage({ pages, commits })
    if (props.tree.type !== "root") return Body(props)
    const tree = props.tree as Root
    decorateRegionTable(tree, topicCounts)
    if (recentChanges.length === 0) return Body(props)
    // 트리를 새로 만들어 붙인다. 원래 트리에 붙이면 다시 그릴 때(--serve) 2단이 거듭 붙는다.
    const columns = frontColumns(recentChanges, props.cfg.locale)
    const withColumns: Root = { ...tree, children: [...tree.children, columns] }
    return Body({ ...props, tree: withColumns })
  }
  Component.css = CSS + COLUMNS_CSS
  return Component
}

const FrontPage: QuartzPageTypePlugin = () => ({
  name: "FrontPage",
  priority: 1,
  match: ({ slug }) => slug === "index",
  layout: "content",
  body: FrontPageBody,
})

export default FrontPage
