import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import { repoRoot } from "../repo"
import { Conventions } from "../check-content/conventions"
import { report, verdict, type Status } from "../check-content/report"
import { citations } from "../check-content/source-checks"
import { fieldsOf, loadTree, type Page, type Tree, type Violation } from "../check-content/tree"

// 출처 상태. 린트가 쓰고, 기준은 docs/wiki-verification.md의 source-status 표와 bot-blocked-hosts 표에 있다.
// 사용: npm run source-status -- [<트리 루트>] [--topic <태그>] [--today <YYYY-MM-DD>]
const verificationPath = path.join(repoRoot, "docs", "wiki-verification.md")

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { topic: { type: "string" }, today: { type: "string" } },
})
const root = path.resolve(positionals[0] ?? ".")
const today = values.today ?? new Date().toISOString().slice(0, 10)

// 문서의 표와 이 스크립트의 검사가 어긋나면 조용히 넘어가지 않고 멈춘다.
const verification = new Conventions(fs.readFileSync(verificationPath, "utf8"), verificationPath)
const criteria = new Map(
  verification.table("source-status", ["검사", "기준"]).map((row) => [row["검사"], row["기준"]]),
)
const ids = ["url", "verified"]
if ([...criteria.keys()].sort().join() !== ids.join()) {
  throw new Error(`${verificationPath}: source-status 표의 검사는 ${ids.join(", ")}여야 한다`)
}
const staleDays = Number(criteria.get("verified"))
const blockedHosts = verification.column("bot-blocked-hosts", "호스트")

const tree = loadTree(root)
// 주제 태그를 주지 않으면 모든 페이지를 본다.
function inTopic(page: Page, topic: string | undefined): boolean {
  const tags = fieldsOf(page)["tags"]
  return (
    topic === undefined ||
    (Array.isArray(tags) &&
      tags.some((tag) => tag === topic || String(tag).startsWith(`${topic}/`)))
  )
}
const pages = tree.pages.filter((page) => page.kind === "page" && inTopic(page, values.topic))

// 봇 차단 호스트의 403은 출처 사망이 아니라 확인 불가로 따로 모은다.
async function checkUrls(
  tree: Tree,
  pages: Page[],
  blockedHosts: string[],
): Promise<{ dead: Violation[]; blocked: Violation[] }> {
  const cited = new Set(pages.flatMap((page) => citations(page).map((c) => c.key)))
  const targets = tree.bib.flatMap((bib) =>
    "error" in bib.entries
      ? []
      : bib.entries
          .filter((entry) => cited.has(entry.key) && entry.fields.has("url"))
          .map((entry) => ({ file: bib.file, field: entry.fields.get("url")! })),
  )
  const dead: Violation[] = []
  const blocked: Violation[] = []
  await Promise.all(
    targets.map(async ({ file, field }) => {
      const problem = await probe(field.value)
      if (!problem) return
      const violation = { file, line: field.line, message: `${problem.reason} ${field.value}` }
      if (problem.status === 403 && isBlockedHost(field.value, blockedHosts))
        blocked.push(violation)
      else dead.push(violation)
    }),
  )
  return { dead, blocked }
}

function isBlockedHost(url: string, blockedHosts: string[]): boolean {
  const host = new URL(url).hostname
  return blockedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))
}

// 살아 있으면 null, 아니면 이유와 (응답이 있었으면) 상태 코드를 준다. 데이터시트 같은 큰 파일을 받지 않으려고 HEAD를 먼저 보내고,
// HEAD를 받지 않는 서버가 있어 2xx가 아니면 GET으로 한 번 더 묻는다.
async function probe(url: string): Promise<{ reason: string; status?: number } | null> {
  try {
    const head = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(15_000) })
    if (head.ok) return null
    const get = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    await get.body?.cancel()
    return get.ok ? null : { reason: `HTTP ${get.status}`, status: get.status }
  } catch (error) {
    const cause = (error as { cause?: { code?: string } }).cause?.code
    return { reason: `응답 없음(${cause ?? (error as Error).name})` }
  }
}

function checkVerified(pages: Page[], today: string, staleDays: number): Violation[] {
  const violations: Violation[] = []
  for (const page of pages) {
    const verified = fieldsOf(page)["verified"]
    if (typeof verified !== "string") continue
    const days = Math.floor((Date.parse(today) - Date.parse(verified)) / 86_400_000)
    if (days <= staleDays) continue
    const line = "error" in page.frontmatter ? 1 : page.frontmatter.lineOf("verified")
    violations.push({ file: page.file, line, message: `검증일 ${verified}에서 ${days}일 지났다` })
  }
  return violations
}

const statuses: Status[] = []
const urls = await checkUrls(tree, pages, blockedHosts)
statuses.push(report("url", verdict(urls.dead), urls.dead))
if (urls.blocked.length > 0) {
  statuses.push(report("url-blocked", "SKIP", urls.blocked, "확인 불가, 브라우저로 확인"))
}
const stale = checkVerified(pages, today, staleDays)
statuses.push(report("verified", verdict(stale), stale))
process.exitCode = statuses.includes("FAIL") ? 1 : 0
