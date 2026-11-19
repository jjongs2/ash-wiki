import fs from "node:fs"
import path from "node:path"
import type { Violation } from "../check-content/tree"

// 결정 로그 안의 검사. 꼴은 docs/decision-log.md 머리에 있다.

const LOG_FILE = "docs/decision-log.md"
const ADR_DIR = "docs/adr"
const SECTION = "## 항목"
const FIELDS = ["채택", "보류", "기각", "까닭", "규칙", "근거", "대체"] as const
type Field = (typeof FIELDS)[number]
const HEAD = /^### (\S+)(?: \((D\d+|ADR \d+)[이가] 대체\))?(?: (.*))?$/
const FIELD = /^- ([^:]+): ([\s\S]*)$/
const LINK = /\[[^\]]+\]\([^)]+\)/
const SECTION_LINK = /\[[^\]]+\]\([^)#]*#[^)]+\)/
const withoutCode = (text: string) => text.replace(/(`+)[^`]*?\1/g, "")
const idList = (value: string | undefined) => value?.split(",").map((id) => id.trim()) ?? []

interface Item {
  id: string
  line: number
  replacedBy?: string // 제목의 (D<m>이 대체)나 (ADR <n>이 대체)
  fields: Map<Field, string>
}

export function checkDecisionLog(root: string): Violation[] {
  const violations: Violation[] = []
  const flag = (message: string, line?: number) =>
    violations.push({ file: LOG_FILE, line, message })
  const file = path.join(root, LOG_FILE)
  if (!fs.existsSync(file)) return [{ file: LOG_FILE, message: "결정 로그가 없다" }]
  const lines = fs
    .readFileSync(file, "utf8")
    .replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, " "))
    .split("\n")

  const start = lines.indexOf(SECTION)
  if (start < 0) {
    flag(`${SECTION} 절이 없다`)
    return violations
  }
  // 항목 절의 ### 제목 하나가 항목 하나이고, 그 아래 불릿 하나가 필드 하나다. 들여 쓴 줄은 그 필드에 이어진다.
  const raw: { line: number; head: string; fields: { line: number; text: string }[] }[] = []
  let fence: string | undefined
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1]
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = undefined
      continue
    }
    if (marker) {
      fence = marker
      continue
    }
    if (/^#{1,2} /.test(line)) break
    if (line.trim() === "") continue
    const item = raw[raw.length - 1]
    const field = item?.fields[item.fields.length - 1]
    if (line.startsWith("### ")) raw.push({ line: i + 1, head: line, fields: [] })
    else if (line.startsWith("- ") && item) item.fields.push({ line: i + 1, text: line })
    else if (/^\s/.test(line) && field) field.text += `\n${line.trim()}`
    else flag("항목 절에는 ### 항목 제목과 그 아래 필드 불릿만 둔다", i + 1)
  }

  const items: Item[] = []
  const byId = new Map<string, Item>()
  for (const { line, head: headLine, fields: fieldLines } of raw) {
    const at = (message: string) => flag(message, line)
    const head = headLine.match(HEAD)
    const [, id, replacedBy, name] = head ?? []
    if (!head || !/^D\d+$/.test(id)) {
      at(`항목 제목은 D 뒤에 숫자인 ID로 시작한다${id ? `: ${id}` : ""}`)
      continue
    }
    if (!name?.trim()) at(`${id}: 제목에 이름이 없다`)
    const fields = new Map<Field, string>()
    for (const { line: fieldLine, text } of fieldLines) {
      const match = text.match(FIELD)
      const label = match?.[1] as Field | undefined
      if (!match || !FIELDS.includes(label!)) {
        flag(`${id}: 필드는 ${FIELDS.join("·")} 가운데 하나다`, fieldLine)
        continue
      }
      if (fields.has(label!)) at(`${id}: ${label} 필드가 둘이다`)
      else fields.set(label!, match[2].trim().replace(/\.$/, ""))
    }
    const item: Item = { id, line, replacedBy, fields }
    const other = byId.get(id)
    if (other) at(`${id}: ${other.line}줄에도 있다. 나중에 머지하는 쪽이 번호를 고친다`)
    else byId.set(id, item)
    items.push(item)

    if (!fields.get("채택") && !fields.get("보류") && !fields.get("기각")) {
      at(`${id}: 결정이 비었다. 채택·보류·기각 가운데 하나 이상을 쓴다`)
    } else if (!fields.get("보류") && !fields.get("기각")) {
      at(`${id}: 버린 대안이 없다. 기각이나 보류로 적는다`)
    }
    for (const name of ["까닭", "규칙", "근거"] as const) {
      if (!fields.get(name)) at(`${id}: 빠진 필드: ${name}`)
    }
    const rule = fields.get("규칙")
    if (rule && rule !== "없음" && !SECTION_LINK.test(withoutCode(rule))) {
      at(`${id}: 규칙은 절(#앵커) 링크나 없음이다`)
    }
    const basis = fields.get("근거")
    if (basis && !/#\d+/.test(withoutCode(basis)) && !LINK.test(withoutCode(basis))) {
      at(`${id}: 근거는 PR, 이슈(#n), 조사 기록 링크 가운데 하나 이상이다`)
    }
  }

  // 대체 짝: 새 항목의 `대체: D<n>`과 옛 항목 제목의 `(D<m>이 대체)`가 서로를 가리킨다.
  const adrs = fs.existsSync(path.join(root, ADR_DIR))
    ? fs.readdirSync(path.join(root, ADR_DIR))
    : []
  for (const item of items) {
    const at = (message: string) => flag(`${item.id}: ${message}`, item.line)
    const replaces = item.fields.get("대체")
    if (replaces !== undefined) {
      for (const id of idList(replaces)) {
        const old = byId.get(id)
        if (!/^D\d+$/.test(id)) at(`대체는 D<n>을 쉼표로 가른다: ${id || "(빈칸)"}`)
        else if (id === item.id) at("자기를 대체한다")
        else if (!old) at(`대체한 항목이 없다: ${id}`)
        else if (old.replacedBy !== item.id) at(`${id}의 제목에 (${item.id}이 대체)가 없다`)
      }
    }
    const by = item.replacedBy
    if (!by) continue
    if (by.startsWith("ADR ")) {
      const number = by.slice(4).padStart(4, "0")
      if (!adrs.some((name) => name.startsWith(`${number}-`))) at(`대체한 ADR이 없다: ${by}`)
      continue
    }
    const newer = byId.get(by)
    if (!newer) at(`대체한 항목이 없다: ${by}`)
    else if (!idList(newer.fields.get("대체")).includes(item.id))
      at(`${by}에 대체: ${item.id} 필드가 없다`)
  }
  return violations
}
