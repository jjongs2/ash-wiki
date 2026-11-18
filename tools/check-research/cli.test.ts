import test, { describe } from "node:test"
import assert from "node:assert"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { repoRoot } from "../repo"

// 검사기 CLI가 유일한 테스트 seam이다. 픽스처 폴더를 넣고 출력 줄과 종료 코드만 본다.
const here = path.dirname(fileURLToPath(import.meta.url))

function runChecker(fixture: string) {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", path.join(here, "cli.ts"), path.join(here, "fixtures", fixture)],
    { cwd: repoRoot, encoding: "utf8" },
  )
  const statuses: string[] = []
  const locations = new Map<string, string[]>()
  let current = ""
  for (const line of result.stdout.split("\n")) {
    const status = line.match(/^(OK|FAIL) +(\S+)/)
    if (status) {
      current = status[2]
      statuses.push(`${status[1]} ${current}`)
      locations.set(current, [])
      continue
    }
    const location = line.match(/^ +(\S+?(?::\d+)?): (.*)$/)
    if (location) locations.get(current)!.push(`${location[1]}: ${location[2]}`)
  }
  return { exitCode: result.status, statuses, locations }
}

const pass = runChecker("pass")
const violation = runChecker("violation")
const at = (check: string) => violation.locations.get(check) ?? []
const has = (check: string, location: string, text: string) =>
  assert.ok(
    at(check).some((line) => line.startsWith(`${location}: `) && line.includes(text)),
    `${check}에 ${location}의 "${text}"가 없다:\n${at(check).join("\n")}`,
  )

describe("check-research CLI", () => {
  test("통과 폴더는 모든 검사가 OK이고 exit 0이다", () => {
    assert.deepStrictEqual(pass.statuses, ["OK table", "OK placeholder", "OK sources", "OK claims"])
    assert.strictEqual(pass.exitCode, 0)
  })

  test("위반 폴더는 모든 검사가 FAIL이고 exit 1이다", () => {
    assert.deepStrictEqual(violation.statuses, [
      "FAIL table",
      "FAIL placeholder",
      "FAIL sources",
      "FAIL claims",
    ])
    assert.strictEqual(violation.exitCode, 1)
  })

  test("셀 안의 이스케이프하지 않은 |를 잡는다", () => {
    has("table", "claims.md:24", "\\|로 쓴다")
    assert.strictEqual(at("table").length, 1)
  })

  test("영어 자리와 출처 꼴의 자리도 잡고, 코드, 주석, 태그, 자동 링크, README는 보지 않는다", () => {
    has("placeholder", "claims.md:25", "<주장>")
    has("placeholder", "claims.md:25", "<S101 §2>")
    has("placeholder", "claims.md:25", "<original text>")
    has("placeholder", "no-table.md:1", "YYYY-MM-DD")
    assert.strictEqual(at("placeholder").length, 4)
  })

  test("출처 목록의 겹친 ID, 겹친 URL, 빈 판, 틀린 날짜와 종류를 잡는다", () => {
    has("sources", "sources.md:6", "5줄에도")
    has("sources", "sources.md:7", "S200의 URL과 같다")
    has("sources", "sources.md:8", "판이 비었다")
    has("sources", "sources.md:8", "2026-02-30")
    has("sources", "sources.md:8", "3차")
    has("sources", "sources.md:10", "S202의 URL과 같다")
    assert.strictEqual(at("sources").length, 6)
  })

  test("주장 표의 출처와 신뢰도를 잡는다", () => {
    has("claims", "claims.md:17", "2차 출처만")
    has("claims", "claims.md:18", "U만 된다")
    has("claims", "claims.md:19", "S999")
    has("claims", "claims.md:20", "URL이 있다")
    has("claims", "claims.md:21", "인용이 비었다")
    has("claims", "claims.md:22", "H, M, U")
    has("claims", "claims.md:23", "22줄에도")
    has("claims", "claims.md:26", ";로 가른다")
    has("claims", "no-table.md", "주장 표가 하나여야")
    has("claims", "no-table.md:1", "제목")
  })

  test("주장 표 밖의 표는 주장 ID로 근거를 가리키고, 출처나 신뢰도 열을 두지 않는다", () => {
    has("claims", "claims.md:6", "주장 ID를 가리킨다")
    has("claims", "claims.md:7", "C99")
    has("claims", "claims.md:9", "주장 표에만 둔다")
  })
})
