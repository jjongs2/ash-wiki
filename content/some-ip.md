---
title: SOME/IP
tags:
  - network/ethernet
  - network/tcp-ip
aliases:
  - Scalable service-Oriented MiddlewarE over IP
verified: 2026-09-28
---

**SOME/IP**(Scalable service-Oriented MiddlewarE over IP)는 차량의 ECU 사이에서 IP 네트워크를 거쳐 [[service-oriented-communication|서비스 지향 통신]]을 하게 하는 프로토콜이다. 원격 절차 호출(RPC, Remote Procedure Call), 이벤트 알림, 그리고 그 밑에 깔리는 직렬화 형식을 정한다. 프로토콜 명세는 [[autosar|AUTOSAR]]가 펴낸다.[@autosar-fo-prs-someipprotocol-2025] BMW가 쓴 SOME/IP 명세 초안은 2011년 11월에 처음 공개되었고, BMW는 이 초안을 ISO와 AUTOSAR 등에 표준화를 위해 제공했다.[@bmw-someip-specification-draft-2012] [[autosar-classic-platform|AUTOSAR Classic Platform]]에는 데이터를 SOME/IP 형식으로 직렬화하는 SOME/IP Transformer가 있고[@autosar-cp-sws-someiptransformer-2025], [[autosar-adaptive-platform|Adaptive Platform]]의 [[autosar-communication-management|Communication Management]]는 SOME/IP와 [[some-ip-sd|SOME/IP-SD]]를 구현하는 SOME/IP 네트워크 바인딩을 둔다.[@autosar-ap-sws-communicationmanagement-2025]

## 전송

SOME/IP는 [[udp|UDP]]와 [[tcp|TCP]]를 전송 프로토콜로 지원한다. 한 ECU의 서버 쪽에서 같은 서비스의 인스턴스가 여럿이면 인스턴스마다 다른 [[port-number|포트 번호]]를 쓴다. 명세는 UDP에서 SOME/IP 페이로드를 0\~1400바이트로 두고, 이보다 크면 TCP로 보내거나 나눠 보내기를 권한다. UDP로 보내기에 큰 메시지는 SOME/IP-TP(SOME/IP Transport Protocol)로 나눈다.[@autosar-fo-prs-someipprotocol-2025]

UDP 바인딩에서 SOME/IP는 메시지가 닿을 수도 있다는 "maybe" 신뢰성만 제공하고, 그 이상의 오류 처리는 애플리케이션이 맡는다. TCP 바인딩에서는 "exactly once"다.[@autosar-fo-prs-someipprotocol-2025]

TCP는 주고받은 세그먼트의 경계와 애플리케이션이 읽고 쓰는 단위의 경계가 서로 대응한다고 보장하지 않는다.[@ietf-rfc-9293-2022] SOME/IP는 시험 도구가 TCP로 오가는 SOME/IP 메시지의 경계를 찾을 수 있도록, TCP 메시지 스트림에 Magic Cookie 메시지를 일정 간격으로 끼워 넣을 수 있게 한다. Magic Cookie 메시지의 Service ID는 `0xFFFF`이고, Method ID는 클라이언트에서 서버로 갈 때 `0x0000`, 서버에서 클라이언트로 갈 때 `0x8000`이다.[@autosar-fo-prs-someipprotocol-2025]

## 헤더

상호운용을 위해 SOME/IP 헤더의 배치는 모든 구현에서 같아야 한다. 헤더 필드는 모두 [[byte-order#네트워크 바이트 순서|네트워크 바이트 순서]]로 인코딩하며, 앞에서부터 32비트 필드 Message ID, Length, Request ID와 8비트 필드 Protocol Version, Interface Version, Message Type, Return Code 순서로 놓인다. Message ID는 앞 16비트가 Service ID, 뒤 16비트가 Method ID이고, Request ID는 앞 16비트가 Client ID, 뒤 16비트가 Session ID다. Length는 Request ID부터 메시지 끝까지의 바이트 수다. Protocol Version은 SOME/IP 프로토콜 버전으로 1이고, Interface Version은 [[service-oriented-communication#서비스 인터페이스|서비스 인터페이스]]의 주 버전이다. Message Type은 메시지의 종류를, Return Code는 요청의 처리 결과를 나타낸다.[@autosar-fo-prs-someipprotocol-2025]

![[diagrams/some-ip-header-layout.svg]]

명세는 Method ID 공간을 나눠, 최상위 비트가 0인 `0x0000`\~`0x7FFF`를 메서드에, 최상위 비트가 1인 범위를 이벤트와 알림에 쓰기를 권한다. 서버는 요청의 Request ID를 응답에 그대로 옮기므로, 클라이언트는 요청을 여럿 보내 둔 상태에서도 응답을 요청과 짝지을 수 있다.[@autosar-fo-prs-someipprotocol-2025]

Message Type 값은 아래와 같다.[@autosar-fo-prs-someipprotocol-2025]

| 값     | Message Type      |
| ------ | ----------------- |
| `0x00` | REQUEST           |
| `0x01` | REQUEST_NO_RETURN |
| `0x02` | NOTIFICATION      |
| `0x80` | RESPONSE          |
| `0x81` | ERROR             |

SOME/IP-TP로 나눈 세그먼트는 위 값에 TP-Flag `0x20`을 켠 값을 쓴다.[@autosar-fo-prs-someipprotocol-2025]

Return Code 값 가운데 몇 가지는 아래와 같다.[@autosar-fo-prs-someipprotocol-2025]

| 값     | Return Code               | 비고                       |
| ------ | ------------------------- | -------------------------- |
| `0x00` | E_OK                      |                            |
| `0x01` | E_NOT_OK                  |                            |
| `0x02` | E_UNKNOWN_SERVICE         |                            |
| `0x03` | E_UNKNOWN_METHOD          |                            |
| `0x04` | E_NOT_READY               | 더는 쓰지 않음(deprecated) |
| `0x05` | E_NOT_REACHABLE           | 더는 쓰지 않음(deprecated) |
| `0x06` | E_TIMEOUT                 | 더는 쓰지 않음(deprecated) |
| `0x07` | E_WRONG_PROTOCOL_VERSION  |                            |
| `0x08` | E_WRONG_INTERFACE_VERSION |                            |
| `0x09` | E_MALFORMED_MESSAGE       |                            |
| `0x0A` | E_WRONG_MESSAGE_TYPE      |                            |

REQUEST, REQUEST_NO_RETURN, NOTIFICATION 메시지의 Return Code는 `0x00`이고, ERROR 메시지는 `0x00`을 쓸 수 없다.[@autosar-fo-prs-someipprotocol-2025]

## 통신 방식

- 요청/응답: 클라이언트가 REQUEST를 보내면 서버가 RESPONSE나 ERROR로 답한다.
- Fire & Forget: 클라이언트가 REQUEST_NO_RETURN을 보내고, 응답은 없다.
- 이벤트: 서버가 NOTIFICATION으로 갱신된 값이나 일어난 사건을 보낸다. 게시와 구독은 SOME/IP-SD가 맡는다.
- [[service-oriented-communication#서비스 인터페이스|필드]]: getter, setter, notifier 가운데 적어도 하나를 가진다. getter는 빈 페이로드로 요청해 응답으로 값을 받고, setter는 요청에 새 값을 실어 응답으로 설정된 값을 받는다.[@autosar-fo-prs-someipprotocol-2025]

![[diagrams/some-ip-communication-patterns.svg]]

## 직렬화

직렬화는 인터페이스 명세가 정한 파라미터 목록에 따른다. 기본 타입은 boolean(8비트), uint8\~uint64, sint8\~sint64, float32, float64이고, float32와 float64는 IEEE 754의 binary32와 binary64다.[@autosar-fo-prs-someipprotocol-2025]

구조체는 멤버를 깊이 우선 순회 순서로 차례대로 직렬화한다. 가변 길이 문자열과 가변 길이 배열은 앞에 길이 필드를 둔다. 열거형은 부호 없는 정수로 보내고, 비트 필드는 uint8\~uint64로 보내며, 유니언(variant)도 쓸 수 있다.[@autosar-fo-prs-someipprotocol-2025]

Classic Platform에서는 [[autosar-transformer|SOME/IP Transformer]]가 데이터를 SOME/IP 형식으로 직렬화하고, 프로토콜의 나머지 일부는 SoAd(Socket Adaptor)와 Service Discovery 모듈이 맡는다.[@autosar-cp-sws-someiptransformer-2025] SoAd는 PDU(Protocol Data Unit)를 쓰는 통신 서비스 모듈과 소켓 기반 [[internet-protocol-suite|TCP/IP]] 스택을 잇고, SOME/IP 메시지는 SoAd를 거쳐 TCP/IP로 오간다.[@autosar-cp-sws-socketadaptor-2025]
