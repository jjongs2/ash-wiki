---
title: Fault, error, failure
tags:
  - sw-engineering/functional-safety
verified: 2026-10-02
---

**Fault**, **error**, **failure**는 시스템이 잘못 동작하기까지의 원인과 결과를 나누는 용어다. [[iso-26262|ISO 26262]]-1:2018은 fault를 요소나 [[safety-lifecycle#ISO 26262의 안전 생명주기|아이템]]이 고장 날 수 있게 하는 비정상 조건으로, error를 계산·관측·측정한 값이나 조건이 참값, 명세값, 이론적으로 맞는 값이나 조건과 어긋나는 것으로 정의한다. Failure는 fault가 드러나 요소나 아이템의 의도된 거동이 끝나는 것이고, 이 종료는 영구적일 수도 일시적일 수도 있다.[@iso-26262-1-obp-2018] Avizienis 외(2004)는 셋을 dependability와 security를 위협하는 것으로 묶고, fault가 error를 낳고 error가 failure로 이어지는 인과 사슬로 잇는다.[@avizienis-dependable-secure-computing-2004]

## 정의

IEC 60050은 failure를 요구대로 수행하는 능력을 잃는 것으로 정의하고, 아이템의 failure는 그 아이템의 fault를 낳는 사건이라고 덧붙인다.[@iec-60050-192-03-01-2015] 이 표준은 fault를 내부 상태 때문에 요구대로 수행하지 못하는 상태로 정의한다.[@iec-60050-192-04-01-2015] error는 계산·관측·측정한 값이나 조건과 참값·명세값·이론값 사이의 어긋남으로 정의한다.[@iec-60050-192-03-02-2024]

Avizienis 외(2004)의 분류에서 failure는 시스템이 내놓는 서비스가 올바른 서비스에서 벗어날 때 일어나는 사건이다. error는 시스템 전체 상태 가운데 이어지는 failure로 갈 수 있는 부분이고, fault는 error의 원인으로 판정되거나 가정된 것이다. Fault가 error를 만들면 active, 그렇지 않으면 dormant라 부른다.[@avizienis-dependable-secure-computing-2004]

## 사람의 실수와 전파

IEC 60050은 사람이 한 행동이나 하지 않은 행동이 의도했거나 요구된 행동과 어긋나는 것을 human error라 한다.[@iec-60050-192-03-14-2015] 이 표준은 아이템의 fault가 아이템 자신의 failure에서 생기거나, 명세, 설계, 제조, 정비 같은 생애주기 앞 단계의 결함에서 생긴다고 덧붙인다.[@iec-60050-192-04-01-2015]

Avizienis 외(2004)는 사람의 행동에서 비롯한 fault를 human-made fault라 부르고, 그 가운데 개발자나 운용자가 의도하지 않은 실수(mistake)에서 비롯한 것을 non-deliberate fault로 나눈다. 프로그래머의 실수는 작성한 소프트웨어에 dormant fault를 남길 수 있다.[@avizienis-dependable-secure-computing-2004]

Avizienis 외(2004)의 분류에서 dormant fault는 활성화되어야 error를 만들고, error는 전파되어 서비스 인터페이스에 닿아 서비스를 올바른 서비스에서 벗어나게 할 때 failure가 된다. 구성 요소의 failure는 그 구성 요소를 포함하는 시스템에 fault를 일으키고, 시스템의 failure는 그 시스템에게서 서비스를 받는 다른 시스템에 external fault가 된다. 이렇게 fault → error → failure → fault의 사슬이 이어지며, 사슬은 구성 요소나 시스템 사이의 상호작용, 구성 요소를 시스템으로 묶는 일, 시스템을 만들거나 고치는 일을 거쳐 이어질 수 있다. 같은 분류에서 활성화되지 않은 fault는 error를 만들지 않으며, 서비스 인터페이스까지 번지지 못한 error는 failure로 이어지지 않는다.[@avizienis-dependable-secure-computing-2004]

![[diagrams/fault-error-failure-chain.svg]]

## Dependability를 얻는 수단

Avizienis 외(2004)는 dependability와 security를 얻는 수단을 넷으로 나눈다.[@avizienis-dependable-secure-computing-2004]

- **Fault prevention**: fault가 생기거나 들어오는 것을 막는다.
- **Fault tolerance**: fault가 있어도 failure가 일어나지 않게 한다.
- **Fault removal**: fault의 수와 심각도를 줄인다.
- **Fault forecasting**: 현재 fault의 수, 앞으로 생길 fault, 그 결과를 추정한다.[@avizienis-dependable-secure-computing-2004]

같은 분류는 개발 중의 fault removal을 검증, 진단, 수정의 세 단계로 나누고, 검증에 [[static-analysis|정적 분석]] 같은 정적 검증과 테스트 같은 동적 검증을 넣는다.[@avizienis-dependable-secure-computing-2004] Fault tolerance는 [[fault-tolerance|결함 허용]]에서 다룬다.

## 테스트 용어와의 차이

ISTQB 용어집은 error를 defect를 낳는 사람의 행동으로 정의하고 mistake를 그 동의어로 둔다.[@istqb-glossary-error-2026] 같은 용어집은 요구사항이나 명세를 충족하지 못하거나 의도된 쓰임을 해치는 작업 산출물의 불완전하거나 모자란 점을 defect라 하고, bug, fault, flaw를 그 동의어로 둔다.[@istqb-glossary-defect-2026] 이 용어집은 failure를 구성 요소나 시스템이 실행 중에 정한 한계 안에서 요구사항을 충족하지 못하는 사건으로 정의한다.[@istqb-glossary-failure-2026]

그래서 ISTQB 용어집에서 error는 사람의 행동을 가리키고, ISO 26262-1:2018과 IEC 60050에서 error는 값이나 조건이 맞는 것과 어긋나는 것을 가리킨다.[@iso-26262-1-obp-2018][@iec-60050-192-03-02-2024][@istqb-glossary-error-2026]
