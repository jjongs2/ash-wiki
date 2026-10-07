---
title: EDF 스케줄링
aliases:
  - EDF
tags:
  - platform/rtos
verified: 2026-09-29
---

**EDF 스케줄링**은 현재 요청의 [[deadline|마감 시한]]이 가장 가까운 태스크에 가장 높은 우선순위를 주고, 매 순간 우선순위가 가장 높은 미완료 요청을 실행하는 스케줄링이다. 우선순위가 태스크마다 고정되지 않고 요청마다 바뀔 수 있으므로 [[real-time-scheduling#우선순위의 분류|동적 우선순위]] 방식이다. Liu와 Layland는 1973년 논문에서 이 방식을 deadline driven 스케줄링이라 불렀다.[@liu-hard-real-time-1973] 지금은 EDF(Earliest Deadline First)라고도 부른다.[@linux-sched-deadline-2026][@davis-survey-hard-real-time-2011]

## 우선순위

요청의 마감 시한은 같은 태스크의 다음 요청 시각이다. 요청은 끝날 때까지 이 마감 시한으로 다른 요청과 비교되므로, 같은 두 태스크라도 요청마다 앞서는 쪽이 바뀔 수 있다. 실행 중인 요청보다 마감 시한이 이른 요청이 도착하면 그 요청이 실행 중인 요청을 곧바로 [[real-time-scheduling#선점|선점]]한다.[@liu-hard-real-time-1973]

Linux 커널의 `SCHED_DEADLINE` 정책은 EDF에 [[aperiodic-server#CBS|CBS]](Constant Bandwidth Server)를 더해 태스크를 스케줄한다.[@linux-sched-deadline-2026]

RTEMS(Real-Time Executive for Multiprocessor Systems)의 EDF 스케줄러는 단일 코어 응용을 위한 스케줄러로, 마감 시한을 rate monotonic manager로만 선언하며 주기는 늘 마감 시한과 같다. 마감 시한을 선언하지 않았거나 취소한 태스크는 background 태스크가 되어, 마감 시한이 있는 어느 태스크보다도 덜 중요하게 다뤄진다.[@rtems-edf-scheduler-2025]

## 스케줄 가능 조건

단일 프로세서에서 태스크가 주기적이고 서로 독립이며, 실행 시간이 일정하고, 각 요청의 마감 시한이 다음 요청 시각이고, 선점할 수 있으면, EDF로 모든 마감 시한을 지킬 필요충분조건은 [[schedulability-analysis#이용률|이용률]] $U$가 $U \le 1$을 만족하는 것이다. 같은 가정에서 어떤 알고리즘으로든 스케줄할 수 있는 태스크 집합은 EDF로도 스케줄할 수 있으므로, EDF는 최적이다.[@liu-hard-real-time-1973]

## 마감 시한이 주기보다 짧을 때

구간 $[0, t)$에서 release되고 그 구간 안에 끝나야 하는 태스크 실행의 최대량을 **processor demand bound function** $h(t)$라 부르고, 이를 구간 길이로 나눈 $h(t)/t$의 최댓값을 **processor load**라 부른다.[@davis-survey-hard-real-time-2011]

단일 프로세서의 EDF에서 마감 시한이 주기보다 짧은 sporadic 태스크는 처리기 수요 분석으로 분석한다. 구간 $[t_1, t_2]$의 처리기 수요는 그 구간에서 활성화되고 그 구간 안에 끝나야 하는 job들이 요구하는 처리 시간이고, 태스크 집합은 어느 구간에서든 처리기 수요가 구간 길이를 넘지 않을 때 그리고 그때만 스케줄 가능하다.[@sha-real-time-scheduling-theory-2004]

태스크 $n$개로 된 집합에서 태스크 $i$의 실행 시간을 $C_i$, 상대 마감 시한을 $D_i$, 주기(sporadic 태스크는 최소 도착 간격)를 $T_i$라 하고, $C_i \le D_i$, $C_i \le T_i$라 하자. 이런 sporadic 태스크의 집합은 단일 프로세서에서 선점할 수 있으면, 모든 $t \ge 0$에 대해 $h(t) \le t$일 때 그리고 그때만 EDF로 스케줄 가능하고, $h(t)$는 아래 식과 같다. 모든 태스크가 시각 0에 처음 요청하는 주기 태스크 집합과, 이런 주기 태스크와 sporadic 태스크가 섞인 집합에도 같은 결과가 성립한다.[@baruah-sporadic-tasks-1990]

$$
h(t) = \sum_{i=1}^{n} C_i \max\left\{0, \left\lfloor \frac{t - D_i}{T_i} \right\rfloor + 1\right\}
$$

$U < 1$이면 $h(t) > t$인 $t$는, 주기들의 최소공배수인 [[periodic-task-model#파라미터|hyperperiod]] $P$에 가장 긴 상대 마감 시한을 더한 $P + \max_i D_i$와 아래 값 가운데 작은 것보다 작은 범위에서만 찾으면 되고, $U = 1$이면 $P + \max_i D_i$보다 작은 범위에서만 찾으면 된다. 이 범위에서도 $h(t)$는 요청의 마감 시각에서만 계산하면 된다.[@baruah-sporadic-tasks-1990]

$$
\frac{U}{1 - U} \max_i (T_i - D_i)
$$

파라미터가 모두 정수이고 $U$가 1보다 작은 상수 이하이면, 이 검사는 $O(n \max_i (T_i - D_i))$ 시간, 곧 pseudo-polynomial 시간에 끝난다. 마감 시한이 주기보다 짧은 태스크가 있고 $U$가 1 이하이되 그런 상수로 묶이지 않으면, 최악의 경우 $O(n(P + \max_i D_i))$, 곧 지수 시간이 걸린다.[@baruah-sporadic-tasks-1990]

## RM과의 차이

단일 프로세서에서 서로 독립인 [[periodic-task-model|주기 태스크]]의 마감 시한이 다음 요청 시각이고 실행 시간이 일정하며 선점할 수 있으면, [[rate-monotonic-scheduling|RM]]이 늘 스케줄할 수 있는 이용률의 최소 상한은 태스크가 많아지면 $\ln 2$에 가까워지지만, EDF는 $U \le 1$이면 스케줄한다. 대신 EDF는 요청마다 우선순위를 다시 정해야 한다.[@liu-hard-real-time-1973]
