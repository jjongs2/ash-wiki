# ash-wiki

## 문서 작성

운영 문서는 번역투 없이 간결하게 쓰되, 실무에서 원어로 쓰는 용어는 억지로 번역하지 않는다.

`README.md`, `CONTRIBUTING.md`, `.github/`의 템플릿과 예시는 문장을 "-습니다"로, 그 밖의 운영 문서는 "-다"로 끝맺는다. 입구 문서는 바깥 기여자에게 하는 말이기 때문이다.

## 기여

커밋, PR, 리뷰, 이슈, 스킬과 에이전트는 `CONTRIBUTING.md`를 따른다.

## Worktree

worktree에서 일하면 시작할 때 한 번, 만든 다음 바로 `EnterWorktree`로 들어간다. 들어가기 전의 명령은 `cd` 없이 `git -C <worktree>`로 쓰고, 진입이 거부되면 시작 폴더로 돌아가 다시 들어간다. `cd`로 옮긴 세션은 진입이 거부되어 격리 없이 돌기 때문이다. 들어간 뒤 `npm ci`는 `CONTRIBUTING.md` 원칙 절의 PR 전 확인을 따른다.

## Agent skills

### 이슈 트래커

이슈는 GitHub Issues(jjongs2/ash-wiki)에서 관리하며, `gh` CLI로 다룬다. 자세한 내용은 `docs/agents/issue-tracker.md`를 참고한다.

### Triage 라벨

기본 triage 라벨 5개(`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)를 그대로 사용한다. 자세한 내용은 `docs/agents/triage-labels.md`를 참고한다.

### 도메인 문서

Single-context 구조로, 저장소 루트의 `GLOSSARY.md` 하나와 `docs/adr/`, 결정 로그 `docs/decision-log.md`를 사용한다. 자세한 내용은 `docs/agents/domain.md`를 참고한다.

## Pipeline conventions

`ticket-runner` runs unattended sessions in this repository. What it requires of a commit, a branch, a Stage and a Ticket: `docs/agents/pipeline-conventions.md`. Read it before committing, opening a pull request or creating an issue.
