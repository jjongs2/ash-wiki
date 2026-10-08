import test, { after, before, describe } from "node:test"
import assert from "node:assert"
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

// 반영 뒤 점검 CLI가 테스트 seam이다. 임시 git 저장소에 base를 main으로 커밋하고, head를 브랜치에서 커밋하고,
// untracked는 추적하지 않은 채로 둔 뒤 출력 줄과 종료 코드를 본다.
const here = path.dirname(fileURLToPath(import.meta.url))
const fixtures = path.join(here, "fixtures")

function git(cwd: string, ...args: string[]) {
  const result = spawnSync(
    "git",
    ["-c", "user.name=test", "-c", "user.email=test@example.com", ...args],
    { cwd, encoding: "utf8" },
  )
  assert.strictEqual(result.status, 0, result.stderr)
}

interface Report {
  exitCode: number | null
  headers: string[]
  items: Map<string, string[]>
  last: string
}

const timeoutMs = 30_000

function run(repo: string, ...args: string[]): Report {
  const result = spawnSync(
    process.execPath,
    ["--import", import.meta.resolve("tsx"), path.join(here, "cli.ts"), "--base", "main", ...args],
    // 정규식이 역추적에 빠지면 CLI가 끝나지 않으니, 멈추는 대신 실패하게 시간을 정한다.
    { cwd: repo, encoding: "utf8", timeout: timeoutMs },
  )
  assert.strictEqual(result.signal, null, `CLI가 ${timeoutMs}ms 안에 끝나지 않았다`)
  assert.strictEqual(result.stderr.includes("Error"), false, result.stderr)
  const headers: string[] = []
  const items = new Map<string, string[]>()
  let current = ""
  for (const line of result.stdout.split("\n")) {
    const header = line.match(/^(?:SKIP )?([a-z-]+)(?:: 후보 \d+| \()/)
    if (header) {
      current = header[1]
      headers.push(line)
      items.set(current, [])
    } else if (line.startsWith("  ")) items.get(current)!.push(line.trim())
  }
  const last = result.stdout.trimEnd().split("\n").at(-1) ?? ""
  return { exitCode: result.status, headers, items, last }
}

const has = (lines: string[] | undefined, ...parts: string[]) =>
  (lines ?? []).some((line) => parts.every((part) => line.includes(part)))

describe("check-diff CLI", { concurrency: false }, () => {
  let repo = ""
  let report: Report

  before(() => {
    repo = fs.mkdtempSync(path.join(os.tmpdir(), "ash-wiki-check-diff-"))
    fs.cpSync(path.join(fixtures, "base"), repo, { recursive: true })
    git(repo, "init", "-q", "-b", "main")
    git(repo, "add", ".")
    git(repo, "commit", "-q", "-m", "base")
    git(repo, "switch", "-q", "-c", "work")
    fs.cpSync(path.join(fixtures, "head"), repo, { recursive: true })
    git(repo, "add", ".")
    git(repo, "commit", "-q", "-m", "head")
    fs.cpSync(path.join(fixtures, "untracked"), repo, { recursive: true })
    report = run(repo, "--ticket-body", path.join(fixtures, "ticket.md"))
  })

  after(() => fs.rmSync(repo, { recursive: true, force: true }))

  test("후보가 있어도 exit 0이고, 항목마다 머리 줄을 찍는다", () => {
    assert.strictEqual(report.exitCode, 0)
    assert.deepStrictEqual(
      [...report.items.keys()],
      [
        "standard-sentence",
        "duplicate",
        "uncited-block",
        "emphasis",
        "repeated-citation",
        "shortened",
        "source-run",
        "owner-page",
        "abbreviation",
        "term",
        "first-link",
        "diagram-place",
      ],
    )
  })

  test("마지막 줄에 돈 항목 수와 전체 항목 수, SKIP 수를 찍는다", () => {
    assert.strictEqual(report.last, "돈 항목 12/전체 12, SKIP 0")
  })

  test("표준 문장: 에서는과 밝힌다 꼴을 잡고, 추적하지 않는 새 페이지도 본다", () => {
    const lines = report.items.get("standard-sentence")
    assert.ok(has(lines, "content/controller.md:", "Bosch CAN FD 1.0에서는"), "integrating 행")
    assert.ok(has(lines, "content/controller.md:", "밝힌다"))
    assert.ok(has(lines, "content/controller.md:", "의 부록 A에서"))
    assert.ok(has(lines, "content/new-page.md:", "규격에서는"))
  })

  // 이 줄에서 멈추면 before()의 run()이 시간 초과로 실패한다.
  test("표준 문장: 표준 이름 뒤에 긴 영문 제목이 오고 에서가 없는 줄은 후보가 없다", () => {
    assert.ok(!has(report.items.get("standard-sentence"), "content/standard-title.md:"))
  })

  test("정의 자리: 연결어미 꼴을 잡고, 주제어 강조와 정의 강조는 넘긴다", () => {
    const lines = report.items.get("emphasis")
    assert.ok(has(lines, "content/definitions.md:", "강조가 없다", "EOF라 부르며"))
    assert.ok(has(lines, "content/definitions.md:", "강조가 없다", "오류 프레임이라 하며"))
    assert.ok(has(lines, "content/definitions.md:", "정의 자리가 아닌", "**샘플 포인트**"))
    assert.ok(!has(lines, "**정의**"))
  })

  test("이어진 인용: 목록을 문단 하나로 보고 같은 인용이 이어진 항목을 잡는다", () => {
    const lines = report.items.get("repeated-citation") ?? []
    assert.deepStrictEqual(
      lines.map((line) => line.replace(/: 같은.*/, "")),
      ["content/definitions.md:21"],
    )
  })

  test("인용 없는 블록: 목록을 여는 문장은 넘기고 새 페이지의 문단도 잡는다", () => {
    const lines = report.items.get("uncited-block")
    assert.ok(has(lines, "content/definitions.md:", "인용이 없는 문단이다"))
    assert.ok(has(lines, "content/new-page.md:", "추적하지 않는 페이지의"))
    assert.ok(!has(lines, "주요 규칙은"))
  })

  test("중복: 같은 인용의 비슷한 문장과 다른 페이지의 같은 강조를 보인다", () => {
    const lines = report.items.get("duplicate")
    assert.ok(has(lines, "content/controller.md:", "other-page:8"))
    assert.ok(has(lines, "content/definitions.md:", "**샘플 포인트**", "other-page"))
  })

  test("줄인 뒤: 앞 문장이 바뀐 지시어 문장과 도해에 남은 옛 표기를 잡는다", () => {
    const lines = report.items.get("shortened")
    assert.ok(has(lines, "content/controller.md:", "이 응답은"))
    assert.ok(has(lines, "content/controller.md:", '"master"', "lin-header.svg"))
  })

  test("출처 구간: 다른 출처를 끼워 넣은 뒤 구간을 다시 여는 바뀌지 않은 문단을 잡는다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(has(lines, "content/run-insert.md:18:", "PHY는 링크 세그먼트"))
    assert.ok(!has(lines, "content/run-insert.md:14:"), "끼워 넣은 문단은 출처를 밝혔다")
    assert.ok(!has(lines, "content/run-insert.md:12:"), "끼워 넣은 자리 앞의 구간은 그대로다")
    assert.ok(!has(lines, "content/run-insert.md:26:"), "바뀐 자리에서 먼 곳은 보지 않는다")
  })

  test("출처 구간: 구간 첫 문단을 지운 뒤 '이 표준'으로 구간을 여는 문단을 잡는다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.deepStrictEqual(
      lines
        .filter((line) => line.startsWith("content/run-delete.md"))
        .map((l) => l.replace(/: 구간.*/, "")),
      ["content/run-delete.md:12"],
    )
  })

  test("주인 페이지: 행마다 링크, 절 앵커, 문단의 문장 수를 보인다", () => {
    const lines = report.items.get("owner-page")
    assert.ok(has(lines, "content/linker-a.md:12:", "#오류 계수기", "앵커 있음", "1문장"))
    assert.ok(has(lines, "content/linker-a.md:16:", "앵커 없음", "3문장"))
    assert.ok(
      has(lines, "content/linker-b.md:", "주인 페이지 링크가 없다"),
      "고치지 않았어도 찍는다",
    )
    assert.ok(has(lines, "content/linker-a.md:", "두 주인", "링크가 없는 주인 페이지: other-page"))
    assert.ok(!has(lines, "content/other-page.md"), "단서 속 슬러그는 링크만 하는 곳이 아니다")
    assert.ok(!has(lines, "계획 없는 것"), "이름만인 줄은 건너뛴다")
  })

  test("주인 페이지: 아직 없는 페이지의 줄과 고치지 않은 페이지의 앵커·문장 수 줄은 접는다", () => {
    const lines = report.items.get("owner-page")
    assert.ok(!has(lines, "페이지가 없다"), "missing-page")
    assert.ok(!has(lines, "아직 없다"), "planned-page")
    assert.ok(!has(lines, "content/linker-c.md:"), "고치지 않은 페이지의 앵커")
    assert.ok(
      report.headers.some((h) => /^owner-page: 후보 \d+, 접음 3$/.test(h)),
      report.headers.join("\n"),
    )
  })

  test("약어: 풀이 없는 약어와 접두가 붙은 약어를 보이고, 풀이·링크·목록·부품 번호는 거른다", () => {
    const lines = report.items.get("abbreviation") ?? []
    assert.ok(has(lines, "content/definitions.md:", "BCH"))
    assert.ok(has(lines, "content/definitions.md:", "DIS (ISO/DIS)"))
    assert.ok(has(lines, "content/definitions.md:", "CRC"))
    assert.ok(
      has(lines, "content/definitions.md:", "풀이가 없다: RAM"),
      "괄호 안이어도 풀이가 아니다",
    )
    assert.ok(
      has(lines, "content/definitions.md:", "풀이가 없다: ICU"),
      "링크가 약어보다 뒤에 있다",
    )
    for (const word of ["DIO", "PWM"]) {
      assert.ok(
        !has(lines, `풀이가 없다: ${word}`),
        `이름과 풀이 안의 약어는 처음 나온 것으로 세지 않는다: ${word}`,
      )
    }
    for (const word of ["HS", "TJA", "CAN", "ECU", "SA"]) {
      assert.ok(!has(lines, `definitions.md`, `풀이가 없다: ${word}`), word)
    }
  })

  test("약어: 대소문자 섞인 낱말과 숫자가 든 낱말은 위키 어딘가에서 풀린 것만 본다", () => {
    const lines = report.items.get("abbreviation") ?? []
    assert.ok(has(lines, "content/definitions.md:32:", "풀이가 없다: ChrgM"))
    assert.ok(has(lines, "content/definitions.md:32:", "풀이가 없다: PAM3"))
    for (const word of ["DevSecOps", "FlexRay", "MHz", "TJA1042"]) {
      assert.ok(!has(lines, `풀이가 없다: ${word}`), word)
    }
  })

  test("약어: 밑줄이 든 이름은 백틱 없는 코드 이름으로 따로 찍는다", () => {
    const lines = report.items.get("abbreviation") ?? []
    assert.ok(has(lines, "content/definitions.md:32:", "백틱 없는 코드 이름: BIG_ENDIAN"))
    assert.ok(!has(lines, "풀이가 없다: BIG_ENDIAN"))
    assert.ok(!has(lines, "CAN_H"), "풀이하지 않는 약어 목록의 이름")
  })

  test("용어: 조건 없는 결정의 쓰지 않는 표기를 더한 줄에서 찾는다", () => {
    const lines = report.items.get("term") ?? []
    assert.ok(has(lines, "content/terms.md:12:", '"문맥" → "context" (#142)'))
    assert.ok(has(lines, "content/terms.md:14:", '"문맥 전환" → "context switch"'))
    assert.ok(!has(lines, "content/terms.md:14:", '"문맥" →'), "더 긴 표기에 든 일치")
    assert.ok(has(lines, "content/terms.md:16:", '"시험 케이스" → "테스트 케이스"'))
    assert.ok(
      has(
        lines,
        "content/terms.md:16:",
        '"Object-Oriented Programming, Systems, Languages & Applications"',
      ),
      "풀이 줄은 쉼표로 가르지 않는다",
    )
  })

  test("용어: 원어 병기, 낱말 경계 밖, 조건 있는 결정, alias, 큰따옴표 안은 건너뛴다", () => {
    const lines = report.items.get("term") ?? []
    assert.ok(!has(lines, "content/terms.md:18:"), "cybersecurity property, assets, Flash")
    assert.ok(!has(lines, "content/terms.md:20:"), "인용한 문서 제목")
    assert.ok(!has(lines, "content/terms.md:4:"), "alias")
  })

  test("첫 등장 링크: 다른 페이지 이름이 처음 나오는 더한 줄에 링크가 없으면 찍는다", () => {
    const lines = report.items.get("first-link") ?? []
    assert.ok(has(lines, "content/first-link.md:12:", "[[heartbeat]]"))
    assert.ok(has(lines, "content/first-link.md:22:", "[[bus-off]]", "링크는 22줄"))
  })

  test("첫 등장 링크: 더 긴 다른 페이지 이름의 일부는 그 이름으로 센다", () => {
    const lines = report.items.get("first-link") ?? []
    assert.ok(has(lines, "content/first-link.md:10:", "[[heartbeat-frame]]"))
    assert.ok(!has(lines, "content/first-link.md:10:", "[[heartbeat]]"))
  })

  test("첫 등장 링크: 안내 문장의 절 링크와 X의 Y 절 링크는 X 링크를 겸한다", () => {
    const lines = report.items.get("first-link") ?? []
    assert.ok(!has(lines, "[[sync-window]]"), "안내 문장의 절 링크")
    assert.ok(!has(lines, "[[guard-band]]"), "X의 Y")
  })

  test("첫 등장 링크: 하위 개념의 절 링크는 찍지 않고 페이지 링크로도 세지 않는다", () => {
    const lines = report.items.get("first-link") ?? []
    assert.ok(!has(lines, "content/first-link.md:18:"), "절 링크의 링크 글자")
    assert.ok(has(lines, "content/first-link.md:20:", "[[watch-dog]]"))
  })

  test("첫 등장 링크: 처음 나오는 자리가 바뀌지 않은 줄이면 찍지 않는다", () => {
    assert.ok(!has(report.items.get("first-link"), "content/linker-a.md:"))
  })

  test("도해 위치: 기존 도해 앞에 새로 들어온 문단만 잡는다", () => {
    const lines = report.items.get("diagram-place") ?? []
    assert.deepStrictEqual(
      lines.map((line) => line.replace(/: 기존.*/, "")),
      ["content/controller.md:24"],
    )
  })

  test("--ticket이 없으면 주인 페이지를 SKIP하고, --only는 그 항목만 찍는다", () => {
    const only = run(repo, "--only", "abbreviation", "--only", "owner-page")
    assert.deepStrictEqual(
      only.headers.map((h) => h.replace(/ 후보 \d+/, "")),
      ["SKIP owner-page (--ticket 없음)", "abbreviation:"],
    )
    assert.strictEqual(only.last, "돈 항목 1/전체 12, SKIP 1")
    assert.strictEqual(only.exitCode, 0)
  })
})
