---
title: Energy-Efficient Ethernet
tags:
  - network/ethernet
aliases:
  - EEE
  - IEEE 802.3az
verified: 2026-10-06
---

**Energy-Efficient Ethernet**(EEE)은 [[ethernet|이더넷]]의 MAC(Medium Access Control)과 LPI(Low Power Idle) 모드를 지원하는 [[ethernet-phy|PHY]]를 묶어, 링크 사용률이 낮은 동안 링크 양쪽 시스템이 전력을 아끼게 하는 [[ieee-802-3|IEEE 802.3]]의 선택 기능이다. IEEE 802.3-2022는 EEE가 링크 상태를 바꾸지 않고 프레임을 버리거나 손상시키지 않으면서 PHY들이 더 낮은 전력 소비 수준으로 들고 나는 전환을 맞추는 프로토콜을 두도록 정하고, 그 전환 시간을 상위 계층 프로토콜과 응용에 드러나지 않을 만큼 짧게 둔다. 이 표준은 링크 상대끼리 EEE를 지원하는지 알아보고 두 장치에 공통인 가장 나은 파라미터를 고르는 능력 교환 수단도 EEE에 둔다.[@ieee-802-3-2022] EEE는 IEEE 802.3-2008의 개정인 IEEE 802.3az-2010이 넣었다.[@ieee-802-3az-2010]

## 도입 목표

IEEE 802.3 작업 그룹이 정한 P802.3az의 목표는 링크 사용률이 낮은 동안 전력 소비를 줄이는 메커니즘을 [[100base-tx|100BASE-TX]](전이중), 1000BASE-T(전이중), 10GBASE-T, 10GBASE-KR, 10GBASE-KX4에 정하는 것이었고, 1000BASE-KX는 2008년 7월에 목표에 더해졌다. 낮은 전력 소비 수준으로 들고 나는 전환을 맞추는 프로토콜을 정하되, 전환으로 링크 상태가 바뀌지 않고, 전송 중인 프레임을 버리거나 손상시키지 않으며, 전환 시간이 상위 계층 프로토콜과 응용에 드러나지 않게 하는 것도 목표였다. 기존 10BASE-T PHY와 Class D(Category 5) 이상의 케이블 100 m에서 완전히 상호 운용되면서 송신 진폭 요구를 낮춘 10 Mbit/s PHY를 정하는 것과, EEE를 위한 새 꼬임쌍선·백플레인 PHY에 기존과 호환되는 자동 협상을 넣는 것도 목표에 들었다.[@ieee-802-3az-objectives-2008]

## 지원하는 PHY

IEEE 802.3-2022는 EEE를 선택으로 지원할 수 있는 PHY와 인터페이스를 표 78-1에 나열하고, PHY마다 EEE의 규범 요구사항을 그 PHY의 Clause에 둔다. 목록에는 10BASE-Te, 10BASE-T1L, 100BASE-TX, [[1000base-t1|1000BASE-T1]], 1000BASE-T, 2.5GBASE-T1, 5GBASE-T1, 10GBASE-T1이 들고, [[100base-t1|100BASE-T1]]과 10BASE-T1S는 들지 않는다. 10BASE-Te는 EEE가 정하는 10 Mbit/s MAU(Medium Attachment Unit)로, 송신 진폭 요구를 낮추고 Class D(Category 5) 이상의 케이블 100 m에서 10BASE-T MAU와 완전히 상호 운용된다.[@ieee-802-3-2022]

## 1000BASE-T1의 LPI

IEEE 802.3-2022는 1000BASE-T1 PHY가 EEE를 선택으로 지원할 수 있게 하고, 학습(training)을 마친 뒤 LPI 모드에 들 수 있게 한다. 전이중 링크의 두 방향은 따로 LPI 모드에 들고 나므로, 링크의 한쪽만 사용률이 낮아도 전력을 아낄 수 있다. 이 표준은 LPI 모드로 들고 나는 전환이 MAC 프레임을 잃거나 손상시키지 않도록 정하고, EEE 지원 여부는 학습 동안 알리게 한다.[@ieee-802-3-2022]

송신 쪽은 GMII(Gigabit Media Independent Interface)에서 PHY 프레임의 마지막 80B/81B 블록에 "Assert Low Power Idle" 조건을 보면, wake 창에 맞춘 다음 PHY 프레임 전체를 LP_IDLE로 채운 sleep 신호로 보내고, 그 직후 LPI 송신 모드에 든다. LPI 송신 모드에서 PHY는 데이터 경로와 제어 논리를 꺼 전력을 더 아낄 수 있고, quiet 신호와 주기적인 refresh 프레임을 되풀이한다. 링크 상대는 refresh 프레임으로 적응 필터와 타이밍 회로를 갱신할 수 있다. GMII의 조건이 Assert Low Power Idle이 아니게 되면 PHY는 다음 PHY 프레임 전체를 Idle로 채운 wake 프레임으로 보내고, 그다음 PHY 프레임부터 정상 전력 모드로 돌아온다. LPI 수신 모드로 들고 나는 것은 링크 상대가 sleep과 wake 신호로 정한다.[@ieee-802-3-2022]

## OPEN Alliance TC16

OPEN Alliance의 TC16은 EEE의 상호 운용성과 적합성을 다루는 위원회로, 차량 응용에서 EEE를 쓰기 위한 명세 문서를 펴낸다. TC16이 가장 최근에 승인한 문서는 2024년 8월의 MultiGBASE-T1 EEE Test Suite V1.0이다.[@open-alliance-tc16-2026]
