---
title: CAN 물리 계층
tags:
  - network/can
verified: 2026-09-27
---

**CAN 물리 계층**에서 [[can-controller|CAN 컨트롤러]]의 논리 신호와 버스 선의 전기 신호 사이 변환은 ISO 11898의 PMA(Physical Medium Attachment) 부계층이 맡는다. PMA의 송신기는 디지털 신호를 CAN_H와 CAN_L의 아날로그 신호로 바꾸고, 수신기는 그 반대로 바꾼다.[@iso-11898-2-obp-2026]

고속 [[can|CAN]]의 PMA는 [[iso-11898-2|ISO 11898-2:2026]]이 규정하고[@iso-11898-2-obp-2026], 저속 내결함성 CAN의 PMA와 MDI(Medium Dependent Interface)는 [[iso-11898-3|ISO 11898-3:2006]]이 규정한다.[@iso-11898-3-obp-2006] 그 위의 PCS(Physical Coding Sublayer)는 [[iso-11898-1|ISO 11898-1:2024]]가 규정하며[@iso-11898-1-obp-2024], 비트 부호화·복호화와 [[can-synchronization|동기화]]를 맡는다.[@iso-11898-2-obp-2026] 한 비트의 시간도 ISO 11898-1:2024가 정하는데, 정해진 개수의 [[can-bit-timing#Time quantum|time quantum]]으로 이뤄진다.[@iso-11898-1-obp-2024]

![[diagrams/can-iso-11898-sublayers.svg]]

## PMA 선택지

CiA는 CAN의 PMA 선택지로 고속 트랜시버, [[can-fd|CAN FD]] 트랜시버, [[can-transceiver#SIC|CAN SIC]] 트랜시버, CAN SIC XL 트랜시버, 저속 내결함성 트랜시버(ISO 11898-3:2006), 트럭·트레일러용 트랜시버(ISO 11992-1), 단선 CAN 트랜시버(SAE J2411)를 든다. 이 가운데 저속 내결함성 트랜시버와 단선 CAN 트랜시버는 새 설계에 더는 권하지 않는다.[@cia-physical-layer-options-2026]

## 차동 전송

고속 CAN의 버스 인터페이스(MDI)는 CAN_H와 CAN_L 두 선이다.[@iso-11898-2-obp-2026] 수신기는 두 선의 전압 차를 문턱 전압과 비교해 비트를 판정한다.[@nxp-tja1042-2023] 두 선에 똑같이 실린 공통 모드 성분은 [[differential-signaling|차동 수신기]]가 걸러 내는데, 여기에는 접지 잡음과 버스에 결합된 잡음이 들어 있다.[@ti-sn65hvd230-2018] 두 선을 꼬는 것은 외부 잡음이 두 선에 거의 같게 실리게 하려는 것이다.[@ti-slld009-2002][@maxim-rs485-wiring-2001]

노드 사이에는 접지 전위차가 생길 수 있고, 그러면 차동 전압이 같아도 노드마다 버스 선의 전압, 곧 공통 모드 전압이 다르게 보인다.[@ti-sloa101b-2016][@microchip-an228-2002] TI 앱노트에 따르면 트랜시버가 이 접지 전위차를 견디도록 설계되지 않으면 간헐적인 리부트, 멈춤, 잘못된 데이터 전송, 트랜시버의 물리적 손상이 생길 수 있다.[@ti-sloa101b-2016]

## 고속 CAN

고속 [[can-transceiver|트랜시버]]는 [[dominant-and-recessive|dominant]]에서 CAN_H를 약 3.5 V, CAN_L을 약 1.5 V로 구동해 두 선의 전압 차를 약 2 V로 벌린다.[@nxp-tja1042-2023][@microchip-an228-2002]

recessive에서 고속 트랜시버는 Normal 모드일 때 두 선을 0.5 VCC(5 V 전원에서 2.5 V)로 바이어스해 전압 차가 거의 0이다. Standby 모드에서는 공급 전류를 줄이려고 버스 선을 접지로 바이어스한다.[@nxp-tja1042-2023][@ti-tcan1042-q1-2021]

![[diagrams/hs-can-bus-voltage.svg]]

버스를 길게 하려면 비트율을 낮춰야 한다.[@ti-slla270-2008][@microchip-an754-2001] TI 앱노트가 제시하는 비트율별 권장 버스 길이는 아래와 같다.[@ti-slla270-2008]

| 비트율     | 권장 버스 길이 |
| ---------- | -------------- |
| 1 Mbit/s   | 40 m           |
| 500 kbit/s | 100 m          |
| 250 kbit/s | 200 m          |
| 100 kbit/s | 500 m          |
| 50 kbit/s  | 1000 m         |

Philips 앱노트는 PCA82C250을 고속 모드로 쓸 때 1 Mbit/s에서의 버스 길이로 경험칙 30 m를 제시한다.[@philips-an96116-1996] 비트 시간 안의 전파 구간(PROP_SEG) 길이는 [[can-bit-timing#세그먼트|CAN 비트 타이밍]]에서 다룬다.

## 종단

버스 양 끝에는 선의 특성 임피던스와 같은 120 Ω 종단 저항을 달아 신호 반사를 막는다.[@ti-tcan1042-q1-2021]

![[diagrams/can-node-bus.svg]]

종단 방식에는 양 끝에 120 Ω 저항을 하나씩 다는 표준 종단과, 그 저항을 60 Ω 둘로 나누고 그 사이를 커패시터로 접지에 잇는 분할 종단이 있다. 분할 종단은 고주파 잡음을 접지로 흘려 EMC(Electromagnetic Compatibility)를 높이며, 두 저항을 되도록 똑같이 맞춰야 한다.[@microchip-an228-2002][@ti-slla270-2008]

분할 종단의 가운데를 VCC/2로 잡아 recessive의 공통 모드 전압을 일정하게 두는 방식도 있다. Microchip 앱노트는 이를 **바이어스 분할 종단**이라 부르며, 분할 종단에 전압 분배기를 더해 두 60 Ω 저항 사이를 전원 전압의 절반으로 만든다.[@microchip-an228-2002] TI 앱노트에 따르면 트랜시버의 V-split 핀을 분할 종단의 가운데에 이으면 버스 전압이 VCC/2로 안정되어, 버스가 쉬는 동안 공통 모드 전압이 높게 떠도는 것을 막는다.[@ti-sloa101b-2016]

![[diagrams/can-termination-methods.svg]]

## 커넥터

CiA 106 version 1.1.0은 CAN 인터페이스 커넥터의 핀 배치를 권하며, CAN_H와 CAN_L 핀, 접지 핀, 전원 핀을 다룬다. CiA가 처음 권한 핀 배치는 DE-9 커넥터용이었고, 이런 권고는 [[canopen|CANopen]] CC용 문서인 CiA 303-1에 실려 있다가 Classical CAN, CAN FD, [[can-xl|CAN XL]] 인터페이스에 두루 쓰이도록 CiA 106으로 옮겨졌다.[@cia-106-2026]

## 저속 내결함성 CAN

저속 내결함성 CAN은 비트율 $R_\mathrm{b}$가 $40\,\mathrm{kbit/s} < R_\mathrm{b} \le 125\,\mathrm{kbit/s}$인 범위에서 쓴다.[@iso-11898-3-obp-2006] 저속 내결함성 트랜시버 TJA1055는 한 선이 끊기거나, 전원이나 접지에 단락되거나, 두 선이 서로 단락돼도 통신을 이어 간다. 고장에 따라 차동 모드를 그대로 유지하기도 하고, 남은 한 선으로 송수신하는 단선 모드로 바꾸기도 한다.[@nxp-tja1055-2013]

## 단선 CAN과의 차이

ISO 11898 밖의 물리 계층으로 SAE J2411이 있다. 이 표준은 선 하나를 매체로 쓰는 단선 CAN의 물리 계층을 정한다.[@sae-j2411-2000] 단선 CAN 트랜시버 NCV7356은 평소 약 33 kbit/s로 통신하고, 조립 라인과 정비용 고속 다운로드 모드에서는 83 kbit/s를 권장한다.[@onsemi-ncv7356-2026]
