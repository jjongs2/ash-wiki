# ash-wiki

## 문서 작성

운영 문서는 간결하게 쓰고 표현을 순화하되, 원어가 자연스러운 용어는 억지로 번역하지 않는다.

`README.md`, `CONTRIBUTING.md`, `.github/`의 템플릿과 예시는 문장을 "-습니다"로, 그 밖의 운영 문서는 "-다"로 끝맺는다. 입구 문서는 바깥 기여자에게 하는 말이기 때문이다.

## 기여

커밋, PR, 리뷰, 이슈, 스킬과 에이전트는 `CONTRIBUTING.md`를 따른다.

## Agent skills

### 이슈 트래커

이슈는 GitHub Issues(jjongs2/ash-wiki)에서 관리하며, `gh` CLI로 다룬다. 자세한 내용은 `docs/agents/issue-tracker.md`를 참고한다.

### Triage 라벨

기본 triage 라벨 5개(`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)를 그대로 사용한다. 자세한 내용은 `docs/agents/triage-labels.md`를 참고한다.

### 도메인 문서

Single-context 구조로, 저장소 루트의 `GLOSSARY.md` 하나와 `docs/adr/`를 사용한다. 자세한 내용은 `docs/agents/domain.md`를 참고한다.
