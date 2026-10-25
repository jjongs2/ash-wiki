---
title: PREEMPT_RT
tags:
  - platform/rtos
verified: 2026-10-07
---

**PREEMPT_RT**는 Linux 커널을 실시간 커널로 바꾸는 구성이다. `spinlock_t` 같은 [[spinlock|스핀락]]을 선점할 수 있고 우선순위 상속을 아는 rtmutex로 바꾸고, 인터럽트 처리기를 스레드로 돌리게 강제한다. 그 결과 진입 코드, 스케줄러, 저수준 인터럽트 처리 같은 몇 경로를 빼고 커널 전체를 선점할 수 있게 되어, 우선순위 높은 [[task|태스크]]가 실행 가능해진 뒤 실제로 CPU에서 실행되기까지의 지연이 줄어든다.[@linux-preempt-rt-theory-2026] 이 구성은 `CONFIG_PREEMPT_RT` 옵션으로 켜며, 켜지 않으면 커널은 완전히 선점할 수 있는 실시간 커널이 되지 않는다.[@linux-preempt-rt-configuration-2026]

## 잠드는 스핀락

PREEMPT_RT가 아닌 Linux 커널에서 `spinlock_t`를 얻는 쪽은 먼저 선점을 끄고, 락이 풀릴 때까지 돈다. PREEMPT_RT 커널에서 `spinlock_t`는 rtmutex로 구현된다. 경합하는 락을 얻으려는 태스크는 돌지 않고, CPU 이동을 끈 채 자기 우선순위를 락 소유자에게 넘기고 스스로 잠든다. CPU 이동을 끄면 선점을 끈 것과 같은 효과를 내면서도 선점은 허용된다.[@linux-preempt-rt-theory-2026]

PREEMPT_RT 커널의 `spinlock_t`는 선점을 끄지 않고, `spin_lock_irq`나 `spin_lock_irqsave`처럼 하드 인터럽트에 관한 접미사(`_irq`, `_irqsave`)를 붙여도 CPU의 인터럽트 금지 상태를 바꾸지 않는다.[@linux-locktypes-2026] 인터럽트가 강제로 스레드로 돌아 하드 IRQ(Interrupt Request) context에서 실행되지 않으므로, 락을 잡으며 인터럽트를 끌 필요가 없기 때문이다.[@linux-preempt-rt-differences-2026]

`raw_spinlock_t`는 PREEMPT_RT 커널에서도 실제로 도는 스핀락이다. 인터럽트 처리, 스케줄러, 타이머 같은 저수준 핵심 코드가 쓰고, 선점을 끄며, `_irq`나 `_irqsave` 접미사를 붙이면 인터럽트도 끈다.[@linux-locktypes-2026][@linux-preempt-rt-differences-2026]

## 스레드 IRQ

PREEMPT_RT 커널은 인터럽트 처리기를 강제로 스레드로 돌려 [[deferred-interrupt-handling|두 단계로 나눈다]]. 1차 처리기는 인터럽트를 끈 IRQ context에서 실행되며 짝이 되는 스레드 처리기를 깨우는 일만 한다. 스레드 처리기는 `request_irq`에 넘긴 처리 함수이고, 커널이 스케줄하는 프로세스 context에서 실행된다. 스레드를 깨운 때부터 처리가 끝날 때까지 인터럽트 컨트롤러에서 그 인터럽트 소스를 가린다. 스레드 처리기는 기본적으로 `SCHED_FIFO` 정책과 우선순위 50(`MAX_RT_PRIO / 2`)으로 실행된다.[@linux-preempt-rt-theory-2026]

![[diagrams/preempt-rt-threaded-irq.svg]]

PREEMPT_RT 커널에서 `IRQF_NO_THREAD`, `IRQF_PERCPU`, `IRQF_ONESHOT` 플래그로 요청한 인터럽트는 강제 스레드화에서 빠진다. hrtimer도 PREEMPT_RT 커널에서는 기본적으로 하드 인터럽트 context가 아니라 softirq context에서, 대개는 가장 낮은 실시간 우선순위로 도는 `ktimersd` 스레드에서 실행된다. 하드 인터럽트 context에서 실행하려면 `HRTIMER_MODE_HARD`로 표시한다.[@linux-preempt-rt-differences-2026]

## 우선순위 상속

PREEMPT_RT 커널의 `spinlock_t`와 [[mutex|mutex]]는 우선순위 상속을 지원하는 rtmutex 위에 구현된다. 태스크가 이런 락에서 블록되면 블록된 태스크의 스케줄링 정책과 우선순위가 락 소유자에게 잠시 넘어간다. 예를 들어 `SCHED_FIFO` 태스크 A가 `SCHED_OTHER` 태스크 B가 쥔 락에서 블록되면, B는 A의 정책과 우선순위를 물려받아 실행되다가 락을 풀면 원래 스케줄링 파라미터로 돌아간다.[@linux-preempt-rt-theory-2026] rtmutex의 상속 규칙은 [[priority-inheritance-protocol#구현|우선순위 상속 프로토콜]]에서 다룬다.
