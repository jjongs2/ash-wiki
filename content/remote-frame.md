---
title: 리모트 프레임
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**리모트 프레임**(remote frame)은 데이터가 필요한 [[can|CAN]] 노드가, 그 데이터를 가진 노드에 데이터 프레임을 보내 달라고 요청하는 [[can-frame|프레임]]이다. 요청할 데이터 프레임과 같은 [[can-identifier|식별자]]를 쓰며, 데이터 필드가 없다.[@microchip-mcp2515-2019]

## 구조·동작

리모트 프레임은 RTR(Remote Transmission Request) 비트가 recessive라는 점으로 데이터 프레임과 구별된다. 데이터 프레임의 RTR은 dominant다. 리모트 프레임에도 기본 포맷과 확장 포맷이 모두 있다.[@microchip-mcp2515-2019]

![[diagrams/can-data-remote-frame.svg]]

같은 식별자의 데이터 프레임과 리모트 프레임이 동시에 송신되면, 식별자 뒤의 RTR 비트에서 dominant를 낸 데이터 프레임이 [[can-arbitration|중재]]에서 이긴다.[@microchip-mcp2515-2019]

MCP2515는 받은 리모트 프레임을 수신 버퍼에 넣고, 리모트 요청인지를 레지스터 비트로 표시한다.[@microchip-mcp2515-2019]

## 비교·한계

보통은 요청이 없어도 데이터를 가진 노드가 스스로 데이터 프레임을 보낸다.[@microchip-mcp2515-2019]

[[can-fd|CAN FD]](CAN with Flexible Data-Rate)에는 리모트 프레임이 없다. CAN FD 프레임에서는 RTR 자리에 dominant인 RRS(Remote Request Substitution) 비트가 온다.[@bosch-m-can-2023]
