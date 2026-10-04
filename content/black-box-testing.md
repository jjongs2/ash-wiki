---
title: 블랙박스 테스트
aliases:
  - 명세 기반 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

**블랙박스 테스트**(black-box testing)는 구현(소스 코드)이 아니라 명세, 곧 테스트 대상의 외부 입력과 출력을 바탕으로 하는 테스트다. 명세 기반 테스트(specification-based testing)라고도 부른다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-glossary-black-box-testing-2026] ISTQB 용어집은 명세에 근거한 테스트 기법을 블랙박스 테스트 기법(black-box test technique)이라 부르고, 명세 기반 테스트 기법(specification-based test technique)을 같은 뜻의 이름으로 둔다.[@istqb-glossary-black-box-test-technique-2026]

ISTQB CTFL 강의계획서는 테스트 기법을 블랙박스, [[white-box-testing|화이트박스]], 경험 기반의 세 갈래로 나눈다. 이 강의계획서에 따르면 블랙박스 기법은 명세된 동작을 분석해 테스트를 만들므로 케이스가 구현과 독립이고, 구현이 바뀌어도 요구 동작이 그대로면 케이스를 계속 쓸 수 있다.[@istqb-ctfl-syllabus-2024]

## 테스트 기준

ISO/IEC/IEEE 29119-1:2022는 테스트 기준(test basis)을 테스트 케이스를 설계하고 구현할 때 바탕으로 삼는 정보로 정의한다. 테스트 기준은 [[software-requirements-specification|요구사항 명세]], 설계 명세, 모듈 명세 같은 문서일 수도 있고, 문서로 남지 않은 요구 동작의 이해일 수도 있다.[@iso-iec-ieee-29119-1-obp-2022]

## 요구사항 기반 테스트

**요구사항 기반 테스트**(requirements-based testing)는 원자 요구사항(atomic requirement)을 바탕으로 테스트를 설계하는 블랙박스 기법이다.[@iso-iec-ieee-29119-4-obp-2021][@istqb-glossary-requirements-based-testing-2026]

## 기법

ISTQB CTFL 강의계획서는 흔히 쓰는 블랙박스 기법으로 다음 넷을 든다.[@istqb-ctfl-syllabus-2024]

- [[equivalence-partitioning|동치 분할]]
- [[boundary-value-analysis|경계값 분석]]
- 결정 테이블 테스트
- 상태 전이 테스트[@istqb-ctfl-syllabus-2024]

![[diagrams/ctfl-test-technique-categories.svg]]

매개변수 값의 조합을 실행하는 조합 테스트 기법도 명세 기반 기법이고, [[pairwise-testing|페어와이즈 테스트]]가 그 예다.[@iso-iec-ieee-29119-4-obp-2021] ISTQB 용어집은 유스케이스 테스트도 블랙박스 기법으로 둔다.[@istqb-glossary-use-case-testing-2026]
