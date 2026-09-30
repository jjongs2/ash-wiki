import test, { describe } from "node:test"
import assert from "node:assert"
import type { BuildCtx } from "../../quartz/util/ctx"
import { loadConventions } from "../../tools/check-content/conventions"
import DiagramTheme, { readPalette } from "./index"

// externalResources가 싣는 스크립트가 seam이다. 가짜 document로 스크립트를 돌려 리스너를 받아 두고,
// 도해 <object>의 load, themechange, SPA 이동을 흉내 내 SVG 루트에 들어간 값을 본다.
const resources = DiagramTheme().externalResources!({} as BuildCtx)!
const script = resources.js![0]
const source = script.contentType === "inline" ? script.script : ""
const rows = loadConventions().table("diagram-palette", ["이름", "라이트", "다크"])
const table = (column: "라이트" | "다크") =>
  Object.fromEntries(rows.map((row) => [row["이름"], row[column]]))

// 사이트 색 토큰의 계산된 값. 테마마다 다르다.
const site = {
  light: { "--darkgray": "#2f363f", "--lightgray": "#e1e7ee" },
  dark: { "--darkgray": "#d4d8dc", "--lightgray": "#25292f" },
}
const resolved = (column: "라이트" | "다크", theme: "light" | "dark") =>
  Object.fromEntries(
    Object.entries(table(column)).map(([name, value]) => [
      `--${name}`,
      value.startsWith("#") ? value : site[theme][`--${value}` as "--darkgray"],
    ]),
  )

const origin = "https://wiki.test/"

// data는 <object>의 data 속성이고, 든 문서는 그 주소에서 읽은 것이다.
class FakeObject {
  dataset: Record<string, string> = {}
  properties: Record<string, string> = {}
  contentDocument: { URL: string; documentElement: object } | null
  data = "diagrams/a.svg"
  constructor(root: "svg" | "html" | null) {
    const style = { setProperty: (name: string, value: string) => (this.properties[name] = value) }
    this.contentDocument = root && {
      URL: origin + this.data,
      documentElement: { localName: root, style },
    }
  }
  matches = (selector: string) => selector === 'object[type="image/svg+xml"]'
  getAttribute = (name: string) => (name === "data" ? this.data : null)
}

function load(objects: FakeObject[], theme: "light" | "dark" = "light") {
  const handlers: Record<string, (event: unknown) => void> = {}
  const state = { theme }
  const document = {
    documentElement: { getAttribute: (name: string) => (name === "saved-theme" ? state.theme : null) },
    addEventListener: (type: string, fn: (event: unknown) => void) => (handlers[type] = fn),
    querySelectorAll: () => objects,
  }
  const getComputedStyle = () => ({
    getPropertyValue: (name: string) => ` ${site[state.theme][name as "--darkgray"]}`,
  })
  const location = { href: `${origin}page` }
  new Function("document", "getComputedStyle", "location", source)(
    document,
    getComputedStyle,
    location,
  )
  return {
    fire: (type: string, target?: object) => handlers[type]({ target }),
    setTheme: (next: "light" | "dark") => (state.theme = next),
  }
}

describe("diagram-theme 플러그인", () => {
  test("페이지를 불러온 뒤 도는 인라인 스크립트와 CSS를 싣는다", () => {
    assert.strictEqual(script.loadTime, "afterDOMReady")
    assert.strictEqual(script.contentType, "inline")
    // 브라우저 스크립트는 문자열이라 타입 검사를 받지 않는다. 적어도 문법은 맞아야 한다.
    assert.doesNotThrow(() => new Function(source))
    assert.match(resources.css![0].content, /html\[saved-theme\] object.*:not\(\[data-themed\]\)/)
  })

  test("도해 팔레트 표의 이름마다 라이트·다크 값을 싣는다", () => {
    const palette = readPalette(
      [
        "<!-- table: diagram-palette -->",
        "",
        "| 이름 | 라이트 | 다크 | 대체값 |",
        "| --- | --- | --- | --- |",
        "| `ink` | `#666d75` | `#7e868e` | `#727981` |",
        "| `text` | `darkgray` | `darkgray` | `#727981` |",
      ].join("\n"),
    )
    assert.deepStrictEqual(palette, {
      ink: { light: "#666d75", dark: "#7e868e" },
      text: { light: "darkgray", dark: "darkgray" },
    })
    assert.throws(() => readPalette("| 이름 |\n"), /도해 팔레트 표가 없다/)
  })

  test("스크립트보다 먼저 다 읽은 도해를 현재 테마로 칠한다", () => {
    const object = new FakeObject("svg")
    load([object], "dark")
    assert.deepStrictEqual(object.properties, resolved("다크", "dark"))
    assert.strictEqual(object.dataset.themed, "")
  })

  test("도해의 load를 받아 칠한다", () => {
    // 스크립트가 돌 때는 아직 SVG 문서가 없다.
    const object = new FakeObject("svg")
    const svgDocument = object.contentDocument
    object.contentDocument = null
    const page = load([object])
    assert.deepStrictEqual(object.properties, {})
    assert.strictEqual(object.dataset.themed, undefined)
    object.contentDocument = svgDocument
    page.fire("load", object)
    assert.deepStrictEqual(object.properties, resolved("라이트", "light"))
  })

  test("테마를 바꾸면 모든 도해를 새 테마로 다시 칠한다", () => {
    const objects = [new FakeObject("svg"), new FakeObject("svg")]
    const page = load(objects)
    page.setTheme("dark")
    page.fire("themechange")
    for (const object of objects) assert.deepStrictEqual(object.properties, resolved("다크", "dark"))
  })

  test("SPA 이동 뒤 남은 도해를 다시 칠해 표시를 되살린다", () => {
    const object = new FakeObject("svg")
    const page = load([object])
    delete object.dataset.themed
    page.fire("nav")
    assert.strictEqual(object.dataset.themed, "")
  })

  // SPA 이동은 같은 자리의 <object>를 남긴 채 data만 바꾸기도 한다. 그 사이 옛 문서의 표시가 남으면 새
  // 도해가 대체값으로 먼저 보인다.
  test("SPA 이동으로 data만 바뀐 도해는 새 문서를 읽을 때까지 표시를 뗀다", () => {
    const object = new FakeObject("svg")
    const page = load([object])
    object.data = "diagrams/b.svg"
    page.fire("nav")
    assert.strictEqual(object.dataset.themed, undefined)
    object.contentDocument!.URL = origin + object.data
    page.fire("load", object)
    assert.strictEqual(object.dataset.themed, "")
  })

  test("SVG가 아니거나 읽지 못한 도해는 칠하지 않되 가려 두지 않는다", () => {
    const html = new FakeObject("html")
    const failed = new FakeObject(null)
    const page = load([html, failed])
    page.fire("load", html)
    page.fire("error", failed)
    assert.deepStrictEqual(html.properties, {})
    assert.strictEqual(html.dataset.themed, "")
    assert.strictEqual(failed.dataset.themed, "")
  })

  test("도해가 아닌 요소의 load는 건드리지 않는다", () => {
    const page = load([])
    const image = { dataset: {} as Record<string, string>, matches: () => false }
    page.fire("load", image)
    assert.deepStrictEqual(image.dataset, {})
    assert.doesNotThrow(() => page.fire("load", undefined))
  })
})
