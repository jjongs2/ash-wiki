import test, { after, before, describe } from "node:test"
import assert from "node:assert"
import { execFile } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import type { AddressInfo } from "node:net"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { repoRoot } from "../repo"

// 출처 상태 CLI를 seam으로 본다. 트리와 로컬 HTTP 서버를 넣고 출력 줄과 종료 코드만 본다.
// bib의 URL에 서버 포트가 들어가야 해서 트리는 테스트가 임시 디렉터리에 만든다.
const here = path.dirname(fileURLToPath(import.meta.url))
const today = "2026-09-25"

let server: http.Server
let base: string
const roots: string[] = []

before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === "/moved") res.writeHead(301, { location: "/alive" })
    // HEAD를 받지 않는 서버
    else if (req.url === "/no-head") res.statusCode = req.method === "HEAD" ? 405 : 200
    else res.statusCode = req.url === "/alive" ? 200 : 404
    res.end()
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

after(() => {
  server.close()
  for (const root of roots) fs.rmSync(root, { recursive: true, force: true })
})

interface Report {
  exitCode: number
  statuses: string[]
  locations: Map<string, string[]>
}

function makeTree(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "source-status-"))
  roots.push(root)
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
    fs.writeFileSync(path.join(root, rel), text)
  }
  return root
}

function page(tags: string[], verified: string, body: string): string {
  return ["---", "title: 페이지", "tags:", ...tags.map((t) => `  - ${t}`), `verified: ${verified}`]
    .concat(["---", "", body, ""])
    .join("\n")
}

function bib(key: string, url: string): string {
  return [`@misc{${key},`, "  title = {T},", `  url = {${url}},`, "  urldate = {2026-09-20},", "}"]
    .concat([""])
    .join("\n")
}

function runStatus(root: string, ...args: string[]): Promise<Report> {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      ["--import", "tsx", path.join(here, "cli.ts"), root, "--today", today, ...args],
      { cwd: repoRoot, encoding: "utf8" },
      (error, stdout) => {
        const statuses: string[] = []
        const locations = new Map<string, string[]>()
        let current = ""
        for (const line of stdout.split("\n")) {
          const status = line.match(/^(OK|FAIL) +(\S+)/)
          if (status) {
            current = status[2]
            statuses.push(`${status[1]} ${current}`)
            locations.set(current, [])
            continue
          }
          const location = line.match(/^ +(\S+?:\d+): /)
          if (location) locations.get(current)!.push(location[1])
        }
        resolve({ exitCode: error ? (error.code as number) : 0, statuses, locations })
      },
    )
  })
}

describe("source-status CLI", () => {
  test("인용한 URL이 살아 있고 검증일이 기준 안이면 모두 OK이고 exit 0이다", async () => {
    const root = makeTree({
      "content/fresh.md": page(
        ["network/can"],
        "2026-09-01",
        "하나[@org-alive-2024], 둘.[@org-no-head-2024]",
      ),
      "bib/org-alive-2024.bib": bib("org-alive-2024", `${base}/alive`),
      "bib/org-no-head-2024.bib": bib("org-no-head-2024", `${base}/no-head`),
    })
    const report = await runStatus(root)
    assert.deepStrictEqual(report.statuses, ["OK url", "OK verified"])
    assert.strictEqual(report.exitCode, 0)
  })

  test("응답이 2xx가 아니거나 연결되지 않는 URL은 url 검사가 bib 위치를 찍고 exit 1이다", async () => {
    const root = makeTree({
      "content/fresh.md": page(
        ["network/can"],
        "2026-09-01",
        "하나[@org-moved-2024], 둘[@org-dead-2024], 셋.[@org-closed-2024]",
      ),
      "bib/org-moved-2024.bib": bib("org-moved-2024", `${base}/moved`),
      "bib/org-dead-2024.bib": bib("org-dead-2024", `${base}/dead`),
      // 닫힌 포트: 연결이 거부된다
      "bib/org-closed-2024.bib": bib("org-closed-2024", "http://127.0.0.1:1/closed"),
    })
    const report = await runStatus(root)
    assert.deepStrictEqual(report.statuses, ["FAIL url", "OK verified"])
    assert.deepStrictEqual(report.locations.get("url"), [
      "bib/org-closed-2024.bib:3",
      "bib/org-dead-2024.bib:3",
    ])
    assert.strictEqual(report.exitCode, 1)
  })

  test("검증일에서 기준 일수가 지난 페이지는 verified 검사가 필드 위치를 찍는다", async () => {
    const root = makeTree({
      // 오늘(2026-09-25)에서 180일 전이다. 기준 안이다.
      "content/boundary.md": page(["network/can"], "2026-03-29", "문장이다."),
      // 181일 전이다.
      "content/stale.md": page(["network/can"], "2026-03-28", "문장이다."),
    })
    const report = await runStatus(root)
    assert.deepStrictEqual(report.statuses, ["OK url", "FAIL verified"])
    assert.deepStrictEqual(report.locations.get("verified"), ["content/stale.md:5"])
    assert.strictEqual(report.exitCode, 1)
  })

  test("--topic을 주면 그 태그(와 하위 태그)의 페이지와 그 페이지가 인용한 엔트리만 본다", async () => {
    const root = makeTree({
      "content/in-topic.md": page(["network/can"], "2026-09-01", "문장이다.[@org-alive-2024]"),
      "content/other-topic.md": page(
        ["network/ethernet"],
        "2026-01-01",
        "문장이다.[@org-dead-2024]",
      ),
      "bib/org-alive-2024.bib": bib("org-alive-2024", `${base}/alive`),
      "bib/org-dead-2024.bib": bib("org-dead-2024", `${base}/dead`),
    })
    const topic = await runStatus(root, "--topic", "network/can")
    assert.deepStrictEqual(topic.statuses, ["OK url", "OK verified"])
    const area = await runStatus(root, "--topic", "network")
    assert.deepStrictEqual(area.statuses, ["FAIL url", "FAIL verified"])
  })
})
