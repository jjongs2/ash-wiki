---
title: IPv6
tags:
  - network
aliases:
  - Internet Protocol version 6
verified: 2026-09-29
---

**IPv6**(Internet Protocol version 6)는 [[ipv4|IPv4]]를 잇는 IP(Internet Protocol)의 6판이다. RFC 8200이 정하며, 주소가 128비트다.[@ietf-rfc-8200-2017]

RFC 8200은 IPv4에서 바뀐 점으로 주소 공간 확장, 헤더 형식 단순화, 확장 헤더와 옵션의 개선, 흐름 레이블, 인증과 기밀성 기능을 든다.[@ietf-rfc-8200-2017]

## 구조·동작

### 기본 헤더

IPv6 헤더는 40바이트 고정 길이이고, 필드는 아래와 같다.[@ietf-rfc-8200-2017]

| 필드                | 비트 | 뜻                                                                            |
| ------------------- | ---- | ----------------------------------------------------------------------------- |
| Version             | 4    | IP 판 번호. IPv6는 6                                                          |
| Traffic Class       | 8    | 네트워크가 트래픽 관리에 쓴다                                                 |
| Flow Label          | 20   | 네트워크에서 하나의 흐름으로 다뤄질 패킷들을 발신자가 표시한다                |
| Payload Length      | 16   | 기본 헤더 뒤의 길이. 확장 헤더를 포함한다. 바이트 단위                        |
| Next Header         | 8    | 기본 헤더 바로 뒤에 오는 헤더의 종류                                          |
| Hop Limit           | 8    | 패킷을 전달하는 노드마다 1씩 줄이고, 전달할 때 0이거나 줄여서 0이 되면 버린다 |
| Source Address      | 128  | 발신 주소                                                                     |
| Destination Address | 128  | 목적 주소. Routing 헤더가 있으면 최종 수신자가 아닐 수 있다                   |

![[diagrams/ipv6-header-layout.svg]]

IPv4 헤더와 달리 IPv6 헤더에는 헤더 [[checksum|체크섬]] 필드가 없다. 또 IPv4와 달리, IPv6 노드가 보내는 [[udp|UDP]] 패킷은 기본적으로 UDP 체크섬을 생략할 수 없다. 예외로 UDP를 터널 캡슐화에 쓰는 프로토콜은 특정 포트에 체크섬 0 모드를 켤 수 있다.[@ietf-rfc-8200-2017]

### 확장 헤더

IPv6에서 선택적인 인터넷 계층 정보는 기본 헤더와 위 계층 헤더 사이에 놓이는 확장 헤더에 싣는다. 각 헤더의 Next Header 필드가 다음 헤더의 종류를 가리켜 헤더를 사슬처럼 잇는다. 패킷이 Destination Address의 노드에 닿기 전까지, 경로의 노드는 Hop-by-Hop Options 헤더 말고는 확장 헤더를 처리하지 않는다.[@ietf-rfc-8200-2017]

![[diagrams/ipv6-extension-header-chain.svg]]

### 단편화

IPv6에서는 라우터가 패킷을 나누지 않고 발신 노드만 나눈다. 모든 링크는 1280바이트 이상의 MTU(Maximum Transmission Unit)를 지원해야 한다.[@ietf-rfc-8200-2017]

### 주소

IPv6 주소는 128비트다. 주소는 16비트씩 여덟 부분으로 나누어 각 부분을 16진수로 쓰고 콜론으로 잇는다. 각 부분의 앞자리 0은 생략할 수 있고, 0인 16비트 부분 하나 이상을 한 곳에 한해 `::`로 줄일 수 있다.[@ietf-rfc-4291-2006] 예: `2001:db8:0:0:0:0:2:1`은 `2001:db8::2:1`로 쓴다. RFC 5952는 16진수 글자를 소문자로 쓰고 앞자리 0을 생략하도록 권한다.[@ietf-rfc-5952-2010]

![[diagrams/ipv6-address-zero-compression.svg]]

주소의 종류는 유니캐스트, 애니캐스트, 멀티캐스트다. 브로드캐스트 주소는 없고, 멀티캐스트가 그 역할을 맡는다.[@ietf-rfc-4291-2006]

## 비교·한계

IPv4 주소가 32비트인 데 비해 IPv6 주소는 128비트다.[@ietf-rfc-8200-2017]

IPv6에서는 Neighbor Discovery가 같은 링크 노드의 링크 계층 주소를 알아낸다. Neighbor Discovery는 IPv4의 [[arp|ARP]], [[icmp|ICMP]] Router Discovery, ICMP Redirect를 합친 것에 해당한다.[@ietf-rfc-4861-2007] IPv6에서 오류 보고는 ICMPv6가 맡는다.[@ietf-rfc-4443-2006]
