---
title: LET
tags:
  - platform/rtos
verified: 2026-09-29
---

**LET**(Logical Execution Time)은 프로그램의 실제 실행 시간을 추상화해, 입력을 읽고 나서 출력을 쓰기까지의 시간을 실행에 걸리는 시간과 상관없이 정하는 실시간 프로그래밍 추상화다.[@kirsch-logical-execution-time-2012] 태스크는 구간이 시작할 때 입력을 읽고, 구간 안에 실행을 마치면 언제 마치든 출력은 구간이 끝날 때 쓴다.[@kirsch-logical-execution-time-2012][@henzinger-giotto-2003] LET은 Henzinger, Horowitz, Kirsch가 2000년에 발표한 시간 구동 프로그래밍 언어 Giotto에서 처음 도입되었다.[@kirsch-logical-execution-time-2012][@henzinger-giotto-2000]

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

[[autosar-classic-platform|AUTOSAR Classic Platform]]의 Timing Extensions는 LET 구간을 `LET_INTERVAL` 범주의 [[autosar-event-chain|TimingDescriptionEventChain]]으로 기술하고, 로컬 ECU에서 [[runnable-entity|runnable]]이 실행되는 구간을 정하는 데 쓴다. 여러 ECU의 [[software-component-port|포트]] 사이 데이터 흐름은 `SL_LET_INTERVAL` 범주의 SL-LET 구간으로 기술한다. SL-LET 구간은 주기보다 길 수 있고, 동기 정확도가 유한한 분산 클럭을 다룬다.[@autosar-cp-tps-timingextensions-2025]

## BET와의 차이

BET(Bounded Execution Time) 모델에서 [[deadline|마감 시한]]은 상한일 뿐이지만, LET에서 구간의 끝은 출력 시점의 상한이자 논리적 하한이다.[@kirsch-logical-execution-time-2012]

SL-LET은 최적화를 하지 않으면, BET 모델에서는 드물게 나타나는 최악 지연을 보통의 경우로 만든다.[@gemlau-system-level-let-2021]
