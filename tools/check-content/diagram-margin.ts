import fs from "node:fs"
import path from "node:path"
import { cacheDir, ensurePretendard } from "../og-fonts"
import { repoRoot } from "../repo"

// 도해는 사이트가 틀 가운데에 놓으므로(quartz/styles/custom.scss), 그림이 viewBox 안에서 쏠리면 틀
// 안에서도 쏠려 보인다. SVG를 래스터화해 그림이 칠한 영역을 재고, viewBox 가장자리까지의 여백을 준다.
//
// 글자 폭은 폰트마다 달라 측정도 폰트를 따른다. 시스템 폰트를 쓰면 한글 폰트가 없는 CI 러너
// (ubuntu-latest)에서 한글이 그려지지 않아 환경마다 값이 달라지므로, fontconfig가 웹 폰트와 같은
// Pretendard만 보게 한다. 브라우저는 시스템 sans-serif로 그리므로 측정은 브라우저와 어긋난다.
// main의 도해 7개에서 좌우 여백의 차는, Pretendard로 잰 값과 DejaVu Sans·WenQuanYi Zen Hei(도해
// 에이전트가 렌더해 보는 WSL 브라우저의 폰트)로 잰 값이 최대 15, 라틴을 Arial과 폭이 같은 Liberation
// Sans로 바꿔 잰 값과는 최대 1 달랐다. 허용치는 그보다 크게 둔다. 이 검사를 만든 계기인 쏠림
// (틀 가운데에서 22px, 여백의 차로 44)은 잡힌다.
export const marginTolerance = 16

// 1 viewBox 단위를 몇 픽셀로 그리는지. 가장자리를 0.25 단위로 잰다.
const scale = 4

export interface Margins {
  left: number
  right: number
  top: number
  bottom: number
}

const fontconfigDir = path.join(repoRoot, "quartz", ".quartz-cache", "fontconfig")

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

let sharp: Promise<typeof import("sharp")> | undefined

// fontconfig는 처음 글자를 그릴 때 FONTCONFIG_FILE을 한 번 읽는다. 그 뒤에는 되돌려,
// 검사기가 띄우는 빌드(build.ts)에는 넘기지 않는다.
async function render(source: string) {
  sharp ??= import("sharp")
  const { default: rasterize } = await sharp
  const previous = process.env.FONTCONFIG_FILE
  process.env.FONTCONFIG_FILE = await fontconfigFile()
  try {
    return await rasterize(Buffer.from(source), { density: 72 * scale })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
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
