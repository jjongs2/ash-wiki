// 판 확인의 공통 꼴. 통로(channels/)는 자기 출판물을 받아 바뀜을 돌려준다.
// 기준은 docs/wiki-verification.md의 판 확인 절에 있다.

// 페이지가 인용한 참고문헌 엔트리 하나
export interface Entry {
  key: string
  title: string
  url?: string
  note?: string
  // author, organization, institution, publisher 필드를 이은 것
  publisher: string
  file: string
  line: number
  // 인용한 페이지(content/ 기준 이름)와 그 페이지의 인용 수
  citedBy: Map<string, number>
}

export interface StandardPage {
  name: string // 예: iso-13400-2
  title: string
  publisher: string
  edition: string
  status: string
}

// 출판물 하나와 그 엔트리. 표준 페이지가 있으면 그 페이지의 주제가 출판물 하나다(ADR 0011).
export interface Publication {
  name: string // 이슈 제목 `edition: <name>`에 쓴다. 예: ISO 13400-2, RFC 1146
  page?: StandardPage
  entries: Entry[]
}

export type ChangeKind =
  "new-edition" | "withdrawn" | "replaced" | "revision" | "new-part" | "supplement"

// 이슈 본문의 바뀜 종류 이름
export const kindNames: Record<ChangeKind, string> = {
  "new-edition": "새 판",
  withdrawn: "폐지",
  replaced: "대체",
  revision: "개정 착수",
  "new-part": "새 부",
  supplement: "추보·정정 발행",
}

// 통로에서 읽은 필드 값과 그 원문 URL
export interface Evidence {
  field: string
  value: string
  url: string
}

export interface Change {
  publication: Publication
  kind: ChangeKind
  // 바뀜의 대상. 새 판이나 대체한 판, 개정 프로젝트, 새 부, 추보의 이름이다. 예: ISO/CD 13400-2
  target: string
  evidence: Evidence[]
  // 현행으로 인용한 판의 엔트리. 영향받는 페이지를 이것으로 센다.
  current: Entry[]
  // 이슈 본문에 옮길 목록(예: AUTOSAR 릴리스의 Obsolete·Removed 문서). 없으면 비운다.
  notes?: string[]
}

// 같은 바뀜을 가리는 키. 출판물, 바뀜의 종류, 대상 id 셋이다.
export function changeKey(change: Change): string {
  return [change.publication.name, change.kind, change.target].join(" | ")
}

export interface Context {
  // 도구의 User-Agent와 제한 시간을 붙인 fetch. 응답 코드는 보지 않는다.
  fetch(url: string, init?: Pick<RequestInit, "method" | "headers">): Promise<Response>
  // 페이지가 인용한 엔트리 전체. 다른 통로가 맡은 엔트리도 든다. 대체한 판을 참고문헌이 이미 인용했는지
  // 가릴 때 쓴다(IEEE 1471 → ISO/IEC/IEEE 42010).
  cited: Entry[]
}

export interface Channel {
  id: string // docs/wiki-verification.md의 edition-channels 표의 통로
  // 이 통로가 맡는 표준 페이지인가
  ownsPage(page: StandardPage): boolean
  // 표준 페이지에 들지 않은 엔트리가 이 통로의 것이면 그 출판물 이름을 준다.
  publicationOf(entry: Entry): string | undefined
  // 출판물이 하나도 없으면 부르지 않는다.
  check(publications: Publication[], context: Context): Promise<Change[]>
}

// 통로가 응답하지 않거나 기대한 필드를 찾지 못했다. "변화 없음"으로 넘기지 않는다.
export class ChannelError extends Error {}

// 2xx가 아니면 ChannelError로 멈춘다.
export async function fetchOk(
  context: Context,
  url: string,
  init?: Pick<RequestInit, "method" | "headers">,
): Promise<Response> {
  const response = await context.fetch(url, init)
  if (!response.ok) {
    await response.body?.cancel()
    throw new ChannelError(`HTTP ${response.status} ${url}`)
  }
  return response
}

// 판 이름을 숫자 마디로 견준다. 예: 2024 < 2026, v3.1 < v4.0, R24-11 < R25-11
export function compareEditions(a: string, b: string): number {
  const parts = (s: string) => (s.match(/[0-9]+/g) ?? []).map(Number)
  const [x, y] = [parts(a), parts(b)]
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? -1) - (y[i] ?? -1)
    if (d !== 0) return d
  }
  return 0
}
