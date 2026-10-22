---
title: Neighbor Discovery
tags:
  - network/tcp-ip
aliases:
  - ND
verified: 2026-10-22
---

RFC 4861은 같은 링크에 있는 [[ipv6|IPv6]] 노드가 서로의 존재와 링크 계층 주소를 알아내고, 라우터를 찾고, 활성 이웃으로 가는 경로의 도달 가능성 정보를 유지하는 데 쓰는 **Neighbor Discovery** 프로토콜을 정한다.[@ietf-rfc-4861-2007]

## 다루는 문제

Neighbor Discovery는 같은 링크에 붙은 노드 사이의 상호작용에서 생기는 아래 문제마다 푸는 메커니즘을 정의한다.[@ietf-rfc-4861-2007]

- **Router Discovery**: 호스트가 붙은 링크에 있는 라우터를 찾는다.
- **Prefix Discovery**: 붙은 링크에서 어느 목적지가 링크 위(on-link)에 있는지 정하는 주소 접두사의 집합을 호스트가 알아낸다.
- **Parameter Discovery**: 노드가 내보내는 패킷에 넣을 링크 파라미터(링크 [[mtu|MTU]] 등)나 인터넷 파라미터(hop limit 값 등)를 알아낸다.
- **Address Autoconfiguration**: 노드가 인터페이스의 주소를 상태 없는 방식으로 설정하게 한다. 자세한 절차는 [[ipv6#주소 자동 설정|상태 없는 주소 자동 설정]]에서 다룬다.
- **Address resolution**: 노드가 링크 위 목적지의 IP 주소만으로 그 링크 계층 주소를 알아낸다.
- **Next-hop determination**: 목적지 IP 주소를, 그 목적지로 가는 트래픽을 보낼 이웃의 IP 주소로 대응시킨다. 다음 홉은 라우터이거나 목적지 자신이다.
- **Neighbor Unreachability Detection**: 노드가 이웃에 더는 닿을 수 없음을 알아낸다.
- **Duplicate Address Detection**: 노드가 쓰려는 주소를 다른 노드가 이미 쓰고 있는지 알아낸다. 자세한 절차는 [[ipv6#주소 자동 설정|중복 주소 검출]]에서 다룬다.
- **Redirect**: 라우터가 호스트에 특정 목적지로 가는 더 나은 첫 홉 노드를 알린다.[@ietf-rfc-4861-2007]

## 메시지

Neighbor Discovery는 [[icmp|ICMP]] 메시지 다섯 종류를 정의한다.[@ietf-rfc-4861-2007]

| 메시지                 | ICMP Type | 쓰임                                                                                                                                                                      |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Router Solicitation    | 133       | 인터페이스가 켜질 때 호스트가 라우터에 다음 예정 시각까지 기다리지 말고 바로 Router Advertisement를 보내 달라고 요청한다.                                                 |
| Router Advertisement   | 134       | 라우터가 주기적으로, 또는 Router Solicitation에 답해 자기 존재와 링크·인터넷 파라미터를 알린다. 링크 위 판별이나 주소 설정에 쓰는 접두사와 권장 hop limit 값 등을 담는다. |
| Neighbor Solicitation  | 135       | 노드가 이웃의 링크 계층 주소를 알아내거나, 캐시한 링크 계층 주소로 이웃에 아직 닿는지 확인하려고 보낸다. Duplicate Address Detection에도 쓴다.                            |
| Neighbor Advertisement | 136       | Neighbor Solicitation에 대한 응답이다. 노드는 링크 계층 주소가 바뀐 것을 알리려고 요청 없이 보내기도 한다.                                                                |
| Redirect               | 137       | 라우터가 호스트에 어떤 목적지로 가는 더 나은 첫 홉을 알린다.                                                                                                              |

## 주소 결정

노드는 대상 주소의 solicited-node 멀티캐스트 주소로 Neighbor Solicitation을 보내 대상에게 링크 계층 주소를 돌려 달라고 묻고, 대상은 유니캐스트 Neighbor Advertisement로 자기 링크 계층 주소를 돌려준다. 묻는 쪽도 Neighbor Solicitation에 자기 링크 계층 주소를 담으므로, 요청과 응답 한 쌍으로 양쪽이 서로의 링크 계층 주소를 알게 된다.[@ietf-rfc-4861-2007]

## 도달 가능성 추적

이웃으로 가거나 이웃을 거치는 통신은 하드웨어가 고장 나거나 인터페이스 카드를 hot-swap하는 등 여러 이유로 언제든 실패할 수 있다. 목적지가 고장 나면 복구할 수 없지만 경로가 고장 난 것이면 복구할 수도 있으므로, 노드는 패킷을 보내고 있는 이웃마다 도달 가능 상태를 능동적으로 추적한다.[@ietf-rfc-4861-2007]

## IPv4와의 차이

Neighbor Discovery는 [[ipv4|IPv4]]의 [[arp|ARP]], ICMP Router Discovery, ICMP Redirect를 합친 것에 대응한다.[@ietf-rfc-4861-2007]
