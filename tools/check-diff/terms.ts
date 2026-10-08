import fs from "node:fs"
import path from "node:path"
import { fieldsOf, type Page } from "../check-content/tree"
import { repoRoot } from "../repo"
import type { Candidate, Context } from "./items"
import { blank, dropCovered, escapeRegExp, excerpt, latinEdge, maskRefs } from "./text"

// 용어: 용어 표기 결정 목록에서 조건이 없는 결정 줄의 쓰지 않는 표기. 조건이 붙은 결정은 문맥으로만 가려져
// 패턴으로 찾으면 오탐이 많다.
const termsPath = path.join(repoRoot, "docs", "wiki-terms.md")

export interface TermDecision {
  used: string
  unused: string
  ref: string
}

// `- <쓰는 표기>: <쓰지 않는 표기> (#<번호>)` 꼴의 줄만 읽는다. 풀이 줄(`<약어> 풀이 <풀이>`)의 쓰지 않는
// 표기는 풀이 하나라 쉼표로 가르지 않는다.
export function termDecisions(text: string): TermDecision[] {
  return [...text.matchAll(/^- (.+?): (.+) \((#\d+(?:, #\d+)*)\)$/gm)].flatMap(
    ([, used, unused, ref]) => {
      if (unused === "-" || unused === "통일하지 않음") return []
      const explanation = used.match(/^\S+ 풀이 (.+)$/)
      const list = explanation ? [unused] : unused.split(", ")
      return list.map((u) => ({ used: explanation?.[1] ?? used, unused: u, ref }))
    },
  )
}

// 표기를 찾을 글. 위키링크는 표시 글자만 남긴다.
function termText(text: string): string {
  return maskRefs(text)
    .replace(/\[\[(?:[^\]\n|]*\\?\|)?/g, blank)
    .replace(/\]\]/g, blank)
}

// 인용한 문서 제목은 원문 그대로 쓰므로 큰따옴표 안은 보지 않는다.
const quoted = /"[^"\n]*"|“[^”\n]*”/g

export const termItem = ({ changed }: Context): Candidate[] => {
  const decisions = termDecisions(fs.readFileSync(termsPath, "utf8")).map((decision) => {
    const start = latinEdge.test(decision.unused[0]) ? "(?<![A-Za-z0-9])" : ""
    const end = latinEdge.test(decision.unused.at(-1)!) ? "(?![A-Za-z0-9])" : ""
    const flags = /[A-Za-z]/.test(decision.unused) ? "gi" : "g"
    return { ...decision, pattern: new RegExp(start + escapeRegExp(decision.unused) + end, flags) }
  })
  return changed.flatMap(({ page, change }) => {
    const texts: { line: number; text: string }[] = []
    const lines = termText(page.masked).split("\n")
    for (const line of change.added)
      if (lines[line - 1]?.trim()) texts.push({ line, text: lines[line - 1] })
    const title = fieldsOf(page).title
    if (typeof title === "string" && "lineOf" in page.frontmatter) {
      const line = page.frontmatter.lineOf("title")
      if (change.added.has(line)) texts.push({ line, text: title })
    }
    return texts.flatMap(({ line, text }) => unusedTerms(page, line, text, decisions))
  })
}

function unusedTerms(
  page: Page,
  line: number,
  text: string,
  decisions: (TermDecision & { pattern: RegExp })[],
): Candidate[] {
  const quotes = [...text.matchAll(quoted)].map((m) => [m.index, m.index + m[0].length])
  const hits: { start: number; end: number; decision: TermDecision }[] = []
  for (const decision of decisions) {
    for (const match of text.matchAll(decision.pattern)) {
      const start = match.index
      const end = start + match[0].length
      if (quotes.some(([s, e]) => start >= s && end <= e)) continue
      if (glossed(text, start, decision.used)) continue
      hits.push({ start, end, decision })
    }
  }
  // "문맥 전환" 안의 "문맥"처럼 더 긴 표기에 든 일치는 그 표기 하나로 센다. 한 줄의 같은 표기는 한 번 찍는다.
  const seen = new Set<string>()
  return dropCovered(hits)
    .sort((a, b) => a.start - b.start)
    .filter(({ decision }) => !seen.has(decision.unused) && !!seen.add(decision.unused))
    .map(({ start, end, decision }) => ({
      file: page.file,
      line,
      message: `쓰지 않는 표기 "${text.slice(start, end)}" → "${decision.used}" (${decision.ref}): ${excerpt(text)}`,
    }))
}

// 쓰는 표기 바로 뒤 괄호 안의 원어 병기. 쓰는 표기가 든 합성어 뒤도 본다. 예:
// `사이버보안 속성(cybersecurity property)`, `프로세스 자산 라이브러리(process asset library)`
const glossWindow = 20
function glossed(text: string, start: number, used: string): boolean {
  const open = text.lastIndexOf("(", start)
  if (open < 0 || text.slice(open, start).includes(")")) return false
  const before = text.slice(0, open).replace(/[\s*]+$/, "")
  return before.slice(-(glossWindow + used.length)).includes(used)
}
