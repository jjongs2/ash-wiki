---
title: dominant와 recessive
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**dominant와 recessive**는 [[can|CAN]] 버스가 동작 중에 가지는 두 논리 상태다.[@ti-tcan4550-2020] dominant는 논리 0, recessive는 논리 1에 대응한다.[@bosch-m-can-2023] [[can-transceiver|CAN 트랜시버]]의 TXD·RXD 핀에서는 dominant가 low, recessive가 high다.[@ti-tcan1042-q1-2021]

여러 노드가 같은 비트 시간에 서로 다른 값을 내면 버스에는 dominant가 나타난다. recessive는 다른 노드가 낸 dominant에 덮어쓰인다.[@ti-tcan4550-2020]

## 구조·동작

### 고속 CAN의 전압

고속 CAN 트랜시버는 recessive일 때 버스를 구동하지 않는다. 이때 두 선은 수신기 안의 높은 입력 저항을 거쳐 VCC/2로 바이어스되고, 차동 전압은 0 V에 가깝다. dominant일 때는 트랜시버가 CAN_H를 올리고 CAN_L을 내려 버스를 차동으로 구동한다.[@ti-tcan1042-q1-2021]

![[diagrams/hs-can-bus-voltage.svg]]

TJA1042의 dominant 출력은 전형값으로 CAN_H가 3.5 V, CAN_L이 1.5 V이고, 차동 출력 전압은 1.5~3 V다. 수신기는 Normal 모드에서 차동 전압 $V_\mathrm{diff}$가 $-4\,\mathrm{V} \le V_\mathrm{diff} \le 0.5\,\mathrm{V}$이면 recessive로, $0.9\,\mathrm{V} \le V_\mathrm{diff} \le 9\,\mathrm{V}$이면 dominant로 판정한다.[@nxp-tja1042-2023]

![[diagrams/tja1042-receiver-threshold.svg]]

### 프레임 안의 두 상태

버스가 비어 있는 동안에는 recessive가 이어지고, 모든 프레임은 dominant 비트 하나인 SOF(Start of Frame)로 시작한다.[@microchip-mcp2515-2019]

[[can-acknowledgement|ACK(Acknowledgement)]] 슬롯에서는 송신 노드가 recessive를 내고, 프레임을 오류 없이 받은 노드가 dominant를 낸다. 오류를 찾은 error active 노드는 dominant 비트 6개로 된 오류 플래그를 연달아 내서 진행 중인 전송을 끊는다.[@microchip-mcp2515-2019] 오류 플래그는 [[can-error-frame|CAN 오류 프레임]]에서 다룬다.

## 비교·한계

판정 문턱은 같은 칩에서도 조건에 따라 달라진다. TCAN1042-Q1의 Normal 모드 문턱은 공통 모드 범위가 ±20 V일 때 0.9 V와 0.5 V이고, ±30 V일 때 1.0 V와 0.4 V다.[@ti-tcan1042-q1-2021]
