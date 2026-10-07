---
title: 태스크
tags:
  - platform/rtos
verified: 2026-10-07
---

**태스크**(task)는 [[rtos|RTOS]] 위의 실시간 응용이 일을 나누어 맡기는 단위로, 응용은 일을 태스크 여럿으로 나누고 태스크마다 일의 한 부분을 맡긴다. 단일 CPU에서는 어느 순간에나 태스크 하나만 실행된다.[@renesas-res05b0008-2010][@micrium-ucos-iii-real-time-kernels-2026] Renesas 앱노트에 따르면 태스크는 실행의 기본 단위이고, 작고 스케줄할 수 있는 순차 프로그램 단위다.[@renesas-res05b0008-2010] µC/OS-III 문서는 태스크를 스레드(thread)라고도 부른다.[@micrium-ucos-iii-real-time-kernels-2026]

RTOS는 태스크마다 그 태스크의 정보를 담는 자료 구조인 TCB(Task Control Block)를 둔다.[@renesas-res05b0008-2010][@micrium-ucos-iii-task-management-internals-2026]

## 태스크 상태

태스크는 다음 세 상태를 오간다.[@micrium-ucos-iii-task-management-internals-2026][@arm-cmsis-rtos2-thread-management-2026]

- **실행 중**(running): CPU를 받아 실행되고 있는 상태다. 한 번에 한 태스크만 이 상태에 있다.
- **준비**(ready): 실행할 수 있지만 CPU를 받지 못한 상태다. 실행 중인 태스크가 끝나거나 블록되면, 준비 상태의 태스크 가운데 우선순위가 가장 높은 것이 실행 중이 된다.
- **블록**(blocked): 지연 시간이 지나기를 기다리거나, 사건이 일어나기를 기다리거나, 정지되어 실행할 수 없는 상태다.[@micrium-ucos-iii-task-management-internals-2026][@arm-cmsis-rtos2-thread-management-2026]

![[diagrams/task-state-transitions.svg]]

µC/OS-III와 FreeRTOS에서 사건을 기다리는 태스크는 그동안 CPU 시간을 쓰지 않는다.[@micrium-ucos-iii-task-management-internals-2026][@freertos-task-management-2026]

FreeRTOS, µC/OS-III, Zephyr, RTEMS(Real-Time Executive for Multiprocessor Systems)가 두는 태스크 상태와 CMSIS-RTOS2가 정하는 스레드 상태는 다음과 같다.

| RTOS        | 상태                                                                  | 비고                                                                                                                                                                              |
| ----------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FreeRTOS    | Running, Ready, Blocked, Suspended                                    | Ready, Blocked, Suspended를 Not Running으로 묶는다.[@freertos-task-management-2026]                                                                                               |
| µC/OS-III   | dormant, ready, running, pending, ISR(Interrupt Service Routine) 실행 | dormant는 메모리에 있지만 아직 커널에 알리지 않은 태스크다. ISR 실행은 인터럽트가 태스크의 실행을 멈추고 ISR을 실행하는 상태다.[@micrium-ucos-iii-task-management-internals-2026] |
| CMSIS-RTOS2 | RUNNING, READY, BLOCKED, TERMINATED, INACTIVE                         | TERMINATED는 자원을 아직 풀지 않은 채 끝난 스레드, INACTIVE는 만들지 않았거나 자원까지 모두 풀고 끝난 스레드다.[@arm-cmsis-rtos2-thread-management-2026]                          |
| Zephyr      | ready, unready                                                        | running은 따로 선 스레드 상태가 아니라 ready 스레드에만 붙는 schedule state다.[@zephyr-threads-2026]                                                                              |
| RTEMS       | executing, ready, blocked, dormant, non-existent                      | dormant는 만들었지만 시작하지 않은 태스크, non-existent는 만들지 않았거나 지운 태스크다.[@rtems-task-background-2025]                                                             |

FreeRTOS의 Blocked 태스크는 지연이 끝나거나 절대 시각에 이르는 시간 사건, 또는 다른 태스크나 인터럽트가 내는 동기화 사건을 기다린다. Suspended 태스크는 스케줄러가 고르지 않으며, `vTaskSuspend()`로 명시적으로 정지시켜야만 들어가고 `vTaskResume()`이나 `xTaskResumeFromISR()`로만 나온다.[@freertos-task-management-2026] 같은 suspended라는 이름을 OSEK/VDX OS 2.2.3 명세는 [[osek-task#태스크 상태|OSEK 태스크]]가 수동적이며 활성화될 수 있는 상태로 정의한다.[@osek-os-2-2-3-2005]

Zephyr는 실행을 막는 요인이 없는 스레드를 ready, 요인이 하나라도 있는 스레드를 unready로 나눈다. 시작되지 않았거나, 커널 객체나 타임아웃을 기다리거나, 정지되었거나, 끝났으면 unready다.[@zephyr-threads-2026]

µC/OS-III, Zephyr, RTEMS, FreeRTOS에서 우선순위를 나타내는 숫자의 방향은 다음과 같다.

| RTOS      | 숫자와 우선순위                                                                         |
| --------- | --------------------------------------------------------------------------------------- |
| µC/OS-III | 숫자가 작을수록 우선순위가 높고, 0이 가장 높다.[@micrium-ucos-iii-priority-levels-2026] |
| Zephyr    | 숫자가 작은 우선순위가 앞선다.[@zephyr-threads-2026]                                    |
| RTEMS     | 숫자가 작은 태스크가 더 중요하다.[@rtems-task-background-2025]                          |
| FreeRTOS  | 숫자가 작을수록 우선순위가 낮고, 0이 가장 낮다.[@freertos-task-management-2026]         |

## Idle 태스크

FreeRTOS와 µC/OS-III에서 **idle 태스크**는 실행할 준비가 된 다른 태스크가 없을 때 도는 태스크로, 우선순위가 가장 낮다.[@freertos-task-management-2026][@micrium-ucos-iii-idle-task-2026] FreeRTOS의 스케줄러는 `vTaskStartScheduler()`가 불릴 때 idle 태스크를 자동으로 만들어, 실행 상태에 들 수 있는 태스크가 늘 하나는 있게 한다. idle 태스크의 우선순위는 0이다.[@freertos-task-management-2026] µC/OS-III의 idle 태스크 `OS_IdleTask()`는 켜 두면 µC/OS-III가 맨 처음 만드는 태스크이고, 우선순위는 늘 `OS_CFG_PRIO_MAX-1`이다.[@micrium-ucos-iii-idle-task-2026]

FreeRTOS의 idle hook 함수는 idle 태스크가 루프마다 부르는 함수로, 블록하거나 스스로를 정지해서는 안 된다. idle 태스크가 블록되면 실행 상태에 들 수 있는 태스크가 하나도 없게 될 수 있기 때문이다.[@freertos-task-management-2026] µC/OS-III에서는 `OSIdleTaskHook()`이 idle 태스크를 사건을 기다리게 하는 호출을 해서는 안 된다.[@micrium-ucos-iii-idle-task-2026]

FreeRTOS에서는 idle hook으로 처리기를 저전력 모드에 둘 수 있지만, 얻는 절전은 [[system-tick#Tickless|tickless idle 모드]]보다 작다.[@freertos-task-management-2026] µC/OS-III에서는 `OSIdleTaskHook()`으로 CPU를 저전력 모드에 둘 수 있다. 이때 idle 태스크가 올리는 카운터로는 CPU 사용률을 잴 수 없게 된다.[@micrium-ucos-iii-idle-task-2026]

FreeRTOS에서는 응용 태스크도 idle 태스크와 같은 우선순위를 쓸 수 있다. 이때 `configIDLE_SHOULD_YIELD`를 1로 두면, idle 태스크는 같은 우선순위의 준비된 태스크가 있을 때 루프를 돌 때마다 남은 [[real-time-scheduling#같은 우선순위(타임 슬라이싱)|타임 슬라이스]]를 내준다. 스스로를 지운 태스크의 커널 자원은 idle 태스크가 정리하므로, 그런 태스크가 있으면 idle 태스크가 처리 시간을 받지 못해서는 안 된다.[@freertos-task-management-2026] µC/OS-III는 다른 태스크를 idle 태스크의 우선순위로 만들지 못하게 하고, idle 태스크를 빼도 그 우선순위에는 태스크를 만들 수 없다.[@micrium-ucos-iii-idle-task-2026] CMSIS-RTOS2는 가장 낮은 우선순위 `osPriorityIdle`을 idle 스레드에 남겨 두고, 다른 스레드에는 쓰지 않기를 권한다.[@arm-cmsis-rtos2-thread-management-2026]

## 스택

태스크마다 자기 스택을 둔다.[@renesas-res05b0008-2010][@silabs-intro-rtos-2019]

FreeRTOS는 태스크를 만들 때 정한 크기의 스택을 태스크마다 두고, 태스크가 실행을 시작한 뒤로 가장 적게 남았던 스택 공간을 스택 **high water mark**라 부른다. `uxTaskGetStackHighWaterMark()`가 이 값을 돌려주며, 0에 가까울수록 그 태스크가 스택 넘침에 가까이 갔던 것이다.[@freertos-troubleshooting-2026]

FreeRTOS는 `configCHECK_FOR_STACK_OVERFLOW`로 실행 중 스택 검사를 켜게 하며, 검사는 [[context-switch|context switch]] 시간을 늘린다. 방법 1은 태스크가 전환되어 나가며 context를 스택에 저장한 뒤 스택 포인터가 유효한 범위 안에 있는지 본다. 빠르지만 전환과 전환 사이에 일어난 넘침은 놓칠 수 있다. 방법 2는 태스크를 만들 때 스택을 알려진 패턴으로 채워 두고, 방법 1에 더해 스택 끝 20바이트가 덮였는지 본다. 넘침을 찾으면 커널이 stack overflow hook을 부른다.[@freertos-troubleshooting-2026]

µC/OS-III는 CPU에 스택 포인터의 한계를 검사하는 레지스터가 있으면, 태스크를 만들 때 정한 TCB의 `.StkLimitPtr` 값으로 그 레지스터를 설정해 스택 포인터가 한계를 넘을 때 예외가 나게 한다. 이 레지스터 값은 context switch 때마다 바꿔야 한다. 그런 레지스터가 없으면 context switch hook에서 다음 태스크의 스택 포인터가 `.StkLimitPtr`을 넘지 않는지 소프트웨어로 볼 수 있지만, 넘침을 곧바로 찾지 못하고 하드웨어 검출만큼 믿을 만하지도 않다.[@micrium-ucos-iii-detecting-task-stack-overflows-2026]

AUTOSAR OS의 스택 감시는 [[autosar-os#Stack monitoring|AUTOSAR OS]]에서 다룬다.
