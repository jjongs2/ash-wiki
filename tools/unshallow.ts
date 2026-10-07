import { execFileSync } from "node:child_process"
import { repoRoot } from "./repo"

// 저장소가 shallow일 때만 전체 커밋 기록을 받고, 받지 못하면 빌드를 멈춘다.
// 까닭은 docs/deploy.md의 커밋 기록 절에 있다.
const git = (args: string[]) =>
  execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", stdio: "pipe" }).trim()

if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
  console.log("shallow 저장소라 전체 커밋 기록을 받는다")
  execFileSync("git", ["fetch", "--unshallow", "--quiet"], { cwd: repoRoot, stdio: "inherit" })
}
