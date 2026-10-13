---
title: AUTOSAR 계층 구조
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR 계층 구조**는 [[autosar-classic-platform|AUTOSAR Classic Platform]]이 가장 높은 추상 수준에서 소프트웨어를 응용 계층(Application Layer), RTE, BSW(Basic Software) 세 층으로 나누고, 이 층들을 마이크로컨트롤러 위에서 돌리는 구조다. 아래 층일수록 하드웨어에 의존하고, 위 층일수록 하드웨어에서 독립적이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 적용 범위와 확장

AUTOSAR가 말하는 ECU는 마이크로컨트롤러 하나와 그 주변장치, 그에 딸린 소프트웨어와 설정이며, 기계적 설계는 AUTOSAR의 범위 밖이다. 그래서 한 하우징에 마이크로컨트롤러가 여럿 있으면 마이크로컨트롤러마다 AUTOSAR ECU 인스턴스의 기술을 따로 둔다. 표준 모듈은 기능을 넓혀도 규격을 따르는 것으로 남지만, 그 설정은 BSW 자동 설정 과정에서 고려해야 한다. 표준이 아닌 모듈은 Complex Driver로 통합할 수 있고, 층을 더할 수는 없다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 최상위 층

Application Layer에는 [[autosar-software-component|SW-C]]와 Sensor/Actuator SW-C로 이루어진 응용 소프트웨어가 놓인다. Sensor/Actuator SW-C는 마이크로컨트롤러와 ECU 하드웨어에서는 독립적이지만 센서와 액추에이터에는 의존한다. SW-C는 RTE를 거쳐 다른 SW-C나 서비스와 통신하며, 상대가 같은 ECU에 있든 다른 ECU에 있든 마찬가지다. RTE는 SW-C를 특정 ECU에 매핑되는 것에서 독립적으로 만들고, RTE의 위쪽 인터페이스는 ECU에서 완전히 독립적이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

BSW는 ECU의 기반 기능을 주는 소프트웨어로, Integration Code와 Standard Software로 이루어진다.[@autosar-fo-tr-glossary-2025] BSW는 입출력(센서, 액추에이터, ECU 탑재 주변장치), 메모리, 암호 기능, 차량 네트워크 통신, 차량 밖 통신에 표준화된 접근을 주고, 시스템 서비스를 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## BSW의 층

BSW는 다시 Services Layer, [[ecu-abstraction-layer|ECU Abstraction Layer]], [[microcontroller-abstraction-layer|MCAL]], Complex Drivers 층으로 나뉜다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/autosar-layered-software-architecture.svg]]

| 층                    | 하는 일                                                                                                                                                                                                                    | 구현의 하드웨어 의존                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Services Layer        | BSW의 가장 위 층. [[autosar-os\|운영체제]] 기능, 차량 네트워크 통신과 관리, NVRAM(Non-Volatile Random-Access Memory)을 관리하는 메모리 서비스, 진단, ECU의 상태와 모드 관리 같은 기본 서비스를 응용, RTE, BSW 모듈에 준다. | 대부분 마이크로컨트롤러와 ECU 하드웨어에서 독립 |
| ECU Abstraction Layer | MCAL의 드라이버와 외부 장치의 드라이버를 담아, 장치가 마이크로컨트롤러 안에 있든 밖에 있든, 마이크로컨트롤러에 어떻게 연결되든 같은 API로 주변장치와 장치에 접근하게 한다.                                                 | 마이크로컨트롤러에서 독립, ECU 하드웨어에 의존  |
| MCAL                  | BSW의 가장 아래 층. 마이크로컨트롤러와 내부 주변장치에 직접 접근하는 내부 드라이버를 담는다.                                                                                                                               | 마이크로컨트롤러에 의존                         |
| Complex Drivers       | 하드웨어에서 RTE까지 걸친 층. AUTOSAR가 규정하지 않은 장치나 타이밍 제약이 매우 엄격한 장치의 드라이버처럼 특수 목적 기능을 통합하게 한다. 예로 분사 제어가 있다.                                                          | —                                               |

Services Layer는 기능에 따라 System Services, [[autosar-memory-stack|Memory Services]], [[autosar-crypto-stack|Crypto Services]], [[autosar-communication-stack|Communication Services]], Off-board Communication Services로 나뉜다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

| 갈래                             | 내용                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| System Services                  | 운영체제, [[ecu-state-manager\|EcuM]], [[autosar-error-handling#Det\|Det]], [[diagnostic-event-manager\|Dem]], [[diagnostic-event-manager#FiM\|FiM]], WdgM(Watchdog Manager)이 든다. [[basic-software-mode-manager\|BswM]], [[basic-software-scheduler\|SchM]], [[autosar-communication-stack#통신 모드 관리\|ComM]], [[autosar-time-synchronization#StbM\|StbM]], Tm(Time Service), Arti(AUTOSAR Run-Time Interface), [[autosar-software-cluster#Software Cluster Connection\|SwCluC]]도 System Services에 든다.[@autosar-cp-sws-bswgeneral-2025] |
| Memory Services                  | [[nvram-manager\|NVRAM Manager]]와 [[autosar-memory-stack#BndM\|BndM]]이 든다.[@autosar-cp-sws-bswgeneral-2025]                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Crypto Services                  | 암호 primitive, IDS(Intrusion Detection System) 서비스, 키 저장을 응용에 한결같은 방식으로 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]                                                                                                                                                                                                                                                                                                                                                                                                 |
| Communication Services           | 차량 네트워크 통신을 맡고, [[autosar-network-management\|네트워크 관리]] 서비스를 준다.[@autosar-cp-sws-bswgeneral-2025]                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Off-board Communication Services | V2X(Vehicle-to-X) 통신, 차량 안 무선 네트워크, ECU의 차량 밖 통신에 표준화된 접근을 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]                                                                                                                                                                                                                                                                                                                                                                                                        |

MCAL의 Microcontroller Drivers에는 GPT(General Purpose Timer) 드라이버와 MCU 드라이버가 든다.[@autosar-cp-sws-bswgeneral-2025]

Off-board Communication Services에는 V2X 모듈 다섯과 중국 V2X 모듈 넷이 든다.[@autosar-cp-sws-bswgeneral-2025] AUTOSAR R25-11은 이 아홉 모듈의 명세를 모두 obsolete로 돌렸다.[@autosar-cp-tr-releaseoverview-2025]

## 모듈 유형

BSW 모듈은 driver, interface, handler, manager 네 유형으로 나뉜다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

- **Driver**: 내부나 외부 장치를 제어하고 그 장치에 접근하는 기능을 담는다. 마이크로컨트롤러 안의 장치를 다루는 [[microcontroller-abstraction-layer#Internal driver|internal driver]]는 MCAL에, 마이크로컨트롤러 밖 장치를 다루는 [[ecu-abstraction-layer#External driver|external driver]]는 대개 ECU Abstraction Layer에 놓인다.
- **Interface**: 아래에 놓인 모듈을 추상화해, 같은 종류의 장치가 몇 개이든 하드웨어로 어떻게 구현되든 그 종류의 장치에 접근하는 일반 API를 준다. 데이터의 내용은 바꾸지 않으며, 대개 ECU Abstraction Layer에 놓인다.
- **Handler**: 클라이언트 하나나 여럿이 드라이버 하나나 여럿에 동시에, 여러 번, 비동기로 접근하는 것을 제어하는 특수한 interface로, 버퍼링, 큐잉, 중재, 다중화를 한다. 데이터의 내용은 바꾸지 않으며, 그 기능이 드라이버나 interface에 합쳐진 경우가 많다. 예로 [[autosar-adc-driver|ADC Driver]]가 있다.
- **Manager**: 여러 클라이언트에 특정 서비스를 주는 모듈로, handler 기능만으로는 여러 클라이언트를 추상화하기에 모자랄 때 쓴다. handler 기능에 더해 데이터의 내용을 평가하고 바꿀 수 있으며, 대개 Services Layer에 놓인다. 예로 내부·외부 메모리 장치에 대한 동시 접근을 관리하는 NVRAM Manager가 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 층 사이 접근

BSW의 층 사이에는 일반 규칙이 있다. 한 층은 바로 아래 층의 모든 인터페이스에 접근할 수 있고, 한 층을 건너뛰는 것은 피해야 하며, 둘 이상을 건너뛰는 것은 허용하지 않는다. MCAL을 건너뛰는 것도 허용하지 않는다. 같은 층 안의 수평 인터페이스는 Services Layer와 ECU Abstraction Layer에서 허용하지만 MCAL에서는 허용하지 않으며, 성능 때문에 설정할 수 있는 notification만 예외로 둔다. 모든 층은 System Services와 상호작용할 수 있고, 한 모듈은 다른 층 묶음의 아래 층 모듈에 접근할 수 있다. 외부 하드웨어를 위해 SPI(Serial Peripheral Interface)를 쓰는 것이 그 예다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

**Layer Interaction Matrix**는 BSW 층 사이에 허용된 상호작용을 보이는 규범 행렬로, 행 방향으로 읽는다. 예를 들어 I/O Drivers 행은 I/O Drivers가 System Services와 하드웨어만 쓸 수 있고 다른 층은 쓸 수 없다는 뜻이다. Complex Drivers 행은 다른 층에 제한된 접근만 한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

Complex Driver와 다른 모듈 사이의 접근에는 따로 규칙이 있다. 계층 구조의 모듈이 Complex Driver에 접근하는 것은 Complex Driver가 접근하는 모듈 쪽에서 일반적으로 설정할 수 있는 인터페이스를 줄 때만 허용한다. 예로 Complex Driver가 새 버스 시스템의 interface 모듈을 구현하면 [[pdu-router|PDU Router]]의 설정이 이를 다룬다. 거꾸로 Complex Driver가 계층 구조의 모듈에 접근하는 것은 그 모듈이 인터페이스를 주고 Complex Driver의 접근에 대비되어 있을 때만 허용한다. 대비되어 있다는 것은 보통 인터페이스가 재진입할 수 있고, callback을 쓰면 그 이름을 설정할 수 있으며, 그 모듈의 상태를 관리하는 상위 모듈이 없다는 뜻이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

Complex Driver가 대개 접근할 수 있는 모듈은 아래와 같다. 그래도 모듈마다 그 함수가 재진입할 수 있는지 확인해야 하며, `init` 함수는 대개 재진입할 수 없어 EcuM만 불러야 한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

- SPI 드라이버와 GPT 드라이버
- I/O 드라이버. 재진입은 대개 group이나 channel이 다를 때만 되므로, 같은 group이나 channel에 함께 접근하지 않도록 설정에서 챙긴다.
- 메모리 스택에 접근할 때 거치는 NVRAM Manager, watchdog 스택에 접근할 때 거치는 WdgM
- 통신 스택의 버스·프로토콜 독립 접근점인 PDU Router, 버스별 접근점인 버스별 interface 모듈, NM(Network Management) 스택의 접근점인 NM Interface 모듈
- 상태 관리의 접근점인 ComM(상위 층에서만)과 BswM
- Det, Dem, [[autosar-log-and-trace#Classic Platform의 Dlt|Dlt]]
- OS(Operating System). 쓰는 OS 객체를 계층 구조의 모듈이 쓰지 않을 때만[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

멀티코어에서는 규칙이 더 있다. 파티션과 코어 경계를 넘는 것은 master/satellite 구현으로 모듈 내부 통신에만 허용하므로, Complex Driver가 BSW의 standardized interface에 접근해야 하면 같은 코어에 있어야 한다. 다른 코어의 Complex Driver는 포트로 AUTOSAR interface와 standardized AUTOSAR interface에 접근할 수 있고, 그러면 RTE가 OS의 [[inter-os-application-communicator|IOC]]로 요청을 다른 코어에 넘긴다. 다른 코어에서 standardized interface가 필요하면, 그 인터페이스를 주는 satellite를 Complex Driver의 코어에서 돌려 호출을 넘기거나, Complex Driver의 stub 부분을 다른 코어에 두고 IOC로 Complex Driver 안에서 통신한다. 뒤의 경우 Complex Driver의 초기화 부분도 그 stub 부분에 둔다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

AUTOSAR R25-11 용어집은 **Complex Driver**를 AUTOSAR가 표준화하지 않았고 AUTOSAR Interface나 BSW 모듈 API로 접근하거나 접근받을 수 있는 소프트웨어 개체로 정의한다. 그 약어 CDD는 원래 Complex Device Driver를 뜻했지만, Complex Driver는 드라이버에 한정되지 않는다. AUTOSAR가 지원하지 않는 버스의 통신 스택, 기존 소프트웨어의 재사용, 하드웨어와 깊이 상호작용하는 소프트웨어의 통합이 그 예다.[@autosar-fo-tr-glossary-2025]

## Integration Code와 callout

**Integration Code**는 통합자가 표준화되지 않은 기능을 맞추려고 AUTOSAR 시스템에 더하는 코드로, EcuM의 callout과 여러 BSW 모듈의 callback이 그 예다. **Callout**은 AUTOSAR가 정할 수 없는 기능을 모듈에 더하도록 시스템 설계자가 코드로 바꿔 넣는 함수 stub이다. 모듈은 그런 기능, 곧 Integration Code를 실행하려고 callout을 부르고, 다른 모듈이 자기 처리를 시작하게 하려고는 callback을 준다. Callout은 필수 기능을 주어 하드웨어 추상화 층 구실을 하는 것과 선택 기능을 주는 것으로 나뉜다. EcuM의 `EcuM_EnableWakeupSources`가 앞의 예이고, 초기화 목록 `EcuM_AL_DriverInitZero`가 뒤의 예다.[@autosar-fo-tr-glossary-2025]

AUTOSAR R25-11의 BSW 일반 명세는 callout 함수마다 자기 메모리 섹션에 매핑하도록 요구한다. 모듈 개발자는 callout이 놓일 메모리 세그먼트를 모르고, 통합자는 그 함수를 모듈 설계와 따로 매핑할 수 있어야 하기 때문이다. BSW 모듈이 쓰도록 명세되거나 설정된 callout의 선언은 `<Mip>_Externals.h`에 둔다.[@autosar-cp-sws-bswgeneral-2025]

## BSW 분산

BSW 모듈은 파티션과 코어 여럿에 나눠 둘 수 있으며, 모든 파티션이 같은 코드를 함께 쓴다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

### 멀티코어

모듈은 파티션마다 완전히 똑같이 둘 수도 있고(I/O 스택의 [[autosar-dio-driver|DIO Driver]]), 코어에 따라 분기해 다르게 동작하게 할 수도 있다. [[autosar-com|COM]] 서비스와 [[autosar-pwm-driver|PWM Driver]]는 satellite로 들어온 호출을 master가 처리하는 master/satellite 통신을 쓴다. master와 satellite 사이의 통신은 표준화되지 않았으며, BSW scheduler의 함수나 공유 메모리로 구현할 수 있다. IOC는 같은 ECU 안에서 OS-Application 경계를 넘어 통신하는 클라이언트에 통신 서비스를 주며, OS의 일부다. ComM처럼 여러 코어에서 실행될 수 있는 BSW 모듈은 서비스를 실행할 코어가 실행 중에 정해진다. 코어마다 저마다 ECU 상태 관리가 돈다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

여러 BSW 파티션에서 접근해야 하는 모듈은 master/satellite 패턴으로 구현할 수 있다. master와 satellite가 일을 나누는 방식은 구현마다 다르다. 한끝에서는 satellite가 같은 파티션의 다른 모듈에 인터페이스만 주고 요청을 모두 master로 넘기며, 다른 끝에서는 satellite가 기능을 모두 로컬로 주고 필요할 때만 내부 상태를 master와 맞춘다. master는 satellite의 요청을 조정하고, 들어오는 요청을 거르거나 감시할 수 있다. master와 satellite는 늘 같은 벤더의 구현이고, 다른 모듈에는 기존 모듈과 같은 인터페이스를 준다. 둘 사이의 통신은 표준화되지 않았고 모듈 내부의 일로 보아 다른 모듈에 드러나지 않는다. 파티션으로 나눈 시스템에서 system service의 표준 해법은 master/satellite 구현이다.[@autosar-cp-exp-bswdistributionguide-2025]

![[diagrams/bsw-master-satellite.svg]]

BSW 할당 지원은 AUTOSAR 4.0.3과 하위 호환되는 변경으로 묶여 있어, master와 satellite 사이의 통신과 BSW functional cluster 및 그 AUTOSAR BSW Cluster Interface가 표준화되지 않은 한계가 있다.[@autosar-cp-tr-releaseoverview-2025]

### 안전 관련 ECU

안전 관련 ECU를 위한 방법은 둘이다. 하나는 BSW 모듈을 모두 요구되는 [[automotive-safety-integrity-level|ASIL]]로 개발하는 것이고, 다른 하나는 고른 모듈만 ASIL로 개발하고 ASIL 모듈과 비ASIL 모듈을 서로 다른 파티션에 나누는 것(BSW 분산)이다. 파티션은 [[autosar-os-application|OS-Application]]을 바탕으로 한다. 두 번째 방법의 예로, watchdog 스택(WdgM, WdgIf(Watchdog Interface), Wdg(Watchdog Driver))을 ASIL BSW 파티션에 따로 두고 나머지 BSW를 QM(Quality Management) BSW 파티션에 두면, ASIL SW-C와 비ASIL SW-C가 모두 RTE를 거쳐 WdgM에 접근할 수 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/bsw-asil-qm-partitions.svg]]

## 인터페이스

인터페이스는 세 종류로 나뉜다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

- **AUTOSAR Interface**: SW-C와 BSW 모듈 사이에 오가는 정보를 정의하는 인터페이스다. 특정 프로그래밍 언어, ECU, 네트워크 기술과 상관없이 기술하며, SW-C와 BSW 모듈의 [[software-component-port|포트]]를 정의하는 데 쓴다. SW-C와 RTE 사이에 쓰이고, ECU Abstraction과 Complex Drivers가 RTE와 만나는 곳에도 쓰인다.
- **Standardized AUTOSAR Interface**: 문법과 의미를 AUTOSAR가 표준으로 정한 AUTOSAR Interface다. 주로 BSW가 응용 SW-C에 주는 표준 서비스인 AUTOSAR Services를 정의하는 데 쓴다.
- **Standardized Interface**: AUTOSAR Interface 기법을 쓰지 않고 AUTOSAR가 표준화한 API로, 보통 C 같은 특정 프로그래밍 언어로 정의한다. 그래서 같은 ECU 안의 모듈 사이에 쓰이며, 이 인터페이스를 거치는 통신은 네트워크로 보낼 수 없다. BSW 모듈 사이, RTE와 운영체제 사이, RTE와 통신 모듈 사이에 쓴다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

이 인터페이스로 오가는 통신을 구현하는 RTE를 ECU마다 생성하는 과정은 [[autosar-rte#생성되는 코드|AUTOSAR RTE]]에서 다룬다.

인터페이스는 관련 범위에 따라 [[virtual-functional-bus|VFB]] & RTE relevant, RTE relevant, BSW relevant로도 나뉜다. BSW 안에는 AUTOSAR가 규정하지 않은 인터페이스도 있을 수 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]
