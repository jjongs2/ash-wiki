// ash-wiki: 탐색기를 폴더 대신 태그로 구역 › 주제 › 페이지 트리로 그리게 하는 로컬 플러그인이다.
// 트리를 만드는 규칙은 순수 함수 buildExplorerTree 하나에 모으고, 입력은 탐색기가 받는 contentIndex에서
// explorerInputs가 뽑는다. 구역과 주제의 이름은 태그 표시 이름 파일(content/tags/)의 제목, 구역 순서는
// 대문(index.md)의 목록 순서다. 그래서 새 태그는 표시 이름 파일과 대문만 고치면 트리에 따라온다.
//
// 탐색기(@quartz-community/explorer)는 브라우저에서 contentIndex로 폴더 트리를 짓고, 옵션의 filterFn,
// mapFn, sortFn을 문자열로 받아 new Function으로 돌린다. 이 플러그인은 두 순수 함수를 싣는 스크립트로
// 전역 window.explorerTree를 두고, quartz.config.yaml의 탐색기 옵션이 그것을 부른다.
// - filterFn: 모두 남긴다. 기본값은 tags 폴더를 빼는데, 표시 이름을 그 폴더의 항목에서 읽어야 한다.
// - mapFn: 뿌리에서 window.explorerTree가 뿌리의 자식을 구역 › 주제 › 페이지로 갈아 끼운다.
// - sortFn: 순서를 그대로 둔다. 기본값은 이름순으로 다시 늘어놓아 대문의 구역 순서를 흩뜨린다.
// 탐색기를 로컬 컴포넌트로 새로 짓거나 엔진을 고치지 않고 옵션으로 이으면, 탐색기의 접기와 그 상태 저장,
// 모바일 메뉴, SPA 이동 처리를 그대로 쓴다.
//
// 구역과 주제의 폴더는 태그 목록의 슬러그(tags/<태그>)를 갖는다. 그래서 탐색기가 폴더 이름을 그 태그
// 목록으로 링크하고, 태그 목록 페이지에서는 그 구역과 주제를 펼쳐 둔다(탐색기는 지금 페이지의 슬러그가
// 폴더의 슬러그로 시작하면 그 폴더를 연다).
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다. 두 순수 함수는 toString()으로 스크립트에
// 실리므로 함수 밖의 이름을 쓰지 않는다.
import type { QuartzTransformerPlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "explorer-tree",
  displayName: "Explorer tree",
  description: "탐색기를 태그로 구역 › 주제 › 페이지 트리로 그린다",
  version: "1.0.0",
  category: "transformer",
}

export interface ExplorerPage {
  slug: string
  title: string
  tags: string[]
}

export type ExplorerItem =
  | { kind: "folder"; tag: string; name: string; children: ExplorerItem[] }
  | { kind: "page"; slug: string; name: string }

export type ExplorerFolder = Extract<ExplorerItem, { kind: "folder" }>

export interface ContentEntry {
  slug: string
  title: string
  tags: string[]
  links: string[]
}

/**
 * 페이지 목록, 태그 표시 이름, 대문의 구역 순서로 구역 › 주제 › 페이지 트리를 짓는다.
 * - 페이지가 없는 구역과 주제도 대문처럼 둔다.
 * - 구역은 대문의 순서를 따르고, 대문에 없는 구역은 그 뒤에 이름 오름차순으로 둔다.
 * - 주제와 페이지는 이름 오름차순이고, 구역에 바로 속한 페이지는 그 구역의 주제들 뒤에 둔다.
 *   정렬은 한국어 순서(가나다 뒤에 로마자)로 고정해, 브라우저의 언어에 따라 바뀌지 않게 한다.
 * - 태그가 없는 페이지는 구역들 뒤에 둔다.
 * - 페이지는 첫 태그 하나로 자리를 정한다. 여러 주제에 걸치는 페이지의 처리는 아직 정하지 않았다.
 */
export function buildExplorerTree(
  pages: ExplorerPage[],
  tagNames: Record<string, string>,
  sectionOrder: string[],
): ExplorerItem[] {
  type Section = {
    folder: ExplorerFolder
    topics: Map<string, ExplorerFolder>
    pages: ExplorerItem[]
  }

  const byName = (a: ExplorerItem, b: ExplorerItem) =>
    a.name.localeCompare(b.name, "ko", { numeric: true })
  const getOrAdd = <T>(map: Map<string, T>, key: string, make: () => T): T => {
    if (!map.has(key)) map.set(key, make())
    return map.get(key)!
  }
  const folder = (tag: string): ExplorerFolder => ({
    kind: "folder",
    tag,
    name: tagNames[tag] ?? tag.split("/").at(-1)!,
    children: [],
  })

  const sections = new Map<string, Section>()
  // 태그가 가리키는 자리(주제 태그면 그 주제, 구역 태그면 구역의 직속 페이지)를 필요하면 만들어 돌려준다
  const slot = (tag: string): ExplorerItem[] => {
    const [sectionTag, topicSegment] = tag.split("/")
    const section = getOrAdd(sections, sectionTag, () => ({
      folder: folder(sectionTag),
      topics: new Map(),
      pages: [],
    }))
    if (!topicSegment) return section.pages
    const topicTag = `${sectionTag}/${topicSegment}`
    return getOrAdd(section.topics, topicTag, () => folder(topicTag)).children
  }

  // 표시 이름이 있는 태그는 페이지가 없어도 자리를 만들고, 페이지는 첫 태그의 자리에 넣는다
  for (const tag of Object.keys(tagNames)) slot(tag)
  const loose: ExplorerItem[] = []
  for (const page of pages) {
    const item: ExplorerItem = { kind: "page", slug: page.slug, name: page.title }
    const tag = page.tags[0]
    if (tag) slot(tag).push(item)
    else loose.push(item)
  }

  const rank = (tag: string) => {
    const index = sectionOrder.indexOf(tag)
    return index < 0 ? sectionOrder.length : index
  }
  const ordered = [...sections.values()].sort(
    (a, b) => rank(a.folder.tag) - rank(b.folder.tag) || byName(a.folder, b.folder),
  )
  const tree: ExplorerItem[] = ordered.map((entry) => {
    const topicFolders = [...entry.topics.values()].sort(byName)
    for (const topicFolder of topicFolders) topicFolder.children.sort(byName)
    entry.folder.children = [...topicFolders, ...entry.pages.sort(byName)]
    return entry.folder
  })
  return [...tree, ...loose.sort(byName)]
}

/**
 * contentIndex의 항목에서 buildExplorerTree의 입력을 뽑는다.
 * - 구역 순서: 대문의 링크 가운데 구역(tags/<구역>)을 나온 순서대로
 * - 태그 표시 이름: 표시 이름 파일(tags/<태그>)의 제목. 태그 목록 색인(tags/index)은 뺀다
 * - 페이지: 대문과 tags/ 아래를 뺀 항목
 */
export function explorerInputs(entries: ContentEntry[]): {
  pages: ExplorerPage[]
  tagNames: Record<string, string>
  sectionOrder: string[]
} {
  const pages: ExplorerPage[] = []
  const tagNames: Record<string, string> = {}
  const sectionOrder: string[] = []
  const tagOf = (slug: string) => (slug.startsWith("tags/") ? slug.slice("tags/".length) : null)
  for (const entry of entries) {
    const tag = tagOf(entry.slug)
    if (entry.slug === "index") {
      for (const link of entry.links) {
        const section = tagOf(link)
        if (section && !section.includes("/") && !sectionOrder.includes(section)) {
          sectionOrder.push(section)
        }
      }
    } else if (tag !== null) {
      if (tag !== "index") tagNames[tag] = entry.title
    } else {
      pages.push({ slug: entry.slug, title: entry.title, tags: entry.tags })
    }
  }
  return { pages, tagNames, sectionOrder }
}

// 탐색기의 mapFn이 부르는 전역. 탐색기는 map을 뿌리부터 모든 노드에 부르므로, 뿌리에서만 자식을 갈아
// 끼우고 나머지 노드는 그대로 둔다. 새 노드는 탐색기의 트라이 클래스(root.constructor)로 만든다.
const SCRIPT = `(() => {
  const explorerInputs = ${explorerInputs.toString()}
  const buildExplorerTree = ${buildExplorerTree.toString()}

  window.explorerTree = (root) => {
    if (root.slugSegments.length > 0) return
    const entries = []
    const collect = (node) => {
      if (node.data) entries.push(node.data)
      node.children.forEach(collect)
    }
    collect(root)
    const dataBySlug = new Map(entries.map((entry) => [entry.slug, entry]))
    const { pages, tagNames, sectionOrder } = explorerInputs(entries)
    const Node = root.constructor
    const toNode = (item) => {
      if (item.kind === "page") return new Node([item.slug], dataBySlug.get(item.slug))
      const slug = "tags/" + item.tag
      const node = new Node(slug.split("/"))
      node.isFolder = true
      node.displayName = item.name
      // 폴더의 slug는 <경로>/index라 탐색기가 /tags/<태그>/로 링크하는데, 태그 목록은 tags/<태그>.html로
      // 나와 그 주소에 페이지가 없다. 대문처럼 /tags/<태그>로 링크하게 slug를 덮는다.
      Object.defineProperty(node, "slug", { value: slug })
      node.children = item.children.map(toNode)
      return node
    }
    root.children = buildExplorerTree(pages, tagNames, sectionOrder).map(toNode)
  }
})()
`

const ExplorerTree: QuartzTransformerPlugin = () => {
  return {
    name: "ExplorerTree",
    // 본문은 고치지 않는다. 설정 로더가 이 메서드들 가운데 하나가 없는 transformer를 건너뛰므로 둔다.
    htmlPlugins() {
      return []
    },
    externalResources() {
      return {
        js: [{ loadTime: "afterDOMReady", contentType: "inline", script: SCRIPT }],
      }
    },
  }
}

export default ExplorerTree
