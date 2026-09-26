// @ts-check
// ash-wiki: 도해 <object>에 SVG의 viewBox 폭을 --diagram-width로 붙이는 로컬 플러그인이다.
// 사이트 스타일(quartz/styles/custom.scss)이 이 값으로 도해를 viewBox 폭에 비례한 크기로 그려, 폭이
// 다른 도해도 같은 font-size의 글자가 같은 크기로 보인다. 배율과 크기 계산은 스타일에 있다.
//
// 빌드가 이 파일을 타입 제거 없이 불러오므로 JS로 쓴다(.node-version의 Node 22.16은 .ts를 못 읽는다).
// <object>는 obsidian-flavored-markdown의 embed가 만든다. 그 뒤에 돌도록 quartz.config.yaml에서 order를 준다.
import fs from "node:fs"
import path from "node:path"
import { visit } from "unist-util-visit"

export const manifest = {
  name: "diagram-width",
  displayName: "Diagram width",
  description: "도해 <object>에 SVG의 viewBox 폭을 붙인다",
  version: "1.0.0",
  category: "transformer",
}

/**
 * 루트 <svg>의 viewBox 폭. 읽지 못하면 null을 준다.
 * @param {string} source
 * @returns {number | null}
 */
function viewBoxWidth(source) {
  const root = source.match(/<svg\b[^>]*>/i)?.[0]
  const viewBox = root
    ?.match(/\sviewBox\s*=\s*(["'])(.*?)\1/i)?.[2]
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  if (viewBox?.length !== 4 || viewBox.some((n) => !Number.isFinite(n))) return null
  const width = viewBox[2]
  return width > 0 ? width : null
}

/**
 * embed가 <object>의 data에 두는 경로는 content 폴더 기준이다(`![[diagrams/<파일 이름>.svg]]`).
 * 파일이 없거나 viewBox를 읽지 못하면 null을 준다. 그런 도해는 스타일이 예전처럼 그린다.
 * @param {string} directory
 * @param {string} data
 * @returns {number | null}
 */
function diagramWidth(directory, data) {
  let source
  try {
    source = fs.readFileSync(path.resolve(directory, decodeURI(data)), "utf8")
  } catch {
    return null
  }
  return viewBoxWidth(source)
}

/** @type {import("../../quartz/plugins/types").QuartzTransformerPlugin} */
export default function DiagramWidth() {
  return {
    name: "DiagramWidth",
    htmlPlugins(ctx) {
      return [
        () => (/** @type {import("hast").Root} */ tree) => {
          visit(tree, "element", (node) => {
            const { data, type, style } = node.properties
            if (node.tagName !== "object" || type !== "image/svg+xml") return
            if (typeof data !== "string") return
            const width = diagramWidth(ctx.argv.directory, data)
            if (width === null) return
            node.properties.style = [style, `--diagram-width: ${width}`].filter(Boolean).join("; ")
          })
        },
      ]
    },
  }
}
