---
title: PDU Router
tags:
  - platform/autosar
aliases:
  - PduR
verified: 2026-09-30
---

**PDU Router**(PduR)는 [[autosar-communication-stack|AUTOSAR 통신 스택]]의 중심 모듈로, I-PDU(Interaction Layer Protocol Data Unit)를 한 모듈에서 다른 모듈로 넘긴다. [[autosar-com|AUTOSAR COM]]이나 Dcm(Diagnostic Communication Manager) 같은 상위 모듈과, L-SDU Router(LSduR) 같은 통신 인터페이스 모듈과 TP(Transport Protocol) 모듈 같은 하위 모듈 사이에 놓인다.[@autosar-cp-sws-pdurouter-2025] [[can|CAN]]·[[flexray|FlexRay]]·[[lin|LIN]]의 버스 인터페이스 모듈은 LIN의 TP 부분을 빼면 PduR 바로 아래가 아니라 LSduR 아래에 놓인다.[@autosar-cp-sws-caninterface-2025][@autosar-cp-sws-flexrayinterface-2025][@autosar-cp-sws-lininterface-2025]

## 상위 모듈과 하위 모듈

PduR는 I-PDU를 주고받는 모듈을 쓰는 API(Application Programming Interface)에 따라 두 부류로 나눈다.[@autosar-cp-sws-pdurouter-2025]

- **통신 인터페이스 모듈**(communication interface module): I-PDU 하나를 호출 한 번으로 통째로 넘기는 모듈이다. 상위에는 AUTOSAR COM과 IpduM(I-PDU Multiplexer)이, 하위에는 [[autosar-network-management|CanNm]], FrNm(FlexRay Network Management), IpduM, LSduR가 든다. IpduM은 AUTOSAR COM에는 하위 모듈로, 하위 통신 인터페이스에는 상위 모듈로 이어져 두 역할을 한다.
- **전송 프로토콜 모듈**(transport protocol module): 프레임보다 긴 I-PDU도 조각인 N-PDU(Network Layer Protocol Data Unit)로 나눠 주고받을 수 있는 모듈이다. PduR는 조각마다 데이터를 복사해 옮긴다. 상위에는 AUTOSAR COM과 Dcm이, 하위에는 CanTp(CAN Transport Layer), FrTp(FlexRay ISO Transport Layer), LinTp(LIN Transport Protocol), J1939Tp(J1939 Transport Layer)가 든다.[@autosar-cp-sws-pdurouter-2025]

![[diagrams/pdur-upper-lower-modules.svg]]

이 목록은 예일 뿐이고, 다른 모듈과 복합 드라이버도 설정으로 PduR에 붙일 수 있다.[@autosar-cp-sws-pdurouter-2025] [[ethernet|이더넷]]에서는 SoAd(Socket Adaptor)가 PduR 아래에서 I-PDU를 주고받는다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

**LSduR**는 정적으로 정한 ID에 따라 L-SDU(Link Layer Service Data Unit)를 라우팅하는 모듈이다. PduR와 버스별 네트워크 관리·전송 프로토콜 모듈은 LSduR를 거쳐 그 아래의 버스 인터페이스 모듈과 이어진다.[@autosar-cp-sws-lsdurouter-2025] [[autosar-can-stack|CanIf]]와 FrIf(FlexRay Interface)는 수신과 송신 확인을 LSduR의 콜백으로 알린다.[@autosar-cp-sws-caninterface-2025][@autosar-cp-sws-flexrayinterface-2025] LinIf(LIN Interface)도 프레임을 LSduR나 복합 드라이버 같은 위 모듈과 주고받는다. 다만 LinIf 안의 LinTp 부분은 LSduR를 거치지 않고 PduR를 위 모듈로 둔다.[@autosar-cp-sws-lininterface-2025]

AUTOSAR R25-11의 BSW(Basic Software) 일반 명세는 LSduR를 Communication Hardware Abstraction 층에 둔다.[@autosar-cp-sws-bswgeneral-2025] AUTOSAR R25-11의 LSduR 명세는 LSduR에 시그널을 꺼내거나 변환하는 메커니즘과 체크섬 같은 무결성 검사 메커니즘을 두지 않는다. LSduR는 L-SDU를 고치지 않고, 페이로드에 따라 경로를 고르지 않으며, 통신 인터페이스 모듈 사이에서 rate를 바꾸는 라우팅도 지원하지 않는다.[@autosar-cp-sws-lsdurouter-2025]

LSduR는 IEEE1722Tp(IEEE1722 Transport Layer) 같은 위 모듈이 보낸 L-SDU를 여러 목적지로 보낼 수 있다(1:n). 위 모듈은 목적지가 몇인지 모르므로, LSduR는 목적지 가운데 하나라도 송신 요청에 E_OK를 돌려주면 위 모듈에 E_OK를 돌려주고, 마지막 목적지의 송신 확인을 받은 뒤에야 위 모듈에 송신 확인을 준다.[@autosar-cp-sws-lsdurouter-2025]

![[diagrams/lsdur-one-to-many-transmit.svg]]

## 라우팅 테이블

PduR는 정적 설정 테이블에서 I-PDU ID로 목적지를 찾아 I-PDU를 넘긴다. 라우팅 경로는 I-PDU마다 정적으로 설정되며, 지원하면 ECU 프로그래밍 상태에서 post-build로 갱신하거나 초기화 때 post-build selectable로 고를 수 있다. PduR는 실행 중에 I-PDU를 동적으로 라우팅하지 않고, 페이로드에 따라 경로를 고르지도 않는다. 다만 라우팅 경로 그룹은 실행 중에 켜고 끌 수 있고, 보통 BswM(Basic Software Mode Manager)이 이 일을 한다.[@autosar-cp-sws-pdurouter-2025]

PduR는 I-PDU를 고치지 않고 넘긴다. TP 게이트웨이에서는 I-PDU를 다 받기 전에 목적지로 넘기기 시작할 수 있으며, 이를 **on-the-fly gatewaying**이라 한다. 큰 데이터를 두 인터페이스 사이에서 옮길 때 소스 네트워크에서 모두 받기 전에 목적지 네트워크로 보내기 시작해 메모리와 시간을 아낀다.[@autosar-cp-sws-pdurouter-2025] AUTOSAR R25-11 Layered Software Architecture는 PduR의 규모를 ECU마다 다르게 두고, 통신 컨트롤러가 하나뿐인 ECU 같은 경우에는 크기가 0까지 줄 수 있다고 둔다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] PduR의 게이트웨이 기능은 [[gateway#PDU 게이트웨이|PDU 게이트웨이]]에서 다룬다.
