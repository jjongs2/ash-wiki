import type { Row } from "../check-content/conventions"
import type { Entry } from "./model"

// 덮음 검사. 인용 엔트리는 통로가 맡거나(감지하지 않음 표 포함), 대상 아님 표에 들거나, 논문·단행본 꼴이어야 한다.
// 어디에도 들지 않은 엔트리 가운데 아는 발행기관(통로가 맡거나 대상 아님에 든 엔트리의 발행기관)의 것으로
// 제목에 표준 번호나 판 표시가 있으면 미분류(FAIL)이고, 나머지는 목록으로만 보인다.
// 기준은 docs/wiki-verification.md의 판 확인 절에 있다.
export interface NotTargetRow {
  publisher: RegExp
  entries: RegExp
}

export function notTargetRows(rows: Row[]): NotTargetRow[] {
  return rows.map((row) => ({
    publisher: new RegExp(row["발행기관"]),
    entries: new RegExp(row["엔트리"]),
  }))
}

// 논문과 단행본의 BibTeX 꼴. 소유자 결정이 대상에서 뺐다.
const paperTypes = new Set([
  "article",
  "inproceedings",
  "incollection",
  "book",
  "phdthesis",
  "mastersthesis",
])

// 제목 어디엔가 있는 표준 번호(ISO 26262-6, SAE J3061, RFC 9293)나 판 표시(v4.0, Version 2.1, Edition,
// Release 4, R25-11, :2024, -2018, _202503, No. 155). 판 표시가 없는 엔트리는 범용 행으로도 판을 견줄 수 없다.
const standardNumber = /\b(?:ISO|IEC|IEEE|SAE)\b[\s/A-Za-z.]{0,24}?J?[0-9]{2,}|\bRFC ?[0-9]+/
const editionMarker =
  /\b[Vv](?:ersion|er\.)?\s?[0-9]+(?:\.[0-9]+)+|\bEdition\b|\bRelease\s?[0-9]|\bR[0-9]{2}-[0-9]{2}\b|[:\-–_ ](?:19|20)[0-9]{2}(?:[0-9]{2})?\b|\bNo\.\s?[0-9]+/
export const marked = (entry: Entry) =>
  standardNumber.test(entry.title) || editionMarker.test(entry.title)

// 발행기관 칸을 견줄 꼴로 맞춘다. 예: {ISO} → ISO
export const publisherName = (entry: Entry) =>
  entry.publisher.replace(/[{}]/g, "").replace(/\s+/g, " ").trim()

export function coverage(
  cited: Entry[],
  claimed: Set<string>,
  rows: NotTargetRow[],
): { unclassified: Entry[]; listed: Map<string, Entry[]> } {
  const notTarget = (entry: Entry) =>
    paperTypes.has(entry.type) ||
    rows.some((row) => row.publisher.test(entry.publisher) && row.entries.test(entry.key))
  const classified = (entry: Entry) => claimed.has(entry.key) || notTarget(entry)
  const known = new Set(cited.filter(classified).map(publisherName).filter(Boolean))
  const unclassified: Entry[] = []
  const listed = new Map<string, Entry[]>()
  for (const entry of cited) {
    if (classified(entry)) continue
    const name = publisherName(entry)
    if (known.has(name) && marked(entry)) unclassified.push(entry)
    else listed.set(name, [...(listed.get(name) ?? []), entry])
  }
  return { unclassified, listed }
}
