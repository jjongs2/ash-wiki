---
title: 차동 신호
tags:
  - network
aliases:
  - 차동 전송
verified: 2026-09-25
---

## 정의

**차동 신호** 방식은 신호 하나를 두 선에 서로 반대 극성으로 실어 보내고, 받는 쪽이 두 선의 전압 차로 값을 판정하는 전송 방식이다.[@ti-sn65hvd1780-2017] 이와 달리 단일 종단(single-ended) 수신기는 선 하나의 접지 기준 전압을 문턱 전압과 비교한다.[@nxp-tja1055-2013]

## 구조·동작

### 차동 전압과 공통 모드 전압

두 입력 전압을 $V_\mathrm{A}$, $V_\mathrm{B}$라 하면 차동 입력 전압 $V_\mathrm{ID}$는 둘의 차 $V_\mathrm{A} - V_\mathrm{B}$이고, 공통 모드 입력 전압 $V_\mathrm{IC}$는 둘의 평균 $(V_\mathrm{A} + V_\mathrm{B})/2$다.[@ti-sn65lvds32-2014]

차동 수신기는 두 선의 전압 차로 판정하므로, 두 선에 똑같이 결합된 공통 모드 신호에 내성이 있다.[@ti-sn65lvds31-2021] 다만 수신기에는 정해진 공통 모드 입력 범위가 있어, 입력이 그 범위 안에 있고 $V_\mathrm{ID}$의 크기가 문턱 이상일 때에만 올바르게 판정한다.[@ti-sn65lvds32-2014]

### 쓰임

- 고속 [[can|CAN]] 트랜시버 TJA1042는 CAN_H와 CAN_L 두 선의 버스를 쓴다. dominant에서는 CAN_H를 약 3.5 V, CAN_L을 약 1.5 V로 벌려 차동 전압이 1.5~3 V가 되고, recessive에서는 두 선을 약 0.5 VCC에 두어 차동 전압이 −50~50 mV가 된다.[@nxp-tja1042-2023] 버스의 전기적 동작은 [[can-physical-layer|CAN 물리 계층]]에서 다룬다.
- TIA/EIA-485-A를 따르는 RS-485 트랜시버 SN65HVD178x는 $V_\mathrm{ID} > 200\,\mathrm{mV}$이면 High, $V_\mathrm{ID} < -200\,\mathrm{mV}$이면 Low를 낸다. 버스 단자 전압 $V_\mathrm{I}$의 권장 동작 조건은 $-7\,\mathrm{V} \le V_\mathrm{I} \le 12\,\mathrm{V}$다.[@ti-sn65hvd1780-2017]
- LVDS(Low-Voltage Differential Signaling) 드라이버 SN65LVDS31은 100 Ω 부하에 약 350 mV의 차동 전압으로 신호를 보낸다. 5 V 차동 규격인 TIA/EIA-422-B보다 출력 전압을 낮춰 소비 전력을 줄이고, 차동 출력 전압이 작아 방사 에너지도 적다.[@ti-sn65lvds31-2021]

## 비교·한계

차동 방식은 신호 하나에 선 둘을 쓴다. 데이터 입력 하나가 두 출력을 서로 반대로 구동한다.[@ti-sn65hvd1780-2017]

저속 내결함성 CAN 트랜시버 TJA1055는 전자파 방사를 줄이려고 신호의 기울기를 제한해, 버스 선으로 비차폐 꼬임쌍선이나 평행한 두 선을 쓸 수 있게 한다. 버스 선 하나가 끊겨도 차동 수신을 그대로 유지한다. 버스 선이 배터리 전압, VCC, 접지에 단락되면 자동으로 단선 모드로 바꿔 남은 한 선으로 통신을 이어 가고, 고장이 없어지면 차동 모드로 돌아간다.[@nxp-tja1055-2013]

> [!warning]
> TJA1055의 단선 모드는 EMC(Electromagnetic Compatibility) 내성과 방사가 모두 차동 모드보다 나쁘고, 저주파 잡음을 신호와 구별하지 못한다.[@nxp-tja1055-2013]
