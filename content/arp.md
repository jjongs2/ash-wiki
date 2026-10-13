---
title: ARP
tags:
  - network
aliases:
  - Address Resolution Protocol
verified: 2026-09-29
---

**ARP**(Address Resolution Protocol)는 [[ipv4|IPv4]] 주소 같은 프로토콜 주소를 [[ethernet|이더넷]] 주소 같은 링크 계층 주소로 바꾸는 프로토콜이며, RFC 826이 정한다.[@ietf-rfc-826-1982] 이더넷에서 ARP 패킷은 EtherType `0x0806`으로 실린다.[@ieee-ra-ethertype-2024]

## 요청과 응답

호스트가 같은 링크의 IPv4 주소로 보낼 때 대응하는 링크 계층 주소가 ARP 캐시에 없으면 ARP 요청을 브로드캐스트한다. 요청에는 보내는 쪽의 주소 쌍과 찾는 IPv4 주소가 들어 있다. 요청을 받은 호스트는 찾는 주소가 자기 주소이면, 자기 링크 계층 주소를 담은 ARP 응답을 브로드캐스트하지 않고 요청한 호스트에 직접 보낸다.[@ietf-rfc-826-1982]

요청을 받은 호스트 가운데 찾는 주소의 주인은 요청한 호스트의 주소 쌍을 자기 캐시에 넣는다. 캐시에 이미 그 호스트의 항목이 있는 호스트는 그 항목을 새 링크 계층 주소로 고친다. 그래서 응답하는 쪽도 따로 묻지 않고 요청한 쪽의 주소를 안다.[@ietf-rfc-826-1982]

호스트는 알아낸 주소 쌍을 캐시에 두고 다시 쓴다.[@ietf-rfc-826-1982][@ietf-rfc-1122-1989] RFC 1122는 ARP 구현이 낡은 캐시 항목을 지우는 방법을 두도록 요구한다.[@ietf-rfc-1122-1989]

![[diagrams/arp-request-reply.svg]]

목적 호스트가 다른 네트워크에 있으면 IP 데이터그램은 연결된 네트워크의 라우터로 보내고, ARP는 목적 호스트가 아니라 이 다음 홉의 링크 계층 주소를 찾는다.[@ietf-rfc-826-1982][@ietf-rfc-1122-1989]

ARP에는 보안 취약점이 있다. 악의적인 호스트는 거짓 ARP 패킷을 보내 다른 호스트의 동작을 방해할 수 있다. 예를 들어 모든 ARP 요청에 자기 하드웨어 주소를 담아 응답하면 네트워크의 모든 주소를 제 것이라고 주장할 수 있다.[@ietf-rfc-5227-2008]

## 패킷

ARP 패킷의 필드는 아래와 같다.[@ietf-rfc-826-1982]

| 필드                    | 뜻                                                                        |
| ----------------------- | ------------------------------------------------------------------------- |
| Hardware type           | 링크 계층(하드웨어 주소 공간)의 종류. 이더넷은 1                          |
| Protocol type           | 찾는 프로토콜 주소의 종류. 이더넷에서는 그 프로토콜의 EtherType 값        |
| Hardware address length | 링크 계층 주소의 길이. 바이트 단위                                        |
| Protocol address length | 프로토콜 주소의 길이. 바이트 단위                                         |
| Opcode                  | 요청은 1, 응답은 2                                                        |
| Sender hardware address | 보내는 쪽의 링크 계층 주소                                                |
| Sender protocol address | 보내는 쪽의 프로토콜 주소                                                 |
| Target hardware address | 받는 쪽의 링크 계층 주소. 요청에서는 이 값을 알아내려는 것이라 뜻이 없다. |
| Target protocol address | 받는 쪽의 프로토콜 주소                                                   |

IPv4의 Protocol type은 IP의 EtherType인 `0x0800`이다.[@ietf-rfc-826-1982][@ietf-rfc-894-1984]

## Neighbor Discovery와의 차이

[[ipv6|IPv6]] 노드는 IPv4에서 ARP가 하던 일, 곧 같은 링크에 있는 이웃의 링크 계층 주소를 알아내는 일을 Neighbor Discovery 프로토콜로 한다.[@ietf-rfc-4861-2007]
