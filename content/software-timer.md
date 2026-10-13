---
title: 소프트웨어 타이머
tags:
  - platform/rtos
verified: 2026-10-07
---

**소프트웨어 타이머**는 [[rtos|RTOS]] 커널이 제공하는 타이머 객체로, 정한 시간이 지나 만료되면 응용이 준 콜백 함수를 부른다. 타이머는 한 번 만료되면 멈추는 one-shot 타이머나, 만료될 때마다 다시 시작해 콜백을 주기적으로 부르는 주기 타이머로 쓴다.[@micrium-ucos-iii-timer-management-2026][@arm-cmsis-rtos2-timer-management-2026]

FreeRTOS의 소프트웨어 타이머는 커널이 구현하고 관리하며, 하드웨어 지원이 필요 없고 하드웨어 타이머나 하드웨어 카운터와 상관이 없다. FreeRTOS는 주기 타이머를 **auto-reload 타이머**라 부른다.[@freertos-software-timer-management-2026]

µC/OS-III의 콜백에서는 타이머 [[task|태스크]]를 블록시키거나 지우는 호출을 해서는 안 된다.[@micrium-ucos-iii-timer-management-2026] FreeRTOS의 콜백은 짧게 두어야 하고 Blocked 상태에 들어가서는 안 된다. 콜백을 실행하는 태스크가 Blocked 상태에 들기 때문이다.[@freertos-software-timer-management-2026]

## 콜백이 도는 context

FreeRTOS의 소프트웨어 타이머 콜백은 모두 RTOS daemon 태스크(timer service 태스크)의 context에서 실행된다. daemon 태스크는 스케줄러가 시작될 때 자동으로 만들어지는 보통 태스크이고, 우선순위와 스택 크기는 `configTIMER_TASK_PRIORITY`와 `configTIMER_TASK_STACK_DEPTH`로 정한다. 타이머 API 함수는 timer command queue로 daemon 태스크에 명령을 보내고, daemon 태스크는 다른 태스크처럼 스케줄되어 실행할 수 있는 태스크 가운데 우선순위가 가장 높을 때만 명령을 처리하거나 콜백을 실행한다.[@freertos-software-timer-management-2026]

µC/OS-III의 콜백은 µC/OS-III가 만드는 타이머 태스크 `OS_TmrTask()`의 context에서 불린다. 타이머 태스크의 우선순위는 `OS_CFG_TMR_TASK_PRIO`로 정하고, 대개 낮음에서 중간 사이에 둔다. 타이머 태스크는 [[system-tick|클록 틱]]과 같은 인터럽트 소스를 쓰지만, 틱 주파수를 소프트웨어로 나눠 대개 10 Hz처럼 더 느리게 갱신된다.[@micrium-ucos-iii-timer-task-2026] 모든 타이머의 해상도는 `OS_CFG_TMR_TASK_RATE_HZ`가 정하고, 타이머는 거친 단위로 쓴다.[@micrium-ucos-iii-timer-management-2026]

Zephyr 타이머는 커널의 시스템 클록으로 시간을 재고, 만료 함수는 시스템 클록 인터럽트 처리기가 실행한다.[@zephyr-timers-2026]

RTEMS(Real-Time Executive for Multiprocessor Systems)의 타이머 서비스 루틴은 clock tick directive나 Timer Server 태스크가 부른다. Timer Server는 태스크 기반 타이머의 서비스 루틴을 인터럽트가 아니라 태스크 공간에서 실행해, 부동소수점 연산처럼 서비스 루틴이 할 수 있는 일을 넓힌다. 서비스 루틴은 블록할 수도 있지만, 그러면 Timer Server가 블록되어 이미 대기 중인 다른 서비스 루틴도 그 루틴이 끝날 때까지 실행되지 못한다.[@rtems-timer-background-2025]

## POSIX 타이머

[[ieee-1003-1|POSIX.1]]-2024는 `timer_create()`가 지정한 클록을 시간 기준으로 쓰는 프로세스별 타이머를 만들고, 만든 타이머를 무장하지 않은(disarmed) 상태로 돌려주게 한다. 모든 구현은 `CLOCK_REALTIME`과 `CLOCK_MONOTONIC`을 타이머의 클록으로 지원해야 한다.[@ieee-1003-1-timer-create-2024]

`timer_settime()`은 `it_value`가 0이 아니면 타이머를 무장하고, 0이면 해제한다. `TIMER_ABSTIME` 플래그가 없으면 `it_value`를 지금부터의 간격으로, 있으면 타이머 클록의 절대 시각으로 해석한다. `it_interval`이 0이 아닌 값으로 무장한 타이머는 주기 타이머다. 타이머는 예정한 시각보다 먼저 만료되지 않는다. 만료 신호가 아직 대기 중인데 타이머가 다시 만료되면 신호를 더 큐에 넣지 않고 overrun이 일어나며, `timer_getoverrun()`은 신호가 생긴 뒤 전달되기까지 더 일어난 만료 횟수를 구현이 정한 최댓값 `DELAYTIMER_MAX`까지 돌려준다.[@ieee-1003-1-timer-settime-2024]

근거 문서에 따르면 시스템이 실시간 응용을 지원하려면 one-shot 타이머와 주기 타이머가 모두 있어야 하고, 두 타이머 모두 첫 만료 시각을 지금부터의 상대 시각이나 절대 시각으로 정할 수 있다.[@ieee-1003-1-rationale-timers-2024] 근거 문서에 따르면 시간 서비스로 실시간 동작을 얻는 응용에는 거꾸로 가지 않는 단조 클록이 필요하고, 이 클록은 외부 시각과 맞추거나 윤초를 반영하는 시스템 시각 변경에 영향받지 않아야 한다.[@ieee-1003-1-rationale-monotonic-clock-2024]

## 주기 실행

`clock_nanosleep()`은 `TIMER_ABSTIME`을 받으면 지정한 클록이 절대 시각에 이를 때까지 스레드를 멈추고, 그 시각이 이미 지났으면 곧바로 돌아온다. 플래그가 없으면 지정한 간격 동안 멈추며, 신호로 끊길 때를 빼면 상대 sleep의 정지 시간은 지정한 간격보다 짧지 않다.[@ieee-1003-1-clock-nanosleep-2024]

상대 sleep 함수로는 정확한 주기 활성화를 얻지 못한다. 주기 $T$로 도는 프로세스가 지금 시각을 읽고 다음 활성화 시각까지의 간격을 계산해 `nanosleep()`을 부르면, 두 호출 사이에 선점될 때 계산한 간격이 틀려 원하는 때보다 늦게 깨어난다. 절대 시각의 `clock_nanosleep()`은 호출 하나로 원하는 시각까지 멈추므로 이 문제가 없다.[@ieee-1003-1-clock-nanosleep-2024]

![[diagrams/relative-vs-absolute-sleep.svg]]

CMSIS-RTOS2는 `osDelayUntil`이 커널 틱으로 지정한 절대 시각까지 기다리게 하고, 커널 틱 카운터가 넘쳐 되돌아가는 경우도 처리하게 한다. 최대 지연은 $2^{31}-1$틱이다.[@arm-cmsis-rtos2-wait-2026]

FreeRTOS의 `vTaskDelay()`는 부른 때를 기준으로 상대 시간만큼 블록하고, `vTaskDelayUntil()`은 블록에서 풀릴 틱 카운트 값을 절대 시각으로 지정한다. 그래서 고정 주기로 실행해야 할 때는 `vTaskDelayUntil()`을 쓴다.[@freertos-task-management-2026]

Zephyr 타이머의 주기는 타이머가 마지막으로 만료되었어야 할 시각을 기준으로 잰 최소 지연이다. 그래서 주기 타이머가 시스템 타이머에 대해 밀리지 않지만, 한 번의 주기 지연은 지정한 주기보다 짧거나 길 수 있다.[@zephyr-timers-2026]

RTEMS의 rate monotonic manager는 주기 태스크의 실행을 관리한다. `rtems_rate_monotonic_period`를 부를 때 주기가 진행 중이면 남은 주기 동안 부른 태스크를 블록했다가 주기가 끝나면 주기를 다시 시작하고, 주기가 이미 만료됐으면 타임아웃 오류 상태값을 받고 곧바로 돌아온다.[@rtems-rate-monotonic-operations-2025] rate monotonic manager는 주기 객체마다 실행한 주기 수, 놓친 주기 수, 주기 루프 한 번에 쓴 CPU 시간과 흐른 시간의 최솟값·최댓값·합 같은 통계를 둔다.[@rtems-rate-monotonic-background-2025]

[[osek-os|OSEK/VDX OS]] 2.2.3 명세는 counter가 미리 정한 값에 이르면 만료되어 정해 둔 동작을 하는 [[osek-alarm|알람]]을 둔다.[@osek-os-2-2-3-2005]
