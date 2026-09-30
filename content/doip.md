---
title: DoIP
tags:
  - network/ethernet
aliases:
  - Diagnostic communication over Internet Protocol
verified: 2026-09-28
---

**DoIP**(Diagnostic communication over Internet Protocol)는 진단 장비와 차량 안의 서버가 IP, TCP, UDP로 주고받는 진단 통신이며, ISO 13400 시리즈가 정한다. ISO 13400-2는 [[iso-14229-1|ISO 14229-1]]([[uds|UDS]]), ISO 14229-2, ISO 14229-5와 함께 차량 진단 통신의 틀을 이룬다.[@iso-13400-2-obp-2025]

## 계층

[[iso-13400-2|ISO 13400-2]]는 IP, TCP, UDP를 쓰는 전송 프로토콜과 네트워크 계층 서비스를 정한다.[@iso-13400-2-obp-2025][@iso-13400-3-obp-2016] [[iso-13400-3|ISO 13400-3]]은 IEEE 802.3의 100BASE-TX를 바탕으로 한 유선 차량 인터페이스로서 물리 계층과 데이터 링크 계층을 정하고, 차량 진단 이더넷 인터페이스의 활성화와 비활성화, 이더넷 활성화 선의 요구사항을 둔다.[@iso-13400-3-obp-2016]

![[diagrams/uds-can-ip-layers.svg]]

ISO 13400-2에 따르면 ECU의 메모리가 커져 갱신할 소프트웨어가 늘면서, 차량의 네트워크와 버스는 컴퓨터 네트워크에 가까운 복잡도와 속도를 요구받게 되었다.[@iso-13400-2-obp-2025]

## 엔티티와 주소

ISO 13400-2는 차량 안의 서버와 통신하는 진단 장비를 클라이언트 DoIP 엔티티라 부른다.[@iso-13400-2-obp-2025] DoIP 엣지 노드는 차량 안의 호스트로, ISO 13400-3의 이더넷 활성화 선과 외부 네트워크의 첫 노드에서 오는 링크가 끝나는 곳이다.[@iso-13400-2-obp-2025][@iso-13400-3-obp-2016] IP 네트워크에 직접 연결되지 않은 차량 서브네트워크와는 거기에 연결된 DoIP 게이트웨이를 거쳐서만 데이터를 주고받는다. 논리 주소는 진단 응용 계층 엔티티를 가리키는 주소다.[@iso-13400-2-obp-2025]

AUTOSAR의 DoIP 모듈은 DoIP 엔티티의 종류를 DoIP 게이트웨이와 DoIP 노드 가운데 하나로 설정하고, 엔티티 상태 응답의 Node Type 바이트에 게이트웨이는 `0x00`, 노드는 `0x01`로 싣는다. 메시지의 출발지 논리 주소와 목적지 논리 주소는 각각 2바이트다.[@autosar-cp-sws-diagnosticoverip-2025]

## 헤더

AUTOSAR의 DoIP 모듈에서 DoIP 메시지는 8바이트 일반 헤더로 시작한다. 1바이트 Protocol Version, 그 비트를 뒤집은 1바이트 Inverse Protocol Version(Protocol Version이 `0x02`이면 `0xFD`), 2바이트 Payload Type, 4바이트 Payload Length가 차례로 오고, Payload Length는 일반 헤더를 뺀 페이로드의 바이트 수다.[@autosar-cp-sws-diagnosticoverip-2025]

![[diagrams/doip-generic-header.svg]]

AUTOSAR의 DoIP 모듈은 프로토콜 정보가 틀린 헤더를 받으면 NACK(Negative Acknowledgement) 코드 `0x00`을 보내고 소켓을 닫는다. 설정에 따라 프로토콜 버전 `0x02`나 `0x03`을 받고, 차량 식별 요청에서는 `0xFF`(반전 값 `0x00`)를 기본값으로 받는다.[@autosar-cp-sws-diagnosticoverip-2025] ISO 13400-2:2025는 이 판의 DoIP 프로토콜 버전을 4로 정한다.[@iso-13400-2-obp-2025]

## 포트

IANA(Internet Assigned Numbers Authority)는 13400/udp를 doip-disc(DoIP Discovery)로, 13400/tcp를 doip-data(DoIP Data)로 등록해 두었다.[@iana-service-names-port-numbers-2026] AUTOSAR의 DoIP 모듈은 차량 식별 요청을 UDP로, 진단 메시지를 TCP로 받는다.[@autosar-cp-sws-diagnosticoverip-2025]

## 메시지와 절차

AUTOSAR의 DoIP 모듈이 다루는 Payload Type에는 아래 것들이 있다.[@autosar-cp-sws-diagnosticoverip-2025]

| Payload Type | 메시지                   |
| ------------ | ------------------------ |
| `0x0001`     | 차량 식별 요청           |
| `0x0004`     | 차량 식별 응답·차량 알림 |
| `0x0005`     | 라우팅 활성화 요청       |
| `0x0006`     | 라우팅 활성화 응답       |
| `0x0007`     | 생존 확인 요청           |
| `0x0008`     | 생존 확인 응답           |
| `0x8001`     | 진단 메시지              |
| `0x8002`     | 진단 메시지 긍정 확인    |
| `0x8003`     | 진단 메시지 부정 확인    |

AUTOSAR의 DoIP 모듈은 차량 식별 요청을 받으면 차량 식별 응답·차량 알림으로 답하고, 차량 알림은 설정에 따라 스스로 보내기도 한다. TCP 연결에서 라우팅 활성화 요청을 받아 검사를 통과하면 응답 코드 `0x10`의 라우팅 활성화 응답을 보낸다. 그 연결이 라우팅 활성 상태가 되기 전에는 라우팅 활성화 요청과 인증·확인 밖의 메시지를 버린다. 진단 메시지는 요청과 응답에 모두 쓰이며, 출발지 논리 주소, 목적지 논리 주소, 사용자 데이터를 담는다. 진단 메시지를 받으면 긍정 확인이나 부정 확인으로 진단 장비에 먼저 알린다.[@autosar-cp-sws-diagnosticoverip-2025]

![[diagrams/doip-message-sequence.svg]]

## DoCAN과의 차이

[[can|CAN]] 위의 진단 통신은 ISO 15765 시리즈(DoCAN, Diagnostic communication over Controller Area Network)가 다루고, 그 가운데 ISO 15765-2가 전송 프로토콜과 네트워크 계층 서비스를 정한다.[@iso-15765-2-obp-2024]
