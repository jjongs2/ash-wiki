---
title: 다중 프로세서 스케줄링
tags:
  - platform/rtos
verified: 2026-10-07
---

**다중 프로세서 스케줄링**(multiprocessor scheduling)은 응용을 이루는 태스크 집합을 프로세서 여럿에서 실행하면서 그 시간 제약을 늘 지키게 하는 [[real-time-scheduling|실시간 스케줄링]]이다. 다중 프로세서 스케줄링은 태스크를 어느 프로세서에서 실행할지 정하는 할당 문제와, 각 job을 다른 태스크의 job과 견주어 언제 어떤 순서로 실행할지 정하는 우선순위 문제를 푸는 일로 볼 수 있다.[@davis-survey-hard-real-time-2011]

## 프로세서의 분류

스케줄링의 관점에서 다중 프로세서 시스템은 셋으로 나눈다.[@davis-survey-hard-real-time-2011]

- **heterogeneous**: 프로세서가 서로 달라 태스크의 실행 속도가 프로세서와 태스크 둘 다에 따라 달라지고, 모든 프로세서에서 실행할 수 없는 태스크도 있을 수 있다.
- **homogeneous**: 프로세서가 모두 같아 모든 태스크의 실행 속도가 어느 프로세서에서나 같다.
- **uniform**: 태스크의 실행 속도가 프로세서의 속도에만 달렸다. 속도 2인 프로세서는 모든 태스크를 속도 1인 프로세서의 꼭 두 배로 실행한다.[@davis-survey-hard-real-time-2011]

## Partitioned와 global

할당을 언제 바꿀 수 있는지에 따라 스케줄링 알고리즘을 셋으로 나눈다.[@davis-survey-hard-real-time-2011]

- **이주 없음**(no migration): 태스크마다 프로세서 하나를 정해 두고, 다른 프로세서로 옮기지 않는다.
- **태스크 수준 이주**(task-level migration): 한 태스크의 job들이 서로 다른 프로세서에서 실행될 수 있지만, job 하나는 한 프로세서에서만 실행된다.
- **job 수준 이주**(job-level migration): job 하나가 여러 프로세서로 옮겨 가며 실행될 수 있지만, 한 job을 여러 프로세서에서 동시에 실행하지는 않는다.[@davis-survey-hard-real-time-2011]

이주를 허용하지 않는 스케줄링 알고리즘을 **partitioned** 알고리즘, 이주를 허용하는 알고리즘을 **global** 알고리즘이라 부른다. partitioned 알고리즘에서는 한 프로세서가 놀아도 다른 프로세서에 할당된 준비된 태스크가 그 프로세서를 쓰지 못하므로, partitioned 알고리즘은 [[real-time-scheduling#우선순위의 분류|work-conserving]]이 아니다.[@davis-survey-hard-real-time-2011]

partitioned 스케줄링과 global 스케줄링의 요소를 섞은 방식을 **hybrid** 방식이라 부른다. 그 가운데 몇몇 태스크를 프로세서 사이에 나누어 실행하는 방식을 **semi-partitioned**, 프로세서들을 클러스터로 묶어 태스크를 클러스터에 할당하는 방식을 **clustering**이라 부른다.[@davis-survey-hard-real-time-2011]

## 최적성과 복잡도

태스크마다 첫 요청 시각, 최대 실행 시간, [[deadline#절대와 상대|상대 마감 시한]], 주기를 두고 context switch 시간을 무시하는 [[periodic-task-model|주기 태스크]] 모델에서, [[earliest-deadline-first|EDF]]는 프로세서가 둘 이상이면 최적이 아니다. 같은 모델에서 태스크 집합을, 묶음마다 프로세서 하나에서 EDF로 스케줄할 수 있도록 가장 적은 수의 묶음으로 나누는 문제는 NP-hard다.[@leung-real-time-scheduling-analysis-2005]

같은 모델에서 태스크 수만큼 우선순위 단계가 있어 태스크마다 서로 다른 우선순위를 줄 때, 상대 마감 시한이 짧을수록 높은 우선순위를 주는 DM(Deadline Monotonic)도 프로세서가 둘 이상이면 최적이 아니고, 묶음마다 프로세서 하나에서 DM으로 스케줄할 수 있도록 가장 적은 수의 묶음으로 나누는 문제는 NP-hard다.[@leung-real-time-scheduling-analysis-2005] 단일 프로세서의 DM은 [[fixed-priority-scheduling#우선순위 배정|고정 우선순위 스케줄링]]에서 다룬다.

## Affinity

CMSIS-RTOS2는 스레드 속성 `osThreadAttr_t`에, SMP(Symmetric Multiprocessing) 시스템에서 스레드를 CPU에 묶는 processor affinity mask `affinity_mask`를 둔다. `osThreadSetAffinityMask`는 스레드의 affinity mask를 바꾸고, 마스크는 스레드가 실행될 프로세서를 나타내며 0이면 어느 프로세서에서나 실행된다.[@arm-cmsis-rtos2-thread-management-2026]

Zephyr는 `CONFIG_SCHED_CPU_MASK`로 켜는 API(Application Programming Interface)로 스레드마다 실행될 수 있는 CPU의 집합을 두게 한다. 새 스레드는 기본으로 어느 CPU에서나 실행되고, 이 API는 실행 가능한 스레드에는 쓸 수 없으며 블록되거나 중단된 스레드에만 쓴다.[@zephyr-smp-2026]

RTEMS(Real-Time Executive for Multiprocessor Systems)에서 affinity는 SMP 시스템에서 태스크가 실행될 수 있는 프로세서의 부분집합을 정하고, 태스크는 기본으로 어느 프로세서에서나 실행될 수 있다. RTEMS의 SMP 스케줄러 가운데 일부만 affinity를 지원하고, 지원하지 않는 스케줄러는 affinity 설정을 대개 무시한다.[@rtems-smp-task-affinity-2025]

RTEMS 문서는 시스템의 프로세서들을 비어 있지 않고 서로 겹치지 않는 부분집합으로 나누는 것을 **clustered scheduling**이라 부르고, 그 부분집합을 **cluster**라 부른다. 크기가 1인 cluster는 **partition**이라 부르고, cluster 크기가 프로세서 수와 같으면 global scheduling이라 부른다. RTEMS에서 cluster마다 스케줄러 인스턴스 하나가 맡으며, RTEMS는 시스템의 캐시 구조를 잘 쓰고 최악 지연을 억제하려고 clustered scheduling을 구현했다.[@rtems-smp-clustered-scheduling-2025]

![[diagrams/rtems-clustered-scheduling.svg]]

## 자원 공유

partitioned 고정 우선순위 시스템에 쓰는 [[priority-ceiling-protocol|우선순위 상한 프로토콜]]의 다중 프로세서 변형을 **MPCP**(Multiprocessor Priority Ceiling Protocol)라 부른다. [[stack-resource-policy|스택 자원 정책]]에 바탕을 두고 partitioned 시스템에서 고정 우선순위나 EDF와 함께 쓰는 프로토콜을 **MSRP**(Multiprocessor Stack Resource Policy)라 부르고, 짧은 자원과 긴 자원을 나눠 다루는 프로토콜을 **FMLP**(Flexible Multiprocessor Locking Protocol)라 부른다.[@davis-survey-hard-real-time-2011]

### MrsP

**MrsP**(Multiprocessor resource sharing Protocol)는 단일 프로세서의 우선순위 상한 프로토콜에 바탕을 둔 다중 프로세서 프로토콜로, 원 논문은 이 프로토콜을 sporadic 태스크 모델의 partitioned 고정 우선순위 시스템에 맞춰 정의했다.[@burns-mrsp-2013]

원 논문의 정의에서 자원은 그 자원을 쓰는 태스크가 있는 프로세서마다 상한을 하나씩 갖고, 그 값은 그 프로세서에 할당된 태스크 가운데 그 자원을 쓰는 태스크의 가장 높은 우선순위다. 자원을 요청한 태스크의 우선순위는 곧바로 그 프로세서의 상한으로 오르고, 요청은 FIFO(First-In First-Out) 순서로 처리된다. 태스크는 자원을 기다리는 동안과 쓰는 동안 그 상한 우선순위로 계속 실행되어, 기다리는 동안은 바쁜 대기한다. 자원을 기다리는 태스크는 같은 자원을 기다리다 선점된 다른 태스크를 대신해 그 [[critical-section|임계 구역]]을 원래의 FIFO 순서대로 실행할 수 있어야 한다.[@burns-mrsp-2013]

원 논문은 MrsP를 구현하는 방법 하나로, 자원을 쓰던 태스크가 같은 프로세서의 더 높은 우선순위 태스크에 선점되면 그 자원을 기다리며 바쁜 대기하는 태스크가 있는 프로세서로 옮겨 가 실행하게 하는 방식을 제시한다.[@burns-mrsp-2013]

RTEMS 문서에 따르면 MrsP는 우선순위 상한 프로토콜을 clustered scheduling으로 일반화한 것이다. RTEMS의 MrsP [[mutex|뮤텍스]]는 스케줄러 인스턴스마다 상한을 두고, 뮤텍스 소유자의 우선순위를 그 홈 스케줄러 인스턴스의 상한으로 곧바로 올린다. 뮤텍스를 기다리는 스레드는 블록되지 않고 바쁜 대기하며, 뮤텍스 소유자가 선점되면 소유자를 다른 스케줄러 인스턴스로 잠시 옮긴다.[@rtems-mrsp-2025]

### OMIP

**OMIP**(O(m) Independence-Preserving Protocol)는 clustered job 수준 고정 우선순위 스케줄링을 위한 suspension 기반 이진 [[semaphore|세마포어]] 프로토콜로, 지연에 민감한 태스크를 관계없는 임계 구역 때문에 생기는 지연에서 떼어 놓는 성질인 independence preservation을 지킨다. independence preservation의 열쇠는 태스크가 늘 완전히 선점 가능하게 두는 것이다.[@brandenburg-fully-preemptive-semaphore-2013]

cluster 수가 하나보다 많은 clustered job 수준 고정 우선순위 스케줄링에서는, 세마포어 프로토콜이 [[priority-inversion|우선순위 역전]] 블로킹을 묶고 independence preservation을 지키면서 cluster 사이의 이주까지 피할 수는 없다. 그래서 OMIP는 migratory priority inheritance에 바탕을 둔다. 락을 쥔 job이 준비되었는데도 선점되어 실행되지 못하는 동안, 그 락을 기다리는 job 가운데 자기 cluster에서 스케줄될 수 있는 job이 있으면 락을 쥔 job이 그 cluster로 옮겨 가 그 job의 우선순위를 물려받고, 락을 모두 놓으면 제 cluster로 돌아간다.[@brandenburg-fully-preemptive-semaphore-2013]

RTEMS 문서에 따르면 OMIP는 [[priority-inheritance-protocol|우선순위 상속 프로토콜]]을 clustered scheduling으로 일반화한 것이고, RTEMS의 OMIP 뮤텍스에는 상한 같은 외부 설정 정보가 필요 없다.[@rtems-omip-2025] RTEMS에서 OMIP는 SMP 구성에서만 쓸 수 있고, 그때 우선순위 상속 프로토콜을 대신한다.[@rtems-locking-protocols-2025]
