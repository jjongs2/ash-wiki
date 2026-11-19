import test, { describe } from "node:test"
import assert from "node:assert"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { repoRoot } from "../repo"

// 검사기 CLI가 유일한 테스트 seam이다. 픽스처 폴더를 저장소 루트로 넣고 출력 줄과 종료 코드만 본다.
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
const LOG = "docs/decision-log.md"

describe("check-trace CLI", () => {
  test("통과 폴더는 모든 검사가 OK이고 exit 0이다", () => {
    assert.deepStrictEqual(pass.statuses, ["OK decision-log", "OK links"])
    assert.strictEqual(pass.exitCode, 0)
  })

  test("위반 폴더는 모든 검사가 FAIL이고 exit 1이다", () => {
    assert.deepStrictEqual(violation.statuses, ["FAIL decision-log", "FAIL links"])
    assert.strictEqual(violation.exitCode, 1)
  })

  test("결정 로그의 겹친 ID와 ID나 이름 없는 제목, 항목 밖의 줄을 잡는다", () => {
    has("decision-log", `${LOG}:5`, "### 항목 제목과 그 아래 필드 불릿만")
    has("decision-log", `${LOG}:15`, "7줄에도 있다")
    has("decision-log", `${LOG}:37`, "ID로 시작한다")
    has("decision-log", `${LOG}:91`, "제목에 이름이 없다")
    has("decision-log", `${LOG}:98`, "### 항목 제목과 그 아래 필드 불릿만")
  })

  test("빠지거나 겹치거나 모르는 필드, 꼴이 틀린 규칙과 근거를 잡는다", () => {
    has("decision-log", `${LOG}:22`, "버린 대안이 없다")
    has("decision-log", `${LOG}:22`, "링크나 없음")
    has("decision-log", `${LOG}:22`, "근거는")
    has("decision-log", `${LOG}:29`, "빠진 필드: 까닭")
    has("decision-log", `${LOG}:29`, "근거 필드가 둘")
    has("decision-log", `${LOG}:77`, "절(#앵커) 링크")
    has("decision-log", `${LOG}:84`, "절(#앵커) 링크")
    has("decision-log", `${LOG}:91`, "결정이 비었다")
    has("decision-log", `${LOG}:93`, "필드는 채택·보류·기각")
  })

  test("대체 짝이 어긋난 곳을 양쪽에서 잡는다", () => {
    has("decision-log", `${LOG}:41`, "D5에 대체: D4")
    has("decision-log", `${LOG}:48`, "D6의 제목에 (D5이 대체)가 없다")
    has("decision-log", `${LOG}:48`, "대체한 항목이 없다: D9")
    has("decision-log", `${LOG}:48`, "쉼표로 가른다: 셋")
    has("decision-log", `${LOG}:63`, "대체한 ADR이 없다: ADR 2")
    has("decision-log", `${LOG}:70`, "대체한 항목이 없다: D10")
  })

  test("없는 파일, 폴더, 그림, 절과 저장소 밖 링크를 잡는다", () => {
    has("links", "README.md:3", "없는 파일: docs/missing.md")
    has("links", "README.md:4", "docs/adr/0001-a.md에 없는 절")
    has("links", "README.md:5", "README.md에 없는 절")
    has("links", "README.md:6", "저장소 밖")
    has("links", "README.md:7", "없는 파일: docs/missing/")
    has("links", "README.md:8", "없는 파일: docs/missing.svg")
    assert.strictEqual(at("links").length, 6)
  })
})
