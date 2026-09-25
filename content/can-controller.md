---
title: CAN 컨트롤러
tags:
  - network/can
verified: 2026-09-25
---

## 정의

CAN 컨트롤러는 CAN(Controller Area Network)의 데이터 링크 계층([[iso-11898-1|ISO 11898-1]])을 하드웨어로 구현하는 장치다.[@ti-tcan4550-2020] MCU(Microcontroller Unit) 안에 주변장치로 들어가기도 하고[@st-rm0008-2021], SPI(Serial Peripheral Interface)로 호스트 MCU에 붙는 독립형 칩으로 나오기도 한다.[@microchip-mcp2515-2019]

컨트롤러는 버스에 직접 닿지 않고, [[can-transceiver|CAN 트랜시버]]를 거쳐 CAN_H와 CAN_L 버스에 연결된다.[@st-rm0008-2021]

## 구조·동작

### 송신

애플리케이션은 빈 송신 버퍼에 식별자, DLC(Data Length Code), 데이터를 넣고 송신을 요청한다.[@st-rm0008-2021] 컨트롤러는 버퍼 내용으로 프레임을 부호화하고, 비트열로 직렬화해 내보낸다.[@microchip-mcp251xxfd-frm-2018] 이때 같은 값의 비트가 5개 이어지면 반대 값의 비트를 하나 자동으로 넣는다(비트 스터핑).[@bosch-can-2-0-1991]

![[can-bit-stuffing.svg]]

컨트롤러의 송신 출력은 트랜시버의 TXD 핀에, 수신 입력은 트랜시버의 RXD 핀에 연결된다.[@microchip-mcp2561-2fd-2014]

![[can-node-bus.svg]]

송신 노드는 내보낸 비트를 버스에서 되읽어 대조한다.[@bosch-can-2-0-1991] 중재 구간에서 자기가 낸 recessive 비트가 dominant로 읽히면 즉시 송신을 그만두고 수신 쪽으로 넘어간다.[@bosch-can-2-0-1991] Bosch M_CAN은 중재에서 졌거나 오류로 깨진 프레임을 기본 설정에서 자동으로 다시 보낸다.[@bosch-m-can-2023]

![[can-arbitration.svg]]

### 수신

컨트롤러는 버스 입력의 에지에 비트 타이밍을 맞춘다.[@microchip-mcp2515-2019] SOF(Start of Frame)의 에지에서 hard synchronization을, 그 뒤의 에지에서 resynchronization을 한다.[@microchip-mcp2515-2019] 받은 비트열에서는 스터프 비트를 걷어낸다.[@bosch-can-2-0-1991]

컨트롤러는 버스의 모든 메시지에서 비트, 스터프, CRC(Cyclic Redundancy Check), 형식, ACK(Acknowledgement) 오류를 검사한다.[@microchip-mcp251xxfd-frm-2018] 메시지를 제대로 받은 수신 노드는 ACK 슬롯에서 dominant 비트를 보내 송신 노드에 알린다.[@bosch-can-2-0-1991]

MCP2515는 오류 검사를 마친 메시지의 식별자를 수용 마스크와 필터에 비교한다.[@microchip-mcp2515-2019] 일치한 메시지만 수신 버퍼에 넣고, 인터럽트 핀으로 MCU에 알린다.[@microchip-mcp2515-2019]

### 설정과 오류 상태

비트율과 샘플 포인트는 컨트롤러의 설정 레지스터로 정한다.[@microchip-mcp2515-2019] 컨트롤러는 송신 오류 계수기(TEC, Transmit Error Counter)와 수신 오류 계수기(REC, Receive Error Counter)를 관리하고, 계수기 값에 따라 error active, error passive, bus-off 상태를 오간다.[@microchip-mcp2515-2019]

### 제품 예

MCP2515는 SPI로 MCU와 통신하는 독립형 컨트롤러다.[@microchip-mcp2515-2019] CAN 2.0B를 1 Mbit/s까지 지원하고, 송신 버퍼 3개, 수신 버퍼 2개, 수용 마스크 2개, 수용 필터 6개를 둔다.[@microchip-mcp2515-2019] Bosch M_CAN은 CAN FD(CAN with Flexible Data-Rate)를 64바이트 데이터까지 지원하는 컨트롤러 IP(Intellectual Property) 모듈이다.[@bosch-m-can-2023]

## 비교·한계

CAN FD를 지원하지 않는 컨트롤러는 CAN FD 프레임을 받으면 오류 프레임을 낸다.[@microchip-mcp251xxfd-frm-2018] ISO 11898-1:2024는 이와 달리, CAN FD 프레임을 주고받지는 못해도 방해하지 않는 classical 구현(FD tolerant)도 규정한다.[@iso-11898-1-obp-2024] CAN FD 노드는 classical CAN 프레임도 주고받을 수 있다.[@bosch-can-fd-1-0-2012]

논리 비트와 버스 차동 전압 사이의 변환은 트랜시버가 맡는다.[@microchip-mcp2561-2fd-2014]
