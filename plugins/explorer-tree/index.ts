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
// 폴더 이름을 누르면 페이지로 가지 않고 폴더를 접고 편다(탐색기 옵션 folderClickBehavior: collapse). 구역과
// 주제의 태그 목록은 대문에서 간다. 폴더는 태그 목록의 슬러그(tags/<태그>)를 가져, 태그 목록 페이지에서는
// 그 구역과 주제를 펼쳐 둔다(탐색기는 지금 페이지의 슬러그가 폴더의 슬러그로 시작하면 그 폴더를 연다).
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

// 탐색기의 모양이다. 탐색기는 폴더와 링크를 모두 굵기 600으로, 폴더 이름은 파랑으로 그리고 페이지 링크를
// 폴더 이름보다 크게 그려, 층과 지금 페이지가 드러나지 않는다. 전환 시간과 모서리는 절 접기
// (plugins/collapsible-sections)와 맞춘다.
// 줄마다의 모서리, 안쪽 여백, hover 배경과 페이지 항목의 글자(본문색 0.9rem 400)는 목차, Backlinks와 같이
// 쓰는 줄 규칙이라 사용자 스타일시트(quartz/styles/custom.scss)에 있다. 여기에는 트리에만 있는 규칙을 둔다.
// - 층은 굵기와 크기로 가른다. 구역은 제목색 0.95rem 600, 주제는 본문색 0.9rem 600이다. 파랑은 지금
//   페이지에만 쓴다.
// - 폴더는 이름 버튼을 꺾쇠 앞까지 늘리고, 꺾쇠는 탐색기가 따로 눌림을 받아 줄 어디를 눌러도 접고 편다. 지금
//   페이지에는 본문의 내부 링크와 같은 highlight 배경을 깔고 파랑으로 써서 hover의 무채색 배경과 구분한다.
// - 꺾쇠는 줄 오른쪽 끝에 두어 이름이 층마다 같은 자리에서 시작하게 한다. 본문색으로 흐리게 두고, hover에도
//   바꾸지 않는다. 하위 목록의 안내선은 상위 폴더 이름의 첫 글자 자리에 선다.
// - 전환은 탐색기에 있던 폴더 펼침과 꺾쇠 회전만 두고, 동작 줄이기 설정에서는 그것도 끈다.
// - 페이지가 없는 구역과 주제는 이름을 보조 글자색으로 흐린다. 꺾쇠는 폴더임을 알리도록 더 흐리게 남기되,
//   펼칠 것이 없으니 줄 전체를 누를 수 없게 한다.
// 탐색기의 규칙(.folder-container div > button span 등)보다 구체적인 선택자로 덮는다. 이 CSS는 사용자
// 스타일시트보다 뒤에 실리므로, 줄 규칙과 구체성이 같은 선택자(hover한 지금 페이지의 배경)는 여기 적은 값이
// 이긴다.
const CSS = `.explorer .explorer-content :is(.folder-button, ul li > a):focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: 2px;
  border-radius: 5px;
}
.explorer .explorer-content .folder-container > div {
  flex: 1;
}
.explorer .explorer-content .folder-container .folder-button {
  width: 100%;
}
.explorer .explorer-content .folder-container .folder-title {
  color: var(--darkgray);
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.5rem;
}
.explorer .explorer-content .explorer-ul > li > .folder-container .folder-title {
  color: var(--dark);
  font-size: 0.95rem;
}
.explorer .explorer-content ul li > a.active {
  background-color: var(--highlight);
  color: var(--secondary);
  font-weight: 600;
}
.explorer .explorer-content .folder-icon {
  order: 1;
  margin: 0 0 0 0.3rem;
  color: var(--dark);
  opacity: 0.6;
  transition: transform 0.3s ease;
}
.explorer .explorer-content .folder-outer > ul {
  margin-left: 0.4rem;
  padding-left: 0.4rem;
}
.explorer .explorer-content li:has(> .folder-outer > ul:empty) > .folder-container {
  pointer-events: none;
}
.explorer .explorer-content li:has(> .folder-outer > ul:empty) > .folder-container .folder-title {
  color: var(--gray);
}
.explorer .explorer-content li:has(> .folder-outer > ul:empty) > .folder-container > .folder-icon {
  opacity: 0.3;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .explorer .explorer-content :is(.folder-icon, .folder-outer) {
    transition: none;
  }
}
`

// 탐색기의 mapFn이 부르는 전역. 탐색기는 map을 뿌리부터 모든 노드에 부르므로, 뿌리에서만 자식을 갈아
// 끼우고 나머지 노드는 그대로 둔다. 새 노드는 탐색기의 트라이 클래스(root.constructor)로 만든다.
// 지금 페이지가 든 구역과 주제는 트리를 그린 뒤 펼친다.
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
      // 폴더의 slug는 <경로>/index라, 탐색기가 폴더를 열지 판단할 때 끝에 /가 붙은 tags/<태그>/로 본다.
      // 그러면 태그 목록 페이지(tags/<태그>)에서 그 태그의 폴더가 열리지 않으므로 slug를 tags/<태그>로 덮는다.
      // 탐색기는 이 slug를 접은 상태를 저장하는 키로도 쓴다.
      Object.defineProperty(node, "slug", { value: slug })
      node.children = item.children.map(toNode)
      return node
    }
    root.children = buildExplorerTree(pages, tagNames, sectionOrder).map(toNode)
    // 탐색기는 지금 페이지의 슬러그가 폴더의 슬러그로 시작할 때만 폴더를 열어, tags/<태그> 폴더는 지금
    // 페이지가 들어 있어도 접힌 채 그린다. 그래서 탐색기가 트리를 그리면 지금 페이지의 링크(.active)를 품은
    // 폴더를 연다. MutationObserver는 그린 직후 화면에 나오기 전에 돌고, 여는 동안 전환을 꺼 둔다. 그러지
    // 않으면 이동할 때마다 폴더가 접혔다 펴진다. 탐색기가 여는 폴더처럼 펼친 상태를 저장하지는 않는다.
    // 탐색기는 그린 직후 목록의 스크롤을 맞추는데, 그때는 폴더가 접혀 목록이 짧아 스크롤이 잘린다. 그래서
    // 폴더를 연 뒤 탐색기와 같은 규칙(이동 전에 저장한 위치, 없으면 지금 페이지)으로 다시 맞춘다.
    for (const list of document.querySelectorAll(".explorer-ul")) {
      const observer = new MutationObserver(() => {
        observer.disconnect()
        const active = list.querySelector("a.active")
        if (!active) return
        // 폴더와 그 접기 표시(폴더가 열리면 돌아간다)
        const folders = []
        for (let outer = active.closest(".folder-outer"); outer; ) {
          folders.push([outer, outer.previousElementSibling.querySelector(".folder-icon")])
          outer = outer.parentElement.closest(".folder-outer")
        }
        const animated = folders.flat()
        for (const element of animated) element.style.transition = "none"
        for (const [outer] of folders) outer.classList.add("open")
        list.offsetHeight // 연 상태를 전환 없이 반영한다
        for (const element of animated) element.style.transition = ""

        const saved = sessionStorage.getItem("explorerScrollTop")
        if (saved) {
          list.scrollTop = Number(saved)
        } else {
          const box = list.getBoundingClientRect()
          const link = active.getBoundingClientRect()
          if (link.top < box.top || link.bottom > box.bottom) {
            list.scrollTop += link.top - box.top - (box.height - link.height) / 2
          }
        }
      })
      observer.observe(list, { childList: true })
    }
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
        css: [{ content: CSS, inline: true }],
        js: [{ loadTime: "afterDOMReady", contentType: "inline", script: SCRIPT }],
      }
    },
  }
}

export default ExplorerTree
