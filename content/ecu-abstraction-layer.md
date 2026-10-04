---
title: ECU abstraction layer
tags:
  - platform/autosar
verified: 2026-09-30
---

**ECU Abstraction Layer**는 [[autosar-layered-architecture|AUTOSAR 계층 구조]]에서 BSW(Basic Software)를 이루는 층 가운데 하나로, [[microcontroller-abstraction-layer|MCAL]] 위, Services Layer 아래에 놓인다. 이 층은 MCAL의 드라이버와 맞닿고 외부 장치의 드라이버를 담으며, 위 계층에 주변장치와 장치에 접근하는 API(Application Programming Interface)를 준다. 이 API는 주변장치가 마이크로컨트롤러 안에 있는지 밖에 있는지, 마이크로컨트롤러에 어떻게 연결됐는지(포트 핀, 인터페이스 종류)와 상관없이 쓸 수 있어, 위 계층을 ECU 하드웨어 배치에서 독립시킨다. 이 층의 구현은 마이크로컨트롤러에 독립적이고 ECU 하드웨어에 의존한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/autosar-layered-software-architecture.svg]]

## 그룹

ECU Abstraction Layer는 Onboard Device Abstraction, [[autosar-memory-stack|Memory Hardware Abstraction]], Crypto Hardware Abstraction, Wireless Communication Hardware Abstraction, [[autosar-communication-stack|Communication Hardware Abstraction]], [[io-hardware-abstraction|I/O Hardware Abstraction]] 그룹으로 나뉜다. Wireless Communication Hardware Abstraction을 뺀 다섯 그룹이 하는 일은 아래와 같다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

| 그룹                               | 하는 일                                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Onboard Device Abstraction         | 센서도 액추에이터도 아닌, ECU 보드에 달린 장치(내부·외부 watchdog 등)를 다루는 드라이버가 여기에 든다. 이 드라이버는 MCAL을 통해 장치에 닿는다. |
| Memory Hardware Abstraction        | 메모리 장치가 칩 안에 있는지 보드에 있는지와 ECU 하드웨어의 배치를 가린다.                                                                      |
| Crypto Hardware Abstraction        | 암호 기능이 칩 안팎의 하드웨어와 소프트웨어 가운데 어디서 구현되는지를 가린다.                                                                  |
| Communication Hardware Abstraction | 통신 컨트롤러가 어디에 있고 ECU 하드웨어가 어떻게 짜였는지를 가린다.                                                                            |
| I/O Hardware Abstraction           | I/O 장치가 어디 있는지와 ECU 하드웨어가 어떻게 짜였는지를 가린다.                                                                               |

마이크로컨트롤러 안에 있는 암호 장치의 예로 SHE(Secure Hardware Extension)와 HSM(Hardware Security Module)이 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

중국 V2X(Vehicle-to-X) 표준을 따르는 통신 스택의 예에서는, SPI(Serial Peripheral Interface)로 이은 외부 cellular V2X 컨트롤러의 드라이버가 Wireless Communication Hardware Abstraction에 놓이고, 마이크로컨트롤러에 든 cellular V2X 컨트롤러의 드라이버는 MCAL의 Wireless Communication Drivers에 놓인다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## External driver

마이크로컨트롤러 바깥, ECU 보드에 달린 장치를 **external device**라 한다. 외부 EEPROM(Electrically Erasable Programmable Read-Only Memory), 외부 watchdog, 외부 플래시가 그 예다. external device의 드라이버인 **external driver**는 ECU Abstraction Layer에 놓이고, MCAL의 드라이버를 거쳐 장치에 접근한다. 예를 들어 SPI로 연결된 외부 EEPROM의 드라이버는 SPI 버스를 다루는 MCAL 쪽 handler나 드라이버를 통해 EEPROM에 닿는다. 다만 메모리 맵 방식 외부 장치(외부 플래시 등)의 드라이버는 마이크로컨트롤러에 직접 접근할 수 있고 마이크로컨트롤러에 의존하므로 MCAL에 놓인다. 이렇게 나눈 덕분에 transceiver와 watchdog처럼 SBC(System Basis Chip) 안에 들어간 부품도 AUTOSAR로 다룰 수 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/autosar-internal-external-driver-placement.svg]]

## Watchdog Interface

**Watchdog Interface**는 Onboard Device Abstraction에 드는 BSW 모듈이다. ECU가 watchdog 드라이버를 여럿 쓸 때(예: 내부 소프트웨어 watchdog과 외부 하드웨어 watchdog), Watchdog Interface는 아래 드라이버의 API와 기능을 그대로 두면서 위 모듈이 알맞은 드라이버를 고르게 하고, 모드 전환과 trigger condition 설정 같은 드라이버 서비스에 한결같은 접근을 준다. 드라이버는 매개변수 DeviceIndex로 고르며, 드라이버가 하나만 구성되면 DeviceIndex는 무시된다. 외부 watchdog 드라이버는 내부 watchdog 드라이버와 의미가 같은 API를 가져야 한다.[@autosar-cp-sws-watchdoginterface-2025] Watchdog Manager는 Watchdog Interface를 거쳐 watchdog 드라이버의 서비스를 쓴다.[@autosar-cp-sws-watchdogmanager-2025]
