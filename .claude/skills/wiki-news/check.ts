// 소식 조사의 기계 검사(SKILL.md의 8. 검사와 9. PR). 주간 소식 호를 형식 함수(plugins/weekly-news의
// parseWeeklyNews)로 읽어 실패와 알림(위키 링크 후보, 분포 줄)을 내고, 실패가 있으면 exit 1이다. 규칙은 SKILL.md
// 7단계, docs/weekly-news.md, outlets.md의 열 절에 있고, PR 전 확인에 넣지 않는 까닭은 SKILL.md 8단계에 있다.
// 사용: npx tsx .claude/skills/wiki-news/check.ts <주차나 달>...
//       npx tsx .claude/skills/wiki-news/check.ts --pr <본문 파일> [--base <ref>]
import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { parse as parseYaml } from "yaml"
import {
  monthWeeks,
  parseWeeklyNews,
  weekDays,
  type NewsItem,
} from "../../../plugins/weekly-news/index"
import { repoRoot as root } from "../../../tools/repo"

export interface Issue {
  week: string
  items: NewsItem[]
}

export interface Outlets {
  listed: Set<string>
  rejected: Set<string>
}

export interface Page {
  slug: string
  names: string[]
}

export interface IssueReport {
  week: string
  failures: string[]
  candidates: string[]
  distribution: string
}

const SUMMARY_LIMIT = 250

/** 요약 마크다운에서 독자에게 보이는 글자. 위키 링크와 링크는 보이는 이름, 이스케이프는 그 글자로 바꾼다. */
export function visibleText(markdown: string): string {
  return markdown
    .replace(
      /\[\[([^\]|]*)(?:\|([^\]]*))?\]\]/g,
      (_, target: string, alias?: string) => alias ?? target.split("#")[0],
    )
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\\(.)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

/** 요약에서 이스케이프되지 않은 ~의 수. 링크 주소 안은 세지 않는다. GFM은 한 문단의 ~ 둘 사이를 취소선으로 그린다. */
export function bareTildes(markdown: string): number {
  return markdown.replace(/\]\([^)]*\)/g, "]()").match(/(?<!\\)~/g)?.length ?? 0
}

// 리콜이 아닌 NHTSA 문서의 이름(outlets.md의 열 절).
const NHTSA = "NHTSA"
const NHTSA_RECALL = /^Recall \d{2}[VE]\d{3}|nhtsaId=/

function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

/**
 * `매체` 값이 매체 목록의 이름을 달리 쓴 것으로 보이는가. 목록 이름은 괄호 안을 뗀다. 두 이름의 낱말이 한쪽의
 * 앞머리와 같거나(`Vector`와 `Vector Informatik`, `CAN in Automation`과 `CAN in Automation (CiA)`), 한쪽의 세 글자
 * 이상인 한자·한글 낱말이 다른 쪽 낱말 안에 들면 비슷하다(`同星智能 Tosun`과 `上海同星智能科技有限公司`). 가운데
 * 낱말만 같은 이름(`Electronics (MDPI)`와 `Power Electronics News`)은 다른 곳으로 본다.
 */
export function similarNames(value: string, listed: string): boolean {
  const [x, y] = [nameTokens(value), nameTokens(listed.replace(/\([^)]*\)/g, " "))]
  if (x.length === 0 || y.length === 0) return false
  const [short, long] = x.length <= y.length ? [x, y] : [y, x]
  if (short.every((t, i) => long[i] === t)) return true
  const inside = (p: string[], q: string[]) =>
    p.some((t) => /[^\x00-\x7f]/.test(t) && [...t].length >= 3 && q.some((u) => u.includes(t)))
  return inside(x, y) || inside(y, x)
}

function outletFailure(outlets: Outlets, item: NewsItem): string | undefined {
  const name = item.outlet
  if (outlets.listed.has(name) || outlets.rejected.has(name)) return undefined
  if (name === NHTSA && !NHTSA_RECALL.test(item.title) && !NHTSA_RECALL.test(item.url))
    return undefined
  const listed = [...outlets.listed].find((other) => similarNames(name, other))
  return listed && `매체 "${name}" → 매체 목록의 "${listed}"`
}

interface Mention {
  slug: string
  name: string
  at: number
  linked: boolean
}

const blank = (text: string) => " ".repeat(text.length)
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * 요약에서 위키 페이지 개념이 나온 자리를 앞에서부터 준다. 위키 링크는 링크한 자리로, 그 밖에서 페이지의
 * 제목이나 별칭이 나온 곳은 링크하지 않은 자리로 본다. 긴 이름부터 찾아 `CAN XL` 안의 `CAN`은 세지 않고,
 * 로마자로 끝나는 이름은 로마자 낱말 안(`CANoe`)에서 찾지 않는다.
 */
function mentions(markdown: string, names: { slug: string; name: string }[]): Mention[] {
  const found: Mention[] = []
  let text = markdown.replace(
    /\[\[([^\]|#]*)[^\]]*\]\]/g,
    (link: string, target: string, at: number) => {
      found.push({ slug: target.trim(), name: "", at, linked: true })
      return blank(link)
    },
  )
  text = text.replace(/\[[^\]]*\]\([^)]*\)/g, blank)
  for (const { slug, name } of names) {
    const before = /^[A-Za-z0-9]/.test(name) ? "(?<![A-Za-z0-9])" : ""
    const after = /[A-Za-z0-9]$/.test(name) ? "(?![A-Za-z0-9])" : ""
    text = text.replace(
      new RegExp(before + escapeRegExp(name) + after, "g"),
      (hit: string, at: number) => {
        found.push({ slug, name, at, linked: false })
        return blank(hit)
      },
    )
  }
  return found.sort((a, b) => a.at - b.at)
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

interface Shape {
  items: number
  featured: number
  length: number
  other: number
}

function shape(items: NewsItem[]): Shape {
  return {
    items: items.length,
    featured: items.filter((item) => item.featured).length,
    length: median(items.map((item) => [...visibleText(item.summary.markdown)].length)),
    other: items.length
      ? (100 * items.filter((item) => item.regions.length === 0).length) / items.length
      : 0,
  }
}

const PREVIOUS_WEEKS = 4
const DAY = 24 * 60 * 60 * 1000
const round = (n: number) => String(Math.round(n * 10) / 10)
const percent = (n: number) => `${Math.round(n)}%`

/** 분포 줄. 괄호 안은 그 주 앞 4주에 있는 호(파일이 없는 주는 빠짐)의 값마다의 중앙값이다. */
function distribution(issues: Issue[], week: string): string {
  const start = weekDays(week).start
  const from = new Date(Date.parse(start) - PREVIOUS_WEEKS * 7 * DAY).toISOString().slice(0, 10)
  const current = shape(issues.find((i) => i.week === week)?.items ?? [])
  const previous = issues
    .filter((i) => {
      const day = weekDays(i.week).start
      return day >= from && day < start
    })
    .map((i) => shape(i.items))
  const was = (key: keyof Shape, format = round) =>
    previous.length ? format(median(previous.map((p) => p[key]))) : "-"
  const chars = (n: number) => `${round(n)}자`
  return (
    `${week}: 항목 ${current.items}(직전 ${PREVIOUS_WEEKS}주 중앙값 ${was("items")}), ` +
    `주요 ${current.featured}(${was("featured")}), ` +
    `요약 길이 중앙값 ${chars(current.length)}(${was("length", chars)}), ` +
    `기타 ${percent(current.other)}(${was("other", percent)})`
  )
}

function label(week: string, item: NewsItem): string {
  return `${week} "${item.title.length > 40 ? `${item.title.slice(0, 40)}…` : item.title}"`
}

export function checkIssues(input: {
  issues: Issue[]
  weeks: string[]
  outlets: Outlets
  pages: Page[]
}): IssueReport[] {
  const imageKey = (item: NewsItem) => `${item.outlet}\n${item.image}`
  const byImage = new Map<string, { week: string; item: NewsItem }[]>()
  for (const { week, items } of input.issues) {
    for (const item of items) {
      if (item.image)
        byImage.set(imageKey(item), [...(byImage.get(imageKey(item)) ?? []), { week, item }])
    }
  }
  const names = input.pages
    .flatMap(({ slug, names }) => names.map((name) => ({ slug, name })))
    .sort((a, b) => b.name.length - a.name.length)
  return input.weeks.map((week) => {
    const issue = input.issues.find((i) => i.week === week)
    const failures: string[] = []
    for (const item of issue?.items ?? []) {
      const length = [...visibleText(item.summary.markdown)].length
      if (length > SUMMARY_LIMIT)
        failures.push(`${label(week, item)}: 요약이 ${length}자다(상한 ${SUMMARY_LIMIT}자)`)
      const tildes = bareTildes(item.summary.markdown)
      if (tildes > 0)
        failures.push(
          `${label(week, item)}: 요약에 이스케이프되지 않은 ~가 ${tildes}곳 있다(\\~로 쓴다)`,
        )
      const outlet = outletFailure(input.outlets, item)
      if (outlet) failures.push(`${label(week, item)}: ${outlet}`)
      const other = item.image
        ? byImage.get(imageKey(item))?.find((o) => o.item !== item)
        : undefined
      if (other)
        failures.push(
          `${label(week, item)}: 이미지가 같은 매체의 다른 항목(${label(other.week, other.item)})과 같다. 사이트 공통 이미지면 비운다`,
        )
    }
    const candidates: string[] = []
    const seen = new Set<string>()
    for (const item of issue?.items ?? []) {
      for (const mention of mentions(item.summary.markdown, names)) {
        if (seen.has(mention.slug)) continue
        seen.add(mention.slug)
        if (!mention.linked)
          candidates.push(`${label(week, item)}: ${mention.name} → [[${mention.slug}]]`)
      }
    }
    return { week, failures, candidates, distribution: distribution(input.issues, week) }
  })
}

const LISTED = "## 매체 목록"
const REJECTED = "## 받지 않은 후보"

/** 매체 목록 파일(outlets.md)의 매체 목록 표와 받지 않은 후보 표에서 첫 칸(매체 이름)을 읽는다. */
export function outletNames(markdown: string): Outlets {
  const outlets: Outlets = { listed: new Set(), rejected: new Set() }
  let section: Set<string> | undefined
  let body = false
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      const heading = line.trim()
      section =
        heading === LISTED ? outlets.listed : heading === REJECTED ? outlets.rejected : undefined
      body = false
    } else if (!line.startsWith("|")) {
      body = false
    } else if (/^\|[\s:|-]+\|$/.test(line.trim())) {
      body = true
    } else if (section && body) {
      section.add(line.split("|")[1].trim())
    }
  }
  return outlets
}

/** 두 표에 새로 든 매체 이름. before는 기준 커밋의, after는 작업 트리의 매체 목록 파일이다. */
export function addedOutlets(before: string, after: string): string[] {
  const old = outletNames(before)
  const now = outletNames(after)
  return [...now.listed, ...now.rejected].filter(
    (name) => !old.listed.has(name) && !old.rejected.has(name),
  )
}

/**
 * 줄에서 그 매체의 몫. 이름 뒤부터 다음에 더한 매체 이름 앞까지다. 이름을 늘어놓은 줄 머리의 합계(`17곳: A, B`)는
 * 어느 매체의 몫에도 들지 않는다.
 */
function shareOf(line: string, name: string, added: string[]): string[] {
  const shares: string[] = []
  for (let at = line.indexOf(name); at >= 0; at = line.indexOf(name, at + 1)) {
    const start = at + name.length
    const ends = added
      .filter((other) => other !== name)
      .map((other) => line.indexOf(other, start))
      .filter((end) => end >= 0)
    shares.push(line.slice(start, Math.min(line.length, ...ends)))
  }
  return shares
}

/** 건수로 볼 숫자가 있는가. 코드, 주소, 날짜 안의 숫자는 건수가 아니다. */
function hasCount(text: string): boolean {
  return /\d/.test(
    text
      .replace(/`[^`]*`/g, " ")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/\d{4}-\d{2}(-\d{2})?/g, " "),
  )
}

/** 더한 매체마다, PR 본문의 어느 줄에 그 이름과 그 뒤의 건수(숫자)가 있는가. */
export function checkPrBody(body: string, added: string[]): string[] {
  const lines = body.split("\n")
  return added
    .filter((name) => !lines.some((line) => shareOf(line, name, added).some(hasCount)))
    .map(
      (name) =>
        `PR 본문: ${name}의 최근 3개월 건수가 없다(매체 목록이나 받지 않은 후보 표에 더한 줄)`,
    )
}

const OUTLETS = ".claude/skills/wiki-news/outlets.md"

function readIssues(): Issue[] {
  const dir = path.join(root, "content", "news")
  return fs
    .readdirSync(dir)
    .filter((file) => /^\d{4}-w\d{2}\.md$/.test(file))
    .sort()
    .map((file) => {
      const week = file.slice(0, -".md".length)
      const { items, errors } = parseWeeklyNews(week, fs.readFileSync(path.join(dir, file), "utf8"))
      if (errors.length)
        throw new Error(`${file}: ${errors.map((e) => `${e.line}: ${e.message}`).join("; ")}`)
      return { week, items }
    })
}

// 위키 페이지(content/ 바로 아래의 .md, 대문 제외)의 제목과 별칭.
function readPages(): Page[] {
  const dir = path.join(root, "content")
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && file !== "index.md")
    .flatMap((file) => {
      const front = fs.readFileSync(path.join(dir, file), "utf8").match(/^---\n([\s\S]*?)\n---/)
      const data = front ? (parseYaml(front[1]) as { title?: unknown; aliases?: unknown }) : {}
      const names = [data.title, ...(Array.isArray(data.aliases) ? data.aliases : [])].filter(
        (name): name is string => typeof name === "string" && name.trim() !== "",
      )
      return names.length ? [{ slug: file.slice(0, -".md".length), names }] : []
    })
}

function git(args: string[]): string {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
  if (result.status !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr.trim()}`)
  return result.stdout
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { pr: { type: "string" }, base: { type: "string", default: "origin/main" } },
  })
  const after = fs.readFileSync(path.join(root, OUTLETS), "utf8")

  if (values.pr) {
    const base = git(["merge-base", values.base!, "HEAD"]).trim()
    const added = addedOutlets(git(["show", `${base}:${OUTLETS}`]), after)
    const failures = checkPrBody(fs.readFileSync(path.resolve(values.pr), "utf8"), added)
    console.log(`더한 매체 ${added.length}곳${added.length ? `: ${added.join(", ")}` : ""}`)
    for (const failure of failures) console.log(`실패: ${failure}`)
    return failures.length ? 1 : 0
  }

  if (positionals.length === 0) {
    console.error("사용: check.ts <주차나 달>... | check.ts --pr <본문 파일> [--base <ref>]")
    return 2
  }
  const issues = readIssues()
  const asked = positionals.flatMap((arg) => (/^\d{4}-\d{2}$/.test(arg) ? monthWeeks(arg) : [arg]))
  const weeks = asked.filter((week) => issues.some((i) => i.week === week))
  for (const week of asked.filter((week) => !weeks.includes(week))) console.log(`호 없음: ${week}`)
  const reports = checkIssues({ issues, weeks, outlets: outletNames(after), pages: readPages() })

  const failures = reports.flatMap((r) => r.failures)
  const candidates = reports.flatMap((r) => r.candidates)
  console.log(`실패 ${failures.length}건`)
  for (const line of failures) console.log(`- ${line}`)
  console.log(`\n위키 링크 후보 ${candidates.length}건(통과 조건 아님, 확정은 쓰는 이가 한다)`)
  for (const line of candidates) console.log(`- ${line}`)
  console.log("\n분포")
  for (const r of reports) console.log(`- ${r.distribution}`)
  return failures.length ? 1 : 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main()
}
