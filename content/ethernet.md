---
title: 이더넷
tags:
  - network/ethernet
verified: 2026-09-29
---

**이더넷**(Ethernet)은 [[ieee-802-3|IEEE 802.3]]이 정하는 유선 LAN(Local Area Network) 기술이다. IEEE 802.3은 공통 MAC(Medium Access Control) 명세와, 1 Mbit/s부터 400 Gbit/s까지의 속도로 동축 케이블, 꼬임쌍선, 광섬유, 백플레인 위에서 동작하는 물리 계층을 정한다.[@ieee-802-3-2022] 이더넷에서 데이터는 [[ethernet-frame|이더넷 프레임]]에 담기고, 프레임의 목적지 주소 필드가 받을 스테이션의 [[mac-address|MAC 주소]]를 가리킨다.[@st-rm0008-2021][@microchip-enc28j60-2012]

## MAC과 물리 계층

이더넷 노드는 MAC과 PHY로 나뉜다.[@microchip-enc28j60-2012][@renesas-r01an6628-2025] MAC은 송수신 데이터를 프레임으로 캡슐화하고(프레임 경계 구분과 동기), 주소를 처리하며, 오류를 검출한다.[@st-rm0008-2021][@renesas-r01an6628-2025] ENC28J60의 PHY 모듈은 꼬임쌍선 인터페이스의 아날로그 데이터를 부호화하고 복호화한다.[@microchip-enc28j60-2012] MAC과 PHY 사이는 MII 같은 매체 독립 인터페이스로 잇는다.[@ieee-802-3-2022][@st-rm0008-2021]

차량용 100BASE-T1 PHY는 한 쌍의 비차폐 꼬임선으로 100 Mbit/s를 송수신한다.[@nxp-tja1101b-2021][@ti-dp83tc811r-q1-2018] IEEE 802.3bw-2015는 단일 평형 꼬임쌍선 위에서 점대점 전이중 100 Mbit/s로 동작하는 100BASE-T1을 넣었다.[@ieee-802-3bw-2015]

## 이더넷 MAC 컨트롤러

STM32F107xx와 Renesas RA MCU는 이더넷 MAC을 내장한다.[@st-rm0008-2021][@renesas-r01an6628-2025] 수신 쪽에서 이더넷 MAC 컨트롤러는 목적지 주소 필터로 받을 프레임을 고르고, FCS(Frame Check Sequence)를 검사해 설정에 따라 오류 프레임을 버린다. 송신 쪽에서는 목적지 주소, 출발지 주소, 길이/타입 필드, 데이터를 소프트웨어에게서 받아 프레임을 조립하며, FCS를 계산해 덧붙일지는 설정으로 정한다.[@st-rm0008-2021][@microchip-enc28j60-2012]

MCU에 내장된 이더넷 MAC은 전용 DMA(Direct Memory Access)를 둔다. STM32F107xx와 Renesas RA의 이더넷 MAC은 MCU 밖의 PHY와 MII나 RMII(Reduced MII)로 이어진다.[@st-rm0008-2021][@renesas-r01an6628-2025]

![[diagrams/ethernet-mcu-mac-phy.svg]]

## 반이중과 전이중

IEEE 802.3-1985는 둘 이상의 스테이션이 공통 버스 매체 하나를 나눠 쓰는 CSMA/CD(Carrier Sense Multiple Access with Collision Detection) 접근 방식을 정했다.[@ieee-802-3-1985] 현행판 IEEE 802.3-2022의 CSMA/CD MAC 프로토콜은 공유 매체에서의 반이중 동작과 함께 전이중 동작도 규정한다.[@ieee-802-3-2022] Microchip AN1120에 따르면 초기 이더넷 네트워크는 공유 매체로 구현되어 CSMA/CD가 필요했다.[@microchip-an1120-2008] CSMA/CD는 [[bus-access-method#경쟁 방식|버스 접근 방식]]에서 다룬다.

전이중 동작에서는 링크에 두 스테이션만 이어져 송신과 수신을 동시에 하고, 충돌이 생기지 않으므로 CSMA/CD를 쓰지 않는다.[@st-rm0008-2021][@microchip-enc28j60-2012] Microchip AN1120에 따르면 오늘날 이더넷 네트워크는 대부분 점대점이나 [[ethernet-switch|이더넷 스위치]]를 가운데 둔 스타 토폴로지로 구성되어, 각 노드가 전이중으로 동작할 수 있다.[@microchip-an1120-2008]

![[diagrams/ethernet-shared-bus-switched-star.svg]]

## 잃은 프레임

IEEE 802.3-2022는 프레임에서 계산한 [[cyclic-redundancy-check|CRC]]가 받은 FCS 값과 다른 프레임을 무효 MAC 프레임(invalid MAC frame)으로 정하고, 그 내용을 LLC(Logical Link Control)나 MAC Control 부계층에 넘기지 않도록 정한다. 무효 MAC 프레임은 무시하거나 버리거나 따로 쓸 수 있다. 또 이 표준에서 MAC은 오류 일부를 클라이언트에게 알릴 뿐 오류 복구를 하지 않으며, 오류 복구는 MAC 클라이언트나 상위 계층이 맡을 수 있다.[@ieee-802-3-2022]

Microchip AN1120에 따르면 과도한 충돌로 프레임이 버려지면 응용 소프트웨어가 이를 알아차리고 필요하면 다시 보내야 한다.[@microchip-an1120-2008] 상위 계층에서는 RFC 9293이 TCP가 오류나 혼잡으로 잃은 세그먼트를 재전송해 모든 세그먼트의 전달을 보장하도록 정한다.[@ietf-rfc-9293-2022]

## CAN과의 차이

[[can|CAN]]은 여러 노드가 동시에 송신을 시작하면 식별자로 비트 단위 중재를 해, 정보도 시간도 잃지 않고 한 메시지를 보낸다.[@bosch-can-2-0-1991] 반이중 이더넷에서는 동시에 송신하면 충돌이 생기고, 충돌한 스테이션은 백오프만큼 기다렸다가 다시 송신한다.[@st-rm0008-2021][@microchip-enc28j60-2012] CAN에서는 수신 노드가 [[can-acknowledgement|ACK]] 슬롯에 dominant 비트를 보내 프레임을 제대로 받았음을 알린다.[@bosch-can-2-0-1991]
