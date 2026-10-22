---
title: MQTT
tags:
  - network/tcp-ip
aliases:
  - Message Queuing Telemetry Transport
verified: 2026-10-03
---

**MQTT**(Message Queuing Telemetry Transport)는 클라이언트와 서버 사이에서 발행·구독(publish/subscribe) 방식으로 메시지를 나르는 프로토콜이다. OASIS가 표준으로 펴낸다. MQTT는 가볍고 단순하며 구현하기 쉽게 설계돼, 코드 크기가 작아야 하거나 네트워크 대역폭이 귀한 M2M(Machine to Machine)과 IoT 같은 제약 환경에 알맞다.[@oasis-mqtt-5-0-2019]

## 클라이언트와 서버

발행·구독 방식은 메시지를 하나에서 여럿으로 나눠 보내고, 메시지를 주고받는 애플리케이션끼리 서로 떼어 놓는다.[@oasis-mqtt-5-0-2019] MQTT 5.0은 메시지를 발행하는 쪽과 구독하는 쪽을 모두 클라이언트로 두고, 서버가 그 사이에서 구독에 맞는 메시지를 중계하게 정한다.[@oasis-mqtt-5-0-2019] MQTT 서버는 브로커(broker)라고도 부른다.[@oasis-mqtt-nist-cybersecurity-1-0-2014][@eclipse-mosquitto-2026]

## 토픽

MQTT 5.0은 메시지가 토픽 이름(topic name)을 달고 발행되고, 서버가 그 토픽 이름을 구독과 맞춰 보게 정한다. 토픽 이름은 `/`로 나뉜 층(topic level)을 이룬다. 구독은 토픽 필터(topic filter)와 최대 QoS로 이루어지며, 서버는 구독에 맞는 메시지를 그 클라이언트에게 보낸다.[@oasis-mqtt-5-0-2019]

![[diagrams/mqtt-publish-subscribe.svg]]

이 표준은 와일드카드를 토픽 필터에만 쓰고 토픽 이름에는 쓰지 못하게 한다. `+`는 층 하나에 맞고, `#`은 그 자리 아래의 층이 몇 개든 맞으며 부모 층 자체에도 맞는다. `#`은 필터의 마지막 문자여야 한다.[@oasis-mqtt-5-0-2019]

## QoS

이 표준은 메시지 전달의 보장 수준인 QoS를 셋으로 정한다.[@oasis-mqtt-5-0-2019]

- QoS 0(at most once): 받는 쪽이 응답하지 않고 보내는 쪽도 다시 보내지 않는다. 메시지는 한 번 도착하거나 사라진다.
- QoS 1(at least once): 받는 쪽이 PUBACK으로 확인하고, 보내는 쪽은 PUBACK을 받을 때까지 메시지를 확인되지 않은 것으로 둔다. 메시지는 적어도 한 번 도착하지만 중복될 수 있다. 확인되지 않은 메시지를 다시 보내는 것은 세션을 이어 다시 연결할 때뿐이다.
- QoS 2(exactly once): PUBREC, PUBREL, PUBCOMP를 주고받는 두 단계 확인으로, 메시지를 잃지도 중복하지도 않는다.[@oasis-mqtt-5-0-2019]

![[diagrams/mqtt-qos-flows.svg]]

QoS는 보내는 쪽과 받는 쪽 한 쌍마다 따로 적용되므로, 서버가 구독자에게 보낼 때의 QoS는 발행될 때의 QoS와 다를 수 있다.[@oasis-mqtt-5-0-2019]

## 세션

QoS 1과 QoS 2 흐름을 구현하려고 클라이언트와 서버는 Client Identifier에 상태를 묶어 두며, 이를 **세션 상태**(Session State)라 한다. 서버는 구독도 세션 상태에 넣는다. 세션은 이어지는 네트워크 연결 여럿에 걸쳐 계속될 수 있고, 마지막 네트워크 연결이 끝난 뒤 Session Expiry Interval만큼 더 남는다.[@oasis-mqtt-5-0-2019]

CONNECT의 Clean Start가 1이면 클라이언트와 서버는 기존 세션을 버리고 새 세션을 시작해야 한다. Clean Start가 0일 때, 그 Client Identifier에 묶인 세션이 있으면 서버는 그 세션의 상태로 클라이언트와의 통신을 이어 가야 하고, 없으면 새 세션을 만들어야 한다. 이미 연결된 클라이언트와 같은 Client Identifier의 CONNECT가 검증을 통과하면, 서버는 기존 클라이언트에 Reason Code `0x8E`(Session taken over)를 담은 DISCONNECT를 보내고 그 클라이언트의 네트워크 연결을 닫아야 한다.[@oasis-mqtt-5-0-2019]

## Retained message와 will message

이 표준은 서버가 따로 다루는 메시지 두 가지를 정한다.[@oasis-mqtt-5-0-2019]

- **Retained message**: 발행할 때 RETAIN 플래그를 켜면, 서버는 그 토픽에 저장해 둔 retained message를 새 메시지로 바꿔 저장한다. 그래서 토픽마다 하나만 남는다. 새 구독이 생기면 서버는 맞는 토픽의 retained message를 보내며, 이 동작은 Retain Handling 구독 옵션으로 바꿀 수 있다.
- **Will message**: 클라이언트가 CONNECT에 넣어 두는 메시지다. 정상 종료를 알리는 DISCONNECT 없이 네트워크 연결이 닫히면, 서버는 Will Delay Interval이 지나거나 세션이 끝난 뒤 이 메시지를 발행한다.[@oasis-mqtt-5-0-2019]

Will message는 LWT(Last Will and Testament) 메시지라고도 부른다.[@aws-iot-core-mqtt-2026][@eclipse-paho-java-mqttconnectoptions-2026]

## 전송

MQTT 5.0은 클라이언트와 서버 사이에, 순서를 지키고 잃지 않는 양방향 바이트 스트림을 주는 전송을 요구한다. MQTT는 [[tcp|TCP]]/IP 위에서 동작하고, 순서를 지키고 잃지 않는 양방향 연결을 주는 다른 프로토콜 위에서도 동작한다. 이 표준은 WebSocket 위에서 MQTT를 나르는 규칙도 정한다.[@oasis-mqtt-5-0-2019] Eclipse Paho의 JavaScript 클라이언트는 브라우저에서 동작하는 MQTT 클라이언트 라이브러리로, WebSocket으로 MQTT 브로커에 연결한다.[@eclipse-paho-javascript-2026]

IANA는 [[port-number#번호 범위|서비스 이름]] mqtt에 포트 1883을, secure-mqtt에 포트 8883을 할당했다.[@iana-service-names-port-numbers-registry-2026] 포트 8883은 [[transport-layer-security|TLS]] 위의 MQTT, 포트 1883은 TLS 없는 MQTT를 위한 것이며, MQTT 5.0은 TLS를 제공하는 서버가 TCP 포트 8883을 쓰기를 강하게 권한다.[@oasis-mqtt-5-0-2019]

## 제어 패킷

제어 패킷은 Fixed Header, Variable Header, Payload의 최대 세 부분이 이 순서로 놓여 이루어진다. Fixed Header는 모든 제어 패킷에 있고, Variable Header와 Payload는 일부 제어 패킷에만 있다. Fixed Header 첫 바이트의 위 4비트(비트 7\~4)는 제어 패킷의 종류를 나타내며, 종류는 CONNECT(1)부터 AUTH(15)까지 15가지다. 아래 4비트(비트 3\~0)는 종류마다 정해진 플래그다. 둘째 바이트부터 오는 Remaining Length는 현재 제어 패킷에 남은 바이트 수를 가변 길이 정수(Variable Byte Integer)로 나타낸다. 이 정수는 최대 4바이트이고, 나타낼 수 있는 가장 큰 값은 268,435,455다.[@oasis-mqtt-5-0-2019]

## Keep Alive

CONNECT의 Keep Alive는 클라이언트가 제어 패킷 하나를 다 보낸 때부터 다음 제어 패킷을 보내기 시작할 때까지 허용되는 최대 간격으로, 단위는 초다. Keep Alive가 0이 아니고 보낼 다른 제어 패킷이 없으면 클라이언트는 PINGREQ를 보내야 한다. 서버는 Keep Alive가 0이 아닌데 Keep Alive의 1.5배 동안 클라이언트에게서 제어 패킷을 받지 못하면, 네트워크가 실패한 것처럼 그 클라이언트와의 네트워크 연결을 닫아야 한다. Keep Alive 값 0은 이 메커니즘을 끈다.[@oasis-mqtt-5-0-2019]

## 보안과 인증

이 표준의 5장(참고)은 MQTT가 네트워크, 프라이버시, 인증, 인가 기술을 구현자가 고르게 두는 메시지 전송 프로토콜 명세라고 제시한다. 이 표준은 CONNECT의 User Name과 Password로 네트워크 연결을 기본 인증하게 하며, 토큰을 Password에 넣는 것처럼 이 필드에 다른 형태의 인증 정보도 실을 수 있다. 이 기본 인증을 challenge/response 방식으로 넓힌 enhanced authentication도 두며, 여기서는 CONNECT 뒤 CONNACK 전에 클라이언트와 서버가 AUTH 패킷을 주고받을 수 있다.[@oasis-mqtt-5-0-2019]

## 판

MQTT는 Andy Stanford-Clark와 Arlen Nipper가 처음 만들었다.[@oasis-mqtt-5-0-2019]

- MQTT 3.1.1: 2014년 10월 29일에 OASIS 표준이 됐고[@oasis-mqtt-3-1-1-2014], 2016년에 ISO/IEC 20922:2016으로도 발행됐다.[@iso-iec-20922-2016]
- MQTT 5.0: 2019년 3월 7일에 OASIS 표준이 됐고, MQTT 3.1.1을 대체한다. 사용자 속성, 모든 응답 패킷의 reason code, 공유 구독, 메시지 만료 같은 기능을 새로 넣었다.[@oasis-mqtt-5-0-2019]

## 채택

Facebook은 2011년에, Facebook Messenger가 메시지 전달 지연을 줄이려고 서버와의 지속 연결에 MQTT를 쓴다고 밝혔다.[@meta-building-facebook-messenger-2011]
