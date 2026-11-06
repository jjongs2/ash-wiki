import { svgRootTag, viewBoxOf } from "../check-content/source-checks"
import { isNew } from "./diff"
import type { Candidate, Context } from "./items"
import { lineAt, lineStarts } from "./text"

// 도해가 틀에 맞춰 줄지 않고 그려지는 가장 넓은 viewBox 폭. 사이트는 viewBox 1단위를 0.85rem / 12로
// 그리고, 틀 안쪽보다 넓은 도해는 틀에 맞춰 줄어 글자도 그만큼 작아진다(quartz/styles/custom.scss).
// 틀 안쪽 폭은 화면 폭에 따라 바뀌므로, Reader Testing이 데스크톱을 찍는 화면 폭 1280px에서 잰다
// (tools/reader-capture). 이 폭은 Quartz의 데스크톱 레이아웃(1200px 이상)으로 양쪽 사이드바가 보여,
// 본문 칸이 1280 - 2 × 280 - 2 × 5 = 710px이다(quartz/styles/variables.scss의 $sidePanelWidth와
// $desktopGrid). 본문 칸의 padding-left는 max(43px, (710 - 807 + 43) / 2)로 최소값 43px에 걸리고
// (quartz/styles/custom.scss의 $center-inset, $center-max-width), 내용 폭은 667px이다. 틀 안쪽은 테두리
// 2px와 최소 padding 2 × 0.75rem을 뺀 641px이고, 641 × 12 / (0.85 × 16) = 565.6단위다. 빌드한 사이트를
// 1280 × 900 Linux Chromium(Playwright)으로 재어 이 값들이 같았다. 폭 561인 도해는 1단위가 1.1334px로
// 줄지 않았고, 566인 도해는 1.1325px로 줄었다. 레이아웃이나 1단위 배율이 바뀌어 이 값이 낡으면 Reader
// Testing 캡처가 틀 안쪽과 1단위의 폭을 재어 알린다.
export const frameWidth = 565.6

function rootWidth(source: string): { width: number; offset: number } | null {
  const text = source.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, " "))
  const root = text.match(svgRootTag)
  const viewBox = root && viewBoxOf(root[0])
  return viewBox ? { width: viewBox[2], offset: root.index! } : null
}

// 도해 폭: 브랜치가 더하거나 고친 도해 가운데 viewBox 폭이 문턱보다 넓은 것. 고친 기존 도해는 폭을
// 바꿨는지 함께 보인다. 옛 폭은 지운 줄의 루트 태그에서 읽으므로, 루트 태그가 한 줄에 있다고 본다
// (main의 도해는 모두 그렇다).
export const diagramWidthItem = ({ diagrams }: Context): Candidate[] =>
  diagrams.flatMap(({ svg, change }) => {
    const root = rootWidth(svg.source)
    if (!root || root.width <= frameWidth) return []
    let kind = "새 도해"
    if (!isNew(svg.source, change)) {
      const removed = change.hunks.flatMap((hunk) => hunk.removed).join("\n")
      const before = rootWidth(removed)?.width ?? root.width
      kind = before === root.width ? "기존 도해, 폭 그대로" : `기존 도해, 폭 ${before}에서 바뀜`
    }
    return [
      {
        file: svg.file,
        line: lineAt(lineStarts(svg.source), root.offset),
        message: `틀 안쪽 폭 ${frameWidth}보다 넓다: viewBox 폭 ${root.width}(${kind})`,
      },
    ]
  })
