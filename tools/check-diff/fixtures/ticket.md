## Pages

| 슬러그       | 타입 | 태그          |
| ------------ | ---- | ------------- |
| `owner-page` | 개념 | `network/can` |

## 범위

- `owner-page`: 오류 계수기.

주인 페이지:

| 개념                                      | 주인                       | 링크만 하는 곳                                                                                            |
| ----------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| 오류 계수기                               | `owner-page`               | `linker-a`, `linker-b`, `linker-c`, `missing-page`. 다른 구역의 `other-page`는 고치지 않는다(린트가 링크) |
| 계획 없는 것                              | 다른 주제(아직 계획 없음)  | `linker-a`. 이름만 두고 링크하지 않는다.                                                                  |
| 아직 없는 것                              | `planned-page`             | `linker-b`                                                                                                |
| 두 주인                                   | `owner-page`, `other-page` | `linker-a`                                                                                                |
| FTTI와 시간 구간, distributed development | `section-owner`            | `linker-a`                                                                                                |

## 표기 결정

소유자 결정(2026-01-01, 보강 승인 대화):

- 직렬 버스: 시리얼 버스 (#9001). 적용할 페이지: `terms`(묶음)
- 샘플 풀이 Sample Frame Unit: sample frame unit (#9002). 적용할 페이지: 새 페이지 `terms`(묶음)
- Type A: Type-A (#9003). 하이퍼바이저의 갈래일 때. 적용할 페이지: `terms`(묶음)
