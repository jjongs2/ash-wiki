---
title: CAN ACK
tags:
  - network/can
verified: 2026-09-26
---

**CAN ACK**(Acknowledgement)는 [[can|CAN]] 프레임을 제대로 받은 수신 노드가 같은 프레임의 ACK 슬롯에서 dominant 비트를 보내, 송신 노드에 그 사실을 알리는 것이다. [[can-frame|데이터 프레임]]과 [[remote-frame|리모트 프레임]]에서 ACK 필드는 [[can-crc|CRC]] 필드 바로 뒤에 온다.[@bosch-can-2-0-1991]

## ACK 필드

**ACK 필드**는 ACK 슬롯과 ACK 구분자 두 비트이고, 송신 노드는 두 비트 모두 recessive로 보낸다.[@bosch-can-2-0-1991]

CRC 시퀀스가 맞는 프레임을 받은 노드는 모두 ACK 슬롯에서 dominant를 보내 송신 노드의 recessive를 덮어쓴다. ACK 구분자는 recessive여야 하므로, ACK 슬롯은 CRC 구분자와 ACK 구분자라는 두 recessive 비트 사이에 놓인다.[@bosch-can-2-0-1991]

![[diagrams/can-ack-slot.svg]]

ACK 슬롯의 dominant가 알려 주는 것은 프레임을 제대로 받은 노드가 하나 이상 있다는 사실까지다. 수신 노드는 모두 ACK를 보내므로, 그 프레임을 실제로 쓰는 노드가 받았는지는 ACK로 알 수 없다. dominant와 recessive를 동시에 보내면 버스는 [[dominant-and-recessive|dominant]]가 되므로, 여러 수신 노드의 ACK는 버스에서 하나로 합쳐진다.[@bosch-can-2-0-1991]

## ACK 오류

송신 노드는 ACK 슬롯에서 dominant 비트를 읽지 못하면 **ACK 오류**로 판정하고, 다음 비트부터 [[can-error-frame#오류 플래그|오류 플래그]]를 보낸다. 버스에 송신 노드 하나만 있거나, CRC 시퀀스가 맞는 프레임을 받은 수신 노드가 하나도 없을 때 이렇게 된다.[@bosch-can-2-0-1991]

ACK 슬롯에서 송신 노드가 recessive를 보내고 dominant를 읽는 것은 비트 오류가 아니다. [[can-error-detection#비트 오류의 예외|CAN 오류 검출]]의 비트 오류 규칙에 있는 예외다.[@bosch-can-2-0-1991]

ACK를 받지 못한 송신 노드는 오류를 찾고 프레임을 다시 보낸다. error passive 송신 노드는 ACK 오류를 찾고 passive 오류 플래그를 보내는 동안 dominant 비트를 읽지 않으면 송신 오류 계수기가 오르지 않아, 수신 노드가 없는 버스에서 재전송이 되풀이되어도 bus-off로 가지 않는다.[@bosch-can-2-0-1991] 계수기 규칙은 [[can-fault-confinement#오류 계수기|CAN fault confinement]]에서 다룬다.

## CAN FD 프레임과의 차이

Bosch CAN FD 1.0은 [[can-fd-frame|CAN FD 포맷 프레임]]에서 모든 노드가, 여러 수신 노드의 ACK 비트가 겹쳐 생긴 2비트 길이의 dominant 구간도 유효한 ACK로 받아들이게 정한다. 수신 노드마다 송신 노드와의 위상차가 달라서다. classical 포맷에서는 ACK 슬롯 한 비트 뒤에 dominant가 이어지면 형식 오류다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-fd-ack-overlap.svg]]
