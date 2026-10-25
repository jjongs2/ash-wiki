---
title: AUTOSAR firewall
tags:
  - platform/autosar
  - security/cybersecurity
verified: 2026-10-07
---

**AUTOSAR firewall**은 미리 정한 규칙에 따라 네트워크 트래픽을 걸러 악의적인 메시지에서 호스트를 지키는 [[autosar|AUTOSAR]]의 방화벽이다. [[autosar-classic-platform|Classic Platform]]에서는 BSW(Basic Software) 모듈 Firewall이 이 일을 하며, stateless packet inspection, stateful packet inspection, deep packet inspection을 지원한다.[@autosar-cp-sws-firewall-2025] [[autosar-adaptive-platform|Adaptive Platform]]에서는 Firewall functional cluster인 FC(Functional Cluster) Firewall이 Adaptive Platform이 놓인 ECU의 호스트 기반 방화벽을 관리하며, manifest와 함께 배치된 규칙대로 아래의 [[autosar-firewall#Adaptive Platform의 FC Firewall|firewall engine]]을 설정한다.[@autosar-ap-sws-firewall-2025]

## 규칙 맞추기

AUTOSAR Classic Platform R25-11의 Firewall 명세는 방화벽이 네트워크 패킷의 패턴과 그 패턴에 딸린 동작(허용이나 차단)의 짝, 곧 **FirewallRule**의 목록을 관리하도록 둔다. 방화벽은 지나가는 패킷을 규칙의 패턴과 설정한 순서대로 견주어, 처음 맞는 규칙에서 비교를 멈추고 그 규칙의 동작을 한다. 맞는 규칙이 없으면 기본 동작을 한다. 방화벽은 패킷 전체를 검사하므로, 패턴은 [[osi-model|OSI]] 계층마다 따로 둔 설정을 FirewallRule에 모아 이룬다.[@autosar-cp-sws-firewall-2025]

AUTOSAR Adaptive Platform R25-11의 Firewall 명세도 FC Firewall이 같은 방식으로 FirewallRule을 설정한 순서대로 맞춰 보고, 맞는 규칙이 없으면 기본 동작을 하도록 정한다.[@autosar-ap-sws-firewall-2025]

![[diagrams/firewall-rule-first-match.svg]]

AUTOSAR Classic Platform R25-11의 Firewall 명세는 방화벽을 allowlist 방식과 blocklist 방식으로 나눈다. Allowlist 방화벽은 통과시킬 트래픽을 모두 패턴으로 정하고 맞지 않는 패킷을 막으며, blocklist 방화벽은 반대로 정한 패킷만 막고 나머지를 통과시킨다. Classic Platform의 Firewall은 막는 규칙과 허용하는 규칙을 섞어 둘 수도 있다. 기본 동작으로 처리될 패킷도 패턴으로 적어 두는 것은, 그래야 그 패킷에 IDS(Intrusion Detection System) 보안 이벤트를 따로 대응시킬 수 있기 때문이다.[@autosar-cp-sws-firewall-2025]

## 검사 수준

방화벽은 세 수준의 검사를 지원한다.[@autosar-cp-sws-firewall-2025]

- **Stateless packet inspection**: 헤더 필드 같은 필드 값을 정적으로 정한 값과 견준다. Classic Platform의 Firewall은 OSI 4계층까지의 프로토콜 헤더를 보며, [[ethernet|이더넷]], [[ipv4|IPv4]], [[ipv6|IPv6]], [[icmp|ICMP]], [[tcp|TCP]], [[udp|UDP]]를 기본으로 지원한다.
- **Stateful packet inspection**: 허용된 상태 전이나 열린 연결 수처럼 프로토콜의 상태를 따진다. Classic Platform의 Firewall은 TCP의 타임아웃, 열린 연결 수, TCP 상태 기계를 검사한다.
- **Deep packet inspection**: [[some-ip|SOME/IP]], DDS(Data Distribution Service), [[doip|DoIP]] 같은 응용 계층 프로토콜을 검사한다. 오프셋과 기대 바이트 값으로 페이로드를 일반 검사할 수도 있다.[@autosar-cp-sws-firewall-2025]

방화벽은 패턴이 맞은 횟수를 leaky bucket 알고리즘으로 세는 rate limiting도 지원한다. 중간자 공격이나 고장 난 ECU 때문에 주기가 어긋난 주기 메시지를 찾아내려는 것이다.[@autosar-cp-sws-firewall-2025]

## 상태에 따른 규칙

차량 안의 트래픽은 주행, 주차, 진단 세션 같은 차량 상태에 따라 크게 달라진다. 그래서 FirewallRule을 통합자가 프로젝트마다 미리 정한 **firewall state**에 묶을 수 있고, 한 번에 한 state에 묶인 규칙만 활성이다. Classic Platform에서는 [[basic-software-mode-manager|BswM]]이 `Fw_SetFirewallState`를 불러 활성 state를 바꾼다.[@autosar-cp-sws-firewall-2025] AUTOSAR Adaptive Platform R25-11의 Firewall 명세는 사용자 응용이 FC Firewall의 `ara::fw::FirewallStateSwitchInterface` API로 활성 state를 바꾸도록 둔다.[@autosar-ap-sws-firewall-2025]

## 보안 이벤트

AUTOSAR Classic Platform R25-11의 Firewall 명세는 방화벽을 IDS의 센서로 두어 [[intrusion-detection-system-manager|IdsM]]에 보안 이벤트를 보고하게 한다. IdsM은 같은 식별자의 보안 이벤트를 모으면서 그 가운데 하나의 [[intrusion-detection-system-manager#보안 이벤트의 수집|context data]]만 남길 수 있어 정보가 빠질 수 있다. 그래서 Classic Platform의 Firewall은 검사하는 프로토콜마다 보안 이벤트를 따로 정해 이 손실을 줄인다.[@autosar-cp-sws-firewall-2025] AUTOSAR Adaptive Platform R25-11의 Firewall 명세도 FC Firewall이 보안 이벤트를 IdsM에 올려 IDS를 돕게 한다.[@autosar-ap-sws-firewall-2025]

## Classic Platform의 Firewall 모듈

AUTOSAR Classic Platform R25-11의 Firewall 명세는 Firewall이 [[pdu-router#상위 모듈과 하위 모듈|L-SDU(Link Layer Service Data Unit) Router]](LSduR)에서 네트워크 패킷을 받아 검사한 뒤, 허용한 패킷은 LSduR로 돌려주고 막은 패킷은 버리도록 둔다. Firewall은 전용 CPU를 둔 스마트 [[ethernet-switch|스위치]]에 AUTOSAR 스택을 올려, 호스트 수준이 아니라 네트워크 수준에서 메시지를 거르는 배치도 지원한다. 이때 스위치 코어의 하드웨어 가속 패킷 필터링을 쓰는 인터페이스도 둔다.[@autosar-cp-sws-firewall-2025]

Firewall(Fw)은 Communication Services 층에 든다.[@autosar-cp-sws-bswgeneral-2025] Firewall 모듈은 들어오는(ingress) 트래픽만 거르도록 제한되어 있다.[@autosar-cp-sws-firewall-2025][@autosar-cp-tr-releaseoverview-2025]

## Adaptive Platform의 FC Firewall

AUTOSAR Adaptive Platform R25-11의 Firewall 명세는 FC Firewall을 아래의 firewall engine을 감싸는 관리 클러스터로 둔다. FirewallRule은 Machine Manifest로 [[autosar-adaptive-platform#Machine과 프로세스|Machine]]에 배치되고, FC Firewall은 이 규칙으로 engine을 설정한다. 트래픽을 실제로 거르는 것은 engine이다. Engine은 운영체제가 주는 [[internet-protocol-suite|TCP/IP]] 스택 안에서 검사하거나, 하드웨어의 검사 기능을 쓰거나, 계층마다 나눠 검사하면서 응용에 가까운 높은 층에서 deep packet inspection을 하는 등 여러 방식으로 만들 수 있다. FC Firewall은 특정 방식을 강제하지 않는다.[@autosar-ap-sws-firewall-2025]

FirewallRule을 관리하는 길은 [[over-the-air-update|OTA 업데이트]]로 바꾸는 것과 실행 중에 규칙을 하나씩 켜고 끄는 것 둘이지만, 뒤의 것은 이 릴리스에서 지원하지 않는다.[@autosar-ap-sws-firewall-2025] Firewall의 실행 중 규칙 켜고 끄기와 OEM이 정한 보안 이벤트는 지원하지 않는 기능이다.[@autosar-ap-tr-releaseoverview-2025]
