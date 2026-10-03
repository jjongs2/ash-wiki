---
title: 회귀 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

**회귀 테스트**(regression testing)는 소프트웨어나 그 운영 환경을 바꾼 뒤, 바꾸지 않은 부분에 결함이 새로 생기거나 드러났는지 찾는 테스트다.[@ieee-cs-sevocab-2026][@istqb-glossary-regression-testing-2026] ISTQB 용어집은 회귀 테스트를 변경 관련 테스트(change-related testing)의 한 종류로 둔다.[@istqb-glossary-regression-testing-2026] SWEBOK V4.0a에 따르면 실무의 회귀 테스트는 테스트 대상이 스위트에서 전에 통과한 테스트를 여전히 통과하는지 보인다.[@ieee-swebok-v4-0a-2026]

## 회귀 테스트의 계기

ISTQB CTFL 강의계획서에 따르면 변경은 기능을 더해 개선하거나 결함을 없애 고치려고 하고, 그 뒤의 테스트에는 확인 테스트와 회귀 테스트가 든다. 회귀 테스트는 확인 테스트를 마친 수정까지 포함해, 변경이 나쁜 결과를 낳지 않았는지 확인한다. 회귀 테스트는 테스트 대상만이 아니라 환경과도 관련될 수 있고, 운영 환경의 업그레이드나 다른 플랫폼으로의 이전은 유지보수 테스트의 계기다.[@istqb-ctfl-syllabus-2024]

## 확인 테스트와의 차이

**확인 테스트**(confirmation testing)는 결함을 고친 뒤 그 결함이 일으킨 장애가 다시 일어나지 않는지 확인하는 변경 관련 테스트로, 재테스트(retesting)라고도 부른다.[@istqb-glossary-confirmation-testing-2026] ISO/IEC/IEEE 24765 용어집은 재테스트를 결함을 고치려고 한 수정이 그 결함을 실제로 없앴는지 확인하는 테스트로 정의하고, 재테스트는 흔히 회귀 테스트로 보완한다고 적는다.[@ieee-cs-sevocab-2026]

확인 테스트는 수정이 제대로 됐는지를 보고, 회귀 테스트는 변경이 다른 부분에 뜻하지 않은 영향을 주지 않았는지를 본다.[@ieee-cs-sevocab-2026][@istqb-ctfl-syllabus-2024]

![[diagrams/confirmation-regression-testing-scope.svg]]

## 테스트 선택

ISTQB CTFL 강의계획서는 먼저 영향 분석으로 소프트웨어의 어느 부분이 영향을 받을 수 있는지 보고, 회귀 테스트의 범위를 정하기를 권한다.[@istqb-ctfl-syllabus-2024]

SWEBOK V4.0a에 따르면 실행할 테스트가 많아 회귀 테스트는 시간이 많이 들 수 있어서, 변경마다 얻는 보증과 드는 자원 사이에서 절충해야 할 때가 있다. 회귀 테스트에서는 기존 스위트에서 테스트 케이스를 고르거나 줄이고, 우선순위가 높은 테스트가 먼저 실행되도록 순서를 정하기도 한다.[@ieee-swebok-v4-0a-2026]

## 테스트 자동화와 지속적 통합

ISTQB 용어집은 **테스트 자동화**(test automation)를 테스트 활동을 자동으로 돌아가게 바꾸는 일로 정의한다.[@istqb-glossary-test-automation-2026] ISTQB CTFL 강의계획서에 따르면 회귀 테스트 스위트는 여러 번 돌리고 회귀 테스트 케이스의 수는 대개 반복이나 릴리스마다 늘어나므로, 회귀 테스트는 자동화에 알맞은 대상이고 그 자동화는 프로젝트 초기에 시작해야 한다.[@istqb-ctfl-syllabus-2024]

[[continuous-integration|지속적 통합]]에서는 자동화한 회귀 테스트도 함께 돌린다.[@ieee-swebok-v4-0a-2026][@istqb-ctfl-syllabus-2024]

## Automotive SPICE

[[automotive-spice|Automotive SPICE]] 4.1은 SYS.4, SYS.5, SWE.4, SWE.5, SWE.6에 검증 수단을 고르는 BP(base practice)를 두고, 그 선택 기준에 회귀 검증 기준을 넣게 한다. SWE.5는 통합 단계마다 어떤 통합 검증 수단을 골랐는지 문서로 남기게 하고, 선택 기준의 예로 소프트웨어 아키텍처나 상세 설계의 변경 등으로 지속적 통합·지속적 개발(continuous integration / continuous development)에서 회귀 검증이 필요한 경우를 든다.[@vda-automotive-spice-pam-4-1-2026]

Automotive SPICE 3.1은 SYS.5, SWE.4, SWE.6의 BP1과 SYS.4, SWE.5의 BP2에서 테스트나 검증의 전략을 세울 때 회귀 전략을 함께 세우게 했다. Automotive SPICE 4.1은 이를 검증 수단을 고르는 BP의 회귀 검증 기준으로 바꿨다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017] 전략 BP가 4.1에서 어디로 갔는지는 [[automotive-spice-process-assessment-model#전략과 계획|ASPICE 프로세스 평가 모델]]에서 다룬다.
