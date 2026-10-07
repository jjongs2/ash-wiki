import test, { describe } from "node:test"
import assert from "node:assert"
import type { FrontPageCommit, FrontPagePage } from "./index"
import { frontPage, RECENT_CHANGES_LIMIT } from "./index"

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
    ...["news/2026-W40", "news/index", "tags/network/can", "index"].map((slug) => page(slug)),
  ]
  const recent = (...commits: FrontPageCommit[]) => frontPage({ pages, commits }).recentChanges

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
        "news/2026-W40.md",
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

  test(`최근 ${RECENT_CHANGES_LIMIT}묶음까지만 준다`, () => {
    const commits = Array.from({ length: RECENT_CHANGES_LIMIT + 2 }, (_, i) =>
      commit(
        `content: 작업 ${i} (#${i + 1})`,
        `2026-09-${String(i + 1).padStart(2, "0")}`,
        "uds.md",
      ),
    )
    const changes = recent(...commits)
    assert.strictEqual(changes.length, RECENT_CHANGES_LIMIT)
    assert.strictEqual(changes[0]?.title, `작업 ${RECENT_CHANGES_LIMIT + 1}`)
  })
})
