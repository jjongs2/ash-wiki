import { describe, test } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { axeTargets, splitExceptions, type Violation } from "./targets"

describe("axeTargets", () => {
  test("최신 호는 해가 바뀌어도 가장 늦은 호이고, 지난 호 목록 파일은 호가 아니다", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "axe-targets-"))
    const news = path.join(root, "content", "news")
    fs.mkdirSync(news, { recursive: true })
    for (const file of ["2026-w09.md", "2026-w52.md", "2027-w01.md", "index.md"])
      fs.writeFileSync(path.join(news, file), "")
    const latest = axeTargets(root).find((t) => t.name === "최신 호")
    assert.strictEqual(latest?.path, "/news/2027-w01")
  })
})

// 브라우저가 노드마다 걸린 예외 선택자의 이름을 적어 오면, 소유자가 허용한 예외(EXCEPTIONS)만 위반에서 빠지는지를
// seam으로 본다.
const node = (target: string, exceptions: string[] = []) => ({
  target,
  html: "<p></p>",
  summary: "",
  exceptions,
})

describe("splitExceptions", () => {
  test("콜아웃 제목의 대비 위반은 예외로 빠지고, 다른 대비 위반은 남는다", () => {
    const violations: Violation[] = [
      {
        id: "color-contrast",
        help: "",
        nodes: [node(".callout-title-inner > p", ["콜아웃 제목"]), node("footer > a")],
      },
    ]
    const { violations: left, excepted } = splitExceptions(violations)
    assert.deepStrictEqual(
      left.map((v) => [v.id, v.nodes.map((n) => n.target)]),
      [["color-contrast", ["footer > a"]]],
    )
    assert.deepStrictEqual(
      excepted.map((v) => [v.id, v.nodes.map((n) => n.target)]),
      [["color-contrast", [".callout-title-inner > p"]]],
    )
  })

  test("예외 자리에 걸린 노드라도 대비가 아닌 규칙의 위반은 남는다", () => {
    const violations: Violation[] = [
      { id: "nested-interactive", help: "", nodes: [node(".callout-title > a", ["콜아웃 제목"])] },
    ]
    const { violations: left, excepted } = splitExceptions(violations)
    assert.deepStrictEqual(
      left.map((v) => v.id),
      ["nested-interactive"],
    )
    assert.deepStrictEqual(excepted, [])
  })
})
