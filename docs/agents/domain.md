# 도메인 문서

Engineering skill들이 코드베이스를 살펴볼 때 이 저장소의 도메인 문서를 어떻게 활용하는지 정리한 문서입니다.

## 작업 전에 읽을 문서

- 저장소 루트의 **`CONTEXT.md`**
- 루트에 **`CONTEXT-MAP.md`**가 있다면 그 파일. context마다 하나씩 있는 `CONTEXT.md`를 가리키므로, 작업 주제와 관련된 것을 읽습니다.
- **`docs/adr/`**: 작업할 영역과 관련된 ADR을 읽습니다. multi-context 저장소라면 context별 결정이 담긴 `src/<context>/docs/adr/`도 확인합니다.

이 파일들이 없으면 **별도로 알리지 않고 그대로 진행합니다**. 파일이 없다고 지적하거나 미리 만들자고 제안하지 않습니다. 용어나 결정이 실제로 정리되는 시점에 `/domain-modeling` skill(`/grill-with-docs`, `/improve-codebase-architecture`를 통해 호출됨)이 필요한 만큼 만들어 줍니다.

## 파일 구조

Single-context 저장소(대부분의 저장소):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context 저장소(루트에 `CONTEXT-MAP.md`가 있는 경우):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← 시스템 전체에 걸친 결정
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← 해당 context에 한정된 결정
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Glossary의 용어 사용하기

결과물에서 도메인 개념을 언급할 때(이슈 제목, 리팩터링 제안, 가설, 테스트 이름 등)는 `CONTEXT.md`에 정의된 용어를 씁니다. Glossary에서 쓰지 않기로 한 유의어로 바꿔 쓰지 않도록 합니다.

필요한 개념이 glossary에 아직 없다면 두 가지 중 하나입니다. 프로젝트에서 쓰지 않는 용어를 새로 만들고 있는 것일 수 있으니 다시 생각해 보거나, 실제로 빠진 용어라면 `/domain-modeling`에서 다룰 수 있도록 기록해 둡니다.

## ADR과 충돌할 때 알리기

결과물이 기존 ADR과 어긋난다면 조용히 덮어쓰지 말고 분명하게 알립니다.

> _ADR-0007(event-sourced orders)과 충돌합니다. 다만 다음 이유로 다시 검토해 볼 만합니다…_
