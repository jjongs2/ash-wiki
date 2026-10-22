---
title: 실시간 스케줄링
tags:
  - platform/rtos
verified: 2026-09-29
---

Mok은 주기적이거나 sporadic인 시간 제약을 실시간으로 계속 지키는 문제를 **실시간 스케줄링** 문제라 부르고, 그 문제를 푸는 알고리즘을 실시간 스케줄링 알고리즘이라 불렀다.[@mok-fundamental-design-1983] [[ieee-1003-1|POSIX]]의 근거 문서에 따르면 시분할 시스템의 스케줄링은 처리량을 높이고 공정성을 북돋우는 것을 목표로 하지만, [[real-time-system|실시간 시스템]]에는 맞지 않는다. 실시간 응용은 외부에서 정한 응답 요구를 맞추려고 실행 순서를 직접 제어해야 한다.[@ieee-1003-1-rationale-process-scheduling-2024]

## 선점

**선점형 스케줄링**에서는 우선순위가 더 높은 [[task|태스크]]가 준비되면, 실행 중인 태스크가 스스로 프로세서를 내놓지 않아도 실행 도중에 멈추고 그 태스크로 바뀐다.[@osek-os-2-2-3-2005][@microchip-an2751-2018]

[[osek-os|OSEK/VDX OS]] 2.2.3 명세는 명시적으로 정한 시스템 서비스에서만 [[osek-task|태스크]]를 바꾸는 방식을 **비선점 스케줄링**이라 정의한다. 이 명세는 완전 선점, 비선점, 둘을 섞은 mixed preemptive 스케줄링을 정의한다.[@osek-os-2-2-3-2005]

![[diagrams/preemptive-nonpreemptive-scheduling.svg]]

선점할 수 있는 시점에 따라 스케줄링 알고리즘을 셋으로 나눈다. pre-emptive 알고리즘에서는 더 높은 우선순위 태스크가 언제든 태스크를 선점할 수 있다. non-pre-emptive 알고리즘에서는 태스크가 실행을 시작하면 선점되지 않고 끝까지 실행된다. co-operative 알고리즘에서는 태스크가 실행 중 정해진 스케줄링 지점에서만 선점될 수 있어, 태스크의 실행이 사실상 선점할 수 없는 구간들로 이어진다.[@davis-survey-hard-real-time-2011] OSEK/VDX OS 2.2.3 명세는 비선점 스케줄링을 이 분류의 non-pre-emptive와 다른 뜻으로 정의한다.[@osek-os-2-2-3-2005][@davis-survey-hard-real-time-2011]

**협력형 멀티태스킹**에서는 각 태스크가 스스로 CPU 시간을 다음 태스크에 넘긴다.[@microchip-an2751-2018][@renesas-res05b0008-2010] Renesas 앱노트와 Micrium 문서는 비선점 스케줄링을 협력형 멀티태스킹이라고도 부른다.[@renesas-res05b0008-2010][@micrium-ucos-ii-rtsc-2026]

## 우선순위 기반

POSIX.1-2024는 실행할 스레드를 우선순위로 고르는 스케줄링을 우선순위 기반 스케줄링이라 정의한다.[@ieee-1003-1-definitions-2024] Micrium 문서에 따르면 실시간 커널은 대부분 우선순위 기반이다.[@micrium-ucos-ii-rtsc-2026] OSEK/VDX OS 2.2.3 명세는 스케줄러가 ready이거나 running인 태스크 가운데 우선순위가 가장 높은 태스크를 고르고, 같은 우선순위에서는 가장 오래된 태스크를 고르도록 정한다. 완전 선점 스케줄링에서는 태스크 종료, 태스크 활성화, 대기 진입, 이벤트 설정, 자원 해제, 인터럽트에서 태스크 수준으로 돌아올 때 재스케줄한다.[@osek-os-2-2-3-2005]

## 우선순위의 분류

Liu와 Layland는 태스크에 우선순위를 한 번 정해 두는 알고리즘을 정적 알고리즘 또는 [[fixed-priority-scheduling|고정 우선순위]] 알고리즘이라 부르고, 요청마다 태스크의 우선순위가 바뀔 수 있는 알고리즘을 동적 알고리즘이라 불렀다.[@liu-hard-real-time-1973] 이 논문의 분석은 [[periodic-task-model#Liu와 Layland의 가정|주기 태스크 모델]]에서 다룬다.

job 선점을 허용하면, 우선순위를 주는 방식에 따라 스케줄링 알고리즘을 셋으로 나눈다.[@carpenter-categorization-2004]

- **정적 우선순위**(fixed task priority): 태스크마다 우선순위 하나를 두고, 그 태스크의 모든 job이 그 우선순위를 쓴다. 예: [[rate-monotonic-scheduling|rate monotonic]], deadline monotonic
- **job 수준 동적 우선순위**(fixed job priority): job마다 우선순위가 다를 수 있지만, 어느 순간 job A가 job B보다 우선순위가 높으면 A는 늘 B보다 높다. 곧 job 하나의 우선순위는 바뀌지 않는다. 예: [[earliest-deadline-first|earliest deadline first]]
- **제한 없는 동적 우선순위**(dynamic priority): 두 job의 상대 우선순위가 job이 실행되는 동안에도 아무 때나 바뀔 수 있다. 제한 없는 동적 우선순위는 job 수준 동적 우선순위를 일반화한 것이다.[@davis-survey-hard-real-time-2011][@carpenter-categorization-2004]

job 선점을 허용하면, [[deadline|마감 시한]]까지 남은 시간에서 남은 실행 시간을 뺀 slack이 가장 작은 준비된 프로세스를 먼저 실행하는 Mok의 least slack 알고리즘은 제한 없는 동적 우선순위에 든다.[@mok-fundamental-design-1983][@carpenter-categorization-2004] Mok의 이 알고리즘을 Least Laxity First(LLF)라고도 부르며, laxity는 slack time과 같은 말이다.[@sha-real-time-scheduling-theory-2004]

실행할 준비가 된 태스크가 있는 동안 프로세서가 놀지 않게 하는 스케줄링 알고리즘을 **work-conserving** 알고리즘이라 한다.[@davis-survey-hard-real-time-2011]

## 최적성

Liu와 Layland는 rate monotonic 배정이 최적이라는 것을, rate monotonic으로 스케줄할 수 없는 태스크 집합은 다른 어떤 고정 우선순위 배정 규칙으로도 스케줄할 수 없다는 뜻으로 썼다. 우선순위를 동적으로 주는 deadline driven 스케줄링 알고리즘에는, 어떤 우선순위 배정으로 스케줄할 수 있는 태스크 집합이면 이 알고리즘으로도 스케줄할 수 있다는 뜻으로 최적이라는 말을 썼다.[@liu-hard-real-time-1973]

Mok은 모든 프로세스의 앞으로의 요청 시각을 확실히 예측하는 oracle을 가진 run-time 스케줄러를 clairvoyant 스케줄러라 부르고, clairvoyant 스케줄러가 실행 가능한 스케줄을 만들 수 있을 때마다 늘 실행 가능한 스케줄을 만드는 run-time 스케줄러를 최적이라 정의했다.[@mok-fundamental-design-1983]

## POSIX의 스케줄링 정책

POSIX.1-2024는 [[ieee-1003-1#범위|Process Scheduling 옵션]]을 지원하는 구현에 스레드마다 스케줄링 정책과 우선순위를 두게 하고 아래 정책을 정하며, `SCHED_FIFO`, `SCHED_RR`, `SCHED_SPORADIC`에는 우선순위를 32개 이상 두도록 요구한다. `SCHED_SPORADIC`은 선택 옵션이다.[@ieee-1003-1-process-scheduling-2024]

| 정책             | 동작                                                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SCHED_FIFO`     | 우선순위마다 스레드 목록을 두고, 가장 높은 우선순위의 비지 않은 목록의 맨 앞 스레드를 실행한다. 선점된 스레드는 자기 우선순위 목록의 맨 앞으로 돌아간다.                               |
| `SCHED_RR`       | `SCHED_FIFO`와 같되, 스레드가 `sched_rr_get_interval()`이 돌려주는 시간 이상 실행되면 그 목록의 맨 뒤로 간다.                                                                          |
| `SCHED_SPORADIC` | 보충 주기와 실행 용량을 두는 [[aperiodic-server#Sporadic server\|sporadic server]] 정책으로, 용량이 남은 동안은 `sched_priority`로, 용량을 다 쓰면 `sched_ss_low_priority`로 실행한다. |
| `SCHED_OTHER`    | 구현이 반드시 두는 정책으로, `SCHED_FIFO`나 `SCHED_RR`과 똑같이 동작해도 된다. 다른 정책의 스레드와 섞였을 때의 효과는 구현이 정한다.                                                  |

구현은 `<unistd.h>`의 `_POSIX_PRIORITY_SCHEDULING`으로 Process Scheduling 옵션 지원을 나타낸다.[@ieee-1003-1-unistd-h-2024] 이 표준은 우선순위를 프로세스나 스레드에 딸린, 스케줄링 정책이 정한 범위 안의 음이 아닌 정수로 정의하고, 값이 클수록 우선순위가 높다고 정한다.[@ieee-1003-1-definitions-2024]

## 같은 우선순위(타임 슬라이싱)

µC/OS-III에서는 같은 우선순위의 태스크가 둘 이상이면 미리 정한 시간(time quanta) 동안 한 태스크를 실행한 뒤 다른 태스크를 고르며, 이를 **round-robin 스케줄링** 또는 **타임 슬라이싱**이라 부른다. 태스크는 자기 time quanta를 다 쓰지 않고 CPU를 내줄 수 있다. round-robin 스케줄링은 실행 중에 켜고 끌 수 있고, time quanta를 태스크마다 정할 수 있다.[@micrium-ucos-iii-round-robin-scheduling-2026] 이 커널은 선점형이라 늘 준비된 태스크 가운데 우선순위가 가장 높은 태스크를 실행하며, 같은 우선순위의 준비된 태스크들을 time quanta씩 돌아가며 실행하는 것은 그 우선순위가 가장 높을 때다.[@micrium-ucos-iii-features-2026]

FreeRTOS에서 타임 슬라이싱을 쓰면, 실행 중인 태스크와 우선순위가 같은 준비된 태스크가 있을 때 타임 슬라이스가 끝날 때마다 새 태스크를 고른다. 타임 슬라이스는 두 [[system-tick|틱 인터럽트]] 사이의 시간이다. 더 높은 우선순위 태스크가 준비되면 타임 슬라이스 도중에도 선점한다. 단일 코어 구성의 FreeRTOS 스케줄러는 같은 우선순위의 준비된 태스크를 늘 차례로 실행 상태에 들게 하지만, 같은 우선순위 태스크들에 시간을 똑같이 나눈다고 보장하지는 않는다. 타임 슬라이싱을 끄면 [[context-switch|context switch]]가 줄어 스케줄러의 처리 부담이 줄지만, 같은 우선순위의 태스크가 받는 처리 시간이 크게 달라질 수 있다.[@freertos-task-management-2026]

![[diagrams/freertos-time-slicing.svg]]

Zephyr 스케줄러는 CPU마다 시간을 시스템 클록 틱 단위의 타임 슬라이스로 나눈다. 타임 슬라이스가 끝날 때마다 지금 스레드가 선점 가능하면 그 스레드 대신 `k_yield()`를 불러, 같은 우선순위의 다른 준비된 스레드가 실행되게 한다. 지정한 한계보다 우선순위가 높은 스레드는 타임 슬라이싱에서 빠져, 같은 우선순위의 스레드에 선점되지 않는다. Zephyr의 타임 슬라이싱은 스레드가 실제로 실행된 시간을 재지 않아 같은 우선순위 스레드들에 CPU 시간을 공평하게 나눈다고 보장하지 않지만, 한 스레드가 타임 슬라이스 하나보다 오래 양보 없이 실행되지는 않게 한다.[@zephyr-scheduling-2026]

RTEMS(Real-Time Executive for Multiprocessor Systems)에서는 타임 슬라이싱을 태스크마다 모드 플래그로 켠다. 켠 태스크는 실시간 클록의 틱마다 타임 슬라이스가 줄고, 실행 시간이 타임 슬라이스와 같아지면 RTEMS가 같은 우선순위의 다른 태스크를 디스패치한다. 같은 우선순위의 준비된 태스크가 없으면 지금 태스크가 타임 슬라이스를 하나 더 받아 계속 실행한다. 더 높은 우선순위 태스크는 선점을 끄지 않았다면 타임 슬라이스가 남아 있어도 준비되는 대로 선점한다.[@rtems-scheduling-background-2025]

POSIX.1-2024는 같은 우선순위의 프로세스가 처리기 자원을 더 고르게 나누도록 타임 슬라이스 같은 기능을 주려고 위 표의 `SCHED_RR`을 둔다. 같은 우선순위에 처리기만 쓰는 프로세스 $N$개가 있고 time quantum $Q$가 모두 같으면, 이 정책에는 현재 프로세스가 적어도 $Q$ 동안 처리기를 가지며 $N$번째 프로세스가 $(N-1) \times Q$ 안에 처리기를 얻는다는 가정이 따른다. 이 가정은 인터럽트 처리 같은 시스템 부담이 없을 때만 성립하고, 인터럽트 처리 부하가 있으면 $Q$를 어떻게 재느냐에 따라 둘 가운데 하나가 깨진다.[@ieee-1003-1-rationale-process-scheduling-2024]

## Linux `SCHED_OTHER`와의 차이

Linux 커널은 기본으로 `SCHED_OTHER` 스케줄링 정책을 쓴다. 이 정책에서는 태스크가 다른 실행 가능한 태스크에 견주어 공정한 몫의 CPU 시간을 썼다고 스케줄러가 판단할 때 그 태스크를 선점하며, 새 `SCHED_OTHER` 태스크가 실행 가능해져도 곧바로 선점한다고 보장하지 않는다. `SCHED_FIFO` 같은 실시간 정책의 태스크는 실행 가능해질 때 실행 중인 태스크보다 우선순위가 높으면 곧바로 실행되고, 대개 사건을 기다리며 블록해 스스로 CPU를 내줄 때까지 실행된다.[@linux-preempt-rt-theory-2026]

Linux의 CFS(Completely Fair Scheduler)는 모든 태스크를 같은 속도로 나란히 실행하는 이상적인 멀티태스킹 CPU를 실제 하드웨어에서 흉내 내도록 설계됐다. CFS는 desktop 프로세스 스케줄러이고, 유일한 조정값의 기본값은 낮은 지연을 요구하는 desktop 부하에 맞춘 값이다. 2026년 9월 기준 CFS는 EEVDF(Earliest Eligible Virtual Deadline First)에 자리를 내주고 있다.[@linux-sched-design-cfs-2026] Linux 커널은 6.6부터 CFS에서 EEVDF로 옮겨 가기 시작했다. EEVDF도 같은 우선순위의 실행 가능한 태스크들에 CPU 시간을 고르게 나누는 것을 목표로 한다.[@linux-sched-eevdf-2026] POSIX 근거 문서에 따르면 실시간 프로세스는 스케줄링이 더 낮은 우선순위 프로세스를 반드시 선점해 주기를 요구하고, 중요한 프로세스가 실행 가능할 때마다 필요한 만큼 실행된다는 보장이 있어야 한다.[@ieee-1003-1-rationale-process-scheduling-2024]
