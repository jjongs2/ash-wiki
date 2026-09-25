---
title: 비트 스터핑
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**비트 스터핑**은 [[can|CAN]] 송신기가 같은 극성의 비트 5개를 보낸 뒤 반대 극성의 비트 하나를 끼워 넣는 부호화 규칙이다. 끼워 넣은 비트를 스터프 비트라 부른다. 수신기도 같은 극성의 비트 수를 세다가 스터프 비트를 비트열에서 걷어낸다(디스터핑).[@infineon-xmc4500-rm-2016]

![[diagrams/can-bit-stuffing.svg]]

## 구조·동작

### 동기화 에지

CAN은 데이터에 클럭을 싣지 않는 NRZ(Non-Return-to-Zero) 부호를 쓴다. 비트 스터핑은 적어도 6비트 시간마다 에지를 만들어, 수신 노드가 [[can-synchronization|동기화]]를 유지하게 한다.[@microchip-mcp2515-2019]

### 스터프 오류

SOF(Start of Frame)부터 CRC(Cyclic Redundancy Check) 구분자 사이에서 같은 값의 비트가 6개 연달아 감지되면, 비트 스터핑 규칙을 어긴 것이라 스터프 오류가 된다.[@microchip-mcp2515-2019] 반면 CRC 구분자, ACK(Acknowledgement) 구분자, EOF(End of Frame)는 모양이 고정된 비트 필드다.[@microchip-dspic33e-ecan-frm-2011]

![[diagrams/can-error-check-fields.svg]]

error active 노드의 오류 플래그는 dominant 비트 6개로, 비트 스터핑 규칙을 일부러 어긴다. 그래서 다른 노드들이 스터프 오류를 알아챈다.[@microchip-mcp2515-2019] 오류 플래그는 [[can-error-frame|CAN 오류 프레임]]에서 다룬다.

## 비교·한계

스터프 비트 수는 보내는 비트열에 따라 달라지고, 그래서 데이터 프레임의 전체 비트 수도 달라진다. 스터프 비트는 표준 데이터 프레임에 최대 23개, 확장 데이터 프레임에 최대 28개 들어간다.[@ti-spru074-2009]

CAN FD(CAN with Flexible Data-Rate) 프레임의 CRC 시퀀스에는 위치가 고정된 스터프 비트가 들어간다.[@bosch-m-can-2023] ISO 11898-1:2015 방식의 CRC를 쓰는 CAN FD 프레임은 데이터 필드 뒤 CRC 필드에 4비트 스터프 카운트를 싣는다.[@microchip-mcp25xxfd-frm-2020]
