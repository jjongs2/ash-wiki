import fs from "node:fs"
import path from "node:path"
import { Conventions } from "../check-content/conventions"
import { repoRoot } from "../repo"

// Standards Track RFC의 번호. 목록의 정본은 docs/wiki-verification.md Standards Track RFC 절의
// standards-track-rfcs 표이고, 칸마다 번호를 쉼표로 잇는다.
const verificationPath = path.join(repoRoot, "docs", "wiki-verification.md")
const numbers = new Set(
  new Conventions(fs.readFileSync(verificationPath, "utf8"), verificationPath)
    .column("standards-track-rfcs", "RFC")
    .flatMap((cell) => cell.split(",").map((number) => number.trim())),
)

export const isStandardsTrackRfc = (key: string) => {
  const number = key.match(/^ietf-rfc-([0-9]+)-/)?.[1]
  return number !== undefined && numbers.has(number)
}
