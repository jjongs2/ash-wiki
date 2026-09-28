// ash-wiki: 참고문헌 항목 안의 URL 텍스트를 새 탭으로 열리는 링크로 바꾸는 로컬 플러그인이다.
// citations 플러그인(rehype-citation)은 CSL이 낸 URL을 누를 수 없는 텍스트로 둔다. 본문의 외부 링크는
// crawl-links의 openLinksInNewTab이 새 탭으로 열지만, crawl-links는 참고문헌이 붙기 전에 돈다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
// 참고문헌은 citations 플러그인이 만든다. 그 뒤에 돌도록 quartz.config.yaml에서 order를 준다.
import { SKIP, visit } from "unist-util-visit"
import type { ElementContent, Root } from "hast"
import type { QuartzTransformerPlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "bibliography-links",
  displayName: "Bibliography links",
  description: "참고문헌 항목의 URL을 새 탭 링크로 바꾼다",
  version: "1.0.0",
  category: "transformer",
}

// IEEE CSL(csl/ieee.csl)은 URL을 항목 끝에 구두점 없이 두므로 공백까지를 URL로 본다.
// 아카이브 URL 안의 원래 URL은 앞의 URL에 먹혀 따로 잡히지 않는다.
const URL_PATTERN = /https?:\/\/\S+/g

// 텍스트를 URL은 링크로, 나머지는 텍스트로 가른다. URL이 없으면 null을 준다.
function linkify(value: string): ElementContent[] | null {
  const nodes: ElementContent[] = []
  let last = 0
  for (const match of value.matchAll(URL_PATTERN)) {
    const url = match[0]
    if (match.index > last) nodes.push({ type: "text", value: value.slice(last, match.index) })
    nodes.push({
      type: "element",
      tagName: "a",
      properties: { href: url, target: "_blank", className: ["external"] },
      children: [{ type: "text", value: url }],
    })
    last = match.index + url.length
  }
  if (nodes.length === 0) return null
  if (last < value.length) nodes.push({ type: "text", value: value.slice(last) })
  return nodes
}

const BibliographyLinks: QuartzTransformerPlugin = () => {
  return {
    name: "BibliographyLinks",
    htmlPlugins() {
      return [
        () => (tree: Root) => {
          visit(tree, "element", (entry) => {
            const className = entry.properties.className
            if (!Array.isArray(className) || !className.includes("csl-entry")) return
            visit(entry, "text", (text, index, parent) => {
              if (parent === undefined || index === undefined) return
              const nodes = linkify(text.value)
              if (nodes === null) return
              parent.children.splice(index, 1, ...nodes)
              // 방금 넣은 링크 안의 URL 텍스트를 다시 가르지 않도록 넣은 노드를 건너뛴다.
              return [SKIP, index + nodes.length]
            })
            return SKIP
          })
        },
      ]
    },
  }
}

export default BibliographyLinks
