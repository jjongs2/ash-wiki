---
title: CAN 비트 타이밍
tags:
  - network/can
verified: 2026-09-27
---

**CAN 비트 타이밍**은 [[can|CAN]] 노드가 한 비트의 시간을 어떻게 나누고, 그 안의 어느 시점에 비트 값을 읽을지 정하는 규칙이다. **공칭 비트율** $R_\mathrm{b}$는 이상적인 송신 노드가 [[can-synchronization#재동기화|재동기화]] 없이 보내는 초당 비트 수이고, **공칭 비트 시간** $t_\mathrm{bit}$는 그 역수다.[@bosch-can-2-0-1991]

$$
t_\mathrm{bit} = \frac{1}{R_\mathrm{b}}
$$

## 세그먼트

공칭 비트 시간은 서로 겹치지 않는 네 세그먼트로 나뉜다.[@bosch-can-2-0-1991]

- **SYNC_SEG**: 버스의 에지가 이 구간에 오리라고 기대하는 구간이다.
- **PROP_SEG**: 버스 선의 신호 전파 시간과 송수신 회로(입력 비교기, 출력 드라이버)의 지연을 보상한다.
- **PHASE_SEG1**, **PHASE_SEG2**: 에지의 위상 오차를 보상하며, 재동기화 때 늘거나 줄어든다.[@bosch-can-2-0-1991]

PROP_SEG의 길이 $t_\mathrm{PROP\_SEG}$는 버스 선의 신호 전파 시간 $t_\mathrm{bus}$, 입력 비교기 지연 $t_\mathrm{cmp}$, 출력 드라이버 지연 $t_\mathrm{drv}$를 더한 값의 두 배다.[@bosch-can-2-0-1991]

$$
t_\mathrm{PROP\_SEG} = 2\,(t_\mathrm{bus} + t_\mathrm{cmp} + t_\mathrm{drv})
$$

신호가 갔다 돌아오는 전파 지연은 버스가 길수록 커진다. PROP_SEG의 길이 $t_\mathrm{PROP\_SEG}$는 최대 전파 지연 $t_\mathrm{prop}$보다 길어야($t_\mathrm{PROP\_SEG} > t_\mathrm{prop}$) 하므로, 전파 지연이 공칭 비트율을 제한한다.[@microchip-mcp25xxfd-frm-2020]

## 샘플 포인트

버스 값을 읽어 비트 값으로 삼는 시점은 PHASE_SEG1의 끝이고, 이 시점을 **샘플 포인트**라 한다. 샘플 포인트에서 시작해 그다음 비트 값을 계산하는 데 쓰는 구간을 **정보 처리 시간**이라 한다.[@bosch-can-2-0-1991]

![[diagrams/can-bit-timing-segments.svg]]

## Time quantum

세그먼트의 길이는 time quantum(tq) 단위로 정한다. **time quantum**은 발진기 주기에서 얻는 고정 시간 단위로, 그 길이 $t_\mathrm{q}$는 최소 time quantum $t_\mathrm{q,min}$과 프리스케일러 값 $m$의 곱 $t_\mathrm{q} = m \, t_\mathrm{q,min}$이다. $m$은 정수이고, 적어도 1\~32 범위에서 설정할 수 있다.[@bosch-can-2-0-1991]

Bosch CAN 2.0 규격은 SYNC_SEG를 1 tq로 두고, PROP_SEG와 PHASE_SEG1을 각각 1\~8 tq로 설정할 수 있게 정한다. 한 비트의 tq 수는 적어도 8\~25 범위에서 설정할 수 있어야 한다. 이 규격은 PHASE_SEG2를 PHASE_SEG1과 정보 처리 시간 가운데 큰 값으로 두고, 정보 처리 시간은 2 tq 이하로 정한다.[@bosch-can-2-0-1991]

[[iso-11898-1|ISO 11898-1]]:2024는 **최소 time quantum**을 그 노드에서 설정할 수 있는 가장 작은 time quantum으로, **노드 클록**을 CAN 노드에서 비트 시간에 관련된 상태 기계를 맞추는 시간 기준으로 정의한다.[@iso-11898-1-obp-2024]

## 컨트롤러 설정

MCP2515는 프리스케일러(BRP, Baud Rate Prescaler)와 세그먼트 길이를 설정 레지스터 `CNF1`\~`CNF3`로 받는다. PROP_SEG, PHASE_SEG1, PHASE_SEG2의 길이는 각각 `PRSEG`, `PHSEG1`, `PHSEG2` 필드로 따로 설정한다. `PHSEG2`는 `BTLMODE`가 1일 때만 쓰이고, 0이면 PHASE_SEG2는 PHASE_SEG1과 정보 처리 시간 가운데 큰 값이 된다. MCP2515는 `CNF2`의 `SAM` 비트가 1이면 샘플 포인트에서 버스를 세 번 샘플링하고, 0이면 한 번 샘플링한다.[@microchip-mcp2515-2019]

STM32F10x의 bxCAN은 `CAN_BTR` 레지스터로 프리스케일러(`BRP`)를 받고, PROP_SEG와 PHASE_SEG1을 합친 `BS1`과 PHASE_SEG2에 해당하는 `BS2`를 설정한다.[@st-rm0008-2021]

![[diagrams/can-bit-timing-register-fields.svg]]

## CAN FD와의 차이

[[can-fd|CAN FD]]는 [[can-fd#두 비트율|중재 구간과 데이터 구간]]에 비트율을 따로 두고, 각각 별도의 설정 레지스터와 프리스케일러로 비트 타이밍을 정한다.[@bosch-can-fd-1-0-2012]

ISO 11898-1:2024는 중재 구간의 단위 시간당 비트 수를 공칭 비트율, 한 비트의 길이를 공칭 비트 시간으로, 데이터 구간의 것을 각각 **데이터 비트율**과 **데이터 비트 시간**으로 정의한다. 비트율은 비트 부호화와 상관없이 세고, 비트 시간은 그 구간의 time quantum 수로 정한다.[@iso-11898-1-obp-2024]

Bosch CAN FD 1.0은 두 비트율에 프리스케일러 값 $m_\mathrm{N}$(공칭 비트 시간)과 $m_\mathrm{D}$(데이터 비트 시간)를 따로 두어, time quantum의 길이도 둘이 된다. 세그먼트 길이의 범위도 두 비트율에서 아래 표처럼 다르다.[@bosch-can-fd-1-0-2012]

| 세그먼트       | 공칭 비트율                              | 데이터 비트율                            |
| -------------- | ---------------------------------------- | ---------------------------------------- |
| SYNC_SEG       | 1 tq                                     | 1 tq                                     |
| PROP_SEG       | 1 tq부터 32 tq나 그 이상까지             | 0\~8 tq                                  |
| PHASE_SEG1     | 1 tq부터 32 tq나 그 이상까지             | 1\~8 tq                                  |
| PHASE_SEG2     | PHASE_SEG1과 정보 처리 시간 가운데 큰 값 | PHASE_SEG1과 정보 처리 시간 가운데 큰 값 |
| 정보 처리 시간 | 2 tq 이하                                | 2 tq 이하                                |

데이터 구간에서는 송신 노드가 자기 비트를 [[can-transceiver|트랜시버]]를 거쳐 되읽는 지연이 비트 시간보다 길어질 수 있다. 그래서 트랜시버 지연 보상(TDC, Transceiver Delay Compensation)이 측정한 지연에 오프셋을 더해 보조 샘플 포인트(SSP, Secondary Sample Point)를 두고, 그 시점에 비트를 비교한다.[@microchip-mcp25xxfd-frm-2020][@bosch-can-fd-1-0-2012]

Bosch CAN FD 1.0은 트랜시버 지연 보상을 CAN FD 노드가 지원해야 하는 선택 기능으로 두고, 데이터 구간의 송신 노드만 쓰게 정한다. 이 기능을 쓰는 송신 노드는 샘플 포인트에서 받은 비트 값을 무시한다. 보상할 지연은 송신하는 프레임마다 EDL 비트에서 r0 비트로 넘어가는 에지에서, 보낸 비트의 에지와 받은 비트의 에지 사이로 잰다. 보조 샘플 포인트는 잰 지연에 오프셋(예: 데이터 비트 시간의 절반)을 더해 tq 단위로 내림한 자리에 두며, 보낸 비트가 끝난 뒤에 놓일 수도 있다. 보조 샘플 포인트에서 찾은 비트 오류에는 그다음 샘플 포인트에서 대응한다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-fd-transceiver-delay-compensation.svg]]
