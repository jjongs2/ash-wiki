---
title: 검증과 확인
tags:
  - process
aliases:
  - V&V
verified: 2026-10-02
---

IEEE 1012-2024는 **검증과 확인**(verification and validation, V&V)을, 한 활동의 개발 산출물이 그 활동의 요구사항에 맞는지와 제품이 의도한 용도와 사용자 요구를 만족하는지를 판단하는 프로세스로 다룬다.[@ieee-1012-2024]

## 정의

- **검증**(verification): ISO 9000:2026은 검증을 명시된 요구사항이 충족되었음을 객관적 증거로 확인하는 일로 정의한다.
- **확인**(validation): ISO 9000:2026은 확인을 특정한 의도된 용도나 응용에 대한 요구사항이 충족되었음을 객관적 증거로 확인하는 일로 정의한다.[@iso-9000-obp-2026]

Boehm은 1979년 글에서 검증을 "Am I building the product right?", 확인을 "Am I building the right product?"라는 물음으로 나타냈다.[@boehm-guidelines-verifying-validating-1979]

![[diagrams/verification-validation-references.svg]]

## 검증과 확인의 기준

IEEE 1012-2024는 검증을 한 개발 단계의 산출물이 그 단계를 시작할 때 부과된 조건을 만족하는지 평가하는 일로 정의한다. 명시된 요구사항에 맞아 검증을 통과한 시스템이라도 실제 사용자가 운용하기에는 맞지 않을 수 있다.[@ieee-sevocab-verification-2026]

Boehm은 요구사항 기준선에서 내려온 설계와 코드를 그 기준선에 맞추는 일을 검증으로, 요구사항 명세를 바꿔야 풀리는 문제를 찾는 일을 확인으로 보았다.[@boehm-guidelines-verifying-validating-1979]

## 정적 기법과 동적 기법

SWEBOK V4.0a에 따르면 V&V 작업은 정적, 동적, 형식 기법으로 나뉜다. 정적 기법은 소프트웨어를 실행하지 않고 산출물의 내용과 구조를 분석하며, 요구사항, 인터페이스 명세, 설계, 모델처럼 실행하지 않는 산출물에도 쓴다. 코드 읽기, [[software-review#여러 이름|동료 리뷰]], 소스 코드 제어 흐름의 [[static-analysis|정적 분석]], 리뷰와 감사가 여기에 든다. 동적 기법은 소프트웨어 코드를 실행하거나 시뮬레이션하며, 대개 테스트 기법이다.[@ieee-swebok-v4-0a-2026]

개발 단계와 테스트 단계의 대응은 [[v-model|V 모델]]에서 다룬다.

## IEEE 1012

IEEE 1012-2024는 시스템, 소프트웨어, 하드웨어와 그 인터페이스의 V&V 프로세스를 다루는 프로세스 표준이다. V&V 프로세스, 활동, 작업의 공통 틀을 세우고, 생명주기 프로세스마다 V&V 작업과 필요한 입력과 출력을 정하며, 네 단계 무결성 수준마다 최소 V&V 작업을 정한다.[@ieee-1012-2024] 개발 조직과 기술, 관리, 재정 면에서 독립된 조직이 하는 V&V는 독립 V&V(IV&V, independent verification and validation)로 정의한다.[@ieee-sevocab-verification-2026]
