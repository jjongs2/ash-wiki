import test, { describe } from "node:test"
import assert from "node:assert"
import { fromHtml } from "hast-util-from-html"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import { render } from "preact-render-to-string"
import { unified } from "unified"
import type { Root } from "hast"
import type { Jsx } from "hast-util-to-jsx-runtime"
import type { BuildCtx } from "../../quartz/util/ctx"
import CollapsibleSections from "./index"

// 플러그인의 htmlPlugins가 seam이다. github-flavored-markdown이 id와 앵커 링크를 붙인 꼴의 본문을 넣어
// 빌드처럼 preact로 그린 HTML을 본다.
function transform(html: string): string {
  const processor = unified().use(CollapsibleSections().htmlPlugins!({} as BuildCtx))
  const tree = processor.runSync(fromHtml(html, { fragment: true })) as Root
  return render(
    toJsxRuntime(tree, { Fragment, jsx: jsx as Jsx, jsxs: jsxs as Jsx }) as preact.VNode,
  )
}

const heading = (tag: string, id: string) =>
  `<${tag} id="${id}">${id}<a role="anchor" aria-hidden="true" tabindex="-1" data-no-popover="true" href="#${id}">§</a></${tag}>`
const h2 = (id: string) => heading("h2", id)
const h3 = (id: string) => heading("h3", id)

// summary 안으로 옮긴 제목. 앵커의 href는 data-href로 옮겨진다.
const summaryHeading = (tag: string, id: string) =>
  heading(tag, id).replace(`href="#${id}"`, `data-href="#${id}"`)
const details = (summary: string, body: string) =>
  `<details class="collapsible-section" open><summary>${summary}</summary>${body}</details>`
const section = (id: string, body: string) => details(summaryHeading("h2", id), body)
const subsection = (id: string, body: string) => details(summaryHeading("h3", id), body)

describe("collapsible-sections 플러그인", () => {
  test("## 제목마다 다음 ## 전까지를 펼친 절로 감싼다", () => {
    assert.strictEqual(
      transform(`${h2("a")}<p>가</p>${h2("b")}<p>나</p><p>다</p>`),
      section("a", "<p>가</p>") + section("b", "<p>나</p><p>다</p>"),
    )
  })

  test("첫 ## 앞의 머리말은 감싸지 않는다", () => {
    assert.strictEqual(
      transform(`<p>머리말</p><ul><li>목록</li></ul>${h2("a")}<p>가</p>`),
      `<p>머리말</p><ul><li>목록</li></ul>` + section("a", "<p>가</p>"),
    )
  })

  test("### 절은 상위 ## 절 안에서 다음 ### 전까지 따로 접힌다", () => {
    assert.strictEqual(
      transform(`${h2("a")}<p>들머리</p>${h3("a-1")}<p>가</p>${h3("a-2")}<p>나</p>${h2("b")}`),
      section(
        "a",
        `<p>들머리</p>` + subsection("a-1", "<p>가</p>") + subsection("a-2", "<p>나</p>"),
      ) + section("b", ""),
    )
  })

  // summary는 대화형 요소라 그 안에 초점을 받을 수 있는 링크를 두지 않는다(axe nested-interactive). href가 없는
  // <a>는 초점을 받지 않고, 누르면 스크립트가 data-href로 옮겨 간다.
  test("제목의 id는 그대로 남고, 앵커는 href 대신 data-href를 가진다", () => {
    const out = transform(`${h2("can-fd")}${h3("brs")}<p>가</p>`)
    assert.match(out, /<summary><h2 id="can-fd">can-fd<a role="anchor"[^>]* data-href="#can-fd">/)
    assert.match(out, /<summary><h3 id="brs">brs<a role="anchor"[^>]* data-href="#brs">/)
    assert.doesNotMatch(out, /<summary>(?:(?!<\/summary>).)*(?<!data-)href="#/)
  })

  test("다른 요소 안의 ##는 절을 나누지 않는다", () => {
    const quote = `<blockquote><h2 id="q">q</h2></blockquote>`
    assert.strictEqual(transform(`${h2("a")}${quote}<p>가</p>`), section("a", `${quote}<p>가</p>`))
  })

  test("## 제목이 없는 페이지는 ### 제목이 있어도 그대로 둔다", () => {
    const html = `<p>가</p>${h3("x")}<p>나</p>`
    assert.strictEqual(transform(html), html)
  })
})

// 앵커로 이동할 때 절을 여는 스크립트는 externalResources가 싣는다. 가짜 document와 window로 스크립트를
// 돌려 click 리스너를 받아 두고, 링크 클릭을 흉내 내 절이 열리는지 본다.
describe("collapsible-sections 스크립트", () => {
  const resources = CollapsibleSections().externalResources!({} as BuildCtx)!
  const script = resources.js![0]
  const source = script.contentType === "inline" ? script.script : ""

  test("페이지를 불러온 뒤 도는 인라인 스크립트와 CSS를 싣는다", () => {
    assert.strictEqual(script.loadTime, "afterDOMReady")
    assert.strictEqual(script.contentType, "inline")
    // 브라우저 스크립트는 문자열이라 타입 검사를 받지 않는다. 적어도 문법은 맞아야 한다.
    assert.doesNotThrow(() => new Function(source))
    assert.match(resources.css![0].content, /details\.collapsible-section/)
  })

  class Element {}
  type Section = { open: boolean; parentElement: null }

  // 스크립트를 돌려 document에 건 리스너로 링크 클릭과 SPA 이동을 흉내 내는 함수를 준다. id가 target인
  // 요소는 section 안에 있고, 스크롤된 횟수를 센다. hash는 지금 주소의 해시다.
  function load(section: Section, hash = "") {
    const handlers: Record<string, (event: unknown) => void> = {}
    const target = { closest: () => section, scrolled: 0, scrollIntoView: () => target.scrolled++ }
    const document = {
      addEventListener: (type: string, fn: (event: unknown) => void) => (handlers[type] = fn),
      getElementById: (id: string) => (id === "target" ? target : null),
    }
    const pushed: string[] = []
    const window = {
      addEventListener: () => {},
      history: { pushState: (_state: unknown, _title: string, url: string) => pushed.push(url) },
    }
    const location = {
      origin: "https://wiki.test",
      pathname: "/page",
      href: `https://wiki.test/page${hash}`,
      hash,
    }
    new Function("document", "window", "location", "Element", source)(
      document,
      window,
      location,
      Element,
    )
    return {
      target,
      pushed,
      // 기본 동작(summary라면 절 접기)을 막았는지 돌려준다.
      click: (anchor: object) => {
        let prevented = false
        handlers.click({
          target: Object.assign(new Element(), { closest: () => anchor }),
          preventDefault: () => (prevented = true),
        })
        return prevented
      },
      nav: () => handlers.nav({}),
    }
  }
  const clicker = (section: Section) => load(section).click

  const htmlAnchor = (href: string) => ({ href, getAttribute: () => href })

  test("같은 페이지의 앵커를 누르면 대상이 든 접힌 절을 연다", () => {
    const section = { open: false, parentElement: null }
    clicker(section)(htmlAnchor("https://wiki.test/page#target"))
    assert.strictEqual(section.open, true)
  })

  test("다른 페이지의 앵커는 이 페이지의 절을 열지 않는다", () => {
    const section = { open: false, parentElement: null }
    clicker(section)(htmlAnchor("https://wiki.test/other#target"))
    assert.strictEqual(section.open, false)
  })

  // SVG의 <a>는 href가 문자열이 아니라 SVGAnimatedString이다.
  test("SVG 안의 링크를 눌러도 예외 없이 절을 연다", () => {
    const section = { open: false, parentElement: null }
    const svgAnchor = { href: { baseVal: "#target" }, getAttribute: () => "#target" }
    assert.doesNotThrow(() => clicker(section)(svgAnchor))
    assert.strictEqual(section.open, true)
  })

  test("접는 절 제목의 앵커를 누르면 절을 접지 않고 그 제목으로 옮겨 가 주소에 해시를 남긴다", () => {
    const page = load({ open: true, parentElement: null })
    const anchor = { dataset: { href: "#target" }, getAttribute: () => null }
    assert.strictEqual(page.click(anchor), true)
    assert.strictEqual(page.target.scrolled, 1)
    assert.deepStrictEqual(page.pushed, ["#target"])
  })

  // 해시만 바뀐 뒤로·앞으로 가기에서 라우터는 페이지를 다시 그리고 스크롤하지 않는다. 다시 그리면 대상 위의
  // 접힌 절이 모두 펼쳐져 대상이 아래로 밀린다.
  test("SPA 이동이 끝나면 주소의 해시가 가리키는 대상으로 스크롤한다", () => {
    const page = load({ open: true, parentElement: null }, "#target")
    page.nav()
    assert.strictEqual(page.target.scrolled, 1)
  })

  test("해시가 없는 주소로 이동하면 스크롤하지 않는다", () => {
    const page = load({ open: true, parentElement: null })
    page.nav()
    assert.strictEqual(page.target.scrolled, 0)
  })
})
