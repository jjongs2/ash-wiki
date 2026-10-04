---
title: EDF 스케줄링
aliases:
  - EDF
tags:
  - platform/rtos
verified: 2026-09-29
---

**EDF 스케줄링**은 현재 요청의 [[deadline|마감 시한]]이 가장 가까운 태스크에 가장 높은 우선순위를 주고, 매 순간 우선순위가 가장 높은 미완료 요청을 실행하는 스케줄링이다. 우선순위가 태스크마다 고정되지 않고 요청마다 바뀔 수 있으므로 [[real-time-scheduling#우선순위의 분류|동적 우선순위]] 방식이다. Liu와 Layland는 1973년 논문에서 이 방식을 deadline driven 스케줄링이라 불렀다.[@liu-hard-real-time-1973] 지금은 EDF(Earliest Deadline First)라고도 부른다.[@linux-sched-deadline-2026][@faa-ar-05-27-2005]

## 우선순위

요청의 마감 시한은 같은 태스크의 다음 요청 시각이다. 요청은 끝날 때까지 이 마감 시한으로 다른 요청과 비교되므로, 같은 두 태스크라도 요청마다 앞서는 쪽이 바뀔 수 있다. 실행 중인 요청보다 마감 시한이 이른 요청이 도착하면 그 요청이 실행 중인 요청을 곧바로 [[real-time-scheduling#선점|선점]]한다.[@liu-hard-real-time-1973]

Linux 커널의 `SCHED_DEADLINE` 정책은 EDF에 CBS(Constant Bandwidth Server)를 더해 태스크를 스케줄한다. 이 정책의 CBS는 태스크마다 스케줄링 마감 시한을 매겨 태스크끼리 서로 간섭하지 않게 한다.[@linux-sched-deadline-2026]

## 스케줄 가능 조건

단일 프로세서에서 태스크가 주기적이고 서로 독립이며, 실행 시간이 일정하고, 각 요청의 마감 시한이 다음 요청 시각이고, 선점할 수 있으면, EDF로 모든 마감 시한을 지킬 필요충분조건은 [[schedulability-analysis#이용률|이용률]] $U$가 $U \le 1$을 만족하는 것이다. 같은 가정에서 어떤 알고리즘으로든 스케줄할 수 있는 태스크 집합은 EDF로도 스케줄할 수 있으므로, EDF는 최적이다.[@liu-hard-real-time-1973]

## RM과의 차이

단일 프로세서에서 서로 독립인 [[periodic-task-model|주기 태스크]]의 마감 시한이 다음 요청 시각이고 실행 시간이 일정하며 선점할 수 있으면, [[rate-monotonic-scheduling|RM]]이 늘 스케줄할 수 있는 이용률의 최소 상한은 태스크가 많아지면 $\ln 2$에 가까워지지만, EDF는 $U \le 1$이면 스케줄한다. 대신 EDF는 요청마다 우선순위를 다시 정해야 한다.[@liu-hard-real-time-1973]

![[diagrams/utilization-bound-rm-edf.svg]]
