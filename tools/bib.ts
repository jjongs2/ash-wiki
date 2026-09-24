import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { repoRoot } from "./repo"

// 참고문헌은 엔트리 하나를 파일 하나(bib/<키>.bib)로 두고, 빌드 전에 합본 하나로 합친다(ADR 0003).
// 합본 경로는 quartz.config.yaml의 citations bibliographyFile과 같아야 한다. 합본은 추적하지 않는다.
export const mergedBibPath = path.join(repoRoot, "bibliography.bib")

export function mergeBib(treeRoot: string, outFile: string = mergedBibPath) {
  const dir = path.join(treeRoot, "bib")
  const files = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => name.endsWith(".bib"))
        .sort()
    : []
  const merged = files.map((name) => fs.readFileSync(path.join(dir, name), "utf8").trimEnd() + "\n")
  fs.writeFileSync(outFile, merged.join("\n"))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mergeBib(repoRoot)
}
