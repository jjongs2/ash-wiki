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
// 사용: npm run source-status -- [<트리 루트>] [--topic <태그>] [--url <URL>]... [--today <YYYY-MM-DD>]
//   [--timeout <밀리초>] [--interval <밀리초>]
const verificationPath = path.join(repoRoot, "docs", "wiki-verification.md")

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    topic: { type: "string" },
    url: { type: "string", multiple: true },
    today: { type: "string" },
    timeout: { type: "string" },
    interval: { type: "string" },
  },
})
const root = path.resolve(positionals[0] ?? ".")
const today = values.today ?? new Date().toISOString().slice(0, 10)
// 요청 하나의 제한 시간. 테스트가 줄여 쓴다.
const timeoutMs = Number(values.timeout ?? 15_000)
if (!(timeoutMs > 0)) throw new Error(`--timeout은 양의 밀리초여야 한다: ${values.timeout}`)
// 한 호스트의 요청 시작 사이 최소 간격. 테스트가 줄여 쓴다.
const intervalMs = Number(values.interval ?? 2_000)
if (!(intervalMs >= 0)) throw new Error(`--interval은 0 이상의 밀리초여야 한다: ${values.interval}`)
// 동시 요청 수. 한꺼번에 물으면 도구 자신의 부하로 연결이 시간 초과되고, 호스트가 연결을 거부한다.
// --url은 앞선 실행에서 남은 URL을 다시 묻는 데 쓰므로 하나씩 묻는다.
const totalLimit = values.url ? 1 : 8
const hostLimit = values.url ? 1 : 2
// 시간 초과가 이만큼 많으면 출처가 아니라 환경의 문제로 보고 실패로 끝낸다. --url은 남은 URL만 다시 물어 비율이 늘 높으므로 보지 않는다.
const timeoutFlood = { count: 5, ratio: 0.05 }
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

// 봇 차단 호스트의 봇 차단 응답(403, WAF 챌린지), 두 번 물어도 시간 초과인 URL, 한 호스트에 몰린 연결 거부는
// 출처 사망이 아니라 확인 불가로 따로 모은다. urls를 주면 그 URL만 묻는다.
async function checkUrls(
  tree: Tree,
  pages: Page[],
  blockedHosts: string[],
  urls: string[] | undefined,
): Promise<{
  checked: number
  dead: Violation[]
  blocked: Violation[]
  timedOut: Violation[]
  refused: Violation[]
}> {
  const cited = new Set(pages.flatMap((page) => citations(page).map((c) => c.key)))
  const targets = tree.bib.flatMap((bib) =>
    "error" in bib.entries
      ? []
      : bib.entries
          .filter((entry) => cited.has(entry.key) && entry.fields.has("url"))
          .map((entry) => ({ file: bib.file, field: entry.fields.get("url")! }))
          .filter(({ field }) => urls === undefined || urls.includes(field.value)),
  )
  // 인용하지 않은 URL을 주면 묻지 않은 채 OK로 끝나므로 멈춘다.
  const unknown = urls?.filter((url) => !targets.some(({ field }) => field.value === url)) ?? []
  if (unknown.length > 0)
    throw new Error(`--url이 인용한 엔트리의 url이 아니다: ${unknown.join(", ")}`)
  const dead: Violation[] = []
  const blocked: Violation[] = []
  const timedOut: Violation[] = []
  const refusedByHost = new Map<string, Violation[]>()
  const all = limiter(totalLimit)
  const gates = new Map<string, Gate>()
  await Promise.all(
    targets.map(async ({ file, field }) => {
      const host = new URL(field.value).hostname
      if (!gates.has(host)) gates.set(host, gate(hostLimit, intervalMs))
      const outcome = await gates.get(host)!(() => all(() => probe(field.value)))
      if (outcome.kind === "alive") return
      const violation = { file, line: field.line, message: `${outcome.reason} ${field.value}` }
      if (outcome.kind === "timeout") timedOut.push(violation)
      else if (outcome.kind === "refused")
        refusedByHost.set(host, [...(refusedByHost.get(host) ?? []), violation])
      else if (outcome.botBlocked && isBlockedHost(field.value, blockedHosts))
        blocked.push(violation)
      else dead.push(violation)
    }),
  )
  // 연결 거부가 한 호스트에서 하나뿐이면 출처 사망으로 센다. 둘 이상이면 호스트가 이 도구를 막은 것일 수 있다.
  const refused = [...refusedByHost.values()].filter((group) => group.length >= 2).flat()
  dead.push(...[...refusedByHost.values()].filter((group) => group.length < 2).flat())
  return { checked: targets.length, dead, blocked, timedOut, refused }
}

// 동시에 n개까지만 돌린다. 끝난 일의 자리는 기다리던 일에 바로 넘긴다.
function limiter(n: number) {
  let active = 0
  const waiting: (() => void)[] = []
  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (active < n) active++
    else await new Promise<void>((resolve) => waiting.push(resolve))
    try {
      return await task()
    } finally {
      const next = waiting.shift()
      if (next) next()
      else active--
    }
  }
}

// 한 호스트의 문. 동시에 n개까지만 들이고, 일을 시작하는 사이를 interval 밀리초 이상 띄운다.
// 시작 시각은 기다리기 전에 잡아 두므로, 함께 기다리던 일이 같은 시각에 시작하지 않는다.
type Gate = <T>(task: () => Promise<T>) => Promise<T>
function gate(n: number, interval: number): Gate {
  const run = limiter(n)
  let next = 0
  return (task) =>
    run(async () => {
      const start = Math.max(Date.now(), next)
      next = start + interval
      await new Promise((resolve) => setTimeout(resolve, start - Date.now()))
      return task()
    })
}

function isBlockedHost(url: string, blockedHosts: string[]): boolean {
  const host = new URL(url).hostname
  return blockedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))
}

// 살아 있지 않으면 이유와 봇 차단 응답(403, WAF 챌린지)이었는지를 준다. 시간 초과와 연결 거부는 출처 사망과 가를 수 있게 따로 준다.
type Outcome =
  | { kind: "alive" }
  | { kind: "dead"; reason: string; botBlocked: boolean }
  | { kind: "timeout"; reason: string }
  | { kind: "refused"; reason: string }

// AWS WAF가 자동 요청에 돌려주는 챌린지. 본문 없는 202라 2xx여도 출처가 살아 있는지 알 수 없다.
function isWafChallenge(response: Response): boolean {
  return response.status === 202 && response.headers.get("x-amzn-waf-action") === "challenge"
}

// 제한 시간 안에 답이 없으면 한 번 더 묻는다.
async function probe(url: string): Promise<Outcome> {
  const outcome = await ask(url)
  return outcome.kind === "timeout" ? ask(url) : outcome
}

// 연결 시간 초과. AbortSignal의 제한 초과(TimeoutError)와 함께 시간 초과로 세고, 연결 거부는 따로 센다. DNS 실패 같은 그 밖의 오류는 출처 사망으로 센다.
const timeoutCodes = new Set(["UND_ERR_CONNECT_TIMEOUT", "ETIMEDOUT"])

// 서버가 중간 인증서를 보내지 않아 leaf를 검증하지 못한 오류
const missingIssuerCodes = new Set([
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
])

// 데이터시트 같은 큰 파일을 받지 않으려고 HEAD를 먼저 보내고, HEAD를 받지 않는 서버가 있어 2xx가 아니거나 챌린지면 GET으로 한 번 더 묻는다.
// 중간 인증서가 빠진 서버는 브라우저처럼 그 서버 leaf의 AIA에서 받아 와 원래 URL로 한 번 더 묻는다. 리다이렉트로 닿은 서버여도 같다.
async function ask(url: string, followAia = true): Promise<Outcome> {
  // 인증서 오류가 났을 때 어느 요청의 리다이렉트를 다시 따라갈지 가린다.
  let method = "HEAD"
  try {
    const head = await fetch(url, { method, signal: AbortSignal.timeout(timeoutMs) })
    if (head.ok && !isWafChallenge(head)) return { kind: "alive" }
    method = "GET"
    const get = await fetch(url, { method, signal: AbortSignal.timeout(timeoutMs) })
    await get.body?.cancel()
    if (isWafChallenge(get))
      return { kind: "dead", reason: "HTTP 202 WAF 챌린지", botBlocked: true }
    return get.ok
      ? { kind: "alive" }
      : { kind: "dead", reason: `HTTP ${get.status}`, botBlocked: get.status === 403 }
  } catch (error) {
    const name = (error as Error).name
    const code = errorCode(error)
    const reason = `응답 없음(${code ?? name})`
    if (name === "TimeoutError" || timeoutCodes.has(code ?? "")) return { kind: "timeout", reason }
    if (code === "ECONNREFUSED") return { kind: "refused", reason }
    if (followAia && missingIssuerCodes.has(code ?? "")) {
      const failedUrl = await certErrorAt(url, method)
      if (failedUrl !== undefined && (await trustIssuer(failedUrl))) return ask(url, false)
    }
    return { kind: "dead", reason, botBlocked: false }
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
const urls = await checkUrls(tree, pages, blockedHosts, values.url)
statuses.push(report("url", verdict(urls.dead), urls.dead))
for (const [id, unchecked] of [
  ["url-blocked", urls.blocked],
  ["url-timeout", urls.timedOut],
  ["url-refused", urls.refused],
] as const) {
  if (unchecked.length === 0) continue
  const flood =
    id === "url-timeout" &&
    values.url === undefined &&
    unchecked.length >= timeoutFlood.count &&
    unchecked.length >= urls.checked * timeoutFlood.ratio
  statuses.push(
    flood
      ? report(
          id,
          "FAIL",
          unchecked,
          `${urls.checked}건 중 ${unchecked.length}건, 환경 확인 뒤 다시`,
        )
      : report(id, "SKIP", unchecked, "확인 불가, 브라우저로 확인"),
  )
}
const stale = checkVerified(pages, today, staleDays)
statuses.push(report("verified", verdict(stale), stale))
process.exitCode = statuses.includes("FAIL") ? 1 : 0
