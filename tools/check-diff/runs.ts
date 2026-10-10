import type { Page } from "../check-content/tree"
import type { Edition } from "./editions"
import { blocks, escapeRegExp, standardBodies } from "./text"

// 출처 구간을 세는 주장 블록 하나. 인용이 없는 블록(도해, 디스플레이 식, 다른 페이지로 넘기는 문장 등)은
// 구간에서 세지 않는다. 다만 인용 없는 문단이 목록이나 표 바로 앞에 있으면 그것을 여는 문장으로 보고
// 함께 묶는다. 출처 표시가 그 문장에 있기 때문이다.
export interface ClaimBlock {
  start: number // 첫 줄
  end: number // 끝 줄
  firstEditions: string // 첫 인용 자리의 판. 같은 판의 키는 한 출처이고, 출처가 여럿이면 정렬해 잇는다
  lastEditions: string // 마지막 인용 자리의 판
  firstKeys: string // 첫 인용 자리의 키. 여럿이면 정렬해 공백으로 잇는다
  lastKeys: string // 마지막 인용 자리의 키
  names: string[] // 첫 인용 자리의 출처를 드러내는 문서 모음 이름
  opening: string // 첫 인용 자리까지의 글. 위키링크는 표시 글자만 남긴다
}

const citationSpot = /(?:\[@[^\]\s]+\][ \t\n>]*)+/g
const keysOf = (spot: string) => [...spot.matchAll(/\[@([^\]\s]+)\]/g)].map((m) => m[1]).sort()
const spotKeys = (spot: string) => keysOf(spot).join(" ")
const spotEditions = (spot: string, editions: Map<string, Edition>) =>
  [...new Set(keysOf(spot).map((key) => editions.get(key)?.id ?? key))].sort().join(" + ")
const plain = (text: string) =>
  text.replace(/\[\[([^\]|\n]*?)(?:\\?\|([^\]\n]*))?\]\]/g, (_link, target, display) =>
    (display ?? target).replace(/#.*/, ""),
  )

export function claimBlocks(page: Page, editions: Map<string, Edition>): ClaimBlock[] {
  const lines = page.masked.split("\n")
  const list = blocks(page)
  const found: ClaimBlock[] = []
  list.forEach((block, index) => {
    if (!["paragraph", "list", "table", "callout"].includes(block.kind)) return
    const text = lines.slice(block.start - 1, block.end).join("\n")
    const spots = [...text.matchAll(citationSpot)]
    if (spots.length === 0) return
    const previous = list[index - 1]
    const lead =
      (block.kind === "list" || block.kind === "table") &&
      previous?.kind === "paragraph" &&
      !previous.text.includes("[@")
        ? previous
        : undefined
    const leadText = lead ? lines.slice(lead.start - 1, lead.end).join("\n") + "\n" : ""
    found.push({
      start: lead?.start ?? block.start,
      end: block.end,
      firstEditions: spotEditions(spots[0][0], editions),
      lastEditions: spotEditions(spots.at(-1)![0], editions),
      firstKeys: spotKeys(spots[0][0]),
      lastKeys: spotKeys(spots.at(-1)![0]),
      names: keysOf(spots[0][0]).flatMap((key) => editions.get(key)?.names ?? []),
      opening: plain(leadText + text.slice(0, spots[0].index)),
    })
  })
  return found
}

// 출처 표시로 보는 것: "…에 따르면", 표준 기구와 키의 발행기관 마디로는 드러나지 않는 출판물의 이름, 첫 인용
// 키의 발행기관·저자 마디(키의 첫 마디)와 부품 번호 마디(글자와 숫자가 섞인 마디), 문서 모음의 이름
// (µC/OS-III). "이 표준", "이 RFC"처럼 가리키는 말은 구간을 열지 못하므로 치지 않는다.
const standardBody = new RegExp(
  `(?<![A-Za-z0-9])(?:${standardBodies}|ASPICE|Automotive SPICE|CTFL|SWEBOK|UN R[0-9]+)(?![A-Za-z])`,
)

export function attributed(claim: ClaimBlock): boolean {
  const opening = claim.opening.replace(/(?<![가-힣])이 [A-Za-z][A-Za-z0-9.-]*/g, "")
  if (/에 따르면/.test(opening) || standardBody.test(opening)) return true
  const names = claim.firstKeys.split(" ").flatMap((key) => {
    const parts = key.split("-")
    return [parts[0], ...parts.slice(1).filter((part) => /[a-z]/.test(part) && /[0-9]/.test(part))]
  })
  return [...names.filter((name) => name.length >= 2 && /[a-z]/.test(name)), ...claim.names].some(
    (name) => new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(name)}(?![A-Za-z0-9])`, "i").test(opening),
  )
}

// 앞 주장 블록과 출처가 달라 구간을 여는 블록인지. 첫 블록도 구간을 연다. 같은 판의 다른 키가 이으면
// 같은 출처다.
export const opensRun = (list: ClaimBlock[], index: number) =>
  index === 0 || list[index - 1].lastEditions !== list[index].firstEditions
