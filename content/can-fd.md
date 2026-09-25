---
title: CAN FD
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN FD**(CAN with Flexible Data-Rate)는 [[can|CAN]]을 확장해, 프레임 하나에 더 많은 데이터를 더 빠르게 싣게 한 방식이다. CAN 2.0에 비해 데이터 필드를 최대 64바이트로 늘렸고, 중재가 끝난 뒤의 데이터 구간을 더 높은 비트율로 보낼 수 있다. 중재 구간의 비트율은 CAN 2.0과 같다.[@microchip-mcp25xxfd-frm-2020]

CAN FD는 Bosch가 2012년에 CAN FD Specification Version 1.0으로 먼저 공개했다.[@bosch-can-fd-1-0-2012] 2015년에 나온 [[iso-11898-1|ISO 11898-1]] 2판에 CAN FD 프레임 포맷이 들어갔다.[@iso-11898-1-2015]

## 구조·동작

### 두 비트율

CAN FD 프레임의 중재 구간은 nominal bit rate로, 데이터 필드와 CRC(Cyclic Redundancy Check) 필드로 이뤄진 데이터 구간은 따로 설정한 data bit rate로 보낸다. data bit rate는 nominal bit rate와 같거나 더 높게 설정한다.[@bosch-m-can-2023]

nominal bit rate는 네트워크의 전파 지연에 묶이지만, 데이터 구간에서는 송신 노드가 하나만 남으므로 비트율을 높일 수 있다. 데이터 구간에서 비트율을 바꿀지는 프레임마다 BRS(Bit Rate Switch) 비트로 정한다.[@microchip-mcp25xxfd-frm-2020] 이 제약은 [[can-arbitration|CAN 중재]]에서 다룬다.

### 프레임

CAN FD 프레임은 FDF(FD Format) 비트로 classical 프레임과 구별된다. FDF는 11비트 식별자 프레임의 예약 비트, 29비트 식별자 프레임의 첫 예약 비트 자리에 온다. recessive면 CAN FD 프레임, dominant면 classical 프레임이다.[@bosch-m-can-2023]

데이터 필드의 크기는 [[data-length-code|DLC]](Data Length Code) 값마다 정해진 크기 가운데 하나다. DLC가 8 이하면 classical CAN과 같고, 9 이상이면 8바이트보다 큰 크기에 따로 대응한다.[@bosch-m-can-2023]

CAN FD 프레임은 classical 프레임의 15비트 CRC보다 긴 CRC를 쓴다. 데이터가 16바이트 이하면 17비트, 20바이트 이상이면 21비트다. CAN FD에는 [[remote-frame|리모트 프레임]]이 없다.[@microchip-mcp25xxfd-frm-2020] 프레임의 비트 구성은 [[can-fd-frame|CAN FD 프레임]]에서 다룬다.

### 오류 상태 표시

CAN FD 프레임의 ESI(Error State Indicator) 비트는 송신 노드의 오류 상태를 알린다. 송신을 시작할 때 송신 노드가 error passive면 recessive, 그렇지 않으면 dominant로 보낸다.[@bosch-m-can-2023]

## 비교·한계

### classical CAN과의 호환

CAN FD 컨트롤러는 classical CAN 프레임도 주고받는다.[@bosch-m-can-2023] 반대로 CAN FD를 지원하지 않는 컨트롤러는 CAN FD 프레임을 받으면 오류 프레임을 낸다. 그래서 그런 컨트롤러를 CAN FD 컨트롤러와 한 버스에 그대로 섞어 쓸 수는 없다.[@microchip-mcp251xxfd-frm-2018]

모든 노드가 CAN FD를 지원하지 않는 버스에서 CAN FD로 통신하는 동안에는, CAN FD를 지원하지 않는 노드를 silent 모드로 둔다. end-of-line 프로그래밍이 그 예다.[@bosch-m-can-2023] ISO 11898-1:2024는 CAN FD 프레임을 주고받지는 못해도 방해하지 않는 classical 구현(FD tolerant)도 규정한다.[@iso-11898-1-obp-2024]

### ISO CAN FD와 Bosch CAN FD

ISO 11898-1:2015의 CAN FD 프레임 포맷은 Bosch CAN FD 1.0과 달라서, 두 포맷을 모두 지원하는 컨트롤러는 설정 비트로 하나를 고른다.[@bosch-m-can-2023] ISO 포맷은 CRC 필드에 스터프 비트 개수를 넣는다. Bosch 원래 규격에는 없던 값으로, 오류 검출의 약점을 고치려고 넣었다.[@microchip-mcp25xxfd-frm-2020] ISO 포맷은 CRC 계산의 초기값도 모두 0이 아닌 값으로 바꿨다.[@microchip-dspic33-canfd-frm-2018]

### 트랜시버

TCAN1042-Q1 계열 [[can-transceiver|CAN 트랜시버]]는 모두 2 Mbit/s의 CAN FD를 지원하고, 이름에 G가 붙은 제품은 5 Mbit/s까지 지원한다.[@ti-tcan1042-q1-2021]
