---
title: CAN FD 프레임
tags:
  - network/can
verified: 2026-09-26
---

## 정의

**CAN FD 프레임**은 [[can-fd|CAN FD]] 포맷(FD format)으로 보내는 [[can-frame|CAN 프레임]]이다. 식별자가 11비트인 기본 포맷과 29비트인 확장 포맷이 있고, 데이터 필드는 최대 64바이트다.[@iso-11898-1-obp-2015] 중재가 끝난 뒤 데이터 구간의 비트율을 중재 구간보다 높일 수 있다. CAN FD 포맷에는 데이터 프레임만 있고 [[remote-frame|리모트 프레임]]은 없다.[@bosch-can-fd-1-0-2012]

## 구조·동작

### 포맷 표시 비트

Classical 포맷이 dominant 예약 비트 r0을 보내던 자리에, CAN FD 포맷은 recessive 비트를 둔다. 이 비트가 두 포맷을 가르고, Bosch CAN FD 1.0은 이 비트를 EDL(Extended Data Length)이라 부른다.[@bosch-can-fd-1-0-2012]

### 제어 필드

CAN FD 포맷 프레임에서 classical 포맷의 RTR(Remote Transmission Request) 자리에는 늘 dominant로 보내는 예약 비트 r1이 온다. 제어 필드는 EDL, dominant 예약 비트 r0, BRS(Bit Rate Switch), ESI(Error State Indicator), [[data-length-code|DLC]] 4비트 순이다.[@bosch-can-fd-1-0-2012]

- BRS: recessive이면 BRS 비트의 샘플 포인트 직후 데이터 구간의 비트율로 바꾸고, dominant이면 바꾸지 않는다.[@bosch-can-fd-1-0-2012]
- ESI: 송신 노드가 error active이면 dominant, error passive이면 recessive다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-fd-base-format-control-bits.svg]]

### 데이터 필드

데이터 필드는 0\~64바이트이고, DLC 9\~15가 8바이트보다 긴 길이를 가리킨다.[@bosch-can-fd-1-0-2012]

### CRC 필드

[[can-crc|CRC]] 시퀀스는 데이터 필드의 바이트 수 $n$이 $n \le 16$이면 17비트, $n > 16$이면 21비트다. CRC 시퀀스에는 [[can-bit-stuffing|스터프 비트]]를 고정 위치에 넣는다.[@bosch-can-fd-1-0-2012]

### 확장 포맷

확장 포맷에서는 기본 식별자 11비트, SRR(Substitute Remote Request), IDE(Identifier Extension), 확장 식별자 18비트 뒤에 r1이 오고, 이어서 EDL이 온다. 그 뒤 필드는 기본 포맷과 같다.[@bosch-can-fd-1-0-2012]

## 비교·한계

CAN FD 포맷에서 CRC 구분자는 recessive 1비트나 2비트일 수 있다. 송신 노드는 1비트만 보내지만, [[can-acknowledgement|ACK]] 슬롯을 시작하는 dominant 에지 앞에 recessive 2비트가 와도 받아들인다. 이 여유는 노드마다 송신 노드와의 위상차가 달라서, 짧은 비트 시간에서 긴 비트 시간으로 돌아갈 때 그 차이를 보상하려고 둔다.[@bosch-can-fd-1-0-2012]

Classical 포맷만 지원하고 CAN FD 포맷을 용인하지 않는 구현(FD intolerant)은 CAN FD 프레임을 방해해서, 이런 구현이 있는 네트워크에서 CAN FD 포맷을 쓰면 오류 프레임이 생긴다. CAN FD 포맷을 주고받지 못해도 방해하지 않는 구현(FD tolerant)도 있다.[@iso-11898-1-obp-2015]
