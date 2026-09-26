---
title: dominant와 recessive
tags:
  - network/can
verified: 2026-09-26
---

## 정의

**dominant**와 recessive는 [[can|CAN]] 버스가 가질 수 있는 두 논리 상태이고, dominant는 논리 0, recessive는 논리 1을 나타낸다.[@iso-11898-1-obp-2024] 여러 노드가 같은 비트 시간에 dominant와 recessive를 함께 내면 버스는 dominant가 된다.[@iso-11898-1-obp-2015]

![[diagrams/can-bus-state-wired-and.svg]]

Bosch CAN 2.0 규격은 버스를 wired-AND로 구현하는 경우를 예로 들어, 이때 dominant가 논리 0, recessive가 논리 1이 된다고 설명한다.[@bosch-can-2-0-1991]

## 구조·동작

### 물리 표현

고속 CAN에서 recessive는 두 선의 차동 전압이 거의 0인 상태이고, dominant는 트랜시버가 두 선을 차동으로 구동해 CAN_H를 CAN_L보다 높게 벌린 상태다. 예를 들어 TCAN1042-Q1에서 recessive는 버스가 수신기의 높은 내부 입력 저항을 거쳐 0.5 VCC로 바이어스된 상태다.[@ti-tcan1042-q1-2021] 전기적 값은 [[can-physical-layer|CAN 물리 계층]]에서 다룬다.

![[diagrams/hs-can-bus-voltage.svg]]

### 버스가 비어 있을 때

아무도 송신하지 않을 때 버스는 idle이고 recessive다.[@iso-11898-1-obp-2024] 프레임은 dominant 비트 하나인 SOF(Start of Frame)로 시작하고, 노드는 idle 중 recessive에서 dominant로 바뀌는 에지로 프레임의 시작을 알고 거기에 동기를 맞춘다.[@bosch-can-2-0-1991]

### 프로토콜이 기대는 곳

- 중재: 식별자를 겨룰 때 recessive를 보냈는데 dominant를 읽은 노드는 중재에서 지고 물러난다.[@bosch-can-2-0-1991]
- [[can-acknowledgement|ACK(Acknowledgement)]]: 송신 노드는 ACK 슬롯에 recessive를 내고, 메시지를 제대로 받은 노드가 그 위에 dominant를 덮어쓴다.[@bosch-can-2-0-1991]
- [[can-error-frame|오류 프레임]]: error active 노드는 dominant 6비트로 된 active 오류 플래그를 낸다. 이 플래그는 비트 스터핑 규칙을 어기거나 ACK 필드와 EOF(End of Frame)의 고정된 모양을 깨서 진행 중인 프레임을 무너뜨린다. error passive 노드의 오류 플래그는 recessive 6비트라, 다른 노드가 낸 dominant 비트를 바꾸지 못하고 오히려 그 비트에 덮어쓰인다.[@bosch-can-2-0-1991]

## 비교·한계

고속 CAN의 recessive에서는 두 선이 모두 약 0.5 VCC(2~3 V)에 있다.[@ti-tcan1042-q1-2021] 저속 내결함성 CAN 트랜시버도 dominant와 recessive 두 상태로 구동하지만, recessive에서는 CAN_L이 CAN_H보다 높아 전압 배치가 다르다. TJA1055의 recessive 출력은 $V_\mathrm{CAN\_H} \le 0.2\,\mathrm{V}$, $V_\mathrm{CAN\_L} \ge \mathrm{VCC} - 0.2\,\mathrm{V}$이다.[@nxp-tja1055-2013]

![[diagrams/can-recessive-voltage-hs-ls.svg]]

dominant와 recessive는 버스 상태의 이름이고, 논리 0·1과의 대응은 데이터 링크 계층 표준인 [[iso-11898-1|ISO 11898-1]]이 정한다.[@iso-11898-1-obp-2024]
