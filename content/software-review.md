---
title: 소프트웨어 리뷰
tags:
  - process/sw-testing
aliases:
  - 리뷰
verified: 2026-10-03
---

**소프트웨어 리뷰**(software review)는 사람이 작업 산출물이나 프로세스를 살펴 평가하거나 의견을 내는 활동이다.[@istqb-glossary-review-2026][@ieee-cs-sevocab-2026] ISTQB 용어집은 리뷰를 사람이 작업 산출물이나 프로세스의 품질을 평가하는 [[software-testing#정적 테스트와 동적 테스트|정적 테스트]]의 한 유형으로 정의한다.[@istqb-glossary-review-2026] ISO/IEC/IEEE 24765 용어집은 리뷰를 작업 산출물을 프로젝트 인원, 관리자, 사용자, 고객 같은 이해관계자에게 보여 의견이나 승인을 받는 프로세스나 회의로 정의한다.[@ieee-cs-sevocab-2026]

정적 기법과 동적 기법의 구분은 [[verification-and-validation#정적 기법과 동적 기법|검증과 확인]]에서 다룬다. ISTQB CTFL 강의계획서에 따르면 사람이 읽고 이해할 수 있는 작업 산출물이면 무엇이든 리뷰할 수 있다. [[software-requirements-specification|요구사항 명세]], 소스 코드, [[test-process#테스트 계획서|테스트 계획]], [[test-case|테스트 케이스]], 모델이 그 예다.[@istqb-ctfl-syllabus-2024]

## 리뷰 유형

이 강의계획서는 리뷰 유형이 비공식부터 공식까지 걸쳐 있다고 보고, 흔히 쓰는 유형으로 다음 넷을 든다.[@istqb-ctfl-syllabus-2024]

| 유형                                          | 진행                                                              | 목적                                                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 비공식 리뷰(informal review)                  | 정해진 절차를 따르지 않고, 공식 문서로 된 결과를 요구하지 않는다. | 이상 찾기                                                                                            |
| 워크스루(walkthrough)                         | 저자가 이끈다.                                                    | 품질 평가와 신뢰 쌓기, 리뷰어 교육, 합의, 새 아이디어, 저자의 동기 부여와 개선, 이상 찾기            |
| 기술 리뷰(technical review)                   | 기술 역량을 갖춘 리뷰어가 하고, 진행자가 이끈다.                  | 기술 문제에 대한 합의와 결정, 이상 찾기, 품질 평가와 신뢰 쌓기, 새 아이디어, 저자의 동기 부여와 개선 |
| [[software-inspection\|인스펙션]](inspection) | 가장 공식적인 유형으로, 일반 리뷰 절차를 빠짐없이 따른다.         | 이상을 최대한 많이 찾기                                                                              |

인스펙션의 절차와 역할은 [[software-inspection#Fagan 인스펙션|소프트웨어 인스펙션]]에서 다룬다. [[ieee-1028|IEEE 1028-2008]]은 경영 리뷰, 기술 리뷰, 인스펙션, 워크스루, 감사의 수행 절차를 정한다.[@ieee-1028-2008] 감사는 [[software-quality#평가, 감사, 검증|소프트웨어 품질]]에서 다룬다.

## 리뷰 절차

ISTQB CTFL 강의계획서는 ISO/IEC 20246의 일반 리뷰 절차를 따라 리뷰 활동을 다섯으로 나눈다.[@istqb-ctfl-syllabus-2024]

1. 계획: 리뷰의 목적, 범위, 대상 산출물, 평가할 [[software-quality-model|품질 특성]], [[test-process#진입 기준과 종료 기준|종료 기준]] 등을 정한다.
2. 리뷰 시작: 참여자가 산출물에 접근할 수 있고 자기 역할을 이해하게 한다.
3. 개별 리뷰: 리뷰어가 각자 산출물을 살펴 이상, 권고, 질문을 찾아 기록한다.
4. 소통과 분석: 찾은 이상마다 상태, 담당자, 조치를 정한다.
5. 수정과 보고: 결함마다 [[defect-management#결함 보고서와 사건 보고서|결함 보고서]]를 만들고, 종료 기준을 만족하면 산출물을 받아들인다.[@istqb-ctfl-syllabus-2024]

같은 강의계획서는 리뷰의 주요 역할로 관리자, 저자, 진행자(moderator, facilitator라고도 함), 기록자(scribe, recorder라고도 함), 리뷰어, 리뷰 리더를 든다.[@istqb-ctfl-syllabus-2024]

ISTQB 용어집은 체크리스트 기반 리뷰(checklist-based reviewing)를 질문이나 갖춰야 할 속성의 목록에 따라 하는 리뷰 기법으로 정의한다.[@istqb-glossary-checklist-based-reviewing-2026] ISTQB CTAL-TA(Certified Tester Advanced Level Test Analyst) 강의계획서에 따르면 체크리스트 기반 리뷰의 체크리스트는 앞서 놓친 결함을 반영해 주기적으로 고쳐야 한다.[@istqb-ctal-ta-syllabus-2025]

## 리뷰 속도와 효과

Kemerer와 Paulk는 2009년 논문에서 PSP(Personal Software Process) 과정의 개인 리뷰 데이터(C 프로그램 371개, C++ 프로그램 246개)를 분석했다. 리뷰어가 개발자 자신 한 사람인 이 데이터에서, 설계 리뷰와 코드 리뷰의 속도가 권장 상한인 시간당 200 LOC(lines of code)를 넘으면 결함 제거 효과가 떨어졌다. 200 LOC 이하에서는 설계 리뷰가 결함의 약 3분의 2를, 코드 리뷰가 절반 넘게 찾았다.[@kemerer-design-code-reviews-2009]

![[diagrams/review-rate-200-loc-per-hour.svg]]

## 여러 이름

- **동료 리뷰**(peer review): 그 산출물을 만들 역량을 갖춘 다른 사람이 하는 리뷰[@ieee-cs-sevocab-2026][@istqb-glossary-peer-review-2026]
- **경영 리뷰**(management review): ISO/IEC/IEEE 24765 용어집은 소프트웨어 획득, 공급, 개발, 운용, 유지보수 프로세스를 관리자가 하거나 관리자를 대신해 하는 체계적 평가로 정의한다.
- **데스크 체크**(desk checking): 이 용어집은 코드 목록, 테스트 결과 같은 문서를 대개 그것을 만든 사람이 눈으로 살펴 오류나 개발 표준 위반 같은 문제를 찾는 [[static-analysis|정적 분석]] 기법으로 정의한다.
- **페어 프로그래밍**(pair programming): 이 용어집은 한 개발자가 코드를 쓰는 동안 다른 개발자가 지켜보며 오류를 찾고 결과가 요구사항을 만족하는지 확인하는 관행으로 정의하고, 두 사람은 주기적으로 역할을 바꾼다고 적는다.[@ieee-cs-sevocab-2026] Kent Beck은 1999년 『Extreme Programming Explained: Embrace Change』에서 모든 소프트웨어를 두 프로그래머가 한 화면 앞에서 짝을 지어 만드는 것을 XP(Extreme Programming)의 기본으로 들었다.[@beck-extreme-programming-explained-1999]
