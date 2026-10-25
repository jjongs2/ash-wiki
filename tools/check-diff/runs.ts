import type { Page } from "../check-content/tree"
import {
  allConsensus,
  consensusWithoutEdition,
  sectionText,
  shortNameAllowed,
  opensWithPointer,
  pointerPhrases,
} from "./consensus"
import type { Edition } from "./editions"
import { blocks, escapeRegExp, lineAt, lineStarts, sentences, standardBodies } from "./text"

// 출처 구간을 세는 주장 블록 하나. 인용이 없는 블록(도해, 디스플레이 식, 다른 페이지로 넘기는 문장 등)은
// 구간에서 세지 않는다. 다만 인용 없는 문단이 목록이나 표 바로 앞에 있으면 그것을 여는 문장으로 보고
// 함께 묶는다. 출처 표시가 그 문장에 있기 때문이다.
export interface ClaimBlock {
  start: number // 첫 줄
  end: number // 끝 줄
  firstEditions: string // 첫 인용 자리의 판. 같은 판의 키는 한 출처이고, 출처가 여럿이면 정렬해 잇는다
  lastEditions: string // 마지막 인용 자리의 판
  firstKeys: string // 첫 인용 자리의 키. 여럿이면 정렬해 공백으로 잇는다
  lastKeys: string // 마지막 인용 자리의 키
  opening: string // 첫 인용 자리까지의 글. 위키링크는 표시 글자만 남긴다
}

const citationSpot = /(?:\[@[^\]\s]+\][ \t\n>]*)+/g
const keysOf = (spot: string) => [...spot.matchAll(/\[@([^\]\s]+)\]/g)].map((m) => m[1]).sort()
const editionsOf = (keys: string[], editions: Map<string, Edition>) =>
  [...new Set(keys.map((key) => editions.get(key)?.id ?? key))].sort().join(" + ")
const plain = (text: string) =>
  text.replace(/\[\[([^\]|\n]*?)(?:\\?\|([^\]\n]*))?\]\]/g, (_link, target, display) =>
    (display ?? target).replace(/#.*/, ""),
  )

export function claimBlocks(page: Page, editions: Map<string, Edition>): ClaimBlock[] {
  const lines = page.masked.split("\n")
  const list = blocks(page)
  const found: ClaimBlock[] = []
  list.forEach((block, index) => {
    if (!["paragraph", "list", "table", "callout"].includes(block.kind)) return
    const text = lines.slice(block.start - 1, block.end).join("\n")
    const spots = [...text.matchAll(citationSpot)]
    if (spots.length === 0) return
    const previous = list[index - 1]
    const lead =
      (block.kind === "list" || block.kind === "table") &&
      previous?.kind === "paragraph" &&
      !previous.text.includes("[@")
        ? previous
        : undefined
    const leadText = lead ? lines.slice(lead.start - 1, lead.end).join("\n") + "\n" : ""
    found.push({
      start: lead?.start ?? block.start,
      end: block.end,
      firstEditions: editionsOf(keysOf(spots[0][0]), editions),
      lastEditions: editionsOf(keysOf(spots.at(-1)![0]), editions),
      firstKeys: keysOf(spots[0][0]).join(" "),
      lastKeys: keysOf(spots.at(-1)![0]).join(" "),
      opening: plain(leadText + text.slice(0, spots[0].index)),
    })
  })
  return found
}

// 출처 표시로 보는 것: "…에 따르면", 표준 기구와 키의 발행기관 마디로는 드러나지 않는 출판물의 이름, 인용
// 키의 발행기관·저자 마디(키의 첫 마디)와 부품 번호 마디(글자와 숫자가 섞인 마디), 문서 모음의 이름
// (µC/OS-III), 엔트리 제목의 이름. "이 표준", "이 RFC"처럼 가리키는 말은 구간을 열지 못하므로 치지 않는다.
const standardBody = new RegExp(
  `(?<![A-Za-z0-9])(?:${standardBodies}|ASPICE|Automotive SPICE|CTFL|SWEBOK|UN R[0-9]+)(?![A-Za-z])`,
)

function namesSource(text: string, keys: string[], editions: Map<string, Edition>): boolean {
  const opening = text.replace(/(?<![가-힣])이 [A-Za-z][A-Za-z0-9.-]*/g, "")
  if (/에 따르면/.test(opening) || standardBody.test(opening)) return true
  const names = keys.flatMap((key) => {
    const parts = key.split("-")
    return [parts[0], ...parts.slice(1).filter((part) => /[a-z]/.test(part) && /[0-9]/.test(part))]
  })
  const sources = keys.flatMap((key) => editions.get(key) ?? [])
  const found = [
    ...names.filter((name) => name.length >= 2 && /[a-z]/.test(name)),
    ...sources.flatMap((source) => source.names),
  ].some((name) =>
    new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(name)}(?![A-Za-z0-9])`, "i").test(opening),
  )
  return (
    found ||
    sources
      .flatMap((source) => titleNames(source.title))
      .some((name) =>
        new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(name)}(?![A-Za-z0-9])`).test(opening),
      )
  )
}

export const attributed = (claim: ClaimBlock, editions: Map<string, Edition>) =>
  namesSource(claim.opening, claim.firstKeys.split(" "), editions)

// 엔트리 제목에서 출처 표시로 칠 이름: 이어진 라틴 낱말 둘 가운데, 둘 다 글자가 들고 관사·전치사가 아니며
// 둘 다 대문자로 시작하는 것. 대소문자까지 같아야 친다. 예: "The Kanban Guide (May 2025)"의 "Kanban
// Guide", "V-Modell XT: Das …"의 "V-Modell XT". 낱말 하나는 치지 않는다. 개념 이름(Kanban)과 겹친다.
// 소문자 낱말이 낀 짝(Functional safety, Road vehicles)은 표준 제목의 일반 낱말이라 치지 않는다.
const titleStopwords = new Set(
  ["the", "a", "an", "of", "and", "or", "for", "to", "in", "on", "with", "by", "from"].flatMap(
    (word) => [word, word[0].toUpperCase() + word.slice(1)],
  ),
)

export function titleNames(title: string): string[] {
  const words = title.split(/[\s:;,()[\]{}—–]+/)
  const found: string[] = []
  for (let i = 0; i + 1 < words.length; i++) {
    const pair = [words[i], words[i + 1]]
    if (pair.some((word) => !/[A-Za-z]/.test(word) || titleStopwords.has(word))) continue
    if (pair.every((word) => /^[A-Z]/.test(word))) found.push(pair.join(" "))
  }
  return found
}

// 앞 주장 블록과 출처가 달라 구간을 여는 블록인지. 첫 블록도 구간을 연다. 같은 판의 다른 키가 이으면
// 같은 출처다.
export const opensRun = (list: ClaimBlock[], index: number) =>
  index === 0 || list[index - 1].lastEditions !== list[index].firstEditions

// 구간을 여는 블록이, 같은 판으로 끝난 블록 뒤에 다른 출처의 블록만 끼고 온 것인지. 끼운 블록의 처음과
// 끝을 준다. 끼운 블록이 자기 절을 이루면(앞뒤에 제목이 있으면) 따로 된 절이라 끼움이 아니다. 사이의
// 블록이 이 판을 함께 인용하거나(두 출처가 같이 말하는 문장), 한 블록 안에서 이 판에서 다른 출처로 바뀌면
// (정의를 출처마다 견주는 문단) 끼움으로 보지 않는다. 사이가 세 블록 이상이면 끼운 것이 아니라 다른 출처의
// 이야기가 이어진 것으로 보고, 다시 오는 블록은 출처 표시만 본다.
const maxInserted = 2
export function interleaved(
  page: Page,
  list: ClaimBlock[],
  index: number,
): { before: ClaimBlock; inserted: ClaimBlock[] } | undefined {
  const edition = list[index].firstEditions
  const cites = (editions: string) =>
    edition.split(" + ").every((e) => editions.split(" + ").includes(e))
  let j = index - 1
  while (j >= 0 && !cites(list[j].firstEditions) && !cites(list[j].lastEditions)) j--
  if (j < 0 || j === index - 1 || list[j].lastEditions !== edition) return undefined
  const inserted = list.slice(j + 1, index)
  if (inserted.length > maxInserted) return undefined
  const headings = blocks(page).filter((block) => block.kind === "heading")
  const headingBetween = (from: number, to: number) =>
    headings.some((heading) => heading.start > from && heading.start < to)
  if (
    headingBetween(list[j].end, inserted[0].start) &&
    headingBetween(inserted.at(-1)!.end, list[index].start)
  )
    return undefined
  return { before: list[j], inserted }
}

// 주장 블록의 문장. 인용 없는 문장은 블록 안에서 뒤따르는 인용의 출처를, 마지막 인용 뒤의 문장은 앞 문장의
// 출처를 받는다. 위키링크는 표시 글자만 남긴다.
export interface ClaimSentence {
  line: number
  text: string
  keys: string[]
  editions: string
}

export function claimSentences(page: Page, editions: Map<string, Edition>): ClaimSentence[] {
  const lines = page.masked.split("\n")
  const starts = lineStarts(page.masked)
  return claimBlocks(page, editions).flatMap((claim) => {
    const from = starts[claim.start - 1]
    const text = lines
      .slice(claim.start - 1, claim.end)
      .join("\n")
      .replace(/\[\[[^\]\n]*\]\]|(?<!\\)\|/g, (match) => (match === "|" ? " " : match))
    const list = sentences(text).map((sentence) => ({
      line: lineAt(starts, from + sentence.start),
      text: sentence.text,
      keys: keysOf(sentence.text),
    }))
    for (let i = list.length - 2; i >= 0; i--)
      if (list[i].keys.length === 0) list[i].keys = list[i + 1].keys
    for (let i = 1; i < list.length; i++)
      if (list[i].keys.length === 0) list[i].keys = list[i - 1].keys
    return list.map((sentence) => ({
      ...sentence,
      text: plain(sentence.text),
      editions: editionsOf(sentence.keys, editions),
    }))
  })
}

// 문장 앞의 출처 이름 자리: 라틴 문자로 시작하는 넉 낱말까지의 말 뒤의 주어·소유격 조사나 "…에 따르면",
// "…에서(는)".
// 목록 표시와 초안의 인용 위치 괄호는 떼고 본다. 강조로 여는 문장은 정의하는 주제어가 주어라 보지 않는다.
function leadingName(text: string): string | undefined {
  if (!/^[A-Za-z0-9]/.test(text)) return undefined
  const words = text.split(" ").slice(0, 5)
  for (let i = 0; i < Math.min(words.length, 4); i++) {
    if (/,|\.(?![0-9A-Za-z])/.test(words[i])) return undefined
    const said = words[i].endsWith("에") && words[i + 1] === "따르면"
    const stem = said
      ? words[i].slice(0, -1)
      : words[i].match(/^(.+?)(?:은|는|이|가|의|에서는?)$/)?.[1]
    if (!stem) continue
    return [...words.slice(0, i), stem].join(" ")
  }
  return undefined
}
const according = /^(?:[^.\n]|\.(?=[0-9A-Za-z])){0,40}?에 따르면 /
const strip = (text: string) => text.replace(/^(?:\s*(?:[-*]|\d+\.|>)\s+|\s*\([^()\n]*\)\s*)+/, "")

// 이름을 견줄 때 쓰는 앞 두 낱말. 판 연도는 뗀다(ISO/IEC/IEEE 42010:2022와 ISO/IEC/IEEE 42010). 낱말 하나이고
// 숫자가 없는 이름(Kanban, AUTOSAR)은 개념 이름과 겹쳐 견주지 않는다.
function nameKey(name: string): string | undefined {
  const words = name.split(" ").slice(0, 2)
  if (words.length === 2 && /[가-힣]/.test(words[1])) words.pop()
  const key = words.join(" ").replace(/[:-](?:19|20)[0-9]{2}$/, "")
  return key.includes(" ") || /[0-9]/.test(key) ? key : undefined
}

// 이름이 판 표시나 제목 안에서 한 낱말로 끝나는 자리. ISO 26262는 ISO 26262-1:2018의 이름이 아니다.
const nameIn = (name: string) =>
  new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(name)}(?![A-Za-z0-9]|-(?!(?:19|20)[0-9]{2}))`)

// 이름이 그 문장의 출처를 가리키는지: 판 표시(ISO/IEC/IEEE 15288:2023)나 엔트리 제목에 이름이 들거나, 이름의 첫
// 낱말이 키의 발행기관 마디(vda)이거나 제목에 든 대문자 약어(ASPICE)다. 표준 기구로 시작하는 이름은 판 표시와
// 제목만 본다. 기구의 해설 자료(IEC의 FAQ)가 표준(IEC 61508)을 주어로 쓰는 문장은 출처가 아니라 주제를 말하기
// 때문이다. 제목 낱말로는 약어만 본다. 제목의 다른 낱말(The Scrum Guide의 Scrum)은 개념 이름과 겹친다.
// 표의 문서 모음은 표의 이름만 본다. 쪽 제목과 키 마디로 보면 모음 이름으로 시작하는 규격·개념 이름(CiA 301,
// CVE ID)이 출처 이름으로 잡히기 때문이다.
const bodyFirst = new RegExp(`^(?:${standardBodies})(?![A-Za-z])`)
function isSource(name: string, keys: string[], editions: Map<string, Edition>): boolean {
  const first = name.split(" ")[0]
  return keys.some((key) => {
    const edition = editions.get(key)
    if (edition?.collection) return edition.names.some((source) => nameIn(name).test(source))
    const title = (edition?.title ?? "").replace(/Automotive SPICE/g, "ASPICE")
    if (nameIn(name).test(edition?.id ?? key) || nameIn(name).test(title)) return true
    if (bodyFirst.test(first)) return false
    return (
      (/^[A-Z]{3,}$/.test(first) && title.split(/[\s:;,()]+/).includes(first)) ||
      key.split("-")[0] === first.toLowerCase()
    )
  })
}

// 판에서 무엇이 바뀌었는지 말하는 이력 문장. 판 주어는 주장의 일부라 그대로 둔다(위키 검증의 좁혀 쓰기).
// 과거 시제는 "다" 앞 음절의 받침 ㅆ으로 본다(바꿨다, 대체했다, 넣었다). "있다"는 과거가 아니다.
function history(text: string): boolean {
  const end = text.replace(/(?:\[@[^\]\n]*\])*$/, "").match(/(.)다\.?$/)?.[1]
  if (!end || end === "있") return false
  const code = end.charCodeAt(0) - 0xac00
  return code >= 0 && code < 11172 && code % 28 === 20
}

export interface RepeatedName {
  line: number
  text: string
  earlier: { line: number; name: string } // 같은 구간에서 그 이름이 먼저 나온 문장
}

// 문장마다 같은 구간의 앞 문장들. 구간은 판이 바뀌면 끊고, 합의 문서의 구간은 절(`##`, `###`)이 바뀌어도
// 끊는다(위키 검증의 합의 문서). 같은 합의 문서만 인용한 일반 명제는 판이 같아 구간을 끊지 않는다.
function sentencesInRuns(
  page: Page,
  editions: Map<string, Edition>,
): { sentence: ClaimSentence; earlier: ClaimSentence[] }[] {
  const list = claimSentences(page, editions)
  const headings = blocks(page)
    .filter((block) => block.kind === "heading" && /^#{2,3} /.test(block.text))
    .map((block) => block.start)
  const section = (line: number) => headings.filter((start) => start < line).length
  let start = 0
  return list.map((sentence, index) => {
    const previous = list[index - 1]
    if (
      !previous ||
      previous.editions !== sentence.editions ||
      (allConsensus(sentence.keys) && section(previous.line) !== section(sentence.line))
    )
      start = index
    return { sentence, earlier: list.slice(start, index) }
  })
}

// 출처 구간 안에서 앞서 밝힌 출처 이름을 주어나 소유격, "…에 따르면"으로 다시 쓴 문장. 구간은 문장의 판이
// 바뀌는 자리와, 합의 문서의 구간이면 절이 바뀌는 자리에서 끊는다. 문장 앞의 이름이 출처 표시이고 그 이름이
// 같은 구간의 앞 문장에 이미 나왔거나, 출처 표시가 있는 앞 문장 뒤에서 "…에 따르면"으로 시작하는 문장을
// 찍는다. 합의 문서 구간 안의 "이 강의계획서에 따르면"은 가리키는 말이라 되풀이가 아니다.
export function repeatedNames(page: Page, editions: Map<string, Edition>): RepeatedName[] {
  const found: RepeatedName[] = []
  sentencesInRuns(page, editions).forEach(({ sentence, earlier }) => {
    const text = strip(sentence.text)
    const name = text.startsWith("**") ? undefined : leadingName(text)
    if (history(text)) return
    const key = name ? nameKey(name) : undefined
    const keyAt = key && isSource(key, sentence.keys, editions) ? nameIn(key) : undefined
    const pointer = allConsensus(sentence.keys) && opensWithPointer.test(text)
    // 같은 절에 같은 단체의 출판물이 둘이면 판을 붙인 이름 뒤에 짧은 이름("CTFL 강의계획서")을 쓴다.
    const short = consensusWithoutEdition.exec(text)
    consensusWithoutEdition.lastIndex = 0
    if (
      allConsensus(sentence.keys) &&
      short?.index === 0 &&
      shortNameAllowed(
        earlier.map((other) => other.text).join("\n"),
        sectionText(page.masked, sentence.line),
        short[0],
      )
    )
      return
    const named = keyAt
      ? earlier.find((other) => keyAt.test(other.text))
      : according.test(text) && !pointer
        ? earlier.find((other) => namesSource(other.text, other.keys, editions))
        : undefined
    if (named)
      found.push({
        line: sentence.line,
        text,
        earlier: { line: named.line, name: key ?? text.match(according)![0].trim() },
      })
  })
  return found
}

// 합의 문서 구간을 가리키는 말("이 강의계획서는")로 여는 문장. 새 절이나 다른 출처의 문장 뒤라서 같은 구간의
// 앞 문장이 이름을 밝히지 않았는데 가리키는 말을 쓴 곳이다. 앞 문장의 가리키는 말은 이름으로 치지 않는다.
export function pointerOpenings(
  page: Page,
  editions: Map<string, Edition>,
): { line: number; text: string }[] {
  const found: { line: number; text: string }[] = []
  sentencesInRuns(page, editions).forEach(({ sentence, earlier }) => {
    const text = strip(sentence.text)
    if (!allConsensus(sentence.keys) || !opensWithPointer.test(text)) return
    const named = earlier.some((other) =>
      namesSource(other.text.replace(pointerPhrases, ""), other.keys, editions),
    )
    if (!named) found.push({ line: sentence.line, text })
  })
  return found
}
