---
title: Context switch
tags:
  - platform/rtos
verified: 2026-09-29
---

FreeRTOS 문서는 멈추는 [[task|태스크]]의 context를 저장하고 재개하는 태스크의 context를 복원하는 과정을 **context switch**라 부른다.[@freertos-context-switching-2023] 운영체제 커널은 태스크를 멈출 때 그 context를 저장하고, 다시 실행하기 전에 저장해 둔 context를 복원한다.[@freertos-context-switching-2023][@osek-os-2-2-3-2005] **context**는 태스크를 다시 실행하는 데 필요한 프로세서 상태로, 범용 레지스터, 프로그램 카운터, 스택 포인터, 상태 레지스터 같은 값이다.[@freertos-avr-context-2024][@intel-sdm-vol3a-2026]

## 저장과 복원

스케줄러가 다른 태스크를 고르면 context switch가 일어난다.[@osek-os-2-2-3-2005][@freertos-tick-code-2023] context가 복원된 태스크는 멈췄던 자리에서 실행을 이어 간다.[@osek-os-2-2-3-2005][@freertos-avr-context-2024]

FreeRTOS는 태스크마다 [[task#스택|스택]]을 따로 두고, 프로세서 레지스터를 그 태스크의 스택에 push해 context를 저장한다. FreeRTOS의 AVR 포트는 레지스터를 번호 순으로 하나씩 태스크 스택에 push한다.[@freertos-saving-context-2024] 태스크를 재개할 때는 그 태스크의 스택 포인터를 되찾은 뒤, 스택에서 레지스터를 pop해 context를 복원한다.[@freertos-restoring-context-2024]

![[diagrams/context-switch-save-restore.svg]]

µC/OS-III는 다른 태스크를 실행하기로 하면 지금 태스크의 context, 대개 CPU 레지스터를 그 태스크의 스택에 저장하고 새 태스크의 context를 복원한다. 준비 상태 태스크의 스택 프레임은 늘 인터럽트가 막 일어나 프로세서 레지스터를 모두 쌓아 둔 것처럼 꾸며져 있다. 태스크는 만들어질 때 준비 상태에 들므로, 소프트웨어가 그 스택 프레임을 같은 모양으로 미리 채워 둔다. 스택 포인터는 스택이 아니라 태스크의 TCB(Task Control Block)에 저장한다. context switch 코드는 대개 µC/OS-III의 프로세서 포트에 들어 있다. 레지스터가 많은 CPU일수록 저장하고 복원할 레지스터가 많아 context switch 부담이 크다.[@micrium-ucos-iii-context-switching-2026] µC/OS-III TCB의 첫 필드 `.StkPtr`는 태스크 스택의 꼭대기를 가리키며, context switch 코드가 어셈블리에서 접근하는 TCB 필드를 이것 하나로 두도록 해 맨 앞에 놓았다.[@micrium-ucos-iii-task-management-internals-2026]

FreeRTOS 문서에 따르면 협력형 스케줄러는 요청이 있을 때만 context switch를 하므로, [[rtos|RTOS]]가 더하는 처리 오버헤드를 크게 줄인다.[@freertos-solution4-2024]

스케줄링 알고리즘을 구현하면 오버헤드와 블로킹이 더해지고, 이는 시간 정확성을 검증할 때 반영해야 한다. Katcher, Arakawa, Strosnider는 1993년 이벤트 구동과 타이머 구동 구현을 분석해, [[fixed-priority-scheduling|고정 우선순위 스케줄링]]에서 구현 비용을 넣으면 이상적인 breakdown 이용률이 90%를 넘는 태스크 집합도 스케줄할 수 없게 될 수 있음을 보였다.[@katcher-fixed-priority-schedulers-1993] 스케줄링 방식은 [[real-time-scheduling|실시간 스케줄링]]에서 다룬다.

[[autosar|AUTOSAR]]의 Timing Analysis and Design 보고서는 ECU 타이밍 최적화의 지표로, 선점 횟수를 줄여 운영체제 오버헤드를 줄이는 것을 든다.[@autosar-fo-tr-timinganalysis-2025]

Tindell의 고정 우선순위 [[response-time-analysis|응답 시간 분석]]은 태스크의 [[worst-case-execution-time|최악 실행 시간]]에 context switch 오버헤드가 들어 있다고 보고, 선점 비용을 0으로 둔다.[@tindell-extendible-approach-1992] Leung과 Zhao도 FAA 보고서 DOT/FAA/AR-05/27에서 context switch 시간을 무시할 만하다고 가정하고, 그렇지 않으면 태스크의 실행 시간을 늘려 context switch로 잃는 시간을 반영하게 했다.[@leung-real-time-scheduling-analysis-2005]

## x86

IA-32 아키텍처는 보호 모드에서 하드웨어 태스크 전환 기구를 제공한다. 전환 때 프로세서가 현재 태스크의 상태를 그 태스크의 TSS(Task-State Segment)에 저장하고, 새 태스크의 TSS에서 상태를 읽어 온다. 64비트 모드는 이 기구를 지원하지 않아, 태스크 관리와 전환을 소프트웨어가 맡는다.[@intel-sdm-vol3a-2026]

Intel 64·IA-32 아키텍처의 XSAVE 기능 집합은 프로세서 상태를 메모리에 저장하고 불러오는 명령을 둔다.[@intel-sdm-vol1-2026] 운영체제는 XSAVE 기능 집합으로 x87 부동소수점 상태와 확장 프로세서 상태를 관리하며, context switch 때 이 상태를 저장하고 복원할 버퍼를 마련한다.[@intel-sdm-vol3a-2026]

## Cortex-M

Armv7-M 프로세서는 예외에 들어갈 때 `R0`–`R3`, `R12`, `LR`, 반환 주소, `xPSR`로 된 8워드 프레임을 하드웨어로 현재 스택에 쌓는다. 부동소수점 확장이 있고 부동소수점 context가 활성이면 부동소수점 상태도 쌓는다. 프로세스를 바꿀 때는 소프트웨어가 옛 프로세스의 context 전부를 `EXC_RETURN` 값까지 저장하고, 그 프로세스로 돌아가기 전에 복원해야 한다.[@arm-ddi-0403-2021]

![[diagrams/cortex-m-exception-stack-frame.svg]]

Cortex-M4 Devices Generic User Guide는 운영체제 환경에서 다른 예외가 활성이 아닐 때 context switch에 PendSV를 쓰라고 권한다.[@arm-dui-0553-2011] Armv7-M 아키텍처 매뉴얼은 SVCall과 PendSV를 같은 최저 우선순위로 두고, context switch 요청은 PendSV를 pending으로 만들어 내는 사용 모델을 제시한다. 이 모델에서 두 예외는 프로세서가 다른 예외를 모두 처리한 뒤 실행된다.[@arm-ddi-0403-2021]
