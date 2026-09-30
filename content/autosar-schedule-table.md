---
title: AUTOSAR schedule table
tags:
  - platform/autosar
verified: 2026-09-30
---

**Schedule table**은 [[autosar-os|AUTOSAR OS]]에서 정적으로 정한 expiry point의 묶음을 담은 객체이며, expiry point에 이르면 태스크 활성화나 이벤트 설정 같은 동작을 한다. schedule table은 counter 정확히 하나가 구동하고, counter의 한 틱이 schedule table의 한 틱이다. OS는 schedule table 여럿을 한꺼번에 다룰 수 있어야 한다.[@autosar-cp-sws-os-2025]

## Expiry point

**Expiry point**는 schedule table 위의 한 시점으로, schedule table 시작에서 잰 틱 수인 offset과 그 시점에 할 동작을 가진다. expiry point는 [[osek-task|태스크]] 활성화, [[osek-event|이벤트]] 설정, 태스크 [[autosar-timing-protection|실행 예산]] 보충 가운데 적어도 하나를 해야 한다. 실행 예산 보충은 `OsTaskTimingProtectionDeferrableServer`가 TRUE인 태스크에만 허용된다. OS는 expiry point를 initial expiry point부터 final expiry point까지 offset이 커지는 순서로 처리하며, 한 schedule table 안의 offset은 서로 달라야 한다.[@autosar-cp-sws-os-2025]

schedule table의 길이와 양 끝의 간격은 다음 셋으로 나타낸다.[@autosar-cp-sws-os-2025]

- **Duration**: schedule table이 한 바퀴를 돌아 0으로 돌아가는 틱 수, 곧 schedule table의 modulus
- **Initial offset**: expiry point의 offset 가운데 가장 작은 값, 곧 첫 expiry point의 offset. 0일 수 있다.
- **Final delay**: final expiry point의 offset과 duration 사이의 틱 수. final expiry point에서 schedule table의 논리적 끝까지의 지연이다.[@autosar-cp-sws-os-2025]

![[diagrams/autosar-schedule-table-anatomy.svg]]

## Single-shot과 repeating

schedule table은 설정으로 single-shot인지 repeating인지 정한다. **Single-shot** schedule table은 expiry point를 차례로 처리하고, final expiry point를 처리한 뒤 final delay만큼 틱이 지나면 멈춘다. **Repeating** schedule table은 final expiry point를 처리한 뒤 initial expiry point로 돌아가며, 각 expiry point는 duration과 같은 주기로 되풀이된다. 반복할 때 OS는 final expiry point를 처리하고 final delay와 initial offset을 더한 틱이 지난 뒤 다음 initial expiry point를 처리한다.[@autosar-cp-sws-os-2025]

![[diagrams/autosar-schedule-table-single-shot-repeating.svg]]

## 시작과 멈춤

schedule table은 OS가 시작할 때 자동으로 시작하도록 설정할 수 있고, 이 autostart는 태스크와 알람의 autostart 다음에 한다. `StartScheduleTableRel`은 counter의 현재 값에서 지정한 offset만큼 틱이 지난 뒤, `StartScheduleTableAbs`는 counter가 지정한 절댓값에 이를 때 schedule table 처리를 시작한다. `StopScheduleTable`은 실행 중인 schedule table의 처리를 어느 시점에서든 즉시 멈춘다.[@autosar-cp-sws-os-2025]

## OSEK 알람과의 차이

OSEK counter와 자동 시작 [[osek-alarm|알람]] 여럿으로도 정적인 태스크 활성화를 구현할 수 있다. 다만 실행 중에 알람을 고치려면 알람 사이의 상대적 동기화를 보장해야 하고, 보통은 counter 틱 인터럽트를 막은 채 고친다. schedule table은 정적으로 정한 expiry point를 한 묶음으로 담아 이 동기화 문제를 푼다.[@autosar-cp-sws-os-2025]
