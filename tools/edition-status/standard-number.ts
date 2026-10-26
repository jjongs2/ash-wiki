// 엔트리와 표준 페이지 제목의 표준 번호. 판 확인(publications.ts, 통로)과 콘텐츠 검사기의 frontmatter 검사가
// 함께 읽는다. 다른 모듈을 가져오지 않아, 검사기가 판 확인의 나머지를 싣지 않고 쓴다.

// 제목 머리의 표준 번호. 발행기관 묶음(ISO/IEC/IEEE 등), 종류와 단계(PAS, TR, CD, DIS 등), 번호(부 포함), 판 연도다.
// IEEE 프로젝트(P802.3dm)의 P는 번호에서 떼고 project로 적는다.
export interface StandardNumber {
  bodies: string[] // 예: ["ISO", "IEC", "IEEE"]
  stages: string[] // 예: ["DIS"], ["PAS"], ["Std"]
  number: string // 예: 13400-2, 802.1Q, J3061
  year?: string
  project: boolean
}

// 단계와 종류는 머리에 붙거나(ISO/CD 15765-2, ISO/PAS 8800) 띄어 온다(ISO/IEC/IEEE DIS 29148, ISO/IEC TR 29119-6, ISO/IEC Guide 51).
// 판의 종류(ISO/PAS, ISO/IEC TR, ISO/IEC Guide)
export const kindStages = ["PAS", "TR", "TS", "Guide"]
const stagePattern = ["PWI", "NP", "AWI", "WD", "CD", "DIS", "FDIS", "PRF", ...kindStages].join("|")
const referencePattern = new RegExp(
  `^((?:ISO|IEC|IEEE|SAE)(?:/(?:ISO|IEC|IEEE|SAE|${stagePattern}))*)((?: (?:${stagePattern}|Std))*) (P?)` +
    "([A-Z]?[0-9][0-9A-Za-z.]*(?:-[0-9]{1,3}(?![0-9]))*)(?:[:-]((?:19|20)[0-9]{2})(?![0-9]))?",
)
const bodyNames = new Set(["ISO", "IEC", "IEEE", "SAE"])
export const projectStages = new Set(["PWI", "NP", "AWI", "WD", "CD", "DIS", "FDIS", "PRF"])

export function standardNumber(title: string): StandardNumber | undefined {
  const match = title.match(referencePattern)
  if (!match) return undefined
  const [, head, stageText, p, number, year] = match
  const bodies = head.split("/").filter((part) => bodyNames.has(part))
  const stages = [
    ...head.split("/").filter((part) => !bodyNames.has(part)),
    ...stageText.split(" ").filter(Boolean),
  ]
  const project = p === "P" || stages.some((stage) => projectStages.has(stage))
  return { bodies, stages, number, year, project }
}

// 표준 번호로 쓰는 표준 페이지(ISO 26262)는 같은 번호와 그 부(26262-1)를 한 출판물로 담는다. 발행기관 묶음은
// 하나만 겹치면 된다(ISO/IEC/IEEE 29119 페이지의 ISO/IEC TR 29119-6).
export function inSeries(series: StandardNumber, number: StandardNumber): boolean {
  return (
    series.bodies.some((body) => number.bodies.includes(body)) &&
    (number.number === series.number || number.number.startsWith(`${series.number}-`))
  )
}

// 시리즈의 부마다 인용한 가장 새 판의 연도. 연도가 없거나 프로젝트(DIS 등)인 엔트리는 판이 아니라 세지 않는다.
// 예: ISO/IEC/IEEE 29119 → 29119-1은 2022, 29119-5는 2024. 옛 판(26262-1:2011)은 같은 부의 새 판에 가린다.
export function latestPartYears(series: StandardNumber, titles: string[]): Map<string, string> {
  const latest = new Map<string, string>()
  for (const title of titles) {
    const number = standardNumber(title)
    if (!number?.year || number.project || !inSeries(series, number)) continue
    if (number.year > (latest.get(number.number) ?? "")) latest.set(number.number, number.year)
  }
  return latest
}
