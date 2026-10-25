import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import path from "node:path"
import { ChannelError } from "../model"
import { entry, fixtureContext, fixtures, page, run } from "../testing"
import { documentUrl, mtdsgUrl, notificationUrl, unece } from "./unece"

// 픽스처는 2026-10-24에 treaties.un.org(MTDSG, C.N.)와 documents.un.org에서 받은 PDF에서 글꼴·그림 스트림을 비운 것이다.
const pdf = (name: string) => () =>
  new Response(fs.readFileSync(path.join(fixtures, "unece", name)), {
    headers: { "content-type": "application/pdf" },
  })
// documents.un.org가 없는 기호에 주는 200 응답(text/html, 1303바이트)
const notFound = () =>
  new Response(fs.readFileSync(path.join(fixtures, "unece", "documents-not-found.html")), {
    headers: { "content-type": "text/html" },
  })
const routes = {
  [mtdsgUrl("155")]: pdf("mtdsg-155.pdf"),
  [mtdsgUrl("156")]: pdf("mtdsg-156.pdf"),
  [notificationUrl("366", "2022")]: pdf("cn-366-2022.pdf"),
  [notificationUrl("37", "2024")]: pdf("cn-37-2024.pdf"),
  [notificationUrl("63", "2025")]: pdf("cn-63-2025.pdf"),
  [notificationUrl("237", "2026")]: pdf("cn-237-2026.pdf"),
  [documentUrl("E/ECE/TRANS/505/Rev.3/Add.154/Amend.1")]: pdf("add154-amend1.pdf"),
  [documentUrl("E/ECE/TRANS/505/Rev.3/Add.154/Amend.2")]: pdf("add154-amend2.pdf"),
  [documentUrl("E/ECE/TRANS/505/Rev.3/Add.154/Amend.3")]: pdf("add154-amend3.pdf"),
  [documentUrl("ECE/TRANS/WP.29/2024/55")]: pdf("wp29-2024-55.pdf"),
  [documentUrl("ECE/TRANS/WP.29/2025/142")]: pdf("wp29-2025-142.pdf"),
}
const context = (overrides: typeof routes = {}) => fixtureContext({ ...routes, ...overrides })

// 참고문헌의 엔트리(2026-10-24)
const r155 = entry(
  "unece-r155-2021",
  "UN Regulation No. 155 — Uniform provisions concerning the approval of vehicles with regards to cyber security and cyber security management system (E/ECE/TRANS/505/Rev.3/Add.154)",
)
const r155Amend = (n: number, year: number) =>
  entry(
    `unece-r155-amend${n}-${year}`,
    `UN Regulation No. 155 — Amendment ${n}, Supplement ${n} to the original version (E/ECE/TRANS/505/Rev.3/Add.154/Amend.${n})`,
  )
const r155Status = entry(
  "un-treaty-xi-b-16-155-2026",
  "United Nations Regulation No. 155 (Multilateral Treaties Deposited with the Secretary-General, Chapter XI-B-16-155)",
)
const r156 = entry(
  "unece-r156-2021",
  "UN Regulation No. 156 — Uniform provisions concerning the approval of vehicles with regards to software update and software updates management system (E/ECE/TRANS/505/Rev.3/Add.155)",
)
const r156Notice = entry(
  "un-cn-237-2026",
  "C.N.237.2026.TREATIES-XI.B.16.156 (Depositary Notification): Amendments to United Nations Regulation No. 156",
)
const r156Series = entry(
  "unece-wp29-2025-142-2025",
  "Proposal for a new 01 series of amendments to UN Regulation No. 156 (Software Update and Software Update Management System) (ECE/TRANS/WP.29/2025/142)",
)
const pages = [
  page("un-r155", "UN R155", "UNECE", "2021"),
  page("un-r156", "UN R156", "UNECE", "2026"),
]

describe("unece", () => {
  test("규정 하나를 든 엔트리를 UN R<번호>로 묶고, 해석 문서와 여러 규정의 제안은 맡지 않는다", () => {
    assert.strictEqual(unece.publicationOf(r155Status), "UN R155")
    assert.strictEqual(unece.publicationOf(r156Notice), "UN R156")
    assert.strictEqual(
      unece.publicationOf(
        entry(
          "unece-r155-interpretation-2023",
          "Proposal for amendments to the Interpretation Document of UN Regulation No. 155 (Cyber Security and Cyber Security Management System) (ECE/TRANS/WP.29/2023/45)",
        ),
      ),
      undefined,
    )
    assert.strictEqual(
      unece.publicationOf(
        entry(
          "unece-grva-2026-30-2026",
          "Proposal for amending UN Regulations Nos. 155 and No. 156 (ECE/TRANS/WP.29/GRVA/2026/30)",
        ),
      ),
      undefined,
    )
  })

  test("발효한 개정을 모두 인용했으면 잡지 않는다", async () => {
    // UN R155는 보충판 1~3을 규정 문서(Amend.n)로, UN R156은 01 시리즈를 C.N. 번호와 WP.29 기호로 인용한다.
    const { keys } = await run(
      unece,
      [r155, r155Amend(1, 2022), r155Amend(2, 2024), r155Amend(3, 2025), r155Status],
      pages,
      context(),
    )
    assert.deepStrictEqual(keys, [])
    const series = await run(unece, [r156, r156Notice, r156Series], pages, context())
    assert.deepStrictEqual(series.keys, [])
  })

  test("인용하지 않은 개정 시리즈를 새 판으로 잡는다", async () => {
    const { keys, changes } = await run(unece, [r156], pages, context())
    assert.deepStrictEqual(keys, [
      "UN R156 | new-edition | UN R156 01 series of amendments (ECE/TRANS/WP.29/2025/142)",
    ])
    assert.deepStrictEqual(
      changes[0].current.map((e) => e.key),
      ["unece-r156-2021"],
    )
    assert.ok(
      changes[0].evidence.some(
        (e) => e.value === "4 June 2026" && e.url === notificationUrl("237", "2026"),
      ),
    )
  })

  test("규정 번호가 없는 새 규정의 원문을 그 규정의 원판으로 본다", async () => {
    const proposal155 = entry(
      "unece-wp29-2020-79-2020",
      "Proposal for a new UN Regulation on uniform provisions concerning the approval of vehicles with regards to cyber security and cyber security management system (ECE/TRANS/WP.29/2020/79 Revised)",
    )
    const proposal156 = entry(
      "unece-wp29-2020-80-2020",
      "Proposal for a new UN Regulation on uniform provisions concerning the approval of vehicles with regards to software update and software updates management system (ECE/TRANS/WP.29/2020/80)",
    )
    assert.strictEqual(unece.publicationOf(proposal155), "UN R155")
    assert.strictEqual(unece.publicationOf(proposal156), "UN R156")
    const { keys, changes } = await run(unece, [proposal156], pages, context())
    assert.deepStrictEqual(keys, [
      "UN R156 | new-edition | UN R156 01 series of amendments (ECE/TRANS/WP.29/2025/142)",
    ])
    assert.deepStrictEqual(
      changes[0].current.map((e) => e.key),
      ["unece-wp29-2020-80-2020"],
    )
  })

  test("인용하지 않은 추보를 잡는다", async () => {
    const { keys, changes } = await run(
      unece,
      [r155, r155Amend(1, 2022), r155Amend(2, 2024)],
      pages,
      context(),
    )
    assert.deepStrictEqual(keys, [
      "UN R155 | supplement | UN R155 Supplement 3 (ECE/TRANS/WP.29/2024/55)",
    ])
    assert.deepStrictEqual(
      changes[0].current.map((e) => e.key),
      ["unece-r155-2021", "unece-r155-amend1-2022", "unece-r155-amend2-2024"],
    )
  })

  test("documents.un.org가 HTML로 답하면 변화 없음이 아니라 실패한다", async () => {
    await assert.rejects(
      run(
        unece,
        [r155, r155Amend(1, 2022), r155Amend(2, 2024), r155Amend(3, 2025)],
        pages,
        context({ [documentUrl("E/ECE/TRANS/505/Rev.3/Add.154/Amend.3")]: notFound }),
      ),
      (error: Error) =>
        error instanceof ChannelError && /PDF가 아니다\(text\/html\)/.test(error.message),
    )
    await assert.rejects(
      run(unece, [r156], pages, context({ [documentUrl("ECE/TRANS/WP.29/2025/142")]: notFound })),
      ChannelError,
    )
  })

  test("응답하지 않거나 통지 목록, 발효일, 인용한 판을 찾지 못하면 실패한다", async () => {
    await assert.rejects(run(unece, [r156], pages, fixtureContext({})), ChannelError)
    // MTDSG 자리에 C.N. 통지가 오면 TEXT 칸이 없다.
    await assert.rejects(
      run(unece, [r156], pages, context({ [mtdsgUrl("156")]: pdf("cn-237-2026.pdf") })),
      /TEXT/,
    )
    // C.N. 통지 자리에 MTDSG가 오면 발효일이 없다.
    await assert.rejects(
      run(
        unece,
        [r156],
        pages,
        context({ [notificationUrl("237", "2026")]: pdf("mtdsg-156.pdf") }),
      ),
      /발효일/,
    )
    await assert.rejects(run(unece, [r155Status], pages, context()), /인용한 판/)
  })
})
