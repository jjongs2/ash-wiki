import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import path from "node:path"
import { ChannelError } from "../model"
import { entry, fixtureContext, fixtures, run } from "../testing"
import { nistChannel } from "./nist"

// 픽스처는 2026-10-24에 받은 CSRC 출판물 레코드에서 판 이름부터 Supersedes까지의 본문 조각만 남긴 것이다.
const nist = nistChannel(0)
const csrc = "https://csrc.nist.gov/pubs/"
const records = {
  [`${csrc}sp/800/67/r1/final`]: "nist/sp-800-67-r1.html",
  [`${csrc}sp/800/67/r2/final`]: "nist/sp-800-67-r2.html",
  [`${csrc}fips/180-4/final`]: "nist/fips-180-4.html",
  [`${csrc}fips/180-4/upd1/final`]: "nist/fips-180-4-upd1.html",
}
const context = () => fixtureContext(records)
const fixture = (name: string) => fs.readFileSync(path.join(fixtures, name), "utf8")
const nvlpubs = (key: string, file: string, title = "") =>
  entry(key, title, { url: `https://nvlpubs.nist.gov/nistpubs/SpecialPublications/${file}` })
const sp80067r1 = entry("nist-sp-800-67-r1-2012", "Recommendation for the TDEA Block Cipher", {
  url: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-67r1.pdf",
})
const sp80067r2 = nvlpubs("nist-sp-800-67-r2-2017", "NIST.SP.800-67r2.pdf")

describe("nist", () => {
  test("엔트리의 URL 꼴마다 개정을 뗀 출판물 이름을 정한다", () => {
    const name = (url: string, title = "") => nist.publicationOf(entry("e", title, { url }))
    const cases: [string, string | undefined][] = [
      ["https://csrc.nist.gov/pubs/sp/800/218/r1/ipd", "NIST SP 800-218"],
      ["https://csrc.nist.gov/files/pubs/fips/180-2/upd1/final/docs/a.pdf", "NIST FIPS 180"],
      [
        "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf",
        "NIST SP 800-57 Part 1",
      ],
      [
        "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-160v1r1.pdf",
        "NIST SP 800-160 Vol. 1",
      ],
      [
        "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a-add.pdf",
        "NIST SP 800-38A Addendum",
      ],
      ["https://nvlpubs.nist.gov/nistpubs/Legacy/FIPS/fipspub180-1.pdf", "NIST FIPS 180"],
      ["https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf", "NIST FIPS 197"],
      ["https://doi.org/10.6028/NIST.SP.800-67r2", "NIST SP 800-67"],
      ["https://pages.nist.gov/800-63-4/sp800-63b.html", "NIST SP 800-63B"],
      // CSRC에 레코드가 없는 SP 500과 출판물이 아닌 페이지는 맡지 않는다.
      ["https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nbsspecialpublication500-99.pdf", undefined],
      ["https://csrc.nist.gov/glossary/term/tag", undefined],
      // 레코드 경로를 얻지 못하는 NIST 출판물도 맡는다. check가 실패시킨다.
      ["https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-xyz.pdf", "NIST e"],
    ]
    for (const [url, expected] of cases) assert.strictEqual(name(url), expected, url)
  })

  test("철회되고 대체한 판이 없으면 폐지로 잡는다", async () => {
    // SP 800-67 Rev. 2는 2024-01-01에 철회되었다. 다음 개정(r3)의 경로는 404다.
    const requested = context()
    const { keys, changes } = await run(nist, [sp80067r2], [], requested)
    assert.deepStrictEqual(keys, ["NIST SP 800-67 | withdrawn | NIST SP 800-67 Rev. 2"])
    assert.deepStrictEqual(
      changes[0].current.map((e) => e.key),
      ["nist-sp-800-67-r2-2017"],
    )
    assert.ok(changes[0].evidence.some((e) => e.value === "January 01, 2024"))
    assert.ok(requested.requested.includes(`${csrc}sp/800/67/r3/final`))
  })

  test("현행으로 인용한 판이 대체되면 새 판으로 잡는다", async () => {
    const { keys } = await run(nist, [sp80067r1], [], context())
    assert.deepStrictEqual(keys, ["NIST SP 800-67 | new-edition | NIST SP 800-67 Rev. 2"])
  })

  test("옛 레코드가 대체를 적지 않았어도 다음 개정의 레코드가 있으면 새 판으로 잡는다", async () => {
    // Rev. 1 레코드에서 철회 알림(Withdrawn on, Superseded by)을 지워, Rev. 2가 막 나온 때를 만든다.
    const silent = fixture("nist/sp-800-67-r1.html").replace(
      /<div class="alert alert-danger"[\s\S]*?<\/div>/,
      "",
    )
    const { keys, changes } = await run(
      nist,
      [sp80067r1],
      [],
      fixtureContext({ ...records, [`${csrc}sp/800/67/r1/final`]: () => new Response(silent) }),
    )
    assert.deepStrictEqual(keys, ["NIST SP 800-67 | new-edition | NIST SP 800-67 Rev. 2"])
    assert.ok(changes[0].evidence.some((e) => e.field.endsWith("Date Published")))
  })

  test("이력 문장에서만 인용한 옛 판과 같은 판의 갱신은 잡지 않는다", async () => {
    // FIPS 180-4는 2015년 갱신(upd1)이 2012년 레코드를 대체했다. 같은 판이다.
    const fips180 = [
      entry("nist-fips-180-1993", "FIPS 180", { url: `${csrc}fips/180/final` }),
      entry("nist-fips-180-2-2002", "FIPS 180-2", { url: `${csrc}fips/180-2/final` }),
      entry("nist-fips-180-4-2015", "Secure Hash Standard (SHS)", {
        url: "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf",
      }),
    ]
    assert.deepStrictEqual((await run(nist, fips180, [], context())).keys, [])
    // SP 800-67 Rev. 1의 대체는 Rev. 2를 인용했으므로 잡지 않는다. Rev. 2의 철회만 잡는다.
    const { keys } = await run(nist, [sp80067r1, sp80067r2], [], context())
    assert.deepStrictEqual(keys, ["NIST SP 800-67 | withdrawn | NIST SP 800-67 Rev. 2"])
  })

  test("초안만 인용했으면 그 판의 최종본이 나왔을 때 새 판으로 잡는다", async () => {
    const draft = nvlpubs("nist-sp-800-224-ipd-2024", "NIST.SP.800-224.ipd.pdf")
    assert.deepStrictEqual((await run(nist, [draft], [], context())).keys, [])
    const published = fixtureContext({
      [`${csrc}sp/800/224/final`]: () =>
        new Response(fixture("nist/sp-800-67-r2.html").replace(/SP 800-67 Rev. 2/g, "SP 800-224")),
    })
    const { keys } = await run(nist, [draft], [], published)
    assert.deepStrictEqual(keys, ["NIST SP 800-224 | new-edition | NIST SP 800-224"])
  })

  test("레코드 경로를 얻지 못하거나 인용한 판의 레코드가 없으면 실패한다", async () => {
    const odd = nvlpubs("nist-sp-odd", "NIST.SP.800-xyz.pdf")
    await assert.rejects(run(nist, [odd], [], context()), /레코드 경로/)
    const missing = nvlpubs("nist-sp-800-999", "NIST.SP.800-999.pdf")
    await assert.rejects(run(nist, [missing], [], context()), ChannelError)
  })

  test("응답하지 않거나 기대한 필드가 없으면 실패한다", async () => {
    const down = fixtureContext({
      [`${csrc}sp/800/67/r2/final`]: () => new Response("", { status: 503 }),
    })
    await assert.rejects(run(nist, [sp80067r2], [], down), ChannelError)
    // 다음 개정을 찔러 볼 때도 404가 아닌 비정상 응답은 실패다.
    const probe = fixtureContext({
      ...records,
      [`${csrc}sp/800/67/r3/final`]: () => new Response("", { status: 500 }),
    })
    await assert.rejects(run(nist, [sp80067r2], [], probe), ChannelError)
    const broken = fixtureContext({
      [`${csrc}sp/800/67/r2/final`]: () =>
        new Response(fixture("nist/sp-800-67-r2.html").replace(/pub-header-full-display/, "x")),
    })
    await assert.rejects(run(nist, [sp80067r2], [], broken), /판 이름/)
    const noDate = fixtureContext({
      [`${csrc}sp/800/67/r2/final`]: () =>
        new Response(fixture("nist/sp-800-67-r2.html").replace(/pub-withdrawn-date/, "x")),
    })
    await assert.rejects(run(nist, [sp80067r2], [], noDate), /Withdrawn on/)
  })
})
