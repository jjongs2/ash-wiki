import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import path from "node:path"
import { ChannelError } from "../model"
import { entry, fixtureContext, fixtures, page, run } from "../testing"
import { ieeeChannel } from "./ieee"

// 픽스처는 2026-10-24에 받은 IEEE SA 표준 페이지에서 <title>, standard-details, Active Projects 탭만 남긴 것이다.
const ieee = ieeeChannel(0)
const site = "https://standards.ieee.org/ieee"
const routes = {
  [`${site}/802.1Q/6844/`]: "ieee/802.1Q-2018.html",
  [`${site}/802.1Q/10323/`]: "ieee/802.1Q-2022.html",
  [`${site}/802.1AE/7154/`]: "ieee/802.1AE-2018.html",
  [`${site}/802.1AS/11968/`]: "ieee/802.1AS-2025.html",
  [`${site}/1588/6825/`]: "ieee/1588-2019.html",
  [`${site}/1722/11685/`]: "ieee/1722-2025.html",
  [`${site}/1722.1/6670/`]: "ieee/1722.1-2021.html",
  [`${site}/1003.1/7700/`]: "ieee/1003.1-2024.html",
  [`${site}/1028/4402/`]: "ieee/1028-2008.html",
  [`${site}/1003.13/3322/`]: "ieee/1003.13-2003.html",
  [`${site}/1733/4748/`]: "ieee/1733-2011.html",
  [`${site}/829/3787/`]: "ieee/829-2008.html",
  [`${site}/1471/2187/`]: "ieee/1471-2000.html",
  [`${site}/42010/5334/`]: "ieee/42010-2011.html",
  [`${site}/42010/6846/`]: "ieee/42010-2022.html",
  "https://standards.ieee.org/standard/1012-2024.html": "ieee/1012-2024.html",
}
const context = () => fixtureContext(routes)
const ieeeEntry = (key: string, title: string, url?: string, publisher = "{IEEE}") =>
  entry(key, title, { publisher, url })

describe("ieee", () => {
  test("엔트리를 기준 번호의 출판물로 묶고, 워킹그룹 페이지와 ISO 공동 표준은 맡지 않는다", () => {
    const name = (title: string, publisher = "{IEEE}") =>
      ieee.publicationOf(ieeeEntry("key", title, undefined, publisher))
    assert.strictEqual(name("IEEE SA — IEEE 1003.1-2017 IEEE Standard"), "IEEE 1003.1")
    assert.strictEqual(name("IEEE 802.1Qbv-2015 IEEE Standard"), "IEEE 802.1Q")
    assert.strictEqual(name("IEEE 1588g-2022 IEEE Standard"), "IEEE 1588")
    assert.strictEqual(name("IEEE/SAE 802.1DP-2025 IEEE/SAE Standard"), "IEEE/SAE 802.1DP")
    assert.strictEqual(
      name("IEC/IEEE 60802-2026 IEC/IEEE International Standard"),
      "IEC/IEEE 60802",
    )
    assert.strictEqual(
      name("P802.1AE-2018-Rev: MAC Security", "{IEEE 802.1 Working Group}"),
      "IEEE 802.1AE",
    )
    assert.strictEqual(name("IEEE SA — P1003.1-2024/Cor 1 IEEE/Open Group Standard"), "IEEE 1003.1")
    assert.strictEqual(name("P802.3dm PAR: IEEE Standard for Ethernet Amendment"), "IEEE 802.3")
    assert.strictEqual(name("IEEE 802.3-2022/Cor 1-2024 IEEE Standard for Ethernet"), "IEEE 802.3")
    assert.strictEqual(name("P4 Language Specification", "{P4.org}"), undefined)
    assert.strictEqual(name("IEEE 802.1 Time-Sensitive Networking Task Group"), undefined)
    assert.strictEqual(name("802.1Qbv - Enhancements for Scheduled Traffic"), undefined)
    assert.strictEqual(
      name("IEEE/ISO/IEC 42010-2011 — Systems and software engineering"),
      undefined,
    )
  })

  test("현행으로 인용한 판이 대체되면 Superseded by를 따라가 새 판으로 잡는다", async () => {
    // Wayback 사본의 URL에서 원 URL을 꺼낸다. 대체된 판의 추보(802.1Qcc-2018 등)는 새 판에 합쳐져 잡지 않는다.
    const { keys, changes } = await run(
      ieee,
      [
        ieeeEntry(
          "ieee-802-1q-2018",
          "IEEE 802.1Q-2018 IEEE Standard for Local and Metropolitan Area Networks",
          `https://web.archive.org/web/20260101000000/${site}/802.1Q/6844/`,
        ),
      ],
      [],
      context(),
    )
    assert.deepStrictEqual(keys, ["IEEE 802.1Q | new-edition | IEEE 802.1Q-2022"])
    assert.deepStrictEqual(
      changes[0].current.map((e) => e.key),
      ["ieee-802-1q-2018"],
    )
    assert.ok(
      changes[0].evidence.some(
        (e) => e.field.endsWith("Superseded by") && e.value === "802.1Q-2022",
      ),
    )
  })

  test("다른 번호로 대체된 판은 현행판까지 따라가 대체로 잡는다", async () => {
    // 1471-2000 → 42010-2011(Inactive-Reserved) → 42010-2022(Active)
    const context = fixtureContext(routes)
    const started = Date.now()
    const { keys } = await run(
      ieeeChannel(30),
      [
        ieeeEntry(
          "ieee-1471-2000",
          "IEEE 1471-2000 — IEEE Recommended Practice",
          `${site}/1471/2187/`,
        ),
      ],
      [],
      context,
    )
    assert.deepStrictEqual(keys, ["IEEE 1471 | replaced | IEEE 42010-2022"])
    assert.deepStrictEqual(context.requested, [
      `${site}/1471/2187/`,
      `${site}/42010/5334/`,
      `${site}/42010/6846/`,
    ])
    // 요청 사이에 간격을 둔다.
    assert.ok(Date.now() - started >= 60)
  })

  test("현행으로 인용한 판을 대체한 판을 이미 인용했으면 잡지 않는다", async () => {
    // 페이지의 edition은 2018이지만, 참고문헌은 대체한 802.1Q-2022도 인용했다.
    const { keys } = await run(
      ieee,
      [
        ieeeEntry("ieee-802-1q-2018", "IEEE 802.1Q-2018 IEEE Standard", `${site}/802.1Q/6844/`),
        ieeeEntry("ieee-802-1q-2022", "IEEE 802.1Q-2022 IEEE Standard"),
      ],
      [page("ieee-802-1q", "IEEE 802.1Q", "IEEE", "2018")],
      context(),
    )
    assert.deepStrictEqual(keys, [])
  })

  test("Inactive 판을 폐지로 잡고, status가 이미 폐지인 페이지는 잡지 않는다", async () => {
    const withdrawn = await run(
      ieee,
      [ieeeEntry("ieee-1733-2011", "IEEE 1733-2011 IEEE Standard", `${site}/1733/4748/`)],
      [],
      context(),
    )
    assert.deepStrictEqual(withdrawn.keys, ["IEEE 1733 | withdrawn | IEEE 1733-2011"])
    const { keys } = await run(
      ieee,
      [
        ieeeEntry("ieee-1028-2008", "IEEE 1028-2008 IEEE Standard for Software Reviews and Audits"),
        ieeeEntry(
          "ieee-1028-status-2026",
          "IEEE SA — IEEE 1028-2008 IEEE Standard for Software Reviews and Audits",
          `${site}/1028/4402/`,
        ),
        ieeeEntry(
          "ieee-1003-13-2003",
          "IEEE SA — IEEE 1003.13-2003 IEEE Standard for Information Technology",
          `${site}/1003.13/3322/`,
        ),
      ],
      [
        page("ieee-1028", "IEEE 1028", "IEEE", "2008", "폐지"),
        page("ieee-1003-13", "IEEE 1003.13", "IEEE", "2003", "폐지"),
      ],
      context(),
    )
    assert.deepStrictEqual(keys, [])
  })

  test("대체한 판을 적지 않은 Superseded 판은 대체로 잡는다", async () => {
    const { keys } = await run(
      ieee,
      [
        ieeeEntry("ieee-829-1998", "IEEE 829-1998 — IEEE Standard for Software Test Documentation"),
        ieeeEntry("ieee-829-2008", "IEEE 829-2008 — IEEE Standard", `${site}/829/3787/`),
      ],
      [],
      context(),
    )
    assert.deepStrictEqual(keys, ["IEEE 829 | replaced | IEEE 829-2008"])
  })

  test("인용하지 않은 개정 PAR를 개정 착수로 잡는다", async () => {
    const entries = [
      ieeeEntry("ieee-802-1ae-2018", "IEEE 802.1AE-2018 IEEE Standard", `${site}/802.1AE/7154/`),
      ieeeEntry("ieee-802-1aedk-2023", "IEEE 802.1AEdk-2023 IEEE Standard"),
      ieeeEntry("ieee-802-1ae-cor-2020", "IEEE 802.1AE-2018/Cor 1-2020 IEEE Standard"),
    ]
    const pages = [page("ieee-802-1ae", "IEEE 802.1AE", "IEEE", "2018", "개정 중")]
    const { keys, changes } = await run(ieee, entries, pages, context())
    assert.deepStrictEqual(keys, ["IEEE 802.1AE | revision | P802.1AE (802.1AE-2018 개정)"])
    assert.ok(changes[0].evidence.some((e) => e.url === `${site}/802.1AE/12245/`))
    assert.deepStrictEqual(
      changes[0].current.map((e) => e.key),
      ["ieee-802-1ae-2018"],
    )
    // 이 판의 개정이라고 밝힌 프로젝트 엔트리가 있으면 이미 안다.
    const project = ieeeEntry(
      "ieee-p802-1ae-rev-2025",
      "P802.1AE-2018-Rev: MAC Security",
      "https://1.ieee802.org/p802-1ae-2018-rev/",
      "{IEEE 802.1 Working Group}",
    )
    assert.deepStrictEqual((await run(ieee, [...entries, project], pages, context())).keys, [])
    // 앞 개정의 프로젝트 페이지(같은 번호 P802.1AE)는 이 판의 개정을 인용한 것이 아니다.
    const previous = ieeeEntry(
      "ieee-802-1ae-project-2017",
      "P802.1AE – MAC Security",
      "https://www.ieee802.org/1/pages/802.1ae.html",
      "{IEEE 802.1 Working Group}",
    )
    assert.deepStrictEqual((await run(ieee, [...entries, previous], pages, context())).keys, [
      "IEEE 802.1AE | revision | P802.1AE (802.1AE-2018 개정)",
    ])
  })

  test("개정 PAR의 페이지를 인용했으면 개정 착수를 알리지 않는다", async () => {
    const { keys } = await run(
      ieee,
      [
        ieeeEntry("ieee-1588-2019", "IEEE 1588-2019 IEEE Standard", `${site}/1588/6825/`),
        ieeeEntry(
          "ieee-p1588-2024",
          "IEEE P1588 Standard for a Precision Clock",
          `${site}/1588/11795/`,
        ),
      ],
      [page("ieee-1588", "IEEE 1588", "IEEE", "2019", "개정 중")],
      context(),
    )
    assert.deepStrictEqual(
      keys.filter((key) => key.includes("| revision |")),
      [],
    )
  })

  test("진행 중인 추보·정정 프로젝트(P1722c, P1003.1-2024/Cor 1)는 개정 착수로 잡지 않는다", async () => {
    const { keys } = await run(
      ieee,
      [
        ieeeEntry("ieee-1722-2025", "IEEE 1722-2025 IEEE Standard", `${site}/1722/11685/`),
        ieeeEntry(
          "ieee-1003-1-2024",
          "IEEE SA — IEEE 1003.1-2024 IEEE/Open Group Standard",
          `${site}/1003.1/7700/`,
        ),
      ],
      [
        page("ieee-1722", "IEEE 1722", "IEEE", "2025"),
        page("ieee-1003-1", "IEEE 1003.1", "IEEE/The Open Group", "2024", "개정 중"),
      ],
      context(),
    )
    assert.deepStrictEqual(keys, [])
  })

  test("현행판에 발행된 추보·정정 가운데 인용하지 않은 것을 잡는다", async () => {
    // IEEE 추보는 별도 번호(802.1ASds)로 나오고 다음 개정판에 합쳐진다. 현행판 페이지의 Amendments, Corrigenda가 근거다.
    const as = [
      ieeeEntry("ieee-802-1as-2025", "IEEE 802.1AS-2025 IEEE Standard", `${site}/802.1AS/11968/`),
      ieeeEntry("ieee-p802-1as-2026", "IEEE P802.1AS Standard", `${site}/802.1AS/12553/`),
      ieeeEntry("ieee-802-1asds-2026", "IEEE 802.1ASds-2026 IEEE Standard"),
    ]
    const asPage = [page("ieee-802-1as", "IEEE 802.1AS", "IEEE", "2025", "개정 중")]
    assert.deepStrictEqual((await run(ieee, as, asPage, context())).keys, [
      "IEEE 802.1AS | supplement | IEEE 802.1ASed-2026",
    ])
    // 추보의 표준 페이지를 가리키는 엔트리도 인용으로 친다(프로젝트와 발행본이 같은 id다).
    const ased = ieeeEntry(
      "ieee-p802-1ased-2025",
      "IEEE P802.1ASed Standard",
      `${site}/802.1ASed/11749/`,
    )
    assert.deepStrictEqual((await run(ieee, [...as, ased], asPage, context())).keys, [])

    const avdecc = [
      ieeeEntry("ieee-1722-1-2021", "IEEE 1722.1-2021 IEEE Standard", `${site}/1722.1/6670/`),
      ieeeEntry("ieee-p1722-1-2026", "IEEE P1722.1 Standard", `${site}/1722.1/12471/`),
    ]
    assert.deepStrictEqual((await run(ieee, avdecc, [], context())).keys, [
      "IEEE 1722.1 | supplement | IEEE 1722.1-2021/Cor 1-2025",
    ])
    const cor = ieeeEntry("ieee-1722-1-cor-2025", "IEEE 1722.1-2021/Cor 1-2025 IEEE Standard")
    assert.deepStrictEqual((await run(ieee, [...avdecc, cor], [], context())).keys, [])
  })

  test("표준 페이지 URL이 없는 엔트리는 판 이름의 옛 주소로 묻는다", async () => {
    const context = fixtureContext(routes)
    const { keys } = await run(
      ieee,
      [
        ieeeEntry(
          "ieee-1012-2024",
          "IEEE 1012-2024 IEEE Standard",
          "https://ieeexplore.ieee.org/document/11134780",
        ),
      ],
      [],
      context,
    )
    assert.deepStrictEqual(keys, [])
    assert.deepStrictEqual(context.requested, [
      "https://standards.ieee.org/standard/1012-2024.html",
    ])
  })

  test("응답하지 않거나(403 포함) 기대한 칸이 없거나 다른 판의 페이지이면 실패한다", async () => {
    const entries = [
      ieeeEntry("ieee-1733-2011", "IEEE 1733-2011 IEEE Standard", `${site}/1733/4748/`),
    ]
    const html = fs.readFileSync(path.join(fixtures, "ieee/1733-2011.html"), "utf8")
    const respond =
      (body: string, status = 200) =>
      () =>
        new Response(body, { status })
    const attempt = (body: string, status?: number) =>
      run(ieee, entries, [], fixtureContext({ [`${site}/1733/4748/`]: respond(body, status) }))
    await assert.rejects(run(ieee, entries, [], fixtureContext({})), ChannelError)
    await assert.rejects(attempt("<title>Just a moment...</title>", 403), ChannelError)
    await assert.rejects(attempt("<title>Just a moment...</title>"), /Cloudflare/)
    await assert.rejects(attempt(html.replace('id="stnd-status"', 'id="other"')), /Status/)
    await assert.rejects(
      attempt(html.replace("Inactive-Reserved", "Unknown")),
      /Status를 알 수 없다/,
    )
    await assert.rejects(attempt(html.replace("1733-2011", "1733-2026")), /표준 페이지가 아니다/)
  })
})
