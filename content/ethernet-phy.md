---
title: 이더넷 PHY
tags:
  - network/ethernet
verified: 2026-09-29
---

**이더넷 PHY**(Physical Layer Device)는 이더넷의 물리 계층을 맡는 장치다.[@ieee-802-3-2022] 이더넷 PHY 칩은 꼬임쌍선 케이블로 데이터를 주고받는 데 필요한 물리 계층 기능을 한다. 위쪽으로는 [[mii|MII]] 계열 인터페이스로 MAC(Media Access Control)에 이어지고, 아래쪽으로는 MDI(Medium Dependent Interface)로 트랜스포머와 케이블에 이어진다. MAC은 별도 칩으로 두기도 하고, 프로세서나 SoC(System on Chip) 같은 칩에 넣기도 한다.[@ti-dp83822-2026][@microchip-lan8742a-2015]

![[diagrams/ethernet-phy-mac-mdi-connection.svg]]

## 부계층

LAN8742A는 송신 데이터를 PCS(Physical Coding Sublayer)와 PMA(Physical Medium Attachment)를 거쳐 PMD(Physical Medium Dependent) 부계층으로 보낸다.[@microchip-lan8742a-2015] DP83822는 100BASE-TX로 보낼 때 MII의 4비트 니블을 PCS의 5비트 코드 그룹으로 바꾸고, 받을 때 되돌린다.[@ti-dp83822-2026]

[[100base-tx|100BASE-TX]] PHY는 송신 쌍과 수신 쌍, 두 쌍을 쓰고 4B/5B와 MLT-3(Multi-Level Transmit)으로 부호화한다.[@ti-dp83822-2026][@microchip-lan8742a-2015] [[100base-t1|100BASE-T1]] PHY는 꼬임쌍선 한 쌍에 PAM3(Pulse Amplitude Modulation 3)를 쓴다.[@ti-dp83tc811r-q1-2018][@microchip-lan8770-2020] [[1000base-t1|1000BASE-T1]] PHY도 꼬임쌍선 한 쌍을 쓴다.[@ti-dp83tg720s-q1-2026][@microchip-lan887x-2024]

![[diagrams/ethernet-phy-pair-comparison.svg]]

차량용 PHY는 [[automotive-ethernet#물리 계층|차량용 이더넷]]에서 다룬다.

## 자동 협상

**자동 협상**(Auto-Negotiation)은 링크 양 끝의 PHY가 설정 정보를 주고받아 속도와 이중 모드를 정하는 방식이다. 100BASE-TX PHY는 자동 협상으로 양쪽이 지원하는 모드 가운데 가장 높은 것을 고른다.[@ti-dp83822-2026][@microchip-lan8742a-2015]

## 관리

PHY의 레지스터는 MDC(Management Data Clock)와 MDIO(Management Data Input/Output) 두 신호로 읽고 쓴다.[@ti-dp83822-2026][@microchip-lan8742a-2015] PHY 주소는 5비트이며, 관리 버스 하나를 PHY 32개까지 함께 쓸 수 있다.[@ti-dp83822-2026][@nxp-an13236-2022] 자동 협상을 끄면 기본 제어 레지스터로 속도와 이중 모드를 정하고, 기본 상태 레지스터로 링크 상태를 본다.[@ti-dp83822-2026][@microchip-lan8742a-2015]

![[diagrams/mdio-management-bus.svg]]

## 마스터와 슬레이브

[[100base-t1|100BASE-T1]] 링크에서는 두 PHY 가운데 하나가 마스터, 다른 하나가 슬레이브가 된다.[@ti-dp83tc811r-q1-2018][@nxp-an13236-2022] 역할과 클럭은 [[100base-t1#마스터와 슬레이브|100BASE-T1]]에서 다룬다.
