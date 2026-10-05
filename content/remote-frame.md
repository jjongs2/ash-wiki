---
title: 리모트 프레임
tags:
  - network/can
verified: 2026-09-26
---

**리모트 프레임**은 [[can|CAN]]에서 어떤 데이터를 받고 싶은 수신 노드가, 그 데이터의 송신 노드에게 같은 식별자의 [[can-frame|데이터 프레임]]을 보내 달라고 요청하는 프레임이다.[@bosch-can-2-0-1991] [[iso-11898-1|ISO 11898-1]]:2024는 리모트 프레임을 특정 데이터 프레임의 송신을 요청하는 프레임으로 정의한다.[@iso-11898-1-obp-2024]

## 필드

리모트 프레임은 SOF(Start of Frame), 중재 필드, 제어 필드, [[can-crc|CRC]] 필드, [[can-acknowledgement|ACK]] 필드, EOF(End of Frame)의 여섯 필드로 이루어진다. 데이터 프레임과 달리 데이터 필드가 없다.[@bosch-can-2-0-1991]

중재 필드의 RTR(Remote Transmission Request) 비트가 두 프레임을 가른다. RTR은 데이터 프레임에서 [[dominant-and-recessive|dominant]], 리모트 프레임에서 recessive다. [[can-frame#기본 포맷과 확장 포맷|확장 포맷]]에서도 RTR 비트는 중재 필드 끝에 오고, 규칙은 같다.[@bosch-can-2-0-1991]

![[diagrams/can-data-remote-frame-fields.svg]]

## DLC

리모트 프레임에는 데이터 필드가 없지만 제어 필드와 그 안의 [[data-length-code|DLC]]는 있다. DLC 값은 요청하는 데이터 프레임의 DLC다.[@bosch-can-2-0-1991]

Bosch CAN FD 1.0은 리모트 프레임의 DLC를 0\~15 범위의 어느 값으로도 둘 수 있게 하고, 그 값이 대응하는 데이터 프레임의 DLC여야 한다고 정한다.[@bosch-can-fd-1-0-2012]

## 중재

리모트 프레임과 그에 응답하는 데이터 프레임은 [[can-identifier|식별자]]가 같다. 두 프레임이 한꺼번에 송신을 시작하면 RTR 비트에서 dominant를 보낸 데이터 프레임이 [[can-arbitration|중재]]에서 이긴다.[@bosch-can-2-0-1991]

## 컨트롤러의 처리

MCP2515는 받은 프레임이 리모트 프레임이면 수신 버퍼 제어 레지스터의 `RXRTR` 비트로 표시한다.[@microchip-mcp2515-2019] Bosch M_CAN은 리모트 프레임을 필터링하지 않고 모두 버리도록 설정할 수 있고, 이 설정은 기본 포맷과 확장 포맷에 따로 둔다.[@bosch-m-can-2023]

## CAN FD와의 차이

[[can-fd|CAN FD]] 포맷에는 리모트 프레임이 없다. CAN FD 포맷 프레임에서는 classical 포맷의 RTR 자리에 늘 dominant인 비트가 온다. 리모트 프레임은 classical 포맷으로만 보낼 수 있다.[@bosch-can-fd-1-0-2012]
