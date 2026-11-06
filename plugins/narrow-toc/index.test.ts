import test, { describe } from "node:test"
import assert from "node:assert"
import { TableOfContents } from "@quartz-community/table-of-contents"
import { render } from "preact-render-to-string"
import NarrowToc from "./index"

// 컴포넌트의 렌더 결과가 seam이다. 바의 항목과 꺾쇠를 목차 컴포넌트의 렌더 결과와 견준다. 지금 절을 옮겨 싣고
// 목록을 닫는 동작은 빌드 결과를 브라우저로 열어 확인한다.
const toc = [
  { depth: 0, text: "개요", slug: "개요" },
  { depth: 1, text: "프레임 <구조>", slug: "프레임-구조" },
  { depth: 2, text: "비트 & 필드", slug: "비트--필드" },
  { depth: 0, text: "참고", slug: "참고" },
]

function renderWith(Component: (props: never) => unknown, fileData: object): string {
  return render(Component({ fileData, cfg: { locale: "ko-KR" } } as never) as preact.VNode)
}

const bar = NarrowToc()
const desktop = TableOfContents()
const barHtml = renderWith(bar, { toc })
const desktopHtml = renderWith(desktop, { toc })

const items = (html: string, list: RegExp) => html.match(list)?.[0].match(/<li\b.*?<\/li>/g) ?? []

describe("narrow-toc 컴포넌트", () => {
  test("데스크톱 목차와 같은 항목을 같은 순서로 낸다", () => {
    const barItems = items(barHtml, /<ul class="narrow-toc-list">.*?<\/ul>/)
    // 데스크톱 목록 끝의 li.overflow-end는 넘침 표시 자리라 항목이 아니다.
    const desktopItems = items(
      desktopHtml,
      /<ul[^>]*class="[^"]*toc-content[^"]*"[^>]*>.*?<\/ul>/,
    ).filter((item) => !item.includes("overflow-end"))
    assert.strictEqual(barItems.length, toc.length)
    assert.deepStrictEqual(barItems, desktopItems)
  })

  test("꺾쇠는 목차 머리의 SVG와 같다", () => {
    const fold = /<svg\b[^>]*class="fold"[^>]*>.*?<\/svg>/
    const desktopFold = desktopHtml.match(fold)?.[0]
    assert.ok(desktopFold, "목차 마크업에서 꺾쇠를 찾지 못했다")
    assert.strictEqual(barHtml.match(fold)?.[0], desktopFold)
  })

  test("머리에는 목차 이름표와 빈 지금 절 자리를 둔다", () => {
    assert.match(
      barHtml,
      /^<details class="narrow-toc"><summary><span class="narrow-toc-label">목차<\/span>/,
    )
    assert.match(barHtml, /<span class="narrow-toc-current"><\/span><\/summary>/)
  })

  // 바는 지금 절을 데스크톱 목차의 aria-current에서 옮겨 온다. 목차 패치가 그 표시를 내지 않게 바뀌면 바의 지금 절이
  // 소리 없이 비므로, 패치된 목차 스크립트가 바의 스크립트가 읽는 목록에 그 속성을 거는지 본다.
  test("데스크톱 목차 스크립트가 바가 읽는 지금 절 표시를 낸다", () => {
    const tocScript = String(desktop.afterDOMLoaded)
    const barScript = String(bar.afterDOMLoaded)
    for (const part of ['".toc ul.toc-content"', 'setAttribute("aria-current"']) {
      assert.ok(tocScript.includes(part), `목차 스크립트에 ${part}가 없다`)
    }
    assert.ok(barScript.includes('".toc ul.toc-content"'))
    assert.ok(barScript.includes('"a[aria-current]"'))
  })

  test("목차가 없는 페이지에는 바를 내지 않는다", () => {
    assert.strictEqual(renderWith(bar, {}), "")
  })

  test("페이지를 불러온 뒤 도는 스크립트와 CSS를 싣는다", () => {
    const script = String(bar.afterDOMLoaded)
    // 브라우저 스크립트는 문자열이라 타입 검사를 받지 않는다. 적어도 문법은 맞아야 한다.
    assert.doesNotThrow(() => new Function(script))
    assert.match(script, /addEventListener\("nav"/)
    assert.match(String(bar.css), /\.narrow-toc-list/)
  })
})
