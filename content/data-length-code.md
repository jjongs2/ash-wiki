---
title: DLC
tags:
  - network/can
verified: 2026-09-26
---

## 정의

**DLC**(Data Length Code)는 [[can|CAN]] 프레임의 제어 필드에 있는 4비트 값으로, 데이터 필드의 바이트 수를 나타낸다. 최상위 비트부터 보낸다.[@bosch-can-2-0-1991]

## 구조·동작

### Classical CAN

DLC 값 0\~8은 데이터 필드의 바이트 수와 같다. Bosch CAN 2.0 규격은 DLC로 0\~8만 쓰게 한다. $\mathrm{DLC} > 8$인 프레임을 받았을 때의 동작은 CAN 2.0이 정하지 않았고, Bosch의 Reference CAN Model은 이를 DLC 8로 보고 8바이트를 받는다.[@bosch-can-2-0-1991] MCP2515는 DLC를 $\mathrm{DLC} > 8$로 설정해도 8바이트만 보낸다.[@microchip-mcp2515-2019]

### CAN FD

[[can-fd|CAN FD]] 포맷 프레임은 DLC 9\~15를 8바이트보다 긴 데이터 필드에 쓴다. Bosch CAN FD 1.0은 classical 포맷에서 DLC 9\~15가 모두 8바이트를 뜻한다고 정하고, CAN FD 포맷에서는 아래 길이를 뜻한다고 정한다.[@bosch-can-fd-1-0-2012]

| DLC                 | 9   | 10  | 11  | 12  | 13  | 14  | 15  |
| ------------------- | --- | --- | --- | --- | --- | --- | --- |
| 데이터 필드(바이트) | 12  | 16  | 20  | 24  | 32  | 48  | 64  |

그래서 CAN FD 프레임의 데이터 필드 길이는 0~8, 12, 16, 20, 24, 32, 48, 64바이트 가운데 하나다. 8바이트를 넘는 데이터는 이 일곱 길이 가운데 하나로만 보낼 수 있다.[@bosch-can-fd-1-0-2012] AUTOSAR CAN 드라이버는 보낼 데이터의 길이가 DLC로 나타낼 수 있는 길이와 맞지 않으면, 그보다 큰 DLC 가운데 가장 작은 것으로 보내고 남는 바이트를 설정한 패딩 값으로 채운다.[@autosar-cp-sws-candriver-2023]

CAN FD 포맷 프레임에서는 DLC가 [[can-crc|CRC]]의 길이도 고른다. 데이터 필드의 바이트 수 $n$이 $n \le 16$이면 17비트 CRC를, $n > 16$이면 21비트 CRC를 쓴다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-fd-dlc-data-length.svg]]

### 리모트 프레임

[[remote-frame|리모트 프레임]]은 데이터 필드가 없지만 DLC는 있고, DLC에는 요청하는 데이터 프레임의 DLC 값을 넣는다.[@bosch-can-2-0-1991]

## 비교·한계

DLC가 알려 주는 것은 데이터 필드의 길이다. 데이터가 무엇을 뜻하는지는 [[can-identifier|식별자]]가 나타낸다.[@bosch-can-2-0-1991] [[j1939|J1939]]에서는 응용 계층 문서(SAE J1939-7X)가 데이터 파라미터와 메시지를 정의하고, J1939-71이 파라미터 그룹 데이터 안에 파라미터를 배치하는 관례를 정한다.[@sae-j1939-71-2025]
