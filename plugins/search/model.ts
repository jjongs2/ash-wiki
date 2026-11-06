// ash-wiki: 검색의 찾기, 맞춤, 결과 순서, 강조할 자리를 맡는 모듈이다. 클라이언트 스크립트(script.ts)가
// contentIndex의 페이지를 넣고, 테스트(model.test.ts)가 seam으로 본다. 스크립트는 esbuild로 이 파일과
// FlexSearch를 묶어 브라우저에 싣는다(index.ts).
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

// 글자·숫자·결합 문자가 아닌 문자다. 맞춤에서는 이 문자를 "공백과 문장부호"로 본다. 결합 문자(\p{M})를
// 구분자로 보면 분해된 글자가 둘로 갈린다.
const separator = /[^\p{L}\p{N}\p{M}]/u

const stripSeparators = (str: string) => str.replace(new RegExp(separator, "gu"), "")

// 태그 검색에만 쓰는 인코더다. 업스트림은 공백에서만 끊어 network/can의 can을 찾지 못한다
// (quartz-community/search#1). 텍스트 검색은 FlexSearch를 쓰지 않는다(아래 textSearch).
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

const fold = (str: string) => str.normalize("NFC").toLowerCase()

// 정확히 맞는지 견주는 꼴이다. 공백과 문장부호를 지워 수용필터가 수용 필터에, someip가 SOME/IP에 맞는다.
const exactKey = (str: string) => stripSeparators(fold(str))

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// 검색어의 낱말 하나를 맞히는 패턴이다. 낱말은 첫머리에서 시작해 글자 사이에 공백과 문장부호만 끼어
// 있으면 맞는다(수용필터와 수용 필터, someip와 SOME/IP). 첫머리는 문장부호를 뺀 첫 글자가 한글인 낱말이면
// 앞이 글자·숫자·결합 문자가 아닌 자리라 연방이 지연 방식에 맞지 않고, 그 밖의 낱말이면 앞이 영문자·숫자가
// 아닌 자리라 ecu가 execution에 맞지 않는다. 한글 낱말은 그대로 있으면 어디서든 맞는다(사이버보안의 보안).
const wordPattern = (word: string): RegExp => {
  const chars = [...stripSeparators(word)]
  const spaced = chars.map(escapeRegExp).join(`${separator.source}*`)
  if (/\p{Script=Hangul}/u.test(chars[0])) {
    return new RegExp(`(?<![\\p{L}\\p{N}\\p{M}])${spaced}|${escapeRegExp(word)}`, "gu")
  }
  return new RegExp(`(?<![\\p{Script=Latin}\\p{N}])${spaced}`, "gu")
}

// 검색어를 공백으로 끊은 낱말이다. 문장부호만으로 된 낱말은 맞출 글자가 없어 뺀다.
const queryWords = (query: string): string[] =>
  [...new Set(fold(query).split(/\s+/))].filter((word) => stripSeparators(word) !== "")

const countMatches = (pattern: RegExp, text: string) => {
  let count = 0
  pattern.lastIndex = 0
  while (pattern.exec(text) !== null) count++
  return count
}

const hasMatch = (pattern: RegExp, text: string) => {
  pattern.lastIndex = 0
  return pattern.test(text)
}

// 강조할 자리다. 검색어의 낱말마다 맞춤 규칙이 text에서 맞힌 [시작, 끝) 범위를 겹치지 않게 앞에서부터
// 돌려준다. 범위는 text의 위치다. 정규화하면 위치가 어긋나서 대소문자만 접어 견준다. 사이트의 글은
// NFC라 검색과 같은 자리를 맞힌다.
export function highlightRanges(query: string, text: string): [number, number][] {
  const words = queryWords(query)
  if (words.length === 0 || text === "") return []
  // 소문자로 바꾸면 길이가 바뀌는 글자(İ)가 있어, 접은 글의 위치마다 원래 위치를 적어 둔다.
  let folded = ""
  const origin: number[] = []
  for (let i = 0; i < text.length;) {
    const char = String.fromCodePoint(text.codePointAt(i)!)
    const lower = char.toLowerCase()
    for (let j = 0; j < lower.length; j++) origin.push(i)
    folded += lower
    i += char.length
  }
  origin.push(text.length)

  const ranges: [number, number][] = []
  for (const word of words) {
    const pattern = wordPattern(word)
    let match: RegExpExecArray | null
    while ((match = pattern.exec(folded)) !== null) {
      ranges.push([origin[match.index], origin[match.index + match[0].length]])
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1])
  const merged: [number, number][] = []
  for (const range of ranges) {
    const last = merged[merged.length - 1]
    if (last && range[0] < last[1]) last[1] = Math.max(last[1], range[1])
    else merged.push([...range])
  }
  return merged
}

// 주간 소식의 호(news/<연도>-w<주차>)다. 검증하지 않은 요약이라, 검증된 위키 페이지와 섞어 읽지 않게 뒤로
// 민다(ADR 0015). 호는 매주 늘어 그대로 두면 결과 칸을 차지한다.
const isNewsIssue = (slug: string) => /^news\/\d{4}-w\d{2}$/.test(slug)

// 페이지 갈래의 순서다. 위키 페이지, 태그 목록, 호 순이다.
const kindRank = (slug: string) => (isNewsIssue(slug) ? 2 : slug.startsWith("tags/") ? 1 : 0)

// 본문 점수(BM25)의 포화 매개변수다. 길이로 깎지 않아(b = 0, 까닭은 docs/engine.md의 검색 절) 식에 문서
// 길이가 없다.
const k1 = 1.2

// 최신 주차부터 둔다. 호의 slug는 주차 순으로 정렬된다(news/2026-w09 < news/2026-w10).
const newestFirst = (a: string, b: string) => (a < b ? 1 : a > b ? -1 : 0)

// 정확히 맞는 페이지 다음의 결과 무리다. 작은 값이 앞이다.
const Group = {
  AllInTitle: 0,
  AllInAliases: 1,
  All: 2,
  SomeWiki: 3,
  AllNews: 4,
  SomeNews: 5,
} as const

// NFC 정규화하고 소문자화한 페이지 글이다. 키를 칠 때마다 만들면 휴대폰에서 판정 시간의 절반을 먹어서,
// 페이지를 넣을 때 한 번 만든다. titleKey와 aliasKeys는 정확히 맞는지 견주는 꼴(exactKey)이다.
interface FoldedPage {
  title: string
  aliases: string[]
  content: string
  titleKey: string
  aliasKeys: string[]
}

export function createSearchIndex() {
  // FlexSearch는 검색어 없이 태그로만 찾을 때만 쓴다.
  const tagIndex = new FlexSearch.Document({
    encode: encoder,
    document: {
      id: "id",
      tag: "tags",
      index: [{ field: "tags", tokenize: "forward" }],
    },
  })
  const pages: SearchPage[] = []
  const folded: FoldedPage[] = []

  // 검색어와 제목·별칭이 정확히 맞는 페이지다. 낱말을 담는지와 상관없이 낸다("100 base t1"의 base는
  // 숫자 뒤라 100BASE-T1에 맞지 않는다). 제목이 맞은 페이지가 별칭이 맞은 페이지보다 앞이고, 제목이 같으면
  // 그 말을 풀이하는 위키 페이지가 그 말로 묶은 태그 목록보다 앞이다.
  const exactMatches = (query: string): number[] => {
    const key = exactKey(query)
    if (key === "") return []
    const byKind = (ids: number[]) =>
      ids.sort((a, b) => kindRank(pages[a].slug) - kindRank(pages[b].slug))
    const titleIds = folded.flatMap((page, id) => (page.titleKey === key ? [id] : []))
    const aliasIds = folded.flatMap((page, id) => (page.aliasKeys.includes(key) ? [id] : []))
    // 제목과 별칭이 함께 맞는 페이지(ASPICE, 별칭 A-SPICE)는 제목 쪽에 한 번만 둔다.
    return [...new Set([...byKind(titleIds), ...byKind(aliasIds)])]
  }

  // 정확히 맞는 페이지 다음의 무리다. 이 순서로 둔다.
  //   - 낱말을 모두 담은 위키·태그 페이지: 모두 제목에 있는 페이지, 모두 별칭에 있는 페이지, 나머지.
  //     각 무리 안에서는 본문의 BM25 점수 순이다.
  //   - 낱말을 일부만 담은 위키·태그 페이지: 담은 낱말 수가 많은 순, 같으면 BM25 점수 순이다.
  //   - 낱말을 모두 담은 호, 일부만 담은 호: 각각 최신 주차부터다.
  const groupOf = (slug: string, hit: { inTitle: boolean[]; inAlias: boolean[]; all: boolean }) => {
    if (isNewsIssue(slug)) return hit.all ? Group.AllNews : Group.SomeNews
    if (!hit.all) return Group.SomeWiki
    if (hit.inTitle.every(Boolean)) return Group.AllInTitle
    if (hit.inAlias.every(Boolean)) return Group.AllInAliases
    return Group.All
  }

  // 텍스트 검색의 결과 순서다. 모든 페이지의 제목·별칭·본문을 훑는다. 낱말은 한 필드 안에서 맞아야 하고,
  // 낱말끼리는 다른 필드에 있어도 된다. 정확히 맞는 페이지를 맨 앞에 두고, 나머지는 groupOf의 무리 순이다.
  // 낱말을 하나도 담지 않은 페이지는 내지 않는다. 동점은 넣은 순서다.
  const textSearch = (query: string): number[] => {
    const words = queryWords(query)
    const patterns = words.map(wordPattern)
    const n = pages.length
    const df = words.map(() => 0)
    const hits = folded.map((page) => {
      const inTitle = patterns.map((p) => hasMatch(p, page.title))
      const inAlias = patterns.map((p) => page.aliases.some((alias) => hasMatch(p, alias)))
      const tf = patterns.map((p) => countMatches(p, page.content))
      const has = words.map((_, w) => inTitle[w] || inAlias[w] || tf[w] > 0)
      has.forEach((h, w) => h && df[w]++)
      return { inTitle, inAlias, tf, matched: has.filter(Boolean).length }
    })
    const idf = df.map((d) => Math.log(1 + (n - d + 0.5) / (d + 0.5)))

    const exact = exactMatches(query)
    const ranked = hits.flatMap((hit, id) => {
      if (hit.matched === 0 || exact.includes(id)) return []
      const group = groupOf(pages[id].slug, { ...hit, all: hit.matched === words.length })
      const score = hit.tf.reduce((sum, tf, w) => sum + (idf[w] * tf * (k1 + 1)) / (tf + k1), 0)
      return [{ id, group, matched: hit.matched, score }]
    })
    ranked.sort((a, b) => {
      if (a.group !== b.group) return a.group - b.group
      if (a.group >= Group.AllNews) return newestFirst(pages[a.id].slug, pages[b.id].slug)
      return b.matched - a.matched || b.score - a.score || a.id - b.id
    })
    return [...exact, ...ranked.map((r) => r.id)]
  }

  // 검색어 없이 태그로만 찾을 때의 순서다. 위키·태그 페이지를 FlexSearch 순서로 두고, 최신부터의 호를 뒤에
  // 둔다.
  const tagSearch = async (tag: string): Promise<number[]> => {
    const fieldResults = await tagIndex.searchAsync({
      query: tag,
      limit: Math.max(pages.length, 1),
      index: ["tags"],
    })
    const ids = [...new Set(fieldResults.flatMap((x) => x.result as number[]))]
    const newsIssues = ids.filter((id) => isNewsIssue(pages[id].slug))
    newsIssues.sort((a, b) => newestFirst(pages[a].slug, pages[b].slug))
    return [...ids.filter((id) => !isNewsIssue(pages[id].slug)), ...newsIssues]
  }

  return {
    async add(newPages: SearchPage[]) {
      for (const page of newPages) {
        const id = pages.length
        pages.push(page)
        const title = fold(page.title)
        const aliases = page.aliases.map(fold)
        folded.push({
          title,
          aliases,
          content: fold(page.content),
          titleKey: stripSeparators(title),
          aliasKeys: aliases.map(stripSeparators),
        })
        await tagIndex.addAsync(id, { id, tags: page.tags })
      }
    },

    // tags를 주면 그 태그를 모두 단 페이지만 남긴다. 검색어 없이 tags만 주면 태그 필드에서 찾는다.
    async search(query: string, tags: string[]): Promise<string[]> {
      if (query === "" && tags.length === 0) return []
      const ids = query ? textSearch(query) : await tagSearch(tags[0])
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
