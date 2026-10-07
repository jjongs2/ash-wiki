// ash-wiki: 대문(index)만 그리는 페이지 타입 로컬 플러그인이다. 대문의 구역 표(docs/engine.md 대문 절)에 빌드할
// 때 구역 색과 주제별 페이지 수를 붙인다.
//
// 계산 규칙은 순수 함수 frontPage 하나에 모은다. 지금은 페이지 목록을 받아 주제별 페이지 수를 돌려주고,
// 이번 주 소식과 최근 변경은 다른 티켓이 같은 함수에 더한다(#364).
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
import type { Element, ElementContent, Root } from "hast"
import { ContentBody } from "@quartz-community/content-page"
import type { QuartzComponent, QuartzComponentProps } from "../../quartz/components/types"
import type { QuartzPageTypePlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "front-page",
  displayName: "Front page",
  description: "대문의 구역 표에 구역 색과 주제별 페이지 수를 붙인다",
  version: "1.0.0",
  category: "pageType",
}

export interface FrontPagePage {
  slug: string
  title: string
  tags: string[]
}

/**
 * 대문에 그릴 값을 계산한다.
 * - 주제별 페이지 수: 주제 태그(<구역>/<주제>)마다 그 태그나 하위 태그를 단 페이지 수. 태그 목록 페이지가
 *   보이는 목록과 같다. 페이지 하나는 한 주제에 한 번만 세고, 여러 주제에 걸치면 주제마다 센다. 구역 태그만
 *   단 페이지는 어느 주제에도 세지 않는다. 태그 목록 페이지(tags/)와 대문은 세지 않는다.
 */
export function frontPage(input: { pages: FrontPagePage[] }): {
  topicCounts: Record<string, number>
} {
  const topicCounts: Record<string, number> = {}
  for (const page of input.pages) {
    if (page.slug === "index" || page.slug.startsWith("tags/")) continue
    const topics = new Set<string>()
    for (const tag of page.tags) {
      const [region, topic] = tag.split("/")
      if (topic) topics.add(`${region}/${topic}`)
    }
    for (const topic of topics) topicCounts[topic] = (topicCounts[topic] ?? 0) + 1
  }
  return { topicCounts }
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

const FrontPageBody = () => {
  const Body = ContentBody() as QuartzComponent
  const Component: QuartzComponent = (props: QuartzComponentProps) => {
    const pages = props.allFiles.map((file) => ({
      slug: file.slug ?? "",
      title: String(file.frontmatter?.title ?? ""),
      tags: (file.frontmatter?.tags ?? []) as string[],
    }))
    const { topicCounts } = frontPage({ pages })
    if (props.tree.type === "root") decorateRegionTable(props.tree as Root, topicCounts)
    return Body(props)
  }
  Component.css = CSS
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
