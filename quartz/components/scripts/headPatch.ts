// ash-wiki: SPA 이동 때 head를 통째로 갈지 않고, 새 페이지와 같은 요소는 그대로 둔다(spa.inline.ts).
// 스타일시트를 뗐다 붙이면 CSS가 같아도 이동마다 다시 파싱하고 페이지 전체의 스타일을 다시 계산해,
// 이동 한 번에 메인 스레드가 100ms 안팎 멈춘다.

type HeadElement = Pick<Element, "tagName" | "cloneNode">

const URL_ATTRS = ["href", "src"]

// 같은 요소인지 가를 키. 처음 불러온 페이지의 href는 "./x.css"처럼 상대 경로이고, 이동으로 받은
// 페이지의 href는 normalizeRelativeURLs가 "/x.css"로 바꿔 두어 문자열이 다르다. 그래서 절대 URL로
// 풀어 비교한다. script는 이전처럼 늘 새로 넣도록 null(짝 없음)을 준다.
export function headKey(el: HeadElement, base: string | URL): string | null {
  if (el.tagName === "SCRIPT") return null
  const clone = el.cloneNode(true) as Element
  for (const attr of URL_ATTRS) {
    const value = clone.getAttribute(attr)
    if (value !== null) clone.setAttribute(attr, new URL(value, base).href)
  }
  return clone.outerHTML
}

// newKeys의 각 항목과 짝지을 oldKeys의 위치를 순서를 지키며 앞에서부터 고른다. 짝이 없으면 -1이다.
// 순서를 지켜야 남긴 스타일시트 사이에 새 스타일시트를 끼워도 cascade 순서가 새 페이지와 같다.
export function matchHeadElements(
  oldKeys: (string | null)[],
  newKeys: (string | null)[],
): number[] {
  let from = 0
  return newKeys.map((key) => {
    const at = key === null ? -1 : oldKeys.indexOf(key, from)
    if (at !== -1) from = at + 1
    return at
  })
}

export function patchHead(
  head: HTMLHeadElement,
  newHead: HTMLHeadElement,
  oldBase: string | URL,
  newBase: string | URL,
) {
  const oldEls = Array.from(head.querySelectorAll(":scope > :not([data-persist])"))
  const newEls = Array.from(newHead.querySelectorAll(":scope > :not([data-persist])"))
  const match = matchHeadElements(
    oldEls.map((el) => headKey(el, oldBase)),
    newEls.map((el) => headKey(el, newBase)),
  )

  const matched = new Set(match)
  oldEls.forEach((el, i) => {
    if (!matched.has(i)) el.remove()
  })

  // 뒤에서부터 넣어, 새 요소를 새 페이지에서 바로 뒤에 오는 요소 앞에 둔다. 뒤에 올 요소가 없으면 끝에 붙는다.
  // 남긴 요소의 URL 속성은 새 페이지의 값으로 맞춘다. 처음 불러온 페이지의 상대 경로를 그대로 두면
  // pushState 뒤에 새 주소 기준으로 풀려, 깊이가 다른 페이지에서 아이콘 같은 경로가 어긋난다.
  let next: Element | null = null
  for (let i = newEls.length - 1; i >= 0; i--) {
    if (match[i] === -1) {
      head.insertBefore(newEls[i], next)
      next = newEls[i]
      continue
    }
    const kept = oldEls[match[i]]
    for (const attr of URL_ATTRS) {
      const value = newEls[i].getAttribute(attr)
      if (value !== null && kept.getAttribute(attr) !== value) kept.setAttribute(attr, value)
    }
    next = kept
  }
}
