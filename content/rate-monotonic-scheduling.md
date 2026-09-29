---
title: Rate monotonic 스케줄링
aliases:
  - RM
tags:
  - platform/rtos
verified: 2026-09-29
---

**Rate monotonic 스케줄링**은 주기 태스크에 주기가 짧을수록, 곧 요청 빈도가 높을수록 높은 우선순위를 주고, 그 우선순위를 한 번 정하면 바꾸지 않는 우선순위 배정 규칙이다. Liu와 Layland가 1973년 논문에서 이 규칙과 그 이용률 상한을 제시했고, 요청 빈도(rate)에 따라 우선순위가 정해진다는 뜻에서 rate-monotonic priority assignment라 불렀다.[@liu-hard-real-time-1973] FAA(Federal Aviation Administration) 보고서 DOT/FAA/AR-05/27은 이 알고리즘을 RM(Rate-Monotonic)으로 줄여 쓴다.[@faa-ar-05-27-2005]

## 구조·동작

### 배정 규칙

RM은 우선순위를 실행 시간과 상관없이 태스크의 주기만으로 정하므로, [[fixed-priority-scheduling|고정 우선순위 스케줄링]]의 배정 규칙 가운데 하나다. Liu와 Layland가 다룬 스케줄링은 선점형이라, 실행 중인 태스크보다 우선순위가 높은 태스크의 요청이 오면 실행 중인 태스크를 곧바로 멈추고 새로 요청된 태스크를 시작한다.[@liu-hard-real-time-1973]

### 최적성

단일 프로세서에서 태스크가 일정한 간격으로 요청되는 주기 태스크이고, 서로 독립이며, 각 요청의 마감 시한이 다음 요청 시각이고, 실행 시간이 일정하며, 선점할 수 있으면, RM은 고정 우선순위 배정 가운데 최적이다. 어떤 고정 우선순위 배정으로 모든 마감 시한을 지킬 수 있는 태스크 집합은 RM으로도 지킬 수 있다.[@liu-hard-real-time-1973]

### 이용률 상한

같은 가정에서 태스크 $n$개의 [[schedulability-analysis|이용률]] $U$가 $U \le n(2^{1/n} - 1)$을 만족하면 RM으로 모든 마감 시한을 지킨다. 이 상한은 $n = 2$일 때 약 0.828이고, $n$이 커지면 $\ln 2$(약 0.693)에 가까워진다.[@liu-hard-real-time-1973]

이 조건은 충분조건이다. 이용률이 상한을 넘어도 주기끼리 알맞은 관계에 있으면 RM으로 스케줄할 수 있다. 이런 태스크 집합은 태스크마다, 우선순위가 더 높은 모든 태스크와 함께 요청하는 [[response-time-analysis|critical instant]]에 낸 요청이 마감 시한 전에 끝나는지를 계산해 판정한다.[@liu-hard-real-time-1973]

![[diagrams/utilization-bound-rm-edf.svg]]

## 비교·한계

마감 시한이 주기와 다른 태스크가 있으면 RM은 최적이 아니다.[@faa-ar-05-27-2005] 마감 시한이 짧을수록 높은 우선순위를 주는 DM(Deadline Monotonic)은 [[fixed-priority-scheduling|고정 우선순위 스케줄링]]에서 다룬다.

현재 요청의 마감 시한이 가까울수록 높은 우선순위를 주는 [[earliest-deadline-first|EDF]]는 요청마다 우선순위가 바뀌는 동적 배정이라, RM이 최적인 고정 우선순위 배정의 부류 밖에 있다. 같은 가정에서 EDF는 이용률이 1 이하인 태스크 집합을 모두 스케줄하고, 1을 넘으면 어떤 알고리즘도 스케줄하지 못한다.[@liu-hard-real-time-1973]
