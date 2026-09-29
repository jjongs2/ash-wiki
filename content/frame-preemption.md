---
title: 프레임 선점
tags:
  - network/ethernet
aliases:
  - IEEE 802.1Qbu
  - IEEE 802.3br
verified: 2026-09-29
---

**프레임 선점**(frame preemption)은 전송 중인 preemptable 프레임을 멈추고 express 프레임을 먼저 보낸 뒤, 멈춘 프레임을 이어서 보내는 기능이다.[@adi-adin3310-adin6310-2025][@ti-processor-sdk-linux-am64x-iet-2026] IEEE 802.3br-2016은 IEEE 802.3-2015의 개정(Amendment 5)으로, 물리 링크 하나에서 Interspersing Express Traffic을 지원하는 내용을 더했다.[@ieee-802-3br-2016] IEEE 802.1Qbu-2016은 IEEE 802.1Q-2014의 개정(Amendment 26)으로, 프레임 선점을 지원하도록 전달 과정을 보강했다.[@ieee-802-1qbu-2016] IEEE 802.1 작업 그룹의 [[tsn|TSN]] 요약은 프레임 선점(IEEE 802.1Qbu, IEEE 802.3br)을 지연 상한을 위한 도구로 분류한다.[@ieee-802-1-tsn-summary-2026]

802.1Qbu 프로젝트는 시간이 중요하지 않은 프레임의 전송을 멈추고 시간이 중요한 프레임을 보낸 뒤 멈춘 프레임을 다시 보내게 하는 서비스 클래스를 정의하는 것을 범위로 삼았고, 링크 양쪽이 모두 선점을 지원할 때만 선점을 켜도록 했다.[@ieee-802-1qbu-project-2016]

## 구조·동작

### express와 preemptable

선점을 지원하는 MAC(Medium Access Control)은 express MAC(eMAC)과 preemptable MAC(pMAC)을 둔다. express 큐의 프레임은 eMAC이, preemptable 큐의 프레임은 pMAC이 보낸다.[@adi-adin3310-adin6310-2025][@nxp-realtimeedgeug-2026] 구현은 송신 큐나 [[traffic-class|트래픽 클래스]]마다 express인지 preemptable인지를 설정으로 정한다.[@ti-processor-sdk-linux-am64x-iet-2026][@nxp-realtimeedgeug-2026][@intel-eci-gptp-2024]

TI CPSW의 MAC merge 계층은 express 큐에 보낼 프레임이 있으면 preemptable 큐에서 전송 중인 프레임을 선점한다.[@ti-processor-sdk-linux-am64x-iet-2026]

### 조각

선점된 preemptable 프레임은 조각으로 나뉘어 전송되고, 받는 쪽이 조각을 다시 합쳐 원래 프레임으로 되돌린다.[@adi-adin3310-adin6310-2025][@ti-processor-sdk-linux-am64x-iet-2026] 선점을 쓰는 링크에서는 프리앰블 끝의 SFD(Start Frame Delimiter) 자리에 SMD(Start mPacket Delimiter)를 두어 express 프레임, preemptable 프레임의 첫 조각, 이어지는 조각을 구분하고, 이어지는 조각에는 조각 번호가 붙는다.[@adi-adin3310-adin6310-2025][@nxp-realtimeedgeug-2026]

ADIN3310/ADIN6310 데이터시트에 따르면 preemptable 프레임의 조각은 mCRC로 끝난다. mCRC가 기대한 CRC와 같으면 그 조각이 프레임의 끝이고, 기대한 CRC의 아래 16비트를 XOR한 값과 같으면 조각이 더 이어진다. ADIN6310은 마지막이 아닌 조각의 최소 크기를 64, 128, 192, 256바이트 가운데 하나로 설정할 수 있다.[@adi-adin3310-adin6310-2025]

### 선점 기능의 확인

선점은 링크 상대가 LLDP(Link Layer Discovery Protocol)의 Additional Ethernet Capabilities TLV(Type-Length-Value)로 선점 지원을 알린 뒤에만 켜진다.[@adi-adin3310-adin6310-2025][@nxp-realtimeedgeug-2026]

## 비교·한계

선점이 없으면 시간이 중요한 프레임은 앞서 시작된 큰 프레임을 기다려야 해서 지연이 커진다.[@adi-adin3310-adin6310-2025][@ieee-802-1qbu-project-2016] ADIN3310/ADIN6310 데이터시트에 따르면 1 Gbit/s에서 선점이 없으면 1528바이트 프레임이 끼어들어 홉마다 지연이 12 µs 넘게 달라질 수 있고, 선점을 쓰면 끼어드는 것이 128바이트 조각으로 줄어 1.2 µs 미만이 된다.[@adi-adin3310-adin6310-2025]

선점을 [[time-aware-shaper|scheduled traffic]]과 함께 쓰면 express 창 앞의 guard band를 줄일 수 있다.[@adi-adin3310-adin6310-2025][@ti-processor-sdk-linux-am64x-iet-2026] ADIN3310/ADIN6310 데이터시트에 따르면 guard band를 줄이면 guard band 때문에 비는 대역폭이 줄어든다.[@adi-adin3310-adin6310-2025]

선점과 재조립은 링크마다 따로 일어난다. 스위치는 들어오는 포트에서 조각을 다시 합친 뒤 프레임을 전달한다.[@adi-adin3310-adin6310-2025][@ti-processor-sdk-linux-am64x-iet-2026] TI CPSW는 나가는 포트에서 그 프레임을 다시 선점할 수 있다.[@ti-processor-sdk-linux-am64x-iet-2026]
