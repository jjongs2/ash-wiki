# 이슈 트래커: GitHub

이 저장소의 이슈와 명세는 GitHub Issues에서 관리한다. 모든 작업에는 `gh` CLI를 사용한다.

## 기본 사용법

- **이슈 생성**: `gh issue create --title "..." --body-file <파일>`. 본문은 파일로 먼저 쓰고 그 경로를 넘긴다. 한 줄 본문이면 `--body "..."`도 된다.
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

## 보드

triage를 거쳐 티켓이 되기 전의 항목 세 종류는 이슈 대신 [ash-wiki 보드](https://github.com/users/jjongs2/projects/4)(번호 4)의 draft로 둔다. 보드는 공개이고 이 저장소에 연결되어 있다. 항목 하나가 draft 하나다.

| 종류        | 무엇                                                                        | 제목 접두사 |
| ----------- | --------------------------------------------------------------------------- | ----------- |
| 규약 검토   | PR 안에서 고치기보다 규약부터 다시 정해야 하는 항목                         | `docs:`     |
| 용어 표기   | 용어 선택이 갈려 소유자의 결정이 필요한 항목                                | `term:`     |
| 보강의 후속 | 보강이 티켓에 싣지 못한 후속과, 재조사의 `범위 밖`(게시된 페이지의 고칠 곳) | `content:`  |

### 필드

| 필드      | 값                                                                              | 고르는 법                                                                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Status`  | `Inbox`, `Ticketed`, `Dropped`                                                  | 만들 때 `Inbox`. draft에는 라벨이 없어 `needs-triage` 대신 이 값을 쓴다. 나머지는 [triage](#triage)가 쓴다                                                                                                                                                                                                        |
| `Origin`  | `wiki-ingest`, `wiki-verify`, `wiki-lint`, `wiki-reader-testing`, `wiki-enrich` | 항목이 나온 흐름. 검토 절에서 나온 항목은 그 검토를 돌린 흐름이다. 소유자가 직접 올린 항목은 비운다                                                                                                                                                                                                               |
| `Affects` | 텍스트                                                                          | 고침이 놓일 문서나 주제 하나. 규약 검토는 규칙 파일(예: `docs/wiki-conventions.md`), 보강의 후속은 주제 태그(예: `hardware/ee-architecture`)이고, 재조사의 `범위 밖`은 그 `verify:` 이슈의 주제 태그다. 용어 표기는 고침이 늘 [용어 표기 결정](../wiki-terms.md) 목록이라 비운다. 슬러그 목록은 Evidence에만 둔다 |
| `Ticket`  | 텍스트                                                                          | 이 draft를 흡수한 이슈의 URL. 텍스트 필드는 `#N`을 링크로 바꾸지 않는다                                                                                                                                                                                                                                           |

[`Inbox` 뷰](https://github.com/users/jjongs2/projects/4/views/3)는 `Status=Inbox`인 draft를 `Origin`으로 묶은 표다. 보관(archive)은 하지 않는다. 처리한 draft는 이 뷰에서 저절로 빠지고, 기록은 `status:Ticketed` 같은 필터로 본다.

### draft 꼴

- 제목은 `<접두사>: <지금 일어나는 일>` 명사구다. 접두사는 위 종류 표에 있다. 예: `term: secure·protect의 "지키다"·"보호하다" 혼용`
- 본문은 ticket-runner의 [Note 꼴](https://github.com/jjongs2/ticket-runner/blob/main/docs/templates/note-comment.md)에서 `**Evidence**:`, `**Impact**:`, `**Next**:` 세 칸을 쓴다. Next는 뺄 수 있다. 굵은 요약 줄은 제목으로 올리고, 표식 줄과 `From` 줄은 `Origin`이 대신한다.
  - Evidence: 어디서 무엇을 봤는지. 걸린 페이지의 슬러그는 `` `<슬러그>` ``로 적는다. [찾기](#찾기)가 이 꼴로 찾는다
  - Impact: 독자나 다음 흐름이 겪는 일
  - Next: 고칠 길이나 소유자가 내릴 결정과 권고
- 문장은 "-다"로 끝맺는다.
- 보드가 공개라, draft도 공개 저장소의 이슈와 같은 기준으로 쓴다. [격리 경계](../adr/0001-isolation-boundary.md)도 같다.

### 만들기

본문을 파일로 쓰고 draft를 만든 뒤, 같은 차례에 `Status`와 필드를 쓴다.

```sh
gh api graphql -f query='mutation($t: String!, $b: String!) { addProjectV2DraftIssue(input: {projectId: "PVT_kwHOBbs_rM4BslPJ", title: $t, body: $b}) { projectItem { id } } }' -f t='<제목>' -F b=@<본문 파일> --jq .data.addProjectV2DraftIssue.projectItem.id
gh project item-edit --project-id PVT_kwHOBbs_rM4BslPJ --id <항목 ID> --field-id PVTSSF_lAHOBbs_rM4BslPJzhqyvGc --single-select-option-id 248aadec
gh project item-edit --project-id PVT_kwHOBbs_rM4BslPJ --id <항목 ID> --field-id PVTSSF_lAHOBbs_rM4BslPJzhqyvQE --single-select-option-id <Origin 값 ID>
gh project item-edit --project-id PVT_kwHOBbs_rM4BslPJ --id <항목 ID> --field-id PVTF_lAHOBbs_rM4BslPJzhqyvRU --text '<Affects>'
```

첫 줄이 돌려준 ID가 `<항목 ID>`다. 둘째 줄은 `Status=Inbox`다. `Origin`이나 `Affects`가 비면 그 줄을 뺀다. `gh project item-create`는 본문을 파일로 받지 못해 쓰지 않는다.

보드의 ID는 `PVT_kwHOBbs_rM4BslPJ`이고, 필드와 값의 ID는 아래와 같다.

| 필드      | 필드 ID                          | 값과 값 ID                                                                                                                             |
| --------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Status`  | `PVTSSF_lAHOBbs_rM4BslPJzhqyvGc` | `Inbox` `248aadec`, `Ticketed` `4ec56be8`, `Dropped` `1d040bb3`                                                                        |
| `Origin`  | `PVTSSF_lAHOBbs_rM4BslPJzhqyvQE` | `wiki-ingest` `69c61930`, `wiki-verify` `4b15ee5c`, `wiki-lint` `955222c6`, `wiki-reader-testing` `7938b128`, `wiki-enrich` `8d6101cd` |
| `Affects` | `PVTF_lAHOBbs_rM4BslPJzhqyvRU`   | 텍스트                                                                                                                                 |
| `Ticket`  | `PVTF_lAHOBbs_rM4BslPJzhqyvTo`   | 텍스트                                                                                                                                 |

### 찾기

슬러그 하나를 다루는 `Inbox` draft를 찾는다.

```sh
gh project item-list 4 --owner jjongs2 --limit 500 --format json --query 'status:Inbox' --jq '.items[] | select(.content.body | contains("`<슬러그>`")) | {id, title, origin, affects}'
```

### triage

- 티켓은 새 이슈로 낸다. draft를 이슈로 바꾸지(convert) 않는다. 바꾸면 본문을 agent brief로 다시 써야 하고, draft 여러 개를 티켓 하나로 합치지 못한다.
- 흡수한 draft마다 `Ticket`에 이슈 URL을, `Status`에 `Ticketed`를 한 번에 쓴다.

  ```sh
  gh project item-edit --project-id PVT_kwHOBbs_rM4BslPJ --id <항목 ID> --field-id PVTF_lAHOBbs_rM4BslPJzhqyvTo --text 'https://github.com/jjongs2/ash-wiki/issues/<n>'
  gh project item-edit --project-id PVT_kwHOBbs_rM4BslPJ --id <항목 ID> --field-id PVTSSF_lAHOBbs_rM4BslPJzhqyvGc --single-select-option-id 4ec56be8
  ```

- 버리는 draft는 `Status`를 `Dropped`로 둔다.
- 용어 표기의 소유자 결정은 triage가 낸 티켓에 "소유자 결정:"으로 시작하는 코멘트로 적는다. draft에는 코멘트도 번호도 없기 때문이다. [용어 표기 결정](../wiki-terms.md) 목록의 줄은 그 티켓이나 적용 PR의 번호를 단다.

## Pull request를 triage 대상으로 다룰지 여부

**PRs as a request surface: no.** _(외부 PR을 기능 요청으로 다루려면 `yes`로 바꾼다. `/triage`가 이 값을 읽는다.)_

GitHub에서는 이슈와 PR이 번호를 함께 쓰므로 `#42`만으로는 어느 쪽인지 알 수 없다. 먼저 `gh pr view 42`로 확인하고, 없으면 `gh issue view 42`로 찾는다.

## 스킬이 "publish to the issue tracker"라고 할 때

GitHub 이슈를 생성한다.

## 스킬이 "fetch the relevant ticket"이라고 할 때

[이슈 읽기](#기본-사용법)의 명령을 실행한다.
