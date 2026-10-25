---
title: 프레임 선점
tags:
  - network/ethernet
aliases:
  - IEEE 802.1Qbu
  - IEEE 802.3br
verified: 2026-09-29
---

**프레임 선점**(frame preemption)은 전송 중인 preemptable 프레임을 멈추고 express 프레임을 먼저 보낸 뒤, 멈춘 프레임을 이어서 보내는 기능이다.[@adi-adin3310-adin6310-2025][@ti-processor-sdk-linux-am64x-iet-2026] IEEE 802.3br-2016은 [[ieee-802-3|IEEE 802.3]]-2015의 개정(Amendment 5)으로, 물리 링크 하나에서 Interspersing Express Traffic을 지원하는 내용을 더했다.[@ieee-802-3br-2016] IEEE 802.1Qbu-2016은 [[ieee-802-1q|IEEE 802.1Q]]-2014의 개정(Amendment 26)으로, 프레임 선점을 지원하도록 전달 과정을 보강했다.[@ieee-802-1qbu-2016] IEEE 802.1 작업 그룹의 [[tsn|TSN]] 요약은 프레임 선점(IEEE 802.1Qbu, IEEE 802.3br)을 지연 상한을 위한 도구로 분류한다.[@ieee-802-1-tsn-summary-2026]

802.1Qbu 프로젝트는 시간이 중요하지 않은 프레임의 전송을 멈추고 시간이 중요한 프레임을 보낸 뒤 멈춘 프레임을 다시 보내게 하는 서비스 클래스를 정의하는 것을 범위로 삼았고, 링크 양쪽이 모두 선점을 지원할 때만 선점을 켜도록 했다.[@ieee-802-1qbu-project-2016]

## Express와 preemptable

선점을 지원하는 MAC(Medium Access Control)은 express MAC(eMAC)과 preemptable MAC(pMAC)을 둔다. express 큐의 프레임은 eMAC이, preemptable 큐의 프레임은 pMAC이 보낸다.[@adi-adin3310-adin6310-2025][@nxp-realtimeedgeug-2026] IEEE 802.3의 MAC Merge 부계층은 eMAC과 pMAC을 RS(Reconciliation Sublayer) 하나에 붙여, 두 MAC의 전송을 [[ethernet-phy|PHY]] 하나의 point-to-point 링크로 합친다.[@ieee-802-3-2022]

IEEE 802.3de-2022는 IEEE 802.3-2022의 개정으로, 10 Mbit/s 단일 쌍 이더넷의 점대점 PHY도 MAC Merge 부계층과 TSSI(Time Synchronization Service Interface)를 쓸 수 있도록 두 기능을 고쳤다.[@ieee-802-3de-2022] IEEE 802.3cg-2019가 정한 점대점 10 Mbit/s PHY는 그전까지 MAC Merge와 TSSI 가운데 하나 이상을 쓸 수 없었다.[@ieee-802-3de-par-2021]

구현은 송신 큐나 [[traffic-class|트래픽 클래스]]마다 express인지 preemptable인지를 설정으로 정한다.[@ti-processor-sdk-linux-am64x-iet-2026][@nxp-realtimeedgeug-2026] IEEE 802.1Q-2022는 선점을 지원하는 포트에서 priority 값마다 express인지 preemptable인지를 frame preemption status 표로 정하고, 그에 따라 프레임을 eMAC이나 pMAC으로 보낸다. 기본값은 모든 priority가 express이고, 같은 트래픽 클래스에 대응하는 priority들에는 같은 값을 주기를 권한다.[@ieee-802-1q-2022]

TI CPSW의 MAC Merge 부계층은 express 큐에 보낼 프레임이 있으면, preemptable 큐에서 전송 중인 프레임을 최소 조각 크기 요건을 채우는 첫 부분까지 보낸 뒤 선점한다.[@ti-processor-sdk-linux-am64x-iet-2026]

선점이 없으면 시간이 중요한 프레임은 앞서 시작된 큰 프레임을 기다려야 해서 지연이 커진다.[@adi-adin3310-adin6310-2025][@ieee-802-1qbu-project-2016] ADIN3310/ADIN6310 데이터시트에 따르면 1 Gbit/s에서 선점이 없으면 1528바이트 프레임이 끼어들어 홉마다 지연이 12 µs 넘게 달라질 수 있고, 선점을 쓰면 끼어드는 것이 길어야 128바이트인 조각으로 줄어 1.2 µs 미만이 된다.[@adi-adin3310-adin6310-2025]

선점을 [[time-aware-shaper|scheduled traffic]]과 함께 쓰면 express 창 앞의 [[time-aware-shaper#Guard band|guard band]]를 줄일 수 있다.[@adi-adin3310-adin6310-2025][@ti-processor-sdk-linux-am64x-iet-2026] ADIN3310/ADIN6310 데이터시트에 따르면 guard band를 줄이면 guard band 때문에 비는 대역폭이 줄어든다.[@adi-adin3310-adin6310-2025]

![[diagrams/guard-band-with-preemption.svg]]

## 조각

선점된 preemptable 프레임은 조각으로 나뉘어 전송되고, 받는 쪽이 조각을 다시 합쳐 원래 프레임으로 되돌린다.[@adi-adin3310-adin6310-2025][@ti-processor-sdk-linux-am64x-iet-2026] 선점을 쓰는 링크에서는 프리앰블 끝의 SFD(Start Frame Delimiter) 자리에 SMD(Start mPacket Delimiter)를 두어 express 프레임, preemptable 프레임의 첫 조각, 이어지는 조각을 구분하고, 이어지는 조각에는 조각 번호가 붙는다.[@adi-adin3310-adin6310-2025][@nxp-realtimeedgeug-2026]

ADIN3310/ADIN6310 데이터시트에 따르면 preemptable 프레임의 조각은 mCRC로 끝난다. mCRC가 기대한 [[cyclic-redundancy-check|CRC]]와 같으면 그 조각이 프레임의 끝이고, 기대한 CRC의 아래 16비트를 XOR한 값과 같으면 조각이 더 이어진다. ADIN6310은 마지막이 아닌 조각의 최소 크기를 64, 128, 192, 256바이트 가운데 하나로 설정할 수 있다.[@adi-adin3310-adin6310-2025]

preemptable 프레임을 이미 $s$바이트 보냈고 프레임 CRC를 포함해 $r$바이트가 남았을 때, IEEE 802.3-2022는 $s \ge 60$이고 $r \ge 64$일 때만 선점하게 해 조각이 64바이트보다 작아지지 않게 한다. 받는 쪽의 MAC Merge 부계층은 조각을 pMAC에 넘길 때 SMD 자리에 SFD를 넣고, 마지막이 아닌 조각의 mCRC는 넘기지 않으며, 이어지는 조각은 조각 번호 뒤의 데이터부터 넘긴다. 그래서 pMAC은 다시 합쳐진 프레임 하나를 받는다.[@ieee-802-3-2022]

![[diagrams/frame-preemption-fragments.svg]]

IEEE 802.1Q-2022의 Annex S(informative)는 마지막이 아닌 조각의 최소 크기를 64옥텟으로 둔다고 가정하고, preemptable 프레임이 이미 전송 중일 때 express 프레임이 전송을 시작하기까지의 지연을 최악 123옥텟 시간, 대개 64옥텟 시간 이하로 제시한다. 그 가정 아래에서는 마지막이 아닌 조각이 mCRC를 포함해 64옥텟이어야 하므로, 길이가 124(60 + 64)옥텟인 조각은 선점할 수 있지만 123옥텟 이하인 조각은 선점할 수 없기 때문이다. 실제 지연에는 프리앰블, SFD, IFG(Inter-Frame Gap), MAC 자체의 지연이 더해진다.[@ieee-802-1q-2022]

선점과 재조립은 링크마다 따로 일어난다. 스위치는 들어오는 포트에서 조각을 다시 합친 뒤 프레임을 전달한다.[@adi-adin3310-adin6310-2025][@ti-processor-sdk-linux-am64x-iet-2026] TI CPSW는 나가는 포트에서 그 프레임을 다시 선점할 수 있다.[@ti-processor-sdk-linux-am64x-iet-2026]

## 선점 기능의 확인

선점은 링크 상대가 LLDP(Link Layer Discovery Protocol)의 Additional Ethernet Capabilities TLV(Type-Length-Value)로 선점 지원을 알린 뒤에만 켜진다.[@adi-adin3310-adin6310-2025][@nxp-realtimeedgeug-2026]

IEEE 802.3-2022는 링크 상대가 Nearest Bridge 그룹 주소로 보낸 LLDPDU(LLDP Data Unit)의 Additional Ethernet Capabilities TLV로 선점 지원을 알렸을 때만 송신 방향의 선점을 켜고, MAC Merge 부계층이 링크 고장 표시를 받으면 끄도록 정한다. 이 표준은 검증(verification)을 켜면 검증이 성공한 뒤에만 선점이 동작하게 한다. 검증은 verify mPacket을 보내고 respond mPacket을 받아 상대가 선점을 지원하는지 확인하는 절차로, SMD-V(verify mPacket을 나타내는 SMD 값)와 올바른 mCRC를 담은 mPacket을 받은 쪽은 respond mPacket을 돌려보내고, SMD-R(respond mPacket을 나타내는 SMD 값)과 올바른 mCRC를 담은 mPacket을 받은 쪽은 선점 기능이 확인된 것으로 본다. 검증은 끌 수 있으며, 검증을 끄는 것은 링크가 선점을 지원함을 설계로 보장한 닫힌 망(engineered closed network)을 위한 것이다.[@ieee-802-3-2022]

![[diagrams/frame-preemption-verify-respond.svg]]

이 표준은 받는 쪽이 Additional Ethernet Capabilities TLV의 additional fragment size 필드로, 마지막이 아닌 조각에 64옥텟을 넘어 더 필요한 최소 옥텟 수를 64옥텟 단위의 2비트 정수로 알리게 한다. 이 표준은 그 값을 $a$라 하면, 보내는 쪽이 preemptable 프레임을 적어도 $64(1 + a) - 4$옥텟 보낸 뒤에야 선점하도록 정한다.[@ieee-802-3-2022]
