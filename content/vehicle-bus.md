---
title: 차량 버스
tags:
  - network/vehicle-bus
verified: 2026-09-27
---

**버스**는 모든 노드가 양방향 전송이 되는 수동 링크로 닿는 네트워크 토폴로지다. [[can|CAN]]은 도로 차량의 ECU 사이에서 디지털 정보를 주고받는 [[serial-communication|직렬 통신]] 프로토콜이다.[@iso-11898-3-obp-2006] [[lin|LIN]]은 차량 ECU를 잇는 저비용 네트워크이고[@iso-17987-4-obp-2025], [[flexray|FlexRay]]는 차량 ECU를 잇는 time-triggered 네트워크다.[@iso-17458-4-obp-2013] 1993년 SAE 기술 논문 931808에 따르면 차량 내 네트워크는 제어기, 센서, 액추에이터가 정보를 나누는 매체다.[@sae-931808-1993]

## 매체

고속 CAN은 CAN_H와 CAN_L 두 선의 전압 차로 버스 상태를 나타낸다.[@iso-11898-2-obp-2026] 이 방식은 [[differential-signaling|차동 신호]]에서 다룬다. LIN은 접지를 기준으로 선 하나로 송수신하는 단선 매체를 쓴다.[@iso-17987-4-obp-2025] FlexRay의 전기 물리 계층은 두 선을 매체로 쓰고, 두 선 사이에 차동 전압을 걸어 버스에 신호를 보낸다.[@iso-17458-4-obp-2013]

[[cxpi|CXPI]]는 차량용 저속 단선 네트워크다.[@iso-20794-4-obp-2020] [[k-line|K-Line]] 진단 통신에서 클라이언트와 서버를 잇는 직렬 링크는 K-Line과 선택적인 L-Line으로 이뤄진다.[@iso-14230-2-obp-2016] Freescale 앱노트에 따르면 [[sae-j1850|J1850]]의 두 구현 가운데 VPW(Variable Pulse Width Modulation)는 단선 버스이고, PWM(Pulse Width Modulation)은 2선 버스다.[@freescale-an1731-2004]

[[most|MOST]]의 물리 계층으로는 150 Mbit/s 광 물리 계층[@iso-21806-8-obp-2020], 150 Mbit/s 동축 물리 계층[@iso-21806-10-obp-2021], 50 Mbit/s balanced media 물리 계층이 있다.[@iso-21806-12-obp-2021]

차량 안에서는 [[ieee-802-3|IEEE 802.3]] [[ethernet|이더넷]]도 쓰인다. [[ieee-802-1dg|IEEE 802.1DG]]-2025는 여러 장치를 [[ethernet-switch#리피터, 브리지, 라우터와의 차이|브리지]]로 묶은 차량 내 이더넷 네트워크를 위한 [[tsn#프로파일|TSN 프로파일]]을 정한다.[@ieee-802-1dg-2025]

## 토폴로지

[[iso-11898-1|ISO 11898-1:2024]]는 CAN 버스를 토폴로지를 가리지 않는 공유 매체로 정의한다.[@iso-11898-1-obp-2024] FlexRay는 점대점 연결, 선형 수동 버스, 수동 스타, 능동 스타 토폴로지를 지원한다.[@iso-17458-4-obp-2013] ISO 17458-1:2013은 FlexRay의 **클러스터**를 노드 여럿이 [[flexray#채널|통신 채널]]로 직접(버스 토폴로지), 능동 스타로(스타 토폴로지), 또는 둘을 섞어(하이브리드 토폴로지) 이어진 통신 시스템으로 정의하고, 클러스터끼리 [[gateway|게이트웨이]]로 이을 수 있다고 제시한다. **능동 스타**는 한 입력 포트의 버스 신호를 여러 출력 포트로 자동으로 넘기는 능동 소자로, 버스 신호의 기울기와 레벨은 되살리지만 비트 타이밍은 되살리지 않는다. 점대점 연결, 선형 버스, 수동 스타는 수동 연결(passive net)을 이루고, 능동 스타의 가지(branch) 하나는 점대점 연결, 선형 버스, 수동 스타 가운데 하나로 만들 수 있다.[@iso-17458-1-obp-2013]

![[diagrams/flexray-cluster-topologies.svg]]

MOST 네트워크의 장치는 링 구조로 이어진다.[@most-cooperation-spec-3-0-e2-2010][@smsc-most-backgrounder-2005]

## 버스 접근과 주소

CAN에서 버스를 한꺼번에 쓰려는 노드가 여럿이면 경합이 생기고, ISO 11898-1:2024는 이 경합을 [[can-identifier|식별자]] 기반 [[can-arbitration|중재]]로 푼다.[@iso-11898-1-obp-2024] 노드들이 매체를 나눠 쓰는 방법은 [[bus-access-method|버스 접근 방식]]에서 다룬다.

CAN 식별자는 받을 노드를 가리키지 않고 데이터의 뜻을 나타낸다.[@bosch-can-2-0-1991] 이 방식은 [[message-addressing|메시지 주소 지정]]에서 다룬다.

CXPI에서는 네트워크가 idle 상태면 어느 노드든 PID(Protected Identifier) 전송을 시작할 수 있고, 둘 이상의 노드가 같은 때에 시작하면 PID 값에 따른 비파괴 중재로 우선순위가 가장 높은 PID를 보낸 노드가 버스를 얻는다.[@iso-20794-4-obp-2020]

MOST는 스트리밍 연결마다 대역을 예약해, 데이터 스트림이 끊기거나 충돌하거나 늦어지지 않게 한다.[@iso-21806-1-obp-2020]

## 비트율

LIN의 비트율은 최대 20 kbit/s이며, LIN은 차량의 저비용·저속 제어 응용을 위한 것이다.[@iso-17987-4-obp-2025] ISO 17987-1:2025는 하한까지 넣어 LIN이 지원하는 비트율 $R_\mathrm{b}$를 $1\,\mathrm{kbit/s} \le R_\mathrm{b} \le 20\,\mathrm{kbit/s}$로 제시한다.[@iso-17987-1-obp-2025] ISO 17987-8:2019는 [[lin#물리 계층|DC-LIN]]이 9,615 bit/s, 10,417 bit/s, 19,230 bit/s를 지원하도록 정한다.[@iso-17987-8-obp-2019]

CXPI는 비트율을 20 kbit/s까지 지원한다.[@iso-20794-4-obp-2020]

Bosch CAN 2.0 규격은 자동차 전자 장치를 1 Mbit/s까지의 비트율로 CAN에 잇는 예를 든다.[@bosch-can-2-0-1991] 저속 내결함성 CAN은 비트율 $R_\mathrm{b}$가 $40\,\mathrm{kbit/s} < R_\mathrm{b} \le 125\,\mathrm{kbit/s}$인 범위에서 쓴다.[@iso-11898-3-obp-2006]

FlexRay의 비트율은 최대 10 Mbit/s이며, FlexRay는 차량의 고속 제어 응용을 위한 것이다.[@iso-17458-4-obp-2013] FlexRay 물리 계층은 비트율 $R_\mathrm{b}$가 $2.5\,\mathrm{Mbit/s} \le R_\mathrm{b} \le 10\,\mathrm{Mbit/s}$인 시스템에서 제대로 동작한다.[@iso-17458-5-obp-2013]

![[diagrams/vehicle-bus-bit-rates.svg]]

MOST50과 MOST150은 비트율이 각각 50 Mbit/s와 150 Mbit/s인 MOST 네트워크다.[@iso-21806-1-obp-2020]

[[sent|SENT]]의 기본 시간 단위인 틱은 3\~90 µs다.[@nxp-an4856-2014][@microchip-ds70005145-2014]

SAE J2057/1:2022는 차량 네트워크를 Class A, Class B, Class C로 나눈다.[@sae-j2057-1-2022] SAE J1850:2022는 Class B 데이터 통신 네트워크 인터페이스를 정하고, 매체와 물리 계층이 다른 두 구현을 정해 하나는 10.4 kbit/s, 다른 하나는 41.6 kbit/s의 비트율에 맞춘다.[@sae-j1850-2022] SAE 기술 논문 931808은 차량 내 네트워크가 저속·중속·고속의 데이터율 요구를 맡는 하위 네트워크로 이루어질 수 있다고 하고, 이 셋을 각각 SAE Class A, B, C라 부른다.[@sae-931808-1993]

## 버스 사이 연결

데이터율 요구가 다른 하위 네트워크는 브리지나 게이트웨이로 이어진다.[@sae-931808-1993] Freescale의 차량 네트워킹 브로셔에 따르면 한 차량에서 CAN, FlexRay, LIN을 함께 쓰기도 한다.[@freescale-brinvehiclenet-2006] LIN은 CAN의 대역폭이 필요 없는 장치를 잇는 저비용 하위 네트워크다.[@freescale-brinvehiclenet-2006][@ti-slla383a-2022] LIN의 [[lin#Commander와 responder|commander]]는 백본 네트워크에도 연결된다.[@iso-17987-1-obp-2025]
