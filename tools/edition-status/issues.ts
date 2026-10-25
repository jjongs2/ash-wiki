import { changeKey, kindNames, type Change, type Entry } from "./model"

// 판 확인은 열린 모음 이슈 하나에 출판물마다 코멘트 하나로 바뀜을 더한다. 코멘트의 숨은 표식으로 바뀜의 키를 적고,
// 모음 이슈(열림·닫힘)의 코멘트에 이미 적힌 키의 바뀜은 다시 알리지 않는다. 모음 이슈는 제목으로 찾는다.
// 규칙은 docs/wiki-verification.md의 판 확인 절에 있다.
export const collectionTitle = "edition: 판 확인 모음"
const keyMarker = (key: string) => `<!-- edition-key: ${key} -->`
const keyPattern = /^<!-- edition-key: (.+) -->$/gm

// 모음 이슈와 그 코멘트 본문
export interface Issue {
  number: number
  state: "open" | "closed"
  comments: string[]
}

export interface Plan {
  // 코멘트를 달 열린 모음 이슈. 없으면 새로 연다.
  issue?: Issue
  comments: { publication: string; body: string }[]
}

export function keysOf(issue: Issue): string[] {
  return issue.comments.flatMap((comment) =>
    [...comment.matchAll(keyPattern)].map((match) => match[1]),
  )
}

export function plan(changes: Change[], issues: Issue[], repo: string): Plan {
  const known = new Set(issues.flatMap(keysOf))
  const byPublication = new Map<string, Change[]>()
  for (const change of changes) {
    if (known.has(changeKey(change))) continue
    const name = change.publication.name
    byPublication.set(name, [...(byPublication.get(name) ?? []), change])
  }
  return {
    issue: issues.filter((issue) => issue.state === "open").sort((a, b) => a.number - b.number)[0],
    comments: [...byPublication].map(([publication, fresh]) => ({
      publication,
      body: render(fresh, repo),
    })),
  }
}

// 모음 이슈의 본문. 처리 절차는 판 확인 절에만 둔다.
export function collectionBody(repo: string): string {
  const doc = `https://github.com/${repo}/blob/main/docs/wiki-verification.md`
  return (
    `[판 확인](${doc}#판-확인)이 찾은 바뀜을 출판물마다 코멘트 하나로 모은다. ` +
    `triage와 닫는 법은 [판 확인의 이슈](${doc}#이슈)를 따른다.\n`
  )
}

// 코멘트 하나. 이슈와 페이지 참조는 명시적 링크로 쓴다. 저장소가 비공개인 동안 workflow의 GITHUB_TOKEN으로
// 게시한 `#N`은 링크로 풀리지 않는다.
export function render(changes: Change[], repo: string): string {
  const publication = changes[0].publication
  const blob = `https://github.com/${repo}/blob/main`
  const lines = [`## ${publication.name}`]
  for (const change of changes) {
    lines.push(
      "",
      `### ${kindNames[change.kind]}: ${change.target}`,
      "",
      keyMarker(changeKey(change)),
      "",
    )
    for (const { field, value, url } of change.evidence)
      lines.push(`- ${field}: ${value} ([원문](${url}))`)
    if (change.notes?.length) lines.push("", ...change.notes.map((note) => `- ${note}`))
  }
  lines.push("", "### 영향받는 페이지", "")
  const counts = affected(changes.flatMap((change) => change.current))
  const page = publication.page?.name
  if (page) {
    lines.push(
      `- [${page}](${blob}/content/${page}.md): 표준 페이지, 인용 ${counts.get(page) ?? 0}`,
    )
    counts.delete(page)
  }
  for (const [name, count] of [...counts].sort(([a], [b]) => a.localeCompare(b)))
    lines.push(`- [${name}](${blob}/content/${name}.md): 인용 ${count}`)
  if (!page && counts.size === 0) lines.push("- 없음")
  return lines.join("\n") + "\n"
}

// 현행으로 인용한 판의 엔트리를 인용한 페이지와 그 인용 수
function affected(entries: Entry[]): Map<string, number> {
  const counts = new Map<string, number>()
  const seen = new Set<string>()
  for (const entry of entries) {
    if (seen.has(entry.key)) continue
    seen.add(entry.key)
    for (const [page, count] of entry.citedBy) counts.set(page, (counts.get(page) ?? 0) + count)
  }
  return counts
}

// GitHub REST API로 이슈를 읽고 쓴다. 토큰은 workflow의 GITHUB_TOKEN이다.
export class GitHub {
  constructor(
    private repo: string,
    private token: string,
    private api = "https://api.github.com",
  ) {}

  private async call(method: string, path: string, body?: unknown): Promise<unknown> {
    const response = await fetch(`${this.api}/repos/${this.repo}${path}`, {
      method,
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${this.token}`,
        "x-github-api-version": "2022-11-28",
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!response.ok)
      throw new Error(
        `GitHub API ${method} ${path}: HTTP ${response.status} ${await response.text()}`,
      )
    return response.json()
  }

  // 100개씩 끝까지 받는다.
  private async all<T>(path: string): Promise<T[]> {
    const found: T[] = []
    for (let page = 1; ; page++) {
      const batch = (await this.call("GET", `${path}per_page=100&page=${page}`)) as T[]
      found.push(...batch)
      if (batch.length < 100) return found
    }
  }

  // 제목이 모음 이슈의 제목인 이슈와 그 코멘트. PR은 뺀다.
  async issues(): Promise<Issue[]> {
    const issues = await this.all<{
      number: number
      state: "open" | "closed"
      title: string
      pull_request?: unknown
    }>("/issues?state=all&")
    const found: Issue[] = []
    for (const issue of issues) {
      if (issue.pull_request || issue.title !== collectionTitle) continue
      const comments = await this.all<{ body: string | null }>(`/issues/${issue.number}/comments?`)
      found.push({
        number: issue.number,
        state: issue.state,
        comments: comments.map((comment) => comment.body ?? ""),
      })
    }
    return found
  }

  async open(body: string): Promise<number> {
    const created = (await this.call("POST", "/issues", {
      title: collectionTitle,
      body,
      labels: ["needs-triage"],
    })) as { number: number }
    return created.number
  }

  async comment(number: number, body: string): Promise<void> {
    await this.call("POST", `/issues/${number}/comments`, { body })
  }
}
