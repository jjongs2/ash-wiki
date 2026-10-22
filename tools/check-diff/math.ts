import type { Candidate, Context } from "./items"
import { excerpt } from "./text"

// 인라인 식: 더한 줄의 인라인 식 가운데 한 변의 맨 위 수준 항이 셋 이상이거나 `\frac`이 든 것. 규약은
// 이런 식을 디스플레이로 쓰게 한다. 괄호와 첨자 안의 항은 세지 않는다. 예: `64(1 + a) - 4`는 항이 둘이다.
// `$$`는 인라인 구분자 둘로 읽지 않는다.
const inlineMath = /(?<![\\$])\$(?!\$)((?:\\.|[^$\\\n])+?)\$(?!\$)/g

const relations = new Set([
  "le",
  "leq",
  "ge",
  "geq",
  "lt",
  "gt",
  "ne",
  "neq",
  "approx",
  "equiv",
  "sim",
  "ll",
  "gg",
])
const signs = new Set(["pm", "mp"])
const opens = new Set(["(", "[", "{"])
const closes = new Set([")", "]", "}"])

// 관계 기호로 나눈 변마다 맨 위 수준의 덧셈·뺄셈으로 나뉘는 항의 수. 변 머리의 부호는 항을 가르지 않는다.
export function termCounts(math: string): number[] {
  const counts: number[] = []
  let terms = 0
  let operand = false
  let depth = 0
  const endSide = () => {
    counts.push(operand ? terms + 1 : terms)
    terms = 0
    operand = false
  }
  for (let i = 0; i < math.length; i++) {
    const char = math[i]
    let token = char
    if (char === "\\") {
      const name = math.slice(i + 1).match(/^[A-Za-z]+/)?.[0] ?? math[i + 1] ?? ""
      token = `\\${name}`
      i += name.length
    }
    if (opens.has(char) || token === "\\{") {
      depth++
      operand = true
    } else if (closes.has(char) || token === "\\}") depth = Math.max(0, depth - 1)
    else if (depth > 0 || /\s/.test(char)) continue
    else if (char === "_" || char === "^") {
      // 중괄호 없는 첨자는 다음 글자 하나다.
      if (math[i + 1] !== "{" && math[i + 1] !== "\\") i++
    } else if (char === "=" || char === "<" || char === ">" || relations.has(token.slice(1)))
      endSide()
    else if (char === "+" || char === "-" || signs.has(token.slice(1))) {
      if (operand) terms++
      operand = false
    } else if (token !== "\\," && token !== "\\;" && token !== "\\!") operand = true
  }
  endSide()
  return counts
}

export const inlineMathItem = ({ changed }: Context): Candidate[] =>
  changed.flatMap(({ page, change }) => {
    const lines = page.masked.split("\n")
    return [...change.added]
      .sort((a, b) => a - b)
      .flatMap((line) =>
        [...(lines[line - 1] ?? "").matchAll(inlineMath)].flatMap((match) => {
          const most = Math.max(...termCounts(match[1]))
          const reasons = [
            ...(most >= 3 ? [`한 변의 항 ${most}개`] : []),
            ...(/\\[dt]?frac/.test(match[1]) ? ["\\frac"] : []),
          ]
          if (reasons.length === 0) return []
          return [
            {
              file: page.file,
              line,
              message: `디스플레이로 쓸 인라인 식(${reasons.join(", ")}): ${excerpt(match[0])}`,
            },
          ]
        }),
      )
  })
