import fs from "node:fs"
import path from "node:path"
import type { BibEntry } from "../check-content/bibtex"
import { Conventions } from "../check-content/conventions"
import type { Tree } from "../check-content/tree"
import { repoRoot } from "../repo"
import { escapeRegExp } from "./text"

// 출처 구간의 같은 출처는 판 단위다(docs/wiki-verification.md의 좁혀 쓰기). 제목 꼴로 묶이지 않는 문서
// 모음은 위키 검증 문서의 source-collections 표가 엔트리의 URL로 정하고, 표가 제목 꼴보다 앞선다. 표에
// 들지 않으면 엔트리 제목에서 판 표시를 읽어 같은 판의 키를 한 출처로 묶는다. 읽는 꼴은 넷이고, 어느 꼴도
// 아니면 키 하나가 한 출처다.
// - 표준 번호와 판 연도(ISO 11898-1:2024, IEEE Std 1003.1-2024). 부 번호가 번호에 들므로 부마다 다른
//   판이고, 제목 끝의 (OBP preview)·(preview)는 번호 뒤에 와서 원문과 같은 판이 된다. 엔트리의
//   발행기관 필드에 그 기구가 있을 때만 읽는다. 다른 발행기관의 해설 자료도 제목에 표준 번호를 담기 때문이다.
// - AUTOSAR 플랫폼 릴리스(AUTOSAR CP R25-11, AUTOSAR CP R4.3.1). CP, AP, FO가 각각 한 판이다.
// - 제목 끝 괄호의 문서 모음 이름(µC/OS-III Documentation, RTEMS Classic API Guide 6.2). 괄호에는
//   약어(SHS)나 제품 이름(ESP32)도 오므로, 문서 모음을 뜻하는 낱말로 끝나는 괄호만 읽는다.
// - 판 없이 고쳐지는 온라인 용어집의 용어 쪽(ISTQB Glossary — test case). 줄표 앞의 용어집 이름이 한 판이다.
export interface Edition {
  id: string
  names: string[] // 출처 표시로 칠 이름. 표준 기구와 키의 마디로 드러나지 않는 문서 모음의 이름만 둔다
  title: string // 엔트리 제목. 제목의 이름("The Kanban Guide", "V-Modell XT")도 출처 표시로 친다(runs.ts)
  collection?: boolean // 표의 모음. 구간 안에서 다시 쓴 출처 이름은 표의 이름만 본다(runs.ts)
}

interface Collection {
  name: string
  names: string[]
  pages: RegExp[]
}

const verificationPath = path.join(repoRoot, "docs", "wiki-verification.md")
const normalize = (url: string) =>
  url
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")

// 표의 쪽들. 주소는 scheme, "www.", 끝 슬래시를 떼고 견준다. "(그 쪽만)"이 아니면 그 경로 아래의 쪽이 모두
// 든다. `<제품>`처럼 꺾쇠로 싼 마디는 그 값마다 다른 모음이다. 칸의 쪽들은 쉼표로 나누고, 칸 양끝의 백틱은
// 표를 읽을 때 떨어지므로 백틱은 모두 뗀다.
function pagesOf(cell: string): RegExp[] {
  return cell.split(/,\s*/).map((token) => {
    const [, address, only] = token.replace(/`/g, "").match(/^(\S+?)\s*(\(그 쪽만\))?$/)!
    const body = address
      .split(/(<[^<>]+>)/)
      .map((part) => (/^<.+>$/.test(part) ? "([A-Za-z0-9]+)" : escapeRegExp(part)))
      .join("")
    const end = only ? "$" : /<[^<>]+>$/.test(address) ? "" : "(?=[/?#]|$)"
    return new RegExp(`^${body}${end}`)
  })
}

const collections: Collection[] = new Conventions(
  fs.readFileSync(verificationPath, "utf8"),
  verificationPath,
)
  .table("source-collections", ["모음", "이름", "드는 쪽"])
  .map((row) => ({
    name: row["모음"].replace(/\(.*\)$/, ""),
    names: row["이름"].split(/,\s*/),
    pages: pagesOf(row["드는 쪽"]),
  }))

function collectionOf(entry: BibEntry): { id: string; names: string[] } | undefined {
  const url = normalize(entry.fields.get("url")?.value ?? "")
  if (!url) return undefined
  for (const collection of collections) {
    for (const page of collection.pages) {
      const match = url.match(page)
      if (match)
        return { id: [collection.name, ...match.slice(1)].join(" "), names: collection.names }
    }
  }
  return undefined
}

// 판 연도 앞의 ":"와 "-"는 같은 판을 다르게 적은 것(ISO/IEC/IEEE 29148:2011, 29148-2011)이라 가리지 않는다.
// 판 연도 뒤의 추록(/Amd 1:1995)은 따로 펴낸 판이다.
const standardNumber =
  /(?<![A-Za-z])((?:ISO|IEC|IEEE|SAE)(?:\/(?:ISO|IEC|IEEE|SAE))*)(?: Std)? ([A-Z]{0,3}[0-9][0-9A-Za-z.]*?(?:-[0-9A-Za-z]+)*?)[:-]((?:19|20)[0-9]{2})(?![0-9])((?:\/(?:Amd|AMD|Cor|COR) ?[0-9]+(?:[:-](?:19|20)[0-9]{2})?)*)/
export const autosarRelease =
  /\bAUTOSAR ((?:CP|AP|FO|TC) )?(R[0-9]+(?:[.-][0-9]+)+|Release [0-9.]+[0-9])/
const collection =
  /\(([^()]*\b(?:Documentation|documentation|Guide|Manual|Handbook|Wiki)\b[^()]*)\)$/
const glossaryTerm = /^(.+ Glossary) — /

export const publisherOf = (entry: BibEntry) =>
  ["author", "organization", "institution", "publisher"]
    .map((field) => entry.fields.get(field)?.value ?? "")
    .join(" ")

export function editionOf(entry: BibEntry): Edition {
  const title = (entry.fields.get("title")?.value ?? "").replace(/\s+/g, " ").trim()
  const listed = collectionOf(entry)
  if (listed) return { ...listed, title, collection: true }
  const publisher = publisherOf(entry)
  const number = title.match(standardNumber)
  if (number && number[1].split("/").some((body) => publisher.includes(body)))
    return { id: `${number[1]} ${number[2]}:${number[3]}${number[4]}`, names: [], title }
  const release = title.match(autosarRelease)
  if (release && publisher.includes("AUTOSAR"))
    return { id: `AUTOSAR ${release[1] ?? ""}${release[2]}`, names: [], title }
  const name = title.match(collection)?.[1]
  if (name) return { id: name, names: [name.split(" ").find((word) => word !== "The")!], title }
  const glossary = title.match(glossaryTerm)?.[1]
  if (glossary) return { id: glossary, names: [], title }
  return { id: entry.key, names: [], title }
}

// 키마다 판. 엔트리가 없는 키는 그 키가 한 판이다.
export function editions(tree: Tree): Map<string, Edition> {
  const found = new Map<string, Edition>()
  for (const file of tree.bib) {
    if (!Array.isArray(file.entries)) continue
    for (const entry of file.entries) found.set(entry.key, editionOf(entry))
  }
  return found
}
