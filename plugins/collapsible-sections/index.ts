// ash-wiki: 본문의 `##` 절을 접고 펼칠 수 있게 하는 로컬 플러그인이다. `##` 제목 하나와 그 뒤의 내용(하위
// `###` 포함)을 다음 `##` 전까지 펼친 <details>로 감싸고, 제목은 <summary> 안에 둔다. 제목 요소는 옮기기만
// 하므로 github-flavored-markdown이 붙인 id와 앵커 링크가 그대로 남는다. 첫 `##` 앞의 머리말은 감싸지 않는다.
// 접은 상태는 저장하지 않아, 페이지를 열 때마다 모든 절이 펼쳐져 있다.
//
// 앵커로 접힌 절 안의 요소로 갈 때 그 절을 먼저 여는 스크립트(script.js)와 모양(style.css)을 함께 싣는다.
// 본문 맨 끝의 참고문헌은 citations 플러그인이 붙인다. 그보다 먼저 돌아 참고문헌이 마지막 절에 들지 않도록,
// 다른 플러그인은 원래 꼴의 트리를 보도록 quartz.config.yaml에서 citations 바로 앞의 order를 준다.
// 절 단위 transclude(`![[페이지#제목]]`)는 제목이 본문 최상위에 있어야 하므로 이 플러그인과 함께 쓸 수 없다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
import fs from "node:fs"
import type { Element, ElementContent, Root, RootContent } from "hast"
import type { QuartzTransformerPlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "collapsible-sections",
  displayName: "Collapsible sections",
  description: "본문의 ## 절을 접고 펼칠 수 있게 한다",
  version: "1.0.0",
  category: "transformer",
}

const isSectionHeading = (node: RootContent): node is Element =>
  node.type === "element" && node.tagName === "h2"

function wrapSections(tree: Root) {
  const children: RootContent[] = []
  let section: Element | null = null
  for (const node of tree.children) {
    if (isSectionHeading(node)) {
      section = {
        type: "element",
        tagName: "details",
        properties: { className: ["collapsible-section"], open: true },
        children: [{ type: "element", tagName: "summary", properties: {}, children: [node] }],
      }
      children.push(section)
    } else if (section === null) {
      children.push(node)
    } else {
      section.children.push(node as ElementContent)
    }
  }
  tree.children = children
}

const read = (file: string) => fs.readFileSync(new URL(file, import.meta.url), "utf8")

const CollapsibleSections: QuartzTransformerPlugin = () => {
  return {
    name: "CollapsibleSections",
    htmlPlugins() {
      return [() => wrapSections]
    },
    externalResources() {
      return {
        css: [{ content: read("./style.css"), inline: true }],
        js: [{ script: read("./script.js"), loadTime: "afterDOMReady", contentType: "inline" }],
      }
    },
  }
}

export default CollapsibleSections
