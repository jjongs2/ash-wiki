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

// 페이지를 갈아 끼우기 전에, 앞 이동이나 건너뛰기 링크가 옮겨 둔 포커스(<main>과 tabindex="-1" 제목)를 푼다. 포커스를
// 쥔 요소가 남아 있으면 브라우저의 스크롤 고정(scroll anchoring)이 그 요소를 기준으로 삼아, 뒤로 가기의 스크롤 위치가
// 바뀐다.
export function releaseRouteFocus(doc: Document) {
  const active = doc.activeElement
  if (
    active instanceof HTMLElement &&
    active.matches('#quartz-main, #quartz-main [tabindex="-1"]')
  ) {
    active.blur()
  }
}

// 본문의 도해(<object>)를 다 읽을 때까지(읽지 못한 것 포함, 길어야 timeout) 기다린다. 도해는 읽은 뒤에야 높이가
// 정해지는데, 그 전에 포커스를 옮기면 스크롤 고정이 도해가 늘어난 만큼 스크롤을 옮겨 뒤로 가기의 스크롤 위치가 달라진다.
export function diagramsSettled(doc: Document, timeout = 1000): Promise<void> {
  const pending = [...doc.querySelectorAll<HTMLObjectElement>("#quartz-main object")].filter(
    (object) =>
      object.contentDocument?.URL !== object.data ||
      object.contentDocument.readyState !== "complete",
  )
  if (pending.length === 0) return Promise.resolve()
  return new Promise((resolve) => {
    let left = pending.length
    const timer = setTimeout(resolve, timeout)
    const done = () => {
      if (--left > 0) return
      clearTimeout(timer)
      resolve()
    }
    for (const object of pending) {
      object.addEventListener("load", done, { once: true })
      object.addEventListener("error", done, { once: true })
    }
  })
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
