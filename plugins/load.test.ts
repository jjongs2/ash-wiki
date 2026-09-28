import test, { describe } from "node:test"
import assert from "node:assert"
import { spawnSync } from "node:child_process"
import fs from "node:fs"

// 빌드는 로컬 플러그인의 index.ts를 Node의 type stripping으로 불러오고, 불러오지 못하면 경고 한 줄만
// 남기고 건너뛴다. tsx는 각 index.ts 머리 주석의 제약을 어겨도 돌려 주므로 단위 테스트로는 이 실패가
// 드러나지 않는다. 그래서 plugins/ 아래의 플러그인을 모두 빌드처럼 플래그 없는 node로 불러, 그 import
// 결과(manifest.name, default의 type)를 seam으로 본다. 설정은 source 경로의 폴더 이름으로 플러그인을
// 식별하므로 manifest.name도 폴더 이름과 맞춘다.
const pluginsDir = new URL("./", import.meta.url)
const plugins = fs
  .readdirSync(pluginsDir, { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && fs.existsSync(new URL(`${entry.name}/index.ts`, pluginsDir)),
  )
  .map((entry) => entry.name)

describe("플래그 없는 node로 불러온다", () => {
  test("로컬 플러그인을 찾는다", () => {
    assert.notStrictEqual(plugins.length, 0)
  })

  for (const name of plugins) {
    test(name, () => {
      const url = new URL(`${name}/index.ts`, pluginsDir).href
      const script =
        `const m = await import(${JSON.stringify(url)}); ` +
        `console.log(JSON.stringify({ name: m.manifest?.name, type: typeof m.default }))`
      const env = { ...process.env }
      delete env.NODE_OPTIONS
      const child = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
        env,
        encoding: "utf8",
      })
      assert.strictEqual(child.status, 0, child.stderr)
      assert.deepStrictEqual(JSON.parse(child.stdout), { name, type: "function" })
    })
  }
})
