---
title: 트래픽 클래스
tags:
  - network/ethernet
verified: 2026-09-29
---

**트래픽 클래스**(traffic class)는 IEEE 802.1Q 브리지 포트가 출구에서 프레임을 담는 큐의 단위로, 포트가 지원하는 트래픽 클래스마다 큐가 하나씩 대응한다.[@ieee-802-1q-bridge-yang-2022] IEEE 802.1Q는 포트가 트래픽 클래스를 1개부터 8개까지 둘 수 있게 하고, 트래픽 클래스 번호를 0부터 7까지로 두며 번호가 클수록 우선순위가 높다고 정한다.[@ieee-802-1q-types-yang-2022]

## 구조·동작

### 우선순위와 트래픽 클래스의 대응

IEEE 802.1Q는 프레임의 우선순위를 0부터 7까지로 두고, 이를 VLAN 태그의 3비트 PCP(Priority Code Point) 필드에 싣는다.[@ieee-802-1q-types-yang-2022] 브리지 포트는 우선순위를 트래픽 클래스로 옮기는 표를 두며[@ieee-802-1q-bridge-yang-2022], 이 표는 우선순위마다 트래픽 클래스 하나를 대응시킨다.[@ieee-802-1q-types-yang-2022] IEEE 802.1Q는 이 표의 항목을 읽고 쓸 수 있는 관리 객체로 정하지만, 장치가 쓰기를 지원하기를 요구하지는 않는다.[@ieee-8021-bridge-mib-2022]

### 전송 선택

포트는 지원하는 트래픽 클래스마다 전송 선택 알고리즘 하나를 지정하고, 그 알고리즘이 트래픽 클래스의 큐에서 내보낼 프레임을 고른다.[@ieee-802-1q-bridge-yang-2022] IEEE 802.1Q는 알고리즘마다 정수 식별자를 붙인다. strict priority는 0, [[credit-based-shaper|credit-based shaper]]는 1이다. 벤더 고유 알고리즘은 256 이상의 4옥텟 값으로 나타내며, 상위 3옥텟에는 OUI(Organizationally Unique Identifier)나 CID(Company ID)가, 하위 1옥텟에는 그 소유자가 정한 값이 들어간다.[@ieee-802-1q-fqtss-mib-2022]

**strict priority**는 우선순위가 높은 큐부터 전송하는 스케줄링으로, 낮은 우선순위 큐는 그보다 높은 우선순위 큐에 보낼 패킷이 없을 때만 전송한다.[@microchip-ksz9477s-2019][@intel-i210-2019]

Credit-based shaper는 큐가 내보내는 속도를 그 큐에 예약한 대역폭까지로 제한한다.[@microchip-ksz9477s-2019][@st-rm0436-2025]

IEEE 802.1Q의 [[time-aware-shaper|scheduled traffic]]은 포트의 트래픽 클래스마다 게이트를 두고, 게이트는 열림과 닫힘 두 상태를 가진다.[@ieee-802-1qcw-sched-yang-2023]

![[diagrams/egress-queue-transmission-selection.svg]]

## 비교·한계

IEEE 802.1Qbu 프로젝트 페이지에 따르면, 시간이 중요하지 않은 큰 프레임이 먼저 전송을 시작하면 시간이 중요한 프레임의 지연이 크게 늘어난다. [[frame-preemption|프레임 선점]]은 시간이 중요하지 않은 프레임의 전송을 멈추고 시간이 중요한 프레임을 먼저 보낸 뒤 멈춘 프레임을 이어 보내, 시간이 중요한 프레임의 지연을 줄인다.[@ieee-802-1qbu-project-2016]
