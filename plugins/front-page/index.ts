// ash-wiki: 대문(index)만 그리는 페이지 타입 로컬 플러그인이다. 대문의 구역 표에 빌드할 때 구역 색과 주제별
// 페이지 수를 붙이고, 본문 아래에 주간 소식과 최근 변경을 그린다. 대문의 배치는 docs/engine.md의 대문 절에
// 있다.
//
// 계산 규칙은 순수 함수 frontPage 하나에 모은다. 페이지 목록, 주간 소식 목록, 커밋 목록을 받아 주제별 페이지
// 수, 최신 호와 그 주요 소식, 최근 변경 묶음을 돌려준다. 주간 소식 목록은 weekly-news 플러그인이 주간 소식
// 파일마다 vfile 데이터(weeklyNews)에 둔 소식 항목에서 만든다. 커밋 목록은 그릴 때 content 폴더의 git 기록에서
// 읽는다(전체 기록과 시간대는 docs/deploy.md). 저장소 밖에서 빌드하면(콘텐츠 검사기의 픽스처) 최근 변경을
// 그리지 않는다.
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
import { formatDate, resolveRelative } from "@quartz-community/utils"
import type { QuartzComponent, QuartzComponentProps } from "../../quartz/components/types"
import type { QuartzPageTypePlugin } from "../../quartz/plugins/types"
import type { FullSlug } from "../../quartz/util/path"
import type { WeeklyNewsData } from "../weekly-news/index"

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

// 주간 소식 한 호. week는 ISO 주차(2026-w41)이고 slug는 news/<주차>다. items는 소식 항목의 앵커, 원어 제목,
// 한국어 제목(없으면 null), 구역(기타는 빈 목록), 발행일(YYYY-MM-DD), 주요 소식인지이고 파일에 적은 순서다.
export interface FrontPageIssue {
  slug: string
  week: string
  items: FrontPageNewsItem[]
}

export interface FrontPageNewsItem {
  id: string
  title: string
  koreanTitle: string | null
  regions: string[]
  date: string
  featured: boolean
}

// 최신 호. days는 주요 소식을 발행일마다 묶은 것으로, 최근 날부터다. items는 그 호의 소식 항목 모두다.
export type LatestNews = FrontPageIssue & { days: { day: string; items: FrontPageNewsItem[] }[] }

// 같은 날 들어온 묶음. day는 빌드의 시간대로 본 날짜(YYYY-MM-DD)이고, changes는 최근 것부터다.
export interface RecentDay {
  day: string
  changes: RecentChange[]
}

export const RECENT_CHANGES_LIMIT = 5

// 대문과 태그 목록 페이지는 주제 페이지로 세지 않는다
const isTopicPage = (slug: string) => slug !== "index" && !slug.startsWith("tags/")

// 최근 변경은 주간 소식(news/)도 바뀐 페이지로 세지 않는다
const isChangedPage = (slug: string) =>
  isTopicPage(slug) && slug !== "news" && !slug.startsWith("news/")

// 빌드의 시간대(TZ)로 본 날짜. 페이지 수정일과 같은 시간대다.
function localDay(time: number): string {
  const date = new Date(time)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * 대문에 그릴 값을 계산한다.
 * - 주제별 페이지 수: 주제 태그(<구역>/<주제>)마다 그 태그나 하위 태그를 단 페이지 수. 태그 목록 페이지가
 *   보이는 목록과 같다. 페이지 하나는 한 주제에 한 번만 세고, 여러 주제에 걸치면 주제마다 센다. 구역 태그만
 *   단 페이지는 어느 주제에도 세지 않는다. 태그 목록 페이지(tags/)와 대문은 세지 않는다.
 * - 최근 변경: `content:` 커밋을 제목 끝의 PR 번호(`(#N)`)로 묶는다. 번호가 없는 커밋은 따로 묶는다. 묶음의
 *   제목은 타입과 번호를 뗀 커밋 제목이고, 날짜는 묶음에서 가장 늦은 커밋의 시각이다. 바뀐 페이지는 지금
 *   있는 페이지 가운데 대문, 태그 목록, 주간 소식이 아닌 것만 세고, 그런 페이지가 없는 묶음은 뺀다. bib/처럼
 *   content 폴더 밖의 파일은 커밋 목록에 오지 않는다(readCommits).
 *   묶음은 날짜별로 모아 최근 날짜부터 준다. RECENT_CHANGES_LIMIT 묶음을 채운 날까지 주고, 그날은 끝까지 준다.
 *   날짜 하나의 묶음이 중간에서 잘려 그날 작업이 그것뿐인 것처럼 보이지 않게 한다.
 * - 최신 호: 주차가 가장 늦은 주간 소식이다. ISO 주차(2026-w41)는 연도 네 자리와 주 두 자리라 글자 순서가
 *   주차 순서와 같다(형식은 docs/weekly-news.md). 주요 소식만 발행일마다 묶어 최근 날부터 주고(최근 변경과
 *   같은 방향), 같은 날은 파일에 적은 순서를 지킨다. 주요 소식이 없는 호도 최신 호이고, 그때 묶음은 빈다.
 *   주간 소식이 없으면 null이다.
 */
export function frontPage(input: {
  pages: FrontPagePage[]
  news?: FrontPageIssue[]
  commits?: FrontPageCommit[]
}): {
  topicCounts: Record<string, number>
  latestNews: LatestNews | null
  recentChanges: RecentDay[]
} {
  const topicCounts: Record<string, number> = {}
  for (const page of input.pages) {
    if (!isTopicPage(page.slug)) continue
    const topics = new Set<string>()
    for (const tag of page.tags) {
      const [region, topic] = tag.split("/")
      if (topic) topics.add(`${region}/${topic}`)
    }
    for (const topic of topics) topicCounts[topic] = (topicCounts[topic] ?? 0) + 1
  }
  const latest = (input.news ?? []).reduce<FrontPageIssue | null>(
    (latest, issue) => (latest === null || issue.week > latest.week ? issue : latest),
    null,
  )
  return {
    topicCounts,
    latestNews: latest && { ...latest, days: newsDays(latest.items) },
    recentChanges: recentChanges(input.pages, input.commits ?? []),
  }
}

function newsDays(items: FrontPageNewsItem[]): LatestNews["days"] {
  const days = new Map<string, FrontPageNewsItem[]>()
  for (const item of items.filter((item) => item.featured)) {
    days.set(item.date, [...(days.get(item.date) ?? []), item])
  }
  return [...days.keys()]
    .sort()
    .reverse()
    .map((day) => ({ day, items: days.get(day)! }))
}

function recentChanges(pages: FrontPagePage[], commits: FrontPageCommit[]): RecentDay[] {
  const changedPages = new Set(pages.map((page) => page.slug).filter(isChangedPage))
  const bundles = new Map<
    string,
    { title: string; pr: number | null; time: number; date: string; slugs: Set<string> }
  >()
  commits.forEach((commit, i) => {
    const match = commit.subject.match(/^content: (.*?)(?: \(#(\d+)\))?$/)
    if (!match) return
    // 번호가 없는 커밋은 커밋마다 다른 키를 주어 묶지 않는다
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
      if (file.endsWith(".md") && changedPages.has(slug)) bundle.slugs.add(slug)
    }
  })
  const sorted = [...bundles.values()]
    .filter((bundle) => bundle.slugs.size > 0)
    .sort((a, b) => b.time - a.time)
  const days: RecentDay[] = []
  let count = 0
  for (const bundle of sorted) {
    const day = localDay(bundle.time)
    let last = days.at(-1)
    if (last?.day !== day) {
      if (count >= RECENT_CHANGES_LIMIT) break
      last = { day, changes: [] }
      days.push(last)
    }
    last.changes.push({
      title: bundle.title,
      pr: bundle.pr,
      date: bundle.date,
      pages: [...bundle.slugs].sort(),
    })
    count++
  }
  return days
}

// 구역 표의 모양이다. 표 머리(구역, 주제)는 스크린 리더에만 남기고 화면에서는 숨긴다. 표 위에 제목을 두지
// 않으므로, 구역 이름 앞의 점과 칩 모양이 열의 뜻을 대신한다.
// - 구역 이름은 구역 색(--region, 행마다 플러그인이 붙인다)으로 굵게 쓰고, 업스트림 내부 링크의 배경을 지운다. 이름
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
  vertical-align: 0.05em;
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

// 본문 아래 2단의 모양이다. 배치는 docs/engine.md의 대문 절에 있다.
// - 모바일 폭(800px 이하, quartz/styles/variables.scss의 $mobile)에서 1단으로 쌓을 때, 비어 있는 칸을 숨겨
//   그 자리의 틈을 없앤다.
// - 칸 제목은 본문 h2(1.4rem)보다 조금 작게, Backlinks 제목(1rem)보다 크게 두고, 페이지 제목처럼 자간을 좁힌다.
//   대문 본문에는 다른 제목이 없다.
// - 최근 변경은 타임라인이다. 왼쪽 세로선은 구역 표의 행 선과 같은 1px --lightgray이고, 날짜마다 링크색
//   테두리의 속 빈 마디를 날짜 글자 줄의 가운데에 둔다. 세로선은 첫 마디에서 목록 끝까지 내려가, 더 오래된
//   기록이 이어짐을 보인다. 마디와 세로선의 자리는 날짜 줄 높이(--day-line)와 들여쓰기(--rail)로 계산한다.
// - 항목이 서로 갈리도록 항목 사이는 띄우고, 꺾인 제목의 줄 사이는 좁힌다. 날짜 사이는 항목 사이보다 더 띄운다.
// - 묶음 하나는 GitHub의 PR 목록을 본뜬다. 첫 줄에 pull request 아이콘과 제목 링크, 그 아래 보조 글자 줄에
//   PR 번호와 쪽수를 둔다. 제목은 제목 글자색(--dark)의 보통 굵기로 쓰고, 마우스를 올리면 링크색
//   (--secondary)에 밑줄이 생긴다(GitHub의 Link--primary). 사이트 링크의 hover색(--tertiary)이 아니라
//   링크색으로 바뀌어야 링크임이 드러난다.
// - 아이콘은 제목 안의 인라인 요소라 첫 줄 글자에 맞춰 선다. 꺾인 줄은 내어쓰기(padding과 음수 text-indent)로
//   아이콘 오른쪽에서 시작한다. vertical-align은 첫 줄 한글의 가운데에 아이콘 가운데를 맞춘 값이다.
// - 날짜, PR 번호, 쪽수와 아이콘은 보조 글자색이고, 대비 하한은 docs/palette.md의 "보조 글자"다. 날짜는
//   굵게 쓴다.
// - 주간 소식도 같은 타임라인이다. 발행일마다 마디를 두고, 그 아래 주요 소식의 제목과, 제목 아래 작은 구역
//   칩을 둔다. 최근 변경의 제목과 보조 글자 줄과 같은 짜임이다. 칩의 꼴(.news-chip)은 주간 소식 플러그인
//   (plugins/weekly-news)의 CSS가 정하고, 여기서는 크기만 줄인다. 칸 제목 줄의 오른쪽에 "N건 모두 보기(그 호)
//   · 지난 호"를 링크색으로 두고, 마우스를 올리면 사이트 링크처럼 hover색(--tertiary)에 밑줄이 생긴다. 보조
//   글자색으로 두었을 때는 사용성 테스트 파일럿의 두 세션이 링크로 읽지 못했다. 둘 사이의 가운뎃점은 보조
//   글자색이다. 주요 소식이 없는 주는 타임라인 대신 보조 글자 한 줄을 둔다.
// - 칸 제목 줄은 최근 변경의 칸 제목과 높이가 같아야 두 칸의 첫 날짜 줄이 맞는다. 링크 문단에 사이트 공통
//   문단 줄 높이(글자 크기의 1.7배)가 걸리면 기준선 맞춤으로 제목 줄이 1.11px 높아지므로, 링크의 줄 높이를 글자
//   크기로 줄인다. 칸이 좁아 링크가 제목 옆에 들지 않으면(창 폭 850px쯤 아래) 링크를 제목 아래 줄로 내리고, 링크 글자는
//   꺾지 않는다. 사이트 링크 규칙이 white-space를 normal로 걸어 링크에도 nowrap을 건다.
// - 칩은 바탕이 상자 맨 위에서 시작해, 같은 여백이면 최근 변경의 보조 글자 줄보다 제목에 붙어 보이고 행도
//   길어진다. 그래서 대문의 칩은 글자와 줄 높이를 줄이고 위 여백을 넓혀, 행 높이를 보조 글자 줄과 비슷하게
//   맞춘다(소유자가 시안에서 골랐다).
// - 제목과 칩 묶음 사이의 여백은 `li >` 선택자로 건다. 업스트림의 `.page article li > *`가 같은 레이어
//   (quartz-base)에서 margin-top을 0으로 두어, 클래스 하나짜리 선택자로는 구체성에서 진다.
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
  font-size: 1.3rem;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
}
.front-timeline {
  --rail: 1.1rem;
  --day-line: 1.5rem;
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0 0 0 var(--rail);
}
.front-timeline::before {
  content: "";
  position: absolute;
  left: 0.3rem;
  top: calc(var(--day-line) / 2);
  bottom: 0.4rem;
  width: 1px;
  background-color: var(--lightgray);
}
.front-timeline ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.front-timeline li {
  margin: 0;
}
li.front-day {
  position: relative;
  padding-bottom: 0.9rem;
}
li.front-day::before {
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
li.front-day > time {
  display: block;
  line-height: var(--day-line);
  color: var(--gray);
  font-size: 0.85em;
  font-weight: 600;
}
li.front-day li {
  padding: 0.4rem 0;
  line-height: 1.35;
}
.front-change-title {
  --icon-indent: calc(0.85em + 0.5rem);
  display: block;
  padding-left: var(--icon-indent);
  text-indent: calc(-1 * var(--icon-indent));
}
.front-change-icon {
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  margin-right: 0.5rem;
  vertical-align: -0.13em;
  fill: var(--gray);
}
.front-recent a.front-change-link {
  color: var(--dark);
  font-weight: 400;
}
.front-recent a.front-change-link:hover {
  color: var(--secondary);
  text-decoration: underline;
}
.front-change-meta {
  display: block;
  margin-top: 0.1rem;
  text-indent: 0;
  color: var(--gray);
  font-size: 0.8em;
  font-variant-numeric: tabular-nums;
}
.front-news-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.25rem 1rem;
  margin-bottom: 0.5rem;
}
.front-columns .front-news-head h2 {
  margin: 0;
}
.front-news-links {
  display: flex;
  gap: 0.4rem;
  margin: 0;
  color: var(--gray);
  font-size: 0.85em;
  line-height: 1;
  white-space: nowrap;
}
.front-news a.front-news-action {
  color: var(--secondary);
  font-weight: 400;
  white-space: nowrap;
}
.front-news a.front-news-action:hover {
  color: var(--tertiary);
  text-decoration: underline;
}
.front-news a.front-news-link:hover {
  color: var(--secondary);
  text-decoration: underline;
}
.front-news a.front-news-link {
  color: var(--dark);
  font-weight: 400;
}
.front-news-empty {
  margin: 0;
  color: var(--gray);
  font-size: 0.85em;
}
.front-news li > .front-news-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  margin-top: 0.25rem;
}
.front-news-chips .news-chip {
  font-size: 0.65rem;
  line-height: 1.2;
}
`

const el = (
  tagName: string,
  properties: Element["properties"],
  children: ElementContent[] = [],
): Element => ({ type: "element", tagName, properties, children })
const text = (value: string): ElementContent => ({ type: "text", value })

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
          const count = String(topicCounts[`${region}/${topic}`] ?? 0)
          link.children.push(el("span", { className: ["front-count"] }, [text(count)]))
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

// 묶음 제목이 링크하는 PR의 주소. 저장소가 비공개인 동안 독자에게는 404다(#366의 소유자 결정).
const PULL_URL = "https://github.com/jjongs2/ash-wiki/pull/"

// GitHub의 pull request 아이콘. Primer Octicons 19.40.0(MIT)의 git-pull-request-16 경로를 그대로 옮겼다.
const pullRequestIcon = (): Element =>
  el("svg", { ariaHidden: "true", className: ["front-change-icon"], viewBox: "0 0 16 16" }, [
    el("path", {
      d: "M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z",
    }),
  ])

// 주간 소식. 최신 호의 주요 소식을 발행일마다 타임라인의 마디 아래에 둔다. 제목은 한국어 제목이고, 없으면(지난
// 호) 원어 제목이다. 제목은 같은 탭에서 호의 그 소식 항목(카드의 앵커)으로 가고, 원문 링크와 요약은 그 카드에
// 있다. 나머지 소식 항목은 제목 줄의 "N건 모두 보기"로 그 호에서 본다. 칩의 이름은 구역의 표시 이름이고, 기타는
// 기타 칩 하나다.
export function newsColumn(
  issue: LatestNews,
  regionNames: Map<string, string>,
  locale: string,
): ElementContent[] {
  const issueHref = resolveRelative("index" as FullSlug, issue.slug as FullSlug)
  const day = (value: string) =>
    el("time", { dateTime: value }, [text(formatDate(new Date(`${value}T00:00:00`), locale))])
  // 칩은 weekly-news의 regionChips와 같은 마크업이다. 빌드는 로컬 플러그인을 type stripping으로 불러와 상대
  // import에 .ts 확장자가 있어야 하는데 tsconfig가 그 꼴을 받지 않아, 플러그인끼리는 타입만 가져온다.
  const chip = (region: string | null, name: string) =>
    el(
      "span",
      {
        className: ["news-chip"],
        style: `--region: var(--region-${region ?? "other"}, var(--region-other))`,
      },
      [text(name)],
    )
  const row = (item: FrontPageNewsItem) =>
    el("li", {}, [
      el("a", { href: `${issueHref}#${item.id}`, className: ["front-news-link"] }, [
        text(item.koreanTitle ?? item.title),
      ]),
      el(
        "span",
        { className: ["front-news-chips"] },
        item.regions.length === 0
          ? [chip(null, "기타")]
          : item.regions.map((region) => chip(region, regionNames.get(region) ?? region)),
      ),
    ])
  return [
    el("div", { className: ["front-news-head"] }, [
      el("h2", { id: "주간-소식" }, [text("주간 소식")]),
      el("p", { className: ["front-news-links"] }, [
        el("a", { href: issueHref, className: ["front-news-action"] }, [
          text(`${issue.items.length}건 모두 보기`),
        ]),
        el("span", { ariaHidden: "true" }, [text("·")]),
        el(
          "a",
          {
            href: resolveRelative("index" as FullSlug, "news/index" as FullSlug),
            className: ["front-news-action"],
          },
          [text("지난 호")],
        ),
      ]),
    ]),
    issue.days.length === 0
      ? el("p", { className: ["front-news-empty"] }, [text("이번 주는 주요 소식이 없습니다.")])
      : el(
          "ul",
          { className: ["front-timeline"] },
          issue.days.map(({ day: value, items }) =>
            el("li", { className: ["front-day"] }, [day(value), el("ul", {}, items.map(row))]),
          ),
        ),
  ]
}

// 본문 아래 2단. 왼쪽은 주간 소식이고 오른쪽이 최근 변경이다. 어느 한쪽이 없으면 그 칸은 비워 둔다.
// 최근 변경은 날짜마다 타임라인의 마디 하나를 두고, 그 아래 묶음마다 PR 아이콘과 제목, 그 아래 줄에 PR 번호와
// 쪽수를 둔다. 제목은 PR로 링크하고 새 탭에서 연다. PR 번호가 없는 묶음은 아이콘 자리를 비우고 제목을
// 글자로만 두며, 쪽수만 적는다.
function frontColumns(news: ElementContent[], days: RecentDay[], locale: string): Element {
  const row = (change: RecentChange) => {
    const count = `${change.pages.length}쪽`
    const meta = el("span", { className: ["front-change-meta"] }, [
      text(change.pr === null ? count : `#${change.pr} · ${count}`),
    ])
    return el("li", {}, [
      el(
        "span",
        { className: ["front-change-title"] },
        change.pr === null
          ? [el("span", { className: ["front-change-icon"] }), text(change.title), meta]
          : [
              pullRequestIcon(),
              el(
                "a",
                {
                  href: `${PULL_URL}${change.pr}`,
                  className: ["front-change-link"],
                  target: "_blank",
                  rel: ["noopener", "noreferrer"],
                },
                [text(change.title)],
              ),
              meta,
            ],
      ),
    ])
  }
  // 날짜 글은 day의 0시(빌드의 시간대)로 만들어, 묶을 때 쓴 날짜와 늘 같다
  const timeline = days.map(({ day, changes }) =>
    el("li", { className: ["front-day"] }, [
      el("time", { dateTime: day }, [text(formatDate(new Date(`${day}T00:00:00`), locale))]),
      el("ul", {}, changes.map(row)),
    ]),
  )
  const recent =
    days.length === 0
      ? []
      : [
          el("h2", { id: "최근-변경" }, [text("최근 변경")]),
          el("ul", { className: ["front-timeline"] }, timeline),
        ]
  return el("div", { className: ["front-columns"] }, [
    el("section", { className: ["front-news"] }, news),
    el("section", { className: ["front-recent"] }, recent),
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
    const news: FrontPageIssue[] = []
    const regionNames = new Map<string, string>()
    for (const file of props.allFiles) {
      const data = file.weeklyNews as WeeklyNewsData | undefined
      if (data) {
        news.push({
          slug: file.slug ?? "",
          week: data.week,
          items: data.items.map(({ id, title, koreanTitle, regions, date, featured }) => ({
            id,
            title,
            koreanTitle,
            regions,
            date,
            featured,
          })),
        })
      }
      const tag = file.slug?.startsWith("tags/") ? file.slug.slice("tags/".length) : ""
      if (tag && tag !== "index" && !tag.includes("/"))
        regionNames.set(tag, String(file.frontmatter?.title ?? tag))
    }
    const commits = readCommits(props.ctx.argv.directory)
    const { topicCounts, latestNews, recentChanges } = frontPage({ pages, news, commits })
    if (props.tree.type !== "root") return Body(props)
    const tree = props.tree as Root
    decorateRegionTable(tree, topicCounts)
    if (latestNews === null && recentChanges.length === 0) return Body(props)
    // 트리를 새로 만들어 붙인다. 원래 트리에 붙이면 다시 그릴 때(--serve) 2단이 거듭 붙는다.
    const newsContent =
      latestNews === null ? [] : newsColumn(latestNews, regionNames, props.cfg.locale)
    const columns = frontColumns(newsContent, recentChanges, props.cfg.locale)
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
