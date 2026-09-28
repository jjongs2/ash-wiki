import test, { describe } from "node:test"
import assert from "node:assert"
import { TableOfContents } from "@quartz-community/table-of-contents"
import { render } from "preact-render-to-string"
import type { BuildCtx } from "../../quartz/util/ctx"
import BacklinksCollapse from "./index"

// 플러그인의 externalResources가 seam이다. 접기는 브라우저에서 스크립트가 Backlinks 제목을 버튼으로
// 바꿔 붙이므로 동작은 빌드 결과를 브라우저로 열어 확인하고, 여기서는 실리는 스크립트와 CSS가 목차의
// 접기 표시와 같은지를 목차 컴포넌트와 견주어 본다.
const resources = BacklinksCollapse().externalResources!({} as BuildCtx)!
const script = resources.js![0]
const source = script.contentType === "inline" ? script.script : ""
const css = resources.css![0].content

const toc = TableOfContents()
const tocHtml = render(
  toc({
    fileData: { toc: [{ depth: 1, text: "절", slug: "절" }] },
    cfg: { locale: "en-US" },
  } as unknown as Parameters<typeof toc>[0]) as preact.VNode,
)

// 목차 CSS의 `button.toc-header`로 시작하는 규칙들
function tocHeaderRules(): string[] {
  return String(toc.css)
    .split(/\n(?=\S)/)
    .map((rule) => rule.trim())
    .filter((rule) => rule.startsWith("button.toc-header"))
}

describe("backlinks-collapse 플러그인", () => {
  // 설정 로더는 이 셋 가운데 하나도 없는 transformer를 경고 한 줄만 남기고 건너뛴다(config-loader.ts의
  // validateCategory). 그러면 빌드는 성공하지만 스크립트와 CSS가 실리지 않는다.
  test("설정 로더가 transformer로 받아들인다", () => {
    const plugin = BacklinksCollapse()
    assert.ok(["textTransform", "markdownPlugins", "htmlPlugins"].some((key) => key in plugin))
  })

  test("페이지를 불러온 뒤 도는 인라인 스크립트를 싣는다", () => {
    assert.strictEqual(script.loadTime, "afterDOMReady")
    assert.strictEqual(script.contentType, "inline")
    // 브라우저 스크립트는 문자열이라 타입 검사를 받지 않는다. 적어도 문법은 맞아야 한다.
    assert.doesNotThrow(() => new Function(source))
  })

  test("SPA 이동마다 다시 붙도록 nav 이벤트에 건다", () => {
    assert.match(source, /addEventListener\("nav"/)
  })

  test("접기 표시는 목차의 SVG와 같다", () => {
    const fold = tocHtml.match(/<svg\b[^>]*class="fold"[^>]*>.*?<\/svg>/)?.[0]
    assert.ok(fold, "목차 마크업에서 접기 표시를 찾지 못했다")
    assert.ok(source.includes(fold))
  })

  test("버튼 모양은 목차 제목 버튼의 규칙과 같다", () => {
    const rules = tocHeaderRules()
    assert.notStrictEqual(rules.length, 0)
    for (const rule of rules) {
      assert.ok(css.includes(rule.replaceAll("toc-header", "backlinks-header")), rule)
    }
  })

  test("접힌 목록은 숨긴다", () => {
    assert.match(css, /\.backlinks > ul\.collapsed \{\n {2}display: none;\n\}/)
  })
})
