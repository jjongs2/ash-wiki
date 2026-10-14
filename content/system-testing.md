---
title: 시스템 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

ISTQB 용어집은 **시스템 테스트**(system testing)를 시스템 전체가 명세된 요구사항을 만족하는지 검증하는 데 초점을 둔 [[software-testing#테스트 레벨|테스트 레벨]]로 정의한다.[@istqb-glossary-system-testing-2026] ISTQB CTFL v4.0.1 강의계획서는 시스템 테스트를 시스템이나 제품 전체의 동작과 능력에 초점을 둔 테스트 레벨로 정의한다. 시스템 테스트는 끝에서 끝까지 이어지는 작업의 기능 테스트와 성능 효율, 사용성, 보안 같은 [[software-quality-model|품질 특성]]의 [[test-type#비기능 테스트|비기능 테스트]]를 흔히 포함하고, 시스템 명세에 바탕을 두며, 독립된 테스트 팀이 수행하기도 한다.[@istqb-ctfl-syllabus-2024]

## 테스트 환경

ISTQB CTFL v4.0.1 강의계획서에 따르면 사용성 같은 일부 비기능 품질 특성은 완전한 시스템을 대표성 있는 테스트 환경에 두고 테스트하는 편이 낫다. 하위 시스템은 시뮬레이션으로 대신할 수도 있다.[@istqb-ctfl-syllabus-2024] 시뮬레이션을 쓰는 테스트 환경은 [[x-in-the-loop|X-in-the-loop]]에서 다룬다.

## ASPICE SWE.6과 SYS.5

[[automotive-spice|ASPICE]] 4.1은 통합한 소프트웨어의 검증과 시스템의 검증을 서로 다른 프로세스로 둔다.[@vda-automotive-spice-pam-4-1-2026]

- SWE.6 Software Verification: 통합한 소프트웨어가 소프트웨어 요구사항과 일관됨을 검증하는 것을 목적으로 한다.
- SYS.5 System Verification: 시스템이 시스템 요구사항과 일관됨을 검증하는 것을 목적으로 한다.[@vda-automotive-spice-pam-4-1-2026]

SWE.6.BP1의 Note 1은 검증 수단의 기법을 고르는 일이 소프트웨어 요구사항의 내용에 달릴 수 있다고 제시하고, 데이터 범위를 다루는 요구사항의 [[boundary-value-analysis|경계값]]과 [[equivalence-partitioning|동치 클래스]], 정상 경로 테스트와 [[fault-injection|결함 주입]] 같은 부정 테스트를 예로 든다. 기법 선택이 요구사항 기반 테스트와 지식이나 경험에 기댄 [[error-guessing|오류 추정]] 가운데 어느 쪽을 쓰는지에도 달릴 수 있다는 것도 제시한다. SYS.5.BP1의 Note 1은 시스템 검증 수단이 다룰 수 있는 측면으로 열, 환경, 견고성·수명, EMC(Electromagnetic Compatibility)를 예로 든다.[@vda-automotive-spice-pam-4-1-2026][@iec-60050-161-01-07-2018]

ASPICE 3.1은 SWE.6을 Software Qualification Test, SYS.5를 System Qualification Test라 불렀고, ASPICE 4.0이 두 이름을 지금의 Verification으로 바꾸었다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017][@vda-automotive-spice-pam-4-0-2023]

## 테스트 레벨의 대응

ISTQB CT-AuT v2.1.1 강의계획서는 CTFL 강의계획서가 system을 소프트웨어만 가리키는 말로 쓰므로, CTFL의 시스템 테스트를 [[iso-26262|ISO 26262]]:2018의 임베디드 소프트웨어 테스트(6부 11절)와 ASPICE 4.0의 SWE.6에 대응시키고, SYS.5는 여러 이종 분산 시스템을 시험하는 system of systems testing에 대응시킨다.[@istqb-ct-aut-syllabus-2025]

ISTQB CT-AuT v2.1.1 강의계획서는 테스트 레벨 전체를 다음과 같이 대응시킨다. 괄호 안은 ISO 26262:2018의 부와 절이다.[@istqb-ct-aut-syllabus-2025]

| ISTQB 테스트 레벨                                                       | ISO 26262:2018                               | ASPICE |
| ----------------------------------------------------------------------- | -------------------------------------------- | ------ |
| [[acceptance-testing\|인수 테스트]]                                     | safety validation(4-8)                       | VAL.1  |
| system of systems testing                                               | system and item integration and testing(4-7) | SYS.5  |
| [[integration-testing#컴포넌트 통합과 시스템 통합\|시스템 통합 테스트]] | system and item integration and testing(4-7) | SYS.4  |
| 시스템 테스트                                                           | testing of the embedded software(6-11)       | SWE.6  |
| 컴포넌트 통합 테스트                                                    | software integration and verification(6-10)  | SWE.5  |
| [[unit-testing#컴포넌트 테스트\|컴포넌트 테스트]]                       | software unit verification(6-9)              | SWE.4  |

ISTQB CT-AuT v2.1.1 강의계획서는 4-7을 system of systems testing과 시스템 통합 테스트에 함께 대응시키고, 인수 테스트에 대응하는 safety validation과 VAL.1은 ISTQB 인수 테스트의 일부만, 컴포넌트 통합 테스트에 대응하는 SWE.5와 6-10은 CTFL의 컴포넌트 테스트를 component의 뜻으로도, 컴포넌트 테스트에 대응하는 SWE.4와 6-9는 CTFL의 컴포넌트 테스트를 unit의 뜻으로 덮는다고 본다.[@istqb-ct-aut-syllabus-2025]

## ISO 26262-6

ISO 26262-6:2018은 11절에서 임베디드 소프트웨어 테스트를 다룬다. 이 표준은 표 14에 임베디드 소프트웨어 테스트 방법(Methods for tests of the embedded software)을, 표 15에 임베디드 소프트웨어 테스트의 [[test-case|테스트 케이스]]를 끌어내는 방법(Methods for deriving test cases for the test of the embedded software)을 둔다.[@iso-26262-6-obp-2018] 테스트 환경을 다루는 표 13은 [[x-in-the-loop#ISO 26262-6|X-in-the-loop]]에서 다룬다. 안전 확인(safety validation)은 [[acceptance-testing#ISO 26262의 safety validation|인수 테스트]]에서 다룬다.
