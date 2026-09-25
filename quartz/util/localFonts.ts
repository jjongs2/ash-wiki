import { formatFontSpecification, getFontSpecificationName, type Theme } from "./theme"

// ash-wiki: theme.fontOrigin이 local일 때 Head가 거는 폰트 CSS다(quartz.config.yaml).
// 폰트 이름은 theme.typography가 정본이고, 여기서는 그 이름의 파일을 어디서 받는지만 정한다.
// Pretendard는 Google Fonts에 없어 공식 배포처인 jsDelivr에서 받고, 나머지는 Google Fonts에서 받는다.
// OG 이미지용 폰트를 받는 tools/og-fonts.ts도 이 배포처와 버전을 쓴다.
export const pretendardVersion = "1.3.9"
export const pretendardDist = `https://cdn.jsdelivr.net/npm/pretendard@${pretendardVersion}/dist`
// 도해 SVG도 이 CSS를 불러와 글자를 Pretendard로 그린다(docs/wiki-conventions.md 도해 절).
export const pretendardStylesheet = `${pretendardDist}/web/static/pretendard-dynamic-subset.css`

export function localFontStylesheets(theme: Theme): string[] {
  const roles = ["title", "header", "body", "code"] as const
  const hrefs = roles.flatMap((role) => {
    const spec = theme.typography[role]
    if (spec === undefined) return []
    if (getFontSpecificationName(spec) === "Pretendard") {
      return [pretendardStylesheet]
    }
    const family = formatFontSpecification(role, spec).replaceAll(" ", "+")
    return [`https://fonts.googleapis.com/css2?family=${family}&display=swap`]
  })
  return [...new Set(hrefs)]
}
