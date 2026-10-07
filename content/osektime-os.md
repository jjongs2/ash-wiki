---
title: OSEKtime OS
tags:
  - platform/rtos
aliases:
  - OSEKtime
verified: 2026-10-07
publisher: OSEK/VDX
edition: 2001
status: 유효
---

**OSEKtime OS**는 [[osek-vdx|OSEK/VDX]]가 정한 [[cyclic-executive#Time-triggered와 event-triggered|time-triggered]] 실시간 운영체제다. 분산된 임베디드 제어 유닛에서 쓰는 단일 프로세서 운영체제이며, 차량 ECU에서 신뢰성이 아주 높아야 하는 실시간 소프트웨어의 표준 실행 환경을 목표로 한다. OSEKtime OS 1.0 명세는 이 운영체제의 개념과 API(Application Programming Interface)를 정하며, 특정 구현을 다룬 제품 설명이 아니다.[@osek-osektime-os-1-0-2001]

이 명세는 운영체제가 갖출 성질로 예측성(정해 둔 첨두 부하와 고장 조건에서도 결정적이고 미리 알려진 동작), 인증의 바탕이 될 명확한 모듈 구조, 신뢰성(고장 검출과 결함 허용), 부작용 없는 모듈 단위 개발과 통합(결합성), OSEK/VDX와의 호환을 요구한다. OSEKtime에는 결함 허용 통신 계층도 있으며, 이 계층은 FTCom(Fault-Tolerant Communication) 명세가 다룬다.[@osek-osektime-os-1-0-2001]

## 범위

이 명세는 운영체제의 전략과 기능, 서비스 호출 인터페이스, 매개변수의 뜻과 선언, 가능한 오류 코드를 모든 구현이 따라야 할 일반적 기술로 정한다. 운영체제는 정적 스케줄링을 지원하고, 인터럽트 처리, 디스패칭, 시스템 시간과 클록 동기화, 로컬 메시지 처리, 오류 검출 같은 실시간 응용의 기본 서비스를 둔다. 운영체제는 시스템 생성 때 사용자의 구성대로 만들어지며, 실행 중에는 바꿀 수 없다. 이벤트, 알람, resource는 OSEK/VDX 태스크에만 쓰고 time-triggered 태스크에는 허용되지 않으므로, 이 명세에 들지 않는다.[@osek-osektime-os-1-0-2001]

### 처리 레벨

이 명세는 처리 레벨을 인터럽트 레벨과 TT(time-triggered) 태스크 레벨 둘로 정한다. CPU를 놓고 다투는 것은 운영체제가 관리하는 ISR(Interrupt Service Routine)과 태스크이며, TT 태스크가 ISR보다 앞설 수도 있다.[@osek-osektime-os-1-0-2001]

커널에는 OSEKtime 서브시스템과 함께 OSEK/VDX OS 서브시스템 전체를 넣을 수 있다. 다만 신뢰성이 높아야 하는 응용에서는 OSEKtime 전체가 OSEK/VDX 서브시스템보다 높은 처리 레벨에 있어야만 OSEK/VDX 서브시스템을 쓸 수 있다. 이 명세는 이 모델에 충분한 인터럽트 레벨을 갖춘 마이크로컨트롤러와, 신뢰성이 높아야 하는 응용에서의 하드웨어나 소프트웨어 메모리 보호를 권한다. 이 요구가 채워져야만 OSEK/VDX 서브시스템의 태스크가 TT 태스크를 방해하지 않는다고 보장할 수 있다. OSEK/VDX 서브시스템 없이 구현할 때는 OSEKtime 서브시스템이 idle(배경) 태스크를 두어야 한다.[@osek-osektime-os-1-0-2001]

선점할 수 없는 OSEK/VDX 태스크도 둘 수 있지만, 그 태스크가 선점되지 않는 것은 다른 OSEK/VDX 태스크에 대해서뿐이다. 디스패처 테이블에 따라 TT 태스크를 활성화하는 OSEKtime 디스패처는 모든 TT 태스크의 타이밍을 결정적으로 지키려고 선점할 수 없는 OSEK/VDX 태스크도 선점한다. TT 태스크와 OSEK/VDX 태스크는 resource를 함께 쓰지 않고, 둘 사이의 통신은 로컬 메시지 처리로 한다.[@osek-osektime-os-1-0-2001]

### 태스크와 디스패처

TT 태스크는 진입점에서 출구점까지 차례로 실행된다. 내부 루프는 둘 수 있지만 [[worst-case-execution-time|최악 실행 시간]]을 정할 수 있어야 하고, 외부 사건을 기다리는 블로킹은 지원하지 않는다. 태스크 실행의 시작은 활성화 사건에 묶이며, time-triggered 애플리케이션에서 활성화 사건은 디스패처 테이블에서만 온다.[@osek-osektime-os-1-0-2001]

TT 태스크의 상태는 셋뿐이다.[@osek-osektime-os-1-0-2001]

- running: CPU를 받아 명령을 실행하는 상태다. 어느 때든 하나의 태스크만 이 상태에 있다.
- preempted: 명령이 실행되지 않는 상태다. running에서만 들어오고 running으로만 나간다. 디스패처가 다른 태스크를 suspended에서 running으로 바꿀 때 들어오고, 자기를 선점한 태스크가 suspended로 바뀔 때 나간다.
- suspended: 활성화될 수 있는 수동 상태다.[@osek-osektime-os-1-0-2001]

디스패처는 디스패처 틱에 따라 suspended 태스크를 running으로 바꾸고(activate), 그때 돌던 태스크는 preempted가 된다(preempt). 마지막으로 선점된 태스크가 다시 running이 되고(resume), running 태스크는 실행을 마치면 스스로 suspended로 간다(terminate).[@osek-osektime-os-1-0-2001]

![[diagrams/osektime-tt-task-states.svg]]

활성화는 OSEKtime 디스패처 틱(TT 인터럽트)에 따라 OSEKtime 디스패처가 하며, 디스패처를 부르는 사건은 오프라인에서 만든 디스패처 테이블에 정해 둔다. 한 디스패처 라운드 안에서 같은 태스크를 여러 번 활성화할 수 있지만, 태스크가 자기 자신을 선점할 수는 없다.[@osek-osektime-os-1-0-2001]

OSEKtime OS는 선점 스케줄링에 바탕을 두고 정적 스케줄링을 지원한다. 외부 스케줄링 도구가 오프셋, 최악 실행 시간, 마감 시한 같은 태스크의 타이밍 특성으로 디스패처 테이블을 만들고, 디스패처는 테이블에 저장된 엄격한 순서대로 태스크를 활성화한다. 디스패처 테이블을 한 번 다 실행하는 것을 **디스패처 라운드**라 한다. idle 태스크를 뺀 어떤 태스크도 한 디스패처 라운드의 끝과 다음 라운드의 시작에 걸쳐 돌 수 없다.[@osek-osektime-os-1-0-2001]

디스패처 테이블은 주기적으로 되풀이 실행되어 태스크를 주기적으로 실행한다. 디스패처는 인터럽트로 시작되며, 그 인터럽트 소스는 로컬 논리 시간이다. 로컬 논리 시간은 전역 시간이 있으면 전역 시간에 동기화된다.[@osek-osektime-os-1-0-2001]

TT 태스크에는 사용자가 정하는 정적 우선순위가 없다. 디스패처가 새 TT 태스크를 활성화할 때 다른 TT 태스크가 돌고 있으면 그 태스크는 늘 선점되어, 새 태스크가 끝날 때까지 preempted에 머문다. 이 스케줄링 방식을 **stack-based 스케줄링**이라 하며, 오프라인 스케줄링 도구는 모든 마감 시한을 지키고 스택 넘침이 일어나지 않도록 디스패처 테이블을 만들어야 한다. 도는 TT 태스크가 없으면 OSEK/VDX OS의 태스크가 실행된다.[@osek-osektime-os-1-0-2001]

![[diagrams/osektime-stack-based-scheduling.svg]]

TT 태스크는 마감 시한 전에 스스로 끝나야 한다.[@osek-osektime-os-1-0-2001]

### 마감 시한 감시

마감 시한 위반은 태스크마다 실행 중에 검사해야 한다. 검사는 디스패처가 디스패처 테이블의 "Deadline Monitoring" 항목에서 한다. 검사 방식은 둘이며, 태스크마다 사용자가 고른다.[@osek-osektime-os-1-0-2001]

- stringent: 마감 시한이 지나는 바로 그 시점에 항목을 둔다.
- non-stringent: 마감 시한이 지난 뒤 적당한 시점에, 늦어도 그 디스패처 라운드가 끝나기 전에 항목을 둔다. 성능을 위해 새 태스크를 활성화하는 항목과 묶을 수 있다.[@osek-osektime-os-1-0-2001]

위반을 찾으면 디스패처는 사용자가 짠 `ttErrorHook`을 오류 코드 TT_E_OS_DEADLINE으로 부른다. `ttErrorHook`이 끝나면 운영체제가 `ttShutdownOS`를 불러 종료하면서 `ttShutdownHook`을 부른다. `ttShutdownHook`이 돌아오면 운영체제는 처음 `ttStartOS`를 부른 곳의 다음 명령으로 넘어간다.[@osek-osektime-os-1-0-2001]

### `ttIdleTask`

OSEKtime 디스패처가 처음 시작하는 태스크는 늘 이름이 정해진 `ttIdleTask`이며, OSEKtime OS의 idle 태스크 구실을 한다. `ttIdleTask`는 디스패처 라운드에 등록되지 않아 주기적으로 다시 시작되지 않고, OSEKtime이 다루는 모든 인터럽트에 끊길 수 있으며, 마감 시한이 없다. 가장 먼저 시작되므로 ready인 다른 태스크가 없으면 늘 돌고, 돌아오지 않는다. 기본 `ttIdleTask`는 OSEKtime OS와 함께 제공되어야 하며, 사용자는 이 제약을 지키는 자기 태스크로 바꿀 수 있다.[@osek-osektime-os-1-0-2001]

### Application mode

이 명세는 application mode를 디스패처 테이블 하나로 정하고, 모든 디스패처 라운드의 길이를 같게 둔다. 예로 초기화, 정상 운전, 종료가 있다. 운영체제는 `ttStartOS`에 application mode를 넘겨 시작한다. `ttSwitchAppMode`는 실행 중에 동기화를 잃지 않고 다른 디스패처 테이블로 바꾼다. 실제 전환은 현재 디스패처 라운드가 끝날 때 일어나며, 디스패처 라운드의 길이는 바뀌지 않는다.[@osek-osektime-os-1-0-2001]

### 인터럽트

이 명세는 인터럽트마다 많아야 한 번 일어날 수 있는 시간 구간을 정하는 수단을 운영체제에 두고, 운영체제가 실행 중에 이를 강제하도록 요구한다. 인터럽트는 처리될 때 꺼지고, 다시 켜는 것은 오프라인에서 정해 디스패처 테이블이 제어하는 시점에 한다. 프로세서나 다른 장치가 지원하면 다른 인터럽트 제어 수단도 쓸 수 있다.[@osek-osektime-os-1-0-2001]

마스크할 수 없는 인터럽트는 OSEKtime OS의 디스패치 인터럽트를 늦출 수 있으므로 조심해서 써야 한다. 애플리케이션은 실행 중에 인터럽트를 켜거나 끄지 않아야 하며, 운영체제는 구성에서 ISR이 정해진 인터럽트를 모두 켜고 나머지는 모두 끈다.[@osek-osektime-os-1-0-2001]

### 시간 동기화

ECU는 저마다 로컬 클록에 따라 늘어나는 로컬 시간으로 동작한다. 동기화 계층이 전역 시간을 주면, 시스템이 시작할 때와 전역 시간과의 동기를 잃은 뒤에 동기화하고, 정상 동작 중에는 디스패처 테이블이 끝날 때마다처럼 되풀이해 맞춘다.[@osek-osektime-os-1-0-2001]

전역 시간은 디스패처 라운드마다 그 시작을 아는 동기화 계층이 주며, 이 계층은 대개 FTCom이 맡는다. 동기화 계층은 `ttSyncTimes`로 현재 전역 시간과 현재 디스패처 라운드가 시작할 때의 전역 시간을 운영체제에 넘긴다. 애플리케이션은 `ttGetOSSyncStatus`로 로컬 시간이 전역 시간과 동기됐는지 알 수 있다.[@osek-osektime-os-1-0-2001]

시스템이 시작할 때와 동기를 잃은 뒤에는 세 가지로 시작할 수 있다.[@osek-osektime-os-1-0-2001]

- 동기 시작: 전역 시간이 생기기 전에는 TT 태스크를 실행하지 않는다.
- 비동기 시작(hard 동기화): 전역 시간과의 동기화를 기다리지 않고 로컬 시간에 따라 TT 태스크를 실행한다. 디스패처 라운드가 끝날 때 다음 라운드의 시작을 늦춰 로컬 시간을 전역 시간에 맞춘다.
- 비동기 시작(smooth 동기화): 마찬가지로 로컬 시간에 따라 실행하되, 다음 라운드 시작을 늦추는 양을 미리 정한 구성 값으로 제한해 여러 디스패처 라운드에 걸쳐 맞춘다. 늦추는 양이 그 한도를 넘지 않는 동안 동기된 것으로 본다.[@osek-osektime-os-1-0-2001]

![[diagrams/osektime-startup-synchronization.svg]]

동기를 잃어도 운영체제가 애플리케이션에 따로 알리지 않으며, 애플리케이션은 `ttGetOSSyncStatus`로 이를 알아낸다.[@osek-osektime-os-1-0-2001]

### OSEK OS와 함께 쓰기

이 명세는 OSEK OS 서브시스템이 OSEKtime 시스템을 방해하지 않을 때 두 시스템을 결합할 수 있게 한다. OSEKtime 전체가 OSEK OS보다 우선하며, OSEK OS의 태스크와 ISR은 OSEKtime의 태스크와 ISR을 늦추면 안 된다. OSEK OS의 인터럽트 금지 기능은 OSEK OS 안에서만 작용해 OSEKtime이 쓰는 인터럽트에 영향을 주지 않아야 한다. 이런 시스템에서는 `ttIdleTask`를 쓰지 않고, OSEK OS 서브시스템이 OSEKtime의 idle 시간에 돈다. OSEKtime은 `ttGetOSEKOSState`로 OSEK OS 서브시스템의 상태를 알 수 있다.[@osek-osektime-os-1-0-2001]

![[diagrams/osektime-osek-os-processing-levels.svg]]

결합 시스템은 `ttStartOS`로 시작하며, 이 호출이 OSEK OS의 시작도 일으킨다. OSEKtime이 정해 둔 시작 시간 안에 먼저 시작해야 하고, OSEK OS의 시작이 실패하더라도 이 시간을 한없이 늦추면 안 된다. OSEK OS의 태스크와 ISR은 OSEKtime만 있는 시스템이라면 `ttIdleTask`가 돌기 시작했을 시점보다 먼저 활성화되지 않는다.[@osek-osektime-os-1-0-2001] [[osek-os|OSEK/VDX OS]] 2.2.3 명세는 이때 OSEKtime의 초기화가 늘 먼저 돌고, OSEKtime이 idle 루프에 들어가면 자기에게 넘어온 application mode로 `StartOS`를 자동으로 부르도록 정한다.[@osek-os-2-2-3-2005]

OSEKtime OS 1.0 명세는 종료를 두 가지로 정한다.[@osek-osektime-os-1-0-2001]

- 로컬 종료: OSEK OS 서브시스템에서 `ShutdownOS`를 불러 OSEK OS만 멈추고, OSEKtime 시스템에는 영향을 주지 않는다. 이때 불리는 `ShutdownHook`은 돌아와야 하며, OSEKtime은 `ttGetOSEKOSState`로 로컬 종료를 알 수 있다.
- 전역 종료: OSEKtime 시스템이나 OSEK OS 서브시스템에서 `ttShutdownOS`를 불러 두 운영체제를 곧바로 멈춘다. `ttShutdownHook`을 부르고, OSEKtime의 종료 시간을 보장하려고 OSEK OS의 `ShutdownHook`은 부르지 않는다.[@osek-osektime-os-1-0-2001]

이 명세는 OSEK OS가 전역 종료를 일으키지 못하게 하는 구성 선택을 두기를 권한다.[@osek-osektime-os-1-0-2001] OSEK/VDX OS 2.2.3 명세는 이런 시스템에서 OSEKtime이 다루는 입출력 장치를 `ShutdownHook`에서 리셋하지 않게 한다.[@osek-os-2-2-3-2005]

### 오류 처리와 이름

OSEKtime OS 1.0 명세는 오류 처리를 OSEK/VDX와 같게 둔다. 이름이 부딪히지 않도록 구성 요소, 데이터 타입, 시스템 서비스의 이름에는 `tt`, 오류 코드에는 `TT_E_OS_`, 상수에는 `TT` 접두를 붙인다. hook 루틴은 모두 필수다.[@osek-osektime-os-1-0-2001]

[[osek-vdx#명세|OSEK/VDX Binding 1.4.2 명세]]는 오류 코드 값 96\~127을 OSEKtime OS에 배정한다.[@osek-binding-1-4-2-2004]

## 개정 이력

- 2001년 7월 24일: 1.0. OSEKtime OS 명세의 이력 표에 실린 판은 이것뿐이다.[@osek-osektime-os-1-0-2001]
- OSEK/VDX Binding 명세는 1.3(2001년)에서 binding에 OSEKtime을 더했고, Binding 1.4.2는 명세 묶음 SB3부터 SB6까지에 모두 OSEKtime OS 1.0을 넣는다.[@osek-binding-1-4-2-2004]
- 2012년 1월 OSEK/VDX 포털의 명세 목록에 올라 있던 OSEKtime OS 파일도 1.0판(`ttos10.pdf`)이다.[@osek-vdx-portal-specs-2012]
