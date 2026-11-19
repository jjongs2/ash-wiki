import fs from "node:fs"
import path from "node:path"
import type { Violation } from "../check-content/tree"

// 결정 로그 안의 검사. 꼴은 docs/decision-log.md 머리에 있다.

export const LOG_FILE = "docs/decision-log.md"
const ADR_DIR = "docs/adr"
const SECTION = "## 항목"
const FIELDS = ["버린 것", "까닭", "규칙", "근거", "대체"] as const
type Field = (typeof FIELDS)[number]
// 필드 이름은 줄 머리나 문장 끝(". ") 뒤에서만 읽는다. "원래 까닭:" 같은 말을 필드로 읽지 않기 위해서다.
const FIELD = new RegExp(`(?:^|\\. )(${FIELDS.join("|")}): `, "gm")
const HEAD = /^- (\S+)(?: \((D\d+|ADR \d+)[이가] 대체\))? ?(.*)$/

interface Item {
  id: string
  line: number
  replacedBy?: string // 머리의 (D<m>이 대체)나 (ADR <n>이 대체)
  decision: string
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
  // 항목 절의 불릿 하나가 항목 하나이고, 들여 쓴 줄은 그 항목에 이어진다.
  const raw: { line: number; text: string[] }[] = []
  let fence: string | undefined
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1]
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
    if (line.startsWith("- ")) raw.push({ line: i + 1, text: [line] })
    else if (/^\s/.test(line) && raw.length > 0) raw[raw.length - 1].text.push(line.trim())
    else flag("항목 절에는 항목 불릿만 둔다", i + 1)
  }

  const items: Item[] = []
  const byId = new Map<string, Item>()
  for (const { line, text } of raw) {
    const at = (message: string) => flag(message, line)
    const head = text[0].match(HEAD)
    if (!head) {
      at("항목은 D 뒤에 숫자인 ID로 시작한다")
      continue
    }
    const [, id, replacedBy, first] = head
    if (!/^D\d+$/.test(id)) {
      at(`항목은 D 뒤에 숫자인 ID로 시작한다: ${id}`)
      continue
    }
    const body = [first, ...text.slice(1)].join("\n")
    const labels = [...body.matchAll(FIELD)]
    const decision = body.slice(0, labels[0]?.index ?? body.length).trim()
    const fields = new Map<Field, string>()
    labels.forEach((label, i) => {
      const name = label[1] as Field
      const from = label.index! + label[0].length
      const value = body.slice(from, labels[i + 1]?.index ?? body.length).trim()
      if (fields.has(name)) at(`${id}: ${name} 필드가 둘이다`)
      else fields.set(name, value.replace(/\.$/, ""))
    })
    const item: Item = { id, line, replacedBy, decision, fields }
    const other = byId.get(id)
    if (other) at(`${id}: ${other.line}줄에도 있다. 나중에 머지하는 쪽이 번호를 고친다`)
    else byId.set(id, item)
    items.push(item)

    if (!decision) at(`${id}: 결정이 비었다`)
    for (const name of ["까닭", "규칙", "근거"] as const) {
      if (!fields.get(name)) at(`${id}: 빠진 필드: ${name}`)
    }
    if (!fields.get("버린 것") && !/(^|\. )기각: /.test(decision)) {
      at(`${id}: 빠진 필드: 버린 것. 결정에 기각: 구절이 있으면 그것이 대신한다`)
    }
    const rule = fields.get("규칙")
    if (rule && rule !== "없음" && !/\[[^\]]+\]\([^)]+\)/.test(rule)) {
      at(`${id}: 규칙은 절 링크나 없음이다`)
    }
    const basis = fields.get("근거")
    if (basis && !/#\d+|\[[^\]]+\]\([^)]+\)/.test(basis)) {
      at(`${id}: 근거는 PR, 이슈(#n), 조사 기록 링크 가운데 하나 이상이다`)
    }
  }

  // 대체 짝: 새 항목의 `대체: D<n>`과 옛 항목 머리의 `(D<m>이 대체)`가 서로를 가리킨다.
  const adrs = fs.existsSync(path.join(root, ADR_DIR))
    ? fs.readdirSync(path.join(root, ADR_DIR))
    : []
  for (const item of items) {
    const at = (message: string) => flag(`${item.id}: ${message}`, item.line)
    const replaces = item.fields.get("대체")
    if (replaces !== undefined) {
      const ids = replaces.split(",").map((id) => id.trim())
      for (const id of ids) {
        const old = byId.get(id)
        if (!/^D\d+$/.test(id)) at(`대체는 D<n>을 쉼표로 가른다: ${id || "(빈칸)"}`)
        else if (id === item.id) at("자기를 대체한다")
        else if (!old) at(`대체한 항목이 없다: ${id}`)
        else if (old.replacedBy !== item.id) at(`${id}의 머리에 (${item.id}이 대체)가 없다`)
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
    const listed = newer?.fields
      .get("대체")
      ?.split(",")
      .map((id) => id.trim())
    if (!newer) at(`대체한 항목이 없다: ${by}`)
    else if (!listed?.includes(item.id)) at(`${by}에 대체: ${item.id} 필드가 없다`)
  }
  return violations
}
