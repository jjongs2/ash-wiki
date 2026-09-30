// ash-wiki: 도해 <object>의 SVG 문서 루트에 현재 테마의 색 토큰 값을 넣는다(plugins/diagram-theme).
// palette는 index.ts가 이 스크립트 앞에 둔다. 토큰 이름마다 { light, dark } 값이고, 값은 hex이거나 사이트 색
// 토큰 이름이다. 사이트 색 토큰은 사이트 문서의 계산된 CSS 변수에서 읽는다.
// 이 스크립트는 SPA 이동에도 남아 한 번만 돈다. 리스너는 문서에 걸어 이동한 페이지에도 그대로 듣는다.
const selector = 'object[type="image/svg+xml"]'

const valueOf = (value) =>
  value.startsWith("#")
    ? value
    : getComputedStyle(document.documentElement).getPropertyValue(`--${value}`).trim()

// SVG 문서를 다 읽은 <object>만 칠하고, 칠한 것에 표시를 단다. 표시가 없는 도해는 style.css가 가린다.
const paint = (object) => {
  const root = object.contentDocument?.documentElement
  if (root?.localName !== "svg") return
  const theme = document.documentElement.getAttribute("saved-theme") === "dark" ? "dark" : "light"
  for (const [name, values] of Object.entries(palette)) {
    root.style.setProperty(`--${name}`, valueOf(values[theme]))
  }
  object.dataset.themed = ""
}

const paintAll = () => document.querySelectorAll(selector).forEach(paint)

// <object>의 load와 error는 거품이 일지 않으므로 캡처 단계에서 받는다. 첫 로드, SPA 이동, 팝오버에 들어온
// 도해가 모두 여기로 온다. 칠하지 못한 도해(읽지 못한 파일 등)도 가려 둔 채로 남지 않게 표시를 단다.
const onLoad = (event) => {
  const object = event.target
  if (!object?.matches?.(selector)) return
  paint(object)
  object.dataset.themed = ""
}
document.addEventListener("load", onLoad, true)
document.addEventListener("error", onLoad, true)
document.addEventListener("themechange", paintAll)
// SPA 이동은 같은 도해의 <object>를 다시 불러오지 않고 남기면서 표시를 지울 수 있다.
document.addEventListener("nav", paintAll)
// 이 스크립트보다 먼저 다 읽은 도해
paintAll()
