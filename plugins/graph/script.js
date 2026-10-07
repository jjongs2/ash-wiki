// @ts-nocheck
// ash-wiki: 노드와 선은 model.ts의 graph가 계산한다. 태그 노드가 없고, 노드는 구역 색으로 칠한다.
// 구역 색은 theme의 구역 색 토큰(--region-<구역>, --region-other)에서 읽는다. 노드는 canvas에 그려 CSS로
// 칠할 수 없어서다. 방문한 페이지를 칠하던 업스트림의 방문 기록(localStorage graph-visited)은 쓰지 않는다.
import { graph as graphModel } from "./model.ts"
import {
  removeAllChildren,
  getBasePath,
  getFullSlugFromUrl,
  simplifySlug,
  resolveBasePath,
} from "@quartz-community/utils"

;(function () {
  function getSlugFromUrl() {
    var slug = getFullSlugFromUrl()
    var base = getBasePath()
    if (base && slug.startsWith(base.replace(/^\//, ""))) {
      slug = slug.slice(base.replace(/^\//, "").length)
      if (slug.startsWith("/")) slug = slug.slice(1)
    }
    return slug
  }

  function loadScript(src) {
    var existing = document.querySelector('script[src="' + src + '"]')
    if (existing) return Promise.resolve()
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script")
      script.src = src
      script.crossOrigin = "anonymous"
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  Promise.all([
    loadScript("https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"),
    loadScript("https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.js"),
  ])
    .then(function () {
      initGraph()
    })
    .catch(function (err) {
      console.error("[Graph] Failed to load libraries:", err)
      var containers = document.querySelectorAll(".graph-container")
      for (var i = 0; i < containers.length; i++) {
        // ash-wiki: 업스트림은 이 안내를 영어로 박아 두었다(ADR 0021).
        containers[i].textContent = "그래프를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요."
        containers[i].style.display = "flex"
        containers[i].style.alignItems = "center"
        containers[i].style.justifyContent = "center"
        containers[i].style.color = "var(--gray)"
        containers[i].style.fontSize = "0.9rem"
      }
    })

  function initGraph() {
    var d3 = window.d3
    var PIXI = window.PIXI

    if (!d3 || !PIXI) {
      console.error("[Graph] Libraries not loaded")
      return
    }

    // Resolves CSS color values containing calc()/var() that PixiJS cannot parse.
    // Uses a temp DOM element so the browser's CSS engine evaluates the expression.
    function resolveColor(value, fallback) {
      if (!value) return fallback
      var el = document.createElement("div")
      el.style.color = value
      el.style.position = "absolute"
      el.style.visibility = "hidden"
      document.body.appendChild(el)
      var resolved = getComputedStyle(el).color
      el.remove()
      return resolved || fallback
    }

    async function renderGraph(graph, fullSlug, renderGeneration) {
      var slug = simplifySlug(fullSlug)
      if (slug === "") slug = "index"
      removeAllChildren(graph)

      if (renderGeneration !== undefined && renderGeneration !== currentRenderGeneration) {
        console.log("[Graph] Stale render, skipping")
        return function () {}
      }

      var config = JSON.parse(graph.dataset["cfg"] || "{}")
      var enableDrag = config.drag
      var enableZoom = config.zoom
      var depth = config.depth
      var scale = config.scale || 1
      var repelForce = config.repelForce || 0.5
      var centerForce = config.centerForce || 0.3
      var linkDistance = config.linkDistance || 30
      var fontSize = config.fontSize || 0.6
      var opacityScale = config.opacityScale || 1
      var focusOnHover = config.focusOnHover
      var enableRadial = config.enableRadial

      var data
      try {
        var dataRaw = await fetchData
        data = new Map()
        for (var key in dataRaw) {
          data.set(simplifySlug(key), dataRaw[key])
        }
      } catch (err) {
        console.error("[Graph] Error loading data:", err)
        return function () {}
      }

      var width = graph.offsetWidth
      var height = Math.max(graph.offsetHeight, 250)

      var pages = []
      data.forEach(function (details, source) {
        pages.push({
          slug: source,
          title: details.title || source,
          tags: details.tags || [],
          links: (details.links || []).map(simplifySlug),
        })
      })
      var model = graphModel(pages, { kind: "local", current: slug, depth: depth })

      var nodes = []
      var nodeMap = new Map()
      for (var i = 0; i < model.nodes.length; i++) {
        var node = Object.assign({}, model.nodes[i], {
          x: Math.random() * width - width / 2,
          y: Math.random() * height - height / 2,
          vx: 0,
          vy: 0,
        })
        nodes.push(node)
        nodeMap.set(node.id, node)
      }

      var graphLinks = []
      for (var i = 0; i < model.links.length; i++) {
        var link = model.links[i]
        graphLinks.push({
          source: nodeMap.get(link.source),
          target: nodeMap.get(link.target),
          weight: link.weight,
        })
      }

      var styles = getComputedStyle(document.documentElement)
      var gray = resolveColor(styles.getPropertyValue("--gray").trim(), "#6c6c6c")
      var lightgray = resolveColor(styles.getPropertyValue("--lightgray").trim(), "#d4d4d4")
      var dark = resolveColor(styles.getPropertyValue("--dark").trim(), "#1a1a1a")
      var bodyFont = styles.getPropertyValue("--bodyFont").trim() || "inherit"

      var app = new PIXI.Application()
      await app.init({
        width: width,
        height: height,
        antialias: true,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        eventMode: "static",
      })

      graph.appendChild(app.canvas)

      var stage = new PIXI.Container()
      app.stage.addChild(stage)

      var simulation = d3
        .forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-100 * repelForce))
        .force("center", d3.forceCenter().strength(centerForce))
        .force("link", d3.forceLink(graphLinks).distance(linkDistance))
        .force(
          "collide",
          d3
            .forceCollide()
            .radius(function (d) {
              return nodeRadius(d)
            })
            .iterations(3),
        )

      if (enableRadial) {
        var radius = (Math.min(width, height) / 2) * 0.8
        simulation.force("radial", d3.forceRadial(radius).strength(0.2))
      }

      var linkContainer = new PIXI.Container()
      var nodesContainer = new PIXI.Container()
      var labelsContainer = new PIXI.Container()
      stage.addChild(linkContainer)
      stage.addChild(nodesContainer)
      stage.addChild(labelsContainer)

      var nodeRenderData = []
      var linkRenderData = []
      var hoveredNodeId = null
      var hoveredNeighbours = new Set()
      var dragStartTime = 0
      var dragging = false
      var currentTransform = d3.zoomIdentity

      function nodeRadius(d) {
        // 업스트림은 양방향 링크를 선 두 개로 셌다. 선 하나에 링크 수(weight)를 모았으므로 그 합으로 센다.
        var numLinks = 0
        for (var i = 0; i < graphLinks.length; i++) {
          if (graphLinks[i].source.id === d.id || graphLinks[i].target.id === d.id) {
            numLinks += graphLinks[i].weight
          }
        }
        return 2 + Math.sqrt(numLinks)
      }

      var regionColors = new Map()
      function nodeColor(d) {
        var key = d.region || "other"
        if (!regionColors.has(key)) {
          var value = d.region ? styles.getPropertyValue("--region-" + d.region).trim() : ""
          if (!value) value = styles.getPropertyValue("--region-other").trim()
          regionColors.set(key, resolveColor(value, gray))
        }
        return regionColors.get(key)
      }

      function updateHoverInfo(newHoveredId) {
        hoveredNodeId = newHoveredId

        if (newHoveredId === null) {
          hoveredNeighbours = new Set()
          for (var i = 0; i < nodeRenderData.length; i++) {
            nodeRenderData[i].active = false
          }
          for (var i = 0; i < linkRenderData.length; i++) {
            linkRenderData[i].active = false
          }
        } else {
          hoveredNeighbours = new Set()

          for (var i = 0; i < linkRenderData.length; i++) {
            var linkData = linkRenderData[i].simulationData
            if (linkData.source.id === newHoveredId || linkData.target.id === newHoveredId) {
              hoveredNeighbours.add(linkData.source.id)
              hoveredNeighbours.add(linkData.target.id)
              linkRenderData[i].active = true
            } else {
              linkRenderData[i].active = false
            }
          }

          hoveredNeighbours.add(newHoveredId)

          for (var i = 0; i < nodeRenderData.length; i++) {
            if (hoveredNeighbours.has(nodeRenderData[i].simulationData.id)) {
              nodeRenderData[i].active = true
            } else {
              nodeRenderData[i].active = false
            }
          }
        }
      }

      function renderLinks() {
        for (var i = 0; i < linkRenderData.length; i++) {
          var linkData = linkRenderData[i]
          var alpha = 1
          if (hoveredNodeId !== null) {
            alpha = linkData.active ? 1 : 0.2
          }
          linkData.alpha = alpha
          linkData.color = linkData.active ? gray : lightgray
        }
      }

      function renderLabels() {
        var defaultScale = 1 / scale
        var activeScale = defaultScale * 1.1

        for (var i = 0; i < nodeRenderData.length; i++) {
          var nodeData = nodeRenderData[i]
          if (hoveredNodeId === nodeData.simulationData.id) {
            nodeData.label.alpha = 1
            nodeData.label.scale.set(activeScale)
          } else {
            nodeData.label.scale.set(defaultScale)
          }
        }
      }

      function renderNodes() {
        for (var i = 0; i < nodeRenderData.length; i++) {
          var nodeData = nodeRenderData[i]
          var alpha = 1
          if (hoveredNodeId !== null && focusOnHover) {
            alpha = nodeData.active ? 1 : 0.2
          }
          nodeData.gfx.alpha = alpha
        }
      }

      function renderPixiFromD3() {
        renderNodes()
        renderLinks()
        renderLabels()
      }

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        var nodeId = node.id
        var radius = nodeRadius(node)
        var color = nodeColor(node)

        var label = new PIXI.Text({
          text: node.text,
          style: {
            fontSize: fontSize * 15,
            fill: dark,
            fontFamily: bodyFont,
          },
          resolution: window.devicePixelRatio * 4,
        })
        label.anchor.set(0.5, 1.2)
        label.alpha = 0
        label.scale.set(1 / scale)
        labelsContainer.addChild(label)

        var gfx = new PIXI.Graphics()
        gfx.circle(0, 0, radius)
        gfx.fill({ color: color })
        // 현재 페이지는 노드 바깥에 글자색 고리를 두른다.
        if (nodeId === slug) {
          gfx.circle(0, 0, radius + 2)
          gfx.stroke({ width: 1.5, color: dark })
        }

        gfx.eventMode = "static"
        gfx.cursor = "pointer"
        gfx.label = nodeId

        ;(function (n, g, labelRef) {
          var oldLabelOpacity = 0
          g.on("pointerover", function (e) {
            updateHoverInfo(n.id)
            oldLabelOpacity = labelRef.alpha
            if (!dragging) {
              renderPixiFromD3()
            }
          })

          g.on("pointerleave", function () {
            updateHoverInfo(null)
            labelRef.alpha = oldLabelOpacity
            if (!dragging) {
              renderPixiFromD3()
            }
          })
        })(node, gfx, label)

        nodesContainer.addChild(gfx)

        nodeRenderData.push({
          simulationData: node,
          gfx: gfx,
          label: label,
          color: color,
          alpha: 1,
          active: false,
        })
      }

      for (var i = 0; i < graphLinks.length; i++) {
        var link = graphLinks[i]
        var gfx = new PIXI.Graphics()
        gfx.eventMode = "none"
        linkContainer.addChild(gfx)

        linkRenderData.push({
          simulationData: link,
          gfx: gfx,
          color: lightgray,
          alpha: 1,
          active: false,
        })
      }

      if (enableDrag) {
        var dragSubject = function (event) {
          var mouseX = (event.x - currentTransform.x) / currentTransform.k
          var mouseY = (event.y - currentTransform.y) / currentTransform.k

          for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i]
            var dx = mouseX - n.x - width / 2
            var dy = mouseY - n.y - height / 2
            var dist = Math.sqrt(dx * dx + dy * dy)
            var rad = nodeRadius(n)
            if (dist < rad + 5) {
              return n
            }
          }
          return null
        }

        var dragStarted = function (event) {
          if (!event.active) simulation.alphaTarget(1).restart()
          event.subject.fx = event.subject.x
          event.subject.fy = event.subject.y
          var mouseSimX = (event.x - currentTransform.x) / currentTransform.k - width / 2
          var mouseSimY = (event.y - currentTransform.y) / currentTransform.k - height / 2
          event.subject.__dragOffset = {
            x: mouseSimX - event.subject.x,
            y: mouseSimY - event.subject.y,
          }
          dragStartTime = Date.now()
          dragging = true
          hoveredNodeId = event.subject.id
        }

        var dragDragged = function (event) {
          var mouseSimX = (event.x - currentTransform.x) / currentTransform.k - width / 2
          var mouseSimY = (event.y - currentTransform.y) / currentTransform.k - height / 2
          event.subject.fx = mouseSimX - event.subject.__dragOffset.x
          event.subject.fy = mouseSimY - event.subject.__dragOffset.y
        }

        var dragEnded = function (event) {
          if (!event.active) simulation.alphaTarget(0)
          event.subject.fx = null
          event.subject.fy = null
          dragging = false
          updateHoverInfo(null)
          renderPixiFromD3()

          if (Date.now() - dragStartTime < 500) {
            var target = resolveBasePath(event.subject.id)
            window.location.href = target
          }
        }

        var drag = d3
          .drag()
          .container(app.canvas)
          .subject(dragSubject)
          .on("start", dragStarted)
          .on("drag", dragDragged)
          .on("end", dragEnded)

        d3.select(app.canvas).call(drag)
      } else {
        for (var i = 0; i < nodeRenderData.length; i++) {
          ;(function (nodeData) {
            nodeData.gfx.on("click", function () {
              var target = resolveBasePath(nodeData.simulationData.id)
              window.location.href = target
            })
          })(nodeRenderData[i])
        }
      }

      if (enableZoom) {
        var zoomed = function (event) {
          currentTransform = event.transform
          stage.scale.set(currentTransform.k, currentTransform.k)
          stage.position.set(currentTransform.x, currentTransform.y)

          var newScale = currentTransform.k * opacityScale
          var scaleOpacity = Math.max((newScale - 1) / 3.75, 0)

          var activeLabels = []
          for (var i = 0; i < nodeRenderData.length; i++) {
            if (nodeRenderData[i].active) {
              activeLabels.push(nodeRenderData[i].label)
            }
          }

          for (var i = 0; i < labelsContainer.children.length; i++) {
            var label = labelsContainer.children[i]
            if (activeLabels.indexOf(label) === -1) {
              label.alpha = scaleOpacity
            }
          }
        }

        var zoom = d3
          .zoom()
          .extent([
            [0, 0],
            [width, height],
          ])
          .scaleExtent([0.25, 4])
          .on("zoom", zoomed)

        d3.select(app.canvas).call(zoom)
      }

      var stopAnimation = false
      function animate() {
        if (stopAnimation) return

        for (var i = 0; i < nodeRenderData.length; i++) {
          var n = nodeRenderData[i]
          var x = n.simulationData.x
          var y = n.simulationData.y
          if (x != null && y != null) {
            n.gfx.position.set(x + width / 2, y + height / 2)
            if (n.label) {
              n.label.position.set(x + width / 2, y + height / 2)
            }
          }
        }

        for (var i = 0; i < linkRenderData.length; i++) {
          var l = linkRenderData[i]
          var linkData = l.simulationData
          var sx = linkData.source.x
          var sy = linkData.source.y
          var tx = linkData.target.x
          var ty = linkData.target.y
          if (sx != null && sy != null && tx != null && ty != null) {
            l.gfx.clear()
            l.gfx.moveTo(sx + width / 2, sy + height / 2)
            l.gfx.lineTo(tx + width / 2, ty + height / 2)
            l.gfx.stroke({ alpha: l.alpha, width: 1, color: l.color })
          }
        }

        requestAnimationFrame(animate)
      }

      simulation.on("tick", function () {})
      simulation.restart()
      renderPixiFromD3()
      animate()

      return function () {
        stopAnimation = true
        simulation.stop()
        try {
          app.destroy(true)
        } catch (_) {
          // PixiJS may throw if WebGL context was already lost.
        }
      }
    }

    var localCleanups = []
    var globalCleanups = []
    var currentRenderGeneration = 0

    function cleanupLocal() {
      for (var i = 0; i < localCleanups.length; i++) {
        localCleanups[i]()
      }
      localCleanups = []
    }

    function cleanupGlobal() {
      for (var i = 0; i < globalCleanups.length; i++) {
        globalCleanups[i]()
      }
      globalCleanups = []
    }

    var globalContainers = []
    var globalIcons = []
    var documentClickHandler = null
    var documentKeydownHandler = null
    var iconClickHandler = null

    function hideGlobalGraph() {
      cleanupGlobal()
      for (var i = 0; i < globalContainers.length; i++) {
        globalContainers[i].classList.remove("active")
        var sidebar = globalContainers[i].closest(".sidebar")
        if (sidebar) {
          sidebar.style.zIndex = ""
        }
      }
    }

    function anyGlobalGraphActive() {
      for (var i = 0; i < globalContainers.length; i++) {
        if (globalContainers[i].classList.contains("active")) {
          return true
        }
      }
      return false
    }

    function showGlobalGraph() {
      cleanupGlobal()
      var currentSlug = getSlugFromUrl()
      for (var i = 0; i < globalContainers.length; i++) {
        var container = globalContainers[i]
        container.classList.add("active")
        var sidebar = container.closest(".sidebar")
        if (sidebar) {
          sidebar.style.zIndex = "1"
        }

        var graphContainer = container.querySelector(".global-graph-container")
        if (graphContainer) {
          ;(function (gc) {
            renderGraph(gc, currentSlug, undefined)
              .then(function (cleanup) {
                globalCleanups.push(cleanup)
              })
              .catch(function (err) {
                console.error("[Graph] Global render error:", err)
              })
          })(graphContainer)
        }
      }
    }

    function toggleGlobalGraph() {
      if (anyGlobalGraphActive()) {
        hideGlobalGraph()
      } else {
        showGlobalGraph()
      }
    }

    function renderLocal() {
      cleanupLocal()
      var thisGeneration = ++currentRenderGeneration
      var slug = getSlugFromUrl()

      var localContainers = document.querySelectorAll(".graph-container")
      for (var i = 0; i < localContainers.length; i++) {
        ;(function (container) {
          renderGraph(container, slug, thisGeneration)
            .then(function (cleanup) {
              if (thisGeneration === currentRenderGeneration) {
                localCleanups.push(cleanup)
              }
            })
            .catch(function (err) {
              console.error("[Graph] Local render error:", err)
            })
        })(localContainers[i])
      }
    }

    function handleNav() {
      renderLocal()

      globalContainers = Array.from(document.querySelectorAll(".global-graph-outer"))

      if (iconClickHandler) {
        for (var i = 0; i < globalIcons.length; i++) {
          globalIcons[i].removeEventListener("click", iconClickHandler)
        }
      }

      globalIcons = Array.from(document.querySelectorAll(".global-graph-icon"))
      iconClickHandler = function () {
        toggleGlobalGraph()
      }
      for (var i = 0; i < globalIcons.length; i++) {
        globalIcons[i].addEventListener("click", iconClickHandler)
      }

      if (documentClickHandler) {
        document.removeEventListener("click", documentClickHandler)
      }
      documentClickHandler = function (e) {
        if (anyGlobalGraphActive()) {
          var inContainer = e.target.closest(".global-graph-container")
          var inIcon = e.target.closest(".global-graph-icon")
          if (!inContainer && !inIcon) {
            hideGlobalGraph()
          }
        }
      }
      document.addEventListener("click", documentClickHandler)

      if (documentKeydownHandler) {
        document.removeEventListener("keydown", documentKeydownHandler)
      }
      documentKeydownHandler = function (e) {
        if (e.key === "Escape") {
          if (anyGlobalGraphActive()) {
            hideGlobalGraph()
          }
          return
        }

        if (e.key === "g" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
          e.preventDefault()
          toggleGlobalGraph()
        }
      }
      document.addEventListener("keydown", documentKeydownHandler)

      if (anyGlobalGraphActive()) {
        showGlobalGraph()
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        handleNav({ detail: { url: getSlugFromUrl() } })
      })
    } else {
      handleNav({ detail: { url: getSlugFromUrl() } })
    }
    document.addEventListener("prenav", function () {
      cleanupLocal()
      cleanupGlobal()
    })
    document.addEventListener("nav", handleNav)
    document.addEventListener("render", handleNav)

    function handleThemeChange() {
      renderLocal()
      if (anyGlobalGraphActive()) {
        showGlobalGraph()
      }
    }
    document.addEventListener("themechange", handleThemeChange)
  }
})()
