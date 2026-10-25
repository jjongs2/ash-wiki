// 페이지 하나의 데스크톱 캡처에서 잰 도해 틀 안쪽 폭과 viewBox 1단위의 폭(px). 도해가 없으면 틀
// 안쪽 폭이 null이다.
export type FrameMeasure = { slug: string; innerWidth: number | null; unitWidth: number }

// 문턱(tools/check-diff/diagram-width.ts의 frameWidth)과 잰 폭이 이만큼(viewBox 단위) 넘게 다르면 알린다.
// 문턱은 소수 첫째 자리로 적고, 틀 폭은 서브픽셀로 잰다.
const tolerance = 0.5

const round = (value: number) => Math.round(value * 10) / 10

// 잰 폭에서 나오는 문턱이 frameWidth와 어긋난 페이지를 폭마다 한 줄로 알린다.
export function frameDrift(measures: FrameMeasure[], frameWidth: number): string[] {
  const drifted = new Map<string, string[]>()
  for (const { slug, innerWidth, unitWidth } of measures) {
    if (innerWidth === null) continue
    const units = innerWidth / unitWidth
    if (Math.abs(units - frameWidth) <= tolerance) continue
    const key = `틀 안쪽 ${round(innerWidth)}px, 문턱 ${round(units)}단위`
    drifted.set(key, [...(drifted.get(key) ?? []), slug])
  }
  return [...drifted].map(
    ([key, slugs]) => `${key}인데 frameWidth는 ${frameWidth}다: ${slugs.join(", ")}`,
  )
}
