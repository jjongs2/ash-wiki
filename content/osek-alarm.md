---
title: OSEK 알람
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK 알람**은 [[osek-os|OSEK OS]]에서 counter가 미리 정한 값에 이르면 만료되어 정해 둔 동작을 하는 객체다. 만료될 때 할 동작은 정적으로 정한다. 알람은 [[osek-implementation-language#System Generator와 빌드|시스템 생성]] 때 counter 하나에 정적으로 배정되며, 한 counter에 알람을 여럿 붙일 수 있다.[@osek-os-2-2-3-2005]

## Counter

타이머 인터럽트나 축의 엔코더처럼 반복되는 사건은 구현이 제공하는 counter에 등록된다. **counter**는 틱 단위로 잰 counter 값과 counter별 상수로 나타낸다. counter를 직접 다루는 표준 API는 없다. OSEK/VDX OS 2.0 명세는 1.0 명세에 있던, 애플리케이션이 counter에 접근하는 API를 하드웨어에 크게 기대는 기능이라는 이유로 없앴다. 운영체제는 타이머를 바탕으로 한 counter를 적어도 하나 제공하며, 그 타이머는 하드웨어일 수도 소프트웨어일 수도 있다.[@osek-os-2-2-3-2005]

counter마다 아래 상수를 둔다.[@osek-os-2-2-3-2005][@osek-oil-2-5-2004]

- `MAXALLOWEDVALUE`: counter 값으로 허용되는 최댓값(틱 단위)
- `TICKSPERBASE`: counter별 단위 하나에 이르는 데 드는 틱 수. 해석은 구현이 정한다.
- `MINCYCLE`: 그 counter에 딸린 주기 알람의 주기로 허용되는 가장 작은 틱 수.[@osek-os-2-2-3-2005][@osek-oil-2-5-2004] 이 값은 [[osek-hook-routine#Standard status와 extended status|extended status]] 시스템에서만 쓰인다.[@osek-os-2-2-3-2005]

counter마다 `GetAlarmBase`로 읽는 값을 상수 `OSMAXALLOWEDVALUE_x`, `OSTICKSPERBASE_x`, `OSMINCYCLE_x`(`x`는 counter 이름)로도 제공하므로, counter 이름을 알면 `GetAlarmBase`를 부르지 않아도 된다. 시간 counter인 시스템 counter의 상수는 `OSMAXALLOWEDVALUE`, `OSTICKSPERBASE`, `OSMINCYCLE`로도 읽는다. `OSTICKDURATION`은 시스템 counter의 틱 하나의 길이를 나노초로 준다.[@osek-os-2-2-3-2005]

Freescale Semiconductor의 OSEK OS 구현인 OSEKturbo OS/ARM7에서는 counter 값이 `MAXALLOWEDVALUE`에 이르면 0부터 다시 센다.[@freescale-osekturbo-arm7-tr-2002]

## 만료 동작

알람이 만료되면 아래 가운데 정해 둔 동작 하나를 한다. 알람 하나에는 동작을 하나만 정할 수 있다.[@osek-oil-2-5-2004]

- [[osek-task|태스크]]를 활성화한다.
- 태스크의 [[osek-event|이벤트]]를 설정한다.
- 알람 callback 루틴을 부른다.[@osek-os-2-2-3-2005][@osek-oil-2-5-2004]

![[diagrams/osek-alarm-counter-actions.svg]]

알람 callback 루틴은 애플리케이션이 제공하는 짧은 함수다. 그 안에서 부를 수 있는 시스템 서비스는 인터럽트를 막았다가 되살리는 `SuspendAllInterrupts`와 `ResumeAllInterrupts`뿐이다. 알람 callback 루틴은 [[osek-isr#Category 2|category 2]] 인터럽트를 막은 채 돈다. 인자도 반환값도 없으며, `ALARMCALLBACK(name)` 꼴로 정의한다. 알람 callback 루틴이 도는 처리 레벨은 구현에 따라 스케줄러의 레벨이거나 [[osek-isr|ISR]]의 레벨이다.[@osek-os-2-2-3-2005]

실행 중에 정하는 것은 알람이 만료될 counter 값과 주기 알람의 주기뿐이다.[@osek-os-2-2-3-2005]

## 한 번과 주기

알람은 한 번만 만료되는 단일 알람으로도, 주기적으로 만료되는 주기 알람으로도 정할 수 있다. `SetRelAlarm`은 지정한 틱 수가 지난 뒤에, `SetAbsAlarm`은 counter가 지정한 절댓값에 이르면 알람이 처음 만료되게 한다. 두 서비스 모두 주기를 받는다. 주기가 0이면 단일 알람이고, 0이 아니면 만료 직후 그 주기만큼 뒤로 다시 걸린다.[@osek-os-2-2-3-2005]

![[diagrams/osek-alarm-single-cyclic.svg]]

`SetAbsAlarm`에 준 절댓값을 호출 전에 이미 지났으면, counter가 넘친 뒤 그 값에 다시 이를 때 알람이 만료된다.[@osek-os-2-2-3-2005]

이미 쓰이고 있는 알람에 `SetRelAlarm`이나 `SetAbsAlarm`을 부르면 그 호출은 무시되고 E_OS_STATE를 돌려준다. 그래서 쓰이고 있는 알람의 값을 바꾸려면 먼저 취소해야 한다. `SetRelAlarm`의 increment가 0일 때의 동작은 구현이 정한다. increment가 아주 작으면 서비스가 돌아오기 전에 알람이 만료될 수 있다.[@osek-os-2-2-3-2005]

`CancelAlarm`은 알람을 취소한다. `GetAlarm`은 만료까지 남은 틱 수를 돌려주고, `GetAlarmBase`는 알람이 딸린 counter의 상수를 읽는다.[@osek-os-2-2-3-2005]

## Autostart

시스템 생성 때 알람을 autostart로 정해 두면, `StartOS`가 현재 [[osek-os#시작과 종료|application mode]]의 autostart 알람을 켠다. autostart 알람의 값은 모두 상대값이다.[@osek-os-2-2-3-2005] [[osek-implementation-language|OIL]]에서는 `ALARM` 객체의 `AUTOSTART` 속성으로 정하며, 처음 만료 시각(`ALARMTIME`), 주기(`CYCLETIME`), application mode(`APPMODE`)를 함께 준다.[@osek-oil-2-5-2004]
