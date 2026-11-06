// ash-wiki: 도해 <object>에 접근 가능한 이름을 붙이는 로컬 플러그인이다. 도해 SVG의 루트 <svg>에 둔
// aria-label(docs/wiki-diagrams.md)을 <object>의 aria-label로 옮기고 img 역할을 준다. 화면 낭독기와 axe는
// <object> 안의 SVG 문서를 보지 않고 <object>의 속성만 읽기 때문이다. img 역할로 SVG 안의 글자는
// 접근성 트리에서 빠진다. 글자는 그리는 순서대로 낱말만 남아, 그것만으로는 도해를 읽을 수 없다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
// <object>는 obsidian-flavored-markdown의 embed가 만든다. 그 뒤에 돌도록 quartz.config.yaml에서 order를 준다.
import fs from "node:fs"
import path from "node:path"
import { visit } from "unist-util-visit"
import type { Root } from "hast"
import type { QuartzTransformerPlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "diagram-name",
  displayName: "Diagram name",
  description: "도해 <object>에 SVG 루트의 aria-label을 이름으로 붙인다",
  version: "1.0.0",
  category: "transformer",
}

// XML이 미리 정한 엔티티 다섯과 문자 참조. 도해 SVG는 DTD를 두지 않으므로 이것뿐이다.
const xmlEntities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }

function decodeXml(value: string): string {
  return value.replace(/&(?:#x([\da-f]+)|#(\d+)|(\w+));/gi, (reference, hex, decimal, name) => {
    if (hex) return String.fromCodePoint(parseInt(hex, 16))
    if (decimal) return String.fromCodePoint(parseInt(decimal, 10))
    return xmlEntities[name] ?? reference
  })
}

// 루트 <svg>의 aria-label을 엔티티를 풀어 준다. 없거나 공백뿐이면 null을 준다.
// 이스케이프는 hast를 직렬화하는 쪽이 맡으므로 여기서는 글자 그대로 둔다. 콘텐츠 검사기(svg 검사)도 이
// 함수로 이름이 있는지 보아, 검사가 통과시킨 이름은 사이트도 이름으로 쓴다.
export function rootLabel(source: string): string | null {
  const root = source.match(/<(?:[\w-]+:)?svg[\s>][^>]*>/i)?.[0]
  const raw = root?.match(/\saria-label\s*=\s*(["'])([\s\S]*?)\1/i)?.[2]
  const label = raw === undefined ? "" : decodeXml(raw).trim()
  return label ? label : null
}

// embed가 <object>의 data에 두는 경로는 content 폴더 기준이다(`![[diagrams/<파일 이름>.svg]]`).
// 파일이 없으면 null을 준다.
function diagramName(directory: string, data: string): string | null {
  let source: string
  try {
    source = fs.readFileSync(path.resolve(directory, decodeURI(data)), "utf8")
  } catch {
    return null
  }
  return rootLabel(source)
}

const DiagramName: QuartzTransformerPlugin = () => {
  return {
    name: "DiagramName",
    htmlPlugins(ctx) {
      return [
        () => (tree: Root) => {
          visit(tree, "element", (node) => {
            const { data, type } = node.properties
            if (node.tagName !== "object" || type !== "image/svg+xml") return
            if (typeof data !== "string") return
            const name = diagramName(ctx.argv.directory, data)
            if (name === null) return
            node.properties.role = "img"
            node.properties.ariaLabel = name
          })
        },
      ]
    },
  }
}

export default DiagramName
