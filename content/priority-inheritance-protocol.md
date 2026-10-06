---
title: 우선순위 상속 프로토콜
tags:
  - platform/rtos
aliases:
  - PIP
verified: 2026-09-30
---

**우선순위 상속 프로토콜**(priority inheritance protocol)은 더 높은 우선순위 태스크를 블록시킨 태스크가, 자기가 블록시킨 태스크들 가운데 가장 높은 우선순위로 실행되게 하는 자원 공유 프로토콜이다.[@sha-real-time-scheduling-ada-1989][@borger-implementing-priority-inheritance-1989] [[critical-section#락|락]]을 쥔 태스크가 중간 우선순위 태스크에 선점되지 않게 해, [[priority-inversion#제한 없는 우선순위 역전|제한 없는 우선순위 역전]]을 막는다. Sha, Rajkumar, Lehoczky는 1987년 Carnegie Mellon University 기술 보고서(CMU-CS-87-181)에서 기본 우선순위 상속 프로토콜과 우선순위 상한 프로토콜을 정의했고, 처음 정의할 때는 공유 자원 접근을 이진 [[semaphore|세마포어]]로 동기화한다고 가정했다.[@borger-implementing-priority-inheritance-1989] 이 보고서는 1990년 IEEE Transactions on Computers 논문으로 실렸다.[@sha-real-time-scheduling-ada-1989][@sha-priority-inheritance-1990] Sha, Rajkumar, Lehoczky의 1990년 논문은 priority inheritance protocols라는 부류에 드는 두 프로토콜로 기본 우선순위 상속 프로토콜(basic priority inheritance protocol)과 [[priority-ceiling-protocol|우선순위 상한 프로토콜]]을 다루며, 두 프로토콜은 모두 제한 없는 우선순위 역전 문제를 푼다.[@sha-priority-inheritance-1990]

## 상속 규칙

태스크 T1이 태스크 T2가 쥔 락에서 블록되면 T2는 T1의 우선순위로 [[critical-section|임계 구역]]을 실행한다. T2는 더 높은 우선순위 태스크를 더는 블록시키지 않게 되면 할당된 우선순위로 돌아간다.[@sha-real-time-scheduling-ada-1989][@borger-implementing-priority-inheritance-1989]

![[diagrams/priority-inheritance-timeline.svg]]

우선순위 상속은 전이적이다. T2가 다시 태스크 T3가 쥔 자원에서 블록되면, T2가 물려받은 우선순위가 T3에게도 전해진다. 기본 우선순위 상속 프로토콜은 블로킹 시간에 상한을 두지만, 그 시간을 최소로 만들지는 않는다.[@borger-implementing-priority-inheritance-1989]

![[diagrams/priority-inheritance-transitive.svg]]

기본 우선순위 상속 프로토콜에서는 높은 우선순위 태스크가 여러 세마포어를 잡아야 할 때, 세마포어마다 그것을 쥔 더 낮은 우선순위 태스크를 기다려야 할 수 있다. 이를 **chained blocking**이라 하며, 그래서 태스크의 최악 블로킹 시간은 공유 자원마다의 최악 블로킹 시간을 더한 값이다.[@davari-unbounded-priority-inversions-1992]

기본 우선순위 상속 프로토콜은 [[deadlock|교착 상태]]를 막지 않는다. Ada 랑데부에 적용하면 서버 태스크들이 서로를 순환 순서로 엔트리 호출할 때 교착 상태가 생길 수 있어, 호출 순서를 부분 순서로 두는 것 같은 교착 방지책을 따로 써야 한다.[@borger-implementing-priority-inheritance-1989]

## 구현

[[ieee-1003-1|POSIX.1]]-2024는 우선순위 상속 옵션(`_POSIX_THREAD_PRIO_INHERIT`나 `_POSIX_THREAD_ROBUST_PRIO_INHERIT`)을 지원하는 구현에 [[mutex|뮤텍스]] 속성 protocol의 값으로 `PTHREAD_PRIO_INHERIT`를 둔다.[@ieee-1003-1-pthread-mutexattr-getprotocol-2024][@ieee-1003-1-unistd-h-2024] 이 프로토콜로 초기화한 뮤텍스를 하나 이상 쥐어 더 높은 우선순위 스레드를 블록시키는 스레드는, 자기 우선순위와 자기가 쥔 그런 뮤텍스를 기다리는 스레드 가운데 가장 높은 우선순위 중 높은 쪽으로 실행되도록 정한다. 또 그 스레드가 다시 다른 `PTHREAD_PRIO_INHERIT` 뮤텍스에서 블록되면, 같은 효과가 그 뮤텍스의 소유 스레드에게 재귀적으로 전해지도록 정한다.[@ieee-1003-1-pthread-mutexattr-getprotocol-2024] POSIX.1-2024는 `SCHED_FIFO` 정책에서 상속이나 우선순위 보호로 잠시 올라간 우선순위가 스레드 목록에서 그 스레드의 위치를 바꾸지 않고, 뮤텍스를 풀어 원래 우선순위로 돌아갈 때도 그렇도록 정한다.[@ieee-1003-1-process-scheduling-2024] POSIX 근거 설명에 따르면 이 방식은 우선순위 역전을 임계 구역 길이로 묶어 타이밍 분석을 할 수 있게 한다.[@ieee-1003-1-rationale-threads-2024]

FreeRTOS의 뮤텍스는 우선순위 상속을 한다. 높은 우선순위 태스크가 낮은 우선순위 태스크가 쥔 뮤텍스를 얻으려다 블록되면, 쥔 태스크의 우선순위를 블록된 태스크의 우선순위까지 잠시 올린다. FreeRTOS는 메모리와 실행 사이클을 아끼려고 이를 단순화해, 태스크가 쥔 뮤텍스를 모두 풀 때까지 푸는 순서와 상관없이 물려받은 가장 높은 우선순위에 머물게 한다.[@freertos-mutexes-2026] FreeRTOS 책은 우선순위 상속이 우선순위 역전을 없애는 것이 아니라 그 시간을 제한할 뿐이고 시스템의 타이밍 분석을 복잡하게 하므로, 시스템이 올바로 동작하는 데 이것에 기대지 말라고 권한다.[@freertos-resource-management-2026]

Zephyr는 뮤텍스를 풀거나 높은 우선순위 대기자가 타임아웃되면, 그 스레드가 아직 쥔 뮤텍스들을 다시 훑어 남은 대기자 가운데 가장 높은 우선순위로 우선순위를 다시 계산하고, 남은 대기자가 없으면 원래 우선순위로 돌아간다. 그래서 뮤텍스를 푸는 순서와 상관없이 결과가 맞다. 설정 옵션 `CONFIG_PRIORITY_CEILING`은 상속으로 올릴 수 있는 우선순위의 상한이다.[@zephyr-mutexes-2026]

RTEMS(Real-Time Executive for Multiprocessor Systems)는 5.1부터 잠금 프로토콜에 따른 우선순위 변경을 곧바로, 재귀적으로 전파한다. 그래서 우선순위 상속이 전이적이다.[@rtems-locking-protocols-2025][@rtems-priority-inheritance-protocol-2025] µC/OS-III는 뮤텍스를 놓을 때 올라갔던 태스크의 우선순위를 원래 값으로 되돌리고, 자기 방식을 **full priority inheritance**라 부른다.[@micrium-ucos-iii-mutual-exclusion-semaphores-2026]

Linux 커널의 rt-mutex는 뮤텍스를 풀면 올렸던 우선순위를 곧바로 되돌린다. 대기자는 우선순위 순으로, 우선순위가 같으면 FIFO(First-In First-Out) 순으로 줄 선다.[@linux-rt-mutex-2026] [[preempt-rt|PREEMPT_RT]] 커널의 rtmutex는 블록된 태스크의 우선순위뿐 아니라 스케줄링 정책도 락 소유자에게 물려준다.[@linux-preempt-rt-theory-2026]

## 우선순위 상한 프로토콜과의 차이

태스크가 이진 세마포어로 임계 구역을 보호하는 단일 프로세서에서, 우선순위 상한 프로토콜은 교착 상태가 생기지 않게 하고, 더 높은 우선순위 태스크를 블록시킬 수 있는 더 낮은 우선순위 태스크를 많아야 하나로 줄인다.[@sha-real-time-scheduling-ada-1989][@sha-priority-inheritance-1990]
