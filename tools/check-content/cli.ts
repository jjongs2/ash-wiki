import fs from "node:fs"
import path from "node:path"
import { build, checkOutput } from "./build"
import { loadConventions } from "./conventions"
import { sourceChecks } from "./source-checks"
import { loadTree, type Violation } from "./tree"

// 콘텐츠 검사기. 규칙과 검사 id는 docs/conventions.md에 있다.
// 사용: npm run check:content [-- <트리 루트>]   트리 루트에는 content/와 bib/가 있다.
type Status = "OK" | "FAIL" | "SKIP"

function report(id: string, status: Status, violations: Violation[] = [], note?: string) {
  console.log(`${status.padEnd(4)} ${id}${note ? ` (${note})` : ""}`)
  const sorted = [...violations].sort(
    (a, b) => a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0),
  )
  for (const { file, line, message } of sorted) {
    console.log(`  ${file}${line ? `:${line}` : ""}: ${message}`)
  }
  return status
}

const verdict = (violations: Violation[]): Status => (violations.length > 0 ? "FAIL" : "OK")

const root = path.resolve(process.argv[2] ?? ".")
const tree = loadTree(root)
const conventions = loadConventions()
const statuses: Status[] = []

for (const [id, check] of sourceChecks) {
  const violations = check(tree, conventions)
  statuses.push(report(id, verdict(violations), violations))
}

const built = build(tree)
statuses.push(report("build", verdict(built.violations), built.violations))

if (built.outDir) {
  const violations = checkOutput(tree, built.outDir)
  fs.rmSync(built.outDir, { recursive: true, force: true })
  statuses.push(report("output", verdict(violations), violations))
} else {
  statuses.push(report("output", "SKIP", [], "build 실패"))
}

process.exitCode = statuses.includes("FAIL") ? 1 : 0
