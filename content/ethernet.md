---
title: 이더넷
tags:
  - network/ethernet
verified: 2026-09-29
---

**이더넷**(Ethernet)은 [[ieee-802-3|IEEE 802.3]]이 정하는 유선 LAN 기술이다. IEEE 802.3-2022는 공통 MAC(Medium Access Control) 명세와, 1 Mbit/s부터 400 Gbit/s까지의 속도로 동축 케이블, 꼬임쌍선, 광섬유, 백플레인 위에서 동작하는 물리 계층을 정한다.[@ieee-802-3-2022] 이더넷에서 데이터는 [[ethernet-frame|이더넷 프레임]]에 담기고, 프레임의 목적지 주소 필드가 받을 스테이션의 [[mac-address|MAC 주소]]를 가리킨다.[@st-rm0008-2021][@microchip-enc28j60-2012]

## MAC과 물리 계층

이더넷 노드는 MAC과 PHY로 나뉜다.[@microchip-enc28j60-2012][@renesas-r01an6628-2025] MAC은 송수신 데이터를 프레임으로 캡슐화하고(캡슐화에는 프레임 경계 구분과 동기가 든다), 주소를 처리하며, 오류를 검출한다.[@st-rm0008-2021][@renesas-r01an6628-2025] ENC28J60(Microchip의 단독형 이더넷 컨트롤러)의 PHY 모듈은 꼬임쌍선 인터페이스의 아날로그 데이터를 부호화하고 복호화한다.[@microchip-enc28j60-2012] MAC과 PHY 사이는 [[mii|MII]] 같은 매체 독립 인터페이스로 잇는다.[@ieee-802-3-2022][@st-rm0008-2021]

차량용 [[100base-t1|100BASE-T1]] PHY는 한 쌍의 비차폐 꼬임쌍선으로 100 Mbit/s를 송수신한다.[@nxp-tja1101b-2021][@ti-dp83tc811r-q1-2018] IEEE 802.3bw-2015는 단일 평형 꼬임쌍선 위에서 점대점 전이중 100 Mbit/s로 동작하는 100BASE-T1을 넣었다.[@ieee-802-3bw-2015]

## 이더넷 MAC 컨트롤러

STMicroelectronics의 STM32F107xx와 Renesas RA MCU는 이더넷 MAC을 내장한다.[@st-rm0008-2021][@renesas-r01an6628-2025] 수신 쪽에서 이더넷 MAC 컨트롤러는 목적지 주소 필터로 받을 프레임을 고르고, FCS(Frame Check Sequence)를 검사해 설정에 따라 오류 프레임을 버린다. 송신 쪽에서는 목적지 주소, 출발지 주소, [[ethernet-frame#길이/타입|길이/타입]] 필드, 데이터를 소프트웨어에게서 받아 프레임을 조립하며, FCS를 계산해 덧붙일지는 설정으로 정한다.[@st-rm0008-2021][@microchip-enc28j60-2012]

IEEE 802.3-2022는 MAC 부계층이 목적지 주소 필드에 자기 개별 주소나 브로드캐스트 주소, 또는 상위 계층이 활성화한 그룹 주소가 든 프레임을 알아보고 받도록 정한다. MAC 부계층은 promiscuous 수신 모드를 둘 수 있고, 이 모드에서는 목적지 주소와 상관없이 유효한 프레임을 모두 받는다. 이 표준은 관리 속성 aPromiscuousStatus를 참으로 두면 이 모드가 켜지게 하고, 이 모드 때문에만 받은 프레임도 오류가 없으면 정상 수신으로, 오류가 있으면 해당 오류 카운터로 세도록 정한다.[@ieee-802-3-2022]

MCU에 내장된 이더넷 MAC은 전용 [[direct-memory-access|DMA]]를 둔다. STM32F107xx와 Renesas RA의 이더넷 MAC은 MCU 밖의 PHY와 MII나 RMII(Reduced MII)로 이어진다.[@st-rm0008-2021][@renesas-r01an6628-2025]

![[diagrams/ethernet-mcu-mac-phy.svg]]

## 반이중과 전이중

IEEE 802.3-1985는 둘 이상의 스테이션이 공통 버스 매체 하나를 나눠 쓰는 CSMA/CD(Carrier Sense Multiple Access with Collision Detection) 접근 방식을 정했다.[@ieee-802-3-1985] IEEE 802.3-2022는 공유 매체에서의 반이중 동작과 함께 전이중 동작도 규정한다. 이 표준은 CSMA/CD MAC을 802.3 MAC과 같은 말로 쓰며, 이 이름은 반이중 모드와 전이중 모드의 DTE(Data Terminal Equipment)에 모두 쓰인다.[@ieee-802-3-2022] Microchip AN1120에 따르면 초기 이더넷 네트워크는 공유 매체로 구현되어 CSMA/CD가 필요했다.[@microchip-an1120-2008] CSMA/CD는 [[bus-access-method#경쟁 방식|버스 접근 방식]]에서 다룬다.

전이중 동작에서는 링크에 두 스테이션만 이어져 송신과 수신을 동시에 하고, 충돌이 생기지 않으므로 CSMA/CD를 쓰지 않는다.[@st-rm0008-2021][@microchip-enc28j60-2012] Microchip AN1120에 따르면 이 앱노트가 나온 2008년 무렵 이더넷 네트워크는 대부분 점대점이나 [[ethernet-switch|이더넷 스위치]]를 가운데 둔 스타 토폴로지로 구성되어, 각 노드가 전이중으로 동작할 수 있었다.[@microchip-an1120-2008]

![[diagrams/ethernet-shared-bus-switched-star.svg]]

IEEE 802.3-2022는 두 MDI(Medium Dependent Interface)만을 잇는 점대점 전이중 매체 연결을 **링크 세그먼트**라 정의한다. 이 표준은 전이중 10 Mbit/s, 100 Mbit/s, 1000 Mbit/s 네트워크의 물리적 크기가 반이중 CSMA/CD 네트워크와 달리 왕복 충돌 전파 지연으로 제한되지 않고, DTE 사이의 최대 링크 길이가 케이블이나 링크의 신호 전송 특성으로만 제한된다고 정한다.[@ieee-802-3-2022]

## 잃은 프레임

이 표준은 프레임에서 계산한 [[cyclic-redundancy-check|CRC]]가 받은 FCS 값과 다른 프레임을 **무효 MAC 프레임**(invalid MAC frame)으로 정하고, 그 내용을 LLC(Logical Link Control)나 MAC Control 부계층에 넘기지 않도록 정한다. 무효 MAC 프레임은 무시하거나 버리거나 따로 쓸 수 있다. 또 이 표준은 MAC이 오류 일부를 클라이언트에게 알리기만 하고 오류 복구는 하지 않도록 정하며, 그 복구는 MAC 클라이언트나 상위 계층이 맡을 수 있다.[@ieee-802-3-2022]

Microchip AN1120에 따르면 과도한 충돌로 프레임이 버려지면 응용 소프트웨어가 이를 알아차리고 필요하면 다시 보내야 한다.[@microchip-an1120-2008] 상위 계층에서는 RFC 9293이 [[tcp|TCP]]가 오류나 혼잡으로 잃은 세그먼트를 재전송해 모든 세그먼트의 전달을 보장하도록 정한다.[@ietf-rfc-9293-2022]

## 역사

IEEE SA에 따르면 이더넷은 1973년 Xerox PARC(Palo Alto Research Center)에서 Robert Metcalfe가 발명했다. IEEE 802 LAN 표준 위원회는 1983년 6월 이더넷을 IEEE 표준으로 채택했다.[@ieee-ethernet-50th-anniversary-2023] IEEE Standards Board는 1983년 이 표준을 승인했고, IEEE는 1985년 이를 IEEE 802.3-1985로 펴냈다.[@ieee-802-3-2022]

Xerox PARC의 Metcalfe와 Boggs는 1976년 논문에서 동축 케이블 약 1 km에 노드 100개를 이어 운용 중인 이더넷의 경험을 바탕으로 그 설계 원칙과 구현을 발표했다. 두 사람은 중앙 제어가 없는 수동 방송 매체(Ether)를 여러 스테이션이 나눠 쓰게 하고, 송신하려는 스테이션들이 통계적 중재로 매체 접근을 조정하며, 받는 스테이션이 패킷의 주소를 보고 자기에게 온 패킷을 고르게 했다. 그들은 Aloha Network의 패킷 충돌과 재전송 착상에서 설계를 시작했고, 이더넷이라는 이름은 전자기파가 지난다고 한때 여겨졌던 luminiferous ether에서 따왔다. 실험용 이더넷의 변수로는 케이블 1 km, 3 Mbit/s, 스테이션 256개를 골랐다.[@metcalfe-ethernet-1976]

## CAN과의 차이

[[can|CAN]]은 여러 노드가 동시에 송신을 시작하면 식별자로 비트 단위 중재를 해, 그 가운데 한 메시지를 정보도 시간도 잃지 않고 보낸다.[@bosch-can-2-0-1991] 반이중 이더넷에서는 동시에 송신하면 충돌이 생기고, 충돌한 스테이션은 [[bus-access-method#경쟁 방식|백오프]]만큼 기다렸다가 다시 송신한다.[@st-rm0008-2021][@microchip-enc28j60-2012] CAN에서는 수신 노드가 [[can-acknowledgement|ACK]] 슬롯에 [[dominant-and-recessive|dominant]] 비트를 보내 프레임을 제대로 받았음을 알린다.[@bosch-can-2-0-1991]
