import test, { after, before, beforeEach, describe } from "node:test"
import assert from "node:assert"
import { execFile } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import type { AddressInfo } from "node:net"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { repoRoot } from "../repo"

// 판 확인 CLI를 seam으로 본다. 트리와 로컬 HTTP 서버를 넣고 출력 줄, 종료 코드, GitHub API에 간 요청만 본다.
// 통로와 GitHub API의 URL은 preload(fake-hosts.ts)가 `/<호스트><경로>`로 로컬 서버에 돌린다.
// 트리는 ISO 통로의 출판물 하나(ISO 13400-2)와 범용 행의 출판물 하나(MISRA C)로 되어 있다.
const here = path.dirname(fileURLToPath(import.meta.url))
const isoData = fs.readFileSync(
  path.join(here, "fixtures", "iso", "iso_deliverables_metadata.jsonl"),
)
const issuesPath = "/api.github.com/repos/owner/wiki/issues"

let server: http.Server
let base: string
let root: string
// 테스트마다 정하는 응답
let misra: () => { status: number; body: string }
let existing: { number: number; state: string; title: string; body: string }[]
let requests: { method: string; url: string; body: string }[]

before(async () => {
  server = http.createServer((req, res) => {
    let body = ""
    req.on("data", (chunk) => (body += chunk))
    req.on("end", () => {
      requests.push({ method: req.method!, url: req.url!, body })
      if (req.url!.startsWith("/isopublicstorageprod.blob.core.windows.net/"))
        return res.end(isoData)
      if (req.url === "/misra.org.uk/misra-c/") {
        const { status, body } = misra()
        res.statusCode = status
        return res.end(body)
      }
      if (req.url!.startsWith(`${issuesPath}?`)) {
        res.setHeader("content-type", "application/json")
        return res.end(JSON.stringify(req.url!.includes("page=1") ? existing : []))
      }
      if (req.method === "POST" && req.url === issuesPath) {
        res.statusCode = 201
        return res.end(JSON.stringify({ number: 101 }))
      }
      if (req.method === "PATCH" && req.url!.startsWith(`${issuesPath}/`)) return res.end("{}")
      res.statusCode = 404
      res.end()
    })
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  root = fs.mkdtempSync(path.join(os.tmpdir(), "edition-status-"))
  const files: Record<string, string> = {
    "content/iso-13400-2.md": standardPage("ISO 13400-2", "ISO", "2025", "[@iso-13400-2-2025]"),
    "content/doip.md":
      "---\ntitle: DoIP\n---\n\n문장이다.[@iso-13400-2-2025] 문장이다.[@iso-13400-2-2025]\n",
    "content/misra-c.md": standardPage("MISRA C", "MISRA", "2025", "[@misra-c-2025-product-2025]"),
    "bib/iso-13400-2-2025.bib": bib(
      "iso-13400-2-2025",
      "ISO 13400-2:2025 Road vehicles — DoIP",
      "{ISO}",
      "https://www.iso.org/standard/87961.html",
    ),
    "bib/misra-c-2025-product-2025.bib": bib(
      "misra-c-2025-product-2025",
      "MISRA C:2025",
      "MISRA Consortium",
      "https://misra.org.uk/product/misra-c2025/",
    ),
  }
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
    fs.writeFileSync(path.join(root, rel), text)
  }
})

beforeEach(() => {
  misra = () => ({
    status: 200,
    body: "<p>MISRA C:2025 is the current edition. MISRA C:2023 …</p>",
  })
  existing = []
  requests = []
})

after(() => {
  server.close()
  fs.rmSync(root, { recursive: true, force: true })
})

function standardPage(title: string, publisher: string, edition: string, body: string): string {
  return `---\ntitle: ${title}\npublisher: ${publisher}\nedition: ${edition}\nstatus: 유효\n---\n\n문장이다.${body}\n`
}

function bib(key: string, title: string, author: string, url: string): string {
  return `@misc{${key},\n  title = {${title}},\n  author = {${author}},\n  url = {${url}},\n}\n`
}

function runCli(...args: string[]): Promise<{ exitCode: number; lines: string[] }> {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [
        "--import",
        "tsx",
        "--import",
        path.join(here, "fake-hosts.ts"),
        path.join(here, "cli.ts"),
        root,
        "--interval",
        "0",
        ...args,
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          FAKE_HOSTS_ORIGIN: base,
          GITHUB_TOKEN: "token",
          GITHUB_REPOSITORY: "owner/wiki",
        },
      },
      (error, stdout) =>
        resolve({ exitCode: error ? (error.code as number) : 0, lines: stdout.split("\n") }),
    )
  })
}

const statusLines = (lines: string[]) =>
  lines
    .filter((line) => /^(OK|FAIL) /.test(line))
    .map((line) => line.split(" (")[0].replace(/ +/, " "))

describe("판 확인 CLI", () => {
  test("바뀜을 찾으면 needs-triage 라벨로 이슈를 연다", async () => {
    const { exitCode, lines } = await runCli()
    assert.deepStrictEqual(statusLines(lines), ["OK coverage", "OK iso", "OK generic"])
    assert.strictEqual(exitCode, 0)
    const created = requests.filter((request) => request.method === "POST")
    assert.strictEqual(created.length, 1)
    const issue = JSON.parse(created[0].body)
    assert.strictEqual(issue.title, "edition: ISO 13400-2")
    assert.deepStrictEqual(issue.labels, ["needs-triage"])
    assert.match(issue.body, /\): 인용 2$/m)
    assert.ok(lines.includes("열었다 #101 edition: ISO 13400-2"))
  })

  test("같은 출판물의 열린 이슈는 갱신하고, 같은 키의 닫힌 이슈가 있으면 열지 않는다", async () => {
    existing = [
      {
        number: 7,
        state: "open",
        title: "edition: ISO 13400-2",
        body: "<!-- edition-status: ISO 13400-2 -->\n옛 본문\n",
      },
    ]
    await runCli()
    assert.deepStrictEqual(
      requests
        .filter((request) => request.method !== "GET")
        .map((request) => `${request.method} ${request.url}`),
      [`PATCH ${issuesPath}/7`],
    )
    existing = [
      {
        number: 5,
        state: "closed",
        title: "edition: ISO 13400-2",
        body: "<!-- edition-status: ISO 13400-2 -->\n<!-- edition-key: ISO 13400-2 | revision | ISO/CD 13400-2 -->\n",
      },
    ]
    requests = []
    await runCli()
    assert.deepStrictEqual(
      requests.filter((request) => request.method !== "GET"),
      [],
    )
  })

  test("다시 물어도 실패한 통로는 다른 통로를 모두 처리한 뒤 FAIL로 끝난다", async () => {
    misra = () => ({ status: 503, body: "" })
    const { exitCode, lines } = await runCli()
    assert.deepStrictEqual(statusLines(lines), ["OK coverage", "OK iso", "FAIL generic"])
    assert.strictEqual(exitCode, 1)
    const order = requests.map((request) =>
      request.url.startsWith("/misra")
        ? "misra"
        : request.url.startsWith("/iso")
          ? "iso"
          : request.method,
    )
    assert.deepStrictEqual(order.slice(0, 3), ["iso", "misra", "misra"])
    assert.ok(order.includes("POST"), "실패하지 않은 통로의 이슈는 연다")
  })

  test("한 번 실패한 통로가 다시 물어 답하면 실패가 아니다", async () => {
    let calls = 0
    misra = () =>
      calls++ === 0 ? { status: 503, body: "" } : { status: 200, body: "MISRA C:2025" }
    const { exitCode, lines } = await runCli()
    assert.deepStrictEqual(statusLines(lines), ["OK coverage", "OK iso", "OK generic"])
    assert.strictEqual(exitCode, 0)
  })

  test("판 패턴을 찾지 못하면 변화 없음이 아니라 실패다", async () => {
    misra = () => ({ status: 200, body: "<html>Just a moment...</html>" })
    const { exitCode, lines } = await runCli("--dry-run")
    assert.deepStrictEqual(statusLines(lines), ["OK coverage", "OK iso", "FAIL generic"])
    assert.strictEqual(exitCode, 1)
  })

  test("--dry-run은 GitHub에 묻지 않는다", async () => {
    const { lines } = await runCli("--dry-run", "--channel", "iso")
    assert.deepStrictEqual(statusLines(lines), ["OK iso"])
    assert.ok(requests.every((request) => !request.url.startsWith("/api.github.com")))
    assert.ok(lines.includes("=== edition: ISO 13400-2"))
  })

  test("아는 발행기관의 판 표시가 있는 엔트리가 어디에도 들지 않으면 FAIL, 나머지는 SKIP이다", async () => {
    // 범용 행이 맡은 엔트리의 발행기관(MISRA Consortium)이 낸, 어느 통로도 맡지 않는 엔트리와 처음 보는 발행기관의 엔트리
    const extra = {
      "content/extra.md":
        "---\ntitle: 더\n---\n\n문장이다.[@misra-cpp-2023] 문장이다.[@example-spec-2020]\n",
      "bib/misra-cpp-2023.bib": bib(
        "misra-cpp-2023",
        "MISRA C++:2023",
        "MISRA Consortium",
        "https://misra.org.uk/product/misra-cpp2023/",
      ),
      "bib/example-spec-2020.bib": bib(
        "example-spec-2020",
        "Example Specification 1.0",
        "Example Consortium",
        "https://example.org/spec/",
      ),
    }
    for (const [rel, text] of Object.entries(extra)) fs.writeFileSync(path.join(root, rel), text)
    try {
      const { exitCode, lines } = await runCli("--dry-run")
      assert.deepStrictEqual(statusLines(lines), ["FAIL coverage", "OK iso", "OK generic"])
      assert.ok(
        lines.some((line) =>
          /^ +bib\/misra-cpp-2023\.bib:1: misra-cpp-2023 \(MISRA Consortium\)/.test(line),
        ),
      )
      assert.ok(lines.some((line) => /^SKIP unlisted/.test(line)))
      assert.ok(lines.includes("  Example Consortium: example-spec-2020"))
      assert.strictEqual(exitCode, 1)
    } finally {
      for (const rel of Object.keys(extra)) fs.rmSync(path.join(root, rel))
    }
  })
})
