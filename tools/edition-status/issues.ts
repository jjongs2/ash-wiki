import { changeKey, kindNames, type Change, type Entry, type Publication } from "./model"

// 출판물 하나에 이슈 하나다. 본문의 숨은 표식으로 출판물과 바뀜의 키를 적고, 억제할 때 이것으로 견준다.
// 규칙은 docs/wiki-verification.md의 판 확인 절에 있다.
const publicationMarker = (name: string) => `<!-- edition-status: ${name} -->`
const keyMarker = (key: string) => `<!-- edition-key: ${key} -->`
const publicationPattern = /^<!-- edition-status: (.+) -->$/m
const keyPattern = /^<!-- edition-key: (.+) -->$/gm

export interface Issue {
  number: number
  state: "open" | "closed"
  title: string
  body: string
}

export type Action =
  | { kind: "open"; title: string; body: string; changes: Change[] }
  | { kind: "update"; issue: Issue; body: string; changes: Change[] }

export const issueTitle = (publication: Publication) => `edition: ${publication.name}`

export function publicationOfIssue(issue: Issue): string | undefined {
  return issue.body.match(publicationPattern)?.[1]
}

export function keysOfIssue(issue: Issue): string[] {
  return [...issue.body.matchAll(keyPattern)].map((match) => match[1])
}

// 같은 출판물의 열린 이슈가 있으면 그 본문을 갱신하고, 없으면 연다. 닫힌 이슈가 적은 키의 바뀜은 닫힌 이유와
// 상관없이 다시 알리지 않는다. 남은 바뀜이 없으면 아무것도 하지 않는다.
export function plan(changes: Change[], issues: Issue[], repo: string): Action[] {
  const closedKeys = new Set(
    issues.filter((issue) => issue.state === "closed").flatMap((issue) => keysOfIssue(issue)),
  )
  const byPublication = new Map<string, Change[]>()
  for (const change of changes) {
    if (closedKeys.has(changeKey(change))) continue
    const name = change.publication.name
    byPublication.set(name, [...(byPublication.get(name) ?? []), change])
  }
  const actions: Action[] = []
  for (const [name, fresh] of byPublication) {
    const body = render(fresh, repo)
    const open = issues.find(
      (issue) => issue.state === "open" && publicationOfIssue(issue) === name,
    )
    if (!open)
      actions.push({ kind: "open", title: issueTitle(fresh[0].publication), body, changes: fresh })
    else if (open.body.trim() !== body.trim())
      actions.push({ kind: "update", issue: open, body, changes: fresh })
  }
  return actions
}

// 이슈와 페이지 참조는 명시적 링크로 쓴다. 저장소가 비공개인 동안 workflow의 GITHUB_TOKEN으로 게시한 `#N`은
// 링크로 풀리지 않는다.
export function render(changes: Change[], repo: string): string {
  const publication = changes[0].publication
  const blob = `https://github.com/${repo}/blob/main`
  const lines = [
    publicationMarker(publication.name),
    `[판 확인](${blob}/docs/wiki-verification.md#판-확인)이 ${publication.name}의 바뀜을 찾았다. ` +
      `반영은 [표준의 판](${blob}/docs/wiki-verification.md#표준의-판)을 따르고, 반영 범위는 triage에서 정한다.`,
    "",
    "## 바뀜",
  ]
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
  lines.push("", "## 영향받는 페이지", "")
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

  // 판 확인이 연 이슈. PR은 뺀다.
  async issues(): Promise<Issue[]> {
    const found: Issue[] = []
    for (let page = 1; ; page++) {
      const batch = (await this.call("GET", `/issues?state=all&per_page=100&page=${page}`)) as {
        number: number
        state: "open" | "closed"
        title: string
        body: string | null
        pull_request?: unknown
      }[]
      for (const issue of batch) {
        if (issue.pull_request || !issue.body?.match(publicationPattern)) continue
        found.push({
          number: issue.number,
          state: issue.state,
          title: issue.title,
          body: issue.body,
        })
      }
      if (batch.length < 100) return found
    }
  }

  async apply(action: Action): Promise<number> {
    if (action.kind === "update") {
      await this.call("PATCH", `/issues/${action.issue.number}`, { body: action.body })
      return action.issue.number
    }
    const created = (await this.call("POST", "/issues", {
      title: action.title,
      body: action.body,
      labels: ["needs-triage"],
    })) as { number: number }
    return created.number
  }
}
