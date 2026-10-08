import { fieldsOf, type Page, type Tree } from "../check-content/tree"
import type { Candidate, Context } from "./items"
import { excerpt, lineAt, lineStarts, standardBodies } from "./text"

// 첫 등장 링크: 다른 페이지의 제목이나 alias가 페이지에 처음 나오는 자리가 더한 줄인데 그 자리에 링크가
// 없는 곳. 규칙은 위키 규약의 위키링크 절이다. 제목이 다른 페이지 이름인 영문 낱말로 시작하면 그 낱말을
// 뗀 이름도 찾는다. 본문은 "CAN 오류 프레임"을 "오류 프레임"으로, "AUTOSAR Diagnostic Management"를
// "Diagnostic Management"로 부르기 때문이다. 뗀 이름이 낱말 하나면 너무 흔해("OS", "트랜시버") 찾지 않는다.
// 아래 경우는 찍지 않는다.
// - 더 긴 다른 페이지 이름의 일부인 일치. 예: "CAN 오버로드 프레임"의 CAN
// - 판이나 릴리스가 뒤따르는 표준 기구 이름. 개념이 아니라 문서의 발행기관이다. 예: "AUTOSAR R25-11의 BswM 명세"
// - 링크 글자 안의 일치. 하위 개념에 거는 절 링크(`[[can-fd#FD 프레임|CAN FD 프레임]]`)도 여기 든다.
//   이 절 링크는 그 페이지로 가는 링크로 세지 않는다.
// - 주제 개념을 링크 글자로 쓴 절 링크(안내 문장의 `[[X#절|X]]`)가 있는 페이지 X. 이 링크가 X 링크를 겸한다.
// - `X의 [[X#Y|Y]]` 꼴의 X. Y의 절 링크가 X 링크를 겸한다.

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

const blank = (text: string) => text.replace(/[^\n]/g, " ")
const wordChar = /[\p{L}\p{N}]/u
const latinEdge = /[A-Za-z0-9]/
const publisher = new RegExp(`^(?:${standardBodies})$`)

// 이름을 찾을 글. 제목, 인용, URL, 도해, HTML, 식은 지운다. 오프셋을 원문과 맞추려고 공백으로 바꾼다.
function nameText(page: Page): string {
  return page.masked
    .replace(/^#{1,6} .*$/gm, blank)
    .replace(/!\[\[[^\]\n]*\]\]/g, blank)
    .replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g, blank)
    .replace(/\[@[^\]\n]*\]/g, blank)
    .replace(/https?:\/\/\S+/g, blank)
    .replace(/<[^>\n]+>/g, blank)
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

export function pageNames(page: Page): string[] {
  const fields = fieldsOf(page)
  const aliases = Array.isArray(fields.aliases) ? fields.aliases : []
  return [fields.title, ...aliases].filter(
    (name): name is string => typeof name === "string" && name.length >= 2,
  )
}

// 이름마다 그 이름을 가진 페이지.
export function nameIndex(tree: Tree): Map<string, Page[]> {
  const index = new Map<string, Page[]>()
  const add = (name: string, page: Page) => index.set(name, [...(index.get(name) ?? []), page])
  const pages = tree.pages.filter((page) => page.kind === "page")
  for (const page of pages) for (const name of new Set(pageNames(page))) add(name, page)
  for (const page of pages) {
    for (const name of pageNames(page)) {
      const [head, ...rest] = name.split(" ")
      const short = rest.join(" ")
      if (rest.length < 2 || !/^[A-Za-z]/.test(head) || index.has(short)) continue
      if (index.get(head)?.some((other) => other !== page)) add(short, page)
    }
  }
  return index
}

// 링크 글자, 강조, 약어 풀이 밖에서 이름이 나오는 자리. 더 긴 이름에 든 자리는 뺀다. 강조는 이 페이지가
// 정의하는 이름이고, 약어 풀이(`GMII(Gigabit Media Independent Interface)`)는 다른 개념의 이름이다.
function hits(text: string, index: Map<string, Page[]>): Hit[] {
  const spans = [
    ...links(text),
    ...[...text.matchAll(/\*\*[^*\n]+\*\*|(?<=[A-Za-z0-9]\**)\([^()\n]*\)/g)].map((m) => ({
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
  return found.filter((hit) =>
    found.every(
      (other) =>
        other === hit ||
        !(other.start <= hit.start && hit.end <= other.end) ||
        other.end - other.start <= hit.end - hit.start,
    ),
  )
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
    if (toOther.some((link) => link.anchor && names.includes(link.display))) continue
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
