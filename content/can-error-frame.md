---
title: CAN 오류 프레임
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN 오류 프레임**은 [[can|CAN]] 버스에서 오류를 찾은 노드가 보내는 프레임이다. 오류 플래그 필드와 그 뒤의 오류 구분자 필드로 이뤄지고, 오류 플래그 필드는 노드 하나 이상이 낸 오류 플래그로 채워진다.[@microchip-mcp2515-2019] 오류를 찾는 규칙은 [[can-error-detection|CAN 오류 검출]]에서 다룬다.

## 구조·동작

### 오류 플래그

오류 플래그는 두 가지이고, 어느 쪽을 낼지는 노드의 오류 상태가 정한다. error active 노드는 dominant 비트 6개인 active 오류 플래그를, error passive 노드는 recessive 비트 6개인 passive 오류 플래그를 낸다.[@microchip-mcp2515-2019] 오류 상태는 [[can-fault-confinement|CAN fault confinement]]에서 다룬다.

active 오류 플래그는 [[can-bit-stuffing|비트 스터핑]] 규칙을 일부러 어긴다. 다른 노드들은 이 스터프 오류를 알아채고 저마다 오류 플래그를 낸다. 그래서 오류 플래그 필드는 여러 노드가 낸 dominant 비트가 6~12개 이어진 모양이 된다.[@microchip-mcp2515-2019]

passive 오류 플래그는 버스를 방해하지 않는다. error active 노드나 송신 노드가 오류를 찾지 않았다면 메시지 전송은 그대로 이어진다.[@microchip-mcp2515-2019]

### 오류 구분자와 그 뒤

오류 구분자는 recessive 비트 8개다. 그 뒤에는 프레임 간 공간이나 오버로드 프레임이 온다. 프레임 간 공간은 인터미션이라 부르는 recessive 비트 3개 이상으로 이뤄진다.[@microchip-mcp2515-2019]

![[diagrams/can-error-frame.svg]]

오류 프레임으로 중단된 메시지는 송신 노드가 다시 보내려 한다.[@microchip-mcp2515-2019] Bosch M_CAN도 오류로 깨진 프레임을 기본 설정에서 자동으로 다시 보낸다.[@bosch-m-can-2023] error passive인 송신 노드는 다음 메시지를 보내기 전에 프레임 간 공간에 recessive 비트 8개를 더 넣는다.[@microchip-pic32-frm-can-2012]

## 비교·한계

오버로드 프레임은 active 오류 프레임과 꼴이 같다. 오버로드 플래그는 dominant 비트 6개이고 다른 노드의 플래그와 겹치면 12비트까지 늘어나며, 오버로드 구분자는 recessive 비트 8개다. 다만 오버로드 프레임은 프레임 간 공간에서만 생기고, 오류 프레임은 메시지를 보내는 도중에 생긴다.[@microchip-mcp2515-2019]

MCP2515 데이터시트는 노드가 오버로드 프레임을 내는 경우로 둘을 든다. 프레임 간 공간에서 허용되지 않는 dominant 비트를 감지했을 때와, 내부 사정으로 다음 메시지를 받을 준비가 안 됐을 때다. 다음 메시지를 늦추려고 오버로드 프레임을 연달아 둘까지 낼 수 있다.[@microchip-mcp2515-2019]
