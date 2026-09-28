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

const details = (summary: string, body: string) =>
  `<details class="collapsible-section" open><summary>${summary}</summary>${body}</details>`
const section = (id: string, body: string) => details(h2(id), body)
const subsection = (id: string, body: string) => details(h3(id), body)

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

  test("제목의 id와 앵커 링크는 그대로 남는다", () => {
    const out = transform(`${h2("can-fd")}${h3("brs")}<p>가</p>`)
    assert.match(out, /<summary><h2 id="can-fd">can-fd<a role="anchor"[^>]* href="#can-fd">/)
    assert.match(out, /<summary><h3 id="brs">brs<a role="anchor"[^>]* href="#brs">/)
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
