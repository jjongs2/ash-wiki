---
title: VLAN
tags:
  - network/ethernet
verified: 2026-09-29
---

**VLAN**(Virtual LAN)은 개별 LAN(Local Area Network)들을 잇는 브리지가 브리지로 이어진 네트워크와 함께 제공하는 가상 LAN으로, [[ieee-802-1q|IEEE 802.1Q]]가 이 브리지를 정한다.[@ieee-802-1q-rev-2025] 프레임이 속한 VLAN은 VLAN 태그에 실린 식별자로 나타내고, 브리지는 VLAN마다 프레임을 내보낼 포트를 따로 둔다.[@ieee-802-1q-types-yang-2022][@ieee-802-1q-bridge-yang-2022]

## 구조·동작

### VLAN 태그

IEEE 802.1Q는 VLAN 태그를 정한다. C-VLAN(Customer VLAN) 태그는 EtherType `0x8100`을 쓴다.[@ieee-802-1q-types-yang-2022][@ieee-ra-ethertype-2024] 태그가 [[ethernet-frame|이더넷 프레임]]의 어디에 들어가는지는 그 페이지에서 다룬다.

태그 안에서 프레임의 우선순위를 0부터 7까지의 값으로 나타내는 3비트 필드를 **PCP**(Priority Code Point)라 한다.[@ieee-802-1q-types-yang-2022] 프레임의 drop_eligible 파라미터를 싣는 필드를 **DEI**(Drop Eligible Indicator)라 한다.[@ieee-802-1q-bridge-yang-2022] 프레임이 속한 VLAN을 가리키는 12비트 값을 **VID**(VLAN Identifier)라 한다.[@ieee-802-1q-types-yang-2022]

VLAN을 가리키는 VID는 1부터 4094까지이고, 0과 4095(`0xFFF`)는 VLAN 번호로 쓰지 않는다. 그래서 쓸 수 있는 VID는 4094개다.[@ieee-802-1q-types-yang-2022]

IEEE 802.1Q-2005는 태그의 TCI(Tag Control Information)에서 PCP와 VID 사이의 1비트를 CFI(Canonical Format Indicator)로 두었고[@ieee-802-1q-2005], 현행판 IEEE 802.1Q-2022는 태그에 DEI를 둔다.[@ieee-802-1q-bridge-yang-2022]

![[diagrams/vlan-tag-fields.svg]]

### 포트와 VLAN 분류

브리지는 태그 없는 프레임과 우선순위만 태그된 프레임을 받으면, 받은 포트에 설정된 PVID(Port VLAN Identifier)의 VLAN에 넣는다.[@ieee-802-1q-bridge-mib-2022] KSZ9477S는 802.1Q VLAN 모드에서 태그의 VID로 VLAN 테이블을 찾고, 태그 없는 프레임이나 null VID 프레임은 들어온 포트의 기본 VID로 찾는다.[@microchip-ksz9477s-2019]

IEEE 802.1v-2001은 데이터 링크 계층의 프로토콜 식별로 들어오는 프레임을 분류하는 규칙을 IEEE 802.1Q에 더했다.[@ieee-802-1v-2001]

### 태그를 붙이고 떼기

IEEE 802.1Q-2022는 VID마다 프레임을 내보낼 포트의 집합(member set)과, 그 가운데 태그 없이 내보낼 포트의 집합(untagged set)을 둔다.[@ieee-802-1q-bridge-yang-2022][@ieee-802-1q-bridge-mib-2022]

![[diagrams/vlan-member-untagged-set.svg]]

KSZ9477S는 VLAN 기능을 켜면 들어온 태그 없는 프레임에 포트의 기본 태그를 붙이고, VLAN 테이블 항목에서 untag를 켠 포트로 프레임이 나갈 때 태그를 뗀다. Egress VLAN Filtering 비트를 켜면 주소 조회로 정한 포트 가운데 VLAN 테이블의 port membership에 든 포트로만 보내며, 이 비트의 기본값은 0이다.[@microchip-ksz9477s-2019]

## 비교·한계

이더넷 MAC(Media Access Control)과 스위치 칩은 태그 없는 프레임은 1518바이트, VLAN 태그가 있는 프레임은 1522바이트까지 정상 길이로 받는다.[@microchip-ksz9477s-2019][@st-rm0008-2021]

IEEE 802.1ad-2005는 서비스 제공자가 IEEE 802.1Q의 구조와 프로토콜로 여러 고객에게 서로 분리된 LAN에 해당하는 서비스를 제공하게 하는 provider bridge를 정했다.[@ieee-802-1ad-2005] S-VLAN(Service VLAN) 태그는 EtherType `0x88A8`을 쓴다.[@ieee-802-1q-types-yang-2022][@ieee-ra-ethertype-2024] 이 값은 IEEE 802.1ad가 처음 들였고, IEEE 802.1Q-2011에 합쳐졌다.[@ieee-802-1q-types-yang-2022] KSZ9477S는 서비스 제공자가 고객의 태그 위에 둘째 태그를 덧붙이는 double tagging(Q-in-Q)을 지원하며, 바깥 태그는 출발지 주소 바로 뒤에 오고 TPID(Tag Protocol Identifier)가 안쪽 태그와 다르다.[@microchip-ksz9477s-2019]
