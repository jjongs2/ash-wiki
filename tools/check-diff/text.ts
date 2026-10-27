import path from "node:path"
import { fieldsOf, type Page, type Tree } from "../check-content/tree"
import { tableLines } from "../check-content/source-checks"

// 문장에서 표준 원문을 가리키는 표준 기구와 발행기관의 이름.
export const standardBodies = "ISO|IEC|IEEE|SAE|AUTOSAR|RFC|ITU-T|Bosch|OSEK|POSIX"

// 줄 번호와 오프셋을 서로 바꾼다. 줄 번호는 1부터 센다.
export function lineStarts(text: string): number[] {
  const starts = [0]
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1)
  return starts
}

export function lineAt(starts: number[], offset: number): number {
  let low = 0
  let high = starts.length - 1
  while (low < high) {
    const mid = (low + high + 1) >> 1
    if (starts[mid] <= offset) low = mid
    else high = mid - 1
  }
  return low + 1
}

export interface Sentence {
  text: string
  start: number // 받은 글 안의 오프셋
}

// 문장 끝은 마침표·물음표·느낌표 뒤에 공백, 줄 끝, 인용이 오는 자리다. 뒤따르는 인용은 그 문장에 붙인다.
// 소수점(1.0)은 뒤에 숫자가 와서 문장 끝이 아니다.
export function sentences(text: string): Sentence[] {
  const found: Sentence[] = []
  let start = 0
  const end = /[.?!](?=\s|$|\[@)((?:\[@[^\]\n]*\])*)/g
  for (const match of text.matchAll(end)) {
    const stop = match.index + match[0].length
    pushSentence(found, text, start, stop)
    start = stop
  }
  pushSentence(found, text, start, text.length)
  return found
}

function pushSentence(found: Sentence[], text: string, from: number, to: number) {
  const raw = text.slice(from, to)
  const lead = raw.length - raw.trimStart().length
  const trimmed = raw.trim()
  if (trimmed) found.push({ text: trimmed, start: from + lead })
}

export type BlockKind =
  "heading" | "paragraph" | "table" | "list" | "callout" | "embed" | "math" | "other"

export interface Block {
  kind: BlockKind
  start: number // 첫 줄
  end: number // 끝 줄
  text: string // 원문
}

// 맨 위 블록. 목록은 통째로, 콜아웃(인용 블록)도 통째로 블록 하나다. 검사기의 mdast는 GFM 표를 읽지 않아
// 표를 문단으로 잡으므로, 표의 줄로 시작하는 문단은 표로 본다.
export function blocks(page: Page): Block[] {
  const rows = tableLines(page)
  const sourceLines = page.source.split("\n")
  return page.mdast.children.map((node) => {
    const start = node.position!.start.line
    const end = node.position!.end.line
    const text = sourceLines.slice(start - 1, end).join("\n")
    let kind: BlockKind = "other"
    if (node.type === "heading") kind = "heading"
    else if (node.type === "list") kind = "list"
    else if (node.type === "blockquote") kind = "callout"
    else if (node.type === "paragraph") {
      const trimmed = text.trim()
      if (rows.has(start)) kind = "table"
      else if (/^!\[\[[^\]]+\]\]$/.test(trimmed)) kind = "embed"
      else if (trimmed.startsWith("$$")) kind = "math"
      else kind = "paragraph"
    }
    return { kind, start, end, text }
  })
}

export const touches = (block: Block, added: Set<number>) => {
  for (let line = block.start; line <= block.end; line++) if (added.has(line)) return true
  return false
}

// 한 줄로 줄여 보인다.
export function excerpt(text: string, max = 80): string {
  const flat = text.replace(/\s+/g, " ").trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

export function listNames(names: string[], max = 6): string {
  const shown = names.slice(0, max).join(", ")
  return names.length > max ? `${shown} 외 ${names.length - max}` : shown
}

// 두 글이 얼마나 같은지(0~1). 공백과 문장 부호, 인용, 위키링크 대상을 빼고 글자 2-gram의 Dice 계수로 잰다.
export function similarity(a: string, b: string): number {
  const gramsA = bigrams(a)
  const gramsB = bigrams(b)
  if (gramsA.size === 0 || gramsB.size === 0) return 0
  let shared = 0
  for (const gram of gramsA) if (gramsB.has(gram)) shared++
  return (2 * shared) / (gramsA.size + gramsB.size)
}

function bigrams(text: string): Set<string> {
  const plain = text
    .replace(/\[@[^\]\n]*\]/g, "")
    .replace(/\[\[[^\]|\n]*\\?\|/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
  const grams = new Set<string>()
  for (let i = 0; i + 1 < plain.length; i++) grams.add(plain.slice(i, i + 2))
  return grams
}

// 줄의 문장마다 그 문장을 뒷받침하는 인용 키. 같은 출처가 이어지는 문장은 마지막 문장에만 인용을 달므로,
// 인용 없는 문장은 같은 줄에서 뒤따르는 인용의 키를 받는다.
export function citedSentences(text: string): { text: string; keys: string[] }[] {
  const list = sentences(text).map((sentence) => ({
    text: sentence.text,
    keys: [...sentence.text.matchAll(/\[@([^\]\s]+)\]/g)].map((m) => m[1]),
  }))
  for (let i = list.length - 2; i >= 0; i--) {
    if (list[i].keys.length === 0) list[i].keys = list[i + 1].keys
  }
  return list
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export const blank = (text: string) => text.replace(/[^\n]/g, " ")
export const latinEdge = /[A-Za-z0-9]/

// 이름과 표기를 찾을 때 보지 않는 곳: 도해, 식, 인용, URL, HTML. 줄 번호와 오프셋을 원문과 맞추려고
// 공백으로 바꾼다.
export function maskRefs(text: string): string {
  return text
    .replace(/!\[\[[^\]\n]*\]\]/g, blank)
    .replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g, blank)
    .replace(/\[@[^\]\n]*\]/g, blank)
    .replace(/https?:\/\/\S+/g, blank)
    .replace(/<[^>\n]+>/g, blank)
}

// 절 제목 줄의 수준과 제목.
export const heading = (line: string) => line.match(/^(#{1,6}) (.*)$/)

// 머리말(anchor가 없을 때)이나 제목이 anchor인 절(그 아래 절까지)의 줄 범위. 끝은 들지 않는다. 절 제목은
// 글자 그대로 맞추고, 못 찾으면 undefined다.
function sectionRange(
  lines: string[],
  anchor: string | undefined,
): { start: number; end: number } | undefined {
  let start = 0
  let level = 0
  if (anchor !== undefined) {
    start = lines.findIndex((line) => heading(line)?.[2].trim() === anchor.trim())
    if (start < 0) return undefined
    level = heading(lines[start])![1].length
  }
  let end = start + 1
  while (end < lines.length) {
    const next = heading(lines[end])
    if (next && (level === 0 || next[1].length <= level)) break
    end++
  }
  return { start, end }
}

// 위키링크를 링크 글자로 바꾼다.
export const linkDisplays = (text: string) =>
  text.replace(/\[\[(?:[^\]\n|]*\\?\|)?([^\]\n]*)\]\]/g, "$1")

// 위키링크 대상(슬러그나 폴더를 뺀 이름)의 페이지.
export function linkedPage(tree: Tree, target: string): Page | undefined {
  const name = target.trim()
  return tree.pages.find((p) => p.name === name || path.basename(p.name) === name)
}

// 페이지의 머리말이나 제목이 anchor인 절. lines는 페이지의 줄(maskRefs를 거친 것)이고, text는 그 절의 글을
// 위키링크를 링크 글자로 바꿔 이은 것이다. 절을 못 찾으면 range가 없고 text는 빈 글이다.
export function anchorSection(page: Page, anchor: string | undefined) {
  const lines = maskRefs(page.masked).split("\n")
  const range = sectionRange(lines, anchor)
  const text = range ? linkDisplays(lines.slice(range.start, range.end).join("\n")) : ""
  return { lines, range, text }
}

// 영문 낱말 바로 뒤의 한글 없는 괄호. 약어나 이름의 풀이다. 예: `GMII(Gigabit Media Independent Interface)`
export const latinGloss = /(?<=[A-Za-z0-9]\**)\([^()\n가-힣]*\)/g

// 겹친 일치 가운데 더 긴 일치에 든 것을 뺀다.
export function dropCovered<T extends { start: number; end: number }>(list: T[]): T[] {
  return list.filter((hit) =>
    list.every(
      (other) =>
        other === hit ||
        !(other.start <= hit.start && hit.end <= other.end) ||
        other.end - other.start <= hit.end - hit.start,
    ),
  )
}

// 페이지의 title과 aliases.
export function pageNames(page: Page): string[] {
  const fields = fieldsOf(page)
  const aliases = Array.isArray(fields.aliases) ? fields.aliases : []
  return [fields.title, ...aliases].filter(
    (name): name is string => typeof name === "string" && name.length >= 2,
  )
}
