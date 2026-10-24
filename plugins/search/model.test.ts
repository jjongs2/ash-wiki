import test, { describe } from "node:test"
import assert from "node:assert"
import type { SearchPage } from "./model"
import { createSearchIndex, highlightPattern } from "./model"

// 검색 색인이 seam이다. 가짜 페이지를 넣고 검색어에 나온 slug 순서만 본다.
const page = (slug: string, title: string, more: Partial<SearchPage> = {}): SearchPage => ({
  slug,
  title,
  aliases: [],
  content: "",
  tags: [],
  ...more,
})

const search = async (pages: SearchPage[], query: string) => {
  const index = createSearchIndex()
  await index.add(pages)
  return index.search(query, [])
}

describe("정확히 맞는 페이지", () => {
  test("제목이 CAN으로 시작하는 페이지가 8개 넘어도 CAN이 1위다", async () => {
    const others = ["ACK", "중재", "FD", "XL", "프레임", "버스", "오류", "필터", "타이밍"].map(
      (name, i) =>
        page(`can-${i}`, `CAN ${name}`, { content: "CAN 버스에서 CAN 노드가 CAN 프레임을 보낸다" }),
    )
    const results = await search([...others, page("can", "CAN", { content: "버스" })], "CAN")
    assert.strictEqual(results[0], "can")
    assert.strictEqual(results.length, 8)
  })

  test("별칭만 맞는 페이지는 제목이 맞은 페이지 바로 뒤다", async () => {
    const results = await search(
      [
        page("hsm-usage", "HSM 활용", { content: "하드웨어 보안 모듈을 쓰는 법" }),
        page("hsm", "HSM", { aliases: ["하드웨어 보안 모듈"] }),
        page("hardware-security-module", "하드웨어 보안 모듈"),
      ],
      "하드웨어 보안 모듈",
    )
    assert.deepStrictEqual(results, ["hardware-security-module", "hsm", "hsm-usage"])
  })

  test("제목이 같으면 위키 페이지가 태그 페이지보다 앞이다", async () => {
    const results = await search([page("tags/network/can", "CAN"), page("can", "CAN")], "CAN")
    assert.deepStrictEqual(results, ["can", "tags/network/can"])
  })

  test("붙여 쓴 수용필터는 수용 필터에 맞는다", async () => {
    const results = await search(
      [
        page("filter-range", "필터 수용 범위", { content: "수용필터" }),
        page("acceptance-filter", "수용 필터"),
      ],
      "수용필터",
    )
    assert.deepStrictEqual(results, ["acceptance-filter", "filter-range"])
  })

  test("문장부호와 대소문자를 빼고 견준다", async () => {
    const results = await search(
      [page("some-ip-sd", "SOME/IP-SD", { content: "someip" }), page("some-ip", "SOME/IP")],
      "someip",
    )
    assert.strictEqual(results[0], "some-ip")
  })

  test("별칭의 낱말로도 찾는다", async () => {
    const results = await search(
      [page("100base-t1", "100BASE-T1", { aliases: ["IEEE 802.3bw"] }), page("lin", "LIN")],
      "802.3bw",
    )
    assert.deepStrictEqual(results, ["100base-t1"])
  })
})

describe("주간 소식의 호", () => {
  const issue = (week: string) =>
    page(`news/2026-${week}`, `2026년 ${week}`, { content: "SDV SDV SDV 플랫폼" })

  test("같은 말이 든 호 둘은 위키 페이지 뒤에 최신 호부터 나온다", async () => {
    const results = await search(
      [
        issue("w41"),
        page("ota", "OTA", { content: "업데이트는 SDV의 기반이다" }),
        issue("w42"),
        page("news", "주간 소식"),
      ],
      "SDV",
    )
    assert.deepStrictEqual(results, ["ota", "news/2026-w42", "news/2026-w41"])
  })

  test("호가 FlexSearch 결과를 채워도 위키 페이지가 앞이다", async () => {
    const issues = ["w30", "w31", "w32", "w33", "w34", "w35", "w36", "w37", "w38"].map(issue)
    const results = await search(
      [...issues, page("ota", "OTA", { content: "업데이트는 SDV의 기반이다" })],
      "SDV",
    )
    assert.deepStrictEqual(results.slice(0, 2), ["ota", "news/2026-w38"])
  })

  test("8칸이 위키 페이지로 차면 호는 나오지 않는다", async () => {
    const wiki = [...Array(8).keys()].map((i) => page(`p${i}`, `P${i}`, { content: "SDV" }))
    const results = await search([issue("w42"), ...wiki], "SDV")
    assert.deepStrictEqual(
      results,
      wiki.map((p) => p.slug),
    )
  })
})

describe("태그 거르기", () => {
  const pages = [
    page("can", "CAN", { tags: ["network/can"], content: "프레임" }),
    page("lin", "LIN", { tags: ["network"], content: "프레임" }),
    page("news/2026-w42", "2026년 w42", { tags: ["network/can"], content: "프레임" }),
  ]

  test("검색어와 태그를 함께 주면 그 태그를 모두 단 페이지만 낸다", async () => {
    const index = createSearchIndex()
    await index.add(pages)
    assert.deepStrictEqual(await index.search("프레임", ["Network/CAN"]), ["can", "news/2026-w42"])
  })

  test("태그만 주면 그 태그를 단 페이지를 호를 뒤로 두고 낸다", async () => {
    const index = createSearchIndex()
    await index.add([...pages].reverse())
    assert.deepStrictEqual(await index.search("", ["network/can"]), ["can", "news/2026-w42"])
  })
})

describe("인코더", () => {
  test("하이픈 낱말을 하이픈 뒤의 낱말로도 찾는다", async () => {
    const results = await search(
      [page("lin", "LIN", { content: "T 계열" }), page("100base-t1", "100BASE-T1")],
      "T1",
    )
    assert.deepStrictEqual(results, ["100base-t1"])
  })
})

describe("강조", () => {
  // 강조 패턴이 맞힌 곳을 대괄호로 감싼다.
  const mark = (term: string, text: string) =>
    text.replace(highlightPattern(term) ?? /$^/, (match) => `[${match}]`)

  test("문장부호에서 끊어 찾은 낱말도 강조한다", () => {
    assert.strictEqual(mark("SOME-IP", "SOME/IP 프로토콜"), "[SOME]/[IP] 프로토콜")
  })

  test("한 글자 낱말도 공백으로 띄워 쓰면 강조한다", () => {
    assert.strictEqual(mark("안전 차", "차 안전"), "[차] [안전]")
  })

  test("검색어가 통째로 있으면 통째로 강조한다", () => {
    assert.strictEqual(mark("IEEE 802.3bw", "IEEE 802.3bw-2015"), "[IEEE 802.3bw]-2015")
  })
})
