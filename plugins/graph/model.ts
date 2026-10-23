// ash-wiki: 그래프에 그릴 노드와 선을 계산하는 순수 함수다. 클라이언트 스크립트(script.js)가 contentIndex의
// 페이지 목록으로 부르고, 테스트(model.test.ts)가 seam으로 본다. 스크립트는 esbuild로 이 파일을 묶어 브라우저에
// 싣는다(index.ts). 그래서 이 파일은 다른 모듈을 불러오지 않는다.

export interface GraphPage {
  slug: string
  title: string
  tags: string[]
  links: string[]
}

export interface GraphNode {
  // 페이지 노드는 페이지 slug, 주제 노드는 그 주제의 태그 목록 slug(tags/<구역>/<주제>)다.
  id: string
  kind: "page" | "topic"
  text: string
  // 구역 색을 고르는 구역. 태그가 없는 페이지는 null이다.
  region: string | null
  // 노드가 대표하는 페이지 수. 페이지 노드는 1이다.
  pages: number
}

export interface GraphLink {
  source: string
  target: string
  // 두 노드가 대표하는 페이지 사이의 링크 수. 방향은 따지지 않는다.
  weight: number
}

export type GraphView =
  // 현재 페이지에서 링크를 depth번 따라간 페이지들
  | { kind: "local"; current: string; depth: number }
  // 주제 노드들. expanded의 주제는 그 주제의 페이지 노드로 펼친다.
  | { kind: "global"; expanded: string[] }

// 그래프에 오르는 페이지다. 태그 목록 페이지와 주간 소식(news/)은 노드가 아니다.
const isWikiPage = (slug: string) => !slug.startsWith("tags/") && !slug.startsWith("news/")

// 페이지의 구역은 첫 태그 경로의 첫 마디다(docs/palette.md 구역 색 절).
const regionOf = (page: GraphPage) => page.tags[0]?.split("/")[0] ?? null

// global graph에서 페이지가 드는 주제 노드의 id. 주 태그(첫 태그)의 주제 하나이고, 보조 태그는 쓰지 않는다.
// 주 태그가 구역뿐이면 null이라 global graph에 나오지 않는다. 페이지를 한 번씩만 세야 펼쳤을 때 한 페이지가
// 두 노드에 겹치지 않고, 탐색기의 위치나 구역 색과 기준이 같다(#369). 보조 태그까지 세는 대문의 주제별 페이지
// 수(plugins/front-page)와는 그래서 다르다.
function topicOf(page: GraphPage): string | null {
  const [region, topic] = (page.tags[0] ?? "").split("/")
  return topic ? `tags/${region}/${topic}` : null
}

const pageNode = (page: GraphPage): GraphNode => ({
  id: page.slug,
  kind: "page",
  text: page.title,
  region: regionOf(page),
  pages: 1,
})

// 페이지 사이의 링크를 대표 노드 사이의 선으로 모은다. 같은 노드 안의 링크와 대표 노드가 없는 페이지의 링크는
// 버린다.
function collectLinks(
  pages: Map<string, GraphPage>,
  representatives: (slug: string) => string[],
): GraphLink[] {
  const links = new Map<string, GraphLink>()
  for (const page of pages.values()) {
    for (const target of new Set(page.links)) {
      if (!pages.has(target)) continue
      for (const source of representatives(page.slug)) {
        for (const other of representatives(target)) {
          if (source === other) continue
          const key = [source, other].sort().join("\n")
          const link = links.get(key)
          if (link) link.weight++
          else links.set(key, { source, target: other, weight: 1 })
        }
      }
    }
  }
  return [...links.values()]
}

function localGraph(pages: Map<string, GraphPage>, current: string, depth: number) {
  if (!pages.has(current)) return { nodes: [], links: [] }
  const links = collectLinks(pages, (slug) => [slug])
  const seen = new Set([current])
  let frontier = [current]
  for (let d = 0; d < depth && frontier.length > 0; d++) {
    const next: string[] = []
    for (const link of links) {
      for (const [from, to] of [
        [link.source, link.target],
        [link.target, link.source],
      ]) {
        if (frontier.includes(from) && !seen.has(to)) {
          seen.add(to)
          next.push(to)
        }
      }
    }
    frontier = next
  }
  return {
    nodes: [...seen].map((slug) => pageNode(pages.get(slug)!)),
    links: links.filter((link) => seen.has(link.source) && seen.has(link.target)),
  }
}

// 펼친 주제에 든 페이지는 자기 페이지 노드가 대표하고, 나머지 페이지는 자기 주제 노드가 대표한다. 펼친 주제는
// 노드로 남지 않는다. 주제 노드의 크기(pages)는 펼침과 무관하게 그 주제에 든 페이지 수다.
function globalGraph(
  pages: Map<string, GraphPage>,
  titles: Map<string, string>,
  expanded: Set<string>,
) {
  const isExpanded = (page: GraphPage) => expanded.has(topicOf(page) ?? "")
  const representatives = (slug: string) => {
    const page = pages.get(slug)!
    const topic = topicOf(page)
    if (topic === null) return []
    return isExpanded(page) ? [slug] : [topic]
  }
  const topics = new Map<string, GraphNode>()
  const pageNodes: GraphNode[] = []
  for (const page of pages.values()) {
    const id = topicOf(page)
    if (id === null) continue
    if (isExpanded(page)) pageNodes.push(pageNode(page))
    const topic = topics.get(id)
    if (topic) topic.pages++
    else
      topics.set(id, {
        id,
        kind: "topic",
        text: titles.get(id) ?? id.slice("tags/".length),
        region: id.split("/")[1],
        pages: 1,
      })
  }
  const topicNodes = [...topics.values()].filter((topic) => !expanded.has(topic.id))
  return { nodes: [...topicNodes, ...pageNodes], links: collectLinks(pages, representatives) }
}

/**
 * 그래프에 그릴 노드와 선을 계산한다.
 * - local: 현재 페이지에서 링크를 depth번 따라간 페이지 노드와, 그 사이의 선. 태그 노드는 없다.
 * - global: 주제 노드와, 주제 사이의 선. 페이지는 주 태그의 주제 노드에 든다. 주제 노드의 크기는 페이지 수,
 *   선의 무게는 두 주제의 페이지 사이 링크 수다.
 * 태그 목록 페이지와 주간 소식은 어느 그래프에도 오르지 않는다.
 */
export function graph(
  input: GraphPage[],
  view: GraphView,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const pages = new Map(input.filter((page) => isWikiPage(page.slug)).map((p) => [p.slug, p]))
  if (view.kind === "local") return localGraph(pages, view.current, view.depth)
  const titles = new Map(input.map((page) => [page.slug, page.title]))
  return globalGraph(pages, titles, new Set(view.expanded))
}
