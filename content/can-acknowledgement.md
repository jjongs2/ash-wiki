---
title: CAN ACK
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN ACK**(Acknowledgement)는 수신 노드가 프레임을 제대로 받았음을 송신 노드에 알리는 절차다. [[can|CAN]] 프레임의 ACK 필드는 ACK 슬롯과 ACK 구분자 두 비트로 이뤄진다.[@microchip-mcp2515-2019]

## 구조·동작

### ACK 슬롯

송신 노드는 ACK 슬롯에서 recessive 비트를 낸다. 프레임을 오류 없이 받은 수신 노드는 그 메시지를 받아들이도록 설정되어 있는지와 상관없이, ACK 슬롯에서 dominant 비트를 내서 송신 노드의 recessive를 덮어쓴다.[@microchip-mcp2515-2019] 두 버스 상태는 [[dominant-and-recessive|dominant와 recessive]]에서 다룬다.

ACK 구분자는 항상 recessive이고, 어느 노드도 dominant로 덮어쓸 수 없다. CRC(Cyclic Redundancy Check) 필드는 recessive인 CRC 구분자로 끝나므로, ACK 슬롯은 recessive 비트 둘 사이에 놓인다.[@microchip-mcp2515-2019]

![[diagrams/can-ack-slot.svg]]

### ACK 오류

송신 노드가 ACK 슬롯에서 dominant 비트를 읽지 못하면 ACK 오류다. 송신 노드는 [[can-error-frame|오류 프레임]]을 내고 메시지를 다시 보낸다.[@microchip-mcp2515-2019]

수신 노드가 계산한 CRC가 받은 값과 다르면 CRC 오류이고, 그 노드는 오류 프레임을 낸다.[@microchip-mcp2515-2019] CRC는 [[can-crc|CAN CRC]]에서 다룬다.

## 비교·한계

ACK 슬롯이 dominant라는 것은 버스의 노드 가운데 적어도 하나가 프레임을 오류 없이 받았다는 뜻이다.[@microchip-mcp2515-2019]

버스에 다른 노드가 없으면 ACK 슬롯에 dominant를 낼 노드가 없다. 그래서 송신 노드는 보낼 때마다 ACK 오류를 겪고 메시지를 다시 보낸다.[@microchip-mcp2515-2019]
