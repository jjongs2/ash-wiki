import type { Page } from "../check-content/tree"
import type { Candidate, Context } from "./items"
import { blocks, sentences } from "./text"

export interface OwnerRow {
  concept: string
  owners: string[] // 주인이 아직 계획 없는 주제면 비어 있다.
  linkers: string[]
}

// 묶음 티켓 `## 범위`의 주인 페이지 표(.claude/skills/wiki-plan/SKILL.md의 ingest: 템플릿)를 읽는다.
// 링크만 하는 곳 칸은 첫 마침표 앞의 슬러그만 쓴다. 뒤는 "…는 고치지 않는다" 같은 단서다.
export function ownerRows(body: string): OwnerRow[] {
  const scope = body.split(/^## /m).find((section) => section.startsWith("범위"))
  if (!scope) throw new Error("티켓에 ## 범위 절이 없다")
  const lines = scope.split("\n")
  const header = lines.findIndex(
    (line) => line.startsWith("|") && /개념/.test(line) && /주인/.test(line),
  )
  if (header < 0) throw new Error("## 범위 절에 주인 페이지 표가 없다")
  const columns = cells(lines[header])
  const index = (name: string) => {
    const found = columns.findIndex((column) => column.startsWith(name))
    if (found < 0) throw new Error(`주인 페이지 표에 열 "${name}"이 없다`)
    return found
  }
  const [concept, owner, linker] = [index("개념"), index("주인"), index("링크만")]
  const rows: OwnerRow[] = []
  for (const line of lines.slice(header + 2)) {
    if (!line.startsWith("|")) break
    const row = cells(line)
    rows.push({
      concept: row[concept] ?? "",
      owners: slugs(row[owner] ?? ""),
      linkers: slugs(
        (row[linker] ?? "").replace(/`[^`]*`/g, (code) => code.replace(/\./g, " ")).split(".")[0],
      ),
    })
  }
  return rows
}

// 행의 개념 이름과 맞는 주인 페이지의 절 제목. 개념 칸은 "FTTI와 시간 구간(EOTI, MPFDTI 포함)"처럼 이름을
// 늘어놓으므로 쉼표, 괄호, 가운뎃점, "와·과"로 나눈 이름마다, 그 이름이 든 절 제목을 찾는다. 주인 페이지가 정의
// 강조로 옮긴 이름도 본다. `**분산 개발**(distributed development)`이 있으면 개념 이름 distributed
// development는 "분산 개발" 절과 맞는다. 대소문자는 가리지 않는다.
export function conceptSections(concept: string, owner: Page): string[] {
  const names = concept
    .split(/[,()·]|(?<=[가-힣A-Za-z0-9])(?:와|과) /)
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name.length >= 2)
  for (const [, term, gloss] of owner.masked.matchAll(/\*\*([^*\n]+)\*\*\(([^()\n]+)\)/g)) {
    if (gloss.split(/,\s*/).some((part) => names.includes(part.trim().toLowerCase())))
      names.push(term.toLowerCase())
  }
  const lines = owner.source.split("\n")
  return owner.mdast.children.flatMap((node) => {
    if (node.type !== "heading" || node.depth < 2) return []
    const heading = lines[node.position!.start.line - 1].replace(/^#+\s*/, "").trim()
    return names.some((name) => heading.toLowerCase().includes(name)) ? [heading] : []
  })
}

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim())

const slugs = (text: string) => [...text.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1])

// 줄마다 링크만 하는 곳의 페이지에서 주인 페이지로 가는 링크, 그 링크의 절 앵커, 링크가 든 문단의 문장 수를
// 보인다. 절 앵커가 없으면 행의 개념 이름과 맞는 주인 페이지의 절 제목을 함께 보인다. 규칙은 위키 규약의 중복 절과 위키링크 절이다. 고칠 것이 없는 줄(주인 페이지나 링크만 하는 곳의
// 페이지가 아직 없는 줄)과 이 브랜치가 고치지 않은 페이지의 앵커·문장 수 줄은 접어 수로만 센다. 이런 줄이
// 후보의 절반 가까이 되어 진짜 후보를 가렸다. "주인 페이지 링크가 없다"는 고치지 않은 페이지여도 접지 않는다.
export function ownerPage({ tree, changed, ticketBody }: Context): Candidate[] {
  if (ticketBody === undefined) return []
  const pages = new Map(tree.pages.map((page) => [page.name, page]))
  const touched = new Set(changed.map(({ page }) => page.name))
  const found: Candidate[] = []
  for (const row of ownerRows(ticketBody)) {
    if (row.owners.length === 0) continue
    for (const slug of row.linkers) {
      const page = pages.get(slug)
      const file = page?.file ?? `content/${slug}.md`
      const push = (folded: boolean) => (message: string, line?: number) =>
        found.push({
          file,
          line,
          message: `${row.concept} → ${row.owners.join(", ")}: ${message}`,
          folded,
        })
      const at = push(false)
      const fold = push(true)
      if (!page) {
        fold("페이지가 없다")
        continue
      }
      const links = ownerLinks(page, row.owners)
      if (links.length === 0 && !row.owners.some((owner) => pages.has(owner)))
        fold("주인 페이지가 아직 없다(링크는 린트가 채운다)")
      else if (links.length === 0) at("주인 페이지 링크가 없다")
      const linked = new Set(links.map((link) => link.target))
      const unlinked = row.owners.filter((owner) => pages.has(owner) && !linked.has(owner))
      if (links.length > 0 && unlinked.length > 0)
        at(`링크가 없는 주인 페이지: ${unlinked.join(", ")}`)
      for (const link of links) {
        const owner = pages.get(link.target)
        const matched = link.anchor || !owner ? [] : conceptSections(row.concept, owner)
        const anchor = link.anchor
          ? "있음"
          : `없음${matched.length > 0 ? `(맞는 절: ${matched.map((h) => `#${h}`).join(", ")})` : ""}`
        ;(touched.has(page.name) ? at : fold)(
          `${link.raw} 절 앵커 ${anchor}, 문단 ${link.sentences}문장`,
          link.line,
        )
      }
    }
  }
  return found
}

function ownerLinks(page: Page, owners: string[]) {
  const list = blocks(page)
  const lines = page.masked.split("\n")
  const found: { raw: string; target: string; anchor: boolean; line: number; sentences: number }[] =
    []
  lines.forEach((text, i) => {
    for (const match of text.matchAll(/(?<!!)\[\[([^\]\n]+?)\]\]/g)) {
      const [target, anchor] = match[1].split(/\\?\|/)[0].split("#")
      if (!owners.includes(target.trim())) continue
      const line = i + 1
      const block = list.find((b) => b.start <= line && line <= b.end)
      // 표와 목록은 링크가 든 줄(행, 항목)을, 문단은 문단 전체를 센다.
      const unit = !block || block.kind === "table" || block.kind === "list" ? text : block.text
      const plain = unit
        .replace(/^\s*(?:[-*]|\d+\.)\s+/, "")
        .replace(/(?<!\\)\|/g, " ")
        .replace(/\s+/g, " ")
      found.push({
        raw: match[0],
        target: target.trim(),
        anchor: anchor !== undefined,
        line,
        sentences: sentences(plain).length,
      })
    }
  })
  return found
}
