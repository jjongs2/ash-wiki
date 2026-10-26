import test, { after, describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { loadTree } from "../check-content/tree"
import { topicSlugs } from "./targets"

// 태그로 부를 때 캡처하거나 표본을 뽑을 슬러그 목록을 seam으로 본다.
function tree(pages: Record<string, string[]>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "reader-targets-"))
  for (const [rel, tags] of Object.entries(pages)) {
    const file = path.join(root, "content", rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(
      file,
      `---\ntitle: t\ntags:\n${tags.map((tag) => `  - ${tag}`).join("\n")}\n---\n`,
    )
  }
  return loadTree(root)
}

describe("topicSlugs", () => {
  const fixture = tree({
    "index.md": ["platform"],
    "mutex.md": ["platform/rtos"],
    "semaphore.md": ["platform/rtos", "sw-engineering"],
    "can-bus.md": ["network/can"],
    "hypervisor.md": ["platform"],
    "platformx.md": ["platformx"],
    "tags/platform/rtos.md": ["platform"],
  })
  after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))

  test("주제 태그는 그 태그를 단 페이지만 준다", () => {
    assert.deepStrictEqual(topicSlugs(fixture, "platform/rtos"), ["mutex", "semaphore"])
  })

  test("구역 태그는 하위 태그를 단 페이지까지 주고, 태그 페이지, 첫 페이지, 이름만 같게 시작하는 태그는 뺀다", () => {
    assert.deepStrictEqual(topicSlugs(fixture, "platform"), ["hypervisor", "mutex", "semaphore"])
  })

  test("태그를 단 페이지가 없으면 멈춘다", () => {
    assert.throws(() => topicSlugs(fixture, "security"), /security 태그를 단 페이지가 없다/)
  })
})
