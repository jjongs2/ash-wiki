import fs from "node:fs"
import path from "node:path"
import type { Violation } from "../check-content/tree"

// 하네스 조사 기록과 출처 목록의 검사. 규칙은 docs/research/README.md에 있다.

export interface Table {
  line: number // 머리 행의 줄 번호
  header: string[]
  rows: { line: number; cells: string[] }[]
}

export interface ResearchFile {
  file: string // 검사 루트 기준 경로
  lines: string[]
  tables: Table[]
  // 코드 블록 밖의 줄. 코드 블록 안의 줄은 빈 문자열로 둬 줄 번호를 지킨다.
  prose: string[]
}

export interface ResearchTree {
  sources: ResearchFile | undefined
  records: ResearchFile[]
}

export const SOURCES_FILE = "sources.md"
const NOT_RECORDS = new Set(["README.md", SOURCES_FILE])

export const SOURCE_HEADER = ["ID", "제목", "URL", "판", "읽은 날", "종류"]
export const CLAIM_HEADER = ["ID", "주장", "출처", "인용", "신뢰도"]

export function loadResearch(root: string): ResearchTree {
  const read = (name: string) => parseFile(name, fs.readFileSync(path.join(root, name), "utf8"))
  const names = fs
    .readdirSync(root)
    .filter((name) => name.endsWith(".md"))
    .sort()
  return {
    sources: names.includes(SOURCES_FILE) ? read(SOURCES_FILE) : undefined,
    records: names.filter((name) => !NOT_RECORDS.has(name)).map(read),
  }
}

export function parseFile(file: string, source: string): ResearchFile {
  const lines = source.split("\n")
  const prose: string[] = []
  let fence: string | undefined
  for (const line of lines) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1]
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = undefined
      prose.push("")
    } else if (marker) {
      fence = marker
      prose.push("")
    } else {
      prose.push(line)
    }
  }
  return { file, lines, tables: parseTables(prose), prose }
}

// 머리 행 다음 줄이 구분 행인 `|` 줄의 묶음을 표로 읽는다.
function parseTables(prose: string[]): Table[] {
  const tables: Table[] = []
  const isRow = (line: string | undefined) => line !== undefined && /^\s*\|/.test(line)
  const isDelimiter = (line: string | undefined) =>
    line !== undefined && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(line)
  for (let i = 0; i < prose.length; i++) {
    if (!isRow(prose[i]) || !isDelimiter(prose[i + 1])) continue
    const table: Table = { line: i + 1, header: splitCells(prose[i]), rows: [] }
    let j = i + 2
    for (; isRow(prose[j]); j++) table.rows.push({ line: j + 1, cells: splitCells(prose[j]) })
    tables.push(table)
    i = j - 1
  }
  return tables
}

// GFM처럼 `\|`가 아닌 `|`에서 셀을 가른다. 코드 스팬 안의 `|`도 셀을 가른다.
export function splitCells(line: string): string[] {
  const cells = line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
  return cells.map((cell) => cell.trim().replace(/\\\|/g, "|"))
}

const sameHeader = (a: string[], b: string[]) =>
  a.length === b.length && a.every((cell, i) => cell === b[i])

const all = (tree: ResearchTree) => [...(tree.sources ? [tree.sources] : []), ...tree.records]

export function checkTables(tree: ResearchTree): Violation[] {
  const violations: Violation[] = []
  for (const file of all(tree)) {
    for (const table of file.tables) {
      for (const row of table.rows) {
        if (row.cells.length !== table.header.length) {
          violations.push({
            file: file.file,
            line: row.line,
            message: `셀 ${row.cells.length}개, 머리 행은 ${table.header.length}개. 셀 안의 |는 \\|로 쓴다`,
          })
        }
      }
    }
  }
  return violations
}

export function checkPlaceholders(tree: ResearchTree): Violation[] {
  const violations: Violation[] = []
  for (const file of all(tree)) {
    file.prose.forEach((line, i) => {
      const left = line.match(/<(?!!)[^<>\n]*[가-힣…][^<>\n]*>|YYYY-MM-DD/)
      if (left) violations.push({ file: file.file, line: i + 1, message: `남은 자리: ${left[0]}` })
    })
  }
  return violations
}

export interface Source {
  id: string
  line: number
  primary: boolean
}

// 같은 URL로 볼 꼴: `#` 뒤 조각과 끝의 `/`를 뗀다.
const normalizeUrl = (url: string) => url.replace(/#.*$/, "").replace(/\/+$/, "")

export function loadSources(tree: ResearchTree): {
  sources: Map<string, Source>
  violations: Violation[]
} {
  const sources = new Map<string, Source>()
  const violations: Violation[] = []
  const file = tree.sources
  if (!file) {
    return { sources, violations: [{ file: SOURCES_FILE, message: "출처 목록이 없다" }] }
  }
  const tables = file.tables.filter((table) => sameHeader(table.header, SOURCE_HEADER))
  if (tables.length !== 1) {
    violations.push({
      file: file.file,
      message: `머리 행이 | ${SOURCE_HEADER.join(" | ")} |인 표가 하나여야 한다(${tables.length}개)`,
    })
    return { sources, violations }
  }
  const urls = new Map<string, string>()
  for (const { line, cells } of tables[0].rows) {
    if (cells.length !== SOURCE_HEADER.length) continue // 표 검사가 알린다
    const [id, title, url, edition, read, kind] = cells
    const flag = (message: string) => violations.push({ file: file.file, line, message })
    if (!/^S\d+$/.test(id)) flag(`ID는 S 뒤에 숫자여야 한다: ${id}`)
    else if (sources.has(id)) flag(`${id}: ID가 ${sources.get(id)!.line}줄에도 있다`)
    if (!title) flag(`${id}: 제목이 비었다`)
    if (!/^https?:\/\/\S+$/.test(url)) flag(`${id}: URL이 http(s) 주소가 아니다`)
    else {
      const key = normalizeUrl(url)
      const other = urls.get(key)
      if (other) flag(`${id}: ${other}의 URL과 같다. 한 URL은 한 ID로만 등록한다`)
      else urls.set(key, id)
    }
    if (!edition) flag(`${id}: 판이 비었다. 판이 없으면 없음`)
    if (!isDate(read)) flag(`${id}: 읽은 날이 YYYY-MM-DD 꼴의 날짜가 아니다: ${read || "(빈칸)"}`)
    if (kind !== "1차" && kind !== "2차")
      flag(`${id}: 종류는 1차나 2차여야 한다: ${kind || "(빈칸)"}`)
    if (/^S\d+$/.test(id) && !sources.has(id))
      sources.set(id, { id, line, primary: kind === "1차" })
  }
  return { sources, violations }
}

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

export function checkClaims(tree: ResearchTree, sources: Map<string, Source>): Violation[] {
  const violations: Violation[] = []
  for (const record of tree.records) {
    const flag = (message: string, line?: number) =>
      violations.push({ file: record.file, line, message })
    if (!record.prose.some((line) => /^# \S/.test(line))) flag("제목(# 질문)이 없다", 1)
    const tables = record.tables.filter((table) => sameHeader(table.header, CLAIM_HEADER))
    if (tables.length !== 1) {
      flag(
        `머리 행이 | ${CLAIM_HEADER.join(" | ")} |인 주장 표가 하나여야 한다(${tables.length}개)`,
      )
      continue
    }
    const [table] = tables
    if (table.rows.length === 0) flag("주장이 없다", table.line)
    const ids = new Map<string, number>()
    for (const { line, cells } of table.rows) {
      if (cells.length !== CLAIM_HEADER.length) continue // 표 검사가 알린다
      const [id, claim, cited, quote, confidence] = cells
      const at = (message: string) => flag(`${id}: ${message}`, line)
      if (!/^C\d+$/.test(id)) flag(`ID는 C 뒤에 숫자여야 한다: ${id}`, line)
      else if (ids.has(id)) at(`${ids.get(id)}줄에도 있다`)
      else ids.set(id, line)
      if (!claim) at("주장이 비었다")
      if (!["H", "M", "U"].includes(confidence)) {
        at(`신뢰도는 H, M, U 가운데 하나여야 한다: ${confidence || "(빈칸)"}`)
        continue
      }
      if (/https?:\/\//.test(cited)) {
        at("출처 칸에 URL이 있다. 출처 목록에 등록하고 ID로 쓴다")
        continue
      }
      const citedIds = [...cited.matchAll(/\bS\d+\b/g)].map((match) => match[0])
      if (cited && citedIds.length === 0) at("출처 칸에 출처 ID가 없다")
      const unknown = citedIds.filter((source) => !sources.has(source))
      if (unknown.length > 0) at(`출처 목록에 없는 ID: ${unknown.join(", ")}`)
      if (citedIds.length === 0 && confidence !== "U")
        at(`출처 없는 주장은 U만 된다(${confidence})`)
      if (confidence === "H") {
        const known = citedIds.filter((source) => sources.has(source))
        if (known.length > 0 && !known.some((source) => sources.get(source)!.primary)) {
          at("H인데 2차 출처만 인용했다")
        }
        if (!quote) at("H인데 인용이 비었다")
      }
    }
  }
  return violations
}
