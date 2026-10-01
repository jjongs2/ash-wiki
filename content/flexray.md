---
title: FlexRay
tags:
  - network
verified: 2026-09-29
---

**FlexRay**는 결정적(deterministic)이고 사이클 기반인 메시지 전송 서비스를 제공하는 차량용 통신 시스템이다. ISO 17458 시리즈는 FlexRay의 사용 사례, 통신 프로토콜, 물리 계층 요구사항을 정한다.[@iso-17458-1-obp-2013] FlexRay의 전기 물리 계층은 차량 ECU를 잇는 시간 트리거 네트워크를 위한 것으로, 최대 10 Mbit/s로 통신한다.[@iso-17458-4-obp-2013] NXP 앱노트에 따르면 FlexRay는 FlexRay 컨소시엄이 개발했다.[@nxp-an12233-2021] BMW 그룹 필자들의 SAE 논문에 따르면 BMW 그룹은 FlexRay를 양산에 처음 도입한 자동차 제조사이고, 2006년 9월 새 BMW X5의 섀시 도메인에 처음 적용해 양산을 시작했다.[@sae-2006-21-0039-2006]

FlexRay의 통신 사이클에서 정적 세그먼트는 정적 슬롯으로 나뉘어 프레임을 동기적으로 보내고, 동적 세그먼트는 미니슬롯으로 나뉘어 우선순위가 있는 이벤트 구동 전송을 지원한다.[@iso-17458-1-obp-2013] 토폴로지는 [[vehicle-bus#토폴로지|차량 버스]]에서 다룬다.

## 통신 사이클

FlexRay는 통신 사이클을 주기적으로 되풀이한다. 사이클은 정적 세그먼트, 선택 사항인 동적 세그먼트와 심볼 윈도, 네트워크 idle 시간으로 이뤄진다.[@iso-17458-1-obp-2013] 정적 슬롯마다 그 슬롯을 쓸 노드가 배정된다.[@iso-17458-2-obp-2013] NXP 앱노트에 따르면 FlexRay의 정적 세그먼트는 버스 접근에 TDMA(Time Division Multiple Access)를 쓰고, 동적 세그먼트는 FTDMA(Flexible TDMA)를 쓴다.[@nxp-an12233-2021] TDMA는 [[bus-access-method#시분할|버스 접근 방식]]에서 다룬다.

![[diagrams/flexray-communication-cycle.svg]]

FlexRay는 동기 전송에서 프레임 지연과 지터를 보장한다. 정적 세그먼트에서 슬롯을 배정받은 노드는 보낼 데이터가 없어도 null 프레임을 보낸다.[@iso-17458-2-obp-2013]

## 노드

**호스트**는 ECU에서 응용 소프트웨어가 실행되는 부분이고, CHI(Controller Host Interface)로 프로토콜 엔진과 나뉜다. **통신 컨트롤러**(CC, Communication Controller)는 노드 안에서 FlexRay 프로토콜을 구현하는 전자 부품이다. **버스 드라이버**(BD, Bus Driver)는 통신 컨트롤러와 배선 사이의 물리 인터페이스로, FlexRay 노드에 반드시 있는 구성 요소다.[@iso-17458-1-obp-2013]

**버스 가디언**(BG, Bus Guardian)은 노드가 미리 정해진 타이밍 슬롯 안에서만 송신하게 하는 구성 요소다.[@iso-17458-4-obp-2013] 버스 가디언은 선택 사항이다.[@ti-spnu499c-2018][@freescale-netwrkfrway-2005]

![[diagrams/flexray-node-structure.svg]]

## 채널

FlexRay 통신 컨트롤러 하나는 두 채널(채널 A, 채널 B)로 데이터 프레임을 서로 독립적으로 보낼 수 있다.[@iso-17458-1-obp-2013] 클러스터는 단일 채널이나 이중 채널로 구성해 고장 허용 수준을 달리할 수 있다.[@iso-17458-2-obp-2013] Freescale 브로셔에 따르면 FlexRay의 이중 채널 구조는 시스템 전체에 중복성을 주어, brake-by-wire 같은 안전 시스템의 신뢰성 요구를 맞춘다.[@freescale-brinvehiclenet-2006]

FlexRay 버스는 두 선 사이에 [[differential-signaling|차동 전압]]을 걸어 신호를 보낸다. 버스 드라이버의 두 핀 BP(Bus Plus)와 BM(Bus Minus) 사이의 차동 전압 $u_\mathrm{BP} - u_\mathrm{BM}$이 버스 상태(idle, Data_0, Data_1)를 나타낸다.[@iso-17458-4-obp-2013]

## 시간

FlexRay는 모든 노드에 공통 시간 기준을 제공하고, 사이클의 시간 분할은 분산 클록에 기반한다.[@iso-17458-1-obp-2013]

**microtick**은 노드의 발진기 클록에서 나온 노드별 시간 단위다. **macrotick**은 FlexRay 네트워크 전체가 함께 쓰는 시간 단위이고, 정수 개의 microtick으로 이뤄진다.[@nxp-an12233-2021][@ti-spnu499c-2018] 노드들은 sync 프레임의 도착 시각을 재어 클록을 맞춘다.[@iso-17458-2-obp-2013][@ti-spnu499c-2018]

## 프레임

FlexRay 프레임은 헤더, 페이로드, 트레일러 세그먼트로 이뤄진다. 헤더에는 11비트 프레임 ID, 7비트 페이로드 길이, 11비트 헤더 [[cyclic-redundancy-check|CRC]]가 있다. 페이로드 길이 필드는 페이로드를 2바이트 워드 수로 나타낸다. 프레임 CRC는 24비트다.[@iso-17458-2-obp-2013] NXP 앱노트에 따르면 헤더는 5바이트로, 한 비트짜리 indicator 다섯 개와 6비트 사이클 카운트도 담는다. 트레일러는 헤더와 페이로드 전체에 대해 계산한 이 프레임 CRC다.[@nxp-an12233-2021] 페이로드는 0\~254바이트다.[@nxp-an12233-2021][@renesas-r01an7076-2024]

![[diagrams/flexray-frame-format.svg]]

송신 프레임의 ID는 그 프레임을 보내는 슬롯의 번호다.[@iso-17458-2-obp-2013]

## CAN과의 차이

FlexRay가 정적 슬롯마다 그 슬롯을 쓸 노드를 배정하는 것과 달리[@iso-17458-2-obp-2013], [[can|CAN]]의 버스 접근은 이벤트 구동이다.[@ti-sloa101b-2016][@nxp-can-101-2021] CAN의 버스 접근은 [[bus-access-method#경쟁 방식|버스 접근 방식]]에서 다룬다.
