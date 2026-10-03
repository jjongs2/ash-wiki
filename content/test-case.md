---
title: 테스트 케이스
tags:
  - process/sw-testing
verified: 2026-10-03
---

**테스트 케이스**(test case)는 사전 조건, 입력, 기대 결과를 담은 집합이다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-test-case-2026] ISO/IEC/IEEE 29119-1:2022는 테스트 케이스를, 테스트 목표를 이루도록 테스트 항목의 실행을 이끄는 사전 조건, 입력, 기대 결과의 집합으로 정의한다. 이 정의에서 입력에는 필요하면 동작도 든다.[@iso-iec-ieee-29119-1-obp-2022] ISTQB(International Software Testing Qualifications Board) 용어집은 테스트 케이스를 테스트 조건을 바탕으로 만든 사전 조건, 입력, 동작(해당할 때), 기대 결과, 사후 조건의 집합으로 정의한다.[@istqb-glossary-test-case-2026]

ISO/IEC/IEEE 24765:2017은 테스트 케이스를, 특정 프로그램 경로를 실행하거나 특정 요구사항을 지키는지 검증하는 것 같은 특정 목표를 위해 만든 테스트 입력, 실행 조건, 기대 결과의 집합으로도 정의한다.[@iso-iec-ieee-24765-obp-2017]

## 구성

- **사전 조건**(precondition): 테스트를 실행하기 전에 테스트 항목과 테스트 환경이 갖춰야 할 상태.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-precondition-2026]
- **입력**(input): ISO/IEC/IEEE 29119-1:2022는 입력을 테스트 실행을 이끄는 데이터와, 필요하면 동작으로 둔다.[@iso-iec-ieee-29119-1-obp-2022]
- **기대 결과**(expected result): 정해진 조건에서 테스트 항목이 보일 것으로 예측한 관찰 가능한 동작. 명세 같은 근거에서 정한다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-expected-result-2026]
- **사후 조건**(postcondition): ISTQB 용어집은 사후 조건을 테스트 실행이 끝났을 때 테스트 항목과 테스트 환경이 있을 것으로 기대하는 상태로 정의한다.[@istqb-glossary-postcondition-2026]

## 테스트 조건

**테스트 조건**(test condition)은 컴포넌트나 시스템에서 테스트로 확인할 수 있는 측면이다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-test-condition-2026] ISTQB CTFL(Certified Tester Foundation Level) 강의계획서에 따르면 테스트 조건은 테스트 분석에서 정하고, 테스트 설계에서 테스트 케이스로 다듬는다.[@istqb-ctfl-syllabus-2024] 두 활동은 [[test-process|테스트 프로세스]]에서 다룬다. ISO/IEC/IEEE 29119 시리즈는 테스트 설계에 테스트 조건 대신 테스트 모델이라는 개념을 쓴다.[@iso-iec-ieee-29119-1-obp-2022]

## 테스트 절차와 스크립트

**테스트 절차**(test procedure)는 실행할 순서로 늘어놓은 테스트 케이스에, 사전 조건을 갖추는 동작과 실행 뒤의 마무리 활동을 더한 것이다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-test-procedure-2026]

**테스트 스크립트**(test script)는 출처마다 정의가 다르다. ISO/IEC/IEEE 29119-1:2022는 테스트 스크립트를 테스트 절차 명세(test procedure specification)와 같은 말로 두고, 하나 이상의 테스트 절차를 명세한 문서로 정의한다.[@iso-iec-ieee-29119-1-obp-2022] ISTQB 용어집은 테스트 스크립트를 테스트를 실행하는 명령의 열로 정의한다.[@istqb-glossary-test-script-2026] CTFL 강의계획서에 따르면 테스트 구현에서 수동 테스트 스크립트와 자동 테스트 스크립트를 만든다.[@istqb-ctfl-syllabus-2024]

## 테스트 스위트

**테스트 스위트**(test suite)도 출처마다 정의가 다르다. ISO/IEC/IEEE 29119-1:2022는 테스트 스위트를 테스트 케이스나 테스트 절차의 집합으로 정의하고, 보통 테스트를 언제 실행하는지에 따라 묶는다고 둔다.[@iso-iec-ieee-29119-1-obp-2022] ISTQB 용어집은 테스트 스위트를 한 번의 테스트 실행에서 돌릴 테스트 스크립트나 테스트 절차의 집합으로 정의한다.[@istqb-glossary-test-suite-2026]

![[diagrams/test-suite-procedure-case-nesting.svg]]

## 테스트 데이터와 testware

**테스트 데이터**(test data)는 테스트를 실행하는 데 필요한 데이터로, 테스트 케이스를 실행할 때의 입력 요구를 채우려고 만들거나 고른다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-test-data-2026] ISO/IEC/IEEE 29119-1:2022는 테스트 데이터가 배열이나 flat file처럼 테스트 항목 안에 있을 수도 있고, 다른 시스템, 하드웨어 장치, 사람 운영자 같은 바깥에서 올 수도 있다고 둔다.[@iso-iec-ieee-29119-1-obp-2022]

**Testware**는 테스트를 계획하고 설계하고 실행하는 데 필요해서 테스트 프로세스에서 만드는 산출물이다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-testware-2026] ISO/IEC/IEEE 29119-1:2022는 testware에 문서, 스크립트, 입력, 기대 결과, 파일, 데이터베이스, 환경, 테스트에 쓰는 추가 소프트웨어와 유틸리티가 들 수 있다고 둔다.[@iso-iec-ieee-29119-1-obp-2022]

## 판정과 테스트 오라클

테스트를 실행하면 실제 결과를 기대 결과와 견주어, 맞으면 pass, 어긋나면 fail로 판정한다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-passed-2026][@istqb-glossary-failed-2026] fail의 원인 분석과 결함의 처리는 [[defect-management|결함 관리]]에서 다룬다.

**테스트 오라클**(test oracle)도 출처마다 정의가 다르다. ISTQB 용어집은 테스트 오라클을 기대 결과를 정하는 근거가 되는 출처로 정의한다.[@istqb-glossary-test-oracle-2026] ISO/IEC/IEEE 29119-1:2022는 테스트 오라클을 테스트의 pass와 fail을 가리는 정보의 출처로 정의한다. 오라클은 흔히 기대 결과를 끌어내는 명세이지만, 비슷한 다른 프로그램이나 시스템의 실제 결과와 견주거나 사람 전문가에게 묻는 것도 오라클이 될 수 있다고 둔다.[@iso-iec-ieee-29119-1-obp-2022]

## 테스트 케이스를 일찍 쓰기

CTFL 강의계획서는 코드를 쓰기 전에 테스트 케이스를 쓰는 것과 테스터의 관점에서 명세를 리뷰하는 것을 shift left의 좋은 관행으로 든다.[@istqb-ctfl-syllabus-2024] 테스트 설계를 개발 단계와 짝지어 앞당기는 일은 [[v-model#테스트 설계를 앞당김|V 모델]]에서 다룬다.

같은 강의계획서에 따르면 테스트 분석에서는 [[v-model|테스트 기준]]과 테스트 대상도 평가해, 그 안의 결함을 찾고 테스트할 수 있게 쓰였는지(testability) 따진다. 테스터의 관점으로 명세를 리뷰하면 모호함, 빠진 것, 서로 맞지 않는 것 같은 결함을 흔히 찾는다.[@istqb-ctfl-syllabus-2024]
