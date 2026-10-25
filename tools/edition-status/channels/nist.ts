import {
  ChannelError,
  type Change,
  type Channel,
  type Context,
  type Entry,
  type Evidence,
  type Publication,
} from "../model"

// NIST CSRC 출판물 레코드(csrc.nist.gov/pubs/...). 철회되면 "Withdrawn on"을, 대체되면 "Superseded by"를 적는다.
// 새 개정판(…/r3/…)은 별도 레코드라 옛 레코드가 아직 대체를 적지 않았을 수 있다. 그래서 다음 개정의 경로를 직접 찔러 본다.
const csrc = "https://csrc.nist.gov/pubs/"

// 레코드 경로의 마디로 가린 출판물 하나의 판. 판은 개정(rN, FIPS와 SP 800-63의 -N)이고,
// 갱신(upd1)은 같은 판을 고쳐 낸 것이라 판을 바꾸지 않는다.
interface Edition {
  series: "sp" | "fips" | "ir" | "cswp"
  number: string // 800-38, 1800-28, 180, 8259, 29
  letter: string // SP 800-38A의 a
  part?: string // SP 800-57 Part 1
  volume?: string // SP 800-160 Vol. 1
  addendum: boolean // SP 800-38A Addendum. 레코드 경로는 …/38/a/sup/다.
  revision?: number
  dash: boolean // 개정을 -N으로 적는다(FIPS 180-4, SP 800-63-4)
  update: number
  draft?: string // ipd, 2pd, fpd
  slug?: string // CSWP 레코드 경로의 제목 마디
}

const drafts = "ipd|iprd|[0-9]pd|fpd"

// 레코드 경로(sp/800/57/pt1/r5/final, fips/180-2/upd1/final, cswp/29/<제목>/final)를 판으로 읽는다.
function fromPath(path: string): Edition | undefined {
  const match = path.match(
    new RegExp(`^/?(?:pubs/)?(sp|fips|ir|cswp)/(.+?)/(final(?:-\\([0-9]+\\))?|${drafts})/?$`),
  )
  if (!match) return undefined
  const [, , rest, stage] = match
  const series = match[1] as Edition["series"]
  const draft = stage.startsWith("final") ? undefined : stage
  if (series === "sp") {
    const m = rest.match(
      /^([0-9]+)\/([0-9]+)(?:\/([a-z]))?(?:\/pt([0-9]+))?(?:\/v([0-9]+))?(?:\/r([0-9]+)|\/([0-9]+))?(\/sup)?(?:\/upd([0-9]+))?$/,
    )
    if (!m) return undefined
    return {
      series,
      number: `${m[1]}-${m[2]}`,
      letter: m[3] ?? "",
      part: m[4],
      volume: m[5],
      revision: revisionOf(m[6] ?? m[7]),
      dash: m[7] !== undefined,
      addendum: m[8] !== undefined,
      update: Number(m[9] ?? 0),
      draft,
    }
  }
  if (series === "fips") {
    const m = rest.match(/^([0-9]+)(?:-([0-9]+))?(?:\/upd([0-9]+))?$/)
    if (!m) return undefined
    const [, number, revision, update] = m
    return {
      ...plain(series, number, draft),
      revision: revisionOf(revision),
      dash: true,
      update: Number(update ?? 0),
    }
  }
  if (series === "ir") {
    const m = rest.match(/^([0-9]+)(?:\/([a-z]))?(?:\/r([0-9]+))?(?:\/upd([0-9]+))?$/)
    if (!m) return undefined
    return {
      ...plain(series, m[1], draft),
      letter: m[2] ?? "",
      revision: revisionOf(m[3]),
      update: Number(m[4] ?? 0),
    }
  }
  const m = rest.match(/^([0-9]+)\/([a-z0-9-]+)$/)
  return m ? { ...plain(series, m[1], draft), slug: m[2] } : undefined
}

// nvlpubs PDF와 DOI의 이름(NIST.SP.800-57pt1r5, NIST.FIPS.197-upd1, NIST.SP.800-224.ipd)이나
// 옛 PDF 이름(nistspecialpublication800-38a-add, fipspub180-1)을 판으로 읽는다.
function fromName(series: Edition["series"], name: string, title: string): Edition | undefined {
  const tail = `(?:-upd([0-9]+))?(?:\\.(${drafts}))?$`
  if (series === "sp") {
    const m = name.match(
      new RegExp(
        `^([0-9]+)-([0-9]+)([a-z]?)(?:pt([0-9]+))?(?:v([0-9]+))?(?:r([0-9]+)|-([0-9]+))?(-add)?${tail}`,
        "i",
      ),
    )
    if (!m) return undefined
    return {
      series,
      number: `${m[1]}-${m[2]}`,
      letter: m[3].toLowerCase(),
      part: m[4],
      volume: m[5],
      revision: revisionOf(m[6] ?? m[7]),
      dash: m[7] !== undefined,
      addendum: m[8] !== undefined,
      update: Number(m[9] ?? 0),
      draft: m[10],
    }
  }
  if (series === "fips") {
    const m = name.match(new RegExp(`^([0-9]+)(?:-([0-9]+))?${tail}`, "i"))
    if (!m) return undefined
    return {
      ...plain(series, m[1], m[4]),
      revision: revisionOf(m[2]),
      dash: true,
      update: Number(m[3] ?? 0),
    }
  }
  if (series === "ir") {
    const m = name.match(new RegExp(`^([0-9]+)([a-z]?)(?:r([0-9]+))?${tail}`, "i"))
    if (!m) return undefined
    return {
      ...plain(series, m[1], m[5]),
      letter: m[2].toLowerCase(),
      revision: revisionOf(m[3]),
      update: Number(m[4] ?? 0),
    }
  }
  // CSWP 레코드 경로의 제목 마디는 CSRC가 제목에서 만든다(소문자, 영숫자와 공백만, 50자).
  const m = name.match(new RegExp(`^([0-9]+)${tail}`, "i"))
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/ +/g, "-")
    .slice(0, 50)
  return m ? { ...plain(series, m[1], m[3]), slug } : undefined
}

const revisionOf = (text: string | undefined) => (text === undefined ? undefined : Number(text))
const plain = (series: Edition["series"], number: string, draft: string | undefined): Edition => ({
  series,
  number,
  letter: "",
  addendum: false,
  dash: false,
  update: 0,
  draft,
})

// 엔트리의 URL(Wayback 사본이면 note의 원 URL)에서 판을 읽는다. CSRC가 다루는 시리즈(SP, FIPS, IR, CSWP)의
// URL이 아니면 undefined이고, 그 시리즈의 URL인데 레코드 경로를 얻지 못하면 null이다.
function editionOf(entry: Entry): Edition | null | undefined {
  const urls = [entry.url, ...(entry.note?.match(/https?:\/\/\S+/g) ?? [])].filter(
    (url): url is string => url !== undefined,
  )
  for (const url of urls) {
    // SP 500(옛 NBS·NIST 소프트웨어 시리즈)은 CSRC에 레코드가 없고 개정하지 않는다. 맡지 않는다.
    if (/nvlpubs\.nist\.gov\/nistpubs\/Legacy\/SP\/n[a-z]*specialpublication500-/i.test(url))
      return undefined
    const record = url.match(
      new RegExp(
        `csrc\\.nist\\.gov/(?:files/)?pubs/((?:sp|fips|ir|cswp)/.+?/(?:final|${drafts}))(?:/|$)`,
      ),
    )
    if (record) return fromPath(record[1]) ?? null
    const name =
      url.match(
        /(?:nvlpubs\.nist\.gov\/nistpubs\/.*\/|doi\.org\/10\.6028\/)NIST\.(SP|FIPS|IR|CSWP)\.([^/]+?)(?:\.pdf)?$/i,
      ) ??
      url.match(
        /nvlpubs\.nist\.gov\/nistpubs\/Legacy\/(SP|FIPS|IR)\/(?:nistspecialpublication|fipspub|nistir)([^/]+)\.pdf$/i,
      )
    if (name)
      return fromName(name[1].toLowerCase() as Edition["series"], name[2], entry.title) ?? null
    // SP 800-63의 HTML판. 예: pages.nist.gov/800-63-4/sp800-63b.html은 SP 800-63B-4다.
    const html = url.match(/pages\.nist\.gov\/800-[0-9]+-([0-9]+)\/sp(800-[0-9]+[a-z]?)\.html/i)
    if (html) return fromName("sp", `${html[2]}-${html[1]}`, entry.title) ?? null
    if (/pages\.nist\.gov\/800-/i.test(url)) return null
    if (
      /nvlpubs\.nist\.gov\/nistpubs\/(?:SpecialPublications|FIPS|ir|CSWP|Legacy\/(?:SP|FIPS|IR))\/|doi\.org\/10\.6028\/NIST\.(?:SP|FIPS|IR|CSWP)\./i.test(
        url,
      )
    )
      return null
  }
  return undefined
}

const upper = (edition: Edition) => edition.series.toUpperCase()

function publicationName(edition: Edition): string {
  return (
    `NIST ${upper(edition)} ${edition.number}${edition.letter.toUpperCase()}` +
    (edition.part ? ` Part ${edition.part}` : "") +
    (edition.volume ? ` Vol. ${edition.volume}` : "") +
    (edition.addendum ? " Addendum" : "")
  )
}

function editionName(edition: Edition): string {
  if (edition.revision === undefined) return publicationName(edition)
  return (
    publicationName(edition) + (edition.dash ? `-${edition.revision}` : ` Rev. ${edition.revision}`)
  )
}

// 판의 레코드 경로. 갱신과 단계(final, ipd)는 뗀다. 같은 판인지를 이것으로 가린다.
function editionKey(edition: Edition): string {
  if (edition.series === "fips")
    return `fips/${edition.number}${edition.revision === undefined ? "" : `-${edition.revision}`}`
  return (
    `${edition.series}/${edition.number.replace("-", "/")}` +
    (edition.letter ? `/${edition.letter}` : "") +
    (edition.part ? `/pt${edition.part}` : "") +
    (edition.volume ? `/v${edition.volume}` : "") +
    (edition.revision === undefined
      ? ""
      : edition.dash
        ? `/${edition.revision}`
        : `/r${edition.revision}`) +
    (edition.addendum ? "/sup" : "")
  )
}

// 판의 최종본 레코드. 초안(ipd 등)이 아니라 최종본이 나왔는지를 본다.
const recordUrl = (edition: Edition) =>
  `${csrc}${editionKey(edition)}${edition.slug ? `/${edition.slug}` : ""}/final`

// 다음 개정. CSWP는 개정하지 않고 새 번호로 낸다.
function nextRevision(edition: Edition): Edition | undefined {
  if (edition.series === "cswp" || edition.addendum) return undefined
  return { ...edition, revision: (edition.revision ?? 0) + 1, update: 0, draft: undefined }
}

interface CsrcRecord {
  url: string
  header: string
  published: string
  withdrawn?: string
  supersededBy: { path: string; name: string }[]
}

const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

function parseRecord(url: string, html: string): CsrcRecord {
  const field = (id: string) =>
    html.match(new RegExp(`id=["']${id}["'][^>]*>([\\s\\S]*?)</span>`))?.[1]
  const header = field("pub-header-full-display")
  const published = field("pub-release-date")
  if (header === undefined || published === undefined)
    throw new ChannelError(`CSRC 레코드에 판 이름이나 Date Published가 없다: ${url}`)
  const withdrawn = field("pub-withdrawn-date")
  if (/id=["']pub-withdrawn-message["']/.test(html) && withdrawn === undefined)
    throw new ChannelError(`CSRC 레코드의 철회 알림에 Withdrawn on이 없다: ${url}`)
  const supersededBy = [
    ...html.matchAll(/<a href="([^"]+)" id="pub-superseded-by-[0-9]+">([\s\S]*?)<\/a>/g),
  ].map(([, path, name]) => ({ path, name: text(name) }))
  return {
    url,
    header: text(header),
    published: text(published),
    withdrawn: withdrawn && text(withdrawn),
    supersededBy,
  }
}

// CSRC에 묻는다. 요청 사이에 간격을 둔다. 404는 레코드가 없다는 뜻이라 undefined다.
class Csrc {
  private last = 0
  private cache = new Map<string, CsrcRecord | undefined>()

  constructor(
    private context: Context,
    private intervalMs: number,
  ) {}

  async get(url: string): Promise<CsrcRecord | undefined> {
    if (this.cache.has(url)) return this.cache.get(url)
    const wait = this.last + this.intervalMs - Date.now()
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
    this.last = Date.now()
    const response = await this.context.fetch(url)
    let record: CsrcRecord | undefined
    if (response.status === 404) await response.body?.cancel()
    else if (!response.ok) {
      await response.body?.cancel()
      throw new ChannelError(`HTTP ${response.status} ${url}`)
    } else record = parseRecord(url, await response.text())
    this.cache.set(url, record)
    return record
  }

  async require(url: string): Promise<CsrcRecord> {
    const record = await this.get(url)
    if (!record) throw new ChannelError(`CSRC에 레코드가 없다(HTTP 404): ${url}`)
    return record
  }
}

// 요청 간격을 정해 통로를 만든다. 테스트는 0으로 쓴다.
export function nistChannel(intervalMs: number): Channel {
  return {
    id: "nist",
    ownsPage: () => false,
    // 출판물 이름은 개정을 뗀 이름이다(NIST SP 800-67). 읽지 못한 NIST 출판물도 맡아서 check에서 실패시킨다.
    publicationOf(entry) {
      const edition = editionOf(entry)
      if (edition === undefined) return undefined
      return edition === null ? `NIST ${entry.key}` : publicationName(edition)
    },
    async check(publications, context) {
      const parsed = publications.flatMap((publication) =>
        publication.entries.map((entry) => {
          const edition = editionOf(entry)
          if (!edition)
            throw new ChannelError(
              `${entry.key}의 URL에서 CSRC 레코드 경로를 얻지 못했다: ${entry.url}`,
            )
          return { publication, entry, edition }
        }),
      )
      // 대체한 판을 참고문헌 어딘가에 인용했으면 이미 아는 대체다. 초안 인용은 판 인용이 아니다.
      const cited = new Set(
        parsed.filter(({ edition }) => !edition.draft).map(({ edition }) => editionKey(edition)),
      )
      const records = new Csrc(context, intervalMs)
      const changes: Change[] = []
      for (const publication of publications)
        changes.push(
          ...(await checkPublication(
            publication,
            parsed.filter((item) => item.publication === publication),
            cited,
            records,
          )),
        )
      return changes
    },
  }
}

export const nist = nistChannel(1000)

async function checkPublication(
  publication: Publication,
  parsed: { entry: Entry; edition: Edition }[],
  cited: Set<string>,
  records: Csrc,
): Promise<Change[]> {
  const changes: Change[] = []
  const order = (edition: Edition) => [edition.revision ?? -1, edition.update]
  const latest = (items: typeof parsed) =>
    items.reduce((a, b) => {
      const [x, y] = [order(a.edition), order(b.edition)]
      return x[0] > y[0] || (x[0] === y[0] && x[1] >= y[1]) ? a : b
    })
  const finals = parsed.filter(({ edition }) => !edition.draft)

  // 초안만 인용했으면 그 판의 최종본이 나왔는지 본다(SP 800-224 ipd).
  if (finals.length === 0) {
    const { edition } = latest(parsed)
    const record = await records.get(recordUrl(edition))
    if (record && !cited.has(editionKey(edition)))
      changes.push({
        publication,
        kind: "new-edition",
        target: editionName(edition),
        evidence: [
          { field: `${record.header}의 Date Published`, value: record.published, url: record.url },
        ],
        current: parsed.map(({ entry }) => entry),
      })
    return changes
  }

  // 현행으로 인용한 판. 가장 새 개정이고, 그 판의 엔트리 가운데 가장 새 갱신의 것이다(FIPS 197 → 197-upd1).
  const current = latest(finals).edition
  const key = editionKey(current)
  const currentEntries = finals
    .filter(({ edition }) => editionKey(edition) === key && edition.update === current.update)
    .map(({ entry }) => entry)
  const add = (kind: Change["kind"], target: string, evidence: Evidence[]) => {
    if (!changes.some((change) => change.target === target))
      changes.push({ publication, kind, target, evidence, current: currentEntries })
  }

  // 같은 판의 갱신이 대체했으면 그 갱신까지 따라간다(FIPS 180-4 → FIPS 180-4 upd1).
  let record = await records.require(recordUrl(current))
  for (let hops = 0; ; hops++) {
    const update = record.supersededBy.find(
      (successor) => fromPath(successor.path) && editionKey(fromPath(successor.path)!) === key,
    )
    if (!update || hops > 10) break
    record = await records.require(new URL(update.path, csrc).href)
  }

  // 새 개정판은 별도 레코드다. 다음 개정의 경로를 404가 날 때까지 찔러 본다.
  const revisions: { edition: Edition; record: CsrcRecord }[] = []
  for (let next = nextRevision(current); next; next = nextRevision(next)) {
    const found = await records.get(recordUrl(next))
    if (!found) break
    revisions.push({ edition: next, record: found })
  }

  // 신호 1: 대체, 새 판, 폐지. 다음 개정이 나왔으면 철회는 폐지가 아니라 그 개정으로의 대체다.
  const successors = record.supersededBy
    .map((successor) => ({ ...successor, edition: fromPath(successor.path) }))
    .filter(({ edition }) => !edition || editionKey(edition) !== key)
  const supersededBy: Evidence = {
    field: `${record.header}의 Superseded by`,
    value: successors.map(({ name }) => name).join(", "),
    url: record.url,
  }
  const withdrawn: Evidence[] = record.withdrawn
    ? [{ field: `${record.header}의 Withdrawn on`, value: record.withdrawn, url: record.url }]
    : []
  if (successors.length > 0) {
    for (const { name, edition } of successors) {
      if (edition && cited.has(editionKey(edition))) continue
      const sameNumber = edition && publicationName(edition) === publication.name
      add(
        sameNumber ? "new-edition" : "replaced",
        edition ? editionName(edition) : `NIST ${name}`,
        [...withdrawn, supersededBy],
      )
    }
  } else if (record.withdrawn && revisions.length === 0 && publication.page?.status !== "폐지")
    add("withdrawn", editionName(current), [
      ...withdrawn,
      { field: `${record.header}의 Superseded by`, value: "없음", url: record.url },
    ])
  for (const { edition, record: found } of revisions)
    if (!cited.has(editionKey(edition)))
      add("new-edition", editionName(edition), [
        { field: `${found.header}의 Date Published`, value: found.published, url: found.url },
      ])
  return changes
}
