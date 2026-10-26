import { kindStages, projectStages, standardNumber } from "../standard-number"
import {
  ChannelError,
  fetchOk,
  type Change,
  type Channel,
  type Entry,
  type Publication,
} from "../model"

// ISO 오픈 데이터. 매일 갱신되고, ISO, ISO/IEC, ISO/IEC/IEEE, ISO/SAE 출판물을 덮는다.
export const isoDataUrl =
  "https://isopublicstorageprod.blob.core.windows.net/opendata/_latest/iso_deliverables_metadata/json/iso_deliverables_metadata.jsonl"

interface IsoRecord {
  id: number
  reference: string
  supplementType: string | null
  currentStage: number
  replaces: number[] | null
  replacedBy: number[] | null
  publicationDate: string | null
}

const fields = [
  "id",
  "reference",
  "supplementType",
  "currentStage",
  "replaces",
  "replacedBy",
  "publicationDate",
]

// 단계 코드. 60.60 이상은 발행된 판이고, 95.99는 폐지다. x.98은 취소된 프로젝트다.
const published = (record: IsoRecord) => record.currentStage >= 6060
const withdrawn = (record: IsoRecord) => record.currentStage === 9599
const current = (record: IsoRecord) => published(record) && !withdrawn(record)
const cancelled = (record: IsoRecord) => record.currentStage % 100 === 98
const recordUrl = (record: IsoRecord) => `https://www.iso.org/standard/${record.id}.html`
const normalize = (reference: string) => reference.replace(/\s+/g, " ").trim().toLowerCase()
const yearOf = (record: IsoRecord) => record.publicationDate?.slice(0, 4)

// 엔트리 제목 머리의 ISO 참조. IEEE가 펴낸 공동 표준의 판 꼴(29148-2011)도 ISO 꼴로 바꾼다.
function referenceOf(entry: Entry): string | undefined {
  const number = standardNumber(entry.title)
  if (!number || !number.bodies.includes("ISO")) return undefined
  const head = entry.title.match(/^\S+/)![0]
  const stages = number.stages.filter((stage) => !head.includes(stage))
  return [head, ...stages, number.number].join(" ") + (number.year ? `:${number.year}` : "")
}

class IsoData {
  private byId = new Map<number, IsoRecord>()
  private byReference = new Map<string, IsoRecord>()
  private supplementsByBase = new Map<string, IsoRecord[]>()

  constructor(text: string) {
    for (const line of text.split("\n")) {
      if (line.trim() === "") continue
      const record = JSON.parse(line) as IsoRecord
      const missing = fields.filter((field) => !(field in record))
      if (missing.length > 0)
        throw new ChannelError(
          `ISO 오픈 데이터에 필드 ${missing.join(", ")}가 없다: ${line.slice(0, 80)}`,
        )
      this.byId.set(record.id, record)
      this.byReference.set(normalize(record.reference), record)
      // 추보는 판의 참조 뒤에 붙는다. 공동 표준의 머리(ISO/IEC)에도 /가 있어, 추보 표시 앞에서 자른다.
      // 예: ISO/IEC 18033-4:2011/Amd 1:2020 → ISO/IEC 18033-4:2011
      if (record.supplementType) {
        const base = normalize(record.reference.replace(/\/(?:Amd|Cor|Add|Suppl|Ext)\b.*$/, ""))
        this.supplementsByBase.set(base, [...(this.supplementsByBase.get(base) ?? []), record])
      }
    }
    if (this.byId.size === 0) throw new ChannelError("ISO 오픈 데이터가 비었다")
  }

  get(id: number): IsoRecord | undefined {
    return this.byId.get(id)
  }

  all(): IterableIterator<IsoRecord> {
    return this.byId.values()
  }

  // 판 하나에 딸린 추보와 정정. 예: ISO 24089:2023/Amd 1:2024
  supplements(record: IsoRecord): IsoRecord[] {
    return this.supplementsByBase.get(normalize(record.reference)) ?? []
  }

  // url의 /standard/<id>.html을 먼저 보고, 없으면 제목의 참조로 찾는다.
  find(entry: Entry): IsoRecord | undefined {
    const id = entry.url?.match(/iso\.org\/standard\/([0-9]+)\.html/)?.[1]
    if (id) return this.byId.get(Number(id))
    const reference = referenceOf(entry)
    return reference ? this.byReference.get(normalize(reference)) : undefined
  }

  // 대체한 판을 따라가 발행된 판에 닿는다. 폐지된 판은 더 따라간다. 진행 중인 프로젝트는 대체한 판이 아니다.
  successors(record: IsoRecord, seen = new Set<number>()): IsoRecord[] {
    return (record.replacedBy ?? []).flatMap((id) => {
      const next = this.byId.get(id)
      if (!next || seen.has(id) || !published(next) || next.supplementType) return []
      seen.add(id)
      return withdrawn(next) && next.replacedBy?.length ? this.successors(next, seen) : [next]
    })
  }

  // 판을 새로 만드는 진행 중인 개정 프로젝트. 추보와 정정 프로젝트는 현행판을 대체하지 않아 들지 않는다.
  revisions(record: IsoRecord): IsoRecord[] {
    const ids = new Set(record.replacedBy ?? [])
    for (const candidate of this.byId.values())
      if (candidate.replaces?.includes(record.id)) ids.add(candidate.id)
    return [...ids]
      .map((id) => this.byId.get(id))
      .filter(
        (candidate): candidate is IsoRecord =>
          candidate !== undefined &&
          !published(candidate) &&
          !cancelled(candidate) &&
          candidate.supplementType === null,
      )
  }
}

export const iso: Channel = {
  id: "iso",
  ownsPage: (page) => /^ISO\b/.test(page.publisher),
  // ISO 참조로 시작하는 제목이면 펴낸 곳(IEEE가 펴낸 ISO/IEC/IEEE 8802-3 등)과 상관없이 맡는다.
  // 출판물 이름에서 단계(CD, DIS 등)는 뗀다. 예: ISO/CD 13400-2 → ISO 13400-2, ISO/IEC TR 29119-6
  publicationOf(entry) {
    const number = standardNumber(entry.title)
    if (!number || !number.bodies.includes("ISO")) return undefined
    const head = entry.title
      .match(/^\S+/)![0]
      .split("/")
      .filter((part) => !projectStages.has(part))
    const kinds = number.stages.filter(
      (stage) => kindStages.includes(stage) && !head.includes(stage),
    )
    return [head.join("/"), ...kinds, number.number].join(" ")
  },
  async check(publications, context) {
    const response = await fetchOk(context, isoDataUrl)
    const data = new IsoData(await response.text())
    // 대체한 판이 참고문헌 어딘가에 인용됐으면 이미 아는 대체다(ISO 11898:1993 → ISO 11898-1).
    const cited = new Set<number>()
    for (const publication of publications)
      for (const entry of publication.entries) {
        const record = data.find(entry)
        if (record) cited.add(record.id)
      }
    return publications.flatMap((publication) => checkPublication(publication, data, cited))
  },
}

function checkPublication(publication: Publication, data: IsoData, cited: Set<number>): Change[] {
  const page = publication.page
  const changes: Change[] = []
  const add = (change: Omit<Change, "publication">) => changes.push({ publication, ...change })
  const parsed = publication.entries.flatMap((entry) => {
    const number = standardNumber(entry.title)
    return number && referenceOf(entry) ? [{ entry, number }] : []
  })
  const editions = parsed.filter(({ number }) => !number.project && number.year)

  // 현행으로 인용한 판. 부마다 표준 페이지의 edition 연도의 엔트리이고, 그 연도의 엔트리가 없는 부와
  // edition이 없는 시리즈(부마다 판이 다른 29119)의 부는 가장 새 판이다.
  const parts = new Map<string, typeof editions>()
  for (const item of editions)
    parts.set(item.number.number, [...(parts.get(item.number.number) ?? []), item])
  const currentEntries: Entry[] = []
  const currentRecords: IsoRecord[] = []
  const currentYears: string[] = []
  for (const items of parts.values()) {
    const latest = items
      .map(({ number }) => number.year!)
      .sort()
      .at(-1)!
    const year = items.some(({ number }) => number.year === page?.edition) ? page!.edition! : latest
    currentYears.push(year)
    const chosen = items.filter(
      ({ entry, number }) => number.year === year && !/\/(Amd|Cor)\b/.test(entry.title),
    )
    const entries = chosen.map(({ entry }) => entry)
    const record = entries.map((entry) => data.find(entry)).find((found) => found !== undefined)
    if (!record)
      throw new ChannelError(
        `ISO 오픈 데이터에서 ${entries.map((entry) => entry.key).join(", ")}의 레코드를 찾지 못했다`,
      )
    currentEntries.push(...entries)
    currentRecords.push(record)
  }

  // 신호 1: 새 판, 폐지, 대체
  for (const record of currentRecords) {
    const successors = data.successors(record)
    if (successors.length > 0) {
      if (successors.every((successor) => cited.has(successor.id))) continue
      for (const successor of successors.filter((successor) => !cited.has(successor.id))) {
        const sameNumber =
          successor.reference.replace(/:.*$/, "") === record.reference.replace(/:.*$/, "")
        add({
          kind: sameNumber ? "new-edition" : "replaced",
          target: successor.reference,
          evidence: [
            {
              field: `${record.reference}의 replacedBy`,
              value: `${successor.id}`,
              url: recordUrl(record),
            },
            {
              field: `${successor.reference}의 currentStage`,
              value: stage(successor),
              url: recordUrl(successor),
            },
          ],
          current: currentEntries,
        })
      }
    } else if (withdrawn(record) && page?.status !== "폐지") {
      add({
        kind: "withdrawn",
        target: record.reference,
        evidence: [
          {
            field: `${record.reference}의 currentStage`,
            value: stage(record),
            url: recordUrl(record),
          },
          { field: `${record.reference}의 replacedBy`, value: "없음", url: recordUrl(record) },
        ],
        current: currentEntries,
      })
    }
  }

  // 신호 2: 개정 착수. 표준 페이지가 있는 출판물에만 쓴다. 시리즈는 어느 부의 프로젝트든 하나를 인용했으면 안다.
  if (page) {
    const projects = currentRecords.flatMap((record) =>
      data.revisions(record).map((project) => ({ record, project })),
    )
    if (!projects.some(({ project }) => cited.has(project.id)))
      for (const { record, project } of projects)
        add({
          kind: "revision",
          target: project.reference,
          evidence: [
            {
              field: `${project.reference}의 currentStage`,
              value: stage(project),
              url: recordUrl(project),
            },
            {
              field: `${project.reference}의 replaces`,
              value: record.reference,
              url: recordUrl(project),
            },
          ],
          current: currentEntries,
        })
  }

  // 신호 3: 인용하지 않은 추보·정정과, 현행으로 인용한 부의 가장 늦은 판 연도 뒤에 발행된 새 부.
  // 페이지를 쓸 때 이미 있던 부는 알리지 않는다.
  const citedTitles = publication.entries.map((entry) => normalize(entry.title))
  for (const record of currentRecords)
    for (const supplement of data.supplements(record)) {
      if (!current(supplement)) continue
      if (
        cited.has(supplement.id) ||
        citedTitles.some((title) => title.startsWith(normalize(supplement.reference)))
      )
        continue
      add({
        kind: "supplement",
        target: supplement.reference,
        evidence: [
          {
            field: `${supplement.reference}의 currentStage`,
            value: stage(supplement),
            url: recordUrl(supplement),
          },
        ],
        current: currentEntries,
      })
    }
  const series = page && standardNumber(page.title)
  const latestCurrentYear = Number(currentYears.sort().at(-1) ?? page?.edition)
  if (series && !series.number.includes("-") && !Number.isNaN(latestCurrentYear)) {
    const citedParts = new Set(parsed.map(({ number }) => number.number))
    const partPattern = new RegExp(
      `^[A-Z/]+(?: [A-Z]+)* ${series.number.replace(/\./g, "\\.")}-([0-9]+):`,
    )
    for (const record of data.all()) {
      const part = record.reference.match(partPattern)?.[1]
      if (!part || !current(record) || record.supplementType) continue
      if (citedParts.has(`${series.number}-${part}`) || Number(yearOf(record)) <= latestCurrentYear)
        continue
      add({
        kind: "new-part",
        target: record.reference,
        evidence: [
          {
            field: `${record.reference}의 currentStage`,
            value: stage(record),
            url: recordUrl(record),
          },
          {
            field: `${record.reference}의 publicationDate`,
            value: record.publicationDate ?? "",
            url: recordUrl(record),
          },
        ],
        current: currentEntries,
      })
    }
  }
  return changes
}

// 단계 코드를 ISO 꼴로 적는다. 예: 3099 → 30.99
function stage(record: IsoRecord): string {
  const code = String(record.currentStage).padStart(4, "0")
  return `${code.slice(0, 2)}.${code.slice(2)}`
}
