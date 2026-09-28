import test, { describe } from "node:test"
import assert from "node:assert"
import { headKey, matchHeadElements } from "./headPatch"

// headKey가 쓰는 만큼만 흉내 낸 요소. outerHTML은 속성을 넣은 순서대로 적는다.
function fakeElement(tagName: string, attrs: Record<string, string>) {
  const el = {
    tagName,
    attrs: { ...attrs },
    getAttribute: (name: string) => el.attrs[name] ?? null,
    setAttribute: (name: string, value: string) => {
      el.attrs[name] = value
    },
    cloneNode: () => fakeElement(tagName, el.attrs),
    get outerHTML() {
      const list = Object.entries(el.attrs).map(([k, v]) => ` ${k}="${v}"`)
      return `<${tagName.toLowerCase()}${list.join("")}>`
    },
  }
  return el as unknown as Element
}

describe("headKey", () => {
  test("처음 불러온 페이지의 상대 href와 이동으로 받은 페이지의 절대 경로 href를 같게 본다", () => {
    const initial = fakeElement("LINK", { rel: "stylesheet", href: "./index-1.css" })
    const fetched = fakeElement("LINK", { rel: "stylesheet", href: "/index-1.css" })
    assert.strictEqual(
      headKey(initial, "https://example.com/can-crc"),
      headKey(fetched, "https://example.com/tags/network/can"),
    )
  })

  test("깊이가 다른 페이지의 상대 href는 그 페이지 기준으로 푼다", () => {
    const shallow = fakeElement("LINK", { rel: "stylesheet", href: "./index-1.css" })
    const deep = fakeElement("LINK", { rel: "stylesheet", href: "../../index-1.css" })
    assert.strictEqual(
      headKey(shallow, "https://example.com/can-crc"),
      headKey(deep, "https://example.com/tags/network/can"),
    )
  })

  test("외부 URL은 그대로 비교한다", () => {
    const a = fakeElement("LINK", { rel: "stylesheet", href: "https://cdn.example/a.css" })
    const b = fakeElement("LINK", { rel: "stylesheet", href: "https://cdn.example/a.css" })
    assert.strictEqual(headKey(a, "https://example.com/x"), headKey(b, "https://example.com/y"))
  })

  test("내용이 다른 meta는 다르게 본다", () => {
    const a = fakeElement("META", { property: "og:title", content: "A" })
    const b = fakeElement("META", { property: "og:title", content: "B" })
    assert.notStrictEqual(headKey(a, "https://example.com/"), headKey(b, "https://example.com/"))
  })

  test("script는 짝을 짓지 않는다", () => {
    assert.strictEqual(
      headKey(fakeElement("SCRIPT", { src: "./a.js" }), "https://example.com/"),
      null,
    )
  })
})

describe("matchHeadElements", () => {
  test("같은 목록이면 모두 짝짓는다", () => {
    assert.deepStrictEqual(matchHeadElements(["a", "b", "c"], ["a", "b", "c"]), [0, 1, 2])
  })

  test("달라진 요소만 짝이 없다", () => {
    assert.deepStrictEqual(
      matchHeadElements(["title A", "css", "og A"], ["title B", "css", "og B"]),
      [-1, 1, -1],
    )
  })

  test("순서를 거슬러 짝짓지 않는다", () => {
    assert.deepStrictEqual(matchHeadElements(["a", "b"], ["b", "a"]), [1, -1])
  })

  test("같은 키가 여럿이면 앞에서부터 하나씩 짝짓는다", () => {
    assert.deepStrictEqual(matchHeadElements(["x", "x"], ["x", "x", "x"]), [0, 1, -1])
  })

  test("null은 짝짓지 않는다", () => {
    assert.deepStrictEqual(matchHeadElements([null, "a"], [null, "a"]), [-1, 1])
  })
})
