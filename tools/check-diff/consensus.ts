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

// 짧은 이름("CTFL 강의계획서")을 쓸 수 있는 자리인지. 같은 절에 같은 단체의 합의 문서가 둘 이상 나왔고(인용
// 키나 본문의 이름), 그 출판물을 같은 절의 앞 글이 판을 붙여 밝혔어야 한다(위키 검증의 합의 문서). 본문에
// 이름만 나온 출판물도 세는 것은 가리키는 말이 어느 쪽인지 모호해지기 때문이다. 출판물은 자격 이름(CTFL,
// CTAL-TA)이나 SWEBOK으로 가린다.
export function shortNameAllowed(before: string, section: string, name: string): boolean {
  const code = name.match(qualification)?.[0]
  if (!code) return false
  const body = code === "SWEBOK" ? "ieee" : "istqb"
  const cited = [...section.matchAll(/\[@([^\]\s]+)\]/g)]
    .map((m) => m[1])
    .filter((key) => isConsensus(key) && key.split("-")[0] === body)
    .map(publicationOf)
  const named = [...section.replace(/\[@[^\]]*\]/g, "").matchAll(new RegExp(qualification, "g"))]
    .map((m) => m[0])
    .filter((other) => (other === "SWEBOK" ? "ieee" : "istqb") === body)
    .map((other) => other.toLowerCase())
  const glossary = body === "istqb" && /ISTQB 용어집/.test(section) ? ["glossary"] : []
  if (new Set([...cited, ...named, ...glossary]).size < 2) return false
  const edition =
    code === "SWEBOK"
      ? /SWEBOK V[0-9]/
      : new RegExp(`(?<![A-Za-z0-9-])${code}(?:\\([^()\\n]*\\))? v?[0-9][0-9.]* 강의계획서`)
  return edition.test(before)
}

const qualification = "(?<![A-Za-z0-9-])(?:CTFL|CTAL-[A-Z]+|CT-[A-Za-z]+|SWEBOK)(?![A-Za-z0-9-])"

// 판을 뗀 출판물을 자격 이름의 소문자로(ctfl, ctal-ta). 판 없이 고쳐지는 용어집의 용어 쪽들과 지식 체계의
// 판들은 하나로 센다.
function publicationOf(key: string): string {
  if (key.startsWith("istqb-glossary-")) return "glossary"
  if (key.startsWith("ieee-swebok-")) return "swebok"
  return key
    .replace(/^istqb-/, "")
    .replace(/-(?:19|20)[0-9]{2}$/, "")
    .replace(/-syllabus$/, "")
}

// 줄이 든 절(`##`, `###`)의 글.
export function sectionText(source: string, line: number): string {
  const lines = source.split("\n")
  let start = line - 1
  while (start > 0 && !/^#{2,3} /.test(lines[start - 1])) start--
  let end = line
  while (end < lines.length && !/^#{2,3} /.test(lines[end])) end++
  return lines.slice(start, end).join("\n")
}

// 기술 보고서(ISO/IEC TR)는 판 연도를 붙인 표준 번호로 적으므로 표준 이름과 함께 standardSentence가 본다.
export const consensusWithoutEdition =
  /(?<![A-Za-z0-9-])(?:(?:ISTQB )?(?:CTFL|CTAL-[A-Z]+|CT-[A-Za-z]+)(?:\([^()\n]*\))?|ISTQB) 강의계획서(?:은|는|이|가|도|에 따르면) |(?<![A-Za-z0-9-])SWEBOK(?: Guide)?(?:은|는|이|가|도|에 따르면) /g
