---
title: 시스템 틱
tags:
  - platform/rtos
aliases:
  - clock tick
verified: 2026-10-07
---

[[rtos|RTOS]]는 흔히 주기적인 인터럽트로 시간을 재고, [[task|태스크]]를 정한 시간 뒤에 실행하는 데 쓰는 시간 지연과 타임아웃을 이것으로 잰다.[@renesas-res05b0008-2010][@micrium-ucos-iii-clock-tick-2026] µC/OS-III 문서는 이 주기적인 시간원을 **시스템 틱**(system tick) 또는 clock tick이라 부른다.[@micrium-ucos-iii-clock-tick-2026]

## 틱과 시간 서비스

FreeRTOS 커널은 틱 카운트 변수로 시간을 잰다. 틱 인터럽트가 틱 카운트를 올릴 때마다 커널은 블록을 풀거나 깨울 태스크가 있는지 보고, 틱 ISR(Interrupt Service Routine)에서 깨운 태스크가 끊긴 태스크보다 우선순위가 높으면 틱 ISR은 새 태스크로 돌아간다.[@freertos-rtos-tick-2026]

µC/OS-III의 주기 틱 모드에서 틱 ISR은 `OSTimeTick()`을 부른다. `OSTimeTick()`은 tick hook을 부르고, [[real-time-scheduling#같은 우선순위(타임 슬라이싱)|round-robin 스케줄링]]으로 지금 태스크의 타임 슬라이스가 끝났는지 본 뒤, 지연이나 타임아웃이 이 틱에 끝나는 태스크를 준비 상태로 만든다.[@micrium-ucos-iii-periodic-tick-mode-2026]

RTEMS(Real-Time Executive for Multiprocessor Systems)는 시간의 기본 단위를 clock tick으로 두고, 틱 간격(`CONFIGURE_MICROSECONDS_PER_TICK`)이 모든 간격·달력 시간 연산의 기본 해상도를 정한다. 틱으로 시간을 재므로 태스크 지연, 타임아웃, 타임 슬라이싱, 타이머 서비스 루틴의 지연 실행, rate monotonic 스케줄링을 지원한다.[@rtems-key-concepts-time-2025] FreeRTOS API(Application Programming Interface)는 시간을 틱 주기의 배수로 지정하고, 쓸 수 있는 해상도는 틱 주파수(`configTICK_RATE_HZ`)에 달렸다.[@freertos-task-management-2026] µC/OS-III의 주기 틱 모드에서 틱은 초당 10\~1000번 일어나야 하고, 실제 주파수는 응용이 원하는 틱 해상도에 달렸다.[@micrium-ucos-iii-clock-tick-2026]

## 지연의 오차

CMSIS-RTOS2는 `osDelay`가 커널 틱 단위로 지정한 시간만큼 기다리게 하고, 실제 지연은 지정한 값보다 최대 한 틱 짧을 수 있다고 정한다. 다음 시스템 틱 바로 앞에서 `osDelay(1)`을 부르면 스레드는 곧바로 다시 스케줄된다.[@arm-cmsis-rtos2-wait-2026]

RTEMS 문서에 따르면 간격으로 잰 실제 지연은 요청한 간격보다 한 틱의 일부만큼 짧을 수 있다. 지연 타이머를 거는 시점이 두 틱 사이 어딘가여서, 첫 카운트다운 틱이 한 틱보다 짧은 시간 뒤에 오기 때문이다. 틱 해상도가 크면 이것이 문제가 될 수 있다.[@rtems-key-concepts-time-2025]

![[diagrams/tick-delay-shorter-than-requested.svg]]

## 틱 주파수와 전력

µC/OS-III의 주기 틱 모드는 틱 주파수가 높을수록 부담이 커지고, 실행할 태스크가 없어도 틱 인터럽트를 자주 처리해야 해서 저전력 응용에 맞지 않을 때가 많다.[@micrium-ucos-iii-clock-tick-2026] 주기 틱 모드에서는 일정한 주파수의 틱 인터럽트가 할 일이 없어도 시스템을 저전력 모드에서 끌어내므로, 소비 전력이 틱 주파수에 따라 달라진다.[@micrium-ucos-iii-periodic-tick-mode-2026]

FreeRTOS에서 idle hook으로 MCU를 저전력 상태에 두면, 틱 인터럽트를 처리하려고 주기적으로 저전력 상태를 나왔다가 다시 들어가야 해서 절전 효과가 제한된다. 틱 주파수가 너무 높으면 틱마다 저전력 상태를 드나드는 에너지와 시간이 가장 가벼운 절전 모드를 빼고는 절전 이득보다 커진다.[@freertos-low-power-support-2026]

## Tickless

CMSIS-RTOS2가 정하는 확장과 Zephyr, FreeRTOS, µC/OS-III가 틱을 멈추거나 줄이는 운영의 이름은 다음과 같다.

| RTOS        | 이름                | 틱을 다루는 방식                                                                                                                                                                                                    |
| ----------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMSIS-RTOS2 | tick-less 동작 확장 | `osKernelSuspend`가 커널 스케줄러를 멈추고 다음 틱 기반 커널 사건까지 남은 틱 수를 돌려주며, `osKernelResume`은 sleep 모드나 전원 차단 모드에 있던 틱 수를 받아 스케줄러를 다시 켠다.[@arm-cmsis-rtos2-kernel-2026] |
| Zephyr      | tickless 커널       | 등록된 사건에만 타이머 인터럽트를 받아 처리한다.[@zephyr-system-timer-drivers-2026]                                                                                                                                 |
| FreeRTOS    | tickless idle 모드  | 실행할 수 있는 응용 태스크가 없는 idle 기간에 주기 틱 인터럽트를 멈추고, 틱 인터럽트를 다시 켤 때 틱 카운트 값을 보정한다.[@freertos-low-power-support-2026]                                                        |
| µC/OS-III   | dynamic tick 모드   | 다음 지연이나 타임아웃에 맞춰 인터럽트를 내도록 다시 설정할 수 있는 하드웨어 타이머를 써서, 틱마다 시스템을 깨우지 않고 시간 서비스를 준다.[@micrium-ucos-iii-clock-tick-2026]                                      |
| µC/OS-III   | tickless mode       | 시스템 틱을 끄고, 시간 서비스가 모두 꺼진다.[@micrium-ucos-iii-tickless-mode-2026]                                                                                                                                  |

CMSIS-RTOS2는 SysTick 타이머까지 끄는 저전력 모드를 많이 쓰는 응용을 위해 tick-less 동작 확장을 둔다. 다음 커널 사건은 지연된 스레드가 다시 준비되는 것 같은 일이고, `osKernelSuspend`가 돌려준 값으로 저전력 타이머가 깨우기 인터럽트를 내게 설정하기를 권한다.[@arm-cmsis-rtos2-kernel-2026]

Zephyr의 tickless 커널은 시스템 타이머 드라이버 API를 자연스럽게 구현한 결과로, 프로그래밍할 수 있는 하드웨어 카운터가 불규칙한 간격의 인터럽트를 낸다. 커널 틱 속도에 맞춰 일정하게 인터럽트를 받고 그때마다 틱 하나를 알리는 전통적인 드라이버도 만들 수 있다.[@zephyr-system-timer-drivers-2026]

FreeRTOS의 tickless idle 모드에서는 인터럽트가 오거나 커널이 태스크를 준비 상태로 옮길 때가 될 때까지 MCU가 깊은 절전 상태에 머문다. `configUSE_TICKLESS_IDLE`을 1로 두면, 커널은 idle 태스크만 실행할 수 있고 응용 태스크가 블록에서 풀리기까지 적어도 `configEXPECTED_IDLE_TIME_BEFORE_SLEEP`만큼의 틱 주기가 남았을 때 `portSUPPRESS_TICKS_AND_SLEEP()`을 부른다.[@freertos-low-power-support-2026]

![[diagrams/periodic-tick-vs-tickless-idle.svg]]

µC/OS-III는 V3.05.00에서 dynamic tick 모드를 처음 넣었고, V3.07.00에서 고쳤다. 이 모드에서는 round-robin 스케줄링을 쓸 수 없다.[@micrium-ucos-iii-dynamic-tick-mode-2026]

tickless mode에서는 태스크 지연과 커널 객체를 기다릴 때의 타임아웃을 쓸 수 없고, [[software-timer|타이머]] 기능을 켜면 빌드 오류가 나며, round-robin 스케줄링이 제대로 동작하지 않는다. 커널 객체를 기다리고 태스크를 정지하거나 재개하는 우선순위 기반 스케줄링은 그대로 쓸 수 있다.[@micrium-ucos-iii-tickless-mode-2026]
