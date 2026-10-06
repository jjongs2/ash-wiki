---
title: CAN 동기화
tags:
  - network/can
verified: 2026-09-26
---

**CAN 동기화**는 [[can|CAN]] 노드가 버스의 에지를 보고 자기 [[can-bit-timing|비트 타이밍]]을 버스의 비트 흐름, 곧 먼저 송신을 시작한 노드에 맞추는 동작이다. 하드 동기화와 재동기화 두 가지가 있다.[@bosch-can-2-0-1991]

## 하드 동기화

버스가 비어 있는 동안 [[dominant-and-recessive|recessive에서 dominant]]로 바뀌는 에지, 곧 SOF(Start of Frame)의 에지에서 노드는 하드 동기화를 한다. **하드 동기화**는 비트 시간을 SYNC_SEG부터 새로 시작해, 그 에지가 SYNC_SEG 안에 오게 한다.[@bosch-can-2-0-1991]

## 재동기화

프레임이 이어지는 동안에는 recessive에서 dominant로 바뀌는 에지로 **재동기화**한다. 에지의 **위상 오차**는 SYNC_SEG를 기준으로 한 에지의 위치로, [[can-bit-timing#Time quantum|time quantum]](tq) 단위로 재며 에지가 SYNC_SEG 안에 있으면 0이다.[@bosch-can-2-0-1991]

- 에지가 SYNC_SEG 뒤, [[can-bit-timing#샘플 포인트|샘플 포인트]] 앞에 오면 위상 오차는 양수이고, 재동기화는 PHASE_SEG1을 늘린다.[@bosch-can-2-0-1991] 송신 노드가 수신 노드보다 느린 경우다.[@microchip-mcp2515-2019]
- 에지가 이전 비트의 샘플 포인트 뒤, SYNC_SEG 앞에 오면 위상 오차는 음수이고, 재동기화는 PHASE_SEG2를 줄인다.[@bosch-can-2-0-1991] 송신 노드가 수신 노드보다 빠른 경우다.[@microchip-mcp2515-2019]

PHASE_SEG를 늘리거나 줄이는 양의 상한을 **SJW**(Synchronization Jump Width)라 한다. Bosch CAN 2.0 규격은 SJW를 1 tq부터, 4 tq와 PHASE_SEG1 가운데 짧은 쪽까지 설정할 수 있게 정한다.[@bosch-can-2-0-1991]

이 규격은 위상 오차 $e$가 $|e| \le \mathrm{SJW}$이면 재동기화가 하드 동기화와 같은 효과를 내게 정한다. $|e| > \mathrm{SJW}$이면 위상 오차가 양수일 때 PHASE_SEG1을 SJW만큼 늘리고, 음수일 때 PHASE_SEG2를 SJW만큼 줄인다.[@bosch-can-2-0-1991]

![[diagrams/can-resynchronization.svg]]

클록 정보는 비트 값이 바뀌는 에지에서만 얻으므로, 같은 값의 비트가 이어지면 동기화에 쓸 에지가 없다.[@bosch-can-2-0-1991] [[can-bit-stuffing|비트 스터핑]]은 같은 값이 길게 이어지지 않게 해, 동기화에 쓸 에지가 일정 간격 안에 오게 한다.[@microchip-mcp2515-2019] Bosch CAN 2.0 규격은 재동기화에 쓸 수 있는 두 전이 사이를 최대 29비트 시간으로 둔다.[@bosch-can-2-0-1991]

[[iso-11898-1|ISO 11898-1]]:2024는 **에지**를 연속한 두 time quantum 사이의 버스 상태 차이로 정의한다.[@iso-11898-1-obp-2024]

## 규칙

- 한 비트 시간 안에서는 한 번만 동기화한다.
- 앞 샘플 포인트에서 읽은 값과 에지 바로 뒤의 버스 값이 다를 때만 그 에지로 동기화한다.[@bosch-can-2-0-1991]
- 하드 동기화를 한 비트 시간에는 재동기화하지 않는다.[@microchip-mcp2515-2019]
- dominant 비트를 보내는 노드는 위상 오차가 양수인 에지로는 재동기화하지 않는다.[@bosch-can-2-0-1991]

Bosch CAN FD 1.0은 이 규칙을 세 군데 바꾼다. 동기화는 한 비트 시간이 아니라 두 샘플 포인트 사이에 한 번만 한다. 하드 동기화는 버스 idle뿐 아니라 송신 정지 중, 인터미션의 둘째·셋째 비트의 recessive에서 dominant로 바뀌는 에지와, CAN FD 포맷 프레임의 EDL에서 r0으로 넘어가는 에지에서도 한다. 송신 노드는 CAN FD의 데이터 구간에서 송신하는 동안 재동기화하지 않는다.[@bosch-can-fd-1-0-2012]

## 발진기 허용 오차

재동기화로 보상할 수 있는 발진기 오차에는 한계가 있다. 허용 오차는 PHASE_SEG1, PHASE_SEG2, SJW와 비트 시간의 비율로 정해진다.[@bosch-can-fd-1-0-2012]

이 규격은 발진기 주파수 $f_\mathrm{osc}$가 공칭 주파수 $f_\mathrm{nom}$에 대해 $(1 - d_f)\, f_\mathrm{nom} \le f_\mathrm{osc} \le (1 + d_f)\, f_\mathrm{nom}$일 때, 허용 오차 $d_f$의 상한을 다섯 조건으로 정한다. CAN 동작은 공칭 비트 시간에 대한 조건 I·II를, CAN FD 동작은 데이터 비트 시간과 두 프리스케일러 값의 비에 대한 조건 III\~V까지 다섯 조건을 모두 지켜야 한다. 조건 I·II는 공칭 비트 시간 $t_\mathrm{bit,N}$, 그 SJW $\mathrm{SJW_N}$, PHASE_SEG1·PHASE_SEG2의 길이 $t_\mathrm{PS1,N}$·$t_\mathrm{PS2,N}$로 아래와 같다.[@bosch-can-fd-1-0-2012]

$$
d_f < \frac{\mathrm{SJW_N}}{20\, t_\mathrm{bit,N}}
$$

$$
d_f < \frac{\min(t_\mathrm{PS1,N},\, t_\mathrm{PS2,N})}{2\,(13\, t_\mathrm{bit,N} - t_\mathrm{PS2,N})}
$$

공칭 비트 시간에서 PROP_SEG를 1 tq, PHASE_SEG1, PHASE_SEG2, SJW를 모두 4 tq로 두면 CAN 동작에서 가장 큰 허용 오차 1.58%가 나온다. 이 설정은 PROP_SEG가 비트 시간의 10%뿐이라 짧은 비트 시간에는 맞지 않고, 버스 길이 40 m에서 125 kbit/s까지 쓸 수 있다.[@bosch-can-fd-1-0-2012]

Bosch CAN 2.0 규격은 경험칙으로 125 kbit/s까지는 세라믹 공진자를 쓸 수 있고, CAN의 전 속도 범위에는 수정 발진기가 필요하다고 제시한다.[@bosch-can-2-0-1991]
