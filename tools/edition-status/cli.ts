import fs from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import { repoRoot } from "../repo"
import { Conventions } from "../check-content/conventions"
import { report, verdict } from "../check-content/report"
import { loadTree } from "../check-content/tree"
import { channels as loadChannels } from "./channels"
import { coverage, notTargetRows, publisherName } from "./coverage"
import { GitHub, issueTitle, plan, type Issue } from "./issues"
import { changeKey, kindNames, type Change, type Channel, type Context } from "./model"
import { assign, citedEntries, standardPages } from "./publications"

// 판 확인. 월간 workflow(.github/workflows/edition-status.yml)가 돌리고, 기준은 docs/wiki-verification.md의
// 판 확인 절과 그 네 표(edition-channels, edition-generic, edition-skipped, edition-not-target)에 있다.
// 사용: npm run edition-status -- [<트리 루트>] [--dry-run] [--channel <통로>]...
//   --dry-run은 이슈를 읽거나 쓰지 않고 바뀜과 이슈 본문만 찍는다. 아니면 GITHUB_TOKEN과 GITHUB_REPOSITORY가 있어야 한다.
//   --channel을 주면 그 통로만 묻고 덮음 검사는 하지 않는다.
//   --timeout은 요청 하나의 제한 시간, --interval은 범용 행 사이의 간격이다(밀리초).
const verificationPath = path.join(repoRoot, "docs", "wiki-verification.md")

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    "dry-run": { type: "boolean" },
    channel: { type: "string", multiple: true },
    timeout: { type: "string" },
    interval: { type: "string" },
  },
})
const root = path.resolve(positionals[0] ?? ".")
const dryRun = values["dry-run"] ?? false
// 요청 하나의 제한 시간. ISO 오픈 데이터가 약 80MB라 넉넉히 둔다. 테스트가 줄여 쓴다.
const timeoutMs = Number(values.timeout ?? 120_000)
if (!(timeoutMs > 0)) throw new Error(`--timeout은 양의 밀리초여야 한다: ${values.timeout}`)
// 범용 행 사이의 간격. 테스트가 줄여 쓴다.
const intervalMs = Number(values.interval ?? 1_000)
if (!(intervalMs >= 0)) throw new Error(`--interval은 0 이상의 밀리초여야 한다: ${values.interval}`)
const repo = process.env.GITHUB_REPOSITORY ?? "jjongs2/ash-wiki"

const verification = new Conventions(fs.readFileSync(verificationPath, "utf8"), verificationPath)
const channels = loadChannels(
  {
    channels: verification.table("edition-channels", ["통로"]),
    generic: verification.table("edition-generic", [
      "출판물",
      "페이지",
      "엔트리",
      "URL",
      "판 패턴",
      "요청",
    ]),
    skipped: verification.table("edition-skipped", ["출판물", "페이지", "엔트리", "사유"]),
  },
  intervalMs,
)
const notTarget = notTargetRows(
  verification.table("edition-not-target", ["발행기관", "엔트리", "사유"]),
)
const only = values.channel
const unknown = only?.filter((id) => !channels.some((channel) => channel.id === id)) ?? []
if (unknown.length > 0) throw new Error(`--channel이 통로가 아니다: ${unknown.join(", ")}`)

const tree = loadTree(root)
const cited = citedEntries(tree)
const assigned = assign(cited, standardPages(tree), channels)

// 아는 발행기관의 미분류 엔트리는 FAIL, 처음 보는 발행기관은 SKIP으로 보인다.
let unclassified = 0
if (only === undefined) {
  const claimed = new Set(
    [...assigned.values()].flat().flatMap((publication) => publication.entries.map((e) => e.key)),
  )
  const found = coverage(cited, claimed, notTarget)
  unclassified = found.unclassified.length
  const violations = found.unclassified.map((entry) => ({
    file: entry.file,
    line: entry.line,
    message: `${entry.key} (${publisherName(entry) || "발행기관 없음"}): 통로, 감지하지 않음, 대상 아님 어디에도 없다`,
  }))
  report("coverage", verdict(violations), violations)
  if (found.unknown.size > 0)
    report(
      "unknown-publishers",
      "SKIP",
      [...found.unknown].map(([name, entries]) => ({
        file: name || "발행기관 없음",
        message: entries.map((entry) => entry.key).join(", "),
      })),
      `처음 보는 발행기관 ${found.unknown.size}곳, 대상이면 통로나 감지하지 않음 표에, 아니면 대상 아님 표에 둔다`,
    )
}

// 도구가 보내는 모든 요청에 도구를 밝히는 User-Agent를 붙인다. 행이 헤더를 주면 그것을 쓴다.
const context: Context = {
  fetch: (url, init = {}) =>
    fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; edition-status/1.0)", ...init.headers },
      signal: AbortSignal.timeout(timeoutMs),
    }),
  cited,
}

// 실패한 통로는 다른 통로를 모두 처리한 뒤 한 번 더 묻는다. 그래도 실패하면 FAIL로 찍고 exit 1로 끝난다.
const targets = channels.filter(
  (channel) =>
    assigned.get(channel)!.length > 0 && (only === undefined || only.includes(channel.id)),
)
const results = new Map<Channel, Change[] | Error>()
const run = async (channel: Channel) => {
  try {
    results.set(channel, await channel.check(assigned.get(channel)!, context))
  } catch (error) {
    results.set(channel, error as Error)
  }
}
for (const channel of targets) await run(channel)
for (const channel of targets) if (results.get(channel) instanceof Error) await run(channel)

const changes: Change[] = []
for (const channel of targets) {
  const result = results.get(channel)!
  const count = assigned.get(channel)!.length
  if (result instanceof Error) {
    console.log(`FAIL ${channel.id} (${result.message})`)
    continue
  }
  console.log(`OK   ${channel.id} (출판물 ${count}, 바뀜 ${result.length})`)
  for (const change of result) console.log(`  ${kindNames[change.kind]}: ${changeKey(change)}`)
  changes.push(...result)
}

if (dryRun) {
  for (const action of plan(changes, [], repo))
    console.log(`\n=== ${issueTitle(action.changes[0].publication)}\n${action.body}`)
} else {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error("GITHUB_TOKEN이 없다. 이슈를 건드리지 않으려면 --dry-run을 준다")
  const github = new GitHub(repo, token, process.env.GITHUB_API_URL)
  const issues: Issue[] = await github.issues()
  for (const action of plan(changes, issues, repo)) {
    const number = await github.apply(action)
    console.log(
      `${action.kind === "open" ? "열었다" : "갱신했다"} #${number} ${action.kind === "open" ? action.title : action.issue.title}`,
    )
  }
}
process.exitCode =
  unclassified > 0 || [...results.values()].some((result) => result instanceof Error) ? 1 : 0
