---
title: 스핀락
tags:
  - platform/rtos
verified: 2026-09-30
---

**스핀락**(spinlock)은 락이 풀릴 때까지 락 변수를 되풀이해 검사하며 기다리는 락이다. 기다리는 쪽은 블록되지 않고, 기다리는 동안에도 CPU를 쓰며 돈다.[@autosar-cp-sws-os-2025][@ieee-1003-1-rationale-threads-2024] AUTOSAR R25-11 OS 명세는 스핀락을 바쁜 대기(busy waiting) 메커니즘으로 정의한다.[@autosar-cp-sws-os-2025] 상호 배제 자체는 [[critical-section|임계 구역]]에서 다룬다.

## 원자 명령

스핀락은 대개 락 변수를 원자 연산으로 검사하고 고친다.[@autosar-cp-sws-os-2025][@ieee-1003-1-rationale-threads-2024] Intel 64·IA-32의 `CMPXCHG`는 세마포어가 비었는지 검사하고, 비었으면 할당됨으로 표시하는 일을 끊기지 않는 한 동작으로 한다. 그래서 단일 프로세서 시스템에서는 여러 명령으로 세마포어를 검사하고 고칠 때처럼 인터럽트를 끌 필요가 없다.[@intel-sdm-vol1-2026]

- **test-and-set**: 비트의 옛 값을 돌려주면서 같은 동작 안에서 그 비트를 1로 쓴다.[@intel-sdm-vol1-2026][@linux-kernel-api-2026] test-and-set이나 교환으로 락을 잡을 때 돌려받은 옛 값이 0(비었음)이면 락을 얻은 것이다.[@linux-kernel-api-2026][@intel-sdm-vol3a-2026]
- **compare-and-swap**: 메모리 위치의 값이 기대값과 같을 때만 새 값으로 바꾸고, 다르면 그대로 둔다.[@intel-sdm-vol1-2026][@linux-driver-basics-2026] Linux 커널의 `atomic_cmpxchg`는 원래 값을 돌려준다.[@linux-driver-basics-2026] Intel 64·IA-32의 `CMPXCHG`는 값이 다르면 원래 값을 `EAX`에 싣고, 비교 결과를 `EFLAGS` 상태 플래그에 남긴다.[@intel-sdm-vol1-2026]

![[diagrams/spinlock-test-and-set-loop.svg]]

Intel 64·IA-32 프로세서에서는 `LOCK` 접두어를 붙인 명령(`CMPXCHG`, `XADD`, `BTS` 등)과, `LOCK` 의미가 자동으로 붙는 `XCHG`가 메모리를 원자적으로 읽고 고친다.[@intel-sdm-vol3a-2026]

Arm 아키텍처는 ARMv6부터 배타적 적재(`LDREX`)와 배타적 저장(`STREX`) 짝을 두고, ARMv6-M은 배타적 접근을 지원하지 않는다.[@arm-dht0008-2009] Armv7-M에서 `STREX`는 `LDREX` 뒤 다른 프로세서나 프로세스가 그 주소에 더 최근에 저장하지 않았을 때만 쓰고, 성공 여부를 상태 값으로 돌려준다.[@arm-ddi-0403-2021] Arm 동기화 기본 요소 문서에 따르면 `STREX`가 실패하면 `LDREX`부터 다시 시도한다.[@arm-dht0008-2009]

Arm 동기화 기본 요소 문서에 따르면 공유 자원을 한 번에 한 주체만 쓰게 하는 동기화는 흔히 자원의 상태를 담은 변수를 원자적으로, 곧 완전히 성공하거나 전혀 바뀌지 않게 고쳐서 이룬다. 단순한 시스템에서는 그 구간의 인터럽트를 꺼서 이렇게 고칠 수 있지만, 다중 태스크나 다중 코어 시스템에서는 이 방법이 효율적이지도 안전하지도 않다. 현대 아키텍처는 메모리를 안전하게 원자적으로 고치는 하드웨어 동기화 명령을 둔다. 운영체제나 플랫폼 라이브러리는 이 명령을 [[mutex|뮤텍스]], 세마포어 같은 동기화 인터페이스 뒤에 감춘다.[@arm-dht0008-2009]

## 단일 프로세서에서

POSIX.1-2024는 `pthread_spin_lock`이 락을 다른 스레드가 쥐고 있지 않으면 락을 얻고, 쥐고 있으면 락이 풀릴 때까지 돌아오지 않고 스핀하도록 정한다.[@ieee-1003-1-preface-2024][@ieee-1003-1-pthread-spin-lock-2024]

POSIX 근거 설명에 따르면 스핀락은 주로 공유 메모리 다중 프로세서에 알맞은, 매우 낮은 수준의 동기화 수단이다. 스핀 대기 시간은 경쟁하는 스레드가 저마다 제 프로세서에서 돌 때는 몇 사이클이지만, 모든 스레드가 한 프로세서를 나눠 쓰면 끝없이 길어질 수 있다. 그래서 POSIX.1-2024 근거 설명은 단일 프로세서에서 스핀락을 권하지 않는다.[@ieee-1003-1-rationale-threads-2024]

락을 쥔 쪽보다 앞서 실행되는 쪽(더 높은 우선순위의 태스크나, 쥔 쪽을 인터럽트한 처리)이 같은 프로세서에서 같은 락을 잡으려고 돌면, 쥔 쪽이 실행되지 못해 락이 풀리지 않고 [[deadlock|교착 상태]]가 된다.[@autosar-cp-sws-os-2025][@linux-locking-guide-2026]

`CONFIG_SMP` 없이 `CONFIG_PREEMPT`로 빌드한 Linux 커널에서 스핀락은 선점을 끄는 일만 하고, 둘 다 없이 빌드하면 스핀락은 아예 없다.[@linux-locking-guide-2026]

AUTOSAR R25-11 OS 명세는 태스크가 스핀락을 쥔 동안 스케줄링을 제한하도록 정하고, 스핀락을 `SuspendAllInterrupts`로 감싸는 일을 운영체제가 대신하는 설정 `OsSpinlockLockMethod`를 둔다. 또 서로 다른 코어의 태스크 사이 상호 배제를 위해 스핀락을 두고, 같은 코어의 태스크나 카테고리 2 ISR이 이미 쥔 스핀락을 잡으려 하면 오류를 내도록 정한다. 같은 코어의 높은 우선순위 태스크가 그 락에서 돌면 교착 상태가 되기 때문이다.[@autosar-cp-sws-os-2025]

## 뮤텍스와의 차이

[[mutex|뮤텍스]]는 락을 얻지 못한 스레드를 블록시켜 그동안 CPU를 쓰지 않게 하고, 스핀락은 기다리는 동안에도 CPU를 쓴다.[@ieee-1003-1-rationale-threads-2024][@linux-locking-guide-2026] POSIX 근거 설명에 따르면 아주 짧게 기다릴 때는 스핀락의 전체 오버헤드가 뮤텍스보다 작을 수 있고, 오래 기다릴 때는 뮤텍스 쪽이 작을 수 있으며, 스핀은 프로세서 사이클을 낭비한다.[@ieee-1003-1-rationale-threads-2024] 그래서 스핀락은 짧게만 쥐고, 잠들거나 블록하는 동작 너머로 쥐고 있지 않아야 한다.[@ieee-1003-1-rationale-threads-2024][@linux-locking-guide-2026]

![[diagrams/mutex-block-vs-spinlock-spin.svg]]
