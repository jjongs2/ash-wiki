import { inTopic, type Tree } from "../check-content/tree"

// 태그로 부른 Reader Testing의 대상 슬러그. 구역 태그는 하위 태그를 단 페이지까지 든다.
export function topicSlugs(tree: Tree, topic: string): string[] {
  const slugs = tree.pages
    .filter((page) => page.kind === "page" && inTopic(page, topic))
    .map((page) => page.name)
  if (slugs.length === 0) throw new Error(`${topic} 태그를 단 페이지가 없다`)
  return slugs
}
