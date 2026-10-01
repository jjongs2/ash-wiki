---
title: 100BASE-TX
tags:
  - network/ethernet
verified: 2026-09-29
---

**100BASE-TX**는 꼬임쌍선 두 쌍으로 100 Mbit/s를 보내는 이더넷 물리 계층이다.[@ieee-802-3-2022][@ti-szzy009-2018] 한 쌍은 송신에, 다른 한 쌍은 수신에 쓰며, Fast Ethernet이라고도 부른다.[@ti-szzy009-2018][@microchip-ksz8081mlx-2022] IEEE 802.3u-1995는 Category 5 평형 케이블 두 쌍이나 150 Ω 차폐 평형 케이블을 쓰는 100BASE-TX를, 100 Mbit/s 물리 계층 묶음인 100BASE-T의 하나로 넣었다.[@ieee-802-3u-1995]

## 송신과 수신

100BASE-TX [[ethernet-phy|PHY]]의 송신기는 [[mii|MII]]로 받은 4비트 니블마다 5비트 코드 그룹 하나를 내는 4B/5B 부호를 쓰고, 코드 그룹을 스크램블한 뒤 NRZI(Non-Return-to-Zero Inverted)로 바꿔 MLT-3(Multi-Level Transmit)으로 보낸다. 4비트를 5비트로 늘리므로 선로의 직렬 속도는 아래와 같다.[@microchip-ksz8081mlx-2022][@ti-dp83822-2026]

$$
100\,\mathrm{Mbit/s} \times \frac{5}{4} = 125\,\mathrm{Mbit/s}
$$

수신기는 들어온 신호에서 클럭을 복구한다.[@microchip-ksz8081mlx-2022][@ti-dp83822-2026] IEEE 802.3이 쓰는 4B/5B 부호는 스크램블하지 않을 때도 클럭 복구를 돕기에 충분한 천이 밀도를 준다.[@ieee-802-3-2022]

![[diagrams/100base-tx-transmit-chain.svg]]

5비트 코드 32개 가운데 16개는 데이터에 쓴다. 나머지 가운데 일부는 idle, 패킷 시작(J/K), 패킷 끝(T/R) 같은 제어 코드이고, 나머지는 무효 코드다.[@ti-dp83822-2026][@microchip-lan8720a-2024]

100BASE-TX PHY의 송신 신호는 ANSI TP-PMD(Twisted Pair Physical Medium Dependent) 규격을 따른다.[@microchip-ksz8081mlx-2022][@ti-dp83822-2026] IEEE 802.3u-1995는 100BASE-X(100BASE-TX와 100BASE-FX)를 넣으면서 FDDI(Fiber Distributed Data Interface)용으로 만든 100 Mbit/s 물리 시그널링 규격 일부를 가져다 썼다.[@ieee-802-3u-1995] 현행 IEEE 802.3-2022도 100BASE-TX의 PMD(Physical Medium Dependent) 부계층을 FDDI의 TP-PMD 규격을 참조로 들여와 정하며, TP-PMD가 정한 125 Mbit/s 전이중 신호 방식이 100BASE-TX의 바탕이다.[@ieee-802-3-2022]

## MLT-3

MLT-3은 세 준위(+1, 0, −1)를 쓰는 선로 부호다.[@microchip-lan8720a-2024][@ti-snla265-2016] IEEE 802.3-2022는 EEE(Energy-Efficient Ethernet)를 지원하는 100BASE-TX의 MLT-3 인코더를 상태도로 정하며, 이 인코더는 저전력 모드에서 송신을 쉬는 동안 출력을 0으로 두는 것 말고는 TP-PMD의 인코더와 같다. 인코더는 비트 1을 받을 때마다 출력 준위를 0 → +1 → 0 → −1 순서로 다음 준위로 옮기고, 비트 0을 받으면 준위를 그대로 둔다.[@ieee-802-3-2022]

## 배선

IEEE 802.3-2022는 100BASE-TX의 링크 세그먼트를 공칭 임피던스 100 Ω인 Category 5 평형 케이블 두 쌍으로 이루고, 100 m까지의 Category 5 링크 세그먼트에서 믿을 만하게 동작하도록 전송 파라미터를 정한다.[@ieee-802-3-2022]

100BASE-TX PHY는 보통 트랜스포머를 거쳐 선에 이어진다. 커넥터는 8핀 RJ-45다.[@microchip-ksz8081mlx-2022][@ti-dp83822-2026]

MDI(Medium Dependent Interface) 포트와 MDI-X 포트는 송신 쌍과 수신 쌍의 핀이 서로 바뀌어 있다.[@microchip-ksz8081mlx-2022][@marvell-88e3015-2020] KSZ8081MLX 데이터시트에 따르면 크로스오버 케이블은 MDI 장치끼리나 MDI-X 장치끼리 잇고, 스트레이트 케이블은 MDI 장치와 MDI-X 장치를 잇는다.[@microchip-ksz8081mlx-2022] Auto MDI-X를 지원하는 PHY는 송수신 쌍을 스스로 맞춰, 스트레이트와 크로스오버 어느 케이블로도 이을 수 있다.[@microchip-ksz8081mlx-2022][@marvell-88e3015-2020]

## 차량 진단 인터페이스

[[iso-13400-3|ISO 13400-3:2016]]은 IEEE 802.3의 100BASE-TX를 바탕으로 한 물리 계층과 데이터 링크 계층에 대해, 차량 통신 인터페이스와 진단 장비의 요구사항을 정한다.[@iso-13400-3-2016][@iso-13400-3-obp-2016] TI 백서에 따르면 일부 차량은 OBD(On-Board Diagnostics) 스캔 도구를 잇는 데 100BASE-TX를 써 왔다.[@ti-szzy009-2018]

## 100BASE-T1과의 차이

TI 백서에 따르면 100BASE-TX는 꼬임쌍선이 두 가닥 필요하고 CISPR 25 Class 5 방사 방출 한도를 맞추지 못해 차량 안에서는 널리 쓰이지 못했다. 차량에 이더넷이 널리 쓰인 것은 비차폐 꼬임쌍선 한 쌍으로 100 Mbit/s를 보내는 [[100base-t1|100BASE-T1]]이 나온 뒤다.[@ti-szzy009-2018]

![[diagrams/ethernet-phy-pair-comparison.svg]]
