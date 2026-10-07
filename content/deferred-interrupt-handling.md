---
title: Deferred interrupt handling
tags:
  - platform/rtos
verified: 2026-10-07
---

FreeRTOS 문서는 인터럽트가 요구하는 처리를 ISR(Interrupt Service Routine) 안에서 다 하지 않고, ISR이 블록을 풀어 준 [[task|태스크]]에서 하는 방식을 **deferred interrupt handling**이라 부른다. 보통의 ISR 처리는 인터럽트 원인을 기록하고 인터럽트를 지운 뒤 필요한 처리를 모두 ISR 안에서 하지만, deferred interrupt handling에서는 원인을 기록하고 인터럽트를 지우는 데까지만 ISR에서 하고 나머지는 블록이 풀린 태스크가 한다. 처리를 넘겨받는 태스크의 우선순위가 충분히 높으면 ISR은 곧바로 그 태스크로 돌아가, 처리가 ISR 안에서 다 한 것처럼 시간 틈 없이 이어진다.[@freertos-deferred-interrupt-handling-2026]

![[diagrams/deferred-interrupt-handling-timeline.svg]]

µC/OS-III 문서에 따르면 ISR은 인터럽트를 낸 장치를 처리하되 실제로는 일을 거의 하지 않고, 대개 처리의 대부분을 맡은 높은 우선순위 태스크에 신호나 메시지를 보낸다. ISR이 끝나면 µC/OS-III는 끊긴 태스크로 돌아가지 않고, ISR이 준비 상태로 만든 더 중요한 태스크로 [[context-switch|context switch]]한다.[@micrium-ucos-iii-real-time-kernels-2026]

## ISR을 짧게 두는 까닭

µC/OS-III, FreeRTOS, Zephyr, RTEMS(Real-Time Executive for Multiprocessor Systems) 문서는 모두 ISR을 짧게 두고, 인터럽트 처리의 나머지를 태스크에 맡기기를 권한다.[@micrium-ucos-iii-task-management-internals-2026][@freertos-interrupt-management-2026][@zephyr-interrupts-2026][@rtems-interrupt-background-2025]

FreeRTOS 커널 책에 따르면 ISR을 짧게 두는 까닭은 여럿이다. 태스크는 우선순위가 아무리 높아도 하드웨어가 인터럽트를 처리하지 않을 때만 실행되고, ISR은 태스크의 시작 시각과 실행 시간을 흔든다. 아키텍처에 따라서는 ISR이 실행되는 동안 새 인터럽트를 받지 못할 수 있고, 인터럽트 중첩은 복잡도를 높이고 예측성을 떨어뜨리는데 ISR이 짧을수록 중첩될 가능성이 낮다. 처리를 태스크로 넘기면 그 처리의 우선순위를 다른 태스크와 견주어 정할 수 있고, FreeRTOS API(Application Programming Interface) 함수를 모두 쓸 수 있다.[@freertos-interrupt-management-2026]

Zephyr 문서에 따르면 ISR은 시스템 동작을 예측할 수 있도록 빨리 끝나야 하고, 시간이 드는 처리는 스레드로 넘겨 커널이 다른 인터럽트에 응답할 수 있게 해야 한다.[@zephyr-interrupts-2026] RTEMS 문서에 따르면 ISR은 같거나 낮은 우선순위 인터럽트를 가리는 시간을 줄이도록 인터럽트를 처리하는 데 꼭 필요한 일만 하고, 나머지는 응용 태스크가 맡아야 한다.[@rtems-interrupt-background-2025]

FreeRTOS 문서에 따르면 태스크의 블록을 풀고 그 태스크로 전환하는 일 자체에도 시간이 들기 때문에, 처리를 태스크로 미루는 것은 대개 처리가 오래 걸리거나, ISR용 API가 아니라 [[rtos|RTOS]] API 전체를 써야 하거나, 실행 시간을 미리 알 수 없는 일을 할 때만 이득이다.[@freertos-deferred-interrupt-handling-2026]

## 넘기는 수단

FreeRTOS는 API 함수 일부를 태스크용과 ISR용 두 가지로 두고, ISR용 함수의 이름에는 "FromISR"을 붙인다. 이름에 "FromISR"이 없는 FreeRTOS API 함수는 ISR에서 부르면 안 된다. ISR용 함수는 더 높은 우선순위 태스크의 블록을 풀어도 그 자리에서 context switch를 하지 않고, `pxHigherPriorityTaskWoken`이 가리키는 변수를 `pdTRUE`로 바꿔 전환이 필요함을 알린다. ISR은 이 값을 `portYIELD_FROM_ISR()`에 넘겨 context switch를 요청한다. 요청하지 않으면 더 높은 우선순위 태스크는 다음에 스케줄러가 돌 때까지, 최악의 경우 다음 틱 인터럽트까지 준비 상태에 남는다.[@freertos-interrupt-management-2026]

FreeRTOS에서 처리를 넘기는 방법은 둘이다. 인터럽트마다 응용이 만든 태스크에 넘기면 넘기는 태스크마다 우선순위를 따로 정할 수 있지만 태스크가 더 필요하다. `xTimerPendFunctionCallFromISR()`로 처리 함수를 RTOS daemon 태스크에 넘기면 인터럽트마다 태스크를 만들 필요가 없다. 대신 넘긴 함수는 모두 daemon 태스크의 우선순위로 실행되고, 함수가 timer command queue를 거쳐 전달되므로 인터럽트 우선순위가 아니라 큐에 들어온 순서대로 처리된다.[@freertos-interrupt-management-2026] 큐에 쓰고 읽는 만큼 지연도 늘어난다.[@freertos-deferred-interrupt-handling-2026]

Zephyr의 ISR은 FIFO(First-In First-Out), LIFO(Last-In First-Out), 세마포어 같은 커널 객체로 도우미 스레드에 신호하거나, 시스템 workqueue 스레드에 work item을 실행하게 해 처리를 넘긴다. 처리를 넘기면 대개 ISR이 끝날 때 그 스레드로 context switch가 한 번 일어나지만, 넘겨받은 스레드의 우선순위에 따라서는 실행 중인 cooperative 스레드나 더 높은 우선순위 스레드가 먼저 실행될 수 있다.[@zephyr-interrupts-2026]

µC/OS-III의 ISR은 `OSFlagPost()`, `OSQPost()`, `OSSemPost()`, `OSTaskQPost()`, `OSTaskSemPost()` 같은 post 호출만 할 수 있고, 뮤텍스는 태스크 수준에서만 쓰는 서비스로 보아 `OSMutexPost()`는 부를 수 없다.[@micrium-ucos-iii-task-management-internals-2026] µC/OS-III는 V3.05.00에서 deferred interrupt processing을 새 설계에 권하지 않는 기능으로 돌렸고, V3.06.00에서 없앴다.[@micrium-ucos-iii-release-notes-2026]

## 중첩된 ISR과 디스패치

RTEMS의 인터럽트 관리자는 ISR이 끝날 때 태스크 스케줄링과 디스패치를 하며, ISR이 부른 directive 안에서는 디스패치하지 않는다. 인터럽트가 중첩되면 안쪽 ISR은 디스패치 없이 끝나고, 가장 바깥 ISR이 끝날 때만 미뤄 둔 디스패치를 한다.[@rtems-interrupt-background-2025]

[[osek-os|OSEK OS]]의 ISR이 끝날 때 일어나는 재스케줄링은 [[osek-isr#재스케줄링|OSEK ISR]]에서 다룬다.

## 커널 서비스를 부를 수 없는 인터럽트

FreeRTOS에서 `configMAX_SYSCALL_INTERRUPT_PRIORITY`는 ISR용 FreeRTOS API 함수를 부를 수 있는 가장 높은 인터럽트 우선순위를 정한다. 이보다 높은 우선순위의 인터럽트는 임계 구역의 영향을 받지 않아 스케줄러가 실행을 막지 못하지만, 그 ISR에서는 FreeRTOS API 함수를 하나도 쓸 수 없다. 모터 제어처럼 타이밍이 아주 엄격한 기능은 스케줄러가 인터럽트 응답 시간을 흔들지 않도록 이 우선순위보다 높게 둔다.[@freertos-interrupt-management-2026]

Zephyr의 zero-latency 인터럽트는 IRQ(Interrupt Request) 잠금으로 막을 수 없는 우선순위에서 실행되고, direct ISR로 선언해야 한다. zero-latency 인터럽트는 커널 코드와 함께 동작하지 않고 하드웨어 사건을 직접 다루도록 만든 것이라, 그 안에서 커널 API를 부르는 것은 정의되지 않은 동작으로 다뤄야 한다. 이 기능은 아키텍처마다 지원되며, 지금은 Arm Cortex-M에서 구현되어 있다.[@zephyr-interrupts-2026]

RTEMS에서 NMI(Non-Maskable Interrupt)는 끌 수 없으므로, 이 수준에서 실행되는 ISR은 RTEMS 시스템 호출을 해서는 안 된다. RTEMS가 자기 임계 구역을 보호하지 못해 결과를 예측할 수 없기 때문이다.[@rtems-interrupt-background-2025]

## 인터럽트 지연과 응답

µC/OS-III 문서는 인터럽트를 끈 시간의 최댓값을 **interrupt disable time**이라 부르고, 이것을 실시간 커널의 가장 중요한 사양 가운데 하나로 본다. 인터럽트를 오래 끌수록 인터럽트 지연이 커진다. 인터럽트를 받은 때부터 그 인터럽트를 처리하는 사용자 코드가 시작될 때까지를 **인터럽트 응답**(interrupt response), 프로세서가 끊긴 코드나 ISR이 준비 상태로 만든 더 높은 우선순위 태스크로 돌아가는 데 드는 시간을 **인터럽트 복귀**(interrupt recovery), 인터럽트가 일어난 때부터 태스크 수준 코드가 다시 실행될 때까지를 **태스크 지연**(task latency)이라 정의한다.[@micrium-ucos-iii-interrupt-management-2026]

µC/OS-III 문서에 따르면 이 시간들은 관련 코드의 실행 시간을 더해 구한다. 인터럽트 지연 $t_\mathrm{lat}$은 인터럽트를 끈 시간의 최댓값 $t_\mathrm{dis}$와 같다. 인터럽트 응답 $t_\mathrm{resp}$는 여기에 인터럽트 처리기로 vectoring하는 시간 $t_\mathrm{vec}$과 ISR prologue 시간 $t_\mathrm{pro}$를 더한 것이다. 인터럽트 복귀 $t_\mathrm{rec}$은 장치 처리 $t_\mathrm{dev}$, 태스크에 신호나 메시지를 보내는 시간 $t_\mathrm{post}$, `OSIntExit()`와 `OSIntCtxSw()`의 실행 시간 $t_\mathrm{exit}$, $t_\mathrm{sw}$의 합이다. 태스크 지연 $t_\mathrm{task}$는 인터럽트 응답과 인터럽트 복귀에 스케줄러를 잠근 시간 $t_\mathrm{lock}$을 더한 것이다.[@micrium-ucos-iii-posting-from-an-isr-2026]

$$
\begin{aligned}
t_\mathrm{lat} &= t_\mathrm{dis} \\
t_\mathrm{resp} &= t_\mathrm{lat} + t_\mathrm{vec} + t_\mathrm{pro} \\
t_\mathrm{rec} &= t_\mathrm{dev} + t_\mathrm{post} + t_\mathrm{exit} + t_\mathrm{sw} \\
t_\mathrm{task} &= t_\mathrm{resp} + t_\mathrm{rec} + t_\mathrm{lock}
\end{aligned}
$$

PREEMPT_RT 커널이 인터럽트 처리기를 스레드로 돌리는 방식은 [[preempt-rt#스레드 IRQ|PREEMPT_RT]]에서 다룬다.
