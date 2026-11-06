import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import {
  byDate,
  dayLabel,
  indexMonths,
  issueDescription,
  issueFilters,
  issueMonth,
  issueNeighbors,
  issueTitle,
  monthWeeks,
  koreanTitlePresence,
  parseWeeklyNews,
  weekDays,
  weekLabel,
} from "./index"

// 형식 함수 parseWeeklyNews가 주간 소식 형식의 정본이다. 예시 주간 소식과 형식을 어긴 짧은 원본을 넣고
// 소식 항목 목록과 오류만 본다.
const example = fs.readFileSync(new URL("./fixtures/2026-w41.md", import.meta.url), "utf8")

// 항목 하나짜리 원본. fields로 필드 목록을, summary로 요약을 바꾼다.
function source({
  fields = ["- 구역: network", "- 매체: Vector", "- 발행일: 2026-10-06"],
  summary = "요약이다.",
} = {}) {
  return ["## [Title](https://example.com/a)", "", ...fields, "", summary, ""].join("\n")
}

const errorsOf = (text: string, name = "2026-w41") =>
  parseWeeklyNews(name, text).errors.map((error) => `${error.line}: ${error.message}`)

describe("parseWeeklyNews", () => {
  test("예시 주간 소식에서 소식 항목 목록을 읽는다", () => {
    const { items, errors } = parseWeeklyNews("2026-w41", example)
    assert.deepStrictEqual(errors, [])
    assert.deepStrictEqual(
      items.map(({ summary: _, ...rest }) => rest),
      [
        {
          id: "can-xl-physical-layer-specification-released",
          regions: ["network"],
          title: "CAN XL Physical Layer Specification Released",
          url: "https://www.can-cia.org/news/can-xl-pmd",
          outlet: "CAN in Automation",
          date: "2026-10-06",
          image: "https://www.can-cia.org/images/can-xl-og.png",
          featured: false,
          koreanTitle: null,
        },
        {
          id: "software-defined-vehicle-survey-2026",
          regions: [],
          title: "Software-Defined Vehicle Survey 2026",
          url: "https://example.com/sdv-survey",
          outlet: "Example Research",
          date: "2026-10-08",
          image: null,
          featured: false,
          koreanTitle: null,
        },
        {
          id: "autosar-r25-11-adaptive-platform-changes",
          regions: ["platform", "network"],
          title: "AUTOSAR R25-11 Adaptive Platform Changes",
          url: "https://www.autosar.org/news/r25-11",
          outlet: "AUTOSAR",
          date: "2026-10-05",
          image: "https://www.autosar.org/og.png",
          featured: true,
          koreanTitle: "AUTOSAR, R25-11 Adaptive Platform 변경 정리",
        },
      ],
    )
  })

  test("기타 구역은 regions가 비어 있다", () => {
    const { items } = parseWeeklyNews(
      "2026-w41",
      source({ fields: ["- 구역: 기타", "- 매체: M", "- 발행일: 2026-10-06"] }),
    )
    assert.deepStrictEqual(items[0].regions, [])
  })

  test("구역은 쉼표로 여럿 쓰고, 같은 구역은 한 번만 센다", () => {
    const { items, errors } = parseWeeklyNews(
      "2026-w41",
      source({
        fields: ["- 구역: security, network,security", "- 매체: M", "- 발행일: 2026-10-06"],
      }),
    )
    assert.deepStrictEqual(errors, [])
    assert.deepStrictEqual(items[0].regions, ["security", "network"])
  })

  test("이미지 필드가 없는 항목은 image가 null이다", () => {
    const { items, errors } = parseWeeklyNews("2026-w41", source())
    assert.deepStrictEqual(errors, [])
    assert.strictEqual(items[0].image, null)
  })

  test("주요 필드가 예인 항목만 주요 소식이다", () => {
    const { items, errors } = parseWeeklyNews(
      "2026-w41",
      source({ fields: ["- 구역: network", "- 매체: M", "- 발행일: 2026-10-06", "- 주요: 예"] }),
    )
    assert.deepStrictEqual(errors, [])
    assert.strictEqual(items[0].featured, true)
    assert.strictEqual(parseWeeklyNews("2026-w41", source()).items[0].featured, false)
  })

  test("주요 소식의 한국어 제목을 읽고, 없으면 null이다", () => {
    const { items, errors } = parseWeeklyNews(
      "2026-w41",
      source({
        fields: [
          "- 구역: network",
          "- 매체: M",
          "- 발행일: 2026-10-06",
          "- 주요: 예",
          "- 한국어 제목:  CiA, CAN XL 물리 계층 명세 공개 ",
        ],
      }),
    )
    assert.deepStrictEqual(errors, [])
    assert.strictEqual(items[0].koreanTitle, "CiA, CAN XL 물리 계층 명세 공개")
    assert.strictEqual(parseWeeklyNews("2026-w41", source()).items[0].koreanTitle, null)
  })

  test("요약은 위키 링크를 원문 그대로 담고, 문단이 여럿이면 모두 담는다", () => {
    const [first] = parseWeeklyNews("2026-w41", example).items
    assert.strictEqual(
      first.summary.markdown,
      "CiA가 CAN XL의 물리 계층 명세를 공개했다. [[can-xl|CAN XL]]과 [[can-fd]]를 함께 쓰는 망의 비트 타이밍을 다룬다.\n\n두 번째 문단은 같은 요약에 든다.",
    )
    // 요약이 차지하는 원본의 줄. 렌더링은 이 줄의 HTML을 카드에 옮긴다.
    assert.deepStrictEqual([first.summary.start, first.summary.end], [8, 10])
  })

  test("같은 제목의 항목은 앵커가 겹치지 않는다", () => {
    const { items } = parseWeeklyNews("2026-w41", `${source()}\n${source()}`)
    assert.deepStrictEqual(
      items.map((item) => item.id),
      ["title", "title-1"],
    )
  })

  test("파일 이름은 ISO 주차여야 한다", () => {
    assert.deepStrictEqual(errorsOf(source(), "2026-41"), [
      "1: 파일 이름은 소문자 ISO 주차(예: 2026-w41)로 쓴다: 2026-41",
    ])
    // 2025년은 1월 1일이 수요일인 평년이라 52주까지다
    assert.deepStrictEqual(errorsOf(source(), "2025-w53"), [
      "1: 파일 이름은 소문자 ISO 주차(예: 2026-w41)로 쓴다: 2025-w53",
    ])
    assert.deepStrictEqual(errorsOf(source(), "2026-w53"), [])
    // 사이트 주소가 소문자라 파일 이름도 소문자로 맞춘다
    assert.deepStrictEqual(errorsOf(source(), "2026-W41"), [
      "1: 파일 이름은 소문자 ISO 주차(예: 2026-w41)로 쓴다: 2026-W41",
    ])
    assert.deepStrictEqual(errorsOf(source(), "2026-w54"), [
      "1: 파일 이름은 소문자 ISO 주차(예: 2026-w41)로 쓴다: 2026-w54",
    ])
  })

  test("항목의 꼴을 어기면 줄과 함께 알린다", () => {
    const cases: [string, string[]][] = [
      [
        "머리말이다.\n\n" + source(),
        ["1: 첫 소식 항목(## [원어 제목](원문 URL)) 앞에는 아무것도 두지 않는다"],
      ],
      [
        "## Title\n\n- 구역: network\n\n요약.",
        ["1: 소식 항목의 제목은 원문 링크 하나다: ## [원어 제목](원문 URL)"],
      ],
      [source({ fields: ["- 구역: network", "- 발행일: 2026-10-06"] }), ["3: 필드가 빠졌다: 매체"]],
      [
        source({ fields: ["- 구역: network", "- 매체: M", "- 발행일: 2026-10-06", "- 저자: X"] }),
        ["6: 모르는 필드다: 저자"],
      ],
      [
        source({ fields: ["- 구역: Network", "- 매체: M", "- 발행일: 2026-10-06"] }),
        ["3: 구역은 구역 태그(예: network)를 쉼표로 나눠 쓰거나 기타 하나로 쓴다: Network"],
      ],
      [
        source({ fields: ["- 구역: network, 기타", "- 매체: M", "- 발행일: 2026-10-06"] }),
        ["3: 구역은 구역 태그(예: network)를 쉼표로 나눠 쓰거나 기타 하나로 쓴다: network, 기타"],
      ],
      [
        source({ fields: ["- 구역: network", "- 매체: M", "- 발행일: 2026-10-32"] }),
        ["5: 발행일은 YYYY-MM-DD로 쓴다: 2026-10-32"],
      ],
      [
        source({
          fields: ["- 구역: network", "- 매체: M", "- 발행일: 2026-10-06", "- 이미지: og.png"],
        }),
        ["6: 이미지는 http(s) URL로 쓴다: og.png"],
      ],
      [
        source({
          fields: ["- 구역: network", "- 매체: M", "- 발행일: 2026-10-06", "- 주요: 아니오"],
        }),
        ["6: 주요는 예로만 쓰고, 주요 소식이 아니면 필드를 뺀다: 아니오"],
      ],
      [
        source({ fields: ["- 구역: network", "- 매체: M", "- 발행일: 2026-10-06", "- 주요:"] }),
        ["6: 주요는 예로만 쓰고, 주요 소식이 아니면 필드를 뺀다: "],
      ],
      [
        source({
          fields: ["- 구역: network", "- 매체: M", "- 발행일: 2026-10-06", "- 한국어 제목: 제목"],
        }),
        ["6: 한국어 제목은 주요 소식에만 단다"],
      ],
      [source({ summary: "" }), ["1: 요약이 없다"]],
      [source({ summary: "### 소제목" }), ["7: 소식 항목 안에는 제목을 두지 않는다"]],
    ]
    for (const [text, expected] of cases) assert.deepStrictEqual(errorsOf(text), expected, text)
  })

  test("프론트매터의 줄도 줄 번호에 센다", () => {
    const text = `---\ntitle: 소식\n---\n\n${source({ summary: "" })}`
    assert.deepStrictEqual(errorsOf(text), ["5: 요약이 없다"])
  })
})

describe("byDate", () => {
  // 예시 주간 소식에 10월 8일 항목(Late)을 하나 더해, 같은 날 항목 둘을 만든다
  const { items } = parseWeeklyNews(
    "2026-w41",
    example + "\n" + source().replace("2026-10-06", "2026-10-08").replace("Title", "Late"),
  )
  const order = (sorted: typeof items) =>
    sorted.map((item) => [item.date, item.title.split(" ")[0]])

  test("최근순은 발행일이 늦은 항목부터 두고, 같은 날은 파일에 적은 순서를 지킨다", () => {
    assert.deepStrictEqual(order(byDate(items, "newest")), [
      ["2026-10-08", "Software-Defined"],
      ["2026-10-08", "Late"],
      ["2026-10-06", "CAN"],
      ["2026-10-05", "AUTOSAR"],
    ])
  })

  test("오래된순은 발행일이 이른 항목부터 두고, 같은 날은 파일에 적은 순서를 지킨다", () => {
    assert.deepStrictEqual(order(byDate(items, "oldest")), [
      ["2026-10-05", "AUTOSAR"],
      ["2026-10-06", "CAN"],
      ["2026-10-08", "Software-Defined"],
      ["2026-10-08", "Late"],
    ])
  })
})

describe("issueFilters", () => {
  const { items } = parseWeeklyNews("2026-w41", example)

  test("주요 소식 수와, 구역마다 항목 수를 구역 순서대로 주고 기타는 맨 뒤에 둔다", () => {
    assert.deepStrictEqual(issueFilters(items, ["network", "platform", "security"], []), {
      featured: 1,
      regions: [
        { region: "network", count: 2 },
        { region: "platform", count: 1 },
        { region: null, count: 1 },
      ],
    })
  })

  test("구역 순서에 없는 구역은 순서에 있는 구역 뒤에 이름순으로 둔다", () => {
    assert.deepStrictEqual(
      issueFilters(items, ["platform"], []).regions.map((entry) => entry.region),
      ["platform", "network", null],
    )
  })

  // 다른 호에서 고른 구역을 쿼리로 이어받으면, 이 호에 항목이 없어도 그 칩을 0으로 남겨 둔다
  test("항목이 없는 구역과 기타도 0으로 준다", () => {
    const { items: plain } = parseWeeklyNews("2026-w41", source())
    assert.deepStrictEqual(
      issueFilters(plain, ["network", "security"], ["security", "sw-engineering"]),
      {
        featured: 0,
        regions: [
          { region: "network", count: 1 },
          { region: "security", count: 0 },
          { region: "sw-engineering", count: 0 },
          { region: null, count: 0 },
        ],
      },
    )
  })
})

describe("issueNeighbors", () => {
  test("주차순으로 바로 앞뒤 호를 주고, 이전은 오래된 호다", () => {
    const weeks = ["2026-w41", "2026-w39", "2026-w40"]
    assert.deepStrictEqual(issueNeighbors(weeks, "2026-w40"), {
      prev: "2026-w39",
      next: "2026-w41",
    })
  })

  test("파일이 없는 주는 건너뛰고 해를 넘어 잇는다", () => {
    const weeks = ["2025-w50", "2025-w52", "2026-w01", "2026-w05"]
    assert.deepStrictEqual(issueNeighbors(weeks, "2026-w01"), {
      prev: "2025-w52",
      next: "2026-w05",
    })
    assert.deepStrictEqual(issueNeighbors(weeks, "2025-w52"), {
      prev: "2025-w50",
      next: "2026-w01",
    })
  })

  test("맨 처음 호와 최신 호에서 없는 쪽은 null이다", () => {
    const weeks = ["2026-w40", "2026-w41"]
    assert.deepStrictEqual(issueNeighbors(weeks, "2026-w40"), { prev: null, next: "2026-w41" })
    assert.deepStrictEqual(issueNeighbors(weeks, "2026-w41"), { prev: "2026-w40", next: null })
    assert.deepStrictEqual(issueNeighbors(["2026-w41"], "2026-w41"), { prev: null, next: null })
  })
})

describe("weekLabel", () => {
  test("연도를 붙여 주차를 쓴다", () => {
    assert.strictEqual(weekLabel("2026-w40"), "2026년 40주차")
    assert.strictEqual(weekLabel("2027-w01"), "2027년 1주차")
  })

  test("기준 호와 같은 해면 연도를 뺀다", () => {
    assert.strictEqual(weekLabel("2026-w40", "2026-w41"), "40주차")
    assert.strictEqual(weekLabel("2025-w52", "2026-w01"), "2025년 52주차")
  })
})

describe("dayLabel", () => {
  test("사이트의 날짜 꼴로 쓰고, 기준 해와 같은 해면 연도를 뺀다", () => {
    assert.strictEqual(dayLabel("2026-10-05", "ko-KR"), "2026년 10월 5일")
    assert.strictEqual(dayLabel("2026-10-05", "ko-KR", 2026), "10월 5일")
    assert.strictEqual(dayLabel("2025-12-29", "ko-KR", 2026), "2025년 12월 29일")
  })
})

describe("issueMonth", () => {
  test("목요일이 든 달에 둔다", () => {
    assert.strictEqual(issueMonth("2026-w41"), "2026-10")
    // 2026-w01은 2025-12-29에 시작하지만 목요일이 1월 1일이다
    assert.strictEqual(issueMonth("2026-w01"), "2026-01")
    // 2026-w53은 2027-01-03에 끝나지만 목요일이 12월 31일이다
    assert.strictEqual(issueMonth("2026-w53"), "2026-12")
    // 2026-w05는 2월 1일에 끝나지만 목요일이 1월 29일이다
    assert.strictEqual(issueMonth("2026-w05"), "2026-01")
  })

  test("monthWeeks가 그 달에 두는 주차와 맞는다", () => {
    for (let year = 2020; year <= 2027; year++) {
      for (let month = 1; month <= 12; month++) {
        const name = `${year}-${String(month).padStart(2, "0")}`
        for (const week of monthWeeks(name)) assert.strictEqual(issueMonth(week), name, week)
      }
    }
  })
})

describe("indexMonths", () => {
  test("호를 달마다 묶어 최근 달과 최근 호부터 준다", () => {
    assert.deepStrictEqual(indexMonths(["2026-w01", "2026-w41", "2026-w05", "2026-w40"]), [
      { month: "2026-10", weeks: ["2026-w41", "2026-w40"] },
      { month: "2026-01", weeks: ["2026-w05", "2026-w01"] },
    ])
  })
})

describe("issueDescription", () => {
  const { items } = parseWeeklyNews("2026-w41", example)

  test("기간, 소식 수, 주요 소식의 한국어 제목", () => {
    assert.strictEqual(
      issueDescription("2026-w41", items, "ko-KR"),
      "2026년 10월 5일 – 2026년 10월 11일, 자동차 임베디드 업계 소식 3건. 주요: AUTOSAR, R25-11 Adaptive Platform 변경 정리",
    )
  })

  test("주요 소식이 여럿이면 최근순으로 가운뎃점으로 잇고, 한국어 제목이 없으면 원어 제목을 쓴다", () => {
    const { items: two } = parseWeeklyNews(
      "2026-w41",
      [
        source({ fields: ["- 구역: network", "- 매체: M", "- 발행일: 2026-10-05", "- 주요: 예"] }),
        source({
          fields: [
            "- 구역: network",
            "- 매체: M",
            "- 발행일: 2026-10-07",
            "- 주요: 예",
            "- 한국어 제목: 나중, 쉼표가 든 제목",
          ],
        }).replace("Title", "Later"),
      ].join("\n"),
    )
    assert.strictEqual(
      issueDescription("2026-w41", two, "ko-KR"),
      "2026년 10월 5일 – 2026년 10월 11일, 자동차 임베디드 업계 소식 2건. 주요: 나중, 쉼표가 든 제목 · Title",
    )
  })

  test("주요 소식이 없으면 기간과 건수까지다", () => {
    const { items: plain } = parseWeeklyNews("2026-w01", source())
    assert.strictEqual(
      issueDescription("2026-w01", plain, "ko-KR"),
      "2025년 12월 29일 – 2026년 1월 4일, 자동차 임베디드 업계 소식 1건.",
    )
  })
})

describe("koreanTitlePresence", () => {
  const item = (title: string, koreanTitle: string | null = null, featured = true) => ({
    title,
    koreanTitle,
    featured,
  })
  const missing = "주요 소식에 한국어 제목이 없다"
  const extra = "원어 제목이 한국어인 주요 소식에는 한국어 제목을 달지 않는다"

  test("원어 제목이 한국어가 아닌 주요 소식에 한국어 제목이 없으면 알린다", () => {
    assert.strictEqual(koreanTitlePresence(item("CAN XL Physical Layer Released")), missing)
    assert.strictEqual(
      koreanTitlePresence(item("关于公开征求《电动汽车安全要求》意见的公示")),
      missing,
    )
    assert.strictEqual(koreanTitlePresence(item("自動運転レベル4の認可")), missing)
    assert.strictEqual(koreanTitlePresence(item("CAN XL Released", "CAN XL 공개")), null)
  })

  test("원어 제목이 한국어인 주요 소식에 한국어 제목이 있으면 알린다", () => {
    const korean = "[현대] 투싼 등 2차종 - 전방 카메라 관련 리콜"
    assert.strictEqual(koreanTitlePresence(item(korean)), null)
    assert.strictEqual(koreanTitlePresence(item(korean, "현대 투싼 리콜")), extra)
  })

  test("주요 소식이 아닌 항목은 보지 않는다(형식 함수가 막는다)", () => {
    assert.strictEqual(koreanTitlePresence(item("CAN XL Released", null, false)), null)
  })
})

describe("issueTitle", () => {
  test("호의 제목은 주차에서 만들고 주 앞의 0은 뺀다", () => {
    assert.strictEqual(issueTitle("2026-w41"), "2026년 41주차 주간 소식")
    assert.strictEqual(issueTitle("2027-w01"), "2027년 1주차 주간 소식")
  })
})

describe("weekDays", () => {
  test("ISO 주차의 월요일과 일요일", () => {
    assert.deepStrictEqual(weekDays("2026-w41"), { start: "2026-10-05", end: "2026-10-11" })
    // 1월 1일이 목요일인 해(2026)의 1주는 그 전 월요일에 시작한다
    assert.deepStrictEqual(weekDays("2026-w01"), { start: "2025-12-29", end: "2026-01-04" })
    assert.deepStrictEqual(weekDays("2020-w53"), { start: "2020-12-28", end: "2021-01-03" })
  })
})

describe("monthWeeks", () => {
  test("목요일이 그 달에 드는 ISO 주차", () => {
    assert.deepStrictEqual(monthWeeks("2026-02"), ["2026-w06", "2026-w07", "2026-w08", "2026-w09"])
  })

  test("달의 경계에 걸친 주는 목요일이 든 달에 속한다", () => {
    // 2026-w01은 2025-12-29에 시작하지만 목요일이 1월 1일이다
    assert.deepStrictEqual(monthWeeks("2026-01"), [
      "2026-w01",
      "2026-w02",
      "2026-w03",
      "2026-w04",
      "2026-w05",
    ])
    // 2021-w01의 목요일은 1월 7일이고, 2021-01-01이 든 주는 2020-w53이다
    assert.deepStrictEqual(monthWeeks("2020-12"), [
      "2020-w49",
      "2020-w50",
      "2020-w51",
      "2020-w52",
      "2020-w53",
    ])
    assert.deepStrictEqual(monthWeeks("2021-01"), ["2021-w01", "2021-w02", "2021-w03", "2021-w04"])
  })

  test("달의 주차는 weekDays가 받는 주차다", () => {
    for (const week of monthWeeks("2026-03")) {
      const { start } = weekDays(week)
      const thursday = new Date(`${start}T00:00:00Z`)
      thursday.setUTCDate(thursday.getUTCDate() + 3)
      assert.strictEqual(thursday.toISOString().slice(0, 7), "2026-03")
    }
  })

  test("달 꼴이 아니면 오류를 낸다", () => {
    assert.throws(() => monthWeeks("2026-13"), /달이 아니다/)
    assert.throws(() => monthWeeks("2026-w06"), /달이 아니다/)
    assert.throws(() => monthWeeks("2026-2"), /달이 아니다/)
  })
})
