---
title: 임계 구역
tags:
  - platform/rtos
verified: 2026-09-30
---

**임계 구역**(critical section)은 여러 [[task|태스크]]나 인터럽트 처리기가 함께 쓰는 자원에 접근하는 코드 구간이다. 공유 자원에는 전역 변수, 메모리 버퍼와 자료 구조 같은 메모리 위의 자료와, 주변 장치와 그 레지스터가 있다.[@osek-os-2-2-3-2005][@freertos-resource-management-2026] 파일도 한 번에 한 스레드만 쓰도록 보호해야 하는 공유 자원이다.[@oracle-816-5137-reentrant-function-2010][@arm-cmsis-rtos2-mutex-2026] 한 실행 흐름이 공유 자원에 접근하는 동안 다른 흐름은 그 자원에 접근하지 못하게 해, 접근을 한 번에 하나로 줄 세우는 것을 **상호 배제**(mutual exclusion)라 한다.[@freertos-resource-management-2026][@ieee-1003-1-definitions-2024]

Dijkstra는 EWD123(Cooperating Sequential Processes)에서 임계 구역을 가진 N개 프로세스 가운데 언제나 많아야 하나만 임계 구역에 있게 하는 상호 배제 문제를 다루고, [[semaphore|세마포어]]를 써서 풀었다.[@dijkstra-cooperating-sequential-processes-1965]

## 끊길 수 있는 접근

FreeRTOS 커널 책에 따르면 `PORTA |= 0x01` 같은 C 문장은 보통 값을 레지스터로 읽고, 레지스터에서 고치고, 메모리에 다시 쓰는 여러 명령(read-modify-write)으로 번역되어 중간에 끊길 수 있다. 변수를 고칠 때도 같다. 한 태스크가 값을 읽은 뒤 고쳐 쓰기 전에 선점되고 그사이 다른 태스크가 같은 값을 고치면, 앞 태스크가 돌아와 옛 값을 고쳐 써서 다른 태스크의 수정을 덮어쓴다.[@freertos-resource-management-2026]

![[diagrams/read-modify-write-lost-update.svg]]

이처럼 실행 결과가 여러 실행 흐름의 상대적인 실행 시점이나 순서에 따라 달라지는 것을 **race condition**이라 한다.[@linux-locking-guide-2026][@microsoft-managed-threading-best-practices-2026]

[[ieee-1003-1|POSIX.1]]-2024는 서로 다른 스레드의 충돌하는 두 동작 가운데 적어도 하나가 [[spinlock#원자 명령|원자적]]이지 않고 어느 쪽도 다른 쪽보다 먼저 일어나지 않는 상황을 **데이터 경쟁**(data race)으로 정의하고, 데이터 경쟁이 있으면 동작이 정의되지 않는다고 정한다.[@ieee-1003-1-definitions-2024][@ieee-1003-1-general-concepts-2024] 이 표준은 데이터 경쟁을 피하도록, 둘 이상의 스레드나 프로세스가 lock-free가 아닌 방식으로 같은 메모리 위치에 접근할 때 한쪽이 고치는 동안 다른 쪽이 그 위치를 읽거나 고치지 못하게 하는 일을 애플리케이션에 요구한다. 또 `pthread_mutex_lock`, `pthread_mutex_unlock` 같은 함수가 [[mutex|뮤텍스]]를 얻거나 놓을 때 메모리를 동기화한다고 정한다. 메모리를 동기화하는 함수에는 세마포어의 `sem_wait`, `sem_post`와 [[spinlock|스핀락]]의 `pthread_spin_lock`, `pthread_spin_unlock`도 든다.[@ieee-1003-1-general-concepts-2024]

## 인터럽트 금지

임계 구역 동안 인터럽트를 모두 끄면 그 구간은 인터럽트에 끊기지 않는다.[@osek-os-2-2-3-2005][@microchip-harmony-osal-2018] FreeRTOS에서는 선점형 [[context-switch|context switch]]가 인터럽트 안에서만 일어나므로, `taskENTER_CRITICAL()`로 인터럽트를 끈 태스크는 임계 구역을 나올 때까지 실행 상태에 머문다. 다만 포트가 `configMAX_SYSCALL_INTERRUPT_PRIORITY`를 쓰면 그 우선순위 이하의 인터럽트만 꺼지고, 더 높은 인터럽트는 켜진 채 남는다.[@freertos-taskenter-critical-2026]

[[autosar-os|AUTOSAR R25-11 OS]] 명세는 인터럽트 금지가 그것을 호출한 코어에만 걸리게 정한다. 그래서 다른 코어에서는 스케줄링과 인터럽트 처리가 계속된다.[@autosar-cp-sws-os-2025] Zephyr와 RTEMS(Real-Time Executive for Multiprocessor Systems) 문서에 따르면 SMP(Symmetric Multiprocessing) 시스템에서 한 프로세서의 인터럽트를 가려도 다른 프로세서가 같은 데이터에 동시에 접근하는 것은 막지 못하므로, 인터럽트 금지만으로는 시스템 전체의 상호 배제가 되지 않는다.[@zephyr-smp-2026][@rtems-smp-interrupts-2025] [[preempt-rt|PREEMPT_RT]] 커널에서는 `spinlock_t`를 잡는 `spin_lock_irq` 같은 `_irq` 접미사 함수도 인터럽트를 끄지 않는다.[@linux-locktypes-2026]

인터럽트를 끄는 임계 구역은 짧게 둔다.[@osek-os-2-2-3-2005][@freertos-taskenter-critical-2026] 인터럽트를 끄는 임계 구역이 길면 [[deferred-interrupt-handling#인터럽트 지연과 응답|인터럽트 응답 시간]]이 나빠진다.[@freertos-taskenter-critical-2026][@micrium-ucos-ii-rtsc-2026]

## 스케줄러 잠금

스케줄러 잠금은 임계 구역 동안 태스크 전환을 막는다.[@micrium-ucos-iii-locking-the-scheduler-2026][@arm-cmsis-rtos2-kernel-2026] µC/OS-III와 FreeRTOS에서는 스케줄러를 잠근 동안에도 인터럽트를 받아 처리한다.[@micrium-ucos-iii-locking-the-scheduler-2026][@freertos-vtasksuspendall-2026] FreeRTOS에 따르면 인터럽트를 끄기에는 너무 긴 임계 구역은 스케줄러를 멈추는 방법으로 만들 수 있다.[@freertos-resource-management-2026] [[osek-os|OSEK OS]]에서는 태스크가 [[osek-resource|resource]]의 하나인 `RES_SCHEDULER`를 얻어 스케줄러를 잠근다.[@osek-os-2-2-3-2005]

µC/OS-III와 FreeRTOS에서는 태스크와 인터럽트 처리기가 함께 쓰는 임계 구역은 인터럽트를 꺼서 보호하고, 태스크끼리만 쓰는 임계 구역은 스케줄러를 잠가 보호할 수 있다.[@freertos-resource-management-2026][@micrium-ucos-iii-critical-sections-2026] FreeRTOS에서 스케줄러를 멈춘 동안 인터럽트가 요청한 [[context-switch|context switch]]는 보류되었다가 스케줄러를 다시 켤 때 일어난다. 커널이 중첩 깊이를 세므로 멈추기와 다시 켜기는 중첩해 부를 수 있고, 깊이가 0으로 돌아와야 스케줄러가 다시 켜진다.[@freertos-resource-management-2026] µC/OS-III에서도 스케줄러를 잠근 동안 인터럽트가 더 높은 우선순위 태스크를 준비시키면 커널은 인터럽트된 태스크로 돌아가고, 잠금을 푼 뒤 context switch를 한다. 잠금은 중첩할 수 있고, 잠근 횟수만큼 풀어야 스케줄러가 다시 돈다.[@micrium-ucos-iii-lock-unlock-2026]

![[diagrams/interrupt-disable-vs-scheduler-lock.svg]]

CMSIS-RTOS2는 `osKernelLock`으로 모든 태스크 전환을 잠그고 그 전의 잠금 상태를 돌려주게 하며, `osKernelRestoreLock`으로 그 상태를 되돌리게 한다. `osKernelLock`은 ISR(Interrupt Service Routine)에서 부를 수 없다.[@arm-cmsis-rtos2-kernel-2026]

RTEMS의 단일 프로세서 구성에서는 스레드의 선점을 꺼서 스레드 사이의 상호 배제를 보장할 수 있지만, SMP 구성에서는 실행 중인 스레드가 여럿일 수 있어 그럴 수 없다. 그래서 RTEMS는 SMP 구성에서 이 기능을 막는다.[@rtems-smp-thread-preemption-2025]

µC/OS-III 문서는 상호 배제 방법마다 쓸 때를 아래처럼 제시한다.[@micrium-ucos-iii-resource-management-2026]

| 방법          | 쓸 때                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| 인터럽트 금지 | 공유 자원 접근이 µC/OS-III의 인터럽트 금지 시간보다 짧을 때. 문서는 쓰지 않기를 권한다.       |
| 스케줄러 잠금 | 접근이 인터럽트 금지 시간보다 길되 스케줄러 잠금 시간보다 짧을 때. 문서는 쓰지 않기를 권한다. |
| 세마포어      | 자원을 함께 쓰는 태스크에 모두 [[deadline\|마감 시한]]이 없을 때                              |
| 뮤텍스        | 문서가 가장 나은 방법으로 보는 것. 특히 마감 시한이 있는 태스크가 함께 쓰는 자원에 권한다.    |

## 락

락은 공유 자원마다 하나씩 두고, 자원에 접근하기 전에 잡고 다 쓴 뒤 푼다.[@freertos-resource-management-2026][@arm-100934-2017] 락이 이미 잡혀 있을 때 뮤텍스는 잡으려는 쪽을 뮤텍스를 쓸 수 있게 될 때까지 블록시키고[@ieee-1003-1-pthread-mutex-lock-2024][@freertos-mutexes-2026], 스핀락은 락이 풀릴 때까지 루프를 돌며 되풀이해 검사한다.[@autosar-cp-sws-os-2025][@ieee-1003-1-pthread-spin-lock-2024]

락으로 상호 배제를 이루면 [[deadlock|교착 상태]]와 [[priority-inversion|우선순위 역전]]이 생길 수 있다.[@osek-os-2-2-3-2005][@freertos-resource-management-2026]

## 우선순위 상한

OSEK/VDX OS 2.2.3 명세는 [[osek-resource|resource]]를 얻은 태스크의 우선순위를 미리 정한 상한까지 올리게 해, 같은 resource를 쓰는 다른 태스크가 그동안 실행되지 못하게 한다.[@osek-os-2-2-3-2005] 규칙은 [[osek-resource#Ceiling priority|ceiling priority]], 일반형은 [[priority-ceiling-protocol|우선순위 상한 프로토콜]]에서 다룬다.

AUTOSAR R25-11 OS 명세는 이 상호 배제를 같은 코어의 태스크 사이로 한정한다.[@autosar-cp-sws-os-2025]
