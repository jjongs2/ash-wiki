---
title: OSEK ISR
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK ISR**(Interrupt Service Routine)은 [[osek-os|OSEK OS]]에서 인터럽트를 처리하는 함수다. ISR은 운영체제 서비스를 쓰는지에 따라 category 1과 category 2로 나뉜다.[@osek-os-2-2-3-2005] [[osek-implementation-language|OIL]]의 `ISR` 객체는 `CATEGORY` 속성으로 1이나 2를 받는다.[@osek-oil-2-5-2004]

## Category 1

**Category 1 ISR**은 운영체제 서비스를 쓰지 않는다. 예외로 인터럽트를 켜고 끄는 서비스만 부를 수 있다. ISR이 끝나면 프로세서는 끊겼던 바로 그 명령으로 돌아가고, [[osek-task|태스크]] 관리는 인터럽트의 영향을 받지 않는다. 오버헤드가 가장 적은 종류다.[@osek-os-2-2-3-2005]

category 2 ISR이 category 1 ISR을 끊고 태스크를 활성화하거나 [[osek-event|이벤트]]를 설정해도, category 1 ISR의 끝에는 운영체제로 들어가는 길이 없다. 그래서 그 처리는 다음 재스케줄링 시점이 올 때까지 얼마든지 밀릴 수 있다. OSEK OS 2.2.3 명세는 이식성을 위한 경험칙으로, category 2 인터럽트가 category 1보다 높은 하드웨어 우선순위를 갖지 않게 하기를 제시한다.[@osek-os-2-2-3-2005]

![[diagrams/osek-isr-category-1-nesting-delay.svg]]

## Category 2

**Category 2 ISR**은 운영체제가 ISR 프레임을 마련해 사용자 루틴의 실행 환경을 준비해 주는 ISR이다. 어느 인터럽트에 어느 사용자 루틴이 붙는지는 시스템 생성 단계에서 정해진다. Category 2 ISR은 `ActivateTask`나 `SetEvent`처럼 일부 시스템 서비스를 부를 수 있다.[@osek-os-2-2-3-2005]

## 정의

애플리케이션 안에서 category 2 ISR은 `ISR(FuncName)` 꼴로 정의한다. 시스템 생성은 키워드 `ISR`로 소스 코드의 함수와 ISR을 가린다. category 1 ISR의 정의 꼴은 명세가 정하지 않고 구현이 정한다.[@osek-os-2-2-3-2005]

## 재스케줄링

인터럽트는 [[osek-os#처리 레벨|처리 레벨]]이 태스크보다 높아, 선점할 수 없는 태스크도 끊을 수 있다.[@osek-os-2-2-3-2005]

ISR이 도는 동안 스케줄러는 태스크를 바꾸지 않는다. 인터럽트 루틴이 활성화한 태스크도, 진행 중인 인터럽트 루틴이 하나도 남지 않을 때까지 스케줄링을 기다린다. 선점할 수 있는 태스크가 끊겼고 다른 인터럽트가 활성이 아니면, category 2 ISR이 끝날 때 재스케줄링이 일어난다.[@osek-os-2-2-3-2005]

![[diagrams/osek-isr-category-2-rescheduling.svg]]

인터럽트 우선순위의 최대 개수는 쓰는 컨트롤러와 구현에 달렸다. 인터럽트의 스케줄링은 하드웨어에 달려 있어 명세가 정하지 않으며, 인터럽트는 하드웨어가, 태스크는 스케줄러가 스케줄링한다. 운영체제 우선순위를 하드웨어 우선순위에 대응시키는 방법은 구현이 정한다.[@osek-os-2-2-3-2005]

## 인터럽트 서비스

인터럽트를 멈추고 되살리는 서비스는 세 쌍이다. 모든 인터럽트를 다루는 쌍이 둘이다. 둘 다 하드웨어가 끌 수 있는 인터럽트를 끄고 끄기 전 상태를 저장했다가 되돌리는데, `DisableAllInterrupts`와 `EnableAllInterrupts`는 중첩해 부를 수 없고 `SuspendAllInterrupts`와 `ResumeAllInterrupts`는 중첩해 부를 수 있다. 남은 한 쌍인 `SuspendOSInterrupts`와 `ResumeOSInterrupts`는 category 2 인터럽트만 대상으로 하며 중첩해 부를 수 있다. 다만 category 2만 효율적으로 끌 수 없으면 더 많은 인터럽트를 꺼도 된다.[@osek-os-2-2-3-2005]

Suspend와 Resume을 중첩해 부르면, 첫 Suspend가 저장한 인식 상태를 마지막 Resume이 되돌린다. Suspend나 Disable로 연 [[critical-section|임계 구역]]은 짝이 맞는 Resume이나 Enable로 닫아야 하며, 그 안에서 인터럽트로부터 돌아갈 수 없다.[@osek-os-2-2-3-2005]

`DisableAllInterrupts`와 `EnableAllInterrupts`로 연 임계 구역 안에서는 어떤 시스템 서비스도 부를 수 없다. Suspend와 Resume으로 연 임계 구역 안에서 부를 수 있는 서비스는 `SuspendAllInterrupts`·`ResumeAllInterrupts` 쌍과 `SuspendOSInterrupts`·`ResumeOSInterrupts` 쌍뿐이다. `DisableAllInterrupts`·`EnableAllInterrupts`와 `SuspendOSInterrupts`·`ResumeOSInterrupts`는 [[osek-hook-routine|hook 루틴]]에서 부를 수 없다.[@osek-os-2-2-3-2005]
