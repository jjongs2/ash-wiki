import fs from "node:fs"
import path from "node:path"
import { fieldsOf, type Page } from "../check-content/tree"
import { repoRoot } from "../repo"
import type { Candidate, Context } from "./items"
import { blank, dropCovered, escapeRegExp, excerpt, latinEdge, maskRefs } from "./text"

// 용어: 용어 표기 결정 목록과 `--ticket`의 `## 표기 결정` 절의 쓰지 않는 표기. 티켓의 결정은 그 PR이 목록에
// 더하기 전이라 목록만 보면 놓친다. 조건이 붙은 결정은 문맥으로만 가려져 패턴으로는 어긴 곳인지 알 수
// 없으므로, 결정의 조건과 함께 "조건 확인" 후보로 따로 찍는다.
const termsPath = path.join(repoRoot, "docs", "wiki-terms.md")

export interface TermDecision {
  used: string
  unused: string
  ref: string
  condition?: string // 결정 줄 끝의 조건이나 예외
}

// `- <쓰는 표기>: <쓰지 않는 표기> (#<번호>)` 꼴의 줄과, 그 뒤에 `. <조건이나 예외>`가 붙은 줄을 읽는다. 풀이
// 줄(`<약어> 풀이 <풀이>`)의 쓰지 않는 표기는 풀이 하나라 쉼표로 가르지 않는다.
export function termDecisions(text: string): TermDecision[] {
  return [...text.matchAll(/^- (.+?): (.+?) \((#\d+(?:, #\d+)*)\)(?:\. (.+))?$/gm)].flatMap(
    ([, used, unused, ref, condition]) => {
      if (unused === "-" || unused === "통일하지 않음") return []
      const explanation = used.match(/^\S+ 풀이 (.+)$/)
      const list = explanation ? [unused] : unused.split(", ")
      return list.map((u) => ({ used: explanation?.[1] ?? used, unused: u, ref, condition }))
    },
  )
}

// 티켓 본문의 `## 표기 결정` 절에 든 결정 줄. 줄 끝의 `. 적용할 페이지: …`는 결정의 조건이 아니라 지운다.
export function ticketDecisions(body: string | undefined): TermDecision[] {
  const section = body?.match(/^## 표기 결정[ \t]*$([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1]
  if (!section) return []
  return termDecisions(section.replace(/\. 적용할 페이지: .*$/gm, ""))
}

// 표기를 찾을 글. 위키링크는 표시 글자만 남긴다.
function termText(text: string): string {
  return maskRefs(text)
    .replace(/\[\[(?:[^\]\n|]*\\?\|)?/g, blank)
    .replace(/\]\]/g, blank)
}

// 인용한 문서 제목은 원문 그대로 쓰므로 큰따옴표 안은 보지 않는다.
const quoted = /"[^"\n]*"|“[^”\n]*”/g

export const termItem = ({ changed, ticketBody }: Context): Candidate[] => {
  const decisions = [
    ...termDecisions(fs.readFileSync(termsPath, "utf8")),
    ...ticketDecisions(ticketBody),
  ].map((decision) => {
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
      // 대소문자만 다른 결정은 대소문자를 무시하고 찾으므로, 쓰는 표기 그대로인 글은 넘긴다.
      if (match[0] === decision.used) continue
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
      message: decision.condition
        ? `조건 확인 "${text.slice(start, end)}" → "${decision.used}" (${decision.ref}, 조건: ${decision.condition}): ${excerpt(text)}`
        : `쓰지 않는 표기 "${text.slice(start, end)}" → "${decision.used}" (${decision.ref}): ${excerpt(text)}`,
    }))
}

// 쓰는 표기 바로 뒤 괄호 안의 원어 병기. 한글이 든 괄호는 원어 병기가 아니다. 쓰는 표기가 든 합성어 뒤도
// 본다. 예:
// `사이버보안 속성(cybersecurity property)`, `프로세스 자산 라이브러리(process asset library)`
const glossWindow = 20
function glossed(text: string, start: number, used: string): boolean {
  const open = text.lastIndexOf("(", start)
  if (open < 0 || text.slice(open, start).includes(")")) return false
  const close = text.indexOf(")", start)
  if (/[가-힣]/.test(text.slice(open, close < 0 ? undefined : close))) return false
  const before = text.slice(0, open).replace(/[\s*]+$/, "")
  return before.slice(-(glossWindow + used.length)).includes(used)
}
