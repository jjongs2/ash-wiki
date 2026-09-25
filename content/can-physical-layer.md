---
title: CAN 물리 계층
tags:
  - network/can
verified: 2026-09-25
---

## 정의

[[can|CAN]] 물리 계층에서 [[can-controller|CAN 컨트롤러]]의 논리 신호와 버스 선의 전기 신호 사이 변환은 ISO 11898의 PMA(Physical Medium Attachment) 부계층이 맡는다. PMA의 송신기는 디지털 신호를 CAN_H와 CAN_L의 아날로그 신호로 바꾸고, 수신기는 그 반대로 바꾼다.[@iso-11898-2-obp-2026]

고속 CAN의 PMA는 [[iso-11898-2|ISO 11898-2]]가 규정하고[@iso-11898-2-obp-2026], 저속 내결함성 CAN의 PMA와 MDI(Medium Dependent Interface)는 [[iso-11898-3|ISO 11898-3]]이 규정한다.[@iso-11898-3-obp-2006] 그 위의 PCS(Physical Coding Sublayer)는 [[iso-11898-1|ISO 11898-1]]이 규정하며, 비트 부호화·복호화와 동기화를 맡는다.[@iso-11898-2-obp-2026] 한 비트의 시간도 ISO 11898-1이 정하는데, 정해진 개수의 time quantum으로 이뤄진다.[@iso-11898-1-obp-2024]

![[can-iso-11898-sublayers.svg]]

## 구조·동작

### 차동 전송

고속 CAN의 버스 인터페이스(MDI)는 CAN_H와 CAN_L 두 선이다.[@iso-11898-2-obp-2026] 수신기는 두 선의 전압 차를 문턱 전압과 비교해 비트를 판정한다.[@nxp-tja1042-2023] 두 선에 똑같이 실린 공통 모드 성분은 차동 수신기가 걸러 내는데, 여기에는 접지 잡음과 버스에 결합된 잡음이 들어 있다.[@ti-sn65hvd230-2018]

### dominant와 recessive

버스 상태는 dominant(논리 0)와 recessive(논리 1) 둘이고, 두 값을 동시에 내면 버스는 dominant가 된다.[@iso-11898-2-obp-2026] 중재는 dominant 비트가 recessive 비트를 덮어쓰는 이 성질에 기댄다.[@iso-11898-1-obp-2024] ACK(Acknowledgement)도 마찬가지로, 송신 노드가 ACK 슬롯에 낸 recessive 비트 위에 메시지를 제대로 받은 노드가 dominant 비트를 덮어쓴다.[@bosch-can-2-0-1991]

### 고속 CAN

고속 트랜시버 TJA1042의 전형값으로 보면, recessive에서는 두 선이 모두 VCC의 절반(5 V 전원에서 2.5 V)이라 전압 차가 거의 0이다. dominant에서는 CAN_H가 약 3.5 V, CAN_L이 약 1.5 V로 벌어져 전압 차가 약 2 V가 된다.[@nxp-tja1042-2023]

![[hs-can-bus-voltage.svg]]

버스 양 끝에는 선의 특성 임피던스와 같은 120 Ω 종단 저항을 달아 신호 반사를 막는다.[@ti-tcan1042-q1-2021]

![[can-node-bus.svg]]

### 저속 내결함성 CAN

저속 내결함성 CAN은 40 kbit/s 초과 125 kbit/s 이하에서 쓴다.[@iso-11898-3-obp-2006] 저속 내결함성 트랜시버 TJA1055는 한 선이 끊기거나, 전원이나 접지에 단락되거나, 두 선이 서로 단락돼도 통신을 이어 간다. 고장에 따라 차동 모드를 그대로 유지하기도 하고, 남은 한 선으로 송수신하는 단선 모드로 바꾸기도 한다.[@nxp-tja1055-2013]

## 비교·한계

버스를 길게 하려면 비트율을 낮춰야 한다.[@ti-tcan1042-q1-2021] 중재 중에는 송신 노드가 자기가 낸 비트와 버스에서 읽은 비트를 비교하므로, 비트 시간 안에 전파 구간(PROP_SEG)을 둔다. 이 구간의 길이는 버스 선의 신호 전파 시간, 입력 비교기 지연, 출력 드라이버 지연을 더한 값의 두 배다.[@bosch-can-2-0-1991]

ISO 11898 밖의 물리 계층으로 SAE J2411이 있다. 이 표준은 선 하나를 매체로 쓰는 단선 CAN의 물리 계층을 정한다.[@sae-j2411-2000] 단선 CAN 트랜시버 NCV7356은 평소 약 33 kbit/s로 통신하고, 조립 라인과 정비용 고속 다운로드 모드에서는 83 kbit/s를 권장한다.[@onsemi-ncv7356-2026]
