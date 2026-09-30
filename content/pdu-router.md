---
title: PDU Router
tags:
  - platform/autosar
aliases:
  - PduR
verified: 2026-09-30
---

**PDU Router**(PduR)는 [[autosar-communication-stack|AUTOSAR 통신 스택]]의 중심 모듈로, I-PDU(Interaction Layer Protocol Data Unit)를 한 모듈에서 다른 모듈로 넘긴다. [[autosar-com|AUTOSAR COM]]이나 Dcm(Diagnostic Communication Manager) 같은 상위 모듈과, [[can|CAN]]·[[lin|LIN]]·[[flexray|FlexRay]]·[[ethernet|이더넷]]의 통신 인터페이스 모듈과 TP(Transport Protocol) 모듈 같은 하위 모듈 사이에 놓인다.[@autosar-cp-sws-pdurouter-2025]

## 상위 모듈과 하위 모듈

PduR는 I-PDU를 주고받는 모듈을 쓰는 API(Application Programming Interface)에 따라 두 부류로 나눈다.[@autosar-cp-sws-pdurouter-2025]

- **통신 인터페이스 모듈**(communication interface module): I-PDU 하나를 호출 한 번으로 통째로 넘기는 모듈이다. 상위에는 AUTOSAR COM과 IpduM(I-PDU Multiplexer)이, 하위에는 CanIf(CAN Interface), FrIf(FlexRay Interface), CanNm(CAN Network Management), FrNm(FlexRay Network Management), IpduM이 든다. IpduM은 AUTOSAR COM에는 하위 모듈로, 하위 통신 인터페이스에는 상위 모듈로 이어져 두 역할을 한다.
- **전송 프로토콜 모듈**(transport protocol module): 프레임보다 긴 I-PDU도 조각인 N-PDU(Network Layer Protocol Data Unit)로 나눠 주고받을 수 있는 모듈이다. PduR는 조각마다 데이터를 복사해 옮긴다. 상위에는 AUTOSAR COM과 Dcm이, 하위에는 CanTp(CAN Transport Layer), FrTp(FlexRay ISO Transport Layer), LinTp(LIN Transport Protocol), J1939Tp(J1939 Transport Layer)가 든다.[@autosar-cp-sws-pdurouter-2025]

![[diagrams/pdur-upper-lower-modules.svg]]

이 목록은 예일 뿐이고, 다른 모듈과 복합 드라이버도 설정으로 PduR에 붙일 수 있다.[@autosar-cp-sws-pdurouter-2025] 이더넷에서는 SoAd(Socket Adaptor)가 PduR 아래에서 I-PDU를 주고받는다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 라우팅 테이블

PduR는 정적 설정 테이블에서 I-PDU ID로 목적지를 찾아 I-PDU를 넘긴다. 라우팅 경로는 I-PDU마다 정적으로 설정되며, 지원하면 ECU 프로그래밍 상태에서 post-build로 갱신하거나 초기화 때 post-build selectable로 고를 수 있다. PduR는 실행 중에 I-PDU를 동적으로 라우팅하지 않고, 페이로드에 따라 경로를 고르지도 않는다. 다만 라우팅 경로 그룹은 실행 중에 켜고 끌 수 있고, 보통 BswM(Basic Software Mode Manager)이 이 일을 한다.[@autosar-cp-sws-pdurouter-2025]

PduR는 I-PDU를 고치지 않고 넘긴다.[@autosar-cp-sws-pdurouter-2025] PduR의 게이트웨이 기능은 [[vehicle-bus|차량 버스]]에서 다루고, [[gateway|게이트웨이]] 일반은 따로 다룬다.
