import { X509Certificate } from "node:crypto"
import fs from "node:fs"
import net from "node:net"
import path from "node:path"
import tls from "node:tls"
import { parseArgs } from "node:util"
import { repoRoot } from "../repo"
import { Conventions } from "../check-content/conventions"
import { report, verdict, type Status } from "../check-content/report"
import { citations } from "../check-content/source-checks"
import { fieldsOf, loadTree, type Page, type Tree, type Violation } from "../check-content/tree"

// 출처 상태. 린트가 쓰고, 기준은 docs/wiki-verification.md의 source-status 표와 bot-blocked-hosts 표에 있다.
// 사용: npm run source-status -- [<트리 루트>] [--topic <태그>] [--today <YYYY-MM-DD>] [--timeout <밀리초>]
const verificationPath = path.join(repoRoot, "docs", "wiki-verification.md")

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { topic: { type: "string" }, today: { type: "string" }, timeout: { type: "string" } },
})
const root = path.resolve(positionals[0] ?? ".")
const today = values.today ?? new Date().toISOString().slice(0, 10)
// 요청 하나의 제한 시간. 테스트가 줄여 쓴다.
const timeoutMs = Number(values.timeout ?? 15_000)
if (!(timeoutMs > 0)) throw new Error(`--timeout은 양의 밀리초여야 한다: ${values.timeout}`)
// 주소 계열 자동 선택(Happy Eyeballs)의 시도 제한. 기본 250ms로는 연결이 느린 호스트(예: itu.int)가 다음 주소로 넘어가 연결 시간 초과로 떨어진다.
net.setDefaultAutoSelectFamilyAttemptTimeout(2_000)

// 문서의 표와 이 스크립트의 검사가 어긋나면 조용히 넘어가지 않고 멈춘다.
const verification = new Conventions(fs.readFileSync(verificationPath, "utf8"), verificationPath)
const criteria = new Map(
  verification.table("source-status", ["검사", "기준"]).map((row) => [row["검사"], row["기준"]]),
)
const ids = ["url", "verified"]
if ([...criteria.keys()].sort().join() !== ids.join()) {
  throw new Error(`${verificationPath}: source-status 표의 검사는 ${ids.join(", ")}여야 한다`)
}
const staleDays = Number(criteria.get("verified"))
const blockedHosts = verification.column("bot-blocked-hosts", "호스트")

const tree = loadTree(root)
// 주제 태그를 주지 않으면 모든 페이지를 본다.
function inTopic(page: Page, topic: string | undefined): boolean {
  const tags = fieldsOf(page)["tags"]
  return (
    topic === undefined ||
    (Array.isArray(tags) &&
      tags.some((tag) => tag === topic || String(tag).startsWith(`${topic}/`)))
  )
}
const pages = tree.pages.filter((page) => page.kind === "page" && inTopic(page, values.topic))

// 봇 차단 호스트의 403과 두 번 물어도 시간 초과인 URL은 출처 사망이 아니라 확인 불가로 따로 모은다.
async function checkUrls(
  tree: Tree,
  pages: Page[],
  blockedHosts: string[],
): Promise<{ dead: Violation[]; blocked: Violation[]; timedOut: Violation[] }> {
  const cited = new Set(pages.flatMap((page) => citations(page).map((c) => c.key)))
  const targets = tree.bib.flatMap((bib) =>
    "error" in bib.entries
      ? []
      : bib.entries
          .filter((entry) => cited.has(entry.key) && entry.fields.has("url"))
          .map((entry) => ({ file: bib.file, field: entry.fields.get("url")! })),
  )
  const dead: Violation[] = []
  const blocked: Violation[] = []
  const timedOut: Violation[] = []
  await Promise.all(
    targets.map(async ({ file, field }) => {
      const outcome = await probe(field.value)
      if (outcome.kind === "alive") return
      const violation = { file, line: field.line, message: `${outcome.reason} ${field.value}` }
      if (outcome.kind === "timeout") timedOut.push(violation)
      else if (outcome.status === 403 && isBlockedHost(field.value, blockedHosts))
        blocked.push(violation)
      else dead.push(violation)
    }),
  )
  return { dead, blocked, timedOut }
}

function isBlockedHost(url: string, blockedHosts: string[]): boolean {
  const host = new URL(url).hostname
  return blockedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))
}

// 살아 있지 않으면 이유와 (응답이 있었으면) 상태 코드를 준다. 시간 초과는 출처 사망과 가를 수 있게 따로 준다.
type Outcome =
  | { kind: "alive" }
  | { kind: "dead"; reason: string; status?: number }
  | { kind: "timeout"; reason: string }

// 제한 시간 안에 답이 없으면 한 번 더 묻는다.
async function probe(url: string): Promise<Outcome> {
  const outcome = await ask(url)
  return outcome.kind === "timeout" ? ask(url) : outcome
}

// 연결 시간 초과. AbortSignal의 제한 초과(TimeoutError)와 함께 시간 초과로 세고, 연결 거부, DNS 실패 같은 그 밖의 오류는 출처 사망으로 센다.
const timeoutCodes = new Set(["UND_ERR_CONNECT_TIMEOUT", "ETIMEDOUT"])

// 서버가 중간 인증서를 보내지 않아 leaf를 검증하지 못한 오류
const missingIssuerCodes = new Set([
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
])

// 데이터시트 같은 큰 파일을 받지 않으려고 HEAD를 먼저 보내고, HEAD를 받지 않는 서버가 있어 2xx가 아니면 GET으로 한 번 더 묻는다.
// 중간 인증서가 빠진 서버는 브라우저처럼 그 서버 leaf의 AIA에서 받아 와 원래 URL로 한 번 더 묻는다. 리다이렉트로 닿은 서버여도 같다.
async function ask(url: string, followAia = true): Promise<Outcome> {
  let method = "HEAD"
  try {
    const head = await fetch(url, { method, signal: AbortSignal.timeout(timeoutMs) })
    if (head.ok) return { kind: "alive" }
    method = "GET"
    const get = await fetch(url, { method, signal: AbortSignal.timeout(timeoutMs) })
    await get.body?.cancel()
    return get.ok
      ? { kind: "alive" }
      : { kind: "dead", reason: `HTTP ${get.status}`, status: get.status }
  } catch (error) {
    const name = (error as Error).name
    const code = errorCode(error)
    const reason = `응답 없음(${code ?? name})`
    if (name === "TimeoutError" || timeoutCodes.has(code ?? "")) return { kind: "timeout", reason }
    if (followAia && missingIssuerCodes.has(code ?? "")) {
      const failed = await certErrorAt(url, method)
      if (failed !== undefined && (await trustIssuer(failed))) return ask(url, false)
    }
    return { kind: "dead", reason }
  }
}

function errorCode(error: unknown): string | undefined {
  return (error as { cause?: { code?: string } }).cause?.code
}

// fetch가 따라간 리다이렉트를 같은 메서드로 한 단계씩 다시 따라가, 중간 인증서 오류가 난 곳의 URL을 찾는다.
// fetch처럼 리다이렉트는 20번까지 따라간다. 찾지 못하면 undefined다.
async function certErrorAt(url: string, method: string): Promise<string | undefined> {
  let current = url
  for (let redirects = 0; ; redirects++) {
    try {
      const response = await fetch(current, {
        method,
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
      })
      await response.body?.cancel()
      const location = response.headers.get("location")
      if (response.status < 300 || response.status >= 400 || location === null) return undefined
      if (redirects === 20) return undefined
      current = new URL(location, current).href
    } catch (error) {
      return missingIssuerCodes.has(errorCode(error) ?? "") ? current : undefined
    }
  }
}

// leaf의 AIA(CA Issuers)에서 중간 인증서를 받아 기본 CA 목록에 더한다. 더했으면 true다.
// 검증 없이 연결하는 건 AIA 주소를 읽을 때뿐이다. 더한 중간 인증서도 신뢰하는 루트까지 이어져야 다시 물을 때 통과한다.
async function trustIssuer(url: string): Promise<boolean> {
  const { hostname, port } = new URL(url)
  const leaf = await new Promise<tls.PeerCertificate | undefined>((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: Number(port || 443),
        servername: net.isIP(hostname) ? undefined : hostname,
        rejectUnauthorized: false,
      },
      () => {
        resolve(socket.getPeerCertificate())
        socket.end()
      },
    )
    socket.setTimeout(timeoutMs, () => socket.destroy())
    socket.on("close", () => resolve(undefined))
    socket.on("error", () => resolve(undefined))
  })
  for (const issuer of leaf?.infoAccess?.["CA Issuers - URI"] ?? []) {
    try {
      const response = await fetch(issuer, { signal: AbortSignal.timeout(timeoutMs) })
      if (!response.ok) continue
      const pem = new X509Certificate(Buffer.from(await response.arrayBuffer())).toString()
      const current = tls.getCACertificates("default")
      if (!current.includes(pem)) tls.setDefaultCACertificates([...current, pem])
      return true
    } catch {
      // 받지 못했거나 인증서가 아니면 다음 주소를 본다.
    }
  }
  return false
}

function checkVerified(pages: Page[], today: string, staleDays: number): Violation[] {
  const violations: Violation[] = []
  for (const page of pages) {
    const verified = fieldsOf(page)["verified"]
    if (typeof verified !== "string") continue
    const days = Math.floor((Date.parse(today) - Date.parse(verified)) / 86_400_000)
    if (days <= staleDays) continue
    const line = "error" in page.frontmatter ? 1 : page.frontmatter.lineOf("verified")
    violations.push({ file: page.file, line, message: `검증일 ${verified}에서 ${days}일 지났다` })
  }
  return violations
}

const statuses: Status[] = []
const urls = await checkUrls(tree, pages, blockedHosts)
statuses.push(report("url", verdict(urls.dead), urls.dead))
for (const [id, unchecked] of [
  ["url-blocked", urls.blocked],
  ["url-timeout", urls.timedOut],
] as const) {
  if (unchecked.length > 0)
    statuses.push(report(id, "SKIP", unchecked, "확인 불가, 브라우저로 확인"))
}
const stale = checkVerified(pages, today, staleDays)
statuses.push(report("verified", verdict(stale), stale))
process.exitCode = statuses.includes("FAIL") ? 1 : 0
