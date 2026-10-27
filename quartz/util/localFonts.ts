import { joinSegments } from "./path"
import {
  getFontSpecificationNames,
  googleFontFamilies,
  type FontSpecification,
  type Theme,
} from "./theme"

// ash-wiki: theme.fontOrigin이 local일 때 Head가 거는 폰트 CSS다(quartz.config.yaml).
// 폰트 이름은 theme.typography가 정본이고, 여기서는 그 이름의 파일을 어디서 받는지만 정한다.
// Monoplex KR은 Google Fonts에도 npm에도 없어 저장소에 싣고(quartz/static/fonts/monoplex-kr), 나머지는
// Google Fonts에서 받는다. OG 이미지와 도해 여백 검사가 쓰는 파일도 tools/og-fonts.ts가 Google Fonts에서 받는다.
const repoFonts: Record<string, string> = {
  "Monoplex KR": "static/fonts/monoplex-kr/monoplex-kr.css",
}

type Role = keyof Theme["typography"]

function googleFontStylesheet(role: Role, spec: FontSpecification) {
  return `https://fonts.googleapis.com/css2?${googleFontFamilies(role, spec)}&display=swap`
}

// 도해 SVG는 이 CSS를 불러와 글자를 본문과 같은 폰트로 그린다(docs/wiki-diagrams.md). 사이트가 거는 본문
// 폰트 CSS와 주소가 같아, 브라우저가 한 번 받은 것을 같이 쓴다.
export function diagramFontStylesheet(theme: Theme): string {
  return googleFontStylesheet("body", theme.typography.body)
}

// 한 역할의 폰트는 모두 한 곳에서 받는다. 첫 이름이 저장소에 실은 폰트이면 그 CSS를 건다.
export function localFontStylesheets(theme: Theme, baseDir: string): string[] {
  const roles = ["title", "header", "body", "code"] as const
  const hrefs = roles.flatMap((role) => {
    const spec = theme.typography[role]
    if (spec === undefined) return []
    const repoFont = repoFonts[getFontSpecificationNames(spec)[0]]
    if (repoFont !== undefined) return [joinSegments(baseDir, repoFont)]
    return [googleFontStylesheet(role, spec)]
  })
  return [...new Set(hrefs)]
}
