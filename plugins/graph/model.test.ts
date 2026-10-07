import test, { describe } from "node:test"
import assert from "node:assert"
import type { GraphPage } from "./model"
import { graph } from "./model"

// 그래프 함수가 seam이다. 페이지 목록을 넣고 나온 노드와 선만 본다.
const page = (slug: string, tags: string[], links: string[] = []): GraphPage => ({
  slug,
  title: slug,
  tags,
  links,
})

const ids = (nodes: { id: string }[]) => nodes.map((node) => node.id).sort()

describe("local graph", () => {
  test("태그 노드 없이 링크로 이은 이웃 페이지만 낸다", () => {
    const { nodes, links } = graph(
      [
        page("can-frame", ["network/can"], ["can-fd", "tags/network/can"]),
        page("can-fd", ["network/can"]),
        page("tags/network/can", []),
        page("lin", ["network"]),
      ],
      { kind: "local", current: "can-frame", depth: 1 },
    )
    assert.deepStrictEqual(ids(nodes), ["can-fd", "can-frame"])
    assert.deepStrictEqual(links, [{ source: "can-frame", target: "can-fd", weight: 1 }])
  })

  test("노드마다 첫 태그의 구역을 붙이고, 태그가 없으면 구역이 없다", () => {
    const { nodes } = graph(
      [
        page("secoc", ["security/cybersecurity", "platform/autosar"], ["osi-model", "index"]),
        page("osi-model", ["network"]),
        page("index", []),
      ],
      { kind: "local", current: "secoc", depth: 1 },
    )
    const regions = Object.fromEntries(nodes.map((node) => [node.id, node.region]))
    assert.deepStrictEqual(regions, { secoc: "security", "osi-model": "network", index: null })
  })

  test("주간 소식은 노드가 되지 않고, 주간 소식에서는 그래프가 비어 있다", () => {
    const pages = [
      page("can-frame", ["network/can"]),
      page("news/2026-W41", [], ["can-frame"]),
      page("news/index", [], ["news/2026-W41"]),
    ]
    const fromPage = graph(pages, { kind: "local", current: "can-frame", depth: 2 })
    assert.deepStrictEqual(ids(fromPage.nodes), ["can-frame"])
    assert.deepStrictEqual(fromPage.links, [])
    const fromNews = graph(pages, { kind: "local", current: "news/2026-W41", depth: 1 })
    assert.deepStrictEqual(fromNews, { nodes: [], links: [] })
  })

  test("depth만큼 링크를 따라간다", () => {
    const pages = [
      page("a", ["network/can"], ["b"]),
      page("b", ["network/can"], ["c"]),
      page("c", ["network/can"]),
    ]
    assert.deepStrictEqual(ids(graph(pages, { kind: "local", current: "a", depth: 1 }).nodes), [
      "a",
      "b",
    ])
    assert.deepStrictEqual(ids(graph(pages, { kind: "local", current: "c", depth: 2 }).nodes), [
      "a",
      "b",
      "c",
    ])
  })
})
