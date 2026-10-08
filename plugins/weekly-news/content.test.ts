import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import { parseWeeklyNews, weekDays } from "./index"

// 저장소의 주간 소식(content/news/<ISO 주차>.md)을 호마다 읽는다. 형식을 어긴 호는 빌드가 멈추지만 콘텐츠
// 검사기는 news/를 보지 않으므로(ADR 0015), PR 전 확인에서 미리 잡는다. 발행일은 소식 조사의 원문 범위대로
// 그 주(월~일) 안이어야 한다(.claude/skills/wiki-news).
const content = new URL("../../content/", import.meta.url)
const issues = fs
  .readdirSync(new URL("news/", content))
  .filter((file) => file.endsWith(".md") && file !== "index.md")

describe("content/news의 주간 소식", () => {
  for (const file of issues) {
    const name = file.slice(0, -".md".length)
    const source = fs.readFileSync(new URL(`news/${file}`, content), "utf8")
    const { items, errors } = parseWeeklyNews(name, source)

    test(`${name}: 형식 함수로 읽힌다`, () => {
      assert.deepStrictEqual(
        errors.map((error) => `${error.line}: ${error.message}`),
        [],
      )
    })

    test(`${name}: 구역마다 태그 표시 이름 파일이 있다`, () => {
      const unknown = [...new Set(items.flatMap((item) => item.regions))].filter(
        (region) => !fs.existsSync(new URL(`tags/${region}.md`, content)),
      )
      assert.deepStrictEqual(unknown, [])
    })

    test(`${name}: 발행일이 그 주 안이다`, () => {
      const { start, end } = weekDays(name)
      const outside = items
        .filter((item) => item.date < start || item.date > end)
        .map((item) => `${item.date} ${item.title}`)
      assert.deepStrictEqual(outside, [])
    })
  }
})
