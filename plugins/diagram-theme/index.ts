// ash-wiki: 도해가 사이트 테마를 따르게 하는 로컬 플러그인이다. 도해 SVG는 색을 `var(--<이름>, <대체값>)`으로
// 쓰고(docs/wiki-diagrams.md의 도해의 색 절), 이 플러그인이 싣는 스크립트(script.js)가 도해 <object>의 SVG 문서
// 루트에 현재 테마의 토큰 값을 넣는다. 칠하는 때는 <object>의 load, themechange, SPA 이동(nav)이다.
// 스크립트가 돌지 않는 곳에서는 SVG가 대체값으로 그려진다.
//
// 토큰 값의 정본은 도해 규약의 도해 팔레트 표다. 빌드 때 그 표를 읽어 스크립트 앞에 둔다. 검사기의 표 읽기
// (tools/check-content/conventions.ts)는 확장자 없는 import를 써서 여기서 불러올 수 없어, 같은 꼴로 따로 읽는다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
import fs from "node:fs"
import type { QuartzTransformerPlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "diagram-theme",
  displayName: "Diagram theme",
  description: "도해 SVG에 현재 테마의 색 토큰 값을 넣는다",
  version: "1.0.0",
  category: "transformer",
}

const readSibling = (file: string) => fs.readFileSync(new URL(file, import.meta.url), "utf8")

type Palette = Record<string, { light: string; dark: string }>

// 표 바로 위의 `<!-- table: diagram-palette -->` 주석으로 표를 찾는다. 열이 없으면 빌드를 멈춘다.
export function readPalette(markdown: string): Palette {
  const lines = markdown.split("\n")
  let i = lines.indexOf("<!-- table: diagram-palette -->") + 1
  if (i === 0) throw new Error("도해 규약에 도해 팔레트 표가 없다")
  while (lines[i]?.trim() === "") i++
  const rows: string[][] = []
  while (lines[i]?.startsWith("|")) {
    rows.push(
      lines[i++]
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim().replace(/^`(.*)`$/, "$1")),
    )
  }
  const [header, , ...body] = rows
  const [name, light, dark] = ["이름", "라이트", "다크"].map((column) => {
    const index = header?.indexOf(column) ?? -1
    if (index < 0) throw new Error(`도해 팔레트 표에 열 "${column}"이 없다`)
    return index
  })
  return Object.fromEntries(
    body.map((cells) => [cells[name], { light: cells[light], dark: cells[dark] }]),
  )
}

const DiagramTheme: QuartzTransformerPlugin = () => {
  return {
    name: "DiagramTheme",
    // 트리는 바꾸지 않는다. 로더는 transformer에 이 메서드가 없으면 플러그인을 건너뛴다.
    htmlPlugins() {
      return []
    },
    externalResources() {
      const diagrams = new URL("../../docs/wiki-diagrams.md", import.meta.url)
      const palette = readPalette(fs.readFileSync(diagrams, "utf8"))
      // 다른 인라인 스크립트와 이름이 겹치지 않게 블록으로 감싼다.
      const script = `{\nconst palette = ${JSON.stringify(palette)}\n${readSibling("./script.js")}}\n`
      return {
        css: [{ content: readSibling("./style.css"), inline: true }],
        js: [{ script, loadTime: "afterDOMReady", contentType: "inline" }],
      }
    },
  }
}

export default DiagramTheme
