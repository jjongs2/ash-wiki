---
title: 화이트박스 테스트
aliases:
  - 구조 기반 테스트
tags:
  - sw-engineering/sw-testing
verified: 2026-10-03
---

**화이트박스 테스트**(white-box testing)는 테스트 대상의 구조를 살펴 테스트를 끌어내는 테스트다. 구조 기반 테스트(structure-based testing)라고도 부른다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-ctfl-syllabus-2024] 구성 요소나 시스템의 내부 구조에 바탕을 둔 테스트 기법을 **화이트박스 테스트 기법**(white-box test technique)이라 하고, 구조 기반 테스트 기법(structure-based test technique)이라고도 부른다.[@istqb-glossary-white-box-test-technique-2026]

[[software-testing#테스트 기법의 분류|테스트 기법]]은 명세 기반([[black-box-testing|블랙박스]]), 구조 기반(화이트박스), 경험 기반의 세 갈래로 나뉜다.[@istqb-ctfl-syllabus-2024][@iso-iec-ieee-29119-4-obp-2021] 화이트박스 테스트는 [[unit-testing|단위 테스트]]에 한하지 않고, [[system-testing|시스템 테스트]]를 포함한 모든 [[software-testing#테스트 레벨|테스트 레벨]]에서 쓸 수 있다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-ctfl-syllabus-2024]

## 커버리지로 케이스 끌어내기

화이트박스 테스트는 코드, 아키텍처, 작업 흐름, 데이터 흐름 같은 구현이나 내부 구조에서 테스트를 끌어낸다.[@istqb-ctfl-syllabus-2024]

구문 테스트는 실행 가능한 구문을, 분기 테스트는 제어 흐름의 분기를 커버리지 항목으로 삼는 구조 기반 기법이다.[@istqb-ctfl-syllabus-2024][@iso-iec-ieee-29119-4-obp-2021] 두 기법은 코드에 관련된 화이트박스 기법이고, 받아들일 만한 커버리지에 이를 때까지 커버리지 항목을 실행하는 [[test-case|테스트 케이스]]를 설계하고, 화이트박스 커버리지 측정은 커버리지를 높일 추가 테스트를 만드는 데 필요한 정보를 준다.[@istqb-ctfl-syllabus-2024] 커버리지 기준의 종류는 [[test-coverage#구조적 커버리지 기준|테스트 커버리지]]에서 다룬다.

안전이나 임무가 중요한 환경, 높은 무결성이 필요한 환경에서는 코드 커버리지를 더 철저히 이루려고 더 엄격한 화이트박스 기법을 쓰기도 한다. 화이트박스 기법은 코드의 dry run 같은 [[software-testing#정적 테스트와 동적 테스트|정적 테스트]]에도 쓸 수 있다. ISTQB CTFL v4.0.1 강의계획서에 따르면 화이트박스 기법은 아직 실행할 준비가 되지 않은 코드, 의사 코드, 제어 흐름 그래프로 모델링할 수 있는 상위 수준의 논리를 [[software-review|리뷰]]하는 데 잘 맞는다.[@istqb-ctfl-syllabus-2024]

Watson과 McCabe는 [[basis-path-testing|기본 경로 테스트]]를 화이트박스 테스트 접근법에 넣었다.[@nist-sp-500-235-1996] 결정 안의 조건 하나가 결정의 결과에 독립적으로 영향을 줄 수 있음을 보이는 [[modified-condition-decision-coverage|MC/DC]] 테스트도 구조 기반 기법이다.[@iso-iec-ieee-29119-4-obp-2021]

## 데이터 흐름 테스트

[[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-4:2021은 **데이터 흐름 테스트**(data flow testing)를, 정의-사용 쌍을 실행하는 데 바탕을 둔 구조 기반 테스트 케이스 설계 기법의 갈래로 정의한다. 이 표준이 정의하는 용어는 다음과 같다.[@iso-iec-ieee-29119-4-obp-2021]

| 용어                                          | 정의                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 데이터 정의(data definition)                  | 변수에 값을 대입하는 문장                                                                   |
| 데이터 사용(data use)                         | 변수의 값에 접근하는 실행 가능한 문장                                                       |
| 계산 데이터 사용(computation data use, c-use) | 어떤 종류의 문장에서든 변수의 값을 쓰는 것                                                  |
| 술어 데이터 사용(predicate data use, p-use)   | 결정문의 술어 부분이 정하는 결정 결과에 관련된 데이터 사용                                  |
| 정의-사용 쌍(definition-use pair)             | 데이터 정의와, 그 정의가 정한 값을 쓰는 뒤따르는 술어 데이터 사용이나 계산 데이터 사용의 쌍 |

![[diagrams/data-flow-definition-use-pair.svg]]

이 표준은 데이터 흐름 테스트의 예로 all-definitions 테스트, all-c-uses 테스트, all-p-uses 테스트, all-uses 테스트, all-du-paths 테스트를 든다.[@iso-iec-ieee-29119-4-obp-2021]

## 블랙박스 테스트와의 차이

블랙박스 테스트는 명세에서, 화이트박스 테스트는 테스트 대상의 구조에서 테스트를 끌어낸다.[@iso-iec-ieee-29119-1-obp-2022][@istqb-ctfl-syllabus-2024]

ISTQB CTFL v4.0.1 강의계획서에 따르면 블랙박스 테스트만으로는 실제 코드 커버리지를 잴 수 없고 화이트박스 커버리지 측정은 커버리지를 객관적으로 재지만, 거꾸로 소프트웨어가 요구사항을 구현하지 않았을 때 화이트박스 테스트는 그 누락 결함을 찾지 못할 수 있다.[@istqb-ctfl-syllabus-2024]

Watson과 McCabe는 화이트박스 테스트와 [[black-box-testing#요구사항 기반 테스트|요구사항 기반 테스트]]가 모두 효과적인 [[test-process|테스트 프로세스]]에 중요하다고 보았고, 기본 경로 테스트를 요구사항 기반 블랙박스 테스트를 대신하지 않고 보완하는 기법으로 제시했다.[@nist-sp-500-235-1996]
