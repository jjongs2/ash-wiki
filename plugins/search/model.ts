// ash-wiki: 검색 색인과 결과 순서를 맡는 모듈이다. 클라이언트 스크립트(script.ts)가 contentIndex의 페이지로
// 색인을 만들고, 테스트(model.test.ts)가 seam으로 본다. 스크립트는 esbuild로 이 파일과 FlexSearch를 묶어
// 브라우저에 싣는다(index.ts).
import FlexSearch from "flexsearch"

export interface SearchPage {
  slug: string
  title: string
  aliases: string[]
  content: string
  tags: string[]
}

// 한 번에 보이는 결과 수. 업스트림 값이다.
export const numSearchResults = 8

// 글자·숫자·결합 문자가 아닌 문자다. 업스트림은 공백에서만 끊어 100BASE-T1의 T1을 찾지 못한다
// (quartz-community/search#1). 결합 문자(\p{M})를 구분자로 보면 분해된 글자가 둘로 갈린다.
const separator = /[^\p{L}\p{N}\p{M}]/u

const encoder = (str: string): string[] => {
  const tokens: string[] = []
  let bufferStart = -1
  let bufferEnd = -1
  const lower = str.toLowerCase()
  let i = 0

  for (const char of lower) {
    const code = char.codePointAt(0)!

    const isCJK =
      (code >= 0x3040 && code <= 0x309f) ||
      (code >= 0x30a0 && code <= 0x30ff) ||
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0x20000 && code <= 0x2a6df)

    const isSeparator = separator.test(char)

    if (isCJK) {
      if (bufferStart !== -1) {
        tokens.push(lower.slice(bufferStart, bufferEnd))
        bufferStart = -1
      }
      tokens.push(char)
    } else if (isSeparator) {
      if (bufferStart !== -1) {
        tokens.push(lower.slice(bufferStart, bufferEnd))
        bufferStart = -1
      }
    } else {
      if (bufferStart === -1) bufferStart = i
      bufferEnd = i + 1
    }
    i += char.length
  }

  if (bufferStart !== -1) {
    tokens.push(lower.slice(bufferStart))
  }

  return tokens
}

// 정확히 맞는지 견주는 꼴이다. 공백과 문장부호를 지워 수용필터가 수용 필터에, someip가 SOME/IP에 맞는다.
const exactKey = (str: string) =>
  str.normalize("NFC").toLowerCase().replace(new RegExp(separator, "gu"), "")

// 주간 소식의 호(news/<연도>-w<주차>)다. 검증하지 않은 요약이라, 검증된 위키 페이지와 섞어 읽지 않게 뒤로
// 민다(ADR 0015). 호는 매주 늘어 그대로 두면 결과 칸을 차지한다.
const isNewsIssue = (slug: string) => /^news\/\d{4}-w\d{2}$/.test(slug)

// 페이지 갈래의 순서다. 위키 페이지, 태그 목록, 호 순이다.
const kindRank = (slug: string) => (isNewsIssue(slug) ? 2 : slug.startsWith("tags/") ? 1 : 0)

// 강조할 낱말이다. 업스트림처럼 공백으로 끊은 낱말과 그 앞부분을 이은 구를 두고, 인코더처럼 문장부호에서
// 끊은 조각을 더한다. 그래야 SOME-IP로 찾은 SOME/IP에도 강조가 붙는다. 한 글자 조각은 본문의 같은 글자를
// 모두 칠하므로 뺀다. 긴 것부터 맞힌다.
export function highlightTerms(term: string): string[] {
  const words = term.split(/\s+/).filter((word) => word !== "")
  const phrases = words.map((_, i) => words.slice(0, i + 1).join(" "))
  const pieces = words.flatMap((word) => word.split(new RegExp(separator, "u")))
  const terms = new Set([...phrases, ...pieces.filter((piece) => piece.length > 1)])
  return [...terms].sort((a, b) => b.length - a.length)
}

// 강조할 낱말을 맞히는 패턴이다. 낱말이 없으면 null이다.
export function highlightPattern(term: string): RegExp | null {
  const terms = highlightTerms(term)
  if (terms.length === 0) return null
  return new RegExp(terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "gi")
}

// 필드별 결과를 잇는 순서다. 업스트림 기본값(title, content, tags)에 별칭을 제목 다음에 더했다.
const fieldPriority = ["title", "aliases", "content", "tags"]

export function createSearchIndex() {
  const index = new FlexSearch.Document({
    encode: encoder,
    document: {
      id: "id",
      tag: "tags",
      index: [
        { field: "title", tokenize: "forward" },
        { field: "aliases", tokenize: "forward" },
        { field: "content", tokenize: "forward" },
        { field: "tags", tokenize: "forward" },
      ],
    },
  })
  const pages: SearchPage[] = []

  // 검색어와 제목·별칭이 정확히 맞는 페이지다. FlexSearch 결과 밖에 있을 수 있어서(CAN) 따로 찾는다.
  // 제목이 맞은 페이지가 별칭이 맞은 페이지보다 앞이고, 제목이 같으면 그 말을 풀이하는 위키 페이지가
  // 그 말로 묶은 태그 목록보다 앞이다.
  const exactMatches = (query: string): number[] => {
    const key = exactKey(query)
    if (key === "") return []
    const byKind = (ids: number[]) =>
      ids.sort((a, b) => kindRank(pages[a].slug) - kindRank(pages[b].slug))
    const titleIds = pages.flatMap((page, id) => (exactKey(page.title) === key ? [id] : []))
    const aliasIds = pages.flatMap((page, id) =>
      page.aliases.some((alias) => exactKey(alias) === key) ? [id] : [],
    )
    return [...byKind(titleIds), ...byKind(aliasIds)]
  }

  return {
    async add(newPages: SearchPage[]) {
      for (const page of newPages) {
        const id = pages.length
        pages.push(page)
        await index.addAsync(id, { id, ...page, aliases: page.aliases.join("\n") })
      }
    },

    // 결과 순서는 정확히 맞는 페이지, 나머지 위키 페이지와 태그 페이지(FlexSearch 순서), 최신부터의 호다.
    // tags를 주면 그 태그를 모두 단 페이지만 남긴다. 검색어 없이 tags만 주면 태그 필드에서 찾는다.
    async search(query: string, tags: string[]): Promise<string[]> {
      if (query === "" && tags.length === 0) return []
      // 호를 뒤로 밀고도 결과 칸을 위키 페이지로 채울 수 있게, FlexSearch에서는 맞는 페이지를 모두 받는다.
      const fieldResults = await index.searchAsync({
        query: query || tags[0],
        limit: Math.max(pages.length, 1),
        index: query ? ["title", "aliases", "content"] : ["tags"],
      })
      const byField = (field: string) =>
        (fieldResults.find((x) => x.field === field)?.result ?? []) as number[]
      const flexIds = fieldPriority.flatMap(byField)

      const exact = exactMatches(query)
      const notExact = [...new Set(flexIds)].filter((id) => !exact.includes(id))
      const newsIssues = notExact.filter((id) => isNewsIssue(pages[id].slug))
      newsIssues.sort((a, b) => (pages[a].slug < pages[b].slug ? 1 : -1))
      const wikiAndTags = notExact.filter((id) => !isNewsIssue(pages[id].slug))
      const ids = [...exact, ...wikiAndTags, ...newsIssues]

      const hasTags = (page: SearchPage) =>
        tags.every((tag) => page.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
      return ids
        .map((id) => pages[id])
        .filter(hasTags)
        .slice(0, numSearchResults)
        .map((page) => page.slug)
    },
  }
}
