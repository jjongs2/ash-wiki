import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"
import { getFontSpecificationNames, type Theme } from "../quartz/util/theme"
import { repoRoot } from "./repo"

// OG 이미지 생성기(@quartz-community/og-image)는 theme.typography의 header(700), body(400)를
// Google Fonts에서 받고, 받기 전에 quartz/.quartz-cache/fonts/<이름>-<굵기>를 먼저 읽는다. 생성기는 한 번 받은
// 파일을 다시 받지 않아, Google Fonts가 판을 올리면 웹과 다른 판을 계속 쓴다. 그래서 여기서 웹과 같은 css2 API로
// 지금 판의 TTF 주소를 얻고, 캐시의 파일이 다른 주소에서 받은 것이면 새로 받는다. 주소에 판(v23 등)이 들어 있다.
// css2 API는 굵기 하나를 고정한 TTF를 준다. 가변 폰트(IBM Plex Sans)도 그렇다.
export const cacheDir = path.join(repoRoot, "quartz", ".quartz-cache", "fonts")
const configPath = path.join(repoRoot, "quartz.config.yaml")
const ogWeights = { header: 700, body: 400 } as const

// 캐시의 파일 이름이다. 생성기의 fetchTtf가 같은 이름을 읽는다.
export function cachedFontFile(name: string, weight: number): string {
  return `${name.replaceAll(" ", "+")}-${weight}`
}

export function readTheme(): Theme {
  return parse(fs.readFileSync(configPath, "utf8")).configuration.theme
}

export async function ensureOgFonts(): Promise<void> {
  const typography = readTheme().typography
  await Promise.all(
    Object.entries(ogWeights).map(([role, weight]) =>
      ensureGoogleFonts(getFontSpecificationNames(typography[role as keyof typeof ogWeights]), [
        weight,
      ]),
    ),
  )
}

// 콘텐츠 검사기의 도해 여백 측정(tools/check-content/diagram-margin.ts)도 여기서 받은 파일을 쓴다.
// 주소를 묻지 못하면(오프라인) 캐시에 파일이 모두 있을 때만 그것으로 넘어간다.
export async function ensureGoogleFonts(names: string[], weights: number[]): Promise<void> {
  fs.mkdirSync(cacheDir, { recursive: true })
  for (const name of names) {
    const target = (weight: number) => path.join(cacheDir, cachedFontFile(name, weight))
    let urls: Map<number, string>
    try {
      urls = await ttfUrls(name, weights)
    } catch (error) {
      if (weights.every((weight) => fs.existsSync(target(weight)))) {
        console.warn(`${name}: 판을 확인하지 못해 캐시의 폰트를 쓴다(${(error as Error).message})`)
        continue
      }
      throw error
    }
    for (const weight of weights) {
      const url = urls.get(weight)
      if (url === undefined)
        throw new Error(`${name} ${weight}: Google Fonts가 TTF 주소를 주지 않았다`)
      const stamp = `${target(weight)}.url`
      const cached =
        fs.existsSync(target(weight)) &&
        fs.existsSync(stamp) &&
        fs.readFileSync(stamp, "utf8") === url
      if (cached) continue
      const response = await fetch(url)
      if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
      fs.writeFileSync(target(weight), Buffer.from(await response.arrayBuffer()))
      fs.writeFileSync(stamp, url)
    }
  }
}

// User-Agent를 주지 않으면 css2 API가 woff2 대신 TTF 주소를 준다. 생성기도 그렇게 받는다.
async function ttfUrls(name: string, weights: number[]): Promise<Map<number, string>> {
  const family = name.replaceAll(" ", "+")
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${weights.join(";")}`
  const response = await fetch(cssUrl)
  if (!response.ok) throw new Error(`${cssUrl}: HTTP ${response.status}`)
  const css = await response.text()
  const urls = new Map<number, string>()
  for (const face of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
    const weight = face[1].match(/font-weight:\s*(\d+)/)?.[1]
    const url = face[1].match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/)?.[1]
    if (weight !== undefined && url !== undefined) urls.set(Number(weight), url)
  }
  return urls
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await ensureOgFonts()
}
