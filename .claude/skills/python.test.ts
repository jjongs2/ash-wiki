import test from "node:test"
import assert from "node:assert"
import { spawnSync } from "node:child_process"
import { readdirSync } from "node:fs"
import path from "node:path"

// 스킬 폴더의 Python 테스트(test_*.py)를 파일마다 하나의 테스트로 돌린다. npm test가 이 파일을 부르므로
// 새 Python 테스트는 따로 등록하지 않아도 돈다.
// npx tsx --test .claude/skills/python.test.ts

const skills = import.meta.dirname

const files = readdirSync(skills, { recursive: true, encoding: "utf8" })
  .filter((f) => /^test_.*\.py$/.test(path.basename(f)))
  .sort()

for (const file of files) {
  test(file, () => {
    const dir = path.join(skills, path.dirname(file))
    const result = spawnSync(
      "python3",
      ["-B", "-m", "unittest", "discover", "-s", dir, "-p", path.basename(file)],
      { encoding: "utf8" },
    )
    assert.ifError(result.error)
    assert.strictEqual(result.status, 0, result.stderr + result.stdout)
  })
}
