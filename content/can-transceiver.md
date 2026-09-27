---
title: CAN 트랜시버
tags:
  - network/can
verified: 2026-09-27
---

## 정의

**CAN 트랜시버**는 [[can-controller|CAN 컨트롤러]]가 쓰는 디지털 신호와 CAN_H·CAN_L 버스의 차동 신호 사이를 변환한다.[@ti-tcan1042-q1-2021] 컨트롤러 쪽으로는 송신 데이터 입력 TXD와 수신 데이터 출력 RXD 핀을, 버스 쪽으로는 CAN_H와 CAN_L 핀을 둔다.[@nxp-tja1042-2023]

![[diagrams/can-node-bus.svg]]

## 구조·동작

### 송신과 수신

TXD가 low이면 드라이버가 버스를 차동으로 구동해 dominant로 만든다. high이면 구동하지 않고, 버스는 수신기 내부 저항으로 0.5 VCC에 바이어스된 recessive가 된다.[@ti-tcan1042-q1-2021] dominant와 recessive를 동시에 보내면 버스는 dominant가 된다.[@bosch-can-2-0-1991]

![[diagrams/hs-can-bus-voltage.svg]]

수신기는 CAN_H와 CAN_L의 차동 전압 $V_\mathrm{diff}$를 판정해 RXD로 내보낸다.[@ti-tcan1042-q1-2021] 고속 트랜시버는 Normal 모드에서 $V_\mathrm{diff} \ge 0.9\,\mathrm{V}$이면 dominant, $V_\mathrm{diff} \le 0.5\,\mathrm{V}$이면 recessive로 판정한다.[@ti-tcan1042-q1-2021][@nxp-tja1042-2023][@microchip-mcp2561-2fd-2014]

![[diagrams/tja1042-receiver-threshold.svg]]

Normal 모드에서는 드라이버와 수신기가 함께 켜져 있어, 송신 중에도 RXD가 버스 상태를 따른다.[@ti-tcan1042-q1-2021] 송신 노드는 내보낸 비트를 버스에서 되읽어 대조하고, 중재 구간에서 자기가 낸 recessive 비트가 dominant로 읽히면 중재에서 밀려난다.[@bosch-can-2-0-1991]

### 보호 기능

CAN 트랜시버는 과열되면 출력 드라이버를 끄고, 버스 선 단락으로부터 드라이버를 보호한다.[@ti-tcan1042-q1-2021][@microchip-mcp2561-2fd-2014]

TJA1042는 TXD가 정해진 시간보다 오래 low로 머물면 송신기를 끄고 버스를 recessive로 풀어 준다(TXD dominant time-out). 하드웨어나 소프트웨어 고장으로 버스가 계속 dominant에 묶여 통신 전체가 막히는 것을 막기 위해서다.[@nxp-tja1042-2023] TCAN1042는 버스 선이 단락되면 드라이버 전류를 제한한다.[@ti-tcan1042-q1-2021]

### 저전력 모드와 웨이크업

TCAN1042의 Standby 모드에서는 드라이버와 일반 수신기를 끄고 저전력 수신기만 버스를 감시한다. 웨이크업 패턴(WUP, wake-up pattern)을 감지하면 RXD를 low로 내려 MCU에 웨이크업 요청을 알린다.[@ti-tcan1042-q1-2021] TJA1042는 Standby 모드에서 버스의 dominant가 정해진 시간보다 오래 이어지면 RXD를 high로 되돌려, 단락된 버스가 웨이크업 요청을 계속 만들지 않게 한다.[@nxp-tja1042-2023]

선택적 웨이크업을 켠 트랜시버는 웨이크업 패턴만으로는 깨어나지 않고, 식별자가 미리 설정한 값과 맞는 웨이크업 프레임(WUF, wake-up frame)을 받으면 깨어난다.[@nxp-tja1145-2018][@ti-tcan1145-q1-2022]

## 비교·한계

recessive 출력 전압은 고속 트랜시버 TJA1042가 두 선 모두 약 0.5 VCC(2~3 V)이고[@nxp-tja1042-2023], 저속 내결함성 트랜시버 TJA1055가 $V_\mathrm{CAN\_H} \le 0.2\,\mathrm{V}$, $V_\mathrm{CAN\_L} \ge \mathrm{VCC} - 0.2\,\mathrm{V}$이다.[@nxp-tja1055-2013]

![[diagrams/can-recessive-voltage-hs-ls.svg]]

TJA1055는 dominant에서는 반대로 CAN_H를 CAN_L보다 높게 구동한다.[@nxp-tja1055-2013] TJA1055T로 꾸린 내결함성 CAN 망은 고속 트랜시버와 종단 저항을 단 CAN 도구가 이어지면 두 선 사이에 종단 저항이 생겨, 줄곧 [[can-physical-layer|단선 모드]]로 동작한다.[@nxp-ah0801-2016]

트랜시버 지연 보상이 없으면, CAN FD 데이터 구간의 비트율은 송신 노드가 자기가 낸 비트를 그 비트의 샘플 포인트까지 되받아야 한다는 조건에 묶인다.[@bosch-can-fd-1-0-2012] CAN FD 트랜시버는 데이터 구간의 높은 비트율을 지원하려고 loop delay symmetry를 보증한다.[@microchip-mcp2561-2fd-2014][@nxp-tja1145-2018]

CAN FD의 데이터 구간에서 TCAN1042는 모든 변종이 2 Mbit/s를, G 변종이 5 Mbit/s를 지원하고[@ti-tcan1042-q1-2021], TJA1042는 fast phase에서 5 Mbit/s까지 타이밍을 보증한다.[@nxp-tja1042-2023]
