---
title: LwM2M
tags:
  - network
aliases:
  - Lightweight Machine to Machine
verified: 2026-10-03
---

**LwM2M**(Lightweight Machine to Machine)은 OMA SpecWorks가 펴내는 장치 관리 프로토콜이다. LwM2M 1.2.2 Core 명세는 LwM2M 장치의 장치 관리와 서비스 활성화(service enablement)를 다루며, LwM2M Client는 흔히 IoT(Internet of Things) 장치와 게이트웨이에 구현된다. 이 명세는 가벼운 프로토콜과 효율적인 데이터 모델을 쓰도록 LwM2M을 설계하고, 메시지 계층은 CoAP(Constrained Application Protocol)를 바탕으로 한 RESTful 설계를 따른다.[@oma-lwm2m-core-1-2-2-2024] oneM2M TS-0005 v5.0.0은 oneM2M 서비스 계층과 OMA의 관리 기술(OMA DM(Device Management) 1.3, OMA DM 2.0, LwM2M) 사이의 프로토콜 변환과 리소스 매핑을 정한다.[@onem2m-ts-0005-2026]

## 전송

LwM2M 1.2.2 Transport 명세는 LwM2M 메시지를 나르는 바인딩으로 [[udp|UDP]], [[transport-layer-security#DTLS|DTLS]](Datagram Transport Layer Security), SMS(Short Message Service), [[tcp|TCP]], [[transport-layer-security|TLS]], Non-IP 전송(셀룰러 IoT, LoRaWAN) 위의 CoAP와, TLS 위의 [[mqtt|MQTT]], TLS 위의 HTTP(Hypertext Transfer Protocol)를 정한다.[@oma-lwm2m-transport-1-2-2-2024] LwM2M 1.0은 UDP와 SMS 위의 CoAP를 지원했고, LwM2M 1.1이 TCP·TLS 위의 CoAP와 Non-IP 위의 CoAP를 더했다.[@oma-lwm2m-transport-1-1-2018] LwM2M 1.2는 MQTT와 HTTP 위의 전송을 새로 넣었다.[@oma-lwm2m-core-1-2-2-2024]

![[diagrams/lwm2m-transport-bindings.svg]]

**CoAP**는 RFC 7252가 정하는 특수 목적의 웹 전송 프로토콜로, ROM(Read-Only Memory)과 RAM(Random-Access Memory)이 작은 제약 노드와 저전력·손실이 많은 제약 네트워크를 위한 것이다. HTTP처럼 요청·응답 모델과 GET, POST, PUT, DELETE 메서드를 쓴다. UDP에 바인딩되고, 고정 헤더가 4바이트로 헤더 부담이 작다.[@ietf-rfc-7252-2014]

LwM2M 1.2.2 Transport 명세는 UDP 위의 CoAP를 DTLS 1.2로, TCP 위의 CoAP를 TLS로 보호하게 정하고, TLS 1.3과 DTLS 1.3은 선택으로 쓸 수 있게 한다. 자격 증명은 인증서, Raw Public Key, 사전 공유 비밀(PSK, Pre-Shared Key) 세 종류를 지원하며, Bootstrap-Server는 셋을 모두 지원해야 한다.[@oma-lwm2m-transport-1-2-2-2024]

## 구성 요소와 객체 모델

LwM2M 1.2.2 Core 명세는 LwM2M을 세 구성 요소로 이루고, 그 사이에 인터페이스 넷을 둔다.[@oma-lwm2m-core-1-2-2-2024]

- LwM2M Client: 장치에서 동작하며, 장치의 정보를 리소스로 내보인다. 리소스는 객체로 묶인다.
- LwM2M Server: Client와 주고받으며 Client를 관리한다. Client 하나가 Server 여럿에 등록할 수 있다.
- LwM2M Bootstrap-Server: Client가 Server에 등록하는 데 필요한 정보(Server의 URI(Uniform Resource Identifier), 자격 증명 등)를 Client에 넣어 준다.[@oma-lwm2m-core-1-2-2-2024]

객체(Object)는 서로 관련된 리소스(Resource)를 모은 것이다. 객체를 인스턴스로 만들어야 그 리소스를 쓸 수 있고, 객체와 리소스는 인스턴스를 여럿 가질 수 있다. 객체, 객체 인스턴스, 리소스, 리소스 인스턴스는 16비트 부호 없는 정수 ID로 가리킨다. 객체 ID는 OMNA(OMA Naming Authority)가 배정하고 관리한다. 예를 들어 Object 3은 Device, Object 5는 Firmware Update다.[@oma-lwm2m-core-1-2-2-2024] 리소스는 `/3/0/1`처럼 객체 ID, 객체 인스턴스 ID, 리소스 ID를 이은 경로로 가리킨다.[@oma-lwm2m-transport-1-2-2-2024]

## 인터페이스

LwM2M 1.2.2 Core 명세는 Client와 Server 사이의 동작을 네 인터페이스로 나눈다.[@oma-lwm2m-core-1-2-2-2024]

- Bootstrap: Bootstrap-Server가 Client에 Server 계정과 키 같은, Server 등록에 필요한 정보를 넣는다.
- Client Registration: Client가 Register, Update, De-register로 Server에 등록하고, 등록을 갱신하거나 해지한다. 등록할 때 지원하는 객체와 가진 객체 인스턴스를 알린다.
- Device Management and Service Enablement: Server가 Client의 리소스를 읽고(Read), 쓰고(Write), 실행한다(Execute). 이 밖에 Create, Delete, Discover, Write-Attributes, Read-Composite, Write-Composite도 있다.
- Information Reporting: Server가 Observe로 관찰을 걸면, Client는 관찰 대상의 값이 바뀌고 관찰 속성의 조건을 채울 때 Notify로 알린다.[@oma-lwm2m-core-1-2-2-2024]

![[diagrams/lwm2m-client-server-interfaces.svg]]

## 펌웨어 업데이트 객체

Object 5(Firmware Update)는 장치의 펌웨어 업데이트를 관리하는 객체로, 펌웨어 패키지의 설치, 업데이트, 업데이트 뒤의 동작을 다룬다. Server는 펌웨어 패키지를 Package 리소스에 직접 써 넣거나(push), 패키지를 받을 URI를 Package URI 리소스에 써 넣는다(pull). Update 리소스는 State가 Downloaded일 때만 실행할 수 있고, 실행되면 받은 패키지로 업데이트를 시작한다.[@oma-lwm2m-core-1-2-2-2024]

State 리소스는 업데이트가 어디까지 왔는지를 네 값으로 나타낸다.[@oma-lwm2m-core-1-2-2-2024]

| 값  | 상태        | 뜻                                     |
| --- | ----------- | -------------------------------------- |
| 0   | Idle        | 내려받기 전이거나 업데이트에 성공한 뒤 |
| 1   | Downloading | 패키지를 내려받는 중                   |
| 2   | Downloaded  | 패키지를 다 받음                       |
| 3   | Updating    | 업데이트하는 중                        |

![[diagrams/lwm2m-firmware-update-states.svg]]

Update Result 리소스는 내려받기나 업데이트의 결과(성공, 플래시 부족, 무결성 검사 실패 등)를 정수로 알린다.[@oma-lwm2m-core-1-2-2-2024]

## 판

OMA가 승인한 LwM2M의 판은 아래와 같다.

| 판    | 승인일                                  |
| ----- | --------------------------------------- |
| 1.0   | 2017-02-08[@oma-lwm2m-ereld-1-0-2017]   |
| 1.1   | 2018-07-10[@oma-lwm2m-ereld-1-2-2-2024] |
| 1.2   | 2020-11-10[@oma-lwm2m-ereld-1-2-2-2024] |
| 1.2.1 | 2022-12-09[@oma-lwm2m-ereld-1-2-2-2024] |
| 1.2.2 | 2024-06-13[@oma-lwm2m-ereld-1-2-2-2024] |

## OMA DM과의 차이

**OMA DM**은 OMA가 LwM2M보다 앞서 펴낸 장치 관리 프로토콜이다. 첫 승인판인 OMA DM 1.1.2는 2003년 12월에 승인됐고, SyncML DM을 바탕으로 했다.[@oma-dm-ereld-1-1-2-2003] OMA의 LwM2M 1.0 요구사항 문서에 따르면 OMA DM은 주로 모바일 장치의 관리에 집중하는 반면, LwM2M은 관리에 더해 서비스 활성화도 다루고, 특히 자원이 제한된 장치를 겨냥해 가볍고 간결한 프로토콜과 평평한 데이터 구조를 쓴다.[@oma-lwm2m-rd-1-0-2017]

OMA DM은 1.3과 2.0이 모두 승인된 판으로 남아 있다.[@oma-dm-ad-1-3-2016][@oma-dm-ad-2-0-2016]

- OMA DM 1.3 명세는 DM Notification을 뺀 DM 메시지를 XML(Extensible Markup Language)로 정하고(WBXML(WAP Binary XML) 이진 인코딩도 가능), 메시지의 루트 요소를 SyncML로 둔다.[@oma-dm-protocol-1-3-2016][@oma-dm-reppro-1-3-2016] 클라이언트와 서버 사이의 프로토콜은 특정 전송에 묶이지 않고, HTTP와 HTTPS(HTTP over TLS)를 비롯한 표준 바인딩을 둔다.[@oma-dm-ad-1-3-2016] 장치의 관리 대상(Management Object)은 Management Tree라는 계층 트리로 나타내고, 트리의 노드는 URI로 가리킨다.[@oma-dm-protocol-1-3-2016]
- OMA DM 2.0은 RESTful 설계를 따르는 HTTP 기반의 새 클라이언트·서버 프로토콜을 넣었고, DM 1.3까지의 Management Object는 그대로 쓴다.[@oma-dm-ad-2-0-2016] OMA DM 2.0 명세는 DM 세션 패키지의 JSON(JavaScript Object Notation) 형식을 정하고, 서버와 클라이언트가 모두 이를 지원하게 한다.[@oma-dm-protocol-2-0-2016]
