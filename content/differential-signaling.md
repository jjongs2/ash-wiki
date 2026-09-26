---
title: 차동 신호
tags:
  - network
verified: 2026-09-26
---

## 정의

**차동 신호**는 상보 신호를 두 선에 실어 보내고, 두 선의 전압 차로 논리 상태를 정하는 전송 방식이다. 차동 수신기는 이 전압 차를 보고 버스 상태를 판정한다.[@ti-sn65hvd230-2018]

## 구조·동작

### 공통 모드 제거

**공통 모드 전압**은 두 선 전압의 평균이며, 차동 수신기는 이를 걸러 낸다. 수신기가 견디는 공통 모드 전압에는 범위가 있다. 예를 들어 SN65HVD23x는 버스의 공통 모드 전압이 −2 V에서 7 V까지일 때 수신 문턱을 지킨다.[@ti-sn65hvd230-2018]

송신기와 수신기 사이의 접지 전위 차나 선에 결합된 잡음은 공통 모드로 나타난다. 공통 모드 범위 안이면 수신기는 이런 이동이 있어도 신호를 검출한다.[@ti-ds90c402-2013]

![[diagrams/differential-common-mode-noise.svg]]

### 꼬임쌍선

꼬임쌍선 같은 평형 케이블은 외부 전자기 방사를 차동 모드가 아닌 공통 모드 잡음으로 받아들이고, 수신기가 이를 걸러 낸다. 평형 케이블은 장이 서로 상쇄되어 EMI(Electromagnetic Interference)도 덜 낸다.[@ti-ds90lv031a-2016]

SN65HVD23x의 전형적인 응용에서 CAN 버스는 특성 임피던스 120 Ω의 꼬임쌍선이다.[@ti-sn65hvd230-2018] LVDS(Low-Voltage Differential Signaling)의 전송 매체로는 꼬임쌍선, twinax, 평판 리본 케이블, PCB(Printed Circuit Board) 배선을 쓸 수 있다.[@ti-sn65lvds31-2021]

### 쓰이는 곳

고속 [[can|CAN]]은 CAN_H와 CAN_L 두 선의 전압 차로 버스 상태를 나타낸다.[@iso-11898-2-obp-2026] 트랜시버 SN65HVD23x는 [[dominant-and-recessive|dominant]]에서 두 선을 차동으로 구동하고, recessive일 때는 0.5 VCC로 바이어스만 한다.[@ti-sn65hvd230-2018]

RS-485 수신기 THVD1450은 두 입력 선 A와 B의 차동 전압 $V_\mathrm{diff}$로 출력을 정한다. 이때 $V_\mathrm{diff} = V_\mathrm{A} - V_\mathrm{B}$다.[@ti-thvd1450-2019]

LVDS도 차동 신호 방식이다. LVDS 드라이버의 차동 출력 전압은 100 Ω 부하에서 전형값 약 350 mV다.[@ti-sn65lvds31-2021]

100BASE-T1 이더넷 트랜시버 DP83TC811R-Q1은 MDI(Medium Dependent Interface) 핀에서 양방향 차동 신호를 쓴다.[@ti-dp83tc811r-q1-2018] 100BASE-T1은 [[vehicle-bus|차량 버스]]에서 다룬다.

## 비교·한계

차동 신호는 신호 하나에 선 두 개를 쓴다. 그래서 RS-485로 전이중 통신을 하려면 신호 쌍 두 개, 곧 선 네 개가 필요하다.[@ti-thvd1450-2019]

LVDS는 TIA/EIA-422B 같은 5 V 차동 표준보다 출력 전압 수준을 낮춰, 전력을 줄이고 스위칭 속도를 높인다.[@ti-sn65lvds31-2021]
