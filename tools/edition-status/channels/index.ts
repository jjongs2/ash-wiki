import type { Row } from "../../check-content/conventions"
import type { Channel } from "../model"
import { autosar } from "./autosar"
import { generic, genericRows } from "./generic"
import { ieee } from "./ieee"
import { ietf } from "./ietf"
import { iso } from "./iso"
import { istqb } from "./istqb"
import { nist } from "./nist"
import { unece } from "./unece"

// 전용 통로. docs/wiki-verification.md의 edition-channels 표의 통로와 같아야 한다.
export const dedicated: Channel[] = [iso, ieee, ietf, nist, autosar, istqb, unece]

// 감지하지 않는 출판물. 표준 페이지를 맡기만 하고 묻지 않는다.
function skipped(rows: Row[]): Channel {
  return {
    id: "skipped",
    ownsPage: (page) => rows.some((row) => row["페이지"] === page.name),
    publicationOf: () => undefined,
    check: async () => [],
  }
}

// 문서의 세 표와 통로가 어긋나면 멈춘다.
export function channels(tables: { channels: Row[]; generic: Row[]; skipped: Row[] }): Channel[] {
  const listed = tables.channels.map((row) => row["통로"]).sort()
  const implemented = dedicated.map((channel) => channel.id).sort()
  if (listed.join() !== implemented.join())
    throw new Error(
      `docs/wiki-verification.md: edition-channels 표의 통로(${listed.join(", ")})가 ` +
        `도구의 통로(${implemented.join(", ")})와 다르다`,
    )
  return [...dedicated, generic(genericRows(tables.generic)), skipped(tables.skipped)]
}
