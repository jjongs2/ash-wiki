---
title: ICMP
tags:
  - network
aliases:
  - Internet Control Message Protocol
verified: 2026-09-29
---

**ICMP**(Internet Control Message Protocol)는 IP 데이터그램을 처리하다 생긴 오류를 알리는 프로토콜이다.[@ietf-rfc-792-1981] 진단에 쓰는 메시지도 주고받는다.[@ietf-rfc-1812-1995] [[ipv4|IPv4]]용 ICMP는 RFC 792가 정한다.[@ietf-rfc-792-1981][@ietf-rfc-4443-2006] ICMP는 IP의 일부로 모든 IP 모듈이 구현해야 한다.[@ietf-rfc-792-1981] ICMP 메시지는 IP 데이터그램에 실리고, IP 헤더의 Protocol 값 1로 표시된다.[@ietf-rfc-792-1981][@iana-protocol-numbers-2026]

ICMP는 IP를 신뢰성 있게 만들지 않는다. 데이터그램이 사라져도 ICMP 메시지가 반드시 나오지는 않는다.[@ietf-rfc-792-1981]

## 메시지 형식

ICMP 메시지는 8비트 Type, 8비트 Code, 16비트 Checksum으로 시작하고, 그 뒤의 내용은 Type마다 다르다.[@ietf-rfc-792-1981] Type은 메시지의 종류를 가리키고, Code의 값과 뜻은 Type마다 따로 정해진다.[@ietf-rfc-792-1981][@iana-icmp-parameters-2026]

오류 메시지는 오류를 일으킨 데이터그램의 IP 헤더와, 데이터에서 적어도 앞 8바이트를 담는다.[@ietf-rfc-1812-1995][@ietf-rfc-1122-1989] 받는 호스트는 이것으로 오류가 어느 프로세스의 것인지 가려낸다.[@ietf-rfc-792-1981]

![[diagrams/icmp-error-message-layout.svg]]

## 주요 메시지

이 RFC가 정한 주요 메시지는 아래와 같다.[@ietf-rfc-792-1981]

| Type | 이름                    | 쓰는 곳                                          |
| ---- | ----------------------- | ------------------------------------------------ |
| 0    | Echo Reply              | Echo에 대한 응답                                 |
| 3    | Destination Unreachable | 데이터그램을 목적지에 전달할 수 없음             |
| 5    | Redirect                | 더 나은 다음 홉 라우터를 알림                    |
| 8    | Echo                    | 받은 데이터를 그대로 돌려 달라는 요청            |
| 11   | Time Exceeded           | Time to Live가 0이 되었거나 재조립 시간이 지남   |
| 12   | Parameter Problem       | 헤더의 값이 잘못되어 데이터그램을 처리할 수 없음 |

Type 4인 Source Quench는 혼잡 제어 수단으로 정의된 메시지였으나 RFC 6633이 폐기했다.[@iana-icmp-parameters-2026][@ietf-rfc-6633-2012]

Destination Unreachable의 Code는 닿을 수 없는 사유를 가른다. RFC 792가 정한 Code는 아래와 같다.[@ietf-rfc-792-1981]

| Code | 사유                                              |
| ---- | ------------------------------------------------- |
| 0    | 네트워크에 닿을 수 없음                           |
| 1    | 호스트에 닿을 수 없음                             |
| 2    | 프로토콜에 닿을 수 없음                           |
| 3    | 포트에 닿을 수 없음                               |
| 4    | 나눠야 하는데 DF(Don't Fragment) 플래그가 서 있음 |
| 5    | 소스 라우팅 실패                                  |

## Echo와 ping

Echo를 받은 쪽은 Type을 0으로 바꾼 Echo Reply에 받은 데이터를 그대로 담아 돌려보낸다.[@ietf-rfc-792-1981] RFC 2151에 따르면 ping 도구는 ICMP Echo 메시지로 상대 호스트가 살아 있는지와 왕복 지연을 잰다.[@ietf-rfc-2151-1997]

## 오류 메시지를 보내지 않는 경우

ICMP 오류 메시지에 대해서는 ICMP 오류 메시지를 보내지 않는다.[@ietf-rfc-1812-1995][@ietf-rfc-1122-1989] 메시지에 대한 메시지가 끝없이 이어지는 것을 막기 위해서다.[@ietf-rfc-792-1981] 브로드캐스트나 멀티캐스트 주소로 온 데이터그램에 대해서도 오류 메시지를 보내지 않는다.[@ietf-rfc-1812-1995][@ietf-rfc-1122-1989]

## ICMPv6와의 차이

[[ipv6|IPv6]]용은 ICMPv6이며 RFC 4443이 정한다. ICMPv6는 바로 앞 헤더의 Next Header 값 58로 표시된다.[@ietf-rfc-4443-2006][@iana-protocol-numbers-2026]

ICMPv6는 오류 보고와 진단 말고도 Neighbor Discovery 메시지를 싣는다([[arp#Neighbor Discovery와의 차이|ARP]] 참고).[@ietf-rfc-4443-2006][@ietf-rfc-4861-2007]
