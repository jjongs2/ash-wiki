import test, { describe } from "node:test"
import assert from "node:assert"
import { parseWeeklyNews } from "../../../plugins/weekly-news/index"
import { addedOutlets, checkIssues, checkPrBody, outletNames, tableRows, type Issue } from "./check"

// npx tsx --test .claude/skills/wiki-news/check.test.ts

interface Entry {
  title?: string
  outlet?: string
  date?: string
  region?: string
  image?: string
  featured?: boolean
  koreanTitle?: string
  summary?: string
}

function issue(week: string, entries: Entry[]): Issue {
  const source = entries
    .map((e, i) =>
      [
        `## [${e.title ?? `Item ${i}`}](https://example.org/${week}/${i})`,
        "",
        `- 구역: ${e.region ?? "network"}`,
        `- 매체: ${e.outlet ?? "Vector"}`,
        `- 발행일: ${e.date ?? "2026-10-06"}`,
        ...(e.image ? [`- 이미지: ${e.image}`] : []),
        ...(e.featured ? ["- 주요: 예"] : []),
        ...(e.koreanTitle ? [`- 한국어 제목: ${e.koreanTitle}`] : []),
        "",
        e.summary ?? "요약이다.",
        "",
      ].join("\n"),
    )
    .join("\n")
  const { items, errors } = parseWeeklyNews(week, source)
  assert.deepStrictEqual(errors, [])
  return { week, items }
}

const outlets = { listed: new Set(["Vector", "NHTSA 리콜"]), rejected: new Set<string>() }

function failures(issues: Issue[], names = outlets) {
  const weeks = [issues.at(-1)!.week]
  return checkIssues({ issues, weeks, outlets: names, pages: [] }).flatMap((r) => r.failures)
}

describe("요약 길이", () => {
  test("보이는 글자가 250자를 넘는 요약은 실패한다", () => {
    const long = "가".repeat(251)
    assert.deepStrictEqual(failures([issue("2026-w41", [{ title: "Long", summary: long }])]), [
      '2026-w41 "Long": 요약이 251자다(상한 250자)',
    ])
  })

  test("위키 링크와 이스케이프는 보이는 글자로 센다", () => {
    const summary = `${"가".repeat(238)} [[can-xl|CAN XL]] \\~ 나`
    assert.deepStrictEqual(failures([issue("2026-w41", [{ summary }])]), [])
  })
})

describe("한국어 제목", () => {
  const check = (entry: Entry) =>
    checkIssues({
      issues: [issue("2026-w45", [{ title: "T", featured: true, ...entry }])],
      weeks: ["2026-w45"],
      outlets,
      pages: [],
    })[0]

  test("원어 제목이 한국어가 아닌 주요 소식에 한국어 제목이 없으면 실패한다", () => {
    assert.deepStrictEqual(check({}).failures, ['2026-w45 "T": 주요 소식에 한국어 제목이 없다'])
    assert.deepStrictEqual(check({ koreanTitle: "제목" }).failures, [])
  })

  test("원어 제목이 한국어인 주요 소식에 한국어 제목이 있으면 실패한다", () => {
    assert.deepStrictEqual(check({ title: "현대 리콜" }).failures, [])
    assert.deepStrictEqual(check({ title: "현대 리콜", koreanTitle: "현대 리콜" }).failures, [
      '2026-w45 "현대 리콜": 원어 제목이 한국어인 주요 소식에는 한국어 제목을 달지 않는다',
    ])
  })

  test("마크다운, 위키 링크, 이스케이프가 든 한국어 제목은 실패한다", () => {
    for (const koreanTitle of [
      "[[can-xl|CAN XL]] 공개",
      "11\\~30ms 지연",
      "**굵게** 공개",
      "`code` 공개",
    ])
      assert.deepStrictEqual(
        check({ koreanTitle }).failures,
        ['2026-w45 "T": 한국어 제목은 글자만 쓴다(마크다운, 위키 링크, \\~ 없이)'],
        koreanTitle,
      )
    assert.deepStrictEqual(check({ koreanTitle: "지연 11~30ms, 쉼표 · 가운뎃점" }).failures, [])
  })

  test("50자를 넘는 한국어 제목은 알리고 실패하지 않는다", () => {
    const report = check({ koreanTitle: "가".repeat(51) })
    assert.deepStrictEqual(report.failures, [])
    assert.deepStrictEqual(report.notices, [
      '2026-w45 "T": 한국어 제목이 51자다(목표 40자 안팎, 50자 넘음)',
    ])
    assert.deepStrictEqual(check({ koreanTitle: "가".repeat(50) }).notices, [])
  })
})

describe("요약의 ~", () => {
  test("이스케이프되지 않은 ~는 실패한다", () => {
    assert.deepStrictEqual(
      failures([issue("2026-w07", [{ title: "Tilde", summary: "지연은 11~30ms, 2~65ms다." }])]),
      ['2026-w07 "Tilde": 요약에 이스케이프되지 않은 ~가 2곳 있다(\\~로 쓴다)'],
    )
  })

  test("\\~와 링크 주소 안의 ~는 통과한다", () => {
    const summary = "지연은 11\\~30ms다. [자료](https://example.org/~lab/a)를 보라."
    assert.deepStrictEqual(failures([issue("2026-w07", [{ summary }])]), [])
  })
})

describe("이미지", () => {
  const logo = "https://example.org/logo.png"

  test("같은 매체의 다른 항목과 이미지 주소가 같으면 실패한다", () => {
    const issues = [
      issue("2026-w40", [{ title: "Old", image: logo }]),
      issue("2026-w41", [{ title: "New", image: logo }]),
    ]
    assert.deepStrictEqual(failures(issues), [
      '2026-w41 "New": 이미지가 같은 매체의 다른 항목(2026-w40 "Old")과 같다. 사이트 공통 이미지면 비운다',
    ])
  })

  test("매체가 다르면 같은 주소여도 통과한다", () => {
    const issues = [issue("2026-w41", [{ image: logo }, { image: logo, outlet: "NHTSA 리콜" }])]
    assert.deepStrictEqual(failures(issues), [])
  })
})

describe("매체 이름", () => {
  const names = {
    listed: new Set([
      "Vector",
      "CAN in Automation (CiA)",
      "NHTSA 리콜",
      "국토교통부 자동차리콜센터",
      "同星智能 Tosun",
      "EE Times",
      "EE Times Japan",
    ]),
    rejected: new Set(["국토교통부"]),
  }
  const check = (entry: Entry) => failures([issue("2026-w41", [{ title: "T", ...entry }])], names)

  test("목록의 이름과 비슷하지만 다른 값은 실패한다", () => {
    assert.deepStrictEqual(check({ outlet: "Vector Informatik" }), [
      '2026-w41 "T": 매체 "Vector Informatik" → 매체 목록의 "Vector"',
    ])
    assert.strictEqual(check({ outlet: "CAN in Automation" }).length, 1)
    assert.strictEqual(check({ outlet: "上海同星智能科技有限公司" }).length, 1)
  })

  test("목록이나 받지 않은 후보 표의 이름 그대로면 통과한다", () => {
    for (const outlet of [
      "EE Times Japan",
      "CAN in Automation (CiA)",
      "국토교통부",
      "Kvaser",
      "EE (MDPI)",
    ])
      assert.deepStrictEqual(check({ outlet }), [], outlet)
  })

  test("NHTSA는 리콜이 아닌 문서에만 쓴다", () => {
    assert.deepStrictEqual(check({ outlet: "NHTSA", title: "AV Framework" }), [])
    assert.deepStrictEqual(
      check({ outlet: "NHTSA", title: "Recall 26V084 (International Motors): MV" }),
      [
        '2026-w41 "Recall 26V084 (International Motors): MV": 매체 "NHTSA" → 매체 목록의 "NHTSA 리콜"',
      ],
    )
  })
})

describe("위키 링크 후보", () => {
  const pages = [
    { slug: "can", names: ["CAN"] },
    { slug: "can-xl", names: ["CAN XL"] },
    { slug: "iso-26262", names: ["ISO 26262"] },
  ]
  const candidates = (issues: Issue[]) =>
    checkIssues({ issues, weeks: [issues.at(-1)!.week], outlets, pages }).flatMap(
      (r) => r.candidates,
    )

  test("호 안의 첫 등장이 링크가 아닌 개념을 알린다", () => {
    const issues = [
      issue("2026-w41", [
        { title: "First", summary: "CAN XL 명세가 나왔다. CANoe로 CAN 망을 시험한다." },
        { title: "Second", summary: "[[can|CAN]] 이야기다." },
      ]),
    ]
    assert.deepStrictEqual(candidates(issues), [
      '2026-w41 "First": CAN XL → [[can-xl]]',
      '2026-w41 "First": CAN → [[can]]',
    ])
  })

  test("첫 등장이 링크면 뒤의 등장은 알리지 않고, 실패도 아니다", () => {
    const issues = [
      issue("2026-w41", [
        { summary: "[[iso-26262|ISO 26262]] 인증을 받았다." },
        { summary: "ISO 26262 ASIL D 대응이다." },
      ]),
    ]
    assert.deepStrictEqual(candidates(issues), [])
    assert.deepStrictEqual(failures(issues), [])
  })
})

describe("분포 줄", () => {
  const sized = (lengths: number[], extra: Entry = {}) =>
    lengths.map((n) => ({ ...extra, summary: "가".repeat(n) }))

  test("항목 수, 주요 수, 요약 길이 중앙값, 기타 비중을 직전 4주에 있는 호의 중앙값과 나란히 준다", () => {
    const issues = [
      issue("2026-w35", sized([5])),
      issue("2026-w36", sized([10, 10])),
      issue("2026-w37", [...sized([20, 20]), { summary: "가".repeat(20), featured: true }]),
      issue("2026-w39", [...sized([30, 30, 30]), { summary: "가".repeat(30), region: "기타" }]),
      issue("2026-w40", [...sized([40, 40, 40, 40]), ...sized([40], { region: "기타" })]),
      issue("2026-w41", [
        ...sized([10, 20]),
        { summary: "가".repeat(30), featured: true },
        { summary: "가".repeat(40), region: "기타" },
      ]),
    ]
    const [report] = checkIssues({ issues, weeks: ["2026-w41"], outlets, pages: [] })
    assert.strictEqual(
      report.distribution,
      "2026-w41: 항목 4(직전 4주 중앙값 4), 주요 1(0), 요약 길이 중앙값 25자(30자), 기타 25%(20%)",
    )
  })
})

describe("PR 본문", () => {
  const table = (rows: string[]) =>
    ["| 매체 | 구역 |", "| --- | --- |", ...rows.map((r) => `| ${r} | 기타 |`)].join("\n")
  const outletsMd = (listed: string[], rejected: string[]) =>
    [
      "# 매체 목록과 검색 질의",
      "## 매체 목록",
      table(listed),
      "## 검색 질의",
      "- **arXiv** (전체): `https://export.arxiv.org`",
      "## 받지 않은 후보",
      table(rejected),
      "",
    ].join("\n\n")

  test("매체 목록 파일에서 두 표의 이름을 읽는다", () => {
    const { listed, rejected } = outletNames(outletsMd(["Vector", "KBA"], ["Bosch"]))
    assert.deepStrictEqual([...listed], ["Vector", "KBA"])
    assert.deepStrictEqual([...rejected], ["Bosch"])
  })

  test("prettier-ignore를 단 압축한 표도 읽는다", () => {
    const md = [
      "## 매체 목록",
      "",
      "<!-- prettier-ignore -->",
      "| 매체 | 구역 | 찾는 법 |",
      "|---|---|---|",
      "| Vector | network | 피드 `https://vector.com/feed` |",
      "| KBA | 기타 | 검색 질의 `https://kba.de/csv` |",
      "",
      "## 받지 않은 후보",
      "",
      "<!-- prettier-ignore -->",
      "| 매체 | 확인일 | 사유 |",
      "|---|---|---|",
      "| Bosch | 2026-10-14 | 꾸준함 미달 |",
      "",
    ].join("\n")
    const { listed, rejected } = outletNames(md)
    assert.deepStrictEqual([...listed], ["Vector", "KBA"])
    assert.deepStrictEqual([...rejected], ["Bosch"])
    assert.deepStrictEqual(tableRows(md, "## 매체 목록")[1], [
      "KBA",
      "기타",
      "검색 질의 `https://kba.de/csv`",
    ])
  })

  test("이번 실행이 두 표에 더한 매체마다 이름과 건수가 본문에 있어야 한다", () => {
    const added = addedOutlets(
      outletsMd(["Vector"], ["Bosch"]),
      outletsMd(["Vector", "CARIAD", "36Kr"], ["Bosch", "Valeo"]),
    )
    assert.deepStrictEqual(added, ["CARIAD", "36Kr", "Valeo"])
    const body = [
      "## Changes",
      "- 목록 추가 후보",
      "  - CARIAD: 3개월 9건, 뉴스룸 확인, 매체 목록",
      "  - 36Kr: 검색 질의 `https://news.google.com/rss/search?q=36kr+after:2026-09-01`, 2026-10-14 확인, 매체 목록",
      "  - Valeo, 받지 않은 후보",
    ].join("\n")
    assert.deepStrictEqual(checkPrBody(body, added), [
      "PR 본문: 36Kr의 최근 3개월 건수가 없다(매체 목록이나 받지 않은 후보 표에 더한 줄)",
      "PR 본문: Valeo의 최근 3개월 건수가 없다(매체 목록이나 받지 않은 후보 표에 더한 줄)",
    ])
  })

  test("건수는 매체 이름 뒤에서 찾고, 이름을 늘어놓은 줄의 합계는 건수로 보지 않는다", () => {
    const added = ["Texas Instruments", "LG Electronics", "aiMotive"]
    const body = [
      "- 받지 않은 후보 표에 더한 2곳: Texas Instruments, LG Electronics",
      "| aiMotive | 5 / 2 | 뉴스룸 |",
    ].join("\n")
    assert.deepStrictEqual(checkPrBody(body, added), [
      "PR 본문: Texas Instruments의 최근 3개월 건수가 없다(매체 목록이나 받지 않은 후보 표에 더한 줄)",
      "PR 본문: LG Electronics의 최근 3개월 건수가 없다(매체 목록이나 받지 않은 후보 표에 더한 줄)",
    ])
  })

  test("글자에 붙은 숫자와 이름을 감싼 괄호 밖의 숫자는 건수가 아니다", () => {
    const added = ["코렌스", "Foo", "Bar", "Cerence", "CISA ICS 권고", "Baz"]
    const body = [
      "- 제3자 기사를 실은 것이 6건이다(전자신문의 코렌스, 중국 V2X 표준안). 취재·해설이 9건이다.",
      "- 매체 목록에 더한 줄: CISA ICS 권고(규제 기관). 드물게 냄(최근 3개월 1건).",
      "- Foo(1차 발표가 열리지 않음), Bar(V2X 표준 단체, 3개월 확인)",
      "- 가장 가까운 곳은 Cerence(약 4건, 재무·IR 글 섞임)다.",
      "- Baz는 로컬에서 2026-07-14\\~10-13로 질의를 돌렸다.",
    ].join("\n")
    assert.deepStrictEqual(
      checkPrBody(body, added).map((f) => f.split("의 최근")[0]),
      ["PR 본문: 코렌스", "PR 본문: Foo", "PR 본문: Bar", "PR 본문: Baz"],
    )
  })
})
