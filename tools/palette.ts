import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"
import { Conventions, loadConventions } from "./check-content/conventions"
import { repoRoot } from "./repo"

// 대비 실측. 색의 정본(quartz.config.yaml의 theme, 규약 문서의 도해 팔레트)을 읽어
// 팔레트 문서의 대비 하한 표를 두 테마에서 재고, 하한에 못 미치면 exit 1로 끝난다.
// 사용: npm run palette
const palettePath = path.join(repoRoot, "docs", "palette.md")
const configPath = path.join(repoRoot, "quartz.config.yaml")

type Rgba = [number, number, number, number]
type Mode = "lightMode" | "darkMode"

function parseColor(value: string): Rgba {
  const rgba = value.match(/^rgba?\(([^)]+)\)$/)
  if (rgba) {
    const [r, g, b, a = 1] = rgba[1].split(",").map(Number)
    return [r, g, b, a]
  }
  const hex = value.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i)
  if (!hex) throw new Error(`색 값을 읽지 못했다: ${value}`)
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16))
  return [r, g, b, hex[2] ? parseInt(hex[2], 16) / 255 : 1]
}

// 반투명한 색은 아래 색 위에 합성해 불투명한 색으로 만든다.
function over([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1]
}

// WCAG 2.x 상대 휘도와 대비
function luminance([r, g, b]: Rgba): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

function contrast(a: Rgba, b: Rgba): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

interface Swatch {
  name: string
  color: string
}

interface Measurement {
  pair: string
  floor: number
  // 모드마다 가장 낮은 대비와 그 쌍. `<색>`과 `<구역>` 줄은 푼 색 가운데 가장 낮은 값을 준다.
  worst: Record<Mode, { ratio: number; swatches: string }>
}

// 도해 팔레트 표에서 모드마다 값을 읽는 열
const diagramColumn: Record<Mode, string> = { lightMode: "라이트", darkMode: "다크" }
// 대비 하한 표에서 여러 색으로 푸는 자리. 한 줄의 두 칸에 모두 있으면 같은 색끼리 짝짓는다.
// `<색>`은 도해의 범주 색 다섯, `<구역>`은 theme의 구역 색(region-<구역>과 region-other)이다.
const category = "<색>"
const region = "<구역>"
// 반투명한 배경을 합성할 면. 사이드바 면의 토큰(`sidebar-`)은 사이드바 면 위에, 나머지는 페이지 위에 놓인다.
const backdrop = (token: string) => (token.startsWith("sidebar-") ? "sidebar-light" : "light")

function measure(): Measurement[] {
  const theme = parse(fs.readFileSync(configPath, "utf8")).configuration.theme
  const colors = theme.colors as Record<Mode, Record<string, string>>
  const diagram = loadConventions().table("diagram-palette", ["이름", "라이트", "다크"])
  const floors = new Conventions(fs.readFileSync(palettePath, "utf8"), palettePath).table(
    "contrast",
    ["쌍", "전경", "배경", "하한"],
  )
  // 범주 색은 `<색>-tint` 짝이 있는 이름이다.
  const names = new Set(diagram.map((row) => row["이름"]))
  const categories = [...names].filter((name) => names.has(`${name}-tint`))
  const regions = Object.keys(colors.lightMode).filter((token) => token.startsWith("region-"))
  // 도해 팔레트의 이름이면 그 모드의 값(hex나 theme 색 토큰), 아니면 theme 색 토큰이다. `<토큰> 12%`처럼
  // 뒤에 퍼센트를 붙이면 그 색을 그 불투명도로 깐 것이다(CSS의 color-mix(in srgb, <색> 12%, transparent)).
  const resolve = (token: string, mode: Mode): Swatch => {
    const [, name, percent] = token.match(/^(.+?)(?: (\d+)%)?$/)!
    const value = diagram.find((row) => row["이름"] === name)?.[diagramColumn[mode]] ?? name
    const hex = value.startsWith("#") ? value : colors[mode][value]
    if (!hex) throw new Error(`${palettePath}: 색 토큰 "${value}"이 없다`)
    if (!percent) return { name: token, color: hex }
    const [r, g, b] = parseColor(hex)
    return { name: token, color: `rgba(${r}, ${g}, ${b}, ${Number(percent) / 100})` }
  }
  const pairs = (fg: string, bg: string): [string, string][] => {
    for (const [slot, names] of [
      [category, categories],
      [region, regions],
    ] as const) {
      if (fg.includes(slot) || bg.includes(slot))
        return names.map((name) => [fg.replace(slot, name), bg.replace(slot, name)])
    }
    return [[fg, bg]]
  }
  return floors.map((row) => {
    const floor = Number(row["하한"])
    if (!(floor > 0))
      throw new Error(`${palettePath}: "${row["쌍"]}"의 하한이 수가 아니다: ${row["하한"]}`)
    const worst = {} as Measurement["worst"]
    for (const mode of ["lightMode", "darkMode"] as Mode[]) {
      let result = { ratio: Infinity, swatches: "" }
      for (const [fgToken, bgToken] of pairs(row["전경"], row["배경"])) {
        const [fg, bg] = [resolve(fgToken, mode), resolve(bgToken, mode)]
        const base = parseColor(colors[mode][backdrop(bgToken)])
        const background = over(parseColor(bg.color), base)
        const ratio = contrast(over(parseColor(fg.color), background), background)
        if (ratio < result.ratio) result = { ratio, swatches: `${fg.name} / ${bg.name}` }
      }
      worst[mode] = result
    }
    return { pair: row["쌍"], floor, worst }
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const measurements = measure()
  const cell = ({ ratio }: { ratio: number }) => `${ratio.toFixed(2)}:1`
  console.log("| 쌍 | 하한 | 라이트 | 다크 | 가장 낮은 쌍(라이트, 다크) |")
  console.log("| --- | --- | --- | --- | --- |")
  for (const m of measurements) {
    const { lightMode, darkMode } = m.worst
    const swatches =
      lightMode.swatches === darkMode.swatches
        ? lightMode.swatches
        : `${lightMode.swatches}, ${darkMode.swatches}`
    console.log(
      `| ${m.pair} | ${m.floor}:1 | ${cell(lightMode)} | ${cell(darkMode)} | ${swatches} |`,
    )
  }
  const failed = measurements.filter((m) =>
    Object.values(m.worst).some(({ ratio }) => ratio < m.floor),
  )
  for (const m of failed) console.error(`FAIL ${m.pair}: 하한 ${m.floor}:1에 못 미친다`)
  process.exitCode = failed.length > 0 ? 1 : 0
}
