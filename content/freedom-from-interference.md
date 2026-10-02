---
title: Freedom from interference
tags:
  - process/sw-process
aliases:
  - FFI
verified: 2026-10-02
---

ISO 26262-1:2018은 **FFI**(Freedom From Interference)를 둘 이상의 요소 사이에 안전 요구사항 위반으로 이어질 수 있는 cascading failure가 없는 것으로 정의한다.[@iso-26262-1-obp-2018] Cascading failure는 [[safety-analysis#종속 고장 분석|안전 분석]]에서 다룬다. ISO 26262-9:2018은 요소의 공존 기준(criteria for coexistence of elements)을 정한다.[@iso-26262-9-obp-2018]

## AUTOSAR의 FFI 수단

AUTOSAR R25-11은 FFI를 돕는 기능 안전 메커니즘을 간섭의 측면에 따라 다음처럼 나눈다.[@autosar-cp-exp-functionalsafetymeasures-2025]

| 측면      | 메커니즘                                                                            |
| --------- | ----------------------------------------------------------------------------------- |
| 메모리    | memory partitioning                                                                 |
| 타이밍    | Watchdog Manager의 시간 감시, [[autosar-timing-protection\|OS의 timing protection]] |
| 실행      | Watchdog Manager의 logical supervision                                              |
| 정보 교환 | E2E 보호                                                                            |

AUTOSAR R25-11의 E2E 보호는 정보의 반복, 손실, 지연, 삽입, 위장, 잘못된 주소 지정, 잘못된 순서, 손상, 수신자마다 다른 정보, 일부 수신자만 받는 정보, 통신 채널 접근 막힘을 통신 결함으로 고려한다.[@autosar-cp-exp-functionalsafetymeasures-2025] Watchdog Manager는 [[safety-mechanism#오류 검출 기법|안전 기제]]에서 다룬다.

## Memory partitioning

AUTOSAR R25-11의 memory partitioning은 [[autosar-os-application|OS-Application]]들을 서로 보호되는 다른 메모리 영역(partition)에 두는 것이고, 한 partition에서 실행되는 코드는 다른 partition의 메모리를 고치지 못한다. Memory partitioning은 MPU(Memory Protection Unit)나 그와 비슷한 하드웨어 기능이 있는 마이크로컨트롤러에서 구현한다.[@autosar-cp-exp-functionalsafetymeasures-2025] AUTOSAR OS가 하는 보호는 OS-Application의 [[autosar-os-application#Memory protection|memory protection]]에서 다룬다.
