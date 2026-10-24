# 이슈 트래커: GitHub

이 저장소의 이슈와 명세는 GitHub Issues에서 관리한다. 모든 작업에는 `gh` CLI를 사용한다.

## 기본 사용법

- **이슈 생성**: `gh issue create --title "..." --body-file <파일>`. 본문은 파일로 먼저 쓰고 그 경로를 넘긴다. 한 줄 본문이면 `--body "..."`도 된다.
- **템플릿으로 이슈 생성**: 템플릿 파일에서 프론트매터를 뺀 본문을 파일로 쓰고 `--body-file <파일>`로 넘기며, 제목과 라벨은 프론트매터 값을 직접 적는다. `--template`은 `--body`와 함께 쓸 수 없고, 없이 쓰면 대화형으로 넘어가 비대화형에서는 실패한다. 예: 규약 검토 모음 이슈는 `.github/ISSUE_TEMPLATE/convention-review.md`의 둘째 `---` 아래를 파일로 쓰고 `gh issue create --title "docs: 규약 검토 모음" --label needs-triage --body-file <파일>`
- **이슈 읽기**: `gh issue view <number> --json title,body,labels,comments --jq '{title, body, labels: [.labels[].name], comments: [.comments[].body]}'`. 비대화형에서 `gh issue view <number> --comments`는 본문 없이 댓글만 보이고, `--comments`는 `--json`과 함께 쓸 수 없다.
- **이슈 목록**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`. 상황에 맞게 `--label`, `--state` 필터를 붙인다.
- **하위 이슈로 잇기**: `gh issue create --parent <부모> ...` / 만든 뒤 `gh issue edit <부모> --add-sub-issue <자식>`. gh 2.94 이상이 필요하다.
- **댓글 달기**: `gh issue comment <number> --body-file <파일>`
- **라벨 추가 / 제거**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **이슈 닫기**: `gh issue close <number> --comment "..."`

저장소는 `git remote -v`에서 알 수 있으며, clone한 디렉터리 안에서 실행하면 `gh`가 자동으로 인식한다.

## Blocking

GitHub의 기본 issue dependencies 기능을 사용한다. UI에서도 보인다.

- **연결 추가**: `gh api --method POST repos/<owner>/<repo>/issues/<n>/dependencies/blocked_by -F issue_id=<blocker-db-id>`. `<blocker-db-id>`는 `#number`나 `node_id`가 아니라 blocker 이슈의 숫자 database id이다(`gh api repos/<owner>/<repo>/issues/<blocker> --jq .id`로 확인).
- **진행 가능 여부**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by`. 열려 있는 blocker만 세므로, 0이면 진행할 수 있다.
- **열린 blocker 찾기**: `gh api repos/<owner>/<repo>/issues/<n>/dependencies/blocked_by --jq '[.[] | select(.state == "open") | .number]'`

## Pull request를 triage 대상으로 다룰지 여부

**PRs as a request surface: no.** _(외부 PR을 기능 요청으로 다루려면 `yes`로 바꾼다. `/triage`가 이 값을 읽는다.)_

GitHub에서는 이슈와 PR이 번호를 함께 쓰므로 `#42`만으로는 어느 쪽인지 알 수 없다. 먼저 `gh pr view 42`로 확인하고, 없으면 `gh issue view 42`로 찾는다.

## 스킬이 "publish to the issue tracker"라고 할 때

GitHub 이슈를 생성한다.

## 스킬이 "fetch the relevant ticket"이라고 할 때

[이슈 읽기](#기본-사용법)의 명령을 실행한다.
