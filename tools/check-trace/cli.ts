import path from "node:path"
import { report, verdict, type Status } from "../check-content/report"
import { repoRoot } from "../repo"
import { checkDecisionLog } from "./decision-log"
import { checkLinks, loadTree } from "./links"

// 추적성 검사기. 결정 로그의 꼴은 docs/decision-log.md에, 무엇을 보는지는 docs/agents/domain.md의 결정 로그 절에 있다.
// 사용: npm run check:trace [-- <저장소 루트>]   기본은 이 저장소
const root = path.resolve(process.argv[2] ?? repoRoot)

const statuses: Status[] = []
const decisionLog = checkDecisionLog(root)
statuses.push(report("decision-log", verdict(decisionLog), decisionLog))
const links = checkLinks(loadTree(root))
statuses.push(report("links", verdict(links), links))

process.exitCode = statuses.includes("FAIL") ? 1 : 0
