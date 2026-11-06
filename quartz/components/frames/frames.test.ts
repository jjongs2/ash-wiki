import test, { describe } from "node:test"
import assert from "node:assert"
import { resolveFrame, frameRegistry } from "./index"
import { DefaultFrame } from "./DefaultFrame"
import { FullWidthFrame } from "./FullWidthFrame"
import { MinimalFrame } from "./MinimalFrame"
import type { PageFrame, PageFrameProps } from "./types"
import { h } from "preact"
import { render } from "preact-render-to-string"
import type { QuartzComponent } from "../types"

const customFrame: PageFrame = {
  name: "custom-test-frame",
  render: () => null as any,
}

describe("resolveFrame", () => {
  test("returns DefaultFrame for undefined", () => {
    assert.strictEqual(resolveFrame(undefined), DefaultFrame)
  })

  test("returns DefaultFrame for 'default'", () => {
    assert.strictEqual(resolveFrame("default"), DefaultFrame)
  })

  test("returns named built-in frame", () => {
    assert.strictEqual(resolveFrame("full-width"), FullWidthFrame)
  })

  test("returns DefaultFrame for unknown frame name", () => {
    assert.strictEqual(resolveFrame("nonexistent"), DefaultFrame)
  })

  test("plugin-registered frame takes priority", () => {
    frameRegistry.register("custom-test-frame", customFrame, "test-plugin")
    const result = resolveFrame("custom-test-frame")
    assert.strictEqual(result, customFrame)
  })

  test("returns DefaultFrame for unknown name even with plugin frames registered", () => {
    frameRegistry.register("custom-test-frame", customFrame, "test-plugin")
    const result = resolveFrame("totally-unknown")
    assert.strictEqual(result, DefaultFrame)
  })
})

// ash-wiki: 프레임이 그리는 랜드마크를 본다(#633). 칸마다 표시용 컴포넌트 하나를 넣고 렌더한 HTML에서 그
// 컴포넌트를 감싼 요소를 찾는다.
describe("frame landmarks", () => {
  const marker =
    (name: string): QuartzComponent =>
    () =>
      h("span", { "data-marker": name })
  const props = {
    componentData: {} as PageFrameProps["componentData"],
    head: marker("head"),
    header: [],
    beforeBody: [marker("beforeBody")],
    pageBody: marker("body"),
    afterBody: [marker("afterBody")],
    left: [marker("left")],
    right: [marker("right")],
    footer: [],
  } as PageFrameProps
  const html = (frame: PageFrame) => render(h("div", {}, frame.render(props)))

  test("built-in frames wrap the page body in one focusable <main>", () => {
    for (const frame of [DefaultFrame, FullWidthFrame, MinimalFrame]) {
      const source = html(frame)
      assert.strictEqual(source.match(/<main\b/g)?.length, 1, frame.name)
      assert.match(source, /<main\b[^>]*\bid="quartz-main"[^>]*\btabindex="-1"/, frame.name)
      assert.match(source, /<main\b[^>]*>[\s\S]*data-marker="body"[\s\S]*<\/main>/, frame.name)
    }
  })

  test("default frame puts the page header and footer inside <main>", () => {
    const source = html(DefaultFrame)
    const main = source.slice(source.indexOf("<main"), source.indexOf("</main>"))
    assert.match(main, /data-marker="beforeBody"/)
    assert.match(main, /data-marker="afterBody"/)
  })

  test("default frame makes the left sidebar a banner and the right sidebar complementary", () => {
    const source = html(DefaultFrame)
    assert.match(source, /<div\b[^>]*\brole="banner"[^>]*><span data-marker="left"/)
    assert.match(source, /<aside\b[^>]*><span data-marker="right"/)
  })
})
