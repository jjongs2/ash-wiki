import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { loadTree } from "../../check-content/tree"
import { changeKey, ChannelError } from "../model"
import { assign, citedEntries, standardPages } from "../publications"
import { entry, fixtureContext, fixtures, page, run } from "../testing"
import { iso, isoDataUrl } from "./iso"

// 픽스처는 2026-10-24의 ISO 오픈 데이터에서 참고문헌이 인용한 번호의 레코드만 남긴 것이다.
const data = "iso/iso_deliverables_metadata.jsonl"
const context = () => fixtureContext({ [isoDataUrl]: data })
const isoEntry = (key: string, title: string, id?: number) =>
  entry(key, title, {
    publisher: "{ISO}",
    url: id ? `https://www.iso.org/standard/${id}.html` : undefined,
  })

describe("iso", () => {
  test("인용하지 않은 개정 프로젝트를 개정 착수로 잡는다", async () => {
    const { keys, changes } = await run(
      iso,
      [
        isoEntry("iso-13400-2-2025", "ISO 13400-2:2025 Road vehicles — DoIP — Part 2", 87961),
        isoEntry(
          "iso-13400-2-obp-2019",
          "ISO 13400-2:2019 Road vehicles — DoIP — Part 2 (OBP preview)",
        ),
      ],
      [page("iso-13400-2", "ISO 13400-2", "ISO", "2025")],
      context(),
    )
    assert.deepStrictEqual(keys, ["ISO 13400-2 | revision | ISO/CD 13400-2"])
    assert.deepStrictEqual(
      changes[0].current.map((e) => e.key),
      ["iso-13400-2-2025"],
    )
    assert.ok(changes[0].evidence.some((e) => e.value === "30.99" && e.url.endsWith("/95489.html")))
  })

  test("시리즈는 어느 부의 프로젝트든 하나를 인용했으면 개정 착수를 알리지 않는다", async () => {
    const parts = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((part) =>
      isoEntry(
        `iso-26262-${part}-obp-2018`,
        `ISO 26262-${part}:2018 Road vehicles — Functional safety`,
      ),
    )
    const { keys } = await run(
      iso,
      [
        ...parts,
        isoEntry(
          "iso-26262-10-2012",
          "ISO 26262-10:2012 Road vehicles — Functional safety — Part 10",
        ),
        isoEntry(
          "iso-dis-26262-1-2026",
          "ISO/DIS 26262-1 Road vehicles — Functional safety — Part 1",
          90020,
        ),
      ],
      [page("iso-26262", "ISO 26262", "ISO", "2018")],
      context(),
    )
    // 26262-7:2018은 인용하지 않았지만 edition 연도 뒤에 나온 부가 아니다.
    assert.deepStrictEqual(keys, [])
  })

  test("시리즈의 개정 프로젝트를 하나도 인용하지 않았으면 부마다 알린다", async () => {
    const { keys } = await run(
      iso,
      [isoEntry("iso-26262-1-2018", "ISO 26262-1:2018 Road vehicles — Functional safety — Part 1")],
      [page("iso-26262", "ISO 26262", "ISO", "2018")],
      context(),
    )
    assert.deepStrictEqual(keys, ["ISO 26262 | revision | ISO/DIS 26262-1"])
  })

  test("취소된 프로젝트(x.98)는 개정으로 세지 않는다", async () => {
    // ISO/PWI PAS 8800-1·-2는 00.98이다.
    const { keys } = await run(
      iso,
      [
        isoEntry(
          "iso-pas-8800-2024",
          "ISO/PAS 8800:2024 Road vehicles — Safety and artificial intelligence",
          83303,
        ),
      ],
      [page("iso-pas-8800", "ISO/PAS 8800", "ISO", "2024")],
      context(),
    )
    assert.deepStrictEqual(keys, [])
  })

  test("옛 판 엔트리만 대체된 출판물은 잡지 않는다", async () => {
    // ISO 11898:1993은 11898-1과 11898-2로 나뉘었고, 그 현행판을 참고문헌이 인용한다.
    // ISO/PAS 21448:2019는 ISO 21448 페이지의 옛 판이다.
    const { keys } = await run(
      iso,
      [
        isoEntry(
          "iso-11898-1993",
          "ISO 11898:1993 Road vehicles — Interchange of digital information",
        ),
        isoEntry("iso-11898-1-2024", "ISO 11898-1:2024 Road vehicles — CAN — Part 1", 86384),
        isoEntry(
          "iso-11898-1-obp-2015",
          "ISO 11898-1:2015 Road vehicles — CAN — Part 1 (OBP preview)",
        ),
        isoEntry("iso-11898-2-2026", "ISO 11898-2:2026 Road vehicles — CAN — Part 2"),
        isoEntry("iso-pas-21448-2019", "ISO/PAS 21448:2019 Road vehicles — SOTIF"),
        isoEntry("iso-21448-2022", "ISO 21448:2022 Road vehicles — SOTIF"),
        isoEntry("iso-wd-21448-2026", "ISO/WD 21448 Road vehicles — SOTIF", 93071),
      ],
      [
        page("iso-11898-1", "ISO 11898-1", "ISO", "2024"),
        page("iso-11898-2", "ISO 11898-2", "ISO", "2026"),
        page("iso-21448", "ISO 21448", "ISO", "2022"),
      ],
      context(),
    )
    assert.deepStrictEqual(keys, [])
  })

  test("대체한 판 없이 폐지된 판을 폐지로 잡고, status가 이미 폐지이면 잡지 않는다", async () => {
    const entries = [isoEntry("iso-11898-5-2007", "ISO 11898-5:2007 Road vehicles — CAN — Part 5")]
    const { keys } = await run(iso, entries, [], context())
    assert.deepStrictEqual(keys, ["ISO 11898-5 | withdrawn | ISO 11898-5:2007"])
    const withdrawn = await run(
      iso,
      entries,
      [page("iso-11898-5", "ISO 11898-5", "ISO", "2007", "폐지")],
      context(),
    )
    assert.deepStrictEqual(withdrawn.keys, [])
  })

  test("현행으로 인용한 판이 대체되면 새 판으로 잡는다", async () => {
    const { keys } = await run(
      iso,
      [isoEntry("iso-13400-2-2019", "ISO 13400-2:2019 Road vehicles — DoIP — Part 2")],
      [],
      context(),
    )
    assert.deepStrictEqual(keys, ["ISO 13400-2 | new-edition | ISO 13400-2:2025"])
  })

  test("인용하지 않은 추보를 잡고, 인용한 추보는 잡지 않는다", async () => {
    const base = isoEntry(
      "iso-24089-2023",
      "ISO 24089:2023 Road vehicles — Software update engineering",
      77796,
    )
    const pages = [page("iso-24089", "ISO 24089", "ISO", "2023")]
    const { keys } = await run(iso, [base], pages, context())
    assert.deepStrictEqual(keys, ["ISO 24089 | supplement | ISO 24089:2023/Amd 1:2024"])
    const cited = await run(
      iso,
      [
        base,
        isoEntry("iso-24089-amd-1-2024", "ISO 24089:2023/Amd 1:2024 Road vehicles — Amendment 1"),
      ],
      pages,
      context(),
    )
    assert.deepStrictEqual(cited.keys, [])
  })

  test("머리에 /가 있는 공동 표준(ISO/IEC)의 추보도 잡는다", async () => {
    const { keys } = await run(
      iso,
      [isoEntry("iso-iec-18033-4-2011", "ISO/IEC 18033-4:2011 Encryption algorithms — Part 4")],
      [],
      context(),
    )
    assert.deepStrictEqual(keys, ["ISO/IEC 18033-4 | supplement | ISO/IEC 18033-4:2011/Amd 1:2020"])
  })

  test("시리즈 페이지가 인용한 부의 판 연도 뒤에 발행된 부를 새 부로 잡는다", async () => {
    // 부의 판이 모두 2018년인 시리즈. 2027년에 발행된 부를 하나 더 넣는다.
    const text =
      fs.readFileSync(path.join(fixtures, data), "utf8") +
      '{"id":990013,"deliverableType":"IS","supplementType":null,"reference":"ISO 26262-13:2027",' +
      '"publicationDate":"2027-03-01","edition":1,"currentStage":6060,"replaces":null,"replacedBy":null}\n'
    const entries = [
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((part) =>
        isoEntry(
          `iso-26262-${part}-2018`,
          `ISO 26262-${part}:2018 Road vehicles — Functional safety`,
        ),
      ),
      isoEntry("iso-dis-26262-1-2026", "ISO/DIS 26262-1 Road vehicles — Functional safety", 90020),
    ]
    const pages = [page("iso-26262", "ISO 26262", "ISO", "2018")]
    assert.deepStrictEqual((await run(iso, entries, pages, context())).keys, [])
    const { keys } = await run(
      iso,
      entries,
      pages,
      fixtureContext({ [isoDataUrl]: () => new Response(text) }),
    )
    assert.deepStrictEqual(keys, ["ISO 26262 | new-part | ISO 26262-13:2027"])
  })

  test("edition 없는 시리즈 페이지도 한 출판물로 묶고, 인용한 부의 가장 늦은 판 뒤에 발행된 부만 새 부로 잡는다", async () => {
    // 2026-10-24에는 ISO/IEC/IEEE 29119-8이 60.00(발행 준비)이다. 발행된 것으로 바꿔 넣는다.
    // ISO/IEC TR 29119-13은 인용한 가장 늦은 판(29119-5:2024) 전인 2023년에 발행된 것으로 바꾼다.
    const text = fs
      .readFileSync(path.join(fixtures, data), "utf8")
      .replace(
        /"reference":"ISO\/IEC\/IEEE 29119-8","publicationDate":null,"edition":1,"currentStage":6000/,
        '"reference":"ISO/IEC/IEEE 29119-8:2027","publicationDate":"2027-03-01","edition":1,"currentStage":6060',
      )
      .replace(
        /"reference":"ISO\/IEC TR 29119-13:2022","publicationDate":"2022-11-18"/,
        '"reference":"ISO/IEC TR 29119-13:2023","publicationDate":"2023-11-18"',
      )
    const parts = [
      ["1", "2022", 81291],
      ["2", "2021", 79428],
      ["3", "2021", 79429],
      ["4", "2021", 79430],
      ["5", "2024", 87233],
    ] as const
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "edition-status-iso-"))
    const files: Record<string, string> = {
      "content/iso-iec-ieee-29119.md":
        "---\ntitle: ISO/IEC/IEEE 29119\npublisher: ISO/IEC/IEEE\nstatus: 유효\n---\n\n" +
        parts.map(([part, year]) => `문장이다.[@iso-iec-ieee-29119-${part}-${year}]`).join(" ") +
        "\n",
    }
    for (const [part, year, id] of parts) {
      const key = `iso-iec-ieee-29119-${part}-${year}`
      files[`bib/${key}.bib`] =
        `@misc{${key},\n  title = {ISO/IEC/IEEE 29119-${part}:${year} Software testing},\n` +
        `  author = {{ISO}},\n  url = {https://www.iso.org/standard/${id}.html},\n}\n`
    }
    try {
      for (const [rel, body] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
        fs.writeFileSync(path.join(root, rel), body)
      }
      const tree = loadTree(root)
      const publications = assign(citedEntries(tree), standardPages(tree), [iso]).get(iso)!
      assert.deepStrictEqual(
        publications.map((publication) => [publication.name, publication.entries.length]),
        [["ISO/IEC/IEEE 29119", 5]],
      )
      assert.deepStrictEqual(await iso.check(publications, context()), [])
      const changes = await iso.check(
        publications,
        fixtureContext({ [isoDataUrl]: () => new Response(text) }),
      )
      assert.deepStrictEqual(changes.map(changeKey), [
        "ISO/IEC/IEEE 29119 | new-part | ISO/IEC/IEEE 29119-8:2027",
      ])
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  test("현행으로 인용한 판의 레코드를 찾지 못하면 실패한다", async () => {
    await assert.rejects(
      run(iso, [isoEntry("iso-99999-2024", "ISO 99999:2024 Nothing")], [], context()),
      ChannelError,
    )
  })

  test("응답하지 않거나 기대한 필드가 없으면 실패한다", async () => {
    const entries = [isoEntry("iso-11898-5-2007", "ISO 11898-5:2007 Road vehicles — CAN — Part 5")]
    await assert.rejects(run(iso, entries, [], fixtureContext({})), ChannelError)
    const broken = fixtureContext({
      [isoDataUrl]: () => new Response('{"id":1,"reference":"ISO 1:2000"}\n'),
    })
    await assert.rejects(run(iso, entries, [], broken), /필드/)
  })
})
