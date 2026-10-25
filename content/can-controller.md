---
title: CAN 컨트롤러
tags:
  - network/can
verified: 2026-09-27
---

**CAN 컨트롤러**는 [[can|CAN]]의 데이터 링크 계층([[iso-11898-1|ISO 11898-1]])을 하드웨어로 구현하는 장치다.[@ti-tcan4550-2020] MCU 안에 주변장치로 들어가기도 하고[@st-rm0008-2021], SPI(Serial Peripheral Interface)로 호스트 MCU에 붙는 독립형 칩으로 나오기도 한다.[@microchip-mcp2515-2019]

컨트롤러는 버스에 직접 닿지 않고, [[can-transceiver|CAN 트랜시버]]를 거쳐 CAN_H와 CAN_L 버스에 연결된다.[@st-rm0008-2021]

## 노드 상태

ISO 11898-1:2024와 Bosch CAN FD 1.0은 노드가 integrating, idle, receiver, transmitter 네 상태 가운데 하나에 있다고 정한다.[@iso-11898-1-obp-2024][@bosch-can-fd-1-0-2012]

ISO 11898-1:2024는 **idle condition**을 샘플링한 [[dominant-and-recessive|recessive]] 비트가 11개 이어지는 것을 찾는 것으로 정의한다.[@iso-11898-1-obp-2024]

| 상태        | 뜻                                                                                                                                                                                                                                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| integrating | 프로토콜 동작을 시작한 뒤나 [[can-fault-confinement\|bus-off]]에서 복구하는 동안 idle condition을 기다리는 상태로, Bosch CAN FD 1.0에서는 그 뒤 idle로 넘어간다. ISO 11898-1:2024는 [[can-xl#오류 신호\|프로토콜 예외 이벤트]] 뒤에도 이 상태를 둔다.[@iso-11898-1-obp-2024][@bosch-can-fd-1-0-2012] |
| idle        | Bosch CAN FD 1.0은 SOF(Start of Frame)를 받을 준비가 되어 있고, 그 뒤 receiver나 transmitter로 넘어가는 상태로 정한다.[@bosch-can-fd-1-0-2012]                                                                                                                                                       |
| receiver    | 버스가 idle이 아닌 동안 송신도 integrating도 하지 않는 노드를 **수신 노드**라 한다.[@iso-11898-1-obp-2024]                                                                                                                                                                                           |
| transmitter | [[can-frame\|데이터 프레임]]이나 [[remote-frame\|리모트 프레임]]을 보내는 노드를 **송신 노드**라 한다. 노드는 버스가 다시 idle이 되거나 [[can-arbitration\|중재]]에서 질 때까지 송신 노드로 남는다.[@iso-11898-1-obp-2024][@bosch-can-2-0-1991]                                                      |

![[diagrams/can-node-states.svg]]

## 송신

애플리케이션은 빈 송신 버퍼에 [[can-identifier|식별자]], [[data-length-code|DLC]], 데이터를 넣고 송신을 요청한다.[@st-rm0008-2021] 컨트롤러는 버퍼 내용으로 프레임을 부호화하고, 비트열로 직렬화해 내보낸다.[@microchip-mcp251xxfd-frm-2018] 이때 같은 값의 비트가 5개 이어지면 반대 값의 비트를 하나 자동으로 넣는다([[can-bit-stuffing|비트 스터핑]]).[@bosch-can-2-0-1991]

![[diagrams/can-bit-stuffing.svg]]

Bosch CAN FD 1.0은 공유 메모리에서 꺼내 보내는 메시지의 데이터 일관성을 두 방법 가운데 하나 이상으로 지키게 정한다. 하나는 송신을 시작하기 전에 보낼 메시지 전체를 임시 버퍼에 채워 두는 것이다. 다른 하나는 메시지를 넘기는 동안 데이터 오류(RAM 워드의 패리티 오류, 제때 오지 않은 데이터, 송신 중에 일부만 고쳐진 데이터 등)를 검사하는 것이다. 데이터 오류를 찾으면 송신을 시작하지 않고, 이미 시작했으면 노드를 Bus Monitoring 모드로 바꿔 수신 노드가 유효한 메시지를 보지 못하게 한다.[@bosch-can-fd-1-0-2012]

컨트롤러의 송신 출력은 트랜시버의 TXD 핀에, 수신 입력은 트랜시버의 RXD 핀에 연결된다. 논리 비트와 버스 차동 전압 사이의 변환은 트랜시버가 맡는다.[@microchip-mcp2561-2fd-2014]

![[diagrams/can-node-bus.svg]]

송신 노드는 내보낸 비트를 버스에서 되읽어 대조한다. [[can-arbitration|중재]] 구간에서 자기가 낸 recessive 비트가 dominant로 읽히면 즉시 송신을 그만두고 수신 노드로 넘어간다.[@bosch-can-2-0-1991]

![[diagrams/can-arbitration.svg]]

## 자동 재전송

Bosch CAN 2.0 규격은 오류로 깨진 메시지를 자동으로, 우선순위에 따라 다시 보내게 한다. 재전송도 다른 메시지와 버스를 다투어야 하므로, 이 규격은 재전송을 버스가 idle이 되는 즉시 시작하도록 정한다.[@bosch-can-2-0-1991] Bosch CAN FD 1.0은 재전송 횟수를 설정으로 제한할 수 있게 하고, 기본값은 제한 없음으로 둔다.[@bosch-can-fd-1-0-2012] CAN 컨트롤러는 기본 설정에서 중재에서 졌거나 오류로 깨진 프레임을 자동으로 다시 보내고, 이 동작을 설정으로 끌 수 있다.[@microchip-mcp2515-2019][@bosch-m-can-2023]

## 수신

컨트롤러는 버스 입력의 에지에 [[can-bit-timing|비트 타이밍]]을 맞춘다. SOF(Start of Frame)의 에지에서 [[can-synchronization#하드 동기화|하드 동기화]]를, 그 뒤의 에지에서 [[can-synchronization#재동기화|재동기화]]를 한다.[@microchip-mcp2515-2019] 받은 비트열에서는 스터프 비트를 걷어낸다.[@bosch-can-2-0-1991]

컨트롤러는 버스의 모든 메시지에서 비트, 스터프, [[can-crc|CRC]], 형식, [[can-acknowledgement|ACK]] 오류를 검사한다.[@microchip-mcp251xxfd-frm-2018] 메시지를 제대로 받은 수신 노드는 ACK 슬롯에서 dominant 비트를 보내 송신 노드에 알린다.[@bosch-can-2-0-1991]

MCP2515는 오류 검사를 마친 메시지의 식별자를 [[acceptance-filter|수용 마스크와 필터]]에 비교한다. 일치한 메시지만 수신 버퍼에 넣고, 인터럽트 핀으로 MCU에 알린다.[@microchip-mcp2515-2019]

## 설정과 오류 상태

비트율과 [[can-bit-timing#샘플 포인트|샘플 포인트]]는 컨트롤러의 설정 레지스터로 정한다. 컨트롤러는 [[can-fault-confinement#오류 계수기|송신 오류 계수기]](TEC, Transmit Error Counter)와 수신 오류 계수기(REC, Receive Error Counter)를 관리하고, 계수기 값에 따라 error active, error passive, bus-off 상태를 오간다.[@microchip-mcp2515-2019]

## 선택 동작 모드

Bosch CAN FD 1.0은 노드가 선택해 둘 수 있는 동작 모드 두 가지를 정한다.[@bosch-can-fd-1-0-2012]

- **Bus Monitoring 모드**: 유효한 데이터 프레임과 리모트 프레임을 받지만, 버스에는 recessive 비트만 내고 송신을 시작하지 못한다. ACK 슬롯, [[can-overload-frame#오버로드 플래그|오버로드 플래그]], active 오류 플래그처럼 dominant를 내야 할 비트는 안에서 돌려, 버스가 recessive로 남아도 컨트롤러는 그 dominant를 본다.
- **Restricted Operation 모드**: 데이터 프레임과 리모트 프레임을 주고받고 유효한 프레임에 ACK를 보내지만, active [[can-error-frame|오류 프레임]]이나 [[can-overload-frame|오버로드 프레임]]은 내지 않는다. 오류 조건이나 오버로드 조건이 생기면 dominant를 내지 않고 버스 idle을 기다려 다시 동기를 맞추며, 오류 계수기는 올리지 않는다.[@bosch-can-fd-1-0-2012]

## 슬립과 웨이크업

Bosch CAN 2.0 규격은 CAN 장치가 전력 소비를 줄이려고 슬립 모드에 들어갈 수 있게 한다. 슬립 모드에서는 내부 동작이 없고 버스 드라이버가 끊긴다. 슬립 모드는 버스 활동이나 시스템 내부 조건에 따른 웨이크업으로 끝난다. 깨어난 장치는 발진기가 안정되기를 기다린 뒤, recessive 11비트가 이어지는 것을 확인해 버스 활동에 동기를 맞추고 나서야 버스 드라이버를 버스에 다시 붙인다.[@bosch-can-2-0-1991]

## 제품 예

MCP2515는 SPI로 MCU와 통신하는 독립형 컨트롤러다. [[can-frame#기본 포맷과 확장 포맷|CAN 2.0B]]를 1 Mbit/s까지 지원하고, 송신 버퍼 3개, 수신 버퍼 2개, 수용 마스크 2개, 수용 필터 6개를 둔다.[@microchip-mcp2515-2019] Bosch M_CAN은 [[can-fd|CAN FD]]를 64바이트 데이터까지 지원하는 컨트롤러 IP(Intellectual Property) 모듈이다.[@bosch-m-can-2023]

## CAN FD 컨트롤러와의 차이

ISO 11898-1:2024는 CAN FD 프레임을 주고받지는 못해도 방해하지 않는 classic 구현(FD tolerant)도 규정하며, classic 구현의 통신 범위는 [[can-fd#호환성|CAN FD]]에서 다룬다.[@iso-11898-1-obp-2024] CAN FD 노드는 classical CAN 프레임도 주고받을 수 있다.[@bosch-can-fd-1-0-2012]
