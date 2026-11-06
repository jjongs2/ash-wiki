import test, { after, describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fromHtml } from "hast-util-from-html"
import { render } from "preact-render-to-string"
import { unified } from "unified"
import type { Element, Root } from "hast"
import type { BuildCtx } from "../../quartz/util/ctx"
import type { FilePath } from "../../quartz/util/path"
import { htmlToJsx } from "../../quartz/util/jsx"
import DiagramName from "./index"

// 플러그인의 htmlPlugins가 seam이다. 임시 content 폴더에 SVG를 두고, embed가 만든 꼴의
// <object>를 넣어 그 <object>의 속성과, 사이트처럼 직렬화한 HTML을 본다.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "diagram-name-"))
after(() => fs.rmSync(tmp, { recursive: true, force: true }))

function transform(files: Record<string, string>, html: string): Element {
  const directory = fs.mkdtempSync(path.join(tmp, "content-"))
  for (const [name, source] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(directory, name)), { recursive: true })
    fs.writeFileSync(path.join(directory, name), source)
  }
  const ctx = { argv: { directory } } as BuildCtx
  const processor = unified().use(DiagramName().htmlPlugins!(ctx))
  const tree = processor.runSync(fromHtml(html, { fragment: true })) as Root
  return tree.children[0] as Element
}

// obsidian-flavored-markdown의 embed가 만드는 꼴. alt는 `![[…|alt]]`의 `|` 뒤 글자이다.
const embed = (data: string, alt = "") =>
  `<object data="${data}" type="image/svg+xml" width="auto" height="auto" aria-label="${alt}"></object>`

// 페이지 렌더(quartz/components/renderPage.tsx)와 같은 길로 직렬화한 HTML을 브라우저처럼 다시 읽어,
// 화면 낭독기가 받을 이름을 본다.
function renderedName(element: Element): unknown {
  const root: Root = { type: "root", children: [element] }
  const html = render(htmlToJsx("test.md" as FilePath, root))
  return (fromHtml(html, { fragment: true }).children[0] as Element).properties.ariaLabel
}

describe("diagram-name 플러그인", () => {
  test("SVG 루트의 aria-label을 <object>의 이름으로 주고 img 역할을 붙인다", () => {
    const object = transform(
      {
        "diagrams/fields.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" aria-label="데이터 프레임의 필드마다 검사하는 오류"/>`,
      },
      embed("diagrams/fields.svg"),
    )
    assert.strictEqual(object.properties.role, "img")
    assert.strictEqual(renderedName(object), "데이터 프레임의 필드마다 검사하는 오류")
  })

  test('SVG의 엔티티를 풀어 &, ", <가 든 이름도 같은 글자로 나온다', () => {
    const object = transform(
      {
        "diagrams/q.svg": `<svg aria-label="A &amp; B, &quot;C&quot; &lt; D&#x2019;s &apos;E&apos; &#60;F&gt;"></svg>`,
      },
      embed("diagrams/q.svg"),
    )
    assert.strictEqual(renderedName(object), `A & B, "C" < D’s 'E' <F>`)
    const single = transform(
      { "diagrams/single.svg": `<svg aria-label='그의 "인용" &amp; 끝'></svg>` },
      embed("diagrams/single.svg"),
    )
    assert.strictEqual(renderedName(single), `그의 "인용" & 끝`)
  })

  test("embed에 alt가 있어도 SVG의 이름으로 덮는다", () => {
    const object = transform(
      { "diagrams/ack.svg": `<svg viewBox="0 0 10 10" aria-label="ACK 슬롯"></svg>` },
      embed("diagrams/ack.svg", "embed의 alt"),
    )
    assert.strictEqual(renderedName(object), "ACK 슬롯")
  })

  test("SVG에 이름이 없거나 파일이 없으면 <object>를 그대로 둔다", () => {
    const files = {
      "diagrams/none.svg": `<svg viewBox="0 0 10 10"><g aria-label="안쪽 이름"/></svg>`,
      "diagrams/blank.svg": `<svg aria-label="  "></svg>`,
    }
    for (const data of ["diagrams/none.svg", "diagrams/blank.svg", "diagrams/missing.svg"]) {
      const object = transform(files, embed(data))
      assert.strictEqual(object.properties.role, undefined, data)
      assert.strictEqual(object.properties.ariaLabel, "", data)
    }
  })

  test("SVG가 아닌 <object>는 건드리지 않는다", () => {
    const object = transform(
      { "diagrams/doc.pdf": `<svg aria-label="이름"></svg>` },
      `<object data="diagrams/doc.pdf" type="application/pdf"></object>`,
    )
    assert.strictEqual(object.properties.role, undefined)
    assert.strictEqual(object.properties.ariaLabel, undefined)
  })
})
