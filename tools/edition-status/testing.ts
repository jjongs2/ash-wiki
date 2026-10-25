import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  changeKey,
  type Change,
  type Channel,
  type Context,
  type Entry,
  type StandardPage,
} from "./model"
import { assign } from "./publications"

// 통로 테스트의 도우미. 통로를 seam으로 보고, 엔트리와 표준 페이지를 넣고 바뀜의 키만 본다.
// 통로의 응답은 fixtures/<통로>/의 파일로 준다.
export const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures")

let line = 1
export function entry(key: string, title: string, fields: Partial<Entry> = {}): Entry {
  return {
    key,
    type: "misc",
    title,
    publisher: "",
    file: `bib/${key}.bib`,
    line: line++,
    citedBy: new Map([["concept", 1]]),
    ...fields,
  }
}

export function page(
  name: string,
  title: string,
  publisher: string,
  edition: string,
  status = "유효",
): StandardPage {
  return { name, title, publisher, edition, status }
}

// URL마다 응답. 문자열은 fixtures/ 기준 파일 경로이고, 함수는 응답을 직접 만든다.
// 목록에 없는 URL은 404다. 물은 URL은 requested에 쌓인다. cited는 다른 통로가 맡은 엔트리까지 든 인용 전체다.
export function fixtureContext(
  routes: Record<string, string | (() => Response)>,
  cited: Entry[] = [],
): Context & {
  requested: string[]
} {
  const requested: string[] = []
  return {
    requested,
    cited,
    async fetch(url) {
      requested.push(url)
      const route = routes[url]
      if (route === undefined) return new Response("not found", { status: 404 })
      if (typeof route === "function") return route()
      return new Response(fs.readFileSync(path.join(fixtures, route)))
    },
  }
}

// 통로 하나로 엔트리와 페이지를 묶어 돌리고 바뀜의 키를 정렬해 준다.
export async function run(
  channel: Channel,
  entries: Entry[],
  pages: StandardPage[],
  context: Context,
): Promise<{ keys: string[]; changes: Change[] }> {
  const publications = assign(entries, pages, [channel]).get(channel)!
  const changes = await channel.check(publications, context)
  return { keys: changes.map(changeKey).sort(), changes }
}
