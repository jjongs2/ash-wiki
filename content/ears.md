---
title: EARS
tags:
  - process/sw-process
aliases:
  - Easy Approach to Requirements Syntax
verified: 2026-10-02
---

**EARS**(Easy Approach to Requirements Syntax)는 글로 쓰는 요구사항을 적은 수의 정해진 패턴에 맞춰 쓰게 해 가볍게 제약하는 요구사항 표기법이다. 몇 개의 키워드(While, When, Where, If–Then)가 요구사항 문장의 각 절을 나타낸다. EARS는 제약 없는 자연어 요구사항에 정해진 문법과 그 밑에 깔린 규칙을 더한다.[@mavin-ears-guide-2026]

## 개발과 발표

Alistair Mavin과 Rolls-Royce의 동료들은 제트 엔진 제어 시스템의 감항 규정을 분석해 요구사항을 뽑아내다가 EARS를 만들었다.[@mavin-ears-guide-2026][@mavin-ears-2009] Mavin 외는 모호함, 복잡함, 막연함을 비롯해 자연어 요구사항에 흔한 문제 여덟 가지를 다루려고 EARS의 구조 규칙을 만들었고, 2009년 제17회 IEEE 국제 요구 공학 학회(RE'09)에서 논문 "Easy Approach to Requirements Syntax (EARS)"로 발표했다.[@mavin-ears-2009]

Mavin과 Wilkinson은 2010년 논문에서 EARS 템플릿을 서로 다른 요구사항 문서 여러 벌에 적용했고, 그 과정에서 템플릿을 다듬었다.[@mavin-big-ears-2010]

## 문장 구조

EARS 요구사항의 절은 늘 같은 순서로 쓴다. 일반 꼴은 "While <선택적인 전제 조건>, when <선택적인 트리거>, the <시스템 이름> shall <시스템 응답>"이다. 요구사항 하나에는 전제 조건이 0개 이상, 트리거가 0개나 1개, 시스템 이름이 1개, 시스템 응답이 1개 이상 있다.[@mavin-ears-guide-2026]

![[diagrams/ears-clause-order.svg]]

## 패턴

EARS의 패턴은 다음과 같다.[@mavin-ears-guide-2026]

| 패턴               | 키워드  | 적용되는 때                          | 꼴                                                                         |
| ------------------ | ------- | ------------------------------------ | -------------------------------------------------------------------------- |
| Ubiquitous         | 없음    | 늘                                   | The <시스템 이름> shall <시스템 응답>                                      |
| Event-driven       | When    | 트리거가 되는 사건이 일어났을 때     | When <트리거>, the <시스템 이름> shall <시스템 응답>                       |
| State-driven       | While   | 지정한 상태가 참인 동안              | While <전제 조건>, the <시스템 이름> shall <시스템 응답>                   |
| Unwanted behaviour | If–Then | 원하지 않는 상황에서                 | If <트리거>, then the <시스템 이름> shall <시스템 응답>                    |
| Optional feature   | Where   | 지정한 기능을 갖춘 제품이나 시스템에 | Where <기능이 있음>, the <시스템 이름> shall <시스템 응답>                 |
| Complex            | 둘 이상 | 위 조건이 겹칠 때                    | While <전제 조건>, when <트리거>, the <시스템 이름> shall <시스템 응답> 등 |

원하지 않는 동작을 다루는 Complex 요구사항에는 If–Then도 든다.[@mavin-ears-guide-2026]

요구사항 표기의 정형도는 [[software-requirements-specification#표기의 정형도|SRS]]에서 다룬다.
