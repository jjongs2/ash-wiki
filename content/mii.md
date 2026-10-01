---
title: MII
tags:
  - network/ethernet
aliases:
  - Media Independent Interface
verified: 2026-09-29
---

**MII**(Media Independent Interface)는 이더넷의 MAC(Medium Access Control)과 [[ethernet-phy|PHY]]를 잇는 인터페이스로, 10 Mbit/s와 100 Mbit/s 데이터 전송에 쓴다.[@ti-dp83822-2026][@st-rm0008-2021] IEEE 802.3은 속도마다 MII를 정하며, MII 덕분에 동축, 꼬임쌍선, 광케이블, 전기 백플레인 가운데 어느 매체에서 동작하는 PHY든 골라 쓸 수 있다.[@ieee-802-3-2022]

## 신호

MII는 데이터를 4비트 단위로 주고받는다.[@ti-dp83822-2026][@microchip-ksz9477s-2019] 송신 쪽과 수신 쪽은 각각 데이터 선 넷, 클럭, 유효 표시, 오류 표시를 갖는다.[@microchip-ksz9477s-2019][@ti-dp83tc811r-q1-2018]

| 구분      | 송신     | 수신     |
| --------- | -------- | -------- |
| 데이터    | TXD<3:0> | RXD<3:0> |
| 클럭      | TX_CLK   | RX_CLK   |
| 유효 표시 | TX_EN    | RX_DV    |
| 오류 표시 | TX_ER    | RX_ER    |

TX_CLK와 RX_CLK는 모두 PHY가 내며, 100 Mbit/s에서 25 MHz, 10 Mbit/s에서 2.5 MHz다. MAC은 TX_EN을 올린 동안 TX_CLK에 맞춰 TXD에 데이터를 싣고, PHY는 RXD에 유효한 데이터를 내는 동안 RX_DV를 올린다. 매체 상태를 알리는 신호도 둘 있다. CRS(Carrier Sense)는 송신이나 수신 매체가 쉬지 않음을 알린다.[@ti-dp83822-2026][@st-rm0008-2021] COL(Collision)은 반이중 동작에서 충돌을 알린다.[@ti-dp83822-2026][@microchip-ksz9477s-2019] [[100base-t1|100BASE-T1]] PHY인 TJA1100은 COL과 CRS 핀을 두지 않는다.[@nxp-tja1100-2017]

## 관리 인터페이스

MDC(Management Data Clock)와 MDIO(Management Data Input/Output)는 PHY의 레지스터를 읽고 쓰는 관리 인터페이스로, MII 신호에 함께 든다. MDC는 PHY 바깥의 관리 쪽이 주는 클럭이고, MDIO는 양방향 데이터 선이다. 관리 프레임은 PHY 주소 5비트와 레지스터 주소 5비트를 담는다.[@ti-dp83822-2026][@st-rm0008-2021]

![[diagrams/mdio-management-bus.svg]]

## RMII, GMII, RGMII와의 차이

RMII(Reduced MII)는 MII를 바탕으로 핀 수를 줄인 인터페이스다. RMII는 CRS와 RX_DV를 CRS_DV 하나로 합치고, 송신과 수신이 함께 쓰는 50 MHz 기준 클럭에 맞춰 데이터를 2비트씩 보낸다.[@ti-dp83822-2026][@microchip-ksz9477s-2019]

IEEE 802.3은 MII를 바탕으로 한 1 Gbit/s 전용 인터페이스로 GMII(Gigabit MII)를 정하며, GMII는 MII의 신호 이름과 관리 인터페이스를 이어받는다.[@ieee-802-3-2022] GMII는 데이터를 8비트 단위로 125 MHz 클럭에 맞춰 보낸다.[@ti-dp83867ir-2026][@microchip-ksz9031mnx-2017] RGMII(Reduced GMII)는 1 Gbit/s에서 데이터 선 넷으로 클럭의 두 에지에 데이터를 실어, GMII의 24핀을 12핀으로 줄인다.[@microchip-ksz9477s-2019][@ti-dp83867ir-2026]

차량용 PHY도 MII나 그 변형으로 MAC에 이어진다. 100BASE-T1 PHY인 DP83TC811R-Q1은 MII, RMII, RGMII를, TJA1101B는 MII와 RMII를 지원한다.[@ti-dp83tc811r-q1-2018][@nxp-tja1101b-2021]
