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

AUTOSAR R25-11의 BSW 일반 명세는 위 목록 밖의 모듈도 두 층에 둔다. Communication Drivers에는 I2C(Inter-Integrated Circuit) Driver와 [[can-xl|CAN XL]] Driver가 들고, Communication Hardware Abstraction에는 L-SDU(Link Layer Service Data Unit) Router(LSduR), Ethernet Switch Driver(EthSwt), Ethernet Transceiver Driver(EthTrcv), LIN Transceiver Driver(LinTrcv), FlexRay Transceiver Driver(FrTrcv), CAN XL Transceiver Driver(CanXLTrcv)가 든다.[@autosar-cp-sws-bswgeneral-2025]

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

[[autosar-can-stack|CAN 스택]]은 [[can-fd|CAN FD]]도 다루되, 하드웨어가 이를 지원할 때에 한한다. FlexRay 스택은 전송 프로토콜로 FrTp와 FrArTp 가운데 하나를 쓴다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

LIN의 전송 프로토콜 LinTp(LIN Transport Protocol)는 LIN Interface 안에 있다. LIN Interface는 위층이 요청하면 마스터 노드의 스케줄 테이블을 바꾼다.[@autosar-cp-sws-lininterface-2025]

## 이더넷

TcpIp 모듈은 [[tcp|TCP]], UDP, [[ipv4|IPv4]], [[ipv6|IPv6]], [[arp|ARP]], [[icmp|ICMP]], [[dhcp|DHCP]]를 구현하고, 이더넷 위에서 소켓 기반 통신을 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] TcpIp 모듈의 위층 모듈은 소켓 소유자마다 SoAd(Socket Adaptor)와 CDD(Complex Driver) 가운데 하나로 설정되고, CDD가 위층인 소켓에서는 TcpIp 모듈이 설정한 API 이름으로 위층을 부른다. CDD 인터페이스로 위층 모듈을 더 둘 수는 있지만, 소켓 하나를 여러 위층 모듈에 나눠 주는 것은 지원 대상이 아니다.[@autosar-cp-sws-tcpip-2025] SoAd는 TcpIp 모듈의 위층 모듈 가운데 하나다.[@autosar-cp-sws-socketadaptor-2025]

SoAd는 PDU를 쓰는 통신 서비스 모듈과 소켓 기반의 [[internet-protocol-suite|TCP/IP]] 스택을 잇고, I-PDU ID와 소켓 연결을 서로 대응시킨다. SoAd는 PDU 하나에 소켓 연결 하나를 대응시키거나, 선택 기능인 PDU 헤더를 붙여 여러 PDU를 한 소켓 연결로 보낸다. PDU 헤더는 PDU 식별자(4바이트)와 길이(4바이트)를 [[byte-order|빅 엔디언]]으로 담는다.[@autosar-cp-sws-socketadaptor-2025]

SOME/IP Transformer와 SoAd의 SOME/IP 역할은 [[some-ip|SOME/IP]]에서, DoIP 모듈은 [[doip|DoIP]]에서 다룬다.

## 통신 모드 관리

ComM(Communication Manager)은 사용자의 버스 통신 요청을 모아 조정하며, 사용자는 하드웨어나 채널을 몰라도 통신 모드만 요청하면 된다. ComM은 채널마다 상태 기계를 두고, 그 채널을 맡은 버스별 State Manager에 통신 모드를 요청한다. 실제 버스 상태는 State Manager가 다룬다. NM 변형이 `FULL`인 채널에서 ComM은 전체 통신 요청을 받으면 NM에 네트워크를 요청하고, 통신이 필요 없어지면 네트워크를 놓는다.[@autosar-cp-sws-commanager-2025]

통신 모드는 통신 없음(NO), 송신을 끄고 수신만 하는 silent, 송수신 모두(FULL) 셋이다. 사용자가 요청할 수 있는 것은 NO와 FULL뿐이고, silent는 네트워크 동기화에만 쓴다.[@autosar-cp-sws-commanager-2025]

[[basic-software-mode-manager|BswM]]은 [[autosar-software-component|SW-C]]와 BSW 모듈의 모드 요청을 규칙으로 평가해 [[autosar-com#I-PDU 그룹|I-PDU 그룹]]을 켜고 끄는 것 같은 동작을 실행한다.[@autosar-cp-sws-bswmodemanager-2025]

## I-PDU 다중화

IpduM(I-PDU Multiplexer)은 두 가지 다중화를 맡는 모듈이다. 하나는 PduR가 Communication Hardware Abstraction으로 넘기는 같은 I-PDU ID에 레이아웃을 여럿 두는 I-PDU 다중화이고, 다른 하나는 여러 I-PDU를 container PDU 하나에 모아 큰 I-PDU 하나로 보내는 방식이다. 뒤의 방식은 새 버스의 큰 프레임을 살려, 보통 8바이트인 작은 I-PDU로도 대역폭을 효율적으로 쓰게 한다. IpduM은 다른 모듈이 기대지 않게 구현하므로, 필요 없으면 IpduM 없이 시스템을 만들 수 있다.[@autosar-cp-sws-ipdumultiplexer-2025]

다중화한 I-PDU는 시그널이나 시그널 그룹 0개 이상으로 된 정적 부분과, selector field와 시그널이나 시그널 그룹 1개 이상으로 된 동적 부분으로 이루어진다. 동적 부분은 C 언어의 union과 비슷해, I-PDU 안의 selector field 값에 따라 실제 레이아웃이 정해진다. selector field는 다중화한 I-PDU마다 하나이고, 크기는 이어진 1비트에서 16비트 사이로 설정한다. 송신 쪽 IpduM은 [[autosar-com|AUTOSAR COM]]의 I-PDU들을 다중화한 I-PDU로 합쳐 PduR에 돌려주고, 수신 쪽 IpduM은 selector field 값을 보고 다중화한 I-PDU를 해석해 나눈 I-PDU를 COM에 넘긴다. 다중화는 CAN에서 온 개념이지만 CAN에 한정되지 않는다. IpduM은 Communication Hardware Abstraction 위에서 PduR 옆에 놓이므로, FlexRay처럼 PduR가 다루는 모든 버스에 쓸 수 있다.[@autosar-cp-sws-ipdumultiplexer-2025]

Container PDU의 레이아웃은 contained I-PDU마다 앞에 헤더를 붙이는 동적 레이아웃이나, 헤더 없이 contained I-PDU의 자리를 미리 정해 두는 정적 레이아웃으로 정한다. PduR가 보기에 contained I-PDU와 container PDU는 둘 다 보통의 PDU다.[@autosar-cp-sws-ipdumultiplexer-2025]

![[diagrams/ipdum-container-pdu-layouts.svg]]

## Data Distribution Service

Dds는 OMG(Object Management Group)의 미들웨어 프로토콜·API 표준인 DDS(Data Distribution Service)를 다루는 BSW 모듈이다. Dds는 [[autosar-sender-receiver-interface|sender-receiver]], [[autosar-client-server-interface|client-server]], trigger 인터페이스를 쓰는 [[signal-based-communication|시그널 기반]] 통신 경로를 지원한다. 송신 쪽에서는 DDS Transformer(DdsXf)가 응용 데이터를 버퍼에 복사하고, Dds가 이를 처리해 패킷으로 직렬화한 뒤 PDU에 담아 PduR를 거쳐 SoAd 같은 전송 계층으로 보낸다. 데이터가 없는 trigger 인터페이스에서는 DDS Transformer를 쓰지 않는다.[@autosar-cp-sws-datadistributionservice-2025]

Dds는 실행 중에 원격 participant와 endpoint, 그 사이의 서비스 인스턴스 관계를 찾는 발견 메커니즘으로 SPDP(Simple Participant Discovery Protocol), SEDP(Simple Endpoint Discovery Protocol), Service Discovery 프로토콜을 지원한다. SPDP는 멀티캐스트로, SEDP는 유니캐스트로 주고받는다. 모두 동적으로 찾는 구성, participant만 정적으로 두는 구성, 모두 정적으로 설정하는 구성을 둘 수 있다.[@autosar-cp-sws-datadistributionservice-2025]

AUTOSAR Classic Platform R25-11은 DDS에 SOA(Service-Oriented Architecture) 지원을 들였다. 그전까지 [[some-ip|SOME/IP]]로 다루던 Event, Method, Field의 관리를 DDS로 넓히고, client-server 인터페이스를 온전히 지원하며, 새 BSW 모듈인 DDS Transformer를 두었다. OMG의 SPDP·SEDP 발견 프로토콜과 [[autosar-adaptive-platform|Adaptive Platform]]이 정한 Service Discovery 프로토콜도 함께 들였다. DDS Transformer 명세는 이 릴리스에 새로 나왔다.[@autosar-cp-tr-releaseoverview-2025]

## Bus Mirroring

Bus Mirroring 모듈은 내부 버스의 트래픽과 상태를 외부 버스로 복제해, 외부 버스에 이은 테스터가 디버깅을 위해 내부 버스를 볼 수 있게 한다. 테스터는 [[gateway|게이트웨이]] 같은 중간 ECU에 진단 명령을 보내 무엇을 복제할지 설정하므로, 보안 검사를 거치지 않고는 미러링을 켤 수 없다. 모듈은 여러 소스 버스에서 프레임을 모아 목적지 버스로 보내며, 메시지 루프와 침입을 막으려고 한 방향으로만 보낸다. 그래서 생성 도구는 어떤 채널도 소스 버스이면서 목적지 버스가 되지 않게 한다.[@autosar-cp-sws-busmirroring-2025]

Bus Mirroring 모듈은 처음에는 꺼져 있고, 소스 버스를 하나 켜야 그 버스의 프레임과 상태를 모으기 시작한다. 목적지 버스를 바꾸면 모든 소스 버스와 필터를 끄고, 아직 보내지 않은 프레임을 버린다. 버스마다 맞는 정보를 따로 고르게 해, 다른 버스로 바꾸었을 때 그 버스에 부하가 몰리지 않게 하려는 것이다.[@autosar-cp-sws-busmirroring-2025]

Bus Mirroring 모듈은 대체로 목적지 버스보다 프레임이 크거나 부가 정보가 많은 소스 버스를 지원하지 않으며, 복제한 프레임을 쪼개지 않는다. 버스 인터페이스 모듈이 실제로 주고받은 트래픽만 복제하므로, CAN에서는 보낸 프레임과 하드웨어 필터를 지난 데이터 프레임만 복제하고 [[remote-frame|리모트 프레임]]과 [[can-error-frame|오류 프레임]]은 복제하지 않는다. 이더넷에서 이더넷으로 보내는 미러링도 지원하지 않는데, 이 쓰임새는 Ethernet Switch Driver의 port mirroring이 맡는다.[@autosar-cp-sws-busmirroring-2025]

## 그 밖의 모듈

Communication Services에는 [[autosar-log-and-trace|Dlt]], XCP(Universal Measurement and Calibration Protocol), [[autosar-transformer|transformer]](SOME/IP, COM 기반, [[autosar-e2e-protection|E2E]]), IPDU Multiplexer, [[secure-onboard-communication|Secure Onboard Communication]], J1939Tp(J1939 Transport Layer)도 든다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] AUTOSAR Classic Platform R25-11은 LdCom(Large Data COM)의 기능을 AUTOSAR COM의 Large Data Path로 합쳤다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-cp-sws-com-2025] [[uds|UDS]] 진단 서비스는 Dcm이 맡는다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025] [[diagnostic-event-manager|Dem]]은 통신 서비스가 아니라 [[autosar-layered-architecture#BSW의 층|System Services]]에 든다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

AUTOSAR Classic Platform R25-11은 양산 차량의 여러 ECU에서 데이터를 모으도록 설계한 VDP(Vehicle Data Protocol)를 들였다. VDP는 샘플링과 송신을 체계적으로 떼어 놓고, 여러 샘플링·송신 전략을 지원한다. VdpCmR(VDP Communication Module Remote) 명세도 이 릴리스에 새로 나왔다.[@autosar-cp-tr-releaseoverview-2025] VdpCmR은 VDP의 원격 ECU 쪽을 구현한다. 데이터 클래스 어댑터가 `VdpCmR_AddSample`로 샘플을 넘기면 VdpCmR은 이를 데이터 메시지 버퍼에 담고, [[autosar-time-synchronization#StbM|StbM]]에서 현재 타임스탬프를 받아 붙인다.[@autosar-cp-sws-vdpcmremote-2025]

XCP 모듈은 ASAM이 정한 XCP를 구현한다. XCP는 마스터(도구)와 슬레이브(장치) 사이의 프로토콜로, 동기 데이터 수집(측정), 동기 데이터 자극, 온라인 메모리 캘리브레이션, 캘리브레이션 데이터 페이지 전환, 개발용 플래시 프로그래밍을 준다. XCP 모듈은 CAN, FlexRay, 이더넷 버스를 지원한다.[@autosar-cp-sws-xcp-2025]

충전 모듈 ISO15118Chrg는 서비스 층에 놓이고, PDU 구조를 정하는 V2GTP(Vehicle to Grid Transport Protocol)와 XML 데이터를 압축하는 EXI(Efficient XML Interchange)를 구현한다. 이 모듈은 데이터 인증과 암호화, 인증서 관리와 검증을 위해 [[autosar-crypto-stack|암호 스택]]과 주고받는다. AUTOSAR Classic Platform R25-11은 이 모듈의 이름을 ChrgM(Charging Manager)에서 ISO15118Chrg로 바꾸었다.[@autosar-cp-sws-iso15118charging-2025] 같은 릴리스의 Layered Software Architecture 설명서는 옛 이름 ChrgM을 그대로 쓴다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

IEEE1722Tp(IEEE1722 Transport Layer)는 브리지로 이은 LAN에서 시간에 민감한 응용이 [[ieee-1722|IEEE 1722]] 전송 프로토콜을 쓰게 하는 Classic Platform 모듈이다. 응용은 [[ieee-1722|AVTP]] 스트림으로 데이터를 주고받는다. 이 모듈은 IEEE 1722가 정한 AVTP subtype 가운데 일부를 지원해, 오디오·비디오 스트리밍, media clock 배포, CAN과 LIN 프레임 같은 버스 프레임의 캡슐화를 다룬다.[@autosar-cp-sws-ieee1722transportlayer-2025]

AUTOSAR Classic Platform R25-11은 V2X(Vehicle-to-X) 관련 명세(V2XBasicTransport, V2XFacilities, V2XGeoNetworking, V2XManagement, V2XDataManager, 중국 V2X 명세들)와 Cellular V2X Driver 명세를 obsolete로 돌렸다.[@autosar-cp-tr-releaseoverview-2025]

J1939 모듈(J1939Tp, J1939Nm, J1939Rm, J1939Dcm, J1939Fscp)은 [[j1939#AUTOSAR의 J1939 지원|J1939]]에서 다룬다.[@autosar-cp-sws-bswgeneral-2025]
