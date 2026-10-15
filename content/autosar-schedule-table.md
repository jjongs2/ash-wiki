---
title: AUTOSAR schedule table
tags:
  - platform/autosar
  - platform/rtos
verified: 2026-09-30
---

**Schedule table**은 [[autosar-os|AUTOSAR OS]]에서 정적으로 정한 expiry point의 묶음을 담은 객체이며, expiry point에 이르면 [[osek-task|태스크]] 활성화나 [[osek-event|이벤트]] 설정 같은 동작을 한다. schedule table은 [[osek-alarm|counter]] 정확히 하나가 구동하고, counter의 한 틱이 schedule table의 한 틱이다. OS는 schedule table 여럿을 한꺼번에 다룰 수 있어야 한다.[@autosar-cp-sws-os-2025]

## Expiry point

**Expiry point**는 schedule table 위의 한 시점으로, schedule table 시작에서 잰 틱 수인 offset과 그 시점에 할 동작을 가진다. expiry point는 태스크 활성화, 이벤트 설정, 태스크 [[autosar-timing-protection|실행 예산]] 보충 가운데 적어도 하나를 해야 한다. 실행 예산 보충은 `OsTaskTimingProtectionDeferrableServer`가 `TRUE`인 태스크에만 허용된다. OS는 expiry point를 initial expiry point부터 final expiry point까지 offset이 커지는 순서로 처리하며, 한 schedule table 안의 offset은 서로 달라야 한다.[@autosar-cp-sws-os-2025]

schedule table의 길이와 양 끝의 간격은 다음 셋으로 나타낸다.[@autosar-cp-sws-os-2025]

- **Duration**: schedule table이 한 바퀴를 돌아 0으로 돌아가는 틱 수, 곧 schedule table의 modulus
- **Initial offset**: expiry point의 offset 가운데 가장 작은 값, 곧 첫 expiry point의 offset. 0일 수 있다.
- **Final delay**: final expiry point의 offset과 duration 사이의 틱 수. final expiry point에서 schedule table의 논리적 끝까지의 지연이다.[@autosar-cp-sws-os-2025]

![[diagrams/autosar-schedule-table-anatomy.svg]]

## Single-shot과 repeating

schedule table은 설정으로 single-shot인지 repeating인지 정한다. **Single-shot** schedule table은 expiry point를 차례로 처리하고, final expiry point를 처리한 뒤 final delay만큼 틱이 지나면 멈춘다. **Repeating** schedule table은 final expiry point를 처리한 뒤 initial expiry point로 돌아가며, 각 expiry point는 duration과 같은 주기로 되풀이된다. 반복할 때 OS는 final expiry point를 처리하고 $\mathrm{final\ delay} + \mathrm{initial\ offset}$만큼 틱이 지난 뒤 다음 initial expiry point를 처리한다.[@autosar-cp-sws-os-2025]

![[diagrams/autosar-schedule-table-single-shot-repeating.svg]]

## 시작과 멈춤

schedule table은 OS가 시작할 때 자동으로 시작하도록 설정할 수 있고, 이 autostart는 태스크와 알람의 autostart 다음에 한다. `StartScheduleTableRel`은 counter의 현재 값에서 지정한 offset만큼 틱이 지난 뒤, `StartScheduleTableAbs`는 counter가 지정한 절댓값에 이를 때 schedule table 처리를 시작한다. `StopScheduleTable`은 실행 중인 schedule table의 처리를 어느 시점에서든 즉시 멈춘다.[@autosar-cp-sws-os-2025]

## 동기화

initial expiry point를 처음 처리하는 때는 사용자가 정하지만, repeating schedule table이 되풀이될 때 initial expiry point를 처리하는 counter 값이 처음과 같다는 보장은 없다. schedule table의 duration이 counter의 modulus와 같을 필요가 없기 때문이다. expiry point를 counter의 정해진 절댓값에서 처리하게 하는 것을 **동기화**라 하며, 엔진 제어에서 expiry point를 회전 각도에 맞추거나 계산을 전역(네트워크) 시간 기준에 맞추는 것이 그 쓰임이다. OS 자신은 전역 시간 소스를 주지 않는다.[@autosar-cp-sws-os-2025]

OS가 지원하는 동기화는 두 가지다.[@autosar-cp-sws-os-2025]

- **Implicit 동기화**: schedule table을 구동하는 counter가 곧 동기화할 counter다. [[flexray|FlexRay]]처럼 하드웨어가 네트워크 시간 동기화를 맡고 OS에는 시간을 타이머 인터페이스로 보이는 [[cyclic-executive#Time-triggered와 event-triggered|time-triggered]] 네트워크와 맞출 때 쓴다. OS가 따로 지원할 것은 없지만, schedule table의 duration은 그 counter의 `OsCounterMaxAllowedValue`에 1을 더한 값과 같아야 하고, schedule table은 상대 counter 값이 아니라 절대 counter 값에서만 시작할 수 있다.
- **Explicit 동기화**: schedule table을 구동하는 OS counter(drive counter)와 동기화할 counter(synchronization counter)가 다르다. 주기적으로 방송되는 전역 시간과 맞출 때 쓰며, OS가 schedule table을 synchronization counter에 맞춰 두는 기능을 더 준다. drive counter의 modulus를 $M_\mathrm{drive}$, synchronization counter의 modulus를 $M_\mathrm{sync}$라 하면 schedule table의 duration $D$는 $D \le M_\mathrm{drive}$이고 $D = M_\mathrm{sync}$여야 하며, 두 counter의 틱 해상도가 같아야 한다.[@autosar-cp-sws-os-2025]

Explicit 동기화에서는 사용자가 `SyncScheduleTable`로 synchronization counter의 값을 OS에 알려 준다. 그러면 OS는 schedule table과 synchronization counter 사이의 편차를 계산하고, 조정을 허용하도록 설정한 expiry point마다 다음 expiry point까지의 지연을 `OsScheduleTableMaxShorten`만큼까지 줄이거나 `OsScheduleTableMaxLengthen`만큼까지 늘려, 동기화될 때까지 맞춘다. 편차를 $\Delta$, 설정한 정밀도 문턱(`OsScheduleTblExplicitPrecision`)을 $P$라 하면, $\Delta \le P$일 때 schedule table의 상태는 running and synchronous이고 $\Delta > P$일 때 running이다. `StartScheduleTableSynchron`은 synchronization counter의 값을 받은 뒤에야 schedule table을 시작한다.[@autosar-cp-sws-os-2025]

![[diagrams/schedule-table-explicit-sync.svg]]

[[autosar-time-synchronization#StbM|StbM]]이 schedule table을 동기화할 때 explicit 동기화만 다루는 것은 알려진 한계다. implicit 동기화는 그 메커니즘이 StbM을 거치지 않기 때문이다.[@autosar-cp-tr-releaseoverview-2025]

## OSEK 알람과의 차이

OSEK counter와 자동 시작 알람 여럿으로도 정적인 태스크 활성화를 구현할 수 있다. 다만 실행 중에 알람을 고치려면 알람 사이의 상대적 동기화를 보장해야 하고, 보통은 counter 틱 인터럽트를 막은 채 고친다. schedule table은 정적으로 정한 expiry point를 한 묶음으로 담아 이 동기화 문제를 푼다.[@autosar-cp-sws-os-2025]
