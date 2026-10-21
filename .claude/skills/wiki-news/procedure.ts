// 소식 조사의 절차 검사(SKILL.md의 3. 찾기와 9. PR). 조사 에이전트의 접속 기록(작업 폴더의 out/*-access.jsonl)을
// 매체 목록과 검색 질의(outlets.md)에 대 보고, 기록이 없거나 이유 없이 열지 않은 곳이 있으면 exit 1이다. 기록의
// 꼴은 research-brief.md에 있다.
// 사용: npx tsx .claude/skills/wiki-news/procedure.ts <작업 폴더> <주차나 달>...
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { repoRoot as root } from "../../../tools/repo"
import { LISTED, OUTLETS, tableRows } from "./check"
import { readJsonl, weeksOf } from "./work"

/** 접속 기록 한 줄. week가 비면 조사 기간 전체를 한 번에 살핀 기록이다. */
export interface Access {
  source: string
  week?: string
  opened: boolean
  reason?: string
  shallow?: string
  differs?: string
}

/**
 * 살필 곳. 그 주의 날짜(`<월요일>`)를 채우는 검색 질의는 결과 수에 상한이 있어 주차마다 따로 살핀다(3. 찾기).
 * 날짜를 채우지 않는 검색 질의(파일 하나를 받아 거르는 KBA CSV, ISO 오픈 데이터)는 기간 전체를 한 번에 본다.
 */
export interface Source {
  name: string
  perWeek: boolean
}

export interface ProcedureReport {
  failures: string[]
  unopened: string[]
  shallow: string[]
  differs: string[]
  unknown: string[]
}

const QUERIES = "## 검색 질의"
// 검색 질의 절의 질의 줄(`- **이름** (구역): …`). 같은 절의 설명 줄(`- **arXiv**: …`)에는 구역이 없다.
const QUERY_LINE = /^- \*\*(.+?)\*\* \([^)]*\): /
const FREE_SEARCH = "자유 검색"
const WEEK_DATE = "<월요일>"

/** 매체 목록의 매체와 검색 질의 절의 질의. */
export function sources(markdown: string): Source[] {
  const listed = tableRows(markdown, LISTED).map(([name, , how]) => ({
    name,
    perWeek: how.startsWith("검색 질의") && how.includes(WEEK_DATE),
  }))
  let inside = false
  const queries: Source[] = []
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) inside = line.trim() === QUERIES
    const match = inside && line.match(QUERY_LINE)
    if (match) queries.push({ name: match[1], perWeek: true })
  }
  return [...listed, ...queries]
}

export function checkProcedure(input: {
  sources: Source[]
  weeks: string[]
  records: Access[]
}): ProcedureReport {
  const report: ProcedureReport = {
    failures: [],
    unopened: [],
    shallow: [],
    differs: [],
    unknown: [],
  }
  const single = input.weeks.length === 1
  for (const source of input.sources) {
    const own = input.records.filter((r) => r.source === source.name)
    const slots = source.perWeek && !single ? input.weeks : [""]
    for (const week of slots) {
      const label = week ? `${source.name} ${week}` : source.name
      const covering = own.filter((r) => !week || r.week === week || (!r.week && !source.perWeek))
      if (covering.some((r) => r.opened)) continue
      const reasons = covering.map((r) => r.reason?.trim()).filter(Boolean)
      if (reasons.length) report.unopened.push(`${label}: ${reasons.join("; ")}`)
      else if (covering.length) report.failures.push(`${label}: 열지 않았고 이유가 없다`)
      else if (own.length)
        report.failures.push(`${label}: 기록이 없다(검색 질의는 주차마다 한 줄씩 적는다)`)
      else report.failures.push(`${label}: 기록이 없다`)
    }
    for (const r of own) {
      const label = r.week ? `${source.name} ${r.week}` : source.name
      if (r.shallow?.trim()) report.shallow.push(`${label}: 가장 오래된 글 ${r.shallow.trim()}`)
      if (r.differs?.trim()) report.differs.push(`${label}: ${r.differs.trim()}`)
    }
  }
  const names = new Set(input.sources.map((s) => s.name))
  report.unknown = [
    ...new Set(
      input.records
        .map((r) => r.source)
        .filter((name) => !names.has(name) && !name.startsWith(FREE_SEARCH)),
    ),
  ]
  return report
}

/** 작업 폴더 out/ 아래 접속 기록(*-access.jsonl)의 모든 줄. */
export function readAccess(folder: string): Access[] {
  const dir = path.join(folder, "out")
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith("-access.jsonl"))
    .sort()
    .flatMap((file) => readJsonl<Access>(path.join(dir, file)))
}

function main(): number {
  const [folder, ...args] = process.argv.slice(2)
  if (!folder || args.length === 0) {
    console.error("사용: procedure.ts <작업 폴더> <주차나 달>...")
    return 2
  }
  const weeks = weeksOf(args)
  const report = checkProcedure({
    sources: sources(fs.readFileSync(path.join(root, OUTLETS), "utf8")),
    weeks,
    records: readAccess(path.resolve(folder)),
  })
  const section = (title: string, lines: string[], note = "") => {
    console.log(`\n${title} ${lines.length}건${note}`)
    for (const line of lines) console.log(`- ${line}`)
  }
  console.log(`실패 ${report.failures.length}건`)
  for (const line of report.failures) console.log(`- ${line}`)
  section("이유를 적고 열지 않은 곳", report.unopened, "(PR 본문에 적는다)")
  section("얕아서 놓쳤을 수 있는 피드", report.shallow, "(PR 본문에 적는다)")
  section("비고와 다른 접속 결과", report.differs, "(실행 환경 탓이 아니면 그 줄을 고친다)")
  section("목록에 없는 이름", report.unknown, "(매체 목록의 이름과 다르게 적었는지 본다)")
  return report.failures.length ? 1 : 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main()
}
