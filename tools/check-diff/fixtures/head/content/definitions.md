---
title: 정의
tags:
  - network/can
verified: 2026-01-01
---

**정의**는 이 픽스처의 주제어다.[@bosch-can-2-0-1991]

## 연결어미

프레임 끝의 recessive 7비트를 EOF라 부르며, 그 뒤에 인터미션이 온다. 오류를 알리는 프레임을 오류 프레임이라 하며, 플래그와 구분자로 이루어진다.[@bosch-can-2-0-1991]

수신 노드는 **샘플 포인트**에서 비트를 읽는다.[@bosch-can-2-0-1991]

## 계수기

주요 규칙은 다음과 같다.

- 수신 노드가 오류를 찾으면 REC가 1 오른다.[@bosch-can-2-0-1991]
- 송신 노드가 오류 플래그를 내면 TEC가 8 오른다.[@bosch-can-2-0-1991]
- 송신에 성공하면 TEC가 1 내려간다.[@bosch-can-1-2-1990]

인용이 없는 문단이다.

## 약어

CRC 시퀀스는 BCH 부호에서 나왔다. ISO/DIS 16845-2가 개발 중이다. 고속(HS) 트랜시버 TJA1042와 [[can|CAN]] 버스를 쓰는 ECU다. IEEE SA가 펴냈다.[@bosch-can-2-0-1991]

데이터 오류(RAM 워드의 패리티 오류)를 찾는다. ICU 모듈이 신호를 잰다. [[autosar-icu-driver|ICU Driver]]가 펄스를 센다. **DIO Driver**는 핀을 다루고, DIO(Digital Input/Output)는 디지털 입출력이다. **PWM Driver**(PWM 신호 드라이버)는 PWM(Pulse Width Modulation) 신호를 낸다.[@bosch-can-2-0-1991]

ChrgM이 충전을 다루고 PAM3 신호를 쓴다. DevSecOps와 FlexRay, MHz는 약어 후보가 아니다. 설정값이 BIG_ENDIAN이면 CAN_H를 본다.[@bosch-can-2-0-1991]
