import { citations } from "../check-content/source-checks"
import { fieldsOf, type Tree } from "../check-content/tree"
import type { Channel, Entry, Publication, StandardPage } from "./model"

// 페이지가 인용한 엔트리. 인용하지 않은 엔트리는 판 확인의 대상이 아니다.
export function citedEntries(tree: Tree): Entry[] {
  const citedBy = new Map<string, Map<string, number>>()
  for (const page of tree.pages.filter((page) => page.kind === "page")) {
    for (const { key } of citations(page)) {
      if (key === null) continue
      const counts = citedBy.get(key) ?? new Map<string, number>()
      counts.set(page.name, (counts.get(page.name) ?? 0) + 1)
      citedBy.set(key, counts)
    }
  }
  return tree.bib.flatMap((bib) =>
    "error" in bib.entries
      ? []
      : bib.entries
          .filter((entry) => citedBy.has(entry.key))
          .map((entry) => {
            const field = (name: string) => entry.fields.get(name)?.value.replace(/\s+/g, " ")
            return {
              key: entry.key,
              title: field("title") ?? "",
              url: field("url"),
              note: field("note"),
              publisher: ["author", "organization", "institution", "publisher"]
                .map((name) => field(name) ?? "")
                .join(" "),
              file: bib.file,
              line: entry.line,
              citedBy: citedBy.get(entry.key)!,
            }
          }),
  )
}

export function standardPages(tree: Tree): StandardPage[] {
  return tree.pages
    .filter((page) => page.kind === "page" && fieldsOf(page)["edition"] !== undefined)
    .map((page) => {
      const fields = fieldsOf(page)
      return {
        name: page.name,
        title: String(fields["title"] ?? ""),
        publisher: String(fields["publisher"] ?? ""),
        edition: String(fields["edition"]),
        status: String(fields["status"] ?? ""),
      }
    })
}

// 제목 머리의 표준 번호. 발행기관 묶음(ISO/IEC/IEEE 등), 종류와 단계(PAS, TR, CD, DIS 등), 번호(부 포함), 판 연도다.
// IEEE 프로젝트(P802.3dm)의 P는 번호에서 떼고 project로 적는다.
export interface StandardNumber {
  bodies: string[] // 예: ["ISO", "IEC", "IEEE"]
  stages: string[] // 예: ["DIS"], ["PAS"], ["Std"]
  number: string // 예: 13400-2, 802.1Q, J3061
  year?: string
  project: boolean
}

// 단계는 머리에 붙거나(ISO/CD 15765-2, ISO/PAS 8800) 띄어 온다(ISO/IEC/IEEE DIS 29148, ISO/IEC TR 29119-6).
const stagePattern = "PWI|NP|AWI|WD|CD|DIS|FDIS|PRF|PAS|TR|TS"
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

// 엔트리를 출판물로 묶고 통로에 나눈다. 표준 번호로 쓰는 표준 페이지(ISO 13400-2, IEEE 802.1Q)는 같은 번호와
// 그 부(26262-1)의 엔트리를 모두 담는다. 그 밖의 엔트리는 통로가 출판물 이름을 정하고, 이름이 표준 페이지의
// 제목과 같으면 그 페이지의 출판물이 된다. 어느 통로의 것도 아닌 엔트리는 판 확인의 대상이 아니다.
export function assign(
  entries: Entry[],
  pages: StandardPage[],
  channels: Channel[],
): Map<Channel, Publication[]> {
  const owners = new Map<StandardPage, Channel>()
  for (const page of pages) {
    const owner = channels.filter((channel) => channel.ownsPage(page))
    if (owner.length !== 1)
      throw new Error(
        `표준 페이지 ${page.name}을 맡은 통로가 ${owner.length}개다(${owner.map((c) => c.id).join(", ")}). ` +
          `docs/wiki-verification.md의 판 확인 표를 고친다`,
      )
    owners.set(page, owner[0])
  }
  const byName = new Map<string, { channel: Channel; publication: Publication }>()
  const add = (channel: Channel, name: string, page: StandardPage | undefined, entry?: Entry) => {
    if (!byName.has(name)) byName.set(name, { channel, publication: { name, page, entries: [] } })
    if (entry) byName.get(name)!.publication.entries.push(entry)
  }
  for (const page of pages) add(owners.get(page)!, page.title, page)
  const numbered = pages.flatMap((page) => {
    const number = standardNumber(page.title)
    return number ? [{ page, number }] : []
  })
  for (const entry of entries) {
    const number = standardNumber(entry.title)
    const page =
      number &&
      numbered.find(
        (candidate) =>
          candidate.number.bodies.some((body) => number.bodies.includes(body)) &&
          (number.number === candidate.number.number ||
            number.number.startsWith(`${candidate.number.number}-`)),
      )?.page
    if (page) {
      add(owners.get(page)!, page.title, page, entry)
      continue
    }
    for (const channel of channels) {
      const name = channel.publicationOf(entry)
      if (name === undefined) continue
      const titled = pages.find((candidate) => candidate.title === name)
      add(titled ? owners.get(titled)! : channel, name, titled, entry)
      break
    }
  }
  const assigned = new Map<Channel, Publication[]>(channels.map((channel) => [channel, []]))
  for (const { channel, publication } of byName.values()) assigned.get(channel)!.push(publication)
  return assigned
}
