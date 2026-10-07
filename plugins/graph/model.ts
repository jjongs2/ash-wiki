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
  id: string
  text: string
  // 구역 색을 고르는 구역. 태그가 없는 페이지는 null이다.
  region: string | null
}

export interface GraphLink {
  source: string
  target: string
  // 두 노드 사이의 링크 수. 방향은 따지지 않는다.
  weight: number
}

// 현재 페이지에서 링크를 depth번 따라간 페이지들. depth가 음수면 모든 페이지다.
export type GraphView = { kind: "local"; current: string; depth: number }

// 그래프에 오르는 페이지다. 태그 목록 페이지와 주간 소식(news/)은 노드가 아니다.
const isWikiPage = (slug: string) => !slug.startsWith("tags/") && !slug.startsWith("news/")

// 페이지의 구역은 첫 태그 경로의 첫 마디다(docs/palette.md 구역 색 절).
const regionOf = (page: GraphPage) => page.tags[0]?.split("/")[0] ?? null

const pageNode = (page: GraphPage): GraphNode => ({
  id: page.slug,
  text: page.title,
  region: regionOf(page),
})

// 페이지 사이의 링크를 방향 없이 모은다. 자기 자신으로 가는 링크와 그래프에 없는 페이지로 가는 링크는 버린다.
function collectLinks(pages: Map<string, GraphPage>): GraphLink[] {
  const links = new Map<string, GraphLink>()
  for (const page of pages.values()) {
    for (const target of new Set(page.links)) {
      if (target === page.slug || !pages.has(target)) continue
      const key = [page.slug, target].sort().join("\n")
      const link = links.get(key)
      if (link) link.weight++
      else links.set(key, { source: page.slug, target, weight: 1 })
    }
  }
  return [...links.values()]
}

function localGraph(pages: Map<string, GraphPage>, current: string, depth: number) {
  const links = collectLinks(pages)
  if (depth < 0) return { nodes: [...pages.values()].map(pageNode), links }
  if (!pages.has(current)) return { nodes: [], links: [] }
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

/**
 * 그래프에 그릴 노드와 선을 계산한다.
 * - local: 현재 페이지에서 링크를 depth번 따라간 페이지 노드와, 그 사이의 선. 태그 노드는 없다.
 * 태그 목록 페이지와 주간 소식은 그래프에 오르지 않는다.
 */
export function graph(
  input: GraphPage[],
  view: GraphView,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const pages = new Map(input.filter((page) => isWikiPage(page.slug)).map((p) => [p.slug, p]))
  return localGraph(pages, view.current, view.depth)
}
