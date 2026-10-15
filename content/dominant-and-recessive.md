---
title: Dominant와 recessive
tags:
  - network/can
verified: 2026-09-27
---

**dominant**와 **recessive**는 [[can|CAN]] 버스가 가질 수 있는 두 논리 상태이고, dominant는 논리 0, recessive는 논리 1을 나타낸다.[@iso-11898-1-obp-2024] [[iso-11898-2|ISO 11898-2]]:2026은 PMA(Physical Medium Attachment)가 중재 모드에 있을 때 여러 노드가 같은 비트 시간에 dominant와 recessive를 함께 내면 버스가 dominant가 된다고 정한다.[@iso-11898-2-obp-2026]

![[diagrams/can-bus-state-wired-and.svg]]

Bosch CAN 2.0 규격은 버스를 wired-AND로 구현하는 경우를 예로 들어, 이때 dominant를 논리 0, recessive를 논리 1로 둔다.[@bosch-can-2-0-1991]

## 물리 표현

dominant와 recessive는 버스 상태의 이름이고, 논리 0·1과의 대응은 데이터 링크 계층 표준인 [[iso-11898-1|ISO 11898-1:2024]]가 정한다.[@iso-11898-1-obp-2024]

고속 CAN에서 recessive는 두 선의 차동 전압이 거의 0인 상태이고, dominant는 [[can-transceiver|트랜시버]]가 두 선을 [[differential-signaling|차동]]으로 구동해 CAN_H를 CAN_L보다 높게 벌린 상태다.[@ti-tcan1042-q1-2021] 전기적 값과 모드에 따른 바이어스는 [[can-physical-layer#고속 CAN|CAN 물리 계층]]에서 다룬다.

![[diagrams/hs-can-bus-voltage.svg]]

고속 트랜시버가 Normal 모드에 있을 때, recessive에서는 두 선이 모두 약 0.5 VCC(2~3 V)에 있다.[@ti-tcan1042-q1-2021][@nxp-tja1042-2023] [[can-physical-layer#저속 내결함성 CAN|저속 내결함성 CAN]] 트랜시버도 dominant와 recessive 두 상태로 구동하지만, recessive에서는 CAN_L이 CAN_H보다 높아 전압 배치가 다르다. TJA1055의 recessive 출력은 $V_\mathrm{CAN\_H} \le 0.2\,\mathrm{V}$, $V_\mathrm{CAN\_L} \ge \mathrm{VCC} - 0.2\,\mathrm{V}$이다.[@nxp-tja1055-2013]

![[diagrams/can-recessive-voltage-hs-ls.svg]]

## 트랜시버 모드와 버스 상태

ISO 11898-1:2024는 dominant와 recessive를 트랜시버 모드와 상관없이 MAC(Medium Access Control) 프레임의 비트 값 이름으로 둔다.[@iso-11898-1-obp-2024]

버스 위의 상태는 PMA 모드에 따라 이름이 갈린다. ISO 11898-2:2026은 PMA가 중재 모드일 때의 버스 상태를 dominant와 recessive로, 그 밖의 모드일 때의 버스 상태를 **level_0**(논리 0)과 **level_1**(논리 1)로 정의한다. [[can-transceiver#FAST 모드|FAST TX 모드]]의 PMA는 버스를 level_0과 level_1로 구동하는데, 두 상태를 함께 구동하면 결과가 정해지지 않는다.[@iso-11898-2-obp-2026]

저속 내결함성 CAN을 규정하는 [[iso-11898-3|ISO 11898-3]]:2006도 버스 값을 dominant와 recessive로 두고, 둘을 함께 보내면 버스 값이 dominant가 된다고 정한다.[@iso-11898-3-obp-2006]

## 버스가 비어 있을 때

아무도 송신하지 않을 때 버스는 idle이고 recessive다.[@iso-11898-1-obp-2024] 프레임은 dominant 비트 하나인 SOF(Start of Frame)로 시작하고, 노드는 idle 중 recessive에서 dominant로 바뀌는 에지로 프레임의 시작을 알고 거기에 [[can-synchronization|동기를 맞춘다]].[@bosch-can-2-0-1991]

## 프로토콜이 기대는 곳

- [[can-arbitration|중재]]: [[can-identifier|식별자]]를 겨룰 때 recessive를 보냈는데 dominant를 읽은 노드는 중재에서 지고 물러난다.
- [[can-acknowledgement|ACK]]: 송신 노드는 ACK 슬롯에 recessive를 내고, 메시지를 제대로 받은 노드가 그 위에 dominant를 덮어쓴다.
- [[can-error-frame|오류 프레임]]: [[can-fault-confinement|error active]] 노드의 [[can-error-frame#오류 플래그|active 오류 플래그]]는 dominant라 진행 중인 프레임을 무너뜨리고, error passive 노드의 오류 플래그는 recessive라 다른 노드가 낸 dominant 비트에 덮어쓰인다.[@bosch-can-2-0-1991]
