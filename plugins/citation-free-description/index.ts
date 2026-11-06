// ash-wiki: 인용 표시를 뺀 본문 글로 페이지 설명(description)과 검색 본문(text)을 만드는 로컬 플러그인이다.
// 꺼 둔 description 플러그인을 대신하고, 까닭은 quartz.config.yaml의 그 플러그인 주석에 있다. 자르기 규칙은
// 바꾸지 않으려고 인용 표시를 뺀 글을 description 플러그인에 그대로 넘긴다. 본문 트리는 건드리지 않는다.
// 앞선 플러그인이 두 값을 이미 정했으면(주간 소식의 호) 그 값을 두고 인용 표시만 뺀다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
// 인용이 렌더되기 전에 돌아야 하므로 quartz.config.yaml에서 citations보다 앞의 order를 준다.
import { Description } from "@quartz-community/description"
import type { Root, RootContent } from "hast"
import type { VFile } from "vfile"
import type { QuartzTransformerPlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "citation-free-description",
  displayName: "Citation-free description",
  description: "인용 표시를 뺀 본문으로 페이지 설명과 검색 본문을 만든다",
  version: "1.0.0",
  category: "transformer",
}

type Transform = (tree: Root, file: VFile) => Promise<void>

// 위키가 쓰는 인용 꼴 [@키]와, 한 괄호에 키가 여럿인 [@키1; @키2]다. 앞의 공백도 함께 빼서
// 「문장 [@키].」가 「문장.」이 된다.
const CITATION = /\s*\[@[^[\]]*\]/g

const stripCitations = (text: string) => text.replace(CITATION, "")

// 자식이 표의 줄이나 칸인 요소다. 렌더된 표에는 칸과 줄 사이에 공백 글이 없어, 이 요소의 자식은 공백으로 잇는다.
const TABLE_PARTS = new Set(["table", "thead", "tbody", "tfoot", "tr"])

// hast-util-to-string의 toString과 같은 글에, 표의 이웃한 칸과 줄 사이의 공백을 더한 것이다. description
// 플러그인은 이 글로 설명과 검색 본문을 만든다.
const textOf = (node: Root | RootContent): string => {
  if (node.type === "text") return node.value
  if (!("children" in node)) return ""
  const separator = node.type === "element" && TABLE_PARTS.has(node.tagName) ? " " : ""
  return node.children.map(textOf).join(separator)
}

const CitationFreeDescription: QuartzTransformerPlugin = () => ({
  name: "CitationFreeDescription",
  htmlPlugins(ctx) {
    // description 플러그인 1.0.0은 옵션을 받지 않는 attacher 하나를 낸다. 올릴 때 이 꼴이 그대로인지 본다.
    const [attacher] = Description().htmlPlugins!(ctx as never) as [() => Transform]
    const describe = attacher()
    return [
      () => async (tree: Root, file: VFile) => {
        const { description, text } = file.data
        const plain: Root = {
          type: "root",
          children: [{ type: "text", value: stripCitations(textOf(tree)) }],
        }
        await describe(plain, file)
        if (description !== undefined) file.data.description = stripCitations(description)
        if (text !== undefined) file.data.text = stripCitations(text)
      },
    ]
  },
})

export default CitationFreeDescription
