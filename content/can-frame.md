---
title: CAN 프레임
tags:
  - network/can
verified: 2026-09-25
---

## 정의

Classical [[can|CAN]]의 프레임에는 데이터 프레임, [[remote-frame|리모트 프레임]], 오류 프레임, 과부하 프레임 네 종류가 있다. 데이터 프레임은 데이터를 나르고, 리모트 프레임은 같은 [[can-identifier|식별자]]의 데이터 프레임을 보내 달라고 요청한다. 오류 프레임은 노드가 오류를 찾았음을 알리고, 과부하 프레임은 이어지는 프레임 사이에 지연을 더한다.[@microchip-pic32-can-frm-2012]

데이터 프레임과 리모트 프레임에는 식별자가 11비트인 기본 포맷과 29비트인 확장 포맷이 있다.[@microchip-pic32-can-frm-2012]

## 구조·동작

### 데이터 프레임

데이터 프레임은 SOF(Start of Frame)로 시작해 EOF(End of Frame)로 끝나며, 그 사이에 중재, 제어, 데이터, CRC(Cyclic Redundancy Check), ACK(Acknowledgement) 필드가 있다.[@microchip-pic32-can-frm-2012]

![[diagrams/can-data-frame-fields.svg]]

SOF는 dominant 비트 하나로 프레임의 시작을 알린다. 모든 노드는 SOF의 recessive에서 dominant로 바뀌는 에지에 동기를 맞춘다(hard synchronization).[@microchip-mcp2515-2019]

기본 포맷의 중재 필드는 식별자 11비트와 RTR(Remote Transmission Request) 비트다. RTR은 데이터 프레임에서 dominant, 리모트 프레임에서 recessive다. 제어 필드는 IDE(Identifier Extension) 비트, 예약 비트, [[data-length-code|DLC]](Data Length Code) 4비트로 이뤄진다. 데이터 필드는 0~8바이트다.[@microchip-mcp2515-2019]

CRC 필드는 15비트 CRC 시퀀스와 recessive인 CRC delimiter다. ACK 필드는 ACK 슬롯과 ACK delimiter 두 비트다. 송신 노드는 ACK 슬롯에 recessive를 보내고, 프레임을 오류 없이 받은 노드는 그 자리에 dominant를 쓴다. ACK delimiter는 recessive다.[@microchip-mcp2515-2019] EOF는 recessive 7비트다.[@microchip-pic32-can-frm-2012]

프레임 뒤에는 프레임 간 간격이 온다. 그 안의 intermission은 recessive 3비트이고, 그 뒤로 버스는 idle로 recessive에 머문다.[@microchip-mcp2515-2019]

### 확장 포맷

확장 포맷의 중재 필드는 기본 식별자 11비트, SRR(Substitute Remote Request) 비트, IDE 비트, 확장 식별자 18비트, RTR 비트 순서로 이뤄진다. SRR과 IDE는 recessive다.[@microchip-mcp2515-2019]

IDE는 기본 포맷에서 dominant, 확장 포맷에서 recessive이고, 수신 노드는 이 비트로 기본 프레임과 확장 프레임을 가린다.[@microchip-pic32-can-frm-2012] 29비트 식별자를 11비트와 18비트로 나눠 IDE의 위치를 두 포맷에서 같게 했으므로, 두 포맷의 프레임을 한 버스에 함께 쓸 수 있다.[@microchip-mcp2515-2019]

![[diagrams/can-base-extended-arbitration-field.svg]]

### 비트 스터핑

송신 노드는 같은 값의 비트가 5개 이어지면 반대 값의 비트를 하나 자동으로 넣고, 수신 노드는 받은 비트열에서 이 스터프 비트를 걷어낸다.[@bosch-can-2-0-1991] EOF는 스터핑하지 않는다.[@microchip-dspic30f-can-frm-2003]

![[diagrams/can-bit-stuffing.svg]]

## 비교·한계

Classical 프레임의 데이터는 8바이트를 넘지 못한다. 식별자와 제어·CRC·ACK 필드 같은 비트는 데이터 길이와 상관없이 붙으므로, 데이터가 짧을수록 프레임에서 데이터가 차지하는 몫이 작다.[@microchip-mcp2515-2019]

CAN FD(CAN with Flexible Data-Rate)의 [[can-fd-frame|프레임]]은 데이터 필드를 64바이트까지 늘렸다.[@microchip-mcp251xxfd-frm-2018]
