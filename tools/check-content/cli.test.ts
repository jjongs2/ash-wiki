import test, { describe } from "node:test"
import assert from "node:assert"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { repoRoot } from "../repo"

// 검사기 CLI가 유일한 테스트 seam이다. 픽스처 트리를 넣고 출력 줄과 종료 코드만 본다.
const here = path.dirname(fileURLToPath(import.meta.url))

interface Report {
  exitCode: number | null
  statuses: readonly string[]
  locations: ReadonlyMap<string, readonly string[]>
  messages: ReadonlyMap<string, readonly string[]>
}

// 같은 픽스처와 옵션의 출력은 늘 같으니, 처음 부른 테스트가 돌린 결과를 다른 테스트가 함께 쓴다.
// 테스트는 결과를 읽기만 하고, Report의 readonly가 이를 지킨다.
const reports = new Map<string, Report>()

function runChecker(fixture: string, ...args: string[]): Report {
  const key = [fixture, ...args].join(" ")
  let report = reports.get(key)
  if (!report) {
    report = spawnChecker(fixture, args)
    reports.set(key, report)
  }
  return report
}

function spawnChecker(fixture: string, args: string[]): Report {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", path.join(here, "cli.ts"), path.join(here, "fixtures", fixture), ...args],
    { cwd: repoRoot, encoding: "utf8" },
  )
  const statuses: string[] = []
  const locations = new Map<string, string[]>()
  const messages = new Map<string, string[]>()
  let current = ""
  for (const line of result.stdout.split("\n")) {
    const status = line.match(/^(OK|FAIL|SKIP) +(\S+)/)
    if (status) {
      current = status[2]
      statuses.push(`${status[1]} ${current}`)
      locations.set(current, [])
      messages.set(current, [])
      continue
    }
    const location = line.match(/^ +(\S+?(?::\d+)?): (.*)$/)
    if (location) {
      locations.get(current)!.push(location[1])
      messages.get(current)!.push(`${location[1]}: ${location[2]}`)
    }
  }
  return { exitCode: result.status, statuses, locations, messages }
}

describe("check-content CLI", { concurrency: false }, () => {
  test("통과 트리는 모든 검사가 OK이고 exit 0이다", () => {
    const report = runChecker("pass")
    assert.deepStrictEqual(report.statuses, [
      "OK frontmatter",
      "OK namespace",
      "OK lead",
      "OK section",
      "OK wikilink",
      "OK citation",
      "OK callout",
      "OK emphasis",
      "OK svg",
      "OK build",
      "OK output",
    ])
    assert.strictEqual(report.exitCode, 0)
  })

  test("news/ 아래의 주간 소식은 규약을 어겨도 위반이 나오지 않는다", () => {
    // 통과 트리의 content/news/2026-w41.md는 태그, 머리말, 폴더, 위키링크 규약을 어긴다
    for (const args of [[], ["--no-build"]]) {
      const report = runChecker("pass", ...args)
      const locations = [...report.locations.values()].flat()
      assert.deepStrictEqual(
        locations.filter((location) => location.startsWith("content/news/")),
        [],
      )
      assert.strictEqual(report.exitCode, 0)
    }
  })

  test("위반 트리는 검사마다 의도한 위반 위치를 찍고 exit 1이다", () => {
    const report = runChecker("violation")
    assert.deepStrictEqual(report.statuses, [
      "FAIL frontmatter",
      "FAIL namespace",
      "FAIL lead",
      "FAIL section",
      "FAIL wikilink",
      "FAIL citation",
      "FAIL callout",
      "FAIL emphasis",
      "FAIL svg",
      "OK build",
      "FAIL output",
    ])
    const expected: Record<string, string[]> = {
      frontmatter: [
        "content/bad-frontmatter.md:1",
        "content/bad-frontmatter.md:5",
        "content/bad-frontmatter.md:7",
        "content/bad-meta-citation.md:7",
        "content/bad-standard.md:8",
        "content/bad-standard.md:10",
      ],
      namespace: [
        "content/Bad_Name.md:1",
        "content/alias-clash.md:7",
        "content/alias-clash.md:9",
        "content/sub/nested-page.md:1",
      ],
      lead: [
        "content/bad-lead-callout.md:10",
        "content/bad-lead-comment.md:10",
        "content/bad-lead-heading.md:9",
        "content/bad-lead-list.md:10",
      ],
      section: ["content/bad-section-missing.md:19", "content/bad-section-order.md:15"],
      wikilink: [
        "content/bad-links.md:12",
        "content/bad-links.md:16",
        "content/bad-links.md:20",
        "content/bad-links.md:24",
        "content/bad-links.md:28",
        "content/bad-links.md:32",
        "content/bad-links.md:38",
        "content/bad-links.md:42",
        "content/bad-section-link.md:12",
        "content/bad-section-link.md:17",
        "content/bad-section-link.md:23",
        "content/bad-section-link.md:28",
        "content/bad-table-link.md:14",
        "content/bad-table-link.md:22",
        "content/bad-table-link.md:28",
      ],
      citation: [
        "bib/duplicate-url-spec-2024.bib:5",
        "bib/example-spec-2024.bib:5",
        "bib/no-type-report-2024.bib:2",
        "bib/no-type-thesis-2024.bib:2",
        "bib/no-urldate-spec-2024.bib:2",
        "bib/renamed-entry-2024.bib:2",
        "content/bad-citation-place.md:12",
        "content/bad-citation-place.md:16",
        "content/bad-citation-place.md:20",
        "content/bad-citation-place.md:24",
        "content/bad-citation-order.md:12",
        "content/bad-citation-order.md:16",
        "content/bad-citation-order.md:24",
        "content/bad-citation-order.md:33",
        "content/bad-citations.md:12",
        "content/bad-citations.md:16",
        "content/bad-citations.md:20",
        "content/bad-citations.md:24",
      ],
      callout: ["content/bad-callout.md:12"],
      emphasis: ["content/bad-emphasis.md:12"],
      svg: [
        "content/bad-diagram.svg:1",
        "content/bad-diagram.svg:5",
        "content/bad-diagram.svg:7",
        "content/bad-diagram.svg:9",
        "content/bad-diagram.svg:12",
        "content/bad-diagram.svg:15",
        "content/bad-diagram.svg:16",
        "content/bad-diagram.svg:17",
        "content/bad-diagram.svg:18",
        "content/bad-diagram.svg:20",
        "content/bad-diagram.svg:22",
        "content/bad-diagram.svg:24",
        "content/bad-diagram.svg:26",
        "content/bad-shape.svg:4",
        "content/bad-shape.svg:5",
        "content/bad-shape.svg:7",
        "content/bad-shape.svg:9",
        "content/bad-shape.svg:11",
        "content/bad-shape.svg:12",
        "content/bad-shape.svg:14",
        "content/bad-shape.svg:16",
        "content/bad-shape.svg:17",
        "content/bad-shape.svg:18",
        "content/bad-shape.svg:20",
        "content/bad-tokens.svg:1",
        "content/bad-tokens.svg:4",
        "content/bad-tokens.svg:6",
        "content/bad-tokens.svg:8",
        "content/bad-tokens.svg:10",
        "content/bad-tokens.svg:12",
        "content/bad-tokens.svg:14",
        "content/bad-font.svg:1",
        "content/bad-font.svg:4",
        "content/bad-font.svg:5",
        "content/no-ligatures.svg:1",
        "content/no-ligatures.svg:5",
        "content/no-ligatures.svg:6",
        "content/no-precision.svg:1",
        "content/no-viewbox.svg:1",
        "content/overflow-diagram.svg:1",
        "content/bad-separator.svg:10",
        "content/skewed-diagram.svg:1",
      ],
      output: [
        "content/bad-citations.md:16",
        "content/bad-citations.md:20",
        "content/bad-citations.md:24",
        "content/bad-math.md:12",
        "content/bad-math.md:16",
        "content/bad-math.md:20",
        "content/bad-meta-citation.md:7",
        "content/bad-tilde.md:12",
        "content/bad-tilde.md:16",
      ],
    }
    for (const [check, locations] of Object.entries(expected)) {
      const actual = [...new Set(report.locations.get(check))].sort()
      assert.deepStrictEqual(actual, [...locations].sort(), check)
    }
    assert.strictEqual(report.exitCode, 1)
  })

  test("--no-build는 빌드와 산출물 검사만 SKIP하고, 파일 검사 결과는 옵션이 없을 때와 같다", () => {
    const full = runChecker("violation")
    const fast = runChecker("violation", "--no-build")
    const sourceIds = full.statuses.slice(0, -2).map((status) => status.split(" ")[1])
    assert.deepStrictEqual(fast.statuses, [
      ...full.statuses.slice(0, -2),
      "SKIP build",
      "SKIP output",
    ])
    for (const id of sourceIds)
      assert.deepStrictEqual(fast.messages.get(id), full.messages.get(id), id)
    assert.strictEqual(fast.exitCode, 1)
    assert.strictEqual(runChecker("pass", "--no-build").exitCode, 0)
  })

  test("여백이 치우친 도해는 viewBox 원점을 옮길 값을 알려 준다", () => {
    const report = runChecker("violation")
    const skewed = report.messages.get("svg")!.filter((m) => m.includes("skewed-diagram.svg"))
    assert.strictEqual(skewed.length, 1)
    assert.match(skewed[0], /viewBox="25 10 240 100"/)
  })

  test("viewBox 밖으로 나간 그림은 넘친 변과 양만 알리고 여백 치우침은 알리지 않는다", () => {
    const report = runChecker("violation")
    const overflow = report.messages.get("svg")!.filter((m) => m.includes("overflow-diagram.svg"))
    assert.strictEqual(overflow.length, 1)
    assert.match(overflow[0], /viewBox 밖으로 나갔다\(하 20\)/)
  })

  test("두 상자 사이 글자가 상자 세로 중심에서 벗어나면 그 글자와 어긋난 양을 알려 준다", () => {
    const report = runChecker("violation")
    const separator = report.messages.get("svg")!.filter((m) => m.includes("bad-separator.svg"))
    assert.strictEqual(separator.length, 1)
    assert.match(
      separator[0],
      /글자 `_`의 잉크 중심이 상자 세로 중심에서 [\d.]+ 아래에 있다\(허용 2\.8\)/,
    )
  })

  test("도해 색 위반은 표의 그 행으로 고칠 꼴을 알려 준다", () => {
    const report = runChecker("violation")
    const tokens = report.messages.get("svg")!.filter((m) => m.includes("bad-tokens.svg"))
    const at = (line: number) => tokens.filter((m) => m.includes(`bad-tokens.svg:${line}:`))
    assert.match(at(6).join("\n"), /var\(--<이름>, <대체값>\)/)
    assert.match(at(8).join("\n"), /--cyan/)
    assert.match(at(10).join("\n"), /var\(--ink, #727981\)/)
    assert.match(at(12).join("\n"), /var\(--blue, #336fb8\)/)
    assert.strictEqual(at(1).length, 2)
  })

  test("점선이 폭과 짝이 맞지 않으면 물려받은 폭까지 알려 준다", () => {
    const report = runChecker("violation")
    const shape = report.messages.get("svg")!.filter((m) => m.includes("bad-shape.svg"))
    const at = (line: number) => shape.filter((m) => m.includes(`bad-shape.svg:${line}:`))
    assert.match(at(11).join("\n"), /3 3.*폭: 1\.5\)/)
    assert.match(at(12).join("\n"), /5 4.*폭: 1\)/)
    assert.match(at(14).join("\n"), /5 4.*폭: 1\)/)
  })

  test("여러 인용의 순서 위반은 첫 등장 순으로 고친 꼴을 알려 준다", () => {
    const report = runChecker("violation")
    const order = report.messages
      .get("citation")!
      .filter((m) => m.includes("bad-citation-order.md"))
    assert.strictEqual(order.length, 4)
    for (const message of order) {
      assert.match(message, /\[@example-manual-2023\]\[@example-spec-2024\]$/)
    }
  })

  test("인용 자리 위반은 쉼표 앞, 마침표 뒤로 옮긴 꼴을 알려 준다", () => {
    const report = runChecker("violation")
    const place = report.messages
      .get("citation")!
      .filter((m) => m.includes("bad-citation-place.md"))
    assert.strictEqual(place.length, 4)
    assert.match(place[0], /:12: .*,\[@example-spec-2024\] → \[@example-spec-2024\],$/)
    assert.match(place[1], /:16: .*, \[@example-spec-2024\] → \[@example-spec-2024\],$/)
    assert.match(place[2], /:20: .*\[@example-spec-2024\]\. → \.\[@example-spec-2024\]$/)
    assert.match(
      place[3],
      /:24: .* → \.\[@example-manual-2023\]<!-- 주석 -->\[@example-spec-2024\]$/,
    )
  })

  test("url이 겹치는 bib 엔트리는 서로의 키를 알려 준다", () => {
    const report = runChecker("violation")
    const duplicate = report.messages.get("citation")!.filter((m) => m.includes("url이 같은"))
    assert.deepStrictEqual(duplicate, [
      "bib/duplicate-url-spec-2024.bib:5: 정규화한 url이 같은 엔트리가 있다: example-spec-2024",
      "bib/example-spec-2024.bib:5: 정규화한 url이 같은 엔트리가 있다: duplicate-url-spec-2024",
    ])
  })

  test("type 필드가 없는 보고서와 학위 논문 엔트리는 엔트리 타입과 필드를 알려 준다", () => {
    const report = runChecker("violation")
    const type = report.messages.get("citation")!.filter((m) => m.includes("no-type-"))
    assert.deepStrictEqual(type, [
      "bib/no-type-report-2024.bib:2: @techreport에는 type 필드를 둔다",
      "bib/no-type-thesis-2024.bib:2: @phdthesis에는 type 필드를 둔다",
    ])
  })

  test("표준 페이지의 절 순서 위반은 지금의 첫 두 ## 제목을 알려 준다", () => {
    const report = runChecker("violation")
    assert.deepStrictEqual(report.messages.get("section"), [
      "content/bad-section-missing.md:19: 표준 페이지의 첫 두 ##는 범위, 개정 이력 순서로 쓴다(지금: 범위, 다른 표준과의 차이)",
      "content/bad-section-order.md:15: 표준 페이지의 첫 두 ##는 범위, 개정 이력 순서로 쓴다(지금: 개정 이력, 범위)",
    ])
  })

  test("표 셀 위키링크 위반은 \\|로 고친 꼴을 알려 준다", () => {
    const report = runChecker("violation")
    const table = report.messages.get("wikilink")!.filter((m) => m.includes("bad-table-link.md"))
    assert.strictEqual(table.length, 3)
    for (const message of table) assert.match(message, /\[\[target-page\\\|대상\]\]$/)
  })

  test("같은 블록의 절 링크 표시 이름 위반은 절 링크 원문을 알려 준다", () => {
    const report = runChecker("violation")
    const section = report.messages
      .get("wikilink")!
      .filter((m) => m.includes("bad-section-link.md") && m.includes("같은 블록"))
    assert.deepStrictEqual(
      section.map((m) => m.match(/: (\[\[.*\]\])$/)?.[1]),
      [
        "[[target-page#정의|대상 페이지]]",
        "[[target-page#정의|대상]]",
        "[[target-page#정의\\|대상]]",
        "[[target-page#정의]]",
      ],
    )
  })

  test("KaTeX 렌더 오류는 문법 오류와 정의되지 않은 명령을 따로 알려 준다", () => {
    const report = runChecker("violation")
    const math = report.messages.get("output")!.filter((m) => m.includes("bad-math.md"))
    assert.strictEqual(math.length, 3)
    assert.match(math[0], /bad-math\.md:12: .*\\frac\{1\}\{/)
    assert.match(math[1], /bad-math\.md:16: .*\\mathmr/)
    assert.match(math[2], /bad-math\.md:20: KaTeX 문법 오류: a > \\frac\{b\}\{$/)
  })

  test("메타 설명에 남은 인용은 본문 인용과 따로 알린다", () => {
    const report = runChecker("violation")
    const meta = report.messages.get("output")!.filter((m) => m.includes("bad-meta-citation.md"))
    assert.deepStrictEqual(meta, [
      "content/bad-meta-citation.md:7: 메타 설명에 남은 인용: [@example-spec-2024]",
    ])
  })

  test("본문에 렌더된 취소선은 안의 글과 \\~ 이스케이프 안내를 알려 준다", () => {
    const report = runChecker("violation")
    const tilde = report.messages.get("output")!.filter((m) => m.includes("bad-tilde.md"))
    assert.strictEqual(tilde.length, 2)
    assert.match(tilde[0], /bad-tilde\.md:12: .*8 tq이고, 한 비트는 8/)
    assert.match(tilde[1], /bad-tilde\.md:16: .*두 개/)
    for (const message of tilde) assert.match(message, /\\~/)
  })

  test("빌드가 실패해도 파일 검사는 돌고 산출물 검사만 SKIP한다", () => {
    const report = runChecker("build-fail")
    assert.deepStrictEqual(report.statuses, [
      "FAIL frontmatter",
      "OK namespace",
      "OK lead",
      "OK section",
      "FAIL wikilink",
      "OK citation",
      "OK callout",
      "OK emphasis",
      "OK svg",
      "FAIL build",
      "SKIP output",
    ])
    assert.deepStrictEqual(report.locations.get("wikilink"), ["content/dangling-link.md:12"])
    assert.ok(report.locations.get("build")!.includes("content/broken-yaml.md"))
    assert.strictEqual(report.exitCode, 1)
  })
})
