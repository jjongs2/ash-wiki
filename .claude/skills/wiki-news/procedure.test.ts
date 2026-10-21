import test, { describe } from "node:test"
import assert from "node:assert"
import { checkProcedure, sources, type Access } from "./procedure"

// npx tsx --test .claude/skills/wiki-news/procedure.test.ts

const outletsMd = [
  "# 매체 목록과 검색 질의",
  "",
  "## 매체 목록",
  "",
  "<!-- prettier-ignore -->",
  "| 매체 | 구역 | 찾는 법 | 거르기 | 비고 |",
  "|---|---|---|---|---|",
  "| Vector | network | 피드 `https://vector.com/feed` | 제목으로 고름 | 무료 |",
  "| KISA | security | 검색 질의 `https://news.google.com/rss/search?q=KISA+after:<월요일>+before:<다음 월요일>` | 제목으로 고름 | 드물게 냄 |",
  "| KBA | 기타 | 검색 질의 `https://kba-online.de/export?format=csv`(리콜 전체 CSV) | 제목으로 고름 | 무료 |",
  "",
  "## 검색 질의",
  "",
  "- **arXiv** (전체): `https://export.arxiv.org/api/query`",
  "- **Google News network** (network): `https://news.google.com/rss/search?q=CAN`",
  "",
  "- **arXiv**: 날짜는 UTC다.",
  "",
  "## 받지 않은 후보",
  "",
  "| 매체 | 확인일 | 사유 |",
  "|---|---|---|",
  "| Bosch | 2026-10-14 | 꾸준함 미달 |",
  "",
].join("\n")

const opened = (source: string, week = ""): Access => ({ source, week, opened: true })

describe("살필 곳", () => {
  test("매체 목록의 매체와 검색 질의를 읽고, 날짜를 채우는 검색 질의는 주차마다 본다", () => {
    assert.deepStrictEqual(sources(outletsMd), [
      { name: "Vector", perWeek: false },
      { name: "KISA", perWeek: true },
      { name: "KBA", perWeek: false },
      { name: "arXiv", perWeek: true },
      { name: "Google News network", perWeek: true },
    ])
  })
})

describe("절차 검사", () => {
  const all = sources(outletsMd)

  test("한 주 조사는 곳마다 연 기록이 하나 있으면 통과한다", () => {
    const report = checkProcedure({
      sources: all,
      weeks: ["2026-w41"],
      records: ["Vector", "KISA", "KBA", "arXiv", "Google News network"].map((s) => opened(s)),
    })
    assert.deepStrictEqual(report.failures, [])
  })

  test("기록이 없는 곳은 실패다", () => {
    const report = checkProcedure({
      sources: all,
      weeks: ["2026-w41"],
      records: [opened("Vector"), opened("KBA"), opened("arXiv"), opened("Google News network")],
    })
    assert.deepStrictEqual(report.failures, ["KISA: 기록이 없다"])
  })

  test("열지 않았는데 이유가 없으면 실패이고, 이유가 있으면 열지 않은 곳으로 알린다", () => {
    const report = checkProcedure({
      sources: all,
      weeks: ["2026-w41"],
      records: [
        { source: "Vector", opened: false, reason: "" },
        { source: "KISA", opened: false, reason: "Google News 503이 1시간 이어짐" },
        opened("KBA"),
        opened("arXiv"),
        opened("Google News network"),
      ],
    })
    assert.deepStrictEqual(report.failures, ["Vector: 열지 않았고 이유가 없다"])
    assert.deepStrictEqual(report.unopened, ["KISA: Google News 503이 1시간 이어짐"])
  })

  test("소급 조사에서 검색 질의는 주차마다 기록이 있어야 하고, 피드는 달 전체 기록 하나로 된다", () => {
    const report = checkProcedure({
      sources: all,
      weeks: ["2026-w36", "2026-w37"],
      records: [
        opened("Vector"),
        opened("KBA"),
        opened("KISA", "2026-w36"),
        opened("KISA", "2026-w37"),
        opened("arXiv"),
        opened("Google News network", "2026-w36"),
      ],
    })
    assert.deepStrictEqual(report.failures, [
      "arXiv 2026-w36: 기록이 없다(검색 질의는 주차마다 한 줄씩 적는다)",
      "arXiv 2026-w37: 기록이 없다(검색 질의는 주차마다 한 줄씩 적는다)",
      "Google News network 2026-w37: 기록이 없다(검색 질의는 주차마다 한 줄씩 적는다)",
    ])
  })

  test("한 번이라도 열었으면 같은 곳의 다른 실패 기록은 보지 않는다", () => {
    const report = checkProcedure({
      sources: [{ name: "Vector", perWeek: false }],
      weeks: ["2026-w41"],
      records: [{ source: "Vector", opened: false, reason: "" }, opened("Vector")],
    })
    assert.deepStrictEqual(report.failures, [])
  })

  test('opened가 불리언 true가 아니면(문자열 "false" 등) 연 것으로 보지 않는다', () => {
    const report = checkProcedure({
      sources: [{ name: "Vector", perWeek: false }],
      weeks: ["2026-w41"],
      records: [{ source: "Vector", opened: "false" as unknown as boolean, reason: "" }],
    })
    assert.deepStrictEqual(report.failures, ["Vector: 열지 않았고 이유가 없다"])
  })

  test("얕은 피드, 비고와 다른 접속 결과, 목록에 없는 이름을 알린다", () => {
    const report = checkProcedure({
      sources: [{ name: "Vector", perWeek: false }],
      weeks: ["2026-w41"],
      records: [
        {
          ...opened("Vector"),
          shallow: "2026-10-08",
          differs: "피드 주소가 /news/feed로 옮김(사이트 쪽)",
        },
        opened("Vectr"),
        opened("자유 검색 network"),
      ],
    })
    assert.deepStrictEqual(report.shallow, ["Vector: 가장 오래된 글 2026-10-08"])
    assert.deepStrictEqual(report.differs, ["Vector: 피드 주소가 /news/feed로 옮김(사이트 쪽)"])
    assert.deepStrictEqual(report.unknown, ["Vectr"])
  })
})
