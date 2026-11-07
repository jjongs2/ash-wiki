---
title: CAN
tags:
  - network/can
  - network/vehicle-bus
aliases:
  - Controller Area Network
verified: 2026-09-27
---

**CAN**(Controller Area Network)은 분산 실시간 제어를 지원하는 [[serial-communication|직렬 통신]] 프로토콜이다.[@bosch-can-2-0-1991] Bosch 소속 연구진이 1986년 SAE 국제 회의에서 발표했고[@sae-860391-1986], 1993년에 ISO 11898로 국제 표준이 됐다.[@iso-11898-1993] CiA에 따르면 CAN은 1986년 2월의 이 발표로 태어났다.[@cia-can-history-2026] 지금은 ISO 11898 시리즈가 CAN의 데이터 링크 계층과 물리 계층을 규정한다.[@iso-11898-1-obp-2024]

CAN은 멀티마스터 방식이라, 버스가 비어 있으면 어느 노드든 프레임을 보내기 시작할 수 있다.[@iso-11898-1-obp-2024] [[can-identifier|식별자]]는 수신자를 가리키지 않고 데이터의 뜻을 나타내며, 버스를 차지할 때의 우선순위도 정한다. 프레임은 모든 노드가 받고, 그 데이터를 쓸지는 노드마다 [[acceptance-filter|메시지 필터링]]으로 정한다.[@bosch-can-2-0-1991]

## 표준의 분담

[[iso-11898-1|ISO 11898-1:2024]]는 데이터 링크 계층과 물리 부호화 부계층(PCS, Physical Coding Sublayer)을 규정하고, 데이터 링크 계층을 LLC(Logical Link Control)와 MAC(Medium Access Control) 두 부계층으로 나눈다.[@iso-11898-1-obp-2024] [[iso-11898-2|ISO 11898-2:2026]]은 고속 물리 매체 접속(PMA, Physical Medium Attachment) 부계층을 규정하고, CAN_H와 CAN_L로 이뤄진 전기적 인터페이스를 MDI(Medium Dependent Interface)로 정의한다.[@iso-11898-2-obp-2026] [[iso-11898-3|ISO 11898-3:2006]]은 [[serial-communication#비트율|비트율]] $R_\mathrm{b}$가 $40\,\mathrm{kbit/s} < R_\mathrm{b} \le 125\,\mathrm{kbit/s}$인 저속 내결함성 CAN의 MDI와 PMA를 규정한다.[@iso-11898-3-obp-2006]

![[diagrams/can-iso-11898-sublayers.svg]]

ISO 11898 시리즈는 칩 설계자를 위한 표준으로, [[can-controller|CAN 프로토콜 컨트롤러]]에는 ISO 11898-1:2024를, [[can-transceiver|CAN 트랜시버]]에는 ISO 11898-2:2026을 쓸 수 있다.[@iso-11898-1-obp-2024][@iso-11898-2-obp-2026]

> [!note]
> Bosch의 CAN 2.0 규격은 버스 매체를 정하지 않고, 단선과 접지, 차동 두 선, 광섬유 등을 예로 든다.[@bosch-can-2-0-1991]

## 노드 구성

CAN 컨트롤러는 호스트 CPU에 붙어 ISO 11898-1에 따라 통신하고, 버스에 연결하려면 트랜시버가 따로 필요하다.[@bosch-m-can-2023] CAN 컨트롤러는 STM32F103xx·STM32F105xx·STM32F107xx의 bxCAN(Basic Extended CAN)처럼 MCU에 주변장치로 들어가기도 하고[@st-rm0008-2021], MCP2515처럼 SPI(Serial Peripheral Interface)로 MCU에 붙는 단독 칩으로 나오기도 한다.[@microchip-mcp2515-2019] NXP에 따르면 CAN 컨트롤러는 MCU에 통합되는 경우가 많다.[@nxp-can-101-2021] CAN 트랜시버는 컨트롤러의 디지털 신호를 버스의 [[differential-signaling|차동 신호]]로 바꾸고, 버스의 차동 전압을 다시 논리 레벨로 되돌린다.[@microchip-mcp2561-2fd-2014] 버스 양 끝에는 120 Ω [[can-physical-layer#종단|종단 저항]]을 단다.[@microchip-an228-2002][@ti-tcan1042-q1-2021]

![[diagrams/can-node-bus.svg]]

Bosch CAN 2.0 규격은 버스에 잇는 노드 수에 이론적 한계를 두지 않고, 실제 수는 지연 시간과 버스의 전기적 부하가 제한한다고 정한다.[@bosch-can-2-0-1991]

버스 값은 [[dominant-and-recessive|dominant]]와 recessive 둘이고, 두 값을 동시에 보내면 버스 값은 dominant가 된다.[@bosch-can-2-0-1991] 전기적 동작은 [[can-physical-layer|CAN 물리 계층]]에서 다룬다.

## 중재

여러 노드가 한꺼번에 송신에 나서면 식별자를 최상위 비트부터 한 비트씩 겨루는 [[can-arbitration|중재]]가 일어나고, 이긴 프레임은 정보도 시간도 잃지 않고 전송된다.[@bosch-can-2-0-1991] 식별자 값이 작을수록 우선순위가 높아, 중재에서는 식별자 값이 가장 작은 프레임이 이긴다.[@bosch-m-can-2023][@st-rm0008-2021]

![[diagrams/can-arbitration.svg]]

노드는 버스가 비어 있을 때만 송신을 시작할 수 있다.[@bosch-can-2-0-1991] 중재에서 진 프레임은 기본 설정에서 CAN 컨트롤러가 자동으로 다시 송신한다.[@bosch-m-can-2023][@microchip-mcp2515-2019]

## 프레임

[[can-frame|Classical CAN 프레임]]의 식별자는 기본 포맷에서 11비트, 확장 포맷에서 29비트이고, 데이터는 최대 8바이트다.[@iso-11898-1-obp-2024] [[can-fd-frame|CAN FD 프레임]]의 데이터 필드는 0~64바이트다.[@bosch-can-fd-1-0-2012]

## 역사와 쓰임

CiA에 따르면 1980년대 초 Bosch의 엔지니어들은 기존 직렬 버스가 승용차의 요구를 채우지 못한다고 보았고, Uwe Kiencke가 1983년에 새 직렬 버스 개발을 시작했다. 자문으로 참여한 Wolfhard Lawrenz 교수가 'Controller Area Network'라는 이름을 붙였고, 1986년 발표 때의 이름은 'Automotive Serial Controller Area Network'였다.[@cia-can-history-2026]

첫 CAN 컨트롤러 칩은 Intel이 1987년 중반에 내놓은 82526이고, 곧이어 Philips Semiconductors가 82C200을 내놓았다. 두 칩은 수용 필터링과 프레임 처리가 달라, Intel의 FullCAN은 Philips의 BasicCAN보다 연결된 MCU의 CPU 부하를 덜었지만 받을 수 있는 프레임 수가 제한되었다. 2026년 9월 기준 CAN 컨트롤러는 두 방식을 섞어 구현하고, 그래서 BasicCAN과 FullCAN이라는 말은 쓰이지 않게 되었다.[@cia-can-history-2026]

Mercedes-Benz는 1991년부터 고급 승용차에 CAN을 썼고, 처음에는 엔진 관리 ECU들을 CAN으로 이었다.[@cia-can-history-2026]

CAN은 철도 차량, 항공기, 선박, 우주 같은 운송 시스템, 산업 기계 제어, 홈·빌딩 자동화, 건설·농업 장비 같은 이동 기계, 의료 기기와 실험실 자동화 등에 쓰이고, 해마다 CAN 노드가 20억 개 넘게 팔린다.[@cia-can-dll-generations-2026]

## CAN FD·CAN XL과의 차이

Bosch CAN 2.0 규격은 CAN의 속도가 시스템마다 다를 수 있지만 한 시스템 안에서는 비트율이 하나로 고정된다고 정한다. 이 규격은 자동차 전자 장치에서 엔진 제어 장치, 센서, 미끄럼 방지 시스템 등을 1 Mbit/s까지의 비트율로 CAN에 잇는 예를 든다.[@bosch-can-2-0-1991] [[can-fd|CAN FD]]는 데이터 구간의 비트율을 중재 구간보다 높게 둘 수 있어, 1 Mbit/s를 넘는 데이터율을 낸다.[@bosch-can-fd-1-0-2012] ISO 11898-1:2024는 여기에 데이터가 최대 2048바이트인 [[can-xl|CAN XL]] 프레임 포맷을 더했다.[@iso-11898-1-obp-2024]

이 표준은 classic 프레임만 지원하는 구현을 CAN FD 프레임을 용인하는 구현과 용인하지 않는 구현 둘로 나눈다.[@iso-11898-1-obp-2024] 두 구현의 통신 범위는 [[can-fd#호환성|CAN FD]]에서 다룬다.

CiA는 CAN 데이터 링크 계층을 CAN CC(CAN classic), CAN FD, CAN XL 세 세대로 나눈다.[@cia-can-dll-generations-2026] ISO 11898-1:2024는 CAN 기능의 일부에 바탕을 둔 responder 노드의 구현 옵션으로 [[can-fd-light|CAN FD light]]를 둔다.[@iso-11898-1-obp-2024]
