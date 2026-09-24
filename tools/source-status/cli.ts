import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import { repoRoot } from "../repo"
import { Conventions } from "../check-content/conventions"
import { report, verdict, type Status } from "../check-content/report"
import { citations } from "../check-content/source-checks"
import { fieldsOf, loadTree, type Page, type Tree, type Violation } from "../check-content/tree"

// 출처 상태. 린트가 쓰고, 기준은 docs/wiki-verification.md의 source-status 표에 있다.
// 사용: npm run source-status -- [<트리 루트>] [--topic <태그>] [--today <YYYY-MM-DD>]
const verificationPath = path.join(repoRoot, "docs", "wiki-verification.md")

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { topic: { type: "string" }, today: { type: "string" } },
})
const root = path.resolve(positionals[0] ?? ".")
const today = values.today ?? new Date().toISOString().slice(0, 10)

// 문서의 표와 이 스크립트의 검사가 어긋나면 조용히 넘어가지 않고 멈춘다.
const criteria = new Map(
  new Conventions(fs.readFileSync(verificationPath, "utf8"), verificationPath)
    .table("source-status", ["검사", "기준"])
    .map((row) => [row["검사"], row["기준"]]),
)
const ids = ["url", "verified"]
if ([...criteria.keys()].sort().join() !== ids.join()) {
  throw new Error(`${verificationPath}: source-status 표의 검사는 ${ids.join(", ")}여야 한다`)
}
const staleDays = Number(criteria.get("verified"))

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

async function checkUrls(tree: Tree, pages: Page[]): Promise<Violation[]> {
  const cited = new Set(pages.flatMap((page) => citations(page).map((c) => c.key)))
  const targets = tree.bib.flatMap((bib) =>
    "error" in bib.entries
      ? []
      : bib.entries
          .filter((entry) => cited.has(entry.key) && entry.fields.has("url"))
          .map((entry) => ({ file: bib.file, field: entry.fields.get("url")! })),
  )
  const results = await Promise.all(
    targets.map(async ({ file, field }) => {
      const problem = await probe(field.value)
      return problem ? { file, line: field.line, message: `${problem} ${field.value}` } : null
    }),
  )
  return results.filter((v) => v !== null)
}

// 살아 있으면 null, 아니면 이유를 준다. 데이터시트 같은 큰 파일을 받지 않으려고 HEAD를 먼저 보내고,
// HEAD를 받지 않는 서버가 있어 2xx가 아니면 GET으로 한 번 더 묻는다.
async function probe(url: string): Promise<string | null> {
  try {
    const head = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(15_000) })
    if (head.ok) return null
    const get = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    await get.body?.cancel()
    return get.ok ? null : `HTTP ${get.status}`
  } catch (error) {
    const cause = (error as { cause?: { code?: string } }).cause?.code
    return `응답 없음(${cause ?? (error as Error).name})`
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
const urls = await checkUrls(tree, pages)
statuses.push(report("url", verdict(urls), urls))
const stale = checkVerified(pages, today, staleDays)
statuses.push(report("verified", verdict(stale), stale))
process.exitCode = statuses.includes("FAIL") ? 1 : 0
