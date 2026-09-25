---
title: CAN CRC
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN CRC**(Cyclic Redundancy Check)는 송신 노드가 계산해 [[can|CAN]] 프레임의 CRC 필드에 싣는 검사 비트이고, 전송 오류를 찾는 데 쓴다. classical CAN 프레임의 CRC 필드는 15비트 CRC 시퀀스와 recessive 비트 하나인 CRC 구분자로 이뤄진다.[@microchip-mcp2515-2019]

## 구조·동작

### 계산 범위

CRC는 SOF(Start of Frame)부터 데이터 필드 끝까지의 비트로 계산한다. 데이터가 없는 프레임은 제어 필드 뒤에 바로 CRC가 온다.[@microchip-mcp2515-2019]

![[diagrams/can-crc-coverage.svg]]

### 검사

수신 노드는 받은 비트로 같은 방식의 CRC를 계산해 받은 CRC 시퀀스와 비교하고, 둘이 다르면 CRC 오류로 본다.[@microchip-mcp2515-2019] 다른 오류들은 [[can-error-detection|CAN 오류 검출]]에서 다룬다.

프레임을 오류 없이 받은 노드는 그 메시지를 받아들이도록 설정되어 있는지와 상관없이 ACK(Acknowledgement) 슬롯에서 dominant 비트를 낸다.[@microchip-mcp2515-2019] 이 절차는 [[can-acknowledgement|CAN ACK]]에서 다룬다.

## 비교·한계

CAN FD(CAN with Flexible Data-Rate)는 데이터가 16바이트 이하인 프레임에 17비트 CRC를, 20바이트 이상인 프레임에 21비트 CRC를 쓴다. ISO 11898-1:2015 방식의 CAN FD는 CRC 필드에 스터프 비트 개수를 함께 싣는다.[@microchip-mcp25xxfd-frm-2020] 스터프 비트는 [[can-bit-stuffing|비트 스터핑]]에서 다룬다.
