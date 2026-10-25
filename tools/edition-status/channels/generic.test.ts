import test, { describe } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import path from "node:path"
import { repoRoot } from "../../repo"
import { Conventions } from "../../check-content/conventions"
import { ChannelError } from "../model"
import { entry, fixtureContext, page, run } from "../testing"
import { generic, genericRows } from "./generic"

// 표의 행을 그대로 쓴다. 픽스처는 2026-10-24에 받은 V-Modell XT 릴리스 디렉터리 목록(TU Clausthal 미러)과
// Automotive Threat Matrix 릴리스 API 응답이다.
const file = path.join(repoRoot, "docs", "wiki-verification.md")
const rows = genericRows(
  new Conventions(fs.readFileSync(file, "utf8"), file)
    .table("edition-generic", ["출판물"])
    .filter((row) => ["V-Modell XT", "Automotive Threat Matrix"].includes(row["출판물"])),
)
const channel = generic(rows, 0)
const url = (publication: string) => rows.find((row) => row.publication === publication)!.url
const context = () =>
  fixtureContext({
    [url("V-Modell XT")]: "generic/v-modell-xt-releases.html",
    [url("Automotive Threat Matrix")]: "generic/atm-release-record.json",
  })
const pages = [
  page("v-modell-xt", "V-Modell XT", "Weit e.V.", "2024"),
  page("automotive-threat-matrix", "Automotive Threat Matrix", "Auto-ISAC", "2025"),
]
const vModell = (version: string) =>
  entry(
    `weit-v-modell-xt-${version.replace(".", "-")}`,
    `V-Modell XT: Das deutsche Referenzmodell für Systementwicklungsprojekte, Version ${version}`,
  )
const atm = (version: string) =>
  entry(`auto-isac-atm-${version}`, `Automotive Threat Matrix (ATM) v${version}`)

describe("generic", () => {
  test("인용한 판이 URL의 가장 새 판과 같으면 잡지 않는다", async () => {
    const { keys } = await run(channel, [vModell("2.4"), atm("4.02")], pages, context())
    assert.deepStrictEqual(keys, [])
  })

  test("URL에 인용한 판보다 새 판이 있으면 새 판으로 잡는다", async () => {
    const { keys, changes } = await run(
      channel,
      [
        vModell("2.3"),
        entry("weit-v-modell-xt-releases-2026", "V-Modell XT Releases"),
        atm("4.01"),
        entry(
          "auto-isac-atm-launch-2024",
          "The Auto-ISAC Launches Automotive Threat Matrix (ATM) Tool",
        ),
      ],
      pages,
      context(),
    )
    assert.deepStrictEqual(keys, [
      "Automotive Threat Matrix | new-edition | Automotive Threat Matrix 4.02",
      "V-Modell XT | new-edition | V-Modell XT 2.4",
    ])
    // 판 표시가 없는 엔트리는 현행으로 인용한 판이 아니다.
    assert.deepStrictEqual(
      changes.map((change) => change.current.map((e) => e.key)),
      [["weit-v-modell-xt-2-3"], ["auto-isac-atm-4.01"]],
    )
  })

  test("URL에서 판 패턴을 찾지 못하거나 응답하지 않으면 세 번 묻고 실패한다", async () => {
    const empty = fixtureContext({ [url("V-Modell XT")]: () => new Response("<html></html>") })
    await assert.rejects(run(channel, [vModell("2.4")], pages, empty), ChannelError)
    assert.strictEqual(empty.requested.length, 3)
    await assert.rejects(run(channel, [vModell("2.4")], pages, fixtureContext({})), ChannelError)
  })

  test("판 목록 없는 셸 페이지를 한 번 주면 다시 물어 읽는다", async () => {
    const listing = fs.readFileSync(
      path.join(repoRoot, "tools/edition-status/fixtures/generic/v-modell-xt-releases.html"),
    )
    let calls = 0
    const shellOnce = fixtureContext({
      [url("V-Modell XT")]: () => new Response(calls++ === 0 ? "<html></html>" : listing),
    })
    const { keys } = await run(channel, [vModell("2.3")], pages, shellOnce)
    assert.deepStrictEqual(keys, ["V-Modell XT | new-edition | V-Modell XT 2.4"])
  })

  test("엔트리 제목에서 판을 찾지 못하면 멈춘다", async () => {
    await assert.rejects(
      run(
        channel,
        [entry("weit-v-modell-xt-releases-2026", "V-Modell XT Releases")],
        pages,
        context(),
      ),
      /판 패턴이 인용한 엔트리 제목에서 판을 찾지 못했다/,
    )
  })
})
