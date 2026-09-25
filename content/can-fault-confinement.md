---
title: CAN fault confinement
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN fault confinement**는 [[can|CAN]]의 [[can-controller|컨트롤러]]가 송신 오류 계수기(TEC, Transmit Error Counter)와 수신 오류 계수기(REC, Receive Error Counter)의 값에 따라 자신을 error active, error passive, bus-off 가운데 한 상태에 두는 기능이다.[@microchip-mcp2515-2019]

## 구조·동작

### 오류 상태

- error active: 통신에 정상적으로 참여하고, 오류를 찾으면 active 오류 플래그를 낸다.[@bosch-m-can-2023]
- error passive: 메시지를 보낼 수 있지만, 오류를 찾으면 passive 오류 플래그만 낸다.[@microchip-mcp2515-2019] error passive인 송신 노드는 다음 메시지를 보내기 전에 프레임 간 공간에 recessive 비트 8개를 더 넣는다.[@microchip-pic32-frm-can-2012]
- bus-off: 버스에 아무것도 내지 않는다.[@microchip-pic32-frm-can-2012]

두 오류 플래그의 모양은 [[can-error-frame|CAN 오류 프레임]]에서 다룬다.

### 상태 전이

$\mathrm{TEC} > 127$이거나 $\mathrm{REC} > 127$이면 노드는 error passive가 되고, $\mathrm{TEC} > 255$이면 bus-off가 된다.[@microchip-mcp25xxfd-frm-2020] $\mathrm{TEC} < 128$이고 $\mathrm{REC} < 128$이면 error active다.[@microchip-mcp2515-2019]

bus-off로 가는 조건은 $\mathrm{TEC} > 255$뿐이라, bus-off가 될 수 있는 것은 송신 노드뿐이다. REC 값만으로는 노드가 error passive를 넘어 bus-off로 가지 않는다.[@microchip-mcp2515-2019]

![[diagrams/can-error-states.svg]]

### bus-off에서 돌아오기

bus-off에서 돌아오는 절차는 컨트롤러마다 다르다. MCP2515는 bus-off가 된 뒤 recessive 비트 11개가 이어지는 것을 128번 받으면, MCU가 개입하지 않아도 error active로 돌아온다.[@microchip-mcp2515-2019] MCP25XXFD는 bus-off가 되면 복귀 절차를 스스로 시작하고, idle 조건을 128번 감지한 뒤 bus-off를 벗어나며 두 계수기를 리셋한다.[@microchip-mcp25xxfd-frm-2020]

Bosch M_CAN은 bus-off가 되면 스스로 초기화 상태로 들어가 버스 활동을 멈춘다. CPU가 초기화 상태를 풀면 recessive 비트 11개가 이어지는 것을 129번 기다린 뒤 정상 동작으로 돌아오고, 오류 계수기를 리셋한다.[@bosch-m-can-2023]

### error passive에서 받은 메시지

$\mathrm{REC} \ge 128$일 때 메시지를 제대로 받으면, REC는 $119 \le \mathrm{REC} \le 127$인 값으로 다시 설정된다.[@ti-spru074-2009]

## 비교·한계

MCP2515에서는 MCU가 TEC와 REC를 레지스터로 읽을 수 있다. $\mathrm{TEC} \ge 96$이거나 $\mathrm{REC} \ge 96$이면 오류 경고 플래그를 세우고, $\mathrm{TEC} < 96$이고 $\mathrm{REC} < 96$이 되면 지운다.[@microchip-mcp2515-2019]

CAN FD(CAN with Flexible Data-Rate) 프레임의 제어 필드에는 ESI(Error State Indicator) 비트가 있다. MCP25XXFD는 평소 이 비트로 자기 오류 상태를 알려, error active면 dominant로, error passive면 recessive로 낸다. 다만 게이트웨이 모드에서는 error active여도 ESI를 recessive로 낼 수 있다.[@microchip-mcp25xxfd-frm-2020] Bosch M_CAN도 error passive면 ESI를 늘 recessive로 내고, error active여도 송신 버퍼의 ESI 비트를 켜면 recessive로 낸다.[@bosch-m-can-2023]
