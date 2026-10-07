---
title: 스택 자원 정책
tags:
  - platform/rtos
verified: 2026-10-07
---

**스택 자원 정책**(Stack Resource Policy)은 정적 우선순위 시스템과 동적 우선순위 시스템 모두에서 [[priority-inversion|우선순위 역전]]을 묶는 동시성 제어 프로토콜이다. Baker가 1991년에 제안했다.[@sha-real-time-scheduling-theory-2004] Baker의 1991년 논문은 [[priority-ceiling-protocol|우선순위 상한 프로토콜]]을 여러 단위가 있는 자원, 정적 preemption level을 쓰는 [[earliest-deadline-first|EDF]] 같은 동적 우선순위 방식, job 사이의 실행 스택 공유로 넓히는 방법을 보이고, 이 셋을 모두 담은 변형으로 스택 자원 정책을 정의했다. 이 정책은 스택 하나로 아주 간단히 구현할 수 있다.[@baker-stack-based-scheduling-1991]

## Preemption level

EDF에서 [[deadline#절대와 상대|상대 마감 시한]]이 긴 job은 상대 마감 시한이 짧은 job을 늦출 수는 있어도 선점할 수는 없다. 그래서 job은 자기보다 상대 마감 시한이 긴 job을 블록할 수 없고, EDF에서 블로킹을 따질 때는 상대 마감 시한이 긴 job이 짧은 job을 블록하는 경우만 보면 된다. 스택 자원 정책은 이 관찰을 바탕으로 EDF에서 우선순위와 따로, 상대 마감 시한에 반비례하게 정하는 값을 두며 이를 **preemption level**이라 한다.[@sha-real-time-scheduling-theory-2004]

EDF와 함께 쓰면 태스크 $\tau_i$의 job마다 절대 마감 시한에 따른 우선순위와, 상대 마감 시한에 반비례하는 정적 preemption level $\pi_i$를 준다.[@sha-real-time-scheduling-theory-2004]

## 상한과 시작 규칙

공유 자원마다 그 자원을 잠글 모든 태스크의 preemption level 가운데 가장 높은 값을 그 자원의 상한(ceiling)이라 하고, 지금 잠긴 모든 자원의 상한 가운데 가장 높은 값을 **system ceiling** $\pi$라 한다. 자원의 상한을 정하는 방식은 우선순위 상한 프로토콜의 우선순위 상한과 같다.[@sha-real-time-scheduling-theory-2004]

스택 자원 정책의 스케줄링 규칙에서, job은 활성 태스크 가운데 우선순위가 가장 높고 preemption level이 system ceiling보다 높아질 때까지 실행을 시작하지 못한다.[@sha-real-time-scheduling-theory-2004]

## 성질

스택 자원 정책에서 job은 일단 실행을 시작하면 끝날 때까지 블록되지 않고, 우선순위가 더 높은 태스크에 선점될 뿐이다. 이 정책은 [[deadlock|교착 상태]]를 막고, job이 블록되는 시간은 [[critical-section|임계 구역]] 하나의 길이를 넘지 않는다. 태스크가 실행 도중에 블록되지 않으므로 대기 큐를 둘 필요가 없고, 스케줄 가능성 분석의 블로킹 시간 $B_i$는 태스크 $\tau_i$가 preemption level 검사 때문에 준비 큐에 머무는 시간이다. 또 태스크들이 실행 스택 하나를 함께 쓸 수 있어, 태스크가 상대 우선순위 단계보다 훨씬 많으면 메모리를 크게 아낄 수 있다.[@sha-real-time-scheduling-theory-2004]

![[diagrams/stack-resource-policy-system-ceiling.svg]]

EDF로 스케줄하고 주기 태스크와 sporadic 태스크만 있는 자원 공유 태스크 집합에서, 태스크를 preemption level이 높은 순으로 늘어놓아 $i < j$일 때만 $\pi_i \ge \pi_j$라 하자. 태스크 $\tau_k$의 실행 시간을 $C_k$, 주기를 $T_k$라 할 때, 모든 $i$($1 \le i \le n$)에 대해 아래 조건이 성립하면 태스크 집합은 스케줄 가능하다. 이 조건은 충분조건이다.[@sha-real-time-scheduling-theory-2004]

$$
\sum_{k=1}^{i} \frac{C_k}{T_k} + \frac{B_i}{T_i} \le 1
$$

우선순위 상한이라는 개념은 우선순위 상한 프로토콜과 스택 자원 정책 같은 여러 잠금 프로토콜의 바탕이다.[@sha-real-time-scheduling-theory-2004] 다중 프로세서로 넓힌 변형은 [[multiprocessor-scheduling#자원 공유|다중 프로세서 스케줄링]]에서 다룬다.

Ada 2022 Reference Manual은 우선순위 태스크 스케줄링과 보호 객체(protected object)의 상호작용을 보호 객체의 우선순위 상한(ceiling priority)이라는 개념에 바탕을 두어 정하고, 그 잠금 정책으로 `Ceiling_Locking`을 미리 정의한다.[@acaa-ada-rm-d-3-2023]
