---
title: 화이트박스 테스트
aliases:
  - 구조 기반 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

**화이트박스 테스트**(white-box testing)는 테스트 대상의 구조를 살펴 테스트를 끌어내는 테스트다. 구조 기반 테스트(structure-based testing)라고도 부른다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-ctfl-syllabus-2024] ISTQB(International Software Testing Qualifications Board) 용어집은 구성 요소나 시스템의 내부 구조에 바탕을 둔 테스트 기법을 화이트박스 테스트 기법(white-box test technique)이라 부르고, 구조 기반 테스트 기법(structure-based test technique)을 같은 뜻의 이름으로 둔다.[@istqb-glossary-white-box-test-technique-2026]

테스트 기법은 명세 기반([[black-box-testing|블랙박스]]), 구조 기반(화이트박스), 경험 기반의 세 갈래로 나뉜다.[@istqb-ctfl-syllabus-2024][@iso-iec-ieee-29119-4-obp-2021] 화이트박스 테스트는 단위 테스트에 한하지 않고, 시스템 테스트를 포함한 모든 테스트 레벨에서 쓸 수 있다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-ctfl-syllabus-2024]

## 커버리지로 케이스 끌어내기

ISTQB CTFL(Certified Tester Foundation Level) 강의계획서에 따르면 화이트박스 테스트는 코드, 아키텍처, 작업 흐름, 데이터 흐름 같은 구현이나 내부 구조에서 테스트를 끌어낸다.[@istqb-ctfl-syllabus-2024]

구문 테스트는 실행 가능한 구문을, 분기 테스트는 제어 흐름의 분기를 커버리지 항목으로 삼는 구조 기반 기법이다.[@istqb-ctfl-syllabus-2024][@iso-iec-ieee-29119-4-obp-2021] CTFL 강의계획서에 따르면 두 기법은 코드에 관련된 화이트박스 기법이고, 받아들일 만한 커버리지에 이를 때까지 커버리지 항목을 실행하는 테스트 케이스를 설계하고, 화이트박스 커버리지 측정은 커버리지를 높일 추가 테스트를 만드는 데 필요한 정보를 준다.[@istqb-ctfl-syllabus-2024] 커버리지 기준의 종류는 [[test-coverage|테스트 커버리지]]에서 다룬다.

Watson과 McCabe는 [[basis-path-testing|기본 경로 테스트]]를 화이트박스 테스트 접근법에 넣었다.[@nist-sp-500-235-1996] 결정 안의 조건 하나가 결정의 결과에 독립적으로 영향을 줄 수 있음을 보이는 [[modified-condition-decision-coverage|MC/DC]] 테스트도 구조 기반 기법이다.[@iso-iec-ieee-29119-4-obp-2021]

## 블랙박스 테스트와의 차이

블랙박스 테스트는 명세에서, 화이트박스 테스트는 테스트 대상의 구조에서 테스트를 끌어낸다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-ctfl-syllabus-2024]

CTFL 강의계획서에 따르면 블랙박스 테스트만으로는 실제 코드 커버리지를 잴 수 없고, 화이트박스 커버리지 측정은 커버리지를 객관적으로 잰다. 거꾸로 소프트웨어가 요구사항을 구현하지 않았을 때, 화이트박스 테스트는 그 누락 결함을 찾지 못할 수 있다.[@istqb-ctfl-syllabus-2024]

Watson과 McCabe는 기본 경로 테스트를 요구사항 기반 블랙박스 테스트를 대신하지 않고 보완하는 기법으로 제시했다.[@nist-sp-500-235-1996]
