// ash-wiki: 찾기, 맞춤, 결과 순서, 강조할 자리는 model.ts가 맡는다. 이 스크립트는 contentIndex를 색인에
// 넣고 결과를 그리기만 한다. 업스트림은 화면 문구를 영어로 박아 두었다(ADR 0021).
import { createSearchIndex, highlightRanges } from "./model"
import type { SearchPage } from "./model"
import {
  removeAllChildren,
  normalizeRelativeURLs,
  registerEscapeHandler,
  resolveBasePath,
  escapeHTML,
} from "@quartz-community/utils"

interface Item {
  id: number
  slug: string
  title: string
  aliases?: string[]
  content: string
  tags: string[]
  [key: string]: any
}

const toSearchPage = (slug: string, item: Item): SearchPage => ({
  slug,
  title: item.title || "",
  aliases: item.aliases || [],
  content: item.content || "",
  tags: item.tags || [],
})

// 업스트림은 검색 갈래(searchType)를 적어 두기만 하고 읽지 않는다. 저장소의 타입 검사(noUnusedLocals)가
// 막아서 뺐다.
let currentSearchTerm: string = ""
const numTagResults = 5
const contextWindowWords = 30

const index = createSearchIndex()

let contentData: Record<string, Item> | null = null
let allTags: string[] = []
const fetchContentCache = new Map<string, Element[]>()

function parseSearchQuery(input: string): { tags: string[]; query: string } {
  const tokens = input.split(/\s+/)
  const tags: string[] = []
  const queryParts: string[] = []
  for (const token of tokens) {
    if (token.startsWith("#") && token.length > 1) {
      tags.push(token.substring(1))
    } else if (token !== "#") {
      queryParts.push(token)
    }
  }
  return { tags, query: queryParts.join(" ").trim() }
}

function getCurrentTagToken(input: string): string | null {
  const tokens = input.split(/\s+/)
  const last = tokens[tokens.length - 1]
  if (last && last.startsWith("#")) {
    return last.substring(1)
  }
  return null
}
const parser = new DOMParser()

async function fetchContent(slug: string): Promise<Element[]> {
  if (fetchContentCache.has(slug)) {
    return fetchContentCache.get(slug) as Element[]
  }
  const targetUrl = new URL(resolveBasePath(slug), window.location.origin).toString()
  try {
    const res = await fetch(targetUrl)
    if (!res.ok) return []
    const text = await res.text()
    const html = parser.parseFromString(text ?? "", "text/html")
    normalizeRelativeURLs(html, targetUrl)
    const contents = Array.from(html.getElementsByClassName("popover-hint"))
    // ash-wiki: 미리보기는 다른 페이지의 머리를 싣는다. 그 브레드크럼은 지금 페이지의 브레드크럼과 이름이 같은
    // 랜드마크라(axe landmark-unique) 랜드마크에서 뺀다(#633). 이름(aria-label)이 남으면 브라우저가 role="none"을
    // 무시하므로 이름도 뗀다.
    for (const content of contents) {
      for (const nav of content.querySelectorAll("nav")) {
        nav.setAttribute("role", "none")
        nav.removeAttribute("aria-label")
      }
    }
    fetchContentCache.set(slug, contents)
    return contents
  } catch {
    return []
  }
}

const cleanupFns: Array<() => void> = []

function addCleanup(fn: () => void) {
  cleanupFns.push(fn)
}

function runCleanups() {
  cleanupFns.forEach((fn) => fn())
  cleanupFns.length = 0
}

async function setupSearch() {
  const searchElements = document.querySelectorAll(".search")

  for (const searchEl of Array.from(searchElements)) {
    const container = searchEl.querySelector(".search-container") as HTMLElement | null
    const searchButton = searchEl.querySelector(".search-button") as HTMLElement | null
    const searchBar = searchEl.querySelector(".search-bar") as HTMLInputElement
    const searchLayout = searchEl.querySelector(".search-layout")

    if (!container || !searchButton || !searchBar || !searchLayout) continue

    const sidebar = container.closest(".sidebar") as HTMLElement | null
    const enablePreview = searchLayout.getAttribute("data-preview") === "true"

    let results = searchLayout.querySelector(".results-container") as HTMLDivElement | null
    if (!results) {
      results = document.createElement("div")
      results.className = "results-container"
      results.setAttribute("role", "listbox")
      results.setAttribute("aria-label", "검색 결과")
      searchLayout.appendChild(results)
    }

    let preview = searchLayout.querySelector(".preview-container") as HTMLDivElement | null
    if (enablePreview && !preview) {
      preview = document.createElement("div")
      preview.className = "preview-container"
      searchLayout.appendChild(preview)
    }

    const tagDropdown = document.createElement("div")
    tagDropdown.className = "tag-suggestions"
    tagDropdown.setAttribute("role", "listbox")
    tagDropdown.setAttribute("aria-label", "태그 제안")
    tagDropdown.style.display = "none"
    const searchSpace = searchBar.parentElement!
    searchSpace.insertBefore(tagDropdown, searchBar.nextSibling)

    const ghostText = document.createElement("span")
    ghostText.className = "ghost-text"
    ghostText.setAttribute("aria-hidden", "true")
    searchSpace.insertBefore(ghostText, searchBar.nextSibling)

    let tagSuggestionIndex = -1
    let filteredTags: string[] = []
    let tagDropdownVisible = false

    const updateGhostText = (partial: string) => {
      if (tagSuggestionIndex < 0 || tagSuggestionIndex >= filteredTags.length) {
        ghostText.textContent = ""
        return
      }
      const selectedTag = filteredTags[tagSuggestionIndex]!
      if (!selectedTag.toLowerCase().startsWith(partial.toLowerCase())) {
        ghostText.textContent = ""
        return
      }
      const completion = selectedTag.substring(partial.length)
      ghostText.innerHTML = ""
      const invisible = document.createElement("span")
      invisible.style.visibility = "hidden"
      invisible.textContent = searchBar.value
      ghostText.appendChild(invisible)
      ghostText.appendChild(document.createTextNode(completion))
    }

    const updateTagDropdownHighlight = () => {
      const items = tagDropdown.querySelectorAll(".tag-suggestion-item")
      items.forEach((item, i) => {
        item.classList.toggle("active", i === tagSuggestionIndex)
      })
      const partial = getCurrentTagToken(searchBar.value) || ""
      updateGhostText(partial)
    }

    const hideTagDropdown = () => {
      tagDropdownVisible = false
      tagSuggestionIndex = -1
      filteredTags = []
      tagDropdown.style.display = "none"
      ghostText.textContent = ""
    }

    const acceptTagSuggestion = (tag: string) => {
      const value = searchBar.value
      const lastHashIndex = value.lastIndexOf("#")
      if (lastHashIndex !== -1) {
        searchBar.value = value.substring(0, lastHashIndex) + "#" + tag + " "
      }
      hideTagDropdown()
      searchBar.focus()
      searchBar.dispatchEvent(new Event("input"))
    }

    const showTagDropdown = (partial: string) => {
      if (!indexInitialized) return
      filteredTags =
        partial === ""
          ? allTags.slice(0, 10)
          : allTags.filter((t) => t.toLowerCase().startsWith(partial.toLowerCase())).slice(0, 10)
      if (filteredTags.length === 0) {
        hideTagDropdown()
        return
      }
      tagSuggestionIndex = 0
      tagDropdownVisible = true
      removeAllChildren(tagDropdown)
      for (let i = 0; i < filteredTags.length; i++) {
        const tag = filteredTags[i]!
        const item = document.createElement("div")
        item.className = "tag-suggestion-item" + (i === 0 ? " active" : "")
        item.setAttribute("role", "option")
        item.setAttribute("data-tag", tag)
        item.setAttribute("data-index", String(i))
        item.textContent = "#" + tag
        tagDropdown.appendChild(item)
      }
      tagDropdown.style.display = "block"
      updateGhostText(partial)
    }

    const navigateTagDropdown = (direction: "up" | "down"): boolean => {
      if (!tagDropdownVisible || filteredTags.length === 0) return false
      if (direction === "down") {
        tagSuggestionIndex = Math.min(tagSuggestionIndex + 1, filteredTags.length - 1)
      } else {
        tagSuggestionIndex = Math.max(tagSuggestionIndex - 1, 0)
      }
      updateTagDropdownHighlight()
      return true
    }

    let currentHover: HTMLElement | null = null
    let previewToken = 0
    let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null

    const hideSearch = () => {
      container.classList.remove("active")
      if (sidebar) sidebar.style.zIndex = ""
      searchButton.setAttribute("aria-expanded", "false")
      searchBar.value = ""
      removeAllChildren(results!)
      if (preview) removeAllChildren(preview)
      searchLayout.classList.remove("display-results")
      currentHover = null
      hideTagDropdown()
      searchButton.focus()
    }

    const showSearch = () => {
      if (sidebar) sidebar.style.zIndex = "9999"
      container.classList.add("active")
      searchButton.setAttribute("aria-expanded", "true")
      searchBar.focus()
    }

    const displayResults = async (finalResults: any[]) => {
      removeAllChildren(results)

      if (finalResults.length === 0) {
        const noMatch = document.createElement("a")
        noMatch.className = "result-card no-match"
        const noMatchTitle = document.createElement("h3")
        noMatchTitle.textContent = "결과가 없습니다."
        const noMatchHint = document.createElement("p")
        noMatchHint.textContent = "다른 검색어로 찾아 보세요."
        noMatch.appendChild(noMatchTitle)
        noMatch.appendChild(noMatchHint)
        results.appendChild(noMatch)
        currentHover = null
        if (preview) removeAllChildren(preview)
      } else {
        for (const item of finalResults) {
          const itemTile = document.createElement("a")
          itemTile.className = "result-card"
          itemTile.id = item.slug
          itemTile.href = resolveBasePath(item.slug)

          const titleEl = document.createElement("h3")
          titleEl.className = "card-title"
          titleEl.innerHTML = item.title.replace(/<(?!\/?span\b)[^>]*>/gi, "")
          itemTile.appendChild(titleEl)

          if (item.tags.length > 0) {
            const tagList = document.createElement("ul")
            tagList.className = "tags"
            tagList.innerHTML = item.tags.join("")
            itemTile.appendChild(tagList)
          }

          const descEl = document.createElement("p")
          descEl.className = "card-description"
          descEl.innerHTML = item.content.replace(/<(?!\/?span\b)[^>]*>/gi, "")
          itemTile.appendChild(descEl)

          results.appendChild(itemTile)
        }
      }
    }

    const getResultElements = (): HTMLElement[] => {
      return Array.from(results.querySelectorAll<HTMLElement>(".result-card:not(.no-match)"))
    }

    const highlightTerm = () => {
      const parsed = parseSearchQuery(currentSearchTerm)
      return parsed.query || (parsed.tags.length > 0 ? parsed.tags.join(" ") : currentSearchTerm)
    }

    const updatePreview = async (el: HTMLElement | null) => {
      if (!preview) return
      removeAllChildren(preview)
      if (!el) return
      const slug = el.id
      const token = ++previewToken
      const contents = await fetchContent(slug)
      if (token !== previewToken) return
      const term = highlightTerm()
      const previewInner = document.createElement("div")
      previewInner.className = "preview-inner"
      for (const contentEl of contents) {
        const cloned = contentEl.cloneNode(true) as HTMLElement
        if (term.trim() !== "") {
          cloned.innerHTML = highlightHTML(term, cloned)
        }
        previewInner.appendChild(cloned)
      }
      preview.appendChild(previewInner)

      requestAnimationFrame(() => {
        const highlights = Array.from(preview!.getElementsByClassName("highlight"))
        if (highlights.length === 0) return
        highlights.sort((a, b) => b.innerHTML.length - a.innerHTML.length)
        const target = highlights[0] as HTMLElement
        let offset = 0
        let current: HTMLElement | null = target
        while (current && current !== preview) {
          offset += current.offsetTop
          current = current.offsetParent as HTMLElement | null
        }
        preview!.scrollTop = Math.max(0, offset - 50)
      })
    }

    const setFocus = (el: HTMLElement | null) => {
      if (currentHover) currentHover.classList.remove("focus")
      currentHover = el
      if (currentHover) {
        currentHover.classList.add("focus")
        currentHover.scrollIntoView({ block: "nearest" })
      }
      if (previewDebounceTimer) clearTimeout(previewDebounceTimer)
      previewDebounceTimer = setTimeout(() => updatePreview(currentHover), 150)
    }

    const focusByIndex = (index: number) => {
      const resultElements = getResultElements()
      if (resultElements.length === 0) {
        setFocus(null)
        return
      }
      const clamped = Math.min(Math.max(index, 0), resultElements.length - 1)
      setFocus(resultElements[clamped] ?? null)
    }

    const focusNext = () => {
      const resultElements = getResultElements()
      if (resultElements.length === 0) return
      const currentIndex = currentHover ? resultElements.indexOf(currentHover) : -1
      focusByIndex(currentIndex + 1)
    }

    const focusPrevious = () => {
      const resultElements = getResultElements()
      if (resultElements.length === 0) return
      const currentIndex = currentHover
        ? resultElements.indexOf(currentHover)
        : resultElements.length
      focusByIndex(currentIndex - 1)
    }

    const onType = async (e: Event) => {
      const inputValue = (e.target as HTMLInputElement).value
      currentSearchTerm = inputValue

      const partialTag = getCurrentTagToken(inputValue)
      if (partialTag !== null) {
        showTagDropdown(partialTag)
      } else {
        hideTagDropdown()
      }

      const parsed = parseSearchQuery(inputValue)
      const hasContent = parsed.query !== "" || parsed.tags.length > 0
      searchLayout.classList.toggle("display-results", hasContent)

      if (!hasContent) {
        removeAllChildren(results)
        if (preview) removeAllChildren(preview)
        currentHover = null
        return
      }

      const slugs = await index.search(parsed.query, parsed.tags)
      const displayTerm =
        parsed.query || (parsed.tags.length > 0 ? parsed.tags.join(" ") : inputValue)
      const finalResults = slugs.map((slug) => formatForDisplay(displayTerm, slug))

      await displayResults(finalResults)
      const resultElements = getResultElements()
      setFocus(resultElements[0] ?? null)
    }

    const onButtonClick = (e: Event) => {
      e.stopPropagation()
      showSearch()
    }
    searchButton.addEventListener("click", onButtonClick)
    addCleanup(() => searchButton.removeEventListener("click", onButtonClick))

    searchBar.addEventListener("input", onType)
    addCleanup(() => searchBar.removeEventListener("input", onType))

    const onSearchBarKeydown = (e: KeyboardEvent) => {
      if (tagDropdownVisible) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          navigateTagDropdown("down")
          return
        }
        if (e.key === "ArrowUp") {
          e.preventDefault()
          navigateTagDropdown("up")
          return
        }
        if (e.key === "Tab") {
          e.preventDefault()
          if (tagSuggestionIndex >= 0 && tagSuggestionIndex < filteredTags.length) {
            acceptTagSuggestion(filteredTags[tagSuggestionIndex]!)
          }
          return
        }
        if (e.key === "Enter" && !e.isComposing) {
          if (tagSuggestionIndex >= 0 && tagSuggestionIndex < filteredTags.length) {
            e.preventDefault()
            acceptTagSuggestion(filteredTags[tagSuggestionIndex]!)
            return
          }
        }
        if (e.key === "Escape") {
          e.preventDefault()
          hideTagDropdown()
          return
        }
      }

      if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab")) {
        e.preventDefault()
        focusPrevious()
        return
      }
      if (e.key === "ArrowDown" || e.key === "Tab") {
        e.preventDefault()
        focusNext()
        return
      }
      if (e.key === "Enter" && !e.isComposing) {
        const focused = currentHover
        if (focused instanceof HTMLAnchorElement) {
          e.preventDefault()
          storeSearchTerm()
          hideSearch()
          focused.click()
        }
      }
    }
    searchBar.addEventListener("keydown", onSearchBarKeydown)
    addCleanup(() => searchBar.removeEventListener("keydown", onSearchBarKeydown))

    const onDocumentKeydown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        container.classList.contains("active") ? hideSearch() : showSearch()
      } else if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        showSearch()
        searchBar.value = "#"
        searchBar.dispatchEvent(new Event("input"))
      }
    }
    document.addEventListener("keydown", onDocumentKeydown)
    addCleanup(() => document.removeEventListener("keydown", onDocumentKeydown))

    const storeSearchTerm = () => {
      const parsed = parseSearchQuery(currentSearchTerm)
      const term =
        parsed.query || (parsed.tags.length > 0 ? parsed.tags.join(" ") : currentSearchTerm)
      if (term.trim()) sessionStorage.setItem("search-term", term.trim())
    }

    const onResultsClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest(".result-card") as HTMLAnchorElement | null
      if (!target || target.classList.contains("no-match")) return
      if (e instanceof MouseEvent && (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) return
      storeSearchTerm()
      hideSearch()
    }
    const onResultsMouseover = (e: Event) => {
      const target = (e.target as HTMLElement).closest(".result-card") as HTMLElement | null
      if (!target || target.classList.contains("no-match")) return
      setFocus(target)
    }
    results.addEventListener("click", onResultsClick)
    results.addEventListener("mouseover", onResultsMouseover)
    addCleanup(() => {
      results!.removeEventListener("click", onResultsClick)
      results!.removeEventListener("mouseover", onResultsMouseover)
    })

    const onTagDropdownClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest(".tag-suggestion-item") as HTMLElement | null
      if (!target) return
      const tag = target.getAttribute("data-tag")
      if (tag) acceptTagSuggestion(tag)
    }
    const onTagDropdownMouseover = (e: Event) => {
      const target = (e.target as HTMLElement).closest(".tag-suggestion-item") as HTMLElement | null
      if (!target) return
      const idx = target.getAttribute("data-index")
      if (idx !== null) {
        tagSuggestionIndex = parseInt(idx, 10)
        updateTagDropdownHighlight()
      }
    }
    tagDropdown.addEventListener("click", onTagDropdownClick)
    tagDropdown.addEventListener("mouseover", onTagDropdownMouseover)
    addCleanup(() => {
      tagDropdown.removeEventListener("click", onTagDropdownClick)
      tagDropdown.removeEventListener("mouseover", onTagDropdownMouseover)
    })

    const cleanupEscapeHandler = registerEscapeHandler(container, hideSearch)
    addCleanup(cleanupEscapeHandler)
  }
}

// 강조할 자리를 칠한 HTML이다. 칠하지 않은 글도 이스케이프한다.
function markRanges(text: string, ranges: [number, number][]): string {
  let out = ""
  let last = 0
  for (const [start, end] of ranges) {
    out += escapeHTML(text.slice(last, start))
    out += `<span class="highlight">${escapeHTML(text.slice(start, end))}</span>`
    last = end
  }
  return out + escapeHTML(text.slice(last))
}

function highlightHTML(searchTerm: string, el: HTMLElement): string {
  const html = parser.parseFromString(el.innerHTML, "text/html")
  const walker = html.createTreeWalker(html.body, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node: Text | null = walker.nextNode() as Text | null
  while (node) {
    nodes.push(node)
    node = walker.nextNode() as Text | null
  }
  for (const textNode of nodes) {
    const text = textNode.nodeValue ?? ""
    const ranges = highlightRanges(searchTerm, text)
    if (ranges.length === 0) continue
    const fragment = html.createDocumentFragment()
    let lastIndex = 0
    for (const [start, end] of ranges) {
      if (start > lastIndex) {
        fragment.appendChild(html.createTextNode(text.slice(lastIndex, start)))
      }
      const span = html.createElement("span")
      span.className = "highlight"
      span.textContent = text.slice(start, end)
      fragment.appendChild(span)
      lastIndex = end
    }
    if (lastIndex < text.length) {
      fragment.appendChild(html.createTextNode(text.slice(lastIndex)))
    }
    textNode.parentNode?.replaceChild(fragment, textNode)
  }
  return html.body.innerHTML
}

// 결과 목록의 발췌문을 칠한다. 공백으로 끊은 토큰마다 칠해, 띄어 쓴 꼴은 칠하지 못한다.
function highlight(searchTerm: string, text: string, trim?: boolean): string {
  let tokenizedText = text.split(/\s+/).filter((t) => t !== "")

  let startIndex = 0
  let endIndex = tokenizedText.length - 1

  if (trim) {
    const includesCheck = (tok: string) => highlightRanges(searchTerm, tok).length > 0
    const occurrencesIndices = tokenizedText.map(includesCheck)

    let bestSum = 0
    let bestIndex = 0
    for (let i = 0; i < Math.max(tokenizedText.length - contextWindowWords, 0); i++) {
      const window = occurrencesIndices.slice(i, i + contextWindowWords)
      const windowSum = window.reduce((total, cur) => total + (cur ? 1 : 0), 0)
      if (windowSum >= bestSum) {
        bestSum = windowSum
        bestIndex = i
      }
    }

    startIndex = Math.max(bestIndex - contextWindowWords, 0)
    endIndex = Math.min(startIndex + 2 * contextWindowWords, tokenizedText.length - 1)
    tokenizedText = tokenizedText.slice(startIndex, endIndex)
  }

  const slice = tokenizedText
    .map((tok) => markRanges(tok, highlightRanges(searchTerm, tok)))
    .join(" ")

  return (
    (startIndex === 0 ? "" : "...") + slice + (endIndex === tokenizedText.length - 1 ? "" : "...")
  )
}

function highlightTags(searchTags: string[], tags?: string[]): string[] {
  if (!tags || tags.length === 0 || searchTags.length === 0) return []
  return tags
    .map((tag) => {
      const escaped = escapeHTML(tag)
      if (searchTags.some((st) => tag.toLowerCase().includes(st.toLowerCase()))) {
        return `<li><p class="match-tag">#${escaped}</p></li>`
      } else {
        return `<li><p>#${escaped}</p></li>`
      }
    })
    .slice(0, numTagResults)
}

function formatForDisplay(term: string, slug: string): any {
  const data = contentData?.[slug]
  if (!data) {
    return {
      slug,
      title: "",
      content: "",
      tags: [],
    }
  }
  const parsed = parseSearchQuery(currentSearchTerm)
  // 제목은 발췌문과 달리 통째로 칠해, 띄어 쓰거나 문장부호가 끼어든 꼴도 칠한다.
  return {
    slug: slug,
    title:
      parsed.tags.length > 0 && !parsed.query
        ? escapeHTML(data.title)
        : markRanges(data.title || "", highlightRanges(term, data.title || "")),
    content: highlight(term, data.content || "", true),
    tags: highlightTags(parsed.tags, data.tags),
  }
}

async function fillDocument() {
  if (!contentData) return
  const pages: SearchPage[] = []
  const tagSet = new Set<string>()
  for (const slug of Object.keys(contentData)) {
    const fileData = contentData[slug]
    if (!fileData) continue
    for (const tag of fileData.tags || []) tagSet.add(tag)
    pages.push(toSearchPage(slug, fileData))
  }
  await index.add(pages)
  allTags = [...tagSet].sort()
}

async function fetchContentIndex(): Promise<Record<string, Item>> {
  const data = await fetchData
  return data as unknown as Record<string, Item>
}

let indexInitialized = false

async function initIndex() {
  if (indexInitialized) return
  contentData = await fetchContentIndex()
  await fillDocument()
  indexInitialized = true
}

async function addContentIndexEntries(patch: Record<string, Item>): Promise<number> {
  if (!indexInitialized || !contentData) return 0
  const tagSet = new Set<string>(allTags)
  let added = 0
  for (const slug of Object.keys(patch)) {
    if (contentData[slug]) continue
    const fileData = patch[slug]
    if (!fileData) continue
    contentData[slug] = fileData
    for (const tag of fileData.tags || []) tagSet.add(tag)
    await index.add([toSearchPage(slug, fileData)])
    added++
  }
  allTags = [...tagSet].sort()
  return added
}

document.addEventListener("content-index-updated", (event) => {
  const detail = (event as CustomEvent).detail as { slugs?: string[] } | undefined
  if (!indexInitialized || !contentData) return
  const slugs = detail?.slugs
  if (!Array.isArray(slugs) || slugs.length === 0) return

  ;(async () => {
    try {
      const base = (await fetchData) as unknown as Record<string, unknown>
      if (!base || typeof base !== "object") return
      const root =
        (base as Record<string, unknown>).content &&
        typeof (base as Record<string, unknown>).content === "object"
          ? ((base as Record<string, unknown>).content as Record<string, unknown>)
          : (base as Record<string, unknown>)
      const patch: Record<string, Item> = {}
      for (const slug of slugs) {
        const entry = root[slug]
        if (entry && typeof entry === "object") {
          patch[slug] = entry as Item
        }
      }
      await addContentIndexEntries(patch)
    } catch {
      // non-fatal: shadow index patch failed
    }
  })()
})

function scrollToSearchTerm() {
  const term = sessionStorage.getItem("search-term")
  if (!term) return
  sessionStorage.removeItem("search-term")

  requestAnimationFrame(() => {
    const headingSelector =
      ".popover-hint h1, .popover-hint h2, .popover-hint h3, .popover-hint h4, " +
      ".popover-hint h5, .popover-hint h6, article h1, article h2, article h3"
    const bodySelector =
      ".popover-hint p, .popover-hint li, .popover-hint td, .popover-hint th, " +
      ".popover-hint blockquote, article p, article li"
    const headings = document.querySelectorAll(headingSelector)
    const bodyEls = document.querySelectorAll(bodySelector)
    const candidates = [...Array.from(headings), ...Array.from(bodyEls)]

    for (const el of candidates) {
      const text = el.textContent ?? ""
      const idx = text.toLowerCase().indexOf(term.toLowerCase())
      if (idx === -1) continue

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      let charCount = 0
      let node: Text | null
      let startNode: Text | null = null
      let startOffset = 0
      let endNode: Text | null = null
      let endOffset = 0

      while ((node = walker.nextNode() as Text | null)) {
        const len = node.nodeValue?.length ?? 0
        if (!startNode && charCount + len > idx) {
          startNode = node
          startOffset = idx - charCount
        }
        if (startNode && charCount + len >= idx + term.length) {
          endNode = node
          endOffset = idx + term.length - charCount
          break
        }
        charCount += len
      }

      if (!startNode || !endNode) continue

      try {
        const range = document.createRange()
        range.setStart(startNode, startOffset)
        range.setEnd(endNode, endOffset)
        const span = document.createElement("span")
        span.className = "search-scroll-target"
        range.surroundContents(span)
        span.scrollIntoView({ block: "center", behavior: "smooth" })
        setTimeout(() => {
          span.classList.add("fade-out")
          setTimeout(() => {
            const parent = span.parentNode
            if (parent) {
              parent.replaceChild(document.createTextNode(span.textContent || ""), span)
              parent.normalize()
            }
          }, 1000)
        }, 2000)
      } catch {
        el.scrollIntoView({ block: "center", behavior: "smooth" })
      }
      break
    }
  })
}

async function handleNavOrRender() {
  runCleanups()
  await initIndex()
  await setupSearch()
  scrollToSearchTerm()
}

document.addEventListener("nav", handleNavOrRender)
document.addEventListener("render", handleNavOrRender)
