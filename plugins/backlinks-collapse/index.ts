// ash-wiki: Backlinks를 목차처럼 제목을 눌러 접고 펼 수 있게 하고, 주간 소식을 따로 묶는 로컬 플러그인이다.
// backlinks 플러그인에는 접기 옵션이 없어, 페이지에 스크립트와 CSS만 싣고 node_modules는 고치지 않는다.
// 스크립트는 Backlinks의 <h3> 제목을 목차와 같은 꼴의 버튼(<button> 안에 <h3>와 접기 표시)으로 감싸고,
// 누르면 버튼과 목록에 collapsed를 켜고 끄며 aria-expanded를 바꾼다. 처음엔 펼쳐 둔다.
// 감싸기 전에 Backlinks 목록에서 주간 소식(news/ 아래)을 빼, 그 아래 "이 페이지가 나온 주간 소식" 묶음으로
// 옮긴다. 이 묶음은 같은 꼴의 버튼으로 감싸되 처음엔 접어 둔다. 위키 페이지끼리의 연결과 섞이지 않게 하려는
// 것이다(ADR 0015). 주간 소식만 가리키는 페이지는 Backlinks 제목과 목록을 지우고 주간 소식 묶음만 남긴다.
// 어느 링크가 주간 소식인지는 순수 함수 splitBacklinks가 정하고, 스크립트는 그 소스를 그대로 싣는다.
// 데스크톱의 오른쪽 사이드바는 화면이 낮으면 Backlinks 칸을 줄이고 넘친 아래를 잘라 낸다
// (quartz/styles/custom.scss). 그대로 두면 위키 목록이 칸을 다 차지해 펼친 주간 소식 목록이 잘리므로, 주간 소식
// 묶음이 있는 칸(with-news)은 세로 flex로 두어 위키 목록만 줄이고, 주간 소식 목록은 8rem까지 줄이지 않는다.
// SPA 이동은 사이드바를 새 페이지의 마크업으로 되돌리므로 nav 이벤트마다 다시 감싼다. 첫 로드의 nav는
// 가장 늦게 도는 postscript가 보내 첫 페인트 뒤에야 오므로, 스크립트가 돌 때 곧바로 한 번 감싼다. 그러지
// 않으면 접기 표시가 늦게 나타나며 목록이 밀린다. Backlinks가 없는 페이지에는 backlinks 플러그인이 칸을
// 내지 않으므로 할 일이 없다.
// 버튼 CSS는 목차 컴포넌트의 `button.toc-header` 규칙을 이름만 바꿔 옮겼다. 목록은 목차처럼 칸의
// flex-basis를 줄여 잘라 내지 않고 display로 숨긴다. 모바일과 태블릿에서는 오른쪽 사이드바가 가로로 놓여,
// flex-basis를 줄이면 높이가 아니라 폭이 줄어든다(목차는 거기서 숨겨져 이 문제가 없다).
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
import type { QuartzTransformerPlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "backlinks-collapse",
  displayName: "Backlinks collapse",
  description: "Backlinks를 제목을 눌러 접고 펼 수 있게 한다",
  version: "1.0.0",
  category: "transformer",
}

/**
 * Backlinks 링크의 경로(pathname) 목록을 위키 페이지와 주간 소식 두 목록으로 나눈다. 주간 소식은 경로의
 * 마지막 마디 바로 앞이 news인 것이다. 위키 페이지는 tags/ 밖에서 폴더를 쓰지 않으므로 겹치지 않는다.
 * 위키 페이지는 받은 순서 그대로, 주간 소식은 최근 호부터 둔다. ISO 주차(2026-W41)는 글자 순서가 주차 순서다.
 */
export function splitBacklinks(paths: string[]): { pages: string[]; news: string[] } {
  const isNews = (path: string) => /(?:^|\/)news\/[^/]+$/.test(path)
  return {
    pages: paths.filter((path) => !isNews(path)),
    news: paths.filter(isNews).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)),
  }
}

const CSS = `button.backlinks-header {
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  padding: 0;
  color: var(--dark);
  display: flex;
  align-items: center;
}
button.backlinks-header h3 {
  font-size: 1rem;
  display: inline-block;
  margin: 0;
}
button.backlinks-header .fold {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
  opacity: 0.8;
}
button.backlinks-header.collapsed .fold {
  transform: rotateZ(-90deg);
}
.backlinks > ul.collapsed {
  display: none;
}
.backlinks > ul + button.backlinks-header {
  margin-top: 0.5rem;
}
.backlinks.with-news {
  display: flex;
  flex-direction: column;
}
.backlinks.with-news > button.backlinks-header {
  flex-shrink: 0;
}
.backlinks.with-news > ul.overflow {
  flex: 0 1 auto;
  min-height: 0;
  max-height: none;
}
.backlinks.with-news > ul.news-backlinks {
  flex-shrink: 0;
  max-height: 8rem;
}
`

const SCRIPT = `(() => {
  const splitBacklinks = ${splitBacklinks.toString()}
  const NEWS_TITLE = "이 페이지가 나온 주간 소식"
  const FOLD = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fold"><polyline points="6 9 12 15 18 9"></polyline></svg>'

  function toggle() {
    const collapse = this.getAttribute("aria-expanded") === "true"
    this.setAttribute("aria-expanded", String(!collapse))
    this.classList.toggle("collapsed", collapse)
    this.nextElementSibling?.classList.toggle("collapsed", collapse)
  }

  function wrap(title, list, expanded) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = expanded ? "backlinks-header" : "backlinks-header collapsed"
    if (list.id) button.setAttribute("aria-controls", list.id)
    button.setAttribute("aria-expanded", String(expanded))
    list.classList.toggle("collapsed", !expanded)
    title.replaceWith(button)
    button.append(title)
    button.insertAdjacentHTML("beforeend", FOLD)
    button.addEventListener("click", toggle)
    window.addCleanup?.(() => button.removeEventListener("click", toggle))
  }

  // 주간 소식 링크를 목록에서 빼 그 아래 새 묶음(제목과 목록)으로 옮긴다
  function moveNews(backlinks, title, list) {
    const items = [...list.querySelectorAll(":scope > li")].filter((li) => li.querySelector("a"))
    const pathOf = (li) => new URL(li.querySelector("a").getAttribute("href"), location.href).pathname
    const { pages, news } = splitBacklinks(items.map(pathOf))
    if (news.length === 0) return null
    const newsTitle = document.createElement("h3")
    newsTitle.textContent = NEWS_TITLE
    const newsList = document.createElement("ul")
    newsList.className = list.className + " news-backlinks"
    backlinks.classList.add("with-news")
    newsList.id = list.id + "-news"
    for (const path of news) newsList.append(items.find((li) => pathOf(li) === path))
    backlinks.append(newsTitle, newsList)
    if (pages.length === 0) {
      title.remove()
      list.remove()
    }
    return { newsTitle, newsList }
  }

  function setup() {
    for (const backlinks of document.querySelectorAll(".backlinks")) {
      // 이미 감쌌으면 제목이 버튼 안에 있어 건너뛴다
      const title = backlinks.querySelector(":scope > h3")
      const list = backlinks.querySelector(":scope > ul")
      if (!title || !list) continue
      const moved = moveNews(backlinks, title, list)
      if (title.isConnected) wrap(title, list, true)
      if (moved) {
        const { newsTitle, newsList } = moved
        wrap(newsTitle, newsList, false)
      }
    }
  }

  setup()
  document.addEventListener("nav", setup)
})()
`

const BacklinksCollapse: QuartzTransformerPlugin = () => {
  return {
    name: "BacklinksCollapse",
    // 본문은 고치지 않는다. 설정 로더가 이 메서드들 가운데 하나가 없는 transformer를 건너뛰므로 둔다.
    htmlPlugins() {
      return []
    },
    externalResources() {
      return {
        css: [{ content: CSS, inline: true }],
        js: [{ loadTime: "afterDOMReady", contentType: "inline", script: SCRIPT }],
      }
    },
  }
}

export default BacklinksCollapse
