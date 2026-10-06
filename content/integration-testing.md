---
title: 통합 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

ISTQB 용어집은 **통합 테스트**(integration testing)를 컴포넌트나 시스템 사이의 상호작용에 초점을 둔 [[software-testing#테스트 레벨|테스트 레벨]]로 정의한다.[@istqb-glossary-integration-testing-2026] ISTQB CTFL 강의계획서는 통합 테스트를 컴포넌트 통합 테스트와 시스템 통합 테스트의 두 테스트 레벨로 나눈다.[@istqb-ctfl-syllabus-2024]

## 컴포넌트 통합과 시스템 통합

**컴포넌트 통합 테스트**(component integration testing)는 컴포넌트 사이의 인터페이스와 상호작용을 시험하는 데 초점을 두며, 통합 전략에 크게 좌우된다. **시스템 통합 테스트**(system integration testing)는 시험 대상 시스템과 다른 시스템, 외부 서비스 사이의 인터페이스를 시험하는 데 초점을 둔다.[@istqb-ctfl-syllabus-2024] 테스트 기준은 [[v-model#테스트 기준|V 모델]]에서 다룬다.

## 통합 전략

대표적인 통합 전략으로 하향식, 상향식, 빅뱅이 있다.[@istqb-ctfl-syllabus-2024][@ieee-swebok-v4-0a-2026] SWEBOK V4.0a는 여기에 혼합(샌드위치) 통합을 더해 대표적인 통합 테스트 전략으로 든다.[@ieee-swebok-v4-0a-2026]

ISO/IEC/IEEE 24765 용어집은 각 전략의 이름을 다음과 같이 정의한다.[@ieee-cs-sevocab-2026]

- **빅뱅 테스트**(big-bang testing): 소프트웨어나 하드웨어 요소를 단계를 나누지 않고 한꺼번에 묶어 전체 시스템으로 만드는 통합 테스트
- **하향식**(top-down): 계층의 가장 높은 컴포넌트에서 시작해 차례로 낮은 수준으로 나아가는 활동. 예로 top-down testing을 든다.
- **상향식**(bottom-up): 계층의 가장 낮은 컴포넌트에서 시작해 차례로 높은 수준으로 나아가는 활동. 예로 bottom-up testing을 든다.[@ieee-cs-sevocab-2026]

![[diagrams/integration-test-strategies.svg]]

SWEBOK V4.0a에 따르면 빅뱅 통합은 릴리스할 모든 부분이 완성될 때까지 통합을 미루며, 점진적 통합은 이보다 오류의 위치를 찾기 쉬운 것으로 여겨진다.[@ieee-swebok-v4-0a-2026] 점진적 통합에 쓰는 스텁과 드라이버는 [[test-harness|테스트 하네스]]에서 다룬다.

## 인터페이스 테스트

ISO/IEC/IEEE 24765 용어집은 **인터페이스 테스트**(interface testing)를 시스템이나 컴포넌트가 서로 데이터와 제어를 올바르게 넘기는지 평가하는 테스트로 정의한다.[@ieee-cs-sevocab-2026] ISTQB 용어집은 인터페이스 테스트를 같은 것을 확인하는 통합 테스트의 한 종류로 정의한다.[@istqb-glossary-interface-testing-2026]

## ASPICE SWE.5와 SYS.4

[[automotive-spice|ASPICE]] 4.1의 SWE.5 Software Component Verification and Integration Verification은 두 가지를 목적으로 한다. 하나는 소프트웨어 컴포넌트가 [[software-architecture|소프트웨어 아키텍처]] 설계와 일관됨을 검증하는 것이고, 다른 하나는 소프트웨어 요소를 통합하고 통합한 결과가 소프트웨어 아키텍처와 상세 설계와 일관됨을 검증하는 것이다.[@vda-automotive-spice-pam-4-1-2026] ASPICE 3.1은 이 프로세스를 Software Integration and Integration Test라 불렀다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

ASPICE 4.1의 SWE.5에서 **component verification**은 소프트웨어 컴포넌트가 아키텍처에 정한 동작과 인터페이스를 따르는지 검증하는 것이다. SWE.5는 이것과 함께, 소프트웨어 요소를 완전히 통합된 소프트웨어까지 통합하며 하는 통합 검증을 다룬다. 통합 방식의 예로는 모든 컴포넌트를 한꺼번에 묶는 빅뱅 통합, [[continuous-integration|지속적 통합]], 유닛이나 컴포넌트를 거쳐 소프트웨어 전체까지 단계적으로 묶는 통합을 든다. 유닛의 검증은 SWE.4가 맡는다.[@vda-automotive-spice-pam-4-1-2026] SWE.4는 [[unit-testing#ASPICE SWE.4|단위 테스트]]에서 다룬다.

SYS.4 System Integration and Integration Verification은 시스템 요소를 통합하고, 통합한 시스템 요소가 시스템 아키텍처와 일관됨을 검증하는 것을 목적으로 한다.[@vda-automotive-spice-pam-4-1-2026] ASPICE 3.1은 이 프로세스를 System Integration and Integration Test라 불렀다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## ISO 26262-6

[[iso-26262|ISO 26262]]-6:2018은 10절에서 소프트웨어 통합과 검증을 다룬다.[@iso-26262-6-obp-2018]
