---
title: AUTOSAR event chain
tags:
  - platform/autosar
verified: 2026-09-30
---

[[autosar|AUTOSAR]] Timing Extensions에서 **event chain**(TimingDescriptionEventChain)은 기능상 의존하는 timing event 사이의 인과 관계를 나타내며, 시작점 이벤트는 자극(stimulus), 끝점 이벤트는 응답(response) 역할을 한다. 시간이 중요한 경로는 event chain으로 적고, 그 event chain에 시간 예산을 정하는 타이밍 제약을 건다. 예를 들어 센서 샘플링부터 액추에이터 접근까지의 최대 지연을 제한할 수 있다.[@autosar-cp-tps-timingextensions-2025] 지연이 무엇을 재는지와 data age, reaction은 [[cause-effect-chain|cause-effect chain]]에서 다룬다.

## Timing description

AUTOSAR R25-11 Timing Extensions는 시스템 안에서 특정 시점에 관측할 수 있는 동작을 **timing event**(TimingDescriptionEvent)로 적는다. 예를 들어 [[autosar-sender-receiver-interface|sender-receiver]] [[software-component-port|포트]]에서 데이터를 받거나 보낸 때, [[runnable-entity|runnable]]이 시작하거나 끝난 때, 버스에서 프레임 전송이 끝난 때가 timing event다. 시스템이나 [[autosar-software-component|SW-C]]의 timing description은 timing event와 그 인과 관계인 event chain으로 이루어지며, TimingDescriptionEvent와 TimingDescriptionEventChain은 모두 TimingDescription의 하위 클래스다. 타이밍 제약은 이 event와 event chain에 건다.[@autosar-cp-tps-timingextensions-2025]

timing description과 타이밍 제약은 타이밍 뷰로 나뉜다. 뷰는 VfbTiming, SwcTiming, SystemTiming, BswModuleTiming과 BswCompositionTiming, EcuTiming이며, 뷰마다 timing description이 쓸 수 있는 timing event의 종류가 정해져 있다. 예를 들어 VfbTiming은 TDEventVfb만, EcuTiming은 모든 종류를 쓸 수 있다.[@autosar-cp-tps-timingextensions-2025]

## Segment

event chain은 계층으로 짤 수 있고, 안에 든 하위 event chain을 **segment**라 부른다. event chain을 합성할 때는 앞 event chain의 응답 이벤트가 뒤 event chain의 자극 이벤트가 되도록 잇는다. segment를 가진 event chain에는 상위 event chain의 자극에서 segment들을 지나 상위 event chain의 응답까지 이어지는 경로가 적어도 하나 있어야 한다.[@autosar-cp-tps-timingextensions-2025]

하향식 분해에서는 event chain에 LatencyTimingConstraint로 시간 예산을 걸고, event chain을 segment로 나누면 예산도 나뉜다. segment $i$의 예산을 $B_i$, event chain 전체 예산을 $B$라 하면 $\sum_i B_i \le B$여야 한다. 상향식 합성에서 segment들을 합해 상위 event chain을 이룰 때도 같은 조건을 지켜야 한다. 뒤 개발 단계에서 시스템 동작을 더 알게 되면, event chain과 그 시간 예산을 시스템의 구성 요소들에 나눠 segment로 만들 수 있다.[@autosar-cp-tps-timingextensions-2025]

![[diagrams/event-chain-segments-budget.svg]]

## ECU 안과 밖

AUTOSAR Timing Extensions가 드는 예에서, 센서 샘플링부터 액추에이터 접근까지의 종단 간 event chain은 I/O, BSW(Basic Software), [[autosar-rte|RTE]], SW-C, [[can|CAN]] 버스를 지나는 segment들로 나뉘고, ECU 안의 통신과 ECU 사이의 통신이 구분된다. SW-C가 같은 ECU에 있으면 통신은 RTE를 거치는 로컬 통신이고, 다른 ECU에 있으면 RTE, BSW의 [[autosar-communication-stack|통신 스택]], 통신 버스를 거치는 원격 통신이다.[@autosar-cp-tps-timingextensions-2025]

![[diagrams/event-chain-intra-inter-ecu.svg]]

## SW-C 단위 지연

VfbTiming 뷰는 센서와 액추에이터까지 포함한 종단 간 타이밍 제약을 담는 뷰로, 이 제약을 설계 초기에 형식화하게 해 준다. 이 뷰에서는 atomic SW-C 하나를 두고, 입력 포트로 값을 받은 때부터 새로 계산한 값을 출력 포트로 보낸 때까지의 지연에 상한을 걸 수 있다. 예: 최대 2 ms. composition 수준에서는 컴포넌트 사이의 타이밍 관계, 예를 들어 한 컴포넌트의 provided port에서 다른 컴포넌트의 required port까지의 관계도 다룰 수 있다.[@autosar-cp-tps-timingextensions-2025]

SwcTiming 뷰는 SW-C의 내부 동작을 runnable 단위로 보며, runnable의 활성화, 시작, 종료와 변수 접근을 timing event로 쓸 수 있다. AUTOSAR Timing Extensions가 드는 예에서 SW-C 안의 데이터 흐름은 required port를 읽는 runnable, runnable 사이 통신, provided port에 쓰는 runnable을 거친다.[@autosar-cp-tps-timingextensions-2025]
