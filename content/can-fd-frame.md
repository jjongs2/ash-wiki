---
title: CAN FD 프레임
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN FD 프레임**은 [[can-fd|CAN FD]](CAN with Flexible Data-Rate)가 쓰는 데이터 프레임 포맷이다. 데이터 필드는 최대 64바이트다. 식별자가 11비트인 기본 포맷과 29비트인 확장 포맷이 모두 있다.[@microchip-mcp25xxfd-frm-2020]

classical [[can-frame|CAN 프레임]]처럼 SOF(Start of Frame)와 중재 필드로 시작하지만, 중재 필드의 RTR(Remote Transmission Request) 자리에는 RRS(Remote Request Substitution) 비트가 온다. 제어 필드에는 CAN FD용 비트가 더해진다.[@microchip-mcp25xxfd-frm-2020]

## 구조·동작

### 중재 필드

기본 포맷의 중재 필드는 [[can-identifier|식별자]] 11비트와 RRS 비트로 이뤄진다. 확장 포맷에서는 기본 식별자 뒤에 SRR(Substitute Remote Request), IDE(Identifier Extension), 확장 식별자 18비트가 오고, 그 뒤에 RRS가 온다.[@microchip-mcp25xxfd-frm-2020]

CAN FD에는 [[remote-frame|리모트 프레임]]이 없으므로, classical 프레임의 RTR 자리에 dominant인 RRS 비트가 온다.[@bosch-m-can-2023]

### 제어 필드

제어 필드에는 다음 비트가 차례로 온다. IDE는 기본 포맷에서만 제어 필드 맨 앞에 온다.[@microchip-mcp25xxfd-frm-2020]

- IDE: dominant면 기본 포맷이다.[@microchip-mcp2515-2019]
- FDF(FD Format): classical 프레임에서 예약 비트였던 자리다. recessive면 CAN FD 프레임, dominant면 classical 프레임이다.[@bosch-m-can-2023]
- res: dominant로 보내는 예약 비트다. recessive 값은 앞으로의 프로토콜 확장용으로 남겨 두었다.[@bosch-m-can-2023]
- BRS(Bit Rate Switch): recessive면 BRS 뒤의 데이터 구간을 더 높은 비트율로 보낸다.[@bosch-m-can-2023]
- ESI(Error State Indicator): 송신 노드가 error passive면 recessive, error active면 dominant로 보낸다.[@bosch-m-can-2023]
- [[data-length-code|DLC]](Data Length Code): 데이터 필드의 바이트 수를 나타내는 4비트다.[@microchip-mcp25xxfd-frm-2020]

### 데이터 필드

데이터 필드는 0~8, 12, 16, 20, 24, 32, 48, 64바이트 가운데 하나다.[@bosch-m-can-2023]

### CRC 필드

ISO 11898-1:2015를 따르는 CAN FD의 CRC(Cyclic Redundancy Check) 필드는 4비트 스터프 비트 개수, CRC 시퀀스, CRC delimiter로 이뤄진다. CRC 시퀀스는 데이터가 16바이트 이하면 17비트, 20바이트 이상이면 21비트다.[@microchip-mcp25xxfd-frm-2020] CRC 시퀀스에는 고정 스터프 비트가 들어간다.[@bosch-m-can-2023]

### 비트율 전환

BRS가 recessive인 프레임에서는 BRS 비트의 샘플 포인트에서 data bit rate로 바꾸고, CRC delimiter의 샘플 포인트에서 nominal bit rate로 돌아온다. ACK(Acknowledgement) 필드와 EOF(End of Frame)는 다시 nominal bit rate로 보낸다.[@microchip-mcp25xxfd-frm-2020]

## 비교·한계

Bosch의 원래 CAN FD 규격은 CRC 필드에 스터프 비트 개수가 없다는 점이 ISO 포맷과 다르다.[@microchip-mcp25xxfd-frm-2020]
