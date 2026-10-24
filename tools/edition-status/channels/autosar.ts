import zlib from "node:zlib"
import {
  ChannelError,
  compareEditions,
  fetchOk,
  type Change,
  type Channel,
  type Context,
  type Entry,
  type Publication,
} from "../model"

// AUTOSAR 통로. 용어집의 출판물이 릴리스로 함께 나오는 문서 묶음을 하나로 치므로, 플랫폼 하나가 출판물 하나다.
// 플랫폼 페이지의 Current Release로 새 릴리스를 잡고, 그 릴리스의 Release Overview에서 Obsolete·Removed 목록을 옮긴다.
const site = "https://www.autosar.org"

interface Platform {
  code: string // 엔트리 제목의 판 표시. 예: AUTOSAR CP R25-11
  name: string // 출판물 이름. 표준 페이지가 있으면 그 title과 같다.
  url: string
}

export const platforms: Platform[] = [
  {
    code: "CP",
    name: "AUTOSAR Classic Platform",
    url: `${site}/standards/classic-platform`,
  },
  {
    code: "AP",
    name: "AUTOSAR Adaptive Platform",
    url: `${site}/standards/adaptive-platform`,
  },
  { code: "FO", name: "AUTOSAR Foundation", url: `${site}/standards/foundation` },
]

// 인수 시험(TC)은 플랫폼 페이지가 없다. 문서 검색에서 릴리스마다의 Release Overview를 찾는다.
export const acceptanceTests = "AUTOSAR Acceptance Tests for Classic Platform"
export const acceptanceSearchUrl = `${site}/search?tx_solr%5Bq%5D=AcceptanceTestsClassicPlatformReleaseOverview`

// R25-11 이후의 Release Overview 경로. 옛 릴리스는 경로와 파일 이름이 다르지만, 새 릴리스만 읽는다.
export const releaseOverviewUrl = (code: string, release: string) =>
  `${site}/fileadmin/standards/${release}/${code}/AUTOSAR_${code}_TR_ReleaseOverview.pdf`

// 판 표시. tools/check-diff/editions.ts의 autosarRelease와 같다. 예: AUTOSAR CP R25-11, AUTOSAR R4.0.3, AUTOSAR TC Release 1.2.0
const releasePattern = /\bAUTOSAR ((?:CP|AP|FO|TC) )?(R[0-9]+(?:[.-][0-9]+)+|Release [0-9.]+[0-9])/

function releaseOf(entry: Entry): { code: string; release: string } | undefined {
  if (!entry.publisher.includes("AUTOSAR")) return undefined
  const match = entry.title.match(releasePattern)
  if (!match) return undefined
  const release = match[2].replace(/^Release /, "R")
  // 플랫폼이 나뉘기 전의 R2.x~R4.x는 Classic Platform이다.
  const code = match[1]?.trim() ?? (/^R[2-4]\./.test(release) ? "CP" : undefined)
  return code ? { code, release } : undefined
}

const nameOf = (code: string) =>
  code === "TC" ? acceptanceTests : platforms.find((platform) => platform.code === code)?.name

export const autosar: Channel = {
  id: "autosar",
  ownsPage: (page) => page.publisher === "AUTOSAR",
  publicationOf(entry) {
    const found = releaseOf(entry)
    return found && nameOf(found.code)
  },
  async check(publications, context) {
    const changes: Change[] = []
    for (const publication of publications) {
      const releases = publication.entries.flatMap((entry) => {
        const found = releaseOf(entry)
        return found ? [{ entry, ...found }] : []
      })
      if (releases.length === 0) continue
      // 현행으로 인용한 판은 가장 새 릴리스다. 표준 페이지의 edition은 연도뿐이라 쓰지 않는다.
      const cited = releases
        .map(({ release }) => release)
        .sort(compareEditions)
        .at(-1)!
      const current = releases
        .filter(({ release }) => compareEditions(release, cited) === 0)
        .map(({ entry }) => entry)
      const code = releases[0].code
      const latest =
        code === "TC" ? await acceptanceRelease(context) : await platformRelease(code, context)
      if (compareEditions(latest.release, cited) <= 0) continue
      const change: Change = {
        publication,
        kind: "new-edition",
        target: `AUTOSAR ${code} ${latest.release}`,
        evidence: [latest.evidence],
        current,
      }
      if (code !== "TC") {
        const url = releaseOverviewUrl(code, latest.release)
        const lists = await obsoleteAndRemoved(url, context)
        change.evidence.push({
          field: "Release Overview의 Obsolete·Removed Specifications",
          value: `${lists.length}건`,
          url,
        })
        change.notes = lists.map(
          ({ status, item }) =>
            `${status}: ${item}${cites(publication, item) ? " — 참고문헌이 인용한 문서" : ""}`,
        )
      }
      changes.push(change)
    }
    return changes
  },
}

// 플랫폼 페이지의 Current Release. 예: AUTOSAR Classic Release R25-11
async function platformRelease(code: string, context: Context) {
  const platform = platforms.find((platform) => platform.code === code)!
  const html = await (await fetchOk(context, platform.url)).text()
  const match = html.match(
    /Current Release\s*<\/h[1-6]>[\s\S]{0,2000}?>\s*(AUTOSAR [A-Za-z]+ Release (R[0-9]+(?:[.-][0-9]+)+))\s*</,
  )
  if (!match) throw new ChannelError(`${platform.url}에서 Current Release를 찾지 못했다`)
  return {
    release: match[2],
    evidence: { field: "Current Release", value: match[1], url: platform.url },
  }
}

// 문서 검색 결과의 TC Release Overview 경로에서 가장 새 릴리스. 예: fileadmin/standards/R1.2.0/TC/…
async function acceptanceRelease(context: Context) {
  const html = await (await fetchOk(context, acceptanceSearchUrl)).text()
  const paths = [
    ...html.matchAll(
      /data-document-url="(fileadmin\/standards\/(R[0-9]+(?:\.[0-9]+)+)\/TC\/[^"]*ReleaseOverview[^"]*)"/g,
    ),
  ].sort((a, b) => compareEditions(a[2], b[2]))
  const latest = paths.at(-1)
  if (!latest)
    throw new ChannelError(`${acceptanceSearchUrl}에서 TC Release Overview를 찾지 못했다`)
  return {
    release: latest[2],
    evidence: {
      field: "문서 검색의 TC Release Overview",
      value: latest[1],
      url: acceptanceSearchUrl,
    },
  }
}

// Release Overview의 2.2.x 절에서 Obsolete·Removed 목록. 목록이 none이면 비운다.
async function obsoleteAndRemoved(url: string, context: Context) {
  const response = await fetchOk(context, url)
  const lines = pdfLines(Buffer.from(await response.arrayBuffer()))
  const items: { status: string; item: string }[] = []
  for (const status of ["Obsolete", "Removed"]) {
    const start = lines.findIndex(
      (line) => line.match(headingPattern)?.[1] === `${status} Specifications`,
    )
    if (start < 0) throw new ChannelError(`${url}에서 ${status} Specifications 절을 찾지 못했다`)
    const end = lines.findIndex((line, i) => i > start && headingPattern.test(line))
    for (const item of bullets(lines.slice(start + 1, end < 0 ? undefined : end)))
      if (!/^none$/i.test(item)) items.push({ status, item })
  }
  return items
}

// 절 제목. 예: 2.2.3 Obsolete Specifications
const headingPattern = /^[0-9]+(?:\.[0-9]+)+ ([A-Z].*)$/

// 글머리 기호로 항목을 가르고, 이어지는 줄을 붙인다. 첫 글머리 앞의 안내 문장은 버린다.
function bullets(lines: string[]): string[] {
  const items: string[] = []
  for (const line of lines) {
    const bullet = line.match(/^[\x0f\x95•]\s*(.*)$/)
    if (bullet) items.push(bullet[1])
    else if (items.length > 0)
      items[items.length - 1] += /[A-Za-z]-$/.test(items[items.length - 1]) ? line : ` ${line}`
  }
  return items
}

// 항목이 참고문헌이 인용한 문서인가. R25-11 꼴(CP SWS FlashDriver)은 URL의 파일 이름과, 옛 꼴은 제목과 견준다.
function cites(publication: Publication, item: string): boolean {
  const id = item.match(/^((?:CP|AP|FO) [A-Z]+ [A-Za-z0-9]+)\b/)?.[1]
  const title = item
    .replace(/^(?:CP|AP|FO) [A-Z]+ [A-Za-z0-9]+\s*/, "")
    .match(/^\(?([^(,]+?)[,(]/)?.[1]
  return publication.entries.some(
    (entry) =>
      (id !== undefined && entry.url?.endsWith(`/AUTOSAR_${id.replace(/ /g, "_")}.pdf`)) ||
      (title !== undefined && entry.title.replace(/ \(AUTOSAR [^)]*\)$/, "") === title.trim()),
  )
}

// PDF 내용 스트림(FlateDecode)의 글자를 줄로 꺼낸다. AUTOSAR 문서는 LaTeX로 만들어 글자가 Tj/TJ 문자열에 그대로 있다.
// 낱말 사이는 큰 음수 자간으로, 줄은 세로로 옮기는 Td로 나뉜다. 쪽마다 되풀이되는 머리말·꼬리말 줄은 뺀다.
export function pdfLines(data: Buffer): string[] {
  const raw = data.toString("latin1")
  const lines: string[] = []
  const streamPattern = /<<((?:(?!>>\s*stream)[\s\S])*?)>>\s*stream\r?\n/g
  for (const match of raw.matchAll(streamPattern)) {
    if (!match[1].includes("FlateDecode")) continue
    const start = match.index + match[0].length
    const end = raw.indexOf("endstream", start)
    let content: string
    try {
      content = zlib
        .inflateSync(data.subarray(start, end), { finishFlush: zlib.constants.Z_SYNC_FLUSH })
        .toString("latin1")
    } catch {
      continue
    }
    if (!/\bBT\b/.test(content)) continue
    let line = ""
    const flush = () => {
      if (line.trim() !== "") lines.push(line.replace(/\s+/g, " ").trim())
      line = ""
    }
    const operators =
      /\[((?:\\.|[^\]\\])*)\]\s*TJ|\(((?:\\.|[^)\\])*)\)\s*Tj|(-?[0-9.]+) (-?[0-9.]+) T[dD]|T\*|\bTm\b|\bET\b/g
    for (const op of content.matchAll(operators)) {
      if (op[1] !== undefined) {
        for (const part of op[1].matchAll(/\(((?:\\.|[^)\\])*)\)|(-?[0-9.]+)/g))
          if (part[1] !== undefined) line += unescapePdf(part[1])
          else if (Number(part[2]) < -200) line += " "
      } else if (op[2] !== undefined) line += unescapePdf(op[2])
      else if (op[3] !== undefined && Number(op[4]) === 0) line += " "
      else flush()
    }
    flush()
  }
  const counts = new Map<string, number>()
  for (const line of lines) counts.set(line, (counts.get(line) ?? 0) + 1)
  return lines.filter(
    (line) => counts.get(line)! < 5 && !/^[0-9]+ of [0-9]+ Document ID/.test(line),
  )
}

function unescapePdf(text: string): string {
  return text.replace(/\\([0-7]{1,3}|[\s\S])/g, (_, c: string) =>
    /^[0-7]+$/.test(c)
      ? String.fromCharCode(parseInt(c, 8))
      : (({ n: "\n", r: "", t: " " } as Record<string, string>)[c] ?? c),
  )
}
