import { fromHtml } from "hast-util-from-html"
import type { Element, ElementContent, Root, RootContent } from "hast"

// 렌더된 페이지 HTML을 Reader Testing의 외부 독자가 읽을 텍스트로 바꾼다(.claude/skills/wiki-reader-testing).
// 독자가 화면에서 보는 것(제목, 속성, 본문, 참고문헌)만 옮기고 사이드바와 머리글은 뺀다.
// 꼴은 마크다운에 가깝게 두되, 링크는 대상 슬러그를, 도해는 도해 안의 글자를 적어 화면의 정보를 잃지 않게 한다.

type Node = Root | RootContent | ElementContent

function classes(node: Element): string[] {
  const value = node.properties.className
  return Array.isArray(value) ? value.map(String) : []
}

function hasClass(node: Element, name: string): boolean {
  return classes(node).includes(name)
}

function prop(node: Element, name: string): string | undefined {
  const value = node.properties[name]
  return value === undefined || value === null ? undefined : String(value)
}

function find(node: Node, match: (element: Element) => boolean): Element | undefined {
  if (node.type === "element" && match(node)) return node
  if (!("children" in node)) return undefined
  for (const child of node.children) {
    const found = find(child, match)
    if (found) return found
  }
  return undefined
}

function findAll(
  node: Node,
  match: (element: Element) => boolean,
  found: Element[] = [],
): Element[] {
  if (node.type === "element" && match(node)) found.push(node)
  if ("children" in node) for (const child of node.children) findAll(child, match, found)
  return found
}

function plain(node: Node): string {
  if (node.type === "text") return node.value
  if (!("children" in node)) return ""
  return node.children.map(plain).join("")
}

function squash(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

const isTag = (tag: string) => (node: Element) => node.tagName === tag

// 링크 대상 슬러그. 태그 페이지와 같은 페이지 앵커는 링크된 페이지가 아니다.
function linkedSlug(node: Element): string | undefined {
  const slug = prop(node, "dataSlug")
  if (slug === undefined || hasClass(node, "tag-link") || slug.startsWith("tags/")) return undefined
  return slug
}

// 화면에서 접혀 있는 절과 콜아웃의 표시. 독자 프롬프트가 이 표시를 설명한다.
const collapsedMark = " (접힌 채로 보임)"

class Writer {
  links: string[] = []

  constructor(private diagrams: Map<string, string[]>) {}

  inline(node: Node): string {
    if (node.type === "text") return node.value
    if (node.type !== "element") return "children" in node ? this.inlines(node.children) : ""
    const tag = node.tagName
    if (tag === "svg" || prop(node, "ariaHidden") === "true" || prop(node, "role") === "anchor")
      return ""
    if (hasClass(node, "katex")) return `$${squash(plain(node))}$`
    if (tag === "br") return "\n"
    if (tag === "strong" || tag === "b") return `**${this.inlines(node.children)}**`
    if (tag === "em" || tag === "i") return `*${this.inlines(node.children)}*`
    if (tag === "code") return `\`${plain(node)}\``
    if (tag === "a") return this.link(node)
    if (tag === "object") return this.diagram(node)
    if (tag === "img") return `[그림 ${prop(node, "src") ?? ""}: ${prop(node, "alt") ?? ""}]`
    return this.inlines(node.children)
  }

  inlines(children: Node[]): string {
    return children.map((child) => this.inline(child)).join("")
  }

  link(node: Element): string {
    const text = this.inlines(node.children)
    const href = prop(node, "href") ?? ""
    // 인용 번호 [n]의 n은 링크지만 독자에게는 번호다.
    if (href.startsWith("#bib-")) return text
    if (hasClass(node, "external") || /^https?:/.test(href))
      return text === href ? href : `[${text}](${href})`
    const slug = linkedSlug(node)
    if (slug !== undefined) {
      if (!this.links.includes(slug)) this.links.push(slug)
      const anchor = href.includes("#") ? href.slice(href.indexOf("#")) : ""
      return `[${text}](→ ${slug}${anchor})`
    }
    if (href.startsWith("#")) return `[${text}](→ ${href})`
    return text
  }

  diagram(node: Element): string {
    const src = prop(node, "data") ?? ""
    const lines = this.diagrams.get(src) ?? []
    return [
      `[도해 ${src}. 도해 안의 글자, 위에서 아래로:]`,
      ...lines.map((line) => `> ${line}`),
    ].join("\n")
  }

  // 블록 하나를 줄 묶음으로 옮긴다. 블록 사이는 빈 줄 하나다.
  blocks(children: Node[]): string[] {
    return children.flatMap((child) => this.block(child))
  }

  block(node: Node): string[] {
    if (node.type === "text") {
      const text = squash(node.value)
      return text === "" ? [] : [text]
    }
    if (node.type !== "element") return []
    const tag = node.tagName
    const heading = /^h([1-6])$/.exec(tag)
    if (heading) return [`${"#".repeat(Number(heading[1]))} ${squash(this.inlines(node.children))}`]
    if (tag === "details") return this.details(node)
    if (tag === "ul" || tag === "ol") return [this.list(node, 0).join("\n")]
    if (tag === "table") return [this.table(node)]
    if (tag === "blockquote") return [this.quote(node)]
    if (tag === "pre") return ["```\n" + plain(node).replace(/\n$/, "") + "\n```"]
    if (tag === "hr") return ["---"]
    if (prop(node, "id") === "refs") return this.references(node)
    if (tag === "p") {
      const text = this.inlines(node.children).trim()
      return text === "" ? [] : [text]
    }
    return this.blocks(node.children)
  }

  details(node: Element): string[] {
    const summary = node.children.find(
      (child): child is Element => child.type === "element" && child.tagName === "summary",
    )
    const body = node.children.filter((child) => child !== summary)
    const head = summary ? this.blocks(summary.children) : []
    if (prop(node, "open") === undefined && head.length > 0) head[0] += collapsedMark
    return [...head, ...this.blocks(body)]
  }

  list(node: Element, depth: number): string[] {
    const lines: string[] = []
    let number = 1
    for (const item of node.children) {
      if (item.type !== "element" || item.tagName !== "li") continue
      const nested = item.children.filter(
        (child): child is Element =>
          child.type === "element" && (child.tagName === "ul" || child.tagName === "ol"),
      )
      const own = item.children.filter((child) => !nested.includes(child as Element))
      const marker = node.tagName === "ol" ? `${number++}.` : "-"
      lines.push(`${"  ".repeat(depth)}${marker} ${squash(this.inlines(own))}`)
      for (const inner of nested) lines.push(...this.list(inner, depth + 1))
    }
    return lines
  }

  table(node: Element): string {
    const rows = findAll(node, isTag("tr")).map((row) =>
      row.children
        .filter((cell): cell is Element => cell.type === "element")
        .map((cell) => squash(this.inlines(cell.children)).replace(/\|/g, "\\|")),
    )
    const lines = rows.map((cells) => `| ${cells.join(" | ")} |`)
    if (find(node, isTag("thead")) && rows.length > 0)
      lines.splice(1, 0, `| ${rows[0].map(() => "---").join(" | ")} |`)
    return lines.join("\n")
  }

  quote(node: Element): string {
    const lines: string[] = []
    const callout = prop(node, "dataCallout")
    if (callout !== undefined) {
      const title = find(node, (element) => hasClass(element, "callout-title"))
      const content = find(node, (element) => hasClass(element, "callout-content"))
      const collapsed = hasClass(node, "is-collapsed") ? collapsedMark : ""
      lines.push(`[!${callout}] ${squash(title ? this.inlines(title.children) : "")}${collapsed}`)
      if (content) lines.push(...this.blocks(content.children))
    } else lines.push(...this.blocks(node.children))
    return lines
      .flatMap((line) => line.split("\n"))
      .map((line) => `> ${line}`.trimEnd())
      .join("\n")
  }

  references(node: Element): string[] {
    // 번호([1])와 항목은 붙은 두 div라 사이를 띄운다.
    const entries = findAll(node, (element) => hasClass(element, "csl-entry")).map((entry) =>
      squash(entry.children.map((child) => this.inline(child)).join(" ")),
    )
    return ["## 참고문헌", ...entries]
  }
}

function properties(root: Root): string[] {
  const table = find(root, (element) => hasClass(element, "note-properties-table"))
  if (!table) return []
  return findAll(table, isTag("tr")).map((row) => {
    const cells = row.children.filter((cell): cell is Element => cell.type === "element")
    return cells.map((cell) => squash(plain(cell))).join(": ")
  })
}

// 독자 텍스트. links는 본문이 위키링크로 가리키는 다른 페이지의 슬러그이고, 나온 순서대로 한 번씩이다.
// diagrams는 도해 주소마다 svgLines의 결과다.
export function readerText(
  html: string,
  diagrams: Map<string, string[]> = new Map(),
): { text: string; links: string[] } {
  const root = fromHtml(html)
  const self = prop(find(root, isTag("body")) ?? ({ properties: {} } as Element), "dataSlug")
  const title = find(root, (element) => hasClass(element, "article-title"))
  const article = find(root, isTag("article"))
  const writer = new Writer(diagrams)
  const parts = [
    `# ${title ? squash(plain(title)) : ""}`,
    properties(root).join("\n"),
    ...(article ? writer.blocks(article.children) : []),
  ].filter((part) => part !== "")
  return {
    text: parts.join("\n\n") + "\n",
    links: writer.links.filter((slug) => slug !== self),
  }
}

// 본문에 든 도해(<object>) 주소. 나온 순서대로 한 번씩이다.
export function diagramSources(html: string): string[] {
  const article = find(fromHtml(html), isTag("article"))
  if (!article) return []
  const sources = findAll(article, isTag("object")).map((node) => prop(node, "data") ?? "")
  return [...new Set(sources.filter((src) => src !== ""))]
}

// transform의 translate 몫. 도해는 translate만 쓴다(content/diagrams/).
function translation(node: Element): { x: number; y: number } {
  const match = /translate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+))?\s*\)/.exec(
    prop(node, "transform") ?? "",
  )
  return match ? { x: Number(match[1]), y: Number(match[2] ?? 0) } : { x: 0, y: 0 }
}

interface Placed {
  x: number
  y: number
  text: string
}

// <text>마다 조상 <g>와 자기의 translate를 더한 자리를 모은다.
function placedTexts(node: Node, offset: { x: number; y: number }, found: Placed[]): Placed[] {
  if (node.type !== "element" && node.type !== "root") return found
  const shift = node.type === "element" ? translation(node) : { x: 0, y: 0 }
  const here = { x: offset.x + shift.x, y: offset.y + shift.y }
  if (node.type === "element" && node.tagName === "text") {
    const text = squash(plain(node))
    if (text !== "")
      found.push({
        x: here.x + Number(prop(node, "x") ?? 0),
        y: here.y + Number(prop(node, "y") ?? 0),
        text,
      })
    return found
  }
  for (const child of node.children) placedTexts(child, here, found)
  return found
}

// 도해 SVG의 글자를 줄로 모은다. y가 거의 같은 <text>를 한 줄로 보고, 줄 안은 x 순서다.
export function svgLines(svg: string): string[] {
  const texts = placedTexts(fromHtml(svg, { space: "svg" }), { x: 0, y: 0 }, []).sort(
    (a, b) => a.y - b.y || a.x - b.x,
  )
  const lines: { y: number; items: Placed[] }[] = []
  for (const item of texts) {
    const line = lines.at(-1)
    if (line && Math.abs(item.y - line.y) < 4) line.items.push(item)
    else lines.push({ y: item.y, items: [item] })
  }
  return lines.map((line) =>
    line.items
      .sort((a, b) => a.x - b.x)
      .map((item) => item.text)
      .join(" "),
  )
}
