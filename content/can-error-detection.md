---
title: CAN 오류 검출
tags:
  - network/can
verified: 2026-09-27
---

**CAN 오류 검출**은 [[can|CAN]] 노드가 프레임을 주고받으며 전송 오류를 찾아내는 방법이다. 비트 오류, 스터프 오류, [[can-crc|CRC]] 오류, 형식 오류, [[can-acknowledgement|ACK]] 오류 다섯 가지를 검사한다.[@bosch-can-2-0-1991]

## 다섯 가지 오류

- **비트 오류**: 비트를 보내는 노드가 버스에서 되읽은 값이 보낸 값과 다르다.
- **스터프 오류**: [[can-bit-stuffing|비트 스터핑]]으로 부호화하는 필드에서 같은 값의 비트가 6개 이어진다.
- **CRC 오류**: 수신 노드가 계산한 CRC가 받은 CRC 시퀀스와 다르다.
- **형식 오류**: CRC 구분자, ACK 구분자, EOF(End of Frame)처럼 모양이 정해진 필드에 허용되지 않는 비트가 있다.
- **ACK 오류**: 송신 노드가 ACK 슬롯에서 [[dominant-and-recessive|dominant]]를 읽지 못한다.[@bosch-can-2-0-1991]

![[diagrams/can-error-detection-fields.svg]]

## 비트 오류의 예외

중재 필드에서 recessive를 보내고 dominant를 읽은 것은 [[can-arbitration|중재]]에서 진 것이라 비트 오류가 아니다. ACK 슬롯에서 recessive를 보내고 dominant를 읽은 것도 비트 오류가 아니다. [[can-error-frame#오류 플래그|passive 오류 플래그]]를 보내는 송신 노드가 dominant를 읽은 것도 비트 오류로 보지 않는다.[@bosch-can-2-0-1991]

## 오류를 알리는 시점

비트 오류, 스터프 오류, 형식 오류, ACK 오류를 찾은 노드는 다음 비트에서 오류 플래그를 내기 시작한다. CRC 오류만은 ACK 구분자 다음 비트에서 시작하는데, 다른 오류로 이미 오류 플래그를 내기 시작했다면 그대로 둔다.[@bosch-can-2-0-1991]

## 프레임이 유효해지는 시점

송신 노드에게는 EOF 끝까지 오류가 없어야 프레임이 유효하다. 수신 노드에게는 EOF의 마지막 비트 직전까지 오류가 없으면 유효하다. 그래서 수신 노드는 EOF 마지막 비트의 dominant를 형식 오류로 보지 않는다.[@bosch-can-2-0-1991] Bosch CAN FD 1.0에서는 이때 수신 노드가 [[can-overload-frame|오버로드 프레임]]으로 응답한다.[@bosch-can-fd-1-0-2012]

## 전역 오류 신호

error active 노드가 찾은 오류는 active 오류 플래그를 통해 다른 모든 노드에도 오류로 잡힌다. 오류로 표시된 프레임은 중단되고, 송신 노드가 [[can-controller#자동 재전송|자동으로 다시 보낸다]]. 그 결과 한 프레임을 두고 어떤 노드는 받아들이고 어떤 노드는 버리는 일이 생기지 않는다.[@bosch-can-2-0-1991]

오류를 찾은 때부터 다음 메시지가 시작될 때까지는, 그 사이에 오류가 더 없으면 최대 31비트 시간이 걸린다.[@bosch-can-2-0-1991]

error active 노드가 내는 [[can-error-frame#오류 플래그|오류 플래그]]가 다른 노드에도 오류를 일으켜 여러 노드의 플래그가 겹치므로, 버스에 보이는 dominant 열의 길이는 6~12비트 사이에서 달라진다.[@bosch-can-2-0-1991]

MCP2515 데이터시트에 따르면 이렇게 길이가 달라지는 까닭은 국부적인 교란으로 일부 노드만 먼저 오류 플래그를 내면 나머지 노드가 그 플래그에 응답해 오류 플래그(오류 에코 플래그)를 내기 때문이다.[@microchip-mcp2515-2019] Microchip 앱노트에 따르면 오류 에코 플래그가 더하는 길이는 노드마다 버스의 오류를 찾는 시점에 따라 달라진다.[@microchip-an713-1999]

[[can-fault-confinement|CAN fault confinement]]로 노드는 짧은 교란과 영구 고장을 구별하고, 고장 난 노드는 버스에서 빠진다.[@bosch-can-2-0-1991]

## CAN FD 프레임과의 차이

Bosch CAN FD 1.0은 [[can-fd-frame|CAN FD 포맷 프레임]]의 CRC 시퀀스에 넣는 고정 스터프 비트가 바로 앞 비트와 값이 같으면, 수신 노드가 이를 오류로 검출하게 정한다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-fd-crc-fixed-stuff-bits.svg]]
