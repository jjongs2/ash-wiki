---
title: ECU abstraction layer
tags:
  - platform/autosar
verified: 2026-09-30
---

**ECU Abstraction Layer**는 [[autosar-layered-architecture|AUTOSAR 계층 구조]]에서 BSW(Basic Software)를 이루는 층 가운데 하나로, [[microcontroller-abstraction-layer|MCAL]] 위, [[autosar-layered-architecture#BSW의 층|Services Layer]] 아래에 놓인다. 이 층은 MCAL의 드라이버와 맞닿고, 외부 플래시 같은 메모리 맵 방식 장치를 뺀 외부 장치의 드라이버를 담으며, 위 계층에 주변장치와 장치에 접근하는 API를 준다. 이 API는 주변장치가 마이크로컨트롤러 안에 있는지 밖에 있는지, 마이크로컨트롤러에 어떻게 연결됐는지(포트 핀, 인터페이스 종류)와 상관없이 쓸 수 있어, 위 계층을 ECU 하드웨어 배치에서 독립시킨다. 이 층의 구현은 마이크로컨트롤러에 독립적이고 ECU 하드웨어에 의존한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/autosar-layered-software-architecture.svg]]

## 그룹

ECU Abstraction Layer는 Onboard Device Abstraction, [[autosar-memory-stack|Memory Hardware Abstraction]], [[autosar-crypto-stack#Crypto Interface와 Crypto Driver|Crypto Hardware Abstraction]], Wireless Communication Hardware Abstraction, [[autosar-communication-stack|Communication Hardware Abstraction]], [[io-hardware-abstraction|I/O Hardware Abstraction]] 그룹으로 나뉜다. Wireless Communication Hardware Abstraction을 뺀 다섯 그룹이 하는 일은 아래와 같다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

| 그룹                               | 하는 일                                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Onboard Device Abstraction         | 센서도 액추에이터도 아닌, ECU 보드에 달린 장치(내부·외부 [[safety-mechanism#Watchdog\|watchdog]] 등)를 다루는 드라이버가 여기에 든다. 이 드라이버는 MCAL을 통해 장치에 닿는다. |
| Memory Hardware Abstraction        | 메모리 장치가 칩 안에 있는지 보드에 있는지와 ECU 하드웨어의 배치를 가린다.                                                                                                     |
| Crypto Hardware Abstraction        | 암호 기능이 칩 안팎의 하드웨어와 소프트웨어 가운데 어디서 구현되는지를 가린다.                                                                                                 |
| Communication Hardware Abstraction | 통신 컨트롤러가 어디에 있고 ECU 하드웨어가 어떻게 짜였는지를 가린다.                                                                                                           |
| I/O Hardware Abstraction           | I/O 장치가 어디 있는지와 ECU 하드웨어가 어떻게 짜였는지를 가린다.                                                                                                              |

마이크로컨트롤러 안에 있는 암호 장치의 예로 SHE(Secure Hardware Extension)와 [[hardware-security-module|HSM]]이 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

중국 V2X(Vehicle-to-X) 표준을 따르는 통신 스택의 예에서는, SPI(Serial Peripheral Interface)로 이은 외부 cellular V2X 컨트롤러의 드라이버가 Wireless Communication Hardware Abstraction에 놓이고, 마이크로컨트롤러에 든 cellular V2X 컨트롤러의 드라이버는 MCAL의 [[microcontroller-abstraction-layer#모듈 그룹|Wireless Communication Drivers]]에 놓인다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] AUTOSAR R25-11은 중국 V2X 명세를 포함한 V2X 명세들과 Cellular V2X Driver 명세를 obsolete로 돌렸다.[@autosar-cp-tr-releaseoverview-2025]

## External driver

마이크로컨트롤러 바깥, ECU 보드에 달린 장치를 **external device**라 한다. 외부 EEPROM, 외부 watchdog, 외부 플래시가 그 예다. external device의 드라이버인 **external driver**는 ECU Abstraction Layer에 놓이고, MCAL의 드라이버를 거쳐 장치에 접근한다. 예를 들어 SPI로 연결된 외부 EEPROM의 드라이버는 MCAL의 Communication Drivers에 드는 SPI Handler Driver를 거쳐 EEPROM에 닿는다. SPI Handler Driver는 여러 클라이언트가 SPI 버스 하나나 여럿에 함께 접근하게 하는 드라이버로, [[autosar-layered-architecture#모듈 유형|handler]] 기능을 드라이버에 합친 모듈이다. external driver가 이렇게 MCAL의 드라이버를 거쳐 접근하므로, transceiver와 watchdog처럼 SBC(System Basis Chip) 안에 들어간 부품도 AUTOSAR로 다룰 수 있다. 예외로, 메모리 맵 방식 외부 장치(외부 플래시 등)의 external driver는 마이크로컨트롤러에 직접 접근할 수 있고 마이크로컨트롤러에 의존하므로 MCAL에 놓인다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/autosar-internal-external-driver-placement.svg]]

## Watchdog Interface

**Watchdog Interface**는 Onboard Device Abstraction에 드는 BSW 모듈이다. ECU가 watchdog 드라이버를 여럿 쓸 때(예: 내부 소프트웨어 watchdog과 외부 하드웨어 watchdog), Watchdog Interface는 아래 드라이버의 API와 기능을 그대로 두면서 위 모듈이 알맞은 드라이버를 고르게 하고, 모드 전환과 trigger condition 설정 같은 드라이버 서비스에 한결같은 접근을 준다. 드라이버는 매개변수 DeviceIndex로 고르며, 드라이버가 하나만 구성되면 DeviceIndex는 무시된다. 외부 watchdog 드라이버는 내부 watchdog 드라이버와 의미가 같은 API를 가져야 한다.[@autosar-cp-sws-watchdoginterface-2025] [[safety-mechanism#오류 검출 기법|Watchdog Manager]]는 Watchdog Interface를 거쳐 watchdog 드라이버의 서비스를 쓴다.[@autosar-cp-sws-watchdogmanager-2025]
