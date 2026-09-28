---
title: CAN 오류 프레임
tags:
  - network/can
verified: 2026-09-26
---

## 정의

**CAN 오류 프레임**은 [[can|CAN]] 노드가 버스 오류를 [[can-error-detection|찾았을 때]] 내는 프레임이다. 여러 노드가 낸 오류 플래그가 겹친 필드와 오류 구분자, 두 필드로 이루어진다.[@bosch-can-2-0-1991]

## 구조·동작

### 오류 플래그

오류 플래그는 노드의 오류 상태에 따라 두 가지다.[@bosch-can-2-0-1991]

- **active 오류 플래그**: [[dominant-and-recessive|dominant]] 6비트다. [[can-fault-confinement|error active]] 노드가 낸다.
- **passive 오류 플래그**: recessive 6비트다. error passive 노드가 낸다.[@bosch-can-2-0-1991]

active 오류 플래그의 모양은 SOF(Start of Frame)부터 [[can-crc|CRC]] 구분자까지 적용되는 [[can-bit-stuffing|비트 스터핑]] 규칙을 어기거나, [[can-acknowledgement|ACK]] 필드나 EOF(End of Frame)의 고정된 모양을 깨뜨린다. 그래서 다른 노드도 모두 오류를 찾고 자기 오류 플래그를 낸다. 여러 노드의 플래그가 포개지므로, 버스에 나타나는 dominant 열은 짧게는 6비트, 길게는 12비트가 된다.[@bosch-can-2-0-1991]

passive 오류 플래그는 recessive라 다른 노드의 송신을 덮어쓰지 못하고, 오히려 다른 노드의 dominant 비트에 덮어쓰인다. error passive 노드는 passive 오류 플래그를 내기 시작한 비트부터 세어, 같은 값의 비트 6개가 이어지는 것을 보면 플래그를 끝낸다.[@bosch-can-2-0-1991]

### 오류 구분자

**오류 구분자**는 recessive 8비트다. 노드는 오류 플래그를 낸 뒤 recessive를 내면서 버스를 보다가, recessive 비트를 보면 recessive 7비트를 더 낸다.[@bosch-can-2-0-1991]

![[diagrams/can-error-flag-overlap.svg]]

### 오류 프레임 뒤

오류 프레임 뒤에는 프레임 간 공간이나 오버로드 프레임이 온다. 다음 [[can-frame|데이터 프레임]]이나 [[remote-frame|리모트 프레임]]은 앞 프레임이 무엇이든 프레임 간 공간을 두고 떨어지며, 프레임 간 공간은 recessive 3비트의 인터미션으로 시작한다.[@bosch-can-2-0-1991]

오류로 깨진 메시지는 자동으로 다시 보내지며, 버스가 비는 즉시 재전송을 시작해야 한다. 직전 메시지를 보낸 노드가 error passive이면 인터미션 뒤에 recessive 8비트를 더 내고 나서야 다음 송신을 시작한다(송신 정지).[@bosch-can-2-0-1991]

## 비교·한계

오류 프레임과 오버로드 프레임은 모양이 고정되어 있어 스터핑하지 않는다. **오버로드 프레임**은 dominant 6비트의 오버로드 플래그와 recessive 8비트의 오버로드 구분자로 이루어져, 플래그는 active 오류 플래그와, 구분자는 오류 구분자와 모양이 같다. 다만 오류를 알리려는 것이 아니라, 앞뒤 데이터 프레임이나 리모트 프레임 사이에 지연을 더하려고 쓴다.[@bosch-can-2-0-1991]

[[can-fd-frame|CAN FD 포맷 프레임]]에는 ESI(Error State Indicator) 비트가 있고, classical 포맷 프레임에는 없다. ESI는 error active 노드가 보내면 dominant, error passive 노드가 보내면 recessive다.[@bosch-can-fd-1-0-2012]
