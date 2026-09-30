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

RTE는 ECU마다 하나씩 생성된다. RTE 생성기는 ECU Configuration Description의 정보로 그 ECU에서 VFB를 구현하는 코드를 만든다. 다만 RTE 명세는 RTE의 전부나 일부를 생성하지 않고 설정하는 구현도 허용한다.[@autosar-cp-sws-rte-2025]

SW-C에 대한 RTE 생성은 크게 두 단계다.[@autosar-cp-sws-rte-2025]

- **RTE contract phase**: component 하나에 대한 제한된 정보, 주로 AUTOSAR 인터페이스 정의로 그 component type의 application header 파일을 만든다. 이 파일은 component와 RTE 사이의 계약(contract)을 정한다.
- **RTE generation phase**: component에 관한 모든 관련 정보와, component를 ECU에 배치한 정보, 통신 연결 정보로 RTE를 생성한다.[@autosar-cp-sws-rte-2025]

RTE 생성기는 component type마다 application header 파일을 만든다. 이 파일은 SW-C가 RTE를 쓰는 데 필요한 API(Application Programming Interface)와 데이터 구조를 정의하며, SW-C 소스 파일은 이 파일을 include한다. 파일 이름은 `Rte_<name>.h`이고, `<name>`은 component type의 symbol이다.[@autosar-cp-sws-rte-2025]

같은 파티션 안의 통신에는 RTE가 내부 버퍼와 큐를 쓸 수 있다. 같은 ECU의 다른 파티션 사이 통신에는 IOC나 trusted function call 같은 운영체제의 메커니즘을 쓸 수 있다. ECU 사이 통신에는 보통 AUTOSAR COM을 쓴다. primitive data element를 다른 ECU로 보낼 때 RTE는 그 data element가 매핑된 시그널마다 `Com_SendSignal`을 부른다.[@autosar-cp-sws-rte-2025]

![[diagrams/rte-communication-mechanisms.svg]]

## API 이름 규칙

RTE API 이름은 API의 기능을 나타내는 API root 이름과 access point를 합쳐 만든다. 포트를 거치는 API의 access point에는 포트 이름과 data element나 operation의 이름이 들어간다. C와 C++에서 RTE API 이름은 `Rte_`로 시작한다. 예를 들어 `Rte_Write_<p>_<o>`에서 `<p>`는 포트 이름이고, `<o>`는 그 포트의 sender-receiver 인터페이스에 있는 data element다.[@autosar-cp-sws-rte-2025]

API root마다 쓰임은 아래와 같다.[@autosar-cp-sws-rte-2025]

| API                           | 쓰임                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Rte_Write`, `Rte_Read`       | queued가 아닌 [[autosar-sender-receiver-interface\|sender-receiver]] data element를 명시적으로 쓰고 읽는다.                          |
| `Rte_Send`, `Rte_Receive`     | queued인 sender-receiver data element를 명시적으로 보내고 받는다.                                                                    |
| `Rte_IWrite`, `Rte_IRead`     | runnable이 쓰기나 읽기로 선언한 data element에 암묵적으로 쓰고 읽는다.                                                               |
| `Rte_Call`                    | [[autosar-client-server-interface\|client-server]] 통신을 시작한다.                                                                  |
| `Rte_Result`                  | 비동기 client-server 호출의 결과를 받는다.                                                                                           |
| `Rte_Switch`                  | [[autosar-mode-switch-interface\|mode switch]] 인터페이스의 모드 전환을 시작한다.                                                    |
| `Rte_Mode`                    | mode switch 포트에서 지금 활성인 모드를 준다.                                                                                        |
| `Rte_Enter`, `Rte_Exit`       | exclusive area에 들어가고 나온다.                                                                                                    |
| `Rte_IrvWrite`, `Rte_IrvRead` | 명시적 접근으로 정한 inter-runnable 변수를 쓰고 읽는다.                                                                              |
| `Rte_Trigger`                 | trigger 포트에서 external trigger를 일으킨다. 그러면 그 trigger에 external trigger occurred event가 연결된 runnable이 모두 실행된다. |

암묵적 접근 API는 이름에 runnable 이름도 넣는다. `Rte_IRead_<re>_<p>_<o>`에서 `<re>`는 runnable의 short name이다.[@autosar-cp-sws-rte-2025]

component type이 multiple instantiation을 지원하면, 여러 인스턴스에 쓸 수 있는 RTE API는 첫 인자로 인스턴스 핸들을 받는다. 지원하지 않으면 이 인자가 없다.[@autosar-cp-sws-rte-2025]

## RTE 설정

RTE 모듈의 ECU 설정에서 `RteSwComponentInstance` 컨테이너는 설정할 ECU에 놓인 SW-C prototype 하나를 나타내며, 그 prototype을 `RteSoftwareComponentInstanceRef`로 가리킨다. 그 아래의 `RteEventToTaskMapping` 컨테이너는 runnable을 [[osek-task|태스크]]에 매핑한다.[@autosar-cp-sws-rte-2025] 이 매핑은 [[rte-event#태스크 매핑|RTE 이벤트]]에서 다룬다.
