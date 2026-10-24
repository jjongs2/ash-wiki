import { ChannelError, fetchOk, type Change, type Channel } from "../model"

// RFC 색인. RFC Editor가 RFC마다 obsoleted-by와 current-status를 적는다.
export const rfcIndexUrl = "https://www.rfc-editor.org/rfc-index.xml"

interface RfcRecord {
  number: number
  obsoletedBy: number[]
  currentStatus: string
  publicationStatus: string
}

const infoUrl = (number: number) => `https://www.rfc-editor.org/info/rfc${number}`
const rfcName = (number: number) => `RFC ${number}`
const numberOf = (title: string) => title.match(/^RFC ?([0-9]+)\b/)?.[1]

function parseIndex(text: string): Map<number, RfcRecord> {
  const records = new Map<number, RfcRecord>()
  for (const [, block] of text.matchAll(/<rfc-entry>([\s\S]*?)<\/rfc-entry>/g)) {
    const field = (name: string) => block.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1]
    const id = field("doc-id")
    const currentStatus = field("current-status")
    const publicationStatus = field("publication-status")
    if (!id?.startsWith("RFC") || !currentStatus || !publicationStatus)
      throw new ChannelError(
        `rfc-index.xml의 레코드에 doc-id, current-status, publication-status가 없다: ${block.trim().slice(0, 80)}`,
      )
    const obsoletedBy = [
      ...(block.match(/<obsoleted-by>([\s\S]*?)<\/obsoleted-by>/)?.[1] ?? "").matchAll(
        /<doc-id>RFC([0-9]+)<\/doc-id>/g,
      ),
    ].map((match) => Number(match[1]))
    const number = Number(id.slice(3))
    records.set(number, { number, obsoletedBy, currentStatus, publicationStatus })
  }
  if (records.size === 0) throw new ChannelError("rfc-index.xml에 rfc-entry가 없다")
  return records
}

export const ietf: Channel = {
  id: "ietf",
  ownsPage: () => false,
  // RFC는 고쳐 내지 않고 새 번호로 낸다. 그래서 RFC 하나가 출판물 하나이고 판도 하나다.
  publicationOf(entry) {
    const number = numberOf(entry.title)
    return number ? rfcName(Number(number)) : undefined
  },
  async check(publications, context) {
    const records = parseIndex(await (await fetchOk(context, rfcIndexUrl)).text())
    const find = (number: number) => {
      const record = records.get(number)
      if (!record) throw new ChannelError(`rfc-index.xml에 ${rfcName(number)}가 없다`)
      return record
    }
    // obsoleted-by를 끝까지 따라간 RFC들
    const later = (record: RfcRecord, seen = new Set<number>()): RfcRecord[] =>
      record.obsoletedBy.flatMap((number) => {
        if (seen.has(number)) return []
        seen.add(number)
        const next = find(number)
        return [next, ...later(next, seen)]
      })
    const cited = new Set(publications.map((publication) => Number(numberOf(publication.name))))

    const changes: Change[] = []
    for (const publication of publications) {
      const record = find(Number(numberOf(publication.name)))
      const successors = later(record)
      // 대체 체인에서 더 새 RFC를 인용했으면 그 RFC가 기준이다. 이 RFC는 이력 문장의 근거다(RFC 2460 → 8200).
      if (successors.some((successor) => cited.has(successor.number))) continue
      const add = (change: Omit<Change, "publication" | "current">) =>
        changes.push({ publication, current: publication.entries, ...change })
      const evidence = (rfc: RfcRecord, field: "current-status" | "publication-status") => ({
        field: `${rfcName(rfc.number)}의 ${field}`,
        value: field === "current-status" ? rfc.currentStatus : rfc.publicationStatus,
        url: infoUrl(rfc.number),
      })
      const obsoletedBy = {
        field: `${publication.name}의 obsoleted-by`,
        value: record.obsoletedBy.map(rfcName).join(", ") || "없음",
        url: infoUrl(record.number),
      }
      // 발행 뒤에 Historic으로 옮겨졌으면 폐지다. 이때 obsoleted-by는 대개 Historic으로 옮기는 RFC라
      // 후속 판이 아니다(RFC 1146 → 6247). 처음부터 Historic으로 낸 RFC(RFC 6101, SSL 3.0)는 바뀐 것이 없다.
      if (record.currentStatus === "HISTORIC" && record.publicationStatus !== "HISTORIC") {
        if (publication.page?.status !== "폐지")
          add({
            kind: "withdrawn",
            target: publication.name,
            evidence: [
              evidence(record, "current-status"),
              evidence(record, "publication-status"),
              obsoletedBy,
            ],
          })
        continue
      }
      // 체인의 끝, 곧 아직 obsolete되지 않은 RFC가 대체한 판이다.
      for (const successor of successors.filter((rfc) => rfc.obsoletedBy.length === 0))
        add({
          kind: "replaced",
          target: rfcName(successor.number),
          evidence: [obsoletedBy, evidence(successor, "current-status")],
        })
    }
    return changes
  },
}
