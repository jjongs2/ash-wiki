---
title: Microcontroller abstraction layer
tags:
  - platform/autosar
aliases:
  - MCAL
verified: 2026-09-30
---

**MCAL**(Microcontroller Abstraction Layer)은 [[autosar-layered-architecture|AUTOSAR 계층 구조]]에서 BSW(Basic Software)의 가장 아래 소프트웨어 층이다. 마이크로컨트롤러의 온칩 주변장치와 칩 밖에 있는 메모리 맵 주변장치에 정해진 API(Application Programming Interface)로 접근하게 하는 드라이버를 담고, 위 소프트웨어 계층을 마이크로컨트롤러에서 독립시킨다. MCAL의 구현은 마이크로컨트롤러에 의존하지만, 위쪽 인터페이스는 표준화할 수 있고 마이크로컨트롤러에 독립적이다.[@autosar-fo-tr-glossary-2025]

![[diagrams/autosar-layered-software-architecture.svg]]

## Internal driver

마이크로컨트롤러 안에 있는 장치를 **internal device**라 한다. 예로 내부 EEPROM(Electrically Erasable Programmable Read-Only Memory), 내부 [[can-controller|CAN 컨트롤러]], 내부 ADC(Analogue Digital Converter)가 있다. internal device의 드라이버인 **internal driver**는 MCAL에 놓인다. [[ecu-abstraction-layer#External driver|외부 장치]] 가운데서도 메모리 맵 방식 장치(외부 플래시 등)의 드라이버는 마이크로컨트롤러에 의존하므로 MCAL에 놓인다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/autosar-internal-external-driver-placement.svg]]

## 모듈 그룹

MCAL은 비슷한 종류의 모듈을 묶은 여섯 모듈 그룹으로 이루어진다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

| 모듈 그룹                                              | 담는 것                                                                                                                                                                                                                            |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Microcontroller Drivers                                | 내부 주변장치(watchdog, 범용 타이머 등)의 드라이버와 마이크로컨트롤러에 직접 접근하는 기능(core test 등). GPT(General Purpose Timer) Driver, Watchdog Driver, MCU Driver가 든다.                                                   |
| [[autosar-memory-stack\|Memory Drivers]]               | 온칩 메모리 장치(내부 플래시, 내부 EEPROM 등)와 메모리 맵 외부 메모리 장치(외부 플래시 등)의 드라이버                                                                                                                              |
| Crypto Drivers                                         | SHE(Secure Hardware Extension), [[hardware-security-module\|HSM]] 같은 온칩 암호 장치의 드라이버                                                                                                                                   |
| [[autosar-communication-stack\|Communication Drivers]] | SPI(Serial Peripheral Interface) 같은 ECU 보드 안 통신과 [[can\|CAN]] 같은 차량 통신의 드라이버                                                                                                                                    |
| Wireless Communication Drivers                         | 차량 안이나 차량 밖 통신에 쓰는 무선 네트워크 시스템의 드라이버. Wireless Ethernet Driver가 든다.                                                                                                                                  |
| I/O Drivers                                            | 아날로그·디지털 입출력의 드라이버. [[autosar-port-driver\|Port]], [[autosar-dio-driver\|DIO]], [[autosar-adc-driver\|ADC]], [[autosar-pwm-driver\|PWM]], [[autosar-icu-driver\|ICU]], [[autosar-ocu-driver\|OCU]] 드라이버가 든다. |

## Channel, channel group, port

DIO Driver 규격은 입출력 단위를 부르는 용어 셋을 정의한다.[@autosar-cp-sws-diodriver-2025]

- **DIO channel**: 범용 디지털 입출력 핀 하나
- **DIO port**: 하드웨어가 묶어 둔 여러 DIO channel. 대개 하드웨어 레지스터 하나로 제어된다.
- **DIO channel group**: 한 DIO port 안의 이웃한 DIO channel 여러 개를 논리적으로 묶은 것[@autosar-cp-sws-diodriver-2025]

Port Driver 규격은 MCU의 설정 가능한 입출력 핀 하나를 **port pin**, 설정 가능한 포트 전체를 **port**라 부른다. 이 규격은 DIO Driver의 channel을 port pin에, port를 port에 대응시키며, channel group에 대응하는 이름은 두지 않는다.[@autosar-cp-sws-portdriver-2025]

![[diagrams/dio-channel-port-channel-group.svg]]

다른 I/O 드라이버 규격은 channel을 저마다 다르게 정의한다.

| 드라이버 | channel의 정의                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| ADC      | port pin 하나에 묶인 논리 ADC 개체. 여러 ADC channel을 같은 port pin에 매핑할 수 있다.[@autosar-cp-sws-adcdriver-2025]                         |
| PWM      | 하드웨어 PWM 하나에 연결된 숫자 식별자[@autosar-cp-sws-pwmdriver-2025]                                                                         |
| ICU      | 입력 신호 하나와, 설정된 [[autosar-icu-driver#측정 모드\|측정 모드]]에 쓰는 하드웨어 자원에 묶인 논리 ICU 개체[@autosar-cp-sws-icudriver-2025] |
| OCU      | free-running counter, 비교 문턱값, 비교 결과로 하는 동작으로 이루어진 논리 개체[@autosar-cp-sws-ocudriver-2025]                                |

ADC Driver 규격의 [[autosar-adc-driver#Hardware unit과 channel group|ADC channel group]]은 같은 ADC hardware unit의 channel을 묶을 뿐, DIO의 channel group과 달리 한 port 안의 이웃한 channel이어야 한다는 조건은 없다.[@autosar-cp-sws-adcdriver-2025]

DIO, ADC, PWM, ICU, OCU 드라이버 규격은 모두 쓰는 port pin의 설정을 Port Driver에 맡긴다.[@autosar-cp-sws-diodriver-2025][@autosar-cp-sws-adcdriver-2025][@autosar-cp-sws-pwmdriver-2025][@autosar-cp-sws-icudriver-2025][@autosar-cp-sws-ocudriver-2025]
