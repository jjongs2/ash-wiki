// ash-wiki: 검색 플러그인(@quartz-community/search 1.0.0)을 fork한 로컬 플러그인이다. 출처, 기준선, 기준선과
// 비교하는 법은 docs/engine.md의 검색 절에 있다.
//
// 컴포넌트는 JSX 대신 preact의 h로 업스트림 Search.tsx와 같은 마크업을 만든다. 클라이언트 스크립트(script.ts)는
// 업스트림 빌드처럼 esbuild로 묶어 import를 풀어 싣는다. 스크립트가 불러오는 색인 모듈(model.ts)과
// FlexSearch도 함께 묶인다. 필드별 결과를 잇는 순서는 model.ts가 정해서 업스트림의 fieldPriority 옵션은 뺐다.
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
  name: "search",
  displayName: "Search",
  description: "제목, 별칭, 본문으로 페이지를 찾는다",
  version: "1.0.0",
  category: "component",
  components: {
    Search: {
      name: "Search",
      displayName: "Search",
      description: "제목, 별칭, 본문으로 페이지를 찾는다",
      version: "1.0.0",
      defaultPosition: "left",
      defaultPriority: 20,
    },
  },
}

export interface SearchOptions {
  enablePreview: boolean
}

const defaultOptions: SearchOptions = {
  enablePreview: true,
}

// 업스트림은 문구를 locale별 표에서 고른다. 이 사이트의 locale(ko-KR)에서는 이 값이다.
const TITLE = "검색"
const PLACEHOLDER = "검색어를 입력하세요"

// 업스트림 빌드(tsup.config.ts의 inline-script-loader)와 같은 옵션으로 묶는다.
function bundleScript(): string {
  const result = buildSync({
    entryPoints: [fileURLToPath(new URL("./script.ts", import.meta.url))],
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

export const Search = (userOpts?: Partial<SearchOptions>) => {
  const Component: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }
    const classes = [displayClass, "search"].filter(Boolean).join(" ")
    return h("div", { class: classes }, [
      h("button", { class: "search-button", "aria-label": TITLE, "aria-expanded": "false" }, [
        h("svg", { role: "img", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 19.9 19.7" }, [
          // 업스트림은 아이콘 제목을 영어로 박아 두었다(ADR 0021).
          h("title", null, TITLE),
          h("g", { class: "search-path", fill: "none" }, [
            h("path", { "stroke-linecap": "square", d: "M18.5 18.3l-5.4-5.4" }),
            h("circle", { cx: "8", cy: "8", r: "7" }),
          ]),
        ]),
        h("p", null, TITLE),
      ]),
      h(
        "div",
        { class: "search-container" },
        h("div", { class: "search-space" }, [
          h("input", {
            autocomplete: "off",
            class: "search-bar",
            name: "search",
            type: "text",
            "aria-label": PLACEHOLDER,
            placeholder: PLACEHOLDER,
          }),
          h("div", { class: "search-layout", "data-preview": String(opts.enablePreview) }),
        ]),
      ),
    ])
  }
  Component.css = fs.readFileSync(new URL("./style.css", import.meta.url), "utf8")
  Component.afterDOMLoaded = bundleScript()
  return Component
}

export default Search
