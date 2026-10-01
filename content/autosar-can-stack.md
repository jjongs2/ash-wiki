---
title: AUTOSAR CAN 스택
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR CAN 스택**은 [[autosar-communication-stack|AUTOSAR 통신 스택]] 가운데 [[can|CAN]] 통신을 맡는 모듈 묶음이다. CAN Driver는 MCAL의 Communication Drivers에 들고, CanTrcv(CAN Transceiver Driver)와 CanIf(CAN Interface)는 Communication Hardware Abstraction에 든다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] 그 위에서 CanSM(CAN State Manager)은 CAN 네트워크의 통신 모드를 제어하고[@autosar-cp-sws-canstatemanager-2025], CanTp(CAN Transport Layer)는 긴 메시지를 분할하고 재조립하며[@autosar-cp-sws-cantransportlayer-2025], CanNm(CAN Network Management)은 네트워크 관리를 맡는다.[@autosar-cp-sws-cannetworkmanagement-2025]

## 모듈

- **CAN Driver**: MCAL 드라이버로, 하드웨어에 접근하면서 상위 층에 하드웨어에서 독립적인 API(Application Programming Interface)를 준다. 이 API를 쓰는 상위 모듈은 CanIf뿐이다. 송신을 시작하는 서비스를 주고, [[can-controller|CAN 컨트롤러]]의 동작과 상태를 제어한다. 수신, 송신 확인, bus-off는 CanIf의 콜백으로 알리고, 웨이크업은 EcuM(ECU State Manager)에 알린다. CAN Driver 하나는 같은 CAN 하드웨어 유닛에 속한 여러 CAN 컨트롤러를 제어할 수 있다.[@autosar-cp-sws-candriver-2025]
- **CanTrcv**: [[can-transceiver|CAN 트랜시버]]의 동작 모드를 normal, standby, sleep 가운데 하나로 바꾼다.[@autosar-cp-sws-cantransceiverdriver-2025]
- **CanIf**: 아래의 CAN Driver·CanTrcv와 위의 통신 서비스 모듈 사이에서, CAN 하드웨어와 상관없는 일을 모두 맡는다. 상위 모듈의 송신 요청을 CAN Driver로 넘기고, 수신과 송신 확인을 상위 모듈에 알린다. CanSM의 상태 변경 요청을 CAN Driver와 CanTrcv로 넘겨 컨트롤러와 트랜시버의 모드를 바꾸는 경로도 된다. 종류가 다른 여러 CAN 컨트롤러와 트랜시버를 한 인터페이스로 다룬다.[@autosar-cp-sws-caninterface-2025]
- **CanSM**: 설정된 CAN 네트워크마다 상태 기계를 하나씩 두고 통신 상태를 제어한다. ComM(Communication Manager)의 요청에 따라 CanIf의 API로 컨트롤러와 트랜시버의 모드를 바꾸고, 현재 통신 모드를 ComM에 알린다.[@autosar-cp-sws-canstatemanager-2025]
- **CanTp**: [[pdu-router|PduR]] 아래에서, CAN은 8바이트, [[can-fd|CAN FD]]는 64바이트보다 긴 I-PDU(Interaction Layer Protocol Data Unit)를 [[segmentation-and-reassembly|분할하고 재조립]]한다. CanTp 명세는 ISO 15765를 바탕으로 한다.[@autosar-cp-sws-cantransportlayer-2025]
- **CanNm**: 하드웨어에서 독립적인 프로토콜로, 네트워크가 정상 동작과 bus-sleep 모드 사이를 오가는 전환을 조율한다.[@autosar-cp-sws-cannetworkmanagement-2025] 동작은 [[autosar-network-management|AUTOSAR 네트워크 관리]]에서 다룬다.

![[diagrams/autosar-can-stack-modules.svg]]

## 하드웨어 오브젝트

하드웨어 오브젝트(hardware object)는 CAN 컨트롤러의 CAN RAM(Random-Access Memory) 안에 있는 PDU(Protocol Data Unit) 버퍼로, CAN 식별자, [[data-length-code|DLC]], 데이터를 담는다. CanIf는 하드웨어 오브젝트를 HOH(Hardware Object Handle)로 가리키며, HOH는 송신용 HTH(Hardware Transmit Handle)와 수신용 HRH(Hardware Receive Handle) 두 가지다.[@autosar-cp-sws-caninterface-2025]

하드웨어 오브젝트의 handle type(`CanHandleType`)은 `BASIC`과 `FULL` 두 가지다.[@autosar-cp-sws-candriver-2025] `BASIC` 하드웨어 오브젝트 하나는 여러 CAN 식별자를 주고받고, 이런 수신 오브젝트에서는 CanIf가 소프트웨어 필터로 받을 PDU만 골라 올린다. `FULL` 하드웨어 오브젝트 하나는 CAN 식별자 하나만 다룬다.[@autosar-cp-sws-caninterface-2025]

## Bus-off 처리

CAN 컨트롤러가 [[can-fault-confinement|bus-off]]가 되면, CAN Driver는 컨트롤러가 STOPPED 상태에 든 뒤 CanIf에 알린다.[@autosar-cp-sws-candriver-2025] CanIf는 이 알림을 CanSM에 넘긴다.[@autosar-cp-sws-caninterface-2025] CanSM은 bus-off 복구 상태 기계로 CanIf에 컨트롤러를 다시 시작하라고 요청한다. 이때 CanSM은 BswM(Basic Software Mode Manager)에 bus-off 상태를 늘 알리고, Dem(Diagnostic Event Manager) 이벤트 CANSM_E_BUS_OFF를 보고한다. Dem 이벤트 참조는 설정에서 빼 둘 수 있다.[@autosar-cp-sws-canstatemanager-2025] ComM과 BswM은 [[autosar-communication-stack#통신 모드 관리|AUTOSAR 통신 스택]]에서 다룬다.

![[diagrams/can-bus-off-notification-sequence.svg]]
