import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import path from "node:path"
import { ChannelError } from "../model"
import { entry, fixtureContext, fixtures, run } from "../testing"
import { ietf, rfcIndexUrl } from "./ietf"

// 픽스처는 2026-10-24의 rfc-index.xml에서 참고문헌이 인용한 RFC와 그 obsoleted-by 체인의 레코드만 남긴 것이다.
const index = "ietf/rfc-index.xml"
const context = () => fixtureContext({ [rfcIndexUrl]: index })
const rfc = (number: number, title: string) =>
  entry(`ietf-rfc-${number}`, `RFC ${number} ${title}`, {
    url: `https://www.rfc-editor.org/rfc/rfc${number}`,
  })
const tls = [
  rfc(2246, "The TLS Protocol Version 1.0"),
  rfc(4346, "The Transport Layer Security (TLS) Protocol Version 1.1"),
  rfc(5246, "The Transport Layer Security (TLS) Protocol Version 1.2"),
  rfc(8446, "The Transport Layer Security (TLS) Protocol Version 1.3"),
  rfc(9846, "The Transport Layer Security (TLS) Protocol Version 1.3"),
]

describe("ietf", () => {
  test("Historic으로 옮겨진 RFC를 폐지로 잡는다", async () => {
    // RFC 1146은 RFC 6247이 obsolete하며 Historic으로 옮겼다. RFC 6247은 후속 판이 아니다.
    const { keys, changes } = await run(
      ietf,
      [rfc(1146, "TCP Alternate Checksum Options")],
      [],
      context(),
    )
    assert.deepStrictEqual(keys, ["RFC 1146 | withdrawn | RFC 1146"])
    assert.deepStrictEqual(
      changes[0].current.map((e) => e.key),
      ["ietf-rfc-1146"],
    )
    assert.ok(changes[0].evidence.some((e) => e.value === "HISTORIC"))
    assert.ok(changes[0].evidence.some((e) => e.value === "RFC 6247"))
  })

  test("처음부터 Historic으로 낸 RFC는 잡지 않는다", async () => {
    const { keys } = await run(
      ietf,
      [rfc(6101, "The Secure Sockets Layer (SSL) Protocol Version 3.0")],
      [],
      context(),
    )
    assert.deepStrictEqual(keys, [])
  })

  test("현행으로 인용한 RFC가 obsolete되면 체인의 끝을 대체로 잡는다", async () => {
    const ipv6 = await run(
      ietf,
      [rfc(2460, "Internet Protocol, Version 6 (IPv6) Specification")],
      [],
      context(),
    )
    assert.deepStrictEqual(ipv6.keys, ["RFC 2460 | replaced | RFC 8200"])
    // RFC 5246은 8446과 9846이 obsolete했고, 8446은 다시 9846이 obsolete했다.
    const tls12 = await run(ietf, [tls[2]], [], context())
    assert.deepStrictEqual(tls12.keys, ["RFC 5246 | replaced | RFC 9846"])
  })

  test("이력 문장에서만 인용한 옛 RFC의 대체는 잡지 않는다", async () => {
    const ipv6 = await run(
      ietf,
      [
        rfc(1883, "Internet Protocol, Version 6 (IPv6) Specification"),
        rfc(2460, "Internet Protocol, Version 6 (IPv6) Specification"),
        rfc(8200, "Internet Protocol, Version 6 (IPv6) Specification"),
      ],
      [],
      context(),
    )
    assert.deepStrictEqual(ipv6.keys, [])
    // TLS 1.0과 1.1은 Historic이지만 체인의 더 새 RFC를 인용했으므로 그 RFC가 기준이다.
    assert.deepStrictEqual((await run(ietf, tls, [], context())).keys, [])
    // 체인의 가운데까지만 인용했으면 가장 새로 인용한 RFC의 대체만 잡는다.
    const partial = await run(ietf, tls.slice(0, 4), [], context())
    assert.deepStrictEqual(partial.keys, ["RFC 8446 | replaced | RFC 9846"])
  })

  test("인용한 RFC가 색인에 없으면 실패한다", async () => {
    await assert.rejects(run(ietf, [rfc(99999, "Nothing")], [], context()), ChannelError)
  })

  test("응답하지 않거나 기대한 필드가 없으면 실패한다", async () => {
    const entries = [rfc(1146, "TCP Alternate Checksum Options")]
    await assert.rejects(run(ietf, entries, [], fixtureContext({})), ChannelError)
    const text = fs.readFileSync(path.join(fixtures, index), "utf8")
    const broken = fixtureContext({
      [rfcIndexUrl]: () =>
        new Response(text.replace(/<current-status>[A-Z ]+<\/current-status>/, "")),
    })
    await assert.rejects(run(ietf, entries, [], broken), /current-status/)
    const empty = fixtureContext({ [rfcIndexUrl]: () => new Response("<rfc-index></rfc-index>") })
    await assert.rejects(run(ietf, entries, [], empty), ChannelError)
  })
})
