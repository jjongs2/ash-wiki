---
title: 시스템 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

ISTQB 용어집은 **시스템 테스트**(system testing)를 시스템 전체가 명세된 요구사항을 만족하는지 검증하는 데 초점을 둔 [[software-testing#테스트 레벨|테스트 레벨]]로 정의한다.[@istqb-glossary-system-testing-2026] ISTQB CTFL 강의계획서에 따르면 시스템 테스트는 시스템이나 제품 전체의 동작과 능력에 초점을 두고, 끝에서 끝까지 이어지는 작업의 기능 테스트와 성능 효율, 사용성, 보안 같은 [[software-quality-model|품질 특성]]의 비기능 테스트를 흔히 포함한다. 시스템 명세에 바탕을 두며, 독립된 테스트 팀이 수행하기도 한다.[@istqb-ctfl-syllabus-2024]

## 테스트 환경

사용성 같은 일부 비기능 품질 특성은 완전한 시스템을 대표성 있는 테스트 환경에 두고 테스트하는 편이 낫고, 하위 시스템은 시뮬레이션으로 대신할 수도 있다.[@istqb-ctfl-syllabus-2024] 시뮬레이션을 쓰는 테스트 환경은 [[x-in-the-loop|X-in-the-loop]]에서 다룬다.

## ASPICE SWE.6과 SYS.5

[[automotive-spice|ASPICE]] 4.1은 통합한 소프트웨어의 검증과 시스템의 검증을 서로 다른 프로세스로 둔다.[@vda-automotive-spice-pam-4-1-2026]

- SWE.6 Software Verification: 통합한 소프트웨어가 소프트웨어 요구사항과 일관됨을 검증하는 것을 목적으로 한다.
- SYS.5 System Verification: 시스템이 시스템 요구사항과 일관됨을 검증하는 것을 목적으로 한다.[@vda-automotive-spice-pam-4-1-2026]

ASPICE 3.1은 SWE.6을 Software Qualification Test, SYS.5를 System Qualification Test라 불렀고, ASPICE 4.0이 두 이름을 지금의 Verification으로 바꾸었다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017][@vda-automotive-spice-pam-4-0-2023]

## 테스트 레벨의 대응

ISTQB CT-AuT 강의계획서는 CTFL의 시스템 테스트를 [[iso-26262|ISO 26262]]:2018의 임베디드 소프트웨어 테스트(6부 11절)와 ASPICE 4.0의 SWE.6에 대응시키고, SYS.5는 여러 이종 분산 시스템을 시험하는 system of systems testing에 대응시킨다. CT-AuT 강의계획서에 따르면 이렇게 대응하는 것은 CTFL 강의계획서가 system을 소프트웨어만 가리키는 말로 쓰기 때문이다.[@istqb-ct-aut-syllabus-2025]

## ISO 26262-6

ISO 26262-6:2018은 11절에서 임베디드 소프트웨어 테스트를 다룬다.[@iso-26262-6-obp-2018] 안전 확인(safety validation)은 [[safety-lifecycle|안전 생명주기]]에서 다룬다.
