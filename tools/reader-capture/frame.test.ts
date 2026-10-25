import test, { describe } from "node:test"
import assert from "node:assert"
import { frameDrift } from "./frame"

// 데스크톱 캡처에서 잰 도해 틀 안쪽 폭을 문턱과 견주는 함수를 seam으로 본다. 폭 572px는 #575 뒤
// 1280px 화면의 틀 안쪽이고, 루트 글꼴 16px에서 572 × 12 / 13.6 ≈ 504.7단위다.
describe("frameDrift", () => {
  test("잰 폭이 문턱과 맞으면 알리지 않는다", () => {
    assert.deepStrictEqual(frameDrift([{ slug: "semaphore", inner: 572, rem: 16 }], 504.7), [])
  })

  test("어긋나면 잰 폭과 그 폭에서 나오는 문턱을 페이지와 함께 알린다", () => {
    assert.deepStrictEqual(
      frameDrift(
        [
          { slug: "semaphore", inner: 572, rem: 16 },
          { slug: "mutex", inner: 572, rem: 16 },
        ],
        532.9,
      ),
      ["틀 안쪽 572px, 문턱 504.7단위인데 frameWidth는 532.9다: semaphore, mutex"],
    )
  })

  test("도해가 없는 페이지는 잴 것이 없어 알리지 않는다", () => {
    assert.deepStrictEqual(frameDrift([{ slug: "index", inner: null, rem: 16 }], 532.9), [])
  })
})
