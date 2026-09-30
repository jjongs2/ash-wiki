---
title: 마감 시한
tags:
  - platform/rtos
verified: 2026-09-29
---

**마감 시한**(deadline)은 태스크나 job이 실행을 마쳐야 하는 시각이다. 마감 시한까지 끝내지 못하는 것을 마감 시한을 놓쳤다(deadline miss)고 한다.[@renesas-res05b0008-2010][@linux-sched-deadline-2026] 마감 시한이 정하는 시간 요구는 [[real-time-system|실시간 시스템]]에서 다룬다.

## 절대와 상대

job의 **절대 마감 시한**은 job이 끝나야 하는 시각이고, job이 도착한 시각에 태스크의 **상대 마감 시한**을 더한 값이다. 도착 시각을 $r$, 상대 마감 시한을 $D_i$라 하면 절대 마감 시한은 $r + D_i$다.[@linux-sched-deadline-2026][@faa-ar-05-27-2005] Linux 커널의 `SCHED_DEADLINE` 문서에 따르면 태스크는 [[worst-case-execution-time|WCET]], 상대 마감 시한, 주기의 세 값으로 나타낸다.[@linux-sched-deadline-2026]

![[diagrams/task-timing-parameters.svg]]

## Hard와 soft

hard real-time 요구는 마감 시한을 넘기면 시스템이 실패하는 요구이고, soft real-time 요구는 마감 시한을 넘겨도 시스템이 쓸모를 잃지 않는 요구다.[@renesas-res05b0008-2010][@atmel-at04056-2014]

Renesas 앱노트에 따르면 hard real-time에서는 마감 시한을 놓쳐도 되는 정도가 극히 작거나 0이고, 놓치면 시스템에 치명적인 결과가 생긴다. soft real-time에서는 마감 시한을 놓쳐도 회복할 수 있고, 시스템 품질이 떨어지는 것을 받아들일 수 있다.[@renesas-res05b0008-2010]

## 주기와의 관계

Liu와 Layland는 1973년 논문에서 각 태스크가 같은 태스크의 다음 요청이 오기 전에 끝나야 한다고 가정했다. 곧 요청의 마감 시한은 같은 태스크의 다음 요청 시각이다.[@liu-hard-real-time-1973] 이 모델은 [[periodic-task-model|주기 태스크 모델]]에서 다룬다.

Lehoczky는 1990년 마감 시한이 임의인 주기 태스크 집합의 고정 우선순위 스케줄링을 다뤄, 스케줄 가능성의 일반 판정 기준과 Liu와 Layland의 이용률 상한을 일반화한 최악 경우 상한을 냈다.[@lehoczky-arbitrary-deadlines-1990]

Tindell의 1992년 [[response-time-analysis|응답 시간 분석]]에서는 태스크의 최악 응답 시간이 주기 $T_i$보다 길면, 앞 요청이 끝나기 전에 같은 태스크가 다시 도착할 수 있다. 그래서 $D_i \le T_i$인 태스크에 쓰는 응답 시간 식은 앞 요청의 계산을 넣지 않아, 마감 시한이 임의인 태스크에는 충분하지 않다.[@tindell-extendible-approach-1992]
