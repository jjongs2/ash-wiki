import test, { describe } from "node:test"
import assert from "node:assert"
import type { Element, ElementContent, Root } from "hast"
import type { FrontPageCommit, FrontPageIssue, FrontPagePage } from "./index"
import {
  decorateRegionTable,
  frontPage,
  newsColumn,
  RECENT_CHANGES_LIMIT,
  recentColumn,
} from "./index"

// 최근 변경은 빌드의 시간대로 날짜를 가른다. 배포 빌드와 같은 한국 시각으로 고정해, 테스트를 돌리는 머신의
// 시간대와 관계없이 같은 결과를 본다(docs/deploy.md의 날짜의 시간대).
process.env.TZ = "Asia/Seoul"

// 대문 함수가 seam이다. 페이지와 커밋 목록을 넣고 나온 주제별 페이지 수와 최근 변경 묶음만 본다.
const page = (slug: string, ...tags: string[]): FrontPagePage => ({ slug, title: slug, tags })
// 파일 앞의 `+`는 그 커밋이 새로 만든 파일이다
const commit = (subject: string, date: string, ...files: string[]): FrontPageCommit => ({
  subject,
  date,
  files: files.map((file) => file.replace(/^\+/, "")),
  added: files.filter((file) => file.startsWith("+")).map((file) => file.slice(1)),
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
        "+can-fd.md",
      ),
    )
    assert.deepStrictEqual(changes, [
      {
        title: "CAN FD 보강",
        pr: 12,
        date: "2026-10-02T10:00:00+09:00",
        pages: [
          { slug: "can-fd", title: "can-fd", added: true },
          { slug: "can-frame", title: "can-frame", added: false },
        ],
      },
    ])
  })

  // 대문은 slug가 아니라 페이지 제목을 보인다. 인제스트 묶음의 고친 페이지는 대개 새 페이지로 가는 링크만 받으므로,
  // 읽을 새 페이지를 앞에 둔다. 같은 쪽 안은 탐색기와 같은 한국어 정렬(가나다 뒤에 로마자)이다.
  test("바뀐 페이지는 제목과 함께 새 페이지부터, 각각 제목의 한국어 순서로 준다", () => {
    const [change] = frontPage({
      pages: [
        { slug: "uds", title: "UDS", tags: [] },
        { slug: "doip", title: "진단 통신 DoIP", tags: [] },
        { slug: "can-frame", title: "CAN 프레임", tags: [] },
        { slug: "can-xl", title: "CAN XL", tags: [] },
        { slug: "obd", title: "온보드 진단", tags: [] },
      ],
      commits: [
        commit("content: 진단 보강 (#40)", "2026-10-02T10:00:00+09:00", "uds.md", "doip.md"),
        commit("content: 진단 보강 (#40)", "2026-10-01T10:00:00+09:00", "can-frame.md"),
        commit("content: 진단 보강 (#40)", "2026-10-01T09:00:00+09:00", "+can-xl.md", "+obd.md"),
      ],
    }).recentChanges.flatMap((day) => day.changes)
    assert.deepStrictEqual(change?.pages, [
      { slug: "obd", title: "온보드 진단", added: true },
      { slug: "can-xl", title: "CAN XL", added: true },
      { slug: "doip", title: "진단 통신 DoIP", added: false },
      { slug: "can-frame", title: "CAN 프레임", added: false },
      { slug: "uds", title: "UDS", added: false },
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
    assert.deepStrictEqual(
      changes[0]?.pages.map((page) => page.slug),
      ["can-frame"],
    )
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

// 대문의 최근 변경 칸이 seam이다. 묶음을 넣고 그린 칸에서 묶음 제목(summary), 펼친 페이지 링크, PR 링크를 본다.
describe("recentColumn", () => {
  const find = (nodes: ElementContent[], match: (node: Element) => boolean): Element[] =>
    nodes.flatMap((node) =>
      node.type !== "element"
        ? []
        : [...(match(node) ? [node] : []), ...find(node.children, match)],
    )
  const textOf = (node: ElementContent): string =>
    node.type === "text"
      ? node.value
      : node.type === "element"
        ? node.children.map(textOf).join("")
        : ""
  const hasClass = (name: string) => (node: Element) =>
    ((node.properties.className as string[] | undefined) ?? []).includes(name)
  const column = recentColumn(
    frontPage({
      pages: [
        { slug: "can-fd", title: "CAN FD", tags: [] },
        { slug: "can-frame", title: "CAN 프레임", tags: [] },
        { slug: "uds", title: "UDS", tags: [] },
      ],
      commits: [
        commit(
          "content: CAN 보강 (#12)",
          "2026-10-02T10:00:00+09:00",
          "+can-fd.md",
          "can-frame.md",
        ),
        commit("content: UDS 정정", "2026-10-01T10:00:00+09:00", "uds.md"),
      ],
    }).recentChanges,
    "ko-KR",
  )
  const items = find(column, hasClass("front-change"))

  test("묶음 제목은 펼침 단추(summary)이고 그 안에는 초점을 받는 요소가 없다", () => {
    const summaries = items.map((item) => find([item], (node) => node.tagName === "summary")[0])
    assert.deepStrictEqual(summaries.map(textOf), ["CAN 보강", "UDS 정정"])
    for (const summary of summaries) {
      assert.deepStrictEqual(
        find(summary.children, (node) => ["a", "button", "input"].includes(node.tagName)),
        [],
      )
    }
  })

  test("펼친 묶음은 페이지마다 제목을 글자로 한 위키 안 링크를 두고, 새 페이지에는 새 표시를 단다", () => {
    const pages = items.map((item) =>
      find([item], (node) => node.tagName === "li" && node !== item).map((li) => [
        textOf(find([li], hasClass("front-change-page"))[0]),
        find([li], hasClass("front-change-page"))[0].properties.href,
        find([li], hasClass("front-change-new")).map(textOf).join(""),
      ]),
    )
    assert.deepStrictEqual(pages, [
      [
        ["CAN FD", "./can-fd", "새"],
        ["CAN 프레임", "./can-frame", ""],
      ],
      [["UDS", "./uds", ""]],
    ])
  })

  // 린트나 Reader Testing 묶음은 수십 쪽을 고친다. 칸이 길어지지 않게 앞의 10쪽만 두고, 나머지는 한 번 더 펼친다.
  test("10쪽이 넘는 묶음은 나머지 페이지를 '외 N쪽 더 보기' 아래에 접어 둔다", () => {
    const slugs = Array.from({ length: 13 }, (_, i) => `p${String(i).padStart(2, "0")}`)
    const [item] = find(
      recentColumn(
        frontPage({
          pages: slugs.map((slug) => page(slug)),
          commits: [
            commit(
              "content: 린트 수정 (#50)",
              "2026-10-02T10:00:00+09:00",
              ...slugs.map((slug) => `${slug}.md`),
            ),
          ],
        }).recentChanges,
        "ko-KR",
      ),
      hasClass("front-change"),
    )
    const more = find([item], hasClass("front-change-more"))[0]
    const inMore = find([more], hasClass("front-change-page")).map(textOf)
    const all = find([item], hasClass("front-change-page")).map(textOf)
    assert.deepStrictEqual(all, slugs)
    assert.deepStrictEqual(inMore, slugs.slice(10))
    const summary = find([more], (node) => node.tagName === "summary")[0]
    assert.strictEqual(textOf(summary), "외 3쪽 더 보기")
    assert.deepStrictEqual(
      find(summary.children, (node) => ["a", "button", "input"].includes(node.tagName)),
      [],
    )
  })

  test("PR 번호는 summary 밖에서 PR로 링크하고, 번호가 없는 묶음은 쪽수만 적는다", () => {
    const links = items.map((item) =>
      find([item], (node) => node.tagName === "a" && !hasClass("front-change-page")(node)).map(
        (link) => [textOf(link), link.properties.href],
      ),
    )
    assert.deepStrictEqual(links, [[["#12", "https://github.com/jjongs2/ash-wiki/pull/12"]], []])
    assert.deepStrictEqual(
      items.map((item) => textOf(find([item], hasClass("front-change-meta"))[0])),
      ["#12 · 2쪽", "1쪽"],
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
