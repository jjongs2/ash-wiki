import type { Row } from "../../check-content/conventions"
import {
  ChannelError,
  compareEditions,
  fetchOk,
  type Change,
  type Channel,
  type Entry,
} from "../model"

// 범용 행. docs/wiki-verification.md의 edition-generic 표의 한 행이 출판물 하나다.
// URL의 본문에서 판 패턴이 잡는 판 가운데 가장 새 판이, 엔트리 제목에서 같은 패턴이 잡는 가장 새 판보다 새로우면
// 새 판이다. 패턴은 잡을 묶음(capture group) 하나로 판 이름을 잡는다.
export interface GenericRow {
  publication: string // 표준 페이지의 title
  page: string // 표준 페이지 이름
  entries: RegExp // 이 출판물의 엔트리 키
  url: string
  pattern: RegExp
  headers?: Record<string, string>
}

export function genericRows(rows: Row[]): GenericRow[] {
  return rows.map((row) => {
    const pattern = new RegExp(row["판 패턴"], "g")
    if (new RegExp(`${pattern.source}|`).exec("")!.length !== 2)
      throw new Error(`edition-generic 표 ${row["출판물"]}의 판 패턴은 잡을 묶음이 하나여야 한다`)
    return {
      publication: row["출판물"],
      page: row["페이지"],
      entries: new RegExp(row["엔트리"]),
      url: row["URL"],
      pattern,
      // 브라우저 User-Agent가 있어야 답하는 호스트(docs/source-access.md)
      headers:
        row["요청"] === "브라우저 User-Agent"
          ? {
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            }
          : undefined,
    }
  })
}

const editionsIn = (text: string, pattern: RegExp) =>
  [...text.matchAll(pattern)].map((match) => match[1]).sort(compareEditions)

export function generic(rows: GenericRow[]): Channel {
  return {
    id: "generic",
    ownsPage: (page) => rows.some((row) => row.page === page.name),
    publicationOf: (entry) => rows.find((row) => row.entries.test(entry.key))?.publication,
    async check(publications, context) {
      const changes: Change[] = []
      for (const publication of publications) {
        if (publication.entries.length === 0) continue
        const row = rows.find((row) => row.publication === publication.name)!
        const cited = publication.entries.flatMap((entry) =>
          editionsIn(entry.title, row.pattern).map((edition) => ({ entry, edition })),
        )
        if (cited.length === 0)
          throw new Error(
            `edition-generic 표 ${row.publication}의 판 패턴이 인용한 엔트리 제목에서 판을 찾지 못했다`,
          )
        const latestCited = cited
          .map(({ edition }) => edition)
          .sort(compareEditions)
          .at(-1)!
        const current: Entry[] = cited
          .filter(({ edition }) => compareEditions(edition, latestCited) === 0)
          .map(({ entry }) => entry)
        const response = await fetchOk(context, row.url, { headers: row.headers })
        const found = editionsIn(await response.text(), row.pattern)
        if (found.length === 0) throw new ChannelError(`${row.url}에서 판 패턴을 찾지 못했다`)
        const latest = found.at(-1)!
        if (compareEditions(latest, latestCited) <= 0) continue
        changes.push({
          publication,
          kind: "new-edition",
          target: `${publication.name} ${latest}`,
          evidence: [{ field: `판 패턴 \`${row.pattern.source}\``, value: latest, url: row.url }],
          current,
        })
      }
      return changes
    },
  }
}
