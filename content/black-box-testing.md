---
title: 블랙박스 테스트
aliases:
  - 명세 기반 테스트
tags:
  - sw-engineering/sw-testing
verified: 2026-10-03
---

**블랙박스 테스트**(black-box testing)는 구현(소스 코드)이 아니라 명세, 곧 테스트 대상의 외부 입력과 출력을 바탕으로 하는 테스트다. 명세 기반 테스트(specification-based testing)라고도 부른다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-black-box-testing-2026] 명세에 근거한 테스트 기법을 **블랙박스 테스트 기법**(black-box test technique)이라 부르고, 명세 기반 테스트 기법(specification-based test technique)이라고도 부른다.[@istqb-glossary-black-box-test-technique-2026]

[[software-testing#테스트 기법의 분류|테스트 기법]]은 블랙박스, [[white-box-testing|화이트박스]], 경험 기반의 세 갈래로 나뉜다. 블랙박스 기법은 명세된 동작을 분석해 테스트를 만들므로 케이스가 구현과 독립이고, 구현이 바뀌어도 요구 동작이 그대로면 케이스를 계속 쓸 수 있다.[@istqb-ctfl-syllabus-2024]

## 테스트 기준

[[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-1:2022는 테스트 기준(test basis)이 [[software-requirements-specification|요구사항 명세]], 설계 명세 같은 문서일 수도 있고, 문서로 남지 않은 요구 동작의 이해일 수도 있다고 둔다.[@iso-iec-ieee-29119-1-obp-2022] [[use-case|use case]]도 테스트 기준이 될 수 있다.[@istqb-ctal-ta-syllabus-2025] 테스트 기준의 정의는 [[v-model#테스트 기준|V 모델]]에서 다룬다.

## 요구사항 기반 테스트

**요구사항 기반 테스트**(requirements-based testing)는 원자 요구사항(atomic requirement)을 바탕으로 테스트를 설계하는 블랙박스 기법이다.[@iso-iec-ieee-29119-4-obp-2021][@istqb-glossary-requirements-based-testing-2026]

요구사항 기반 테스트에서 테스터는 대개 글로 된 요구사항을 분석해 원자 요구사항 하나하나에서 테스트 조건을 끌어내고, 요구사항을 실행하는 [[test-case|테스트 케이스]]를 설계해 실행한다. 이 분해는 요구사항 안에서 서로 구별되고 테스트할 수 있는 측면을 찾는 일이다. 원자 요구사항 하나는 따로 검증할 수 있는 동작이나 조건 하나를 기술한다. ISTQB CT-AuT v2.1.1 강의계획서에 따르면 복잡하거나 상위 수준인 요구사항을 이렇게 잘게 나누면 커버리지를 빠짐없이 얻고 숨은 기대나 암묵적인 기대를 놓치지 않는다.[@istqb-ct-aut-syllabus-2025]

요구사항 기반 테스트의 테스트 케이스는 대개 요구사항이 충족됨을 확인하는 긍정 테스트 케이스다. 부정 테스트 케이스는 흔히 [[equivalence-partitioning|동치 분할]], [[error-guessing|오류 추정]], [[exploratory-testing|탐색적 테스트]] 같은 보완 기법으로 끌어내지만, 요구사항이 부정 조건을 명시하기도 한다.[@istqb-ct-aut-syllabus-2025]

## 기법

흔히 쓰는 블랙박스 기법으로는 다음이 있다.[@istqb-ctfl-syllabus-2024]

- 동치 분할
- [[boundary-value-analysis|경계값 분석]]
- [[decision-table-testing|결정 테이블 테스트]]
- [[state-transition-testing|상태 전이 테스트]][@istqb-ctfl-syllabus-2024]

매개변수 값의 조합을 실행하는 [[pairwise-testing#조합 테스트|조합 테스트]] 기법도 명세 기반 기법이고, [[pairwise-testing|페어와이즈 테스트]]가 그 예다.[@iso-iec-ieee-29119-4-obp-2021] [[scenario-based-testing#Use case 테스트|use case 테스트]]도 블랙박스 기법이다.[@istqb-glossary-use-case-testing-2026]

ISO/IEC/IEEE 29119-4:2021은 **원인-결과 그래프**(cause-effect graph)를 원인(Boolean 조건으로 기술한 입력)과 결과(Boolean 식으로 기술한 출력) 사이의 결정 규칙을 그래프로 나타낸 것으로, **원인-결과 그래프 기법**(cause-effect graphing)을 원인-결과 그래프의 결정 규칙을 실행하는 데 바탕을 둔 명세 기반 테스트 케이스 설계 기법으로 정의한다. 이 표준은 **syntax testing**을 테스트 대상 입력의 형식 정의를 이루는 요소를 실행하는 데 바탕을 둔 명세 기반 기법으로 정의하고, 입력의 구문을 정의하는 데 흔히 쓰는 형식으로 Backus-Naur Form을 예로 든다. **Backus-Naur Form**은 언어의 구문을 텍스트로 정의하는 형식 메타언어다. 이 표준이 정의하는 명세 기반 기법에는 [[pairwise-testing#조합 테스트|분류 트리 기법]](classification tree method)도 있다.[@iso-iec-ieee-29119-4-obp-2021]

ISTQB CTAL-TA v4.0 강의계획서는 블랙박스 기법을 테스트 조건이 모델링하는 것에 따라 세 갈래로 나누고, 갈래마다 다음 기법을 든다.[@istqb-ctal-ta-syllabus-2025]

- **data-based**: 데이터의 요소를 모델링한다. 동치 분할, 경계값 분석, [[boundary-value-analysis#도메인 테스트|도메인 테스트]], 조합 테스트, [[random-testing|무작위 테스트]]
- **behavior-based**: 동적 동작의 요소를 모델링한다. CRUD(create, read, update, delete) 테스트, 상태 전이 테스트, [[scenario-based-testing|시나리오 기반 테스트]]
- **rule-based**: 정적 동작 규칙의 요소를 모델링한다. 결정 테이블 테스트, [[metamorphic-testing|메타모픽 테스트]][@istqb-ctal-ta-syllabus-2025]

## 기법 고르기

ISTQB CTAL-TA v4.0 강의계획서에 따르면 가장 알맞은 테스트 기법을 고르는 일은 제품 리스크를 효과적이고 효율적으로 줄이는 데 결정적이고, 다음을 비롯한 여러 요인에 영향을 받는다.[@istqb-ctal-ta-syllabus-2025]

- 테스트 목표: 테스트 대상의 어느 측면을 평가할지 정해 기법 선택을 이끈다. 테스트 목표는 시스템 유형에 달려 있다. 예를 들어 공학의 수치 계산에는 도메인 테스트를, 신용 리스크 관리에는 결정 테이블 테스트를 쓴다.
- 제품 리스크: 대부분의 기법은 특정한 결함 유형을 찾는 데 초점을 둔다. data-based 기법은 데이터 처리, 도메인 구현, 사용자 인터페이스, 계산, 매개변수 조합의 결함을 찾을 수 있다. behavior-based 기법은 빠진 기능, 의사소통 결함, 처리 결함 같은 사용자 요구사항 결함을, rule-based 기법은 논리와 제어 흐름의 결함을 찾을 수 있다. 리스크 분석은 테스트 접근을 정하는 데도 도움이 된다. 리스크 수준이 높을수록 커버리지 기반 [[test-process#진입 기준과 종료 기준|종료 기준]]이 더 엄격한 커버리지를 요구할 수 있다. 예를 들어 페어와이즈 커버리지 대신 모든 조합을 덮는 조합 커버리지를 요구한다. 다만 커버리지의 강도와 드는 테스트 노력 사이의 균형을 늘 따져야 한다. 경험 기반 테스트는 커버리지를 정하기 어렵거나, 리스크 수준이 낮거나, 일정이 빠듯할 때 쓸 수 있다.
- 테스트 기준: 테스트 대상의 명세가 모델을 쓰면 그 모델에 바탕을 둔 기법을 쓸 수 있다. 테스트 기준에서 [[test-case#판정과 테스트 오라클|테스트 오라클]]을 끌어내기 어렵거나 불가능하면 메타모픽 테스트나 경험 기반 기법을 쓸 수 있다.
- 되풀이되는 결함 유형에 대한 지식: 그런 결함을 찾는 데 초점을 둔 기법을 고르게 할 수 있다. 예: [[checklist-based-testing|체크리스트 기반 테스트]]. 앞선 반복이나 프로젝트와 비슷한 결함을 찾으려면 거기서 성공한 기법을 다시 쓰는 것이 합리적일 수 있다.
- 테스터의 지식과 경험: 익숙하지 않은 기법은 중요한 테스트 과제에 쓰기를 권하지 않는다. 도메인 지식도 기법 선택에 영향을 주어, 도메인 지식이 거의 없으면 탐색적 테스트 같은 기법은 효과가 없을 수 있다.
- [[software-development-life-cycle|소프트웨어 개발 생명주기]]: 순차 개발 모델은 더 형식적인 기법을 쓰기에 알맞다. 반복 개발 모델은 경험 기반 기법 같은 가벼운 기법을 쓰거나 테스트 설계를 자동화할 수 있을 때 더 알맞을 수 있다.
- 고객과 계약 요구사항: 계약이 특정한 [[software-testing#테스트 레벨|테스트 레벨]]이나 [[test-type|테스트 유형]] 같은 특정 테스트를 명시적으로 요구하면 기법 선택에 영향을 준다. 예를 들어 고객이 시나리오 집합을 담은 [[acceptance-test-driven-development#인수 기준|인수 기준]]을 주면 시나리오 기반 기법을 쓰는 것이 알맞다.
- 규제 요구사항: 프로젝트가 따르는 표준이 특정 기법을 쓰도록 요구할 수 있다.
- 프로젝트 제약: 시간과 예산 같은 제약은 시간이 많이 들거나 비싼 자원이 필요한 기법을 쓰는 데 영향을 준다.[@istqb-ctal-ta-syllabus-2025]

결함 검출의 효율과 효과를 높이려고 기법을 흔히 함께 쓴다. 예는 다음과 같다.[@istqb-ctal-ta-syllabus-2025]

- 상태 전이 테스트의 [[state-transition-testing#상태 다이어그램과 상태 표|가드 조건]]에 경계값 분석을 쓴다.
- 시나리오 기반 테스트에서 결정 테이블의 조건 값이나 테스트 대상 시스템에 나오는 변수의 값을 정하는 데 도메인 테스트를 쓴다.
- 업무 프로세스의 결정을 엄격하게 덮으려고 시나리오 기반 테스트에 화이트박스 기법인 [[test-coverage#결정 커버리지와 분기 커버리지|결정 커버리지]]를 함께 쓴다.
- 순환하는 업무 프로세스 활동의 리스크를 다루려고 시나리오 기반 테스트에 [[state-transition-testing#N-switch와 round-trip 커버리지|round-trip 커버리지]]를 함께 쓴다.[@istqb-ctal-ta-syllabus-2025]

ISTQB CT-AuT v2.1.1 강의계획서에 따르면 테스트 기법과 테스트 접근을 고르는 데는 다음 요인이 작용한다.[@istqb-ct-aut-syllabus-2025]

- 기술 수준(state of the art): 그 기법이 그 목적에 대해 현재의 기술 수준을 대표하는지 본다. 표준이 이 판단에 지침이 된다.
- 테스트 기준: 테스트 기준이 그 기법에 알맞은 테스트 조건을 주는지 본다. 예를 들어 동치 분할은 테스트 기준에 매개변수나 변수가 있고 그 값을 동치 분할로 묶을 수 있어야 쓸 수 있다. 경계값도 비슷해서, 값의 범위가 선형으로 정의돼 있어야 테스트할 수 있다.
- [[risk-based-testing|리스크 기반 테스트]]: 제품 리스크를 식별하고 리스크 수준을 고려해 기법을 고른다. 예를 들어 경계값 테스트는 경계를 어길 리스크가 있고 그 영향이 리스크가 될 때만 의미가 있다.
- 테스트 레벨: 그 기법을 그 테스트 레벨에서 쓸 수 있는지 본다. 화이트박스 테스트는 소스 코드나 내부 구조가 테스트 기준일 때 특히 알맞고, 이상적으로는 구조적 커버리지를 잴 수 있다. 블랙박스 테스트에서는 테스트 대상이 있고 관찰할 수 있어야 한다. 예를 들어 센서의 동치 분할을 테스트하는 것은 [[unit-testing|컴포넌트 테스트]]보다 [[system-testing|시스템 테스트]]에서 더 효율적일 수 있다. 한 테스트 레벨에서 쓸 수 없는 기법이면 테스트 전략에 따라 다른 테스트 레벨을 고른다.[@istqb-ct-aut-syllabus-2025]

시스템 테스트를 두고 이 요인 몇을 평가해 기법을 고른 예가 있다. 이 예에서 고른 기법은 테스트 기준이 알맞고, 결함을 놓쳤을 때의 리스크가 크며, 시스템 테스트에서 쓸 만하다고 평가한 요구사항 기반 테스트와 동치 분할이다. 경계값 분석, 오류 추정, [[back-to-back-testing|back-to-back 테스트]]는 테스트 기준이 알맞지 않다고 평가했고, [[white-box-testing#커버리지로 케이스 끌어내기|구문 테스트]], [[test-coverage#결정 커버리지와 분기 커버리지|결정 테스트]], [[modified-condition-decision-coverage|MC/DC]], [[fault-injection|결함 주입]] 테스트는 시스템 테스트에서 쓸 만하지 않다고 평가해 고르지 않았다.[@istqb-ct-aut-syllabus-2025]
