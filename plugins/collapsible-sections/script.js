// ash-wiki: 앵커가 가리키는 요소가 접힌 절 안에 있으면 그 절을 먼저 연다(plugins/collapsible-sections).
// 이 스크립트는 SPA 이동에도 남아 한 번만 돈다. 리스너는 문서와 창에 걸어 이동한 페이지에도 그대로 듣는다.
// 다른 페이지로 들어오는 앵커는 새 페이지의 절이 모두 펼쳐져 있으므로 따로 열 일이 없다.
// 해시가 가리키는 요소. 없거나 해시를 풀지 못하면 null을 준다.
function targetOf(hash) {
  if (hash.length < 2) return null
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return null
  }
}

// 대상을 품은 절을 바깥 절까지 모두 연다(### 절은 ## 절 안에 있다). 연 절이 있으면 앵커의 대상 요소를 주고,
// 없으면 null을 준다.
function openSectionOf(hash) {
  const target = targetOf(hash)
  let opened = false
  let section = target?.closest("details.collapsible-section")
  while (section) {
    if (!section.open) {
      section.open = true
      opened = true
    }
    section = section.parentElement?.closest("details.collapsible-section")
  }
  return opened ? target : null
}

// 목차, 인용 번호, 제목 앵커처럼 같은 페이지의 앵커를 누를 때. SPA 라우터는 창에서 클릭을 받아 대상으로
// 스크롤하므로, 그보다 먼저 문서의 캡처 단계에서 연다. SVG의 <a>는 href 속성이 문자열이 아니므로
// 속성 값을 읽어 이 페이지 기준으로 푼다.
document.addEventListener(
  "click",
  (event) => {
    // 접는 절 제목의 앵커(href 대신 data-href, index.ts의 inertAnchors). summary의 기본 동작(절 접기)을 막고,
    // 라우터가 같은 페이지 앵커를 다루듯 대상으로 스크롤한 뒤 주소에 해시를 남긴다.
    const heading =
      event.target instanceof Element ? event.target.closest("summary a[data-href]") : null
    if (heading?.dataset?.href) {
      event.preventDefault()
      targetOf(heading.dataset.href)?.scrollIntoView()
      window.history.pushState({}, "", heading.dataset.href)
      return
    }
    const a = event.target instanceof Element ? event.target.closest("a[href]") : null
    if (!a) return
    const url = new URL(a.getAttribute("href"), location.href)
    if (url.origin !== location.origin || url.pathname !== location.pathname) return
    openSectionOf(url.hash)
  },
  true,
)

// 뒤로 가기나 주소창으로 해시만 바뀔 때. 브라우저가 먼저 스크롤하므로 절을 열었으면 다시 스크롤한다.
window.addEventListener("hashchange", () => {
  openSectionOf(location.hash)?.scrollIntoView()
})

// SPA 이동이 끝날 때. 뒤로·앞으로 가기에서 라우터는 페이지를 다시 그린 뒤 스크롤하지 않으며, 해시만 바뀐
// 경우도 그렇다. 다시 그리면 대상 위의 접힌 절이 모두 펼쳐져 대상이 아래로 밀리므로, 해시가 가리키는 대상으로
// 다시 스크롤한다. 라우터가 이미 대상으로 스크롤한 이동에서는 같은 자리로 간다.
document.addEventListener("nav", () => {
  targetOf(location.hash)?.scrollIntoView()
})
