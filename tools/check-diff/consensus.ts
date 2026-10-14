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

// 판 없는 합의 문서 이름을 주어나 "…에 따르면"으로 쓴 곳. 강의계획서는 자격 이름 바로 뒤에 "강의계획서"가 오면
// 판이 없는 것이다(판을 붙이면 "ISTQB CTFL v4.0.1 강의계획서"). 자격 이름 뒤의 풀이 괄호는 건너뛴다. 지식 체계는
// 판(V4.0a)이 뒤따르지 않는 SWEBOK이다. 판 없이 고쳐지는 온라인 용어집(ISTQB 용어집)은 이름만 쓰므로 찍지 않는다.
// 기술 보고서(ISO/IEC TR)는 판 연도를 붙인 표준 번호로 적으므로 표준 이름과 함께 standardSentence가 본다.
export const consensusWithoutEdition =
  /(?<![A-Za-z0-9-])(?:(?:ISTQB )?(?:CTFL|CTAL-[A-Z]+|CT-[A-Za-z]+)(?:\([^()\n]*\))?|ISTQB) 강의계획서(?:은|는|이|가|에 따르면) |(?<![A-Za-z0-9-])SWEBOK(?: Guide)?(?:은|는|이|가|에 따르면) /g
