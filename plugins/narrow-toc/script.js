// ash-wiki: 목차 바에 지금 절을 싣고, 바의 항목을 누르거나 포커스가 바 밖으로 나가면 목록을 닫는다(plugins/narrow-toc).
// 지금 절은 데스크톱 목차(.toc)의 aria-current를 옮겨 온다. 그 표시를 정하는 스크립트(patches/의 table-of-contents
// 패치)는 목차가 숨은 폭에서도 스크롤마다 돌므로, 여기서는 스크롤을 듣지 않고 그 속성의 바뀜만 본다.
// SPA 이동은 바와 목차를 새 페이지의 마크업으로 바꾸므로 nav마다 새로 걸고, 앞 페이지의 관찰과 처리기는 라우터의
// 정리(window.addCleanup)로 걷는다. 첫 로드의 nav도 라우터가 보낸다.
document.addEventListener("nav", () => {
  const bar = document.querySelector("details.narrow-toc")
  if (!bar) return
  const name = bar.querySelector(".narrow-toc-current")
  const links = bar.querySelectorAll(".narrow-toc-list a[data-for]")
  const source = document.querySelector(".toc ul.toc-content")

  const sync = () => {
    const current = source?.querySelector("a[aria-current]")
    name.textContent = current ? current.textContent : ""
    for (const link of links) {
      if (current && link.dataset.for === current.dataset.for) {
        link.setAttribute("aria-current", "location")
      } else {
        link.removeAttribute("aria-current")
      }
    }
  }
  const observer = new MutationObserver(sync)
  if (source) observer.observe(source, { subtree: true, attributeFilter: ["aria-current"] })
  sync()

  const close = (event) => {
    if (event.target.closest?.(".narrow-toc-list a")) bar.open = false
  }
  bar.addEventListener("click", close)
  // 포커스가 바 밖의 다른 요소로 옮겨 가면(Tab 등) 목록을 닫는다. 열린 목록은 본문 위에 떠 있어, 남겨 두면 그 아래로
  // 옮겨 간 포커스와 링을 가린다(#633). 빈 곳을 눌러 포커스가 어디로도 가지 않거나 바를 품은 <main>(tabindex="-1")으로
  // 갈 때는 그대로 둔다.
  const leave = (event) => {
    const next = event.relatedTarget
    if (next && !bar.contains(next) && !next.contains(bar)) bar.open = false
  }
  bar.addEventListener("focusout", leave)

  window.addCleanup(() => {
    observer.disconnect()
    bar.removeEventListener("click", close)
    bar.removeEventListener("focusout", leave)
  })
})
