---
title: 메시지 큐
tags:
  - platform/rtos
verified: 2026-10-07
---

[[ieee-1003-1|POSIX.1]]-2024는 **메시지 큐**(message queue)를 메시지를 넣고 꺼낼 수 있는 객체로 정의하고, 메시지를 넣은 순서나 우선순위 순으로 꺼낼 수 있다고 정한다.[@ieee-1003-1-definitions-2024] 태스크는 메시지가 없는 큐에서 메시지를 기다리며 블록할 수 있고, 기다릴 시간의 상한(타임아웃)을 정할 수 있다. 인터럽트 처리기는 큐에 메시지를 넣을 수 있지만 기다리지는 못한다.[@micrium-ucos-iii-message-queues-2026][@arm-cmsis-rtos2-message-queue-2026]

## POSIX의 메시지 큐

POSIX.1-2024는 메시지 큐 함수를 Message Passing 옵션으로 둔다.[@ieee-1003-1-unistd-h-2024][@ieee-1003-1-mq-send-2024] 큐는 `mq_open`으로 만들며, 이때 큐의 `mq_maxmsg`와 `mq_msgsize` 속성을 정한다.[@ieee-1003-1-mq-open-2024] `<mqueue.h>`의 `mq_attr` 구조체에는 큐에 담을 수 있는 메시지의 최대 개수인 `mq_maxmsg`와 메시지의 최대 크기인 `mq_msgsize`가 있다.[@ieee-1003-1-mqueue-h-2024]

`mq_send`는 메시지를 `msg_prio`가 가리키는 자리에 넣는다. `msg_prio` 값이 큰 메시지는 값이 작은 메시지보다 앞에, 값이 같은 메시지 뒤에 들어간다. 메시지 길이가 `mq_msgsize`보다 크면 실패한다. 큐가 가득 찼을 때 `O_NONBLOCK`이 설정되어 있지 않으면 자리가 날 때까지 블록하고, 설정되어 있으면 오류를 돌려준다.[@ieee-1003-1-mq-send-2024] `mq_receive`는 우선순위가 가장 높은 메시지 가운데 가장 오래된 것을 꺼낸다. 큐가 비었을 때도 `O_NONBLOCK`에 따라 블록하거나 오류를 돌려준다.[@ieee-1003-1-mq-receive-2024]

![[diagrams/posix-mq-priority-insertion.svg]]

근거 설명에 따르면 큐마다 메시지 크기의 상한을 고정하고 바꿀 수 없게 한 것은 구현을 최적화하기 위해서다. 크기와 개수가 고정되면 메시지 블록을 미리 할당할 수 있다. 메시지 우선순위의 주목적은 우선순위가 높은 메시지가 낮은 메시지들 뒤에서 늦어지는, 메시지 시스템 안의 [[priority-inversion|우선순위 역전]]을 막는 것이다.[@ieee-1003-1-rationale-message-passing-2024]

## 기다리는 태스크

µC/OS-III에서는 여러 태스크가 한 메시지 큐를 기다릴 수 있고, 메시지가 오면 기다리는 태스크 가운데 우선순위가 가장 높은 태스크가 받는다. 보내는 쪽은 메시지를 기다리는 모든 태스크에 방송할 수도 있다.[@micrium-ucos-iii-message-queues-2026] FreeRTOS에서는 큐가 비어 여러 태스크가 읽기를 기다리면, 데이터가 들어올 때 우선순위가 가장 높은 태스크 하나만 블록이 풀리고, 우선순위가 같으면 가장 오래 기다린 태스크가 풀린다. 가득 찬 큐에 쓰기를 기다리는 태스크도 같다.[@freertos-queue-management-2026] Zephyr의 메시지 큐도 보내기와 받기를 기다리는 스레드 가운데 우선순위가 가장 높고 가장 오래 기다린 스레드에게 차례를 준다.[@zephyr-message-queues-2026] POSIX.1-2024는 Priority Scheduling 옵션을 지원하는 구현에서 같은 규칙을 정한다.[@ieee-1003-1-mq-send-2024][@ieee-1003-1-mq-receive-2024]

## 제품마다 다른 것

메시지의 크기와 메시지를 전하는 방식은 제품마다 아래와 같다.

| 제품                                                  | 메시지 크기                                                 | 전하는 방식                                                                                                             |
| ----------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| FreeRTOS                                              | 큐를 만들 때 항목 하나의 크기를 정한다.                     | 보낸 데이터를 큐에 복사한다.[@freertos-queue-management-2026]                                                           |
| Zephyr                                                | 큐를 만들 때 항목 하나의 크기를 정한다.                     | 기다리는 스레드가 있으면 그 스레드에게, 없으면 큐의 링 버퍼에 복사한다.[@zephyr-message-queues-2026]                    |
| µC/OS-III                                             | 메시지는 데이터를 가리키는 포인터와 그 크기, 보낸 시각이다. | 데이터를 복사하지 않고 참조로 보내므로, 받는 쪽이 쓰는 동안 데이터가 살아 있어야 한다.[@micrium-ucos-iii-messages-2026] |
| RTEMS(Real-Time Executive for Multiprocessor Systems) | 메시지는 길이가 바뀌는 버퍼이고, 큐마다 최대 길이를 정한다. | 큐의 내부 버퍼나 받는 쪽으로 복사한다.[@rtems-message-background-2025]                                                  |

Zephyr와 RTEMS 문서에 따르면 큰 항목을 큐로 보내면 인터럽트 지연이 늘어날 수 있다. 복사하는 동안 인터럽트를 막으므로, Zephyr 문서는 큰 데이터는 포인터를 주고받기를 권하고, RTEMS 문서는 메시지를 되도록 짧게 두기를 권한다.[@zephyr-message-queues-2026][@rtems-message-background-2025]

µC/OS-III는 급한 메시지를 LIFO(Last-In First-Out) 순서로 넣어 이미 큐에 있는 메시지들을 앞지르게 할 수 있다.[@micrium-ucos-iii-message-queues-2026] RTEMS의 `rtems_message_queue_urgent`는 메시지를 큐의 머리에 넣는다.[@rtems-message-background-2025] FreeRTOS에서도 큐의 앞에 쓰거나, 앞에 있는 데이터를 덮어쓸 수 있다.[@freertos-queue-management-2026] CMSIS-RTOS2의 `osMessageQueuePut`은 `msg_prio`로 메시지를 넣을 때 우선순위 순으로 정렬하며, 값이 클수록 우선순위가 높다.[@arm-cmsis-rtos2-message-queue-2026]

mailbox라는 말의 뜻도 갈린다. FreeRTOS 책은 길이가 1인 큐로서 데이터가 빠져나가지 않고 덮어쓸 때까지 남아 있어 누구든 읽을 수 있는 것을 **mailbox**라 부른다.[@freertos-queue-management-2026] Zephyr에서는 동기 전송을 하는 커널 객체 타입이 mailbox다.[@zephyr-message-queues-2026]
