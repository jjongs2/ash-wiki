// bib 파일을 검사하는 데 필요한 만큼만 읽는 BibTeX 파서다. 줄 번호를 알려 주려고 직접 쓴다.
export interface BibField {
  value: string
  line: number
}

export interface BibEntry {
  type: string
  key: string
  line: number
  fields: Map<string, BibField>
}

export class BibSyntaxError extends Error {
  constructor(
    message: string,
    readonly line: number,
  ) {
    super(message)
  }
}

export function parseBibtex(text: string): BibEntry[] {
  let i = 0
  const lineAt = (offset: number) => text.slice(0, offset).split("\n").length
  const fail = (message: string): never => {
    throw new BibSyntaxError(message, lineAt(i))
  }
  const skipSpace = () => {
    while (i < text.length) {
      if (/\s/.test(text[i])) i++
      else if (text[i] === "%") while (i < text.length && text[i] !== "\n") i++
      else break
    }
  }
  const readWord = () => {
    const match = text.slice(i).match(/^[A-Za-z][\w-]*/)
    if (!match) fail("이름이 와야 한다")
    i += match![0].length
    return match![0]
  }
  const readBraced = () => {
    const start = ++i
    for (let depth = 1; i < text.length; i++) {
      if (text[i] === "{") depth++
      else if (text[i] === "}" && --depth === 0) return text.slice(start, i++)
    }
    return fail("닫히지 않은 중괄호")
  }
  const readValue = () => {
    if (text[i] === "{") return readBraced()
    if (text[i] === '"') {
      const end = text.indexOf('"', i + 1)
      if (end < 0) fail("닫히지 않은 따옴표")
      const value = text.slice(i + 1, end)
      i = end + 1
      return value
    }
    const match = text.slice(i).match(/^[\w.-]+/)
    if (!match) fail("값이 와야 한다")
    i += match![0].length
    return match![0]
  }

  const entries: BibEntry[] = []
  for (skipSpace(); i < text.length; skipSpace()) {
    if (text[i] !== "@") fail("엔트리 밖에 글자가 있다")
    const line = lineAt(i)
    i++
    const type = readWord().toLowerCase()
    skipSpace()
    if (type === "comment") {
      if (text[i] === "{") readBraced()
      continue
    }
    if (text[i] !== "{") fail("엔트리는 {로 연다")
    i++
    skipSpace()
    const keyEnd = text.indexOf(",", i)
    if (keyEnd < 0) fail("키 뒤에 쉼표가 없다")
    const key = text.slice(i, keyEnd).trim()
    i = keyEnd + 1
    const fields = new Map<string, BibField>()
    for (skipSpace(); text[i] !== "}"; skipSpace()) {
      if (i >= text.length) fail("닫히지 않은 엔트리")
      const fieldLine = lineAt(i)
      const name = readWord().toLowerCase()
      skipSpace()
      if (text[i] !== "=") fail(`필드 ${name} 뒤에 =가 없다`)
      i++
      skipSpace()
      fields.set(name, { value: readValue().trim(), line: fieldLine })
      skipSpace()
      if (text[i] === ",") i++
      else if (text[i] !== "}") fail(`필드 ${name} 뒤에 쉼표가 없다`)
    }
    i++
    entries.push({ type, key, line, fields })
  }
  return entries
}
