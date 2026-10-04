---
title: OSEK resource
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK resource**는 [[osek-os|OSEK/VDX OS]]에서 공유 자원 접근을 조율하는 단위 객체다. 서로 다른 우선순위의 [[osek-task|태스크]]들이 메모리, 하드웨어 영역, 스케줄러, 코드의 특정 구간 같은 공유 자원을 함께 쓸 때, 운영체제는 resource를 통해 그 접근을 조율한다. OSEK/VDX OS 2.2.3 명세는 resource를 [[critical-section|임계 구역]]에 배정하고, 태스크가 `GetResource`로 임계 구역에 들어가 `ReleaseResource`로 나오게 한다. 또 [[priority-inversion|우선순위 역전]]과 [[deadlock|교착 상태]]를 막으려고 OSEK [[priority-ceiling-protocol|우선순위 상한 프로토콜]]을 정한다.[@osek-os-2-2-3-2005] OSEK/VDX의 구성 언어 [[osek-implementation-language|OIL]]은 `RESOURCE`를 시스템 객체의 하나로 둔다.[@osek-oil-2-5-2004]

## Ceiling priority

OSEK/VDX OS 2.2.3 명세는 resource마다의 ceiling priority를 실행 중에 바꾸지 않고, 시스템을 생성하는 단계에서 미리 고정해 둔다. 그 값은 resource를 쓰는 태스크 가운데 우선순위가 가장 높은 태스크 이상이면서, resource를 쓰지 않는 태스크 가운데 그보다 우선순위가 높은 태스크 모두보다 낮게 정한다. 또 resource를 얻는 순간 태스크의 우선순위를 ceiling priority까지 올리고(이미 그 이상이면 그대로 둔다), 돌려주는 순간 얻기 전 값으로 내리도록 정한다.[@osek-os-2-2-3-2005] 자원을 잡는 즉시 우선순위를 올리는 이 규칙의 일반형은 [[priority-ceiling-protocol#자원을 잡는 즉시 올리는 방식|우선순위 상한 프로토콜]]에서 다룬다.

그 결과 resource를 쥔 태스크가 실행되는 동안, 같은 resource를 쓰는 태스크는 우선순위가 그보다 높지 않아 실행을 시작하지 못하고 resource가 풀리기를 기다린다. 그 resource를 쓰지 않고 우선순위가 ceiling priority보다 높은 태스크와, 그 resource를 쓰지 않는 인터럽트는 그동안에도 실행된다.[@osek-os-2-2-3-2005]

![[diagrams/osek-ceiling-priority-levels.svg]]

OSEK/VDX OS 2.2.3 명세는 OSEK OS를 단일 프로세서 운영체제로 정한다.[@osek-os-2-2-3-2005] AUTOSAR R25-11 OS 명세는 resource를 같은 코어에 묶인 태스크 사이에서만 쓰게 하고, 서로 다른 코어의 태스크 사이 상호 배제에는 [[spinlock|스핀락]]을 둔다.[@autosar-cp-sws-os-2025]

## 사용 규칙

OSEK/VDX OS 2.2.3 명세는 resource를 쓰는 규칙을 아래처럼 정한다.[@osek-os-2-2-3-2005]

- 쥐고 있는 resource를 또 얻는 중첩 접근은 금지된다.
- 여러 resource를 쥘 때는 나중에 얻은 것부터 먼저 돌려준다(LIFO, Last In, First Out).
- resource를 쥔 채 `TerminateTask`, `ChainTask`, `Schedule`, `WaitEvent`를 부를 수 없고, [[osek-isr|ISR]]도 resource를 쥔 채 끝날 수 없다.
- extended status에서 `GetResource`는 어떤 태스크나 ISR이 이미 쥔 resource를 얻으려 하거나, 부른 쪽의 정적 우선순위가 ceiling priority보다 높으면 E_OS_ACCESS를 돌려준다. `ReleaseResource`는 어느 태스크나 ISR도 쥐지 않은 resource를 돌려주려 하거나, 다른 resource를 먼저 돌려줘야 하면 E_OS_NOFUNC를 돌려준다.[@osek-os-2-2-3-2005]

## 인터럽트 수준으로 넓히기

OSEK/VDX OS 2.2.3 명세는 resource 관리를 인터럽트 수준까지 넓히는 것을 선택 사항으로 두고, [[osek-isr#Category 2|category 2 ISR]]에서도 `GetResource`와 `ReleaseResource`를 부를 수 있게 한다. 이 확장에서 ISR은 모든 태스크보다 높은 가상 우선순위를 받으므로, ceiling priority는 그 resource를 쓰는 태스크와 ISR의 우선순위 가운데 가장 높은 것 이상이 된다.[@osek-os-2-2-3-2005]

## `RES_SCHEDULER`

OSEK/VDX OS 2.2.3 명세는 스케줄러를 모든 태스크가 쓸 수 있는 resource로 다루며, `RES_SCHEDULER`라는 resource를 미리 만들어 두게 한다. 태스크는 `RES_SCHEDULER`를 얻어 다른 태스크의 선점을 막을 수 있고, 인터럽트는 `RES_SCHEDULER`의 상태와 상관없이 받아 처리된다.[@osek-os-2-2-3-2005]

## Internal resource

OSEK/VDX OS 2.2.3 명세는 사용자에게 보이지 않아 `GetResource`와 `ReleaseResource`로 다룰 수 없는 resource를 **internal resource**로 정의하고, 그 밖의 동작(우선순위 상한 프로토콜 등)은 일반 resource와 같게 둔다. 또 internal resource를 태스크에만 쓰게 하고, 시스템 생성 때 태스크 하나에 많아야 하나를 배정하게 한다.[@osek-os-2-2-3-2005] OIL은 `RESOURCEPROPERTY` 값으로 `STANDARD`, `LINKED`, `INTERNAL`을 두고, `INTERNAL`을 애플리케이션이 접근할 수 없는 internal resource로 정한다.[@osek-oil-2-5-2004]

명세에 따라 운영체제는 태스크가 실행을 시작할 때 internal resource를 그 태스크에 쥐여 주고, 태스크가 재스케줄링 지점에 이르면 거둬들인다. 재스케줄링 지점은 `TerminateTask`, `ChainTask`, `Schedule`을 부를 때와 `WaitEvent`로 waiting 상태가 될 때다. 태스크가 선점될 때는 풀리지 않는다. 그래서 같은 internal resource를 배정받은 태스크 묶음은 묶음 안에서 비선점 태스크처럼 동작한다. 재스케줄링은 재스케줄링 지점에서만 일어나고, 묶음의 가장 높은 우선순위보다 높은 태스크에는 선점된다. 이를 써서 태스크 묶음 안의 원치 않는 재스케줄링을 막을 수 있다.[@osek-os-2-2-3-2005]
