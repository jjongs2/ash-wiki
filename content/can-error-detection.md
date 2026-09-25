---
title: CAN 오류 검출
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN 오류 검출**은 [[can|CAN]]의 [[can-controller|컨트롤러]]가 버스의 메시지에서 비트, 스터프, CRC(Cyclic Redundancy Check), 형식, ACK(Acknowledgement) 오류를 찾아내는 일이다.[@microchip-mcp251xxfd-frm-2018]

## 구조·동작

### 다섯 가지 오류

- 비트 오류: 메시지, ACK 비트, active 오류 플래그, 오버로드 플래그를 내는 노드는 버스를 함께 읽는다. 읽은 값이 낸 레벨과 다르면 비트 오류다.[@bosch-m-can-2023] 중재 필드나 ACK 슬롯에서 recessive를 내고 dominant를 읽은 경우는 예외다.[@microchip-mcp2515-2019]
- 스터프 오류: 받은 메시지 가운데 [[can-bit-stuffing|비트 스터핑]]을 하는 부분에서 같은 값의 비트가 5개를 넘게 이어지면 스터프 오류다.[@bosch-m-can-2023]
- CRC 오류: 수신 노드가 계산한 CRC가 받은 CRC 시퀀스와 다르면 CRC 오류다.[@microchip-mcp2515-2019] 자세한 것은 [[can-crc|CAN CRC]]에서 다룬다.
- 형식 오류: 받은 프레임에서 모양이 고정된 부분이 규칙에 맞지 않으면 형식 오류다.[@bosch-m-can-2023]
- ACK 오류: 송신 노드가 ACK 슬롯에서 dominant를 읽지 못하면 ACK 오류다.[@microchip-mcp2515-2019] 자세한 것은 [[can-acknowledgement|CAN ACK]]에서 다룬다.

![[diagrams/can-error-check-fields.svg]]

### 오류 알림과 재전송

버스 오류를 찾은 노드는 오류 플래그로 시작하는 [[can-error-frame|오류 프레임]]을 낸다.[@microchip-mcp2515-2019] Bosch M_CAN은 오류로 깨진 프레임을 기본 설정에서 자동으로 다시 보낸다.[@bosch-m-can-2023]

### 프레임이 유효해지는 시점

프레임이 유효한지 보는 시점은 송신 노드와 수신 노드가 다르다. 송신 노드에게는 EOF(End of Frame) 끝까지 오류가 없으면 유효하다. 수신 노드에게는 EOF의 마지막 바로 앞 비트까지 오류가 없으면 유효하다.[@microchip-mcp251xxfd-frm-2018]

## 비교·한계

노드는 오류 계수기 값에 따라 error active, error passive, bus-off 가운데 한 상태에 있다. error passive에서는 메시지와 passive 오류 프레임을 낼 수 있고, bus-off에서는 버스 통신에 참여하지 못한다.[@microchip-mcp2515-2019] 이 절차는 [[can-fault-confinement|CAN fault confinement]]에서 다룬다.

![[diagrams/can-error-states.svg]]
