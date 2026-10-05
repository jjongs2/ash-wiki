import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { parseArgs } from "node:util"
import { Conventions } from "../check-content/conventions"
import { loadTree } from "../check-content/tree"
import { repoRoot } from "../repo"
import { changedFiles, mergeBase, repoTop } from "./diff"
import { items } from "./items"

// 반영 뒤 점검. 브랜치에서 더하거나 고친 content/ 줄(커밋하지 않은 것과 추적하지 않는 새 파일 포함)에서
// 항목마다 후보를 찍는다. 판정은 사람이 하므로 후보가 있어도 exit 0이다. 항목과 규칙은
// docs/wiki-verification.md의 반영 뒤 점검 절에 있다.
// 사용: npm run check:diff -- [--base <ref>] [--ticket <묶음 티켓 번호>] [--only <항목>]...
//   --ticket-body <파일>은 --ticket 대신 티켓 본문을 파일로 준다. 테스트가 쓴다.
const { values } = parseArgs({
  options: {
    base: { type: "string", default: "origin/main" },
    ticket: { type: "string" },
    "ticket-body": { type: "string" },
    only: { type: "string", multiple: true },
  },
})
const ids = items.map(([id]) => id)
// 문서의 항목 표와 이 명령의 항목이 어긋나면 조용히 넘어가지 않고 멈춘다.
const verificationPath = path.join(repoRoot, "docs", "wiki-verification.md")
const documented = new Conventions(fs.readFileSync(verificationPath, "utf8"), verificationPath)
  .column("check-diff", "항목")
  .join(", ")
if (documented !== ids.join(", ")) {
  throw new Error(`${verificationPath}: check-diff 표의 항목은 ${ids.join(", ")}여야 한다`)
}
for (const id of values.only ?? []) {
  if (!ids.includes(id)) throw new Error(`--only의 항목은 ${ids.join(", ")} 가운데 하나다: ${id}`)
}

const root = repoTop(process.cwd())
const base = mergeBase(root, values.base)
const tree = loadTree(root)
const pages = new Map(tree.pages.map((page) => [page.file, page]))
const changed = changedFiles(root, base).flatMap((change) => {
  const page = pages.get(change.file)
  return page && page.kind === "page" ? [{ page, change }] : []
})

let ticketBody: string | undefined
if (values["ticket-body"]) ticketBody = fs.readFileSync(path.resolve(values["ticket-body"]), "utf8")
else if (values.ticket) {
  const result = spawnSync(
    "gh",
    ["issue", "view", values.ticket, "--json", "body", "--jq", ".body"],
    {
      cwd: root,
      encoding: "utf8",
    },
  )
  if (result.status !== 0)
    throw new Error(`gh issue view ${values.ticket}: ${result.stderr.trim()}`)
  ticketBody = result.stdout
}

console.log(`기준 ${base.slice(0, 8)}, 고친 페이지 ${changed.length}개`)
for (const [id, item] of items) {
  if (values.only && !values.only.includes(id)) continue
  if (id === "owner-page" && ticketBody === undefined) {
    console.log(`SKIP ${id} (--ticket 없음)`)
    continue
  }
  const found = item({ tree, changed, ticketBody })
  console.log(`${id}: 후보 ${found.length}`)
  const sorted = [...found].sort(
    (a, b) => a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0),
  )
  for (const { file, line, message } of sorted) {
    console.log(`  ${file}${line ? `:${line}` : ""}: ${message}`)
  }
}
