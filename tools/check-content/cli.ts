import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import { build, checkOutput } from "./build"
import { loadConventions } from "./conventions"
import { report, verdict, type Status } from "./report"
import { sourceChecks } from "./source-checks"
import { loadTree } from "./tree"

// 콘텐츠 검사기. 규칙과 검사 id는 docs/wiki-conventions.md와 docs/wiki-diagrams.md에 있다.
// 사용: npm run check:content [-- [<트리 루트>] [--no-build]]   트리 루트에는 content/와 bib/가 있다.
// --no-build는 docs/wiki-conventions.md의 검사기 절을 따른다.
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { "no-build": { type: "boolean", default: false } },
})
const root = path.resolve(positionals[0] ?? ".")
const tree = loadTree(root)
const conventions = loadConventions()
const statuses: Status[] = []

for (const [id, check] of sourceChecks) {
  const violations = await check(tree, conventions)
  statuses.push(report(id, verdict(violations), violations))
}

if (values["no-build"]) {
  statuses.push(report("build", "SKIP", [], "--no-build"))
  statuses.push(report("output", "SKIP", [], "--no-build"))
} else {
  const built = build(tree)
  statuses.push(report("build", verdict(built.violations), built.violations))

  if (built.outDir) {
    const violations = checkOutput(tree, built.outDir)
    fs.rmSync(built.outDir, { recursive: true, force: true })
    statuses.push(report("output", verdict(violations), violations))
  } else {
    statuses.push(report("output", "SKIP", [], "build 실패"))
  }
}

process.exitCode = statuses.includes("FAIL") ? 1 : 0
