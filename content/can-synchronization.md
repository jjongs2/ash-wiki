---
title: CAN 동기화
tags:
  - network/can
verified: 2026-09-26
---

## 정의

CAN 동기화는 [[can|CAN]] 노드가 버스의 에지를 보고 자기 [[can-bit-timing|비트 타이밍]]을 버스의 비트 흐름, 곧 먼저 송신을 시작한 노드에 맞추는 동작이다. 하드 동기화와 재동기화 두 가지가 있다.[@bosch-can-2-0-1991]

## 구조·동작

### 하드 동기화

버스가 비어 있는 동안 recessive에서 dominant로 바뀌는 에지, 곧 SOF(Start of Frame)의 에지에서 노드는 하드 동기화를 한다. 하드 동기화는 비트 시간을 SYNC_SEG부터 새로 시작해, 그 에지가 SYNC_SEG 안에 오게 한다.[@bosch-can-2-0-1991]

### 재동기화

프레임이 이어지는 동안에는 recessive에서 dominant로 바뀌는 에지로 재동기화한다. 에지의 위상 오차는 SYNC_SEG를 기준으로 한 에지의 위치로, time quantum(tq) 단위로 재며 에지가 SYNC_SEG 안에 있으면 0이다.[@bosch-can-2-0-1991]

- 에지가 SYNC_SEG 뒤, 샘플 포인트 앞에 오면 위상 오차는 양수이고, 재동기화는 PHASE_SEG1을 늘린다.[@bosch-can-2-0-1991] 송신 노드가 수신 노드보다 느린 경우다.[@microchip-mcp2515-2019]
- 에지가 이전 비트의 샘플 포인트 뒤, SYNC_SEG 앞에 오면 위상 오차는 음수이고, 재동기화는 PHASE_SEG2를 줄인다.[@bosch-can-2-0-1991] 송신 노드가 수신 노드보다 빠른 경우다.[@microchip-mcp2515-2019]

PHASE_SEG를 늘리거나 줄이는 양의 상한을 SJW(Synchronization Jump Width)라 한다. CAN 2.0 규격에서 SJW는 1 tq부터, 4 tq와 PHASE_SEG1 가운데 짧은 쪽까지 설정할 수 있다.[@bosch-can-2-0-1991]

![[diagrams/can-resynchronization.svg]]

### 규칙

- 한 비트 시간 안에서는 한 번만 동기화한다.[@bosch-can-2-0-1991]
- 하드 동기화를 한 비트 시간에는 재동기화하지 않는다.[@microchip-mcp2515-2019]
- dominant 비트를 보내는 노드는 위상 오차가 양수인 에지로는 재동기화하지 않는다.[@bosch-can-2-0-1991]

## 비교·한계

클록 정보는 비트 값이 바뀌는 에지에서만 얻으므로, 같은 값의 비트가 이어지면 동기화에 쓸 에지가 없다.[@bosch-can-2-0-1991] [[can-bit-stuffing|비트 스터핑]]은 같은 값이 길게 이어지지 않게 해, 동기화에 쓸 에지가 일정 간격 안에 오게 한다.[@microchip-mcp2515-2019]

재동기화로 보상할 수 있는 발진기 오차에는 한계가 있다. 허용 오차는 PHASE_SEG1, PHASE_SEG2, SJW와 비트 시간의 비율로 정해지며, CAN 동작에서 가능한 최대 허용 오차는 1.58%다.[@bosch-can-fd-1-0-2012]
