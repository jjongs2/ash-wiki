---
title: 차량 버스
tags:
  - network
verified: 2026-09-27
---

## 정의

**버스**는 모든 노드가 양방향 전송이 되는 수동 링크로 닿는 네트워크 토폴로지다. [[can|CAN]]은 도로 차량의 ECU 사이에서 디지털 정보를 주고받는 직렬 통신 프로토콜이다.[@iso-11898-3-obp-2006] LIN(Local Interconnect Network)은 차량 ECU를 잇는 저비용 네트워크이고[@iso-17987-4-obp-2025], FlexRay는 차량 ECU를 잇는 시간 트리거 네트워크다.[@iso-17458-4-obp-2013] 1993년 SAE 기술 논문 931808에 따르면 차량 내 네트워크는 제어기, 센서, 액추에이터가 정보를 나누는 매체다.[@sae-931808-1993]

## 구조·동작

### 매체

고속 CAN은 CAN_H와 CAN_L 두 선의 전압 차로 버스 상태를 나타낸다.[@iso-11898-2-obp-2026] 이 방식은 [[differential-signaling|차동 신호]]에서 다룬다. LIN은 접지를 기준으로 선 하나로 송수신하는 단선 매체를 쓴다.[@iso-17987-4-obp-2025]

### 토폴로지

ISO 11898-1은 CAN 버스를 토폴로지를 가리지 않는 공유 매체로 정의한다.[@iso-11898-1-obp-2024] FlexRay는 점대점 연결, 선형 수동 버스, 수동 스타, 능동 스타 토폴로지를 지원한다.[@iso-17458-4-obp-2013]

### 버스 접근과 주소

CAN에서 버스를 한꺼번에 쓰려는 노드가 여럿이면 경합이 생기고, ISO 11898-1은 이 경합을 식별자 기반 중재로 푼다.[@iso-11898-1-obp-2024] 노드들이 매체를 나눠 쓰는 방법은 [[bus-access-method|버스 접근 방식]]에서 다룬다.

CAN 식별자는 받을 노드를 가리키지 않고 데이터의 뜻을 나타낸다.[@bosch-can-2-0-1991] 이 방식은 [[message-addressing|메시지 주소 지정]]에서 다룬다.

### 비트율

LIN의 비트율은 최대 20 kbit/s이며, LIN은 차량의 저비용·저속 제어 응용을 위한 것이다.[@iso-17987-4-obp-2025]

Classical CAN의 비트율은 최대 1 Mbit/s다.[@bosch-can-2-0-1991] ISO 11898-2:2016의 고속 PMA(Physical Medium Attachment)는 [[can-fd|CAN FD]]용으로 5 Mbit/s까지의 비트 타이밍 파라미터를 둔다.[@iso-11898-2-obp-2016] 저속 내결함성 CAN은 비트율 $R_\mathrm{b}$가 $40\,\mathrm{kbit/s} < R_\mathrm{b} \le 125\,\mathrm{kbit/s}$인 범위에서 쓴다.[@iso-11898-3-obp-2006]

FlexRay의 비트율은 최대 10 Mbit/s이며, FlexRay는 차량의 고속 제어 응용을 위한 것이다.[@iso-17458-4-obp-2013]

![[diagrams/vehicle-bus-bit-rates.svg]]

SAE J2057/1은 차량 네트워크를 Class A, Class B, Class C로 나눈다.[@sae-j2057-1-2022] SAE 기술 논문 931808은 차량 내 네트워크가 저속·중속·고속의 데이터율 요구를 맡는 하위 네트워크로 이루어질 수 있다고 하고, 이 셋을 각각 SAE Class A, B, C라 부른다.[@sae-931808-1993] Freescale의 차량 네트워킹 브로셔에 따르면 한 차량에서 CAN, FlexRay, LIN을 함께 쓰기도 하며, LIN은 CAN의 대역폭이 필요 없는 센서와 액추에이터를 잇는 저비용 하위 네트워크다.[@freescale-brinvehiclenet-2006]

### 버스 사이 연결

SAE 기술 논문 931808은 데이터율 요구가 다른 하위 네트워크들을 브리지나 게이트웨이로 이어 차량 전체의 데이터 일관성을 지킨다고 설명하고, 그 예로 J1850(Class B)과 CAN(Class C)을 잇는 브리지를 다룬다.[@sae-931808-1993]

LIN의 commander 노드는 LIN 프레임을 스케줄하고, 백본 네트워크에도 연결된다.[@iso-17987-1-obp-2025] **commander**는 ISO 17987의 2016년판이 마스터라 부르던 노드다.[@iso-17987-4-obp-2025]

AUTOSAR의 PDU Router는 한 통신 인터페이스 모듈로 받은 I-PDU(Interaction Layer Protocol Data Unit)를 고치지 않고 다른 통신 인터페이스 모듈로 보내는 게이트웨이 기능을 제공한다. CAN과 FlexRay 사이, CAN과 LIN 사이의 게이트웨이가 그 예다.[@autosar-cp-sws-pdurouter-2023]

## 비교·한계

차량 안에서는 IEEE 802.3 이더넷도 쓰인다. IEEE 802.1DG는 여러 장치를 브리지로 묶은 차량 내 이더넷 네트워크를 위한 TSN(Time-Sensitive Networking) 프로파일을 정한다.[@ieee-802-1dg-2025] 이더넷 물리 계층인 100BASE-T1은 두 장치를 잇는 점대점 링크이며, 꼬임쌍선 한 쌍으로 100 Mbit/s 전이중 전송을 한다.[@ieee-802-3bw-2015]
