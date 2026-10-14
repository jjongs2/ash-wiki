---
title: 모델 기반 테스트
tags:
  - process/sw-testing
aliases:
  - MBT
verified: 2026-10-13
---

**모델 기반 테스트**(model-based testing, MBT)는 모델에 바탕을 두거나 모델을 쓰는 테스트다.[@istqb-glossary-model-based-testing-2026][@ieee-swebok-v4-0a-2026] SWEBOK V4.0a에 따르면 이 모델은 동작 명세, 테스트 대상의 구조, 가용한 지식과 경험을 나타낸다.[@ieee-swebok-v4-0a-2026]

MBT는 [[equivalence-partitioning|동치 분할]], [[boundary-value-analysis|경계값 분석]], [[decision-table-testing|결정 테이블 테스트]], [[state-transition-testing|상태 전이 테스트]] 같은 고전 테스트 기법을 넓히고 지원한다. MBT 모델은 테스트 설계 명세 구실을 하며, [[test-case|테스트 케이스]]를 모델에서 바로 자동으로 만들어 낼 만큼 형식적이고 자세한 정보를 담는다. ISTQB CT-MBT v1.1 강의계획서에 따르면, 도구가 지원할 때 이 자동 생성으로 [[test-coverage|테스트 커버리지]]를 넓히고 테스트 주기를 줄일 수 있다.[@istqb-ct-mbt-syllabus-2024]

## 쓰임

MBT는 기능 요구사항과 기대 동작의 복잡함을 추상화할 수 있어서 [[system-testing|시스템]], 시스템 통합, [[acceptance-testing|인수 테스트]] 같은 높은 테스트 레벨에서 주로 쓰이고, [[unit-testing#컴포넌트 테스트|컴포넌트 테스트]]와 [[integration-testing#컴포넌트 통합과 시스템 통합|컴포넌트 통합 테스트]]에서는 덜 쓰인다. [[test-type|테스트 유형]]으로는 주로 기능 테스트에 쓰이고, 보강하거나 따로 만든 MBT 모델로 보안, 부하, 신뢰성 같은 비기능 테스트도 할 수 있다.[@istqb-ct-mbt-syllabus-2024]

## 테스트 설계 기법과의 관계

[[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-1:2022는 [[exploratory-testing|탐색적 테스트]]나 MBT 같은 테스트 실천(test practice)을 "테스트 기법"이라 부르기도 하지만, 이들은 스스로 테스트 케이스를 만드는 방법을 주지 않고 테스트 설계 기법을 써서 그 일을 하므로 29119 시리즈의 정의로는 테스트 설계 기법이 아니라는 것을 정의에 단 Note에서 제시한다.[@iso-iec-ieee-29119-1-obp-2022] 29119-4:2021은 테스트 케이스를 설계하는 기법만 다루므로, MBT 같은 테스트 실천은 정의하지 않는다.[@iso-iec-ieee-29119-4-obp-2021]

## 명세와 모델의 결함 찾기

MBT에서는 MBT 도구가 MBT 모델과 테스트 분석가가 정한 테스트 선택 기준으로 테스트 케이스와 그 밖의 테스트 설계 산출물을 만든다. ISTQB CTAL-TA v4.0 강의계획서에 따르면 MBT는 MBT 모델에 따른 기대 동작을 폭넓게 덮고 체계적으로 탐색하므로 명세의 이상을 찾는 데 효과적이고, 특히 그래픽 MBT 모델은 이해관계자와의 의사소통을 돕는다.[@istqb-ctal-ta-syllabus-2025]

![[diagrams/mbt-test-generation.svg]]

테스트 기준에 모델이 들어 있으면 테스트 분석가는 그 모델을 분석해 모델 자체의 결함도 찾을 수 있다. 상태 전이도라면 빠지거나 틀린 상태, 부적절한 전이, 틀린 가드 조건이나 동작, 중복되거나 닿을 수 없는 상태, 비결정적 동작이 그런 결함의 예다.[@istqb-ctal-ta-syllabus-2025]

테스트 설계를 자동화하는 예로, 테스트 분석가가 상태 전이 모델을 설계하고 MBT 도구가 round-trip 커버리지를 이루는 테스트 케이스를 만들게 할 수 있다. 이 강의계획서에 따르면 테스트 모델이 테스트 산출물을 끌어내는 단 하나의 기준이 되므로, 유지보수할 것은 테스트 모델뿐이다.[@istqb-ctal-ta-syllabus-2025]

## 테스트 오라클

MBT는 [[test-case#판정과 테스트 오라클|테스트 오라클 문제]]를 푸는 방법 가운데 하나다. MBT에서는 테스트 오라클을 테스트 모델의 일부로 형식화할 수 있어, 모델에서 기대 출력을 만들고 테스트를 끌어낼 수 있다.[@istqb-ctal-ta-syllabus-2025]

## 모델과 생성 코드

실행 가능한 모델과, 손으로 쓰거나 자동으로 만든 코드를 견주는 [[back-to-back-testing|back-to-back 테스트]]는 실행 가능한 모델이 pseudo-oracle 구실도 하는 MBT의 한 형태다. ISTQB CT-AuT v2.1.1 강의계획서에 따르면 테스터는 모델에서 기대 결과뿐 아니라 자동화한 테스트 케이스도 끌어내므로, 이 접근은 테스트 설계 자동화에 잘 맞는다.[@istqb-ct-aut-syllabus-2025]

## 모델 기반 개발과의 차이

**모델 기반 개발**(model-based development)은 모델로 시스템을 분석하는 개발 방법으로, 모델이 꼭 개발의 주된 산출물은 아니다. SWEBOK V4.0a는 모델에서 테스트 케이스를 만드는 일을 [[software-testing|소프트웨어 테스트]] 영역에서 따로 다룬다.[@ieee-swebok-v4-0a-2026]
