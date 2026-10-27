import type { Candidate, Context } from "./items"
import {
  anchorSection,
  heading,
  lineAt,
  lineStarts,
  linkDisplays,
  linkedPage,
  maskRefs,
  pageNames,
} from "./text"

// 절 링크의 대상 절: 더한 줄의 `[[대상#절|링크 글자]]` 가운데 링크 글자가 대상 절(그 아래 절까지)에 나오지
// 않거나, 앵커 절 밖에 링크 글자와 같은 절 제목이나 강조가 있는 것. 다른 절이나 머리말에서 정의되는 개념일
// 수 있다. 규칙은 위키 규약의 위키링크 절이다. 링크 글자가 대상 절의 낱말과 꼴만 다른 경우(번역어와 원어,
// 약어와 풀이)가 많아 판정은 사람이 한다.
// - 링크 글자가 대상의 title이나 alias면 주제 개념을 건 링크라 넘긴다. `<이름>의 Y`와 붙여 쓴 `<이름> Y`는
//   Y로 본다(`[[tsn#프로파일|TSN 프로파일]]`).
// - 대소문자만 다른 것은 같다고 본다.
const sectionLink = /\[\[([^\]\n|#\\]+)#([^\]\n|\\^][^\]\n|\\]*)\\?\|([^\]\n]+)\]\]/g

export const sectionLinkItem = ({ tree, changed }: Context): Candidate[] =>
  changed.flatMap(({ page, change }) => {
    const text = maskRefs(page.masked)
    const starts = lineStarts(text)
    return [...text.matchAll(sectionLink)].flatMap((match) => {
      const [link, target, anchor, display] = match
      const line = lineAt(starts, match.index)
      if (!change.added.has(line)) return []
      const linked = linkedPage(tree, target)
      if (!linked) return []
      const { lines, range, text: section } = anchorSection(linked, anchor)
      const word = subject(display.trim().toLowerCase(), pageNames(linked))
      if (word === undefined) return []
      const reasons: string[] = []
      if (!section.toLowerCase().includes(word)) reasons.push("대상 절에 없다")
      // 앵커 절 밖의 절 제목과 강조. 그 아래 절은 앵커 절이 다루는 것이다.
      let current = "머리말"
      lines.forEach((raw, index) => {
        const shown = linkDisplays(raw)
        const title = heading(shown)
        if (title) current = shown.trim()
        if (range && index >= range.start && index < range.end) return
        if (title?.[2].trim().toLowerCase() === word) reasons.push(`다른 절 제목 \`${current}\``)
        const emphasized = [...shown.matchAll(/\*\*([^*\n]+)\*\*/g)]
        if (emphasized.some((m) => m[1].trim().toLowerCase() === word))
          reasons.push(`다른 절의 강조(${current})`)
      })
      if (reasons.length === 0) return []
      return [{ file: page.file, line, message: `${link}: ${[...new Set(reasons)].join(", ")}` }]
    })
  })

// 링크 글자에서 대상의 이름을 뗀 말. 링크 글자가 대상의 이름이면 undefined다.
function subject(display: string, names: string[]): string | undefined {
  const lower = names.map((name) => name.toLowerCase())
  if (lower.includes(display)) return undefined
  const prefix = lower
    .flatMap((name) => [`${name}의 `, `${name} `])
    .filter((p) => display.startsWith(p))
    .sort((a, b) => b.length - a.length)[0]
  return prefix ? display.slice(prefix.length).trim() : display
}
