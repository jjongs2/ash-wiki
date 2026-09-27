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
  // 도해 임베드면 가리키는 파일(content 폴더 기준)
  embed?: string
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

// 문단 하나가 `![[….svg]]` 임베드 하나뿐이면 그 경로
function embedTarget(node: RootContent): string | undefined {
  if (node.type !== "paragraph") return undefined
  const children = node.children.filter(
    (child) => !(child.type === "text" && child.value.trim() === ""),
  )
  const link = children[0] as unknown as Wikilink | undefined
  if (children.length !== 1 || link?.type !== "wikilink" || !link.embedded) return undefined
  return link.path.toLowerCase().endsWith(".svg") ? link.path : undefined
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
    embed: embedTarget(node),
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
        case "toml" as string:
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
        const svg = b.embed !== undefined && embedChanged(b.embed)
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

// 속성이 그대로 요소에 가는 블록에는 클래스를 달고, 그렇지 않은 블록(코드, 수식, HTML 등)은 div로 감싼다
const CLASSED = new Set(["paragraph", "heading", "listItem", "tableRow"])
// 어절 diff를 표시하는 블록
const PHRASING = new Set(["paragraph", "heading", "listItem", "tableRow"])
// 자식이 흐름 콘텐츠인 노드. 이 밑의 코드 블록 같은 잎은 ins로 감싸지 않는다.
const FLOW = new Set(["root", "blockquote", "listItem", "footnoteDefinition"])

function markBlock(block: Block, className: string) {
  if (CLASSED.has(block.node.type)) return addClass(block.node, className)
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

function deletionNodes(deletion: Deletion): RootContent[] {
  const node = del(deletion.text, CLASS.word)
  return deletion.lead ? [text(" "), node] : [node, text(" ")]
}

// 블록의 자기 내용에 어절 diff를 입힌다. 텍스트 노드는 어절 경계에서 쪼개고, 위키링크나 인라인 코드처럼
// 쪼갤 수 없는 잎은 통째로 감싼다. 빠진 어절은 자리가 들어 있는 첫 잎 앞이나 안에 둔다.
function applyWords(own: RootContent[], diff: WordDiff, source: string) {
  const inserted = (offset: number) => diff.inserted.some(([s, e]) => s <= offset && offset < e)
  const queue = [...diff.deleted].sort((a, b) => a.at - b.at)
  const take = (limit: (at: number) => boolean) => {
    const out: RootContent[] = []
    while (queue.length > 0 && limit(queue[0].at)) out.push(...deletionNodes(queue.shift()!))
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
      const deletions = take((position) => position <= offset)
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
  const insertBefore = (parent: Parent, anchor: RootContent, node: RootContent) => {
    parent.children.splice(parent.children.indexOf(anchor as never), 0, node as never)
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
    const slot = (other?: Block) => other && isSlot(block.kind) && other.kind === block.kind
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

// 트리에 diff를 표시한다. base가 null이면 새 페이지라 모든 블록이 새 블록이다. 바뀐 곳이 있으면 true.
export function markDiff(
  root: Root,
  source: string,
  base: { root: Root; source: string } | null,
  embedChanged?: (target: string) => boolean,
): boolean {
  const before = base ? extractBlocks(base.root, base.source) : []
  const ops = alignBlocks(before, extractBlocks(root, source), embedChanged)
  for (const op of ops) {
    if (op.type === "changed") {
      markBlock(op.after, CLASS.changed)
      if (PHRASING.has(op.after.kind)) {
        applyWords(op.after.own, wordDiff(op.before.tokens, op.after.tokens), source)
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
  // --stdin-paths는 경로를 저장소 루트 기준으로 읽으므로 절대 경로를 준다
  const files = ctx.allFiles.filter((file) => fs.existsSync(path.join(cwd, file)))
  const absolute = files.map((file) => path.join(cwd, file)).join("\n")
  const oids = files.length > 0 ? git(cwd, ["hash-object", "--stdin-paths"], absolute) : ""
  const diskFiles = new Map(
    oids
      .split("\n")
      .filter(Boolean)
      .map((oid, i) => [files[i] as string, oid]),
  )
  return { ref, base, baseFiles, diskFiles }
}

function changesOf(ctx: BuildCtx, snap: Snapshot): PageChanges {
  return pageChanges({
    base: snap.baseFiles,
    disk: snap.diskFiles,
    files: ctx.allFiles,
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

function groupsOf(changes: PageChanges): Array<[string, string[], boolean]> {
  return [
    ["새 페이지", changes.added, true],
    ["바뀐 페이지", changes.changed, true],
    ["지운 페이지", changes.removed, false],
  ]
}

const NO_CHANGES = "기준 이후 바뀐 페이지가 없다."

function banner(snap: Snapshot, changes: PageChanges): RootContent {
  const paragraph = (children: unknown[]) => ({ type: "paragraph", children })
  const link = (file: string) => ({
    type: "link",
    url: `./${file.replace(/\.md$/, "")}`,
    children: [text(file)],
  })
  const children: unknown[] = [
    paragraph([{ type: "strong", children: [text("바뀐 페이지")] }, text(` · ${label(snap)}`)]),
  ]
  const groups = groupsOf(changes).filter(([, files]) => files.length > 0)
  if (groups.length === 0) children.push(paragraph([text(NO_CHANGES)]))
  for (const [title, files, linked] of groups) {
    children.push(paragraph([text(`${title} (${files.length})`)]))
    children.push({
      type: "list",
      ordered: false,
      spread: false,
      children: files.map((file) => ({
        type: "listItem",
        spread: false,
        children: [paragraph([linked ? link(file) : text(file)])],
      })),
    })
  }
  return element("wikiDiffBanner", "div", "wiki-diff-banner", children)
}

function report(snap: Snapshot, changes: PageChanges): string {
  const groups = groupsOf(changes).filter(([, files]) => files.length > 0)
  const lines = [`[wiki-diff] ${label(snap)}`]
  if (groups.length === 0) lines.push(`  ${NO_CHANGES}`)
  for (const [title, files] of groups)
    lines.push(`  ${title} (${files.length}): ${files.join(", ")}`)
  return lines.join("\n")
}

// ---------------------------------------------------------------------------------------------------
// 스타일. 변수가 있을 때만 넣는다. 사이트 스타일시트(custom.scss)를 건드리면 배포 CSS가 바뀐다.

const CSS = `
:root { --wiki-diff-ins: 46, 160, 67; --wiki-diff-del: 207, 34, 46; }
:root[saved-theme="dark"] { --wiki-diff-ins: 63, 185, 80; --wiki-diff-del: 248, 81, 73; }
.wiki-diff-added { background: rgba(var(--wiki-diff-ins), 0.12); box-shadow: -4px 0 0 rgb(var(--wiki-diff-ins)); }
.wiki-diff-changed { box-shadow: -4px 0 0 rgba(var(--wiki-diff-ins), 0.5); }
tr.wiki-diff-added > td { background: rgba(var(--wiki-diff-ins), 0.12); }
tr.wiki-diff-changed > td:first-child { box-shadow: inset 4px 0 0 rgba(var(--wiki-diff-ins), 0.5); }
li.wiki-diff-added, li.wiki-diff-changed { background: none; box-shadow: none; }
li.wiki-diff-added::marker, li.wiki-diff-changed::marker { color: rgb(var(--wiki-diff-ins)); font-weight: bold; }
ins.wiki-diff-word { background: rgba(var(--wiki-diff-ins), 0.2); text-decoration: none; border-radius: 2px; }
del.wiki-diff-word, del.wiki-diff-source { color: rgb(var(--wiki-diff-del)); background: rgba(var(--wiki-diff-del), 0.08); }
del.wiki-diff-source { white-space: pre-wrap; font-family: var(--codeFont); font-size: 0.9em; }
div.wiki-diff-removed { border: 1px dashed rgb(var(--wiki-diff-del)); border-radius: 4px; padding: 0.25rem 0.5rem; margin: 1rem 0; }
li.wiki-diff-removed::marker { color: rgb(var(--wiki-diff-del)); }
.wiki-diff-banner { border: 1px solid rgb(var(--wiki-diff-ins)); border-radius: 4px; padding: 0 1rem; margin: 1rem 0; }
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
            if (file.data.slug === "index") {
              const at = tree.children.findIndex((node) => node.type !== "yaml")
              const node = banner(snap, changesOf(ctx, snap))
              tree.children.splice(at < 0 ? tree.children.length : at, 0, node as never)
            }
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
      console.log(report(snap, changesOf(ctx, snap)))
      return { css: [{ content: CSS, inline: true }] }
    },
  }
}

export default WikiDiff
