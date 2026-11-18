import path from "node:path"
import { report, verdict, type Status } from "../check-content/report"
import { repoRoot } from "../repo"
import { checkClaims, checkPlaceholders, checkTables, loadResearch, loadSources } from "./research"

// 하네스 조사의 검사기. 규칙은 docs/research/README.md에 있다.
// 사용: npm run check:research [-- <조사 폴더>]   기본은 docs/research/
const root = path.resolve(process.argv[2] ?? path.join(repoRoot, "docs", "research"))
const tree = loadResearch(root)
const { sources, violations: sourceViolations } = loadSources(tree)

const statuses: Status[] = []
const run = (id: string, violations: ReturnType<typeof checkTables>) =>
  statuses.push(report(id, verdict(violations), violations))

run("table", checkTables(tree))
run("placeholder", checkPlaceholders(tree))
run("sources", sourceViolations)
run("claims", checkClaims(tree, sources))

process.exitCode = statuses.includes("FAIL") ? 1 : 0
