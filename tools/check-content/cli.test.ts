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
}

function runChecker(fixture: string): Report {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", path.join(here, "cli.ts"), path.join(here, "fixtures", fixture)],
    { cwd: repoRoot, encoding: "utf8" },
  )
  const statuses: string[] = []
  const locations = new Map<string, string[]>()
  let current = ""
  for (const line of result.stdout.split("\n")) {
    const status = line.match(/^(OK|FAIL|SKIP) +(\S+)/)
    if (status) {
      current = status[2]
      statuses.push(`${status[1]} ${current}`)
      locations.set(current, [])
      continue
    }
    const location = line.match(/^ +(\S+?(?::\d+)?): /)
    if (location) locations.get(current)!.push(location[1])
  }
  return { exitCode: result.status, statuses, locations }
}

describe("check-content CLI", { concurrency: false }, () => {
  test("통과 트리는 모든 검사가 OK이고 exit 0이다", () => {
    const report = runChecker("pass")
    assert.deepStrictEqual(report.statuses, [
      "OK frontmatter",
      "OK namespace",
      "OK wikilink",
      "OK citation",
      "OK callout",
      "OK emphasis",
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
      "FAIL wikilink",
      "FAIL citation",
      "FAIL callout",
      "FAIL emphasis",
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
        "content/sub/nested-page.md:1",
      ],
      wikilink: ["content/bad-links.md:12", "content/bad-links.md:16", "content/bad-links.md:20"],
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
      output: [
        "content/bad-citations.md:16",
        "content/bad-citations.md:20",
        "content/bad-citations.md:24",
      ],
    }
    for (const [check, locations] of Object.entries(expected)) {
      const actual = [...new Set(report.locations.get(check))].sort()
      assert.deepStrictEqual(actual, [...locations].sort(), check)
    }
    assert.strictEqual(report.exitCode, 1)
  })

  test("빌드가 실패해도 파일 검사는 돌고 산출물 검사만 SKIP한다", () => {
    const report = runChecker("build-fail")
    assert.deepStrictEqual(report.statuses, [
      "FAIL frontmatter",
      "OK namespace",
      "FAIL wikilink",
      "OK citation",
      "OK callout",
      "OK emphasis",
      "FAIL build",
      "SKIP output",
    ])
    assert.deepStrictEqual(report.locations.get("wikilink"), ["content/dangling-link.md:12"])
    assert.ok(report.locations.get("build")!.includes("content/broken-yaml.md"))
    assert.strictEqual(report.exitCode, 1)
  })
})
