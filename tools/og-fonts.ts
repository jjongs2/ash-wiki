import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { pretendardVersion } from "../quartz/util/localFonts"
import { repoRoot } from "./repo"

// OG 이미지 생성기(@quartz-community/og-image)는 theme.typography의 header(700), body(400)를
// Google Fonts에서만 받고, 받기 전에 quartz/.quartz-cache/fonts/<이름>-<굵기>를 먼저 읽는다.
// Pretendard는 Google Fonts에 없으므로 웹 폰트와 같은 버전(quartz/util/localFonts.ts)의 OTF를
// 그 자리에 미리 둔다. 없으면 생성기가 한글 없는 시스템 폰트로 넘어가 OG 이미지의 한글이 두부가 된다.
const cacheDir = path.join(repoRoot, "quartz", ".quartz-cache", "fonts")
const files: Record<number, string> = { 400: "Pretendard-Regular.otf", 700: "Pretendard-Bold.otf" }

export async function ensureOgFonts(): Promise<void> {
  fs.mkdirSync(cacheDir, { recursive: true })
  const stamp = path.join(cacheDir, "Pretendard.version")
  const cached = fs.existsSync(stamp) && fs.readFileSync(stamp, "utf8") === pretendardVersion
  for (const [weight, file] of Object.entries(files)) {
    const target = path.join(cacheDir, `Pretendard-${weight}`)
    if (cached && fs.existsSync(target)) continue
    const url = `https://cdn.jsdelivr.net/npm/pretendard@${pretendardVersion}/dist/public/static/${file}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
    fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()))
  }
  fs.writeFileSync(stamp, pretendardVersion)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await ensureOgFonts()
}
