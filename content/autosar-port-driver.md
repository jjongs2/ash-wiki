---
title: AUTOSAR Port driver
tags:
  - platform/autosar
verified: 2026-09-30
---

**Port Driver**는 [[autosar-classic-platform|AUTOSAR Classic Platform]]에서 [[microcontroller-abstraction-layer|MCAL]]의 I/O Drivers 그룹에 드는 모듈이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] 마이크로컨트롤러의 포트 구조 전체, 곧 포트와 [[microcontroller-abstraction-layer#Channel, channel group, port|port pin]]을 설정하고 초기화한다.[@autosar-cp-sws-portdriver-2025]

## 핀 설정

마이크로컨트롤러의 포트와 핀은 범용 I/O, ADC(Analogue Digital Converter), SPI(Serial Peripheral Interface), SCI(Serial Communications Interface), PWM(Pulse Width Modulation), [[can|CAN]], [[lin|LIN]] 같은 여러 기능에 쓰일 수 있다. Port Driver는 포트와 핀마다 기능을 정하게 하고, 핀 하나에 port pin mode를 여럿 설정할 수 있게 한다. port pin의 설정과 mode는 마이크로컨트롤러와 [[electronic-control-unit|ECU]]에 따라 다르며, 설정을 포트 전체로 하는지 핀 하나로 하는지도 마이크로컨트롤러에 달렸다.[@autosar-cp-sws-portdriver-2025]

Port Driver 규격은 핀마다 아래 항목을 설정하게 한다.[@autosar-cp-sws-portdriver-2025]

- 방향(입력이나 출력)
- 핀 레벨의 초기값
- 실행 중에 방향을 바꿀 수 있는지
- 실행 중에 mode를 바꿀 수 있는지[@autosar-cp-sws-portdriver-2025]

초기화 함수 `Port_Init`은 넘겨받은 설정 세트로 모든 포트와 핀을 초기화한다. 출력 래치가 있으면 `Port_Init`은 핀 방향을 출력으로 바꾸기 전에 래치를 설정한 초기 레벨로 맞춘다.[@autosar-cp-sws-portdriver-2025]

## 실행 중 변경

`Port_SetPinDirection`은 실행 중에 핀의 방향을 바꾸며, 설정에서 방향을 바꿀 수 있다고 정한 핀에만 쓸 수 있다. `Port_RefreshPortDirection`은 방향을 바꿀 수 없다고 정한 핀의 방향을 설정값으로 다시 쓰고, 바꿀 수 있다고 정한 핀은 건너뛴다. `Port_SetPinMode`는 실행 중에 핀의 mode를 바꾸며, mode 변경을 허용하지 않은 핀에 부르면 개발 오류 검출이 켜져 있을 때 오류를 보고하고 아무것도 하지 않는다.[@autosar-cp-sws-portdriver-2025]

![[diagrams/port-pin-direction-set-refresh.svg]]

Port Driver는 모든 포트와 핀에 원자적으로, 곧 다른 처리가 끼어들 수 없게 접근한다.[@autosar-cp-sws-portdriver-2025]

## 미사용 핀

Port Driver는 GPIO(General Purpose Input/Output)로도 특수 목적 I/O로도 쓰지 않는 포트와 핀을 설정으로 정한 상태에 둔다.[@autosar-cp-sws-portdriver-2025]

## DIO보다 먼저 초기화

[[autosar-dio-driver|DIO Driver]]는 Port Driver가 설정한 핀과 포트 위에서만 동작하며, 포트 구조를 스스로 설정하거나 초기화하지 않는다. 그래서 DIO 함수를 쓰기 전에 Port Driver를 초기화해야 하고, 그러지 않으면 DIO Driver의 동작은 정의되지 않는다.[@autosar-cp-sws-portdriver-2025]

다른 I/O 드라이버가 쓰는 핀도 Port Driver가 설정한다. [[autosar-adc-driver|ADC Driver]]의 아날로그 입력 핀과 외부 트리거 핀[@autosar-cp-sws-adcdriver-2025], [[autosar-pwm-driver|PWM Driver]]가 쓰는 핀의 기능[@autosar-cp-sws-pwmdriver-2025], [[autosar-icu-driver|ICU Driver]]의 입력 핀[@autosar-cp-sws-icudriver-2025], [[autosar-ocu-driver|OCU Driver]]의 출력 핀이 그렇다.[@autosar-cp-sws-ocudriver-2025] ICU Driver와 OCU Driver 규격은 그래서 자기 함수를 쓰기 전에 Port Driver를 초기화하도록 한다.[@autosar-cp-sws-icudriver-2025][@autosar-cp-sws-ocudriver-2025]

![[diagrams/port-pin-config-driver-use.svg]]
