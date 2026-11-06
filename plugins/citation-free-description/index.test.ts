import test, { describe } from "node:test"
import assert from "node:assert"
import { fromHtml } from "hast-util-from-html"
import { unified } from "unified"
import { VFile } from "vfile"
import type { BuildCtx } from "../../quartz/util/ctx"
import CitationFreeDescription from "./index"

// 플러그인의 htmlPlugins가 seam이다. citations 플러그인이 돌기 전의 본문(인용이 [@키] 원문인 꼴)을 넣어
// 설명(description)과 검색 본문(text)을 본다.
const processor = () => unified().use(CitationFreeDescription().htmlPlugins!({} as BuildCtx))

async function describePage(html: string, data: Record<string, unknown> = {}) {
  const file = new VFile()
  Object.assign(file.data, data)
  await processor().run(fromHtml(html, { fragment: true }), file)
  return file.data as { description?: string; text?: string }
}

describe("citation-free-description 플러그인", () => {
  test("설명과 검색 본문에서 인용 표시를 뺀다", async () => {
    const { description, text } = await describePage(
      "<p>첫 문장이다.[@a-spec-2024] 둘째 문장은 쉼표 앞에서 인용하고[@b-manual-2023], 끝난다.</p>",
    )
    const expected = "첫 문장이다. 둘째 문장은 쉼표 앞에서 인용하고, 끝난다."
    assert.strictEqual(description, expected)
    assert.strictEqual(text, expected)
  })

  test("공백 뒤의 인용, 이어 쓴 인용, 한 괄호의 여러 키도 빼고 문장 부호 앞에 공백을 남기지 않는다", async () => {
    const { text } = await describePage(
      "<p>하나 [@a-spec-2024]. 둘이다.[@a-spec-2024][@b-manual-2023] 셋 [@a-spec-2024] [@b-manual-2023], 넷.[@a-spec-2024; @b-manual-2023]</p>",
    )
    assert.strictEqual(text, "하나. 둘이다. 셋, 넷.")
  })

  test("인용 표시를 뺀 뒤에 잘라, 키가 차지하던 만큼 설명이 짧아지지 않는다", async () => {
    // 두 문장은 합쳐 150자(description 플러그인의 기본 길이) 안이지만, 키를 넣으면 넘는다.
    const first = "가".repeat(70) + "."
    const second = "나".repeat(70) + "."
    const key = "[@" + "k".repeat(30) + "-spec-2024]"
    const { description } = await describePage(`<p>${first}${key} ${second}${key}</p>`)
    assert.strictEqual(description, `${first} ${second}`)
  })

  test("프론트매터 설명은 그대로 쓰고, 검색 본문에서는 인용 표시를 뺀다", async () => {
    const { description, text } = await describePage("<p>본문이다.[@a-spec-2024]</p>", {
      frontmatter: { title: "제목", description: "프론트매터의 설명" },
    })
    assert.strictEqual(description, "프론트매터의 설명")
    assert.strictEqual(text, "본문이다.")
  })

  test("앞선 플러그인이 정한 설명과 검색 본문은 두고 인용 표시만 뺀다", async () => {
    // 주간 소식 플러그인(plugins/weekly-news)이 호의 두 값을 이 플러그인보다 먼저 정한다.
    const { description, text } = await describePage("<p>본문 전체다.</p>", {
      description: "호의 설명이다.[@a-spec-2024]",
      text: "소식 요약이다 [@a-spec-2024].",
    })
    assert.strictEqual(description, "호의 설명이다.")
    assert.strictEqual(text, "소식 요약이다.")
  })

  test("표의 이웃한 칸과 줄의 글 사이에 공백을 넣는다", async () => {
    // 머리 줄과 몸 줄의 경계(thead, tbody)도 본다.
    const { text } = await describePage(
      "<table><thead><tr><th>프로세스</th><th>범주</th></tr></thead>" +
        "<tbody><tr><td>ACQ.2</td><td>Supplier Request</td></tr><tr><td>MAN.7</td><td>Risk</td></tr></tbody></table>",
    )
    assert.strictEqual(text, "프로세스 범주 ACQ.2 Supplier Request MAN.7 Risk")
  })

  test("본문 트리는 바꾸지 않는다", async () => {
    const tree = fromHtml("<p>첫 문장이다.[@a-spec-2024] 둘째다.</p>", { fragment: true })
    const before = structuredClone(tree)
    await processor().run(tree, new VFile())
    assert.deepStrictEqual(tree, before)
  })
})
