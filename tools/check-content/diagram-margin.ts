import fs from "node:fs"
import path from "node:path"
import { getFontSpecificationNames } from "../../quartz/util/theme"
import { cacheDir, ensureGoogleFonts, readTheme } from "../og-fonts"

// 도해는 사이트가 틀 가운데에 놓으므로(quartz/styles/custom.scss), 그림이 viewBox 안에서 쏠리면 틀
// 안에서도 쏠려 보인다. SVG를 래스터화해 그림이 칠한 영역을 재고, viewBox 가장자리까지의 여백을 준다.
// viewBox 밖은 그려지지 않아 사이트에서 보이지 않으므로, viewBox를 넓혀 그려 밖으로 나간 양도 함께 잰다.
//
// 도해는 글자를 본문 폰트(IBM Plex Sans와 IBM Plex Sans KR)로 그리므로(docs/wiki-diagrams.md), fontconfig도 그
// 폰트만 보게 한다. 시스템 폰트에 맡기면 한글 폰트가 없는 CI 러너(ubuntu-latest)에서 한글이 그려지지 않는다.
// 같은 폰트를 geometricPrecision으로 그리면 렌더러 차이만 남는다. main의 도해 524개에서 이 측정(librsvg)과
// Linux Chromium 156(headless shell)의 여백은 523개가 한 변에서 최대 0.25 달랐으므로, 두 변의 차는 최대 0.5
// 어긋난다(#612). 나머지 하나는 가장자리에 기울인 글자가 있는 도해로, 두 렌더러가 기울기를 다르게 합성해 1.5
// 달랐다. 위반 메시지가 원점을 0.5 단위로 반올림해 알려 주므로 그대로 옮기면 여백의 차가 0.5 남을 수 있다.
// 허용치는 둘을 더한 1보다 크게 둔다. Windows와 macOS의 브라우저에서는 재지 않았다.
export const marginTolerance = 2

// 1 viewBox 단위를 몇 픽셀로 그리는지. 가장자리를 0.25 단위로 잰다.
const scale = 4

// 여백 검사는 viewBox를 사방으로 이 비율만큼 넓혀 그린다. 이보다 멀리 나간 그림은 잡지 못한다.
// main의 도해 189개에서 넓힌 곳에 칠한 픽셀은 없었다(#208).
const overflowPadding = 0.5

export type ViewBox = [x: number, y: number, width: number, height: number]

// 음수인 변은 그림이 viewBox 밖으로 그만큼 나갔다.
interface Margins {
  left: number
  right: number
  top: number
  bottom: number
}

// 칠한 영역이나 상자의 가장자리. viewBox 좌표다.
export interface Bounds {
  left: number
  right: number
  top: number
  bottom: number
}

const fontconfigDir = path.join(path.dirname(cacheDir), "fontconfig")
const weights = [400, 700]

// 굵기는 400과 700만 받는다. 다른 굵기를 쓰는 도해는 브라우저와 글자 폭이 달라진다.
// 폰트 캐시에는 OG 이미지용 다른 폰트나 예전 폰트도 있을 수 있어, 도해 폰트만 따로 링크한 폴더를 보게 한다.
async function fontconfigFile(): Promise<string> {
  const names = getFontSpecificationNames(readTheme().typography.body)
  await ensureGoogleFonts(names, weights)
  // 검사기를 여럿 함께 돌려도(테스트) 서로의 폴더를 비우지 않도록, 링크는 없거나 다를 때만 고친다.
  const fontDir = path.join(fontconfigDir, "fonts")
  fs.mkdirSync(fontDir, { recursive: true })
  const links = new Map<string, string>(
    names.flatMap((name) =>
      weights.map((weight) => {
        const file = `${name.replaceAll(" ", "+")}-${weight}`
        return [`${file}.ttf`, path.join(cacheDir, file)] as const
      }),
    ),
  )
  for (const entry of fs.readdirSync(fontDir)) {
    if (!links.has(entry)) fs.rmSync(path.join(fontDir, entry), { force: true })
  }
  for (const [entry, target] of links) {
    const link = path.join(fontDir, entry)
    const current = fs.existsSync(link) ? fs.readlinkSync(link) : undefined
    if (current === target) continue
    fs.rmSync(link, { force: true })
    fs.symlinkSync(target, link)
  }
  const file = path.join(fontconfigDir, "fonts.conf")
  const families = names.map((name) => `<family>${name}</family>`).join("")
  // librsvg는 한 글줄에서 폰트가 바뀌면 기준선을 맞추지 못해, 라틴 글자 옆의 한글을 0.125em 올려 그린다
  // (Chromium은 맞춘다). 그래서 라틴 폰트를 찾으면 한글 폰트를 먼저 주어 한 글줄을 한 폰트로 그리게 한다.
  // 두 폰트의 ASCII 글리프는 폭과 외곽 상자가 같고(700의 `,` `;`만 2/1000 다름), 한글 폰트에 없는 글자
  // (`Ω`, `µ` 등)만 라틴 폰트로 넘어간다.
  const [latin, hangul] = [names[0], names.at(-1)!]
  const conf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontDir}</dir>
  <cachedir>${fontconfigDir}</cachedir>
  <alias binding="strong"><family>sans-serif</family><prefer>${families}</prefer></alias>
  <match target="pattern">
    <test name="family"><string>${latin}</string></test>
    <edit name="family" mode="prepend" binding="strong"><string>${hangul}</string></edit>
  </match>
</fontconfig>
`
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== conf) fs.writeFileSync(file, conf)
  return file
}

// SVG 자체가 그려지지 않을 때만 던진다. 폰트를 받지 못한 것 같은 환경 오류는 그대로 올려 검사기를 멈춘다.
export class SvgRenderError extends Error {}

let sharpModule: Promise<typeof import("sharp")> | undefined
let fontconfig: Promise<string> | undefined

// fontconfig는 처음 글자를 그릴 때 FONTCONFIG_FILE을 한 번 읽는다. 그 뒤에는 되돌려,
// 검사기가 띄우는 빌드(build.ts)에는 넘기지 않는다.
async function render(source: string) {
  sharpModule ??= import("sharp")
  const { default: sharp } = await sharpModule
  fontconfig ??= fontconfigFile()
  const conf = await fontconfig
  const previous = process.env.FONTCONFIG_FILE
  process.env.FONTCONFIG_FILE = conf
  try {
    return await sharp(Buffer.from(source), { density: 72 * scale })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
  } catch (error) {
    throw new SvgRenderError((error as Error).message)
  } finally {
    if (previous === undefined) delete process.env.FONTCONFIG_FILE
    else process.env.FONTCONFIG_FILE = previous
  }
}

// 루트 여는 태그의 viewBox를 바꾼다.
export function withViewBox(rootTag: string, viewBox: ViewBox): string {
  return rootTag.replace(/(\sviewBox\s*=\s*)(["']).*?\2/i, `$1"${viewBox.join(" ")}"`)
}

// root는 svg에서 루트 여는 태그가 있는 곳이다. 그 태그의 viewBox만 바꾼 문서를 준다.
export function withRootViewBox(
  svg: string,
  root: { index: number; tag: string },
  viewBox: ViewBox,
): string {
  return (
    svg.slice(0, root.index) +
    withViewBox(root.tag, viewBox) +
    svg.slice(root.index + root.tag.length)
  )
}

// svg는 루트의 viewBox가 viewBox인 문서다. 아무것도 칠하지 않았으면 null을 준다.
export async function paintedBounds(svg: string, viewBox: ViewBox): Promise<Bounds | null> {
  const { data, info } = await render(svg)
  let [minX, minY, maxX, maxY] = [info.width, info.height, -1, -1]
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] === 0) continue
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
  }
  if (maxX < 0) return null
  const [x, y, width, height] = viewBox
  const sx = info.width / width
  const sy = info.height / height
  return {
    left: x + minX / sx,
    right: x + (maxX + 1) / sx,
    top: y + minY / sy,
    bottom: y + (maxY + 1) / sy,
  }
}

// root는 source에서 루트 여는 태그가 있는 곳이다. 아무것도 칠하지 않은 그림이면 null을 준다.
export async function measureMargins(
  source: string,
  root: { index: number; tag: string },
  viewBox: ViewBox,
): Promise<Margins | null> {
  const [x, y, width, height] = viewBox
  // 넓힌 폭을 픽셀 단위로 맞춰, 원래 가장자리가 픽셀 경계에 놓이게 한다. 그래야 가장자리에 닿은 그림이
  // 밖의 픽셀을 반만 칠해 밖으로 나간 것처럼 보이지 않는다.
  const padX = Math.ceil(width * overflowPadding * scale) / scale
  const padY = Math.ceil(height * overflowPadding * scale) / scale
  const expanded: ViewBox = [x - padX, y - padY, width + 2 * padX, height + 2 * padY]
  const bounds = await paintedBounds(withRootViewBox(source, root, expanded), expanded)
  if (!bounds) return null
  return {
    left: bounds.left - x,
    right: x + width - bounds.right,
    top: bounds.top - y,
    bottom: y + height - bounds.bottom,
  }
}

// 여백이 이보다 작으면(음수) 밖의 픽셀을 하나 이상 칠했다. 소수 오차는 넘기지 않는다.
export const overflowed = (margin: number) => margin < -0.5 / scale
