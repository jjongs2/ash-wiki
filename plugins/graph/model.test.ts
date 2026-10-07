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

describe("global graph", () => {
  const pages = [
    page("can-frame", ["network/can"], ["can-fd", "100base-t1", "osi-model", "tags/network/can"]),
    page("can-fd", ["network/can"], ["can-frame", "100base-t1"]),
    page("100base-t1", ["network/ethernet"], ["secoc"]),
    page("secoc", ["security/cybersecurity"], ["100base-t1"]),
    page("osi-model", ["network"], ["can-frame"]),
    page("tags/network/can", ["network/can"], ["can-frame"]),
    page("tags/network/ethernet", []),
    page("tags/security/cybersecurity", []),
    page("news/2026-W41", ["network/can"], ["can-frame", "secoc"]),
  ]
  pages[5].title = "CAN"
  pages[6].title = "Ethernet"
  pages[7].title = "사이버보안"

  test("주제 노드만 내고, 크기는 페이지 수, 선 굵기는 주제 사이 링크 수다", () => {
    const { nodes, links } = graph(pages, { kind: "global", expanded: [] })
    assert.deepStrictEqual(
      nodes.sort((a, b) => a.id.localeCompare(b.id)),
      [
        { id: "tags/network/can", kind: "topic", text: "CAN", region: "network", pages: 2 },
        {
          id: "tags/network/ethernet",
          kind: "topic",
          text: "Ethernet",
          region: "network",
          pages: 1,
        },
        {
          id: "tags/security/cybersecurity",
          kind: "topic",
          text: "사이버보안",
          region: "security",
          pages: 1,
        },
      ],
    )
    // CAN의 두 페이지가 100base-t1로 가는 링크 2개, 100base-t1과 secoc이 서로 가는 링크 2개.
    // CAN 안의 링크, 주제가 없는 osi-model의 링크, 주간 소식의 링크는 세지 않는다.
    const weights = Object.fromEntries(
      links.map((link) => [[link.source, link.target].sort().join(" "), link.weight]),
    )
    assert.deepStrictEqual(weights, {
      "tags/network/can tags/network/ethernet": 2,
      "tags/network/ethernet tags/security/cybersecurity": 2,
    })
  })

  test("펼친 주제는 그 주제의 페이지 노드로 바뀌고, 선은 페이지와 다른 주제 사이로 나뉜다", () => {
    const { nodes, links } = graph(pages, { kind: "global", expanded: ["tags/network/can"] })
    assert.deepStrictEqual(ids(nodes), [
      "can-fd",
      "can-frame",
      "tags/network/ethernet",
      "tags/security/cybersecurity",
    ])
    const canFrame = nodes.find((node) => node.id === "can-frame")
    assert.deepStrictEqual(canFrame, {
      id: "can-frame",
      kind: "page",
      text: "can-frame",
      region: "network",
      pages: 1,
    })
    const weights = Object.fromEntries(
      links.map((link) => [[link.source, link.target].sort().join(" "), link.weight]),
    )
    assert.deepStrictEqual(weights, {
      "can-fd can-frame": 2,
      "can-frame tags/network/ethernet": 1,
      "can-fd tags/network/ethernet": 1,
      "tags/network/ethernet tags/security/cybersecurity": 2,
    })
  })

  test("여러 주제에 걸친 페이지는 펼친 주제 하나에서만 페이지 노드가 된다", () => {
    const { nodes } = graph(
      [
        page("secoc", ["security/cybersecurity", "platform/autosar"]),
        page("com", ["platform/autosar"], ["secoc"]),
      ],
      { kind: "global", expanded: ["tags/security/cybersecurity", "tags/platform/autosar"] },
    )
    assert.deepStrictEqual(ids(nodes), ["com", "secoc"])
  })
})
