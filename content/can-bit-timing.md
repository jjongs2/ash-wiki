---
title: CAN 비트 타이밍
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN 비트 타이밍**은 한 비트 시간을 여러 구간으로 나눠, 전파 지연과 위상 오차를 메우고 비트 값을 읽는 샘플 포인트의 위치를 정하는 방법이다.[@microchip-mcp2515-2019]

공칭 비트율은 이상적인 송신기가 재동기화 없이 1초에 보내는 비트 수이고, 공칭 비트 시간은 그 역수다.[@microchip-mcp2515-2019]

## 구조·동작

### 네 구간

공칭 비트 시간은 겹치지 않는 네 구간 SYNC_SEG, PROP_SEG, PHASE_SEG1, PHASE_SEG2로 이뤄진다.[@microchip-mcp2515-2019]

- SYNC_SEG: 버스의 노드들이 동기를 맞추는 구간이다. 비트의 에지는 이 구간 안에 올 것으로 기대된다.
- PROP_SEG: 노드 사이의 물리적 지연을 메운다. 이 구간이 메우는 전파 지연 $t_\mathrm{prop}$는 버스 드라이버 지연을 포함한 버스 선의 신호 전파 시간 $t_\mathrm{bus}$의 두 배, 곧 왕복 지연이다: $t_\mathrm{prop} = 2\,t_\mathrm{bus}$.
- PHASE_SEG1, PHASE_SEG2: 버스 에지의 위상 오차를 메운다. [[can-synchronization|재동기화]] 때 PHASE_SEG1은 늘어나고 PHASE_SEG2는 줄어든다.

샘플 포인트는 PHASE_SEG1의 끝에 있고, 이 시점에 버스의 논리 레벨을 읽어 비트 값으로 삼는다.[@microchip-mcp2515-2019]

![[diagrams/can-bit-time-segments.svg]]

### time quantum

각 구간의 길이는 time quantum의 정수배다. time quantum은 발진기 클럭을 프로그래머블 프리스케일러로 나눠 만든 고정 시간 단위이고, SYNC_SEG는 1 time quantum이다.[@microchip-mcp2515-2019]

### 컨트롤러 설정

[[can-controller|CAN 컨트롤러]]마다 구간을 설정하는 방식이 다르다. MCP2515는 SYNC_SEG를 1 time quantum으로 고정한다. PROP_SEG와 PHASE_SEG1은 각각 1~8 time quantum으로 설정하고, PHASE_SEG2는 따로 설정하거나 PHASE_SEG1과 정보 처리 시간 가운데 큰 값으로 두게 할 수 있다.[@microchip-mcp2515-2019]

Bosch M_CAN은 PROP_SEG와 PHASE_SEG1의 합을 필드 하나로 설정한다. 비트 시간 전체는 공칭 비트 타이밍에서 4 time quantum부터 385 time quantum까지, CAN FD 데이터 비트 타이밍에서 4 time quantum부터 49 time quantum까지 설정할 수 있다.[@bosch-m-can-2023]

## 비교·한계

버스를 길게 늘리려면 데이터율을 낮추는 절충이 따른다.[@ti-tcan1042-q1-2021]

CAN FD(CAN with Flexible Data-Rate) 프레임은 BRS(Bit Rate Switch) 비트가 recessive이면, BRS 뒤 데이터 구간에서 중재 구간과 다른 비트 타이밍을 쓴다. 중재 구간에는 공칭 비트 타이밍을, 데이터 구간에는 데이터 비트 타이밍을 쓴다. 데이터 구간에는 송신 노드가 하나뿐이라 버스 길이가 비트율에 영향을 주지 않는다. 데이터 구간 비트율 $R_\mathrm{data}$는 중재 구간 비트율 $R_\mathrm{arb}$에 대해 $R_\mathrm{data} \ge R_\mathrm{arb}$가 되게 설정한다.[@bosch-m-can-2023]
