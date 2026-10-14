import fs from "node:fs"
import path from "node:path"
import { Conventions } from "../check-content/conventions"
import { repoRoot } from "../repo"

// 합의 문서로 보는 인용 키. 목록의 정본은 docs/wiki-verification.md 합의 문서 절의 consensus-keys 표다.
const verificationPath = path.join(repoRoot, "docs", "wiki-verification.md")
const prefixes = new Conventions(
  fs.readFileSync(verificationPath, "utf8"),
  verificationPath,
).column("consensus-keys", "키 접두")

export const isConsensus = (key: string) => prefixes.some((prefix) => key.startsWith(prefix))
export const allConsensus = (keys: string[]) => keys.length > 0 && keys.every(isConsensus)

// 합의 문서 구간 안에서 출판물을 가리키는 말. 같은 절에서 이름을 밝힌 구간 안에서만 쓴다.
const pointerWords = "이 (?:강의계획서|지식 체계|용어집|기술 보고서|보고서)"
export const opensWithPointer = new RegExp(`^${pointerWords}`) // 가리키는 말로 시작하는 문장
export const pointerPhrases = new RegExp(`(?<![가-힣])${pointerWords}(?:에 따르면)?`, "g") // 문장 안의 가리키는 말

// 짧은 이름("CTFL 강의계획서")이 가리키는 출판물을 같은 절의 앞 글이 판을 붙여 밝혔는지. 같은 절에 같은
// 단체의 출판물이 둘이면 판을 붙인 이름은 구간을 여는 문장에만 두고, 이어지는 문장은 짧은 이름을 쓴다(위키
// 검증의 합의 문서). 출판물은 자격 이름(CTFL, CTAL-TA)이나 SWEBOK으로 가린다.
export function editionNamedBefore(before: string, name: string): boolean {
  const code = name.match(/CTFL|CTAL-[A-Z]+|CT-[A-Za-z]+|SWEBOK/)?.[0]
  if (!code) return false
  const named =
    code === "SWEBOK"
      ? /SWEBOK V[0-9]/
      : new RegExp(`(?<![A-Za-z0-9-])${code}(?:\\([^()\\n]*\\))? v?[0-9][0-9.]* 강의계획서`)
  return named.test(before)
}

// 판 없는 합의 문서 이름을 주어나 "…에 따르면"으로 쓴 곳. 강의계획서는 자격 이름 바로 뒤에 "강의계획서"가 오면
// 판이 없는 것이다(판을 붙이면 "ISTQB CTFL v4.0.1 강의계획서"). 자격 이름 뒤의 풀이 괄호는 건너뛴다. 지식 체계는
// 판(V4.0a)이 뒤따르지 않는 SWEBOK이다. 판 없이 고쳐지는 온라인 용어집(ISTQB 용어집)은 이름만 쓰므로 찍지 않는다.
// 기술 보고서(ISO/IEC TR)는 판 연도를 붙인 표준 번호로 적으므로 표준 이름과 함께 standardSentence가 본다.
export const consensusWithoutEdition =
  /(?<![A-Za-z0-9-])(?:(?:ISTQB )?(?:CTFL|CTAL-[A-Z]+|CT-[A-Za-z]+)(?:\([^()\n]*\))?|ISTQB) 강의계획서(?:은|는|이|가|도|에 따르면) |(?<![A-Za-z0-9-])SWEBOK(?: Guide)?(?:은|는|이|가|도|에 따르면) /g
