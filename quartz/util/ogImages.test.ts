// ash-wiki: ogImages.ts(OG 이미지 emitter를 뺄지 정하기)의 테스트다.
import test, { describe } from "node:test"
import assert from "node:assert"
import { QuartzConfig } from "../cfg"
import { ogImagesEnabled, withOgImagesSetting } from "./ogImages"

describe("ogImagesEnabled", () => {
  test("변수가 없으면 --serve에서만 뺀다", () => {
    assert.strictEqual(ogImagesEnabled({ serve: true }, undefined), false)
    assert.strictEqual(ogImagesEnabled({ serve: false }, undefined), true)
  })

  test("OG_IMAGES=1이면 --serve에서도 그린다", () => {
    assert.strictEqual(ogImagesEnabled({ serve: true }, "1"), true)
  })

  test("OG_IMAGES=0이면 --serve가 아니어도 뺀다", () => {
    assert.strictEqual(ogImagesEnabled({ serve: false }, "0"), false)
  })

  test("0과 1이 아닌 값은 변수가 없을 때와 같다", () => {
    assert.strictEqual(ogImagesEnabled({ serve: true }, "true"), false)
    assert.strictEqual(ogImagesEnabled({ serve: false }, ""), true)
  })
})

describe("withOgImagesSetting", () => {
  const cfg = {
    configuration: {},
    plugins: {
      transformers: [],
      filters: [],
      emitters: [{ name: "Assets" }, { name: "CustomOgImages" }, { name: "PageTypeDispatcher" }],
      pageTypes: [],
    },
  } as unknown as QuartzConfig

  test("뺄 때는 CustomOgImages만 빼고 원래 설정은 그대로 둔다", () => {
    const saved = process.env.OG_IMAGES
    delete process.env.OG_IMAGES
    try {
      const result = withOgImagesSetting(cfg, { serve: true })
      assert.deepStrictEqual(
        result.plugins.emitters.map((emitter) => emitter.name),
        ["Assets", "PageTypeDispatcher"],
      )
      assert.strictEqual(cfg.plugins.emitters.length, 3)
      assert.strictEqual(withOgImagesSetting(cfg, { serve: false }), cfg)
    } finally {
      if (saved === undefined) delete process.env.OG_IMAGES
      else process.env.OG_IMAGES = saved
    }
  })
})
