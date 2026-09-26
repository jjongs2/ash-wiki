import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fromHtml } from "hast-util-from-html"
import { unified } from "unified"
import type { Element, Root } from "hast"
import type { BuildCtx } from "../../quartz/util/ctx"
import DiagramWidth from "./index.js"

// 플러그인의 htmlPlugins가 seam이다. 임시 content 폴더에 SVG를 두고, embed가 만든 꼴의 <object>를
// 넣어 그 <object>의 style만 본다.
function transform(files: Record<string, string>, html: string): unknown {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "diagram-width-"))
  for (const [name, source] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(directory, name)), { recursive: true })
    fs.writeFileSync(path.join(directory, name), source)
  }
  const ctx = { argv: { directory } } as BuildCtx
  const processor = unified().use(DiagramWidth().htmlPlugins!(ctx))
  const tree = processor.runSync(fromHtml(html, { fragment: true })) as Root
  return (tree.children[0] as Element).properties.style
}

const embed = (data: string) =>
  `<object data="${data}" type="image/svg+xml" width="auto" height="auto" aria-label=""></object>`

describe("diagram-width 플러그인", () => {
  test("viewBox 폭을 --diagram-width로 붙인다", () => {
    const style = transform(
      {
        "diagrams/ack.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="94.5 0.5 385 252.5"/>`,
      },
      embed("diagrams/ack.svg"),
    )
    assert.strictEqual(style, "--diagram-width: 385")
  })

  test("쉼표로 가른 소수 viewBox도 읽는다", () => {
    const style = transform(
      { "diagrams/wide.svg": `<?xml version="1.0"?>\n<svg viewBox='0,0,749.5,200'></svg>` },
      embed("diagrams/wide.svg"),
    )
    assert.strictEqual(style, "--diagram-width: 749.5")
  })

  test("viewBox를 읽지 못하면 <object>를 그대로 둔다", () => {
    const files = {
      "diagrams/none.svg": `<svg width="100" height="50"><rect viewBox="0 0 10 10"/></svg>`,
      "diagrams/bad.svg": `<svg viewBox="0 0 auto 10"></svg>`,
      "diagrams/zero.svg": `<svg viewBox="0 0 0 10"></svg>`,
    }
    for (const data of ["diagrams/none.svg", "diagrams/bad.svg", "diagrams/zero.svg"]) {
      assert.strictEqual(transform(files, embed(data)), undefined, data)
    }
  })

  test("SVG 파일이 없으면 <object>를 그대로 둔다", () => {
    assert.strictEqual(transform({}, embed("diagrams/missing.svg")), undefined)
  })

  test("SVG가 아닌 <object>는 건드리지 않는다", () => {
    const style = transform(
      { "diagrams/doc.pdf": `<svg viewBox="0 0 100 100"></svg>` },
      `<object data="diagrams/doc.pdf" type="application/pdf"></object>`,
    )
    assert.strictEqual(style, undefined)
  })
})
