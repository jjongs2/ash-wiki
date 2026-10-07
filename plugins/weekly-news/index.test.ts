import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import { parseWeeklyNews, weekDays } from "./index"

// 형식 함수 parseWeeklyNews가 주간 소식 형식의 정본이다. 예시 주간 소식과 형식을 어긴 짧은 원본을 넣고
// 소식 항목 목록과 오류만 본다.
const example = fs.readFileSync(new URL("./fixtures/2026-W41.md", import.meta.url), "utf8")

// 항목 하나짜리 원본. fields로 필드 목록을, summary로 요약을 바꾼다.
function source({
  fields = ["- 구역: network", "- 매체: Vector", "- 발행일: 2026-10-06"],
  summary = "요약이다.",
} = {}) {
  return ["## [Title](https://example.com/a)", "", ...fields, "", summary, ""].join("\n")
}

const errorsOf = (text: string, name = "2026-W41") =>
  parseWeeklyNews(name, text).errors.map((error) => `${error.line}: ${error.message}`)

describe("parseWeeklyNews", () => {
  test("예시 주간 소식에서 소식 항목 목록을 읽는다", () => {
    const { items, errors } = parseWeeklyNews("2026-W41", example)
    assert.deepStrictEqual(errors, [])
    assert.deepStrictEqual(
      items.map(({ summary: _, ...rest }) => rest),
      [
        {
          id: "can-xl-physical-layer-specification-released",
          region: "network",
          title: "CAN XL Physical Layer Specification Released",
          url: "https://www.can-cia.org/news/can-xl-pmd",
          outlet: "CAN in Automation",
          date: "2026-10-06",
          image: "https://www.can-cia.org/images/can-xl-og.png",
        },
        {
          id: "software-defined-vehicle-survey-2026",
          region: null,
          title: "Software-Defined Vehicle Survey 2026",
          url: "https://example.com/sdv-survey",
          outlet: "Example Research",
          date: "2026-10-08",
          image: null,
        },
        {
          id: "autosar-r25-11-adaptive-platform-changes",
          region: "platform",
          title: "AUTOSAR R25-11 Adaptive Platform Changes",
          url: "https://www.autosar.org/news/r25-11",
          outlet: "AUTOSAR",
          date: "2026-10-09",
          image: "https://www.autosar.org/og.png",
        },
      ],
    )
  })

  test("기타 구역은 region이 null이다", () => {
    const { items } = parseWeeklyNews(
      "2026-W41",
      source({ fields: ["- 구역: 기타", "- 매체: M", "- 발행일: 2026-10-06"] }),
    )
    assert.strictEqual(items[0].region, null)
  })

  test("이미지 필드가 없는 항목은 image가 null이다", () => {
    const { items, errors } = parseWeeklyNews("2026-W41", source())
    assert.deepStrictEqual(errors, [])
    assert.strictEqual(items[0].image, null)
  })

  test("요약은 위키 링크를 원문 그대로 담고, 문단이 여럿이면 모두 담는다", () => {
    const [first] = parseWeeklyNews("2026-W41", example).items
    assert.strictEqual(
      first.summary.markdown,
      "CiA가 CAN XL의 물리 계층 명세를 공개했다. [[can-xl|CAN XL]]과 [[can-fd]]를 함께 쓰는 망의 비트 타이밍을 다룬다.\n\n두 번째 문단은 같은 요약에 든다.",
    )
    // 요약이 차지하는 원본의 줄. 렌더링은 이 줄의 HTML을 카드에 옮긴다.
    assert.deepStrictEqual([first.summary.start, first.summary.end], [12, 14])
  })

  test("같은 제목의 항목은 앵커가 겹치지 않는다", () => {
    const { items } = parseWeeklyNews("2026-W41", `${source()}\n${source()}`)
    assert.deepStrictEqual(
      items.map((item) => item.id),
      ["title", "title-1"],
    )
  })

  test("파일 이름은 ISO 주차여야 한다", () => {
    assert.deepStrictEqual(errorsOf(source(), "2026-41"), [
      "1: 파일 이름은 ISO 주차(예: 2026-W41)로 쓴다: 2026-41",
    ])
    // 2025년은 1월 1일이 수요일인 평년이라 52주까지다
    assert.deepStrictEqual(errorsOf(source(), "2025-W53"), [
      "1: 파일 이름은 ISO 주차(예: 2026-W41)로 쓴다: 2025-W53",
    ])
    assert.deepStrictEqual(errorsOf(source(), "2026-W53"), [])
    assert.deepStrictEqual(errorsOf(source(), "2026-W54"), [
      "1: 파일 이름은 ISO 주차(예: 2026-W41)로 쓴다: 2026-W54",
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
        ["3: 구역은 구역 태그(예: network)나 기타로 쓴다: Network"],
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

describe("weekDays", () => {
  test("ISO 주차의 월요일과 일요일", () => {
    assert.deepStrictEqual(weekDays("2026-W41"), { start: "2026-10-05", end: "2026-10-11" })
    // 1월 1일이 목요일인 해(2026)의 1주는 그 전 월요일에 시작한다
    assert.deepStrictEqual(weekDays("2026-W01"), { start: "2025-12-29", end: "2026-01-04" })
    assert.deepStrictEqual(weekDays("2020-W53"), { start: "2020-12-28", end: "2021-01-03" })
  })
})
