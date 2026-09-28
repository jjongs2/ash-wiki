# 기여

사람과 에이전트가 커밋, PR, 리뷰, 이슈를 쓰는 방식입니다.

## 원칙

- 모든 변경은 PR로 들어옵니다. main에 직접 push하지 않습니다.
- 머지는 squash만 씁니다. main에는 PR 하나가 커밋 하나로 남습니다.
- 강제 수단은 CI(콘텐츠 검사기)와 룰셋뿐입니다. 로컬 훅과 PR 제목·본문 검사는 두지 않습니다. CI는 [무결성 워크플로](.github/workflows/integrity.yml), 룰셋은 [`main.json`](.github/rulesets/main.json)입니다.
- PR을 올리기 전에 `npm run check:content`로 표기 위반을 고칩니다. 규칙은 [위키 규약](docs/wiki-conventions.md)에 있습니다.
- 이슈, PR 본문, 리뷰 코멘트는 간결하게 씁니다.
- 커밋, PR, 리뷰, 이슈에도 격리 경계가 적용됩니다. 소스 노트의 표현과 식별 정보를 쓰지 않습니다([ADR 0001](docs/adr/0001-isolation-boundary.md)).

## 브랜치

`<type>/<이슈 번호>-<영문 kebab-case 요약>` 꼴로 씁니다. 예: `docs/2-repo-foundation`

이슈가 필요 없는 작업은 이슈를 만들지 않고, 브랜치에서 번호를 뺍니다. 예: `content/lint-can`

## PR 제목

`<type>: <한국어 명사구>` 꼴로 씁니다. scope는 붙이지 않고, 72자 이내로 씁니다. 브랜치의 커밋 메시지도 같은 꼴을 따릅니다.

| type       | 쓰는 곳                               |
| ---------- | ------------------------------------- |
| `feat`     | 사이트, 콘텐츠 검사기, 스킬의 새 기능 |
| `fix`      | 버그 수정                             |
| `docs`     | 운영 문서, 용어집, ADR                |
| `content`  | 위키 페이지와 참고문헌                |
| `chore`    | 설정, 의존성, 그 밖의 유지 작업       |
| `refactor` | 동작을 바꾸지 않는 코드 정리          |
| `test`     | 테스트와 픽스처                       |
| `ci`       | CI 워크플로                           |

예: `feat: 번호 인용 렌더와 표기 위반 CI 검사`

## PR 본문

[PR 템플릿](.github/PULL_REQUEST_TEMPLATE.md)의 세 부분을 채웁니다.

- `## Changes`: 무엇이 바뀌었는지
- `## Verification`: 어떻게 확인했는지(실행한 명령과 결과)
- `Closes #N`: 이 PR이 닫는 이슈. 없으면 뺍니다

## 리뷰

1. PR을 올린 뒤 `/code-review`(mattpocock-skills)로 두 축을 리뷰합니다.
   - Standards: 저장소 문서의 규칙을 지키는가
   - Spec: 이슈가 요구한 것과 맞는가
2. 결과를 코멘트 하나로 PR에 남깁니다. 꼴은 [리뷰 요약 예시](.github/REVIEW_SUMMARY_EXAMPLE.md)를 따릅니다.
3. 머지는 사람이 합니다.

리뷰 에이전트에게는 소스 노트 접근을 주지 않습니다([ADR 0001](docs/adr/0001-isolation-boundary.md)).

## 이슈

제목은 `<접두사>: <한국어 명사구>` 꼴로 씁니다.

| 접두사   | 쓰는 곳                                                       |
| -------- | ------------------------------------------------------------- |
| `spec`   | 여러 티켓으로 나뉘는 상위 명세                                |
| `ingest` | 페이지 묶음 하나의 인제스트. `ingest: <묶음 이름>`            |
| `verify` | 주제 계획이나 보강 한 번의 미검증 주장 모음. `verify: <주제>` |
| `term`   | 용어 선택이 갈려 소유자의 결정이 필요한 항목                  |
| `lint`   | 린트가 넘긴, 의미를 바꾸는 항목. `lint: <주제> <YYYY-MM-DD>`  |

그 밖의 이슈는 PR 타입을 접두사로 씁니다(`feat`, `docs`, `chore` 등).

`gh` 사용법은 [이슈 트래커](docs/agents/issue-tracker.md), 라벨은 [triage 라벨](docs/agents/triage-labels.md)을 참고하세요.
