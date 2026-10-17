import test, { describe } from "node:test"
import assert from "node:assert"
import { FileTrieNode } from "../../quartz/util/fileTrie"
import type { BuildCtx } from "../../quartz/util/ctx"
import type { FullSlug } from "../../quartz/util/path"
import type { ContentEntry, ExplorerItem, ExplorerPage } from "./index"
import ExplorerTree, { buildExplorerTree, explorerInputs } from "./index"

// 트리를 만드는 순수 함수가 seam이다. 입력(페이지 목록, 태그 표시 이름, 대문의 구역 순서)을 넣고 나온
// 트리만 본다.
const tagNames: Record<string, string> = {
  network: "네트워크",
  "network/can": "CAN",
  "network/ethernet": "Ethernet",
  platform: "소프트웨어 플랫폼",
  "platform/rtos": "RTOS",
  "platform/autosar": "AUTOSAR",
}

const page = (slug: string, title: string, ...tags: string[]): ExplorerPage => ({
  slug,
  title,
  tags,
})

// 트리를 "이름" 또는 ["이름", 자식들] 꼴로 줄여, 모양과 순서만 견준다
type Outline = string | [string, Outline[]]
function outline(items: ExplorerItem[]): Outline[] {
  return items.map((item) =>
    item.kind === "folder" ? [item.name, outline(item.children)] : item.name,
  )
}

describe("buildExplorerTree", () => {
  test("구역은 대문의 순서를 따른다", () => {
    const tree = buildExplorerTree([], tagNames, ["platform", "network"])
    assert.deepStrictEqual(
      tree.map((item) => item.name),
      ["소프트웨어 플랫폼", "네트워크"],
    )
  })

  test("구역과 주제는 표시 이름으로, 페이지는 제목으로 나온다", () => {
    const tree = buildExplorerTree([page("can-frame", "CAN 프레임", "network/can")], tagNames, [
      "network",
      "platform",
    ])
    assert.deepStrictEqual(outline(tree), [
      [
        "네트워크",
        [
          ["CAN", ["CAN 프레임"]],
          ["Ethernet", []],
        ],
      ],
      [
        "소프트웨어 플랫폼",
        [
          ["AUTOSAR", []],
          ["RTOS", []],
        ],
      ],
    ])
  })

  // 정렬은 한국어 순서(가나다 뒤에 로마자)로 고정해, 브라우저의 언어에 따라 순서가 바뀌지 않게 한다
  test("주제와 페이지는 제목 오름차순이다", () => {
    const tree = buildExplorerTree(
      [
        page("remote-frame", "리모트 프레임", "network/can"),
        page("can-frame", "CAN 프레임", "network/can"),
        page("data-length-code", "데이터 길이 코드", "network/can"),
      ],
      { network: "네트워크", "network/can": "CAN", "network/ethernet": "Ethernet" },
      ["network"],
    )
    assert.deepStrictEqual(outline(tree), [
      [
        "네트워크",
        [
          ["CAN", ["데이터 길이 코드", "리모트 프레임", "CAN 프레임"]],
          ["Ethernet", []],
        ],
      ],
    ])
  })

  test("구역에 바로 속한 페이지는 그 구역의 주제들 뒤에 제목 오름차순으로 온다", () => {
    const tree = buildExplorerTree(
      [
        page("osi-model", "OSI 참조 모델", "network"),
        page("can", "CAN", "network/can"),
        page("byte-order", "바이트 순서", "network"),
      ],
      { network: "네트워크", "network/can": "CAN" },
      ["network"],
    )
    assert.deepStrictEqual(outline(tree), [
      ["네트워크", [["CAN", ["CAN"]], "바이트 순서", "OSI 참조 모델"]],
    ])
  })

  test("새 태그를 더하면 트리가 따라온다", () => {
    const pages = [page("can", "CAN", "network/can")]
    const before = buildExplorerTree(pages, tagNames, ["network", "platform"])
    const after = buildExplorerTree(
      [...pages, page("lin", "LIN", "network/lin")],
      { ...tagNames, security: "보안·업데이트", "network/lin": "LIN" },
      ["network", "security", "platform"],
    )
    assert.deepStrictEqual(outline(before), [
      [
        "네트워크",
        [
          ["CAN", ["CAN"]],
          ["Ethernet", []],
        ],
      ],
      [
        "소프트웨어 플랫폼",
        [
          ["AUTOSAR", []],
          ["RTOS", []],
        ],
      ],
    ])
    assert.deepStrictEqual(outline(after), [
      [
        "네트워크",
        [
          ["CAN", ["CAN"]],
          ["Ethernet", []],
          ["LIN", ["LIN"]],
        ],
      ],
      ["보안·업데이트", []],
      [
        "소프트웨어 플랫폼",
        [
          ["AUTOSAR", []],
          ["RTOS", []],
        ],
      ],
    ])
  })

  test("대문에 없는 구역은 대문의 구역들 뒤에 표시 이름 오름차순으로 온다", () => {
    const tree = buildExplorerTree(
      [],
      { "sw-engineering": "소프트웨어 공학", network: "네트워크" },
      [],
    )
    assert.deepStrictEqual(outline(tree), [
      ["네트워크", []],
      ["소프트웨어 공학", []],
    ])
  })

  test("여러 태그를 단 페이지는 주 태그의 자리에만 둔다", () => {
    const tree = buildExplorerTree(
      [page("autosar-can-stack", "AUTOSAR CAN 스택", "platform/autosar", "network/can")],
      tagNames,
      ["network", "platform"],
    )
    assert.deepStrictEqual(outline(tree), [
      [
        "네트워크",
        [
          ["CAN", []],
          ["Ethernet", []],
        ],
      ],
      [
        "소프트웨어 플랫폼",
        [
          ["AUTOSAR", ["AUTOSAR CAN 스택"]],
          ["RTOS", []],
        ],
      ],
    ])
  })

  test("표시 이름이 없는 태그는 태그의 마지막 마디로 나온다", () => {
    const tree = buildExplorerTree([page("lin", "LIN", "network/lin")], {}, ["network"])
    assert.deepStrictEqual(outline(tree), [["network", [["lin", ["LIN"]]]]])
  })

  test("태그가 없는 페이지는 구역들 뒤에 온다", () => {
    const tree = buildExplorerTree([page("about", "소개")], { network: "네트워크" }, ["network"])
    assert.deepStrictEqual(outline(tree), [["네트워크", []], "소개"])
  })

  test("구역과 주제에는 태그를, 페이지에는 슬러그를 남긴다", () => {
    const tree = buildExplorerTree([page("can-frame", "CAN 프레임", "network/can")], tagNames, [
      "network",
    ])
    const network = tree[0]
    assert.ok(network.kind === "folder")
    assert.strictEqual(network.tag, "network")
    const can = network.children[0]
    assert.ok(can.kind === "folder")
    assert.strictEqual(can.tag, "network/can")
    assert.deepStrictEqual(can.children, [{ kind: "page", slug: "can-frame", name: "CAN 프레임" }])
  })
})

describe("explorerInputs", () => {
  // contentIndex의 항목 꼴: 대문, 표시 이름 파일, 태그 목록 색인(tags/index), 페이지
  const entries = [
    {
      slug: "index",
      title: "대문",
      tags: [],
      links: ["tags/network", "tags/network/can", "tags/platform", "tags/platform/rtos", "can"],
    },
    { slug: "tags/network", title: "네트워크", tags: [], links: [] },
    { slug: "tags/network/can", title: "CAN", tags: [], links: [] },
    { slug: "tags/platform", title: "소프트웨어 플랫폼", tags: [], links: [] },
    { slug: "tags/index", title: "Tag Index", tags: [], links: [] },
    { slug: "can", title: "CAN", tags: ["network/can"], links: ["can-frame"] },
  ]

  test("대문의 링크에서 구역만 순서대로 뽑는다", () => {
    assert.deepStrictEqual(explorerInputs(entries).sectionOrder, ["network", "platform"])
  })

  test("표시 이름 파일의 제목을 태그의 표시 이름으로 쓴다", () => {
    assert.deepStrictEqual(explorerInputs(entries).tagNames, {
      network: "네트워크",
      "network/can": "CAN",
      platform: "소프트웨어 플랫폼",
    })
  })

  test("대문과 표시 이름 파일을 뺀 항목이 페이지다", () => {
    assert.deepStrictEqual(explorerInputs(entries).pages, [
      { slug: "can", title: "CAN", tags: ["network/can"] },
    ])
  })

  test("주간 소식과 지난 호 목록은 페이지로 넣지 않는다", () => {
    const news = [
      { slug: "news/2026-w41", title: "2026년 41주차 주간 소식", tags: [], links: ["can"] },
      { slug: "news/index", title: "주간 소식", tags: [], links: [] },
    ]
    assert.deepStrictEqual(explorerInputs([...entries, ...news]).pages, [
      { slug: "can", title: "CAN", tags: ["network/can"] },
    ])
  })
})

// 탐색기는 브라우저에서 contentIndex로 트라이를 짓고 mapFn으로 window.explorerTree를 부른다. 실리는
// 스크립트를 돌려 전역을 받고, 탐색기의 트라이와 같은 꼴인 엔진의 FileTrieNode에 map으로 건 뒤 트리를 본다.
describe("브라우저 스크립트", () => {
  // 탐색기의 트라이는 항목의 filePath도 읽는다
  type Entry = ContentEntry & { filePath: string }

  const resources = ExplorerTree().externalResources!({} as BuildCtx)!
  const script = resources.js![0]
  const source = script.contentType === "inline" ? script.script : ""

  const entries: Entry[] = [
    { slug: "index", title: "대문", links: ["tags/platform", "tags/network"] },
    { slug: "tags/network", title: "네트워크" },
    { slug: "tags/network/can", title: "CAN" },
    { slug: "tags/platform", title: "소프트웨어 플랫폼" },
    { slug: "tags/index", title: "Tag Index" },
    { slug: "osi-model", title: "OSI 참조 모델", tags: ["network"] },
    { slug: "can-frame", title: "CAN 프레임", tags: ["network/can"] },
  ].map((entry) => ({
    tags: [],
    links: [],
    ...entry,
    filePath: `content/${entry.slug}.md`,
  }))

  function mapped() {
    const window: { explorerTree?: (node: FileTrieNode<Entry>) => void } = {}
    // 트리를 그린 뒤 지금 페이지가 든 폴더를 여는 일은 DOM을 다루므로 브라우저에서 확인한다. 여기서는
    // 탐색기 목록이 없는 document를 주어 그 일을 건너뛴다.
    const document = { querySelectorAll: () => [] }
    // tsx는 함수의 toString()에 __name 호출을 끼워 넣는다. 빌드는 이 파일을 플래그 없는 node로 불러
    // 그런 호출이 없으므로, 테스트에서만 그 이름을 채운다. new Function은 이 모듈의 이름을 보지 못하므로,
    // 스크립트에 실린 함수가 함수 밖의 이름을 쓰면 여기서 드러난다.
    new Function("window", "document", "__name", source)(window, document, (fn: unknown) => fn)
    const trie = FileTrieNode.fromEntries(entries.map((entry) => [entry.slug as FullSlug, entry]))
    trie.map(window.explorerTree!)
    return trie
  }

  type Shape = string | [string, string, Shape[]]
  const shape = (node: FileTrieNode<Entry>): Shape =>
    node.isFolder
      ? [node.displayName, node.slug, node.children.map(shape)]
      : `${node.displayName} (${node.slug})`

  // 설정 로더는 이 셋 가운데 하나도 없는 transformer를 경고 한 줄만 남기고 건너뛴다(config-loader.ts의
  // validateCategory). 그러면 빌드는 성공하지만 스크립트가 실리지 않아 탐색기가 비어 나온다.
  test("설정 로더가 transformer로 받아들인다", () => {
    const plugin = ExplorerTree()
    assert.ok(["textTransform", "markdownPlugins", "htmlPlugins"].some((key) => key in plugin))
  })

  test("페이지를 불러온 뒤 도는 인라인 스크립트를 싣는다", () => {
    assert.strictEqual(script.loadTime, "afterDOMReady")
    assert.strictEqual(script.contentType, "inline")
  })

  test("뿌리의 자식을 구역 › 주제 › 페이지로 갈아 끼우고, 폴더는 태그 목록의 슬러그를 갖는다", () => {
    assert.deepStrictEqual(mapped().children.map(shape), [
      ["소프트웨어 플랫폼", "tags/platform", []],
      [
        "네트워크",
        "tags/network",
        [["CAN", "tags/network/can", ["CAN 프레임 (can-frame)"]], "OSI 참조 모델 (osi-model)"],
      ],
    ])
  })

  // 탐색기 목록의 스크롤. 목록 하나와 MutationObserver를 흉내 내고, 탐색기가 한 번 그리는 일(render)을
  // mapFn 부르기, 저장한 위치 읽기, 그린 뒤의 observer 돌리기로 나눠 부른다. 목록 높이는 100, 지금 페이지
  // 항목은 300~320이라 가운데로 맞추면 scrollTop이 260이다. 폴더를 여는 일은 브라우저에서 확인한다.
  function scrollPage(stored?: string) {
    const storage = new Map<string, string>(
      stored === undefined ? [] : [["explorerScrollTop", stored]],
    )
    const sessionStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    }
    const callbacks: (() => void)[] = []
    class MutationObserver {
      constructor(private callback: () => void) {}
      observe() {
        callbacks.push(this.callback)
      }
      disconnect() {}
    }
    const active = {
      closest: () => null,
      getBoundingClientRect: () => ({
        top: 300 - list.scrollTop,
        bottom: 320 - list.scrollTop,
        height: 20,
      }),
    }
    const list = {
      scrollTop: 0,
      offsetHeight: 100,
      querySelector: () => active,
      getBoundingClientRect: () => ({ top: 0, bottom: 100, height: 100 }),
    }
    const window: { explorerTree?: (root: unknown) => void } = {}
    const document = { querySelectorAll: () => [list] }
    new Function("window", "document", "sessionStorage", "MutationObserver", "__name", source)(
      window,
      document,
      sessionStorage,
      MutationObserver,
      (fn: unknown) => fn,
    )
    // 탐색기는 mapFn을 부른 뒤 저장한 위치가 있으면 목록의 scrollTop을 그 값으로 두고, 없으면 지금 페이지
    // 항목에 scrollIntoView를 부른다.
    let scrolledIntoView = false
    const render = () => {
      window.explorerTree!({ slugSegments: [], children: [] })
      const saved = storage.get("explorerScrollTop")
      if (saved) list.scrollTop = Number(saved)
      else scrolledIntoView = true
    }
    const settle = () => callbacks.splice(0).forEach((callback) => callback())
    return { storage, list, render, settle, scrolledIntoView: () => scrolledIntoView }
  }

  test("저장한 위치가 없는 첫 로드에서는 탐색기가 scrollIntoView를 부르지 않고, 지금 페이지를 목록 안에서 가운데로 맞춘다", () => {
    const page = scrollPage()
    page.render()
    page.settle()
    assert.strictEqual(page.scrolledIntoView(), false)
    assert.strictEqual(page.list.scrollTop, 260)
    assert.strictEqual(page.storage.has("explorerScrollTop"), false)
  })

  test("두 렌더가 겹쳐도 뒤 렌더가 앞 렌더의 임시 위치를 저장한 위치로 읽지 않는다", () => {
    const page = scrollPage()
    page.render()
    page.render()
    page.settle()
    assert.strictEqual(page.list.scrollTop, 260)
    assert.strictEqual(page.storage.has("explorerScrollTop"), false)
  })

  test("저장한 위치가 있으면 그 위치로 맞추고 값을 그대로 둔다", () => {
    const page = scrollPage("120")
    page.render()
    page.settle()
    assert.strictEqual(page.list.scrollTop, 120)
    assert.strictEqual(page.storage.get("explorerScrollTop"), "120")
  })
})
