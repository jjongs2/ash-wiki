import fs from "node:fs"
import path from "node:path"
import { repoRoot } from "../repo"

// 문서의 표를 사본 없이 직접 읽는다. 표는 `<!-- table: <이름> -->` 주석 바로 뒤에 온다.
// 검사기는 위키 규약 문서를, 대비 실측(tools/palette.ts)은 팔레트 문서도 읽는다.
export const conventionsPath = path.join(repoRoot, "docs", "wiki-conventions.md")

export type Row = Record<string, string>

export class Conventions {
  private tables = new Map<string, Row[]>()
  private file: string

  constructor(markdown: string, file = conventionsPath) {
    this.file = file
    const lines = markdown.split("\n")
    lines.forEach((line, i) => {
      const marker = line.match(/^<!-- table: (\S+) -->$/)
      if (!marker) return
      let j = i + 1
      while (lines[j]?.trim() === "") j++
      const tableLines: string[] = []
      while (lines[j]?.startsWith("|")) tableLines.push(lines[j++])
      const [header, , ...body] = tableLines.map(splitRow)
      this.tables.set(
        marker[1],
        body.map((cells) => Object.fromEntries(header.map((name, k) => [name, cells[k] ?? ""]))),
      )
    })
  }

  // 규약 문서와 검사기가 어긋나면 조용히 넘어가지 않고 멈춘다.
  table(name: string, columns: string[]): Row[] {
    const rows = this.tables.get(name)
    if (!rows || rows.length === 0) {
      throw new Error(`${this.file}: 표 "${name}"을 찾지 못했다`)
    }
    for (const column of columns) {
      if (!(column in rows[0])) {
        throw new Error(`${this.file}: 표 "${name}"에 열 "${column}"이 없다`)
      }
    }
    return rows
  }

  column(name: string, column: string): string[] {
    return this.table(name, [column]).map((row) => row[column])
  }
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim().replace(/^`(.*)`$/, "$1"))
}

export function loadConventions(): Conventions {
  return new Conventions(fs.readFileSync(conventionsPath, "utf8"))
}
