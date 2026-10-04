---
title: AUTOSAR 계층 구조
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR 계층 구조**는 [[autosar-classic-platform|AUTOSAR Classic Platform]]이 가장 높은 추상 수준에서 소프트웨어를 응용 계층(Application Layer), RTE, BSW(Basic Software) 세 층으로 나누고, 이 층들을 마이크로컨트롤러 위에서 돌리는 구조다. 아래 층일수록 하드웨어에 의존하고, 위 층일수록 하드웨어에서 독립적이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 최상위 층

Application Layer에는 [[autosar-software-component|SW-C]]와 Sensor/Actuator SW-C로 이루어진 응용 소프트웨어가 놓인다. Sensor/Actuator SW-C는 마이크로컨트롤러와 ECU 하드웨어에서는 독립적이지만 센서와 액추에이터에는 의존한다. SW-C는 RTE를 거쳐 다른 SW-C나 서비스와 통신하며, 상대가 같은 ECU에 있든 다른 ECU에 있든 마찬가지다. RTE는 SW-C를 특정 ECU에 매핑되는 것에서 독립적으로 만들고, RTE의 위쪽 인터페이스는 ECU에서 완전히 독립적이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

BSW는 ECU의 기반 기능을 주는 소프트웨어로, Integration Code와 Standard Software로 이루어진다.[@autosar-fo-tr-glossary-2025] BSW는 입출력(센서, 액추에이터, ECU 탑재 주변장치), 메모리, 암호 기능, 차량 네트워크 통신, 차량 밖 통신에 표준화된 접근을 주고, 시스템 서비스를 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## BSW의 층

BSW는 다시 Services Layer, [[ecu-abstraction-layer|ECU Abstraction Layer]], [[microcontroller-abstraction-layer|MCAL]], Complex Drivers 층으로 나뉜다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/autosar-layered-software-architecture.svg]]

| 층                    | 하는 일                                                                                                                                                                                                                    | 구현의 하드웨어 의존                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Services Layer        | BSW의 가장 위 층. [[autosar-os\|운영체제]] 기능, 차량 네트워크 통신과 관리, NVRAM(Non-Volatile Random-Access Memory)을 관리하는 메모리 서비스, 진단, ECU의 상태와 모드 관리 같은 기본 서비스를 응용, RTE, BSW 모듈에 준다. | 대부분 마이크로컨트롤러와 ECU 하드웨어에서 독립 |
| ECU Abstraction Layer | MCAL의 드라이버와 외부 장치의 드라이버를 담아, 장치가 마이크로컨트롤러 안에 있든 밖에 있든, 마이크로컨트롤러에 어떻게 연결되든 같은 API(Application Programming Interface)로 주변장치와 장치에 접근하게 한다.              | 마이크로컨트롤러에서 독립, ECU 하드웨어에 의존  |
| MCAL                  | BSW의 가장 아래 층. 마이크로컨트롤러와 내부 주변장치에 직접 접근하는 내부 드라이버를 담는다.                                                                                                                               | 마이크로컨트롤러에 의존                         |
| Complex Drivers       | 하드웨어에서 RTE까지 걸친 층. AUTOSAR가 규정하지 않은 장치나 타이밍 제약이 매우 엄격한 장치의 드라이버처럼 특수 목적 기능을 통합하게 한다. 예로 분사 제어가 있다.                                                          | —                                               |

Services Layer는 기능에 따라 System Services, [[autosar-memory-stack|Memory Services]], Crypto Services, [[autosar-communication-stack|Communication Services]], Off-board Communication Services로 나뉜다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

| 갈래                             | 내용                                                                                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| System Services                  | 운영체제, EcuM(ECU State Manager), Det(Default Error Tracer), Dem(Diagnostic Event Manager), FiM(Function Inhibition Manager), WdgM(Watchdog Manager)이 든다.[@autosar-cp-sws-bswgeneral-2025] |
| Memory Services                  | [[nvram-manager\|NVRAM Manager]] 한 모듈로 이루어지며, 비휘발성 데이터를 관리한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]                                                           |
| Crypto Services                  | 암호 primitive, IDS(Intrusion Detection System) 서비스, 키 저장을 응용에 한결같은 방식으로 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]                                             |
| Communication Services           | 차량 네트워크 통신을 맡고, [[autosar-network-management\|네트워크 관리]] 서비스를 준다.[@autosar-cp-sws-bswgeneral-2025]                                                                       |
| Off-board Communication Services | V2X(Vehicle-to-X) 통신, 차량 안 무선 네트워크, ECU의 차량 밖 통신에 표준화된 접근을 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]                                                    |

MCAL의 Microcontroller Drivers에는 GPT(General Purpose Timer) 드라이버와 MCU 드라이버가 든다.[@autosar-cp-sws-bswgeneral-2025]

## 인터페이스

AUTOSAR R25-11 규격은 인터페이스를 세 종류로 나눈다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

- **AUTOSAR Interface**: SW-C와 BSW 모듈 사이에 오가는 정보를 정의하는 인터페이스다. 특정 프로그래밍 언어, ECU, 네트워크 기술과 상관없이 기술하며, SW-C와 BSW 모듈의 [[software-component-port|포트]]를 정의하는 데 쓴다. SW-C와 RTE 사이에 쓰이고, ECU Abstraction과 Complex Drivers가 RTE와 만나는 곳에도 쓰인다.
- **Standardized AUTOSAR Interface**: 문법과 의미를 AUTOSAR가 표준으로 정한 AUTOSAR Interface다. 주로 BSW가 응용 SW-C에 주는 표준 서비스인 AUTOSAR Services를 정의하는 데 쓴다.
- **Standardized Interface**: AUTOSAR Interface 기법을 쓰지 않고 AUTOSAR가 표준화한 API로, 보통 C 같은 특정 프로그래밍 언어로 정의한다. 그래서 같은 ECU 안의 모듈 사이에 쓰이며, 이 인터페이스를 거치는 통신은 네트워크로 보낼 수 없다. BSW 모듈 사이, RTE와 운영체제 사이, RTE와 통신 모듈 사이에 쓴다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

이 인터페이스로 오가는 통신을 구현하는 RTE를 ECU마다 생성하는 과정은 [[autosar-rte#생성되는 코드|AUTOSAR RTE]]에서 다룬다.

인터페이스는 관련 범위에 따라 [[virtual-functional-bus|VFB]] & RTE relevant, RTE relevant, BSW relevant로도 나뉜다. BSW 안에는 AUTOSAR가 규정하지 않은 인터페이스도 있을 수 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]
