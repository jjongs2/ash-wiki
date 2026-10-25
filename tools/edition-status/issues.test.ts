import test, { describe } from "node:test"
import assert from "node:assert"
import { keysOf, plan, render, type Issue } from "./issues"
import type { Change, ChangeKind, Publication } from "./model"
import { entry, page } from "./testing"

// 모음 이슈 동기화를 seam으로 본다. 바뀜과 모음 이슈(코멘트 포함)를 넣고, 더할 코멘트와 코멘트를 달 이슈만 본다.
const repo = "owner/wiki"
const doip: Publication = {
  name: "ISO 13400-2",
  page: page("iso-13400-2", "ISO 13400-2", "ISO", "2025"),
  entries: [],
}
const rfc: Publication = { name: "RFC 1146", entries: [] }
const current = [
  entry("iso-13400-2-2025", "ISO 13400-2:2025", {
    citedBy: new Map([
      ["iso-13400-2", 2],
      ["doip", 3],
    ]),
  }),
  entry("iso-13400-2-obp-2025", "ISO 13400-2:2025 (OBP preview)", {
    citedBy: new Map([["doip", 1]]),
  }),
]

function change(kind: ChangeKind, target: string, publication = doip): Change {
  return {
    publication,
    kind,
    target,
    evidence: [
      { field: `${target}의 currentStage`, value: "30.99", url: "https://example.org/95489" },
    ],
    current,
  }
}

const collection = (number: number, state: Issue["state"], changes: Change[]): Issue => ({
  number,
  state,
  comments: [render(changes, repo)],
})

describe("모음 이슈", () => {
  test("새 바뀜을 출판물마다 코멘트 하나로 모은다", () => {
    const { issue, comments } = plan(
      [
        change("revision", "ISO/CD 13400-2"),
        change("supplement", "ISO 13400-2:2025/Amd 1:2027"),
        change("withdrawn", "RFC 1146", rfc),
      ],
      [],
      repo,
    )
    assert.strictEqual(issue, undefined)
    assert.deepStrictEqual(
      comments.map(({ publication }) => publication),
      ["ISO 13400-2", "RFC 1146"],
    )
    assert.deepStrictEqual(keysOf({ number: 0, state: "open", comments: [comments[0].body] }), [
      "ISO 13400-2 | revision | ISO/CD 13400-2",
      "ISO 13400-2 | supplement | ISO 13400-2:2025/Amd 1:2027",
    ])
  })

  test("열린 모음 이슈가 있으면 거기에 코멘트를 더한다", () => {
    const open = collection(7, "open", [change("withdrawn", "RFC 1146", rfc)])
    const { issue, comments } = plan([change("revision", "ISO/CD 13400-2")], [open], repo)
    assert.strictEqual(issue?.number, 7)
    assert.deepStrictEqual(
      comments.map(({ publication }) => publication),
      ["ISO 13400-2"],
    )
  })

  test("열리거나 닫힌 모음 이슈의 코멘트에 적힌 바뀜은 다시 알리지 않고, 더 새 바뀜만 알린다", () => {
    const closed = collection(5, "closed", [change("revision", "ISO/CD 13400-2")])
    const open = collection(9, "open", [change("withdrawn", "RFC 1146", rfc)])
    const repeated = plan(
      [change("revision", "ISO/CD 13400-2"), change("withdrawn", "RFC 1146", rfc)],
      [closed, open],
      repo,
    )
    assert.deepStrictEqual(repeated.comments, [])
    const newer = plan(
      [change("revision", "ISO/CD 13400-2"), change("new-edition", "ISO 13400-2:2028")],
      [closed, open],
      repo,
    )
    assert.deepStrictEqual(
      keysOf({ number: 0, state: "open", comments: newer.comments.map((c) => c.body) }),
      ["ISO 13400-2 | new-edition | ISO 13400-2:2028"],
    )
    assert.strictEqual(newer.issue?.number, 9)
  })

  test("코멘트에 바뀜의 종류, 근거, 영향받는 페이지와 인용 수를 명시적 링크로 적는다", () => {
    const body = render([change("revision", "ISO/CD 13400-2")], repo)
    assert.match(body, /^## ISO 13400-2$/m)
    assert.match(body, /^### 개정 착수: ISO\/CD 13400-2$/m)
    assert.match(
      body,
      /^- ISO\/CD 13400-2의 currentStage: 30\.99 \(\[원문\]\(https:\/\/example\.org\/95489\)\)$/m,
    )
    assert.match(
      body,
      /^- \[iso-13400-2\]\(https:\/\/github\.com\/owner\/wiki\/blob\/main\/content\/iso-13400-2\.md\): 표준 페이지, 인용 2$/m,
    )
    assert.match(
      body,
      /^- \[doip\]\(https:\/\/github\.com\/owner\/wiki\/blob\/main\/content\/doip\.md\): 인용 4$/m,
    )
    assert.doesNotMatch(body, /(^|\s)#[0-9]/)
  })
})
