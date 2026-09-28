---
title: SOME/IP-SD
tags:
  - network/ethernet
aliases:
  - SOME/IP Service Discovery
verified: 2026-09-28
---

**SOME/IP-SD**(SOME/IP Service Discovery)는 [[some-ip|SOME/IP]] 서비스 인스턴스의 발견, 인스턴스가 쓸 수 있는 상태가 되었는지의 감지, 게시·구독(Publish/Subscribe)의 처리를 맡는 프로토콜이다. SOME/IP-SD 규격은 차량 네트워크에서는 서비스 인스턴스의 위치(IP 주소, 전송 프로토콜, 포트 번호)가 대개 알려져 있다고 보아, 인스턴스의 상태를 주된 관심사로 두고 위치는 부차적 관심사로 둔다. SOME/IP-SD 메시지는 SOME/IP 메시지로 실어 UDP로 보내며, 기본 포트(SD_PORT)는 30490이다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]

## 구조·동작

### 메시지

SOME/IP-SD 메시지의 SOME/IP 헤더는 Service ID 0xFFFF, Method ID 0x8100, Message Type 0x02(NOTIFICATION), Return Code 0x00(E_OK)으로 정해져 있다. 헤더 뒤에는 8비트 Flags, 24비트 Reserved, 32비트 엔트리 배열 길이와 엔트리 배열, 32비트 옵션 배열 길이와 옵션 배열이 온다.

Flags의 최상위 비트는 Reboot 플래그, 그다음 비트는 Unicast 플래그다. Reboot 플래그는 재부팅 뒤 SOME/IP 헤더의 Session ID가 한 바퀴 돌아 다시 1이 될 때까지 1이고, 그 뒤로는 0이다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]

![[diagrams/some-ip-sd-message-layout.svg]]

### 엔트리

엔트리는 16바이트다. FindService와 OfferService는 서비스 엔트리, SubscribeEventgroup과 SubscribeEventgroupAck는 이벤트 그룹 엔트리다. FindService는 서비스 인스턴스를 찾고, OfferService는 인스턴스를 제공한다고 알린다. SubscribeEventgroup은 이벤트 그룹을 구독하고, SubscribeEventgroupAck는 구독을 받아들인다. TTL은 엔트리가 유효한 시간을 초로 나타내는 24비트 필드다. TTL을 0으로 두면 OfferService는 제공을 멈추는 StopOfferService, SubscribeEventgroup은 구독을 멈추는 StopSubscribeEventgroup, SubscribeEventgroupAck는 구독을 거절하는 SubscribeEventgroupNack이 된다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]

| 엔트리                 | Type | TTL이 0이면             |
| ---------------------- | ---- | ----------------------- |
| FindService            | 0x00 | —                       |
| OfferService           | 0x01 | StopOfferService        |
| SubscribeEventgroup    | 0x06 | StopSubscribeEventgroup |
| SubscribeEventgroupAck | 0x07 | SubscribeEventgroupNack |

FindService에서 Instance ID 0xFFFF는 모든 인스턴스를, Major Version 0xFF는 모든 주 버전을, Minor Version 0xFFFFFFFF는 모든 부 버전을 뜻한다. OfferService와 SubscribeEventgroup에서 TTL 0xFFFFFF는 재부팅할 때까지 계속 유효하다는 뜻이다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]

### 옵션

옵션은 서비스 인스턴스에 닿을 IP 주소, 전송 프로토콜, 포트처럼 엔트리에 딸린 정보를 나른다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]

| 옵션          | Type(IPv4, IPv6) | 담는 것                                                                                                    |
| ------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| Configuration | 0x01             | DNS TXT와 DNS-SD 형식에 기반한 키-값 쌍의 설정 문자열                                                      |
| Endpoint      | 0x04, 0x06       | IP 주소, 전송 계층 프로토콜, 포트 번호                                                                     |
| Multicast     | 0x14, 0x16       | 멀티캐스트 이벤트의 주소, 전송 프로토콜, 포트. 서버가 보내면 이벤트를 보낼 곳, 클라이언트가 보내면 받을 곳 |
| SD Endpoint   | 0x24, 0x26       | 보내는 쪽 SOME/IP-SD 구현의 IP 주소와 포트                                                                 |

### 단계

SOME/IP-SD는 서비스 인스턴스마다 적어도 세 단계를 둔다.

- 초기 대기 단계: INITIAL_DELAY_MIN과 INITIAL_DELAY_MAX 사이의 임의 시간만큼 기다린 뒤 첫 메시지를 보낸다.
- 반복 단계: REPETITIONS_BASE_DELAY만큼 기다리는 것으로 시작해, 메시지를 보낼 때마다 대기 시간을 두 배로 늘리며 REPETITIONS_MAX번까지 보낸다. REPETITIONS_MAX가 0이면 이 단계를 건너뛰고 곧바로 주 단계로 들어간다.
- 주 단계: FindService를 보내지 않는다. 서버는 CYCLIC_OFFER_DELAY가 설정되어 있으면 그 주기마다 OfferService를 보낸다.

![[diagrams/some-ip-sd-phases-timeline.svg]]

서버는 반복 단계와 주 단계에서 받은 FindService에 OfferService로 답하고, 초기 대기 단계에서 받은 FindService는 무시한다. OfferService의 TTL이 지나면 그 서비스 인스턴스는 제공되지 않는 것으로 본다. 클라이언트는 OfferService를 받으면 TTL 타이머를 걸고, 타이머가 끝나면 서비스를 다시 찾는다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]

### 구독

클라이언트는 OfferService에 SubscribeEventgroup으로 답해 구독하고, 서버는 SubscribeEventgroupAck로 받아들이거나 SubscribeEventgroupNack로 거절한다. 서비스가 TCP로 제공되고 클라이언트가 이벤트 그룹을 TCP로 받으려 하면, 클라이언트는 SubscribeEventgroup을 보내기 전에 서버와 TCP 연결을 맺는다.

서버는 구독을 받으면 SubscribeEventgroupAck 바로 뒤에 필드 notifier의 초기값을 보낸다. 순수 이벤트의 초기값은 보내지 않고, 이미 유효한 구독을 갱신하는 SubscribeEventgroup에도 초기값을 보내지 않는다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]

![[diagrams/some-ip-sd-subscribe-sequence.svg]]

## 비교·한계

받은 SOME/IP-SD 메시지가 12바이트보다 짧으면 더 처리하지 않고 버린다. 엔트리의 Service ID, Instance ID, Major Version, Eventgroup ID를 알 수 없으면 그 엔트리를 무시하되, SubscribeEventgroup 엔트리면 SubscribeEventgroupNack로 답한다. 알 수 없는 타입의 엔트리도 무시한다.[@autosar-fo-prs-someipservicediscoveryprotocol-2025]
