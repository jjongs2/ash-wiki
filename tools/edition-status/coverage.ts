import type { Row } from "../check-content/conventions"
import type { Entry } from "./model"

// 덮음 검사. 인용 엔트리는 통로가 맡거나(감지하지 않음 표 포함), 대상 아님 표에 들거나, 논문·단행본 꼴이어야 한다.
// 아는 발행기관(통로가 맡거나 대상 아님에 든 엔트리의 발행기관)의 엔트리가 어디에도 들지 않으면 미분류다.
// 처음 보는 발행기관은 실패로 두지 않고 목록으로 보인다. 기준은 docs/wiki-verification.md의 판 확인 절에 있다.
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

// 발행기관 칸을 견줄 꼴로 맞춘다. 예: {ISO} → ISO
export const publisherName = (entry: Entry) =>
  entry.publisher.replace(/[{}]/g, "").replace(/\s+/g, " ").trim()

export function coverage(
  cited: Entry[],
  claimed: Set<string>,
  rows: NotTargetRow[],
): { unclassified: Entry[]; unknown: Map<string, Entry[]> } {
  const notTarget = (entry: Entry) =>
    paperTypes.has(entry.type) ||
    rows.some((row) => row.publisher.test(entry.publisher) && row.entries.test(entry.key))
  const classified = (entry: Entry) => claimed.has(entry.key) || notTarget(entry)
  const known = new Set(cited.filter(classified).map(publisherName).filter(Boolean))
  const unclassified: Entry[] = []
  const unknown = new Map<string, Entry[]>()
  for (const entry of cited) {
    if (classified(entry)) continue
    const name = publisherName(entry)
    if (known.has(name)) unclassified.push(entry)
    else unknown.set(name, [...(unknown.get(name) ?? []), entry])
  }
  return { unclassified, unknown }
}
