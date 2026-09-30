---
title: AUTOSAR Classic Platform
tags:
  - platform/autosar
verified: 2026-09-30
publisher: AUTOSAR
edition: 2025
status: 유효
---

**AUTOSAR Classic Platform**은 [[autosar|AUTOSAR]]가 펴내는, 깊이 임베디드된 ECU를 위한 표준이다. 이런 ECU의 소프트웨어는 입력 신호와 다른 ECU의 정보를 바탕으로 전기 출력 신호를 제어한다.[@autosar-ap-exp-platformdesign-2025] Classic Platform은 소프트웨어를 마이크로컨트롤러 위에서 도는 응용 계층, RTE, BSW(Basic Software) 세 계층으로 나눈다. 응용 소프트웨어는 RTE를 거쳐 다른 소프트웨어 컴포넌트와 통신하고 BSW에 접근하며, RTE가 응용에 대한 인터페이스 전체다.[@autosar-standards-classic-platform-2026]

![[diagrams/autosar-layered-software-architecture.svg]]

## 범위

Classic Platform의 대상은 실시간 요구가 높고(마이크로초 수준), 안전 중요도가 높으며(ASIL(Automotive Safety Integrity Level) D까지), 연산 능력은 낮은(약 1000 DMIPS(Dhrystone Million Instructions Per Second)) ECU다.[@autosar-exp-introduction-part1-2026] 계층의 구성은 [[autosar-layered-architecture|AUTOSAR 계층 구조]]에서, 설정과 코드 생성의 흐름은 [[autosar-methodology|AUTOSAR 방법론]]에서 다룬다.

Classic Platform의 운영체제인 AUTOSAR OS는 핵심 기능을 [[osek-os|OSEK OS]]에 두고, OSEK OS의 기능 일부를 제한하거나 확장한다. AUTOSAR OS는 정적으로 설정되고 규모가 정해지며, 우선순위 기반 스케줄링 정책을 둔다.[@autosar-cp-sws-os-2025]

BSW 설정을 어느 단계에서 하는지는 [[autosar-methodology#설정 클래스|AUTOSAR 방법론]]에서 다룬다.

## 개정 이력

- 2005년 5월: 첫 릴리스인 Release 1.0이 나왔다.[@autosar-history-2026]
- 2006년: Release 2.0(5월)과 Release 2.1(11월)이 나왔다.[@autosar-history-2026] Release 2.1에는 진단 모듈 Dcm(Diagnostic Communication Manager)과 Dem(Diagnostic Event Manager)의 규격이 이미 들어 있었다.[@autosar-cp-releaseoverview-r2-1-20-2010]
- 2007년 12월과 2008년 8월: Release 3.0과 Release 3.1이 나왔다.[@autosar-history-2026]
- 2009년 12월: Release 4.0이 나왔다.[@autosar-history-2026] 기능 안전 개념(메모리 분할, 프로그램 흐름 감시, E2E(End-to-End) 통신 보호 등)과 멀티코어 아키텍처 개념을 새로 넣고, [[ethernet|Ethernet]] 드라이버·인터페이스·State Manager 규격을 담았다.[@autosar-cp-releaseoverview-r4-0-3-2013]
- 2011년 5월: 3.x 계열의 Release 3.2가 Release 4.0보다 뒤에 나왔다. 3.1을 바탕으로 Partial Networking 같은 기능을 더하고, 4.0에 있던 기능 일부(E2E 통신 보호 등)를 역이식했다.[@autosar-history-2026][@autosar-cp-releaseoverview-r3-2-3-2014]
- 2013년 3월: Release 4.1.0이 AUTOSAR Timing Concept, Ethernet Partial Networking, 응용이 [[internet-protocol-suite|TCP/IP]]로 통신하는 소켓 인터페이스, 대형 상용차와 [[j1939|J1939]] 지원 등을 새로 넣었다.[@autosar-cp-releaseoverview-r4-1-3-2014]
- 2014년 6월: 인수 시험이 Classic Platform 릴리스와 따로 Acceptance Test Release 1.0.0으로 나왔다.[@autosar-history-2026]
- 2014년 10월: Release 4.2.1이 Ethernet과 [[can-fd|CAN FD]]로 큰 데이터를 주고받는 통신(Ethernet 스위치 지원 등)과 safety·security 개선에 집중했다.[@autosar-cp-releaseoverview-r4-2-2-2015]
- 2016년 11월: Release 4.3.0이 Crypto Interface와 Crypto Driver로 암호 스택을 완성하고, V2X(Vehicle-to-X) 통신을 처음 지원했다.[@autosar-cp-releaseoverview-r4-3-1-2017]
- 2018년 10월: Release 4.4.0이 나왔다.[@autosar-history-2026] 번호로 이름을 붙인 마지막 Classic Platform 릴리스다.[@autosar-cp-tr-releaseoverview-2025]
- 2019년 11월: 릴리스 이름을 Ryy-mm(릴리스의 연도와 월) 꼴로 바꿔 R19-11이 나왔다. 이때부터 Classic Platform, Adaptive Platform, Foundation을 한 AUTOSAR 릴리스로 함께 낸다. 번호는 내부 릴리스 번호로 이어져, R19-11은 R4.5.0, R25-11은 R4.11.0이다.[@autosar-cp-tr-releaseoverview-2025]
- 2025년: 현행 릴리스 R25-11이 나왔다.[@autosar-standards-classic-platform-2026]

![[diagrams/autosar-classic-platform-release-timeline.svg]]

## Adaptive Platform과의 차이

AUTOSAR Adaptive Platform은 Classic Platform을 대체하지 않고, Classic Platform, 비AUTOSAR 플랫폼과 함께 동작하며 하나의 시스템을 이룬다.[@autosar-ap-exp-platformdesign-2025]

| 항목      | Classic Platform                                                                                                                                                                                                                | Adaptive Platform                                                                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 통신      | [[can\|CAN]] 같은 기존 차량 내 통신 기술에 맞춰 설계·최적화됐고, Ethernet도 지원한다. [[signal-based-communication\|시그널 기반]] COM 스택이 CAN, [[lin\|LIN]], [[flexray\|FlexRay]]에서 오는 PDU(Protocol Data Unit)를 다룬다. | 통신을 [[service-oriented-communication\|서비스 지향 통신]]으로 한정하고, 서비스 지향 아키텍처를 따른다.[@autosar-ap-exp-platformdesign-2025][@autosar-cp-exp-layeredsoftwarearchitecture-2025]                        |
| 스케줄링  | OSEK OS의 고정 우선순위 스케줄링을 쓰고, 멀티코어에서도 태스크를 코어에 동적으로 배정하지 않는다.                                                                                                                               | 운영체제가 POSIX 스케줄링 정책 `SCHED_OTHER`, `SCHED_FIFO`, `SCHED_RR`을 지원해야 하고, 응용 벤더는 `SCHED_DEADLINE` 같은 정책을 더할 수 있다.[@autosar-cp-sws-os-2025][@autosar-ap-sws-operatingsysteminterface-2025] |
| 운영체제  | AUTOSAR OS가 OSEK OS를 바탕으로 한다.                                                                                                                                                                                           | 새 운영체제를 정하지 않고, 응용이 POSIX PSE51(IEEE 1003.13) 함수와 C++ 표준 라이브러리를 쓰는 실행 문맥과 인터페이스를 정한다.[@autosar-cp-sws-os-2025][@autosar-ap-sws-operatingsysteminterface-2025]                 |
| 주소 공간 | AUTOSAR OS 규격은 멀티코어에서 적어도 공유 부분은 단일 주소 공간이라고 가정하고, 메모리 보호에 하드웨어 MPU(Memory Protection Unit)를 요구한다.                                                                                 | 운영체제가 각 Process를 전용 주소 공간에서 실행하고, 이 주소 공간은 가상화된다.[@autosar-cp-sws-os-2025][@autosar-ap-sws-operatingsysteminterface-2025]                                                                |

Adaptive Platform R17-03 릴리스 개요는 규격을 소프트웨어 구현으로 함께 검증하는 것을 Adaptive Platform이 Classic Platform과 다른 표준화 방식의 하나로 든다. AUTOSAR는 R17-03부터 Adaptive Platform을 내부 구현인 Adaptive Platform Demonstrator로 함께 검증했고, 이를 모든 파트너에게 제공했다.[@autosar-ap-releaseoverview-r17-03-2017] 그 뒤 AUTOSAR는 Adaptive Platform R20-11을 따르는 구현인 CAPI(Common Adaptive Platform Implementation) 1.0을 내놓았다. CAPI 1.0은 핵심 functional cluster 15개를 모두 구현하고, 코드 생성기의 소스 코드와 데모를 담는다.[@autosar-capi-release-2026] Classic Platform 쪽으로는 AUTOSAR가 CAN으로 이은 ECU 두 개로 된 워크플로 예제의 산출물을 ZIP으로 내놓고, 요청하면 응용 소프트웨어의 C 소스 코드도 준다.[@autosar-standards-classic-platform-2026]
