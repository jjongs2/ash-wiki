import fs from "node:fs"
import path from "node:path"
import { cacheDir, ensurePretendard } from "../og-fonts"

// 도해는 사이트가 틀 가운데에 놓으므로(quartz/styles/custom.scss), 그림이 viewBox 안에서 쏠리면 틀
// 안에서도 쏠려 보인다. SVG를 래스터화해 그림이 칠한 영역을 재고, viewBox 가장자리까지의 여백을 준다.
//
// 도해는 글자를 Pretendard로 그리므로(docs/wiki-conventions.md 도해 절), fontconfig도 Pretendard만
// 보게 한다. 시스템 폰트에 맡기면 한글 폰트가 없는 CI 러너(ubuntu-latest)에서 한글이 그려지지 않는다.
// 같은 폰트를 geometricPrecision으로 그리면 렌더러 차이만 남는다. main의 도해 7개에서 이 측정(librsvg)과
// Linux Chromium 151(headless 포함)의 여백은 한 변에서 최대 0.25 달랐으므로, 두 변의 차는 최대 0.5
// 어긋난다. 위반 메시지가 원점을 0.5 단위로 반올림해 알려 주므로 그대로 옮기면 여백의 차가 0.5 남을 수
// 있다. 허용치는 둘을 더한 1보다 크게 둔다. Windows와 macOS의 브라우저에서는 재지 않았다.
export const marginTolerance = 2

// 1 viewBox 단위를 몇 픽셀로 그리는지. 가장자리를 0.25 단위로 잰다.
const scale = 4

interface Margins {
  left: number
  right: number
  top: number
  bottom: number
}

const fontconfigDir = path.join(path.dirname(cacheDir), "fontconfig")

// 굵기는 400과 700만 받는다. 다른 굵기를 쓰는 도해는 브라우저와 글자 폭이 달라진다.
async function fontconfigFile(): Promise<string> {
  await ensurePretendard([400, 700])
  const file = path.join(fontconfigDir, "fonts.conf")
  const conf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${cacheDir}</dir>
  <cachedir>${fontconfigDir}</cachedir>
  <alias binding="strong"><family>sans-serif</family><prefer><family>Pretendard</family></prefer></alias>
</fontconfig>
`
  fs.mkdirSync(fontconfigDir, { recursive: true })
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== conf) fs.writeFileSync(file, conf)
  return file
}

// SVG 자체가 그려지지 않을 때만 던진다. 폰트를 받지 못한 것 같은 환경 오류는 그대로 올려 검사기를 멈춘다.
export class SvgRenderError extends Error {}

let sharpModule: Promise<typeof import("sharp")> | undefined

// fontconfig는 처음 글자를 그릴 때 FONTCONFIG_FILE을 한 번 읽는다. 그 뒤에는 되돌려,
// 검사기가 띄우는 빌드(build.ts)에는 넘기지 않는다.
async function render(source: string) {
  sharpModule ??= import("sharp")
  const { default: sharp } = await sharpModule
  const conf = await fontconfigFile()
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

// 아무것도 칠하지 않은 그림이면 null을 준다.
export async function measureMargins(
  source: string,
  viewBox: { width: number; height: number },
): Promise<Margins | null> {
  const { data, info } = await render(source)
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
  const sx = info.width / viewBox.width
  const sy = info.height / viewBox.height
  return {
    left: minX / sx,
    right: (info.width - 1 - maxX) / sx,
    top: minY / sy,
    bottom: (info.height - 1 - maxY) / sy,
  }
}
