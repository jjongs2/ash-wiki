---
title: LET
tags:
  - platform/rtos
verified: 2026-09-29
---

**LET**(Logical Execution Time)은 프로그램의 실제 실행 시간을 추상화해, 입력을 읽고 나서 출력을 쓰기까지의 시간을 실행에 걸리는 시간과 상관없이 정하는 실시간 프로그래밍 추상화다.[@kirsch-logical-execution-time-2012] [[task|태스크]]는 구간이 시작할 때 입력을 읽고, 구간 안에 실행을 마치면 언제 마치든 출력은 구간이 끝날 때 쓴다.[@kirsch-logical-execution-time-2012][@henzinger-giotto-2003] LET은 Henzinger, Horowitz, Kirsch가 2000년에 발표한 [[cyclic-executive#Time-triggered와 event-triggered|time-triggered]] 프로그래밍 언어 Giotto에서 처음 도입되었다.[@kirsch-logical-execution-time-2012][@henzinger-giotto-2000]

## 논리적 구간과 실제 실행

Giotto는 구간 안에서 실제 계산이 언제, 어디서, 어떻게 이뤄지는지 정하지 않는다. 태스크의 입력은 구간 시작보다 늦게 적재되어도 되고, 실행은 다른 태스크에 선점되어도 된다. 구간이 끝날 때 출력의 값이 의미론이 정한 값이기만 하면 된다.[@henzinger-giotto-2003]

모든 태스크가 자기 구간 안에 실행을 마치면, 입출력 동작은 하드웨어 플랫폼이나 소프트웨어 부하가 달라져도 바뀌지 않는다.[@kirsch-logical-execution-time-2012][@henzinger-giotto-2003] 태스크 사이에 오가는 값도 구간의 시작과 끝에서만 전달되므로, 센서 값이 주어지면 태스크 사이와 액추에이터로 가는 값이 모두 정해진다.[@henzinger-giotto-2003]

![[diagrams/let-interval-read-write.svg]]

[[autosar|AUTOSAR]]의 Timing Analysis and Design 보고서에 따르면 LET에서는 [[response-time-analysis|응답 시간]]과 데이터 흐름이 실제 스케줄링과 상관없이 고정되어, [[cause-effect-chain|cause-effect chain]]의 종단 간 동작을 결정적으로 명세하고 구현하기가 쉬워진다.[@autosar-fo-tr-timinganalysis-2025]

출력은 실행을 마친 때가 아니라 구간이 끝날 때 쓰이므로, 실행이 일찍 끝나도 출력은 앞당겨지지 않는다. 더 빠른 기계를 써도 논리적으로 실행이 빨라지지 않고 기계 이용률만 줄어든다.[@kirsch-logical-execution-time-2012]

AUTOSAR의 Timing Analysis and Design 보고서에 따르면 LET 구간을 주기보다 짧게 잡거나 오프셋을 두면 종단 간 지연을 줄일 수 있다. 구간을 넉넉히 잡아 응답 시간 변화에 대한 견고성을 얻으면 cause-effect chain의 종단 간 지연과 맞바꾸게 된다.[@autosar-fo-tr-timinganalysis-2025]

## System-level LET

SL-LET(System-Level LET)은 LET을 분산 시스템으로 넓힌 것이다. 고전 LET이 성립하는 시간 영역(time zone)들을 LET interconnect 태스크로 잇고, 시간 영역마다의 클럭이 유한한 오차 안에서 동기화되어 있다고 가정한다.[@gemlau-system-level-let-2021]

## AUTOSAR

AUTOSAR R25-11의 [[autosar-classic-platform|Classic Platform]] Timing Extensions 명세는 LET 구간을 `LET_INTERVAL` 범주의 [[autosar-event-chain|TimingDescriptionEventChain]]으로 기술하도록 정하고, 로컬 ECU에서 [[runnable-entity|runnable]]이 실행되는 구간을 정하는 데 쓴다. 여러 ECU의 [[software-component-port|포트]] 사이 데이터 흐름은 `SL_LET_INTERVAL` 범주의 SL-LET 구간으로 기술한다. SL-LET 구간은 주기보다 길 수 있고, 동기 정확도가 유한한 분산 클럭을 다룬다.[@autosar-cp-tps-timingextensions-2025]

이 명세는 runnable과 BSW(Basic Software) module entity를 함께 **executable entity**라 부르고, executable entity의 실행 순서를 ExecutionOrderConstraint로 정한다. ExecutionOrderConstraint는 [[virtual-functional-bus|VFB]], [[autosar-software-component|SW-C]], 시스템, BSW 모듈, ECU 수준의 [[autosar-event-chain#Timing description|timing view]] 어디서든 쓸 수 있고, executable entity를 직접 가리키거나 그것을 시작하는 [[rte-event|RTE 이벤트]]·[[basic-software-scheduler#BSW 이벤트|BSW 이벤트]]로 가리킨다. 종류는 ordinary, hierarchical, repetitive 셋이다. Ordinary는 executable entity 참조를 successor 관계로 이어 실행 순서를 정하고, hierarchical은 executable entity를 그룹으로 묶어 나무 꼴의 순서를 정한다.[@autosar-cp-tps-timingextensions-2025]

ExecutionOrderConstraint만으로는 어떤 executable entity들이 모두 실행을 마쳐야만 다른 executable entity들이 실행을 시작한다는 것을 드러낼 수 없다. 이를 위해 SynchronizationPointConstraint가 RTE 이벤트·BSW 이벤트로 가리킨 executable entity들이나 executable entity 그룹들 사이에 동기화 지점을 정한다.[@autosar-cp-tps-timingextensions-2025]

ExecutionOrderConstraint가 executable entity를 묶는 그룹(EOCExecutableEntityRefGroup, EOC: Execution Order Constraint)을 **executable entity cluster**라 한다. 그룹은 cluster에 드는 executable entity의 RTE 이벤트나 BSW 이벤트를 모두 가리키고, 다른 그룹을 가리켜 cluster의 위계를 이룰 수 있다. Cluster는 `letInterval` 속성으로 LET 구간을 나타내는 TimingDescriptionEventChain을 가리켜 그 구간에 매핑되며, 이 속성은 최상위 그룹에만 둘 수 있다. [[autosar-software-cluster|Software Cluster]]에 든 executable entity는 [[autosar-software-cluster#Host와 Application Software Cluster|Host Software Cluster]]가 주는 시간 자원인 dispatcher나 LET 구간에 배정된다. Dispatcher에 배정할 때도 executable entity cluster를 쓰는데, 이때는 그룹의 `triggeringEvent`가 dispatcher 역할을 하는 complex timing event인 TDEventComplex를 가리킨다.[@autosar-cp-tps-timingextensions-2025]

서로 다른 LET 구간에 매핑된 executable entity 사이에서는 구간의 release와 terminate가 입력을 읽고 출력을 쓰는 때를 정해, 데이터 흐름이 하나로 정해진다. 한 LET 구간에 매핑된 executable entity끼리 데이터를 주고받는 방식은 둘이다. interLetOnly에서는 구간의 release와 terminate 때만 데이터를 주고받아, 구간 안의 실행 순서가 데이터 흐름에 영향을 주지 않지만 종단 간 지연이 주기의 배수만큼 길어진다. intraLetEOC에서는 같은 그룹의 executable entity가 그룹이 정한 순서로 실행되며 구간 안에서 [[autosar-sender-receiver-interface#명시적 접근과 암묵적 접근|implicit]] 의미로 데이터를 바로 주고받는다. intraLetEOC에서 LET 방식으로 데이터를 넘기는 것은 구간의 경계에서와 서로 독립인 그룹 사이에서뿐이다.[@autosar-cp-tps-timingextensions-2025]

![[diagrams/let-inter-intra-data-exchange.svg]]

## BET와의 차이

BET(Bounded Execution Time) 모델에서 [[deadline|마감 시한]]은 상한일 뿐이지만, LET에서 구간의 끝은 출력 시점의 상한이자 논리적 하한이다.[@kirsch-logical-execution-time-2012]

SL-LET은 지연을 줄이는 최적화를 하지 않으면, BET 모델에서는 드물게 나타나는 최악 지연을 보통의 경우로 만든다. 태스크의 읽기를 오프셋만큼 늦춰 입력을 주는 태스크의 쓰기에 맞추는 LET의 최적화는 SL-LET에도 쓸 수 있다.[@gemlau-system-level-let-2021]
