import test, { describe } from "node:test"
import assert from "node:assert"
import type { FrontPagePage } from "./index"
import { frontPage } from "./index"

// 대문 함수가 seam이다. 페이지 목록을 넣고 나온 주제별 페이지 수만 본다.
const page = (slug: string, ...tags: string[]): FrontPagePage => ({ slug, title: slug, tags })

describe("frontPage", () => {
  test("주제마다 그 주제 태그를 단 페이지를 센다", () => {
    const { topicCounts } = frontPage({
      pages: [
        page("can-frame", "network/can"),
        page("can-fd", "network/can"),
        page("100base-t1", "network/ethernet"),
      ],
    })
    assert.deepStrictEqual(topicCounts, { "network/can": 2, "network/ethernet": 1 })
  })

  test("태그 페이지와 대문은 세지 않는다", () => {
    const { topicCounts } = frontPage({
      pages: [
        page("index", "network/can"),
        page("tags/network/can", "network/can"),
        page("tags/index", "network/can"),
        page("can-frame", "network/can"),
      ],
    })
    assert.deepStrictEqual(topicCounts, { "network/can": 1 })
  })

  test("구역 태그는 주제로 세지 않는다", () => {
    const { topicCounts } = frontPage({
      pages: [page("can-frame", "network", "network/can"), page("osi-model", "network")],
    })
    assert.deepStrictEqual(topicCounts, { "network/can": 1 })
  })

  test("하위 태그를 단 페이지는 그 주제에 한 번 센다", () => {
    // 태그 목록 페이지(tags/network/can)도 하위 태그(network/can/fd)를 단 페이지를 함께 보인다
    const { topicCounts } = frontPage({
      pages: [page("can-fd", "network/can", "network/can/fd"), page("can-xl", "network/can/xl")],
    })
    assert.deepStrictEqual(topicCounts, { "network/can": 2 })
  })

  test("여러 주제에 걸친 페이지는 주제마다 센다", () => {
    const { topicCounts } = frontPage({
      pages: [page("secoc", "security/cybersecurity", "platform/autosar")],
    })
    assert.deepStrictEqual(topicCounts, { "security/cybersecurity": 1, "platform/autosar": 1 })
  })
})
