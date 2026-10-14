---
title: 단위 테스트
tags:
  - process/sw-testing
aliases:
  - 컴포넌트 테스트
verified: 2026-10-03
---

**단위 테스트**(unit testing)는 소프트웨어의 개별 부분을 하나씩 따로 시험하는 테스트다.[@istqb-glossary-unit-testing-2026][@ieee-cs-sevocab-2026] ISTQB 용어집은 단위 테스트를 따로 떼어 시험할 수 있는 가장 작은 코드 부분을 평가하는 데 초점을 둔 [[software-testing#테스트 레벨|테스트 레벨]]로 정의한다.[@istqb-glossary-unit-testing-2026]

## 컴포넌트 테스트

**컴포넌트 테스트**(component testing)는 개별 하드웨어나 소프트웨어 컴포넌트를 시험하는 데 초점을 둔다.[@ieee-cs-sevocab-2026][@istqb-glossary-component-testing-2026] ISTQB CTFL v4.0.1 강의계획서는 컴포넌트 테스트를 단위 테스트라고도 부른다.[@istqb-ctfl-syllabus-2024] ISTQB 용어집은 두 용어를 정의가 다른 별개의 항목으로 두고, 컴포넌트 테스트의 동의어로는 module testing만 둔다.[@istqb-glossary-unit-testing-2026][@istqb-glossary-component-testing-2026]

## 대상과 수행 주체

컴포넌트 테스트는 컴포넌트를 따로 떼어 시험하며, 보통 개발자가 자기 개발 환경에서 수행한다.[@istqb-ctfl-syllabus-2024] 따로 떼어 실행하는 데 쓰는 드라이버와 스텁은 [[test-harness#드라이버와 스텁|테스트 하네스]]에서 다룬다.

## ASPICE SWE.4

[[automotive-spice|ASPICE]] 4.1의 SWE.4 Software Unit Verification은 소프트웨어 유닛이 [[software-unit-design|소프트웨어 상세 설계]]와 일관됨을 검증하는 것을 목적으로 한다. 이 모델은 유닛 검증 수단의 예로 단위 테스트뿐 아니라 [[static-analysis|정적 분석]]과 [[software-review|코드 리뷰]]도 든다. SWE.4.BP1의 Note 2는 정적 분석의 바탕이 될 수 있는 [[coding-standard|코딩 표준]]으로 MISRA 규칙 집합을 예로 든다.[@vda-automotive-spice-pam-4-1-2026] 프로세스 이름은 ASPICE 3.1과 같다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017] 유닛의 정의는 [[automotive-spice-process-reference-model#Element, component, unit|ASPICE 프로세스 참조 모델]]에서 다룬다.

## ISO 26262-6

[[iso-26262|ISO 26262]]-6:2018은 9절에서 소프트웨어 유닛 검증을 다룬다. 이 표준은 표 7에 소프트웨어 유닛 검증 방법(Methods for software unit verification)을, 표 8에 소프트웨어 유닛 수준 테스트의 [[test-case|테스트 케이스]]를 끌어내는 방법(Methods for deriving test cases for software unit testing)을 둔다.[@iso-26262-6-obp-2018]

ISTQB CT-AuT v2.1.1 강의계획서는 unit의 뜻으로 본 CTFL의 컴포넌트 테스트를 ISO 26262-6의 9절과 ASPICE의 SWE.4에 대응시킨다.[@istqb-ct-aut-syllabus-2025] 대응 전체는 [[system-testing#테스트 레벨의 대응|시스템 테스트]]에서 다룬다.
