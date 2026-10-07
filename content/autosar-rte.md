---
title: AUTOSAR RTE
aliases:
  - RTE
tags:
  - platform/autosar
verified: 2026-09-30
---

**RTE**(Run-Time Environment)는 특정 ECU에서 AUTOSAR [[virtual-functional-bus|VFB]]의 인터페이스를 구현한 것이다. RTE는 [[autosar-software-component|SW-C]] 사이의 통신과, SW-C가 BSW(Basic Software) 모듈에 접근하는 수단을 제공한다. SW-C는 BSW 모듈에 직접 접근하지 못하며, SW-C의 통신은 모두 자기 [[software-component-port|포트]]를 거쳐 RTE의 통제 아래 이루어진다. SW-C 안의 모든 활동은 RTE가 [[rte-event|RTE 이벤트]]에 따라 [[runnable-entity|runnable]]을 촉발하면서 시작된다.[@autosar-cp-sws-rte-2025]

## 생성되는 코드

RTE는 ECU마다 하나씩 생성된다. RTE 생성기는 [[autosar-methodology#ECU 설정|ECU Configuration Values]]의 정보로 그 ECU에서 VFB를 구현하는 코드를 만든다. 다만 RTE 명세는 RTE의 전부나 일부를 생성하지 않고 설정하는 구현도 허용한다.[@autosar-cp-sws-rte-2025]

SW-C에 대한 RTE 생성은 크게 두 단계다.[@autosar-cp-sws-rte-2025]

- **RTE contract phase**: component 하나에 대한 제한된 정보, 주로 AUTOSAR 인터페이스 정의로 그 component type의 application header 파일을 만든다. 이 파일은 component와 RTE 사이의 계약(contract)을 정한다.
- **RTE generation phase**: component에 관한 모든 관련 정보와, component를 ECU에 배치한 정보, 통신 연결 정보로 RTE를 생성한다.[@autosar-cp-sws-rte-2025]

RTE 생성기는 component type마다 application header 파일을 만든다. 이 파일은 SW-C가 RTE를 쓰는 데 필요한 API(Application Programming Interface)와 데이터 구조를 정의하며, SW-C 소스 파일은 이 파일을 include한다. 파일 이름은 `Rte_<name>.h`이고, `<name>`은 component type의 symbol이다.[@autosar-cp-sws-rte-2025]

같은 파티션 안의 통신에는 RTE가 내부 버퍼와 큐를 쓸 수 있다. 같은 ECU의 다른 파티션 사이 통신에는 [[inter-os-application-communicator|IOC]]나 trusted function call 같은 [[autosar-os|운영체제]]의 메커니즘을 쓸 수 있다. ECU 사이 통신에는 보통 [[autosar-com|AUTOSAR COM]]을 쓴다. primitive [[autosar-sender-receiver-interface#Data element|data element]]를 다른 ECU로 보낼 때 RTE는 그 data element가 매핑된 시그널마다 `Com_SendSignal`을 부른다.[@autosar-cp-sws-rte-2025]

![[diagrams/rte-communication-mechanisms.svg]]

## API 이름 규칙

RTE API 이름은 API의 기능을 나타내는 API root 이름과 access point를 합쳐 만든다. 포트를 거치는 API의 access point에는 포트 이름과 data element나 operation의 이름이 들어간다. C와 C++에서 RTE API 이름은 `Rte_`로 시작한다. 예를 들어 `Rte_Write_<p>_<o>`에서 `<p>`는 포트 이름이고, `<o>`는 그 포트의 sender-receiver 인터페이스에 있는 data element다.[@autosar-cp-sws-rte-2025]

API root마다 쓰임은 아래와 같다.[@autosar-cp-sws-rte-2025]

| API                           | 쓰임                                                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `Rte_Write`, `Rte_Read`       | queued가 아닌 [[autosar-sender-receiver-interface\|sender-receiver]] data element를 명시적으로 쓰고 읽는다.                       |
| `Rte_Send`, `Rte_Receive`     | queued인 sender-receiver data element를 명시적으로 보내고 받는다.                                                                 |
| `Rte_IWrite`, `Rte_IRead`     | runnable이 쓰기나 읽기로 선언한 data element에 암묵적으로 쓰고 읽는다.                                                            |
| `Rte_Call`                    | [[autosar-client-server-interface\|client-server]] 통신을 시작한다.                                                               |
| `Rte_Result`                  | 비동기 client-server 호출의 결과를 받는다.                                                                                        |
| `Rte_Switch`                  | [[autosar-mode-switch-interface\|mode switch]] 인터페이스의 모드 전환을 시작한다.                                                 |
| `Rte_Mode`                    | mode switch 포트에서 지금 활성인 모드를 준다.                                                                                     |
| `Rte_Enter`, `Rte_Exit`       | [[runnable-entity#Exclusive area\|exclusive area]]에 들어가고 나온다.                                                             |
| `Rte_IrvWrite`, `Rte_IrvRead` | 명시적 접근으로 정한 [[runnable-entity#Inter-runnable 변수\|inter-runnable 변수]]를 쓰고 읽는다.                                  |
| `Rte_Trigger`                 | trigger 포트에서 external trigger를 일으킨다. 그러면 그 trigger에 ExternalTriggerOccurredEvent가 연결된 runnable이 모두 실행된다. |

암묵적 접근 API는 이름에 runnable 이름도 넣는다. `Rte_IRead_<re>_<p>_<o>`에서 `<re>`는 runnable의 short name이다.[@autosar-cp-sws-rte-2025]

component type이 multiple instantiation을 지원하면, 여러 인스턴스에 쓸 수 있는 RTE API는 첫 인자로 인스턴스 핸들을 받는다. 지원하지 않으면 이 인자가 없다.[@autosar-cp-sws-rte-2025]

## RTE 설정

RTE 모듈의 ECU 설정에서 `RteSwComponentInstance` 컨테이너는 설정할 ECU에 놓인 SW-C prototype 하나를 나타내며, 그 prototype을 `RteSoftwareComponentInstanceRef`로 가리킨다. 그 아래의 `RteEventToTaskMapping` 컨테이너는 runnable을 [[osek-task|태스크]]에 매핑한다.[@autosar-cp-sws-rte-2025] 이 매핑은 [[rte-event#태스크 매핑|RTE 이벤트]]에서 다룬다.

## 측정과 캘리브레이션

측정과 캘리브레이션은 서로 구별되는 두 메커니즘이다. **측정**은 ECU 사이, 파티션 사이, 파티션 안, SW-C 안의 통신 데이터를 감시하는 것처럼 ECU 안에서 일어나는 일을 재는 것이다. **캘리브레이션**은 측정 데이터를 바탕으로 실행 중 소프트웨어 스위치, 제어 데이터, 보간 곡선이나 보간 필드 같은 파라미터를 바꿔 ECU의 동작을 고치는 것이고, 이 파라미터를 **캘리브레이션 파라미터**라 한다.[@autosar-cp-sws-rte-2025]

캘리브레이션은 두 상황으로 나뉜다. **오프라인 캘리브레이션**은 ECU가 도는 동안 측정하고, ECU를 끈 뒤 캘리브레이션 파라미터를 바꿔 새 프로그램 파일을 만들어 다시 플래시에 쓰는 일을 되풀이한다. **온라인 캘리브레이션**은 측정과 캘리브레이션을 함께 하며, ECU를 다시 쓰지 않고 실행 중에 파라미터를 잠시 바꿔 가며 맞춘 뒤, 그 결과로 새 프로그램 파일을 만든다.[@autosar-cp-sws-rte-2025]

RTE와 [[basic-software-scheduler|SchM]]은 캘리브레이션 파라미터를 할당하고 그 파라미터를 쓰는 소프트웨어가 접근하게 하는 일을 지원해야 하지만, 캘리브레이션 값을 주고받거나 ECU와 외부 캘리브레이션 도구 사이에서 나르는 일은 대개 맡지 않는다. 외부 캘리브레이션 도구와 데이터를 주고받는 일은 [[autosar-communication-stack#그 밖의 모듈|XCP]] 드라이버 같은 BSW가 다룬다.[@autosar-cp-sws-rte-2025]

## Bypass

Rapid prototyping은 ECU 개발 중에 새 제어 알고리즘을 평가하고 시험하는 데 쓰며, fullpass와 bypass로 나뉜다. Fullpass는 원래 ECU를 RPU(Rapid Prototyping Unit)로 통째로 바꾼다. Bypass는 원래 ECU와 소프트웨어를 제어 루프에 남겨 둔 채, 시험할 알고리즘만 RPU로 옮기거나(external bypass) 원래 ECU 안에서 실행한다(internal bypass). Bypass는 주로 원래 알고리즘의 입력이나 출력을 실행 중에 시험할 알고리즘이 계산한 값으로 바꾼다. RTE는 bypass를 직접 구현하지 않고, [[autosar-layered-architecture#층 사이 접근|Complex Driver]]나 [[autosar-layered-architecture#Integration Code와 callout|Integration Code]]가 구현하도록 돕는다.[@autosar-cp-sws-rte-2025]

![[diagrams/rapid-prototyping-fullpass-bypass.svg]]

RTE가 돕는 방법은 셋이다.[@autosar-cp-sws-rte-2025]

- **Component wrapper**: bypass를 구현하는 Complex Driver로 원래 SW-C의 구현을 감싼다. RTE는 bypass할 SW-C의 인터페이스 이름에 `Byps_` 삽입어를 넣어 생성한다.
- **Direct buffer access**: ECU 통신을 구현하는 RTE 버퍼를 실행 중에 바로 읽고 쓰게 한다. RTE는 이 버퍼를 기술하는 McSupportData를 생성한다.
- **Extended buffer access**: bypass 사용자가 RTE를 다시 생성할 수 없는 경우를 위한 것이다. RTE API로 주고받는 모든 VariableDataPrototype을 rapid prototyping 도구가 고칠 수 있는 RP(Rapid Prototyping) global buffer를 거쳐 쓰고 읽게 한다.[@autosar-cp-sws-rte-2025]

Extended buffer access에는 준비 수준이 셋 있다. Level 1은 빌드가 끝난 바이너리에서 버퍼 쓰기를 고쳐 bypass 값을 넣는 post-build hooking 도구를 위한 것이고, level 2와 3은 RTE를 생성할 때 bypass에 필요한 코드를 넣어 그 뒤 바이너리를 고치지 않는 non post-build hooking을 위한 것이다. Level 2는 RP global buffer에 더해 그 버퍼를 갱신할지 정하는 RP enabler flag를 두고, level 3은 여기에 ECU가 만든 원래 값과 rapid prototyping이 바꾼 값을 함께 기록한다.[@autosar-cp-sws-rte-2025]

RP global buffer에는 [[can|CAN]]이나 [[ethernet|이더넷]] 위의 XCP 같은 RP service component를 ECU에 더해 서비스로 접근할 수도 있다. 이 서비스는 빌드 전에 소스 코드로 통합하거나, 빌드가 끝난 ECU 이미지의 바이너리를 고쳐 통합한다. RTE 생성기는 RapidPrototypingScenario의 RptProfile과 RptContainer에 따라 runnable 실행 앞뒤에 RP service function 호출을 넣는다.[@autosar-cp-sws-rte-2025]

## 통신 데이터의 주기 처리

RTE는 ComData(시그널이나 시그널 그룹)를 주기적으로 받는 처리를 둔다. RTE는 ComData에 매핑된 VariableDataPrototype을 태스크에 매핑한 설정(`RteComDataMapping`)에 따라 주기 함수 `Rte_ComDataMainFunction`을 생성하고, 매핑된 태스크 안의 정한 자리에서 실행한다. 이 처리는 명시적 읽기로 접근하는 sender-receiver 통신에만 쓸 수 있고, client-server 통신, trigger 통신, 암묵적 읽기·쓰기에는 쓸 수 없다.[@autosar-cp-sws-rte-2025]

AUTOSAR R25-11은 응용이 통신 시그널이 ECU 사이의 것인지 ECU 안의 것인지에서 더 독립되게 하는 COM Handler 개념을 둔다. 이 개념은 코드 변경을 줄이고 재사용성과 유연성을 높이며, 이를 위해 통신 오류를 추상화하고, 데이터 무결성, 수신 deadline, 데이터 무효, 값 범위의 오류를 감시해 보고한다.[@autosar-cp-tr-releaseoverview-2025]
