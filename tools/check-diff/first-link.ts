import type { Page, Tree } from "../check-content/tree"
import type { Candidate, Context } from "./items"
import {
  blank,
  dropCovered,
  escapeRegExp,
  excerpt,
  latinEdge,
  latinGloss,
  lineAt,
  lineStarts,
  maskRefs,
  pageNames,
  standardBodies,
} from "./text"

// 첫 등장 링크: 다른 페이지의 제목이나 alias가 페이지에 처음 나오는 자리가 더한 줄인데 그 자리에 링크가
// 없는 곳. 규칙과 예외는 위키 규약의 위키링크 절이고, 여기 있는 것은 이름을 찾는 패턴이다.
// - 제목이 다른 페이지 이름인 영문 낱말로 시작하면 그 낱말을 뗀 이름도 찾는다. 본문은 "CAN 오류 프레임"을
//   "오류 프레임"으로 부른다. 뗀 이름이 낱말 하나면 너무 흔해("OS", "트랜시버") 찾지 않는다.
// - 더 긴 다른 페이지 이름의 일부인 일치는 그 이름으로 센다. 예: "CAN 오버로드 프레임"의 CAN
// - 판이 뒤따르는 표준 기구 이름은 개념이 아니라 문서의 발행기관이다. 예: "AUTOSAR R25-11의 BswM 명세"

interface Link {
  start: number
  end: number
  target: string
  anchor: boolean
  display: string
}

interface Hit {
  start: number
  end: number
  name: string
  pages: Page[]
}

const wordChar = /[\p{L}\p{N}]/u
const publisher = new RegExp(`^(?:${standardBodies})$`)
const abbreviation = /^[A-Z][A-Z0-9/.-]*[A-Z0-9]s?(?: [A-Z][A-Z0-9/.-]*[A-Z0-9]s?)*$/ // TSN, CAN FD, SOME/IP

// 이름을 찾을 글. 절 제목도 지운다.
function nameText(page: Page): string {
  return maskRefs(page.masked).replace(/^#{1,6} .*$/gm, blank)
}

function links(text: string): Link[] {
  return [...text.matchAll(/\[\[([^\]\n]+?)\]\]/g)].map((match) => {
    const [ref, display] = match[1].split(/\\?\|/)
    const [target, anchor] = ref.split("#")
    return {
      start: match.index,
      end: match.index + match[0].length,
      target: target.trim(),
      anchor: anchor !== undefined,
      display: (display ?? anchor ?? target).trim(),
    }
  })
}

// 이름마다 그 이름을 가진 페이지.
export function nameIndex(tree: Tree): Map<string, Page[]> {
  const index = new Map<string, Page[]>()
  const add = (name: string, page: Page) => index.set(name, [...(index.get(name) ?? []), page])
  const pages = tree.pages.filter((page) => page.kind === "page")
  for (const page of pages) for (const name of new Set(pageNames(page))) add(name, page)
  // 뗀 이름이 두 페이지에서 나오면 어느 페이지인지 몰라 쓰지 않는다.
  const shortened = new Map<string, Page[]>()
  for (const page of pages) {
    for (const name of pageNames(page)) {
      const [head, ...rest] = name.split(" ")
      const short = rest.join(" ")
      if (rest.length < 2 || !/^[A-Za-z]/.test(head) || index.has(short)) continue
      if (index.get(head)?.some((other) => other !== page))
        shortened.set(short, [...new Set([...(shortened.get(short) ?? []), page])])
    }
  }
  for (const [short, owners] of shortened) if (owners.length === 1) add(short, owners[0])
  return index
}

// 링크 글자, 강조, 풀이 괄호 밖에서 이름이 나오는 자리. 더 긴 이름에 든 자리는 뺀다. 강조는 이 페이지가
// 정의하는 이름이고, 풀이 괄호 안은 다른 개념의 이름이다.
function hits(text: string, index: Map<string, Page[]>): Hit[] {
  const spans = [
    ...links(text),
    ...[...text.matchAll(/\*\*[^*\n]+\*\*/g), ...text.matchAll(latinGloss)].map((m) => ({
      start: m.index,
      end: m.index + m[0].length,
    })),
  ]
  const found: Hit[] = []
  for (const [name, pages] of index) {
    for (let at = text.indexOf(name); at >= 0; at = text.indexOf(name, at + 1)) {
      const end = at + name.length
      if (at > 0 && wordChar.test(text[at - 1])) continue
      if (latinEdge.test(name.at(-1)!) && end < text.length && latinEdge.test(text[end])) continue
      if (spans.some((link) => at < link.end && end > link.start)) continue
      if (publisher.test(name) && /^ [A-Z]?[0-9]/.test(text.slice(end, end + 3))) continue
      found.push({ start: at, end, name, pages })
    }
  }
  return dropCovered(found)
}

export function firstLinkCandidates(
  index: Map<string, Page[]>,
  page: Page,
  added: Set<number>,
): Candidate[] {
  const text = nameText(page)
  const starts = lineStarts(text)
  const list = links(text)
  // 이 페이지의 이름은 찍지 않지만, 그 안에 든 다른 이름을 덮으려고 함께 찾는다.
  const own = new Set(pageNames(page))
  const firstHit = new Map<Page, Hit>()
  for (const hit of hits(text, index).sort((a, b) => a.start - b.start)) {
    if (own.has(hit.name)) continue
    for (const other of hit.pages) {
      if (other !== page && !firstHit.has(other)) firstHit.set(other, hit)
    }
  }
  const found: Candidate[] = []
  for (const [other, hit] of firstHit) {
    const names = pageNames(other)
    const toOther = list.filter((link) => link.target === other.name)
    // 위키링크 절의 예외: 주제 개념을 링크 글자로 쓴 절 링크와 `X의 [[X#Y|Y]]`, 약어 X가 처음 나오는
    // 자리의 `[[X#Y|X Y]]`는 X 링크를 겸하고, 하위 개념의 절 링크는 X 링크로 세지 않는다.
    if (toOther.some((link) => link.anchor && names.includes(link.display))) continue
    const leading = (link: Link) =>
      names.some(
        (name) =>
          abbreviation.test(name) &&
          new RegExp(`^${escapeRegExp(name)}(?:의)? `).test(link.display),
      )
    if (toOther.some((link) => link.anchor && link.start < hit.start && leading(link))) continue
    const pageLink = toOther.find((link) => !link.anchor)
    if (pageLink && pageLink.start < hit.start) continue
    const after = text.slice(hit.end).replace(/^\*+/, "")
    if (after.startsWith(`의 [[${other.name}#`)) continue
    const line = lineAt(starts, hit.start)
    if (!added.has(line)) continue
    const shown = text.slice(hit.start, hit.end)
    const lineText = text.slice(starts[line - 1], starts[line] ?? text.length)
    found.push({
      file: page.file,
      line,
      message: `[[${other.name}]]의 "${shown}"이 처음 나오는 자리에 링크가 없다${pageLink ? `(링크는 ${lineAt(starts, pageLink.start)}줄)` : ""}: ${excerpt(lineText)}`,
    })
  }
  return found
}

export const firstLinkItem = ({ tree, changed }: Context): Candidate[] => {
  const index = nameIndex(tree)
  return changed.flatMap(({ page, change }) => firstLinkCandidates(index, page, change.added))
}
