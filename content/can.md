---
title: CAN
tags:
  - network/can
aliases:
  - Controller Area Network
verified: 2026-09-25
---

## 정의

CAN(Controller Area Network)은 도로 차량의 ECU(Electronic Control Unit) 사이에서 디지털 정보를 주고받는 직렬 통신 프로토콜이다.[@iso-11898-1993] Bosch 소속 연구진이 1986년 SAE(Society of Automotive Engineers) 국제 회의에서 발표했고[@sae-860391-1986], 1993년에 ISO 11898로 국제 표준이 됐다.[@iso-11898-1993] 지금은 ISO 11898 시리즈가 CAN의 데이터 링크 계층과 물리 계층을 규정한다.[@iso-11898-1-obp-2024]

CAN은 멀티마스터 방식이라, 버스가 비어 있으면 어느 노드든 프레임을 보내기 시작할 수 있다.[@iso-11898-1-obp-2024] 식별자는 수신자를 가리키지 않고 데이터의 뜻을 나타내며, 버스를 차지할 때의 우선순위도 정한다.[@bosch-can-2-0-1991] 프레임은 모든 노드가 받고, 그 데이터를 쓸지는 노드마다 메시지 필터링으로 정한다.[@bosch-can-2-0-1991]

## 구조·동작

### 표준의 분담

[[iso-11898-1]]은 데이터 링크 계층과 물리 부호화 부계층(PCS, Physical Coding Sublayer)을[@iso-11898-1-obp-2024], [[iso-11898-2]]는 고속 물리 매체 접속(PMA, Physical Medium Attachment) 부계층을[@iso-11898-2-obp-2026], [[iso-11898-3]]은 40 kbit/s 초과 125 kbit/s 이하의 저속 내결함성 매체 의존 인터페이스를 규정한다.[@iso-11898-3-2006]

ISO 11898-1은 CAN 프로토콜 컨트롤러를, ISO 11898-2는 CAN 트랜시버를 구현하는 칩 설계자를 위한 표준이다.[@iso-11898-1-obp-2024]

### 노드 구성

[[can-controller|CAN 컨트롤러]]는 호스트 CPU(Central Processing Unit)에 붙어 ISO 11898-1에 따라 통신하고, 버스에 연결하려면 트랜시버가 따로 필요하다.[@bosch-m-can-2023] [[can-transceiver|CAN 트랜시버]]는 컨트롤러의 디지털 신호를 버스의 차동 신호로 바꾸고, 버스의 차동 전압을 다시 논리 레벨로 되돌린다.[@microchip-mcp2561-2fd-2014]

고속 CAN의 버스 인터페이스는 CAN_H와 CAN_L 두 선이다.[@iso-11898-2-obp-2026] 버스 상태는 dominant(논리 0)와 recessive(논리 1) 둘이고, 두 값을 동시에 내면 버스는 dominant가 된다.[@iso-11898-2-obp-2026] 전기적 동작은 [[can-physical-layer|CAN 물리 계층]]에서 다룬다.

### 중재

여러 노드가 한꺼번에 송신에 나서면 식별자를 한 비트씩 겨루는 중재가 일어나며, 식별자는 최상위 비트부터 나간다.[@bosch-can-2-0-1991] 자기가 낸 recessive 비트 자리에서 dominant를 읽은 노드는 거기서 물러나 수신 노드가 된다.[@bosch-can-2-0-1991] 이긴 프레임은 정보도 시간도 잃지 않고 전송된다.[@bosch-can-2-0-1991]

### 프레임

Classical CAN 프레임의 식별자는 기본 포맷에서 11비트, 확장 포맷에서 29비트이고, 데이터는 최대 8바이트다.[@iso-11898-1-obp-2024] CAN FD(CAN with Flexible Data-Rate) 프레임의 데이터 필드는 0~64바이트다.[@bosch-can-fd-1-0-2012]

## 비교·한계

Classical CAN의 비트율은 최대 1 Mbit/s다.[@bosch-can-2-0-1991] CAN FD는 데이터 구간의 비트율을 중재 구간보다 높게 둘 수 있어, 1 Mbit/s를 넘는 데이터율을 낸다.[@bosch-can-fd-1-0-2012] ISO 11898-1:2024는 여기에 데이터가 최대 2048바이트인 CAN XL 프레임 포맷을 더했다.[@iso-11898-1-obp-2024]

ISO 11898-1:2024는 classical 프레임만 지원하는 구현을 둘로 나눈다.[@iso-11898-1-obp-2024] CAN FD 프레임을 용인하지 않는 구현과, 주고받지는 못해도 방해하지 않는 FD tolerant 구현이다.[@iso-11898-1-obp-2024] 용인하지 않는 구현도 classical 프레임만 쓰는 동안에는 CAN FD나 CAN XL 노드와 통신할 수 있다.[@iso-11898-1-obp-2024]

버스를 길게 하려면 비트율을 낮춰야 한다.[@ti-tcan1042-q1-2021]

> [!note]
> Bosch의 CAN 2.0 규격은 버스 매체를 정하지 않는다.[@bosch-can-2-0-1991] 단선과 접지, 차동 두 선, 광섬유 등을 예로 든다.[@bosch-can-2-0-1991]
