---
title: CAN 동기화
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN 동기화**는 [[can|CAN]]의 각 노드가 버스에서 받은 신호의 에지에 맞춰 자기 비트 타이밍을 송신 노드의 클럭에 맞추는 일이다. 노드마다 발진기 주파수가 달라 위상이 어긋나므로 필요하다. 방식은 hard synchronization과 resynchronization 둘이다.[@microchip-mcp2515-2019]

## 구조·동작

### 에지와 위상 오차

동기화에는 recessive에서 dominant로 바뀌는 에지만 쓴다. 에지의 위상 오차는 [[can-bit-timing|CAN 비트 타이밍]]의 SYNC_SEG에 대해 에지가 어디 왔는지로 정한다. SYNC_SEG 안이면 0, 샘플 포인트 전이면 양수, 앞 비트의 샘플 포인트 뒤면 음수다.[@microchip-mcp2515-2019]

### hard synchronization

hard synchronization은 버스가 비어 있다가 온 recessive→dominant 에지, 곧 SOF(Start of Frame)에서 한다. 이때 비트 시간 카운터는 SYNC_SEG부터 다시 시작하고, 에지는 새로 시작한 비트 시간의 SYNC_SEG 안에 놓인다.[@microchip-mcp2515-2019]

### resynchronization

SOF 뒤 프레임 안의 recessive→dominant 에지에서는 resynchronization을 한다. 위상 오차가 양수면 PHASE_SEG1을 늘리고, 음수면 PHASE_SEG2를 줄인다. 한 번에 늘리거나 줄일 수 있는 양의 상한은 SJW(Synchronization Jump Width)다.[@microchip-mcp2515-2019]

![[diagrams/can-resynchronization.svg]]

SJW의 설정 범위는 컨트롤러마다 다르다. MCP2515는 1 time quantum부터 4 time quantum까지이고[@microchip-mcp2515-2019], Bosch M_CAN의 공칭 SJW는 1 time quantum부터 128 time quantum까지다.[@bosch-m-can-2023]

한 비트 시간 안에서는 동기화를 한 번만 하며, hard synchronization을 한 비트 시간 안에서는 resynchronization을 하지 않는다.[@microchip-mcp2515-2019]

### 에지의 공급

[[can-bit-stuffing|비트 스터핑]]을 적용하는 구간에서는 같은 값의 비트가 5개를 넘게 이어지지 않는다.[@bosch-m-can-2023] 그래서 수신 노드는 프레임 안에서 resynchronization에 쓸 에지를 꾸준히 받는다.[@microchip-mcp2515-2019]

## 비교·한계

MCP2515 데이터시트는 노드 사이의 발진기 편차를 최대 1.7%까지 허용한다. CAN의 전체 비트율 범위를 쓰려면 수정 발진기가 필요하고, 세라믹 공진자는 대략 125 kbit/s까지 쓸 수 있다.[@microchip-mcp2515-2019]
