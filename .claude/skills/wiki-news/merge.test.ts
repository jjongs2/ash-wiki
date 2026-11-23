import test, { describe } from "node:test"
import assert from "node:assert"
import {
  exclusionCandidates,
  isoWeek,
  lateMisses,
  newsIssueWeeks,
  newsPulls,
  normalizeUrl,
  parseVerdictTable,
  pastMatches,
  recentWeeks,
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
      candidate("B03", { event: { org: "Vector", subject: "CANoe 19" } }),
      candidate("C05", { event: { org: "Vector Informatik", subject: "CANoe 19 release" } }),
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
      { ids: ["B03", "C05"], reasons: ["같은 사건 키 CANoe 19: B03, C05"] },
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

describe("판정표의 실림", () => {
  const list = "https://www.kba-online.de/rrdb/buerger/api/rueckruf/export?format=csv&type=cars"
  const published = (url: string, title: string) => ({
    url,
    title,
    outlet: "KBA",
    date: "2026-09-08",
  })
  const summary = (markdown: string) => markdown.split("\n")[0]

  test("호에 실린 주소와 같은 주소를 가진 뺀 후보는 뺌이고, 실림 수가 호의 소식 항목 수와 같다", () => {
    const issue = [
      published("https://www.infineon.com/pr/1", "Infineon AURIX TC5"),
      published(list, "Rückruf BMW X5 Steuergerät"),
    ]
    const { markdown, missing } = verdictTable(
      [
        candidate("A01", { url: "https://www.infineon.com/pr/1", title: "Infineon AURIX TC5" }),
        candidate("C01", {
          url: "https://infineon.com/pr/1/",
          verdict: "빼기",
          reason: "같은 사건 중복: A01",
        }),
        candidate("F01", { url: list, title: "Rückruf BMW X5 Steuergerät" }),
        candidate("F02", {
          url: list,
          title: "Rückruf Opel Corsa Kabelbaum",
          verdict: "빼기",
          reason: "범위 밖: 하드웨어 리콜",
        }),
      ],
      [],
      issue,
    )
    assert.deepStrictEqual(missing, [])
    assert.strictEqual(
      summary(markdown),
      "<details><summary>후보 판정표 4건(실림 2, 뺌 2)</summary>",
    )
    assert.match(markdown, /\| C01 \|.*\| 뺌 \| 같은 사건 중복: A01 \|/)
    assert.match(markdown, /\| F02 \|.*\| 뺌 \| 범위 밖: 하드웨어 리콜 \|/)
  })

  test("같은 주소의 싣기 후보가 둘인데 호에 하나만 실렸으면, 남은 후보는 이유 없음으로 알린다", () => {
    const { markdown, missing } = verdictTable(
      [
        candidate("F01", { url: list, title: "Rückruf BMW X5 Steuergerät" }),
        candidate("F02", { url: list, title: "Rückruf Mercedes Sprinter Software" }),
      ],
      [],
      [published(list, "Rückruf Mercedes Sprinter Software")],
    )
    assert.deepStrictEqual(missing, ["F01"])
    assert.strictEqual(
      summary(markdown),
      "<details><summary>후보 판정표 2건(실림 1, 뺌 1)</summary>",
    )
    assert.match(markdown, /\| F02 \|.*\| 실림 \|/)
  })

  test("열리지 않음으로 뺀 후보를 따로 낸다", () => {
    const { unopened } = verdictTable(
      [
        candidate("B01", { verdict: "빼기", reason: "열리지 않음: 원문 403, 기사 없음" }),
        candidate("B02", { verdict: "빼기", reason: "문턱: 새 사양 없음" }),
      ],
      [],
      [],
    )
    assert.deepStrictEqual(unopened, [
      "B01 Vector BBBB 0000 1111: 열리지 않음: 원문 403, 기사 없음",
    ])
  })
})

describe("소식 파일을 고치는 열린 PR", () => {
  test("고친 파일에 content/news의 호가 있는 PR만 주차와 함께 낸다", () => {
    assert.deepStrictEqual(
      newsPulls([
        { number: 687, branch: "content/news-2026-w45", files: ["content/news/2026-w45.md"] },
        { number: 690, branch: "feat/x", files: ["plugins/weekly-news/index.ts"] },
        {
          number: 691,
          branch: "fix/news",
          files: [
            "content/news/2026-w44.md",
            "content/news/index.md",
            ".claude/skills/wiki-news/outlets.md",
          ],
        },
      ]),
      [
        { number: 687, branch: "content/news-2026-w45", weeks: ["2026-w45"] },
        { number: 691, branch: "fix/news", weeks: ["2026-w44"] },
      ],
    )
  })
})

describe("빼는 기준의 셋째 조건", () => {
  const md = [
    "## 매체 목록",
    "",
    "| 매체 | 구역 | 찾는 법 | 거르기 | 비고 |",
    "|---|---|---|---|---|",
    "| Vector | network | 피드 | 제목으로 고름 | 무료 |",
    "| KISA | security | 검색 질의 | 제목으로 고름 | 드물게 냄. 무료 |",
    "| PR Newswire | 기타 | 뉴스룸 | 제목으로 고름 | 배포처. 무료 |",
    "| ETAS | sw-engineering | 피드 | 제목으로 고름 | 무료 |",
    "| EE Times | 기타 | 검색 질의 | 제목으로 고름 | 무료 |",
    "",
  ].join("\n")
  const window = recentWeeks("2026-w53", 13)

  test("호의 주차로 최근 13주는 끝 주차까지 13개 주차다", () => {
    assert.strictEqual(window.length, 13)
    assert.strictEqual(window[0], "2026-w41")
    assert.strictEqual(window[12], "2026-w53")
    assert.deepStrictEqual(recentWeeks("2027-w02", 3), ["2026-w53", "2027-w01", "2027-w02"])
  })

  test("판정표 코멘트에서 행의 매체와 판정을 읽는다", () => {
    const body = [
      "<details><summary>후보 판정표 3건(실림 1, 뺌 2)</summary>",
      "",
      "| 번호 | 날짜 | 매체 | 제목 | 판정 | 이유 |",
      "| --- | --- | --- | --- | --- | --- |",
      "| A12 |  | SAE International | J3391 \\| Vehicle | 뺌 | 기간: 발행일을 확인하지 못함 |",
      "| R11 | 2026-10-29 | NHTSA 리콜 | Recall 26V721 | 뺌 | 기간: w44 |",
      "| - | 2026-11-10 | Vector | CANoe 19 | 실림 | 후보 밖에서 더함 |",
      "",
      "</details>",
    ].join("\n")
    assert.deepStrictEqual(parseVerdictTable(body), [
      { date: "", outlet: "SAE International" },
      { date: "2026-10-29", outlet: "NHTSA 리콜" },
      { date: "2026-11-10", outlet: "Vector" },
    ])
    assert.strictEqual(parseVerdictTable("검토 기록입니다"), undefined)
  })

  const rows = (outlets: string[]) => outlets.map((outlet) => ({ date: "", outlet }))
  const tables = (weeks: string[], outlets: string[]) =>
    weeks.map((w) => ({ weeks: [w], rows: rows(outlets) }))

  test("13주 판정표에 그 매체가 찾은 후보가 없는 줄을 내고, 드물게 냄과 배포처는 뺀다", () => {
    const result = exclusionCandidates(
      md,
      [
        ...tables(window.slice(0, 12), ["Vector"]),
        { weeks: ["2026-w53"], rows: rows(["EE Times"]) },
      ],
      window,
    )
    assert.strictEqual(result.applied, true)
    assert.deepStrictEqual(result.candidates, ["ETAS"])
  })

  test("판정표가 13주를 다 덮지 못하면 조건을 걸지 않는다", () => {
    const result = exclusionCandidates(md, tables(window.slice(1), ["Vector"]), window)
    assert.strictEqual(result.applied, false)
    assert.deepStrictEqual(result.covered.length, 12)
    assert.deepStrictEqual(result.candidates, [])
  })

  test("창 밖 주차의 판정표는 세지 않는다", () => {
    const result = exclusionCandidates(
      md,
      [...tables(window, ["Vector"]), { weeks: ["2026-w40"], rows: rows(["ETAS", "EE Times"]) }],
      window,
    )
    assert.deepStrictEqual(result.candidates, ["ETAS", "EE Times"])
  })
})

describe("창에 일부만 걸친 판정표", () => {
  test("창 밖 주차의 행은 세지 않는다", () => {
    const md = [
      "## 매체 목록",
      "",
      "| 매체 | 구역 | 찾는 법 | 거르기 | 비고 |",
      "|---|---|---|---|---|",
      "| Vector | network | 피드 | 제목으로 고름 | 무료 |",
      "| ETAS | sw-engineering | 피드 | 제목으로 고름 | 무료 |",
      "| Kvaser | network | 피드 | 제목으로 고름 | 무료 |",
      "",
    ].join("\n")
    const window = recentWeeks("2026-w53", 13)
    const month = {
      weeks: ["2026-w40", "2026-w41"],
      rows: [
        { date: "2026-09-30", outlet: "ETAS" },
        { date: "2026-10-06", outlet: "Kvaser" },
      ],
    }
    const rest = window
      .slice(1)
      .map((w) => ({ weeks: [w], rows: [{ date: "", outlet: "Vector" }] }))
    assert.deepStrictEqual(exclusionCandidates(md, [month, ...rest], window).candidates, ["ETAS"])
  })
})

describe("소식 PR의 주차", () => {
  test("PR 제목의 주차나 달에 드는, 고친 호의 주차만 판정표의 주차다", () => {
    assert.deepStrictEqual(
      newsIssueWeeks("content: 2026년 46주차 주간 소식", [
        "content/news/2026-w46.md",
        "content/news/2026-w45.md",
      ]),
      ["2026-w46"],
    )
    assert.deepStrictEqual(
      newsIssueWeeks("content: 2026년 10월 주간 소식", [
        "content/news/2026-w40.md",
        "content/news/2026-w41.md",
        "content/news/2026-w42.md",
        "content/news/2026-w39.md",
      ]),
      ["2026-w40", "2026-w41", "2026-w42"],
    )
  })
})

describe("판정표의 매체", () => {
  test("매체 열은 그 소식을 찾은 매체다", () => {
    const { markdown } = verdictTable(
      [
        candidate("C01", { outlet: "Vector", found_outlet: "EE Times" }),
        candidate("C02", { outlet: "ETAS", verdict: "빼기", reason: "문턱: 새 사양 없음" }),
      ],
      [],
      [
        {
          url: "https://example.org/C01",
          title: "CCCC 0000 1111",
          outlet: "Vector",
          date: "2026-09-08",
        },
      ],
    )
    assert.match(markdown, /\| C01 \| 2026-09-08 \| EE Times \|.*\| 실림 \|/)
    assert.match(markdown, /\| C02 \| 2026-09-08 \| ETAS \|/)
  })
})

describe("늦게 찾은 놓침", () => {
  const md = [
    "## 매체 목록",
    "",
    "| 매체 | 구역 | 찾는 법 | 거르기 | 비고 |",
    "|---|---|---|---|---|",
    "| Vector | network | 피드 | 제목으로 고름 | 무료 |",
    "",
    "## 받지 않은 후보",
    "",
    "| 매체 | 확인일 | 사유 |",
    "|---|---|---|",
    "| Valeo | 2026-10-19 | 꾸준함 미달 |",
    "",
  ].join("\n")
  const late = (id: string, fields: Partial<Candidate>) =>
    candidate(id, {
      week: "2026-w46",
      verdict: "빼기",
      reason: "기간: 다룬 발표는 앞 주",
      ...fields,
    })

  test("기간으로 뺀 후보 가운데 다룬 발표가 앞 주차이고 지난 호에 없는 것을 세고, 목록 밖의 1차 발표처를 낸다", () => {
    const result = lateMisses(
      [
        late("D01", {
          outlet: "EE Times",
          date: "2026-11-10",
          event_date: "2026-11-05",
          primary_outlet: "Synopsys",
        }),
        late("D02", {
          outlet: "Valeo",
          date: "2026-11-05",
          event_date: "2026-11-05",
          primary_outlet: "Valeo",
        }),
        late("D03", { outlet: "Vector", date: "2026-11-06", primary_outlet: "Vector" }),
        late("D04", {
          outlet: "EE Times",
          date: "2026-11-11",
          event_date: "2026-11-11",
          primary_outlet: "Bosch",
        }),
        late("D05", {
          outlet: "ATTI",
          date: "2026-11-12",
          event_date: "2026-10-07",
          primary_outlet: "ISO",
          title: "ISO/PAS 34506 published",
        }),
        candidate("D06", {
          week: "2026-w46",
          date: "2026-11-04",
          event_date: "2026-11-04",
          verdict: "빼기",
          reason: "광고성 기사: 행사 안내",
          primary_outlet: "Acme",
        }),
        late("D07", {
          outlet: "Electronics Weekly",
          date: "2026-11-12",
          event_date: "2026-11-05",
          primary_outlet: "Synopsys",
          same_event_seen_at: ["https://example.org/D01"],
        }),
      ],
      [
        past({
          week: "2026-w41",
          title: "ISO/PAS 34506:2026 published",
          url: "https://www.iso.org/standard/1.html",
          outlet: "ISO",
        }),
      ],
      "2026-w46",
      md,
    )
    assert.deepStrictEqual(
      result.misses.map((m) => m.ids),
      [["D01", "D07"], ["D02"], ["D03"]],
    )
    assert.deepStrictEqual(result.additions, ["Synopsys"])
  })
})
