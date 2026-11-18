import fs from "node:fs"
import path from "node:path"
import { delimiterRow, unescapedPipe } from "../check-content/source-checks"
import type { Violation } from "../check-content/tree"

// 하네스 조사 기록과 출처 목록의 검사. 규칙은 docs/research/README.md에 있다.

interface Table {
  line: number // 머리 행의 줄 번호
  header: string[]
  rows: { line: number; cells: string[] }[]
}

interface ResearchFile {
  file: string // 검사 루트 기준 경로
  tables: Table[]
  // HTML 주석을 공백으로, 코드 블록 안의 줄을 빈 문자열로 지운 본문. 줄 번호는 원본과 같다.
  prose: string[]
}

export interface ResearchTree {
  sources: ResearchFile | undefined
  records: ResearchFile[]
}

interface Source {
  line: number
  primary: boolean
}

const SOURCES_FILE = "sources.md"
const NOT_RECORDS = new Set(["README.md", SOURCES_FILE])
const SOURCE_HEADER = ["ID", "제목", "URL", "판", "읽은 날", "종류"]
const CLAIM_HEADER = ["ID", "주장", "출처", "인용", "신뢰도"]
const SOURCE_ID = /\bS\d+\b/g
const CLAIM_ID = /\bC\d+\b/g
const isSourceId = (id: string) => /^S\d+$/.test(id)
const isClaimId = (id: string) => /^C\d+$/.test(id)
const idsIn = (text: string, pattern: RegExp) => [...text.matchAll(pattern)].map((m) => m[0])

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

function parseFile(file: string, source: string): ResearchFile {
  const prose: string[] = []
  let fence: string | undefined
  const uncommented = source.replace(/<!--[\s\S]*?-->/g, (comment) =>
    comment.replace(/[^\n]/g, " "),
  )
  for (const line of uncommented.split("\n")) {
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
  return { file, tables: parseTables(prose), prose }
}

// 머리 행 다음 줄이 구분 행인 `|` 줄의 묶음을 표로 읽는다.
function parseTables(prose: string[]): Table[] {
  const tables: Table[] = []
  const isRow = (line: string | undefined) => line !== undefined && /^\s*\|/.test(line)
  const isDelimiter = (line: string | undefined) =>
    line !== undefined && delimiterRow.test(line.trim())
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
function splitCells(line: string): string[] {
  const pipe = new RegExp(unescapedPipe.source, "g")
  const cells = line
    .trim()
    .replace(/^\|/, "")
    .replace(new RegExp(`${unescapedPipe.source}$`), "")
    .split(pipe)
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

// 남은 자리로 보지 않는 `<…>`: 자동 링크와 본문에 쓸 만한 HTML 태그.
const notPlaceholder =
  /^<(https?:\/\/|mailto:|\/?(a|abbr|b|br|code|del|details|em|i|img|kbd|mark|small|span|strong|sub|summary|sup|u)(\s[^<>]*)?\/?>$)/i

export function checkPlaceholders(tree: ResearchTree): Violation[] {
  const violations: Violation[] = []
  for (const file of all(tree)) {
    file.prose.forEach((line, i) => {
      const text = line.replace(/(`+)[^`]*?\1/g, "") // 코드 스팬은 보지 않는다
      const left = [...text.matchAll(/<[^<>\n]+>|YYYY-MM-DD/g)]
        .map((m) => m[0])
        .filter((match) => !notPlaceholder.test(match))
      for (const match of left) {
        violations.push({ file: file.file, line: i + 1, message: `남은 자리: ${match}` })
      }
    })
  }
  return violations
}

// 같은 URL로 볼 꼴: 스킴과 호스트의 대소문자, http와 https, `#` 뒤 조각, 끝의 `/`를 가리지 않는다.
function normalizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\/[^/?#]+/i, (origin) => origin.toLowerCase().replace(/^http:/, "https:"))
    .replace(/#.*$/, "")
    .replace(/\/+$/, "")
}

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
    if (!isSourceId(id)) flag(`ID는 S 뒤에 숫자여야 한다: ${id || "(빈칸)"}`)
    else if (sources.has(id)) flag(`${id}: ID가 ${sources.get(id)!.line}줄에도 있다`)
    if (!title) flag(`${id}: 제목이 비었다`)
    if (!/^https?:\/\/\S+$/i.test(url)) flag(`${id}: URL이 http(s) 주소가 아니다`)
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
    if (isSourceId(id) && !sources.has(id)) sources.set(id, { line, primary: kind === "1차" })
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
      if (!isClaimId(id)) flag(`ID는 C 뒤에 숫자여야 한다: ${id || "(빈칸)"}`, line)
      else if (ids.has(id)) at(`${ids.get(id)}줄에도 있다`)
      else ids.set(id, line)
      if (!claim) at("주장이 비었다")
      if (!["H", "M", "U"].includes(confidence)) {
        at(`신뢰도는 H, M, U 가운데 하나여야 한다: ${confidence || "(빈칸)"}`)
        continue
      }
      if (/https?:\/\//i.test(cited)) {
        at("출처 칸에 URL이 있다. 출처 목록에 등록하고 ID로 쓴다")
        continue
      }
      const parts = cited ? cited.split(";").map((part) => part.trim()) : []
      if (parts.some((part) => !/^S\d+\b/.test(part) || idsIn(part, SOURCE_ID).length !== 1)) {
        at("출처는 ID 하나와 그 자리씩 ;로 가른다. 예: S101 §2; S102")
      }
      const citedIds = idsIn(cited, SOURCE_ID)
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
    for (const other of record.tables) {
      if (other === table) continue
      if (other.header.some((cell) => cell === "출처" || cell === "신뢰도")) {
        flag("출처나 신뢰도 열은 주장 표에만 둔다. 주장은 주장 표에 쓴다", other.line)
        continue
      }
      for (const { line, cells } of other.rows) {
        const refs = idsIn(cells.join(" "), CLAIM_ID)
        const unknown = refs.filter((ref) => !ids.has(ref))
        if (refs.length === 0) flag("주장 표 밖의 표는 행마다 근거인 주장 ID를 가리킨다", line)
        else if (unknown.length > 0) flag(`주장 표에 없는 주장 ID: ${unknown.join(", ")}`, line)
      }
    }
  }
  return violations
}
