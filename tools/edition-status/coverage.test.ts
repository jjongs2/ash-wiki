import test, { describe } from "node:test"
import assert from "node:assert"
import { Conventions } from "../check-content/conventions"
import { coverage, notTargetRows } from "./coverage"
import { entry } from "./testing"

// 덮음 검사를 seam으로 본다. 인용 엔트리, 통로가 맡은 키, 대상 아님 표를 넣고 미분류와 처음 보는 발행기관만 본다.
const rows = notTargetRows([
  { 발행기관: "^\\{IEC\\}$", 엔트리: "^iec-60050-", 사유: "온라인 용어집" },
  { 발행기관: "^Texas Instruments$", 엔트리: ".", 사유: "제품 문서" },
])

describe("덮음 검사", () => {
  test("통로가 맡았거나, 대상 아님 표에 들거나, 논문·단행본 꼴이면 분류된 것이다", () => {
    const { unclassified, unknown } = coverage(
      [
        entry("iec-61508-1-2010", "IEC 61508-1:2010", { publisher: "{IEC}" }),
        entry("iec-60050-351-2026", "IEC 60050 — control", { publisher: "{IEC}" }),
        entry("ti-sprabj1-2013", "CAN FD", { publisher: "Texas Instruments" }),
        entry("tindell-1995", "Analysing CAN", { publisher: "Tindell, Ken", type: "article" }),
      ],
      new Set(["iec-61508-1-2010"]),
      rows,
    )
    assert.deepStrictEqual(unclassified, [])
    assert.deepStrictEqual([...unknown.keys()], [])
  })

  test("아는 발행기관의 엔트리가 어디에도 들지 않으면 미분류다", () => {
    const { unclassified } = coverage(
      [
        entry("iec-61508-1-2010", "IEC 61508-1:2010", { publisher: "{IEC}" }),
        entry("iec-61511-1-2016", "IEC 61511-1:2016", { publisher: "{IEC}" }),
      ],
      new Set(["iec-61508-1-2010"]),
      rows,
    )
    assert.deepStrictEqual(
      unclassified.map((e) => e.key),
      ["iec-61511-1-2016"],
    )
  })

  test("처음 보는 발행기관은 미분류가 아니라 목록으로 보인다", () => {
    const { unclassified, unknown } = coverage(
      [
        entry("omg-uml-2-5-1-2017", "UML 2.5.1", { publisher: "Object Management Group" }),
        entry("anon-2020", "Untitled"),
      ],
      new Set(),
      rows,
    )
    assert.deepStrictEqual(unclassified, [])
    assert.deepStrictEqual(
      [...unknown].map(([name, entries]) => [name, entries.map((e) => e.key)]),
      [
        ["Object Management Group", ["omg-uml-2-5-1-2017"]],
        ["", ["anon-2020"]],
      ],
    )
  })

  test("문서 표의 칸 안 \\|는 칸 경계가 아니라 |다", () => {
    const table = new Conventions(
      "<!-- table: t -->\n\n| 발행기관 | 엔트리 |\n| --- | --- |\n| `(A\\|B)` | `.` |\n",
    ).table("t", ["발행기관", "엔트리"])
    assert.deepStrictEqual(table, [{ 발행기관: "(A|B)", 엔트리: "." }])
  })
})
