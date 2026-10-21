import test, { describe } from "node:test"
import assert from "node:assert"
import {
  exclusionCandidates,
  isoWeek,
  normalizeUrl,
  pastMatches,
  sameEvents,
  verdictTable,
  type Candidate,
  type PastItem,
} from "./merge"

// npx tsx --test .claude/skills/wiki-news/merge.test.ts

// 기본 제목은 후보마다 겹치는 바이그램이 없게 번호의 글자를 늘어놓는다.
function candidate(id: string, fields: Partial<Candidate> = {}): Candidate {
  return {
    id,
    week: "2026-w37",
    title: [...id].map((ch) => ch.repeat(4)).join(" "),
    url: `https://example.org/${id}`,
    outlet: "Vector",
    date: "2026-09-08",
    verdict: "싣기",
    reason: "",
    ...fields,
  }
}

function past(fields: Partial<PastItem> = {}): PastItem {
  return {
    week: "2026-w14",
    title: "Old news",
    url: "https://example.org/old",
    outlet: "NHTSA",
    date: "2026-03-30",
    summary: "",
    ...fields,
  }
}

describe("주소와 주차", () => {
  test("주소는 호스트의 www, 끝의 /, 조각, utm_ 쿼리를 떼고 견준다", () => {
    assert.strictEqual(
      normalizeUrl("https://www.Example.org/a/?utm_source=x&id=3#top"),
      normalizeUrl("https://example.org/a?id=3"),
    )
  })

  test("날짜의 ISO 주차", () => {
    assert.strictEqual(isoWeek("2026-08-31"), "2026-w36")
    assert.strictEqual(isoWeek("2026-09-27"), "2026-w39")
    assert.strictEqual(isoWeek("2027-01-01"), "2026-w53")
  })
})

describe("같은 사건 묶음", () => {
  test("같은 주소, 본 주소, 같은 리콜 번호, 같은 사건 키, 비슷한 제목을 묶고 이유를 단다", () => {
    const groups = sameEvents([
      candidate("A01", { url: "https://www.example.org/x/", title: "Vector releases CANoe 19" }),
      candidate("C02", { url: "https://example.org/x", title: "Vector Releases CANoe 19" }),
      candidate("B01", { same_event_seen_at: ["https://example.org/y"] }),
      candidate("C03", { url: "https://example.org/y", title: "Totally different" }),
      candidate("F01", { title: "Recall 26V213: Ford Mustang Mach-E rearview camera" }),
      candidate("F02", {
        outlet: "KBA",
        title: "Ford Mustang Mach-E Rückruf",
        event: { org: "Ford", subject: "26V213" },
      }),
      candidate("B02", { event: { org: "Infineon", subject: "TLE9744QK" } }),
      candidate("C04", { event: { org: "Infineon Technologies", subject: "TLE9744-QK" } }),
      candidate("D01", { title: "Eclipse S-CORE v1.0 released" }),
      candidate("E01", { title: "Eclipse S-CORE v1.0 Released!" }),
      candidate("E02", { title: "Unrelated" }),
      candidate("F05", { title: "Recall 26V301: Ford Mustang Mach-E rearview camera" }),
      candidate("E03", { url: "https://example.org/x", verdict: "빼기" }),
    ])
    assert.deepStrictEqual(groups, [
      { ids: ["A01", "C02"], reasons: ["같은 주소: A01, C02"] },
      { ids: ["B01", "C03"], reasons: ["B01이 본 주소: C03"] },
      { ids: ["F01", "F02"], reasons: ["같은 리콜 번호 26V213: F01, F02"] },
      { ids: ["B02", "C04"], reasons: ["같은 사건 키 TLE9744QK: B02, C04"] },
      { ids: ["D01", "E01"], reasons: ["비슷한 제목: D01, E01"] },
    ])
  })

  test("목록 주소처럼 같은 주소에 제목이 다른 후보는 주소로 묶지 않는다", () => {
    const list = "https://www.kba-online.de/rrdb/buerger/api/rueckruf/export?format=csv&type=cars"
    const groups = sameEvents([
      candidate("F03", { url: list, title: "Rückruf BMW X5 Steuergerät" }),
      candidate("F04", { url: list, title: "Rückruf Mercedes-Benz Sprinter Software" }),
    ])
    assert.deepStrictEqual(groups, [])
  })
})

describe("지난 호와 같은 사건", () => {
  test("주소, 리콜 번호, 사건 키, 비슷한 제목으로 지난 호 항목을 찾는다", () => {
    const items = [
      past({
        title: "Recall 26V213: Ford Mustang Mach-E",
        url: "https://www.nhtsa.gov/recalls?nhtsaId=26V213",
      }),
      past({
        week: "2026-w30",
        title: "Eclipse S-CORE v0.8",
        outlet: "Eclipse SDV",
        summary: "Eclipse 재단이 S-CORE 0.8을 냈다.",
      }),
      past({ week: "2026-w31", title: "AV Framework Updates", url: "https://example.org/av" }),
    ]
    const found = (c: Candidate) =>
      pastMatches(c, items).map((m) => `${m.item.week} ${m.reasons.join(", ")}`)
    assert.deepStrictEqual(found(candidate("F02", { event: { org: "Ford", subject: "26V213" } })), [
      "2026-w14 같은 리콜 번호 26V213",
    ])
    assert.deepStrictEqual(
      found(candidate("A07", { event: { org: "Eclipse", subject: "S-CORE" } })),
      ["2026-w30 같은 사건 키 S-CORE"],
    )
    assert.deepStrictEqual(found(candidate("A06", { url: "https://example.org/av/" })), [
      "2026-w31 같은 주소",
    ])
    assert.deepStrictEqual(found(candidate("A08", { title: "AV Framework Update" })), [
      "2026-w31 비슷한 제목",
    ])
    assert.deepStrictEqual(
      found(candidate("A09", { event: { org: "Vector", subject: "S-CORE" } })),
      [],
    )
  })
})

describe("판정표", () => {
  test("호에 실린 후보는 실림, 검토가 뺀 것과 조사가 뺀 것은 뺌이고, 이유 없이 빠진 후보를 알린다", () => {
    const { markdown, missing } = verdictTable(
      [
        candidate("A01", { date: "2026-09-09" }),
        candidate("A02", { verdict: "빼기", reason: "문턱: 새 사양 없음" }),
        candidate("C01", { title: "Third party ~ story", url: "https://example.org/c01" }),
        candidate("C02"),
        candidate("C03"),
      ],
      [
        { url: "https://example.org/C02", result: "뺌", reason: "기간: 8월 발표의 재소개" },
        {
          url: "https://vendor.example/pr",
          from: "https://example.org/c01",
          result: "고침",
          reason: "1차 발표로 바꿈",
        },
      ],
      [
        {
          url: "https://example.org/A01",
          title: "AAAA 0000 1111",
          outlet: "Vector",
          date: "2026-09-09",
        },
        {
          url: "https://vendor.example/pr",
          title: "Vendor PR",
          outlet: "Vendor",
          date: "2026-09-08",
        },
        {
          url: "https://example.org/extra",
          title: "Extra | item",
          outlet: "Vector",
          date: "2026-09-10",
        },
      ],
    )
    assert.deepStrictEqual(missing, ["C03"])
    assert.deepStrictEqual(markdown.split("\n"), [
      "<details><summary>후보 판정표 6건(실림 3, 뺌 3)</summary>",
      "",
      "| 번호 | 날짜 | 매체 | 제목 | 판정 | 이유 |",
      "| --- | --- | --- | --- | --- | --- |",
      "| A02 | 2026-09-08 | Vector | AAAA 0000 2222 | 뺌 | 문턱: 새 사양 없음 |",
      "| C01 | 2026-09-08 | Vector | Third party \\~ story | 실림 | 검토: 1차 발표로 바꿈 |",
      "| C02 | 2026-09-08 | Vector | CCCC 0000 2222 | 뺌 | 검토: 기간: 8월 발표의 재소개 |",
      "| C03 | 2026-09-08 | Vector | CCCC 0000 3333 | 뺌 | 이유 없음 |",
      "| A01 | 2026-09-09 | Vector | AAAA 0000 1111 | 실림 |  |",
      "| - | 2026-09-10 | Vector | Extra \\| item | 실림 | 후보 밖에서 더함 |",
      "",
      "</details>",
    ])
  })
})

describe("빼는 기준의 셋째 조건", () => {
  test("13주 호에 항목이 없는 매체를 내고, 드물게 냄과 배포처는 뺀다", () => {
    const md = [
      "## 매체 목록",
      "",
      "| 매체 | 구역 | 찾는 법 | 거르기 | 비고 |",
      "|---|---|---|---|---|",
      "| Vector | network | 피드 | 제목으로 고름 | 무료 |",
      "| KISA | security | 검색 질의 | 제목으로 고름 | 드물게 냄. 무료 |",
      "| PR Newswire | 기타 | 뉴스룸 | 제목으로 고름 | 배포처. 무료 |",
      "| ETAS | sw-engineering | 피드 | 제목으로 고름 | 무료 |",
      "",
    ].join("\n")
    assert.deepStrictEqual(exclusionCandidates(md, new Map([["Vector", 3]])), ["ETAS"])
  })
})
