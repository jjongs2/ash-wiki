---
title: CAN fault confinement
tags:
  - network/can
verified: 2026-09-26
---

## 정의

**fault confinement**는 [[can|CAN]] 노드가 잠깐의 교란과 영구 고장을 가려내고, 고장 난 노드를 버스에서 떼어 내는 장치다. 노드는 송신·수신 오류 계수에 따라 자기 오류 상태를 정하며, error active, error passive, bus-off 세 상태 가운데 하나에 있다.[@bosch-can-2-0-1991]

## 구조·동작

### 오류 계수기

노드마다 송신 오류 계수기(TEC, Transmit Error Counter)와 수신 오류 계수기(REC, Receive Error Counter)를 둔다. 오류를 찾으면 계수기가 오르고, 프레임을 제대로 주고받으면 내려간다.[@bosch-can-2-0-1991]

주요 규칙은 다음과 같다.

- 수신 노드가 오류를 찾으면 REC가 1 오른다. 다만 active 오류 플래그나 오버로드 플래그를 내는 동안 찾은 비트 오류는 여기서 빠진다.[@bosch-can-2-0-1991]
- 수신 노드가 오류 플래그를 낸 직후 첫 비트로 dominant를 읽으면 REC가 8 오른다.[@bosch-can-2-0-1991]
- 송신 노드가 오류 플래그를 내면 TEC가 8 오른다.[@bosch-can-2-0-1991]
- 송신에 성공하면 TEC가 1 내려간다. 0이면 그대로다.[@bosch-can-2-0-1991]
- 수신에 성공하면 REC가 1 내려간다. $\mathrm{REC} > 127$이면 119에서 127 사이의 값으로 되돌린다.[@bosch-can-2-0-1991]

TEC가 8 오르는 규칙에는 예외가 있다. error passive 송신 노드가 [[can-acknowledgement|ACK]] 오류를 찾고, passive 오류 플래그를 내는 동안에도 dominant를 읽지 못하면 TEC는 그대로다. 그래서 시동 때 버스에 노드가 하나만 켜져 있으면, 그 노드는 송신할 때마다 ACK를 받지 못해 오류를 찾고 프레임을 다시 보내지만, 이것만으로는 error passive까지만 가고 bus-off는 되지 않는다.[@bosch-can-2-0-1991]

### 상태 전이

- $\mathrm{TEC} > 127$이거나 $\mathrm{REC} > 127$이면 error passive가 된다.[@bosch-can-2-0-1991]
- $\mathrm{TEC} > 255$이면 bus-off가 된다.[@bosch-can-2-0-1991]
- error passive 노드는 $\mathrm{TEC} \le 127$이고 $\mathrm{REC} \le 127$이면 error active로 돌아간다.[@bosch-can-2-0-1991]
- bus-off 노드는 recessive 11비트가 이어지는 것을 128번 본 뒤 error active로 돌아갈 수 있고, 이때 두 계수기는 0이 된다.[@bosch-can-2-0-1991]

![[diagrams/can-fault-confinement-states.svg]]

### 상태마다 할 수 있는 일

- **error active**: 버스 통신에 정상적으로 참여하고, 오류를 찾으면 active 오류 플래그를 낸다.[@bosch-can-2-0-1991]
- **error passive**: 오류를 찾으면 passive 오류 플래그를 낸다. 송신한 뒤에는 다음 송신을 시작하기 전에, 인터미션 다음으로 recessive 8비트를 더 보낸다(송신 정지).[@bosch-can-2-0-1991]
- **bus-off**: 버스에 아무 영향도 주지 않는다.[@bosch-can-2-0-1991]

오류 플래그의 모양은 [[can-error-frame|CAN 오류 프레임]]에서 다룬다.

## 비교·한계

REC만으로는 bus-off가 되지 않는다. bus-off 조건에는 TEC만 들어간다.[@bosch-can-2-0-1991]

Bosch CAN 2.0 규격은 계수기 값이 약 96을 넘으면 버스가 심하게 교란된 것으로 보고, 이를 검사할 수단을 두기를 권한다.[@bosch-can-2-0-1991] 이 값에 경고를 두는 컨트롤러의 예는 다음과 같다.

- MCP2515는 $\mathrm{TEC} \ge 96$이거나 $\mathrm{REC} \ge 96$이면 경고 플래그 EWARN을 세우고, $\mathrm{TEC} < 96$이고 $\mathrm{REC} < 96$이 되면 내린다.[@microchip-mcp2515-2019]
- STM32F10x의 bxCAN은 $\mathrm{TEC} \ge 96$이거나 $\mathrm{REC} \ge 96$이면 경고 플래그 EWGF를 세운다.[@st-rm0008-2021]
- Bosch M_CAN은 $\mathrm{TEC} \ge 96$이거나 $\mathrm{REC} \ge 96$이면 경고 상태 비트를 세운다.[@bosch-m-can-2023]

Bosch M_CAN은 bus-off가 되면 스스로 초기화 비트를 세워 버스 활동을 멈춘다. CPU가 이 비트를 지워야 복귀 절차를 시작하며, 그 뒤 recessive 11비트 연속을 129번 기다린다.[@bosch-m-can-2023]
