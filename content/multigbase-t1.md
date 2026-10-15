---
title: MultiGBASE-T1
tags:
  - network/ethernet
aliases:
  - 2.5GBASE-T1
  - 5GBASE-T1
  - 10GBASE-T1
  - IEEE 802.3ch
verified: 2026-10-06
---

[[ieee-802-3|IEEE 802.3]]-2022는 1000 Mbit/s를 넘는 속도의 BASE-T1 [[ethernet-phy|PHY]]인 2.5GBASE-T1, 5GBASE-T1, 10GBASE-T1을 묶어 **MultiGBASE-T1**이라 부른다. 세 PHY는 PCS(Physical Coding Sublayer), PMA(Physical Medium Attachment), MDI(Medium Dependent Interface) 명세를 함께 쓰는 별개의 PHY 타입이고, 데이터율에 따라 주파수만 비례해 줄인다.[@ieee-802-3-2022] IEEE 802.3cy-2023은 이 정의에, Clause 149가 아닌 Clause 165로 정하는 25 Gbit/s의 25GBASE-T1을 더한다.[@ieee-802-3cy-2023]

IEEE 802.3ch-2020이 2.5, 5, 10 Gbit/s의 차량용 전기 [[ethernet|이더넷]] 물리 계층을 넣었다.[@ieee-802-3ch-2020] IEEE 802.3 Multi-Gig Automotive Ethernet PHY 연구 그룹은 전이중 동작만 지원하고, 차량 환경(EMC(Electromagnetic Compatibility), 온도)에서 동작하며, 선택 사항으로 자동 협상과 [[energy-efficient-ethernet|EEE]]를, 알맞은 매체에서는 Clause 104의 [[podl|PoDL]]을 지원하는 것을 목표로 두었다.[@ieee-802-3ch-objectives-2017]

## 동작

IEEE 802.3-2022는 2.5GBASE-T1, 5GBASE-T1, 10GBASE-T1이 평형 도체 한 쌍 위에서 방향마다 2.5 Gbit/s, 5 Gbit/s, 10 Gbit/s로 동시에 주고받는 전이중 PHY로 차량 환경의 EMC와 온도 요구를 맞추도록 정한다. 데이터율에 따라 바뀌는 파라미터에는 비례 계수 $S$를 쓰며, $S$는 10GBASE-T1이 1, 5GBASE-T1이 0.5, 2.5GBASE-T1이 0.25다.[@ieee-802-3-2022]

## 부호화

이 표준은 MultiGBASE-T1의 PCS가 [[mii|MII]] 계열의 XGMII(10 Gigabit Media Independent Interface)로 MAC(Medium Access Control) 쪽과 이어지도록 정한다. PCS는 XGMII의 TX_D, TX_EN, TX_ER를 64B/65B로 부호화하고, 64B/65B 블록 50개마다 RS-FEC(Reed–Solomon Forward Error Correction) 패리티 340비트를 더해 비트 오류율 BER(Bit Error Ratio)을 $\mathrm{BER} \le 10^{-12}$로 유지한다. 33비트 스크램블러로 EMC 성능을 높이고, 네 준위의 PAM4(Pulse Amplitude Modulation 4)로 보낸다. 심볼률은 2.5GBASE-T1이 1406.25 MBd, 5GBASE-T1이 2812.5 MBd, 10GBASE-T1이 5625 MBd다.[@ieee-802-3-2022]

## 링크 세그먼트

이 표준은 MultiGBASE-T1이 인라인 커넥터를 4개까지 둔 평형 도체 한 쌍의 차량용 링크 세그먼트에서 적어도 15 m를 지원하도록 정한다. 이 링크 세그먼트 명세는 차량 요구사항에서 나왔지만, 차량 밖 응용에도 쓸 수 있다.[@ieee-802-3-2022]

![[diagrams/link-segment-inline-connectors.svg]]

## 마스터와 슬레이브

이 표준은 MultiGBASE-T1 PHY가 실행 중 설정에 따라 마스터로도 슬레이브로도 동작할 수 있도록 정한다. 마스터는 로컬 클럭으로, 슬레이브는 받은 신호에서 복구한 클럭으로 송신 타이밍을 정한다. Clause 98의 [[ethernet-phy#자동 협상|자동 협상]]은 선택 사항이며, 쓰면 그 과정에서 두 PHY의 역할이 정해진다. 쓰지 않으면 관리나 하드웨어 설정으로 역할을 정하고, PHY Link Synchronization 기능으로 마스터와 슬레이브를 맞춘다.[@ieee-802-3-2022]

## EEE와 OAM

이 표준은 MultiGBASE-T1 PHY가 선택 사항으로 EEE를 지원해, 링크 사용률이 낮은 동안 저전력 모드로 들어가 전력을 줄일 수 있게 한다. 선택 사항인 MultiGBASE-T1 OAM(Operations, Administration, and Maintenance)은 PCS 기반으로, 두 PHY가 링크 상태와 메시지를 이더넷 데이터 흐름 밖에서 주고받아 링크 동작을 감시하게 한다.[@ieee-802-3-2022]
