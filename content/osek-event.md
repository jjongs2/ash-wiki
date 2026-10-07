---
title: OSEK 이벤트
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK 이벤트**는 [[osek-os|OSEK OS]]에서 태스크를 동기화하는 수단이다. 이벤트는 독립된 객체가 아니라 extended [[osek-task|태스크]]에 딸리며, 그 태스크만 자기 이벤트를 기다릴 수 있다.[@osek-os-2-2-3-2005] 다른 [[rtos|RTOS]]의 이벤트 플래그는 [[event-flags|이벤트 플래그]]에서 다룬다.

## 소유와 설정

이벤트를 가진 extended 태스크를 그 이벤트의 **소유자**라 한다. extended 태스크마다 정해진 수의 이벤트가 있고, 이벤트 하나는 소유 태스크와 이름(또는 마스크)으로 가린다. 시스템 서비스는 이벤트를 비트로 다루며 이벤트 마스크를 인자로 받는다.[@osek-os-2-2-3-2005]

어느 태스크든, 그리고 [[osek-isr#Category 2|category 2 ISR]]도 `SetEvent`로 suspended가 아닌 extended 태스크의 이벤트를 설정할 수 있다. 설정하는 쪽은 basic 태스크여도 된다. 이벤트를 지우는 `ClearEvent`와 기다리는 `WaitEvent`는 소유 태스크만 부를 수 있다. `GetEvent`는 extended 태스크의 모든 이벤트 비트의 현재 상태를 돌려준다. `SetEvent`는 마스크에 없는 이벤트를 바꾸지 않으며, hook 루틴에서는 부를 수 없다.[@osek-os-2-2-3-2005]

![[diagrams/osek-event-set-wait.svg]]

extended status에서는 extended 태스크가 아닌 태스크가 `WaitEvent`나 `ClearEvent`를 부르면 E_OS_ACCESS를 돌려주고, suspended 상태의 태스크에 `SetEvent`를 부르면 E_OS_STATE를 돌려준다. extended 태스크가 아닌 태스크에 `SetEvent`를 부르면 E_OS_ACCESS를, suspended 상태의 태스크에 `GetEvent`를 부르면 E_OS_STATE를 돌려준다.[@osek-os-2-2-3-2005] extended status는 [[osek-hook-routine#Standard status와 extended status|OSEK hook 루틴]]에서 다룬다.

OSEK/VDX [[osek-implementation-language|OIL]] 2.5 명세는 `EVENT` 객체를 마스크로 나타내고, 이벤트 이름을 그 마스크의 다른 이름으로 둔다. 이름이 같은 이벤트는 같은 이벤트라 마스크도 같지만, 마스크가 같다고 같은 이벤트는 아니다. `MASK` 속성은 UINT64 정수이거나 `AUTO`이며, `AUTO`면 그 이벤트를 참조하는 태스크들 사이에서 겹치지 않는 비트 하나가 자동으로 배정된다.[@osek-oil-2-5-2004]

## 기다림과 깨어남

OSEK/VDX OS 2.2.3 명세는 `WaitEvent`를 부른 태스크가 마스크에 지정한 이벤트 가운데 하나라도 설정될 때까지 waiting 상태로 머물게 한다. 기다리던 이벤트 가운데 하나가 설정되면 태스크는 waiting에서 ready로 옮긴다. `WaitEvent`로 재스케줄링이 일어나면, 태스크가 waiting에 있는 동안 그 태스크의 [[osek-resource#Internal resource|internal resource]]가 풀린다.[@osek-os-2-2-3-2005]

비선점 스케줄링에서는 이벤트를 설정한 직후에 재스케줄링이 일어나지 않는다. 기다리던 태스크의 우선순위가 더 높아도, 이벤트를 설정한 태스크는 다음 재스케줄링 지점까지 계속 돈다.[@osek-os-2-2-3-2005]

`WaitEvent`를 부를 때 지정한 이벤트 가운데 하나가 이미 설정되어 있으면, 기다릴 필요가 없으므로 태스크는 그대로 실행을 이어 가고, 재스케줄링도 없다. 설정된 이벤트는 태스크가 깨어난 뒤에도 저절로 지워지지 않고, 이벤트를 지울 수 있는 것은 소유 태스크뿐이다. 그래서 같은 이벤트를 다시 기다리려면 먼저 `ClearEvent`로 지워야 한다.[@osek-os-2-2-3-2005]

extended 태스크가 suspended에서 ready로 활성화되면, 운영체제가 그 태스크의 이벤트를 모두 지운다.[@osek-os-2-2-3-2005]

이벤트를 받는 쪽은 언제나 extended 태스크다. 그래서 ISR과 basic 태스크는 이벤트를 기다릴 수 없다. basic 태스크에는 waiting 상태가 없다.[@osek-os-2-2-3-2005]

## 알람과 이벤트

[[osek-alarm|알람]]이 만료될 때 태스크를 활성화하는 대신 정해 둔 태스크의 이벤트를 설정하게 할 수 있다. 이렇게 설정된 이벤트는 보통의 이벤트 설정과 같은 성질을 가진다.[@osek-os-2-2-3-2005]
