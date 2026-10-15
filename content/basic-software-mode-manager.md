---
title: Basic Software Mode Manager
tags:
  - platform/autosar
aliases:
  - BswM
verified: 2026-10-07
---

AUTOSAR R25-11의 BswM 명세는 **Basic Software Mode Manager**(BswM)를 모드 관리의 틀이 되는 모듈로 정의하고, 그 일을 mode arbitration과 mode control 둘로 나눈다. Mode arbitration은 [[autosar-software-component|SW-C]]나 다른 BSW(Basic Software) 모듈에서 받은 모드 요청과 모드 표시를 규칙으로 중재해 모드 전환을 시작하고, mode control은 다른 BSW 모듈의 모드 전환 동작을 담은 action list를 실행해 그 전환을 해낸다. BswM의 동작은 설정이 모두 정하며, 설정으로 BswM 전체를 생성하거나 실행 중에 인코딩된 설정을 해석하는 규칙 해석기로 구현할 수 있다.[@autosar-cp-sws-bswmodemanager-2025]

## Mode arbitration

규칙은 mode request condition 여럿을 AND, OR, XOR, NOT, NAND 같은 연산자로 엮은 논리식이다. BswM은 입력인 모드 요청이나 모드 표시가 바뀔 때, 또는 BswM main function이 돌 때 규칙을 평가하고, 그 결과(참이나 거짓)로 대응하는 action list를 실행할지 정한다. 모드 요청은 주로 응용 SW-C에서, 때로 Dcm(Diagnostic Communication Manager) 같은 BSW 모듈에서 온다. 모드 표시는 늘 BSW 모듈이 내며, 버스별 State Manager와 [[ecu-state-manager|EcuM]]이 그 예다. 앞선 규칙 평가의 결과를 다른 규칙의 입력으로 쓸 수는 없다.[@autosar-cp-sws-bswmodemanager-2025]

규칙 평가는 요청이 온 자리에서 곧바로 하거나(immediate), BswM main function까지 미뤄 주기적으로 할 수 있다(deferred). 어느 쪽인지는 요청 포트마다 설정으로 고르고, 한 규칙에 두 가지 요청을 섞어 쓸 수 있다. Immediate 요청은 호출한 쪽의 context에서 실행되므로, action list의 실행이 시스템 성능과 일관성을 해치지 않게 하는 것은 시스템 통합자의 몫이다.[@autosar-cp-sws-bswmodemanager-2025]

## Action list

**Action list**는 BswM이 mode arbitration의 결과에 따라 실행하는, 순서가 있는 action의 목록이다. 항목은 다른 BSW 모듈이나 [[autosar-rte|RTE]]의 호출, 실행에 포함할 다른 action list로의 링크, 그 list를 실행할 때 평가할 규칙 가운데 하나이며, 규칙을 항목으로 넣으면 규칙의 위계가 생긴다. BswM은 action의 반환값을 저장하거나 그에 반응하지 않아도 되므로, BSW의 State Manager들은 자기 현재 상태를 BswM에 표시해 mode arbitration의 입력이 되게 한다. 다만 E_NOT_OK가 돌아오면 BswM은 [[autosar-error-handling#Det|Det]]에 runtime error를 보고하거나 실행 중인 action list를 멈출 수 있다.[@autosar-cp-sws-bswmodemanager-2025]

![[diagrams/bswm-arbitration-control.svg]]

Action list에 쓸 수 있는 action은 미리 정해져 있다(`BswMAvailableActions`). 그 가운데 몇은 아래와 같다.[@autosar-cp-sws-bswmodemanager-2025]

| Action                         | 하는 일                                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `BswMPduGroupSwitch`           | [[autosar-com#I-PDU 그룹\|I-PDU 그룹]]을 켜고 끈다                                                       |
| `BswMPduRouterControl`         | [[pdu-router\|PDU Router]]의 라우팅 경로 그룹을 `PduR_EnableRouting`·`PduR_DisableRouting`으로 켜고 끈다 |
| `BswMRteStart`·`BswMRteStop`   | RTE를 시작하고 멈춘다                                                                                    |
| `BswMEcuMSelectShutdownTarget` | EcuM의 shutdown target을 정한다                                                                          |

정해진 action 밖에도 BswM은 BSW의 어느 함수든 부를 수 있고, 사용자 정의 함수도 부를 수 있다.[@autosar-cp-sws-bswmodemanager-2025]

시동 설정의 한 예는, BswM이 NVRAM(Non-Volatile Random-Access Memory) 접근에 필요한 드라이버를 초기화하는 action list에서 `NvM_ReadAll`을 부르고 ReadAll job이 끝나면 나머지 BSW를 초기화하는 규칙이다. 종료 설정의 예에서는 action list가 `NvM_WriteAll`을 부른다.[@autosar-cp-exp-modemanagementguide-2025]

## Mode request와 mode switch

모드 통신은 mode switch와 mode request로 나뉜다. **Mode switch**는 한 모드에서 다른 모드로 가는 현재 전환을 알리는 통신으로, 늘 mode manager가 시작한다. **Mode request**는 mode user가 mode manager에게 어떤 모드에 들어가 달라고 하는 요청이다. Mode manager는 모든 요청을 중재해 들어갈 모드를 정하므로, 요청한 모드에 든다는 보장은 없다.[@autosar-cp-exp-modemanagementguide-2025]

Mode request는 mode declaration group이 아니라 표준 [[autosar-sender-receiver-interface|sender-receiver 인터페이스]]로 보내며, 요청할 수 있는 모드를 담은 열거형 VariableDataPrototype을 쓴다. 차량 모드와 응용 모드의 요청은 영향을 받는 모든 ECU로 퍼져야 하므로 mode requester와 mode manager 사이는 1:n 연결이며, 이런 연결은 sender-receiver 통신으로만 만들 수 있다. 각 ECU의 mode manager가 요청을 중재해 로컬 mode switch를 일으키므로, 중재 결과는 ECU마다 로컬로만 RTE의 [[autosar-mode-switch-interface|mode switch]]로 전해진다.[@autosar-cp-exp-modemanagementguide-2025]

## 모드의 수준

모드는 차량 모드, 응용 모드, ECU의 로컬 BSW 모드로 나뉘고, 이 수준들은 서로 영향을 준다. 차량 모드에 따라 응용이 켜지거나 꺼져 응용 모드가 달라지고, 거꾸로 응용의 동작 상태가 차량 모드를 바꿀 수 있다. 응용의 통신 필요가 통신 네트워크의 BSW 모드를 바꾸기도 하고, 통신 네트워크를 쓸 수 없으면 그에 기대는 응용이 limp-home 모드로 바뀌기도 한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 파티션과 OS-Application

BswM은 파티션마다 그 파티션 전용 설정(`BswMConfig`)으로 따로 있고, 그 안의 action list를 파티션 안에서 실행한다. BswM 인스턴스는 저마다 자기 설정에서 service component 기술을 따로 만들고, 통합자가 그것을 해당 파티션에 배치한다.[@autosar-cp-sws-bswmodemanager-2025]

BswM은 BSW에 놓이므로 모든 [[autosar-os-application|OS-Application]]에 하나씩 있고, mode user와 제어받는 BSW 모듈에 로컬이다. 서로 다른 OS-Application의 BswM끼리는 sender-receiver 통신(`SchM_Send`, `SchM_Receive`)으로 mode request를 넘길 수 있다. 차량 모드의 요청처럼 중앙의 mode requester SW-C 하나가 낸 요청을 여러 ECU의 BswM이 받는 것은, SW-C가 로컬 BSW하고만 통신한다는 규칙의 예외다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

BSW 모듈을 파티션에 나눠 두는 일은 [[autosar-layered-architecture#BSW 분산|AUTOSAR 계층 구조]]에서 다룬다.
