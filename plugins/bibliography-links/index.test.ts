import test, { describe } from "node:test"
import assert from "node:assert"
import { execFileSync } from "node:child_process"
import { fromHtml } from "hast-util-from-html"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import { render } from "preact-render-to-string"
import { unified } from "unified"
import type { Root } from "hast"
import type { Jsx } from "hast-util-to-jsx-runtime"
import type { BuildCtx } from "../../quartz/util/ctx"
import BibliographyLinks from "./index"

// 플러그인의 htmlPlugins와 모듈 로드가 seam이다. citations 플러그인이 만든 꼴의 참고문헌 조각을 넣어
// 빌드처럼 preact로 그린 HTML을 본다. 모듈 로드는 빌드처럼 플래그 없는 node로 따로 본다.
function transform(html: string): string {
  const processor = unified().use(BibliographyLinks().htmlPlugins!({} as BuildCtx))
  const tree = processor.runSync(fromHtml(html, { fragment: true })) as Root
  return render(
    toJsxRuntime(tree, { Fragment, jsx: jsx as Jsx, jsxs: jsxs as Jsx }) as preact.VNode,
  )
}

const entry = (text: string) =>
  `<div id="refs" class="references csl-bib-body"><div class="csl-entry" id="bib-a">` +
  `<div class="csl-left-margin">[1]</div><div class="csl-right-inline">${text}</div></div></div>`

const link = (url: string) =>
  `<a href="${url}" target="_blank" class="external external-link">${url}</a>`

describe("bibliography-links 플러그인", () => {
  test("참고문헌 항목의 URL을 새 탭 링크로 바꾼다", () => {
    const url = "https://www.iso.org/obp/ui/#iso:std:iso:11898:-1:ed-3:v1:en"
    assert.strictEqual(
      transform(entry(`ISO, “Road vehicles.” 2024. [Online]. Available: ${url}`)),
      entry(`ISO, “Road vehicles.” 2024. [Online]. Available: ${link(url)}`),
    )
  })

  test("다른 URL을 품은 아카이브 URL은 링크 하나가 된다", () => {
    const url = "https://web.archive.org/web/20171215103144/http://www.example.com:80/spec.pdf"
    assert.strictEqual(transform(entry(`Available: ${url}`)), entry(`Available: ${link(url)}`))
  })

  test("& 같은 문자가 든 URL도 통째로 링크한다", () => {
    const url = "https://www.itu.int/rec/dologin_pub.asp?lang=e&id=T-REC-V.10&type=items"
    assert.strictEqual(
      transform(entry(`Available: ${url.replaceAll("&", "&amp;")}`)),
      entry(`Available: ${link(url.replaceAll("&", "&amp;"))}`),
    )
  })

  test("다른 요소 뒤에 오는 URL도 링크한다", () => {
    const url = "https://www.example.com/paper.pdf"
    assert.strictEqual(
      transform(entry(`<i>Proc. Conf.</i>, 1993. Available: ${url}`)),
      entry(`<i>Proc. Conf.</i>, 1993. Available: ${link(url)}`),
    )
  })

  test("URL이 없는 항목은 그대로 둔다", () => {
    const html = entry(`SAE, “Class A Application/Definition.” 2022. doi: 10.4271/J2057/1_202212.`)
    assert.strictEqual(transform(html), html)
  })

  test("참고문헌 밖의 URL 텍스트는 그대로 둔다", () => {
    const html = `<p>주소는 https://www.example.com/ 이다.</p><div class="csl-right-inline">https://www.example.com/</div>`
    assert.strictEqual(transform(html), html)
  })

  // 빌드는 불러오지 못한 플러그인을 경고 한 줄만 남기고 건너뛴다. tsx는 머리 주석의 제약을 어겨도 돌려 준다.
  test("플래그 없는 node로 불러온다", () => {
    const url = new URL("./index.ts", import.meta.url).href
    const script = `const m = await import(${JSON.stringify(url)}); console.log(m.manifest.name, typeof m.default)`
    const env = { ...process.env }
    delete env.NODE_OPTIONS
    const out = execFileSync(process.execPath, ["--input-type=module", "-e", script], {
      env,
      encoding: "utf8",
    })
    assert.strictEqual(out.trim(), "bibliography-links function")
  })
})
