---
title: 스케줄 가능성 분석
tags:
  - platform/rtos
verified: 2026-09-29
---

Liu와 Layland는 마감 시한, 곧 같은 태스크의 다음 요청 시각이 지나도록 끝나지 않은 요청을 overflow라 하고, overflow가 한 번도 생기지 않게 태스크를 스케줄하는 스케줄링 방식을 feasible이라 불렀다.[@liu-hard-real-time-1973] AUTOSAR의 Timing Analysis and Design 보고서에 따르면 스케줄링 분석(scheduling analysis)은 특정 스케줄러의 모델에 코어 실행 시간과 애플리케이션 모델을 넣어 보장된 최악 응답 시간을 구하고, 이로써 주어진 조건에서 마감 시한을 놓치는지 확인한다. 새 구성을 구현하지 않고도 검증할 수 있다.[@autosar-fo-tr-timinganalysis-2025]

## 구조·동작

### 이용률

태스크가 주기적일 때, 태스크 $i$의 이용률은 실행 시간 $C_i$를 주기 $T_i$로 나눈 값이고, 태스크 집합의 **이용률** $U = \sum_{i=1}^{n} C_i / T_i$는 이 값을 모든 태스크에 대해 더한 값이다. $U$는 태스크 집합을 실행하는 데 쓰인 프로세서 시간의 비율이다. 태스크가 주기적이고 마감 시한이 주기와 같으면, 단일 프로세서에서 $U > 1$인 태스크 집합은 어떤 스케줄링 방식으로도 모든 마감 시한을 지키지 못한다.[@liu-hard-real-time-1973]

### CPU load

**CPU load**는 측정 구간에서 CPU가 idle 상태에 있지 않은 시간의 비율이고, 흔히 퍼센트로 나타낸다.[@autosar-fo-tr-timinganalysis-2025][@ti-spruex3v-2020] 이용률은 태스크의 주기와 실행 시간으로 계산하고, CPU load는 시스템이 실행되는 동안 idle 상태에 머문 시간을 재어 구한다.[@liu-hard-real-time-1973][@autosar-fo-tr-timinganalysis-2025][@ti-spruex3v-2020]

### 충분조건 검사와 필요충분조건 검사

[[rate-monotonic-scheduling|RM]]에 대한 Liu와 Layland의 이용률 상한은 충분조건이다. 이용률이 상한 이하면 스케줄 가능하지만, 상한을 넘는 태스크 집합도 주기끼리 알맞은 관계에 있으면 스케줄 가능할 수 있다. 같은 가정에서 [[earliest-deadline-first|EDF]]로 모든 마감 시한을 지키는 것은 $U \le 1$일 때이고 그때뿐이다.[@liu-hard-real-time-1973]

단일 프로세서의 고정 우선순위 선점 스케줄링에서 태스크가 주기적이고 서로 독립이며, 마감 시한이 주기 이하이고 모든 태스크가 같은 시각에 요청할 수 있으면, [[response-time-analysis|응답 시간 분석]]은 필요충분조건 검사다. 우선순위를 어떻게 정했든 적용된다.[@audsley-flexible-scheduling-1993]

고정 우선순위 선점 스케줄링에서 스케줄 가능 여부만 알면 될 때는, 태스크마다 먼저 충분조건 검사를 하고 이를 통과한 태스크의 정확한 계산을 건너뛰어 계산량을 크게 줄일 수 있다. 태스크마다 정확한 응답 시간이 필요하면 이 방법은 맞지 않는다.[@davis-efficient-exact-2008]

## 비교·한계

고정 우선순위 선점 스케줄링에서 태스크들이 자원을 상호 배제로 공유하면 블로킹이 생긴다. 우선순위 상속 계열 프로토콜을 쓰면 블로킹이 태스크마다 최악 블로킹 시간 $B_i$로 묶이므로, 검사 조건은 $C_i + I_i + B_i \le D_i$가 되고 응답 시간 분석에도 $B_i$를 넣어야 한다. 여기서 $I_i$는 우선순위가 더 높은 태스크가 끼어든 시간, $D_i$는 마감 시한이다.[@audsley-flexible-scheduling-1993]

AUTOSAR의 Timing Analysis and Design 보고서에 따르면 스케줄링 시뮬레이션은 결과를 계산하지 않고 실행 동작을 흉내 내어 타이밍 정보를 얻는다.[@autosar-fo-tr-timinganalysis-2025]
