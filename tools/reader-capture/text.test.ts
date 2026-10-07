import test, { describe } from "node:test"
import assert from "node:assert"
import { diagramSources, readerText, svgLines } from "./text"

// 렌더된 페이지 HTML을 독자 텍스트로 바꾸는 함수를 seam으로 본다. HTML은 Quartz가 내는 꼴을 줄여 옮겼다.
function page(article: string, extra = ""): string {
  return `<html><body data-slug="semaphore"><div id="quartz-root">
<div class="left sidebar"><h2 class="page-title"><a href=".">Æ wiki</a></h2></div>
<div class="center"><div class="page-header"><div class="popover-hint">
<nav class="breadcrumb-container"><div class="breadcrumb-element"><a href="./">Home</a></div></nav>
<h1 class="article-title">세마포어</h1>
<details class="note-properties metadata-container" open><summary>Properties</summary>
<table class="note-properties-table"><tbody>
<tr><td class="note-properties-key">tags</td><td class="note-properties-value"><span class="note-properties-tags"><a href="./tags/platform/rtos" class="internal internal-link tag-link">platform/rtos</a></span></td></tr>
<tr><td class="note-properties-key">verified</td><td class="note-properties-value"><span class="note-properties-text">2026-10-07</span></td></tr>
</tbody></table></details>
<p class="content-meta"><time>Oct 07, 2026</time><span>9 min read</span></p></div></div>
<article class="popover-hint"><div class="markdown-preview-view markdown-rendered">${article}</div></article>
${extra}
<div class="page-footer"></div></div>
<div class="right sidebar"><div class="backlinks"><h3>Backlinks</h3><ul><li><a href="./mutex" class="internal" data-slug="mutex">뮤텍스</a></li></ul></div></div>
</div></body></html>`
}

const citation = (n: number, key: string) =>
  `<span class id="citation--${key}--${n}">[<a href="#bib-${key}" data-no-popover="true">${n}</a>]</span>`

describe("readerText", () => {
  test("제목과 속성, 본문 문단, 인용 번호를 옮긴다", () => {
    const { text } = readerText(
      page(
        `<p><strong>세마포어</strong>(semaphore)는 동기화 객체다.${citation(1, "dijkstra")} <code>sem_wait</code>는 줄인다.</p>`,
      ),
    )
    assert.strictEqual(
      text,
      [
        "# 세마포어",
        "",
        "tags: platform/rtos",
        "verified: 2026-10-07",
        "",
        "**세마포어**(semaphore)는 동기화 객체다.[1] `sem_wait`는 줄인다.",
        "",
      ].join("\n"),
    )
  })

  test("위키링크는 슬러그를, 바깥 링크는 주소를 적고, 위키링크 슬러그를 모은다", () => {
    const { text, links } = readerText(
      page(
        `<p><a href="./ieee-1003-1" class="internal internal-link alias" data-slug="ieee-1003-1">POSIX.1</a>-2024와 <a href="./mutex#소유권" class="internal internal-link alias" data-slug="mutex">뮤텍스</a>, <a href="#쓰임" class="internal internal-link">쓰임</a>, <a href="https://example.org/a" class="external">예시</a>, <a href="./ieee-1003-1" class="internal" data-slug="ieee-1003-1">다시</a>.</p>`,
      ),
    )
    assert.match(
      text,
      /\[POSIX\.1\]\(→ ieee-1003-1\)-2024와 \[뮤텍스\]\(→ mutex#소유권\), \[쓰임\]\(→ #쓰임\), \[예시\]\(https:\/\/example\.org\/a\), \[다시\]\(→ ieee-1003-1\)\./,
    )
    // 태그, 사이드바의 backlinks, 같은 페이지 앵커는 링크된 페이지가 아니다.
    assert.deepStrictEqual(links, ["ieee-1003-1", "mutex"])
  })

  test("절 제목과 접힌 절을 표시하고, 제목의 앵커 아이콘은 뺀다", () => {
    const { text } = readerText(
      page(
        `<details class="collapsible-section" open><summary><h2 id="a">펼친 절<a role="anchor" aria-hidden="true" href="#a" class="internal internal-link"><svg><path d="M0"></path></svg></a></h2></summary>
<p>본문</p></details><details class="collapsible-section"><summary><h2 id="b">접힌 절</h2></summary>
<h3 id="c">아래 절</h3><p>숨은 본문</p></details>`,
      ),
    )
    assert.match(
      text,
      /\n## 펼친 절\n\n본문\n\n## 접힌 절 \(접힌 채로 보임\)\n\n### 아래 절\n\n숨은 본문\n/,
    )
  })

  test("목록과 표를 줄로 옮긴다", () => {
    const { text } = readerText(
      page(
        `<ul><li>하나<ul><li>안쪽</li></ul></li><li>둘</li></ul><ol><li>첫째</li><li>둘째</li></ol>
<div class="table-container"><table><thead><tr><th>제품</th><th>비트 수</th></tr></thead><tbody><tr><td>Zephyr</td><td>32비트${citation(4, "zephyr")}</td></tr></tbody></table></div>`,
      ),
    )
    assert.match(
      text,
      /\n- 하나\n {2}- 안쪽\n- 둘\n\n1\. 첫째\n2\. 둘째\n\n\| 제품 \| 비트 수 \|\n\| --- \| --- \|\n\| Zephyr \| 32비트\[4\] \|\n/,
    )
  })

  test("callout과 접힌 callout, 수식을 옮긴다", () => {
    const { text } = readerText(
      page(
        `<blockquote class="callout note" data-callout="note"><div class="callout-title"><div class="callout-icon"></div><div class="callout-title-inner"><p>Note</p></div></div><div class="callout-content"><p>매체를 정하지 않는다.</p></div></blockquote>
<blockquote class="callout note is-collapsible is-collapsed" data-callout="note"><div class="callout-title"><div class="callout-title-inner"><p>더 보기</p></div></div><div class="callout-content"><p>안쪽</p></div></blockquote>
<p>크기 <span class="katex"><span class="katex-html" aria-hidden="true"><span class="mord">S</span><span class="mrel">&gt;</span><span class="mord">W</span></span></span>를 만족한다.</p>`,
      ),
    )
    assert.match(
      text,
      /\n> \[!note\] Note\n> 매체를 정하지 않는다\.\n\n> \[!note\] 더 보기 \(접힌 채로 보임\)\n> 안쪽\n/,
    )
    assert.match(text, /크기 \$S>W\$를 만족한다\./)
  })

  test("도해는 파일 이름과 도해 안의 글자를 줄마다 적는다", () => {
    const { text } = readerText(
      page(
        `<p><object data="diagrams/lost-event.svg" type="image/svg+xml"></object></p><p><img src="diagrams/photo.png" alt="보드 사진"></p>`,
      ),
      new Map([["diagrams/lost-event.svg", ["첫 인터럽트 두 번째 인터럽트", "태스크 대기"]]]),
    )
    assert.match(
      text,
      /\n\[도해 diagrams\/lost-event\.svg\. 도해 안의 글자, 위에서 아래로:\]\n> 첫 인터럽트 두 번째 인터럽트\n> 태스크 대기\n\n\[그림 diagrams\/photo\.png: 보드 사진\]\n/,
    )
  })

  test("참고문헌은 번호와 항목을 한 줄씩 적는다", () => {
    const { text } = readerText(
      page(
        `<p>본문</p><div id="refs" class="references csl-bib-body">
  <div class="csl-entry" id="bib-a"><div class="csl-left-margin">[1]</div><div class="csl-right-inline">E. W. Dijkstra, “EWD123.” 1965. Available: <a href="https://www.cs.utexas.edu/x" class="external">https://www.cs.utexas.edu/x</a></div></div>
</div>`,
      ),
    )
    assert.match(
      text,
      /\n## 참고문헌\n\n\[1\] E\. W\. Dijkstra, “EWD123\.” 1965\. Available: https:\/\/www\.cs\.utexas\.edu\/x\n$/,
    )
  })
})

describe("diagramSources", () => {
  test("본문의 도해 주소를 순서대로 한 번씩 모은다", () => {
    const html = page(
      `<p><object data="diagrams/a.svg"></object></p><p><object data="diagrams/b.svg"></object></p><p><object data="diagrams/a.svg"></object></p>`,
    )
    assert.deepStrictEqual(diagramSources(html), ["diagrams/a.svg", "diagrams/b.svg"])
  })
})

describe("svgLines", () => {
  test("text를 위에서 아래로, 같은 줄은 왼쪽에서 오른쪽으로 잇는다", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120">
<text x="280" y="18">두 번째</text><text x="160" y="18">첫</text>
<text x="110" y="53.4" text-anchor="end">태스크</text>
<text x="10" y="90"><tspan>나뉜</tspan> <tspan>글자</tspan></text>
<text x="140" y="53">대기</text>
</svg>`
    assert.deepStrictEqual(svgLines(svg), ["첫 두 번째", "태스크 대기", "나뉜 글자"])
  })
})
