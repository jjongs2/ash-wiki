---
title: 스케줄링 분석
tags:
  - platform/rtos
verified: 2026-09-29
---

[[autosar|AUTOSAR]]의 Timing Analysis and Design 보고서에 따르면 **스케줄링 분석**(scheduling analysis)은 특정 스케줄러의 모델에 코어 실행 시간과 애플리케이션 모델을 넣어 보장된 최악 응답 시간을 구하고, 이로써 주어진 조건에서 [[deadline|마감 시한]]을 놓치는지 확인하는 분석이다. 새 구성을 구현하지 않고도 검증할 수 있다.[@autosar-fo-tr-timinganalysis-2025]

Liu와 Layland는 마감 시한, 곧 같은 [[task|태스크]]의 다음 요청 시각이 지나도록 끝나지 않은 요청을 overflow라 하고, overflow가 한 번도 생기지 않게 태스크를 스케줄하는 스케줄링 방식을 feasible이라 불렀다.[@liu-hard-real-time-1973]

어떤 시스템에서 태스크 집합이 낼 수 있는 모든 job 열을 마감 시한을 놓치지 않고 스케줄하는 스케줄링 알고리즘이 하나라도 있으면, 그 태스크 집합을 그 시스템에서 **feasible** 태스크 집합이라 부른다. 주어진 스케줄링 알고리즘에서 최악 응답 시간이 마감 시한 이하인 태스크를 그 알고리즘에서 **schedulable** 태스크라 부르고, 모든 태스크가 schedulable인 태스크 집합도 schedulable이라 부른다.[@davis-survey-hard-real-time-2011]

## 이용률

태스크가 주기적일 때, 태스크 $i$의 이용률은 실행 시간 $C_i$를 주기 $T_i$로 나눈 값이다. 태스크 $n$개로 된 태스크 집합의 **이용률** $U$는 이 값을 모든 태스크에 대해 더한 값으로, 아래 식과 같다.[@liu-hard-real-time-1973]

$$
U = \sum_{i=1}^{n} \frac{C_i}{T_i}
$$

$U$는 태스크 집합을 실행하는 데 쓰인 프로세서 시간의 비율이다. 태스크가 주기적이고 마감 시한이 주기와 같으면, 단일 프로세서에서 $U > 1$인 태스크 집합은 어떤 스케줄링 방식으로도 모든 마감 시한을 지키지 못한다.[@liu-hard-real-time-1973]

## CPU load

**CPU load**는 측정 구간에서 CPU가 idle 상태에 있지 않은 시간의 비율이고, 흔히 퍼센트로 나타낸다.[@autosar-fo-tr-timinganalysis-2025][@ti-spruex3v-2020] 이용률은 태스크의 주기와 실행 시간으로 계산하고[@liu-hard-real-time-1973], CPU load는 시스템이 실행되는 동안 idle 상태에 머문 시간을 재어 구한다.[@autosar-fo-tr-timinganalysis-2025][@ti-spruex3v-2020]

µC/OS-III의 [[task#Idle 태스크|idle 태스크]]는 돌 때마다 카운터 `OSStatTaskCtr`를 늘린다.[@micrium-ucos-iii-idle-task-2026] 이 커널의 선택 기능인 statistic 태스크는 CPU 사용률을 구한다. 응용이 처음 만든 태스크가 `OSStatTaskCPUUsageInit()`을 불러 µC/OS-III 태스크만 돌 때 `OSStatTaskCtr`가 정해진 시간 동안 셀 수 있는 최댓값을 먼저 구해 두고, 그 뒤 같은 시간 동안 센 값이 이 최댓값보다 얼마나 작은지로 CPU 사용률을 정한다.[@micrium-ucos-iii-statistic-task-2026] FreeRTOS에서는 idle 태스크가 우선순위가 더 높은 응용 태스크에 할 일이 없을 때만 돌므로, idle hook 함수로 idle 태스크에 간 처리 시간을 재면 남는 처리 용량을 알 수 있다.[@freertos-task-management-2026]

## 충분조건 검사와 필요충분조건 검사

주어진 스케줄링 알고리즘과 시스템에 대해, 스케줄 가능하다고 판정한 태스크 집합이 모두 실제로 스케줄 가능하면 그 검사를 **충분조건 검사**(sufficient test)라 하고, 스케줄할 수 없다고 판정한 태스크 집합이 모두 실제로 스케줄할 수 없으면 **필요조건 검사**(necessary test)라 한다. 둘 다인 검사를 **exact** 검사라 부른다.[@davis-survey-hard-real-time-2011]

[[multiprocessor-scheduling|다중 프로세서 스케줄링]] 알고리즘의 성능을 견주는 지표로 이용률 상한, 근사 비율, speedup factor 같은 것을 쓴다. **최악 이용률 상한**(worst-case utilisation bound) $U_A$는 마감 시한이 주기와 같은 태스크 집합 가운데 알고리즘 A로 겨우 스케줄 가능한 것의 최소 이용률이다. **speedup factor**는 프로세서 $m$개에서 feasible한 모든 태스크 집합을 A로 스케줄 가능하게 하려면 프로세서 $m$개의 속도를 모두 몇 배 높여야 하는지의 최솟값이다.[@davis-survey-hard-real-time-2011]

단일 프로세서에서 서로 독립인 [[periodic-task-model|주기 태스크]]의 마감 시한이 다음 요청 시각이고 실행 시간이 일정하며 선점할 수 있다고 하자. 어떤 고정 우선순위 배정이 태스크 집합에 feasible하고, 어느 태스크의 실행 시간을 늘려도 그 배정이 feasible하지 않게 되면, 그 태스크 집합은 그 배정에서 처리기를 **fully utilize**한다고 한다. [[fixed-priority-scheduling|고정 우선순위 스케줄링]] 알고리즘의 **이용률의 최소 상한**은 처리기를 fully utilize하는 모든 태스크 집합의 이용률 가운데 최솟값이고, 이용률이 이 상한보다 낮은 태스크 집합에는 feasible한 고정 우선순위 배정이 늘 있다.[@liu-hard-real-time-1973]

단일 프로세서에서 서로 독립인 주기 태스크의 마감 시한이 다음 요청 시각이고 실행 시간이 일정하며 선점할 수 있으면, [[rate-monotonic-scheduling|RM]]에 대한 Liu와 Layland의 [[rate-monotonic-scheduling#이용률 상한|이용률 상한]]은 충분조건일 뿐이라, 상한을 넘는 태스크 집합도 스케줄 가능할 수 있다. 같은 가정에서 [[earliest-deadline-first|EDF]]로 모든 마감 시한을 지키는 것은 $U \le 1$일 때이고 그때뿐이다.[@liu-hard-real-time-1973] 마감 시한이 주기보다 짧은 태스크 집합의 EDF 검사는 [[earliest-deadline-first#마감 시한이 주기보다 짧을 때|처리기 수요 분석]]에서 다룬다.

![[diagrams/utilization-bound-rm-edf.svg]]

단일 프로세서의 고정 우선순위 선점 스케줄링에서 태스크가 주기적이고 서로 독립이며 마감 시한 $D_i$가 주기 이하이고, 모든 태스크가 같은 시각에 요청할 수 있다고 하자. 그 시각에 요청한 태스크 $i$가 마감 시한까지 우선순위가 더 높은 태스크에게 빼앗기는 처리 시간을 간섭 $I_i$라 하면, 검사 $C_i + I_i \le D_i$는 $I_i$를 정확히 계산할 때 필요충분조건이다. 통과한 태스크는 마감 시한을 지키고, 통과하지 못한 태스크는 모든 태스크가 [[worst-case-execution-time|최악 실행 시간]]만큼 실행될 때 마감 시한을 놓친다. $I_i$를 실제보다 크게 어림하면 이 검사는 충분조건이 되어, 통과한 태스크는 마감 시한을 지키지만 통과하지 못한 태스크도 실제로는 마감 시한을 지킬 수 있다.[@audsley-flexible-scheduling-1993]

같은 가정에서 [[response-time-analysis|응답 시간 분석]]은 필요충분조건 검사다.[@audsley-flexible-scheduling-1993]

단일 프로세서에서 [[periodic-task-model#Liu와 Layland의 가정|Liu와 Layland의 가정]]을 따르는 주기 태스크 집합을 RM으로 스케줄하고, 모든 태스크가 시각 0에 함께 release된다고 하자. 우선순위가 가장 높은 $i$개 태스크가 구간 $[0, t]$에서 프로세서에 요구하는 처리 시간을 $W_i(t)$라 하면, $0 < t \le T_i$에서 $W_i(t) \le t$인 $t$가 있을 때 우선순위가 $i$번째로 높은 태스크의 첫 실행은 마감 시한 안에 끝난다. $W_i(t)$는 아래 식과 같다.[@sha-real-time-scheduling-theory-2004]

$$
W_i(t) = \sum_{j=1}^{i} \left\lceil \frac{t}{T_j} \right\rceil C_j
$$

이 가정에서 $W_i(t) \le t$를 확인할 $t$는 0과 $T_i$ 사이에 있는 태스크 주기의 배수뿐이다.[@sha-real-time-scheduling-theory-2004]

![[diagrams/time-demand-function.svg]]

고정 우선순위 선점 스케줄링에서 스케줄 가능 여부만 알면 될 때는, 태스크마다 먼저 충분조건 검사를 하고 이를 통과한 태스크의 정확한 계산을 건너뛰어 계산량을 크게 줄일 수 있다. 태스크마다 정확한 응답 시간이 필요하면 이 방법은 맞지 않는다.[@davis-efficient-exact-2008]

고정 우선순위 선점 스케줄링에서 태스크들이 자원을 [[critical-section|상호 배제]]로 공유하면 블로킹이 생기므로, [[priority-inheritance-protocol|우선순위 상속]] 계열 프로토콜로 한정한 태스크마다의 최악 블로킹 시간 $B_i$를 검사에 넣어야 한다.[@audsley-flexible-scheduling-1993] $B_i$를 넣은 식은 [[response-time-analysis#반복식|응답 시간 분석]]에서 다룬다.

단일 프로세서에서 주기적이고 서로 독립인 태스크를 고정 우선순위로 스케줄하되, 태스크의 요청이 선점할 수 없는 부분 작업(subjob)들로 나뉘어 선점이 부분 작업 사이에서만 일어나면, 우선순위가 더 낮은 태스크가 선점할 수 없는 부분 작업을 실행하는 동안 기다리는 블로킹 시간도 분석에 넣어야 한다. 태스크들의 첫 요청 시각이 임의이면, 태스크의 최대 응답 시간은 우선순위가 더 낮은 태스크의 가장 긴 부분 작업이 이 태스크와 우선순위가 더 높은 모든 태스크가 함께 요청하기 아주 조금 전에 시작될 때 나온다. 이때 첫 요청만 보아서는 안 되고, 그때부터 이 태스크나 더 높은 우선순위 태스크의 요청이 쉬지 않고 이어지는 동안의 요청을 모두 따져 그 최댓값을 취한다.[@bril-deferred-preemption-2006]

어떤 태스크 집합을 스케줄 가능하다고 판정한 검사에서, 그 태스크 집합의 실행 시간을 줄이거나 주기나 최소 도착 간격을 늘리거나 마감 시한을 늘려도 태스크 집합이 스케줄할 수 없게 되는 일이 없으면 그 검사를 **sustainable** 검사라 부른다. 바뀐 태스크 집합을 그 검사가 반드시 스케줄 가능하다고 판정하지는 않는다.[@davis-survey-hard-real-time-2011]

## 스케줄링 시뮬레이션과의 차이

AUTOSAR의 Timing Analysis and Design 보고서에 따르면 스케줄링 시뮬레이션은 결과를 계산하지 않고 실행 동작을 흉내 내어 타이밍 정보를 얻는다.[@autosar-fo-tr-timinganalysis-2025]
