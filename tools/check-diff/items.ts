import fs from "node:fs"
import path from "node:path"
import { citationRuns, citations } from "../check-content/source-checks"
import { fieldsOf, type Page, type SvgFile, type Tree, type Violation } from "../check-content/tree"
import { repoRoot } from "../repo"
import { isNew, type ChangedFile } from "./diff"
import { diagramWidthItem } from "./diagram-width"
import {
  anchorSection,
  blank,
  blocks,
  citedSentences,
  escapeRegExp,
  excerpt,
  lineAt,
  lineStarts,
  linkedPage,
  listNames,
  maskRefs,
  pageNames,
  sentences,
  similarity,
  standardBodies,
  touches,
} from "./text"
import { firstLinkItem } from "./first-link"
import { sectionLinkItem } from "./section-link"
import { ownerPage } from "./owner"
import { editions, type Edition } from "./editions"
import { consensusWithoutEdition, isConsensus, sectionText, shortNameAllowed } from "./consensus"
import { isStandardsTrackRfc } from "./rfc"
import {
  attributed,
  claimBlocks,
  type ClaimBlock,
  interleaved,
  opensRun,
  pointerOpenings,
  repeatedNames,
} from "./runs"
import { termItem } from "./terms"
import { inlineMathItem } from "./math"

// 반영 뒤 점검의 항목들. 항목마다 규칙은 docs/wiki-verification.md의 반영 뒤 점검 절이 가리키는 절에
// 있고, 여기 있는 것은 후보를 뽑는 패턴뿐이다. 판정은 사람이 한다.
export interface Context {
  tree: Tree
  changed: { page: Page; change: ChangedFile; before?: Page }[] // before는 기준 커밋의 페이지
  diagrams: { svg: SvgFile; change: ChangedFile }[]
  ticketBody?: string
}

// 후보 하나. folded인 후보는 줄을 찍지 않고 머리 줄의 접은 수로만 센다.
export interface Candidate extends Violation {
  folded?: boolean
}

export type Item = (context: Context) => Candidate[]

// 표준 이름 바로 뒤나 "<표준>의 <말 한둘>" 뒤의 "…에서(는)", "…에 따르면"과, 표준이 주어인 문장의 사실을
// 전하기만 하는 보고 동사를 잡는다. 이름은 번호와 판까지 이어 본다(Bosch CAN FD 1.0,
// [[iso-11898-1|ISO 11898-1]]:2024). 이름과 "에서" 사이에 아무 말이나 두면 "중재에서"처럼 표준과 상관없는
// "에서"까지 걸려, #318·#319의 diff에서 후보 25개 가운데 21개가 그런 것이었다. 이름 안의 토큰은 공백
// 하나로만 나눈다. 구분자를 생략할 수 있으면 영문 낱말 하나를 여러 방법으로 쪼개, "에서"가 없는 긴 영문
// 제목 줄에서 역추적이 지수적으로 늘어난다(#339).
const standardSubject = `(?:${standardBodies}|표준|규격|명세)`
const standardNameToken = "[A-Za-z0-9.:/_\\]-]+"
const standardSentence = new RegExp(
  `${standardSubject}(?: ?${standardNameToken}(?: ${standardNameToken})*)?(?:의 [^\\s.]+(?: [^\\s.]+)?)?(?:에서는?|에 따르면) |` +
    `${standardSubject}(?:[^.]|\\.[0-9])*?(?:적는|설명한|밝힌|적었|설명했|밝혔)다`,
  "g",
)

const standardSentenceItem: Item = ({ changed }) =>
  changed.flatMap(({ page, change }) =>
    addedLines(page, change).flatMap(({ line, text }) => [
      ...[...text.matchAll(standardSentence)].map((match) => ({
        file: page.file,
        line,
        message: excerpt(match[0]),
      })),
      ...[...text.matchAll(consensusWithoutEdition)]
        .filter(
          (match) =>
            !shortNameAllowed(
              sectionBefore(page, line) + text.slice(0, match.index),
              sectionText(page.masked, line),
              match[0],
            ),
        )
        .map((match) => ({
          file: page.file,
          line,
          message: `판 없는 합의 문서: ${excerpt(match[0])}`,
        })),
    ]),
  )

// 줄이 든 절(`##`, `###`)에서 그 줄 앞까지의 글.
function sectionBefore(page: Page, line: number): string {
  const lines = page.masked.split("\n")
  let start = line - 1
  while (start > 0 && !/^#{2,3} /.test(lines[start - 1])) start--
  return lines.slice(start, line - 1).join("\n") + "\n"
}

// 같은 인용으로 같은 주장을 한 다른 페이지: 더한 문장과 인용 키를 함께 쓰는 다른 페이지의 문장 가운데 글이
// 비슷한 것. 더한 줄의 정의 강조를 다른 페이지도 강조한 곳, 새 페이지의 title과 alias를 링크 없이 쓰는 다른
// 페이지도 보인다.
const similarClaim = 0.6

const duplicateItem: Item = ({ tree, changed }) => {
  const byKey = new Map<string, { page: Page; line: number; text: string }[]>()
  for (const page of tree.pages) {
    if (page.kind !== "page") continue
    page.masked.split("\n").forEach((text, i) => {
      for (const sentence of citedSentences(text.replace(/(?<!\\)\|/g, " "))) {
        for (const key of new Set(sentence.keys)) {
          byKey.set(key, [...(byKey.get(key) ?? []), { page, line: i + 1, text: sentence.text }])
        }
      }
    })
  }
  const found: Violation[] = []
  for (const { page, change } of changed) {
    const at = (line: number, message: string) => found.push({ file: page.file, line, message })
    for (const { line, text } of addedLines(page, change)) {
      const best = new Map<string, { score: number; other: string; text: string }>()
      for (const sentence of citedSentences(text.replace(/(?<!\\)\|/g, " "))) {
        for (const key of new Set(sentence.keys)) {
          for (const other of byKey.get(key) ?? []) {
            if (other.page === page) continue
            const score = similarity(sentence.text, other.text)
            const previous = best.get(other.page.name)
            if (score >= similarClaim && (!previous || score > previous.score))
              best.set(other.page.name, {
                score,
                other: `${other.page.name}:${other.line}`,
                text: other.text,
              })
          }
        }
      }
      for (const { score, other, text: otherText } of best.values())
        at(line, `같은 인용의 비슷한 문장(${score.toFixed(2)}) ${other}: ${excerpt(otherText, 60)}`)
      for (const [term] of text.matchAll(/\*\*[^*]+\*\*/g)) {
        const names = tree.pages
          .filter((other) => other !== page && other.kind === "page" && other.masked.includes(term))
          .map((other) => other.name)
        if (names.length > 0) at(line, `${term}를 강조한 다른 페이지: ${listNames(names)}`)
      }
    }
    if (isNew(page.source, change)) {
      const fields = fieldsOf(page)
      const link = new RegExp(`\\[\\[${escapeRegExp(page.name)}(?:[#|\\\\\\]])`)
      for (const name of [fields.title, ...(Array.isArray(fields.aliases) ? fields.aliases : [])]) {
        if (typeof name !== "string" || name.length < 2) continue
        const names = tree.pages
          .filter(
            (other) =>
              other !== page &&
              other.kind === "page" &&
              other.masked.includes(name) &&
              !link.test(other.masked),
          )
          .map((other) => other.name)
        if (names.length > 0)
          at(1, `새 페이지의 이름 "${name}"을 링크 없이 쓰는 다른 페이지: ${listNames(names)}`)
      }
    }
  }
  return found
}

// 인용이 없는 블록. 도해, 디스플레이 식, 제목, 여는 문장에 인용이 있는 표, 목록을 여는 문장, 다른
// 페이지로 넘기는 문장은 뺀다.
const uncitedBlockItem: Item = ({ changed }) =>
  changed.flatMap(({ page, change }) => {
    const list = blocks(page)
    return list.flatMap((block, index) => {
      if (!touches(block, change.added) || block.text.includes("[@")) return []
      if (!["paragraph", "table", "list", "callout"].includes(block.kind)) return []
      const previous = list[index - 1]
      const next = list[index + 1]
      const flat = block.text.replace(/\s+/g, " ").trim()
      if (block.kind === "table" && previous?.text.includes("[@")) return []
      if (
        block.kind === "paragraph" &&
        (next?.kind === "list" || next?.kind === "table") &&
        (/:$/.test(flat) ||
          /(?:다음(?:과 같|이)다|(?:아래|다음)(?:처럼|와 같이) [^.]*다)\.$/.test(flat))
      )
        return []
      if (
        block.kind === "paragraph" &&
        flat.includes("[[") &&
        sentences(flat).length === 1 &&
        /(?:에서|을|를) (?:다룬다|참고한다)\.$/.test(flat)
      )
        return []
      return [{ file: page.file, line: block.start, message: excerpt(flat) }]
    })
  })

// 정의 자리: 정의 문장, 연결어미로 이어지는 정의, 정의 목록 항목, 강조한 주제어가 주어인 문장.
// "…라고도 부른다"는 정의 자리가 아니다.
const definitionPlace =
  /(?:이)?라고? (?:한다|하며|하고|부른다|부르며|부르고|불린다|불리며)|(?:으)?로 정의(?:한다|하며|하고|된다|되며)/
const definitionItem = /^\s*(?:[-*]|\d+\.) (?![0-9])[^:]+: /
const boldTerm = String.raw`\*\*[^*]+\*\*(?:\([^)]*\))?`
const boldSubject = new RegExp(
  String.raw`^(?:[-*] |\d+\. |>\s*)*(?:${boldTerm}(?:와|과|,) ?)*${boldTerm}(?:은|는|이란|란) `,
)
const boldPredicate = new RegExp(String.raw`${boldTerm}(?:이)?다(?:[.\[]|$)`)
const bold = /\*\*[^*]+\*\*/g

const emphasisItem: Item = ({ changed }) =>
  changed.flatMap(({ page, change }) => {
    const found: Violation[] = []
    const at = (line: number, message: string) => found.push({ file: page.file, line, message })
    for (const { line, text } of addedLines(page, change)) {
      sentences(text).forEach((sentence, index) => {
        const place =
          definitionPlace.test(sentence.text) ||
          boldSubject.test(sentence.text) ||
          boldPredicate.test(sentence.text) ||
          (index === 0 && definitionItem.test(text))
        const emphasized = sentence.text.match(bold)
        if (place && !emphasized) at(line, `정의 자리에 강조가 없다: ${excerpt(sentence.text)}`)
        if (!place && emphasized)
          at(line, `정의 자리가 아닌 곳의 강조 ${emphasized.join(" ")}: ${excerpt(sentence.text)}`)
      })
    }
    // 같은 용어는 한 페이지에서 한 번만 강조한다.
    const starts = lineStarts(page.masked)
    const terms = new Map<string, number[]>()
    for (const match of page.masked.matchAll(bold)) {
      terms.set(match[0], [...(terms.get(match[0]) ?? []), lineAt(starts, match.index)])
    }
    for (const [term, lines] of terms) {
      const added = lines.filter((line) => change.added.has(line))
      if (lines.length > 1 && added.length > 0)
        at(
          added[0],
          `같은 강조가 페이지에 ${lines.length}번 있다: ${term} (줄 ${lines.join(", ")})`,
        )
    }
    return found
  })

// 한 문단 안에서 같은 인용 자리가 이어진 곳. 목록은 통째로, 콜아웃은 하나하나를 문단 하나로 본다.
// 표의 행은 따로 읽히므로 보지 않는다. 고친 줄이 닿은 문단이면 브랜치 전부터 있던 되풀이도 "(기존 줄)"을
// 달아 찍는다. 그 문단을 고치는 PR이 함께 고친다.
const repeatedCitationItem: Item = ({ changed }) =>
  changed.flatMap(({ page, change }) => {
    const runs = citationRuns(page, citations(page))
    return blocks(page).flatMap((block) => {
      if (!["paragraph", "list", "callout"].includes(block.kind)) return []
      if (!touches(block, change.added)) return []
      const inside = runs.filter((run) => run[0].line >= block.start && run[0].line <= block.end)
      const keyOf = (run: (typeof inside)[number]) =>
        run
          .map((c) => c.raw)
          .sort()
          .join("")
      return inside.flatMap((run, index) => {
        const previous = inside[index - 1]
        if (!previous || keyOf(previous) !== keyOf(run)) return []
        const old = !change.added.has(run[0].line) && !change.added.has(previous[0].line)
        return [
          {
            file: page.file,
            line: run[0].line,
            message: `${old ? "(기존 줄) " : ""}같은 인용이 이어진다(앞: ${previous[0].line}줄): ${run.map((c) => c.raw).join("")}`,
          },
        ]
      })
    })
  })

// 짝 없는 닫는 괄호: 더한 줄에서 코드, 수식, 인용, URL을 뺀 뒤 `)`가 `(`보다 많은 줄. 초안의 인용 위치를 괄호 짝을
// 세어 빼면, 위치 안의 목록 번호(`(1.2 c), e), f))`)가 첫 `c)`에서 짝을 닫아 `, e), f))` 같은 꼬리가 남는다
// (#391에서 8곳). 같은 인용을 합쳐 앞 마커가 지워지면 꼬리가 문장 끝에 붙고, 목록 항목과 표 칸은 `다.`로
// 끝나지 않아 마커나 문장 끝으로는 찾지 못한다. 반열린 구간(`$[0, t)$`)은 수식이라 세지 않는다.
const unmatchedParenItem: Item = ({ changed }) =>
  changed.flatMap(({ page, change }) =>
    addedLines(page, change).flatMap(({ line, text }) => {
      const masked = maskRefs(text)
      const opened = masked.split("(").length - 1
      const closed = masked.split(")").length - 1
      if (closed <= opened) return []
      const last = masked.lastIndexOf(")")
      const tail = excerpt(masked.slice(Math.max(0, last - 40), last + 1))
      return [
        {
          file: page.file,
          line,
          message: `닫는 괄호가 여는 괄호보다 ${closed - opened}개 많다: …${tail}`,
        },
      ]
    }),
  )

// 줄이거나 표기를 바꾼 곳: 고친 줄에서 지시어·접속어로 여는 문장, 지운 뒤 이어지는 문장, 고친 줄에서
// 빠진 표준 이름, 고친 줄에서 빠졌는데 도해에 남은 글자.
const pointer =
  /^(?:(?:이|그)(?: |런 |러한 |렇게 |때 |래서 |러나 |러면 |리고 |에 |와 같은 )|(?:따라서|하지만|또한|반면|즉|한편|여기서|다만|게다가|특히)[ ,])/
const standardName =
  /(?:ISO(?:\/[A-Z]+)*|IEC|IEEE|SAE|ITU-T|RFC) ?[0-9][0-9.\-:]*|AUTOSAR R[0-9-]+|Bosch CAN(?: FD)? [0-9.]+/g

const shortenedItem: Item = ({ tree, changed }) => {
  const labels = diagramLabels(tree)
  return changed.flatMap(({ page, change }) => {
    if (change.untracked) return []
    const found: Violation[] = []
    const at = (line: number, message: string) => found.push({ file: page.file, line, message })
    const lines = page.source.split("\n")
    for (const hunk of change.hunks) {
      if (hunk.removed.length === 0) continue
      // 그대로 남은 지시어 문장인데 바로 앞 문장이 바뀐 곳. 가리키던 것이 앞 문장에 있었을 수 있다.
      const before = new Map<string, string | undefined>()
      for (const text of hunk.removed) {
        sentences(text).forEach((sentence, i, list) => before.set(sentence.text, list[i - 1]?.text))
      }
      for (const { line, text } of hunk.added) {
        sentences(text).forEach((sentence, i, list) => {
          if (i === 0 || !pointer.test(sentence.text) || !before.has(sentence.text)) return
          if (before.get(sentence.text) !== list[i - 1].text)
            at(line, `앞 문장이 바뀐 지시어·접속어 문장: ${excerpt(sentence.text)}`)
        })
      }
      if (hunk.added.length === 0) {
        const next = lines.findIndex((text, i) => i >= hunk.at && text.trim() !== "")
        const first = next >= 0 ? sentences(lines[next])[0] : undefined
        if (first && pointer.test(first.text))
          at(next + 1, `지운 곳 뒤의 지시어·접속어 문장: ${excerpt(first.text)}`)
      }
      const removed = hunk.removed.join("\n")
      const added = hunk.added.map((a) => a.text).join("\n")
      const line = hunk.added[0]?.line ?? hunk.at
      const dropped = new Set(
        [...removed.matchAll(standardName)]
          .map((m) => m[0].trim())
          .filter((n) => !added.includes(n)),
      )
      for (const name of dropped) at(line, `고친 줄에서 표준 이름이 빠졌다: ${name}`)
      // 고친 줄에서 빠져 페이지 어디에도 남지 않은 말(낱말 셋까지)이 도해 글자로 있으면 옛 표기일 수 있다.
      for (const phrase of phrases(removed)) {
        if (added.includes(phrase) || page.source.includes(phrase)) continue
        const files = labels.get(phrase)
        if (files)
          at(line, `고친 줄에서 빠진 "${phrase}"이 도해 글자에 남아 있다: ${listNames(files)}`)
      }
    }
    return found
  })
}

// 출처 구간: 더하거나 지우거나 고친 자리의 주장 블록과 그 뒤에 처음 오는 주장 블록 가운데, 구간을 여는데
// 출처 표시가 없는 것. 뒤 블록은 바뀌지 않았어도 찍는다. 끼워 넣은 블록이나 지운 구간 첫 블록 때문에 몇 절
// 떨어진 블록이 구간을 열 수 있기 때문이다. 같은 출처인지는 판으로 가리고, 판은 엔트리 제목에서 읽는다
// (editions.ts). 같은 판의 구간 사이에 다른 출처의 블록이 끼어 구간을 다시 여는 블록은 출처 표시가 있어도
// 끼움으로 따로 찍는다. 더한 줄에서는 구간 안에서 출처 이름을 다시 쓴 문장과, 합의 문서 구간을 가리키는 말로
// 여는 문장도 찍는다. 인용만 지우거나 옮긴 줄은 고친 줄로 세지 않는다. 기준 커밋에서도 같은 블록이 같은
// 여는 문장으로 출처 표시 없이 구간을 열었으면, 브랜치가 고쳐 쓰지 않은 문장이라 찍지 않는다(좁혀 쓰기).
const sourceRunItem: Item = ({ tree, changed }) => {
  const sources = editions(tree)
  return changed.flatMap(({ page, change, before }) => {
    const list = claimBlocks(page, sources)
    const rewritten = rewrittenLines(change)
    const openedBefore = before ? unattributedOpenings(before, sources) : new Set<string>()
    const picked = new Set<number>()
    for (const hunk of change.hunks) {
      const lines = hunk.added.map((a) => a.line)
      list.forEach((claim, index) => {
        if (lines.some((line) => rewritten.has(line) && claim.start <= line && line <= claim.end))
          picked.add(index)
      })
      const after =
        lines.length > 0
          ? list.findIndex((claim) => claim.start > Math.max(...lines))
          : list.findIndex((claim) => claim.end > hunk.at)
      if (after >= 0) picked.add(after)
    }
    const opening = [...picked]
      .sort((a, b) => a - b)
      .filter((index) => opensRun(list, index))
      .flatMap((index) => {
        const claim = list[index]
        const at = (message: string) => [
          { file: page.file, line: claim.start, message: `${message}: ${excerpt(claim.opening)}` },
        ]
        const between = interleaved(page, list, index)
        if (between) {
          const [first, ...rest] = between.inserted
          const inserted = `${first.start}줄 ${first.firstKeys}${rest.length > 0 ? ` 외 ${rest.length}블록` : ""}`
          return at(
            `같은 출처 구간 사이에 다른 출처의 블록이 끼었다(앞 구간: ${between.before.end}줄, 끼운 블록: ${inserted}, 이: ${claim.firstKeys})`,
          )
        }
        // 합의 문서는 다툼 없는 설명을, Standards Track RFC는 규범 주장을 출처 이름 없이 위키 목소리로 쓰므로,
        // 그 키만으로 여는 블록은 출처 표시가 없어도 된다. 합의 문서 구간을 가리키는 말로 여는 문장은 아래
        // pointerOpenings가 찍는다.
        const keys = claim.firstKeys.split(" ")
        if (
          attributed(claim, sources) ||
          keys.every((key) => isConsensus(key) || isStandardsTrackRfc(key)) ||
          openedBefore.has(openingKey(claim))
        )
          return []
        const previous = list[index - 1]
        const before = previous ? `${previous.end}줄 ${previous.lastKeys}` : "없음"
        return at(`구간을 여는데 출처 표시가 없다(앞: ${before}, 이: ${claim.firstKeys})`)
      })
    const repeated = repeatedNames(page, sources)
      .filter(({ line, earlier }) => rewritten.has(line) || rewritten.has(earlier.line))
      .map(({ line, text, earlier }) => ({
        file: page.file,
        line,
        message: `구간 안에서 출처 이름을 다시 쓴다(앞: ${earlier.line}줄 "${earlier.name}"): ${excerpt(text)}`,
      }))
    const pointers = pointerOpenings(page, sources)
      .filter(({ line }) => rewritten.has(line))
      .map(({ line, text }) => ({
        file: page.file,
        line,
        message: `합의 문서 구간을 가리키는 말로 연다: ${excerpt(text)}`,
      }))
    return [...opening, ...repeated, ...pointers]
  })
}

// 인용 자리를 지우고 공백을 하나로 줄인 글.
const withoutCitations = (text: string) =>
  text
    .replace(/\[@[^\]\n]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim()

// 고친 줄 가운데 인용만 지우거나 옮긴 줄을 뺀 것. 인용을 지운 글이 같은 덩어리의 지운 줄과 같으면 뺀다.
function rewrittenLines(change: ChangedFile): Set<number> {
  const rewritten = new Set<number>()
  for (const hunk of change.hunks) {
    const removed = new Set(hunk.removed.map(withoutCitations))
    for (const { line, text } of hunk.added)
      if (!removed.has(withoutCitations(text))) rewritten.add(line)
  }
  return rewritten
}

// 블록을 견줄 열쇠: 첫 인용 자리의 판과, 인용을 지운 여는 글의 첫 문장.
const openingKey = (claim: ClaimBlock) =>
  `${claim.firstEditions}\n${sentences(withoutCitations(claim.opening))[0]?.text ?? ""}`

// 페이지에서 출처 표시 없이 구간을 연 블록의 열쇠.
function unattributedOpenings(page: Page, sources: Map<string, Edition>): Set<string> {
  const list = claimBlocks(page, sources)
  return new Set(
    list.flatMap((claim, index) =>
      opensRun(list, index) && !attributed(claim, sources) ? [openingKey(claim)] : [],
    ),
  )
}

// 이어진 낱말 하나에서 셋까지의 묶음.
function phrases(text: string): Set<string> {
  const found = new Set<string>()
  for (const line of text.split("\n")) {
    const words = line.split(/[\s,.()[\]|*:;"']+/).filter(Boolean)
    for (let n = 1; n <= 3; n++) {
      for (let i = 0; i + n <= words.length; i++) found.add(words.slice(i, i + n).join(" "))
    }
  }
  return found
}

// 도해의 <text> 글자마다 그것이 든 도해 파일.
function diagramLabels(tree: Tree): Map<string, string[]> {
  const labels = new Map<string, string[]>()
  for (const svg of tree.svgs) {
    for (const match of svg.source.matchAll(/<text[\s>][\s\S]*?<\/text>/g)) {
      const label = decode(match[0].replace(/<[^>]*>/g, ""))
        .replace(/\s+/g, " ")
        .trim()
      if (label.length < 2 || !/[A-Za-z가-힣]/.test(label)) continue
      const name = path.basename(svg.file)
      const files = labels.get(label) ?? []
      if (!files.includes(name)) labels.set(label, [...files, name])
    }
  }
  return labels
}

function decode(text: string): string {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }
  return text.replace(/&(?:#x([0-9a-f]+)|#(\d+)|(\w+));/gi, (entity, hex, dec, name) =>
    hex
      ? String.fromCodePoint(parseInt(hex, 16))
      : dec
        ? String.fromCodePoint(Number(dec))
        : (named[name] ?? entity),
  )
}

// 약어: 더한 줄의 약어 가운데, 페이지에서 처음 나온 자리에 풀이가 없고 풀이하지 않는 약어 목록에 없는 것.
// 약어는 대문자로만 된 낱말과, 대소문자가 섞이거나 숫자가 든 낱말 가운데 위키 어딘가에서 `낱말(풀이)`로
// 풀린 적이 있는 것(ChrgM, PAM3)이다. 대소문자 섞인 낱말을 모두 보면 FlexRay, MHz 같은 이름까지 걸린다.
// 그 밖의 글자와 숫자가 섞인 낱말(부품 번호, 판 번호)과 로마 숫자는 거른다. 절 제목 줄의 약어는 세지 않는다.
// 밑줄이 든 이름은 약어가 아니라 백틱 없는 코드 이름 후보로 따로 찍는다(위키 규약의 코드 표기 절). 페이지
// 이름(M_CAN, PREEMPT_RT)은 빼낸다.
const abbreviationsPath = path.join(repoRoot, "docs", "wiki-abbreviations.md")
const abbreviationPart = /^[A-Z]{2,}s?$/
const codeName = /^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)+$/
const romanNumeral = /^[IVX]+$/
const lettersAndDigits = (part: string) => /[A-Za-z]/.test(part) && /[0-9]/.test(part)
const token = /(?<![A-Za-z0-9_])[A-Za-z0-9_]+(?:[/.-][A-Za-z0-9_]+)*/g

// 토큰을 `/.-`로 가른 조각 가운데 약어인 것. 코드 이름 조각은 빼고, 풀린 적 없는 글자·숫자 조각이 있으면
// 토큰 전체를 거른다(TJA1042).
function abbreviationParts(word: string, explained: Set<string>): string[] {
  const words = word.split(/[/.-]/).filter((p) => !codeName.test(p))
  if (words.some((p) => lettersAndDigits(p) && !explained.has(p))) return []
  return words.filter(
    (p) => (abbreviationPart.test(p) || explained.has(p)) && !romanNumeral.test(p),
  )
}

// 풀이하지 않는 약어 목록의 줄(`- <약어>: <종류>`)마다 약어와 종류.
function listedAbbreviations(): { name: string; kind: string }[] {
  return [...fs.readFileSync(abbreviationsPath, "utf8").matchAll(/^- (.+?): (\S.*)$/gm)].map(
    (m) => ({
      name: m[1],
      kind: m[2],
    }),
  )
}

// 소개하는 조직 약어: 더한 줄에 나온 조직 약어 가운데, 페이지에서 처음 나온 자리에 괄호 소개도 링크도 없는 것.
// 대문자 조각이 아니라 목록의 이름 문자열 그대로 찾는다(WP.29, Auto-ISAC). 절 제목은 세지 않는다. 이름 안
// (CISPR 25, MITRE ATT&CK, CISA/US-CERT)은 혼자 쓰인 자리가 없을 때만 보고, 이름 뒤의 `(<약어>: …)`를 소개로
// 센다(`TIA/EIA-422B(TIA: …, EIA: …)`). 판 표시 같은 다른 괄호(`MIPI A-PHY(v1.1)`)는 소개가 아니다. 이미
// 괄호 안이면 그 괄호의 쉼표 뒤를 소개로 센다(`Continental(지금의 AUMOVIO, …)`, `SECM(…, EIA 731, EIA: …)`).
// 하이픈 뒤에 번호가 붙은 자리(EIA-649)는 표준 번호 안으로 보고, 하이픈이나 점으로 다른 낱말과 붙은
// 자리(CCITT-FALSE, US-CERT)는 다른 이름이라 세지 않는다. 괄호 안의 글이 소개인지와 괄호가 약어 바로 뒤에
// 있는지는 표기 검토가 본다(docs/wiki-verification.md).
function unintroduced(
  page: Page,
  change: ChangedFile,
  organizations: string[],
  { text, links }: { text: string; links: [number, number][] },
): Candidate[] {
  const starts = lineStarts(text)
  const inside = (offset: number) => links.some(([s, e]) => offset >= s && offset < e)
  return organizations.flatMap((name) => {
    // 이 이름을 품은 더 긴 이름(VDA 안의 VDA QMC)은 지운다.
    let withoutLonger = text
    for (const longer of organizations.filter((n) => n !== name && n.includes(name))) {
      withoutLonger = withoutLonger.replace(new RegExp(escapeRegExp(longer), "g"), blank)
    }
    const pattern = new RegExp(
      `(?<![A-Za-z0-9_.&-])${escapeRegExp(name)}(?![A-Za-z0-9_]|[.&][A-Za-z0-9]|-[A-Za-z])`,
      "g",
    )
    // 이름 뒤 소개(`CISPR 25(CISPR: …)`) 안의 약어도 세지 않는다.
    const found = [...withoutLonger.matchAll(pattern)].filter(
      (m) =>
        !/^#{1,6} /.test(withoutLonger.slice(starts[lineAt(starts, m.index) - 1])) &&
        !(
          /(?:\(|, )$/.test(withoutLonger.slice(m.index - 2, m.index)) &&
          withoutLonger[m.index + name.length] === ":"
        ),
    )
    if (!found.some((m) => change.added.has(lineAt(starts, m.index)))) return []
    const inName = (offset: number) =>
      /[A-Za-z0-9&][ /]$|\/$/.test(withoutLonger.slice(Math.max(0, offset - 2), offset)) ||
      /^[ /-][A-Za-z0-9]|^\//.test(
        withoutLonger.slice(offset + name.length, offset + name.length + 2),
      )
    const alone = found.find((m) => !inName(m.index))
    const at = alone ?? found[0]
    const after = withoutLonger.slice(at.index + name.length)
    // 이미 괄호 안이면 소개는 새 괄호가 아니라 그 괄호 안의 쉼표 뒤에 온다.
    const before = withoutLonger.slice(starts[lineAt(starts, at.index) - 1], at.index)
    const inParen = (before.match(/\(/g) ?? []).length > (before.match(/\)/g) ?? []).length
    const introduced =
      inside(at.index) ||
      (alone
        ? /^\**\(/.test(after) || (inParen && /^\**, /.test(after))
        : new RegExp(
            `^[^가-힣()\\n]*(?:\\((?:[^()\\n]*, )?${inParen ? "|, " : ""})${escapeRegExp(name)}: `,
          ).test(after))
    if (introduced) return []
    return [{ file: page.file, line: lineAt(starts, at.index), message: `소개가 없다: ${name}` }]
  })
}

// 약어를 찾을 글. 줄 번호와 오프셋을 원문과 맞추려고 지울 곳은 공백으로 바꾼다. 위키링크는 표시 글자만
// 남기고 그 자리를 따로 준다. µ로 시작하는 낱말(µC/OS-III, µs)은 지운다. 토큰이 µ 뒤에서 시작해 OS를
// 약어로 보기 때문이다.
function abbreviationText(page: Page, exempt: string[]) {
  const links: [number, number][] = []
  let text = maskRefs(page.masked).replace(/[µμ][A-Za-z0-9_]*(?:[/.-][A-Za-z0-9_]+)*/g, blank)
  text = text.replace(/\[\[([^\]\n|]*\\?\|)?([^\]\n]*)\]\]/g, (_link, target, display, offset) => {
    const shown = target ? display : display.replace(/^[^#]*/, blank)
    const start = offset + 2 + (target?.length ?? 0)
    links.push([start, start + shown.length])
    return `  ${target ? blank(target) : ""}${shown}  `
  })
  for (const name of exempt.filter((n) => /\s/.test(n))) {
    text = text.replace(
      new RegExp(`(?<![A-Za-z0-9_])${escapeRegExp(name)}(?![A-Za-z0-9_])`, "g"),
      blank,
    )
  }
  return { text, links }
}

// 위키에서 `낱말(풀이)`로 풀린 적이 있는, 대소문자가 섞이거나 숫자가 든 낱말. 풀이는 라틴 문자나 링크로
// 시작하고 한글 없이 두 글자 이상이다. `DevSecOps(2025)`나 `SnapshotRecord(DTC가 생긴 때의 데이터)`는
// 풀이가 아니다.
function explainedWords(tree: Tree): Set<string> {
  const words = new Set<string>()
  for (const page of tree.pages) {
    for (const match of page.masked.matchAll(
      /(?<![A-Za-z0-9_/.-])([A-Za-z0-9]+)\**\((?=\[\[|[A-Za-z])([^()\n가-힣]{2,})\)/g,
    )) {
      const word = match[1]
      // 첫 글자 뒤에도 대문자가 있는 낱말(ChrgM, bxCAN)이나 대문자와 숫자가 함께 든 낱말(PAM3).
      // 대문자로만 된 낱말(CAN)은 원래 약어로 본다.
      const mixedCase = /[A-Z]/.test(word.slice(1)) && /[a-z]/.test(word)
      const numbered = /[A-Z]/.test(word) && /[0-9]/.test(word)
      if (mixedCase || numbered) words.add(word)
    }
  }
  return words
}

// 링크 뒤 풀이: 더한 줄의 `[[대상|약어]](풀이)`, `[[대상#절|약어]](풀이)` 가운데 링크가 풀이를 대신하는데
// 괄호로 또 푼 것(위키 규약의 약어 절). 풀이는 라틴 문자로 시작하고 한글이 없다. 대상의 머리말(절 링크면
// 그 절)이 그 약어를 풀어야 링크가 풀이를 대신하고, 숫자가 든 괄호는 풀이가 아니라 표준 번호다
// (`[[srp|SRP]](IEEE 802.1Qat)`). 다른 페이지의 이름인 약어는 그 페이지와 다른 뜻으로 쓰여 링크와 함께 풀
// 수 있다(`[[aperiodic-server#CBS|CBS]](Constant Bandwidth Server)`).
const linkGloss =
  /\[\[([^\]\n|#\\]+)(?:#([^\]\n|\\]+))?\\?\|([A-Za-z0-9_]+(?:[/.-][A-Za-z0-9_]+)*)\]\]\(((?=[A-Za-z])[^()\n가-힣]+)\)/g

function linkGlosses(
  tree: Tree,
  page: Page,
  change: ChangedFile,
  isAbbreviation: (word: string) => boolean,
  owners: Map<string, Page[]>,
): Candidate[] {
  const text = maskRefs(page.masked)
  const starts = lineStarts(text)
  return [...text.matchAll(linkGloss)].flatMap((match) => {
    const [link, target, anchor, abbreviation, gloss] = match
    const line = lineAt(starts, match.index)
    if (!change.added.has(line) || !isAbbreviation(abbreviation) || /[0-9]/.test(gloss)) return []
    const linked = linkedPage(tree, target)
    if (!linked || (owners.get(abbreviation) ?? []).some((p) => p !== linked)) return []
    const word = escapeRegExp(abbreviation)
    const explains = new RegExp(
      `(?<![A-Za-z0-9_/.-])${word}(?![A-Za-z0-9_])\\**\\((?=[A-Za-z])|\\(\\**${word}\\**[),]`,
    )
    if (!explains.test(anchorSection(linked, anchor).text)) return []
    return [{ file: page.file, line, message: `링크 뒤 풀이: ${link}` }]
  })
}

const abbreviationItem: Item = ({ tree, changed }) => {
  const listed = listedAbbreviations()
  const exempt = listed.map((a) => a.name)
  const exemptSet = new Set(exempt)
  const explainedSet = explainedWords(tree)
  const pageNameSet = new Set(tree.pages.flatMap(pageNames))
  const organizations = listed.filter((a) => a.kind === "소개하는 조직").map((a) => a.name)
  const owners = new Map<string, Page[]>()
  for (const page of tree.pages.filter((p) => p.kind === "page"))
    for (const name of pageNames(page)) owners.set(name, [...(owners.get(name) ?? []), page])
  // 풀이하지 않는 약어 목록의 약어도 자기 페이지로 거는 링크 뒤에서는 찍는다(`[[can|CAN]](…)`).
  const isAbbreviation = (word: string) => abbreviationParts(word, explainedSet).length > 0
  return changed.flatMap(({ page, change }) => {
    const { text, links } = abbreviationText(page, exempt)
    const starts = lineStarts(text)
    const lines = text.split("\n")
    const first = new Map<string, { offset: number; token: string; explained: boolean }>()
    const firstInName = new Map<string, { offset: number; token: string; explained: boolean }>()
    const inAdded = new Set<string>()
    const code = new Map<string, number>()
    // 강조한 이름과, 약어 바로 뒤 괄호 안의 풀이.
    const names = [
      ...[...text.matchAll(/\*\*[^*\n]+\*\*/g)].map((m) => [m.index, m.index + m[0].length]),
      ...[...text.matchAll(/[A-Za-z0-9_]\**\(([^()\n]*)\)/g)].map((m) => [
        m.index + m[0].length - m[1].length - 1,
        m.index + m[0].length - 1,
      ]),
    ]
    const inside = (spans: number[][], offset: number) =>
      spans.some(([s, e]) => offset >= s && offset < e)
    for (const match of text.matchAll(token)) {
      const word = match[0]
      if (exemptSet.has(word)) continue
      const parts = word.split(/[/.-]/)
      const offset = match.index
      const line = lineAt(starts, offset)
      for (const part of parts.filter(
        (p) => codeName.test(p) && !exemptSet.has(p) && !pageNameSet.has(p),
      )) {
        if (change.added.has(line) && !code.has(part) && !inside(links, offset))
          code.set(part, line)
      }
      // 절 제목의 약어는 세지 않고, 본문에서 처음 나온 자리를 본다(위키 규약의 약어 절).
      if (/^#{1,6} /.test(lines[line - 1])) continue
      for (const part of abbreviationParts(word, explainedSet)) {
        if (exemptSet.has(part)) continue
        if (change.added.has(line)) inAdded.add(part)
        if (first.has(part)) continue
        // 풀이는 `ABBR(풀이)`나 `풀이(ABBR)`, `풀이(ABBR, 원어)` 꼴이다. 괄호 안에 약어가 있어도 뒤에 다른
        // 말이 이어지면(`오류(RAM 워드의 …)`) 풀이가 아니다. 약어가 든 링크가 먼저 나오면 링크가 풀이를 대신한다.
        const before = text.slice(Math.max(0, offset - 4), offset).replace(/\*+$/, "")
        const after = text.slice(offset + word.length, offset + word.length + 4).replace(/^\*+/, "")
        const explained =
          inside(links, offset) ||
          after.startsWith("(") ||
          (/\(\s*$/.test(before) && /^\s*[),]/.test(after))
        // 강조한 이름(정의하는 주제어, 모듈 이름)과 풀이 안의 약어는 풀이가 없으면 처음 나온 것으로 세지
        // 않는다(위키 규약의 약어 절). 그 밖에 나오지 않는 약어는 그 안의 첫 자리를 본다.
        if (!explained && inside(names, offset)) {
          if (!firstInName.has(part)) firstInName.set(part, { offset, token: word, explained })
          continue
        }
        first.set(part, { offset, token: word, explained })
      }
    }
    const unexplained = [...inAdded].flatMap((part) => {
      const at = first.get(part) ?? firstInName.get(part)!
      if (at.explained) return []
      const shown = at.token === part ? part : `${part} (${at.token})`
      return [
        { file: page.file, line: lineAt(starts, at.offset), message: `풀이가 없다: ${shown}` },
      ]
    })
    return [
      ...unexplained,
      ...linkGlosses(tree, page, change, isAbbreviation, owners),
      ...unintroduced(page, change, organizations, abbreviationText(page, [])),
      ...[...code].map(([name, line]) => ({
        file: page.file,
        line,
        message: `백틱 없는 코드 이름: ${name}`,
      })),
    ]
  })
}

// 도해 위치: 이 브랜치 전부터 있던 도해 바로 앞의 문단이 새로 들어온 문단이면, 기존 문단과 도해 사이에
// 새 내용이 끼어든 것일 수 있다. 지운 줄과 글이 비슷한 문단은 기존 문단을 고친 것으로 본다.
const rewrittenSimilarity = 0.5
const diagramPlaceItem: Item = ({ changed }) =>
  changed.flatMap(({ page, change }) => {
    const list = blocks(page).filter((block) => block.kind !== "other" || block.text.trim())
    return list.flatMap((block, index) => {
      const previous = list[index - 1]
      if (block.kind !== "embed" || change.added.has(block.start) || !previous) return []
      if (previous.kind === "heading" || previous.kind === "embed") return []
      for (let line = previous.start; line <= previous.end; line++)
        if (!change.added.has(line)) return []
      const hunk = change.hunks.find((h) => h.added.some((a) => a.line === previous.start))
      if (hunk?.removed.some((text) => similarity(text, previous.text) >= rewrittenSimilarity))
        return []
      return [
        {
          file: page.file,
          line: block.start,
          message: `기존 도해 앞의 문단이 새로 들어왔다(${previous.start}줄): ${excerpt(previous.text, 50)}`,
        },
      ]
    })
  })

function addedLines(page: Page, change: ChangedFile) {
  const lines = page.masked.split("\n")
  return [...change.added]
    .sort((a, b) => a - b)
    .map((line) => ({ line, text: lines[line - 1] ?? "" }))
    .filter(({ text }) => text.trim() !== "")
}

export const items: [string, Item][] = [
  ["standard-sentence", standardSentenceItem],
  ["duplicate", duplicateItem],
  ["uncited-block", uncitedBlockItem],
  ["emphasis", emphasisItem],
  ["repeated-citation", repeatedCitationItem],
  ["unmatched-paren", unmatchedParenItem],
  ["shortened", shortenedItem],
  ["source-run", sourceRunItem],
  ["owner-page", ownerPage],
  ["abbreviation", abbreviationItem],
  ["term", termItem],
  ["first-link", firstLinkItem],
  ["section-link", sectionLinkItem],
  ["diagram-place", diagramPlaceItem],
  ["diagram-width", diagramWidthItem],
  ["inline-math", inlineMathItem],
]
