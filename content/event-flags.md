---
title: 이벤트 플래그
tags:
  - platform/rtos
aliases:
  - event group
verified: 2026-10-07
---

**이벤트 플래그**(event flag)는 사건이 일어났는지를 비트 하나로 나타내는 동기화 수단이다. 플래그 비트 여러 개가 한 객체에 묶이고, 태스크는 그 가운데 고른 비트들 중 하나라도 설정되기를(OR) 기다리거나 모두 설정되기를(AND) 기다린다. 플래그는 태스크뿐 아니라 인터럽트 처리기도 설정할 수 있다.[@micrium-ucos-iii-event-flags-2026][@arm-cmsis-rtos2-event-flags-2026] FreeRTOS는 이벤트 플래그의 묶음을 **event group**이라 부른다.[@freertos-event-groups-2026]

FreeRTOS의 [[semaphore|세마포어]]와 [[message-queue|큐]]는 사건 하나를 기다리게 하고 사건이 일어나면 우선순위가 가장 높은 대기자 하나만 깨우지만, event group은 여러 사건의 조합을 기다리게 하고 같은 사건을 기다리던 태스크를 모두 깨운다. 그래서 여러 태스크를 동기화하거나 사건을 여러 태스크에 알리는 데 쓴다.[@freertos-event-groups-2026]

## 제품 비교

플래그 비트 수와, 조건이 맞을 때 깨우는 대기자는 제품마다 아래와 같다.

| 제품        | 플래그 비트 수                         | 깨우는 대기자                                                                                                                                                |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| µC/OS-III   | 그룹마다 8, 16, 32비트 가운데 하나     | 플래그가 설정되거나 지워질 때마다 기다리는 모든 태스크를 살펴 원하는 비트가 맞았는지 본다.[@micrium-ucos-iii-event-flags-2026]                               |
| CMSIS-RTOS2 | 31개까지                               | 우선순위가 가장 높은 스레드가 깨어난다. 기다릴 때 `osFlagsNoClear`를 주면 다음 스레드들도 우선순위 순으로 깨어날 수 있다.[@arm-cmsis-rtos2-event-flags-2026] |
| FreeRTOS    | 틱 카운트 타입의 폭에 따라 8, 24, 56개 | 같은 사건을 기다리던 태스크를 모두 깨운다.[@freertos-event-groups-2026]                                                                                      |
| Zephyr      | 32비트                                 | 조건이 맞은 스레드가 모두 함께 준비 상태가 된다.[@zephyr-events-2026]                                                                                        |

CMSIS-RTOS2에서는 스레드가 깨어나면 기다린 플래그가 `osFlagsNoClear`를 주지 않는 한 저절로 지워진다.[@arm-cmsis-rtos2-event-flags-2026] FreeRTOS에서 기다리는 쪽이 `xClearOnExit`를 주면 비트 검사와 지우기가 다른 태스크나 인터럽트에 끊기지 않는 한 동작처럼 일어난다. 비트를 설정하면 몇 태스크가 깨어날지 미리 알 수 없어 결정적이지 않으므로, FreeRTOS는 인터럽트 처리기에서 비트를 직접 설정하지 않고 [[rtos|RTOS]] daemon 태스크에 넘긴다.[@freertos-event-groups-2026] Zephyr에서 이벤트를 받으면서 원자적으로 지우는 것은 `k_event_wait_safe`, `k_event_wait_all_safe` 같은 `_safe` 함수다.[@zephyr-events-2026]

## 태스크에 딸린 플래그

이벤트를 별도 객체가 아니라 태스크에 직접 보내는 기능도 있다.[@arm-cmsis-rtos2-thread-flags-2026][@micrium-ucos-iii-task-semaphore-2026]

- **CMSIS-RTOS2 thread flags**: 이벤트 플래그를 특화한 것으로, 이벤트 플래그가 여러 스레드에 알릴 수 있는 것과 달리 특정 스레드 하나에만 보낸다. 모든 스레드가 따로 객체를 할당하지 않고 받을 수 있다. 인터럽트 처리기에서는 `osThreadFlagsSet`만 부를 수 있다.[@arm-cmsis-rtos2-thread-flags-2026]
- **FreeRTOS task notification**: 태스크나 인터럽트 처리기가 별도 통신 객체 없이 받는 태스크에 사건을 직접 보낸다. 태스크마다 알림 상태와 32비트 알림 값이 있다.[@freertos-task-notifications-2026]
- **µC/OS-III 태스크 세마포어**: 태스크마다 세마포어가 하나씩 들어 있고, 태스크가 만들어질 때 초기값 0으로 생긴다.[@micrium-ucos-iii-task-semaphore-2026]
- **RTEMS 이벤트**: RTEMS(Real-Time Executive for Multiprocessor Systems)에서는 태스크마다 이벤트 플래그 32개가 딸린다. 이벤트는 큐에 쌓이지 않아, 태스크가 받기 전에 같은 이벤트를 두 번 이상 보내도 두 번째부터는 효과가 없다.[@rtems-event-background-2025] 받은 이벤트는 태스크의 이벤트 집합에서 지워지고, 요청하지 않은 이벤트는 그대로 남는다.[@rtems-event-receive-2025]

FreeRTOS의 task notification은 큐, 세마포어, event group으로 같은 일을 할 때보다 사건이나 데이터를 훨씬 빠르게, RAM(Random-Access Memory)을 덜 쓰며 보낸다. 대신 받는 태스크가 하나뿐이고, 값 하나만 담으며, 태스크에서 인터럽트 처리기로는 보내지 못한다.[@freertos-task-notifications-2026] µC/OS-III의 태스크 세마포어도 별도 세마포어 객체를 쓰는 것보다 효율적이다.[@micrium-ucos-iii-task-semaphore-2026]

[[osek-os|OSEK OS]]의 [[osek-event|이벤트]]도 독립된 객체가 아니라 extended 태스크에 딸리며, 그 태스크만 자기 이벤트를 기다릴 수 있다.[@osek-os-2-2-3-2005]
