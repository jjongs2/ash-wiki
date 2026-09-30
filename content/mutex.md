---
title: 뮤텍스
tags:
  - platform/rtos
verified: 2026-09-30
---

**뮤텍스**(mutex)는 공유 데이터나 [[critical-section|임계 구역]]에 한 번에 한 스레드만 들어가게 하는 락이다.[@ieee-1003-1-definitions-2024][@linux-locking-guide-2026] 다른 스레드가 잠근 뮤텍스를 잠그려는 스레드는 뮤텍스가 풀릴 때까지 블록된다.[@linux-locking-guide-2026][@ieee-1003-1-pthread-mutex-lock-2024] 이름은 mutual exclusion에서 왔다.[@ieee-1003-1-definitions-2024][@freertos-mutexes-2026]

## 소유권

세마포어와 달리 뮤텍스에는 소유자가 있다.[@linux-locktypes-2026][@arm-cmsis-rtos2-mutex-2026]

POSIX는 뮤텍스를 잠근 스레드를 그 뮤텍스의 소유자로 정의하고, 그 스레드가 풀 때까지 소유자로 남는다고 정한다.[@ieee-1003-1-definitions-2024][@ieee-1003-1-preface-2024]

Linux 커널의 mutex는 원자 변수 `owner` 하나로 잠금 상태를 추적한다. `owner`에는 소유 태스크의 포인터가 들어가고, 소유자가 없으면 `NULL`이다. 소유자만 mutex를 풀 수 있고, 경합이 없으면 `owner`를 현재 태스크로 `cmpxchg`해 원자적으로 락을 얻는다.[@linux-mutex-design-2026] 원자 명령은 [[spinlock#원자 명령|스핀락]]에서 다룬다. Linux 커널에서는 세마포어를 뺀 락 타입이 모두, 락을 얻은 태스크가 풀어야 하는 엄격한 소유 의미를 가진다.[@linux-locktypes-2026]

Zephyr의 뮤텍스는 잠금 횟수와 소유 스레드를 속성으로 가진다. 잠금 횟수가 0이면 풀린 상태이고, 소유 스레드는 뮤텍스가 잠겨 있을 때 그것을 잠근 스레드를 가리킨다.[@zephyr-mutexes-2026] CMSIS-RTOS2의 뮤텍스는 쓸 수 있는 상태이거나 소유 스레드에 잡힌 상태이고, `osMutexGetOwner`는 뮤텍스를 얻은 스레드를 돌려준다.[@arm-cmsis-rtos2-mutex-2026]

FreeRTOS의 뮤텍스는 가져간 태스크가 반드시 돌려줘야 한다. FreeRTOS의 이진 세마포어는 가져간 뒤 돌려주지 않아도 되므로, 한 태스크나 인터럽트가 계속 주고 다른 태스크가 계속 가져가는 식으로 동기화에 쓴다.[@freertos-xsemaphorecreatemutex-2026][@freertos-binary-semaphores-2026]

## 블로킹 대기

뮤텍스를 바로 얻지 못한 스레드는 블록되어 기다린다.[@ieee-1003-1-pthread-mutex-lock-2024][@freertos-mutexes-2026] POSIX는 뮤텍스가 풀릴 때 블록된 스레드가 있으면 어느 스레드가 뮤텍스를 얻을지를 스케줄링 정책이 정하게 한다.[@ieee-1003-1-pthread-mutex-lock-2024]

POSIX 근거 설명에 따르면 뮤텍스는 스레드를 블록하는 데 드는 프로세서 자원이 스핀락보다 크게 구현될 수 있다. 뮤텍스를 얻지 못한 스레드는 스케줄링 상태를 바꾸고 기다리는 스레드 집합에 들어가며, 뮤텍스가 풀리면 이를 모두 되돌린 뒤에 뮤텍스의 소유권을 넘겨받기 때문이다. 대신 블록된 동안에는 프로세서 자원을 쓰지 않는다.[@ieee-1003-1-rationale-threads-2024]

Linux 커널에서 mutex를 얻지 못한 태스크는 스스로 멈췄다가 mutex가 풀리면 깨어나므로, 그동안 CPU는 다른 일을 할 수 있다.[@linux-locking-guide-2026] 다만 Linux 커널의 mutex는 잠들기 전에 소유자가 실행 중이면 잠깐 스핀한다(optimistic spinning). 곧바로 잠들지 않고 몇 사이클 바쁜 대기하게 하자 여러 워크로드에서 성능이 크게 나아졌다.[@linux-mutex-design-2026]

![[diagrams/mutex-block-vs-spinlock-spin.svg]]

락을 얻지 못했을 때 블록하지 않고 도는 락은 [[spinlock|스핀락]]에서 다룬다.

## 뮤텍스 타입

POSIX는 뮤텍스 타입으로 `PTHREAD_MUTEX_NORMAL`, `PTHREAD_MUTEX_ERRORCHECK`, `PTHREAD_MUTEX_RECURSIVE`, `PTHREAD_MUTEX_DEFAULT`를 두고, 기본값은 `PTHREAD_MUTEX_DEFAULT`다.[@ieee-1003-1-pthread-mutexattr-gettype-2024] 타입마다 이미 잠근 뮤텍스를 다시 잠글 때와, 소유자가 아닌 스레드가 풀 때의 동작이 다르다.[@ieee-1003-1-pthread-mutex-lock-2024]

| 타입                       | 소유자가 다시 잠그면                                             | 소유자가 아닌 스레드가 풀면 |
| -------------------------- | ---------------------------------------------------------------- | --------------------------- |
| `PTHREAD_MUTEX_NORMAL`     | 교착 상태가 된다.                                                | 결과가 정의되지 않는다.     |
| `PTHREAD_MUTEX_ERRORCHECK` | 오류를 돌려준다.                                                 | 오류를 돌려준다.            |
| `PTHREAD_MUTEX_RECURSIVE`  | 잠금 횟수를 세고, 횟수가 0이 될 때까지 풀어야 풀린다.            | 오류를 돌려준다.            |
| `PTHREAD_MUTEX_DEFAULT`    | 다른 세 타입 가운데 하나처럼 동작하거나, 결과가 정의되지 않는다. | 결과가 정의되지 않는다.     |

표의 "정의되지 않는다"는 견고(robust)하지 않은 뮤텍스의 경우다. 견고한 뮤텍스는 타입과 상관없이, 소유자가 아닌 스레드가 풀면 오류를 돌려준다.[@ieee-1003-1-pthread-mutex-lock-2024]

## 우선순위 프로토콜

뮤텍스를 쥔 낮은 우선순위 스레드는 높은 우선순위 스레드를 블록해 [[priority-inversion|우선순위 역전]]을 일으킬 수 있다.[@freertos-mutexes-2026][@ieee-1003-1-rationale-threads-2024]

POSIX는 뮤텍스 속성 protocol의 값으로 `PTHREAD_PRIO_NONE`, `PTHREAD_PRIO_INHERIT`, `PTHREAD_PRIO_PROTECT`를 두고, 기본값은 `PTHREAD_PRIO_NONE`이다. `PTHREAD_PRIO_NONE`이면 뮤텍스를 소유해도 우선순위가 바뀌지 않는다. `PTHREAD_PRIO_INHERIT`이면 높은 우선순위 스레드를 블록하는 소유자가, 기다리는 스레드 가운데 가장 높은 우선순위와 자기 우선순위 가운데 높은 쪽으로 실행된다. `PTHREAD_PRIO_PROTECT`이면 소유자가, 기다리는 스레드가 있든 없든, 소유한 뮤텍스들의 우선순위 상한 가운데 가장 높은 값과 자기 우선순위 가운데 높은 쪽으로 실행된다.[@ieee-1003-1-pthread-mutexattr-getprotocol-2024] POSIX 근거 설명은 앞의 방식을 기본 [[priority-inheritance-protocol|우선순위 상속 프로토콜]], 뒤의 방식을 [[priority-ceiling-protocol|우선순위 상한 프로토콜]] 에뮬레이션이라 부른다.[@ieee-1003-1-rationale-threads-2024]

FreeRTOS의 뮤텍스는 우선순위 상속을 하고, 이진 세마포어는 하지 않는다.[@freertos-mutexes-2026][@freertos-binary-semaphores-2026]

## 락 세분도

**락 세분도**(lock granularity)는 락 하나가 보호하는 데이터의 양이다. 모든 데이터를 락 하나로 보호하면 가장 거칠고(coarse-grained), 가장 잘게는 객체의 필드마다 락을 하나씩 둘 수 있다. 락을 잘게 나누면 병렬성이 커지지만, 락이 많아져 잡고 푸는 부담이 늘어 너무 잘게 나누면 오히려 느려질 수 있다.[@linux-locking-guide-2026][@oracle-816-5137-data-locking-2010] Oracle 다중 스레드 프로그래밍 안내서는 거친 락에서 시작해 병목을 찾고, 필요한 곳에 더 잘게 나눈 락을 더하기를 권한다.[@oracle-816-5137-data-locking-2010]

여러 뮤텍스를 스레드마다 서로 다른 순서로 잡으면 [[deadlock|교착 상태]]가 생길 수 있고, 늘 같은 순서로 잡으면 이런 교착 상태는 생기지 않는다.[@linux-locking-guide-2026][@oracle-816-5137-lock-hierarchies-2010]
