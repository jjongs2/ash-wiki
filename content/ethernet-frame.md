---
title: 이더넷 프레임
tags:
  - network/ethernet
verified: 2026-09-29
---

**이더넷 프레임**은 [[ethernet|이더넷]]의 MAC(Medium Access Control) 부계층이 주고받는 데이터 단위다.[@st-rm0008-2021][@microchip-an1120-2008] 프레임은 목적지 주소, 출발지 주소, 길이/타입, 데이터와 패드, FCS(Frame Check Sequence)로 이뤄지고, 매체로 보낼 때는 그 앞에 7옥텟 프리앰블과 1옥텟 SFD(Start Frame Delimiter)가 붙는다.[@st-rm0008-2021][@microchip-enc28j60-2012]

## 필드

| 필드          | 길이        | 내용                                                                                                               |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| 프리앰블      | 7옥텟       | 수신 측이 뒤따르는 데이터에 동기를 맞추게 한다.[@st-rm0008-2021][@microchip-an1120-2008]                           |
| SFD           | 1옥텟       | 프레임이 시작됨을 알린다. 매체에서 보이는 값은 `10101011`이다.[@st-rm0008-2021][@microchip-an1120-2008]            |
| 목적지 주소   | 6옥텟       | 프레임을 받을 스테이션의 [[mac-address\|MAC 주소]][@st-rm0008-2021][@microchip-enc28j60-2012]                      |
| 출발지 주소   | 6옥텟       | 프레임을 보낸 스테이션의 MAC 주소[@st-rm0008-2021][@microchip-enc28j60-2012]                                       |
| 길이/타입     | 2옥텟       | 값에 따라 데이터의 길이나 상위 프로토콜의 종류를 나타낸다.[@st-rm0008-2021][@microchip-enc28j60-2012]              |
| 데이터와 패드 | 46~1500옥텟 | 데이터가 $n$옥텟이고 $n < 46$이면 패드를 채운다.[@st-rm0008-2021][@microchip-enc28j60-2012]                        |
| FCS           | 4옥텟       | 목적지 주소부터 패드까지를 덮는 32비트 [[cyclic-redundancy-check\|CRC]][@st-rm0008-2021][@microchip-enc28j60-2012] |

[[ieee-802-3|IEEE 802.3]]-2022는 송신할 때 MAC 부계층이 프레임 앞에 프리앰블과 SFD를 붙이고, 수신할 때 MAC 부계층이 SFD까지의 앞 비트를 버리도록 정한다.[@ieee-802-3-2022] STM32F107의 이더넷 MAC은 송신할 때 `10101010` 패턴을 7바이트 되풀이한 프리앰블과 SFD를 만들어 붙이고, 수신할 때 떼어 낸다.[@st-rm0008-2021]

Microchip AN1120에 따르면 프레임 크기에는 보통 프리앰블과 SFD를 넣지 않는다.[@microchip-an1120-2008] 태그 없는 프레임의 길이는 최소 64옥텟, 최대 1518옥텟이다.[@st-rm0008-2021][@microchip-an1120-2008]

IEEE 802.3-2022는 MAC 클라이언트 데이터 필드의 최대 크기로 기본 프레임(basic frame)의 1500옥텟, Q-tagged 프레임의 1504옥텟, envelope 프레임의 1982옥텟 셋을 두고, 구현이 그 가운데 하나 이상을 지원하도록 정한다. envelope 프레임은 상위 캡슐화 프로토콜이 덧붙이는 앞뒤 정보를 담기 위한 것으로, 원래 MAC 클라이언트 데이터의 최대는 1500옥텟 그대로이고 캡슐화 프로토콜이 482옥텟까지 더할 수 있다. 이 표준은 더한 옥텟을 다른 용도로 쓰는 것을 권하지 않는다.[@ieee-802-3-2022]

Microchip AN1120에 따르면 반이중 CSMA/CD(Carrier Sense Multiple Access with Collision Detection)에서는 충돌이 모든 노드에 감지되기까지 망 전파 시간의 약 두 배가 걸리고, 이 시간을 **충돌 창**(slot time)이라 한다. 최소 프레임 크기는 이 충돌 창과 같게 정해졌다.[@microchip-an1120-2008]

IEEE 802.3-2022는 slot time이 물리 계층의 왕복 전파 시간과 MAC의 최대 jam 시간을 더한 것보다 커야 한다고 정한다. jam은 충돌을 감지한 스테이션이 충돌이 다른 송신 스테이션에도 감지될 만큼 이어지도록 보내는 비트열이다. 1000 Mb/s 반이중에서는 최소 프레임 크기만으로 CSMA/CD가 제대로 동작하기에 모자라므로, MAC이 slot time보다 짧은 프레임 뒤에 확장 비트를 붙여 송신이 적어도 slot time 동안 이어지게 하고, 확장 비트를 보내는 동안에도 충돌을 감시한다.[@ieee-802-3-2022]

## 길이/타입

길이/타입 필드의 값 $v$는 $v \le 1500$이면 데이터 필드의 옥텟 수이고[@st-rm0008-2021][@microchip-enc28j60-2012], $v \ge 1536$(`0x0600`)이면 EtherType이다.[@st-rm0008-2021][@microchip-an1120-2008] EtherType은 데이터 필드에 실린 상위 프로토콜을 가리키며, IEEE 등록 기관이 신청을 받아 배정한다.[@ieee-ra-ethertype-2026] 예를 들어 `0x0800`은 IPv4, `0x86DD`는 IPv6, `0x0806`은 ARP다.[@ieee-ra-ethertype-2024]

![[diagrams/ethernet-length-type-ranges.svg]]

## VLAN 태그

VLAN 태그를 단 프레임은 출발지 주소와 길이/타입 필드 사이에 4옥텟의 태그를 넣고, 태그의 첫 2옥텟은 `0x8100`이다. 태그를 단 프레임의 최대 길이는 1522옥텟이다.[@st-rm0008-2021][@microchip-an1120-2008] `0x8100`은 [[ieee-802-1q|IEEE 802.1Q]]가 정한 C-TAG(Customer VLAN Tag)의 EtherType으로 등록되어 있다.[@ieee-ra-ethertype-2024] 태그의 필드는 [[virtual-lan#VLAN 태그|VLAN]]에서 다룬다.

![[diagrams/ethernet-frame-vlan-tag-position.svg]]

## 프레임 사이 간격

송신 측은 보낸 프레임과 다음 프레임 사이에 유휴 간격을 두며, 이 간격을 **IPG**(Inter-Packet Gap)나 **IFG**(Inter-Frame Gap)라 한다.[@st-rm0008-2021][@microchip-an1120-2008] IEEE 802.3-2022는 모든 MAC 데이터율에서 IPG의 최소값을 96비트 시간으로 두고, 송신 측은 구현상 필요하면 이보다 긴 간격을 쓸 수 있다.[@ieee-802-3-2022] Microchip AN1120은 IPG로 10BASE-T에서 9.6 µs, 100BASE-TX에서 960 ns를 제시하며, 두 값은 각 방식의 96비트 시간이다.[@microchip-an1120-2008] STM32F107의 이더넷 MAC은 송신 프레임 사이의 최소 IFG를 96비트 시간부터 40비트 시간까지 8비트 시간 단위로 고르며, 리셋 값은 96비트 시간이다.[@st-rm0008-2021]
