---
title: Cause-effect chain
tags:
  - platform/rtos
verified: 2026-09-29
---

[[autosar|AUTOSAR]]의 Timing Analysis and Design 보고서에 따르면 **cause-effect chain**은 통신하는 구성 요소 사이의 데이터 흐름으로, 소비자 구성 요소의 읽기 이벤트를 그에 대응하는 생산자 구성 요소의 쓰기 이벤트에 잇는다. 구성 요소는 추상화 수준에 따라 기능 블록, [[autosar-software-component|소프트웨어 컴포넌트]], [[task|태스크]]일 수 있다.[@autosar-fo-tr-timinganalysis-2025]

태스크와 메시지가 저마다의 주기로 활성화되어 서로 맞춰지지 않고, 받는 쪽이 활성화될 때 가장 최근 값을 읽으면, 사슬의 종단 간 지연에는 태스크마다의 [[response-time-analysis|응답 시간]]에 더해, 데이터가 받는 쪽의 다음 활성화를 기다리는 시간이 연결마다 최대 한 주기 들어간다.[@davare-period-optimization-2007]

## 태스크 사이의 통신

태스크가 실행을 시작할 때 입력을 읽고 끝날 때 출력을 쓰며 레지스터 버퍼로 통신하면, 새로 쓴 값이 이전 값을 덮어쓴다. 읽는 태스크의 인스턴스는 자기가 읽기 전에 쓰기를 마친 인스턴스 가운데 가장 늦은 것의 값을 읽는다. 이런 다중 주기 시스템에서 데이터가 사슬을 지나는 태스크 인스턴스의 순서와 그 종단 간 지연은 태스크들의 활성화 시점과 최악 응답 시간으로 정해진다.[@feiertag-end-to-end-path-delay-2008]

태스크와 메시지가 저마다의 주기로 활성화되어 서로 맞춰지지 않고 받는 쪽이 가장 최근 값을 읽는다고 하자. 경로 위 태스크나 메시지 $k$의 주기를 $T_k$, 최악 응답 시간을 $R_k$라 하면, 경로의 최악 종단 간 지연은 $\sum_k (T_k + R_k)$로 계산된다. 그래서 사슬의 최악 지연은 최악 응답 시간의 합 $\sum_k R_k$보다 클 수 있다. 앞 태스크나 메시지의 최선 응답 시간을 주기에서 빼면 더 조일 수 있다.[@davare-period-optimization-2007]

AUTOSAR의 Timing Analysis and Design 보고서에 따르면 주기적으로 활성화되는 태스크의 사슬에서는 한 인스턴스가 어느 생산자 인스턴스의 값을 읽는지가 앞 인스턴스들의 응답 시간에 따라 달라져, 데이터 흐름이 결정적이지 않다.[@autosar-fo-tr-timinganalysis-2025]

[[logical-execution-time|LET]]은 입력을 읽는 시점과 출력을 쓰는 시점을 명시하고, 실제 실행이 끝나도 출력을 LET 구간 끝에 내보낸다.[@autosar-fo-tr-timinganalysis-2025][@kirsch-logical-execution-time-2012] AUTOSAR의 Timing Analysis and Design 보고서에 따르면 LET에서는 공통 시간 기준이 있고 LET 구간이 주기 이하이면, 사슬의 데이터 흐름이 LET 이벤트에만 달리고 실제 실행 시점에 영향받지 않으며, 입출력 타이밍은 응답 시간이 일정하고 지터가 없다.[@autosar-fo-tr-timinganalysis-2025]

## Data age와 reaction

레지스터로 통신하는 다중 주기 시스템에서는 종단 간 지연이 무엇을 재는지를 구별해야 한다. 가능한 의미론은 last-to-last, last-to-first, first-to-last, first-to-first 넷이고, 이 가운데 data age는 last-to-last이고, 첫 반응을 재는 reaction은 first-to-first다.[@feiertag-end-to-end-path-delay-2008]

- **Data age**: 덮어쓰이지 않고 경로를 끝까지 지난 마지막 입력에서, 그 입력을 반영한 출력까지의 지연이다. 같은 입력을 반영한 출력이 여럿이면 그 가운데 마지막 것까지 잰다.
- **Reaction**: 입력의 값 변화가 도착한 때에서, 시스템이 그 변화에 처음 반응한 출력까지의 지연이다. 도착한 값이 덮어쓰여 경로를 지나지 못하면, 다음에 경로를 끝까지 지나는 입력까지 기다린 시간도 들어간다.[@feiertag-end-to-end-path-delay-2008]

![[diagrams/cause-effect-chain-data-age-reaction.svg]]

AUTOSAR R25-11 Timing Extensions는 자극(stimulus)에서 응답(response)까지의 [[autosar-event-chain|event chain]]에 거는 LatencyTimingConstraint의 종류로 age와 reaction을 둔다. age 제약은 주어진 응답과 그에 앞선 가장 최근 자극 사이의 간격을, reaction 제약은 주어진 자극과 그에 대응하는 첫 응답 사이의 간격을 제한한다.[@autosar-cp-tps-timingextensions-2025]

data age 제약은 액추에이터를 계속 구동하는 값이 너무 오래된 입력에 기대지 않게 할 때 쓰고, 주로 제어 공학에서 중요하다. reaction 제약은 자극에 대한 첫 반응이 중요할 때 쓰고, 바디 전장이 그런 예다.[@feiertag-end-to-end-path-delay-2008][@autosar-cp-tps-timingextensions-2025]

## Undersampling과 oversampling

AUTOSAR R25-11 Timing Extensions는 생산자와 소비자의 주기가 다른 다중 주기 시스템에서, 소비자의 주기가 생산자보다 길어 어떤 값이 읽히기 전에 덮어써져 빠지는 것을 **undersampling**, 소비자의 주기가 생산자보다 짧아 같은 값이 여러 번 읽히는 것을 **oversampling**으로 정의한다.[@autosar-cp-tps-timingextensions-2025]
