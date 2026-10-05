---
title: 이더넷 PHY
tags:
  - network/ethernet
verified: 2026-09-29
---

**이더넷 PHY**(Physical Layer Device)는 [[ethernet|이더넷]]의 물리 계층을 맡는 장치다.[@ieee-802-3-2022] 이더넷 PHY 칩은 꼬임쌍선 케이블로 데이터를 주고받는 데 필요한 물리 계층 기능을 한다. 위쪽으로는 [[mii|MII]] 계열 인터페이스로 MAC(Medium Access Control)에 이어지고, 아래쪽으로는 MDI(Medium Dependent Interface)로 트랜스포머와 케이블에 이어진다. MAC은 별도 칩으로 두기도 하고, 프로세서나 SoC(System on Chip) 같은 칩에 넣기도 한다.[@ti-dp83822-2026][@microchip-lan8742a-2015]

![[diagrams/ethernet-phy-mac-mdi-connection.svg]]

## 부계층

[[ieee-802-3|IEEE 802.3]]-2022는 PHY를 PCS(Physical Coding Sublayer), PMA(Physical Medium Attachment), PMD(Physical Medium Dependent) 같은 부계층으로 나누어 정한다. PCS는 데이터 비트를 부호화해 PMA로 넘기고 PMA에서 받은 신호를 복호한다. PMA는 송신과 수신을 맡고, PHY에 따라 충돌 검출과 클럭 복구도 맡는다. PMD는 MDI 바로 위에서 전송 매체와의 접속을 맡는다. 예를 들어 [[100base-tx|100BASE-TX]]의 PCS는 MII의 4비트 니블을 5비트 코드 그룹으로 바꾸고 받을 때 되돌리며, 코드 비트는 PMA를 거쳐 PMD로 간다. 부계층의 구성은 PHY 종류마다 달라서, [[100base-t1|100BASE-T1]] PHY와 [[1000base-t1|1000BASE-T1]] PHY는 PCS와 PMA로 이루어진다. MAC과 MII 사이의 RS(Reconciliation Sublayer)는 MII의 신호를 MAC이 쓰는 물리 계층 서비스 정의에 대응시킨다.[@ieee-802-3-2022]

100BASE-TX PHY는 송신 쌍과 수신 쌍, 두 쌍을 쓰고 4B/5B와 [[100base-tx#MLT-3|MLT-3]](Multi-Level Transmit)으로 부호화한다.[@ti-dp83822-2026][@microchip-lan8742a-2015] 100BASE-T1 PHY는 꼬임쌍선 한 쌍에 PAM3(Pulse Amplitude Modulation 3)를 쓴다.[@ti-dp83tc811r-q1-2018][@microchip-lan8770-2020] 1000BASE-T1 PHY도 꼬임쌍선 한 쌍을 쓴다.[@ti-dp83tg720s-q1-2026][@microchip-lan887x-2024]

![[diagrams/ethernet-phy-pair-comparison.svg]]

차량용 PHY는 [[automotive-ethernet#물리 계층|차량용 이더넷]]에서 다룬다.

## 자동 협상

**자동 협상**(Auto-Negotiation)은 링크 양 끝의 PHY가 설정 정보를 주고받아 속도와 이중 모드를 정하는 방식이다. 100BASE-TX PHY는 자동 협상으로 양쪽이 지원하는 모드 가운데 가장 높은 것을 고른다.[@ti-dp83822-2026][@microchip-lan8742a-2015]

IEEE 802.3-2022는 자동 협상을 Clause 28, Clause 37, Clause 73, Clause 98에서 정한다. Clause 28의 자동 협상은 변형한 10BASE-T 링크 무결성 시험 펄스열로 동작한다. 링크 양 끝의 장치는 자기 능력을 알리고 함께 가진 동작 모드를 확인하며, 공통 모드가 여럿이면 미리 정한 우선순위로 하나를 고른다. 자동 협상을 지원하지 않는 링크 상대는 parallel detection으로 알아내지만, 이때는 고른 PMA에 해당하는 반이중 모드만 자동으로 알아낼 수 있다. 1000BASE-T PHY는 Clause 28의 자동 협상을 반드시 지원해야 한다.[@ieee-802-3-2022]

IEEE 802.3-2022는 Clause 98에서 꼬임쌍선 한 쌍의 자동 협상을 정한다. 이 자동 협상은 DME(Differential Manchester Encoding) 페이지를 반이중으로 주고받으며, 링크 양 끝이 공통 모드를 고르게 하는 것에 더해 링크 트레이닝 전에 두 장치의 시간 기준을 맞추는 것도 목표로 한다. [[100base-t1|100BASE-T1]], [[1000base-t1|1000BASE-T1]], [[10base-t1s|10BASE-T1S]], [[multigbase-t1|MultiGBASE-T1]]의 2.5GBASE-T1, 5GBASE-T1, 10GBASE-T1은 Clause 98의 자동 협상을 선택 사항으로 쓴다.[@ieee-802-3-2022] IEEE 802.3cy-2023이 정하는 25GBASE-T1도 Clause 98의 자동 협상을 선택 사항으로 쓴다.[@ieee-802-3cy-2023]

## 진단

차량용 PHY는 케이블의 단선과 단락을 진단한다.[@ti-dp83tg720s-q1-2026][@nxp-tja1103-2026] DP83TC811R-Q1은 TDR(Time Domain Reflectometry)로 꼬임쌍선 케이블에 시험 펄스를 보내고, 결함마다 돌아오는 반사의 시간과 세기를 재어 단선과 단락을 찾고 그 위치를 추정한다.[@ti-dp83tc811r-q1-2018] DP83TG720S-Q1도 TDR로 단선과 단락을 찾고 그 위치를 추정한다.[@ti-dp83tg720s-q1-2026]

차량용 PHY는 링크 품질을 SQI(Signal Quality Indicator)로 알린다.[@ti-dp83tg720s-q1-2026][@nxp-tja1103-2026] DP83TC811R-Q1과 DP83TG720S-Q1은 PHY가 잰 SNR(Signal-to-Noise Ratio)로 SQI를 정한다.[@ti-dp83tc811r-q1-2018][@ti-dp83tg720s-q1-2026] SQI의 단계 수와 단계가 뜻하는 BER(Bit Error Ratio)은 칩마다 다르다. DP83TC811R-Q1은 SQI를 네 단계의 상태와 백분율로 나타낸다.[@ti-dp83tc811r-q1-2018] DP83TG720S-Q1은 여덟 단계로 나타내며, 5단계에서 BER이 $10^{-10}$보다 낫다.[@ti-dp83tg720s-q1-2026] TJA1103은 0(가장 나쁨, 링크 없음)부터 7(가장 좋음)까지로 나타내며, 가우스 잡음을 가정하면 3 이상에서 BER이 $10^{-10}$ 이하다.[@nxp-tja1103-2026]

## 관리

PHY의 레지스터는 MDC(Management Data Clock)와 MDIO(Management Data Input/Output) 두 신호로 읽고 쓴다.[@ti-dp83822-2026][@microchip-lan8742a-2015] PHY 주소는 5비트이며, 관리 버스 하나를 PHY 32개까지 함께 쓸 수 있다.[@ti-dp83822-2026][@nxp-an13236-2022] 자동 협상을 끄면 기본 제어 레지스터로 속도와 이중 모드를 정하고, 기본 상태 레지스터로 링크 상태를 본다.[@ti-dp83822-2026][@microchip-lan8742a-2015]

![[diagrams/mdio-management-bus.svg]]

## 마스터와 슬레이브

[[100base-t1|100BASE-T1]] 링크에서는 두 PHY 가운데 하나가 마스터, 다른 하나가 슬레이브가 된다.[@ti-dp83tc811r-q1-2018][@nxp-an13236-2022] 자세한 것은 100BASE-T1의 [[100base-t1#마스터와 슬레이브|마스터와 슬레이브]]에서 다룬다.
