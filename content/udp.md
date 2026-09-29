---
title: UDP
tags:
  - network
aliases:
  - User Datagram Protocol
verified: 2026-09-29
---

**UDP**(User Datagram Protocol)는 IP(Internet Protocol) 위에서 응용 프로그램이 최소한의 프로토콜 절차로 메시지를 보내게 하는 프로토콜이다. RFC 768이 정하며, 전달과 중복 없음을 보장하지 않는다.[@ietf-rfc-768-1980] 전송 계층 프로토콜이다.[@ietf-rfc-1122-1989] UDP는 IP 헤더의 Protocol 값 17로 표시된다.[@ietf-rfc-768-1980][@iana-protocol-numbers-2026]

## 구조·동작

### 헤더

UDP 헤더는 8바이트로, 16비트 필드 넷으로 이루어진다.[@ietf-rfc-768-1980]

| 필드             | 뜻                                                      |
| ---------------- | ------------------------------------------------------- |
| Source Port      | 보내는 프로세스의 포트. 쓰지 않으면 0                   |
| Destination Port | 특정 목적지 IP 주소 안에서 뜻을 갖는 포트               |
| Length           | 헤더와 데이터를 합친 길이. 바이트 단위이고 최솟값은 8   |
| Checksum         | 의사 헤더, UDP 헤더, 데이터에 대한 [[checksum\|체크섬]] |

![[diagrams/udp-header-layout.svg]]

UDP가 IP 위에 더하는 서비스는 데이터 체크섬과 [[port-number|포트 번호]]에 따른 다중화뿐이다.[@ietf-rfc-1122-1989]

### 체크섬

[[ipv4|IPv4]]에서는 UDP 체크섬을 생략할 수 있으며, 이때 Checksum 필드는 0이다.[@ietf-rfc-1122-1989][@ietf-rfc-768-1980] [[ipv6|IPv6]]에서는 기본적으로 UDP 체크섬을 생략할 수 없고, 받는 쪽은 체크섬이 0인 UDP 패킷을 버린다. 다만 UDP를 터널 캡슐화에 쓰는 프로토콜은 특정 포트에 체크섬 0 모드를 쓸 수 있다.[@ietf-rfc-8200-2017]

체크섬이 0이 아니면서 틀린 데이터그램은 조용히 버린다.[@ietf-rfc-1122-1989]

### 비연결형 전송

UDP는 연결을 맺지 않고, 데이터그램이라 부르는 독립된 메시지 단위로 보낸다. UDP는 신뢰성을 제공하지 않고 잃은 데이터그램을 다시 보내지도 않으며, 데이터그램은 순서가 바뀌거나 잃거나 중복되어 닿을 수 있다. 흐름 제어와 혼잡 제어도 없다.[@ietf-rfc-8095-2017] 재전송, 흐름 제어, 혼잡 회피 같은 기능이 필요하면 UDP 위의 응용이 맡는다.[@ietf-rfc-1122-1989]

UDP는 메시지 경계를 지킨다.[@ietf-rfc-8095-2017] UDP의 송신과 수신 동작은 메시지 경계를 보존한다.[@ietf-rfc-8304-2018]

UDP로는 유니캐스트와 애니캐스트 데이터그램 말고도 브로드캐스트 데이터그램(IPv4)과 멀티캐스트 데이터그램(IPv4, IPv6)을 보낼 수 있다.[@ietf-rfc-8095-2017]

## 비교·한계

[[tcp|TCP]]는 연결을 맺고, 잃은 데이터를 다시 보내 순서대로 전달하며, 흐름 제어와 혼잡 제어를 한다.[@ietf-rfc-9293-2022] UDP 헤더는 8바이트이고[@ietf-rfc-768-1980], TCP 헤더는 옵션이 없을 때 20바이트로 가장 짧다.[@ietf-rfc-9293-2022]

[[some-ip-sd|SOME/IP-SD]] 메시지는 UDP로 보낸다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025] AUTOSAR의 [[doip|DoIP]] 모듈은 차량 식별 요청을 UDP로 받는다.[@autosar-cp-sws-diagnosticoverip-2025]
