---
title: AUTOSAR Classic Platform
tags:
  - platform/autosar
verified: 2026-09-30
publisher: AUTOSAR
edition: 2025
status: 유효
---

**AUTOSAR Classic Platform**은 [[autosar|AUTOSAR]]가 펴내는, 깊이 임베디드된 ECU를 위한 표준이다. 이런 ECU의 소프트웨어는 입력 신호와 다른 ECU의 정보를 바탕으로 전기 출력 신호를 제어한다.[@autosar-ap-exp-platformdesign-2025] Classic Platform은 소프트웨어를 마이크로컨트롤러 위에서 도는 응용 계층, [[autosar-rte|RTE]], [[autosar-layered-architecture#최상위 수준의 세 층|BSW]](Basic Software) 세 계층으로 나눈다. 응용 소프트웨어는 RTE를 거쳐 다른 [[autosar-software-component|소프트웨어 컴포넌트]]와 통신하고 BSW에 접근하며, RTE가 응용에 대한 인터페이스 전체다.[@autosar-standards-classic-platform-2026]

![[diagrams/autosar-layered-software-architecture.svg]]

## 범위

Classic Platform의 대상은 실시간 요구가 마이크로초 수준으로 높고, 안전 중요도가 [[automotive-safety-integrity-level|ASIL]] D까지 높으며, 연산 능력은 약 1000 DMIPS(Dhrystone Million Instructions Per Second)로 낮은 ECU다.[@autosar-exp-introduction-part1-2026] 계층의 구성은 [[autosar-layered-architecture|AUTOSAR 계층 구조]]에서, 설정과 코드 생성의 흐름은 [[autosar-methodology|AUTOSAR 방법론]]에서 다룬다.

Classic Platform의 운영체제인 [[autosar-os|AUTOSAR OS]]는 핵심 기능을 [[osek-os|OSEK OS]]에 두고, OSEK OS의 기능 일부를 제한하거나 확장한다. AUTOSAR OS는 정적으로 설정되고 규모가 정해지며, 우선순위 기반 스케줄링 정책을 둔다.[@autosar-cp-sws-os-2025]

RTE 생성기가 만든 RTE 코드는 다른 BSW 모듈, 소프트웨어 컴포넌트의 코드와 함께 컴파일되고 링크된다. 멀티코어 ECU에서는 RTE를 한 이미지로 링크할 수도 있고, 코어마다 이미지를 나눌 수도 있다.[@autosar-cp-sws-rte-2025]

AUTOSAR 소개 자료에 따르면 Classic Platform의 AUTOSAR 스택은 여러 벤더가 내놓는다.[@autosar-exp-introduction-part1-2026] BSW 모듈은 자기 구현의 벤더 ID를 AUTOSAR 벤더 목록에 따라 `<MIP>_VENDOR_ID`로 공개한다.[@autosar-cp-sws-bswgeneral-2025] 벤더 ID는 AUTOSAR 제품을 파는 회사가 신청하면 AUTOSAR가 내주며, AUTOSAR 누리집은 할당한 벤더 ID와 회사 이름의 목록을 공개한다.[@autosar-vendor-id-2026]

BSW 설정을 어느 단계에서 하는지는 [[autosar-methodology#ECU 설정|AUTOSAR 방법론]]에서 다룬다.

## 개정 이력

AUTOSAR는 2003년 결성 때부터 3년씩 이어지는 세 계약 단계로 일했다. Phase I은 2006년에 첫 규격 묶음을 내고 끝났고, Phase II는 2009년에 Release 3.1과 4.0을 내고 끝났으며, Phase III는 Release 4.0.3을 냈다. AUTOSAR는 Phase III 계약이 2012년 말에 끝난 뒤로는 기한을 정한 단계 대신 끝나는 날을 두지 않는 연속 작업 방식으로 가기로 했다.[@schmerler-shaping-future-2012]

- 2005년 5월: 첫 릴리스인 Release 1.0이 나왔다.[@autosar-history-2026]
- 2006년: Release 2.0(5월)과 Release 2.1(11월)이 나왔다.[@autosar-history-2026] Release 1.0이 주로 RTE 아래 BSW의 일부를 다룬 뒤, AUTOSAR는 BSW 구성요소를 더하고 RTE를 구현하는 데 힘을 쏟았다.[@autosar-enabling-technology-2006] Release 2.0의 명세는 운영체제, 통신, 하드웨어 추상화, RTE를 정의했고, AUTOSAR는 Release 2.1로 표준의 모듈 명세 부분이 완성된다고 밝혔다.[@autosar-media-release-2006] Release 2.1에는 진단 모듈 Dcm(Diagnostic Communication Manager)과 [[diagnostic-event-manager|Dem]]의 규격이 이미 들어 있었다.[@autosar-cp-releaseoverview-r2-1-20-2010]
- 2007년 12월과 2008년 8월: Release 3.0과 Release 3.1이 나왔다.[@autosar-history-2026]
- 2009년 12월: Release 4.0이 나왔다.[@autosar-history-2026] [[functional-safety|기능 안전]] 개념과 멀티코어 아키텍처 개념을 새로 넣고, [[ethernet|Ethernet]] 드라이버·인터페이스·State Manager 규격을 담았다. 새 기능 안전 개념에는 메모리 분할, 프로그램 흐름 감시, E2E(End-to-End) 통신 보호 등이 든다.[@autosar-cp-releaseoverview-r4-0-3-2013]
- 2011년 5월: 3.x 계열의 Release 3.2가 Release 4.0보다 뒤에 나왔다. 3.1을 바탕으로 [[autosar-network-management#Partial networking|Partial Networking]] 같은 기능을 더하고, 4.0에 있던 기능 일부(E2E 통신 보호 등)를 역이식했다.[@autosar-history-2026][@autosar-cp-releaseoverview-r3-2-3-2014]
- 2013년 3월: Release 4.1.0이 AUTOSAR Timing Concept, Ethernet Partial Networking, 응용이 [[internet-protocol-suite|TCP/IP]]로 통신하는 소켓 인터페이스, 대형 상용차와 [[j1939|J1939]] 지원 등을 새로 넣었다.[@autosar-cp-releaseoverview-r4-1-3-2014]
- 2014년 6월: [[autosar-acceptance-tests|인수 시험]]이 Classic Platform 릴리스와 따로 Acceptance Test Release 1.0.0으로 나왔다.[@autosar-history-2026]
- 2014년 10월: Release 4.2.1이 이더넷과 [[can-fd|CAN FD]]로 큰 데이터를 주고받는 통신([[ethernet-switch|이더넷 스위치]] 지원 등)과 safety·security 개선에 집중했다.[@autosar-cp-releaseoverview-r4-2-2-2015]
- 2016년 11월: Release 4.3.0이 Crypto Interface와 Crypto Driver로 [[autosar-crypto-stack|암호 스택]]을 완성하고, V2X(Vehicle-to-X) 통신을 처음 지원했다.[@autosar-cp-releaseoverview-r4-3-1-2017]
- 2018년 10월: Release 4.4.0이 나왔다.[@autosar-history-2026] 번호로 이름을 붙인 마지막 Classic Platform 릴리스다.[@autosar-cp-tr-releaseoverview-2025]
- 2019년 11월: 릴리스 이름을 Ryy-mm(릴리스의 연도와 월) 꼴로 바꿔 R19-11이 나왔다. 이때부터 Classic Platform, Adaptive Platform, [[autosar#표준|Foundation]]을 한 AUTOSAR 릴리스로 함께 낸다. 번호는 내부 릴리스 번호로 이어져, R19-11은 R4.5.0, R25-11은 R4.11.0이다.[@autosar-cp-tr-releaseoverview-2025]
- 2020년 11월: R20-11이 [[intrusion-detection-system-manager|IdsM]]과 [[autosar-software-cluster#Software Cluster Connection|Software Cluster Connection]](SwCluC)의 명세를 처음 넣었다.[@autosar-cp-sws-intrusiondetectionsystemmanager-2025][@autosar-cp-sws-softwareclusterconnection-2025] R20-11의 CAN Interface 명세는 Pretended Networking을 뺐다.[@autosar-cp-sws-caninterface-2025]
- 2022년 11월: R22-11이 [[ieee-802-1ae|MACsec Key Agreement]](Mka), [[can-xl|CAN XL]] Driver, Data Distribution Service(Dds)의 명세를 처음 넣었다.[@autosar-cp-sws-macseckeyagreement-2025][@autosar-cp-sws-canxldriver-2025][@autosar-cp-sws-datadistributionservice-2025]
- 2023년 11월: R23-11이 [[autosar-firewall|Firewall]]과 L-SDU(Link Layer Service Data Unit) Router(LSduR)의 명세를 처음 넣었다.[@autosar-cp-sws-firewall-2025][@autosar-cp-sws-lsdurouter-2025]
- 2024년 11월: R24-11이 I2C(Inter-Integrated Circuit) Driver의 명세를 처음 넣었다.[@autosar-cp-sws-i2cdriver-2025] R24-11의 LSduR 명세는 LSduR를 모든 통신 인터페이스 모듈 위에 반드시 두는 층으로 정했다.[@autosar-cp-sws-lsdurouter-2025]
- 2025년: 현행 릴리스 R25-11이 나왔다.[@autosar-standards-classic-platform-2026] R25-11 문서는 2025년 11월 27일 자로 나왔고, R25-11은 R24-11을 대체하는 [[autosar#릴리스 생명주기|Evolution 단계]]의 minor release다. 새 개념으로 [[autosar-communication-stack#그 밖의 모듈|VDP]], [[autosar-com|COM]] Handler, Classic Platform의 DDS(Data Distribution Service)에 서비스 지향 아키텍처 기능을 더하는 개념이 들어왔다. COM Handler는 Large Data COM(LdCom)의 기능을 COM에 합쳤고, CAN [[autosar-time-synchronization|시간 동기화]] 명세는 순수 프로토콜을 담은 Foundation의 PRS(Protocol Specification)와 AUTOSAR 안에서의 구현을 정하는 명세로 나뉘었다. Flash Driver, EEPROM Driver, LdCom, [[iso-11898-4|TTCAN]] Driver, TTCAN Interface의 명세와 Franca 통합 [[autosar#규격 문서|TR]]이 빠졌고, V2X와 무선 이더넷 드라이버의 명세는 obsolete가 되었다. [[virtual-functional-bus|VFB]] 문서는 문서 종류가 EXP(Explanation)에서 TR로 바뀌었다. R25-11의 [[autosar-methodology#AUTOSAR XML|스키마]] 버전은 AUTOSAR_00054다.[@autosar-cp-tr-releaseoverview-2025]

![[diagrams/autosar-classic-platform-release-timeline.svg]]

## Adaptive Platform과의 차이

AUTOSAR Adaptive Platform은 Classic Platform을 대체하지 않고, Classic Platform, 비AUTOSAR 플랫폼과 함께 동작하며 하나의 시스템을 이룬다.[@autosar-ap-exp-platformdesign-2025]

| 항목          | Classic Platform                                                                                                                                                                                                              | Adaptive Platform                                                                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 통신          | [[can\|CAN]] 같은 기존 차량 내 통신 기술에 맞춰 설계·최적화됐고, 이더넷도 지원한다. [[signal-based-communication\|시그널 기반]] COM 스택이 CAN, [[lin\|LIN]], [[flexray\|FlexRay]]에서 오는 PDU(Protocol Data Unit)를 다룬다. | 서비스 지향 아키텍처를 따르고[@autosar-ap-exp-platformdesign-2025], 통신을 [[service-oriented-communication\|서비스 지향 통신]]으로 한정한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-cp-tps-systemtemplate-2025]                         |
| 스케줄링      | OSEK OS의 [[fixed-priority-scheduling\|고정 우선순위 스케줄링]]을 쓰고, 멀티코어에서도 [[task\|태스크]]를 코어에 동적으로 배정하지 않는다.                                                                                    | 운영체제가 POSIX 스케줄링 정책 `SCHED_OTHER`, `SCHED_FIFO`, `SCHED_RR`을 지원해야 하고, 응용 벤더는 `SCHED_DEADLINE` 같은 정책을 더할 수 있다.[@autosar-cp-sws-os-2025][@autosar-ap-sws-operatingsysteminterface-2025]                                       |
| 운영체제      | 운영체제로 AUTOSAR OS를 정한다.                                                                                                                                                                                               | 새 운영체제를 정하지 않고, 응용이 POSIX PSE51([[ieee-1003-13\|IEEE 1003.13]]) 함수와 C++ 표준 라이브러리를 쓰는 실행 context와 인터페이스를 정한다.[@autosar-cp-sws-os-2025][@autosar-ap-sws-operatingsysteminterface-2025]                                  |
| 프로그램 실행 | AUTOSAR가 대상으로 하는 ECU는 내부나 외부 플래시 메모리에서 프로그램을 실행한다.                                                                                                                                              | Process는 Executable을 메모리에 올린 인스턴스이고, [[autosar-execution-management\|Execution Management]]가 시작하고 끝낸다. Process가 쓰는 RAM에는 코드도 든다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-ap-sws-executionmanagement-2025] |
| 주소 공간     | AUTOSAR OS는 멀티코어에서 적어도 공유 부분은 단일 주소 공간이라고 가정하고, [[autosar-os-application#Memory protection\|memory protection]]에 하드웨어 MPU(Memory Protection Unit)를 요구한다.                                | 운영체제가 각 Process를 전용 주소 공간에서 실행하고, 이 주소 공간은 가상화된다.[@autosar-cp-sws-os-2025][@autosar-ap-sws-operatingsysteminterface-2025]                                                                                                      |

Adaptive Platform에 대해서는 AUTOSAR가 규격을 내부 구현인 Adaptive Platform Demonstrator로 함께 검증하고 구현 CAPI(Common Adaptive Platform Implementation)를 내놓았으며, 그 이력은 [[autosar-adaptive-platform#개정 이력|AUTOSAR Adaptive Platform]]에서 다룬다.[@autosar-ap-releaseoverview-r17-03-2017][@autosar-capi-release-2026] Classic Platform 쪽으로는 AUTOSAR가 CAN으로 이은 ECU 두 개로 된 워크플로 예제의 산출물을 ZIP으로 내놓고, 요청하면 응용 소프트웨어의 C 소스 코드도 준다.[@autosar-standards-classic-platform-2026]
