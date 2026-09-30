---
title: 게이트웨이
tags:
  - network
verified: 2026-09-29
---

ISO/IEC 2382는 **게이트웨이**(gateway)를 네트워크 구조가 서로 다른 두 컴퓨터 네트워크를 잇는 기능 단위로 정의하고[@iso-iec-2382-obp-2015], IEC 60050은 네트워크 구조와 프로토콜이 서로 다른 두 컴퓨터 네트워크를 잇는 기능 단위로 정의한다.[@iec-60050-732-01-17-2010]

차량에서는 [[can|CAN]], [[lin|LIN]], [[flexray|FlexRay]], 이더넷처럼 서로 다른 차량 네트워크를 잇는 ECU가 게이트웨이 역할을 한다.[@nxp-autogwdevwpus-2018][@autosar-cp-sws-pdurouter-2025] NXP 백서에 따르면 차량 게이트웨이는 호환되지 않는 네트워크 사이에서 데이터와 제어 정보를 변환해 둘이 통신할 수 있게 한다.[@nxp-autogwdevwpus-2018]

## 중앙 게이트웨이

NXP는 여러 차량 네트워크를 한데 잇는 중앙 허브 게이트웨이를 중앙 게이트웨이(central gateway)라 부른다. 게이트웨이는 네트워크 사이에서 데이터가 목적지에 닿도록 라우팅하고, 외부 진단 장비와 ECU 사이에서 진단 메시지를 라우팅한다. 이때 [[doip|DoIP]]와 [[uds|UDS]] 사이의 변환이 따를 수 있다. 게이트웨이는 파워트레인, 섀시·안전, 바디, 인포테인먼트, 텔레매틱스, ADAS(Advanced Driver Assistance Systems) 같은 기능 도메인 사이의 데이터를 라우팅한다.[@nxp-autogwdevwpus-2018]

NXP 백서에 따르면 차량 네트워크가 이더넷으로 옮겨 가면 게이트웨이 기능이 도메인 제어기로 나뉠 수 있고, 이때 중앙 게이트웨이는 도메인 사이의 이더넷 패킷을 라우팅한다.[@nxp-autogwdevwpus-2018] 도메인 제어기와 차량 네트워크의 구성은 [[ee-architecture#도메인 아키텍처|E/E 아키텍처]]에서 다룬다.

## PDU 게이트웨이

AUTOSAR의 PDU Router는 I-PDU(Interaction Layer Protocol Data Unit)를 라우팅한다. 통신 인터페이스 모듈로 받은 I-PDU는 같은 통신 인터페이스 모듈이나 다른 통신 인터페이스 모듈로 곧바로 보내고, TP(Transport Protocol) 모듈로 받은 I-PDU도 같은 TP 모듈이나 다른 TP 모듈로 보낸다. 라우팅은 I-PDU를 고치지 않으며, 명세는 이 동작을 PDU Gateway라 부른다. PDU Router는 받은 I-PDU 하나를 여러 목적지로 한꺼번에 보낼 수 있다(1:n). 1:1과 n:1도 지원하지만 n:m은 지원하지 않는다.[@autosar-cp-sws-pdurouter-2025]

PDU 게이트웨이는 I-PDU를 고치지 않고 넘기므로 받은 PDU의 배치를 바꾸지 않는다.[@autosar-cp-sws-pdurouter-2025]

## 시그널 게이트웨이

AUTOSAR COM은 받은 I-PDU의 [[signal-based-communication|시그널]]을 송신할 I-PDU로 옮기는 시그널 게이트웨이를 둔다. 라우팅하는 시그널의 값은 설정에 따라 송신할 시그널로 복사한다.[@autosar-cp-sws-com-2025] AUTOSAR 게이트웨이 요구사항은 시그널 게이트웨이가 COM의 packing·unpacking과 타임아웃 처리 메커니즘을 쓰고, 개별 시그널을 I-PDU 사이에서 1:n으로 라우팅하도록 요구한다. 받은 시그널은 여러 버스로 보낼 수 있다.[@autosar-cp-rs-gateway-2025]

![[diagrams/pdu-signal-gateway.svg]]

AUTOSAR 게이트웨이 요구사항은 시그널 라우팅의 쓰임새로 세 가지를 든다. 여러 ECU의 시그널을 모아 한 ECU가 받는 I-PDU 수를 줄이는 일, 게이트웨이가 보내는 I-PDU 수를 줄이는 일, 이어진 버스들의 페이로드 길이 차이에 맞추는 일이다.[@autosar-cp-rs-gateway-2025]

## 진단 게이트웨이

ISO 13400-2는 IP(Internet Protocol) 기반 네트워크에 곧바로 이어지지 않은 차량 서브네트워크를 두고, 이 서브네트워크와 주고받는 데이터가 서브네트워크를 잇는 DoIP 게이트웨이만 거쳐 오간다고 정의한다. ISO 13400-2는 차량의 하위 구성요소로 오가는 데이터의 라우팅을 필수 기능으로 둔다.[@iso-13400-2-obp-2025]

## 네트워크 관리

AUTOSAR Nm은 게이트웨이 ECU가 이어진 여러 버스를 함께 잠재우는 NM(Network Management) Coordinator 기능을 선택 기능으로 둔다. 여러 네트워크를 함께 깨우는 일은 Nm의 범위 밖이며, 한 네트워크의 시작 요청에 따라 여러 네트워크를 시작하는 일은 ComM 설정이 맡는다.[@autosar-cp-sws-networkmanagementinterface-2025]
