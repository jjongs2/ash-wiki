import { inflateSync } from "node:zlib"
import {
  ChannelError,
  fetchOk,
  type Change,
  type Channel,
  type Context,
  type Entry,
  type Evidence,
  type Publication,
} from "../model"

// UNECE 통로. UN 조약 MTDSG(1958 협정의 규정마다 한 장)의 TEXT 칸이 C.N. 통지 목록이다. 개정(시리즈, 추보)이
// 발효되면 사무총장이 Amendments 통지를 내고, 통지는 발효일과 원문(ECE/TRANS/WP.29/…) 기호를 적는다.
// 판은 원문 기호로 맞춘다. 참고문헌의 C.N. 번호, WP.29 기호, 규정 문서(E/ECE/TRANS/505/…/Amend.n)의 표지에 적힌
// 원문 기호가 통지의 것과 같으면 그 개정을 인용한 것이다. unece.org는 봇을 막아 쓰지 않는다.
export const mtdsgUrl = (regulation: string) =>
  `https://treaties.un.org/doc/Publication/MTDSG/Volume%20I/Chapter%20XI/XI-B-16-${regulation}.en.pdf`
export const notificationUrl = (number: string, year: string) =>
  `https://treaties.un.org/doc/Publication/CN/${year}/CN.${number}.${year}-Eng.pdf`
// 없는 기호에도 200(text/html)으로 답하므로 PDF인지 본다.
export const documentUrl = (symbol: string) =>
  `https://documents.un.org/api/symbol/access?s=${symbol}&l=en&t=pdf`

const regulationPattern = /\b(?:UN|United Nations) Regulation No\. ?([0-9]+)\b/
const wp29Pattern = /ECE\/TRANS\/WP\.29\/[0-9]{4}\/[0-9]+(?:\/Rev\.[0-9]+)?/g
const regulationDocumentPattern =
  /E\/ECE\/TRANS\/505\/Rev\.[0-9]+\/Add\.[0-9]+((?:\/(?:Amend|Rev)\.[0-9]+)*)/
const datePattern = "[0-9]{1,2} [A-Za-z]+ [0-9]{4}"

interface Notice {
  reference: string // 예: C.N.237.2026
  number: string
  year: string
  date: string
  type: string
}

export const unece: Channel = {
  id: "unece",
  ownsPage: (page) => page.publisher === "UNECE",
  // 규정 하나를 이름으로 든 엔트리. 해석 문서는 MTDSG에 판이 없어 맡지 않는다.
  publicationOf(entry) {
    if (/Interpretation Document/i.test(entry.title)) return undefined
    const number = entry.title.match(regulationPattern)?.[1]
    return number ? `UN R${number}` : undefined
  },
  async check(publications, context) {
    const changes: Change[] = []
    for (const publication of publications)
      if (publication.entries.length > 0)
        changes.push(...(await checkPublication(publication, context)))
    return changes
  },
}

async function checkPublication(publication: Publication, context: Context): Promise<Change[]> {
  const regulation = publication.name.match(/^UN R([0-9]+)$/)?.[1]
  if (!regulation) throw new Error(`UNECE 출판물 ${publication.name}이 UN R<번호> 꼴이 아니다`)
  const listUrl = mtdsgUrl(regulation)
  const list = squash(await pdfText(context, listUrl))
  const all = notices(list)
  if (!all.some((notice) => /entry into force/i.test(notice.type)))
    throw new ChannelError(`${listUrl}에서 C.N. 통지 목록(TEXT)을 찾지 못했다`)
  // 발효한 개정. 옛 규정의 목록은 제안(proposal of amendments)과 채택(adoption)을 따로 적는다.
  const amendments = all.filter((notice) => /^(?:amendments|adoption\b.*)$/i.test(notice.type))
  const details = []
  for (const notice of amendments) details.push(await noticeDetail(context, notice))

  // 참고문헌이 인용한 판의 자리. 0은 원판이고, n은 n번째 개정까지다.
  let cited = -1
  const current: Entry[] = []
  for (const entry of publication.entries) {
    const text = `${entry.title} ${entry.note ?? ""}`
    const references = [...text.matchAll(/C\.N\.([0-9]+)\.([0-9]{4})/g)].map(
      ([, number, year]) => `C.N.${number}.${year}`,
    )
    const symbols = wp29Symbols(text)
    const document = entry.title.match(regulationDocumentPattern)
    let position = document && document[1] === "" ? 0 : -1
    if (document && document[1] !== "") symbols.push(...(await authenticText(context, document[0])))
    details.forEach((detail, index) => {
      if (
        references.includes(detail.notice.reference) ||
        detail.symbols.some((symbol) => symbols.includes(symbol))
      )
        position = Math.max(position, index + 1)
    })
    if (position < 0) continue
    current.push(entry)
    cited = Math.max(cited, position)
  }
  if (cited < 0)
    throw new ChannelError(
      `${publication.name}의 엔트리(${publication.entries.map((entry) => entry.key).join(", ")})에서 ` +
        `인용한 판(규정 문서 기호, C.N. 번호, WP.29 기호)을 찾지 못했다`,
    )

  // 인용한 판 뒤에 발효한 개정. 원문 제목으로 시리즈(새 판)와 추보를 가린다. 옛 시리즈의 추보도 알린다.
  // 경과 규정이 옛 시리즈의 승인을 받아들이는 동안 그 시리즈도 현행이기 때문이다(UN R156의 원판과 01 시리즈).
  const changes: Change[] = []
  for (const detail of details.slice(cited)) {
    const symbol = detail.symbols[0]
    const label = await amendmentLabel(context, symbol, regulation)
    const evidence: Evidence[] = [
      {
        field: "MTDSG의 TEXT",
        value: `${detail.notice.reference} of ${detail.notice.date} (${detail.notice.type})`,
        url: listUrl,
      },
      { field: "binding as of", value: detail.binding, url: detail.url },
      { field: `${symbol}의 제목`, value: label, url: documentUrl(symbol) },
    ]
    changes.push({
      publication,
      kind: /^[0-9]{2} series of amendments/i.test(label) ? "new-edition" : "supplement",
      // 원문 기호를 붙여, 제목이 "amendments"처럼 번호 없는 개정끼리도 키가 겹치지 않게 한다.
      target: `${publication.name} ${label} (${symbol})`,
      evidence,
      current,
    })
  }
  return changes
}

function notices(text: string): Notice[] {
  const pattern = new RegExp(
    `C\\.N\\.([0-9]+)\\.([0-9]{4})\\.TREATIES[-.A-Z0-9]* of (${datePattern}) ?\\(([^()]*)\\)`,
    "g",
  )
  return [...text.matchAll(pattern)].map(([, number, year, date, type]) => ({
    reference: `C.N.${number}.${year}`,
    number,
    year,
    date,
    type: type.trim(),
  }))
}

async function noticeDetail(context: Context, notice: Notice) {
  const url = notificationUrl(notice.number, notice.year)
  const text = await pdfText(context, url)
  const binding = squash(text).match(new RegExp(`binding upon .+? as of (${datePattern})`))?.[1]
  const symbols = wp29Symbols(text)
  if (!binding || symbols.length === 0)
    throw new ChannelError(`${url}에서 발효일(binding … as of)이나 원문 기호를 찾지 못했다`)
  return { notice, url, binding, symbols }
}

// 규정 문서(Amend, Rev) 표지의 원문 기호. 예: "The authentic and legal binding text is: ECE/TRANS/WP.29/2022/54."
async function authenticText(context: Context, symbol: string): Promise<string[]> {
  const url = documentUrl(symbol)
  const dense = (await pdfText(context, url, 2)).replace(/\s+/g, "")
  const start = dense.search(/authenticandlegalbindingtexts?(?:is|are):/i)
  const symbols = start < 0 ? [] : wp29Symbols(dense.slice(start, start + 400).split("_")[0])
  if (symbols.length === 0) throw new ChannelError(`${url}의 표지에서 원문 기호를 찾지 못했다`)
  return symbols
}

// 원문 제목의 개정 이름. 예: Proposal for a new 01 series of amendments to UN Regulation No. 156 → 01 series of amendments
async function amendmentLabel(context: Context, symbol: string, regulation: string) {
  const url = documentUrl(symbol)
  const text = squash(await pdfText(context, url, 2))
  const match = text.match(
    /Proposal for (?:(?:a|the) )?(?:new )?(.+?) (?:to|of) (?:the )?(?:UN|United Nations) Regulation No\. ?([0-9]+)/,
  )
  if (!match || match[2] !== regulation)
    throw new ChannelError(`${url}에서 UN R${regulation}의 개정 이름(Proposal for …)을 찾지 못했다`)
  return match[1]
}

function wp29Symbols(text: string): string[] {
  return [...new Set(text.replace(/\s+/g, "").match(wp29Pattern) ?? [])]
}

const squash = (text: string) => text.replace(/\s+/g, " ")

// 앞 몇 쪽만 읽으면 되는 문서(documents.un.org의 표지와 제목)는 pages로 줄인다. 규정 통합본은 수백 쪽이다.
async function pdfText(context: Context, url: string, pages = Infinity): Promise<string> {
  const response = await fetchOk(context, url)
  const type = response.headers.get("content-type") ?? ""
  if (!type.includes("application/pdf")) {
    await response.body?.cancel()
    throw new ChannelError(`${url}의 응답이 PDF가 아니다(${type || "content-type 없음"})`)
  }
  return pdfToText(Buffer.from(await response.arrayBuffer()), pages)
}

// PDF의 글자. 쪽 차례로 내용 스트림에서 Tj, TJ가 보이는 문자열을 잇고, 글자의 높이가 바뀌면 줄을 바꾼다.
// 글꼴에 ToUnicode가 있으면 그것으로 풀고(UNOG의 bioPDF 문서), 없으면 WinAnsi로 본다(Word, Aspose 문서).
export function pdfToText(pdf: Buffer, pages = Infinity): string {
  const objects = parseObjects(pdf)
  const cmaps = new Map<number, CMap | undefined>()
  return pageList(objects)
    .slice(0, pages)
    .map(({ contents, resources }) => {
      const fonts = new Map<string, CMap | undefined>()
      const fontDictionary = dictionary(
        resolve(objects, dictionary(resolve(objects, resources)).get("Font")),
      )
      for (const [name, value] of fontDictionary) {
        const number = referenceOf(value)
        if (number === undefined) continue
        if (!cmaps.has(number)) cmaps.set(number, toUnicode(objects, number))
        fonts.set(name, cmaps.get(number))
      }
      const content = contents
        .map((number) => objects.get(number))
        .map((object) => (object ? decode(object)?.toString("latin1") : undefined) ?? "")
        .join("\n")
      return contentText(content, fonts)
    })
    .join("\n")
}

interface PdfObject {
  body: string // 값(대개 사전)의 원문
  stream?: Buffer
}

function parseObjects(pdf: Buffer): Map<number, PdfObject> {
  const raw = pdf.toString("latin1")
  const objects = new Map<number, PdfObject>()
  const header = /(?<![0-9])([0-9]+)\s+[0-9]+\s+obj\b/g
  let match
  while ((match = header.exec(raw))) {
    const valueEnd = skipValue(raw, header.lastIndex)
    const body = raw.slice(header.lastIndex, valueEnd)
    const next = skipSpace(raw, valueEnd)
    let stream: Buffer | undefined
    header.lastIndex = valueEnd
    if (raw.startsWith("stream", next)) {
      const start = next + (raw.startsWith("stream\r\n", next) ? 8 : 7)
      const length = Number(dictionary(body).get("Length"))
      const end =
        Number.isInteger(length) && raw.startsWith("endstream", skipSpace(raw, start + length))
          ? start + length
          : raw.indexOf("endstream", start)
      if (end < 0) break
      stream = pdf.subarray(start, end)
      header.lastIndex = end
    }
    objects.set(Number(match[1]), { body, stream })
  }
  // 객체 스트림(ObjStm) 안의 객체
  for (const object of [...objects.values()]) {
    const fields = dictionary(object.body)
    if (fields.get("Type") !== "/ObjStm") continue
    const data = decode(object)?.toString("latin1")
    const first = Number(fields.get("First"))
    if (data === undefined || !Number.isInteger(first)) continue
    const offsets = data.slice(0, first).trim().split(/\s+/).map(Number)
    for (let i = 0; i + 1 < offsets.length; i += 2) {
      const start = first + offsets[i + 1]
      if (!objects.has(offsets[i]))
        objects.set(offsets[i], { body: data.slice(start, skipValue(data, start)) })
    }
  }
  return objects
}

function decode(object: PdfObject): Buffer | undefined {
  if (!object.stream) return undefined
  const filter = dictionary(object.body).get("Filter") ?? ""
  if (filter === "") return object.stream
  if (!/^\[?\s*\/FlateDecode\s*\]?$/.test(filter)) return undefined
  try {
    return inflateSync(object.stream, { finishFlush: 2 })
  } catch {
    return undefined
  }
}

// 문서 카탈로그에서 쪽 나무를 따라 쪽마다 내용 스트림과 자원을 모은다. 자원은 부모에서 물려받는다.
function pageList(objects: Map<number, PdfObject>) {
  const catalog = [...objects.values()]
    .map((object) => dictionary(object.body))
    .findLast((fields) => fields.get("Type") === "/Catalog")
  const pages: { contents: number[]; resources: string | undefined }[] = []
  const seen = new Set<number>()
  const walk = (value: string | undefined, inherited: string | undefined) => {
    const number = referenceOf(value)
    if (number === undefined || seen.has(number)) return
    seen.add(number)
    const fields = dictionary(objects.get(number)?.body ?? "")
    const resources = fields.get("Resources") ?? inherited
    if (fields.get("Type") === "/Pages")
      for (const kid of references(resolve(objects, fields.get("Kids"))))
        walk(`${kid} 0 R`, resources)
    else {
      // Contents는 스트림 하나의 참조이거나 그 배열이다.
      const contents = fields.get("Contents")
      const stream = referenceOf(contents)
      pages.push({
        contents:
          stream !== undefined && objects.get(stream)?.stream
            ? [stream]
            : references(resolve(objects, contents)),
        resources,
      })
    }
  }
  walk(catalog?.get("Pages"), undefined)
  return pages
}

interface CMap {
  bytes: number
  map: Map<number, string>
}

// ToUnicode CMap의 bfchar, bfrange
function toUnicode(objects: Map<number, PdfObject>, font: number): CMap | undefined {
  const number = referenceOf(dictionary(objects.get(font)?.body ?? "").get("ToUnicode"))
  const object = number === undefined ? undefined : objects.get(number)
  const text = object && decode(object)?.toString("latin1")
  if (!text) return undefined
  const hex = (value: string) => parseInt(value, 16)
  const unicode = (value: string) =>
    String.fromCharCode(...(value.match(/[0-9A-Fa-f]{4}/g) ?? []).map(hex))
  const map = new Map<number, string>()
  for (const [, block] of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g))
    for (const [, code, value] of block.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/g))
      map.set(hex(code), unicode(value))
  for (const [, block] of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g))
    for (const [, low, high, target] of block.matchAll(
      /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<[0-9A-Fa-f]*>|\[[^\]]*\])/g,
    )) {
      const targets = target.startsWith("[") ? [...target.matchAll(/<([0-9A-Fa-f]*)>/g)] : []
      for (let code = hex(low); code <= hex(high); code++) {
        const offset = code - hex(low)
        if (targets.length > 0) map.set(code, unicode(targets[offset]?.[1] ?? ""))
        else {
          const base = unicode(target.slice(1, -1))
          map.set(
            code,
            base.slice(0, -1) + String.fromCharCode(base.charCodeAt(base.length - 1) + offset),
          )
        }
      }
    }
  const space = text.match(/begincodespacerange\s*<([0-9A-Fa-f]+)>/)?.[1]
  return { bytes: space ? space.length / 2 : 1, map }
}

const delimiter = /[\s/()<>[\]{}%]/
function skipSpace(text: string, i: number): number {
  while (i < text.length) {
    if (/\s/.test(text[i])) i++
    else if (text[i] === "%") i = text.indexOf("\n", i) + 1 || text.length
    else break
  }
  return i
}

// 값 하나(사전, 배열, 참조, 문자열, 이름, 수)를 건너뛴 자리
function skipValue(text: string, i: number): number {
  i = skipSpace(text, i)
  const reference = /^[0-9]+\s+[0-9]+\s+R(?![A-Za-z])/.exec(text.slice(i, i + 32))
  if (reference) return i + reference[0].length
  if (text.startsWith("<<", i)) {
    i += 2
    while (i < text.length) {
      i = skipSpace(text, i)
      if (text.startsWith(">>", i)) return i + 2
      i = skipValue(text, i)
    }
    return i
  }
  const c = text[i]
  if (c === "[") {
    i++
    while (i < text.length) {
      i = skipSpace(text, i)
      if (text[i] === "]") return i + 1
      i = skipValue(text, i)
    }
    return i
  }
  if (c === "(") return skipString(text, i)
  if (c === "<") return text.indexOf(">", i) + 1 || text.length
  let j = c === "/" ? i + 1 : i
  while (j < text.length && !delimiter.test(text[j])) j++
  return j === i ? i + 1 : j
}

function skipString(text: string, i: number): number {
  let level = 0
  for (; i < text.length; i++) {
    if (text[i] === "\\") i++
    else if (text[i] === "(") level++
    else if (text[i] === ")" && --level === 0) return i + 1
  }
  return i
}

// 사전의 맨 위 키와 값의 원문
function dictionary(text: string | undefined): Map<string, string> {
  const fields = new Map<string, string>()
  if (!text) return fields
  let i = skipSpace(text, 0)
  if (!text.startsWith("<<", i)) return fields
  i += 2
  while (i < text.length) {
    i = skipSpace(text, i)
    if (text.startsWith(">>", i) || text[i] !== "/") break
    const keyEnd = skipValue(text, i)
    const valueStart = skipSpace(text, keyEnd)
    const valueEnd = skipValue(text, valueStart)
    fields.set(text.slice(i + 1, keyEnd), text.slice(valueStart, valueEnd))
    i = valueEnd
  }
  return fields
}

const referenceOf = (value: string | undefined) => {
  const match = value?.match(/^([0-9]+)\s+[0-9]+\s+R$/)
  return match ? Number(match[1]) : undefined
}
const references = (value: string | undefined) =>
  [...(value ?? "").matchAll(/([0-9]+)\s+[0-9]+\s+R/g)].map(([, number]) => Number(number))
// 참조면 그 객체의 값을 준다.
function resolve(objects: Map<number, PdfObject>, value: string | undefined): string | undefined {
  const number = referenceOf(value)
  return number === undefined ? value : objects.get(number)?.body
}

type Matrix = [number, number, number, number, number, number]
const identity: Matrix = [1, 0, 0, 1, 0, 0]
const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[1] * n[2],
  m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2],
  m[2] * n[1] + m[3] * n[3],
  m[4] * n[0] + m[5] * n[2] + n[4],
  m[4] * n[1] + m[5] * n[3] + n[5],
]

const winAnsi: Record<number, string> = {
  0x91: "‘",
  0x92: "’",
  0x93: "“",
  0x94: "”",
  0x96: "–",
  0x97: "—",
}
const escapes: Record<string, string> = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f" }

function contentText(content: string, fonts: Map<string, CMap | undefined>): string {
  let out = ""
  let operands: (number | string)[] = []
  let name = ""
  let font: CMap | undefined
  let ctm = identity
  const saved: Matrix[] = []
  let line = identity
  let text = identity
  let leading = 0
  let lastY: number | undefined
  let depth = 0
  const glyphs = (bytes: string) => {
    if (!font) return [...bytes].map((c) => winAnsi[c.charCodeAt(0)] ?? c).join("")
    let value = ""
    for (let i = 0; i + font.bytes <= bytes.length; i += font.bytes) {
      let code = 0
      for (let j = 0; j < font.bytes; j++) code = code * 256 + bytes.charCodeAt(i + j)
      value += font.map.get(code) ?? ""
    }
    return value
  }
  const show = () => {
    const y = multiply(text, ctm)[5]
    if (lastY !== undefined && Math.abs(y - lastY) > 0.5) out += "\n"
    lastY = y
    for (const operand of operands)
      if (typeof operand === "string") out += operand
      // TJ 배열의 큰 음수 간격은 단어 사이다.
      else if (operand < -150) out += " "
  }
  const moveLine = (x: number, y: number) => {
    line = multiply([1, 0, 0, 1, x, y], line)
    text = line
  }
  const numbers = () => operands.filter((operand): operand is number => typeof operand === "number")
  let i = 0
  while (i < content.length) {
    const c = content[i]
    if (c === "(") {
      const end = skipString(content, i)
      const bytes = content
        .slice(i + 1, end - 1)
        .replace(/\\(?:([0-7]{1,3})|(\r\n|\r|\n)|(.))/gs, (_, octal, newline, other) =>
          octal
            ? String.fromCharCode(parseInt(octal, 8) & 0xff)
            : newline
              ? ""
              : (escapes[other] ?? other),
        )
      operands.push(glyphs(bytes))
      i = end
    } else if (c === "<" && content[i + 1] !== "<") {
      const end = content.indexOf(">", i) + 1 || content.length
      const hex = content.slice(i + 1, end - 1).replace(/\s+/g, "")
      operands.push(
        glyphs(String.fromCharCode(...(hex.match(/../g) ?? []).map((h) => parseInt(h, 16)))),
      )
      i = end
    } else if (c === "[") {
      depth++
      i++
    } else if (c === "]") {
      depth = Math.max(0, depth - 1)
      i++
    } else if (c === "%") {
      i = content.indexOf("\n", i) + 1 || content.length
    } else if (c === "/") {
      const end = skipValue(content, i)
      name = content.slice(i + 1, end)
      i = end
    } else if (/[-+.0-9]/.test(c)) {
      const number = content.slice(i).match(/^[-+]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)/)?.[0] ?? c
      operands.push(Number(number))
      i += number.length
    } else if (/[A-Za-z'"*]/.test(c)) {
      const operator = content.slice(i).match(/^[A-Za-z'"*]+/)![0]
      i += operator.length
      const n = numbers()
      if (operator === "q") saved.push(ctm)
      else if (operator === "Q") ctm = saved.pop() ?? identity
      else if (operator === "cm" && n.length >= 6) ctm = multiply(n.slice(-6) as Matrix, ctm)
      else if (operator === "BT") line = text = identity
      else if (operator === "Tf") font = fonts.get(name)
      else if (operator === "Tm" && n.length >= 6) line = text = n.slice(-6) as Matrix
      else if (operator === "Td" && n.length >= 2) moveLine(n.at(-2)!, n.at(-1)!)
      else if (operator === "TD" && n.length >= 2) {
        leading = -n.at(-1)!
        moveLine(n.at(-2)!, n.at(-1)!)
      } else if (operator === "TL" && n.length >= 1) leading = n.at(-1)!
      else if (operator === "T*") moveLine(0, -leading)
      else if (operator === "Tj" || operator === "TJ") show()
      else if (operator === "'" || operator === '"') {
        moveLine(0, -leading)
        show()
      } else if (operator === "ID") i = content.indexOf("EI", i) + 2 || content.length
      if (depth === 0) operands = []
    } else i++
  }
  return out
}
