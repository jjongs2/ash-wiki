import type { Violation } from "./tree"

// 검사마다 `OK/FAIL/SKIP <id>` 한 줄과 위반 위치를 `<파일>:<줄>: <내용>` 꼴로 찍는다.
// 콘텐츠 검사기와 출처 상태(tools/source-status)가 같이 쓴다.
export type Status = "OK" | "FAIL" | "SKIP"

export function report(id: string, status: Status, violations: Violation[] = [], note?: string) {
  console.log(`${status.padEnd(4)} ${id}${note ? ` (${note})` : ""}`)
  const sorted = [...violations].sort(
    (a, b) => a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0),
  )
  for (const { file, line, message } of sorted) {
    console.log(`  ${file}${line ? `:${line}` : ""}: ${message}`)
  }
  return status
}

export const verdict = (violations: Violation[]): Status => (violations.length > 0 ? "FAIL" : "OK")
