import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"
import { Conventions, loadConventions } from "./check-content/conventions"
import { repoRoot } from "./repo"

// 대비 실측. 색의 정본(quartz.config.yaml의 theme, 규약 문서의 도해 팔레트)을 읽어
// 팔레트 문서의 대비 하한 표를 두 테마에서 재고, 하한에 못 미치면 exit 1로 끝난다.
// 사용: npm run palette
export const palettePath = path.join(repoRoot, "docs", "palette.md")
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
  foreground: string
  background: string
  floor: number
  // 모드마다 가장 낮은 대비와 그 쌍. 도해 색 묶음은 묶음 안의 가장 낮은 값을 준다.
  worst: Record<Mode, { ratio: number; swatches: string }>
}

export function measure(): Measurement[] {
  const theme = parse(fs.readFileSync(configPath, "utf8")).configuration.theme
  const colors = theme.colors as Record<Mode, Record<string, string>>
  const diagram = loadConventions().table("diagram-palette", ["이름", "값", "종류"])
  const floors = new Conventions(fs.readFileSync(palettePath, "utf8"), palettePath).table(
    "contrast",
    ["쌍", "전경", "배경", "하한"],
  )
  // `도해 <종류>`는 도해 팔레트에서 그 종류의 색 전부, 그 밖은 theme 색 토큰 하나다.
  const resolve = (token: string, mode: Mode): Swatch[] => {
    const kind = token.match(/^도해 (\S+)$/)?.[1]
    if (kind) {
      const rows = diagram.filter((row) => row["종류"] === kind)
      if (rows.length === 0) throw new Error(`${palettePath}: 도해 팔레트에 종류 "${kind}"가 없다`)
      return rows.map((row) => ({ name: row["이름"], color: row["값"] }))
    }
    const color = colors[mode][token]
    if (!color) throw new Error(`${palettePath}: theme 색 토큰 "${token}"이 없다`)
    return [{ name: token, color }]
  }
  return floors.map((row) => {
    const worst = {} as Measurement["worst"]
    for (const mode of ["lightMode", "darkMode"] as Mode[]) {
      const page = parseColor(colors[mode].light)
      let result = { ratio: Infinity, swatches: "" }
      for (const bg of resolve(row["배경"], mode)) {
        const background = over(parseColor(bg.color), page)
        for (const fg of resolve(row["전경"], mode)) {
          const ratio = contrast(over(parseColor(fg.color), background), background)
          if (ratio < result.ratio) result = { ratio, swatches: `${fg.name} / ${bg.name}` }
        }
      }
      worst[mode] = result
    }
    return {
      pair: row["쌍"],
      foreground: row["전경"],
      background: row["배경"],
      floor: Number(row["하한"]),
      worst,
    }
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
