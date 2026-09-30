---
title: 응답 시간 분석
tags:
  - platform/rtos
verified: 2026-09-29
---

**응답 시간 분석**(response time analysis)은 태스크가 서로 독립이고 선점할 수 있는 [[fixed-priority-scheduling|고정 우선순위 스케줄링]]에서, 태스크마다 최악 응답 시간을 구해 그 태스크의 마감 시한과 비교하는 스케줄 가능성 검사다.[@joseph-response-times-1986][@audsley-flexible-scheduling-1993] 요청의 **응답 시간**(response time)은 요청이 도착한 때부터 그 요청의 처리를 마칠 때까지의 시간이다.[@joseph-response-times-1986][@liu-hard-real-time-1973] **최악 응답 시간**(worst-case response time)은 한 태스크의 요청이 가질 수 있는 가장 긴 응답 시간이다.[@joseph-response-times-1986]

태스크 $i$의 주기를 $T_i$, 마감 시한을 $D_i$, 최악 응답 시간을 $R_i$라 하자. 모든 태스크가 $D_i \le T_i$이고 같은 시각에 도착할 수 있는 태스크 집합에서, 모든 태스크가 $R_i \le D_i$를 만족하면 태스크 집합은 스케줄 가능하다.[@audsley-flexible-scheduling-1993]

## 구조·동작

### Critical instant

태스크가 주기적이고 서로 독립이며 실행 시간이 일정하고, 각 요청의 마감 시한이 다음 요청 시각이고, 우선순위가 높은 요청이 곧바로 선점하면, 태스크의 요청이 우선순위가 더 높은 모든 태스크의 요청과 같은 시각에 도착할 때 그 요청의 응답 시간이 가장 길다. Liu와 Layland는 태스크의 요청이 가장 긴 응답 시간을 갖는 시각을 **critical instant**라 불렀다. 같은 가정에서 critical instant에 도착한 요청이 마감 시한 안에 끝나면 그 태스크의 다른 요청도 모두 마감 시한 안에 끝난다.[@liu-hard-real-time-1973]

### 반복식

태스크가 서로 독립이고 선점할 수 있으며, 태스크 $j$의 요청 사이 최소 간격을 $T_j$, 요청 하나의 최대 처리 시간을 $C_j$라 하자. 모든 태스크가 함께 도착한 뒤 태스크 $i$의 최악 응답 시간 $R_i$는 $C_i$에, 길이 $R_i$의 구간에서 우선순위가 더 높은 태스크 $j$가 $\lceil R_i / T_j \rceil$번 요청해 쓰는 처리 시간을 더한 값이다. 우선순위가 $i$보다 높은 태스크의 집합을 $\mathrm{hp}(i)$라 하면 아래 식과 같다.[@joseph-response-times-1986]

$$
R_i = C_i + \sum_{j \in \mathrm{hp}(i)} \left\lceil \frac{R_i}{T_j} \right\rceil C_j
$$

$R_i$가 양변에 있으므로 반복해 푼다. 첫 값을 $C_i$로 두고 오른쪽 변을 계산해 새 값으로 삼기를, 값이 바뀌지 않을 때까지 되풀이한다. 태스크 집합의 이용률 $U$가 $U < 1$이면 이 반복은 끝난다.[@joseph-response-times-1986] 값은 반복마다 줄지 않고, 마감 시한을 $D_i$라 할 때 $R_i > D_i$가 되면 반복을 멈추고 스케줄할 수 없다고 판정한다.[@audsley-flexible-scheduling-1993]

![[diagrams/response-time-iteration.svg]]

공유 자원을 우선순위 상속 계열 프로토콜로 다루어, 우선순위가 낮은 태스크가 자원을 잡고 있어 태스크 $i$가 기다리는 시간이 $B_i$ 이하로 묶이면, 이를 블로킹 항으로 더한다.[@audsley-flexible-scheduling-1993]

$$
R_i = C_i + B_i + \sum_{j \in \mathrm{hp}(i)} \left\lceil \frac{R_i}{T_j} \right\rceil C_j
$$

### 적용 조건

이 반복식은 마감 시한이 주기 이하($D_i \le T_i$)인 태스크에 그대로 맞는다.[@audsley-flexible-scheduling-1993][@burns-arbitrary-deadlines-2017]

태스크가 최소 도착 간격이 $T_i$인 산발적 태스크이고 같은 태스크의 요청은 도착 순서대로 실행된다고 두면, 마감 시한이 주기보다 길 때는 $R_i$가 $T_i$를 넘을 수 있다. 그러면 같은 태스크의 요청 여럿이 한 priority level-$i$ busy period 안에서 함께 활성일 수 있고, 그 가운데 어느 요청이든 최악 응답 시간을 낼 수 있다. 그래서 첫 요청만 보아서는 최악 응답 시간을 얻지 못하고, busy period 안의 요청을 모두 따져 그 최댓값을 취해야 한다.[@burns-arbitrary-deadlines-2017]

## 비교·한계

태스크가 서로 독립이고 선점할 수 있으면 응답 시간 분석은 필요충분조건 검사다.[@joseph-response-times-1986][@audsley-flexible-scheduling-1993] 그래서 [[rate-monotonic-scheduling|RM]]의 이용률 상한 같은 충분조건 검사가 판정하지 못하는 태스크 집합도 판정한다.[@joseph-response-times-1986][@liu-hard-real-time-1973] 검사의 종류는 [[schedulability-analysis|스케줄링 분석]]에서 다룬다.
