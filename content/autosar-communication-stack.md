---
title: AUTOSAR 통신 스택
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR 통신 스택**은 [[autosar-classic-platform|AUTOSAR Classic Platform]]의 BSW(Basic Software)에서 차량 네트워크 통신을 맡는 모듈들의 묶음이다. 스택은 BSW의 세 층에 걸쳐 Communication Services, Communication Hardware Abstraction, Communication Drivers로 나뉜다. Communication Services와 드라이버 사이에는 Communication Hardware Abstraction이 놓인다. Communication Services는 버스의 프로토콜과 메시지의 속성을 응용에서 감춘다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] 맨 위의 [[autosar-com|AUTOSAR COM]]은 [[autosar-rte|RTE]] 같은 사용자에게 [[signal-based-communication|시그널]] 단위의 데이터 인터페이스를 준다.[@autosar-cp-sws-com-2025]

## 층

- **Communication Drivers**: [[microcontroller-abstraction-layer|MCAL]]에 속하며, ECU 안의 통신(SPI(Serial Peripheral Interface) 등)과 차량 통신([[can|CAN]] 등)의 드라이버를 담는다. SPI Handler Driver, [[lin|LIN]] Driver, CAN Driver, [[flexray|FlexRay]] Driver, [[ethernet|Ethernet]] Driver가 여기에 든다.
- **Communication Hardware Abstraction**: [[ecu-abstraction-layer|ECU Abstraction Layer]]에 속하며, 통신 컨트롤러가 칩 안에 있든 보드 위에 있든 같은 방식으로 버스 채널에 접근하게 한다. 통신 시스템마다 따로 두며, 구현은 마이크로컨트롤러에서 독립적이고 ECU 하드웨어와 외부 장치에 의존한다. CAN Interface, CAN Transceiver Driver, Ethernet Interface 같은 모듈이 여기에 든다.
- **Communication Services**: Services Layer에 속하며, 차량 네트워크에 한결같은 통신 인터페이스, 네트워크 관리 서비스, 진단 통신 인터페이스를 준다. 구현은 마이크로컨트롤러와 ECU 하드웨어에서 독립적이고 버스 종류에 일부 의존한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

AUTOSAR COM, Generic [[autosar-network-management|NM]] Interface, Dcm(Diagnostic Communication Manager)은 버스 종류가 달라도 같은 모듈을 쓰고, ECU 하나에 하나씩만 둔다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## PDU의 이름

AUTOSAR는 데이터 단위 PDU(Protocol Data Unit)에 층마다 접두어를 붙여 이름을 짓는다. 위층이 넘긴 PDU를 아래층은 자기 SDU(Service Data Unit)로 받는다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] AUTOSAR COM과 [[pdu-router|PduR]] 사이에서는 I-PDU(Interaction Layer PDU), 전송 프로토콜 모듈과 버스 인터페이스 사이에서는 N-PDU(Network Layer PDU), 버스 인터페이스와 드라이버 사이에서는 L-PDU(Data Link Layer PDU)라 부른다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-cp-sws-com-2025] PduR는 AUTOSAR COM의 I-PDU를 통신 인터페이스 모듈이나 전송 프로토콜 모듈로 보낸다.[@autosar-cp-sws-pdurouter-2025]

이 이름은 [[osi-model|OSI 참조 모델]]의 층과 대응한다. AUTOSAR COM, Dcm, PduR, IPDU Multiplexer는 6층(표현 계층, AUTOSAR에서는 상호작용 계층)에, 전송 프로토콜 모듈은 3층(네트워크 계층)에, 버스 인터페이스와 드라이버는 2층(데이터 링크 계층)에 둔다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/autosar-pdu-names-osi-layers.svg]]

## 버스별 스택

State Manager, NM, 전송 프로토콜은 버스마다 따로 두는 모듈이고, 통신 드라이버에는 버스마다 둔 인터페이스를 거쳐 접근한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] 버스마다 스택을 이루는 모듈은 다음과 같다.

| 버스    | State Manager          | NM              | 전송 프로토콜                                                               | 그 밖의 모듈                                                                                                                                |
| ------- | ---------------------- | --------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| CAN     | CAN State Manager      | CAN NM          | CanTp(CAN Transport Layer)                                                  | CAN Interface, CAN Transceiver Driver, CAN Driver[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-cp-sws-cantransportlayer-2025] |
| LIN     | LIN State Manager      | —               | 진단용 전송 프로토콜                                                        | LIN Interface, LIN Transceiver Driver, LIN Driver[@autosar-cp-exp-layeredsoftwarearchitecture-2025]                                         |
| FlexRay | FlexRay State Manager  | FlexRay NM      | FrTp(FlexRay ISO Transport Layer)나 FrArTp(FlexRay AUTOSAR Transport Layer) | FlexRay Interface, FlexRay Driver[@autosar-cp-exp-layeredsoftwarearchitecture-2025]                                                         |
| 이더넷  | Ethernet State Manager | [[udp\|UDP]] NM | —                                                                           | Socket Adaptor, TcpIp, Ethernet Interface, Ethernet Driver[@autosar-cp-exp-layeredsoftwarearchitecture-2025]                                |

CAN 스택은 [[can-fd|CAN FD]]도 다루되, 하드웨어가 이를 지원할 때에 한한다. FlexRay 스택은 전송 프로토콜로 FrTp와 FrArTp 가운데 하나를 쓴다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] CAN 스택의 구성은 [[autosar-can-stack|AUTOSAR CAN 스택]]에서 다룬다.

LIN의 전송 프로토콜 LinTp(LIN Transport Protocol)는 LIN Interface 안에 있다. LIN Interface는 위층이 요청하면 마스터 노드의 스케줄 테이블을 바꾼다.[@autosar-cp-sws-lininterface-2025]

## 이더넷

TcpIp 모듈은 [[tcp|TCP]], UDP, [[ipv4|IPv4]], [[ipv6|IPv6]], [[arp|ARP]], [[icmp|ICMP]], DHCP(Dynamic Host Configuration Protocol)를 구현하고, 이더넷 위에서 소켓 기반 통신을 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] AUTOSAR Classic Platform R25-11의 TcpIp 명세는 소켓 소유자마다 위층 모듈의 종류를 SoAd(Socket Adaptor)와 CDD(Complex Driver) 가운데 하나로 설정하게 하고, CDD가 위층인 소켓에는 설정한 API(Application Programming Interface) 이름으로 위층을 부르도록 정한다. 이 명세는 CDD 인터페이스로 위층 모듈을 더 둘 수 있게 하지만, 소켓 하나를 여러 위층 모듈에 나눠 주는 것은 지원하려 하지 않는다.[@autosar-cp-sws-tcpip-2025] R25-11의 SoAd 명세도 SoAd를 TcpIp 모듈의 위층 모듈 가운데 하나로 둔다.[@autosar-cp-sws-socketadaptor-2025]

SoAd는 PDU를 쓰는 통신 서비스 모듈과 소켓 기반의 [[internet-protocol-suite|TCP/IP]] 스택을 잇고, I-PDU ID와 소켓 연결을 서로 대응시킨다. SoAd는 PDU 하나에 소켓 연결 하나를 대응시키거나, 선택 기능인 PDU 헤더를 붙여 여러 PDU를 한 소켓 연결로 보낸다. PDU 헤더는 PDU 식별자(4바이트)와 길이(4바이트)를 [[byte-order|빅 엔디언]]으로 담는다.[@autosar-cp-sws-socketadaptor-2025]

SOME/IP Transformer와 SoAd의 SOME/IP 역할은 [[some-ip|SOME/IP]]에서, DoIP 모듈은 [[doip|DoIP]]에서 다룬다.

## 통신 모드 관리

ComM(Communication Manager)은 사용자의 버스 통신 요청을 모아 조정하며, 사용자는 하드웨어나 채널을 몰라도 통신 모드만 요청하면 된다. ComM은 채널마다 상태 기계를 두고, 그 채널을 맡은 버스별 State Manager에 통신 모드를 요청한다. 실제 버스 상태는 State Manager가 다룬다. NM 변형이 `FULL`인 채널에서 ComM은 전체 통신 요청을 받으면 NM에 네트워크를 요청하고, 통신이 필요 없어지면 네트워크를 놓는다.[@autosar-cp-sws-commanager-2025]

통신 모드는 통신 없음(NO), 송신을 끄고 수신만 하는 silent, 송수신 모두(FULL) 셋이다. 사용자가 요청할 수 있는 것은 NO와 FULL뿐이고, silent는 네트워크 동기화에만 쓴다.[@autosar-cp-sws-commanager-2025]

BswM(Basic Software Mode Manager)은 [[autosar-software-component|SW-C]]와 다른 BSW 모듈이 보낸 모드 요청과 모드 표시를 입력으로 받아 설정된 규칙(rule)을 평가하고, 그 결과에 따라 동작 목록(action list)을 실행한다. 동작의 예로 [[autosar-com#I-PDU 그룹|I-PDU 그룹]]을 켜거나 끄는 일이 있다.[@autosar-cp-sws-bswmodemanager-2025]

## 그 밖의 모듈

Communication Services에는 Dlt(Diagnostic Log and Trace), XCP(Universal Measurement and Calibration Protocol), 트랜스포머(SOME/IP, COM 기반, E2E(End-to-End)), IPDU Multiplexer, Secure Onboard Communication, J1939Tp(J1939 Transport Layer)도 든다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] AUTOSAR Classic Platform R25-11은 LdCom(Large Data COM)의 기능을 AUTOSAR COM의 Large Data Path로 합쳤다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-cp-sws-com-2025] [[uds|UDS]] 진단 서비스는 Dcm이 맡는다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025] Dem(Diagnostic Event Manager)은 통신 서비스가 아니라 System Services에 든다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]
