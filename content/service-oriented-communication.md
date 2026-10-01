---
title: 서비스 지향 통신
tags:
  - network
verified: 2026-09-29
---

[[autosar|AUTOSAR]] Adaptive Platform의 통신 관리(Communication Management) 규격에서 **서비스 지향 통신**(service-oriented communication)은 서비스 제공자가 서비스를 내놓고(offer) 요청자가 그 서비스를 찾아(find) 호출하는(call) 통신이다. 이 규격에서 서비스 지향 통신은 Adaptive Platform 애플리케이션 사이의 주된 통신 방식이며, 통신 관리가 프로세스 안, 프로세스 사이, 머신 사이의 모든 수준에서 이를 맡는다.[@autosar-ap-sws-communicationmanagement-2025] Adaptive Platform은 통신 방식을 서비스 지향 통신으로 한정한다.[@autosar-cp-tps-systemtemplate-2025]

[[some-ip|SOME/IP]]는 네트워크로 서비스 지향 통신을 하는 프로토콜이다.[@autosar-fo-prs-someipprotocol-2025] The Open Group은 SOA(Service-Oriented Architecture)를 서비스 지향을 지원하는 아키텍처 스타일로 정의한다.[@opengroup-w074-2007]

## 서버와 클라이언트

SOME/IP 규격은 서비스 인스턴스를 제공하는 ECU를 서버, 그 서비스 인스턴스를 쓰는 ECU를 클라이언트라 부른다.[@autosar-fo-prs-someipprotocol-2025]

## 서비스 인터페이스

SOME/IP에서 서비스는 메서드, 이벤트, 필드를 0개 이상 묶은 논리적 조합이다. **메서드**는 클라이언트가 원격 절차 호출(RPC, Remote Procedure Call)로 부르면 서버 쪽에서 실행되는 기능이다. **이벤트**는 값이 바뀔 때나 주기적으로 서버가 구독한 클라이언트에 보내는 단방향 데이터다. **필드**는 서버 쪽 상태를 나타내는 값으로, 클라이언트는 getter로 읽고 setter로 바꿀 수 있으며 notifier로 값이 바뀔 때 알림을 받을 수 있다.[@autosar-fo-prs-someipprotocol-2025] 요청·응답, fire&forget, 이벤트, 필드의 메시지 흐름은 [[some-ip#통신 방식|SOME/IP]]에서 다룬다.

![[diagrams/some-ip-service-interface.svg]]

## 발행·구독

SOME/IP의 이벤트 알림은 발행·구독(publish/subscribe) 방식이며, 발행과 구독의 메커니즘은 SOME/IP가 아니라 [[some-ip-sd|SOME/IP-SD]]가 구현한다.[@autosar-fo-prs-someipprotocol-2025] SOME/IP-SD에서 클라이언트가 이벤트 그룹을 구독하면, 서버는 그 뒤로 구독한 클라이언트에게 이벤트를 보낸다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]

MQTT 5.0 규격은 MQTT를 클라이언트·서버 구조의 발행·구독 메시지 전송 프로토콜로 정하고, M2M(Machine to Machine)과 IoT(Internet of Things) 환경에 알맞다고 한다.[@oasis-mqtt-5-0-2019]

## 서비스 발견

SOME/IP-SD는 서비스 인스턴스의 위치를 찾고, 그 인스턴스를 쓸 수 있게 되었는지 알아내는 데 쓰인다. 서버는 Offer Service 엔트리로 서비스를 제공한다고 알리고, 클라이언트는 Find Service 엔트리로 필요한 서비스 인스턴스를 찾는다. 그래서 클라이언트 쪽에 서비스 인스턴스의 엔드포인트를 정적으로 설정하지 않아도 되고, 클라이언트를 실행 중에 서비스 인스턴스에 연결할 수 있다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]

AUTOSAR Adaptive Platform의 통신 관리는 머신 안과 머신 사이의 서비스 지향 통신을 애플리케이션에 투명하게 제공한다. 그래서 서비스가 같은 ECU에 있든 다른 ECU에 있든 애플리케이션 코드가 같다.[@autosar-ap-exp-platformdesign-2025]

## 시그널 기반 통신과의 차이

Adaptive Platform의 서비스 지향 통신은 통신 경로를 실행 중에 세울 수 있어, 참여자 수를 모르는 동적 통신을 만들 수 있다.[@autosar-ap-sws-communicationmanagement-2025] 시그널과 송수신 관계를 시스템 구성에서 통신 매트릭스로 정하는 방식은 [[signal-based-communication#통신 매트릭스|시그널 기반 통신]]에서 다룬다.
