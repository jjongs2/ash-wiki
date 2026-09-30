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

마이크로컨트롤러 안에 있는 장치를 **internal device**라 한다. 예로 내부 EEPROM(Electrically Erasable Programmable Read-Only Memory), 내부 [[can|CAN]] 컨트롤러, 내부 ADC(Analog Digital Converter)가 있다. internal device의 드라이버인 **internal driver**는 MCAL에 놓인다. 마이크로컨트롤러 밖 장치의 드라이버는 [[ecu-abstraction-layer|ECU Abstraction Layer]]에 놓이며 MCAL의 드라이버를 거쳐 장치에 접근한다. 다만 메모리 맵 방식 외부 장치(외부 Flash 등)의 드라이버는 마이크로컨트롤러에 직접 접근할 수 있고 마이크로컨트롤러에 의존하므로 MCAL에 놓인다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/autosar-internal-external-driver-placement.svg]]

## 모듈 그룹

MCAL은 비슷한 종류의 모듈을 묶은 여섯 모듈 그룹으로 이루어진다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

| 모듈 그룹                      | 담는 것                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Microcontroller Drivers        | 내부 주변장치(watchdog, 범용 타이머 등)의 드라이버와 마이크로컨트롤러에 직접 접근하는 기능(core test 등). GPT(General Purpose Timer) Driver, Watchdog Driver, MCU Driver가 든다.            |
| Memory Drivers                 | 온칩 메모리 장치(내부 Flash, 내부 EEPROM 등)와 메모리 맵 외부 메모리 장치(외부 Flash 등)의 드라이버                                                                                         |
| Crypto Drivers                 | SHE(Secure Hardware Extension), HSM(Hardware Security Module) 같은 온칩 암호 장치의 드라이버                                                                                                |
| Communication Drivers          | ECU 보드 안 통신(SPI(Serial Peripheral Interface) 등)과 차량 통신(CAN 등)의 드라이버. SPI Handler Driver와 [[lin\|LIN]], CAN, [[flexray\|FlexRay]], [[ethernet\|Ethernet]] 드라이버가 든다. |
| Wireless Communication Drivers | 차량 안이나 차량 밖 통신에 쓰는 무선 네트워크 시스템의 드라이버. Wireless Ethernet Driver가 든다.                                                                                           |
| I/O Drivers                    | 아날로그·디지털 입출력의 드라이버. Port, DIO(Digital Input/Output), ADC, PWM(Pulse Width Modulation), ICU(Input Capture Unit), OCU(Output Compare Unit) 드라이버가 든다.                    |

MCU Driver는 MCU 클럭(PLL(Phase-Locked Loop), 클럭 프리스케일러, 클럭 분배)의 초기화, RAM(Random-Access Memory) 영역의 초기화, 저전력 모드 진입, 리셋 실행, 리셋 원인 조회를 맡는다.[@autosar-cp-sws-mcudriver-2025]

## Channel, channel group, port

I/O 드라이버의 입출력 단위를 부르는 이름은 드라이버 규격마다 다르다. DIO Driver 규격은 다음 세 용어를 정의한다.

- **DIO channel**: 범용 디지털 입출력 핀 하나
- **DIO port**: 하드웨어가 묶어 둔 여러 DIO channel. 대개 하드웨어 레지스터 하나로 제어된다.
- **DIO channel group**: 한 DIO port 안의 이웃한 DIO channel 여러 개를 논리적으로 묶은 것[@autosar-cp-sws-diodriver-2025]

DIO Driver는 channel group에 든 channel들을 한 번에 쓰는 서비스 `Dio_WriteChannelGroup`과 channel group의 레벨을 읽는 서비스 `Dio_ReadChannelGroup`을 둔다.[@autosar-cp-sws-diodriver-2025]

Port Driver 규격은 MCU의 설정 가능한 입출력 핀 하나를 **port pin**, 설정 가능한 포트 전체를 port라 부른다. 이 규격은 DIO Driver의 channel을 port pin에, port를 port에 대응시키며, channel group에 대응하는 이름은 두지 않는다. Port Driver는 마이크로컨트롤러의 포트 구조 전체를 초기화하고, port와 port pin마다 기능(ADC, SPI, DIO 등), 방향, 초기 레벨, 실행 중 방향을 바꿀 수 있는지를 설정하게 한다.[@autosar-cp-sws-portdriver-2025]

![[diagrams/dio-channel-port-channel-group.svg]]

다른 I/O 드라이버 규격은 channel을 저마다 다르게 정의한다.

| 드라이버 | channel의 정의                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| ADC      | port pin 하나에 묶인 논리 ADC 개체. 여러 ADC channel을 같은 port pin에 매핑할 수 있다.[@autosar-cp-sws-adcdriver-2025] |
| PWM      | 하드웨어 PWM 하나에 연결된 숫자 식별자[@autosar-cp-sws-pwmdriver-2025]                                                 |
| ICU      | 입력 신호 하나와, 설정된 측정 모드에 쓰는 하드웨어 자원에 묶인 논리 ICU 개체[@autosar-cp-sws-icudriver-2025]           |
| OCU      | free-running counter, 비교 문턱값, 비교 결과로 하는 동작으로 이루어진 논리 개체[@autosar-cp-sws-ocudriver-2025]        |

ADC Driver 규격은 channel group도 정의한다. ADC channel group은 같은 ADC 하드웨어 유닛에 연결된 ADC channel의 묶음이고, 그룹 전체의 변환은 트리거 하나로 시작된다. DIO의 channel group과 달리 한 port 안의 이웃한 channel이라는 조건이 없다.[@autosar-cp-sws-adcdriver-2025]

DIO, ADC, PWM, ICU, OCU 드라이버 규격은 모두 쓰는 port pin의 설정을 Port Driver에 맡긴다.[@autosar-cp-sws-diodriver-2025][@autosar-cp-sws-adcdriver-2025][@autosar-cp-sws-pwmdriver-2025][@autosar-cp-sws-icudriver-2025][@autosar-cp-sws-ocudriver-2025]
