---
title: 스케줄링 분석
tags:
  - platform/rtos
verified: 2026-09-29
---

[[autosar|AUTOSAR]]의 Timing Analysis and Design 보고서에 따르면 **스케줄링 분석**(scheduling analysis)은 특정 스케줄러의 모델에 코어 실행 시간과 애플리케이션 모델을 넣어 보장된 최악 응답 시간을 구하고, 이로써 주어진 조건에서 [[deadline|마감 시한]]을 놓치는지 확인하는 분석이다. 새 구성을 구현하지 않고도 검증할 수 있다.[@autosar-fo-tr-timinganalysis-2025]

Liu와 Layland는 마감 시한, 곧 같은 태스크의 다음 요청 시각이 지나도록 끝나지 않은 요청을 overflow라 하고, overflow가 한 번도 생기지 않게 태스크를 스케줄하는 스케줄링 방식을 feasible이라 불렀다.[@liu-hard-real-time-1973]

## 이용률

태스크가 주기적일 때, 태스크 $i$의 이용률은 실행 시간 $C_i$를 주기 $T_i$로 나눈 값이다. 태스크 $n$개로 된 태스크 집합의 **이용률** $U$는 이 값을 모든 태스크에 대해 더한 값으로, 아래 식과 같다.[@liu-hard-real-time-1973]

$$
U = \sum_{i=1}^{n} \frac{C_i}{T_i}
$$

$U$는 태스크 집합을 실행하는 데 쓰인 프로세서 시간의 비율이다. 태스크가 주기적이고 마감 시한이 주기와 같으면, 단일 프로세서에서 $U > 1$인 태스크 집합은 어떤 스케줄링 방식으로도 모든 마감 시한을 지키지 못한다.[@liu-hard-real-time-1973]

## CPU load

**CPU load**는 측정 구간에서 CPU가 idle 상태에 있지 않은 시간의 비율이고, 흔히 퍼센트로 나타낸다.[@autosar-fo-tr-timinganalysis-2025][@ti-spruex3v-2020] 이용률은 태스크의 주기와 실행 시간으로 계산하고[@liu-hard-real-time-1973], CPU load는 시스템이 실행되는 동안 idle 상태에 머문 시간을 재어 구한다.[@autosar-fo-tr-timinganalysis-2025][@ti-spruex3v-2020]

## 충분조건 검사와 필요충분조건 검사

단일 프로세서에서 서로 독립인 [[periodic-task-model|주기 태스크]]의 마감 시한이 다음 요청 시각이고 실행 시간이 일정하며 선점할 수 있으면, [[rate-monotonic-scheduling|RM]]에 대한 Liu와 Layland의 [[rate-monotonic-scheduling#이용률 상한|이용률 상한]]은 충분조건일 뿐이라, 상한을 넘는 태스크 집합도 스케줄 가능할 수 있다. 같은 가정에서 [[earliest-deadline-first|EDF]]로 모든 마감 시한을 지키는 것은 $U \le 1$일 때이고 그때뿐이다.[@liu-hard-real-time-1973]

![[diagrams/utilization-bound-rm-edf.svg]]

단일 프로세서의 [[fixed-priority-scheduling|고정 우선순위]] 선점 스케줄링에서 태스크가 주기적이고 서로 독립이며 마감 시한 $D_i$가 주기 이하이고, 모든 태스크가 같은 시각에 요청할 수 있다고 하자. 그 시각에 요청한 태스크 $i$가 마감 시한까지 우선순위가 더 높은 태스크에게 빼앗기는 처리 시간을 간섭 $I_i$라 하면, 검사 $C_i + I_i \le D_i$는 $I_i$를 정확히 계산할 때 필요충분조건이다. 통과한 태스크는 마감 시한을 지키고, 통과하지 못한 태스크는 모든 태스크가 [[worst-case-execution-time|최악 실행 시간]]만큼 실행될 때 마감 시한을 놓친다. $I_i$를 실제보다 크게 어림하면 이 검사는 충분조건이 되어, 통과한 태스크는 마감 시한을 지키지만 통과하지 못한 태스크도 실제로는 마감 시한을 지킬 수 있다.[@audsley-flexible-scheduling-1993]

같은 가정에서 [[response-time-analysis|응답 시간 분석]]은 필요충분조건 검사다.[@audsley-flexible-scheduling-1993]

고정 우선순위 선점 스케줄링에서 스케줄 가능 여부만 알면 될 때는, 태스크마다 먼저 충분조건 검사를 하고 이를 통과한 태스크의 정확한 계산을 건너뛰어 계산량을 크게 줄일 수 있다. 태스크마다 정확한 응답 시간이 필요하면 이 방법은 맞지 않는다.[@davis-efficient-exact-2008]

고정 우선순위 선점 스케줄링에서 태스크들이 자원을 [[critical-section|상호 배제]]로 공유하면 블로킹이 생기므로, [[priority-inheritance-protocol|우선순위 상속]] 계열 프로토콜로 한정한 태스크마다의 최악 블로킹 시간 $B_i$를 검사에 넣어야 한다.[@audsley-flexible-scheduling-1993] $B_i$를 넣은 식은 [[response-time-analysis#반복식|응답 시간 분석]]에서 다룬다.

단일 프로세서에서 주기적이고 서로 독립인 태스크를 고정 우선순위로 스케줄하되, 태스크의 요청이 선점할 수 없는 부분 작업(subjob)들로 나뉘어 선점이 부분 작업 사이에서만 일어나면, 우선순위가 더 낮은 태스크가 선점할 수 없는 부분 작업을 실행하는 동안 기다리는 블로킹 시간도 분석에 넣어야 한다. 태스크들의 첫 요청 시각이 임의이면, 태스크의 최대 응답 시간은 우선순위가 더 낮은 태스크의 가장 긴 부분 작업이 이 태스크와 우선순위가 더 높은 모든 태스크가 함께 요청하기 아주 조금 전에 시작될 때 나온다. 이때 첫 요청만 보아서는 안 되고, 그때부터 이 태스크나 더 높은 우선순위 태스크의 요청이 쉬지 않고 이어지는 동안의 요청을 모두 따져 그 최댓값을 취한다.[@bril-deferred-preemption-2006]

## 스케줄링 시뮬레이션과의 차이

AUTOSAR의 Timing Analysis and Design 보고서에 따르면 스케줄링 시뮬레이션은 결과를 계산하지 않고 실행 동작을 흉내 내어 타이밍 정보를 얻는다.[@autosar-fo-tr-timinganalysis-2025]
