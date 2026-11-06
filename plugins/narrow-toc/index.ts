// ash-wiki: 데스크톱보다 좁은 화면(폰, 태블릿)의 목차 바를 그리는 로컬 컴포넌트 플러그인이다. 데스크톱 목차는
// 오른쪽 사이드바에 있고 좁은 화면에서는 숨는다. 바는 속성 칸 아래, 본문 바로 앞에 놓이는 <details> 드롭다운이고,
// 머리(<summary>)에 "목차", 목차 머리와 같은 꺾쇠, 지금 읽는 절의 이름을 둔다. 누르면 데스크톱 목차와 같은 항목이
// 열린다.
// - 항목은 목차 플러그인(@quartz-community/table-of-contents)이 페이지 데이터에 둔 목차(fileData.toc)로, 목차
//   컴포넌트와 같은 마크업을 만든다. 목차가 없는 페이지에는 바를 내지 않는다. 데스크톱 목차를 두지 않는 페이지
//   타입(주간 소식, 태그 목록, 404)은 quartz.config.yaml의 layout에서 이 컴포넌트를 함께 뺀다.
// - 지금 절은 따로 정하지 않고 데스크톱 목차의 표시를 옮겨 싣는다(script.js). 정하는 규칙은 patches/의
//   table-of-contents 패치에 하나만 있고, 그 스크립트는 목차가 숨은 폭에서도 돈다.
// - 목차를 고치지 않고 그 결과에 바를 덧붙이므로 패치가 아니라 로컬 플러그인이다(docs/engine.md의 npm 플러그인
//   패치 절).
// - 바의 자리(sticky, 화면 끝까지 칠하는 폭, 높이, 앵커 이동의 여백)는 사이트 배치를 따르므로
//   quartz/styles/custom.scss의 목차 바 절에 있다. 여기 style.css는 바 안의 글자, 색, 꺾쇠, 목록이다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property와 JSX를 쓰지 않고, 타입은 import type으로 가져온다.
import fs from "node:fs"
import { h } from "preact"
import type { QuartzComponent, QuartzComponentProps } from "../../quartz/components/types"

// 로더는 컴포넌트를 "./components" 서브패스에서 찾는다. 그 경로는 이 폴더의 package.json이 이 파일로 잇는다.
export const manifest = {
  name: "narrow-toc",
  displayName: "Narrow table of contents",
  description: "좁은 화면에서 본문 위에 목차 바를 둔다",
  version: "1.0.0",
  category: "component",
  components: {
    NarrowToc: {
      name: "NarrowToc",
      displayName: "Narrow table of contents",
      description: "좁은 화면에서 본문 위에 목차 바를 둔다",
      version: "1.0.0",
      defaultPosition: "beforeBody",
      defaultPriority: 40,
    },
  },
}

// 목차 플러그인은 제목을 locale별 표에서 고른다. 이 사이트의 locale(ko-KR)에서는 이 값이다.
const TITLE = "목차"

// 목차 플러그인이 페이지 데이터에 두는 항목. depth는 가장 얕은 제목을 0으로 둔 깊이다.
interface TocEntry {
  depth: number
  text: string
  slug: string
}

const readSibling = (file: string) => fs.readFileSync(new URL(file, import.meta.url), "utf8")

export const NarrowToc = () => {
  const Component: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const toc = fileData.toc as TocEntry[] | undefined
    if (!toc) return null
    const classes = [displayClass, "narrow-toc"].filter(Boolean).join(" ")
    return h("details", { class: classes }, [
      h("summary", null, [
        h("span", { class: "narrow-toc-label" }, TITLE),
        // 목차 머리(button.toc-header)의 꺾쇠와 같은 SVG다.
        h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "24",
            height: "24",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            class: "fold",
          },
          h("polyline", { points: "6 9 12 15 18 9" }),
        ),
        h("span", { class: "narrow-toc-current" }),
      ]),
      h(
        "ul",
        { class: "narrow-toc-list" },
        toc.map((entry) =>
          h(
            "li",
            { class: `depth-${entry.depth}`, key: entry.slug },
            h("a", { href: `#${entry.slug}`, "data-for": entry.slug }, entry.text),
          ),
        ),
      ),
    ])
  }
  Component.css = readSibling("./style.css")
  Component.afterDOMLoaded = readSibling("./script.js")
  return Component
}

export default NarrowToc
