import fs from "node:fs"
import path from "node:path"

// exceptions는 브라우저가 이 노드에서 걸린 예외(EXCEPTIONS)의 이름이다.
export type ViolationNode = { target: string; html: string; summary: string; exceptions: string[] }
export type Violation = { id: string; help: string; nodes: ViolationNode[] }
export type Target = { name: string; path: string; search?: string }

// 검사할 페이지. 페이지 꼴마다 하나씩이다. 최신 호는 content/news/의 호 파일 가운데 가장 늦은 것이다.
export function axeTargets(root: string): Target[] {
  const issues = fs
    .readdirSync(path.join(root, "content", "news"))
    .filter((file) => /^\d{4}-w\d{2}\.md$/.test(file))
    .sort()
  const latest = issues.at(-1)
  if (latest === undefined) throw new Error("content/news/에 호가 없다")
  return [
    { name: "대문", path: "/" },
    { name: "태그 목록", path: "/tags/network/can" },
    { name: "개념 페이지", path: "/can" },
    { name: "최신 호", path: `/news/${latest.replace(/\.md$/, "")}` },
    { name: "지난 호 목록", path: "/news/" },
    { name: "없는 주소", path: "/no-such-page" },
    { name: "검색", path: "/", search: "CAN" },
  ]
}

// 소유자가 하한 밑을 허용한 자리(docs/engine.md의 화면을 고칠 때 절, #638 결정 3). 브라우저가 위반 노드마다
// selector에 걸리는지(노드 자신이나 조상) 보고 이름을 적어 오고, 그 노드는 rule의 위반일 때만 예외다.
export const EXCEPTIONS = [
  // 콜아웃 색은 엔진 기본값을 그대로 쓴다(docs/palette.md 대비 하한 절의 콜아웃 줄).
  { name: "콜아웃 제목", rule: "color-contrast", selector: ".callout-title" },
  // 페이지가 없는 구역과 주제의 이름을 흐린다(docs/palette.md 대비 하한 절의 탐색기 줄, plugins/explorer-tree).
  {
    name: "탐색기의 흐린 이름",
    rule: "color-contrast",
    selector: ".explorer li:has(> .folder-outer > ul:empty) > .folder-container .folder-title",
  },
] as const

// 위반을 예외가 아닌 것과 예외인 것으로 가른다. 노드 하나라도 남는 규칙만 각 쪽에 둔다.
export function splitExceptions(violations: Violation[]): {
  violations: Violation[]
  excepted: Violation[]
} {
  const isException = (rule: string, n: ViolationNode) =>
    EXCEPTIONS.some((e) => e.rule === rule && n.exceptions.includes(e.name))
  const part = (keep: boolean) =>
    violations
      .map((v) => ({ ...v, nodes: v.nodes.filter((n) => isException(v.id, n) === keep) }))
      .filter((v) => v.nodes.length > 0)
  return { violations: part(false), excepted: part(true) }
}
