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
        "unmatched-paren",
        "shortened",
        "source-run",
        "owner-page",
        "abbreviation",
        "term",
        "first-link",
        "diagram-place",
        "diagram-width",
        "inline-math",
      ],
    )
  })

  test("마지막 줄에 돈 항목 수와 전체 항목 수, SKIP 수를 찍는다", () => {
    assert.strictEqual(report.last, "돈 항목 15/전체 15, SKIP 0")
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

  test("짝 없는 괄호: 인용 위치를 뺀 뒤 문장 끝과 목록 항목에 남은 꼬리를 찍고, 수식과 코드는 세지 않는다", () => {
    const lines = report.items.get("unmatched-paren") ?? []
    assert.deepStrictEqual(
      lines.map((line) => line.replace(/: 닫는.*/, "")),
      ["content/location-tail.md:8", "content/location-tail.md:10"],
    )
    assert.ok(has(lines, "location-tail.md:8", ", e), f))"))
  })

  test("인라인 식: 맨 위 수준 항이 셋 이상이거나 \\frac이 든 식만 찍고, 괄호·첨자 안의 항과 $$는 보지 않는다", () => {
    const lines = report.items.get("inline-math") ?? []
    assert.deepStrictEqual(
      lines.map((line) => line.replace(/: .*/, "")),
      ["content/inline-math.md:8", "content/inline-math.md:12"],
    )
    assert.ok(has(lines, "inline-math.md:8", "2^r \\ge k + r + 1"))
    assert.ok(has(lines, "inline-math.md:12", "\\frac{a}{b}"))
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

  test("출처 구간: 같은 판의 다른 엔트리가 이으면 구간 안이고, 판이나 부가 바뀌면 새 구간이다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.deepStrictEqual(
      lines
        .filter((line) => line.startsWith("content/run-edition.md"))
        .map((l) => l.replace(/(:\d+): .*/, "$1")),
      [
        "content/run-edition.md:16", // CP 뒤의 AP
        "content/run-edition.md:18", // AP 뒤의 CP
        "content/run-edition.md:24", // 11898-1 뒤의 11898-2
        "content/run-edition.md:26", // 11898-2 OBP 뒤의 11898-1 OBP
        "content/run-edition.md:28", // 표준 번호를 제목에 담은 다른 발행기관의 자료
      ],
      "POSIX.1-2024 두 엔트리(10), CP R25-11 두 명세(14), 원문 뒤 OBP(22), µC/OS-III 문서 모음(30·32)은 구간 안이거나 이름을 밝혔다",
    )
    assert.ok(has(lines, "content/run-edition.md:18:", "끼었다", "끼운 블록: 16줄"), "CP 사이의 AP")
    assert.ok(
      has(lines, "content/run-edition.md:26:", "끼었다", "끼운 블록: 24줄"),
      "1부 사이의 2부",
    )
  })

  test("출처 구간: 엔트리 제목의 이름(The Sample Guide)으로 연 블록은 출처 표시가 있다", () => {
    const lines = report.items.get("source-run") ?? []
    for (const line of [8, 12, 24, 32, 34, 36])
      assert.ok(!has(lines, `content/run-repeat.md:${line}:`, "출처 표시가 없다"), `${line}`)
  })

  test("출처 구간: 같은 판의 구간 사이에 다른 출처의 블록이 끼면 출처 표시가 있어도 끼움으로 찍는다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(
      has(lines, "content/run-repeat.md:14:", "다른 출처의 블록이 끼었다", "끼운 블록: 12줄"),
    )
    assert.ok(!has(lines, "content/run-repeat.md:24:"), "끼운 블록이 따로 된 절이다")
    assert.ok(!has(lines, "content/run-repeat.md:32:"), "사이가 세 블록이면 끼움이 아니다")
    assert.ok(!has(lines, "content/run-repeat.md:36:"), "사이의 블록이 이 판을 함께 인용한다")
  })

  test("출처 구간: 구간 안에서 앞 문장이 밝힌 출처 이름을 주어나 '…에 따르면'으로 다시 쓴 문장을 찍는다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(
      has(lines, "content/run-repeat.md:10:", '다시 쓴다(앞: 8줄 "The Sample")', "보드에 열을"),
    )
    assert.ok(has(lines, "content/run-repeat.md:10:", "다시 쓴다", "에 따르면 열은"))
    assert.ok(!has(lines, "Sample 보드는"), "낱말 하나인 이름은 개념 이름과 겹친다")
    assert.ok(!has(lines, "2020년 판에서"), "이력 문장의 판 주어")
  })

  test("출처 구간: 다른 출처의 문장 바로 뒤에서 연 구간은 판 연도 없이 다시 쓴 이름을 찍지 않는다", () => {
    const lines = (report.items.get("source-run") ?? []).filter((line) =>
      line.includes("다시 쓴다"),
    )
    assert.ok(!has(lines, "content/run-repeat.md:16:"), "버전으로 판을 부르는 이름의 '…에 따르면'")
    assert.ok(!has(lines, "content/run-short-name.md:12:"), "Bosch CAN 2.0 규격")
    assert.ok(!has(lines, "ISO 11898-1은"), "판 연도를 뗀 이름")
    assert.ok(has(lines, "content/run-short-name.md:16:", '"ISO 11898-1"'), "판 연도를 붙인 이름")
    assert.ok(has(lines, "content/run-short-name.md:8:", "ISO 11898-2는"), "페이지 첫 구간")
  })

  test("출처 구간: 되풀이는 그 문장이나 이름이 먼저 나온 문장이 더한 줄일 때만 찍는다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(has(lines, "content/run-repeat-old.md:10:", '다시 쓴다(앞: 8줄 "The Sample")'))
    assert.ok(!has(lines, "content/run-repeat-old.md:16:"), "바뀌지 않은 구간")
  })

  test("표준 문장: 판 없는 합의 문서 주어와 '…에 따르면'을 찍고, 판을 붙인 것은 찍지 않는다", () => {
    const lines = report.items.get("standard-sentence") ?? []
    assert.ok(has(lines, "content/consensus.md:32:", "CTFL 강의계획서에 따르면"))
    assert.ok(has(lines, "content/consensus.md:34:", "SWEBOK에 따르면"))
    assert.ok(has(lines, "content/consensus.md:36:", "강의계획서는"), "풀이 괄호가 붙은 이름")
    for (const line of [14, 18, 24, 28, 38, 40, 42])
      assert.ok(!has(lines, `content/consensus.md:${line}:`), `${line}`)
  })

  test("표준 문장: 같은 절 앞 문장이 판을 붙여 연 출판물의 짧은 이름은 찍지 않는다", () => {
    const lines = report.items.get("standard-sentence") ?? []
    assert.ok(!has(lines, "content/consensus.md:56:"), "앞에 ISTQB CTFL v4.0.1 강의계획서")
    assert.ok(has(lines, "content/consensus.md:32:"), "앞 절의 판 이름은 세지 않는다")
    assert.ok(has(lines, "content/consensus.md:66:", "강의계획서도"), "조사 '도'")
  })

  test("출처 구간: 같은 절에서 판을 붙여 연 합의 문서의 짧은 이름은 되풀이로 찍지 않는다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(!has(lines, "content/consensus.md:60:", "다시 쓴다"))
  })

  test("짧은 이름은 같은 절에 같은 단체의 다른 출판물이 있을 때만 넘긴다", () => {
    const sentence = report.items.get("standard-sentence") ?? []
    const run = report.items.get("source-run") ?? []
    assert.ok(has(sentence, "content/consensus.md:70:", "CTFL 강의계획서에 따르면"), "출판물 하나")
    assert.ok(has(run, "content/consensus.md:70:", "다시 쓴다"), "출판물 하나")
    assert.ok(has(sentence, "content/consensus.md:74:", "SWEBOK에 따르면"), "지식 체계 하나")
    assert.ok(has(run, "content/consensus.md:74:", "다시 쓴다"), "지식 체계 하나")
  })

  test("출처 구간: 합의 문서 키만 인용한 블록은 절 첫 블록이어도 출처 표시 없음으로 찍지 않는다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(!has(lines, "content/consensus.md:", "출처 표시가 없다"))
  })

  test("출처 구간: Standards Track RFC 키만 인용한 블록은 출처 표시 없음으로 찍지 않고, 그 밖의 RFC 키는 찍는다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(!has(lines, "content/run-rfc.md:10:"), "Internet Standard인 RFC 1350")
    assert.ok(has(lines, "content/run-rfc.md:12:", "출처 표시가 없다"), "BCP인 RFC 3366")
  })

  test("출처 구간: 합의 문서 구간은 절에서 끊어, 새 절에서 판을 붙인 이름을 다시 적은 문장은 되풀이가 아니다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(has(lines, "content/consensus.md:14:", "다시 쓴다", "경계를 둘로"), "같은 절")
    assert.ok(!has(lines, "content/consensus.md:24:", "다시 쓴다"))
    assert.ok(
      !has(lines, "content/consensus.md:14:", "다시 쓴다", "효과가 높다"),
      "구간 안의 가리키는 말",
    )
  })

  test("출처 구간: 새 절이나 다른 출처 뒤에서 합의 문서 구간을 가리키는 말로 여는 문장을 찍는다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(has(lines, "content/consensus.md:18:", "가리키는 말로 연다"), "새 절")
    assert.ok(has(lines, "content/consensus.md:28:", "가리키는 말로 연다"), "다른 출처 뒤")
    assert.ok(
      !has(lines, "content/consensus.md:14:", "가리키는 말로 연다"),
      "앞 문장이 이름을 밝혔다",
    )
  })

  test("출처 구간: 판 없는 온라인 용어집(ISTQB Glossary — 용어)은 용어마다 엔트리를 두어도 한 출처다", () => {
    const lines = report.items.get("source-run") ?? []
    assert.ok(!has(lines, "content/consensus.md:48:"), "앞 문장이 같은 용어집의 이름을 밝혔다")
  })

  test("출처 구간: 문서 모음 표의 쪽들은 한 출처이고, 같은 사이트라도 표에 들지 않는 쪽은 따로 센다", () => {
    const lines = (report.items.get("source-run") ?? [])
      .filter((line) => line.startsWith("content/run-collection.md"))
      .map((l) =>
        l.replace(
          /^(\S+:\d+): (구간을 여는데 출처 표시가 없다|구간 안에서 출처 이름을 다시 쓴다).*/,
          "$1 $2",
        ),
      )
    assert.deepStrictEqual(lines, [
      "content/run-collection.md:10 구간 안에서 출처 이름을 다시 쓴다", // 다른 쪽의 "CiA에 따르면"
      "content/run-collection.md:14 구간을 여는데 출처 표시가 없다", // 소식지 호수
      "content/run-collection.md:20 구간을 여는데 출처 표시가 없다", // 홈(그 쪽만) 곁의 제품 쪽
      "content/run-collection.md:24 구간 안에서 출처 이름을 다시 쓴다", // 같은 부의 "IEC 60050은"
      "content/run-collection.md:26 구간을 여는데 출처 표시가 없다", // IEV의 다른 부
    ])
    assert.ok(
      !has(lines, "content/run-collection.md:12"),
      "끝 슬래시 있는 쪽도 모음에 들고, 모음 이름으로 시작하는 규격 이름(CiA 301)은 출처 이름이 아니다",
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

  test("주인 페이지: 절 앵커가 없으면 행의 개념 이름과 맞는 주인 페이지의 절 제목을 함께 보인다", () => {
    const lines = report.items.get("owner-page")
    assert.ok(
      has(
        lines,
        "content/linker-a.md:20:",
        "앵커 없음(맞는 절: #시간 구간과 운용 모드, #분산 개발)",
      ),
      "와로 나눈 이름과 정의 강조로 옮긴 이름",
    )
    assert.ok(has(lines, "content/linker-a.md:16:", "앵커 없음, 문단"), "맞는 절이 없다")
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
    assert.ok(has(lines, "content/definitions.md:", "LDPC"))
    assert.ok(has(lines, "content/definitions.md:", "DIS (ISO/DIS)"))
    assert.ok(has(lines, "content/definitions.md:", "CRC"))
    assert.ok(
      has(lines, "content/definitions.md:", "풀이가 없다: NVM"),
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
    for (const word of ["DevSecOps", "SnapshotRecord", "FlexRay", "MHz", "TJA1042"]) {
      assert.ok(!has(lines, `풀이가 없다: ${word}`), word)
    }
  })

  test("약어: 대상이 푸는 약어를 링크 뒤 괄호로 또 풀면 찍는다", () => {
    const lines = report.items.get("abbreviation") ?? []
    assert.ok(
      has(lines, "content/link-gloss.md:8:", "링크 뒤 풀이: [[layered|BSW]](Basic Software)"),
      "머리말이 푸는 약어",
    )
    assert.ok(
      has(
        lines,
        "content/link-gloss.md:8:",
        "링크 뒤 풀이: [[layered#이더넷|SoAd]](Socket Adaptor)",
      ),
      "절이 푸는 약어",
    )
    for (const line of [10, 12, 14]) {
      assert.ok(!has(lines, `content/link-gloss.md:${line}:`), `거르는 경우: ${line}줄`)
    }
  })

  test("약어: µ로 시작하는 낱말 안의 대문자열은 세지 않는다", () => {
    const lines = report.items.get("abbreviation") ?? []
    assert.ok(has(lines, "content/definitions.md:34:", "풀이가 없다: RTOS"), "같은 줄의 약어")
    for (const word of ["OS", "III", "II"]) {
      assert.ok(!has(lines, `풀이가 없다: ${word}`), `µC/OS-III 안의 ${word}`)
    }
  })

  test("약어: 밑줄이 든 이름은 백틱 없는 코드 이름으로 따로 찍는다", () => {
    const lines = report.items.get("abbreviation") ?? []
    assert.ok(has(lines, "content/definitions.md:32:", "백틱 없는 코드 이름: BIG_ENDIAN"))
    assert.ok(!has(lines, "풀이가 없다: BIG_ENDIAN"))
    assert.ok(!has(lines, "CAN_H"), "풀이하지 않는 약어 목록의 이름")
  })

  test("약어: 소개하는 조직 약어의 첫 자리에 괄호 소개도 링크도 없으면 찍는다", () => {
    const lines = report.items.get("abbreviation") ?? []
    for (const name of ["CISA", "WP.29", "CCSDS", "MIPI", "EIA"]) {
      assert.ok(has(lines, "content/organizations.md:", `소개가 없다: ${name}`), name)
    }
    for (const name of ["MITRE", "Auto-ISAC", "HIS", "CISPR", "CCITT", "TIA", "AUMOVIO", "CCRA"]) {
      assert.ok(!has(lines, `소개가 없다: ${name}`), `소개했거나 세지 않는 자리: ${name}`)
    }
    for (const name of ["ISO", "NIST"]) {
      assert.ok(!has(lines, "content/organizations.md:", name), `널리 알려진 조직: ${name}`)
    }
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
    assert.ok(has(lines, "content/terms.md:22:", '"문맥" →'), "한글 괄호는 원어 병기가 아니다")
    assert.ok(has(lines, "content/terms.md:22:", '"시험 케이스" →'))
  })

  test("용어: 조건 있는 결정은 결정의 조건과 함께 조건 확인으로 찍는다", () => {
    const lines = report.items.get("term") ?? []
    assert.ok(
      has(
        lines,
        "content/terms.md:18:",
        '조건 확인 "Flash" → "플래시" (#257, 조건: 일반 낱말일 때.',
      ),
    )
    assert.ok(
      has(lines, "content/terms.md:24:", '조건 확인 "장애" → "failure" (#291, 조건: 합성어 포함.'),
    )
  })

  test("용어: 원어 병기, 낱말 경계 밖, alias, 큰따옴표 안은 건너뛴다", () => {
    const lines = report.items.get("term") ?? []
    assert.ok(
      !has(lines, "content/terms.md:18:", "쓰지 않는 표기"),
      "cybersecurity property, assets",
    )
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

  test("첫 등장 링크: 링크 글자가 X로 시작하는 절 링크는 앞에 X가 없으면 X 링크를 겸한다", () => {
    const lines = report.items.get("first-link") ?? []
    assert.ok(!has(lines, "content/first-link-abbr.md:8:"), "[[xbus#속도|XBUS 속도]] 뒤의 XBUS")
    assert.ok(has(lines, "content/first-link-abbr.md:10:", "[[heartbeat]]"), "링크 앞의 하트비트")
  })

  test("첫 등장 링크: 하위 개념의 절 링크는 찍지 않고 페이지 링크로도 세지 않는다", () => {
    const lines = report.items.get("first-link") ?? []
    assert.ok(!has(lines, "content/first-link.md:18:"), "절 링크의 링크 글자")
    assert.ok(has(lines, "content/first-link.md:20:", "[[watch-dog]]"))
  })

  test("첫 등장 링크: 제목이 다른 페이지 이름인 영문 낱말로 시작하면 그 낱말을 뗀 이름도 찾는다", () => {
    const lines = report.items.get("first-link") ?? []
    assert.ok(has(lines, "content/first-link.md:24:", "[[xbus-error-frame]]", '"오류 프레임"'))
  })

  test("첫 등장 링크: 영문 낱말 뒤 괄호라도 한글 설명이면 풀이가 아니라 찾는다", () => {
    assert.ok(has(report.items.get("first-link"), "content/first-link.md:30:", "[[bit-stuffing]]"))
  })

  test("첫 등장 링크: 판이 뒤따르는 표준 기구 이름은 발행기관이라 넘긴다", () => {
    const lines = report.items.get("first-link") ?? []
    assert.ok(!has(lines, "content/first-link.md:26:"))
    assert.ok(has(lines, "content/first-link.md:28:", "[[autosar]]"))
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

  test("도해 폭: 브랜치가 더하거나 고친 도해 가운데 문턱보다 넓은 것만 찍고, 기존 도해는 폭이 바뀌었는지 보인다", () => {
    const lines = report.items.get("diagram-width") ?? []
    assert.deepStrictEqual(
      lines.map((line) => line.replace(/: .*/, "")),
      [
        "content/diagrams/wide-new.svg:1",
        "content/diagrams/wide-relabeled.svg:1",
        "content/diagrams/wide-resized.svg:1",
        "content/diagrams/wide-untracked.svg:1",
      ],
      "고치지 않은 넓은 도해와 좁은 도해는 찍지 않는다",
    )
    assert.ok(has(lines, "wide-new.svg:1", "viewBox 폭 800", "새 도해"))
    assert.ok(has(lines, "wide-relabeled.svg:1", "viewBox 폭 800", "기존 도해, 폭 그대로"))
    assert.ok(has(lines, "wide-resized.svg:1", "viewBox 폭 800", "기존 도해, 폭 900에서 바뀜"))
    assert.ok(has(lines, "wide-untracked.svg:1", "새 도해"))
  })

  test("--ticket이 없으면 주인 페이지를 SKIP하고, --only는 그 항목만 찍는다", () => {
    const only = run(repo, "--only", "abbreviation", "--only", "owner-page")
    assert.deepStrictEqual(
      only.headers.map((h) => h.replace(/ 후보 \d+/, "")),
      ["SKIP owner-page (--ticket 없음)", "abbreviation:"],
    )
    assert.strictEqual(only.last, "돈 항목 1/전체 15, SKIP 1")
    assert.strictEqual(only.exitCode, 0)
  })
})
