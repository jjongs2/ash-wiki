import test, { describe } from "node:test"
import assert from "node:assert"
import type { SearchPage } from "./model"
import { createSearchIndex, highlightRanges } from "./model"

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

  test("제목과 별칭이 함께 맞아도 한 번만 낸다", async () => {
    const results = await search(
      [page("automotive-spice", "ASPICE", { aliases: ["A-SPICE"] })],
      "ASPICE",
    )
    assert.deepStrictEqual(results, ["automotive-spice"])
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

describe("낱말을 담는지 견주는 꼴", () => {
  test("음절이 흩어진 페이지는 나오지 않는다", async () => {
    const results = await search(
      [
        page("100base-t1", "100BASE-T1", { content: "부하를 트랜시버로 더한다" }),
        page("bootloader", "부트 관리자", { content: "부트로더가 펌웨어를 올린다" }),
      ],
      "부트로더",
    )
    assert.deepStrictEqual(results, ["bootloader"])
  })

  test("본문에만 띄어 쓴 꼴이 있는 페이지가 붙여 쓴 검색어에 맞는다", async () => {
    const results = await search(
      [page("can-filter", "CAN 필터", { content: "수신기는 수용 필터로 거른다" })],
      "수용필터",
    )
    assert.deepStrictEqual(results, ["can-filter"])
  })

  test("낱말 경계를 넘는 조각은 맞지 않는다", async () => {
    const results = await search(
      [
        page("tsn", "TSN", { content: "지연 방식을 줄인다" }),
        page("v-modell-xt", "V-Modell XT", { content: "독일 연방 정부의 개발 표준" }),
      ],
      "연방",
    )
    assert.deepStrictEqual(results, ["v-modell-xt"])
  })

  test("영문 낱말 가운데는 맞지 않고 한글 바로 뒤는 맞는다", async () => {
    const results = await search(
      [
        page("scheduling", "스케줄링", { content: "execution time을 잰다" }),
        page("ota", "OTA", { content: "펌웨어ECU를 갱신한다" }),
      ],
      "ecu",
    )
    assert.deepStrictEqual(results, ["ota"])
  })

  test("하이픈 뒤의 영문 낱말에도 맞는다", async () => {
    const results = await search(
      [page("lin", "LIN", { content: "T 계열" }), page("100base-t1", "100BASE-T1")],
      "T1",
    )
    assert.deepStrictEqual(results, ["100base-t1"])
  })

  test("낱말이 제목과 본문에 나뉜 페이지도 모두 담은 것으로 본다", async () => {
    const results = await search(
      [
        page("link", "링크", { content: "링크" }),
        page("100base-t1", "100BASE-T1 링크", { content: "세그먼트 길이는 15 m다" }),
      ],
      "링크 세그먼트",
    )
    assert.deepStrictEqual(results, ["100base-t1", "link"])
  })
})

describe("결과 순서", () => {
  test("모두 제목에 있는 페이지, 모두 별칭에 있는 페이지, 나머지 순이다", async () => {
    const results = await search(
      [
        page("body", "본문", { content: "시간 동기화 시간 동기화 시간 동기화" }),
        page("alias", "gPTP", { aliases: ["시간 동기화 프로토콜"] }),
        page("title", "시간 동기화"),
        page("split", "시간", { aliases: ["동기화"] }),
      ],
      "시간 동기화",
    )
    assert.deepStrictEqual(results, ["title", "alias", "body", "split"])
  })

  test("한 낱말만 많이 나온 페이지가 두 낱말이 고루 나온 페이지를 이기지 않는다", async () => {
    // 두 낱말은 같은 수의 페이지에 있어 IDF가 같다.
    const results = await search(
      [
        page("lopsided", "가", { content: "필터 ".repeat(10) + "타이머" }),
        page("even", "나", { content: "필터 타이머 ".repeat(4) }),
      ],
      "필터 타이머",
    )
    assert.deepStrictEqual(results, ["even", "lopsided"])
  })

  test("본문 점수가 같으면 넣은 순서다", async () => {
    const results = await search(
      [page("a", "가", { content: "필터" }), page("b", "나", { content: "필터" })],
      "필터",
    )
    assert.deepStrictEqual(results, ["a", "b"])
  })

  test("모두 담은 페이지가 앞이고, 일부만 담은 페이지는 담은 낱말 수 순이다", async () => {
    const results = await search(
      [
        page("one", "가", { content: "길이 ".repeat(20) }),
        page("two", "나", { content: "링크 세그먼트" }),
        page("all", "다", { content: "링크 세그먼트 길이" }),
      ],
      "링크 세그먼트 길이",
    )
    assert.deepStrictEqual(results, ["all", "two", "one"])
  })

  test("낱말을 모두 담은 호가 일부만 담은 위키 페이지보다 뒤다", async () => {
    const results = await search(
      [
        page("news/2026-w42", "2026년 w42", { content: "업데이트 프레임워크" }),
        page("ota", "OTA", { content: "업데이트" }),
        page("news/2026-w41", "2026년 w41", { content: "업데이트" }),
      ],
      "업데이트 프레임워크",
    )
    assert.deepStrictEqual(results, ["ota", "news/2026-w42", "news/2026-w41"])
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

  test("호가 많아도 위키 페이지가 앞이다", async () => {
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

describe("강조", () => {
  // 강조할 자리를 대괄호로 감싼다.
  const mark = (term: string, text: string) =>
    highlightRanges(term, text)
      .reverse()
      .reduce(
        (out, [start, end]) => `${out.slice(0, start)}[${out.slice(start, end)}]${out.slice(end)}`,
        text,
      )

  test("맞춤 규칙이 맞힌 자리만 칠한다", () => {
    assert.strictEqual(mark("ecu", "execution과 펌웨어ECU를"), "execution과 펌웨어[ECU]를")
    assert.strictEqual(mark("연방", "지연 방식과 연방"), "지연 방식과 [연방]")
  })

  test("띄어 쓰거나 문장부호가 끼어든 꼴을 칠한다", () => {
    assert.strictEqual(mark("수용필터", "수용 필터를 둔다"), "[수용 필터]를 둔다")
    assert.strictEqual(mark("SOME-IP", "SOME/IP 프로토콜"), "[SOME/IP] 프로토콜")
  })

  test("한 글자 낱말도 칠한다", () => {
    assert.strictEqual(mark("안전 차", "차 안전"), "[차] [안전]")
  })

  test("낱말마다 칠한다", () => {
    assert.strictEqual(mark("IEEE 802.3bw", "IEEE 802.3bw-2015"), "[IEEE] [802.3bw]-2015")
  })
})
