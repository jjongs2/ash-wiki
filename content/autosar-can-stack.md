---
title: AUTOSAR CAN 스택
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR CAN 스택**은 [[autosar-communication-stack|AUTOSAR 통신 스택]] 가운데 [[can|CAN]] 통신을 맡는 모듈 묶음이다. CAN Driver는 [[microcontroller-abstraction-layer|MCAL]]의 Communication Drivers에 들고, CanTrcv(CAN Transceiver Driver)와 CanIf(CAN Interface)는 Communication Hardware Abstraction에 든다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] 그 위에서 CanSM(CAN State Manager)은 CAN 네트워크의 통신 모드를 제어하고[@autosar-cp-sws-canstatemanager-2025], CanTp(CAN Transport Layer)는 긴 메시지를 분할하고 재조립하며[@autosar-cp-sws-cantransportlayer-2025], CanNm(CAN Network Management)은 네트워크 관리를 맡는다.[@autosar-cp-sws-cannetworkmanagement-2025]

## 모듈

- **CAN Driver**: MCAL 드라이버로, 하드웨어에 접근하면서 상위 층에 하드웨어에서 독립적인 API를 준다. 이 API를 쓰는 상위 모듈은 CanIf뿐이다. 송신을 시작하는 서비스를 주고, [[can-controller|CAN 컨트롤러]]의 동작과 상태를 제어한다. 수신, 송신 확인, bus-off는 CanIf의 콜백으로 알리고, wakeup은 [[ecu-state-manager|EcuM]]에 알린다. CAN Driver 하나는 같은 CAN 하드웨어 유닛에 속한 여러 CAN 컨트롤러를 제어할 수 있다.[@autosar-cp-sws-candriver-2025]
- **CanTrcv**: [[can-transceiver|CAN 트랜시버]]의 동작 모드를 normal, standby, sleep 가운데 하나로 바꾼다.[@autosar-cp-sws-cantransceiverdriver-2025]
- **CanIf**: 아래의 CAN Driver·CanTrcv와 위 모듈 사이에서, CAN 하드웨어와 상관없는 일을 모두 맡는다. 위 모듈의 송신 요청을 CAN Driver로 넘기고, 수신과 송신 확인을 위 모듈에 알린다. 이 송수신 경로에서 CanIf 바로 위 모듈은 L-SDU(Link Layer Service Data Unit) Router(LSduR)다. CanSM의 상태 변경 요청을 CAN Driver와 CanTrcv로 넘겨 컨트롤러와 트랜시버의 모드를 바꾸는 경로도 된다. 종류가 다른 여러 CAN 컨트롤러와 트랜시버를 한 인터페이스로 다룬다. [[pdu-router|PduR]], CanTp, CanNm은 LSduR를 거쳐 CanIf와 이어진다.[@autosar-cp-sws-caninterface-2025][@autosar-cp-sws-lsdurouter-2025]
- **CanSM**: 설정된 CAN 네트워크마다 상태 기계를 하나씩 두고 통신 상태를 제어한다. ComM(Communication Manager)의 요청에 따라 CanIf의 API로 컨트롤러와 트랜시버의 모드를 바꾸고, 현재 통신 모드를 ComM에 알린다.[@autosar-cp-sws-canstatemanager-2025]
- **CanTp**: PduR 아래에서, CAN은 8바이트, [[can-fd|CAN FD]]는 64바이트보다 긴 I-PDU(Interaction Layer Protocol Data Unit)를 [[segmentation-and-reassembly|분할하고 재조립]]한다. CanTp 명세는 ISO 15765를 바탕으로 한다.[@autosar-cp-sws-cantransportlayer-2025]
- **CanNm**: 하드웨어에서 독립적인 프로토콜로, 네트워크가 정상 동작과 bus-sleep 모드 사이를 오가는 전환을 조율한다.[@autosar-cp-sws-cannetworkmanagement-2025] 동작은 [[autosar-network-management|AUTOSAR 네트워크 관리]]에서 다룬다.

![[diagrams/autosar-can-stack-modules.svg]]

## 하드웨어 오브젝트

하드웨어 오브젝트(hardware object)는 CAN 컨트롤러의 CAN RAM 안에 있는 PDU(Protocol Data Unit) 버퍼로, [[can-identifier|CAN 식별자]], [[data-length-code|DLC]], 데이터를 담는다. CanIf는 하드웨어 오브젝트를 HOH(Hardware Object Handle)로 가리키며, HOH는 송신용 HTH(Hardware Transmit Handle)와 수신용 HRH(Hardware Receive Handle) 두 가지다.[@autosar-cp-sws-caninterface-2025]

하드웨어 오브젝트의 handle type(`CanHandleType`)은 `BASIC`과 `FULL` 두 가지다.[@autosar-cp-sws-candriver-2025] `BASIC` 하드웨어 오브젝트 하나는 여러 CAN 식별자를 주고받고, 이런 수신 오브젝트에서는 CanIf가 소프트웨어 필터로 받을 PDU만 골라 올린다. `FULL` 하드웨어 오브젝트 하나는 CAN 식별자 하나만 다룬다.[@autosar-cp-sws-caninterface-2025]

## Dynamic L-PDU

CanIf는 CAN 식별자나 그 일부를 L-SDU의 메타데이터에 담는 dynamic L-PDU를 지원한다. 송신용 dynamic L-PDU는 실행 중에 CAN 식별자를 다시 설정하거나, 식별자의 전부나 일부를 L-SDU의 메타데이터로 받는다. `CanIf_SetDynamicTxId`는 이런 L-PDU의 CAN 식별자를 다시 설정한다. 마스크(`CanIfTxPduCanIdMask`)가 설정돼 있으면 마스크가 가리키는 비트는 설정한 식별자에서, 나머지 비트는 메타데이터에서 가져오고, 마스크와 식별자가 모두 없으면 메타데이터를 그대로 CAN 식별자로 쓴다. 수신용 dynamic L-PDU는 CAN 식별자 여럿에 대응하며, CanIf는 실제로 받은 CAN 식별자를 메타데이터에 담아 위층에 넘긴다.[@autosar-cp-sws-caninterface-2025]

## Bus-off 처리

CAN 컨트롤러가 [[can-fault-confinement|bus-off]]가 되면, CAN Driver는 컨트롤러가 STOPPED 상태에 든 뒤 CanIf에 알린다.[@autosar-cp-sws-candriver-2025] CanIf는 이 알림을 CanSM에 넘긴다.[@autosar-cp-sws-caninterface-2025] CanSM은 bus-off 복구 상태 기계로 CanIf에 컨트롤러를 다시 시작하라고 요청한다. 이때 CanSM은 [[basic-software-mode-manager|BswM]]에 bus-off 상태를 늘 알리고, [[diagnostic-event-manager|Dem]] 이벤트 CANSM_E_BUS_OFF를 보고한다. Dem 이벤트 참조는 설정에서 빼 둘 수 있다.[@autosar-cp-sws-canstatemanager-2025] ComM과 BswM은 [[autosar-communication-stack#통신 모드 관리|AUTOSAR 통신 스택]]에서 다룬다.

![[diagrams/can-bus-off-notification-sequence.svg]]

## 지원하는 CAN 프로토콜

CAN 스택은 CAN 2.0에 더해, 하드웨어가 지원하면 [[can-xl|CAN XL]] 통신도 다룬다. CAN XL을 지원하는 CAN 스택은 CAN 버스와 CAN XL 버스를 모두 다룰 수 있다. CAN XL 통신을 위해 확장이 필요한 모듈은 CanIf, CanTrcv, CAN Driver뿐이다. CAN XL 경로에서 이 스택은 IP 통신에 참여하도록 [[ieee-802-3|IEEE 802.3]] 이더넷 프레임을 직접 터널링할 수 있으며, 이 경로에서는 Ethernet Interface가 CAN XL Driver 위에 놓인다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

CAN XL Driver는 CAN Driver 모듈의 확장이고, 위층으로 CanIf와 Ethernet Interface 두 모듈을 둔다. CAN XL Driver는 하드웨어에서 독립적인 방식으로 송신을 시작하는 서비스를 주고, 사건은 CanIf와 Ethernet Interface의 콜백으로 알린다. 이 스택이 직접 지원하는 CAN XL SDU type은 내용 기반 CAN XL 프레임(`01h`), 터널링한 CAN 2.0·CAN FD 프레임(`03h`), 매핑해 터널링한 IEEE 802.3 이더넷 프레임(`05h`) 셋이다. 노드 주소 지정(`02h`)이나 매핑하지 않은 이더넷 프레임 터널링(`04h`) 같은 다른 type은 CDD(Complex Driver)로만 쓸 수 있다. 상태 관리는 버스마다 따로 해, CAN은 CanSM이, CAN XL로 터널링하는 이더넷은 Ethernet State Manager가 맡는다.[@autosar-cp-sws-canxldriver-2025] CAN XL Transceiver Driver도 CAN Transceiver Driver의 확장이다.[@autosar-cp-sws-canxltransceiverdriver-2025]

![[diagrams/can-xl-driver-upper-modules.svg]]

AUTOSAR Classic Platform R25-11은 [[iso-11898-4|TTCAN]](Time-triggered communication on CAN) 요구사항과 TTCAN Driver, TTCAN Interface 명세를 없앴다. 같은 릴리스에서 CAN Driver 명세와 CAN Interface 명세도 TTCAN 지원을 뺐다.[@autosar-cp-tr-releaseoverview-2025]
