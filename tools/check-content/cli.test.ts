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
  statuses: string[]
  locations: Map<string, string[]>
  messages: Map<string, string[]>
}

function runChecker(fixture: string): Report {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", path.join(here, "cli.ts"), path.join(here, "fixtures", fixture)],
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
      "OK wikilink",
      "OK citation",
      "OK callout",
      "OK emphasis",
      "OK period",
      "OK svg",
      "OK build",
      "OK output",
    ])
    assert.strictEqual(report.exitCode, 0)
  })

  test("위반 트리는 검사마다 의도한 위반 위치를 찍고 exit 1이다", () => {
    const report = runChecker("violation")
    assert.deepStrictEqual(report.statuses, [
      "FAIL frontmatter",
      "FAIL namespace",
      "FAIL lead",
      "FAIL wikilink",
      "FAIL citation",
      "FAIL callout",
      "FAIL emphasis",
      "FAIL period",
      "FAIL svg",
      "OK build",
      "FAIL output",
    ])
    const expected: Record<string, string[]> = {
      frontmatter: [
        "content/bad-frontmatter.md:1",
        "content/bad-frontmatter.md:5",
        "content/bad-frontmatter.md:7",
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
      wikilink: [
        "content/bad-links.md:12",
        "content/bad-links.md:16",
        "content/bad-links.md:20",
        "content/bad-links.md:24",
        "content/bad-links.md:28",
        "content/bad-links.md:32",
        "content/bad-links.md:38",
        "content/bad-links.md:42",
      ],
      citation: [
        "bib/no-urldate-spec-2024.bib:2",
        "bib/renamed-entry-2024.bib:2",
        "content/bad-citations.md:12",
        "content/bad-citations.md:16",
        "content/bad-citations.md:20",
        "content/bad-citations.md:24",
      ],
      callout: ["content/bad-callout.md:12"],
      emphasis: ["content/bad-emphasis.md:12"],
      period: [
        "content/bad-period.md:12",
        "content/bad-period.md:17",
        "content/bad-period.md:22",
        "content/bad-period.md:27",
        "content/bad-period.md:31",
        "content/bad-period.md:32",
        "content/bad-period.md:34",
      ],
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
        "content/bad-font.svg:1",
        "content/bad-font.svg:4",
        "content/bad-font.svg:5",
        "content/no-ligatures.svg:1",
        "content/no-ligatures.svg:5",
        "content/no-ligatures.svg:6",
        "content/no-precision.svg:1",
        "content/no-viewbox.svg:1",
        "content/skewed-diagram.svg:1",
      ],
      output: [
        "content/bad-citations.md:16",
        "content/bad-citations.md:20",
        "content/bad-citations.md:24",
        "content/bad-math.md:12",
        "content/bad-math.md:16",
        "content/bad-math.md:20",
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

  test("여백이 치우친 도해는 viewBox 원점을 옮길 값을 알려 준다", () => {
    const report = runChecker("violation")
    const skewed = report.messages.get("svg")!.filter((m) => m.includes("skewed-diagram.svg"))
    assert.strictEqual(skewed.length, 1)
    assert.match(skewed[0], /viewBox="25 10 240 100"/)
  })

  test("KaTeX 렌더 오류는 문법 오류와 정의되지 않은 명령을 따로 알려 준다", () => {
    const report = runChecker("violation")
    const math = report.messages.get("output")!.filter((m) => m.includes("bad-math.md"))
    assert.strictEqual(math.length, 3)
    assert.match(math[0], /bad-math\.md:12: .*\\frac\{1\}\{/)
    assert.match(math[1], /bad-math\.md:16: .*\\mathmr/)
    assert.match(math[2], /bad-math\.md:20: KaTeX 문법 오류: a > \\frac\{b\}\{$/)
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
      "FAIL wikilink",
      "OK citation",
      "OK callout",
      "OK emphasis",
      "OK period",
      "OK svg",
      "FAIL build",
      "SKIP output",
    ])
    assert.deepStrictEqual(report.locations.get("wikilink"), ["content/dangling-link.md:12"])
    assert.ok(report.locations.get("build")!.includes("content/broken-yaml.md"))
    assert.strictEqual(report.exitCode, 1)
  })
})
