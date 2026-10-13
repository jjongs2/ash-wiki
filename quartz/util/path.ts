// ash-wiki: normalizeObjectData가 쓴다.
import { isAbsoluteURL } from "@quartz-community/utils"

// Re-export shared path utilities from @quartz-community/utils
export {
  isFilePath,
  isFullSlug,
  isSimpleSlug,
  isRelativeURL,
  isAbsoluteURL,
  getFullSlug,
  slugifyFilePath,
  simplifySlug,
  joinSegments,
  endsWith,
  trimSuffix,
  stripSlashes,
  getFileExtension,
  isFolderPath,
  getAllSegmentPrefixes,
  pathToRoot,
  resolveRelative,
  splitAnchor,
  slugTag,
  transformInternalLink,
  transformLink,
  normalizeHastElement,
} from "@quartz-community/utils"

export type {
  FilePath,
  FullSlug,
  SimpleSlug,
  RelativeURL,
  TransformOptions,
} from "@quartz-community/utils"

// --- v5-specific exports below ---

export const QUARTZ = "quartz"

// from micromorph/src/utils.ts
// https://github.com/natemoo-re/micromorph/blob/main/src/utils.ts#L5
const _rebaseHtmlElement = (el: Element, attr: string, newBase: string | URL) => {
  const rebased = new URL(el.getAttribute(attr)!, newBase)
  el.setAttribute(attr, rebased.pathname + rebased.hash)
}
export function normalizeRelativeURLs(el: Element | Document, destination: string | URL) {
  el.querySelectorAll('[href=""], [href^="./"], [href^="../"]').forEach((item) => {
    _rebaseHtmlElement(item, "href", destination)
  })
  el.querySelectorAll('[src=""], [src^="./"], [src^="../"]').forEach((item) => {
    _rebaseHtmlElement(item, "src", destination)
  })
}

// ash-wiki: 도해 <object>의 data는 "diagrams/x.svg"처럼 ./ 없이 나가 normalizeRelativeURLs가 고치지 않는다.
// 팝오버는 가져온 문서를 지금 페이지에 붙이므로, 하위 경로 페이지(tags/, news/)에서는 data가 지금 폴더 기준으로
// 풀려 404가 난다(#402). 팝오버가 이 함수로 링크한 페이지 기준의 경로로 바꾼다. SPA 이동에서는 도해가 제대로
// 읽혀 normalizeRelativeURLs에 넣지 않았다.
export function normalizeObjectData(el: Element | Document, destination: string | URL) {
  el.querySelectorAll("object[data]").forEach((item) => {
    if (!isAbsoluteURL(item.getAttribute("data")!)) _rebaseHtmlElement(item, "data", destination)
  })
}
