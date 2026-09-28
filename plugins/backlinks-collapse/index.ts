// ash-wiki: Backlinks를 목차처럼 제목을 눌러 접고 펼 수 있게 하는 로컬 플러그인이다.
// backlinks 플러그인에는 접기 옵션이 없어, 페이지에 스크립트와 CSS만 싣고 node_modules는 고치지 않는다.
// 스크립트는 Backlinks의 <h3> 제목을 목차와 같은 꼴의 버튼(<button> 안에 <h3>와 접기 표시)으로 감싸고,
// 누르면 버튼과 목록에 collapsed를 켜고 끄며 aria-expanded를 바꾼다. 처음엔 펼쳐 둔다.
// SPA 이동은 사이드바를 새 페이지의 마크업으로 되돌리므로 nav 이벤트마다 다시 감싼다. Backlinks가 없는
// 페이지에는 backlinks 플러그인이 칸을 내지 않으므로 할 일이 없다.
// 버튼 CSS는 목차 컴포넌트의 `button.toc-header` 규칙을 이름만 바꿔 옮겼다. 목록은 display로 숨긴다.
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
`

const SCRIPT = `(() => {
  const FOLD = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fold"><polyline points="6 9 12 15 18 9"></polyline></svg>'

  function toggle() {
    const collapse = this.getAttribute("aria-expanded") === "true"
    this.setAttribute("aria-expanded", String(!collapse))
    this.classList.toggle("collapsed", collapse)
    this.nextElementSibling?.classList.toggle("collapsed", collapse)
  }

  function setup() {
    for (const backlinks of document.querySelectorAll(".backlinks")) {
      // 이미 감쌌으면 제목이 버튼 안에 있어 건너뛴다
      const title = backlinks.querySelector(":scope > h3")
      const list = backlinks.querySelector(":scope > ul")
      if (!title || !list) continue
      const button = document.createElement("button")
      button.type = "button"
      button.className = "backlinks-header"
      if (list.id) button.setAttribute("aria-controls", list.id)
      button.setAttribute("aria-expanded", "true")
      title.replaceWith(button)
      button.append(title)
      button.insertAdjacentHTML("beforeend", FOLD)
      button.addEventListener("click", toggle)
      window.addCleanup?.(() => button.removeEventListener("click", toggle))
    }
  }

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
