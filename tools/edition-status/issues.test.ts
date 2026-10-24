import test, { describe } from "node:test"
import assert from "node:assert"
import { keysOfIssue, plan, render, type Issue } from "./issues"
import type { Change, ChangeKind, Publication } from "./model"
import { entry, page } from "./testing"

// 이슈 동기화를 seam으로 본다. 바뀜과 저장소의 이슈를 넣고 열거나 갱신할 이슈만 본다.
const repo = "owner/wiki"
const doip: Publication = {
  name: "ISO 13400-2",
  page: page("iso-13400-2", "ISO 13400-2", "ISO", "2025"),
  entries: [],
}
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

const issue = (number: number, state: Issue["state"], changes: Change[]): Issue => ({
  number,
  state,
  title: `edition: ${changes[0].publication.name}`,
  body: render(changes, repo),
})

describe("이슈", () => {
  test("열린 이슈가 없으면 출판물마다 하나를 연다", () => {
    const rfc: Publication = { name: "RFC 1146", entries: [] }
    const actions = plan(
      [
        change("revision", "ISO/CD 13400-2"),
        change("supplement", "X/Amd 1"),
        change("withdrawn", "RFC 1146", rfc),
      ],
      [],
      repo,
    )
    assert.deepStrictEqual(
      actions.map((action) => [
        action.kind,
        action.kind === "open" ? action.title : "",
        action.changes.length,
      ]),
      [
        ["open", "edition: ISO 13400-2", 2],
        ["open", "edition: RFC 1146", 1],
      ],
    )
  })

  test("같은 출판물의 열린 이슈가 있으면 새로 열지 않고 본문을 갱신한다", () => {
    const open = issue(7, "open", [change("revision", "ISO/CD 13400-2")])
    const actions = plan(
      [change("revision", "ISO/CD 13400-2"), change("supplement", "ISO 13400-2:2025/Amd 1:2027")],
      [open],
      repo,
    )
    assert.strictEqual(actions.length, 1)
    assert.strictEqual(actions[0].kind, "update")
    assert.strictEqual(actions[0].kind === "update" && actions[0].issue.number, 7)
    assert.deepStrictEqual(keysOfIssue({ ...open, body: actions[0].body }), [
      "ISO 13400-2 | revision | ISO/CD 13400-2",
      "ISO 13400-2 | supplement | ISO 13400-2:2025/Amd 1:2027",
    ])
  })

  test("본문이 같으면 갱신하지 않는다", () => {
    const changes = [change("revision", "ISO/CD 13400-2")]
    assert.deepStrictEqual(plan(changes, [issue(7, "open", changes)], repo), [])
  })

  test("같은 키의 닫힌 이슈가 있으면 닫힌 이유와 상관없이 열지 않고, 더 새 바뀜일 때만 연다", () => {
    const closed = issue(5, "closed", [change("revision", "ISO/CD 13400-2")])
    assert.deepStrictEqual(plan([change("revision", "ISO/CD 13400-2")], [closed], repo), [])
    const actions = plan(
      [change("revision", "ISO/CD 13400-2"), change("new-edition", "ISO 13400-2:2028")],
      [closed],
      repo,
    )
    assert.deepStrictEqual(
      actions.map((action) => keysOfIssue({ ...closed, body: action.body })),
      [["ISO 13400-2 | new-edition | ISO 13400-2:2028"]],
    )
  })

  test("다른 출판물의 이슈는 보지 않는다", () => {
    const other: Publication = { name: "ISO 13400-3", entries: [] }
    const open = issue(9, "open", [change("revision", "ISO/CD 13400-2", other)])
    const actions = plan([change("revision", "ISO/CD 13400-2")], [open], repo)
    assert.deepStrictEqual(
      actions.map((action) => action.kind),
      ["open"],
    )
  })

  test("본문에 바뀜의 종류, 근거, 영향받는 페이지와 인용 수를 명시적 링크로 적는다", () => {
    const body = render([change("revision", "ISO/CD 13400-2")], repo)
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
