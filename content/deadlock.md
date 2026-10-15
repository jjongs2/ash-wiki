---
title: 교착 상태
tags:
  - platform/rtos
aliases:
  - 데드락
verified: 2026-09-30
---

**교착 상태**(deadlock)는 둘 이상의 실행 흐름이 저마다 자원을 쥔 채 서로가 쥔 자원이 풀리기를 기다려, 어느 쪽도 더 나아가지 못하는 상태다.[@coffman-system-deadlocks-1971] [[critical-section#락|락]]으로 [[critical-section|임계 구역]]을 보호할 때 생길 수 있다.[@linux-locking-guide-2026][@microsoft-driver-verifier-deadlock-2020] FreeRTOS 책과 µC/OS-III 문서는 교착 상태를 deadly embrace라고도 부른다.[@freertos-resource-management-2026][@micrium-ucos-iii-deadlocks-2026]

## 생기는 과정

[[task|태스크]] A가 락 L1을, 태스크 B가 락 L2를 잡은 뒤 A가 L2를, B가 L1을 요청하면 두 태스크는 서로를 기다리며 멈춘다.[@linux-locking-guide-2026][@microsoft-driver-verifier-deadlock-2020] 이처럼 여러 락을 중첩해 잡되 태스크마다 다른 순서로 잡으면 교착 상태가 생길 수 있다.[@microsoft-driver-verifier-deadlock-2020][@linux-lockdep-2026]

![[diagrams/deadlock-lock-order-cycle.svg]]

한 스레드가 이미 쥔 락을 다시 잡으려 해도 스스로 교착 상태에 빠질 수 있다.[@linux-locking-guide-2026][@microsoft-driver-verifier-deadlock-2020] [[ieee-1003-1|POSIX.1]]-2024는 `PTHREAD_MUTEX_NORMAL` 타입 [[mutex|뮤텍스]]를 이미 잠근 스레드가 다시 잠그면 교착 상태가 된다고 정한다.[@ieee-1003-1-pthread-mutex-lock-2024] 같은 스레드가 여러 번 얻을 수 있는 재귀 뮤텍스로 이런 교착 상태를 피하는 방법은 [[mutex#뮤텍스 타입|뮤텍스 타입]]에서 다룬다.

여러 락을 모든 스레드가 늘 같은 순서로 잡으면, 순서가 엇갈려 생기는 교착 상태는 생기지 않는다.[@linux-locking-guide-2026][@oracle-816-5137-lock-hierarchies-2010]

## 타임아웃

µC/OS-III에서는 뮤텍스를 기다릴 때 타임아웃을 두어 교착 상태에서 빠져나올 수 있다. 뮤텍스를 정한 시간 안에 얻지 못한 태스크는 타임아웃 오류 코드와 함께 실행을 이어 가므로 교착 상태가 풀리지만, 같은 교착 상태가 나중에 다시 생길 수 있다.[@micrium-ucos-iii-deadlocks-2026] FreeRTOS 책은 뮤텍스를 타임아웃 없이 기다리지 말고, 예상되는 최대 대기 시간보다 조금 긴 타임아웃을 두어 그 안에 얻지 못하는 것을 교착 상태 같은 설계 오류의 징후로 삼기를 권한다.[@freertos-resource-management-2026]

## 네 조건

Coffman 외(1971)는 교착 상태의 필요조건으로 아래 네 조건을 들었다.[@coffman-system-deadlocks-1971]

| 조건                        | 뜻                                                                    |
| --------------------------- | --------------------------------------------------------------------- |
| 상호 배제(mutual exclusion) | 태스크는 자기가 쓰는 자원을 배타적으로 차지한다.                      |
| 점유 대기(wait for)         | 태스크는 이미 할당받은 자원을 쥔 채 추가 자원을 기다린다.             |
| 비선점(no preemption)       | 쥔 쪽이 자원을 다 쓰기 전에는 자원을 강제로 빼앗을 수 없다.           |
| 순환 대기(circular wait)    | 각 태스크가 고리의 다음 태스크가 요청한 자원을 쥐고 있는 고리가 있다. |

점유 대기 조건은 **hold-wait** 조건이라고도 부른다.[@isloor-deadlock-problem-1980]

네 필요조건 가운데 적어도 하나가 언제나 성립하지 않게 하면 교착 상태를 예방할 수 있다. 다만 상호 배제 조건은 모든 자원에서 깰 수는 없다.[@coffman-system-deadlocks-1971]

태스크가 단일 프로세서에서 이진 [[semaphore|세마포어]]로 임계 구역을 보호할 때, [[priority-ceiling-protocol|우선순위 상한 프로토콜]]은 교착 상태가 생기지 않게 한다.[@sha-real-time-scheduling-ada-1989][@sha-priority-inheritance-1990] [[priority-inheritance-protocol|기본 우선순위 상속 프로토콜]]은 교착 상태를 막지 않는다.[@borger-implementing-priority-inheritance-1989]
