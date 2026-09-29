---
title: 주기 태스크 모델
tags:
  - platform/rtos
verified: 2026-09-29
---

**주기 태스크 모델**(periodic task model)은 [[real-time-system|실시간 시스템]]이 하는 일을, 요청이 일정한 간격으로 되풀이되는 태스크의 집합으로 나타내는 모델이다. Liu와 Layland는 1973년 논문에서 이 모델로 고정 우선순위 스케줄링과, 마감 시한에 따라 우선순위를 동적으로 주는 deadline driven 스케줄링을 분석했다.[@liu-hard-real-time-1973] 태스크는 끝없이 되풀이해 요청될 수 있다.[@mok-fundamental-design-1983]

## 구조·동작

### 파라미터

Liu와 Layland의 모델에서 태스크 $\tau_i$의 **요청 주기** $T_i$는 이웃한 두 요청 사이의 일정한 간격이고, **실행 시간** $C_i$는 프로세서가 태스크를 중단 없이 실행하는 데 드는 시간이다. 실행 시간은 태스크의 최대 처리 시간으로 해석할 수 있고, 그러면 다음 요청을 준비하는 비용과 선점 비용도 넣을 수 있다.[@liu-hard-real-time-1973] Tindell의 1992년 응답 시간 분석은 $C_i$를 [[worst-case-execution-time|WCET]]로 두고, [[context-switch|문맥 전환]] 비용을 여기에 넣는다.[@tindell-extendible-approach-1992]

**상대 마감 시한** $D_i$는 태스크가 요청된 시각부터, 그 요청이 끝나야 하는 시각까지의 길이다.[@mok-fundamental-design-1983][@tindell-extendible-approach-1992] 마감 시한은 [[deadline|마감 시한]]에서 다룬다.

![[diagrams/task-timing-parameters.svg]]

태스크 집합의 **프로세서 이용률** $U$는 태스크 집합을 실행하는 데 쓰는 프로세서 시간의 비율이고, $U = \sum_i C_i / T_i$다.[@liu-hard-real-time-1973]

### Liu와 Layland의 가정

Liu와 Layland는 1973년 논문에서 아래 다섯 가지를 가정했고, 이 가정 아래에서 태스크는 요청 주기와 실행 시간 두 값으로 모두 정해진다.[@liu-hard-real-time-1973]

- hard 마감 시한이 있는 태스크의 요청은 주기적이고, 요청 사이의 간격이 일정하다.
- 각 요청은 같은 태스크의 다음 요청이 오기 전에 끝나야 한다.
- 태스크는 서로 독립이다. 한 태스크의 요청은 다른 태스크의 요청이 시작되거나 끝나는 것에 기대지 않는다.
- 태스크마다 실행 시간이 일정하고, 시간에 따라 바뀌지 않는다.
- 주기적이지 않은 태스크는 초기화나 고장 복구 루틴 같은 특별한 경우다. 이런 태스크는 실행되는 동안 주기 태스크를 밀어내고, hard 마감 시한이 없다.[@liu-hard-real-time-1973]

### periodic과 sporadic

- **periodic 태스크**: 일정한 주기마다 요청된다.[@liu-hard-real-time-1973]
- **sporadic 태스크**: 아무 때나 요청될 수 있지만, 이웃한 두 요청은 정해진 최소 간격 이상 떨어져 있다.[@mok-fundamental-design-1983]

![[diagrams/periodic-sporadic-arrivals.svg]]

Mok은 1983년 MIT 박사 학위논문에서 periodic 프로세스와 함께 sporadic 프로세스를 모델링했다. 최소 간격은 sporadic 프로세스가 시스템 자원을 독점하지 못하게 하려고 둔다. sporadic 태스크의 $T_i$를 최소 간격으로 두면, periodic 태스크와 sporadic 태스크가 섞인 집합이 스케줄 가능하려면 $\sum_i C_i / T_i$가 프로세서 수를 넘지 않아야 한다.[@mok-fundamental-design-1983]

### release와 jitter

Tindell의 1992년 분석은 도착한 태스크가 우선순위 순 실행 대기열에 놓이는 것을 release라 하고, 태스크가 도착하는 시각과 release되는 시각이 다를 수 있다고 본다. 도착과 release 사이에 늦어질 수 있는 최대 시간이 **release jitter**다. release jitter는 tick 스케줄러의 폴링이나 메시지 대기 때문에 생긴다.[@tindell-extendible-approach-1992]

AUTOSAR Classic Platform의 타이밍 확장 명세는 주기적으로 일어나는 이벤트의 타이밍 제약(PeriodicEventTriggering)에 주기, jitter, 최소 발생 간격을 둔다. 이 명세에서 jitter는 주기적 이벤트의 발생이 주기에서 벗어날 수 있는 최대 폭이다.[@autosar-cp-tps-timingextensions-2025]

## 비교·한계

Liu와 Layland는 다섯 가정 가운데 요청이 주기적이라는 가정과 실행 시간이 일정하다는 가정이 가장 중요하면서도 가장 방어하기 어렵다고 보았다. 또 이용률로 스케줄 가능성을 따질 때도, 태스크 사이를 전환하는 실제 비용은 따로 따져야 한다고 했다.[@liu-hard-real-time-1973]

Tindell은 1992년 고정 우선순위 선점 스케줄링의 응답 시간 분석을 넓혀, 임의 마감 시한, release jitter, 버스트형 sporadic 태스크를 다뤘다.[@tindell-extendible-approach-1992]
