import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import GithubSlugger from "github-slugger"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"
import type { Root } from "mdast"
import type { Violation } from "../check-content/tree"

// content/ 밖 Markdown의 상대 링크가 가리키는 파일과 절이 있는지 본다. 규칙은 docs/agents/domain.md에 있다.
// content/ 폴더(검사기 픽스처 안의 것도)는 Quartz 링크 꼴이라, 이 검사의 픽스처는 일부러 깬 링크를 담아 보지 않는다.
const skipped = (file: string) =>
  file.split("/").slice(0, -1).includes("content") || file.startsWith("tools/check-trace/fixtures/")

export interface Tree {
  root: string
  files: Set<string> // 루트 기준 경로. 디렉터리는 담지 않는다.
}

// 저장소면 git이 아는 파일(추적하거나 무시하지 않은 새 파일)만, 아니면(픽스처) 폴더를 통째로 훑는다.
export function loadTree(root: string): Tree {
  const git = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
  })
  const inRepo =
    git.status === 0 &&
    path.resolve(
      spawnSync("git", ["rev-parse", "--show-toplevel"], {
        cwd: root,
        encoding: "utf8",
      }).stdout.trim(),
    ) === path.resolve(root)
  const files = inRepo
    ? git.stdout.split("\0").filter((file) => file && fs.existsSync(path.join(root, file)))
    : walk(root, "")
  return { root, files: new Set(files) }
}

function walk(root: string, dir: string): string[] {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = dir ? `${dir}/${entry.name}` : entry.name
    return entry.isDirectory() ? walk(root, rel) : [rel]
  })
}

const isDir = (tree: Tree, rel: string) =>
  rel === "" || [...tree.files].some((file) => file.startsWith(`${rel.replace(/\/$/, "")}/`))

const parse = (source: string) => unified().use(remarkParse).parse(source) as Root

const anchorCache = new Map<string, Set<string>>()

// GitHub이 Markdown 제목에 다는 앵커와, HTML의 id·name.
function anchorsOf(tree: Tree, rel: string): Set<string> {
  const cached = anchorCache.get(rel)
  if (cached) return cached
  const source = fs.readFileSync(path.join(tree.root, rel), "utf8")
  const slugger = new GithubSlugger()
  const anchors = new Set<string>()
  visit(parse(source), (node) => {
    if (node.type === "heading") anchors.add(slugger.slug(toString(node)))
    if (node.type === "html") {
      for (const m of node.value.matchAll(/\b(?:id|name)="([^"]+)"/g)) anchors.add(m[1])
    }
  })
  anchorCache.set(rel, anchors)
  return anchors
}

const decode = (text: string) => {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

export function checkLinks(tree: Tree): Violation[] {
  const violations: Violation[] = []
  const markdown = [...tree.files].filter((file) => file.endsWith(".md") && !skipped(file)).sort()
  for (const file of markdown) {
    const source = fs.readFileSync(path.join(tree.root, file), "utf8")
    visit(parse(source), (node) => {
      if (node.type !== "link" && node.type !== "image" && node.type !== "definition") return
      const url = node.url
      // 스킴이 있는 주소와 프로토콜 상대 주소는 보지 않는다.
      if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) return
      const line = node.position?.start.line
      const flag = (message: string) => violations.push({ file, line, message })
      const hash = url.indexOf("#")
      const target = decode(hash < 0 ? url : url.slice(0, hash)).replace(/\?.*$/, "")
      const anchor = hash < 0 ? undefined : decode(url.slice(hash + 1))
      const rel = target
        ? path.posix.normalize(
            target.startsWith("/")
              ? target.slice(1)
              : path.posix.join(path.posix.dirname(file), target),
          )
        : file
      if (rel.startsWith("../")) return flag(`저장소 밖을 가리킨다: ${url}`)
      const clean = rel.replace(/\/$/, "").replace(/^\.$/, "")
      if (!tree.files.has(clean)) {
        if (!isDir(tree, clean)) flag(`없는 파일: ${url}`)
        return
      }
      // GitHub의 줄 앵커(#L3, #L3-L5)는 절이 아니다.
      const lineAnchor = anchor !== undefined && /^L\d+(-L\d+)?$/.test(anchor)
      if (anchor && !lineAnchor && clean.endsWith(".md") && !anchorsOf(tree, clean).has(anchor)) {
        flag(`${clean}에 없는 절: #${anchor}`)
      }
    })
  }
  return violations
}
