---
title: 결함 주입
tags:
  - sw-engineering/sw-testing
verified: 2026-10-03
---

**결함 주입**(fault injection)은 결함 자체를 넣거나 결함이 낳을 오류 같은 불리한 조건을 일부러 만들어, 컴포넌트나 시스템이 어떻게 반응하는지 평가하는 기법이다.[@iso-26262-1-obp-2018][@istqb-glossary-fault-injection-2026] [[iso-26262|ISO 26262]]-1:2018은 결함 주입을 [[safety-element-out-of-context#요소와 안전 관련 요소|요소]] 안에서 결함이 미치는 영향을 평가하려고 [[fault-error-failure|fault, error, failure]]를 넣고 관측점에서 반응을 살피는 방법으로 정의한다.[@iso-26262-1-obp-2018] ISTQB 용어집은 결함 주입을 불리한 조건을 만들어 컴포넌트나 시스템이 그 조건을 검출하고 믿을 만하게 동작하는지 평가하는 기법으로 정의하고, fault insertion을 동의어로 둔다.[@istqb-glossary-fault-injection-2026]

## 목적

ISO 26262-1:2018은 결함 주입의 예로 다음을 든다.[@iso-26262-1-obp-2018]

- [[hardware-architectural-metrics#Fault와 failure의 종류|잠재 결함]]을 검출하는 전략의 하나로, 운용 중에 결함을 넣어 [[safety-mechanism|안전 메커니즘]]이 제대로 동작하는지 검증하는 것
- [[integration-testing|통합 테스트]]에서 하드웨어 디버그 포트나 전용 소프트웨어 명령으로 결함을 넣어 하드웨어와 소프트웨어 사이의 인터페이스(HSI, hardware-software interface)를 테스트하는 것
- 하드웨어 부품 수준에서 stuck-at 결함이나 일시 결함을 흉내 내 안전 메커니즘의 [[hardware-architectural-metrics#진단 커버리지와 failure rate|진단 커버리지]]를 검증하는 것[@iso-26262-1-obp-2018]

오류 처리 같은 프로그래밍 기법은 시스템이 내부와 외부의 결함에 견고하고 안전하게 반응하게 하려고 쓰고, 결함 주입 테스트는 결함 같은 불리한 조건에 컴포넌트나 시스템이 어떻게 반응하는지 평가한다.[@istqb-ct-aut-syllabus-2025]

## 하드웨어 결함 주입과 소프트웨어 결함 주입

결함 주입 기법의 주된 갈래로 하드웨어로 구현하는 하드웨어 결함 주입과 소프트웨어로 구현하는 소프트웨어 결함 주입이 있다.[@hsueh-fault-injection-1997][@ziade-fault-injection-2004]

**하드웨어 결함 주입**은 따로 만든 하드웨어로 대상 시스템의 하드웨어에 결함을 넣는다.[@ziade-fault-injection-2004] 하드웨어 결함 주입은 접촉식과 비접촉식으로 나뉜다. 접촉식은 주입기가 대상에 직접 닿아 핀 수준의 능동 탐침이나 소켓 삽입으로 칩 밖에서 전압이나 전류를 바꾸고, 비접촉식은 중이온 방사나 전자기 간섭 같은 외부 현상으로 칩 안에 의도하지 않은 전류를 일으킨다.[@ziade-fault-injection-2004]

**소프트웨어 결함 주입**은 대상에서 실행되는 소프트웨어를 고쳐 시스템 상태를 바꿀 수 있게 하는 방식이다. 하드웨어 결함이 낳았을 오류를 소프트웨어 수준에서 재현하는 것을 목표로 하고, 숨은 소프트웨어 버그가 낳는 결과를 평가하는 데도 쓸 수 있다.[@ziade-fault-injection-2004] 하드웨어 결함 주입은 소프트웨어로 닿지 않는 칩 핀과 내부 부품에도 결함을 넣을 수 있고, 소프트웨어 결함 주입은 메모리나 레지스터처럼 소프트웨어 상태 수준의 변화를 바로 만들기에 편하다.[@hsueh-fault-injection-1997]

## 컴파일 시간 주입과 실행 시간 주입

소프트웨어 결함 주입은 결함을 넣는 때에 따라 컴파일 시간 주입과 실행 시간 주입으로 나뉜다.[@ziade-fault-injection-2004]

- **컴파일 시간 주입**: 프로그램 이미지를 적재해 실행하기 전에 대상 프로그램의 소스 코드나 어셈블리 코드를 고쳐, 하드웨어 결함, 소프트웨어 결함, 일시 결함의 효과를 흉내 내는 오류를 넣는다. 시스템이 고친 이미지를 실행할 때 결함이 활성화된다.
- **실행 시간 주입**: 실행 중에 결함 주입을 일으킬 방아쇠가 필요하며, 흔히 타임아웃, 예외나 트랩, 코드 삽입을 쓴다.[@ziade-fault-injection-2004]

![[diagrams/fault-injection-techniques.svg]]

## 주입 대상과 방식

결함 주입 테스트에서 테스터는 외부 컴포넌트(예: 센서의 그럴듯하지 않은 값을 검출하는지), 인터페이스(예: 단락이나 메시지 손실), 애플리케이션 내부에 결함을 골라 넣을 수 있다. 결함을 넣는 방식은 시스템과 테스트 환경에 따라 다르다. 고전적 결함 주입은 물리적 시험 대상을 조작하고, 외부와 인터페이스의 결함은 [[x-in-the-loop#HiL|HiL]] 환경에서 FIU(fault insertion unit)로 실행 중에 흉내 내며, 소프트웨어 결함은 [[x-in-the-loop#SiL|SiL]] 환경이나 개발 환경에서 디버거나 XCP(Universal Measurement and Calibration Protocol) 같은 도구로 흉내 내는 일이 많다.[@istqb-ct-aut-syllabus-2025]

## Fault seeding

**Fault seeding**은 결함을 검출해 없애는 비율을 지켜보고 남은 결함 수를 추정하려고, 컴포넌트나 시스템에 결함을 일부러 넣는 과정이다.[@ieee-sevocab-error-seeding-2026][@istqb-glossary-fault-seeding-2026] ISO/IEC/IEEE 24765 용어집은 이 과정을 프로그램에 이미 있는 결함에 알려진 결함을 더하는 error seeding으로 정의하고, bug seeding과 fault seeding을 동의어로 둔다.[@ieee-sevocab-error-seeding-2026]

SWEBOK V4.0a는 테스트 전에 인공 결함을 테스트 대상에 넣고 테스트 스위트를 실행하는 방법을 fault injection이라 부르고, 이론상으로는 그때 드러난 인공 결함의 종류와 수로 테스트의 효과를 평가하고 남은 실제 결함 수를 추정할 수 있다고 본다.[@ieee-swebok-v4-0a-2026] 변이체로 테스트 스위트를 평가하는 방법은 [[mutation-testing|변이 테스트]]에서 다룬다.
