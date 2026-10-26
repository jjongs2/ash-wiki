---
title: 세마포어
tags:
  - platform/rtos
verified: 2026-10-07
---

**세마포어**(semaphore)는 음이 아닌 정수 값을 가지며, 그 값을 나눌 수 없는 두 연산으로만 바꾸는 동기화 객체다.[@dijkstra-cooperating-sequential-processes-1965] [[ieee-1003-1|POSIX.1]]-2024는 세마포어를 응용 프로그램이 더 복잡한 동기화 메커니즘을 정의할 바탕이 되는 최소한의 동기화 기본 요소로 정의한다.[@ieee-1003-1-definitions-2024]

## Dijkstra의 P와 V

Dijkstra가 EWD123(Cooperating Sequential Processes)에서 정의한 세마포어는 프로세스들이 함께 쓰는 정수이고, 프로세스는 P 연산과 V 연산으로만 세마포어에 접근한다. V는 세마포어 값을 1 늘리고, P는 값을 1 줄이되 그 결과가 음수가 되지 않을 때만 줄인다. 두 연산은 모두 나눌 수 없는 동작이다.[@dijkstra-cooperating-sequential-processes-1965]

값이 0인 세마포어에 P를 시작한 프로세스는 다른 프로세스가 같은 세마포어에 V를 해서 값을 1로 만들 때까지 P를 끝내지 못한다. 그때 여러 프로세스가 P를 시작해 두었으면 그 가운데 하나만 P를 끝내고, 어느 것인지는 정해지지 않는다.[@dijkstra-cooperating-sequential-processes-1965]

값이 0과 1만 되는 세마포어를 **이진 세마포어**(binary semaphore), 더 큰 값도 되는 세마포어를 **일반 세마포어**(general semaphore)라 부른다.[@dijkstra-cooperating-sequential-processes-1965] RTEMS(Real-Time Executive for Multiprocessor Systems)는 이진 세마포어와 함께, 일반 세마포어처럼 음이 아닌 어떤 정수 값도 되는 세마포어를 두고, 이를 **계수 세마포어**(counting semaphore)라 부른다.[@dijkstra-cooperating-sequential-processes-1965][@rtems-semaphore-background-2025] [[critical-section|임계 구역]]을 가진 N개 프로세스의 상호 배제는 초기값이 1인 이진 세마포어 하나로 풀린다. 각 프로세스는 임계 구역에 들어가기 전에 P를, 나온 뒤에 V를 한다. 생산자와 소비자가 용량 제한이 없는 버퍼로 이어질 때는 버퍼에 쌓인 몫의 수를 일반 세마포어로 센다. 초기값은 0이고, 생산자는 몫을 넣은 뒤 V를, 소비자는 몫을 꺼내기 전에 P를 한다.[@dijkstra-cooperating-sequential-processes-1965]

## POSIX의 세마포어

POSIX.1-2024는 XSI(X/Open System Interfaces) 옵션에 딸리지 않은 세마포어를 음이 아닌 정수 값을 가진 공유 자원으로 나타내고, 값이 0일 때 세마포어를 기다리는 스레드 집합이 있다고 정한다. 세마포어 잠금 연산은 값이 0이면 호출한 스레드를 블록해 그 집합에 넣고, 아니면 값을 1 줄인다. 잠금 해제 연산은 기다리는 스레드가 있으면 그 가운데 하나를 집합에서 빼 블록을 풀고, 없으면 값을 1 늘린다.[@ieee-1003-1-general-concepts-2024]

`sem_wait`는 세마포어에 잠금 연산을 하고, 값이 0이면 세마포어를 잠그거나 시그널에 끊길 때까지 돌아오지 않는다.[@ieee-1003-1-sem-wait-2024] `sem_post`는 잠금 해제 연산을 한다. Process Scheduling 옵션을 지원하는 구현에서는 블록을 풀 스레드를 그 스레드들의 [[real-time-scheduling#POSIX의 스케줄링 정책|스케줄링 정책]]과 파라미터에 따라 고르는데, `SCHED_FIFO`와 `SCHED_RR`에서는 우선순위가 가장 높은 대기자를, 그런 대기자가 여럿이면 가장 오래 기다린 대기자를 깨운다. `sem_post`는 시그널 처리기에서도 부를 수 있다.[@ieee-1003-1-sem-post-2024]

근거 설명에 따르면 세마포어는 운영체제가 제공할 수 있는 가장 낮은 수준의 동기화 수단이다. 계수 세마포어는 생산자·소비자 문제에 잘 맞으며, 서로 다른 프로세스의 스레드 사이뿐 아니라 시그널 처리기와 스레드 사이에서도 그렇다.[@ieee-1003-1-rationale-semaphores-2024]

## 쓰임

µC/OS-III는 세마포어로 사건이 일어난 횟수를 세고, 이때 초기값은 대개 0이다.[@micrium-ucos-iii-semaphores-2026] CMSIS-RTOS2는 같은 자원 여러 개 가운데 쓸 수 있는 개수를 세마포어로 세고, 초기값을 자원의 수로 둔다.[@arm-cmsis-rtos2-semaphores-2026] FreeRTOS 책은 계수 세마포어의 흔한 용도로 사건 세기와 자원 세기를 든다. 사건을 세는 세마포어는 초기값을 0으로, 자원을 세는 세마포어는 초기값을 자원의 수로 해서 만든다. 사건을 세는 세마포어는 사건 처리기가 사건마다 주고 [[task|태스크]]가 사건을 처리할 때마다 가져가므로, 값은 일어난 사건과 처리한 사건의 차이다.[@freertos-interrupt-management-2026]

인터럽트 처리기는 세마포어를 줄 수는 있지만 기다릴 수는 없다.[@micrium-ucos-iii-semaphores-2026][@arm-cmsis-rtos2-semaphores-2026]

## 제품마다 다른 것

FreeRTOS에서 `xSemaphoreTake` 한 번에 사건 하나만 처리하는 태스크는 이진 세마포어로 사건을 잃을 수 있다. 태스크가 앞 사건을 처리하는 사이 인터럽트가 두 번 더 오면, 세 번째 인터럽트 때는 세마포어가 이미 주어진 상태라 다시 줄 수 없어 태스크는 그 사건을 모른다.[@freertos-interrupt-management-2026] µC/OS-III의 세마포어는 주어진 횟수를 세어 두므로, 기다리는 태스크가 실행되기 전에 인터럽트가 여러 번 와도 그 횟수만큼 블록되지 않고 실행된다.[@micrium-ucos-iii-semaphores-2026]

![[diagrams/semaphore-binary-counting-lost-event.svg]]

RTEMS의 이진 세마포어는 얻은 태스크가 놓아야 하고, 그 태스크는 같은 이진 세마포어를 중첩해 여러 번 얻을 수 있다. 바깥쪽 얻기와 짝이 맞는 놓기가 끝나야 다른 태스크가 얻을 수 있다. 중첩을 허용하지 않는 simple binary semaphore는 태스크 동기화에 쓴다.[@rtems-semaphore-background-2025] 뮤텍스와 이진 세마포어의 소유권 차이는 [[mutex#소유권|뮤텍스]]에서 다룬다.

세마포어를 기다리는 쪽 가운데 누가 먼저 얻는지도 제품마다 정해 둔다. Zephyr에서는 세마포어가 주어지면 우선순위가 가장 높은 스레드 가운데 가장 오래 기다린 스레드가 얻는다.[@zephyr-semaphores-2026] RTEMS에서는 세마포어를 만들 때 FIFO 순서와 우선순위 순서 가운데 고르고, 기본은 FIFO다.[@rtems-semaphore-background-2025] µC/OS-III는 기다리는 태스크를 우선순위 순으로 목록에 넣고, 세마포어가 주어지면 우선순위가 가장 높은 대기자를 깨운다.[@micrium-ucos-iii-semaphores-2026]
