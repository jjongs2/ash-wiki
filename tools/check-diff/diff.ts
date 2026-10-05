import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

// 고친 줄 하나. 줄 번호는 지금 파일(작업 트리)의 것이다.
export interface AddedLine {
  line: number
  text: string
}

// diff의 덩어리 하나. 고친 곳은 지운 줄과 더한 줄이 함께 있고, 지우기만 한 곳은 added가 비고
// at이 지운 자리 바로 앞 줄이다.
export interface Hunk {
  at: number
  removed: string[]
  added: AddedLine[]
}

export interface ChangedFile {
  file: string // 저장소 루트 기준 경로. 예: content/can-bus.md
  added: Set<number>
  hunks: Hunk[]
  untracked: boolean
}

function git(root: string, args: string[]): string {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
  if (result.status !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr.trim()}`)
  return result.stdout
}

export function repoTop(cwd: string): string {
  return git(cwd, ["rev-parse", "--show-toplevel"]).trim()
}

export function mergeBase(root: string, ref: string): string {
  return git(root, ["merge-base", ref, "HEAD"]).trim()
}

// 기준 커밋과 작업 트리 사이의 content/ 변경. 커밋하지 않은 고침과, 아직 추적하지 않는 새 파일도 든다.
// 지운 파일은 뺀다.
export function changedFiles(root: string, base: string): ChangedFile[] {
  const out = git(root, ["diff", "-U0", "--no-color", "--no-renames", base, "--", "content/"])
  const files: ChangedFile[] = []
  let current: ChangedFile | null = null
  let hunk: Hunk | null = null
  let newLine = 0
  for (const line of out.split("\n")) {
    if (line.startsWith("diff --git ")) {
      current = null
      hunk = null
      continue
    }
    if (line.startsWith("+++ ")) {
      const target = line.slice(4)
      current =
        target === "/dev/null"
          ? null
          : { file: target.replace(/^b\//, ""), added: new Set(), hunks: [], untracked: false }
      if (current) files.push(current)
      continue
    }
    const header = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/)
    if (header && current) {
      const start = Number(header[1])
      const count = header[2] === undefined ? 1 : Number(header[2])
      newLine = start
      hunk = { at: count === 0 ? start : start - 1, removed: [], added: [] }
      current.hunks.push(hunk)
      continue
    }
    if (!current || !hunk) continue
    if (line.startsWith("+")) {
      current.added.add(newLine)
      hunk.added.push({ line: newLine, text: line.slice(1) })
      newLine++
    } else if (line.startsWith("-")) {
      hunk.removed.push(line.slice(1))
    }
  }
  const untracked = git(root, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
    "--",
    "content/",
  ])
    .split("\0")
    .filter(Boolean)
  for (const file of untracked) {
    const lines = fs.readFileSync(path.join(root, file), "utf8").split("\n")
    const added = lines.map((text, i) => ({ line: i + 1, text }))
    files.push({
      file,
      added: new Set(added.map((a) => a.line)),
      hunks: [{ at: 0, removed: [], added }],
      untracked: true,
    })
  }
  return files
}
