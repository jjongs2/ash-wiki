// ash-wiki: SPA 이동 뒤 포커스를 새 페이지의 제목으로 옮긴다(spa.inline.ts, #633). 포커스가 body로 떨어지면
// 다음 Tab이 새 페이지의 엉뚱한 자리에서 이어지고, 화면 낭독기는 어디에 왔는지 읽지 않는다.

type FocusRoot = Pick<Document, "getElementById" | "querySelector">

// 포커스를 받을 제목. 주소에 절(#id)이 있고 페이지에 그 요소가 있으면 그 절의 제목, 아니면 <main> 안의 페이지
// 제목(첫 h1)이다.
export function routeFocusTarget(root: FocusRoot, hash: string): HTMLElement | null {
  if (hash.length > 1) {
    const section = root.getElementById(decodeURIComponent(hash.slice(1)))
    if (section) return section
  }
  return root.querySelector<HTMLElement>("#quartz-main h1")
}

// 제목에 포커스를 옮긴다. 제목은 Tab 정지가 아니라 tabindex="-1"을 붙였다가 포커스가 떠나면 뗀다. 화면은
// 움직이지 않는다(스크롤은 라우터가 정한다). 링은 그리지 않는다(custom.scss).
export function focusRouteTarget(target: HTMLElement) {
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1")
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true })
  }
  target.focus({ preventScroll: true })
}
