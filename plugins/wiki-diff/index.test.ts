import test, { after, describe } from "node:test"
import assert from "node:assert"
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import { render } from "preact-render-to-string"
import { ObsidianFlavoredMarkdown } from "@quartz-community/obsidian-flavored-markdown"
import { GitHubFlavoredMarkdown } from "@quartz-community/github-flavored-markdown"
import { Latex } from "@quartz-community/latex"
import { NoteProperties } from "@quartz-community/note-properties"
import { VFile } from "vfile"
import type { Root } from "mdast"
import type { Jsx } from "hast-util-to-jsx-runtime"
import type { PluggableList } from "unified"
import type { BuildCtx } from "../../quartz/util/ctx"
import WikiDiff, {
  SIMILARITY_THRESHOLD,
  alignBlocks,
  extractBlocks,
  markDiff,
  pageChanges,
  similarity,
  tokenize,
  wordDiff,
} from "./index"

// seam은 셋이다. 순수 함수(어절 나누기, 블록 맞추기, 어절 diff, 페이지 목록)는 문자열과 mdast만 받는다.
// markDiff는 빌드와 같은 구문 확장으로 파싱한 트리를 고치고, 그 트리를 HTML로 그려 표시를 본다.
// 플러그인은 임시 git 저장소에서 WIKI_DIFF를 주고 불러 본다.

// 빌드에서 이 플러그인이 도는 때(OFM의 변환 전)의 트리와 같도록 구문 확장만 붙인다.
const ctx = { allSlugs: [], cfg: { configuration: {} } } as unknown as BuildCtx
type Plugin = (opts?: object) => { markdownPlugins?: (ctx: never) => PluggableList }
const syntax = [ObsidianFlavoredMarkdown, GitHubFlavoredMarkdown, Latex, NoteProperties].map(
  (plugin) => (plugin as unknown as Plugin)().markdownPlugins!(ctx as never)[0],
)
const processor = unified()
  .use(remarkParse)
  .use(syntax as PluggableList)
const parse = (source: string) => processor.parse(source) as Root

const blocksOf = (source: string) => extractBlocks(parse(source), source)
const ops = (before: string, after: string, embedChanged?: (target: string) => boolean) =>
  alignBlocks(blocksOf(before), blocksOf(after), embedChanged).map(
    (op) => `${op.type}:${(op.after ?? op.before)!.text}`,
  )

function html(before: string | null, after: string, embedChanged?: (target: string) => boolean) {
  const root = parse(after)
  const base = before === null ? null : { root: parse(before), source: before }
  markDiff(root, after, base, embedChanged)
  const hast = unified().use(remarkRehype, { allowDangerousHtml: true }).runSync(root)
  return render(
    toJsxRuntime(hast, { Fragment, jsx: jsx as Jsx, jsxs: jsxs as Jsx }) as preact.VNode,
  )
}

// callout은 빌드처럼 OFM의 text transform을 거친 원본으로 비교하고, 표시한 트리에 OFM의 변환을 돌려
// OFM이 여전히 callout으로 알아보는지 본다
const ofm = (ObsidianFlavoredMarkdown as unknown as () => Required<ReturnType<Plugin>>)()
const ofmText = (source: string) =>
  (ofm as unknown as { textTransform: (ctx: never, src: string) => string }).textTransform(
    ctx as never,
    source,
  )
type Callout = { type: string; data?: { hProperties?: Record<string, unknown> }; children: never[] }

function callout(
  before: string,
  after: string,
): { attributes: Record<string, unknown>; html: string } {
  const [base, current] = [ofmText(before), ofmText(after)]
  const root = parse(current)
  markDiff(root, current, { root: parse(base), source: base })
  const file = new VFile({ value: current, data: { slug: "page" as never } })
  unified()
    .use(ofm.markdownPlugins(ctx as never))
    .runSync(root as never, file)
  const quote = root.children.find((node) => node.type === "blockquote") as unknown as Callout
  const title = (quote.children[0] as { value?: string }).value ?? ""
  return { attributes: quote.data?.hProperties ?? {}, html: title }
}

describe("어절 나누기", () => {
  test("공백으로 나누고 원본 오프셋을 단다", () => {
    assert.deepStrictEqual(tokenize("가 나다  라", 10), [
      { text: "가", start: 10, end: 11 },
      { text: "나다", start: 12, end: 14 },
      { text: "라", start: 16, end: 17 },
    ])
  })

  test("별칭에 공백이 있는 위키링크는 한 어절이다", () => {
    assert.deepStrictEqual(
      tokenize("앞 [[can|CAN 버스]]에서 끝").map((t) => t.text),
      ["앞", "[[can|CAN 버스]]에서", "끝"],
    )
  })
})

describe("어절 유사도", () => {
  test("공통 어절의 비율이다", () => {
    assert.strictEqual(similarity(["a", "b", "c", "d"], ["a", "b", "x", "y"]), 0.5)
    assert.strictEqual(similarity(["a", "b"], ["a", "b"]), 1)
    assert.strictEqual(similarity([], []), 1)
    assert.strictEqual(similarity(["a"], []), 0)
  })
})

describe("블록 맞추기", () => {
  test("같은 블록은 그대로 둔다", () => {
    assert.deepStrictEqual(ops("가 나\n\n다 라", "가 나\n\n다 라"), ["same:가 나", "same:다 라"])
  })

  test("유사도가 기준값이면 바뀜, 그 아래면 지운 블록과 새 블록이다", () => {
    assert.strictEqual(SIMILARITY_THRESHOLD, 0.5)
    assert.deepStrictEqual(ops("a b c d", "a b x y"), ["changed:a b x y"])
    assert.deepStrictEqual(ops("a b c d e", "a b x y z"), ["removed:a b c d e", "added:a b x y z"])
  })

  test("종류가 다르면 어절이 같아도 바뀜이 아니다", () => {
    assert.deepStrictEqual(ops("a b c", "- a b c"), ["removed:a b c", "added:a b c"])
  })

  test("인용 번호가 밀려도 관계없는 문단은 그대로다", () => {
    const before = "첫 문단.[@b]\n\n둘째 문단.[@c]"
    const after = "새 문단.[@a]\n\n첫 문단.[@b]\n\n둘째 문단.[@c]"
    assert.deepStrictEqual(ops(before, after), [
      "added:새 문단.[@a]",
      "same:첫 문단.[@b]",
      "same:둘째 문단.[@c]",
    ])
  })

  test("인용문과 callout은 속의 블록을 하나씩 비교한다", () => {
    const before = "> [!note] 제목\n> 본문 하나 둘\n>\n> 둘째 문단 그대로"
    const after = "> [!note] 제목\n> 본문 하나 셋\n>\n> 둘째 문단 그대로"
    assert.deepStrictEqual(
      ops(before, after).map((op) => op.split(":")[0]),
      ["changed", "same"],
    )
  })

  test("중첩 목록은 안쪽 항목까지 들어가고 바깥 항목은 자기 문단만 본다", () => {
    const before = "- 바깥 항목\n  - 안쪽 하나\n  - 안쪽 둘"
    const after = "- 바깥 항목\n  - 안쪽 하나\n  - 안쪽 셋 넷 다섯"
    assert.deepStrictEqual(ops(before, after), [
      "same:바깥 항목",
      "same:안쪽 하나",
      "removed:안쪽 둘",
      "added:안쪽 셋 넷 다섯",
    ])
  })

  test("표는 행 단위로 비교한다", () => {
    const table = (row: string) => `| 이름 | 값 |\n| --- | --- |\n| 가 | 1 |\n${row}`
    assert.deepStrictEqual(
      ops(table("| 나 | 2 |"), table("| 나 | 3 |")).map((op) => op.split(":")[0]),
      ["same", "same", "changed"],
    )
  })

  test("프런트매터는 비교하지 않는다", () => {
    assert.deepStrictEqual(ops("---\ntitle: 가\n---\n\n본문", "---\ntitle: 나\n---\n\n본문"), [
      "same:본문",
    ])
  })

  test("가리키는 SVG가 바뀐 도해 임베드는 줄이 같아도 바뀜이다", () => {
    const source = "앞\n\n![[diagrams/a.svg]]\n\n![[diagrams/b.svg]]"
    const changed = (target: string) => target === "diagrams/a.svg"
    assert.deepStrictEqual(ops(source, source, changed), [
      "same:앞",
      "changed:![[diagrams/a.svg]]",
      "same:![[diagrams/b.svg]]",
    ])
  })

  test("목록 항목 안이나 글 가운데의 도해 임베드도 SVG가 바뀌면 바뀜이다", () => {
    const source = "- ![[diagrams/a.svg]]\n- 글 ![[diagrams/a.svg]]\n- 글 ![[diagrams/b.svg]]"
    const changed = (target: string) => target === "diagrams/a.svg"
    assert.deepStrictEqual(ops(source, source, changed), [
      "changed:![[diagrams/a.svg]]",
      "changed:글 ![[diagrams/a.svg]]",
      "same:글 ![[diagrams/b.svg]]",
    ])
  })
})

describe("어절 diff", () => {
  test("새 어절의 범위와 빠진 어절의 자리를 준다", () => {
    const before = tokenize("가 나 다 라")
    const after = tokenize("가 마 바 라")
    assert.deepStrictEqual(wordDiff(before, after), {
      inserted: [[2, 5]],
      deleted: [{ at: 1, text: "나 다", lead: true }],
    })
  })

  test("맨 앞에서 빠진 어절은 첫 어절 앞에 둔다", () => {
    assert.deepStrictEqual(wordDiff(tokenize("가 나"), tokenize("나")).deleted, [
      { at: 0, text: "가", lead: false },
    ])
  })
})

describe("표시", () => {
  test("바뀐 문단 안에서 새 어절은 ins, 빠진 어절은 del이다", () => {
    const out = html("가 나 다 라", "가 마 다 라")
    assert.strictEqual(
      out,
      '<p class="wiki-diff-changed">가 <del class="wiki-diff-word">나</del> ' +
        '<ins class="wiki-diff-word"><span>마</span></ins> 다 라</p>',
    )
  })

  test("새 블록과 바뀐 블록은 다른 표시다", () => {
    const out = html("가 나 다 라", "가 나 다 마\n\n새 문단")
    assert.match(out, /<p class="wiki-diff-changed">/)
    assert.match(out, /<p class="wiki-diff-added">새 문단<\/p>/)
  })

  test("지운 블록은 원본 마크다운을 렌더하지 않고 이스케이프해 보인다", () => {
    const out = html("앞\n\n**굵게** <b>태그</b> [[can|CAN 버스]][@k]\n\n뒤", "앞\n\n뒤")
    assert.strictEqual(
      out,
      "<p>앞</p>\n" +
        '<div class="wiki-diff-removed"><del class="wiki-diff-source">' +
        "**굵게** &lt;b>태그&lt;/b> [[can|CAN 버스]][@k]</del></div>\n<p>뒤</p>",
    )
  })

  test("지운 목록 항목과 표 행은 제자리에 같은 꼴로 둔다", () => {
    const list = html("- 가\n- 나\n- 다", "- 가\n- 다")
    assert.match(
      list,
      /<li>가<\/li>\s*<li class="wiki-diff-removed"><del class="wiki-diff-source">- 나<\/del><\/li>\s*<li>다<\/li>/,
    )
    const table = (rows: string) => `| a | b |\n| - | - |\n${rows}`
    const rows = html(table("| 1 | 2 |\n| 3 | 4 |"), table("| 3 | 4 |"))
    assert.match(
      rows,
      /<tr class="wiki-diff-removed"><td><del class="wiki-diff-source">1<\/del><\/td><td><del class="wiki-diff-source">2<\/del><\/td><\/tr>\s*<tr><td>3<\/td>/,
    )
  })

  test("새 목록 항목은 자기 글자만 ins로 감싼다", () => {
    const out = html("- 가", "- 가\n- 나\n  - 다")
    assert.match(
      out,
      /<li class="wiki-diff-added"><ins class="wiki-diff-word"><span>나<\/span><\/ins>/,
    )
  })

  test("위키링크는 쪼개지 않고 통째로 감싼다", () => {
    const root = parse("앞 [[can|CAN 버스]] 뒤")
    markDiff(root, "앞 [[can|CAN 버스]] 뒤", { root: parse("앞 뒤"), source: "앞 뒤" })
    const paragraph = root.children[0] as unknown as { children: { type: string }[] }
    assert.deepStrictEqual(
      paragraph.children.map((node) => node.type),
      ["text", "wikiDiffIns", "text"],
    )
  })

  test("이스케이프와 인용문 접두어가 있어도 어절 자리를 맞춘다", () => {
    const out = html("> 가 \\*나\\*\n> 다", "> 가 \\*나\\*\n> 다 라")
    assert.match(out, /가 \*나\*\n다 <ins class="wiki-diff-word"><span>라<\/span><\/ins>/)
  })

  test("SVG만 바뀐 도해 임베드는 바뀜으로 표시한다", () => {
    const source = "![[diagrams/a.svg]]"
    assert.match(
      html(source, source, () => true),
      /<p class="wiki-diff-changed">/,
    )
  })

  test("새 페이지는 블록을 칠하지 않고 맨 위에 안내 하나만 둔다", () => {
    assert.strictEqual(
      html(null, "가\n\n나"),
      '<div class="wiki-diff-added wiki-diff-new-page">새 페이지. 기준에 없던 페이지라 블록마다 표시하지 않는다.</div>\n<p>가</p>\n<p>나</p>',
    )
  })

  test("새 페이지의 안내는 frontmatter 뒤에 둔다", () => {
    const root = parse("---\ntitle: 가\n---\n\n나")
    markDiff(root, "---\ntitle: 가\n---\n\n나", null)
    assert.deepStrictEqual(
      root.children.map((node) => node.type),
      ["yaml", "wikiDiffNewPage", "paragraph"],
    )
  })

  test("코드 블록처럼 속성을 달 수 없는 블록은 div로 감싼다", () => {
    const out = html("가", "가\n\n```\nx\n```")
    assert.match(out, /<div class="wiki-diff-added"><pre><code>x\n<\/code><\/pre><\/div>/)
  })

  test("지운 바깥 항목은 앞 항목의 안쪽 목록이 아니라 같은 깊이에 둔다", () => {
    const out = html("- 가\n  - 가1\n- 나\n- 다", "- 가\n  - 가1\n- 다")
    assert.match(
      out,
      /<li>가1<\/li>\s*<\/ul>\s*<\/li>\s*<li class="wiki-diff-removed"><del class="wiki-diff-source">- 나<\/del><\/li>\s*<li>다<\/li>/,
    )
  })

  test("빠진 어절 바로 뒤에 글자가 오면 띄운다", () => {
    const table = (row: string) => `| a | b |\n| - | - |\n${row}`
    const out = html(table("| x y | p q |"), table("| x y | q |"))
    assert.match(out, /<del class="wiki-diff-word">p<\/del> q/)
  })
})

describe("callout", () => {
  test("제목이 바뀌어도 callout으로 남고 제목에 어절 diff가 보인다", () => {
    const { attributes, html } = callout("> [!note] 옛 제목\n> 본문", "> [!note] 새 제목\n> 본문")
    assert.strictEqual(attributes["data-callout"], "note")
    assert.match(html, /<del class="wiki-diff-word">옛<\/del>/)
    assert.match(html, /<ins class="wiki-diff-word"><span>새<\/span><\/ins>/)
  })

  test("종류가 바뀌면 새 종류의 callout이고 옛 지시어는 제목에 del로 보인다", () => {
    const { attributes, html } = callout("> [!note] 제목\n> 본문", "> [!warning] 제목\n> 본문")
    assert.strictEqual(attributes["data-callout"], "warning")
    assert.match(html, /<del class="wiki-diff-word">\[!note\]<\/del>/)
  })

  test("지운 블록을 callout의 맨 앞에 넣지 않는다", () => {
    const { attributes } = callout(
      "> [!note] 옛 제목 하나 둘 셋\n> 본문",
      "> [!warning] 새것\n> 본문",
    )
    assert.strictEqual(attributes["data-callout"], "warning")
  })
})

describe("바뀐 페이지 목록", () => {
  const base = new Map([
    ["a.md", "1"],
    ["b.md", "2"],
    ["c.md", "3"],
    ["d.md", "4"],
    ["diagrams/x.svg", "5"],
    ["private/p.md", "6"],
  ])
  const disk = new Map([
    ["a.md", "1"],
    ["b.md", "9"],
    ["d.md", "4"],
    ["e.md", "7"],
    ["diagrams/x.svg", "8"],
  ])
  const sources: Record<string, string> = { "d.md": "![[diagrams/x.svg]]" }
  const changes = pageChanges({
    base,
    disk,
    files: [...disk.keys()],
    ignorePatterns: ["private"],
    read: (file) => sources[file] ?? "",
  })

  test("새 페이지, 지운 페이지, 바뀐 페이지를 나눈다", () => {
    assert.deepStrictEqual(changes, {
      added: ["e.md"],
      removed: ["c.md"],
      changed: ["b.md", "d.md"],
    })
  })
})

describe("플러그인", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-diff-"))
  after(() => fs.rmSync(tmp, { recursive: true, force: true }))
  const run = (args: string[]) => execFileSync("git", args, { cwd: tmp, stdio: "pipe" })
  run(["init", "-q", "-b", "main"])
  fs.mkdirSync(path.join(tmp, "content"))
  fs.writeFileSync(path.join(tmp, "content", "a.md"), "가")
  run(["add", "."])
  run(["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "a"])

  const pluginCtx = {
    argv: { directory: path.join(tmp, "content"), output: path.join(tmp, "public") },
    cfg: { configuration: { ignorePatterns: [] }, plugins: { transformers: [] } },
    allFiles: ["a.md"],
  } as unknown as BuildCtx

  function withEnv<T>(value: string | undefined, fn: () => T): T {
    const saved = process.env.WIKI_DIFF
    if (value === undefined) delete process.env.WIKI_DIFF
    else process.env.WIKI_DIFF = value
    try {
      return fn()
    } finally {
      if (saved === undefined) delete process.env.WIKI_DIFF
      else process.env.WIKI_DIFF = saved
    }
  }

  test("WIKI_DIFF가 없으면 아무 일도 하지 않는다", () => {
    withEnv(undefined, () => {
      const plugin = WikiDiff()
      assert.deepStrictEqual(plugin.markdownPlugins!(pluginCtx), [])
      assert.strictEqual(plugin.externalResources!(pluginCtx), undefined)
    })
  })

  test("없는 ref를 주면 이유를 알리며 실패한다", () => {
    withEnv("no-such-ref", () => {
      assert.throws(() => WikiDiff().markdownPlugins!(pluginCtx), /WIKI_DIFF=no-such-ref/)
    })
  })

  test("WIKI_DIFF를 주면 CSS를 넣고 바뀐 페이지 목록을 찍는다", (t) => {
    const log = t.mock.method(console, "log", () => {})
    withEnv("main", () => {
      const resources = WikiDiff().externalResources!(pluginCtx)
      assert.match(resources!.css![0].content, /wiki-diff-added/)
      // 브라우저 스크립트는 문자열이라 타입 검사를 받지 않는다. 적어도 문법은 맞아야 한다.
      const script = resources!.js![0]
      assert.strictEqual(script.contentType, "inline")
      assert.doesNotThrow(() => new Function(script.contentType === "inline" ? script.script : ""))
    })
    assert.match(String(log.mock.calls[0].arguments[0]), /main 기준.*\n.*바뀐 페이지가 없다/)
  })

  // `--serve`의 재빌드는 목록을 찍은 뒤에야 ctx.allFiles를 고친다. 목록은 디스크에서 찾아야 한다.
  test("목록은 ctx.allFiles가 아니라 content 폴더에서 찾는다", (t) => {
    const log = t.mock.method(console, "log", () => {})
    fs.writeFileSync(path.join(tmp, "content", "b.md"), "나")
    try {
      withEnv("main", () => WikiDiff().externalResources!(pluginCtx))
    } finally {
      fs.rmSync(path.join(tmp, "content", "b.md"))
    }
    assert.match(String(log.mock.calls[0].arguments[0]), /새 페이지 \(1\): b\.md/)
    // 브라우저의 문서 간 이동도 같은 목록을 빌드마다 출력 폴더에서 읽는다
    const pages = fs.readFileSync(
      path.join(tmp, "public", "static", "wiki-diff-pages.json"),
      "utf8",
    )
    assert.deepStrictEqual(JSON.parse(pages), { pages: ["b"] })
  })
})
