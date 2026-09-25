---
title: DLC
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**DLC**(Data Length Code)는 [[can-frame|CAN 프레임]]의 제어 필드에 있는 4비트 값으로, 데이터 필드에 실리는 바이트 수를 나타낸다.[@microchip-mcp2515-2019]

## 구조·동작

### classical CAN

Classical [[can|CAN]] 프레임에서 $\mathrm{DLC} \le 8$이면 DLC 값이 곧 데이터 바이트 수이고, $\mathrm{DLC} \ge 9$이면 모두 8바이트를 뜻한다.[@microchip-mcp25xxfd-frm-2020] 예를 들어 MCP2515는 DLC를 8보다 크게 설정할 수 있지만, 이때도 8바이트만 보낸다.[@microchip-mcp2515-2019]

### CAN FD

[[can-fd|CAN FD]](CAN with Flexible Data-Rate)에서도 $\mathrm{DLC} \le 8$이면 DLC 값이 곧 데이터 바이트 수다. DLC 9부터 15까지는 각각 12, 16, 20, 24, 32, 48, 64바이트를 가리킨다. 4비트 DLC의 16개 값이 모두 이렇게 길이에 대응하므로, CAN FD 데이터 필드는 이 값들 사이의 길이를 가질 수 없다.[@microchip-mcp25xxfd-frm-2020]

데이터 길이는 CRC(Cyclic Redundancy Check) 길이도 가른다. CAN FD 프레임은 데이터 바이트 수 $n$이 $n \le 16$이면 17비트 CRC, $n \ge 20$이면 21비트 CRC를 쓴다.[@microchip-mcp25xxfd-frm-2020]

![[diagrams/can-fd-dlc-data-length.svg]]

### 리모트 프레임

[[remote-frame|리모트 프레임]]은 데이터 필드가 없지만 제어 필드에 DLC를 싣는다.[@microchip-mcp2515-2019]

## 비교·한계

DLC는 4비트라 16가지 값만 나타낸다. 그래서 CAN FD의 0~64바이트를 바이트 단위로 모두 가리킬 수는 없다.[@microchip-mcp25xxfd-frm-2020]
