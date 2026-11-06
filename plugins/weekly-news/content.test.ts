import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import { koreanTitlePresence, parseWeeklyNews, weekDays } from "./index"

// 저장소의 주간 소식(content/news/<ISO 주차>.md)을 호마다 읽는다. 형식을 어긴 호는 빌드가 멈추지만 콘텐츠
// 검사기는 news/를 보지 않으므로(ADR 0015), PR 전 확인에서 미리 잡는다. 발행일은 소식 조사의 기간 기준대로
// 그 주(월~일) 안이어야 한다(.claude/skills/wiki-news의 4. 고르기).
// 한국어 제목은 KOREAN_TITLE_FROM 주차부터의 호에서 있을 자리에만 있어야 한다(koreanTitlePresence). 그 앞의 호는 고치지 않고, 대문과 메타 설명이 원어 제목으로 대신한다(docs/weekly-news.md).
// 소유자가 PR에서 주요 표시를 옮긴 것도 여기서 잡는다.
const KOREAN_TITLE_FROM = "2026-w45"
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

    if (name >= KOREAN_TITLE_FROM) {
      test(`${name}: 한국어 제목이 필요한 주요 소식에만 있다`, () => {
        const wrong = items.flatMap((item) => {
          const problem = koreanTitlePresence(item)
          return problem ? [`${problem}: ${item.title}`] : []
        })
        assert.deepStrictEqual(wrong, [])
      })
    }
  }
})
