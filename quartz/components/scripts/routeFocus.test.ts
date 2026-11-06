import test, { describe } from "node:test"
import assert from "node:assert"
import { routeFocusTarget } from "./routeFocus"

// ash-wiki: routeFocus.ts(SPA 이동 뒤 포커스를 받을 제목 고르기)의 테스트다(#633).

// routeFocusTarget이 쓰는 만큼만 흉내 낸 문서. ids는 id로 찾는 요소, selectors는 선택자로 찾는 요소다.
function fakeDocument(ids: Record<string, string>, selectors: Record<string, string>) {
  return {
    getElementById: (id: string) =>
      ids[id] ? ({ name: ids[id] } as unknown as HTMLElement) : null,
    querySelector: (selector: string) =>
      selectors[selector] ? ({ name: selectors[selector] } as unknown as HTMLElement) : null,
  }
}

const nameOf = (element: HTMLElement | null) => (element as unknown as { name: string })?.name

describe("routeFocusTarget", () => {
  const doc = fakeDocument(
    { "frame-format": "절 제목", "할당-규칙": "한글 절 제목" },
    { "#quartz-main h1": "페이지 제목" },
  )

  test("주소에 절이 없으면 <main> 안의 페이지 제목을 고른다", () => {
    assert.strictEqual(nameOf(routeFocusTarget(doc, "")), "페이지 제목")
  })

  test("주소에 절이 있으면 그 절의 제목을 고른다", () => {
    assert.strictEqual(nameOf(routeFocusTarget(doc, "#frame-format")), "절 제목")
  })

  test("퍼센트 인코딩한 절 이름도 푼다", () => {
    assert.strictEqual(
      nameOf(routeFocusTarget(doc, "#" + encodeURIComponent("할당-규칙"))),
      "한글 절 제목",
    )
  })

  test("주소의 절이 페이지에 없으면 페이지 제목을 고른다", () => {
    assert.strictEqual(nameOf(routeFocusTarget(doc, "#missing")), "페이지 제목")
  })

  test("페이지 제목도 없으면 null이다", () => {
    assert.strictEqual(routeFocusTarget(fakeDocument({}, {}), ""), null)
  })
})
