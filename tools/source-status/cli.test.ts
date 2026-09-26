import test, { after, before, describe } from "node:test"
import assert from "node:assert"
import { execFile, execFileSync } from "node:child_process"
import { X509Certificate } from "node:crypto"
import fs from "node:fs"
import http from "node:http"
import https from "node:https"
import type { AddressInfo } from "node:net"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { repoRoot } from "../repo"

// 출처 상태 CLI를 seam으로 본다. 트리와 로컬 HTTP 서버를 넣고 출력 줄과 종료 코드만 본다.
// bib의 URL에 서버 포트가 들어가야 해서 트리는 테스트가 임시 디렉터리에 만든다.
// 로컬 서버 밖의 URL은 preload(fake-hosts.ts)가 같은 경로로 로컬 서버에 돌린다.
// 인증서 검사는 openssl로 만든 루트, 중간, leaf 인증서와 leaf만 보내는 로컬 HTTPS 서버로 한다.
// 루트는 NODE_EXTRA_CA_CERTS로 CLI가 신뢰하게 하고, 중간 인증서는 로컬 HTTP 서버가 DER로 준다.
const here = path.dirname(fileURLToPath(import.meta.url))
const today = "2026-09-25"

let server: http.Server
let base: string
let hungOnce = false
let certDir: string
const secure = new Map<string, string>()
const secureServers: https.Server[] = []
const roots: string[] = []

before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === "/moved") res.writeHead(301, { location: "/alive" })
    // 로컬 HTTPS 서버로 보내는 리다이렉트. 예: /to/aia
    // /via/aia는 상대 경로 /to/aia를 거친다.
    else if (req.url?.startsWith("/via/"))
      res.writeHead(301, { location: `/to/${req.url.slice(5)}` })
    else if (req.url?.startsWith("/to/"))
      res.writeHead(301, { location: secure.get(req.url.slice(4)) })
    // HEAD를 받지 않는 서버
    else if (req.url === "/no-head") res.statusCode = req.method === "HEAD" ? 405 : 200
    // 봇 차단: 메서드와 헤더에 상관없이 막는다
    else if (req.url === "/blocked") res.statusCode = 403
    // 답하지 않는 서버
    else if (req.url === "/hang") return
    // 첫 요청에만 답하지 않는 서버
    else if (req.url === "/hang-once" && !hungOnce) {
      hungOnce = true
      return
    } else if (req.url?.startsWith("/certs/")) {
      const pem = fs.readFileSync(path.join(certDir, `${path.basename(req.url, ".der")}.pem`))
      return res.end(new X509Certificate(pem).raw)
    } else res.statusCode = req.url === "/alive" || req.url === "/hang-once" ? 200 : 404
    res.end()
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

  certDir = fs.mkdtempSync(path.join(os.tmpdir(), "source-status-certs-"))
  const ca = ["basicConstraints=critical,CA:TRUE", "keyUsage=critical,keyCertSign,cRLSign"]
  const leaf = ["subjectAltName=IP:127.0.0.1", "extendedKeyUsage=serverAuth"]
  const aia = (issuer: string) => `authorityInfoAccess=caIssuers;URI:${base}/certs/${issuer}.der`
  issue("root", undefined, ca)
  issue("intermediate", "root", ca)
  // CLI가 신뢰하지 않는 루트에서 나온 중간 인증서
  issue("stranger-root", undefined, ca)
  issue("stranger-intermediate", "stranger-root", ca)
  issue("aia", "intermediate", [...leaf, aia("intermediate")])
  issue("no-aia", "intermediate", leaf)
  issue("stranger", "stranger-intermediate", [...leaf, aia("stranger-intermediate")])
  for (const name of ["aia", "no-aia", "stranger"]) {
    const key = fs.readFileSync(path.join(certDir, `${name}.key`))
    const cert = fs.readFileSync(path.join(certDir, `${name}.pem`))
    const secureServer = https.createServer({ key, cert }, (_req, res) => res.end())
    await new Promise<void>((resolve) => secureServer.listen(0, "127.0.0.1", resolve))
    secure.set(name, `https://127.0.0.1:${(secureServer.address() as AddressInfo).port}/`)
    secureServers.push(secureServer)
  }
})

after(() => {
  server.closeAllConnections()
  server.close()
  for (const secureServer of secureServers) secureServer.close()
  for (const dir of [...roots, certDir]) fs.rmSync(dir, { recursive: true, force: true })
})

let serial = 1
// issuer가 없으면 자체 서명이다. 유효기간은 100년으로 잡는다.
function issue(name: string, issuer: string | undefined, extensions: string[]) {
  const openssl = (...args: string[]) =>
    execFileSync("openssl", args, { cwd: certDir, stdio: "ignore" })
  const key = ["-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:prime256v1", "-nodes"]
  openssl(
    "req",
    "-new",
    ...key,
    "-keyout",
    `${name}.key`,
    "-out",
    `${name}.csr`,
    "-subj",
    `/CN=${name}`,
  )
  fs.writeFileSync(path.join(certDir, `${name}.ext`), extensions.join("\n"))
  const signer = issuer
    ? ["-CA", `${issuer}.pem`, "-CAkey", `${issuer}.key`, "-set_serial", String(serial++)]
    : ["-signkey", `${name}.key`]
  const out = ["-extfile", `${name}.ext`, "-out", `${name}.pem`]
  openssl("x509", "-req", "-in", `${name}.csr`, ...signer, "-days", "36500", ...out)
}

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
      [
        "--import",
        "tsx",
        "--import",
        path.join(here, "fake-hosts.ts"),
        path.join(here, "cli.ts"),
        root,
        "--today",
        today,
        ...args,
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          FAKE_HOSTS_ORIGIN: base,
          NODE_EXTRA_CA_CERTS: path.join(certDir, "root.pem"),
        },
      },
      (error, stdout) => {
        const statuses: string[] = []
        const locations = new Map<string, string[]>()
        let current = ""
        for (const line of stdout.split("\n")) {
          const status = line.match(/^(OK|FAIL|SKIP) +(\S+)/)
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

  test("봇 차단 호스트의 403은 url-blocked에 따로 찍고, 그것만으로는 exit 0이다", async () => {
    const root = makeTree({
      "content/fresh.md": page(
        ["network/can"],
        "2026-09-01",
        "하나[@iso-11898-1-2024], 둘[@onsemi-ncv7340-2024], 셋.[@iec-60050-2024]",
      ),
      "bib/iso-11898-1-2024.bib": bib("iso-11898-1-2024", "https://www.iso.org/blocked"),
      "bib/onsemi-ncv7340-2024.bib": bib("onsemi-ncv7340-2024", "https://www.onsemi.com/blocked"),
      "bib/iec-60050-2024.bib": bib("iec-60050-2024", "https://www.electropedia.org/blocked"),
    })
    const report = await runStatus(root)
    assert.deepStrictEqual(report.statuses, ["OK url", "SKIP url-blocked", "OK verified"])
    assert.deepStrictEqual(report.locations.get("url-blocked"), [
      "bib/iec-60050-2024.bib:3",
      "bib/iso-11898-1-2024.bib:3",
      "bib/onsemi-ncv7340-2024.bib:3",
    ])
    assert.strictEqual(report.exitCode, 0)
  })

  test("목록 밖 호스트의 403과 목록 호스트의 403 아닌 실패는 url FAIL이다", async () => {
    const root = makeTree({
      "content/fresh.md": page(
        ["network/can"],
        "2026-09-01",
        "하나[@org-blocked-2024], 둘.[@iso-dead-2024]",
      ),
      "bib/org-blocked-2024.bib": bib("org-blocked-2024", `${base}/blocked`),
      "bib/iso-dead-2024.bib": bib("iso-dead-2024", "https://www.iso.org/dead"),
    })
    const report = await runStatus(root)
    assert.deepStrictEqual(report.statuses, ["FAIL url", "OK verified"])
    assert.deepStrictEqual(report.locations.get("url"), [
      "bib/iso-dead-2024.bib:3",
      "bib/org-blocked-2024.bib:3",
    ])
    assert.strictEqual(report.exitCode, 1)
  })

  test("제한 시간 안에 두 번 모두 답하지 않는 URL은 url-timeout에 따로 찍고, 그것만으로는 exit 0이다", async () => {
    const root = makeTree({
      "content/fresh.md": page(["network/can"], "2026-09-01", "문장이다.[@org-hang-2024]"),
      "bib/org-hang-2024.bib": bib("org-hang-2024", `${base}/hang`),
    })
    const report = await runStatus(root, "--timeout", "300")
    assert.deepStrictEqual(report.statuses, ["OK url", "SKIP url-timeout", "OK verified"])
    assert.deepStrictEqual(report.locations.get("url-timeout"), ["bib/org-hang-2024.bib:3"])
    assert.strictEqual(report.exitCode, 0)
  })

  test("첫 요청만 제한 시간을 넘기고 다시 물었을 때 2xx로 답하는 URL은 OK다", async () => {
    const root = makeTree({
      "content/fresh.md": page(["network/can"], "2026-09-01", "문장이다.[@org-hang-once-2024]"),
      "bib/org-hang-once-2024.bib": bib("org-hang-once-2024", `${base}/hang-once`),
    })
    const report = await runStatus(root, "--timeout", "300")
    assert.deepStrictEqual(report.statuses, ["OK url", "OK verified"])
    assert.strictEqual(report.exitCode, 0)
  })

  test("leaf만 보내는 HTTPS 서버는 AIA에서 받은 중간 인증서로 다시 물어 OK다", async () => {
    const root = makeTree({
      "content/fresh.md": page(["network/can"], "2026-09-01", "문장이다.[@org-aia-2024]"),
      "bib/org-aia-2024.bib": bib("org-aia-2024", secure.get("aia")!),
    })
    const report = await runStatus(root)
    assert.deepStrictEqual(report.statuses, ["OK url", "OK verified"])
    assert.strictEqual(report.exitCode, 0)
  })

  test("AIA 주소가 없거나 받은 중간 인증서가 신뢰하는 루트로 이어지지 않으면 url FAIL이다", async () => {
    const root = makeTree({
      "content/fresh.md": page(
        ["network/can"],
        "2026-09-01",
        "하나[@org-no-aia-2024], 둘.[@org-stranger-2024]",
      ),
      "bib/org-no-aia-2024.bib": bib("org-no-aia-2024", secure.get("no-aia")!),
      "bib/org-stranger-2024.bib": bib("org-stranger-2024", secure.get("stranger")!),
    })
    const report = await runStatus(root)
    assert.deepStrictEqual(report.statuses, ["FAIL url", "OK verified"])
    assert.deepStrictEqual(report.locations.get("url"), [
      "bib/org-no-aia-2024.bib:3",
      "bib/org-stranger-2024.bib:3",
    ])
    assert.strictEqual(report.exitCode, 1)
  })

  test("상대 경로를 포함한 리다이렉트로 닿은 leaf만 보내는 HTTPS 서버도 AIA에서 받은 중간 인증서로 다시 물어 OK다", async () => {
    const root = makeTree({
      "content/fresh.md": page(["network/can"], "2026-09-01", "문장이다.[@org-via-aia-2024]"),
      "bib/org-via-aia-2024.bib": bib("org-via-aia-2024", `${base}/via/aia`),
    })
    const report = await runStatus(root)
    assert.deepStrictEqual(report.statuses, ["OK url", "OK verified"])
    assert.strictEqual(report.exitCode, 0)
  })

  test("리다이렉트로 닿은 서버에 AIA 주소가 없거나 신뢰하는 루트로 이어지지 않으면 url FAIL이다", async () => {
    const root = makeTree({
      "content/fresh.md": page(
        ["network/can"],
        "2026-09-01",
        "하나[@org-to-no-aia-2024], 둘.[@org-to-stranger-2024]",
      ),
      "bib/org-to-no-aia-2024.bib": bib("org-to-no-aia-2024", `${base}/to/no-aia`),
      "bib/org-to-stranger-2024.bib": bib("org-to-stranger-2024", `${base}/to/stranger`),
    })
    const report = await runStatus(root)
    assert.deepStrictEqual(report.statuses, ["FAIL url", "OK verified"])
    assert.deepStrictEqual(report.locations.get("url"), [
      "bib/org-to-no-aia-2024.bib:3",
      "bib/org-to-stranger-2024.bib:3",
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
