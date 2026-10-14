import test, { describe } from "node:test"
import assert from "node:assert"
import type { QuartzPluginData } from "../../quartz/plugins/vfile"
import { newsItems, rss, siteItems, weekClose } from "./index"

// 빌드가 넘기는 파일 데이터의 꼴만 흉내 낸다. 날짜는 created-modified-date가 두는 dates와 defaultDateType이다.
const page = (slug: string, title: string, modified: string, extra = {}) =>
  ({
    slug,
    frontmatter: { title },
    description: `${title} 설명`,
    defaultDateType: "modified",
    dates: { modified: new Date(modified) },
    ...extra,
  }) as unknown as QuartzPluginData

const issue = (week: string, end: string, modified: string) =>
  page(`news/${week}`, `${week} 호`, modified, {
    weeklyNews: { week, items: [], period: { start: "", end } },
  })

const files = [
  page("can", "CAN", "2026-10-01T00:00:00Z"),
  page("tsn", "TSN", "2026-10-03T00:00:00Z"),
  page("news/index", "주간 소식", "2026-10-13T00:00:00Z"),
  issue("2026-w40", "2026-10-04", "2026-10-14T00:00:00Z"),
  issue("2026-w41", "2026-10-11", "2026-10-12T00:00:00Z"),
  issue("2025-w52", "2025-12-28", "2026-10-13T00:00:00Z"),
  page("draft", "숨긴 쪽", "2026-10-05T00:00:00Z", { unlisted: true }),
]

describe("weekClose", () => {
  test("기간이 끝난 시각, 곧 다음 주 월요일 00:00 KST", () => {
    assert.strictEqual(weekClose("2026-10-11"), "Mon, 12 Oct 2026 00:00:00 +0900")
    // 해와 달을 넘긴다
    assert.strictEqual(weekClose("2026-01-04"), "Mon, 05 Jan 2026 00:00:00 +0900")
    assert.strictEqual(weekClose("2027-01-03"), "Mon, 04 Jan 2027 00:00:00 +0900")
  })
})

describe("siteItems", () => {
  test("호와 지난 호 목록, 목록에서 뺀 쪽을 빼고 최근에 고친 쪽부터 준다", () => {
    assert.deepStrictEqual(
      siteItems(files, "ash-wiki.pages.dev", 10).map((item) => [item.title, item.link]),
      [
        ["TSN", "https://ash-wiki.pages.dev/tsn"],
        ["CAN", "https://ash-wiki.pages.dev/can"],
      ],
    )
  })

  test("항목 수를 limit에서 자르고, 날짜는 고친 날의 UTC다", () => {
    assert.deepStrictEqual(siteItems(files, "ash-wiki.pages.dev", 1), [
      {
        title: "TSN",
        link: "https://ash-wiki.pages.dev/tsn",
        description: "TSN 설명",
        pubDate: "Sat, 03 Oct 2026 00:00:00 GMT",
      },
    ])
  })
})

describe("newsItems", () => {
  test("호만 주차 역순으로 주고, 날짜는 고친 날이 아니라 기간이 끝난 시각이다", () => {
    assert.deepStrictEqual(newsItems(files, "ash-wiki.pages.dev", 20), [
      {
        title: "2026-w41 호",
        link: "https://ash-wiki.pages.dev/news/2026-w41",
        description: "2026-w41 호 설명",
        pubDate: "Mon, 12 Oct 2026 00:00:00 +0900",
      },
      {
        title: "2026-w40 호",
        link: "https://ash-wiki.pages.dev/news/2026-w40",
        description: "2026-w40 호 설명",
        pubDate: "Mon, 05 Oct 2026 00:00:00 +0900",
      },
      {
        title: "2025-w52 호",
        link: "https://ash-wiki.pages.dev/news/2025-w52",
        description: "2025-w52 호 설명",
        pubDate: "Mon, 29 Dec 2025 00:00:00 +0900",
      },
    ])
  })

  test("최근 호부터 limit까지만 담는다", () => {
    assert.deepStrictEqual(
      newsItems(files, "ash-wiki.pages.dev", 2).map((item) => item.title),
      ["2026-w41 호", "2026-w40 호"],
    )
  })
})

describe("rss", () => {
  test("RSS 2.0 채널에 항목을 담고, 제목은 이스케이프하며 설명은 CDATA에 둔다", () => {
    const xml = rss({ title: "A & B", link: "https://example.com", description: "최근 쪽" }, [
      {
        title: "<제목>",
        link: "https://example.com/a",
        description: "설명 &amp; 요약",
        pubDate: "Mon, 12 Oct 2026 00:00:00 +0900",
      },
    ])
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8" \?>\n<rss version="2\.0">/)
    assert.match(
      xml,
      /<channel>\s*<title>A &amp; B<\/title>\s*<link>https:\/\/example\.com<\/link>/,
    )
    assert.match(xml, /<item>\s*<title>&lt;제목&gt;<\/title>/)
    assert.match(xml, /<guid>https:\/\/example\.com\/a<\/guid>/)
    assert.match(xml, /<description><!\[CDATA\[ 설명 &amp; 요약 \]\]><\/description>/)
    assert.match(xml, /<pubDate>Mon, 12 Oct 2026 00:00:00 \+0900<\/pubDate>/)
    assert.doesNotMatch(xml, /<img|<enclosure/)
  })
})
