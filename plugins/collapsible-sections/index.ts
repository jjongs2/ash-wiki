// ash-wiki: 본문의 `##`, `###` 절을 접고 펼칠 수 있게 하는 로컬 플러그인이다. `##` 제목 하나와 그 뒤의 내용을
// 다음 `##` 전까지 펼친 <details>로 감싸고, 제목은 <summary> 안에 둔다. `##` 절 안에서는 같은 방식으로 `###`
// 절을 감싸, `###` 절은 상위 `##` 절 안에 겹쳐 들어간다. 제목 요소는 옮기기만 하므로 github-flavored-markdown이
// 붙인 id와 앵커 링크가 그대로 남는다. 첫 `##` 앞의 머리말과, `##` 절에서 첫 `###` 앞의 내용은 감싸지 않는다.
// 접은 상태는 저장하지 않아, 페이지를 열 때마다 모든 절이 펼쳐져 있다.
//
// 앵커로 접힌 절 안의 요소로 갈 때 그 절을 먼저 여는 스크립트(script.js)와 모양(style.css)을 함께 싣는다.
// 본문 맨 끝의 참고문헌은 citations 플러그인이 붙인다. 그보다 먼저 돌아 참고문헌이 마지막 절에 들지 않도록,
// 다른 플러그인은 원래 꼴의 트리를 보도록 quartz.config.yaml에서 citations 바로 앞의 order를 준다. 순서가
// 바뀌면 테스트와 검사는 통과한 채로, 마지막 절을 접을 때 참고문헌이 함께 접힌다.
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
  description: "본문의 ##, ### 절을 접고 펼칠 수 있게 한다",
  version: "1.0.0",
  category: "transformer",
}

// 절을 만드는 제목. 본문 최상위는 앞의 것으로 나누고, 그렇게 만든 절 안은 다음 것으로 나눈다.
const HEADINGS = ["h2", "h3"]

// summary는 대화형 요소라 그 안에 초점을 받을 수 있는 링크를 두면 안 된다(axe nested-interactive, #638).
// 제목의 앵커 링크는 href를 data-href로 옮겨 초점을 받지 않게 하고, 누르면 스크립트(script.js)가 옮겨 간다.
// 앵커는 이미 aria-hidden에 tabindex=-1이라 키보드와 스크린 리더에는 달라지는 것이 없다. 모양은 style.css가 잇는다.
function inertAnchors(heading: Element): Element {
  for (const child of heading.children) {
    if (child.type !== "element" || child.tagName !== "a" || child.properties.role !== "anchor")
      continue
    const { href, ...rest } = child.properties
    child.properties = { ...rest, dataHref: href }
  }
  return heading
}

// nodes를 HEADINGS[depth] 제목마다 펼친 절로 감싼다. 첫 제목 앞의 노드는 그대로 둔다.
function wrapSections(nodes: RootContent[], depth: number): RootContent[] {
  const tagName = HEADINGS[depth]
  if (tagName === undefined) return nodes
  const children: RootContent[] = []
  const sections: Element[] = []
  for (const node of nodes) {
    if (node.type === "element" && node.tagName === tagName) {
      const section: Element = {
        type: "element",
        tagName: "details",
        properties: { className: ["collapsible-section"], open: true },
        children: [
          { type: "element", tagName: "summary", properties: {}, children: [inertAnchors(node)] },
        ],
      }
      sections.push(section)
      children.push(section)
    } else if (sections.length === 0) {
      children.push(node)
    } else {
      sections.at(-1)!.children.push(node as ElementContent)
    }
  }
  for (const section of sections) {
    const [summary, ...body] = section.children
    section.children = [summary, ...(wrapSections(body, depth + 1) as ElementContent[])]
  }
  return children
}

const readSibling = (file: string) => fs.readFileSync(new URL(file, import.meta.url), "utf8")

const CollapsibleSections: QuartzTransformerPlugin = () => {
  return {
    name: "CollapsibleSections",
    htmlPlugins() {
      return [
        () => (tree: Root) => {
          tree.children = wrapSections(tree.children, 0)
        },
      ]
    },
    externalResources() {
      return {
        css: [{ content: readSibling("./style.css"), inline: true }],
        js: [
          { script: readSibling("./script.js"), loadTime: "afterDOMReady", contentType: "inline" },
        ],
      }
    },
  }
}

export default CollapsibleSections
