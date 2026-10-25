---
title: Freedom from interference
tags:
  - sw-engineering/functional-safety
aliases:
  - FFI
verified: 2026-10-02
---

[[iso-26262|ISO 26262]]-1:2018은 **FFI**(Freedom From Interference)를 둘 이상의 요소 사이에 [[safety-requirement|안전 요구사항]] 위반으로 이어질 수 있는 cascading failure가 없는 것으로 정의한다.[@iso-26262-1-obp-2018] Cascading failure는 [[safety-analysis#Dependent failure 분석|안전 분석]]에서 다룬다. ISO 26262-9:2018은 요소의 공존 기준(criteria for coexistence of elements)을 정한다.[@iso-26262-9-obp-2018]

ISO 26262-1:2018은 **partitioning**을 설계를 이루려고 기능이나 요소를 나누는 것으로 정의한다. 같은 정의의 주석은 partitioning을 [[fault-error-failure|fault]]를 가두어 cascading failure를 피하는 데 쓸 수 있고, 나뉜 설계 요소 사이의 FFI를 이루려고 비기능 요구사항을 더할 수 있다고 제시한다.[@iso-26262-1-obp-2018]

## AUTOSAR의 FFI 수단

[[autosar|AUTOSAR]] R25-11은 FFI를 돕는 기능 [[safety-mechanism|안전 메커니즘]]을 간섭의 측면에 따라 다음처럼 나눈다.[@autosar-cp-exp-functionalsafetymeasures-2025]

| 측면      | 메커니즘                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| 메모리    | memory partitioning                                                                                                      |
| 타이밍    | [[safety-mechanism#오류 검출 기법\|Watchdog Manager]]의 시간 감시, [[autosar-timing-protection\|OS의 timing protection]] |
| 실행      | Watchdog Manager의 [[safety-mechanism#오류 검출 기법\|logical supervision]]                                              |
| 정보 교환 | [[autosar-e2e-protection\|E2E 보호]]                                                                                     |

이 메커니즘들은 안전 관련 시스템의 개발을 돕는 것이므로 소프트웨어든 하드웨어든 그 자체가 안전 관련이고, 그에 맞게 개발하고 통합해야 한다.[@autosar-cp-exp-functionalsafetymeasures-2025]

E2E 보호는 정보의 반복, 손실, 지연, 삽입, 위장, 잘못된 주소 지정, 잘못된 순서, 손상, 수신자마다 다른 정보, 일부 수신자만 받는 정보, 통신 채널 접근 막힘을 통신 결함으로 고려한다.[@autosar-cp-exp-functionalsafetymeasures-2025]

## Memory partitioning

Memory partitioning은 [[autosar-os-application|OS-Application]]들을 서로 보호되는 다른 메모리 영역(partition)에 두는 것이고, 한 partition에서 실행되는 코드는 다른 partition의 메모리를 고치지 못한다. Memory partitioning은 MPU(Memory Protection Unit)나 그와 비슷한 하드웨어 기능이 있는 마이크로컨트롤러에서 구현한다.[@autosar-cp-exp-functionalsafetymeasures-2025] [[autosar-os|AUTOSAR OS]]가 하는 보호는 OS-Application의 [[autosar-os-application#Memory protection|memory protection]]에서 다룬다.

Memory partitioning은 메모리 맵 하드웨어에 대한 접근도 제한하고, user mode로 실행되는 [[autosar-software-component|소프트웨어 컴포넌트]]는 재구성 같은 CPU 명령을 쓰는 데 제한을 받는다.[@autosar-cp-exp-functionalsafetymeasures-2025]

Memory partitioning은 [[autosar-os-application#Trusted와 non-trusted|trusted OS-Application]]에는 적용되지 않는다. [[task|태스크]] 수준의 partitioning은 AUTOSAR OS 구현에 필수가 아니어서, OS-Application 안의 FFI는 지원되지 않을 수 있다. 성능 부담도 따르는데, 이 부담은 단위 시간당 [[context-switch|context switch]]가 많을수록 커진다. [[autosar-layered-architecture|Basic Software]] 명세는 공급자가 다르고 [[automotive-safety-integrity-level|ASIL]]이 다른 Basic Software 모듈 사이의 memory partitioning을 정하지 않는다.[@autosar-cp-exp-functionalsafetymeasures-2025]
