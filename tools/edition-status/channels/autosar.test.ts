import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import path from "node:path"
import { ChannelError } from "../model"
import { entry, fixtureContext, fixtures, page, run } from "../testing"
import {
  acceptanceSearchUrl,
  acceptanceTests,
  autosar,
  platforms,
  releaseOverviewUrl,
} from "./autosar"

// 픽스처는 2026-10-24에 받았다. 플랫폼 페이지는 Current Release 절만, 문서 검색은 결과의 data-document-url만,
// AP R25-11 Release Overview PDF는 글자가 든 내용 스트림만 남겼다. HTML은 prettier로 다듬었다.
const routes = {
  [platforms[0].url]: "autosar/classic-platform.html",
  [platforms[1].url]: "autosar/adaptive-platform.html",
  [platforms[2].url]: "autosar/foundation.html",
  [acceptanceSearchUrl]: "autosar/tc-search.html",
  [releaseOverviewUrl("AP", "R25-11")]: "autosar/AUTOSAR_AP_TR_ReleaseOverview-R25-11.pdf",
}
const context = () => fixtureContext(routes)
const read = (file: string) => fs.readFileSync(path.join(fixtures, file), "utf8")
const doc = (key: string, title: string, url?: string) =>
  entry(key, title, { publisher: "AUTOSAR", url })
const pages = [
  page("autosar-classic-platform", "AUTOSAR Classic Platform", "AUTOSAR", "2025"),
  page("autosar-adaptive-platform", "AUTOSAR Adaptive Platform", "AUTOSAR", "2025"),
  page("autosar-acceptance-tests", acceptanceTests, "AUTOSAR", "2016"),
]
const standards = "https://www.autosar.org/fileadmin/standards"

describe("autosar", () => {
  test("릴리스 표시로 플랫폼마다 출판물 하나에 묶는다", () => {
    const of = (title: string, publisher = "AUTOSAR") =>
      autosar.publicationOf(entry("x", title, { publisher }))
    assert.strictEqual(
      of("Specification of RTE Software (AUTOSAR CP R25-11)"),
      "AUTOSAR Classic Platform",
    )
    assert.strictEqual(
      of("Release 4.0 Overview and Revision History (AUTOSAR R4.0.3)"),
      "AUTOSAR Classic Platform",
    )
    assert.strictEqual(
      of("Specification of Persistency (AUTOSAR AP R25-11)"),
      "AUTOSAR Adaptive Platform",
    )
    assert.strictEqual(of("E2E Protocol Specification (AUTOSAR FO R25-11)"), "AUTOSAR Foundation")
    assert.strictEqual(
      of("Overview of Acceptance Tests (AUTOSAR TC Release 1.2.0)"),
      acceptanceTests,
    )
    assert.strictEqual(of("AUTOSAR Concept Roadmap"), undefined)
    assert.strictEqual(of("Paper on AUTOSAR CP R25-11", "Someone"), undefined)
  })

  test("현행으로 인용한 릴리스가 통로의 현행이면 잡지 않는다", async () => {
    // 2026-10-24에는 세 플랫폼 모두 R25-11이 현행이고, R26-11은 12월 3일에 나온다. 옛 릴리스 엔트리는 이력의 근거다.
    const { keys } = await run(
      autosar,
      [
        doc("autosar-cp-sws-os-2025", "Specification of Operating System (AUTOSAR CP R25-11)"),
        doc("autosar-cp-sws-os-2023", "Specification of Operating System (AUTOSAR CP R23-11)"),
        doc(
          "autosar-cp-releaseoverview-r4-3-1-2017",
          "Classic Platform Release Overview (AUTOSAR CP R4.3.1)",
        ),
        doc(
          "autosar-cp-releaseoverview-r4-0-3-2013",
          "Release 4.0 Overview and Revision History (AUTOSAR R4.0.3)",
        ),
        doc(
          "autosar-ap-sws-platformhealthmanagement-2025",
          "Specification of Platform Health Management (AUTOSAR AP R25-11)",
        ),
        doc(
          "autosar-ap-sws-platformhealthmanagement-2022",
          "Specification of Platform Health Management (AUTOSAR AP R22-11)",
        ),
        doc("autosar-fo-prs-e2eprotocol-2025", "E2E Protocol Specification (AUTOSAR FO R25-11)"),
        doc(
          "autosar-tc-exp-acceptancetestsoverview-2016",
          "Overview of Acceptance Tests (AUTOSAR TC Release 1.2.0)",
        ),
      ],
      pages,
      context(),
    )
    assert.deepStrictEqual(keys, [])
  })

  test("플랫폼의 새 릴리스를 새 판으로 잡고, Obsolete·Removed 목록을 옮긴다", async () => {
    // AP는 R24-11 엔트리도 인용한다. 그 엔트리만 남겨 R25-11이 새로 나온 때로 본다.
    const { keys, changes } = await run(
      autosar,
      [
        doc(
          "autosar-ap-sws-platformhealthmanagement-2024",
          "Specification of Platform Health Management (AUTOSAR AP R24-11)",
          `${standards}/R24-11/AP/AUTOSAR_AP_SWS_PlatformHealthManagement.pdf`,
        ),
        doc(
          "autosar-ap-rs-manifestspecification-2024",
          "Requirements on Manifest Specification (AUTOSAR AP R24-11)",
          `${standards}/R24-11/AP/AUTOSAR_AP_RS_ManifestSpecification.pdf`,
        ),
        doc(
          "autosar-ap-sws-platformhealthmanagement-2022",
          "Specification of Platform Health Management (AUTOSAR AP R22-11)",
        ),
      ],
      pages,
      context(),
    )
    assert.deepStrictEqual(keys, ["AUTOSAR Adaptive Platform | new-edition | AUTOSAR AP R25-11"])
    assert.deepStrictEqual(
      changes[0].current.map((e) => e.key),
      ["autosar-ap-sws-platformhealthmanagement-2024", "autosar-ap-rs-manifestspecification-2024"],
    )
    assert.deepStrictEqual(changes[0].notes, [
      "Removed: AP RS ManifestSpecification (Requirements on Manifest Specification, UID 712) — 참고문헌이 인용한 문서",
      "Removed: AP RS IdentityAndAccessManagement (Requirements on Identity and Access Management, UID 899)",
    ])
    assert.ok(changes[0].evidence.some((e) => e.value === "AUTOSAR Adaptive Release R25-11"))
  })

  test("인수 시험의 새 릴리스를 문서 검색에서 잡는다", async () => {
    const search = read("autosar/tc-search.html").replace(
      "<div",
      '<div data-document-url="fileadmin/standards/R1.3.0/TC/AUTOSAR_TR_AcceptanceTestsClassicPlatformReleaseOverview.pdf"></div>\n<div',
    )
    const { keys } = await run(
      autosar,
      [
        doc(
          "autosar-tc-tr-acceptancetestsreleaseoverview-2016",
          "Acceptance Tests for Classic Platform Release Overview (AUTOSAR TC Release 1.2.0)",
        ),
      ],
      pages,
      fixtureContext({ ...routes, [acceptanceSearchUrl]: () => new Response(search) }),
    )
    assert.deepStrictEqual(keys, [`${acceptanceTests} | new-edition | AUTOSAR TC R1.3.0`])
  })

  test("응답하지 않거나 기대한 필드가 없으면 실패한다", async () => {
    const entries = [
      doc("autosar-cp-sws-os-2023", "Specification of Operating System (AUTOSAR CP R23-11)"),
    ]
    await assert.rejects(run(autosar, entries, pages, fixtureContext({})), ChannelError)
    const noRelease = fixtureContext({
      ...routes,
      [platforms[0].url]: () => new Response("<h5>About</h5>"),
    })
    await assert.rejects(run(autosar, entries, pages, noRelease), /Current Release/)
    // 새 릴리스가 페이지에 있는데 Release Overview가 없으면 Obsolete·Removed 목록을 옮길 수 없다.
    await assert.rejects(run(autosar, entries, pages, context()), ChannelError)
    const noSection = fixtureContext({
      ...routes,
      [releaseOverviewUrl("CP", "R25-11")]: () => new Response("%PDF-1.7\n%%EOF\n"),
    })
    await assert.rejects(run(autosar, entries, pages, noSection), /Obsolete Specifications/)
    const emptySearch = fixtureContext({ ...routes, [acceptanceSearchUrl]: () => new Response("") })
    await assert.rejects(
      run(
        autosar,
        [
          doc(
            "autosar-tc-exp-acceptancetestsoverview-2016",
            "Overview of Acceptance Tests (AUTOSAR TC Release 1.2.0)",
          ),
        ],
        pages,
        emptySearch,
      ),
      /TC Release Overview/,
    )
  })
})
