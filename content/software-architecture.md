---
title: 소프트웨어 아키텍처
tags:
  - process/sw-process
verified: 2026-10-02
---

Automotive SPICE 4.1에서 **소프트웨어 아키텍처**는 소프트웨어를 알맞은 계층에 걸쳐, 가장 낮은 수준의 소프트웨어 컴포넌트까지 소프트웨어 컴포넌트로 나눈다.[@vda-automotive-spice-pam-4-1-2026] ISO/IEC/IEEE 42010:2022는 아키텍처를 어떤 대상이 그 환경 안에서 갖는 기본 개념이나 속성과, 그 대상과 관련 생명주기 프로세스의 실현과 발전을 다스리는 원칙으로 정의한다.[@iso-iec-ieee-42010-obp-2022] ISO/IEC/IEEE 24765 용어집은 **아키텍처 설계**(architectural design)를 컴퓨터 시스템 개발의 틀을 세우려고 하드웨어·소프트웨어 컴포넌트와 그 인터페이스의 집합을 정하는 것으로 정의한다.[@ieee-cs-sevocab-2026]

## 아키텍처와 아키텍처 기술

ISO/IEC/IEEE 42010:2022는 아키텍처와, 아키텍처를 표현하는 작업 산출물인 **아키텍처 기술**(architecture description, AD)을 구분한다. 이 표준은 AD가 대상을 만들고 쓰고 관리하는 이들 사이의 의사소통과 협력을 높여 함께 일하게 하는 데 쓰인다고 둔다.[@iso-iec-ieee-42010-obp-2022]

## 정적 측면과 동적 측면

Automotive SPICE 4.1은 소프트웨어 아키텍처를 정적 측면과 동적 측면으로 나누어, 기능·비기능 소프트웨어 요구사항에 맞춰 명세하게 한다.[@vda-automotive-spice-pam-4-1-2026]

- 정적 측면: 외부 인터페이스와, 정해 둔 소프트웨어 컴포넌트 집합 및 그 인터페이스와 관계
- 동적 측면: 소프트웨어 컴포넌트의 동작, 소프트웨어 모드마다의 컴포넌트 상호작용, 인터럽트 처리·선점 처리·멀티스레딩 같은 동시성[@vda-automotive-spice-pam-4-1-2026]

## 구조 관계

ISO/IEC/IEEE 24765 용어집은 **모듈 분해**(modular decomposition)를 설계와 개발을 쉽게 하려고 시스템을 컴포넌트로 나누는 것으로 정의하고, 계층적 분해를 하향식 세분화를 거듭해 시스템을 컴포넌트의 계층으로 나누는 모듈 분해로 정의한다.[@ieee-cs-sevocab-2026]

Parnas는 1972년 논문에서 순서도로 모듈을 나누는 대신, 어렵거나 바뀌기 쉬운 설계 결정의 목록에서 시작해 모듈마다 그런 결정 하나를 다른 모듈에서 감추도록 시스템을 나누자고 제안했고, 이 기준을 information hiding이라 불렀다. 그는 KWIC(keyword in context) 색인 예에서, 바뀌기 쉬운 설계 결정을 모듈마다 하나씩 감춘 분해에서는 그런 결정(예: 줄을 저장하는 방식)이 바뀌어도 그 모듈만 고치면 되지만, 처리 단계대로 나눈 분해에서는 여러 모듈, 때로는 모든 모듈을 고쳐야 함을 보였다. 같은 논문에서 그는 모듈이나 프로그램 사이에 uses(depends upon) 관계를 정의할 수 있고, 그 관계가 부분 순서이면 시스템에 계층 구조가 있다고 보았다.[@parnas-criteria-decomposing-1972] Parnas는 1979년 논문에서 확장과 축소가 쉬운 소프트웨어를 설계하는 단계 가운데 uses 관계라는 소프트웨어 구조의 설계를 가장 중요한 단계로 꼽았다.[@parnas-extension-contraction-1979]

설계 방법으로는 구조적 설계(structured design)와 객체지향 설계(object-oriented design)가 있다.[@ieee-cs-sevocab-2026] 모듈을 나누는 기준인 응집도와 결합도는 [[cohesion-and-coupling|응집도와 결합도]]에서 다룬다.

## Automotive SPICE SWE.2

Automotive SPICE 4.1은 소프트웨어 아키텍처 설계를 SWE.2(Software Architectural Design) 프로세스로 두고, 그 목적을 정적·동적 측면을 갖추고 소프트웨어 요구사항과 일관되며 분석을 거친 소프트웨어 아키텍처를 세우는 것으로 둔다. SWE.2의 BP(base practice)는 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

| BP  | 하는 일                          |
| --- | -------------------------------- |
| BP1 | 정적 측면 명세                   |
| BP2 | 동적 측면 명세                   |
| BP3 | 아키텍처 분석                    |
| BP4 | 일관성 확보와 양방향 추적성 수립 |
| BP5 | 합의한 아키텍처의 전달           |

BP3은 기능, 타이밍, 자원 소비 같은 기술적 설계 측면과 프로젝트 추정의 관점에서 아키텍처를 분석하고 설계 결정의 근거를 기록하게 한다. 근거에는 proven-in-use, 소프트웨어 프레임워크나 제품군의 재사용, make-or-buy 결정 등이 들 수 있고, 분석에는 기존 컴포넌트가 이번 응용에 맞는지가 들 수 있다.[@vda-automotive-spice-pam-4-1-2026] BP4의 추적성과 일관성은 [[traceability|추적성]]에서 다룬다.

Automotive SPICE 4.1에서 소프트웨어 요소(software element)는 소프트웨어 컴포넌트나 소프트웨어 유닛을 가리킨다.[@vda-automotive-spice-pam-4-1-2026] 유닛과 그 설계는 [[software-unit-design|소프트웨어 유닛 설계]]에서 다룬다.

![[diagrams/aspice-software-decomposition.svg]]

Automotive SPICE 3.1은 SWE.2의 목적을 아키텍처 설계를 세우고, 소프트웨어 요구사항을 어느 소프트웨어 요소에 할당할지 정하고, 정한 기준으로 설계를 평가하는 것으로 두었다. BP는 아홉(설계 개발, 요구사항 할당, 요소 인터페이스 정의, 동적 동작 기술, 자원 소비 목표 정의, 대안 아키텍처 평가, 양방향 추적성 수립, 일관성 확보, 합의한 설계의 전달)이었다. Automotive SPICE 4.1은 BP를 다섯으로 줄였다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## ISO 26262-6

ISO 26262-6:2018은 7절에서 소프트웨어 아키텍처 설계를 다룬다.[@iso-26262-6-obp-2018] ISO 26262-1:2018은 freedom from interference를, 안전 요구 위반으로 이어질 수 있는 연쇄 고장(cascading failure)이 둘 이상의 요소 사이에 없는 것으로 정의한다.[@iso-26262-1-obp-2018]

## 아키텍처 평가

아키텍처 평가 방법으로는 SEI(Software Engineering Institute)의 Kazman, Klein, Clements가 만든 ATAM(Architecture Tradeoff Analysis Method)이 있다.[@kazman-atam-2000]

Automotive SPICE 3.1의 SWE.2는 아키텍처 평가 기준을 정해 대안 아키텍처를 견주고 고른 근거를 기록하게 했고, 기준의 예로 모듈성·유지보수성·확장성·신뢰성 같은 품질 특성과, 직접 만들지·사올지·다시 쓸지(make-buy-reuse)를 따진 결과를 들었다. Automotive SPICE 4.1은 대안 평가 대신 BP3의 아키텍처 분석을 둔다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]
