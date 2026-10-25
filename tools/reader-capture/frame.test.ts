import test, { describe } from "node:test"
import assert from "node:assert"
import { frameDrift } from "./frame"

// 데스크톱 캡처에서 잰 도해 틀 안쪽 폭을 문턱과 견주는 함수를 seam으로 본다. 572px와 1.1333px는 #575 뒤
// 1280px 화면에서 잰 틀 안쪽과 viewBox 1단위이고, 572 / 1.1333 ≈ 504.7단위다.
describe("frameDrift", () => {
  test("잰 폭이 문턱과 맞으면 알리지 않는다", () => {
    assert.deepStrictEqual(
      frameDrift([{ slug: "semaphore", innerWidth: 572, unitWidth: 1.1333 }], 504.7),
      [],
    )
  })

  test("어긋나면 잰 폭과 그 폭에서 나오는 문턱을 페이지와 함께 알린다", () => {
    assert.deepStrictEqual(
      frameDrift(
        [
          { slug: "semaphore", innerWidth: 572, unitWidth: 1.1333 },
          { slug: "mutex", innerWidth: 572, unitWidth: 1.1333 },
        ],
        532.9,
      ),
      ["틀 안쪽 572px, 문턱 504.7단위인데 frameWidth는 532.9다: semaphore, mutex"],
    )
  })

  test("1단위의 배율이 바뀌어도 알린다", () => {
    assert.deepStrictEqual(
      frameDrift([{ slug: "semaphore", innerWidth: 572, unitWidth: 1.2 }], 504.7),
      ["틀 안쪽 572px, 문턱 476.7단위인데 frameWidth는 504.7다: semaphore"],
    )
  })

  test("도해가 없는 페이지는 잴 것이 없어 알리지 않는다", () => {
    assert.deepStrictEqual(
      frameDrift([{ slug: "index", innerWidth: null, unitWidth: 1.1333 }], 532.9),
      [],
    )
  })
})
