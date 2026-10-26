---
title: 탐색적 테스트
tags:
  - sw-engineering/sw-testing
verified: 2026-10-13
---

**탐색적 테스트**(exploratory testing)는 테스터가 자기 지식, 테스트 항목(테스트할 작업 산출물)을 앞서 탐색한 것, 앞선 테스트의 결과를 바탕으로 테스트를 그때그때 설계하고 실행하는 방식이다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-exploratory-testing-2026] [[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-1:2022는 그 바탕에 흔한 소프트웨어 동작과 [[fault-error-failure|failure]] 유형에 대한 경험칙(heuristic)도 넣어 정의한다.[@iso-iec-ieee-29119-1-obp-2022]

## 분류

ISTQB CTFL v4.0.1 강의계획서는 탐색적 테스트를 [[error-guessing|오류 추정]], [[checklist-based-testing|체크리스트 기반 테스트]]와 함께 [[software-testing#테스트 기법의 분류|경험 기반 기법]]으로 다룬다.[@istqb-ctfl-syllabus-2024] ISTQB 용어집은 탐색적 테스트를 테스트 접근법(test approach)으로 정의한다.[@istqb-glossary-exploratory-testing-2026]

ISO/IEC/IEEE 29119-1:2022는 탐색적 테스트를 경험 기반 테스트(experience-based testing)의 하나로 정의하고, 경험 기반 테스트를 테스터의 경험으로 [[test-case|테스트 케이스]]를 만드는 테스트 케이스 설계 기법의 갈래로 정의한다. 한편 이 표준은 테스트 설계 기법 정의의 둘째 주석에서, 탐색적 테스트 같은 [[model-based-testing#테스트 설계 기법과의 관계|테스트 실천]](test practice)은 스스로 테스트 케이스를 만드는 방법을 주지 않고 테스트 설계 기법을 써서 만들므로 ISO/IEC/IEEE 29119 시리즈의 정의로는 테스트 설계 기법이 아니라고 제시한다.[@iso-iec-ieee-29119-1-obp-2022]

## 쓰임

탐색적 테스트에서 테스터는 테스트 대상을 알아 가는 동안 테스트를 설계하고 실행하고 평가하는 일을 함께 한다. 탐색적 테스트는 테스트 대상을 더 알아 가고, 초점을 맞춘 테스트로 더 깊이 살피고, 아직 테스트하지 않은 영역의 테스트를 만드는 데 쓴다. ISTQB CTFL v4.0.1 강의계획서에 따르면 탐색적 테스트는 명세가 거의 없거나 모자랄 때와 테스트 일정의 압박이 클 때 쓸모가 있고, 더 공식적인 다른 테스트 기법을 보완하는 데도 쓸모가 있다. 이 강의계획서에 따르면 탐색적 테스트는 테스터가 경험과 도메인 지식을 갖추고 분석력, 호기심, 창의성 같은 기량이 높을수록 더 효과적이다. 탐색적 테스트 안에서 [[equivalence-partitioning|동치 분할]] 같은 다른 테스트 기법을 쓸 수도 있다.[@istqb-ctfl-syllabus-2024]

## 세션 기반 테스트

탐색적 테스트는 세션 기반 테스트로 짜임새를 갖춰 하기도 한다. **세션 기반 테스트**(session-based testing)는 정해진 시간 상자(time box) 안에서 탐색적 테스트를 하는 방식이다. 테스터는 테스트 목표를 담은 테스트 차터를 따라 테스트를 이끈다. 테스트 세션 뒤에는 대개 테스터와, 그 세션의 결과에 관심 있는 이해관계자가 결과를 함께 이야기하는 디브리핑(debriefing)이 이어진다. 이 방식에서는 테스트 목표를 높은 수준의 [[test-case#테스트 조건|테스트 조건]]으로 다룰 수 있고, [[test-coverage#기법마다 다른 커버리지 항목|커버리지 항목]]은 세션 동안 찾아 실행한다. 테스터는 따른 단계와 발견한 것을 테스트 세션 시트(test session sheet)에 적을 수 있다.[@istqb-ctfl-syllabus-2024]

![[diagrams/session-based-testing-flow.svg]]

## 테스트 차터

**테스트 차터**(test charter)는 테스트 세션의 미션을 주는 것으로, 세션의 범위와 목표, 그리고 제한, 일정, 리스크 같은 정보를 담는다. 테스트 차터는 세션에 짜임새를 주어, 테스트 분석가가 정해진 영역이나 기능에 집중하면서도 필요하면 시스템을 자유롭게 탐색하게 한다. 세션마다 실행할 [[test-case#테스트 스위트|테스트 스위트]]는 정하지 않는다.[@istqb-ctal-ta-syllabus-2025]

테스트 차터를 설계할 때는 다음 요인을 따진다.[@istqb-ctal-ta-syllabus-2025]

- 고객과 요구사항 요인: 고객에게서 끌어낸 요구사항, 시스템의 비즈니스 [[use-case|use case]], 품질 요구사항, 사용자가 시간에 따라 시스템과 상호작용하는 과정을 그린 사용자 여정 지도(user journey map)
- 제품 요인: 기능 흐름, 제품의 주요 목표, 제품 기능, [[software-design|소프트웨어 설계]], 인터페이스
- 프로젝트 관리 요인: 시간 제약, 프로젝트의 목적, 추정한 공수, 비즈니스 가치[@istqb-ctal-ta-syllabus-2025]

테스트 차터는 테스트 목표를 적은 미션과 여러 덧붙인 정보로 이루어진다. 미션의 가벼운 꼴로 "Explore [target] With [resources] To discover [information]"이 널리 쓰인다. [target]은 탐색할 대상(영역, 기능, 리스크, 컴포넌트, 요구사항), [resources]는 쓸 것(테스트 데이터, 설정, 도구, 제약, 경험칙, 의존성), [information]은 찾으려는 정보의 종류([[software-quality-model|품질 특성]]의 평가, 예상하는 결함의 종류, 표준 위반)다. 덧붙인 정보로는 조직 정보(세션 길이, 시작 일시, 테스터 이름), 테스트 목표, 테스트 범위, [[test-process#진입 기준과 종료 기준|진입 기준]], 제품 관련 정보, 제품이 결코 해서는 안 되는 일, 테스트 환경, 도움이 될 기존 데이터 소스·제품 정보·테스트 도구, 이력 정보(앞서 찾은 결함 등), 제약과 리스크를 담을 수 있다.[@istqb-ctal-ta-syllabus-2025]

세션 동안 테스트 분석가는 질문, 관찰, 다음 테스트를 위한 아이디어를 테스트 결과와 함께 [[test-process#실행과 완료의 산출물|테스트 로그]]로 남기고, 이를 세션 시트에 적는다. 차터에 담는 정보의 범위와 상세함은 테스트 분석가의 재량에 영향을 준다. 일반적인 테스트 목표만 정하면 탐색할 여지가 넓고, 쓸 테스트 기법까지 적으면 테스트 분석가를 묶을 수 있다. 시스템이 결코 하지 못하는 일 같은 정보를 더하면 [[static-analysis#False positive와 false negative|false-positive]] result를 보고할 가능성을 낮출 수 있다.[@istqb-ctal-ta-syllabus-2025]
