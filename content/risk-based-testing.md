---
title: 리스크 기반 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

**리스크 기반 테스트**(risk-based testing)는 리스크의 종류와 수준을 바탕으로 테스트 활동과 자원을 관리하고, 고르고, 우선순위를 매기고, 쓰는 테스트 접근법이다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-risk-based-testing-2026] ISTQB CTFL 강의계획서에 따르면 아주 단순한 경우가 아니면 모든 것을 테스트할 수 없으므로, 리스크 기반 테스트 같은 방법으로 테스트 노력을 모아야 한다. 제품 리스크 분석의 목표는 남는 제품 리스크 수준이 가장 작아지도록 테스트 노력을 모으는 것이다.[@istqb-ctfl-syllabus-2024]

## 리스크

CTFL 강의계획서는 **리스크**(risk)를 일어나면 나쁜 영향을 낳는 잠재적인 사건, 위험원, 위협, 상황으로 정의하고, [[software-testing|소프트웨어 테스트]]에서는 대개 프로젝트 리스크와 제품 리스크 두 가지를 다룬다고 둔다.[@istqb-ctfl-syllabus-2024]

**제품 리스크**(product risk)는 제품의 품질에 관련된 리스크다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-ctfl-syllabus-2024] CTFL 강의계획서는 제품 리스크의 예로 기능이 빠지거나 틀림, 계산이 틀림, 실행 중 오류, 나쁜 아키텍처, 비효율적인 알고리즘, 모자란 응답 시간, 나쁜 사용자 경험, 보안 취약점을 든다. 제품 리스크가 현실이 되면 사용자 불만, 수익·신뢰·평판 손실, 제3자 피해, 높은 유지보수 비용, 형사 처벌이 생길 수 있고, 극단적으로는 물리적 피해와 부상이나 사망까지 이를 수 있다.[@istqb-ctfl-syllabus-2024]

**프로젝트 리스크**(project risk)는 프로젝트의 관리에 관련된 리스크다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-ctfl-syllabus-2024] CTFL 강의계획서는 프로젝트 리스크의 예로 조직 문제(산출물 인도 지연, 부정확한 추정, 비용 삭감), 사람 문제(기술 부족, 갈등, 의사소통 문제, 인력 부족), 기술 문제(범위 변경, 도구 지원 부족), 공급자 문제(제3자의 인도 실패, 지원 업체 파산)를 든다. 프로젝트 리스크가 현실이 되면 일정, 예산, 범위에 영향을 준다.[@istqb-ctfl-syllabus-2024]

안전 관점의 리스크와 잔여 리스크는 [[functional-safety|기능 안전]]에서 다룬다.

## 리스크 수준

CTFL 강의계획서에 따르면 리스크는 **발생 가능성**(risk likelihood, 일어날 확률)과 **영향**(risk impact, 일어났을 때의 결과) 두 요소로 나타낸다.[@istqb-ctfl-syllabus-2024] ISTQB 용어집은 **리스크 수준**(risk level)을 리스크 영향과 발생 가능성으로 정하는 리스크의 척도로 정의한다.[@istqb-glossary-risk-level-2026]

CTFL 강의계획서에 따르면 리스크 평가는 정량적 방법이나 정성적 방법, 또는 둘을 섞어 할 수 있다. 정량적 방법에서는 리스크 수준을 발생 가능성과 영향의 곱으로 계산하고, 정성적 방법에서는 리스크 매트릭스로 정할 수 있다.[@istqb-ctfl-syllabus-2024] ISTQB CTAL-TM(Certified Tester Advanced Level Test Management) 강의계획서에 따르면 발생 가능성과 영향은 대개 "매우 높음"에서 "매우 낮음"까지 같은 순서 척도로만 정할 수 있고, 이 두 값을 리스크 매트릭스로 묶어 리스크 수준을 낸다.[@istqb-ctal-tm-syllabus-2024]

## 리스크 관리 활동

CTFL 강의계획서에 따르면 리스크 관리의 주된 활동은 **리스크 분석**(risk analysis)과 **리스크 통제**(risk control)이고, 각각 다시 둘로 나뉜다.[@istqb-ctfl-syllabus-2024]

- **리스크 식별**(risk identification): 빠짐없는 리스크 목록을 만드는 일. 이해관계자는 브레인스토밍, 워크숍, 인터뷰, 원인-결과 다이어그램 같은 기법과 도구로 리스크를 식별할 수 있다.
- **리스크 평가**(risk assessment): 식별한 리스크를 분류하고, 발생 가능성과 영향과 리스크 수준을 정하고, 우선순위를 매기고, 대응 방법을 제안하는 일.
- **리스크 완화**(risk mitigation): 리스크 평가에서 제안한 조치를 실행해 리스크 수준을 낮추는 일.
- **리스크 모니터링**(risk monitoring): 완화 조치가 효과가 있는지 확인하고, 평가를 다듬을 정보를 얻고, 새로 생기는 리스크를 찾는 일.[@istqb-ctfl-syllabus-2024]

앞의 둘이 리스크 분석, 뒤의 둘이 리스크 통제다. 분석한 제품 리스크에 대응하는 방법에는 테스트로 완화하기, 리스크를 받아들이기, 리스크를 넘기기, 비상 계획 세우기가 있다.[@istqb-ctfl-syllabus-2024]

![[diagrams/risk-analysis-control-activities.svg]]

## 리스크 수준에 따른 테스트

CTFL 강의계획서에 따르면 제품 리스크 분석의 결과는 테스트의 철저함과 범위에 영향을 주며, 다음을 정하는 데 쓴다.[@istqb-ctfl-syllabus-2024]

- 테스트 범위
- 수행할 [[software-testing#테스트 레벨|테스트 레벨]]과 테스트 유형
- 쓸 테스트 기법과 이룰 [[test-coverage|커버리지]]
- 작업마다 드는 테스트 노력의 추정
- 테스트 우선순위
- 테스트 말고 리스크를 줄일 다른 활동[@istqb-ctfl-syllabus-2024]

같은 강의계획서에 따르면 리스크에 따라 우선순위를 매길 때는 가장 중요한 리스크를 덮는 [[test-case|테스트 케이스]]를 먼저 실행한다.[@istqb-ctfl-syllabus-2024] CTAL-TM 강의계획서는 테스트에 들이는 시간과 노력을 리스크 수준에 비례하게 하기를 권한다. 리스크 수준이 높은 것은 일찍 시작하고 더 엄격한 테스트 기법을 쓰며, 낮은 것은 늦게 시작해도 되고 덜 엄격한 기법을 쓴다.[@istqb-ctal-tm-syllabus-2024] ISTQB CTAL-TA(Certified Tester Advanced Level Test Analyst) 강의계획서에 따르면 리스크 수준이 높을수록 커버리지 기반 종료 기준도 더 엄격한 커버리지를 요구할 수 있다.[@istqb-ctal-ta-syllabus-2025] 테스트 계획서에 리스크를 담는 자리는 [[test-process#테스트 계획서|테스트 프로세스]]에서 다룬다.

![[diagrams/risk-level-test-rigor.svg]]
