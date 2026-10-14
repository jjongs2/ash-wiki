// ash-wiki: 사이트 피드(index.xml)와 주간 소식 피드(news/index.xml)를 내는 로컬 emitter다. content-index의 RSS는
// 끄고(quartz.config.yaml) 그 피드를 여기서 같은 꼴로 낸다. 사이트 피드에서 호와 지난 호 목록(news/ 아래)을
// 빼기 위해서다. 검증하지 않은 요약을 위키 페이지와 섞어 읽지 않게 한다는 ADR 0015의 취지이고, 호는 검색에
// 남아야 하므로 unlisted로 뺄 수 없다. 두 피드에 무엇이 담기는지는 docs/weekly-news.md에 있다.
//
// 호의 데이터(weeklyNews)와 설명(description)은 weekly-news 플러그인이 둔다. 플러그인끼리는 타입만 가져올 수
// 있어(plugins/front-page의 칩 주석) 그 데이터만 읽는다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다.
import fs from "node:fs/promises"
import path from "node:path"
import { h } from "preact"
import { escapeHTML, getDate, joinSegments, simplifySlug } from "@quartz-community/utils"
import type { QuartzPluginData } from "../../quartz/plugins/vfile"
import type { WeeklyNewsData } from "../weekly-news/index"

export const manifest = {
  name: "feeds",
  displayName: "Feeds",
  description: "사이트 피드와 주간 소식 피드를 낸다",
  version: "1.0.0",
  category: "emitter",
}

// 사이트 피드는 content-index의 기본값(rssLimit 10)을 그대로 두고, 주간 소식 피드는 최근 20호까지다
const SITE_LIMIT = 10
const NEWS_LIMIT = 20
const NEWS_PREFIX = "news/"
// 지난 호 목록의 슬러그와, 주간 소식 피드 파일의 경로(.xml을 뺀 것). 지난 호 목록의 RSS 링크
// (plugins/weekly-news의 indexTree)도 이 경로를 쓴다.
const NEWS_INDEX = "news/index"
const NEWS_FEED = "news/index"
// 주간 소식 피드의 이름. 지난 호 목록의 제목과 같다
const NEWS_TITLE = "주간 소식"

export interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: string
}

export interface FeedChannel {
  title: string
  link: string
  description: string
}

const pageUrl = (baseUrl: string, slug: string) =>
  `https://${joinSegments(baseUrl, encodeURI(simplifySlug(slug as never)))}`

const isNews = (file: QuartzPluginData) => String(file.slug ?? "").startsWith(NEWS_PREFIX)
const newsOf = (file: QuartzPluginData) => file.weeklyNews as WeeklyNewsData | undefined

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * 호가 다루는 기간이 끝난 시각. end(일요일, YYYY-MM-DD) 다음 날 00:00 KST를 RSS의 날짜 꼴(RFC 822)로 쓴다.
 * 고친 날이 아닌 까닭은 docs/weekly-news.md에 있다.
 */
export function weekClose(end: string): string {
  const day = new Date(`${end}T00:00:00Z`)
  day.setUTCDate(day.getUTCDate() + 1)
  const dd = String(day.getUTCDate()).padStart(2, "0")
  return `${DAYS[day.getUTCDay()]}, ${dd} ${MONTHS[day.getUTCMonth()]} ${day.getUTCFullYear()} 00:00:00 +0900`
}

/**
 * 사이트 피드의 항목. content-index의 피드와 같은 규칙이다. 목록에서 뺀 쪽(unlisted)을 빼고, 날짜(기본 날짜
 * 종류, 없으면 지금)가 늦은 쪽부터 limit까지 둔다. 여기에 더해 news/ 아래를 뺀다.
 */
export function siteItems(files: QuartzPluginData[], baseUrl: string, limit: number): FeedItem[] {
  const now = new Date()
  return files
    .filter((file) => file.unlisted !== true && !isNews(file))
    .map((file) => ({ file, date: (getDate(file as never) as Date | undefined) ?? now }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
    .map(({ file, date }) => ({
      title: String(file.frontmatter?.title ?? ""),
      link: pageUrl(baseUrl, file.slug!),
      description: String(file.description ?? ""),
      pubDate: date.toUTCString(),
    }))
}

/** 주간 소식 피드의 항목. 호 하나가 항목 하나이고, 최근 호부터 limit까지 둔다. */
export function newsItems(files: QuartzPluginData[], baseUrl: string, limit: number): FeedItem[] {
  return files
    .filter((file) => isNews(file) && newsOf(file))
    .sort((a, b) => newsOf(b)!.week.localeCompare(newsOf(a)!.week))
    .slice(0, limit)
    .map((file) => ({
      title: String(file.frontmatter?.title ?? ""),
      link: pageUrl(baseUrl, file.slug!),
      description: String(file.description ?? ""),
      pubDate: weekClose(newsOf(file)!.period.end),
    }))
}

/**
 * RSS 2.0 문서. content-index의 피드와 같은 꼴이다. 제목은 이스케이프하고, 설명은 이미 이스케이프된 글이라
 * CDATA에 그대로 둔다. 원문 이미지는 담지 않는다.
 */
export function rss(channel: FeedChannel, items: FeedItem[]): string {
  const entries = items
    .map(
      (item) => `<item>
    <title>${escapeHTML(item.title)}</title>
    <link>${item.link}</link>
    <guid>${item.link}</guid>
    <description><![CDATA[ ${item.description} ]]></description>
    <pubDate>${item.pubDate}</pubDate>
  </item>`,
    )
    .join("")
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
      <title>${escapeHTML(channel.title)}</title>
      <link>${channel.link}</link>
      <description>${channel.description}</description>
      <generator>Quartz -- quartz.jzhao.xyz</generator>
      ${entries}
    </channel>
  </rss>`
}

interface EmitContext {
  argv: { output: string }
  cfg: { configuration: { baseUrl?: string; pageTitle?: string; pageTitleSuffix?: string } }
}

async function emitFeeds(ctx: EmitContext, content: [unknown, { data: unknown }][]) {
  const { baseUrl = "", pageTitle = "", pageTitleSuffix = "" } = ctx.cfg.configuration
  const files = content.map(([, file]) => file.data as QuartzPluginData)
  const newsIndex = files.find((file) => file.slug === NEWS_INDEX)
  const feeds: [string, string][] = [
    [
      "index",
      rss(
        {
          title: pageTitle,
          link: `https://${baseUrl}`,
          description: `Last ${SITE_LIMIT} notes on ${escapeHTML(pageTitle)}`,
        },
        siteItems(files, baseUrl, SITE_LIMIT),
      ),
    ],
    [
      NEWS_FEED,
      rss(
        {
          title: `${NEWS_TITLE}${pageTitleSuffix}`,
          link: pageUrl(baseUrl, NEWS_INDEX),
          description: String(newsIndex?.description ?? ""),
        },
        newsItems(files, baseUrl, NEWS_LIMIT),
      ),
    ],
  ]
  const written: string[] = []
  for (const [slug, xml] of feeds) {
    const file = path.join(ctx.argv.output, `${slug}.xml`)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, xml)
    written.push(file)
  }
  return written
}

const Feeds = () => ({
  name: "Feeds",
  emit: emitFeeds,
  partialEmit: emitFeeds,
  // 호와 지난 호 목록의 <head>에 주간 소식 피드를 알린다
  externalResources(ctx: EmitContext) {
    const { baseUrl = "", pageTitleSuffix = "" } = ctx.cfg.configuration
    return {
      additionalHead: [
        (data: QuartzPluginData) =>
          isNews(data)
            ? h("link", {
                rel: "alternate",
                type: "application/rss+xml",
                title: `${NEWS_TITLE}${pageTitleSuffix}`,
                href: `https://${joinSegments(baseUrl, `${NEWS_FEED}.xml`)}`,
              })
            : null,
      ],
    }
  },
})

export default Feeds
