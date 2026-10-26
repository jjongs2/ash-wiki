---
title: AUTOSAR E2E 보호
tags:
  - platform/autosar
  - sw-engineering/functional-safety
verified: 2026-10-07
---

**E2E 보호**(End-to-End protection)는 [[autosar|AUTOSAR]]의 통신 보호로, 안전 관련 데이터를 주고받을 때 송신자와 수신자 사이의 통신 경로에 생긴 [[fault-error-failure|fault]]의 영향을 실행 중에 검출한다. AUTOSAR R25-11의 E2E 프로토콜 명세는 송신 측이 보낼 데이터에 제어 데이터를 붙여 보호하고, 수신 측이 그 제어 데이터로 받은 데이터를 검사해 결과를 수신자에게 넘기도록 정한다.[@autosar-fo-prs-e2eprotocol-2025]

이 명세가 검출하는 fault에는 송신자나 수신자의 하위 통신 계층에 들어온 [[functional-safety#Systematic failure와 random hardware failure|systematic software fault]]와, MCU 하드웨어, 통신 주변장치, 트랜시버, 통신선 같은 통신 인프라에서 생긴 [[functional-safety#Systematic failure와 random hardware failure|random hardware fault]]가 든다. 예로는 [[can|CAN]] 트랜시버의 레지스터 손상, EMC(Electromagnetic Compatibility)로 인한 간섭, [[autosar-rte|RTE]]·[[inter-os-application-communicator|IOC]]·[[autosar-com|COM]]·네트워크 스택의 systematic fault가 있다. E2E 보호는 [[automotive-safety-integrity-level|ASIL]] D까지의 요구를 가진 안전 관련 통신에 맞는 메커니즘을 준다. 다만 그 메커니즘을 묶은 E2E 프로파일 가운데 고른 것이 쓰임새에 충분한지는 사용자가 보여야 한다.[@autosar-fo-prs-e2eprotocol-2025] E2E 보호가 고려하는 통신 결함의 목록은 [[freedom-from-interference#AUTOSAR의 FFI 수단|freedom from interference]]에서 다룬다.

## 보호 메커니즘

이 명세는 E2E 프로파일마다 아래 데이터 보호 메커니즘 가운데 일부를 골라 쓰도록 정한다.[@autosar-fo-prs-e2eprotocol-2025]

- [[cyclic-redundancy-check|CRC]]
- **Sequence counter**: 송신 요청마다 늘리는 카운터로, 수신 측은 값이 바르게 늘었는지 본다.
- **Alive counter**: 송신 요청마다 늘리는 카운터지만, 수신 측은 값이 바뀌었는지만 보고 바르게 늘었는지는 보지 않는다.
- **Data ID**: 포트로 보내는 데이터 요소마다, 또는 메시지 그룹마다 시스템 전체에서 하나로 매기는 ID(Identifier)
- 데이터 요소나 메시지 그룹을 보내는 소스(클라이언트 등)마다 매기는 ID
- 메서드를 보호할 때 요청과 응답을 가르는 메시지 유형, 정상 응답과 오류 응답을 가르는 메시지 결과
- 수신 측의 통신 타임아웃과 송신 측의 확인 응답 타임아웃 검출[@autosar-fo-prs-e2eprotocol-2025]

이 가운데 일부는 RTE, COM, [[autosar-communication-stack|통신 스택]]에도 구현돼 있다. 그러나 이 모듈들에 안전 요구가 할당되는 것을 줄이거나 피하려고, E2E 보호는 그 구현을 쓰지 않고 [[cyclic-redundancy-check#계산 매개변수|CRC 계산 루틴]]만 빌려 모든 메커니즘을 스스로 갖춘다.[@autosar-fo-prs-e2eprotocol-2025]

Sequence counter는 메시지가 빠지거나 되풀이됐는지 확인하는 데 쓰는 카운터이고, alive counter는 새 값이 계속 오는지, 곧 송신자가 아직 살아 있는지 확인하는 카운터다.[@autosar-fo-tr-glossary-2025]

## E2E 프로파일

보호 메커니즘의 조합, 메시지 형식, 설정 파라미터 묶음을 정한 것을 **E2E 프로파일**(E2E Profile)이라 한다. 프로파일마다 쓰는 메커니즘은 정해져 있고, 프로토콜 헤더의 배치와 수신 측의 상태 평가는 설정 옵션으로 바꾼다. 일부 프로파일에는 표준 E2E variant가 있다. Variant는 한 프로파일에 쓸 설정 옵션의 묶음으로, 예를 들어 Profile 1은 CRC와 카운터의 위치를 설정할 수 있고 variant 1A는 CRC가 0비트에서, 카운터가 8비트에서 시작하게 한다.[@autosar-fo-prs-e2eprotocol-2025]

프로파일은 ECU 안의 통신과 ECU 사이의 통신 모두에 쓸 수 있고, CAN, [[can-fd|CAN FD]], [[flexray|FlexRay]], [[lin|LIN]], [[ethernet|이더넷]] 같은 통신 인프라를 두고 정해졌다. 어느 프로파일을 쓸지는 시스템에 따라 사용자가 고른다.[@autosar-fo-prs-e2eprotocol-2025]

송신 측이 보낼 데이터에 덧붙이는 제어 데이터는 CRC나 카운터 같은 제어 필드이고, 이 제어 필드들이 E2E 헤더를 이룬다. 수신 측은 받은 데이터로 제어 필드를 계산하고, 그 값을 받은 값이나 기대값과 견준다. 프로파일마다 protect, forward, check 세 기능을 둔다. protect 기능은 E2E 헤더를 만들어 보낼 데이터를 보호한다. forward 기능도 protect 기능처럼 내보낼 데이터의 E2E 헤더를 만들되, 들어온 데이터의 검사 결과(E2E 상태)를 따로 싣지 않고 헤더 값에 다시 나타나게 한다. 결과가 E2E_P_REPEATED나 E2E_P_WRONGSEQUENCE면 카운터를, E2E_P_ERROR면 Data ID를 그 결과에 맞게 바꿔 써서, 나가는 데이터를 검사하는 쪽에서도 같은 상태가 나오게 한다. 주된 쓰임새는 E2E 보호된 시그널을 받아 옮기는 [[service-oriented-communication#시그널 기반 통신과의 차이|signal/service translation]]이다. check 기능은 받은 메시지의 E2E 헤더를 평가해 통신 결함을 검사한다.[@autosar-fo-prs-e2eprotocol-2025]

![[diagrams/e2e-protect-check-flow.svg]]

## 검사 결과의 처리

E2E 보호는 검사 결과를 수신자에게 넘길 뿐이고, 그 결과를 알맞게 처리하는 것은 수신자의 몫이다. 특정 프로파일을 쓰는 사용자는 그 프로파일이 쓰임새에 충분한 오류 검출 능력을 갖는지 보여야 한다. 이때 하드웨어 failure rate, 비트 오류율, 네트워크의 노드 수, 메시지 반복률, 게이트웨이 사용, 통신 채널의 소프트웨어 fault 같은 요인을 따진다. 검출한 fault에 대한 반응(되풀이된 메시지 버리기, 타임아웃 판정, 손상된 메시지에 안전 반응 시작 등)이 알맞은지도 사용자가 보여야 한다.[@autosar-fo-prs-e2eprotocol-2025]

AUTOSAR R25-11의 [[autosar-adaptive-platform|Adaptive Platform]] 설계 설명서는 E2E 보호가 통신 결함을 검사해 결과를 줄 뿐 그 이상의 반응을 일으키지 않게 하고, 송신을 확인하는 응답(acknowledgment of transmission)을 만들어 보내는 일 자체와 전송 보안은 Adaptive Platform의 E2E 보호가 제공하지 않는 것으로 둔다.[@autosar-ap-exp-platformdesign-2025]

## E2E Library와 E2E Transformer

AUTOSAR R25-11의 E2E 프로토콜 명세는 E2E 보호를 Adaptive Platform의 `ara::com`이나 [[autosar-classic-platform|Classic Platform]]의 RTE 같은 통신 미들웨어에서 부를 수 있게 하고, 비휘발성 메모리 관리자, 로컬 IPC(Inter-Process Communication), ECU 안 버스 스택 같은 다른 소프트웨어에서 표준이 아닌 방식으로 부를 수도 있게 둔다.[@autosar-fo-prs-e2eprotocol-2025]

AUTOSAR Classic Platform R25-11의 E2E Library 명세는 보호 메커니즘의 알고리즘을 E2E Library에 두고, [[autosar-library|라이브러리]]를 부르는 쪽이 올바른 파라미터를 넘길 책임을 지게 한다. E2E Library는 E2E Transformer나 COM E2E [[autosar-layered-architecture#Integration Code와 callout|callout]]에서 불린다. 어느 쪽이든 보호는 데이터 요소에 하며, 버스로 나가는 것과 같은 비트 배치로 직렬화된 표현에 한다. E2E Transformer를 쓰면 그 위의 [[autosar-transformer|transformer]](COM Based Transformer나 [[some-ip|SOME/IP]] Transformer)가 직렬화하고, COM callout을 쓰면 RTE와 COM이 직렬화하므로 callout은 I-PDU(Interaction Layer Protocol Data Unit) 안의 직렬화된 [[autosar-com#시그널과 I-PDU|시그널 그룹]]에 바로 작용한다. 데이터 요소와 그에 대응하는 시그널 그룹은 통째로 보호하거나 아예 보호하지 않으며, 일부만 보호할 수는 없다. I-PDU 하나에 데이터 요소가 여럿 실리면 그 가운데 일부만 따로 보호할 수 있다.[@autosar-cp-sws-e2elibrary-2025]

**E2E Transformer**는 E2E 보호의 설정과 처리를 감싸 표준 transformer 인터페이스로 내놓는 BSW(Basic Software) 모듈이다. 그래서 부르는 쪽은 E2E의 내부를 몰라도 된다. E2E Transformer는 transformer 분류의 [[autosar-transformer#Transformer chain|Safety]]에 들고, 통신 스택을 black channel로 보고 그 위로 I-signal(I-PDU에 실리는 시그널)이 바르게 오가게 한다. 데이터 요소는 I-signal이나 I-signal 그룹에 일대일로 대응한다. [[autosar-software-component|SW-C]]가 RTE의 API인 read, write, send, receive를 부르면 E2E Transformer가 불린다. 받는 SW-C가 E2E Transformer의 반환 코드를 평가하지 않으면 손상된 데이터를 쓸 수 있다.[@autosar-cp-sws-e2etransformer-2025]

## Adaptive Platform의 E2E

AUTOSAR R25-11의 Adaptive Platform 설계 설명서는 E2E 보호로 정보가 전송 중에 바뀌었는지, 메시지가 전송 중에 빠지거나 되풀이됐는지를 검사하고, E2E 상태 기계로 통신 채널의 신뢰성을 검사할 수 있게 둔다. 이 릴리스에서 E2E는 [[service-oriented-communication#서비스 인터페이스|Event, Method, Field]]를 지원하되 저마다 [[autosar-communication-management|Communication Management]] 명세가 정한 제한이 있다. Callout 모드의 Event, 비주기 Event, 제약 없는 Method는 지원하지 않는다.[@autosar-ap-exp-platformdesign-2025]
