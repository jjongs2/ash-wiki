// ash-wiki: 앵커가 가리키는 요소가 접힌 절 안에 있으면 그 절을 먼저 연다(plugins/collapsible-sections).
// 이 스크립트는 SPA 이동에도 남아 한 번만 돈다. 리스너는 문서와 창에 걸어 이동한 페이지에도 그대로 듣는다.
// 다른 페이지로 들어오는 앵커는 새 페이지의 절이 모두 펼쳐져 있으므로 따로 열 일이 없다.
// 절을 열었으면 앵커의 대상 요소를 주고, 열 절이 없으면 null을 준다.
function openSectionOf(hash) {
  if (hash.length < 2) return null
  let target
  try {
    target = document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return null
  }
  const section = target?.closest("details.collapsible-section")
  if (!section || section.open) return null
  section.open = true
  return target
}

// 목차, 인용 번호, 제목 앵커처럼 같은 페이지의 앵커를 누를 때. SPA 라우터는 창에서 클릭을 받아 대상으로
// 스크롤하므로, 그보다 먼저 문서의 캡처 단계에서 연다.
document.addEventListener(
  "click",
  (event) => {
    const a = event.target instanceof Element ? event.target.closest("a[href]") : null
    if (!a) return
    const url = new URL(a.href)
    if (url.origin !== location.origin || url.pathname !== location.pathname) return
    openSectionOf(url.hash)
  },
  true,
)

// 뒤로 가기나 주소창으로 해시만 바뀔 때. 브라우저가 먼저 스크롤하므로 절을 열었으면 다시 스크롤한다.
window.addEventListener("hashchange", () => {
  openSectionOf(location.hash)?.scrollIntoView()
})
