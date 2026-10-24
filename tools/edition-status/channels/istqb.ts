import {
  ChannelError,
  compareEditions,
  fetchOk,
  type Change,
  type Channel,
  type Context,
  type Entry,
} from "../model"

// ISTQB 통로. 강의계획서 하나가 출판물 하나이고, 자격 페이지(WordPress JSON)의 내려받기 링크 이름에서 버전을 읽는다.
// 같은 버전의 PDF도 다시 올리므로(CTAL-TM v3.0, 2026-08) 업로드 날짜가 아니라 버전 문자열로 견준다.
// 판 없이 고쳐지는 온라인 용어집(ISTQB Glossary — 용어)은 대상이 아니다.
const certificationsParent = 605 // https://istqb.org/certifications/
export const certificationsUrl = (page = 1) =>
  `https://istqb.org/wp-json/wp/v2/pages?parent=${certificationsParent}&per_page=100&page=${page}&_fields=id,link,title,content`

// 강의계획서 약어. 예: CTFL, CTAL-TA, CT-AcT
const abbreviation = "CT[A-Za-z]*(?:-[A-Za-z]+)*"
// 약어를 모두 소문자로 적은 곳(옛 CTFL의 URL)은 대문자로 맞춘다.
const canonical = (abbr: string) => (abbr === abbr.toLowerCase() ? abbr.toUpperCase() : abbr)

// 엔트리 제목의 괄호 약어를 먼저 보고, 없으면 URL이나 note의 파일 이름(ISTQB_CTAL-TM_Syllabus_v3.0.pdf)에서 찾는다.
// 제목만으로는 ISTQB의 자격 이름과 맞출 수 없는 엔트리가 있다(Specialist Syllabus, Foundation Level Acceptance Testing).
function abbreviationOf(entry: Entry): string | undefined {
  const inTitle = entry.title.match(new RegExp(`\\((${abbreviation})\\)`))?.[1]
  if (inTitle) return inTitle
  const file = new RegExp(`istqb[-_](${abbreviation})[-_]syllabus`, "i")
  const found = [entry.url, entry.note].map((text) => text?.match(file)?.[1]).find(Boolean)
  return found && canonical(found)
}

interface Edition {
  version?: string // 예: 4.0.1
  year?: string // 버전 없이 연도만 적은 판. 예: Version 2019
}

// 엔트리 제목의 판. 예: v4.0.1, Version 2018 V3.1(→ 3.1), Version 2019(→ 연도 2019)
function editionOf(title: string): Edition | undefined {
  const version = [...title.matchAll(/\b[vV]([0-9]+(?:\.[0-9]+)+)\b/g)].at(-1)?.[1]
  if (version) return { version }
  const year = title.match(/\bVersion ((?:19|20)[0-9]{2})\b/)?.[1]
  return year ? { year } : undefined
}

const editionName = (edition: Edition) =>
  edition.version ? `v${edition.version}` : `Version ${edition.year}`

const sameEdition = (a: Edition, b: Edition) =>
  a.version && b.version
    ? compareEditions(a.version, b.version) === 0
    : !a.version && !b.version && a.year === b.year

export const istqb: Channel = {
  id: "istqb",
  ownsPage: () => false,
  publicationOf(entry) {
    if (!entry.publisher.includes("ISTQB") || !/\bSyllabus\b/.test(entry.title)) return undefined
    const abbr = abbreviationOf(entry)
    return `ISTQB ${abbr ?? entry.title.replace(/,? (?:v|Version )[0-9].*$/, "")}`
  },
  async check(publications, context) {
    const syllabi = await downloads(context)
    const changes: Change[] = []
    for (const publication of publications) {
      const cited = publication.entries.flatMap((entry) => {
        const edition = editionOf(entry.title)
        return edition ? [{ entry, edition }] : []
      })
      if (cited.length === 0)
        throw new Error(`${publication.name}: 인용한 엔트리 제목에서 버전을 찾지 못했다`)
      const latestCited = cited
        .map(({ edition }) => edition)
        .sort((a, b) => compareEditions(a.version ?? "0", b.version ?? "0"))
        .at(-1)!
      const current = cited
        .filter(({ edition }) => sameEdition(edition, latestCited))
        .map(({ entry }) => entry)
      const abbr = publication.name.replace(/^ISTQB /, "").toUpperCase()
      const found = syllabi.filter((syllabus) => syllabus.abbr.toUpperCase() === abbr)
      if (found.length === 0)
        throw new ChannelError(`ISTQB 자격 페이지에서 ${publication.name} 강의계획서를 찾지 못했다`)
      const active = found
        .filter((syllabus) => !syllabus.retired)
        .sort((a, b) => compareEditions(a.edition.version ?? "0", b.edition.version ?? "0"))
      const evidence = (syllabus: Syllabus) => ({
        field: `${syllabus.page}의 내려받기`,
        value: syllabus.label,
        url: syllabus.link,
      })
      if (active.length === 0) {
        changes.push({
          publication,
          kind: "withdrawn",
          target: `${publication.name} ${editionName(latestCited)}`,
          evidence: found.map(evidence),
          current,
        })
        continue
      }
      const latest = active.at(-1)!
      const isCurrent = latestCited.version
        ? compareEditions(latest.edition.version ?? "0", latestCited.version) <= 0
        : latest.edition.year === latestCited.year
      if (isCurrent) continue
      changes.push({
        publication,
        kind: "new-edition",
        target: `${publication.name} ${editionName(latest.edition)}`,
        evidence: [evidence(latest)],
        current,
      })
    }
    return changes
  },
}

interface Syllabus {
  abbr: string
  edition: Edition
  label: string
  page: string // 자격 페이지 제목
  link: string
  retired: boolean // 페이지 제목의 [Retired]. [Retiring]은 아직 현행이다.
}

// 자격 페이지마다 강의계획서 내려받기 링크. 예: ISTQB CTFL Syllabus v4.0.1, ISTQB_CTAL-TA_Syllabus_v4.0, ISTQB CT-AcT Syllabus v1.0 2019
async function downloads(context: Context): Promise<Syllabus[]> {
  const pages: unknown[] = []
  for (let page = 1, total = 1; page <= total; page++) {
    const response = await fetchOk(context, certificationsUrl(page))
    total = Number(response.headers.get("x-wp-totalpages") ?? 1)
    const body: unknown = await response.json().catch(() => undefined)
    if (!Array.isArray(body))
      throw new ChannelError(`${certificationsUrl(page)}가 페이지 목록이 아니다`)
    pages.push(...body)
  }
  if (pages.length === 0) throw new ChannelError("ISTQB 자격 페이지가 없다")
  // 링크 이름은 낱말을 _로 잇기도 한다(ISTQB_CTAL-TA_Syllabus_v4.0). _는 \b의 낱말 글자라 경계로 쓰지 않는다.
  const label = new RegExp(
    `^(?:ISTQB[ _-]+)?(${abbreviation})[ _\\u2013-]+Syllabus(?![A-Za-z])(.*)$`,
    "i",
  )
  return pages.flatMap((page) => {
    const { title, content, link } = (page ?? {}) as {
      title?: { rendered?: string }
      content?: { rendered?: string }
      link?: string
    }
    if (typeof title?.rendered !== "string" || typeof content?.rendered !== "string" || !link)
      throw new ChannelError(
        `ISTQB 자격 페이지에 title, content, link가 없다: ${JSON.stringify(page).slice(0, 80)}`,
      )
    const name = text(title.rendered)
    return [...content.rendered.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].flatMap((anchor) => {
      const match = text(anchor[1]).match(label)
      if (!match) return []
      const version = match[2].match(/(?<![A-Za-z])v([0-9]+(?:\.[0-9]+)*)/i)?.[1]
      const year = match[2].match(/(?<![0-9.])((?:19|20)[0-9]{2})(?![0-9])/)?.[1]
      if (!version) return []
      return [
        {
          abbr: match[1],
          edition: { version, year },
          label: text(anchor[1]),
          page: name,
          link,
          retired: /\[Retired\]/i.test(name),
        },
      ]
    })
  })
}

// HTML 조각의 글자. 태그를 떼고 자주 쓰는 문자 참조를 푼다.
function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(x?)([0-9a-f]+);/gi, (_, hex: string, code: string) =>
      String.fromCodePoint(parseInt(code, hex ? 16 : 10)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
