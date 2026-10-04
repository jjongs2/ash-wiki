---
title: 응집도와 결합도
tags:
  - process
verified: 2026-10-02
---

ISO/IEC/IEEE 24765 용어집은 **응집도**(cohesion)를 한 모듈 안의 요소들이 서로 얼마나 관련되어 있는지의 정도로, **결합도**(coupling)를 모듈 사이의 관계가 얼마나 강한지의 척도로 정의한다.[@ieee-cs-sevocab-2026] Stevens, Myers, Constantine은 1974년 IBM Systems Journal 논문 "Structured design"에서 결합도와 binding을 프로그램을 모듈로 나누는 기준으로 제시했다. 이 논문에서 모듈은 다른 부분이 이름으로 호출하는, 연속된 프로그램 문장의 묶음이다. 모듈 안 요소들의 관계를 늘리고 모듈 사이의 관계를 줄이면 결합이 약해지고, 결합이 약할수록 모듈 하나를 다른 모듈과 따로 이해하고 고치고 바로잡기 쉽다.[@stevens-structured-design-1974]

## 결합도

Stevens 외는 결합도를 한 모듈에서 다른 모듈로 이어지는 연결이 만드는 결속의 강도를 재는 척도로 정의했다. 연결 하나가 만드는 결합의 정도는 연결이 얼마나 복잡한지, 연결이 모듈 전체를 가리키는지 모듈 안의 요소를 가리키는지, 연결로 무엇이 오가는지에 달려 있다. 연결의 수는 결합도가 아니라 시스템 전체의 복잡도를 늘리는 요인으로 따로 다뤘다.[@stevens-structured-design-1974]

오가는 것으로 보면, 자료만 오가는 연결은 제어 정보가 오가는 연결보다 결합이 약하고, 한 모듈이 다른 모듈의 코드를 고치는 hybrid 연결은 제어 연결보다도 결합이 강하다. Stevens 외는 스위치, 플래그, 신호 같은 제어 요소를 넘겨 다른 모듈의 실행에 끼어드는 연결을 제어 결합이라 불렀다.[@stevens-structured-design-1974]

ISO/IEC/IEEE 24765 용어집은 결합도의 종류로 내용 결합, 공통 결합, 제어 결합, 자료 결합, hybrid 결합, pathological 결합을 든다. 그 가운데 넷의 정의는 다음과 같다.[@ieee-cs-sevocab-2026]

| 종류                                                    | 정의                                                           |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| 내용 결합(content coupling)                             | 한 모듈의 내용 일부나 전부가 다른 모듈의 내용에 들어가 있다.   |
| 공통 결합(common coupling, common-environment coupling) | 두 모듈이 같은 공통 데이터 영역에 접근한다.                    |
| 제어 결합(control coupling)                             | 한 모듈이 다른 모듈의 실행에 영향을 줄 목적으로 정보를 넘긴다. |
| 자료 결합(data coupling)                                | 한 모듈의 출력이 다른 모듈의 입력이 된다.                      |

## 응집도

Stevens 외는 모듈의 응집성(cohesiveness)을 재는 척도를 binding이라 불렀다. 이들은 binding을 약한 것부터 우연적, 논리적, 시간적, 교환적, 순차적, 기능적의 여섯 단계로 나누었다. 이 척도는 선형이 아니어서, 기능적 binding은 나머지보다 훨씬 강하고 앞의 두 단계는 나머지보다 훨씬 약하다.[@stevens-structured-design-1974]

![[diagrams/stevens-binding-scale.svg]]

ISO/IEC/IEEE 24765 용어집은 응집도의 종류로 우연적, 교환적, 기능적, 논리적, 절차적, 순차적, 시간적 응집을 든다.[@ieee-cs-sevocab-2026] 아래 표는 Stevens 외의 척도 순서를 따르고, 그 척도에 없는 절차적 응집은 끝에 둔다.

| 종류                                  | 정의                                                                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 우연적 응집(coincidental cohesion)    | 요소들 사이에 뜻 있는 관계가 없다.[@ieee-cs-sevocab-2026][@stevens-structured-design-1974]                              |
| 논리적 응집(logical cohesion)         | 요소들이 논리적으로 비슷한 일을 한다.[@ieee-cs-sevocab-2026]                                                            |
| 시간적 응집(temporal cohesion)        | 요소들이 초기화 같은 프로그램 실행의 특정 단계에 함께 필요하다.[@ieee-cs-sevocab-2026][@stevens-structured-design-1974] |
| 교환적 응집(communicational cohesion) | 요소들이 같은 입력 데이터를 쓰거나 같은 출력 데이터를 만든다.[@ieee-cs-sevocab-2026][@stevens-structured-design-1974]   |
| 순차적 응집(sequential cohesion)      | 한 요소의 출력이 다음 요소의 입력이 된다.[@ieee-cs-sevocab-2026][@stevens-structured-design-1974]                       |
| 기능적 응집(functional cohesion)      | 모든 요소가 하나의 기능을 수행하는 데 기여한다.[@ieee-cs-sevocab-2026][@stevens-structured-design-1974]                 |
| 절차적 응집(procedural cohesion)      | 요소들이 반복이나 판단 같은 한 프로그램 절차를 이루는 데 함께 기여한다.[@ieee-cs-sevocab-2026]                          |

Stevens 외는 논리적 binding 모듈이 흔히, 호출하는 쪽이 넘긴 매개변수로 여러 처리 가운데 무엇을 할지 고르는 꼴로 구현된다고 보았다.[@stevens-structured-design-1974]

## 관심사 분리

Dijkstra는 1974년 글 "On the role of scientific thought"(EWD447)에서 **관심사 분리**(separation of concerns)라는 말을 썼다. 그가 이 말로 가리킨 것은 주제의 한 측면만 다루고 있음을 알면서 그 측면을 다른 측면과 떼어 깊이 살피는 것이고, 다른 측면을 무시한다는 뜻은 아니다.[@dijkstra-scientific-thought-1974]

SWEBOK V4.0a에 따르면 모듈화는 관심사 분리 같은 더 일반적인 전략의 특수한 경우로 볼 수 있고, 전통적으로 서로 다른 기능과 책임을 서로 다른 컴포넌트에 두는 것을 목표로 한다.[@ieee-swebok-v4-0a-2026]
