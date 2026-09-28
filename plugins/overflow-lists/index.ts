// ash-wiki: 목차와 Backlinks의 목록이 잘리면 끝을 흐리게 하는 로컬 플러그인이다.
// 업스트림은 목록마다 id를 list-<번호>로 주고, 페이지를 불러오면 그 id로 목록을 찾아 끝(li.overflow-end)을
// IntersectionObserver로 지켜본다. 끝이 보이지 않으면 목록에 gradient-active를 붙여 아래를 흐린다
// (quartz/styles/base.scss). 그런데 번호를 패키지마다 따로 세어 세 목록이 모두 list-0을 받는다.
// getElementById는 첫 목록(탐색기)만 찾으므로, 목차와 Backlinks는 칸이 줄어 항목이 잘려도 흐림 표시가 붙지
// 않아 목록이 거기서 끝나는 것처럼 보인다.
// 이 스크립트는 id가 앞 목록과 겹치는 목록에 새 id를 주고, 그 목록의 끝을 업스트림과 같은 규칙으로 지켜본다.
// id가 겹치지 않는 첫 목록(탐색기)은 업스트림이 찾으므로 건드리지 않는다. 탐색기는 트리를 그릴 때 끝 표시를
// 목록 맨 앞에 다시 넣어 거기서도 흐림 표시가 붙지 않지만, id와는 다른 문제라 여기서 다루지 않는다.
// 목록 바로 앞의 제목 버튼(목차의 toc-header, Backlinks의 backlinks-header)은 aria-controls로 목록을 가리키게
// 한다. 목차는 업스트림이 없는 id를 적어 두고, Backlinks 버튼(plugins/backlinks-collapse)은 겹친 id를 옮겨
// 적어 탐색기를 가리킨다.
// SPA 이동은 사이드바를 새 페이지의 마크업으로 되돌리므로 nav 이벤트마다 다시 돈다. 첫 로드의 nav는 가장 늦게
// 도는 postscript가 보내므로 스크립트가 돌 때 곧바로 한 번 돈다. backlinks-collapse와 도는 순서는 상관없다.
// 그쪽이 먼저 돌면 이 스크립트가 버튼의 aria-controls를 고치고, 나중에 돌면 이미 바뀐 id를 옮겨 적는다.
//
// 빌드가 이 파일을 Node의 type stripping으로 불러오므로, 타입만 지우면 돌아가는 문법만 쓴다. enum, namespace,
// parameter property를 쓰지 않고, 타입은 import type으로 가져온다.
import type { QuartzTransformerPlugin } from "../../quartz/plugins/types"

export const manifest = {
  name: "overflow-lists",
  displayName: "Overflow lists",
  description: "목차와 Backlinks의 목록이 잘리면 끝을 흐리게 한다",
  version: "1.0.0",
  category: "transformer",
}

const SCRIPT = `(() => {
  function setup() {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.parentElement?.classList.toggle("gradient-active", !entry.isIntersecting)
      }
    })
    const lists = [...document.querySelectorAll("ul.overflow")]
    lists.forEach((list, index) => {
      if (!list.id || document.getElementById(list.id) === list) return
      list.id = "overflow-list-" + index
      const header = list.previousElementSibling
      if (header?.tagName === "BUTTON") header.setAttribute("aria-controls", list.id)
      const end = list.querySelector(":scope > li.overflow-end")
      if (end) observer.observe(end)
    })
    window.addCleanup?.(() => observer.disconnect())
  }

  setup()
  document.addEventListener("nav", setup)
})()
`

const OverflowLists: QuartzTransformerPlugin = () => {
  return {
    name: "OverflowLists",
    // 본문은 고치지 않는다. 설정 로더가 이 메서드들 가운데 하나가 없는 transformer를 건너뛰므로 둔다.
    htmlPlugins() {
      return []
    },
    externalResources() {
      return {
        js: [{ loadTime: "afterDOMReady", contentType: "inline", script: SCRIPT }],
      }
    },
  }
}

export default OverflowLists
