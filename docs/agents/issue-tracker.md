# 이슈 트래커: GitHub

이 저장소의 이슈와 명세(spec)는 GitHub Issues에서 관리합니다. 모든 작업에는 `gh` CLI를 사용합니다.

## 기본 사용법

- **이슈 생성**: `gh issue create --title "..." --body "..."`. 본문이 여러 줄이면 heredoc을 사용합니다.
- **템플릿으로 이슈 생성**: 템플릿 파일에서 프론트매터를 뺀 본문을 `--body-file -`로 넘기고, 제목과 라벨은 프론트매터 값을 직접 적습니다. `--template`은 `--body` 없이 쓰면 대화형으로 넘어가 비대화형에서는 실패합니다. 예: 규약 검토 모음 이슈는 `awk 'n > 1; /^---$/ { n++ }' .github/ISSUE_TEMPLATE/convention-review.md | gh issue create --title "docs: 규약 검토 모음" --label needs-triage --body-file -`
- **이슈 읽기**: `gh issue view <number> --comments`. 필요하면 `jq`로 댓글을 걸러 내고, 라벨도 함께 가져옵니다.
- **이슈 목록**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`. 상황에 맞게 `--label`, `--state` 필터를 붙입니다.
- **댓글 달기**: `gh issue comment <number> --body "..."`
- **라벨 추가 / 제거**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **이슈 닫기**: `gh issue close <number> --comment "..."`

저장소는 `git remote -v`에서 알 수 있으며, clone한 디렉터리 안에서 실행하면 `gh`가 자동으로 인식합니다.

## Pull request를 triage 대상으로 다룰지 여부

**PRs as a request surface: no.** _(외부 PR을 기능 요청으로 다루려면 `yes`로 바꿉니다. `/triage`가 이 값을 읽습니다.)_

`yes`로 설정하면 PR도 이슈와 같은 라벨과 상태로 관리하며, `gh pr` 명령을 사용합니다.

- **PR 읽기**: `gh pr view <number> --comments`, diff는 `gh pr diff <number>`로 확인합니다.
- **triage할 외부 PR 목록**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`로 가져온 뒤, `authorAssociation`이 `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, `NONE`인 것만 남깁니다(`OWNER`/`MEMBER`/`COLLABORATOR`는 제외).
- **댓글 / 라벨 / 닫기**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub에서는 이슈와 PR이 번호를 함께 쓰므로 `#42`만으로는 어느 쪽인지 알 수 없습니다. 먼저 `gh pr view 42`로 확인하고, 없으면 `gh issue view 42`로 찾습니다.

## Skill이 "publish to the issue tracker"라고 할 때

GitHub 이슈를 생성합니다.

## Skill이 "fetch the relevant ticket"이라고 할 때

`gh issue view <number> --comments`를 실행합니다.

## Wayfinding 작업

`/wayfinder`에서 사용합니다. **map**은 하나의 이슈이고, 그 아래 **child** 이슈들이 개별 티켓이 됩니다.

- **Map**: `wayfinder:map` 라벨이 붙은 이슈 하나로, 본문에 Notes / Decisions-so-far / Fog를 담습니다. `gh issue create --label wayfinder:map`으로 만듭니다.
- **Child 티켓**: map에 GitHub sub-issue로 연결된 이슈입니다(sub-issues 엔드포인트에 `gh api` 호출). sub-issue 기능을 쓸 수 없으면 map 본문의 task list에 추가하고, child 본문 맨 위에 `Part of #<map>`을 적습니다. 라벨은 `wayfinder:<type>`(`research`/`prototype`/`grilling`/`task`)을 씁니다. 누군가 맡으면 작업하는 개발자에게 assign합니다.
- **Blocking**: GitHub의 **기본 issue dependencies** 기능을 사용합니다. 이 방식이 기준이며 UI에서도 보입니다. `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`로 연결을 추가합니다. 여기서 `<blocker-db-id>`는 `#number`나 `node_id`가 아니라 blocker 이슈의 숫자 **database id**입니다(`gh api repos/<owner>/<repo>/issues/<n> --jq .id`로 확인). GitHub의 `issue_dependencies_summary.blocked_by`는 열려 있는 blocker만 세므로, 이 값으로 진행 가능 여부를 판단합니다. dependencies 기능을 쓸 수 없으면 child 본문 맨 위에 `Blocked by: #<n>, #<n>` 줄을 적습니다. 모든 blocker가 닫히면 해당 티켓을 진행할 수 있습니다.
- **Frontier 조회**: map의 열린 child 이슈 목록을 가져옵니다(`gh issue list --state open`, map의 sub-issue 또는 task list 범위로 한정). 열린 blocker가 있거나(`issue_dependencies_summary.blocked_by > 0`, 또는 `Blocked by` 줄에 열린 이슈가 있는 경우) 이미 담당자가 있는 티켓은 제외하고, map 순서상 가장 앞선 티켓을 고릅니다.
- **맡기(Claim)**: `gh issue edit <n> --add-assignee @me`. 세션에서 가장 먼저 하는 쓰기 작업입니다.
- **완료(Resolve)**: `gh issue comment <n> --body "<answer>"`로 답을 남기고 `gh issue close <n>`으로 닫은 뒤, map의 Decisions-so-far에 요약과 링크를 추가합니다.
