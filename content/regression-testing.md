---
title: 회귀 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

**회귀 테스트**(regression testing)는 소프트웨어나 그 운영 환경을 바꾼 뒤, 바꾸지 않은 부분에 결함이 새로 생기거나 드러났는지 찾는 테스트다.[@ieee-cs-sevocab-2026][@istqb-glossary-regression-testing-2026] ISTQB 용어집은 회귀 테스트를 변경 관련 테스트(change-related testing)의 한 종류로 둔다.[@istqb-glossary-regression-testing-2026] SWEBOK V4.0a에 따르면 실무의 회귀 테스트는 테스트 대상이 스위트에서 전에 통과한 테스트를 여전히 통과하는지 보인다.[@ieee-swebok-v4-0a-2026]

## 회귀 테스트의 계기

ISTQB CTFL 강의계획서에 따르면 변경은 기능을 더해 개선하거나 결함을 없애 고치려고 하고, 그 뒤의 테스트에는 확인 테스트와 회귀 테스트가 든다. 회귀 테스트는 확인 테스트를 마친 수정까지 포함해, 변경이 나쁜 결과를 낳지 않았는지 확인한다. 회귀 테스트는 테스트 대상만이 아니라 환경과도 관련될 수 있고, 운영 환경의 업그레이드나 다른 플랫폼으로의 이전은 유지보수 테스트의 계기다.[@istqb-ctfl-syllabus-2024]

## 테스트 선택

이 강의계획서는 먼저 [[configuration-management#변경 통제|영향 분석]]으로 소프트웨어의 어느 부분이 영향을 받을 수 있는지 보고, 회귀 테스트의 범위를 정하기를 권한다.[@istqb-ctfl-syllabus-2024]

SWEBOK V4.0a에 따르면 실행할 테스트가 많아 회귀 테스트는 시간이 많이 들 수 있어서, 변경마다 얻는 보증과 드는 자원 사이에서 절충해야 할 때가 있다. 회귀 테스트에서는 기존 스위트에서 [[test-case|테스트 케이스]]를 고르거나 줄이고, 우선순위가 높은 테스트가 먼저 실행되도록 순서를 정하기도 한다.[@ieee-swebok-v4-0a-2026]

ISTQB CTAL-TA(Certified Tester Advanced Level Test Analyst) 강의계획서에 따르면 시간, 예산, 테스트 환경, 테스트 데이터 같은 제약 때문에 회귀 테스트를 모두 실행하지 못할 수 있어서, 기준을 두어 알맞은 회귀 테스트를 골라야 한다. 이런 제약은 주로 수동으로 실행하는 테스트에 걸리지만 자동 테스트에도 걸린다. 테스트 주기가 짧고 오래 걸리는 자동 테스트가 많을 때가 그 예다. 회귀 테스트의 범위는 테스트 주기마다 다시 검토한다.[@istqb-ctal-ta-syllabus-2025]

이 강의계획서에 따르면 자동 테스트를 고르는 가장 믿을 만한 기법은 영향 분석이고, 도구가 이를 지원한다. 이 도구는 자동화한 [[configuration-management|형상 관리]] 시스템에 바탕을 두어, 테스트 케이스마다 실행 중에 활성화되는 형상 항목을 기록해 두었다가 변경이 생기면 바뀐 형상 항목과 상호작용하는 회귀 테스트를 고른다. 수동 실행에서는 뚜렷이 나은 선택 기법이 있다는 결정적 근거가 아직 없어 상황에 따라 고르며, 흔히 쓰는 기법은 다음과 같다.[@istqb-ctal-ta-syllabus-2025]

- **리스크 기반 선택**: 회귀 테스트 스위트를 리스크 등록부에 추적해 두고, 변경으로 리스크 등록부가 바뀌면 [[risk-based-testing|리스크]]가 가장 높은 쪽을 덮도록 스위트를 고친다.
- **이력 기반 테스트**: 지난 실행에서 결함을 드러냈거나 비슷한 변경에 민감했던 테스트를 다시 실행한다.
- **커버리지 기반 테스트**: 고른 테스트 기법을 기준으로 적은 수의 테스트로 커버리지를 되도록 많이 얻는다.
- **요구사항 추적 매트릭스**: 요구사항 변경이 관련 테스트에 주는 영향을 평가해, 직접 영향받은 기능과 관련 기능의 회귀 테스트를 고른다.
- **운용 프로파일 기반 테스트**: 테스트 대상의 사용 패턴을 바탕으로 실행할 회귀 테스트 케이스를 고른다.
- 영향 분석: 어느 테스트가 바뀐 형상 항목과 상호작용하는지 알면 수동 실행할 회귀 테스트를 고르는 데도 쓴다.[@istqb-ctal-ta-syllabus-2025]

![[diagrams/regression-test-impact-analysis.svg]]

## 테스트 자동화와 지속적 통합

ISTQB CTFL 강의계획서에 따르면 회귀 테스트 스위트는 여러 번 돌리고 회귀 테스트 케이스의 수는 대개 반복이나 릴리스마다 늘어나므로, 회귀 테스트는 [[test-automation|자동화]]에 알맞은 대상이고 그 자동화는 프로젝트 초기에 시작해야 한다.[@istqb-ctfl-syllabus-2024]

[[continuous-integration|지속적 통합]]에서는 자동화한 회귀 테스트도 함께 돌린다.[@ieee-swebok-v4-0a-2026][@istqb-ctfl-syllabus-2024] ISTQB CTAL-TAE(Certified Tester Advanced Level Test Automation Engineering) 강의계획서에 따르면 실행에 오래 걸리는 회귀 테스트 스위트는 파이프라인에서 매일 밤처럼 주기적으로 돌릴 수 있다.[@istqb-ctal-tae-syllabus-2024]

## ASPICE

[[automotive-spice|ASPICE]] 4.1은 SYS.4, SYS.5, SWE.4, SWE.5, SWE.6에 검증 수단을 고르는 BP(base practice)를 두고, 그 선택 기준에 회귀 검증 기준을 넣게 한다. SWE.5에서는 그 선택 기준의 예로 [[software-architecture|소프트웨어 아키텍처]]나 상세 설계의 변경 등으로 지속적 통합·지속적 개발(continuous integration / continuous development)에서 회귀 검증이 필요한 경우를 든다.[@vda-automotive-spice-pam-4-1-2026]

ASPICE 3.1은 SYS.5, SWE.4, SWE.6의 BP1과 SYS.4, SWE.5의 BP2에서 테스트나 검증의 전략을 세울 때 회귀 전략을 함께 세우게 했다. ASPICE 4.1은 이를 검증 수단을 고르는 BP의 회귀 검증 기준으로 바꿨다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017] 전략 BP가 4.1에서 어디로 갔는지는 [[automotive-spice-process-assessment-model#전략과 계획|ASPICE 프로세스 평가 모델]]에서 다룬다.

## 확인 테스트와의 차이

**확인 테스트**(confirmation testing)는 결함을 고친 뒤 그 결함이 일으킨 장애(failure)가 다시 일어나지 않는지 확인하는 변경 관련 테스트로, 재테스트(retesting)라고도 부른다.[@istqb-glossary-confirmation-testing-2026] ISO/IEC/IEEE 24765 용어집은 재테스트를 결함을 고치려고 한 수정이 그 결함을 실제로 없앴는지 확인하는 테스트로 정의하고, 그 주석에서 재테스트를 흔히 회귀 테스트로 보완하는 것으로 둔다.[@ieee-cs-sevocab-2026]

확인 테스트는 수정이 제대로 됐는지를 보고, 회귀 테스트는 변경이 다른 부분에 뜻하지 않은 영향을 주지 않았는지를 본다.[@ieee-cs-sevocab-2026][@istqb-ctfl-syllabus-2024]

![[diagrams/confirmation-regression-testing-scope.svg]]
