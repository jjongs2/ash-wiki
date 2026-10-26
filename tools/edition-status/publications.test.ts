import test, { describe } from "node:test"
import assert from "node:assert"
import { channels, dedicated } from "./channels"
import type { Channel } from "./model"
import { assign } from "./publications"
import { standardNumber } from "./standard-number"
import { entry, page } from "./testing"

// 엔트리를 출판물로 묶는 것과, 문서의 표가 도구와 어긋나면 멈추는 것을 본다.
const tables = {
  channels: dedicated.map((channel) => ({ 통로: channel.id })),
  generic: [
    {
      출판물: "MISRA C",
      페이지: "misra-c",
      엔트리: "^misra-c-",
      URL: "https://misra.org.uk/misra-c/",
      "판 패턴": "MISRA C:([0-9]{4})",
      요청: "—",
    },
  ],
  skipped: [{ 출판물: "CMMI", 페이지: "cmmi", 사유: "통로가 없다" }],
}

const fake = (id: string, owns: (title: string) => boolean): Channel => ({
  id,
  ownsPage: (page) => owns(page.title),
  publicationOf: (entry) => (entry.title.startsWith("RFC") ? entry.title.split(":")[0] : undefined),
  check: async () => [],
})

describe("출판물", () => {
  test("표준 번호를 머리에서 읽는다", () => {
    assert.deepStrictEqual(standardNumber("ISO/CD 13400-2 Road vehicles"), {
      bodies: ["ISO"],
      stages: ["CD"],
      number: "13400-2",
      year: undefined,
      project: true,
    })
    assert.deepStrictEqual(standardNumber("ISO/IEC/IEEE DIS 29148 Systems"), {
      bodies: ["ISO", "IEC", "IEEE"],
      stages: ["DIS"],
      number: "29148",
      year: undefined,
      project: true,
    })
    assert.deepStrictEqual(standardNumber("IEEE Std 802.1Q-2022 Bridges"), {
      bodies: ["IEEE"],
      stages: ["Std"],
      number: "802.1Q",
      year: "2022",
      project: false,
    })
    assert.strictEqual(standardNumber("IEEE P802.3dm Task Force")?.project, true)
    assert.strictEqual(standardNumber("ISO/IEC TR 29119-6:2021 Software")?.number, "29119-6")
    assert.strictEqual(standardNumber("ISO CAN FD or non-ISO CAN FD"), undefined)
  })

  test("표준 페이지는 같은 번호와 그 부의 엔트리를 담고, 나머지는 통로가 이름을 정한다", () => {
    const owner = fake("owner", () => true)
    const assigned = assign(
      [
        entry("a", "ISO 26262-1:2018 Part 1"),
        entry("b", "ISO/DIS 26262-1 Part 1"),
        entry("c", "ISO 13400-2:2025 DoIP"),
        entry("d", "RFC 8200: IPv6"),
        entry("e", "IEEE 802.1Qbv-2015 Enhancements"),
      ],
      [
        page("iso-26262", "ISO 26262", "ISO", "2018"),
        page("ieee-802-1q", "IEEE 802.1Q", "IEEE", "2022"),
      ],
      [owner],
    ).get(owner)!
    assert.deepStrictEqual(
      assigned.map((publication) => [
        publication.name,
        publication.page?.name,
        publication.entries.map((e) => e.key),
      ]),
      [
        ["ISO 26262", "iso-26262", ["a", "b"]],
        ["IEEE 802.1Q", "ieee-802-1q", []],
        ["RFC 8200", undefined, ["d"]],
      ],
    )
  })

  test("표준 페이지를 맡은 통로가 없거나 둘이면 멈춘다", () => {
    const pages = [page("e-gas", "E-Gas", "EGAS Workgroup", "2015")]
    assert.throws(() => assign([], pages, [fake("a", () => false)]), /맡은 통로가 0개/)
    assert.throws(
      () => assign([], pages, [fake("a", () => true), fake("b", () => true)]),
      /맡은 통로가 2개/,
    )
  })

  test("문서의 통로 표가 도구의 통로와 다르면 멈춘다", () => {
    assert.strictEqual(channels(tables).length, dedicated.length + 2)
    assert.throws(
      () => channels({ ...tables, channels: tables.channels.slice(1) }),
      /edition-channels/,
    )
    assert.throws(
      () => channels({ ...tables, channels: [...tables.channels, { 통로: "itu" }] }),
      /edition-channels/,
    )
  })

  test("범용 행의 판 패턴에 잡을 묶음이 하나가 아니면 멈춘다", () => {
    const row = { ...tables.generic[0], "판 패턴": "MISRA C:[0-9]{4}" }
    assert.throws(() => channels({ ...tables, generic: [row] }), /잡을 묶음/)
  })
})
