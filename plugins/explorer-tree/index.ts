// ash-wiki: 탐색기를 폴더 대신 태그로 구역 › 주제 › 페이지 트리로 그리게 하는 로컬 플러그인이다.
// 트리를 만드는 규칙은 순수 함수 buildExplorerTree 하나에 모으고, 입력은 탐색기가 받는 contentIndex에서
// explorerInputs가 뽑는다. 구역과 주제의 이름은 태그 표시 이름 파일(content/tags/)의 제목, 구역과 주제의
// 순서는 대문(index.md)의 링크 순서다. 그래서 새 태그는 표시 이름 파일과 대문만 고치면 트리에 따라온다.
//
// 탐색기(@quartz-community/explorer)는 브라우저에서 contentIndex로 폴더 트리를 짓고, 옵션의 filterFn,
// mapFn, sortFn을 문자열로 받아 new Function으로 돌린다. 이 플러그인은 두 순수 함수를 싣는 스크립트로
// 전역 window.explorerTree를 두고, quartz.config.yaml의 탐색기 옵션이 그것을 부른다.
// - filterFn: 모두 남긴다. 기본값은 tags 폴더를 빼는데, 표시 이름을 그 폴더의 항목에서 읽어야 한다.
// - mapFn: 뿌리에서 window.explorerTree가 뿌리의 자식을 구역 › 주제 › 페이지로 갈아 끼운다.
// - sortFn: 순서를 그대로 둔다. 기본값은 이름순으로 다시 늘어놓아 대문의 구역과 주제 순서를 흩뜨린다.
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
 * 페이지 목록, 태그 표시 이름, 대문의 태그 순서로 구역 › 주제 › 페이지 트리를 짓는다.
 * - 페이지가 없는 구역과 주제도 대문처럼 둔다.
 * - 구역과 그 구역의 주제는 대문의 순서를 따르고, 대문에 없는 것은 그 뒤에 이름 오름차순으로 둔다.
 * - 페이지는 이름 오름차순이고, 구역에 바로 속한 페이지는 그 구역의 주제들 뒤에 둔다.
 *   정렬은 한국어 순서(가나다 뒤에 로마자)로 고정해, 브라우저의 언어에 따라 바뀌지 않게 한다.
 * - 태그가 없는 페이지는 구역들 뒤에 둔다.
 * - 페이지는 주 태그(첫 태그) 하나로 자리를 정하고, 보조 태그는 트리에 쓰지 않는다(docs/wiki-conventions.md).
 */
export function buildExplorerTree(
  pages: ExplorerPage[],
  tagNames: Record<string, string>,
  tagOrder: string[],
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
    const index = tagOrder.indexOf(tag)
    return index < 0 ? tagOrder.length : index
  }
  const byOrder = (a: ExplorerFolder, b: ExplorerFolder) =>
    rank(a.tag) - rank(b.tag) || byName(a, b)
  const ordered = [...sections.values()].sort((a, b) => byOrder(a.folder, b.folder))
  const tree: ExplorerItem[] = ordered.map((entry) => {
    const topicFolders = [...entry.topics.values()].sort(byOrder)
    for (const topicFolder of topicFolders) topicFolder.children.sort(byName)
    entry.folder.children = [...topicFolders, ...entry.pages.sort(byName)]
    return entry.folder
  })
  return [...tree, ...loose.sort(byName)]
}

/**
 * contentIndex의 항목에서 buildExplorerTree의 입력을 뽑는다.
 * - 태그 순서: 대문의 링크 가운데 구역(tags/<구역>)과 주제(tags/<구역>/<주제>)를 처음 나온 순서대로
 * - 태그 표시 이름: 표시 이름 파일(tags/<태그>)의 제목. 태그 목록 색인(tags/index)은 뺀다
 * - 페이지: 대문과 tags/ 아래, 주간 소식(news/ 아래)을 뺀 항목. 주간 소식은 탐색기에 나오지 않는다(ADR 0015,
 *   docs/weekly-news.md)
 */
export function explorerInputs(entries: ContentEntry[]): {
  pages: ExplorerPage[]
  tagNames: Record<string, string>
  tagOrder: string[]
} {
  const pages: ExplorerPage[] = []
  const tagNames: Record<string, string> = {}
  const tagOrder: string[] = []
  const tagOf = (slug: string) => (slug.startsWith("tags/") ? slug.slice("tags/".length) : null)
  for (const entry of entries) {
    const tag = tagOf(entry.slug)
    if (entry.slug === "index") {
      for (const link of entry.links) {
        const linked = tagOf(link)
        if (linked && !tagOrder.includes(linked)) tagOrder.push(linked)
      }
    } else if (tag !== null) {
      if (tag !== "index") tagNames[tag] = entry.title
    } else if (!entry.slug.startsWith("news/")) {
      pages.push({ slug: entry.slug, title: entry.title, tags: entry.tags })
    }
  }
  return { pages, tagNames, tagOrder }
}

// 탐색기의 모양이다. 탐색기는 폴더와 링크를 모두 굵기 600으로, 폴더 이름은 파랑으로 그리고 페이지 링크를
// 폴더 이름보다 크게 그려, 층과 지금 페이지가 드러나지 않는다. 전환 시간과 모서리는 절 접기
// (plugins/collapsible-sections)와 맞춘다.
// 줄마다의 모서리, 안쪽 여백, hover 배경과 페이지 항목의 글자는 목차, Backlinks와 같이 쓰는 줄 규칙이라
// 사용자 스타일시트(quartz/styles/custom.scss)에 있다. 여기에는 트리에만 있는 규칙을 둔다.
// - 층은 굵기와 크기, 여백으로 가른다. 구역은 1rem 700, 주제는 0.9rem 700, 페이지 항목은 0.9rem 400이고, 셋 다
//   제목색이다. 탐색기는 사이드바 면 위라 제목색이 면 위의 흰색이다. 구역 사이는 0.5rem 띄워 구역마다 덩어리
//   지게 한다. 파랑은 지금 페이지에만 쓴다. 줄 간격은 줄 규칙의 항목 링크와 같은 1.3이다.
// - 목록 맨 앞에는 업스트림이 목록 끝을 알아채려고 넣는 빈 항목(li.overflow-end)이 있다. 그 높이(0.5rem)가
//   검색 줄과 첫 구역 사이만 벌려, 높이를 없앤다.
// - 폴더는 이름 버튼의 누름 영역(::after)을 줄 전체로 늘려, 꺾쇠를 포함해 줄 어디를 눌러도 접고 편다. 지금
//   페이지에는 highlight 배경을 깔고 파랑으로 써서 hover 배경과 구분한다.
// - 꺾쇠는 이름 바로 뒤에 두어 이름이 층마다 같은 자리에서 시작하게 한다. 이름보다 눈에 띄지 않도록
//   업스트림의 12px보다 작은 10px로 줄이고, 제목색으로 흐리게 두며, hover에도 바꾸지 않는다.
// - 하위 목록의 안내선은 상위 폴더 이름의 첫 글자 자리에 선다. 그 자리는 줄 규칙의 안쪽 여백(0.4rem)이라, 그
//   여백을 바꾸면 안내선의 margin-left도 함께 바꾼다.
// - 전환은 탐색기에 있던 폴더 펼침과 꺾쇠 회전만 둔다. 동작 줄이기 설정에서는 사용자 스타일시트가 끈다.
// - 페이지가 없는 구역과 주제는 이름을 보조 글자색으로 쓰고 투명도로 더 흐린다. 탐색기가 놓인 사이드바 면에서는
//   보조 글자색과 제목색이 모두 밝아 색만으로는 잘 갈리지 않는다. 면 위 보조 글자의 대비 하한에 못 미치는
//   예외라 docs/palette.md의 대비 하한 절에 적어 두었다. 꺾쇠는 폴더임을 알리도록 더 흐리게
//   남기되, 펼칠 것이 없으니 줄 전체를 누를 수 없게 한다.
// 탐색기의 규칙(.folder-container div > button span 등)은 @layer quartz-base 안에 실려, layer 밖인 이 CSS가
// 구체성과 상관없이 이긴다. 사용자 스타일시트도 layer 밖이라 둘은 구체성으로 겨루고, 이 CSS가 뒤에 실리므로
// 구체성이 같은 선택자(hover한 지금 페이지의 배경)는 여기 적은 값이 이긴다.
const CSS = `.explorer .explorer-content .folder-container {
  position: relative;
}
.explorer .explorer-content .folder-container > div {
  min-width: 0;
}
.explorer .explorer-content .folder-container .folder-button::after {
  content: "";
  position: absolute;
  inset: 0;
}
.explorer .explorer-content .folder-container .folder-title {
  color: var(--dark);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.3;
}
.explorer .explorer-content .explorer-ul > li > .folder-container .folder-title {
  font-size: 1rem;
}
.explorer .explorer-content .explorer-ul > li:not(.overflow-end) + li {
  margin-top: 0.5rem;
}
.explorer .explorer-content .explorer-ul > li.overflow-end {
  height: 0;
}
.explorer .explorer-content ul li > a.active {
  background-color: var(--highlight);
  color: var(--secondary);
  font-weight: 600;
}
.explorer .explorer-content .folder-icon {
  order: 1;
  width: 10px;
  height: 10px;
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
  opacity: 0.6;
}
.explorer .explorer-content li:has(> .folder-outer > ul:empty) > .folder-container > .folder-icon {
  opacity: 0.3;
  pointer-events: none;
}
`

// 탐색기의 mapFn이 부르는 전역. 탐색기는 map을 뿌리부터 모든 노드에 부르므로, 뿌리에서만 자식을 갈아
// 끼우고 나머지 노드는 그대로 둔다. 새 노드는 탐색기의 트라이 클래스(root.constructor)로 만든다.
// 지금 페이지가 든 구역과 주제는 트리를 그린 뒤 펼친다.
const SCRIPT = `(() => {
  const explorerInputs = ${explorerInputs.toString()}
  const buildExplorerTree = ${buildExplorerTree.toString()}
  // 탐색기가 이동 전에 목록의 스크롤 위치를 저장하는 키와, 그 자리에 이 스크립트가 임시 위치를 넣어 두었는지
  const SCROLL_KEY = "explorerScrollTop"
  let placeholder = false

  window.explorerTree = (root) => {
    if (root.slugSegments.length > 0) return
    const entries = []
    const collect = (node) => {
      if (node.data) entries.push(node.data)
      node.children.forEach(collect)
    }
    collect(root)
    const dataBySlug = new Map(entries.map((entry) => [entry.slug, entry]))
    const { pages, tagNames, tagOrder } = explorerInputs(entries)
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
    root.children = buildExplorerTree(pages, tagNames, tagOrder).map(toNode)
    // 탐색기는 지금 페이지의 슬러그가 폴더의 슬러그로 시작할 때만 폴더를 열어, tags/<태그> 폴더는 지금
    // 페이지가 들어 있어도 접힌 채 그린다. 그래서 탐색기가 트리를 그리면 지금 페이지의 링크(.active)를 품은
    // 폴더를 연다. MutationObserver는 그린 직후 화면에 나오기 전에 돌고, 여는 동안 전환을 꺼 둔다. 그러지
    // 않으면 이동할 때마다 폴더가 접혔다 펴진다. 탐색기가 여는 폴더처럼 펼친 상태를 저장하지는 않는다.
    // 탐색기는 그린 직후 목록의 스크롤을 맞추는데, 그때는 폴더가 접혀 목록이 짧아 스크롤이 잘린다. 그래서
    // 폴더를 연 뒤 탐색기와 같은 규칙(이동 전에 저장한 위치, 없으면 지금 페이지)으로 다시 맞춘다.
    // 저장한 위치가 없는 첫 로드에서 탐색기는 지금 페이지 항목에 scrollIntoView를 부르는데, 기본값
    // block: "start"라 목록만이 아니라 창까지 내려 제목이 화면 밖으로 밀린다. 그래서 탐색기가 그리기 전에
    // 임시 위치 0을 저장해 두어 탐색기는 목록의 scrollTop만 0으로 맞추게 하고, 아래에서 그 값을 지운 뒤
    // 지금 페이지를 목록 안에서만 보이게 한다. 탐색기는 nav와 render에서 따로 그려 두 렌더가 겹칠 수 있으므로,
    // 뒤 렌더는 앞 렌더가 남긴 임시 위치를 저장한 위치로 읽지 않는다. 이 처리는 탐색기가 mapFn을 저장한 위치를
    // 읽기 전에 부르고, 저장한 값 "0"을 있는 값으로 본다는 데 기댄다. 탐색기를 올릴 때 이 둘을 확인한다.
    const lists = document.querySelectorAll(".explorer-ul")
    if (lists.length === 0) return
    const stored = sessionStorage.getItem(SCROLL_KEY)
    const saved = placeholder && stored === "0" ? null : stored
    if (!saved) {
      sessionStorage.setItem(SCROLL_KEY, "0")
      placeholder = true
    }
    for (const list of lists) {
      const observer = new MutationObserver(() => {
        observer.disconnect()
        if (!saved && placeholder) {
          sessionStorage.removeItem(SCROLL_KEY)
          placeholder = false
        }
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

// 폰의 탐색기 서랍이 열린 동안 서랍 밖을 막아(inert) 포커스가 서랍 안에만 머물게 한다(#633). 서랍(.explorer-content)과
// 서랍을 닫는 메뉴 버튼은 남기고, 탐색기에서 body까지 올라가며 형제를 모두 막는다. 라우터의 알림 영역은 막지 않는다.
// 업스트림은 서랍을 열고 닫을 때 html의 mobile-no-scroll을 붙였다 떼므로 그 class와 화면 폭이 바뀔 때 다시 맞춘다.
// 화면 폭으로 거르는 까닭은 닫힌 서랍을 막는 사이트 스타일(custom.scss의 모바일 탐색기 서랍)의 주석에 있다. 막은
// 요소에는 표시를 남겨 이 스크립트가 막은 것만 푼다. SPA 이동은 새 페이지로 속성을 갈아 표시가 사라지고, 탐색기가
// 서랍을 닫으며 class를 바꿔 다시 맞춘다.
const DRAWER_SCRIPT = `(() => {
  const mobile = window.matchMedia("(max-width: 800px)")
  const MARK = "data-drawer-inert"
  const sync = () => {
    for (const element of document.querySelectorAll("[" + MARK + "]")) {
      element.inert = false
      element.removeAttribute(MARK)
    }
    const explorer = document.querySelector(".explorer")
    if (!explorer || !mobile.matches || explorer.classList.contains("collapsed")) return
    const keep = new Set([explorer.querySelector(".explorer-content"), explorer.querySelector(".mobile-explorer")])
    const block = (element) => {
      if (keep.has(element) || element.inert || element.matches("script, style, template, route-announcer")) return
      element.inert = true
      element.setAttribute(MARK, "")
    }
    for (const child of explorer.children) block(child)
    for (let node = explorer; node.parentElement && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) if (sibling !== node) block(sibling)
    }
  }
  new MutationObserver(sync).observe(document.documentElement, { attributeFilter: ["class"] })
  mobile.addEventListener("change", sync)
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
        js: [
          { loadTime: "afterDOMReady", contentType: "inline", script: SCRIPT },
          { loadTime: "afterDOMReady", contentType: "inline", script: DRAWER_SCRIPT },
        ],
      }
    },
  }
}

export default ExplorerTree
