---
title: CCS
tags:
  - applications/battery-charging
verified: 2026-11-19
---

**CCS**(Combined Charging System)는 교류 충전용 단자에 직류 충전용 핀 둘을 더해, 교류 충전과 직류 충전을 함께 하는 충전 방식이다.[@ti-tidufe6a-2025] CharIN(표준화 활동 밖에서 기존 표준을 바탕으로 CCS의 application profile을 정의하는 독립 협회)의 CCS Basic 구현 가이드 v1.1.1.1에 따르면 CCS는 커넥터와 inlet의 조합, 충전 제어 기능 전체, 차량과 충전 인프라 사이의 통신을 아우르고, CCS Basic에서는 교류·직류 전도 충전을 차량 inlet 하나로 합친다. 이 가이드는 충전 제어 방식으로 [[control-pilot|CP]] 선 위 PWM(pulse width modulation) 기반의 basic signalling과, 같은 CP 선 위 [[homeplug-green-phy|HomePlug Green PHY]] PLC(power line communication) 기반의 고수준 통신(HLC, high level communication)을 둔다. 직류 충전에는 둘 다 필수이고, 교류 충전에는 basic signalling이 필수이지만 PLC는 CCS Basic의 범위 밖이다.[@charin-ccs-basic-implementation-guide-2023]

![[diagrams/ccs-basic-cp-line-signals.svg]]

## 쓰는 곳

EU 규정 2023/1804의 Annex II(2025/656이 고친 판)는 2026년 1월 8일부터 설치하거나 개보수하는 경량 전기차용 직류 일반 출력·고출력 충전점이 적어도 EN IEC 62196-3:2022의 Combo 2 커넥터를 갖추도록 요구하고, 그 날짜 전에 설치한 직류 충전점은 개보수할 때까지 EN IEC 62196-3:2014를 계속 따르게 한다.[@eu-2025-656-2025]

## 구성

CharIN의 CCS Basic 구현 가이드 v1.1.1.1은 교류 충전의 IEC 62196-2 Type 1(미국)·Type 2(유럽) 커넥터와 직류 충전의 IEC 62196-3 Combo 1(미국)·Combo 2(유럽) 커넥터 가운데 하나라도 지원하는 차량을 CCS 가능 차량으로 본다.[@charin-ccs-basic-implementation-guide-2023]

CharIN은 CCS의 발전을 CCS Basic, CCS Extended, CCS Advanced 세 단계로 나누어 단계마다 기존 표준을 바탕으로 application profile을 정의하고, 이 가이드는 CCS Basic의 HLC를 DIN SPEC 70121이 정한 HomePlug Green PHY 기반 PLC로 둔다. 이 profile에는 IEC 61851-1의 Mode 2, Mode 3, Mode 4가 들고, 직류 충전소인 Mode 4의 충전 제어에는 HLC가 필요하다.[@charin-ccs-basic-implementation-guide-2023]

TI 레퍼런스 디자인 TIDA-010939의 설계 가이드에 따르면 직류 충전에서는 차량의 탑재 충전기가 아니라 충전 설비가 충전기 노릇을 하므로, 배터리를 안전하게 충전할 전압 수준과 전류 한도를 알아내려면 아날로그 핸드셰이크에 더해 고수준 통신이 필요하다.[@ti-tidufe6a-2025]

## DIN 70121

DIN/TS 70121:2024-11은 CCS에서 직류 충전을 제어하는, 직류 충전소와 전기차 사이의 디지털 통신을 정한다.[@din-ts-70121-2024] DIN SPEC 70121:2014-12는 DIN/TS 70121:2024-11로 대체되었다.[@din-spec-70121-2014]
