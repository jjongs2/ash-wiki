---
title: 포트 번호
tags:
  - network/tcp-ip
verified: 2026-09-29
---

**포트 번호**(port number)는 [[tcp|TCP]]와 [[udp|UDP]] 같은 전송 계층 프로토콜이 한 호스트 안의 통신 끝점을 가리키는 16비트 번호다. IP 주소가 호스트를 가리키면, 포트 번호는 그 호스트 안에서 데이터를 받을 프로세스나 서비스를 가리킨다.[@ietf-rfc-6335-2011][@ietf-rfc-9293-2022]

## 헤더의 포트

TCP [[tcp#헤더|헤더]]와 UDP [[udp#헤더|헤더]]는 모두 발신 포트와 목적 포트를 16비트씩 싣는다.[@ietf-rfc-9293-2022][@ietf-rfc-768-1980] 포트 번호는 같은 두 끝점 사이의 전송 세션을 가르는 식별자이자, 끝점의 프로세스를 가리키는 식별자로 쓰인다.[@ietf-rfc-6335-2011]

TCP의 연결은 양 끝의 IP 주소와 포트 번호 쌍으로 가려진다. TCP에서는 IP 주소와 TCP 포트를 이은 것을 **소켓**이라 부른다.[@ietf-rfc-9293-2022]

## 번호 범위

IANA는 포트 번호를 세 범위로 나눈다.[@ietf-rfc-6335-2011][@iana-service-names-port-numbers-registry-2026]

- **시스템 포트**: 0\~1023. well-known 포트라고도 부른다.
- **사용자 포트**: 1024\~49151. registered 포트라고도 부른다.
- **동적 포트**: 49152\~65535. private 포트나 임시 포트라고도 부르며, IANA가 배정하지 않는다.[@ietf-rfc-6335-2011][@iana-service-names-port-numbers-registry-2026]

![[diagrams/port-number-ranges.svg]]

IANA는 시스템 포트와 사용자 포트를 서비스에 배정하고, Service Name and Transport Protocol Port Number Registry에 기록한다. RFC 6335는 **서비스 이름**(service name)을 이 레지스트리의 고유 키로 정한다.[@ietf-rfc-6335-2011]

## 서버와 클라이언트

서비스는 보통 서버의 정해진 well-known 포트에서 기다린다.[@ietf-rfc-6335-2011][@ietf-rfc-6056-2011] 클라이언트의 포트는 보통 클라이언트의 네트워크 스택이 자동으로 고르는 임시 포트(ephemeral port)다. 임시 포트는 프로토콜, 로컬 IP 주소, 로컬 포트, 원격 IP 주소, 원격 포트의 다섯 값이 다른 통신과 겹치지 않게 고른다.[@ietf-rfc-6056-2011]

UDP에서는 다른 정보가 없으면 발신 포트를 응답을 보낼 포트로 볼 수 있다.[@ietf-rfc-768-1980]

## 배정 예

IANA 레지스트리에 등록된 서비스 이름의 예는 아래와 같다.[@iana-service-names-port-numbers-registry-2026]

| 포트  | TCP       | UDP       |
| ----- | --------- | --------- |
| 22    | ssh       | ssh       |
| 53    | domain    | domain    |
| 80    | http      | http      |
| 123   | ntp       | ntp       |
| 443   | https     | https     |
| 514   | shell     | syslog    |
| 13400 | doip-data | doip-disc |

RFC 6335는 포트 번호를 TCP와 UDP 같은 전송 프로토콜마다 따로 배정하도록 정한다. 응용은 한 전송 프로토콜에서 배정받은 포트 번호를 다른 전송 프로토콜에서도 쓸 수 있다고 여겨서는 안 된다.[@ietf-rfc-6335-2011] 같은 번호라도 TCP와 UDP에서 다른 서비스를 가리킬 수 있다. 예: 514는 TCP에서 shell, UDP에서 syslog로 등록되어 있다.[@iana-service-names-port-numbers-registry-2026]

13400 포트의 쓰임은 [[doip#포트|DoIP]]에서 다룬다. [[some-ip-sd|SOME/IP-SD]] 규격은 SD 메시지를 보내는 UDP 포트(`SD_PORT`)의 기본값을 30490으로 둔다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]
