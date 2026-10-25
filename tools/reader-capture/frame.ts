// 페이지 하나의 데스크톱 캡처에서 잰 도해 틀 안쪽 폭(px)과 루트 글꼴 크기(px). 도해가 없으면 폭이 null이다.
export type FrameMeasure = { slug: string; inner: number | null; rem: number }

// 문턱(tools/check-diff/diagram-width.ts의 frameWidth)과 잰 폭이 이만큼(viewBox 단위) 넘게 다르면 알린다.
// 문턱은 소수 첫째 자리로 적고, 틀 폭은 서브픽셀로 잰다.
const tolerance = 0.5

const round = (value: number) => Math.round(value * 10) / 10

// 잰 폭에서 나오는 문턱이 frameWidth와 어긋난 페이지를 폭마다 한 줄로 알린다. 사이트는 viewBox
// 1단위를 0.85rem / 12로 그린다(quartz/styles/custom.scss).
export function frameDrift(measures: FrameMeasure[], frameWidth: number): string[] {
  const drifted = new Map<string, string[]>()
  for (const { slug, inner, rem } of measures) {
    if (inner === null) continue
    const units = (inner * 12) / (0.85 * rem)
    if (Math.abs(units - frameWidth) <= tolerance) continue
    const key = `틀 안쪽 ${round(inner)}px, 문턱 ${round(units)}단위`
    drifted.set(key, [...(drifted.get(key) ?? []), slug])
  }
  return [...drifted].map(
    ([key, slugs]) => `${key}인데 frameWidth는 ${frameWidth}다: ${slugs.join(", ")}`,
  )
}
