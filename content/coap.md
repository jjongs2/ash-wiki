---
title: CoAP
tags:
  - network/tcp-ip
aliases:
  - Constrained Application Protocol
verified: 2026-10-22
---

**CoAP**(Constrained Application Protocol)는 RFC 7252가 정하는 특수 목적의 웹 전송 프로토콜로, 제약 노드와, 저전력이고 손실이 많은 네트워크 같은 제약 네트워크에서 쓴다. 제약 노드는 흔히 ROM과 RAM이 작은 8비트 마이크로컨트롤러를 갖춘다.[@ietf-rfc-7252-2014]

## 요청과 응답

CoAP의 상호작용 모델은 HTTP의 클라이언트/서버 모델과 닮았다. 클라이언트는 서버에 있는, URI로 가리키는 자원에 Method Code로 동작을 요청하고, 서버는 Response Code를 담은 응답을 보낸다. HTTP와 달리 CoAP는 이 교환을 [[udp|UDP]] 같은 데이터그램 전송 위에서 비동기로 다룬다. CoAP는 HTTP로 쉽게 대응되는 기본 메서드 GET, POST, PUT, DELETE를 지원한다.[@ietf-rfc-7252-2014]

## 메시지

CoAP의 메시지는 CON(Confirmable), NON(Non-confirmable), ACK(Acknowledgement), RST(Reset) 네 종류다. 메시지마다 중복 검출과 선택적 신뢰성에 쓰는 16비트 Message ID가 있다.[@ietf-rfc-7252-2014]

- **CON**: 신뢰성 있는 전송이 필요한 메시지다. 송신자는 수신자가 같은 Message ID의 ACK를 보낼 때까지 기본 타임아웃으로 재전송하고, 재전송 사이에는 지수 백오프를 둔다.
- **NON**: 신뢰성 있는 전송이 필요 없는 메시지다. 예를 들어 센서 데이터 흐름의 측정값 하나를 NON으로 보낼 수 있다. 확인 응답을 받지 않지만, 중복 검출에 쓰는 Message ID는 가진다.
- **ACK**: CON 메시지를 받은 수신자가 그 메시지와 같은 Message ID로 보내는 확인 응답이다.
- **RST**: 수신자가 CON 메시지를 알맞은 오류 응답조차 줄 수 없을 만큼 처리하지 못하면, ACK 대신 RST로 답한다. NON 메시지를 처리하지 못할 때도 RST로 답할 수 있다.[@ietf-rfc-7252-2014]

![[diagrams/coap-con-non-exchange.svg]]

CoAP 메시지는 4바이트 고정 길이 이진 헤더로 시작하고, 그 뒤에 간결한 이진 옵션과 페이로드가 올 수 있다. 요청과 응답은 이 메시지 형식을 함께 쓴다.[@ietf-rfc-7252-2014]

## 보안과 포트

이 RFC는 CoAP를 보호하는 수단으로 [[transport-layer-security#DTLS|DTLS]] 바인딩을 정한다. 자원 발견(resource discovery)에 쓰는 자원을 내는 서버는 CoAP의 기본 [[port-number|포트]] 5683을 지원해야 한다. DTLS로 보호한 CoAP의 기본 포트 5684는 서버가 지원해도 된다.[@ietf-rfc-7252-2014]

## 확장

RFC 7641은 CoAP 클라이언트가 자원을 관찰(observe)하게 하는 확장을 정한다. 클라이언트는 자원의 표현을 받아 오고, 서버는 일정 기간 그 표현을 최신으로 유지해 준다.[@ietf-rfc-7641-2015]

RFC 8323은 CoAP를 [[tcp|TCP]], [[transport-layer-security|TLS]], WebSocket 위에서 쓰는 데 필요한 변경을 정하고, 이 전송에서 쓰도록 RFC 7641을 갱신한다.[@ietf-rfc-8323-2018]
