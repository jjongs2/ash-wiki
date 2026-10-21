// 소식 조사 스크립트(check.ts, procedure.ts, merge.ts)가 함께 쓰는 입출력: 주차 인자, git, 작업 폴더의 JSONL.
import fs from "node:fs"
import { spawnSync } from "node:child_process"
import { monthWeeks } from "../../../plugins/weekly-news/index"
import { repoRoot as root } from "../../../tools/repo"

/** 주차(`2026-w41`)나 달(`2026-09`) 인자를 주차 목록으로 푼다. 달은 그 달의 주차(`monthWeeks`)다. */
export function weeksOf(args: string[]): string[] {
  return args.flatMap((arg) => (/^\d{4}-\d{2}$/.test(arg) ? monthWeeks(arg) : [arg]))
}

export function git(args: string[]): string {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  })
  if (result.status !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr.trim()}`)
  return result.stdout
}

export function readJsonl<T>(file: string): T[] {
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line, i) => {
      try {
        return JSON.parse(line) as T
      } catch {
        throw new Error(`${file}:${i + 1}: JSON이 아니다`)
      }
    })
}

export const writeJsonl = (file: string, rows: unknown[]) =>
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n")
