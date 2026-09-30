// ash-wiki: 로컬 프리뷰에서 기준 ref 이후 바뀐 블록을 diff처럼 표시하는 로컬 플러그인이다.
// WIKI_DIFF=<ref>를 줄 때만 켜진다. 변수가 없으면 아무것도 하지 않아 배포 빌드의 출력이 그대로다.
// 기준은 `git merge-base HEAD <ref>` 시점의 원본이고, 비교 대상은 디스크의 현재 파일이다. 사용법과 한계는
// docs/deploy.md의 로컬 프리뷰 절에 있다.
//
// 렌더된 HTML이 아니라 원본의 mdast를 블록 단위로 맞춘다. `[@키]`를 원본끼리 비교하므로 인용 번호가 밀려도
// 관계없는 문단은 바뀌지 않는다. 위키링크와 callout을 바꾸는 obsidian-flavored-markdown보다 먼저 돌도록
// quartz.config.yaml에서 order를 준다. 그때의 트리는 이 플러그인이 기준 원본을 파싱한 트리와 같은 꼴이다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { diffArrays } from "diff"
import { globbySync } from "globby"
import { minimatch } from "minimatch"
import type { Nodes, Parent, Root, RootContent } from "mdast"
import type { Processor } from "unified"
import type { VFile } from "vfile"
import type { QuartzTransformerPlugin } from "../../quartz/plugins/types"
import type { BuildCtx } from "../../quartz/util/ctx"

export const manifest = {
  name: "wiki-diff",
  displayName: "Wiki diff",
  description: "로컬 프리뷰에서 기준 ref 이후 바뀐 블록을 표시한다",
  version: "1.0.0",
  category: "transformer",
}

// 같은 종류의 두 블록은 어절 유사도가 이 값 이상이면 "바뀜"이고, 그 밑이면 지운 블록과 새 블록이다.
export const SIMILARITY_THRESHOLD = 0.5

// ---------------------------------------------------------------------------------------------------
// 어절과 유사도

export type Token = { text: string; start: number; end: number }

// 어절은 공백으로 나눈다. 별칭에 공백이 있는 위키링크(`[[can|CAN 버스]]`)는 한 어절로 둔다.
const TOKEN = /(?:!?\[\[[^\]\n]*\]\]|\S)+/g

export function tokenize(source: string, offset = 0): Token[] {
  return [...source.matchAll(TOKEN)].map((match) => ({
    text: match[0],
    start: offset + match.index,
    end: offset + match.index + match[0].length,
  }))
}

// 두 어절 목록에서 공통 어절(LCS)이 차지하는 비율
export function similarity(a: readonly string[], b: readonly string[]): number {
  if (a.length + b.length === 0) return 1
  const common = diffArrays([...a], [...b])
    .filter((part) => !part.added && !part.removed)
    .reduce((sum, part) => sum + part.count, 0)
  return (2 * common) / (a.length + b.length)
}

// ---------------------------------------------------------------------------------------------------
// 블록

export type Block = {
  kind: string
  // 블록의 노드와 그 조상(root부터 부모까지)
  node: RootContent
  ancestors: Parent[]
  // 비교하는 자기 내용. 목록 항목은 안쪽 목록을 뺀 자식이다.
  own: RootContent[]
  tokens: Token[]
  text: string
  // 지운 블록으로 보일 원본
  source: string
  // 자기 내용에 든 도해 임베드가 가리키는 파일(content 폴더 기준)
  diagrams: string[]
  // 표 행이면 칸마다의 원본
  cells?: string[]
  // 표시하려고 노드를 감쌌으면 그 감싼 노드
  outer?: RootContent
}

type Offsets = { start: number; end: number }
const offsets = (node: Nodes): Offsets => ({
  start: node.position?.start.offset ?? 0,
  end: node.position?.end.offset ?? 0,
})

type Wikilink = { type: "wikilink"; embedded: boolean; path: string }

// 블록의 자기 내용에 든 `![[….svg]]` 임베드의 경로. 문단 하나뿐인 도해도, 목록 항목이나 글 가운데의 도해도 든다.
function diagramsIn(nodes: readonly RootContent[]): string[] {
  return nodes.flatMap((node) => {
    const link = node as unknown as Wikilink
    if (link.type === "wikilink") {
      return link.embedded && link.path.toLowerCase().endsWith(".svg") ? [link.path] : []
    }
    return "children" in node ? diagramsIn(node.children as RootContent[]) : []
  })
}

function block(
  kind: string,
  node: RootContent,
  ancestors: Parent[],
  own: RootContent[],
  source: string,
): Block {
  const tokens = own.flatMap((child) => {
    const { start, end } = offsets(child)
    return tokenize(source.slice(start, end), start)
  })
  const text = own.map((child) => source.slice(offsets(child).start, offsets(child).end)).join("\n")
  const last = own.at(-1)
  const shown = source.slice(offsets(node).start, last ? offsets(last).end : offsets(node).end)
  // 표 칸의 위치는 앞의 `|`와 공백을 품는다
  const cells =
    node.type === "tableRow"
      ? node.children.map((cell) =>
          source
            .slice(offsets(cell).start, offsets(cell).end)
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .trim(),
        )
      : undefined
  return {
    kind,
    node,
    ancestors,
    own,
    tokens,
    text,
    source: shown,
    diagrams: diagramsIn(own),
    cells,
  }
}

// 블록은 가장 작은 단위까지 들어간다. 인용문과 callout은 속의 블록을, 표는 행을 하나씩 본다. 목록 항목은
// 자기 문단만 한 블록이고, 안쪽 목록의 항목은 따로 블록이 된다. 프런트매터는 넣지 않는다.
export function extractBlocks(root: Root, source: string): Block[] {
  const out: Block[] = []
  const walk = (parent: Parent, ancestors: Parent[]) => {
    const chain = [...ancestors, parent]
    for (const node of parent.children as RootContent[]) {
      switch (node.type) {
        case "yaml":
          break
        case "blockquote":
        case "list":
          walk(node, chain)
          break
        case "listItem": {
          const own = node.children.filter((child) => child.type !== "list")
          out.push(block("listItem", node, chain, own, source))
          for (const child of node.children)
            if (child.type === "list") walk(child, [...chain, node])
          break
        }
        case "table":
          for (const row of node.children)
            out.push(block("tableRow", row, [...chain, node], [row], source))
          break
        default:
          out.push(block(node.type, node, chain, [node], source))
      }
    }
  }
  walk(root, [])
  return out
}

export type BlockOp =
  | { type: "same" | "changed"; before: Block; after: Block }
  | { type: "added"; before?: undefined; after: Block }
  | { type: "removed"; before: Block; after?: undefined }

// 원본이 같은 블록을 먼저 맞추고(LCS), 그 사이에 남은 블록끼리 종류와 유사도로 "바뀜"을 짝짓는다.
// 짝은 순서를 거스르지 않게 앞에서부터 고른다.
export function alignBlocks(
  before: Block[],
  after: Block[],
  embedChanged: (target: string) => boolean = () => false,
): BlockOp[] {
  const key = (block: Block) => `${block.kind}\u0000${block.text}`
  const ops: BlockOp[] = []
  let removed: Block[] = []
  let added: Block[] = []
  const flush = () => {
    ops.push(...pairUp(removed, added))
    removed = []
    added = []
  }
  let i = 0
  let j = 0
  for (const part of diffArrays(before.map(key), after.map(key))) {
    if (part.removed) {
      removed.push(...before.slice(i, (i += part.count)))
    } else if (part.added) {
      added.push(...after.slice(j, (j += part.count)))
    } else {
      flush()
      for (let k = 0; k < part.count; k++) {
        const a = before[i++]
        const b = after[j++]
        const svg = b.diagrams.some(embedChanged)
        ops.push({ type: svg ? "changed" : "same", before: a, after: b })
      }
    }
  }
  flush()
  return ops
}

function pairUp(removed: Block[], added: Block[]): BlockOp[] {
  const ops: BlockOp[] = []
  let r = 0
  let a = 0
  for (let j = 0; j < added.length; j++) {
    const texts = added[j].tokens.map((t) => t.text)
    const i = removed.findIndex(
      (block, index) =>
        index >= r &&
        block.kind === added[j].kind &&
        similarity(
          block.tokens.map((t) => t.text),
          texts,
        ) >= SIMILARITY_THRESHOLD,
    )
    if (i < 0) continue
    for (; r < i; r++) ops.push({ type: "removed", before: removed[r] })
    for (; a < j; a++) ops.push({ type: "added", after: added[a] })
    ops.push({ type: "changed", before: removed[r++], after: added[a++] })
  }
  for (; r < removed.length; r++) ops.push({ type: "removed", before: removed[r] })
  for (; a < added.length; a++) ops.push({ type: "added", after: added[a] })
  return ops
}

// ---------------------------------------------------------------------------------------------------
// 어절 diff

export type WordDiff = {
  // 새 어절의 원본 범위. 이어진 새 어절은 한 범위로 묶는다.
  inserted: Array<[number, number]>
  // 빠진 어절과 그 자리. lead면 앞 어절 뒤에, 아니면 첫 어절 앞에 둔다.
  deleted: Array<{ at: number; text: string; lead: boolean }>
}

export function wordDiff(before: Token[], after: Token[]): WordDiff {
  const out: WordDiff = { inserted: [], deleted: [] }
  let i = 0
  let j = 0
  const parts = diffArrays(
    before.map((t) => t.text),
    after.map((t) => t.text),
  )
  for (const part of parts) {
    if (part.added) {
      out.inserted.push([after[j].start, after[j + part.count - 1].end])
      j += part.count
    } else if (part.removed) {
      const text = before
        .slice(i, i + part.count)
        .map((t) => t.text)
        .join(" ")
      const lead = j > 0
      out.deleted.push({ at: lead ? after[j - 1].end : (after[0]?.start ?? 0), text, lead })
      i += part.count
    } else {
      i += part.count
      j += part.count
    }
  }
  return out
}

// ---------------------------------------------------------------------------------------------------
// 표시

const CLASS = {
  changed: "wiki-diff-changed",
  added: "wiki-diff-added",
  removed: "wiki-diff-removed",
  newPage: "wiki-diff-new-page",
  word: "wiki-diff-word",
  source: "wiki-diff-source",
}

// remark-rehype는 모르는 노드를 data.hName의 요소로 바꾼다
function element(
  type: string,
  tagName: string,
  className: string | undefined,
  children: unknown[],
) {
  const hProperties = className ? { className: [className] } : {}
  return { type, data: { hName: tagName, hProperties }, children } as unknown as RootContent
}

// 원본을 렌더하지 않고 글자로 둔다. 텍스트 노드가 아니라서 위키링크, 태그 같은 변환이 닿지 않고,
// 부모가 <del>이라 인용 플러그인도 `[@키]`를 번호로 바꾸지 않는다.
function del(text: string, className: string) {
  return {
    type: "wikiDiffDel",
    value: text,
    data: {
      hName: "del",
      hProperties: { className: [className] },
      hChildren: [{ type: "text", value: text }],
    },
  } as unknown as RootContent
}

// 인용 플러그인은 부모가 span, p 같은 요소인 텍스트만 인용으로 바꾼다. <ins> 바로 밑이 아니게 span을 둔다.
const ins = (children: RootContent[]) =>
  element("wikiDiffIns", "ins", CLASS.word, [element("wikiDiffSpan", "span", undefined, children)])

const text = (value: string) => ({ type: "text", value }) as RootContent

function addClass(node: RootContent, className: string) {
  const data = (node.data ??= {}) as { hProperties?: { className?: unknown } }
  const properties = (data.hProperties ??= {})
  const existing = properties.className
  properties.className = [
    ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
    className,
  ]
}

// 속성이 그대로 요소에 가고 어절 diff를 표시하는 블록. 그 밖의 블록(코드, 수식, HTML 등)은 div로 감싸 표시한다.
const INLINE = new Set(["paragraph", "heading", "listItem", "tableRow"])
// 자식이 흐름 콘텐츠인 노드. 이 밑의 코드 블록 같은 잎은 ins로 감싸지 않는다.
const FLOW = new Set(["root", "blockquote", "listItem", "footnoteDefinition"])

function markBlock(block: Block, className: string) {
  if (INLINE.has(block.node.type)) return addClass(block.node, className)
  const parent = block.ancestors.at(-1)!
  const wrapper = element("wikiDiffBlock", "div", className, [block.node])
  parent.children[parent.children.indexOf(block.node as never)] = wrapper as never
  block.outer = wrapper
}

// 텍스트 노드 값의 글자마다 원본 오프셋. 이스케이프(`\*`), 인용문 접두어(`> `), 들여쓰기처럼 값에 없는
// 원본 글자는 건너뛴다.
function valueOffsets(value: string, source: string, start: number): number[] {
  if (value === source) return Array.from(value, (_, i) => start + i)
  const out: number[] = []
  let k = 0
  for (let i = 0; i < value.length; i++) {
    const found = source.indexOf(value[i], k)
    if (found >= 0) k = found
    out.push(start + k)
    if (found >= 0) k++
  }
  return out
}

type Deletion = WordDiff["deleted"][number]

// 빠진 어절을 앞뒤 어절과 공백으로 띄운다. next는 바로 뒤에 오는 글자다.
function deletionNodes(deletion: Deletion, next: string | undefined): RootContent[] {
  const node = del(deletion.text, CLASS.word)
  if (!deletion.lead) return [node, text(" ")]
  return next && /\S/.test(next) ? [text(" "), node, text(" ")] : [text(" "), node]
}

// 블록의 자기 내용에 어절 diff를 입힌다. 텍스트 노드는 어절 경계에서 쪼개고, 위키링크나 인라인 코드처럼
// 쪼갤 수 없는 잎은 통째로 감싼다. 빠진 어절은 자리가 들어 있는 첫 잎 앞이나 안에 둔다.
function applyWords(own: RootContent[], diff: WordDiff, source: string) {
  const inserted = (offset: number) => diff.inserted.some(([s, e]) => s <= offset && offset < e)
  const queue = [...diff.deleted].sort((a, b) => a.at - b.at)
  const take = (limit: (at: number) => boolean, next?: string) => {
    const out: RootContent[] = []
    while (queue.length > 0 && limit(queue[0].at)) out.push(...deletionNodes(queue.shift()!, next))
    return out
  }
  let last: Parent | undefined

  const rewrite = (parent: Parent) => {
    const phrasing = !FLOW.has(parent.type)
    const out: RootContent[] = []
    for (const child of parent.children as RootContent[]) {
      if (child.type === "list" || !child.position) {
        out.push(child)
        continue
      }
      const { start, end } = offsets(child)
      if (child.type === "text") {
        out.push(...splitText(child.value, source.slice(start, end), start, end))
        last = parent
      } else if ("children" in child) {
        out.push(...(phrasing ? take((at) => at < start) : []))
        rewrite(child)
        out.push(child)
      } else if (phrasing) {
        out.push(...take((at) => at <= start))
        const overlaps = diff.inserted.some(([s, e]) => s < end && e > start)
        out.push(overlaps ? ins([child]) : child)
        out.push(...take((at) => at < end))
        last = parent
      } else {
        out.push(child)
      }
    }
    parent.children = out as never
  }

  const splitText = (value: string, slice: string, start: number, end: number) => {
    const at = valueOffsets(value, slice, start)
    const out: RootContent[] = []
    let buffer = ""
    let buffered = false
    const flush = () => {
      if (buffer) out.push(buffered ? ins([text(buffer)]) : text(buffer))
      buffer = ""
    }
    for (let i = 0; i <= value.length; i++) {
      const offset = i < value.length ? at[i] : end
      const deletions = take((position) => position <= offset, value[i])
      if (deletions.length > 0) {
        flush()
        out.push(...deletions)
      }
      if (i === value.length) break
      const now = inserted(offset)
      if (now !== buffered) {
        flush()
        buffered = now
      }
      buffer += value[i]
    }
    flush()
    return out
  }

  for (const node of own) if ("children" in node) rewrite(node)
  if (last && queue.length > 0) last.children.push(...(take(() => true) as never[]))
}

// 지운 블록을 넣을 노드. 목록 항목과 표 행은 옆 블록이 같은 종류면 같은 꼴로 그 옆에 넣는다.
function removedNode(block: Block, sameSlot: boolean): RootContent {
  if (sameSlot && block.kind === "listItem") {
    const item = {
      type: "listItem",
      spread: false,
      children: [{ type: "paragraph", children: [del(block.source, CLASS.source)] }],
    } as RootContent
    addClass(item, CLASS.removed)
    return item
  }
  if (sameSlot && block.kind === "tableRow") {
    const cells = block.cells!.map((cell) => ({
      type: "tableCell",
      children: [del(cell, CLASS.source)],
    }))
    const node = { type: "tableRow", children: cells } as RootContent
    addClass(node, CLASS.removed)
    return node
  }
  return element("wikiDiffBlock", "div", CLASS.removed, [del(block.source, CLASS.source)])
}

// 새 블록과 같은 표시라 막대의 n, p가 여기에 선다. 문구는 CSS로 그린다. 텍스트 노드로 두면 설명(description)과
// 검색 본문의 첫 문장이 된다.
function newPageNotice(): RootContent {
  const node = element("wikiDiffNewPage", "div", CLASS.added, [])
  addClass(node, CLASS.newPage)
  return node
}

// 대문 배너와 새 페이지 안내는 frontmatter 바로 뒤에 둔다
function insertAfterFrontmatter(root: Root, node: RootContent) {
  const at = root.children.findIndex((child) => child.type !== "yaml")
  root.children.splice(at < 0 ? root.children.length : at, 0, node as never)
}

const isSlot = (kind: string) => kind === "listItem" || kind === "tableRow"

// 흐름 콘텐츠를 넣을 수 있는 자리. 목록 항목이나 표 행이면 그 목록이나 표 바깥이다.
function flowAnchor(block: Block): { parent: Parent; node: RootContent } {
  const chain = [...block.ancestors, (block.outer ?? block.node) as unknown as Parent]
  for (let k = chain.length - 2; k >= 0; k--) {
    if (FLOW.has(chain[k].type) && chain[k].type !== "listItem") {
      return { parent: chain[k], node: chain[k + 1] as unknown as RootContent }
    }
  }
  return { parent: chain[0], node: chain[1] as unknown as RootContent }
}

function insertRemoved(ops: BlockOp[], root: Root) {
  const lastInserted = new Map<RootContent, RootContent>()
  const insertAfter = (parent: Parent, anchor: RootContent, node: RootContent) => {
    const ref = lastInserted.get(anchor) ?? anchor
    parent.children.splice(parent.children.indexOf(ref as never) + 1, 0, node as never)
    lastInserted.set(anchor, node)
  }
  // callout의 제목 문단 앞에 넣으면 OFM이 callout을 알아보지 못하므로 그 뒤에 넣는다
  const insertBefore = (parent: Parent, anchor: RootContent, node: RootContent) => {
    const at = parent.children.indexOf(anchor as never)
    parent.children.splice(at === 0 && isCallout(parent) ? 1 : at, 0, node as never)
  }
  const nearest = (from: number, step: number) => {
    for (let k = from; k >= 0 && k < ops.length; k += step) if (ops[k].after) return ops[k].after
    return undefined
  }
  ops.forEach((op, index) => {
    if (op.type !== "removed") return
    const block = op.before
    const prev = nearest(index - 1, -1)
    const next = nearest(index + 1, 1)
    // 같은 꼴로 옆에 넣으려면 종류와 깊이가 같아야 한다. 깊이가 다르면 바깥 항목이 안쪽 목록에 들어간다.
    const slot = (other?: Block) =>
      other &&
      isSlot(block.kind) &&
      other.kind === block.kind &&
      other.ancestors.length === block.ancestors.length
    if (prev && slot(prev)) {
      insertAfter(prev.ancestors.at(-1)!, prev.outer ?? prev.node, removedNode(block, true))
    } else if (next && slot(next)) {
      insertBefore(next.ancestors.at(-1)!, next.outer ?? next.node, removedNode(block, true))
    } else if (prev) {
      const { parent, node } = flowAnchor(prev)
      insertAfter(parent, node, removedNode(block, false))
    } else if (next) {
      const { parent, node } = flowAnchor(next)
      insertBefore(parent, node, removedNode(block, false))
    } else {
      root.children.push(removedNode(block, false) as never)
    }
  })
}

// OFM은 blockquote의 첫 문단에서 첫 텍스트 노드의 첫 줄이 `[!타입]`으로 시작하면 callout으로 본다.
// OFM의 text transform이 제목 줄 뒤에 빈 줄을 넣어, 빌드에서 제목 줄은 따로 된 문단이다.
const CALLOUT = /^\[![\w-]+\|?(?:.+?)?\][+-]?/

function isCallout(parent: Parent): boolean {
  const first = parent.children[0] as RootContent | undefined
  if (parent.type !== "blockquote" || first?.type !== "paragraph") return false
  const head = first.children[0]
  return head?.type === "text" && CALLOUT.test(head.value)
}

// callout 제목 문단이면 원본에서 `[!타입]` 지시어의 범위
function calloutDirective(block: Block, source: string): [number, number] | undefined {
  const parent = block.ancestors.at(-1)!
  if (block.kind !== "paragraph" || parent.children[0] !== block.node || !isCallout(parent)) {
    return undefined
  }
  const { start } = offsets(block.node)
  const match = source.slice(start).match(CALLOUT)
  return match ? [start, start + match[0].length] : undefined
}

// 지시어는 표시 없이 맨 앞에 남긴다. 새 어절에서 빼고, 그 앞에 둘 빠진 어절은 지시어 뒤로 옮긴다.
// 종류가 바뀌면 `[!warning] [!note]`처럼 옛 지시어가 제목에 <del>로 보인다.
function keepDirective(diff: WordDiff, [start, end]: [number, number]): WordDiff {
  return {
    inserted: diff.inserted
      .map(([s, e]): [number, number] => [s < end && e > start ? Math.max(s, end) : s, e])
      .filter(([s, e]) => s < e),
    deleted: diff.deleted.map((d) => (d.at < end ? { ...d, at: end, lead: true } : d)),
  }
}

// 트리에 diff를 표시한다. base가 null이면 새 페이지라, 블록마다 칠하면 본문 전체가 덮이므로 맨 위에
// 안내 하나만 둔다. 바뀐 곳이 있으면 true.
export function markDiff(
  root: Root,
  source: string,
  base: { root: Root; source: string } | null,
  embedChanged?: (target: string) => boolean,
): boolean {
  if (!base) {
    insertAfterFrontmatter(root, newPageNotice())
    return true
  }
  const before = extractBlocks(base.root, base.source)
  const ops = alignBlocks(before, extractBlocks(root, source), embedChanged)
  for (const op of ops) {
    if (op.type === "changed") {
      markBlock(op.after, CLASS.changed)
      if (INLINE.has(op.after.kind)) {
        const diff = wordDiff(op.before.tokens, op.after.tokens)
        const directive = calloutDirective(op.after, source)
        applyWords(op.after.own, directive ? keepDirective(diff, directive) : diff, source)
      }
    } else if (op.type === "added") {
      markBlock(op.after, CLASS.added)
      if (op.after.kind === "listItem") {
        const { start, end } = offsets(op.after.node)
        applyWords(op.after.own, { inserted: [[start, end]], deleted: [] }, source)
      }
    }
  }
  insertRemoved(ops, root)
  return ops.some((op) => op.type !== "same")
}

// ---------------------------------------------------------------------------------------------------
// 바뀐 페이지 목록

export type PageChanges = { added: string[]; removed: string[]; changed: string[] }

// base와 disk는 content 폴더 기준 경로에서 blob id로 가는 표다. files는 Quartz가 처리하는 파일(ignorePatterns를
// 거친 것)이고, 기준 쪽 파일에도 같은 무시 경로를 적용한다. 이름을 바꾼 페이지는 지운 페이지와 새 페이지다.
// 프런트매터만 바뀐 페이지와 가리키는 도해만 바뀐 페이지도 바뀐 페이지다.
export function pageChanges(input: {
  base: ReadonlyMap<string, string>
  disk: ReadonlyMap<string, string>
  files: readonly string[]
  ignorePatterns: readonly string[]
  read: (file: string) => string
}): PageChanges {
  const { base, disk, files, ignorePatterns, read } = input
  const ignored = (file: string) =>
    ignorePatterns.some(
      (p) => minimatch(file, p, { dot: true }) || minimatch(file, `${p}/**`, { dot: true }),
    )
  const isPage = (file: string) => file.endsWith(".md")
  const current = files.filter(isPage)
  const embedChanged = assetChanged(base, disk)
  return {
    added: current.filter((file) => !base.has(file)).sort(),
    removed: [...base.keys()]
      .filter((file) => isPage(file) && !ignored(file) && !current.includes(file))
      .sort(),
    changed: current
      .filter(
        (file) =>
          base.has(file) &&
          (base.get(file) !== disk.get(file) || embeds(read(file)).some(embedChanged)),
      )
      .sort(),
  }
}

const assetChanged =
  (base: ReadonlyMap<string, string>, disk: ReadonlyMap<string, string>) => (file: string) =>
    base.get(file) !== disk.get(file)

const embeds = (source: string) =>
  [...source.matchAll(/!\[\[([^\]|#\n]+?\.svg)\s*(?:[|#][^\]\n]*)?\]\]/gi)].map((m) => m[1])

// ---------------------------------------------------------------------------------------------------
// 기준 시점

type Snapshot = {
  ref: string
  base: string
  // content 폴더 기준 경로에서 blob id로
  baseFiles: Map<string, string>
  diskFiles: Map<string, string>
  // Quartz가 처리하는 현재 파일(ignorePatterns와 .gitignore를 거친 것)
  files: string[]
}

function git(cwd: string, args: string[], input?: string): string {
  return execFileSync("git", args, {
    cwd,
    input,
    encoding: "utf8",
    stdio: "pipe",
    maxBuffer: 256 * 1024 * 1024,
  })
}

// 기준을 찾지 못하면 빌드를 멈춘다. diff 없이 조용히 빌드하지 않는다.
function snapshot(ctx: BuildCtx, ref: string): Snapshot {
  const cwd = path.resolve(ctx.argv.directory)
  let base: string
  try {
    base = git(cwd, ["merge-base", "HEAD", ref]).trim()
  } catch (err) {
    const reason = String((err as { stderr?: unknown }).stderr || err).trim()
    throw new Error(
      `WIKI_DIFF=${ref}: \`git merge-base HEAD ${ref}\`로 기준을 찾지 못했다. ${reason}`,
    )
  }
  // content 폴더 안에서 ls-tree는 그 폴더 밑의 파일만, 그 폴더 기준 경로로 준다
  const baseFiles = new Map<string, string>()
  for (const entry of git(cwd, ["ls-tree", "-r", "-z", base]).split("\0")) {
    const match = entry.match(/^\S+ blob (\S+)\t(.+)$/s)
    if (match) baseFiles.set(match[2], match[1])
  }
  // `--serve`의 재빌드는 ctx.allFiles를 파싱한 뒤에야 고치므로, 현재 파일은 빌드처럼 직접 찾는다
  // (quartz/util/glob.ts). --stdin-paths는 경로를 저장소 루트 기준으로 읽으므로 절대 경로를 준다.
  const files = globbySync("**/*.*", {
    cwd,
    ignore: ctx.cfg.configuration.ignorePatterns,
    gitignore: true,
  }).map((file) => file.split(path.sep).join("/"))
  const absolute = files.map((file) => path.join(cwd, file)).join("\n")
  const oids = files.length > 0 ? git(cwd, ["hash-object", "--stdin-paths"], absolute) : ""
  const diskFiles = new Map(
    oids
      .split("\n")
      .filter(Boolean)
      .map((oid, i) => [files[i] as string, oid]),
  )
  return { ref, base, baseFiles, diskFiles, files }
}

function changesOf(ctx: BuildCtx, snap: Snapshot): PageChanges {
  return pageChanges({
    base: snap.baseFiles,
    disk: snap.diskFiles,
    files: snap.files,
    ignorePatterns: ctx.cfg.configuration.ignorePatterns,
    read: (file) => fs.readFileSync(path.join(ctx.argv.directory, file), "utf8"),
  })
}

// 빌드가 파일을 읽을 때처럼 앞뒤 공백을 지우고 text transform을 거친다
function prepare(ctx: BuildCtx, source: string): string {
  let out = source.trim()
  for (const plugin of ctx.cfg.plugins.transformers) {
    if (plugin.textTransform) out = plugin.textTransform(ctx, out)
  }
  return out
}

// ---------------------------------------------------------------------------------------------------
// 대문 배너와 터미널 목록

const label = (snap: Snapshot) => `${snap.ref} 기준(merge-base ${snap.base.slice(0, 7)})`

type Group = { title: string; files: string[]; kind: "added" | "changed" | "removed" }

function groupsOf(changes: PageChanges): Group[] {
  const groups: Group[] = [
    { title: "새 페이지", files: changes.added, kind: "added" },
    { title: "바뀐 페이지", files: changes.changed, kind: "changed" },
    { title: "지운 페이지", files: changes.removed, kind: "removed" },
  ]
  return groups.filter((group) => group.files.length > 0)
}

const NO_CHANGES = "기준 이후 바뀐 페이지가 없다."

// 범례와 같은 견본. 새 블록, 바뀐 블록, 지운 블록의 표시를 줄여 그린다.
const swatch = (kind: Group["kind"]) => ({
  type: "wikiDiffSwatch",
  data: { hName: "span", hProperties: { className: ["wiki-diff-swatch"], dataKind: kind } },
  children: [],
})

function banner(snap: Snapshot, changes: PageChanges): RootContent {
  const block = (tagName: string, className: string, children: unknown[]) =>
    element("wikiDiffBannerPart", tagName, className, children)
  const link = (file: string) => ({
    type: "link",
    url: `./${file.replace(/\.md$/, "")}`,
    children: [text(file.replace(/\.md$/, ""))],
  })
  const groups = groupsOf(changes)
  const children: unknown[] = [
    block("p", "wiki-diff-banner-title", [text("기준 이후 바뀐 페이지")]),
    block("p", "wiki-diff-banner-meta", [
      text(`${label(snap)}. 오른쪽 아래 막대나 n, p 키로 바뀐 곳을 차례로 본다.`),
    ]),
  ]
  if (groups.length === 0) children.push(block("p", "wiki-diff-banner-empty", [text(NO_CHANGES)]))
  else {
    children.push(
      block(
        "div",
        "wiki-diff-banner-groups",
        groups.map(({ title, files, kind }) =>
          block("section", `wiki-diff-banner-${kind}`, [
            block("p", "wiki-diff-banner-heading", [
              swatch(kind),
              text(`${title} ${files.length}`),
            ]),
            block(
              "ul",
              "wiki-diff-banner-list",
              files.map((file) =>
                block("li", "", [
                  kind === "removed" ? text(file.replace(/\.md$/, "")) : link(file),
                ]),
              ),
            ),
          ]),
        ),
      ),
    )
  }
  return element("wikiDiffBanner", "div", "wiki-diff-banner", children)
}

function report(snap: Snapshot, changes: PageChanges): string {
  const groups = groupsOf(changes)
  const lines = [`[wiki-diff] ${label(snap)}`]
  if (groups.length === 0) lines.push(`  ${NO_CHANGES}`)
  for (const { title, files } of groups)
    lines.push(`  ${title} (${files.length}): ${files.join(", ")}`)
  return lines.join("\n")
}

// ---------------------------------------------------------------------------------------------------
// 스타일. 변수가 있을 때만 넣는다. 사이트 스타일시트(custom.scss)를 건드리면 배포 CSS가 바뀐다.

const CSS = `
:root {
  --wiki-diff-add: #1f7a3d;
  --wiki-diff-del: #b42318;
  --wiki-diff-gutter: 0.6rem;
}
:root[saved-theme="dark"] {
  --wiki-diff-add: #4cb870;
  --wiki-diff-del: #f0776b;
}
:root {
  --wiki-diff-add-tint: color-mix(in srgb, var(--wiki-diff-add) 7%, transparent);
  --wiki-diff-add-word: color-mix(in srgb, var(--wiki-diff-add) 16%, transparent);
  --wiki-diff-del-tint: color-mix(in srgb, var(--wiki-diff-del) 6%, transparent);
  --wiki-diff-del-word: color-mix(in srgb, var(--wiki-diff-del) 8%, transparent);
  --wiki-diff-solid: linear-gradient(var(--wiki-diff-add), var(--wiki-diff-add));
  --wiki-diff-dashed: repeating-linear-gradient(to bottom, var(--wiki-diff-add) 0 6px, transparent 6px 10px);
  --wiki-diff-removed: linear-gradient(var(--wiki-diff-del), var(--wiki-diff-del));
}

/* 블록. 글자 자리는 그대로 두고, 왼쪽 여백의 막대와 바깥으로 번지는 틴트로 표시한다. */
:is(.wiki-diff-added, .wiki-diff-changed, .wiki-diff-removed):not(li, tr) {
  position: relative;
  border-radius: 5px;
}
:is(.wiki-diff-added, .wiki-diff-changed, .wiki-diff-removed):not(li, tr)::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(-1 * var(--wiki-diff-gutter));
  width: 3px;
  border-radius: 3px;
  background: var(--wiki-diff-solid);
}
.wiki-diff-added:not(li, tr) {
  background: var(--wiki-diff-add-tint);
  box-shadow: 0 0 0 var(--wiki-diff-gutter) var(--wiki-diff-add-tint);
}
.wiki-diff-changed:not(li, tr)::before { background: var(--wiki-diff-dashed); }
div.wiki-diff-new-page { margin: 1rem 0 1.5rem; color: var(--darkgray); font-size: 0.9em; }
div.wiki-diff-new-page::after { content: "새 페이지. 기준에 없던 페이지라 블록마다 표시하지 않는다."; }
div.wiki-diff-removed {
  margin: 1.5rem 0;
  background: var(--wiki-diff-del-tint);
  box-shadow: 0 0 0 var(--wiki-diff-gutter) var(--wiki-diff-del-tint);
}
div.wiki-diff-removed::before { background: var(--wiki-diff-removed); }

li.wiki-diff-added::marker, li.wiki-diff-changed::marker { color: var(--wiki-diff-add); font-weight: 700; }
li.wiki-diff-removed::marker { color: var(--wiki-diff-del); }
tr.wiki-diff-added > td { background: var(--wiki-diff-add-tint); }
tr.wiki-diff-removed > td { background: var(--wiki-diff-del-tint); }
tr.wiki-diff-added > td:first-child { background: var(--wiki-diff-solid) left / 3px 100% no-repeat, var(--wiki-diff-add-tint); }
tr.wiki-diff-changed > td:first-child { background: var(--wiki-diff-dashed) left / 3px 100% no-repeat; }
tr.wiki-diff-removed > td:first-child { background: var(--wiki-diff-removed) left / 3px 100% no-repeat, var(--wiki-diff-del-tint); }

/* 어절 */
ins.wiki-diff-word, del.wiki-diff-word {
  border-radius: 3px;
  padding: 0 0.1em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
ins.wiki-diff-word { background: var(--wiki-diff-add-word); color: inherit; text-decoration: none; }
del.wiki-diff-word {
  background: var(--wiki-diff-del-word);
  color: var(--wiki-diff-del);
  text-decoration: line-through 1px;
}

/* 지운 원문은 흐리게 두고 가는 취소선을 긋는다 */
del.wiki-diff-source {
  font-family: var(--codeFont);
  font-size: 0.85em;
  line-height: 1.7;
  white-space: pre-wrap;
  color: var(--gray);
  text-decoration: line-through 1px color-mix(in srgb, var(--wiki-diff-del) 60%, transparent);
}

.wiki-diff-current {
  outline: 2px solid var(--secondary);
  outline-offset: calc(var(--wiki-diff-gutter) + 2px);
  border-radius: 5px;
}
.wiki-diff-only .wiki-diff-quiet { display: none !important; }

/* 견본. 범례와 배너에서 블록 표시를 줄여 그린다. */
.wiki-diff-swatch {
  display: inline-block;
  flex: none;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 2px;
}
.wiki-diff-swatch[data-kind="added"] { background: var(--wiki-diff-solid) left / 3px 100% no-repeat, var(--wiki-diff-add-word); }
.wiki-diff-swatch[data-kind="changed"] {
  background: repeating-linear-gradient(to bottom, var(--wiki-diff-add) 0 3px, transparent 3px 5px) left / 3px 100% no-repeat;
  box-shadow: inset 0 0 0 1px var(--lightgray);
}
.wiki-diff-swatch[data-kind="removed"] { background: var(--wiki-diff-removed) left / 3px 100% no-repeat, var(--wiki-diff-del-word); }

/* 대문 배너 */
.wiki-diff-banner {
  margin: 1rem 0 2rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--lightgray);
  border-radius: 5px;
}
.wiki-diff-banner p { margin: 0; }
.wiki-diff-banner-title { color: var(--dark); font-weight: 600; }
.wiki-diff-banner-meta, .wiki-diff-banner-empty { margin-top: 0.25rem !important; color: var(--gray); font-size: 0.9em; }
.wiki-diff-banner-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1rem 1.5rem;
  margin-top: 1rem;
}
.wiki-diff-banner-heading {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--dark);
  font-size: 0.9em;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.wiki-diff-banner-list { margin: 0.35rem 0 0; padding-left: 1.25rem; }
.wiki-diff-banner-list li { margin: 0.1rem 0; }
.wiki-diff-banner-removed li { color: var(--gray); text-decoration: line-through 1px; }

/* 오른쪽 아래 막대. 페이지 끝의 내용을 가리지 않게 막대가 있을 때만 아래 여백을 둔다. */
body:has(#wiki-diff-nav) { padding-bottom: 7rem; }
#wiki-diff-nav {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 900;
  display: grid;
  gap: 0.5rem;
  padding: 0.6rem 0.7rem;
  background: var(--light);
  color: var(--darkgray);
  border: 1px solid var(--lightgray);
  border-radius: 5px;
  box-shadow: 0 6px 24px color-mix(in srgb, var(--dark) 14%, transparent);
  font-family: var(--bodyFont);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}
.wiki-diff-nav-row { display: flex; align-items: center; gap: 0.4rem; }
.wiki-diff-nav-count { min-width: 6.5em; color: var(--dark); font-weight: 600; white-space: nowrap; }
.wiki-diff-nav-page { min-width: 6.5em; color: var(--gray); white-space: nowrap; }
.wiki-diff-nav-rule { align-self: stretch; width: 1px; margin: 0 0.15rem; background: var(--lightgray); }
#wiki-diff-nav button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.55rem;
  font: inherit;
  color: var(--dark);
  background: transparent;
  border: 1px solid var(--lightgray);
  border-radius: 5px;
  white-space: nowrap;
  cursor: pointer;
}
#wiki-diff-nav button:hover:not(:disabled) { background: var(--highlight); border-color: var(--secondary); }
#wiki-diff-nav button:active:not(:disabled) { transform: translateY(1px); }
#wiki-diff-nav button:focus-visible { outline: 2px solid var(--secondary); outline-offset: 1px; }
#wiki-diff-nav button:disabled { color: var(--gray); opacity: 0.45; cursor: default; }
#wiki-diff-nav [role="switch"] { border-color: transparent; padding-left: 0.3rem; }
.wiki-diff-switch {
  position: relative;
  width: 1.75rem;
  height: 1rem;
  border-radius: 1rem;
  background: var(--lightgray);
  transition: background-color 0.15s;
}
.wiki-diff-switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(1rem - 4px);
  height: calc(1rem - 4px);
  border-radius: 50%;
  background: var(--light);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--dark) 30%, transparent);
  transition: transform 0.15s;
}
[aria-checked="true"] > .wiki-diff-switch { background: var(--secondary); }
[aria-checked="true"] > .wiki-diff-switch::after { transform: translateX(0.75rem); }
.wiki-diff-nav-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem 0.8rem; color: var(--gray); font-size: 0.8rem; }
.wiki-diff-nav-legend > span { display: inline-flex; align-items: center; gap: 0.35rem; }
.wiki-diff-nav-legend kbd {
  padding: 0 0.3rem;
  font-family: var(--codeFont);
  font-size: 0.75rem;
  color: var(--darkgray);
  border: 1px solid var(--lightgray);
  border-radius: 3px;
}
.wiki-diff-nav-keys { margin-left: auto; }
@media (max-width: 800px) {
  #wiki-diff-nav { left: 0.5rem; right: 0.5rem; bottom: max(0.5rem, env(safe-area-inset-bottom)); }
  .wiki-diff-nav-keys { display: none !important; }
  .wiki-diff-nav-count, .wiki-diff-nav-page { min-width: 0; }
  .wiki-diff-nav-page { margin-left: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .wiki-diff-switch, .wiki-diff-switch::after { transition: none; }
}
`

// ---------------------------------------------------------------------------------------------------
// 바뀐 곳 훑기. 오른쪽 아래 막대에서 바뀌지 않은 블록을 숨기고(바뀐 곳만), ↑·↓나 n·p 키로 바뀐 블록을
// 차례로 옮겨 다닌다. 페이지의 끝에 이르면 바뀐 페이지 목록(대문 배너와 같은 순서)의 다음이나 이전 페이지로
// 넘어간다. 숨길 때 바뀐 블록을 품은 인용문, 목록, 표는 남기고, 제목과 callout 제목, 표 머리는 맥락으로
// 남긴다. 제목 밑에 남는 블록이 없으면 그 제목도 숨긴다. SPA 이동마다 `nav`에서 다시 계산한다.
// 빌드가 문자열로 넣는 브라우저 스크립트라 타입 검사를 받지 않는다.

// 브라우저가 읽는 바뀐 페이지 목록. 재빌드는 리소스 파일을 다시 쓰지 않아 목록을 스크립트에 넣으면 낡으므로,
// 빌드마다 출력 폴더에 쓰고 스크립트가 페이지를 옮길 때마다 읽는다.
const PAGES_FILE = "static/wiki-diff-pages.json"

// 새 페이지와 바뀐 페이지의 slug. 지운 페이지는 옮겨 갈 곳이 없어 뺀다.
function writePages(output: string, changes: PageChanges) {
  const pages = [...changes.added, ...changes.changed].map((file) => file.replace(/\.md$/, ""))
  const file = path.join(output, PAGES_FILE)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ pages }))
}

const SCRIPT = `(() => {
  const MARK = ".wiki-diff-changed, .wiki-diff-added, .wiki-diff-removed"
  const CONTEXT = "h1, h2, h3, h4, h5, h6, thead, .callout-title, .wiki-diff-banner"
  const ONLY = "wiki-diff-only"
  const ENTER = "wiki-diff-enter"
  const level = (el) => (/^H([1-6])$/.exec(el.tagName) || [])[1]
  const article = () =>
    document.querySelector(".center article.popover-hint") || document.querySelector("article.popover-hint")
  const slug = () => document.body.dataset.slug || ""
  const toRoot = () => "../".repeat(slug().split("/").length - 1) || "./"
  let current = null
  let pages = []
  let setups = 0

  function read(key) {
    try { return sessionStorage.getItem(key) } catch { return null }
  }
  function write(key, value) {
    try { value === null ? sessionStorage.removeItem(key) : sessionStorage.setItem(key, value) } catch {}
  }
  const readOnly = () => read(ONLY) === "1"

  // 이 페이지의 새 페이지 안내. 끼워 넣은(transclude) 다른 페이지의 안내는 세지 않는다.
  const newPage = (root) =>
    [...root.querySelectorAll(".${CLASS.newPage}")].some((el) => !el.closest(".transclude"))

  function markQuiet(root) {
    // 새 페이지는 전체가 바뀐 곳이라 숨기지 않는다
    if (newPage(root)) return
    const keep = new Set()
    for (const mark of root.querySelectorAll(MARK)) {
      for (let el = mark; el && el !== root; el = el.parentElement) keep.add(el)
    }
    const walk = (parent) => {
      for (const child of parent.children) {
        if (child.matches(MARK)) {
          for (const inner of child.children) if (inner.matches("ul, ol")) walk(inner)
        } else if (keep.has(child)) {
          walk(child)
        } else if (!child.matches(CONTEXT)) {
          child.classList.add("wiki-diff-quiet")
        }
      }
    }
    walk(root)
    // 본문은 article 밑의 감싼 요소에 들어 있으므로, 제목이 있는 부모마다 따진다
    const parents = new Set([...root.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => h.parentElement))
    for (const parent of parents) hideEmptyHeadings([...parent.children])
  }

  function hideEmptyHeadings(top) {
    top.forEach((el, i) => {
      const own = level(el)
      if (!own) return
      for (const next of top.slice(i + 1)) {
        const other = level(next)
        if (other && other <= own) break
        if (!other && !next.classList.contains("wiki-diff-quiet")) return
      }
      el.classList.add("wiki-diff-quiet")
    })
  }

  const marksOf = () => {
    const root = article()
    return root ? [...root.querySelectorAll(MARK)] : []
  }

  function focus(mark, smooth) {
    if (current) current.classList.remove("wiki-diff-current")
    current = mark
    current.classList.add("wiki-diff-current")
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    current.scrollIntoView({ block: "center", behavior: smooth && !still ? "smooth" : "auto" })
    render()
  }

  // 페이지 안에서 다음(step 1)이나 이전(step -1) 변경. 끝을 넘으면 옆 페이지로 넘어간다.
  function move(step) {
    const marks = marksOf()
    let target = marks.indexOf(current) + step
    if (!marks.includes(current)) {
      const tops = marks.map((mark) => mark.getBoundingClientRect().top)
      const below = tops.findIndex((top) => top > 1)
      if (step > 0) target = below < 0 ? marks.length : below
      else target = (below < 0 ? marks.length : below) - 1
    }
    if (target >= 0 && target < marks.length) return focus(marks[target], true)
    const at = pages.indexOf(slug())
    const next = at < 0 ? (step > 0 ? pages[0] : pages.at(-1)) : pages[at + step]
    if (next === undefined) return
    write(ENTER, step > 0 ? "first" : "last")
    const url = new URL(toRoot() + next, location.href)
    if (window.spaNavigate) window.spaNavigate(url)
    else location.assign(url)
  }

  // 이 방향으로 갈 곳이 있는지. 페이지 안에 없으면 옆 페이지를 본다.
  function canMove(step) {
    const marks = marksOf()
    const at = marks.indexOf(current)
    if (at >= 0 ? marks[at + step] : marks.length > 0) return true
    const page = pages.indexOf(slug())
    return page < 0 ? pages.length > 0 : pages[page + step] !== undefined
  }

  function render() {
    const bar = document.getElementById("wiki-diff-nav")
    if (!bar) return
    const marks = marksOf()
    const at = marks.indexOf(current)
    const page = pages.indexOf(slug())
    bar.querySelector("[data-count]").textContent =
      marks.length === 0 ? "바뀐 블록 없음" : newPage(article()) ? "새 페이지" : at < 0 ? "변경 " + marks.length + "개" : "변경 " + (at + 1) + " / " + marks.length
    bar.querySelector("[data-page]").textContent =
      page < 0 ? "페이지 " + pages.length + "개" : "페이지 " + (page + 1) + " / " + pages.length
    bar.querySelector("[data-only]").setAttribute("aria-checked", String(readOnly()))
    for (const button of bar.querySelectorAll("[data-step]")) button.disabled = !canMove(Number(button.dataset.step))
  }

  async function loadPages() {
    try {
      const response = await fetch(toRoot() + "${PAGES_FILE}", { cache: "no-store" })
      return (await response.json()).pages || []
    } catch {
      return []
    }
  }

  async function setup() {
    const run = ++setups
    current = null
    document.getElementById("wiki-diff-nav")?.remove()
    document.documentElement.classList.toggle(ONLY, readOnly())
    const loaded = await loadPages()
    if (run !== setups) return
    pages = loaded
    const root = article()
    const marks = marksOf()
    if (!root || (marks.length === 0 && pages.length === 0)) return
    markQuiet(root)
    const bar = document.createElement("div")
    bar.id = "wiki-diff-nav"
    bar.setAttribute("role", "toolbar")
    bar.setAttribute("aria-label", "바뀐 곳 훑기")
    bar.innerHTML =
      '<div class="wiki-diff-nav-row">' +
      '<button type="button" data-step="-1" aria-label="이전 변경" title="이전 변경 (p)">↑</button>' +
      '<button type="button" data-step="1" aria-label="다음 변경" title="다음 변경 (n)">↓</button>' +
      '<span class="wiki-diff-nav-count" data-count aria-live="polite"></span>' +
      '<span class="wiki-diff-nav-page" data-page></span>' +
      '<span class="wiki-diff-nav-rule"></span>' +
      '<button type="button" role="switch" aria-checked="false" data-only>' +
      '<span class="wiki-diff-switch"></span>바뀐 곳만</button>' +
      '</div>' +
      '<div class="wiki-diff-nav-legend">' +
      '<span><span class="wiki-diff-swatch" data-kind="added"></span>새 블록</span>' +
      '<span><span class="wiki-diff-swatch" data-kind="changed"></span>바뀐 블록</span>' +
      '<span><span class="wiki-diff-swatch" data-kind="removed"></span>지운 블록</span>' +
      '<span class="wiki-diff-nav-keys"><kbd>n</kbd><kbd>p</kbd> 다음, 이전</span>' +
      '</div>'
    bar.addEventListener("click", (event) => {
      const button = event.target.closest("button")
      if (!button) return
      if (button.dataset.step) return move(Number(button.dataset.step))
      const only = !readOnly()
      write(ONLY, only ? "1" : "0")
      document.documentElement.classList.toggle(ONLY, only)
      if (current) current.scrollIntoView({ block: "center" })
      render()
    })
    document.body.append(bar)
    // 옆 페이지에서 넘어왔으면 그 방향의 첫 변경에 선다
    const enter = read(ENTER)
    write(ENTER, null)
    if (enter && marks.length > 0) focus(enter === "last" ? marks.at(-1) : marks[0], false)
    else render()
  }

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return
    const target = event.target
    if (target.closest && target.closest("input, textarea, select, [contenteditable]")) return
    if (event.key === "n") move(1)
    else if (event.key === "p") move(-1)
  })
  document.addEventListener("nav", setup)
  setup()
})()
`

// ---------------------------------------------------------------------------------------------------
// 플러그인

const refOf = () => process.env.WIKI_DIFF || undefined

const WikiDiff: QuartzTransformerPlugin = () => {
  return {
    name: "WikiDiff",
    markdownPlugins(ctx) {
      const ref = refOf()
      if (!ref) return []
      const snap = snapshot(ctx, ref)
      const cwd = path.resolve(ctx.argv.directory)
      const embedChanged = assetChanged(snap.baseFiles, snap.diskFiles)
      return [
        function (this: Processor) {
          // 기준 원본은 이 파이프라인과 같은 구문 확장으로 파싱한다
          const processor = this
          return (tree: Root, file: VFile) => {
            const relative = file.data.relativePath as string
            const source = String(file.value)
            const oid = snap.baseFiles.get(relative)
            const same = oid !== undefined && oid === snap.diskFiles.get(relative)
            if (!same || embeds(source).some(embedChanged)) {
              let base: { root: Root; source: string } | null = null
              if (oid !== undefined) {
                const baseSource = same ? source : prepare(ctx, git(cwd, ["cat-file", "blob", oid]))
                base = { root: processor.parse(baseSource) as Root, source: baseSource }
              }
              markDiff(tree, source, base, embedChanged)
            }
            if (file.data.slug === "index")
              insertAfterFrontmatter(tree, banner(snap, changesOf(ctx, snap)))
          }
        },
      ]
    },
    // 빌드마다(`--serve`의 재빌드 포함) 한 번 불린다. 재빌드는 바뀐 파일만 다시 파싱해 대문 배너가
    // 갱신되지 않을 수 있으므로, 최신 목록은 여기서 터미널에 찍는다.
    externalResources(ctx) {
      const ref = refOf()
      if (!ref) return undefined
      const snap = snapshot(ctx, ref)
      const changes = changesOf(ctx, snap)
      console.log(report(snap, changes))
      writePages(ctx.argv.output, changes)
      return {
        css: [{ content: CSS, inline: true }],
        js: [{ loadTime: "afterDOMReady", contentType: "inline", script: SCRIPT }],
      }
    },
  }
}

export default WikiDiff
