import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import path from "node:path"
import { ChannelError } from "../model"
import { entry, fixtureContext, fixtures, run } from "../testing"
import { certificationsUrl, istqb } from "./istqb"

// 픽스처는 2026-10-24의 자격 페이지 목록(pages?parent=605)에서 content를 이름에 Syllabus가 든 <a> 요소만 남기고
// prettier로 다듬은 것이다.
const data = "istqb/certifications.json"
const context = () => fixtureContext({ [certificationsUrl()]: data })
const withText = (text: string) =>
  fixtureContext({ [certificationsUrl()]: () => new Response(text) })
const read = () => fs.readFileSync(path.join(fixtures, data), "utf8")
const publisher = "International Software Testing Qualifications Board (ISTQB)"
const syllabus = (key: string, title: string, url?: string, note?: string) =>
  entry(key, title, { publisher, url, note })
const uploads = "https://istqb.org/wp-content/uploads/2024/11"

const ctfl2018 = syllabus(
  "istqb-ctfl-syllabus-2019",
  "Certified Tester Foundation Level Syllabus, Version 2018 V3.1",
  "https://web.archive.org/web/20211005082826/https://www.istqb.org/downloads/send/2-foundation-level-documents/281-istqb-ctfl-syllabus-2018-v3-1.html",
)
const ctfl = syllabus(
  "istqb-ctfl-syllabus-2024",
  "Certified Tester Foundation Level Syllabus, v4.0.1",
  `${uploads}/ISTQB_CTFL_Syllabus_v4.0.1.pdf`,
)
const cited = [
  ctfl2018,
  ctfl,
  syllabus(
    "istqb-ct-act-syllabus-2019",
    "Certified Tester Specialist Syllabus, Foundation Level Acceptance Testing, Version 2019",
    `${uploads}/ISTQB-CT-AcT_Syllabus_v1.0_2019.pdf`,
  ),
  syllabus(
    "istqb-ct-aut-syllabus-2025",
    "Certified Tester Automotive Software Tester (CT-AuT) Syllabus, v2.1.1",
    "https://istqb.org/?sdm_process_download=1&download_id=3615",
  ),
  syllabus(
    "istqb-ct-mbt-syllabus-2024",
    "Certified Tester Model-Based Testing (CT-MBT) Syllabus, v1.1",
    `${uploads}/ISTQB_CT-MBT_-_Syllabus_Version_v1.1.pdf`,
  ),
  syllabus(
    "istqb-ctal-ta-syllabus-2025",
    "Certified Tester Advanced Level Test Analyst (CTAL-TA) Syllabus, v4.0",
    "https://istqb.org/?sdm_process_download=1&download_id=5745",
  ),
  syllabus(
    "istqb-ctal-tae-syllabus-2024",
    "Certified Tester Advanced Level Test Automation Engineering (CTAL-TAE) Syllabus, v2.0",
    `${uploads}/ISTQB_CTAL-TAE_Syllabus_v2.0.pdf`,
  ),
  syllabus(
    "istqb-ctal-tm-syllabus-2024",
    "Certified Tester Advanced Level Test Management Syllabus, v3.0",
    `${uploads}/ISTQB_CTAL-TM_Syllabus_v3.0_zKjKsaN.pdf`,
  ),
]

describe("istqb", () => {
  test("강의계획서마다 출판물 하나로 묶고, 온라인 용어집은 맡지 않는다", () => {
    assert.deepStrictEqual(
      cited.map((e) => istqb.publicationOf(e)),
      [
        "ISTQB CTFL",
        "ISTQB CTFL",
        "ISTQB CT-AcT",
        "ISTQB CT-AuT",
        "ISTQB CT-MBT",
        "ISTQB CTAL-TA",
        "ISTQB CTAL-TAE",
        "ISTQB CTAL-TM",
      ],
    )
    const glossary = entry("istqb-glossary-testing-2026", "ISTQB Glossary — testing", {
      publisher: "{ISTQB}",
    })
    assert.strictEqual(istqb.publicationOf(glossary), undefined)
  })

  test("인용한 버전이 자격 페이지의 현행이면 잡지 않는다", async () => {
    // CTFL v3.1은 옛 판 엔트리다. CT-AcT는 제목에 연도(Version 2019)만 있어 링크 이름의 연도와 견준다.
    const { keys } = await run(istqb, cited, [], context())
    assert.deepStrictEqual(keys, [])
  })

  test("현행으로 인용한 버전보다 새 버전을 새 판으로 잡는다", async () => {
    const { keys, changes } = await run(istqb, [ctfl2018], [], context())
    assert.deepStrictEqual(keys, ["ISTQB CTFL | new-edition | ISTQB CTFL v4.0.1"])
    assert.ok(
      changes[0].evidence.some(
        (e) => e.value === "ISTQB CTFL Syllabus v4.0.1" && e.url.endsWith("-ctfl-v4-0/"),
      ),
    )
    const act = await run(
      istqb,
      [cited[2]],
      [],
      withText(read().replace("CT-AcT Syllabus v1.0 2019", "CT-AcT Syllabus v1.1")),
    )
    assert.deepStrictEqual(act.keys, ["ISTQB CT-AcT | new-edition | ISTQB CT-AcT v1.1"])
    // CTAL-TA는 v3.1.2([Retiring])와 v4.0 페이지가 함께 있다. v4.0의 링크 이름은 낱말을 _로 잇는다.
    const ta = await run(
      istqb,
      [
        syllabus(
          "istqb-ctal-ta-syllabus-2021",
          "Certified Tester Advanced Level Test Analyst (CTAL-TA) Syllabus, v3.1.2",
        ),
      ],
      [],
      context(),
    )
    assert.deepStrictEqual(ta.keys, ["ISTQB CTAL-TA | new-edition | ISTQB CTAL-TA v4.0"])
  })

  test("같은 버전을 다시 올린 것은 잡지 않는다", async () => {
    // CTAL-TM v3.0은 2026-08-17에 같은 버전의 PDF를 다시 올렸다(wp-content/uploads/2026/08/ISTQB_CTAL-TM_Syllabus_v3.0.pdf).
    // 링크가 새 파일을 가리켜도 버전 문자열이 같으면 같은 판이다.
    const reuploaded = read()
      .replace(
        "https://istqb.org/?sdm_process_download=1&#038;download_id=3445",
        "https://istqb.org/wp-content/uploads/2026/08/ISTQB_CTAL-TM_Syllabus_v3.0.pdf",
      )
      .replace("ISTQB CTAL-TM Syllabus v3.0", "ISTQB_CTAL-TM_Syllabus_v3.0")
    assert.notStrictEqual(reuploaded, read())
    const { keys } = await run(istqb, [cited[7]], [], withText(reuploaded))
    assert.deepStrictEqual(keys, [])
  })

  test("모든 링크가 [Retired] 페이지에만 있으면 폐지로 잡는다", async () => {
    const retired = read().replace(
      '"Certified Tester Model-Based Tester (CT-MBT)"',
      '"Certified Tester Model-Based Tester (CT-MBT) [Retired]"',
    )
    const { keys } = await run(istqb, [cited[4]], [], withText(retired))
    assert.deepStrictEqual(keys, ["ISTQB CT-MBT | withdrawn | ISTQB CT-MBT v1.1"])
  })

  test("응답하지 않거나 기대한 필드가 없으면 실패한다", async () => {
    await assert.rejects(run(istqb, [ctfl], [], fixtureContext({})), ChannelError)
    await assert.rejects(run(istqb, [ctfl], [], withText("[]")), ChannelError)
    await assert.rejects(run(istqb, [ctfl], [], withText('[{"id":501}]')), /title, content, link/)
    await assert.rejects(
      run(istqb, [ctfl], [], withText(read().replace(/CTFL[ _]Syllabus/g, "CTFL"))),
      /ISTQB CTFL 강의계획서를 찾지 못했다/,
    )
  })
})
