---
title: AUTOSAR timing protection
tags:
  - platform/autosar
  - sw-engineering/functional-safety
verified: 2026-09-30
---

**Timing protection**은 [[autosar-os|AUTOSAR OS]]가 [[osek-task|태스크]]와 [[osek-isr#Category 2|category 2 ISR]]의 시간 동작을 감시해 timing fault를 찾고 그 전파를 막는 기능이다. 태스크와 category 2 ISR에만 적용되며, [[osek-isr#Category 1|category 1 ISR]]은 보호하지 않는다. [[autosar-os#Scalability class|scalability class]] 가운데 SC2와 SC4에 든다.[@autosar-cp-sws-os-2025]

## Timing fault

[[real-time-system|실시간 시스템]]에서 **timing fault**는 태스크나 인터럽트가 실행 중에 [[deadline|마감 시한]]을 놓치는 것이다. 그런데 마감을 놓친 태스크나 ISR이 원인이 아닐 수 있다. 관련 없는 태스크나 ISR이 너무 오래 간섭하거나 막으면, 그 fault가 번져 다른 태스크나 ISR이 마감을 놓친다.[@autosar-cp-sws-os-2025]

[[fixed-priority-scheduling|고정 우선순위]] 선점형 OS에서 마감을 지키는지는 세 요인으로 정해진다. 실행 시간, 우선순위가 낮은 태스크나 ISR이 공유 [[osek-resource|resource]]를 잠그거나 인터럽트를 막아 생기는 blocking 시간, 도착 간격이다. AUTOSAR OS는 timing protection에 deadline monitoring을 두지 않고, 대신 이 세 요인을 시스템이 실행되는 동안 통제한다. 실행 시간과 blocking 시간에는 상한(execution budget, lock budget)을, 도착 간격에는 하한(time frame)을 정적으로 두고, 이 한도를 어긴 것을 찾는다.[@autosar-cp-sws-os-2025]

## Execution budget

**Execution budget**은 태스크나 ISR에 허용되는 최대 실행 시간이다. 태스크는 SUSPENDED나 WAITING 상태로 들기 전까지 RUNNING 상태로 있던 순시간을 재고, 여러 번 활성화된 basic 태스크는 이 순시간을 활성화마다 따로 재므로, budget은 활성화 하나의 실행 시간에 걸린다. OS는 태스크가 SUSPENDED나 WAITING으로 넘어갈 때, ISR은 반환할 때 budget을 다시 채운다.[@autosar-cp-sws-os-2025]

execution budget을 넘으면 OS는 [[autosar-os#Protection hook|protection hook]]을 E_OS_PROTECTION_TIME으로 부른다. 다만 [[aperiodic-server#Deferrable server|deferrable server]]로 설정한 태스크는 hook을 부르는 대신 BUDGET_EXHAUSTED 상태로 옮겨, budget이 다시 채워질 때까지 스케줄하지 않는다.[@autosar-cp-sws-os-2025]

![[diagrams/autosar-execution-budget-consumption.svg]]

## Lock budget

**Lock budget**은 태스크나 category 2 ISR이 resource를 쥐거나 인터럽트를 막고 있어도 되는 가장 긴 시간이다. 태스크나 ISR마다, 모든 인터럽트를 막는 시간과 OS 인터럽트(category 2)를 막는 시간에 budget을 하나씩 두고, resource 점유 시간에는 resource마다 budget을 따로 둔다. lock budget을 넘으면 OS는 protection hook을 E_OS_PROTECTION_LOCKED로 부른다.[@autosar-cp-sws-os-2025]

## Time frame

**Time frame**은 같은 태스크나 ISR이 연이어 도착하는 사이의 최소 간격이다. 태스크는 활성화(SUSPENDED에서 READY로)나 release(WAITING에서 READY로)를, category 2 ISR은 OS가 인터럽트를 알아챈 때를 도착으로 친다. 태스크의 time frame은 활성화나 release가 성공한 때 시작하고, ISR의 time frame은 그 도착부터 잰다. time frame보다 일찍 도착하면 OS는 그 활성화나 release, ISR 실행을 일단 막은 채 protection hook을 E_OS_PROTECTION_ARRIVAL로 부르고, 막은 동작을 결국 수행할지는 hook의 반환값이 정한다.[@autosar-cp-sws-os-2025]

![[diagrams/autosar-time-frame-arrival.svg]]

태스크에 두는 time frame은 활성화와 release를 `OsTaskTimeFrame`마다 한 번으로 제한한다. 큐에 쌓이는 활성화도 저마다 새 도착으로 치므로, 큐가 차는 속도도 이것으로 제한된다. category 2 ISR에 두는 time frame은 쉴 새 없이 인터럽트를 내는 인터럽트 소스에서 ECU를 지키는 데 쓸 수 있다. 네트워크의 다른 ECU가 보낸 프레임마다 인터럽트를 내는 [[can-controller|CAN 컨트롤러]]가 그런 예다.[@autosar-cp-sws-os-2025]

## 위반 처리

위반을 찾으면 OS는 protection hook을 부르고, 그 반환값에 따라 이어서 할 일을 정한다.[@autosar-cp-sws-os-2025] 반환값마다의 처리는 [[autosar-os#Protection hook|AUTOSAR OS]]에서 다룬다.
