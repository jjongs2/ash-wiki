// ash-wiki: 그래프 플러그인(@quartz-community/graph 1.0.0)을 fork한 로컬 플러그인이다. 출처, 기준선, 기준선과
// 비교하는 법은 docs/engine.md의 그래프 절에 있다.
//
// 컴포넌트는 JSX 대신 preact의 h로 업스트림 Graph.tsx와 같은 마크업을 만든다. 클라이언트 스크립트(script.js)는 업스트림 빌드처럼 esbuild로 묶어 import를
// 풀어 싣는다. 스크립트가 불러오는 순수 함수(model.ts)도 함께 묶인다. 태그 노드를 그리지 않으므로 업스트림의
// 태그 옵션(showTags, removeTags)은 뺐다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property와 JSX를 쓰지 않고, 타입은 import type으로 가져온다.
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import { buildSync } from "esbuild"
import { h } from "preact"
import type { QuartzComponent, QuartzComponentProps } from "../../quartz/components/types"

// 로더는 컴포넌트를 "./components" 서브패스에서 찾는다. 그 경로는 이 폴더의 package.json이 이 파일로 잇는다.
export const manifest = {
  name: "graph",
  displayName: "Graph",
  description: "페이지를 링크로 이은 그래프를 그린다",
  version: "1.0.0",
  category: "component",
  components: {
    Graph: {
      name: "Graph",
      displayName: "Graph",
      description: "페이지를 링크로 이은 그래프를 그린다",
      version: "1.0.0",
      defaultPosition: "right",
      defaultPriority: 10,
    },
  },
}

export interface D3Config {
  drag: boolean
  zoom: boolean
  depth: number
  scale: number
  repelForce: number
  centerForce: number
  linkDistance: number
  fontSize: number
  opacityScale: number
  focusOnHover?: boolean
  enableRadial?: boolean
}

export interface GraphOptions {
  localGraph?: Partial<D3Config>
  globalGraph?: Partial<D3Config>
}

const defaultOptions: GraphOptions = {
  localGraph: {
    drag: true,
    zoom: true,
    depth: 1,
    scale: 1.1,
    repelForce: 0.5,
    centerForce: 0.3,
    linkDistance: 30,
    fontSize: 0.6,
    opacityScale: 1,
    focusOnHover: false,
    enableRadial: false,
  },
  globalGraph: {
    drag: true,
    zoom: true,
    depth: -1,
    scale: 0.9,
    repelForce: 0.5,
    centerForce: 0.2,
    linkDistance: 30,
    fontSize: 0.6,
    opacityScale: 1,
    focusOnHover: true,
    enableRadial: true,
  },
}

// 업스트림은 제목을 locale별 표에서 고른다. 이 사이트의 locale(ko-KR)에서는 이 값이다.
const TITLE = "그래프 뷰"

const ICON_PATH = `M49,0c-3.309,0-6,2.691-6,6c0,1.035,0.263,2.009,0.726,2.86l-9.829,9.829C32.542,17.634,30.846,17,29,17
                s-3.542,0.634-4.898,1.688l-7.669-7.669C16.785,10.424,17,9.74,17,9c0-2.206-1.794-4-4-4S9,6.794,9,9s1.794,4,4,4
                c0.74,0,1.424-0.215,2.019-0.567l7.669,7.669C21.634,21.458,21,23.154,21,25s0.634,3.542,1.688,4.897L10.024,42.562
                C8.958,41.595,7.549,41,6,41c-3.309,0-6,2.691-6,6s2.691,6,6,6s6-2.691,6-6c0-1.035-0.263-2.009-0.726-2.86l12.829-12.829
                c1.106,0.86,2.44,1.436,3.898,1.619v10.16c-2.833,0.478-5,2.942-5,5.91c0,3.309,2.691,6,6,6s6-2.691,6-6c0-2.967-2.167-5.431-5-5.91
                v-10.16c1.458-0.183,2.792-0.759,3.898-1.619l7.669,7.669C41.215,39.576,41,40.26,41,41c0,2.206,1.794,4,4,4s4-1.794,4-4
                s-1.794-4-4-4c-0.74,0-1.424,0.215-2.019,0.567l-7.669-7.669C36.366,28.542,37,26.846,37,25s-0.634-3.542-1.688-4.897l9.665-9.665
                C46.042,11.405,47.451,12,49,12c3.309,0,6-2.691,6-6S52.309,0,49,0z M11,9c0-1.103,0.897-2,2-2s2,0.897,2,2s-0.897,2-2,2
                S11,10.103,11,9z M6,51c-2.206,0-4-1.794-4-4s1.794-4,4-4s4,1.794,4,4S8.206,51,6,51z M33,49c0,2.206-1.794,4-4,4s-4-1.794-4-4
                s1.794-4,4-4S33,46.794,33,49z M29,31c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S32.309,31,29,31z M47,41c0,1.103-0.897,2-2,2
                s-2-0.897-2-2s0.897-2,2-2S47,39.897,47,41z M49,10c-2.206,0-4-1.794-4-4s1.794-4,4-4s4,1.794,4,4S51.206,10,49,10z`

// 업스트림 빌드(tsup.config.ts의 inline-script-loader)와 같은 옵션으로 묶는다.
function bundleScript(): string {
  const result = buildSync({
    entryPoints: [fileURLToPath(new URL("./script.js", import.meta.url))],
    write: false,
    bundle: true,
    minify: true,
    platform: "browser",
    format: "esm",
    target: "es2020",
    sourcemap: false,
    external: ["http://*", "https://*"],
  })
  return result.outputFiles[0].text
}

export const Graph = (userOpts?: Partial<GraphOptions>) => {
  const Component: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const localGraph = { ...defaultOptions.localGraph, ...userOpts?.localGraph }
    const globalGraph = { ...defaultOptions.globalGraph, ...userOpts?.globalGraph }
    const classes = [displayClass, "graph"].filter(Boolean).join(" ")
    return h("div", { class: classes }, [
      h("h3", null, TITLE),
      h("div", { class: "graph-outer" }, [
        h("div", { class: "graph-container", "data-cfg": JSON.stringify(localGraph) }),
        h(
          "button",
          // 업스트림은 스크린 리더 라벨을 영어로 박아 두었다(ADR 0021).
          { class: "global-graph-icon", "aria-label": "전체 그래프" },
          h(
            "svg",
            {
              version: "1.1",
              xmlns: "http://www.w3.org/2000/svg",
              xmlnsXlink: "http://www.w3.org/1999/xlink",
              x: "0px",
              y: "0px",
              viewBox: "0 0 55 55",
              fill: "currentColor",
              xmlSpace: "preserve",
            },
            h("path", { d: ICON_PATH }),
          ),
        ),
      ]),
      h(
        "div",
        { class: "global-graph-outer" },
        h("div", { class: "global-graph-container", "data-cfg": JSON.stringify(globalGraph) }),
      ),
    ])
  }
  Component.css = fs.readFileSync(new URL("./style.css", import.meta.url), "utf8")
  Component.afterDOMLoaded = bundleScript()
  return Component
}

export default Graph
