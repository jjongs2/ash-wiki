---
title: ECU abstraction layer
tags:
  - platform/autosar
verified: 2026-09-30
---

**ECU Abstraction Layer**는 [[autosar-layered-architecture|AUTOSAR 계층 구조]]에서 BSW(Basic Software)를 이루는 층 가운데 하나로, [[microcontroller-abstraction-layer|MCAL]] 위, Services Layer 아래에 놓인다. 이 층은 MCAL의 드라이버와 맞닿고 외부 장치의 드라이버를 담으며, 위 계층에 주변장치와 장치에 접근하는 API(Application Programming Interface)를 준다. 이 API는 주변장치가 마이크로컨트롤러 안에 있는지 밖에 있는지, 마이크로컨트롤러에 어떻게 연결됐는지(포트 핀, 인터페이스 종류)와 상관없이 쓸 수 있어, 위 계층을 ECU 하드웨어 배치에서 독립시킨다. 이 층의 구현은 마이크로컨트롤러에 독립적이고 ECU 하드웨어에 의존한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 그룹

ECU Abstraction Layer는 Onboard Device Abstraction, Memory Hardware Abstraction, Crypto Hardware Abstraction, Wireless Communication Hardware Abstraction, Communication Hardware Abstraction, I/O Hardware Abstraction 그룹으로 나뉜다. Wireless Communication Hardware Abstraction을 뺀 다섯 그룹이 하는 일은 아래와 같다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

| 그룹                               | 하는 일                                                                                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Onboard Device Abstraction         | 센서나 액추에이터로 볼 수 없는 ECU 보드 위 장치(내부·외부 watchdog 등)의 드라이버를 담는다. 이 드라이버는 MCAL을 거쳐 장치에 접근한다.                                                                                          |
| Memory Hardware Abstraction        | 메모리 장치의 위치(온칩, 보드 위)와 ECU 하드웨어 배치를 감추고, 내부·외부 메모리 장치와 메모리 종류(EEPROM(Electrically Erasable Programmable Read-Only Memory), Flash)에 같은 접근 방법을 준다. Flash 위에서 EEPROM을 흉내 내는 Flash EEPROM Emulation도 여기에 든다.            |
| Crypto Hardware Abstraction        | 암호 기능이 내부 하드웨어, 외부 하드웨어, 소프트웨어 가운데 어디에 있는지를 감춘다.                                                                                                                                             |
| Communication Hardware Abstraction | 통신 컨트롤러의 위치와 ECU 하드웨어 배치를 감춘다. [[lin\|LIN]], [[can\|CAN]], [[flexray\|FlexRay]] 같은 통신 시스템마다 따로 둔다. CAN Interface, CAN Transceiver Driver, [[ethernet\|Ethernet]] Interface가 여기에 든다. |
| I/O Hardware Abstraction           | 주변 I/O 장치의 위치와 ECU 하드웨어 배치(마이크로컨트롤러 핀 연결, 신호 레벨 반전 등)를 감추고, I/O 신호를 ECU 하드웨어에 연결된 모양 그대로(전류, 전압, 주파수 등) 나타낸다.                                                  |

마이크로컨트롤러 안에 있는 암호 장치의 예로 SHE(Secure Hardware Extension)와 HSM(Hardware Security Module)이 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## External driver

마이크로컨트롤러 밖, ECU 하드웨어 위에 있는 장치를 **external device**라 한다. 외부 EEPROM, 외부 watchdog, 외부 Flash가 그 예다. external device의 드라이버인 **external driver**는 ECU Abstraction Layer에 놓이고, MCAL의 드라이버를 거쳐 장치에 접근한다. 예를 들어 SPI(Serial Peripheral Interface)로 연결된 외부 EEPROM의 드라이버는 SPI 버스의 handler/driver를 거쳐 EEPROM에 접근한다. 다만 메모리 맵 방식 외부 장치(외부 Flash 등)의 드라이버는 마이크로컨트롤러에 직접 접근할 수 있고 마이크로컨트롤러에 의존하므로 MCAL에 놓인다. 이 방식 덕분에 AUTOSAR는 SBC(System Basis Chip)에 통합된 transceiver, watchdog 같은 구성 요소도 지원한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## Watchdog Interface

Watchdog Interface는 Onboard Device Abstraction에 드는 BSW 모듈이다. ECU가 watchdog 드라이버를 여럿 쓸 때(예: 내부 소프트웨어 watchdog과 외부 하드웨어 watchdog), Watchdog Interface는 아래 드라이버의 API와 기능을 그대로 두면서 위 모듈이 알맞은 드라이버를 고르게 하고, 모드 전환과 trigger condition 설정 같은 드라이버 서비스에 한결같은 접근을 준다. 드라이버는 매개변수 DeviceIndex로 고르며, 드라이버가 하나만 구성되면 DeviceIndex는 무시된다. 외부 watchdog 드라이버는 내부 watchdog 드라이버와 의미가 같은 API를 가져야 한다.[@autosar-cp-sws-watchdoginterface-2025] Watchdog Manager는 Watchdog Interface를 거쳐 watchdog 드라이버의 서비스를 쓴다.[@autosar-cp-sws-watchdogmanager-2025]
