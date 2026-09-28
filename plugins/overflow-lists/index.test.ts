import test, { describe } from "node:test"
import assert from "node:assert"
import type { BuildCtx } from "../../quartz/util/ctx"
import OverflowLists from "./index"

// 플러그인의 externalResources가 seam이다. 흐림 표시는 브라우저에서 IntersectionObserver가 켜고 끄므로
// 실제 모양은 빌드 결과를 브라우저로 열어 확인하고, 여기서는 가짜 document와 observer로 스크립트를 돌려
// 어느 목록을 새 id로 바꾸고 어느 목록의 끝을 지켜보는지 본다.
const resources = OverflowLists().externalResources!({} as BuildCtx)!
const script = resources.js![0]
const source = script.contentType === "inline" ? script.script : ""

type FakeElement = {
  id: string
  tagName: string
  attributes: Map<string, string>
  classList: Set<string>
  previousElementSibling: FakeElement | null
  end: FakeElement | null
  parentElement: FakeElement | null
}

function element(tagName: string, id = ""): FakeElement {
  return {
    id,
    tagName,
    attributes: new Map(),
    classList: new Set(),
    previousElementSibling: null,
    end: null,
    parentElement: null,
  }
}

// 업스트림처럼 세 목록이 모두 list-0이고, 목차와 Backlinks의 목록 앞에는 제목 버튼이 있다
function page() {
  const lists = ["explorer", "toc", "backlinks"].map((name) => {
    const list = element("UL", "list-0")
    const end = element("LI")
    end.parentElement = list
    list.end = end
    if (name !== "explorer") {
      const button = element("BUTTON")
      button.attributes.set("aria-controls", name === "toc" ? "toc-4" : "list-0")
      list.previousElementSibling = button
    }
    return list
  })
  return lists
}

function run(lists: FakeElement[]) {
  const observed: FakeElement[] = []
  const listeners: Record<string, () => void> = {}
  const cleanups: (() => void)[] = []
  let callback: (entries: { target: FakeElement; isIntersecting: boolean }[]) => void = () => {}
  // 브라우저처럼 같은 요소는 늘 같은 객체로 돌려준다(getElementById의 결과를 목록과 === 로 견준다)
  const wrappers = new Map<FakeElement, object>()
  const wrap = (el: FakeElement) => {
    if (!wrappers.has(el)) wrappers.set(el, wrapper(el))
    return wrappers.get(el)!
  }
  const wrapper = (el: FakeElement) => ({
    get id() {
      return el.id
    },
    set id(value: string) {
      el.id = value
    },
    querySelector: (selector: string) => (selector === ":scope > li.overflow-end" ? el.end : null),
    get previousElementSibling() {
      const prev = el.previousElementSibling
      return (
        prev && {
          tagName: prev.tagName,
          setAttribute: (k: string, v: string) => prev.attributes.set(k, v),
        }
      )
    },
  })
  const document = {
    querySelectorAll: (selector: string) => (selector === "ul.overflow" ? lists.map(wrap) : []),
    getElementById: (id: string) => {
      const found = lists.find((list) => list.id === id)
      return found && wrap(found)
    },
    addEventListener: (type: string, listener: () => void) => (listeners[type] = listener),
  }
  class IntersectionObserver {
    constructor(cb: typeof callback) {
      callback = cb
    }
    observe(target: FakeElement) {
      observed.push(target)
    }
    disconnect() {}
  }
  const window = { addCleanup: (fn: () => void) => cleanups.push(fn) }
  new Function("document", "window", "IntersectionObserver", source)(
    document,
    window,
    IntersectionObserver,
  )
  const report = (target: FakeElement, isIntersecting: boolean) => {
    const toggled = {
      classList: {
        toggle: (name: string, on: boolean) =>
          on
            ? target.parentElement!.classList.add(name)
            : target.parentElement!.classList.delete(name),
      },
    }
    callback([{ target: { parentElement: toggled } as unknown as FakeElement, isIntersecting }])
  }
  return { observed, listeners, cleanups, report }
}

describe("overflow-lists 플러그인", () => {
  // 설정 로더는 이 셋 가운데 하나도 없는 transformer를 경고 한 줄만 남기고 건너뛴다(config-loader.ts의
  // validateCategory). 그러면 빌드는 성공하지만 스크립트가 실리지 않는다.
  test("설정 로더가 transformer로 받아들인다", () => {
    const plugin = OverflowLists()
    assert.ok(["textTransform", "markdownPlugins", "htmlPlugins"].some((key) => key in plugin))
  })

  test("페이지를 불러온 뒤 도는 인라인 스크립트를 싣는다", () => {
    assert.strictEqual(script.loadTime, "afterDOMReady")
    assert.strictEqual(script.contentType, "inline")
    assert.doesNotThrow(() => new Function(source))
  })

  test("id가 앞 목록과 겹치는 목록만 새 id를 받는다", () => {
    const lists = page()
    run(lists)
    assert.strictEqual(lists[0].id, "list-0")
    assert.notStrictEqual(lists[1].id, "list-0")
    assert.notStrictEqual(lists[2].id, "list-0")
    assert.notStrictEqual(lists[1].id, lists[2].id)
  })

  test("업스트림이 놓친 목록의 끝만 지켜본다", () => {
    const lists = page()
    const { observed } = run(lists)
    assert.deepStrictEqual(observed, [lists[1].end, lists[2].end])
  })

  test("제목 버튼의 aria-controls가 새 id를 가리킨다", () => {
    const lists = page()
    run(lists)
    for (const list of lists.slice(1)) {
      assert.strictEqual(list.previousElementSibling!.attributes.get("aria-controls"), list.id)
    }
  })

  test("끝이 보이지 않으면 흐림 표시를 켜고, 보이면 끈다", () => {
    const lists = page()
    const { report } = run(lists)
    report(lists[1].end!, false)
    assert.ok(lists[1].classList.has("gradient-active"))
    report(lists[1].end!, true)
    assert.ok(!lists[1].classList.has("gradient-active"))
  })

  test("첫 로드에 곧바로 돌고, SPA 이동마다 다시 돈다", () => {
    const lists = page()
    const { observed, listeners, cleanups } = run(lists)
    assert.strictEqual(observed.length, 2)
    assert.ok(cleanups.length > 0, "이동할 때 observer를 끊지 않는다")
    // SPA 이동은 사이드바를 새 마크업으로 되돌린다
    for (const list of lists) list.id = "list-0"
    listeners.nav()
    assert.strictEqual(observed.length, 4)
  })
})
