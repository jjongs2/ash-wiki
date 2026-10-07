import { execFileSync } from "node:child_process"
import { repoRoot } from "./repo"

// 배포 빌드(Cloudflare Pages)는 저장소를 shallow clone으로 받는다. 기록이 경계 커밋 하나뿐이면
// created-modified-date 플러그인이 모든 페이지의 수정일을 그 커밋 날짜로 찍고, 대문의 최근 변경도 묶음
// 하나만 남는다. 그래서 shallow일 때만 전체 기록을 받는다. 전체 기록이 있는 로컬 클론에서는 아무것도
// 하지 않는다. 받지 못하면 빌드를 멈춘다. 그대로 빌드하면 수정일이 모두 같아져도 아무도 알아채지 못한다.
const git = (args: string[]) =>
  execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", stdio: "pipe" }).trim()

if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
  console.log("shallow 저장소라 전체 커밋 기록을 받는다")
  execFileSync("git", ["fetch", "--unshallow", "--quiet"], { cwd: repoRoot, stdio: "inherit" })
}
