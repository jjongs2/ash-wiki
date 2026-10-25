import { standardNumber } from "../publications"
import {
  ChannelError,
  fetchOk,
  type Change,
  type Channel,
  type Context,
  type Entry,
  type Publication,
} from "../model"

// IEEE 통로. 표준 페이지(standards.ieee.org/ieee/<번호>/<id>/)의 HTML을 긁는다. 판 하나에 페이지 하나이고,
// 프로젝트(PAR)가 발행되어도 같은 id를 쓴다. 꼴이 바뀌면 기대한 칸을 찾지 못해 실패한다.
const statuses = [
  "Active Standard",
  "Superseded Standard",
  "Inactive-Reserved Standard",
  "Inactive-Withdrawn Standard",
]

interface Link {
  text: string // 예: 802.1Q-2022, P802.1Q, 802.3-2022/Cor 1-2024
  url: string
}

interface IeeePage {
  url: string
  title: string
  status: string
  fields: Map<string, Link[]>
  // 워킹그룹의 Active Projects. 그 표준의 개정 PAR도 여기에만 나온다.
  projects: Link[]
}

const decode = (text: string) =>
  text
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()

const pageUrlPattern = /standards\.ieee\.org\/ieee\/([^/\s]+)\/([0-9]+)/

// 표준 페이지 URL을 한 꼴로 맞춘다. 페이지 안의 링크는 끝 /가 없다.
function canonical(url: string): string | undefined {
  const match = url.match(pageUrlPattern)
  return match ? `https://standards.ieee.org/ieee/${match[1]}/${match[2]}/` : undefined
}
const idOf = (url: string) => url.match(pageUrlPattern)?.[2]

function linksIn(html: string, base: string): Link[] {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(
    ([, href, text]) => ({
      text: decode(text),
      url: canonical(new URL(href, base).href) ?? new URL(href, base).href,
    }),
  )
}

function parsePage(html: string, url: string): IeeePage {
  const fail = (what: string) => {
    throw new ChannelError(
      `${url}에서 ${what}을 찾지 못했다(Cloudflare 챌린지거나 페이지 꼴이 바뀌었다)`,
    )
  }
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]
  const details = html.match(/id="standard-details">([\s\S]*?)<!-- \/#standard-details -->/)?.[1]
  const status = html.match(/<dd id="stnd-status"[^>]*>([^<]*)<\/dd>/)?.[1]
  const projectsStart = html.indexOf('id="wg-active-projects"')
  if (title === undefined) fail("<title>")
  if (details === undefined) fail("standard-details")
  if (status === undefined) fail("Status")
  if (projectsStart < 0) fail("Active Projects")
  const fields = new Map<string, Link[]>()
  for (const [, label, body] of details!.matchAll(
    /<dt[^>]*>([^<]*)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/g,
  ))
    fields.set(decode(label), linksIn(body, url))
  const projects = html
    .slice(projectsStart)
    .split('class="wg-project wg-active-project"')
    .slice(1)
    .flatMap((block) => {
      const designation = block.match(/wg-active-project-designation">([^<]+)</)?.[1]
      // 링크가 빈 프로젝트도 있다(href=""). 그때는 이 페이지를 근거로 든다.
      const href = block.match(/wg-active-project-url"\s+href="([^"]*)"/)?.[1]
      if (!designation || href === undefined) fail("Active Projects의 프로젝트 번호")
      return [{ text: decode(designation!), url: canonical(new URL(href!, url).href) ?? url }]
    })
  return { url, title: decode(title!), status: decode(status!), fields, projects }
}

// 엔트리 제목 머리의 "IEEE SA — "를 뗀다. 표준 페이지의 제목을 그대로 옮긴 엔트리다.
const stripSite = (title: string) => title.replace(/^IEEE SA\s*[—–-]\s*/, "")

// 추보(amendment)는 기준 번호 뒤에 소문자를 붙인 별도 번호로 나온다. 예: 802.1Qbv → 802.1Q, 1588g → 1588
const baseOf = (number: string) => number.replace(/[a-z]+$/, "")

type Cited = Pick<Entry, "title" | "publisher" | "url" | "note">

// IEEE가 펴낸 엔트리인가. 머리에 IEEE가 없는 제목(워킹그룹 페이지, P 번호)은 이것으로 가린다.
const byIeee = (entry: Cited) => /IEEE/.test(entry.publisher) || /ieee/i.test(entry.url ?? "")

const number = "([0-9][0-9A-Za-z.]*)"
const year = "((?:19|20)[0-9]{2})"
const escape = (text: string) => text.replace(/\./g, "\\.")

// 프로젝트(PAR) 엔트리의 번호와, 개정하는 판의 연도. 꼴은 넷이다.
// P802.1AE-2018-Rev, IEEE P802.1AS …, PAR for P1722: …, 802.1AS-2020-Revision과
// 개정 프로젝트 페이지(1.ieee802.org/maintenance/p802-1q-rev/)에 판 이름을 붙인 제목(802.1Q-2022 – …)이다.
function projectOf(entry: Cited): { number: string; revises?: string } | undefined {
  if (!byIeee(entry)) return undefined
  const title = stripSite(entry.title)
  const match =
    title.match(new RegExp(`^(?:IEEE |PAR for )?P${number}(?:-${year}-Rev)?`)) ??
    title.match(new RegExp(`^${number}-${year}-Rev`)) ??
    (/ieee802\.org\/.*-rev\//.test(entry.url ?? "")
      ? title.match(new RegExp(`^${number}-${year} [–-] `))
      : null)
  if (!match) return undefined
  const revises =
    match[2] ??
    title.match(new RegExp(`Revision to IEEE (?:Standard|Std) ${escape(match[1])}-${year}`))?.[1]
  return { number: match[1], revises }
}

// 판을 매긴 IEEE 표준의 번호와 판 연도. ISO가 낀 공동 표준은 ISO 통로가 맡는다. 꼴은 셋이다.
// 머리의 표준 번호(IEEE 802.1Q-2022 …), IEEE가 펴낸 워킹그룹 페이지의 머리(802.1CM-2018 – …),
// IEEE가 펴낸 엔트리 제목 안의 판 표시(… (The Open Group Base Specifications Issue 8, IEEE Std 1003.1-2024), MIB·YANG 모듈)다.
// 정정(802.3-2022/Cor 1-2024)은 그 판의 번호로 읽히므로 따로 표시한다.
function editionOf(
  entry: Cited,
): { head: string; number: string; year: string; corrigendum: boolean } | undefined {
  const stripped = stripSite(entry.title)
  const parsed = standardNumber(stripped)
  if (parsed) {
    if (parsed.project || !parsed.year) return undefined
    if (!parsed.bodies.includes("IEEE") || parsed.bodies.includes("ISO")) return undefined
    return {
      head: stripped.match(/^[^ ]+/)![0],
      number: parsed.number,
      year: parsed.year,
      corrigendum: /^\S+(?: Std)? [0-9A-Za-z.]+-[0-9]{4}\/Cor\b/.test(stripped),
    }
  }
  // 개정 프로젝트 페이지(802.1Q-2022 – …, p802-1q-rev)는 판이 아니다.
  if (!byIeee(entry) || projectOf(entry)) return undefined
  const match =
    stripped.match(new RegExp(`^${number}-${year} [–-] `)) ??
    stripped.match(new RegExp(`\\bIEEE Std ${number}-${year}(?![0-9/])`))
  return match ? { head: "IEEE", number: match[1], year: match[2], corrigendum: false } : undefined
}

// 판 이름이 제목에 따로 선 낱말로 있는가. 802.1Q-2022가 802.1Qcc-2022나 802.1Q-2022/Cor 1에 걸리지 않게 한다.
const mentions = (title: string, designation: string) =>
  new RegExp(
    `(?<![0-9A-Za-z.])${designation.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(?![0-9A-Za-z/])`,
  ).test(title)

export function ieeeChannel(delayMs: number): Channel {
  return {
    id: "ieee",
    ownsPage: (page) => /^IEEE\b/.test(page.publisher),
    // 판을 매긴 표준과, 그 표준을 바꾸는 프로젝트(개정, 추보, 정정)의 엔트리를 기준 번호의 출판물로 묶는다.
    // 프로젝트 엔트리는 "참고문헌이 그 프로젝트를 인용했다"를 가리는 데만 쓴다. 워킹그룹 페이지, 해설은 들지 않는다.
    publicationOf(entry) {
      const project = projectOf(entry)
      if (project) return `IEEE ${baseOf(project.number)}`
      const edition = editionOf(entry)
      return edition && `${edition.head} ${baseOf(edition.number)}`
    },
    async check(publications, context) {
      const pages = pager(context, delayMs)
      // 다른 통로가 맡은 엔트리도 본다. 대체한 판이 ISO/IEC/IEEE 공동 표준(42010)이거나,
      // 추보가 YANG 모듈 제목(IEEE Std 802.1Qcw-2023)에만 나오기도 한다.
      const entries = [
        ...publications.flatMap((publication) => publication.entries),
        ...context.cited,
      ]
      const citedIds = new Set(
        entries.flatMap((entry) =>
          [entry.url, entry.note].flatMap((text) => (text && idOf(text)) || []),
        ),
      )
      const titles = entries.map((entry) => stripSite(entry.title))
      // 발행된 판은 페이지 id나 판 이름으로 가린다. 프로젝트 번호(P802.1Q)는 개정 때마다 다시 쓰이므로 id로만 가린다.
      const cited = {
        page: (link: Link) => citedIds.has(idOf(link.url) ?? ""),
        edition: (link: Link) =>
          cited.page(link) || titles.some((title) => mentions(title, link.text)),
      }
      const changes: Change[] = []
      for (const publication of publications)
        changes.push(...(await checkPublication(publication, pages, cited)))
      return changes
    },
  }
}

export const ieee = ieeeChannel(1000)

// 요청 사이에 delayMs를 둔다. 한 실행에서 같은 페이지는 한 번만 묻는다.
function pager(context: Context, delayMs: number) {
  const cache = new Map<string, IeeePage>()
  let last = 0
  return async (url: string): Promise<IeeePage> => {
    const cached = cache.get(url)
    if (cached) return cached
    const wait = last + delayMs - Date.now()
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
    try {
      const response = await fetchOk(context, url)
      const page = parsePage(await response.text(), url)
      cache.set(url, page)
      return page
    } finally {
      last = Date.now()
    }
  }
}

async function checkPublication(
  publication: Publication,
  pages: (url: string) => Promise<IeeePage>,
  cited: { page: (link: Link) => boolean; edition: (link: Link) => boolean },
): Promise<Change[]> {
  const base = standardNumber(publication.name)!.number
  const editions = publication.entries.flatMap((entry) => {
    const edition = editionOf(entry)
    return edition && edition.number === base && !edition.corrigendum
      ? [{ entry, year: edition.year }]
      : []
  })
  // 기준 판 엔트리가 없으면(추보나 프로젝트만 인용) 견줄 판이 없다.
  if (editions.length === 0) return []
  const page = publication.page
  const latest = editions
    .map(({ year }) => year)
    .sort()
    .at(-1)!
  const year = editions.some(({ year }) => year === page?.edition) ? page!.edition : latest
  const current: Entry[] = editions.filter((item) => item.year === year).map(({ entry }) => entry)
  const designation = `${base}-${year}`
  // 엔트리의 URL(Wayback 사본이면 그 안의 원 URL, 또는 note의 원 URL)이 표준 페이지를 가리키지 않으면,
  // 판 이름으로 옛 주소(standards.ieee.org/standard/<번호>-<연도>.html)를 묻는다. 표준 페이지로 넘겨준다.
  const url =
    current
      .flatMap((entry) => [entry.url, entry.note])
      .map((text) => text && canonical(text))
      .find((found) => found !== undefined && idOf(found) !== undefined) ??
    `https://standards.ieee.org/standard/${base.replace(/\./g, "_")}-${year}.html`
  const standard = await pages(url)
  if (!mentions(standard.title, designation))
    throw new ChannelError(
      `${url}는 ${designation}의 표준 페이지가 아니다(제목: ${standard.title})`,
    )
  if (!statuses.includes(standard.status))
    throw new ChannelError(`${url}의 Status를 알 수 없다: ${standard.status}`)

  const changes: Change[] = []
  const add = (change: Omit<Change, "publication" | "current">) =>
    changes.push({ publication, current, ...change })
  const statusEvidence = { field: `IEEE ${designation}의 Status`, value: standard.status, url }

  // 신호 1: 새 판, 대체, 폐지. Superseded by를 따라가 현행판에 닿는다. 도중의 판을 인용했으면 이미 안다.
  if (standard.status !== "Active Standard") {
    const successors = standard.fields.get("Superseded by") ?? []
    for (const successor of successors) {
      const evidence = [
        statusEvidence,
        { field: `IEEE ${designation}의 Superseded by`, value: successor.text, url },
      ]
      let link = successor
      let known = cited.edition(link)
      const seen = new Set([url])
      while (!known && !seen.has(link.url)) {
        seen.add(link.url)
        const next = await pages(link.url)
        evidence.push({ field: `IEEE ${link.text}의 Status`, value: next.status, url: link.url })
        const further = next.fields.get("Superseded by") ?? []
        if (next.status === "Active Standard" || further.length === 0) break
        evidence.push({
          field: `IEEE ${link.text}의 Superseded by`,
          value: further[0].text,
          url: link.url,
        })
        link = further[0]
        known = cited.edition(link)
      }
      if (known) continue
      add({
        kind: standardNumber(`IEEE ${link.text}`)?.number === base ? "new-edition" : "replaced",
        target: `IEEE ${link.text}`,
        evidence,
      })
    }
    // 대체한 판을 적지 않은 Superseded는 대체로, Inactive는 폐지로 알린다. 페이지가 이미 폐지라고 적었으면 알리지 않는다.
    if (successors.length === 0 && page?.status !== "폐지")
      add({
        kind: standard.status === "Superseded Standard" ? "replaced" : "withdrawn",
        target: `IEEE ${designation}`,
        evidence: [
          statusEvidence,
          { field: `IEEE ${designation}의 Superseded by`, value: "없음", url },
        ],
      })
    return changes
  }

  // 신호 2: 개정 착수. 개정 PAR는 같은 번호에 P를 붙인 것(P802.1Q)이다. 추보(P1722c)와 정정(P1003.1-2024/Cor 1)은 아니다.
  // 프로젝트 페이지를 가리키는 엔트리나, 이 판의 개정이라고 밝힌 프로젝트 엔트리(P802.1AE-2018-Rev)가 있으면 이미 안다.
  if (page) {
    const revisions = standard.projects.filter((project) => project.text === `P${base}`)
    const known =
      revisions.some(cited.page) ||
      publication.entries.some((entry) => {
        const project = projectOf(entry)
        return project?.number === base && project.revises === year
      })
    if (!known)
      for (const revision of revisions)
        add({
          kind: "revision",
          target: `${revision.text} (${designation} 개정)`,
          evidence: [
            statusEvidence,
            {
              field: `IEEE ${designation}의 Active Projects`,
              value: revision.text,
              url: revision.url,
            },
          ],
        })
  }

  // 신호 3: 현행판에 발행된 추보·정정을 인용하지 않았다. 대체된 판의 추보는 새 판에 합쳐졌으므로 보지 않는다.
  for (const [label, links] of standard.fields) {
    if (!/^(Amendments?|Corrigend(um|a))$/.test(label)) continue
    for (const link of links.filter((link) => !cited.edition(link)))
      add({
        kind: "supplement",
        target: `IEEE ${link.text}`,
        evidence: [{ field: `IEEE ${designation}의 ${label}`, value: link.text, url: link.url }],
      })
  }
  return changes
}
