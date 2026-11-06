import test, { describe } from "node:test"
import assert from "node:assert"
import type { Element, ElementContent, Root } from "hast"
import type { FrontPageCommit, FrontPageIssue, FrontPagePage } from "./index"
import { decorateRegionTable, frontPage, newsColumn, RECENT_CHANGES_LIMIT } from "./index"

// 최근 변경은 빌드의 시간대로 날짜를 가른다. 배포 빌드와 같은 한국 시각으로 고정해, 테스트를 돌리는 머신의
// 시간대와 관계없이 같은 결과를 본다(docs/deploy.md의 날짜의 시간대).
process.env.TZ = "Asia/Seoul"

// 대문 함수가 seam이다. 페이지와 커밋 목록을 넣고 나온 주제별 페이지 수와 최근 변경 묶음만 본다.
const page = (slug: string, ...tags: string[]): FrontPagePage => ({ slug, title: slug, tags })
const commit = (subject: string, date: string, ...files: string[]): FrontPageCommit => ({
  subject,
  date,
  files,
})

describe("frontPage", () => {
  test("주제마다 그 주제 태그를 단 페이지를 센다", () => {
    const { topicCounts } = frontPage({
      pages: [
        page("can-frame", "network/can"),
        page("can-fd", "network/can"),
        page("100base-t1", "network/ethernet"),
      ],
    })
    assert.deepStrictEqual(topicCounts, { "network/can": 2, "network/ethernet": 1 })
  })

  test("태그 페이지와 대문은 세지 않는다", () => {
    const { topicCounts } = frontPage({
      pages: [
        page("index", "network/can"),
        page("tags/network/can", "network/can"),
        page("tags/index", "network/can"),
        page("can-frame", "network/can"),
      ],
    })
    assert.deepStrictEqual(topicCounts, { "network/can": 1 })
  })

  test("구역 태그는 주제로 세지 않는다", () => {
    const { topicCounts } = frontPage({
      pages: [page("can-frame", "network", "network/can"), page("osi-model", "network")],
    })
    assert.deepStrictEqual(topicCounts, { "network/can": 1 })
  })

  test("하위 태그를 단 페이지는 그 주제에 한 번 센다", () => {
    // 태그 목록 페이지(tags/network/can)도 하위 태그(network/can/fd)를 단 페이지를 함께 보인다
    const { topicCounts } = frontPage({
      pages: [page("can-fd", "network/can", "network/can/fd"), page("can-xl", "network/can/xl")],
    })
    assert.deepStrictEqual(topicCounts, { "network/can": 2 })
  })

  test("여러 주제에 걸친 페이지는 주제마다 센다", () => {
    const { topicCounts } = frontPage({
      pages: [page("secoc", "security/cybersecurity", "platform/autosar")],
    })
    assert.deepStrictEqual(topicCounts, { "security/cybersecurity": 1, "platform/autosar": 1 })
  })
})

describe("frontPage의 최근 변경", () => {
  // 주간 소식, 태그 목록, 대문도 지금 있는 페이지라, 빠지는 까닭이 "사라진 페이지"가 아니게 한다
  const pages = [
    ...["can-frame", "can-fd", "uds", "doip"].map((slug) => page(slug, "network/can")),
    ...["news/2026-w40", "news/index", "tags/network/can", "index"].map((slug) => page(slug)),
  ]
  const days = (...commits: FrontPageCommit[]) => frontPage({ pages, commits }).recentChanges
  const recent = (...commits: FrontPageCommit[]) => days(...commits).flatMap((day) => day.changes)

  test("content: 커밋을 PR 번호로 묶어 제목, 날짜, 바뀐 페이지를 준다", () => {
    const changes = recent(
      commit("content: CAN FD 보강 (#12)", "2026-10-02T10:00:00+09:00", "can-fd.md"),
      commit(
        "content: CAN FD 보강 (#12)",
        "2026-10-01T10:00:00+09:00",
        "can-frame.md",
        "can-fd.md",
      ),
    )
    assert.deepStrictEqual(changes, [
      {
        title: "CAN FD 보강",
        pr: 12,
        date: "2026-10-02T10:00:00+09:00",
        pages: ["can-fd", "can-frame"],
      },
    ])
  })

  test("PR 번호가 없는 커밋은 따로 묶는다", () => {
    const changes = recent(
      commit("content: UDS 정정", "2026-10-02T10:00:00+09:00", "uds.md"),
      commit("content: UDS 정정", "2026-10-01T10:00:00+09:00", "uds.md"),
    )
    assert.deepStrictEqual(
      changes.map((change) => change.pr),
      [null, null],
    )
  })

  test("content: 외 커밋은 페이지를 바꿔도 나오지 않는다", () => {
    const changes = recent(
      commit("docs: 약어 규약 일괄 적용 (#20)", "2026-10-03T10:00:00+09:00", "uds.md", "doip.md"),
      commit("feat: 대문 구역 표 (#21)", "2026-10-03T11:00:00+09:00", "index.md"),
      commit("content: DoIP 보강 (#22)", "2026-10-02T10:00:00+09:00", "doip.md"),
    )
    assert.deepStrictEqual(
      changes.map((change) => change.title),
      ["DoIP 보강"],
    )
  })

  test("주간 소식, 태그 페이지, 대문, 사라진 페이지는 바뀐 페이지로 세지 않는다", () => {
    const changes = recent(
      commit(
        "content: CAN 주제 정리 (#30)",
        "2026-10-02T10:00:00+09:00",
        "can-frame.md",
        "news/2026-w40.md",
        "news/index.md",
        "tags/network/can.md",
        "index.md",
        "can-old.md",
      ),
    )
    assert.deepStrictEqual(changes[0]?.pages, ["can-frame"])
  })

  test("세지 않는 파일만 바꾼 묶음은 나오지 않는다", () => {
    const changes = recent(
      commit("content: 태그 이름 정리 (#31)", "2026-10-02T10:00:00+09:00", "tags/network.md"),
    )
    assert.deepStrictEqual(changes, [])
  })

  test("묶음은 최근 날짜부터 늘어놓는다", () => {
    // 나는 UTC로 적었지만 한국 시각으로 10월 3일 08시라 다(10월 3일 01시)보다 늦다
    const changes = recent(
      commit("content: 가 (#1)", "2026-10-01T10:00:00+09:00", "uds.md"),
      commit("content: 다 (#3)", "2026-10-03T01:00:00+09:00", "uds.md"),
      commit("content: 나 (#2)", "2026-10-02T23:00:00Z", "uds.md"),
    )
    assert.deepStrictEqual(
      changes.map((change) => change.title),
      ["나", "다", "가"],
    )
  })

  test("같은 날의 묶음은 한 날짜에 모은다", () => {
    const result = days(
      commit("content: 가 (#1)", "2026-10-02T05:00:00Z", "uds.md"),
      commit("content: 나 (#2)", "2026-10-02T03:00:00Z", "doip.md"),
      commit("content: 다 (#3)", "2026-10-01T03:00:00Z", "can-fd.md"),
    )
    assert.deepStrictEqual(
      result.map((day) => [day.day, day.changes.map((change) => change.title)]),
      [
        ["2026-10-02", ["가", "나"]],
        ["2026-10-01", ["다"]],
      ],
    )
  })

  test(`날마다 하나면 최근 ${RECENT_CHANGES_LIMIT}묶음까지 준다`, () => {
    const commits = Array.from({ length: RECENT_CHANGES_LIMIT + 2 }, (_, i) =>
      commit(
        `content: 작업 ${i} (#${i + 1})`,
        `2026-09-${String(i + 1).padStart(2, "0")}T03:00:00Z`,
        "uds.md",
      ),
    )
    const changes = recent(...commits)
    assert.strictEqual(changes.length, RECENT_CHANGES_LIMIT)
    assert.strictEqual(changes[0]?.title, `작업 ${RECENT_CHANGES_LIMIT + 1}`)
  })

  test(`${RECENT_CHANGES_LIMIT}묶음을 채운 날은 끝까지 주고 그 앞날은 뺀다`, () => {
    const at = (day: string, hour: number) =>
      `2026-10-${day}T${String(hour).padStart(2, "0")}:00:00Z`
    const commits = [
      ...[1, 2, 3, 4].map((n) => commit(`content: 3일 ${n} (#${n})`, at("03", n), "uds.md")),
      ...[5, 6, 7].map((n) => commit(`content: 2일 ${n} (#${n})`, at("02", n), "uds.md")),
      commit("content: 1일 (#8)", at("01", 1), "uds.md"),
    ]
    assert.deepStrictEqual(
      days(...commits).map((day) => [day.day, day.changes.length]),
      [
        ["2026-10-03", 4],
        ["2026-10-02", 3],
      ],
    )
  })
})

describe("frontPage의 주간 소식", () => {
  const item = (title: string, date: string, featured = true, regions: string[] = []) => ({
    id: title,
    title,
    koreanTitle: null,
    regions,
    date,
    featured,
  })
  const issue = (week: string, ...titles: string[]): FrontPageIssue => ({
    slug: `news/${week}`,
    week,
    items: titles.map((title) => item(title, "2026-10-06")),
  })
  const latest = (...news: FrontPageIssue[]) => frontPage({ pages: [], news }).latestNews

  test("주차가 가장 늦은 호를 고른다", () => {
    const picked = latest(
      issue("2026-w09", "가"),
      issue("2026-w41", "나", "다"),
      issue("2026-w10", "라"),
    )
    assert.strictEqual(picked?.week, "2026-w41")
    assert.deepStrictEqual(
      picked?.days.flatMap((day) => day.items.map((item) => item.title)),
      ["나", "다"],
    )
  })

  test("해가 바뀌면 새해의 1주가 지난해의 마지막 주보다 늦다", () => {
    assert.strictEqual(latest(issue("2026-w01", "가"), issue("2025-w52", "나"))?.week, "2026-w01")
  })

  test("주요 소식을 발행일마다 묶어 최근 날부터 주고, 같은 날은 파일 순서를 지킨다", () => {
    const news = issue("2026-w41")
    news.items = [
      item("가", "2026-10-08", true, ["network"]),
      item("나", "2026-10-05"),
      item("다", "2026-10-08", true, ["platform", "network"]),
      item("라", "2026-10-06"),
    ]
    assert.deepStrictEqual(
      latest(news)?.days.map((day) => [day.day, day.items.map((item) => item.title)]),
      [
        ["2026-10-08", ["가", "다"]],
        ["2026-10-06", ["라"]],
        ["2026-10-05", ["나"]],
      ],
    )
  })

  test("주요 소식이 아닌 소식 항목은 빼고, 그 호의 소식 항목 수는 모두 센다", () => {
    const news = issue("2026-w41")
    news.items = [
      item("가", "2026-10-08", false),
      item("나", "2026-10-05"),
      item("다", "2026-10-06", false),
    ]
    const picked = latest(news)
    assert.deepStrictEqual(
      picked?.days.flatMap((day) => day.items.map((item) => item.title)),
      ["나"],
    )
    assert.strictEqual(picked?.items.length, 3)
  })

  test("주요 소식이 없는 호도 최신 호로 고르고, 날짜 묶음은 빈다", () => {
    const news = issue("2026-w41")
    news.items = [item("가", "2026-10-08", false)]
    const picked = latest(issue("2026-w40", "나"), news)
    assert.strictEqual(picked?.week, "2026-w41")
    assert.deepStrictEqual(picked?.days, [])
  })

  test("주간 소식이 없으면 null이다", () => {
    assert.strictEqual(latest(), null)
    assert.strictEqual(frontPage({ pages: [] }).latestNews, null)
  })
})

// 대문의 주간 소식 칸이 seam이다. 최신 호를 넣고 그린 칸에서 주요 소식의 링크만 본다.
describe("newsColumn", () => {
  const links = (nodes: ElementContent[]): Element[] =>
    nodes.flatMap((node) =>
      node.type !== "element"
        ? []
        : [
            ...((node.properties.className as string[] | undefined)?.includes("front-news-link")
              ? [node]
              : []),
            ...links(node.children),
          ],
    )
  const textOf = (node: Element) =>
    node.children.map((child) => (child.type === "text" ? child.value : "")).join("")
  const latest = frontPage({
    pages: [],
    news: [
      {
        slug: "news/2026-w44",
        week: "2026-w44",
        items: [
          {
            id: "关于公开征求意见的公示",
            title: "关于公开征求意见的公示",
            koreanTitle: "중국 공신부, 강제 국가표준 의견 공시",
            regions: [],
            date: "2026-10-30",
            featured: true,
          },
          {
            id: "openchain-sbom-framework-10",
            title: "OpenChain SBOM Framework 1.0",
            koreanTitle: null,
            regions: ["security"],
            date: "2026-10-28",
            featured: true,
          },
        ],
      },
    ],
  }).latestNews!

  test("주요 소식마다 한국어 제목을 보이고, 없으면 원어 제목을 보인다", () => {
    assert.deepStrictEqual(links(newsColumn(latest, new Map(), "ko-KR")).map(textOf), [
      "중국 공신부, 강제 국가표준 의견 공시",
      "OpenChain SBOM Framework 1.0",
    ])
  })

  test("제목은 같은 탭에서 호의 그 소식 항목으로 간다", () => {
    const found = links(newsColumn(latest, new Map(), "ko-KR"))
    assert.deepStrictEqual(
      found.map((link) => link.properties.href),
      ["./news/2026-w44#关于公开征求意见的公示", "./news/2026-w44#openchain-sbom-framework-10"],
    )
    assert.deepStrictEqual(
      found.map((link) => [link.properties.target, link.properties.rel]),
      [
        [undefined, undefined],
        [undefined, undefined],
      ],
    )
  })
})

// 구역 표 꾸미기가 seam이다. 대문 본문의 표를 넣고, 주제 칩을 화면 낭독기가 읽는 글자(모든 글자)와 화면에
// 보이는 글자(.sr-text 밖)로 나눠 본다.
function chipTexts(node: ElementContent, hidden = false): { spoken: string; shown: string } {
  if (node.type === "text") return { spoken: node.value, shown: hidden ? "" : node.value }
  if (node.type !== "element") return { spoken: "", shown: "" }
  const inner = hidden || ((node.properties.className as string[]) ?? []).includes("sr-text")
  const parts = node.children.map((child) => chipTexts(child, inner))
  return {
    spoken: parts.map((part) => part.spoken).join(""),
    shown: parts.map((part) => part.shown).join(""),
  }
}

describe("decorateRegionTable", () => {
  test("주제 칩은 이름과 페이지 수 사이에 쉼표를, 수 뒤에 쪽을 읽히고 보이는 글자는 그대로 둔다", () => {
    const link = (slug: string, label: string): Element => ({
      type: "element",
      tagName: "a",
      properties: { "data-slug": slug },
      children: [{ type: "text", value: label }],
    })
    const topics = [link("tags/security/ota", "OTA"), link("tags/security/crypto", "암호")]
    const row: Element = {
      type: "element",
      tagName: "tr",
      properties: {},
      children: [link("tags/security", "보안·업데이트"), ...topics],
    }
    const tree: Root = {
      type: "root",
      children: [{ type: "element", tagName: "table", properties: {}, children: [row] }],
    }
    decorateRegionTable(tree, { "security/ota": 13 })
    assert.deepStrictEqual(
      topics.map((topic) => chipTexts(topic)),
      [
        { spoken: "OTA, 13쪽", shown: "OTA13" },
        { spoken: "암호, 0쪽", shown: "암호0" },
      ],
    )
  })
})
