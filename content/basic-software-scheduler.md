---
title: Basic Software Scheduler
tags:
  - platform/autosar
aliases:
  - SchM
verified: 2026-10-07
---

AUTOSAR R25-11의 [[autosar-rte|RTE]] 명세는 **Basic Software Scheduler**(SchM)를 BSW(Basic Software) 모듈을 통합하는 개념과 서비스를 주는 것으로 정의하고, RTE와 함께 명세한다. SchM은 BSW 모듈의 구현을 [[autosar-os|AUTOSAR OS]]의 context에 넣고, BSW 모듈의 main processing function을 촉발하고, BSW 모듈에 데이터 일관성 메커니즘을 적용하고, BSW 모듈 사이에 모드를 전한다.[@autosar-cp-sws-rte-2025]

SchM이 스케줄링하는 것은 BSW 모듈의 schedulable entity로, main processing function이라고도 부른다. 같은 [[osek-task|태스크]]가 [[autosar-software-component|SW-C]]와 BSW 모듈의 스케줄링에 함께 쓰일 수 있어서, RTE의 스케줄링 부분은 SchM과 깊이 얽혀 둘을 분명히 나눌 수 없다. RTE와 SchM은 그 ECU에 맞게 ECU마다 생성되며, 구현은 생성하지 않고 설정해도 된다. AUTOSAR 4.0.1은 RTE와 Basic Software Scheduler를 한 명세로 합쳤다.[@autosar-cp-sws-rte-2025]

## RTE와 함께 생성

SchM은 RTE와 함께 생성된다. 그래서 같은 OS 태스크가 BSW main function과 SW-C의 [[runnable-entity|runnable]]을 함께 스케줄링해 자원 소비를 줄이고 둘의 실행 순서를 섞어 설정할 수 있으며, BSW 모듈과 응용 SW-C에 걸친 모드를 맞춰 전환하고, 같은 [[rte-event#종류|External Trigger Occurred Event]]로 runnable과 BSW main function을 함께 촉발할 수 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/os-task-runnable-bsw-main-function.svg]]

개별 BSW 모듈은 ECU 전체의 타이밍 의존 관계, 스케줄링이 미치는 영향, 데이터 일관성을 가장 효율적으로 구현하는 방법을 알지 못한다. 그래서 BSW의 스케줄은 ECU·BSW 통합자가 설정하고 RTE 생성기가 RTE와 함께 생성하는 SchM에 모은다. 이렇게 하면 통합이 쉬워지고, 스케줄링 대상마다 선점·비선점 같은 다른 스케줄링 전략과 다른 데이터 일관성 메커니즘을 적용할 수 있으며, 태스크 수 같은 자원을 줄일 수 있다. 적용할 데이터 일관성 메커니즘은 통합자가 설정한 스케줄링에 따라 설정한다. OS 객체와 OS 서비스는 SchM과 RTE만 쓴다. 예외는 [[ecu-state-manager|EcuM]], [[autosar-layered-architecture#층 사이 접근|Complex Driver]], OS의 counter 값을 읽는 서비스이고, [[microcontroller-abstraction-layer|MCAL]] 모듈은 인터럽트를 켜고 끌 수 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## BSW 이벤트

SchM은 BSW 모듈의 schedulable entity와 BswInterruptEntity를 연결된 BswEvent에 따라 실행한다. BswEvent에는 BswTimingEvent, BswBackgroundEvent, BswOperationInvokedEvent, BswExternalTriggerOccurredEvent, BswInternalTriggerOccurredEvent, BswModeSwitchEvent, BswModeSwitchedAckEvent, BswModeManagerErrorEvent, BswDataReceivedEvent, BswAsynchronousServerCallReturnsEvent가 있다.[@autosar-cp-sws-rte-2025]

[[rte-event|RTE 이벤트]]처럼 BswEvent는 종류마다 schedulable entity를 시작할 수 있다. 시작되는 schedulable entity 안에서 SchM의 API를 따로 부를 필요는 없고, BSW 모듈 기술의 설정에 따라 SchM이 직접 시작한다. RTE 이벤트와 달리 BswEvent는 wait point를 지원하지 않는다.[@autosar-cp-sws-rte-2025]

RTE 생성기는 schedulable entity를 시작할 수 있는 BswEvent가 OS 태스크나 category 2 [[osek-isr|ISR]]에 매핑되지 않았고 직접 함수 호출이나 [[autosar-os-application#Trusted function|trusted function call]]로도 실행할 수 없으면 그 설정을 거부한다. RTE는 한 태스크나 category 2 ISR 안에서 runnable과 schedulable entity의 실행 순서를 마음대로 설정할 수 있게 지원한다.[@autosar-cp-sws-rte-2025]

BSW는 여러 코어에 나눠 둘 수 있으며, BSW 서비스 호출을 실행할 코어는 그 서비스의 BswOperationInvokedEvent가 매핑된 태스크로 정해진다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 모드에 따른 스케줄링

BSW 모듈의 모드 의존 스케줄링은 SW-C runnable의 모드 의존 스케줄링과 똑같다. Mode manager는 BSW 모듈 기술에 provide [[autosar-mode-switch-interface#Mode declaration group|ModeDeclarationGroupPrototype]]을 두고, SchM은 mode manager가 모드 전환 요청을 SchM에 전하는 API를 준다. Mode user는 BSW 모듈 기술에 require ModeDeclarationGroupPrototype을 두고, 필요하면 SchM이 지금 활성인 모드를 읽는 API를 준다. BSW 모듈 기술에 mode disabling dependency가 있으면 SchM은 그 모드에서 BSW main function의 스케줄링을 막는다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

BswEvent에 어떤 모드에 대한 mode disabling dependency가 있으면, 그 모드가 활성인 동안 SchM은 그 BswEvent로 schedulable entity를 시작하지 않는다. 이 비활성화는 그 모드 동안뿐 아니라 그 모드로 들어가는 전환과 그 모드에서 나오는 전환 동안에도 걸린다. 모드 전환 때 이미 실행 중인 schedulable entity를 멈추지는 않는다.[@autosar-cp-sws-rte-2025] runnable에 거는 같은 규칙은 [[autosar-mode-switch-interface#모드에 따른 비활성화|mode switch 인터페이스]]에서 다룬다.

SW-C와 BSW 모듈의 mode declaration group prototype 둘을 맞춰 두면(synchronized) mode machine 인스턴스 하나로 구현되어, `Rte_Switch`를 부르든 `SchM_Switch`를 부르든 효과가 같다.[@autosar-cp-sws-rte-2025]

## Exclusive area

BSW 모듈은 `SchM_Enter`와 `SchM_Exit`로 [[runnable-entity#Exclusive area|exclusive area]]의 시작과 끝을 정한다. SchM은 서로 다른 exclusive area를 들어간 순서의 반대로 나오는 한 두 호출의 중첩을 허용해야 하며, 같은 exclusive area의 중첩은 지원하지 않아도 된다. 두 API는 OS가 초기화된 뒤라면 SchM이 초기화되기 전에도, 태스크와 category 1·2 ISR의 context에서도 부를 수 있어야 한다.[@autosar-cp-sws-rte-2025]

SchM 구현의 예는 둘이다. 두 태스크의 BSW 함수가 같은 자원에 접근하면 SchM 구현이 `SchM_Enter_<mod>_<name>`과 `SchM_Exit_<mod>_<name>`을 모든 인터럽트를 막고 푸는 매크로로 구현한다. 실행 순서로 데이터 일관성을 보장하면 두 매크로는 아무것도 하지 않는다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]
