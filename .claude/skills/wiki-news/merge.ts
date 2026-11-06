// 소식 조사의 병합 스크립트(SKILL.md의 2. 지난 호, 5. 중복, 9. PR). 조사 에이전트가 낸 후보를 합치고, 같은 사건으로
// 보이는 후보와 지난 호 항목을 이유와 함께 알린다. 묶음은 제안이고, 무엇을 실을지는 5단계가 정한다. 후보와 검토
// 기록의 꼴은 researcher.md와 news-reviewer.md에 있다.
// 사용: npx tsx .claude/skills/wiki-news/merge.ts past <작업 폴더> [--ref <브랜치>]... [--today <YYYY-MM-DD>]
//       npx tsx .claude/skills/wiki-news/merge.ts merge <작업 폴더> [--force]
//       npx tsx .claude/skills/wiki-news/merge.ts drop <작업 폴더> --reason <이유> <번호>...
//       npx tsx .claude/skills/wiki-news/merge.ts table <작업 폴더> <주차나 달>...
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { parseWeeklyNews, weekDays, type NewsItem } from "../../../plugins/weekly-news/index"
import { repoRoot as root } from "../../../tools/repo"
import { LISTED, OUTLETS, tableRows, visibleText } from "./check"
import { git, readJsonl, weeksOf, writeJsonl } from "./work"

/** 조사 에이전트의 후보 한 줄(researcher.md의 출력). id는 병합이 붙인다. */
export interface Candidate {
  id?: string
  week: string
  title: string
  url: string
  outlet: string
  date: string
  verdict: "싣기" | "빼기"
  reason: string
  event?: { org: string; subject: string }
  same_event_seen_at?: string[]
  dup_of?: string
  digest?: string
  image?: string
}

/** 지난 호의 소식 항목(past.tsv 한 줄). */
export interface PastItem {
  week: string
  title: string
  url: string
  outlet: string
  date: string
  summary: string
}

/** 검토 에이전트의 기록 한 줄(news-reviewer.md의 출력). from은 원문을 바꿨을 때 바꾸기 전 주소다. */
export interface Review {
  url: string
  from?: string
  result: "통과" | "고침" | "뺌" | "소유자 확인 요청"
  reason: string
}

export type Published = Pick<NewsItem, "url" | "title" | "outlet" | "date">

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim())
    const query = [...u.searchParams].filter(([key]) => !key.startsWith("utm_"))
    const search = query.length ? `?${new URLSearchParams(query)}` : ""
    const host = u.hostname.toLowerCase().replace(/^www\./, "")
    return `${host}${u.pathname.replace(/\/+$/, "")}${search}`
  } catch {
    return url.trim()
  }
}

const DAY = 24 * 60 * 60 * 1000

/** 날짜(`YYYY-MM-DD`)가 드는 ISO 주차(`2026-w36`). */
export function isoWeek(date: string): string {
  const day = new Date(`${date}T00:00:00Z`)
  const thursday = new Date(day.getTime() + (3 - ((day.getUTCDay() + 6) % 7)) * DAY)
  const year = thursday.getUTCFullYear()
  const week = Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / (7 * DAY)) + 1
  return `${year}-w${String(week).padStart(2, "0")}`
}

const squash = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")

function bigrams(text: string): string[] {
  const s = text.toLowerCase().replace(/\s+/g, " ").trim()
  return Array.from({ length: Math.max(0, s.length - 1) }, (_, i) => s.slice(i, i + 2))
}

/** 두 제목의 바이그램 Dice 계수(0~1). */
export function similarity(a: string, b: string): number {
  const x = bigrams(a)
  const y = bigrams(b)
  if (!x.length || !y.length) return a.trim().toLowerCase() === b.trim().toLowerCase() ? 1 : 0
  const pool = new Map<string, number>()
  for (const g of y) pool.set(g, (pool.get(g) ?? 0) + 1)
  let shared = 0
  for (const g of x) {
    const n = pool.get(g) ?? 0
    if (n > 0) {
      shared++
      pool.set(g, n - 1)
    }
  }
  return (2 * shared) / (x.length + y.length)
}

// NHTSA 캠페인 번호(26V213 등). 다른 나라 신고가 이 번호를 적으면 같은 결함으로 본다.
const RECALL = /(?<![A-Za-z0-9])(\d{2}[VETC]\d{3})(?![A-Za-z0-9])/g
const SAME_TITLE = 0.8
const SAME_PAST_TITLE = 0.7
const SAME_URL_TITLE = 0.5
const MIN_SUBJECT = 4

function recalls(c: { title: string; url: string; subject?: string }): string[] {
  return [...`${c.title} ${c.url} ${c.subject ?? ""}`.matchAll(RECALL)].map((m) => m[1])
}

function sameKey(a: Candidate, b: Candidate): string | undefined {
  if (!a.event || !b.event) return undefined
  const [sa, sb] = [squash(a.event.subject), squash(b.event.subject)]
  const [oa, ob] = [squash(a.event.org), squash(b.event.org)]
  const short = sa.length <= sb.length ? sa : sb
  if (short.length < MIN_SUBJECT || !(sa.includes(sb) || sb.includes(sa)) || !oa || !ob)
    return undefined
  return oa.includes(ob) || ob.includes(oa) ? a.event.subject : undefined
}

/**
 * 싣기로 남은 후보 가운데 같은 사건으로 보이는 묶음. 같은 주소(제목도 비슷할 때), 한쪽이 본 주소
 * (same_event_seen_at), 같은 리콜 번호, 같은 사건 키(회사와 대상), 비슷한 제목이면 잇는다.
 */
export function sameEvents(candidates: Candidate[]): { ids: string[]; reasons: string[] }[] {
  const keep = candidates.filter((c) => c.verdict === "싣기")
  const parent = keep.map((_, i) => i)
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  const reasons = new Map<number, string[]>()
  const link = (i: number, j: number, reason: string) => {
    const [a, b] = [find(i), find(j)].sort((x, y) => x - y)
    const merged = [...(reasons.get(a) ?? []), ...(a === b ? [] : (reasons.get(b) ?? [])), reason]
    parent[b] = a
    reasons.delete(b)
    reasons.set(a, merged)
  }
  for (let i = 0; i < keep.length; i++) {
    for (let j = i + 1; j < keep.length; j++) {
      const [a, b] = [keep[i], keep[j]]
      const pair = `${a.id}, ${b.id}`
      const [ra, rb] = [a, b].map((c) => recalls({ ...c, subject: c.event?.subject }))
      const sameRecall = ra.find((n) => rb.includes(n))
      // 리콜 번호가 서로 다르면 제목이 비슷해도(같은 차종의 다른 리콜) 묶지 않는다.
      const otherRecalls = ra.length > 0 && rb.length > 0 && !sameRecall
      const key = sameKey(a, b)
      const seen = (x: Candidate, y: Candidate) =>
        (x.same_event_seen_at ?? []).some((u) => normalizeUrl(u) === normalizeUrl(y.url))
      if (
        normalizeUrl(a.url) === normalizeUrl(b.url) &&
        similarity(a.title, b.title) >= SAME_URL_TITLE
      )
        link(i, j, `같은 주소: ${pair}`)
      else if (seen(a, b)) link(i, j, `${a.id}이 본 주소: ${b.id}`)
      else if (seen(b, a)) link(i, j, `${b.id}이 본 주소: ${a.id}`)
      else if (sameRecall) link(i, j, `같은 리콜 번호 ${sameRecall}: ${pair}`)
      else if (key) link(i, j, `같은 사건 키 ${key}: ${pair}`)
      else if (!otherRecalls && similarity(a.title, b.title) >= SAME_TITLE)
        link(i, j, `비슷한 제목: ${pair}`)
    }
  }
  const groups = new Map<number, string[]>()
  keep.forEach((c, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), c.id ?? ""]))
  return [...groups]
    .filter(([, ids]) => ids.length > 1)
    .map(([rootIndex, ids]) => ({ ids, reasons: reasons.get(rootIndex) ?? [] }))
}

/** 후보와 같은 사건으로 보이는 지난 호 항목과 그 이유. */
export function pastMatches(
  c: Candidate,
  items: PastItem[],
): { item: PastItem; reasons: string[] }[] {
  const own = recalls({ ...c, subject: c.event?.subject })
  const subject =
    c.event && !recalls({ title: "", url: "", subject: c.event.subject }).length
      ? squash(c.event.subject)
      : ""
  const org = c.event ? squash(c.event.org) : ""
  return items
    .map((item) => {
      const reasons: string[] = []
      const text = squash(`${item.title} ${item.summary}`)
      const recall = recalls(item).find((n) => own.includes(n))
      if (normalizeUrl(item.url) === normalizeUrl(c.url)) reasons.push("같은 주소")
      if (recall) reasons.push(`같은 리콜 번호 ${recall}`)
      if (
        subject.length >= MIN_SUBJECT &&
        org &&
        text.includes(subject) &&
        `${text}${squash(item.outlet)}`.includes(org)
      )
        reasons.push(`같은 사건 키 ${c.event!.subject}`)
      if (similarity(item.title, c.title) >= SAME_PAST_TITLE) reasons.push("비슷한 제목")
      return { item, reasons }
    })
    .filter((m) => m.reasons.length)
}

const cell = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\|/g, "\\|")
    .replace(/(?<!\\)~/g, "\\~")
    .trim()

/**
 * 후보별 판정표(번호, 날짜, 매체, 제목, 판정, 이유). 이번 실행의 호에 실린 후보는 실림이고, 검토가 원문을 바꾼
 * 후보는 바뀐 주소로 찾는다. 실리지 않은 후보의 이유는 검토 기록, 그다음 후보의 이유에서 가져오고, 둘 다 없는
 * 후보의 번호는 missing으로 낸다.
 */
export function verdictTable(
  candidates: Candidate[],
  reviews: Review[],
  published: Published[],
): { markdown: string; missing: string[] } {
  const byUrl = new Map(published.map((p) => [normalizeUrl(p.url), p]))
  const used = new Set<string>()
  const missing: string[] = []
  const rows: { date: string; id: string; verdict: string; cells: string[] }[] = []
  for (const c of candidates) {
    const review = reviews.find((r) => normalizeUrl(r.from || r.url) === normalizeUrl(c.url))
    const url = normalizeUrl(review?.url || c.url)
    let verdict = "뺌"
    let reason = ""
    if (byUrl.has(url)) {
      used.add(url)
      verdict = "실림"
      reason = review?.from ? `검토: ${review.reason}` : ""
    } else if (review?.result === "뺌") reason = `검토: ${review.reason}`
    else if (c.verdict === "빼기" && c.reason.trim()) reason = c.reason
    else {
      missing.push(c.id ?? c.url)
      reason = "이유 없음"
    }
    rows.push({
      date: c.date,
      id: c.id ?? "-",
      verdict,
      cells: [c.date, c.outlet, c.title, verdict, reason],
    })
  }
  for (const p of published) {
    if (!used.has(normalizeUrl(p.url)))
      rows.push({
        date: p.date,
        id: "-",
        verdict: "실림",
        cells: [p.date, p.outlet, p.title, "실림", "후보 밖에서 더함"],
      })
  }
  rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  const kept = rows.filter((r) => r.verdict === "실림").length
  const markdown = [
    `<details><summary>후보 판정표 ${rows.length}건(실림 ${kept}, 뺌 ${rows.length - kept})</summary>`,
    "",
    "| 번호 | 날짜 | 매체 | 제목 | 판정 | 이유 |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map((r) => `| ${[r.id, ...r.cells].map(cell).join(" | ")} |`),
    "",
    "</details>",
  ].join("\n")
  return { markdown, missing }
}

// 빼는 기준의 셋째 조건(outlets.md)으로 빼지 않는 줄의 표시.
const EXEMPT = ["드물게 냄", "배포처"]

/** 매체 목록의 매체 가운데 counts(13주 호의 매체별 항목 수)에 없고, 비고에 EXEMPT 표시가 없는 것. */
export function exclusionCandidates(outletsMd: string, counts: Map<string, number>): string[] {
  return tableRows(outletsMd, LISTED)
    .filter(([name, , , , note = ""]) => !counts.get(name) && !EXEMPT.some((m) => note.includes(m)))
    .map(([name]) => name)
}

const ISSUE = /^content\/news\/(\d{4}-w\d{2})\.md$/

/** ref들의 호. 같은 주차가 여러 ref에 있으면 앞 ref의 것을 쓴다. */
function issuesAt(refs: string[]): Map<string, { ref: string; items: NewsItem[] }> {
  const issues = new Map<string, { ref: string; items: NewsItem[] }>()
  for (const ref of refs) {
    for (const file of git(["ls-tree", "--name-only", ref, "content/news/"]).split("\n")) {
      const week = file.match(ISSUE)?.[1]
      if (!week || issues.has(week)) continue
      const { items, errors } = parseWeeklyNews(week, git(["show", `${ref}:${file}`]))
      if (errors.length) throw new Error(`${ref}:${file}: ${errors[0].line}: ${errors[0].message}`)
      issues.set(week, { ref, items })
    }
  }
  return issues
}

const tsv = (text: string) => text.replace(/[\t\n\r]+/g, " ").trim()

function kstToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function past(folder: string, refs: string[], today: string): number {
  const main = "origin/main"
  const issues = issuesAt([main, ...refs])
  const lines = [...issues]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([week, { items }]) =>
      items.map((it) =>
        [week, it.title, it.url, it.outlet, it.date, visibleText(it.summary.markdown)]
          .map(tsv)
          .join("\t"),
      ),
    )
  fs.writeFileSync(path.join(folder, "past.tsv"), lines.join("\n") + "\n")
  const fromOpen = [...issues].filter(([, i]) => i.ref !== main).map(([w, i]) => `${w}(${i.ref})`)
  console.log(`past.tsv: 호 ${issues.size}개, 항목 ${lines.length}건`)
  console.log(`열린 PR의 호: ${fromOpen.length ? fromOpen.join(", ") : "없음"}`)

  const monday = weekDays(isoWeek(today)).start
  const from = new Date(Date.parse(monday) - 13 * 7 * DAY).toISOString().slice(0, 10)
  const counts = new Map<string, number>()
  let weeks = 0
  for (const [week, { ref, items }] of issues) {
    const start = weekDays(week).start
    if (ref !== main || start < from || start >= monday) continue
    weeks++
    for (const it of items) counts.set(it.outlet, (counts.get(it.outlet) ?? 0) + 1)
  }
  const outletsMd = fs.readFileSync(path.join(root, OUTLETS), "utf8")
  const excluded = exclusionCandidates(outletsMd, counts)
  console.log(`\n빼는 기준의 셋째 조건: main의 ${from}부터 ${monday} 전까지 호 ${weeks}개`)
  console.log(
    `목록 제외 후보 ${excluded.length}곳${excluded.length ? `: ${excluded.join(", ")}` : ""}`,
  )
  return 0
}

function merge(folder: string, force: boolean): number {
  const target = path.join(folder, "merged.jsonl")
  if (fs.existsSync(target) && !force) {
    console.error(`${target}가 이미 있다. 다시 합치려면 --force(5단계에서 고친 판정이 지워진다)`)
    return 1
  }
  const dir = path.join(folder, "out")
  const rows: Candidate[] = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl") && !f.endsWith("-access.jsonl"))
    .sort()
    .flatMap((f) =>
      readJsonl<Candidate>(path.join(dir, f)).map((c, i) => ({
        ...c,
        id: `${f.slice(0, -".jsonl".length)}${String(i + 1).padStart(2, "0")}`,
      })),
    )
  writeJsonl(target, rows)
  const keep = rows.filter((c) => c.verdict === "싣기")
  const weeks = [...new Set(rows.map((c) => c.week))].sort()
  console.log(`후보 ${rows.length}건 → ${target}`)
  for (const w of weeks)
    console.log(
      `- ${w}: 싣기 ${keep.filter((c) => c.week === w).length}, 빼기 ${rows.filter((c) => c.week === w && c.verdict === "빼기").length}`,
    )

  const problems = keep.flatMap((c) => [
    ...(isoWeek(c.date) !== c.week
      ? [`${c.id}: 발행일 ${c.date}는 ${isoWeek(c.date)}인데 주차가 ${c.week}다`]
      : []),
    ...(!c.digest?.trim() ? [`${c.id}: 요약이 없다`] : []),
    ...(c.image?.includes(" ") ? [`${c.id}: 이미지 주소에 공백이 있다(%20)`] : []),
  ])
  console.log(`\n고칠 것 ${problems.length}건`)
  for (const p of problems) console.log(`- ${p}`)

  const label = (id: string) => {
    const c = rows.find((r) => r.id === id)!
    return `${id} ${c.week} ${c.outlet} | ${c.title.slice(0, 70)}`
  }
  const groups = sameEvents(rows)
  console.log(`\n같은 사건 묶음 후보 ${groups.length}개(5단계가 하나만 남긴다)`)
  for (const g of groups) {
    console.log(`- ${g.reasons.join("; ")}`)
    for (const id of g.ids) console.log(`  - ${label(id)}`)
  }

  const pastFile = path.join(folder, "past.tsv")
  const items: PastItem[] = fs.existsSync(pastFile)
    ? fs
        .readFileSync(pastFile, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [week, title, url, outlet, date, summary = ""] = line.split("\t")
          return { week, title, url, outlet, date, summary }
        })
    : []
  if (!items.length) console.log("\npast.tsv가 없거나 비었다(2단계)")
  const hits = keep.flatMap((c) => {
    const found = pastMatches(c, items).map(
      (m) => `${m.item.week} "${m.item.title.slice(0, 60)}" (${m.reasons.join(", ")})`,
    )
    if (c.dup_of?.trim()) found.push(`조사 에이전트: ${c.dup_of}`)
    return found.length ? [{ id: c.id!, found }] : []
  })
  console.log(`\n지난 호와 같은 사건 후보 ${hits.length}건(새 진전이 없으면 5단계가 뺀다)`)
  for (const h of hits) {
    console.log(`- ${label(h.id)}`)
    for (const f of h.found) console.log(`  - ${f}`)
  }
  return 0
}

function drop(folder: string, ids: string[], reason: string): number {
  const target = path.join(folder, "merged.jsonl")
  const rows = readJsonl<Candidate>(target)
  const unknown = ids.filter((id) => !rows.some((r) => r.id === id))
  if (unknown.length) {
    console.error(`없는 번호: ${unknown.join(", ")}`)
    return 1
  }
  writeJsonl(
    target,
    rows.map((r) => (ids.includes(r.id!) ? { ...r, verdict: "빼기", reason } : r)),
  )
  console.log(`${ids.length}건을 빼기로: ${reason}`)
  return 0
}

function table(folder: string, weeks: string[]): number {
  const candidates = readJsonl<Candidate>(path.join(folder, "merged.jsonl"))
  const reviewDir = path.join(folder, "review")
  const reviews = fs.existsSync(reviewDir)
    ? fs
        .readdirSync(reviewDir)
        .filter((f) => f.endsWith(".jsonl"))
        .flatMap((f) => readJsonl<Review>(path.join(reviewDir, f)))
    : []
  const published = weeks.flatMap((week) => {
    const file = path.join(root, "content", "news", `${week}.md`)
    return fs.existsSync(file) ? parseWeeklyNews(week, fs.readFileSync(file, "utf8")).items : []
  })
  const { markdown, missing } = verdictTable(candidates, reviews, published)
  console.log(markdown)
  if (missing.length) {
    console.error(
      `\n실리지 않았는데 이유가 없는 후보 ${missing.length}건: ${missing.join(", ")}(drop으로 이유를 적는다)`,
    )
    return 1
  }
  return 0
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      ref: { type: "string", multiple: true, default: [] },
      today: { type: "string", default: kstToday() },
      force: { type: "boolean", default: false },
      reason: { type: "string" },
    },
  })
  const [command, folder, ...rest] = positionals
  const dir = folder && path.resolve(folder)
  if (dir && command === "past") return past(dir, values.ref!, values.today!)
  if (dir && command === "merge") return merge(dir, values.force!)
  if (dir && command === "drop" && values.reason && rest.length)
    return drop(dir, rest, values.reason)
  if (dir && command === "table" && rest.length) return table(dir, weeksOf(rest))
  console.error("사용: merge.ts past|merge|drop|table <작업 폴더> …(머리 주석)")
  return 2
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main()
}
