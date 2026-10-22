---
title: MTU
tags:
  - network/tcp-ip
aliases:
  - Maximum Transmission Unit
verified: 2026-10-22
---

RFC 8201은 링크가 한 덩어리로 나를 수 있는 최대 패킷 크기(바이트 단위)를 링크 **MTU**(Maximum Transmission Unit)로 정의한다. 출발 노드에서 목적 노드까지의 경로에 있는 모든 링크의 링크 MTU 가운데 최솟값은 **경로 MTU**(path MTU)로 정의한다.[@ietf-rfc-8201-2017]

## 최솟값

[[ipv4|IPv4]]를 정하는 RFC 791은 모든 인터넷 모듈이 68바이트 데이터그램을 더 나누지 않고 넘길 수 있어야 한다고 정한다.[@ietf-rfc-791-1981]

[[ipv6|IPv6]]를 정하는 RFC 8200은 인터넷의 모든 링크가 1280바이트 이상의 MTU를 가져야 한다고 정하고, 이 값을 **IPv6 최소 링크 MTU**라 부른다.[@ietf-rfc-8200-2017]

## Path MTU Discovery

RFC 1122는 경로의 최소 MTU를 실제로 알지 못할 때, 목적지 주소가 연결된 네트워크에 있지 않으면 IP 계층이 보낼 수 있는 최대 IP 데이터그램 크기(바이트 단위) $\mathrm{EMTU\_S}$를 $\mathrm{EMTU\_S} \le 576$이 되게 두고, 그 밖에는 연결된 네트워크의 MTU를 쓰도록 정한다(SHOULD).[@ietf-rfc-1122-1989]

RFC 1191은 IPv4의 Path MTU Discovery를 정한다. 출발 호스트는 처음에 경로 MTU를 첫 홉의 MTU로 가정하고, 그 경로로 보내는 데이터그램에 모두 DF(Don't Fragment) 비트를 세운다. 경로의 라우터가 데이터그램을 나누지 않고는 넘길 수 없으면, 그 데이터그램을 버리고 "fragmentation needed and DF set"을 뜻하는 코드의 [[icmp|ICMP]] Destination Unreachable 메시지를 돌려준다. 출발 호스트는 이 메시지를 받으면 가정한 경로 MTU를 줄인다. 라우터는 이 메시지에서 ICMP 명세가 "unused"로 둔 헤더 필드의 하위 16비트에 다음 홉 네트워크의 MTU를 넣어야 한다(MUST).[@ietf-rfc-1191-1990]

RFC 8201은 IPv6의 Path MTU Discovery를 정한다. 출발 노드는 처음에 경로 MTU를 첫 홉의 MTU로 가정한다. 경로의 노드는 너무 커서 넘길 수 없는 패킷을 버리고 [[icmp#ICMPv6와의 차이|ICMPv6]] Packet Too Big 메시지를 돌려주며, 출발 노드는 이 메시지가 알린 MTU에 따라 가정한 경로 MTU를 줄인다. IPv6 노드는 Path MTU Discovery를 구현해야 하고(should), 부트 ROM 같은 최소 구현은 이를 생략할 수 있다(may). 생략한 노드는 IPv6 최소 링크 MTU를 최대 패킷 크기로 써야 한다(must).[@ietf-rfc-8201-2017]

RFC 8900에 따르면 Path MTU Discovery는 네트워크가 ICMP Packet Too Big 메시지를 출발 노드에 전달할 수 있어야 동작하므로, 이 메시지가 출발 노드에 닿지 못하면 동작하지 않는다.[@ietf-rfc-8900-2020]
