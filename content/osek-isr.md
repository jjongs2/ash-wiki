---
title: OSEK ISR
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK ISR**(Interrupt Service Routine)은 [[osek-os|OSEK OS]]에서 인터럽트를 처리하는 함수다. ISR은 운영체제 서비스를 쓰는지에 따라 category 1과 category 2로 나뉜다.[@osek-os-2-2-3-2005] [[osek-implementation-language|OIL]]의 `ISR` 객체는 `CATEGORY` 속성으로 1이나 2를 받는다.[@osek-oil-2-5-2004]

## 구조·동작

인터럽트는 태스크보다 우선하며, 인터럽트 처리 레벨은 태스크 레벨보다 높다. 인터럽트는 선점할 수 있는 태스크와 선점할 수 없는 태스크를 모두 끊을 수 있다.[@osek-os-2-2-3-2005] 처리 레벨은 [[osek-os|OSEK OS]]에서 다룬다.

![[diagrams/osek-os-processing-levels.svg]]

### Category 1

**Category 1 ISR**은 운영체제 서비스를 쓰지 않는다. 예외로 인터럽트를 켜고 끄는 서비스만 부를 수 있다. ISR이 끝나면 프로세서는 끊겼던 바로 그 명령으로 돌아가고, 태스크 관리는 인터럽트의 영향을 받지 않는다. 오버헤드가 가장 적은 종류다.[@osek-os-2-2-3-2005]

### Category 2

**Category 2 ISR**은 운영체제가 ISR 프레임을 마련해 사용자 루틴의 실행 환경을 준비해 주는 ISR이다. 어느 인터럽트에 어느 사용자 루틴이 붙는지는 시스템 생성 단계에서 정해진다. Category 2 ISR은 `ActivateTask`나 `SetEvent`처럼 일부 시스템 서비스를 부를 수 있다.[@osek-os-2-2-3-2005]

### 재스케줄링

ISR이 도는 동안 스케줄러는 태스크를 바꾸지 않는다. 인터럽트 루틴이 활성화한 태스크도, 진행 중인 인터럽트 루틴이 하나도 남지 않을 때까지 스케줄링을 기다린다. 선점할 수 있는 태스크가 끊겼고 다른 인터럽트가 활성이 아니면, category 2 ISR이 끝날 때 재스케줄링이 일어난다.[@osek-os-2-2-3-2005]

![[diagrams/osek-isr-category-2-rescheduling.svg]]

### 인터럽트 서비스

인터럽트를 멈추고 되살리는 서비스는 세 쌍이다. 모든 인터럽트를 다루는 쌍이 둘이다. 둘 다 하드웨어가 끌 수 있는 인터럽트를 끄고 끄기 전 상태를 저장했다가 되돌리는데, `DisableAllInterrupts`와 `EnableAllInterrupts`는 중첩해 부를 수 없고 `SuspendAllInterrupts`와 `ResumeAllInterrupts`는 중첩해 부를 수 있다. 남은 한 쌍인 `SuspendOSInterrupts`와 `ResumeOSInterrupts`는 category 2 인터럽트만 대상으로 하며 중첩해 부를 수 있다. 다만 category 2만 효율적으로 끌 수 없으면 더 많은 인터럽트를 꺼도 된다.[@osek-os-2-2-3-2005]

Suspend와 Resume을 중첩해 부르면, 첫 Suspend가 저장한 인식 상태를 마지막 Resume이 되돌린다. Suspend나 Disable로 연 임계 구역은 짝이 맞는 Resume이나 Enable로 닫아야 하며, 그 안에서 인터럽트로부터 돌아갈 수 없다.[@osek-os-2-2-3-2005]

## 비교·한계

category 2 ISR이 category 1 ISR을 끊고 태스크를 활성화하거나 이벤트를 설정해도, category 1 ISR의 끝에는 운영체제로 들어가는 길이 없다. 그래서 그 처리는 다음 재스케줄링 시점이 올 때까지 얼마든지 밀릴 수 있다. OSEK OS 명세는 이식성을 위한 경험칙으로, category 2 인터럽트가 category 1보다 높은 하드웨어 우선순위를 갖지 않게 하기를 제시한다.[@osek-os-2-2-3-2005]

![[diagrams/osek-isr-category-1-nesting-delay.svg]]
