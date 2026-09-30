---
title: OSEK OS
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK OS**는 [[osek-vdx|OSEK/VDX]]가 정한 차량용 실시간 운영체제다. 멀티태스킹 운영체제이며, 분산된 임베디드 제어 유닛에서 쓰는 단일 프로세서 운영체제다.[@osek-os-2-2-3-2005][@iso-17356-3-2005] 운영체제 객체는 모두 시스템 생성 단계에서 정적으로 정하며, 실행 중에 객체를 만들거나 없애는 서비스는 없다.[@osek-os-2-2-3-2005] 국제 표준으로는 [[iso-17356-3|ISO 17356-3]]이다.[@iso-17356-3-2005]

## OS 객체

사용자는 어떤 객체를 몇 개 쓰고 각각 어떤 속성을 갖는지 미리 정해 [[osek-implementation-language|OIL]]로 적어 둔다.[@osek-os-2-2-3-2005][@osek-oil-2-5-2004] OIL 명세가 예로 드는 개발 과정에서는 System Generator가 OIL 구성 파일로 C 코드를 만든다.[@osek-oil-2-5-2004]

OSEK OS의 객체와 그것을 적는 OIL 객체는 다음과 같다.[@osek-os-2-2-3-2005][@osek-oil-2-5-2004]

| 객체                   | OIL 객체   | 하는 일                                                                                                   |
| ---------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| [[osek-task\|태스크]]  | `TASK`     | 함수 실행의 틀. 스케줄러가 태스크의 실행 순서를 정한다.                                                   |
| [[osek-isr\|ISR]]      | `ISR`      | 인터럽트를 처리한다.                                                                                      |
| [[osek-event\|이벤트]] | `EVENT`    | 태스크를 동기화한다. extended 태스크에만 딸린다.                                                          |
| resource               | `RESOURCE` | 공유 자원에 여러 태스크가 함께 접근할 때 그 접근을 조정한다. ISR까지 넓힐 수 있다.                        |
| [[osek-alarm\|카운터]] | `COUNTER`  | 타이머나 각도 센서처럼 반복되는 사건을 틱 단위의 값으로 센다.                                             |
| [[osek-alarm\|알람]]   | `ALARM`    | 카운터가 정해 둔 값에 이르면 만료되어 태스크를 활성화하거나, 이벤트를 설정하거나, callback 루틴을 부른다. |

운영체제가 부르고 사용자가 구현하는 [[osek-hook-routine|hook 루틴]]도 있다.[@osek-os-2-2-3-2005]

## 처리 레벨

OSEK OS는 처리 레벨 셋을 두고, 위 레벨이 아래 레벨보다 우선순위가 높다.[@osek-os-2-2-3-2005]

- 인터럽트 레벨: 하나 이상의 인터럽트 우선순위 레벨로 이루어지며, ISR마다 인터럽트 우선순위 레벨이 정적으로 정해진다.
- 스케줄러의 논리 레벨: 인터럽트 레벨 아래, 태스크 레벨 위에 놓인 논리적 개념이다. 우선순위를 직접 쓰지 않고도 구현할 수 있다.
- 태스크 레벨: 태스크가 사용자가 정한 우선순위에 따라 스케줄링된다.[@osek-os-2-2-3-2005]

![[diagrams/osek-os-processing-levels.svg]]

인터럽트는 태스크보다 앞선다. 선점할 수 없는 태스크도 인터럽트에는 끊긴다.[@osek-os-2-2-3-2005]

## Conformance class

**Conformance class**는 애플리케이션의 요구와 시스템의 능력에 따라 운영체제 기능을 묶은 등급이며, 실행 중에 바꿀 수 없다. 구현은 등급 가운데 일부만 지원해도 되지만, 지원하는 등급은 그 등급 전체를 갖추어야 한다. 등급은 넷이며, 태스크 활성화를 여러 번 요청할 수 있는지, 태스크 종류, 우선순위당 태스크 수로 가른다.[@osek-os-2-2-3-2005]

OSEK OS 명세는 등급마다 구현이 적어도 갖춰야 할 개수를 정한다. 애플리케이션이 이를 넘지 않아야 이식성을 기대할 수 있다. 등급마다의 정의와 최소 개수는 다음과 같다.[@osek-os-2-2-3-2005]

| 등급 | 태스크 종류     | 활성화를 여러 번 요청 | 한 우선순위에 태스크 여럿 | 태스크 우선순위 수 | suspended가 아닌 태스크 수 | 태스크당 이벤트 수 |
| ---- | --------------- | --------------------- | ------------------------- | ------------------ | -------------------------- | ------------------ |
| BCC1 | basic           | 안 됨                 | 안 됨                     | 8                  | 8                          | —                  |
| BCC2 | basic           | 됨                    | 됨                        | 8                  | 8                          | —                  |
| ECC1 | basic, extended | 안 됨                 | 안 됨                     | 16                 | 16                         | 8                  |
| ECC2 | basic, extended | basic 태스크만 됨     | 됨                        | 16                 | 16                         | 8                  |

resource는 BCC1이 `RES_SCHEDULER` 하나만, 나머지 등급은 `RES_SCHEDULER`를 포함해 8개를 적어도 지원한다. internal resource는 2개, 알람과 application mode는 1개를 모든 등급이 적어도 지원한다.[@osek-os-2-2-3-2005]

## 시작과 종료

CPU가 리셋되면 하드웨어별 초기화 코드가 돈 뒤, application mode를 인자로 `StartOS`를 불러 운영체제를 시작한다. 운영체제는 내부 초기화를 마치고, 사용자 인터럽트를 모두 끈 채로 `StartupHook`을 부른다. `StartupHook`이 돌아오면 사용자 인터럽트를 켜고 스케줄링을 시작한다.[@osek-os-2-2-3-2005]

![[diagrams/osek-os-startup-sequence.svg]]

**Application mode**는 운영체제가 서로 다른 운영 모드로 시작할 수 있게 하는 것이며, 모드는 커널이 시작하기 전에 정한다. 모드마다 자동으로 시작할 태스크와 알람을 OIL 파일에서 정적으로 따로 정할 수 있다. 운영체제가 시작한 뒤에는 application mode를 바꿀 수 없다.[@osek-os-2-2-3-2005]

**Autostart**는 운영체제가 시작하면서 현재 application mode에 선언된 태스크를 활성화하고 알람을 켜는 것이며, 태스크를 먼저 활성화한 뒤 알람을 켠다.[@osek-os-2-2-3-2005]

`ShutdownOS`는 운영체제를 멈춘다. 애플리케이션이 비상 정지 같은 때 부를 수 있고, 운영체제도 치명적 오류로 정의되지 않은 내부 상태에 이르면 스스로 부른다. 운영체제는 `ShutdownHook`을 부른 뒤 멈추며, `ShutdownHook`이 돌아온 뒤의 동작은 구현이 정한다.[@osek-os-2-2-3-2005]

## Context별 서비스 호출 제한

시스템 서비스는 태스크, ISR, hook 루틴, 알람 callback 루틴에서 부르며, 서비스마다 부를 수 있는 context가 다르다. context마다 부를 수 있는 서비스는 다음과 같다.[@osek-os-2-2-3-2005]

| context                       | 부를 수 있는 서비스                                                                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 태스크                        | `StartOS`를 뺀 모든 서비스                                                                                                                                                                                                                     |
| category 1 ISR                | 인터럽트를 멈추고 되살리는 서비스 여섯                                                                                                                                                                                                         |
| category 2 ISR                | `ActivateTask`, `GetTaskID`, `GetTaskState`, 인터럽트 서비스 여섯, `GetResource`, `ReleaseResource`, `SetEvent`, `GetEvent`, `GetAlarmBase`, `GetAlarm`, `SetRelAlarm`, `SetAbsAlarm`, `CancelAlarm`, `GetActiveApplicationMode`, `ShutdownOS` |
| `ErrorHook`                   | `GetTaskID`, `GetTaskState`, `SuspendAllInterrupts`, `ResumeAllInterrupts`, `GetEvent`, `GetAlarmBase`, `GetAlarm`, `GetActiveApplicationMode`, `ShutdownOS`                                                                                   |
| `PreTaskHook`, `PostTaskHook` | `ErrorHook`에서 부를 수 있는 서비스 가운데 `ShutdownOS`를 뺀 것                                                                                                                                                                                |
| `StartupHook`                 | `GetActiveApplicationMode`, `ShutdownOS`                                                                                                                                                                                                       |
| `ShutdownHook`                | `GetActiveApplicationMode`                                                                                                                                                                                                                     |
| 알람 callback 루틴            | `SuspendAllInterrupts`, `ResumeAllInterrupts`                                                                                                                                                                                                  |

그래서 `TerminateTask`, `ChainTask`, `Schedule`, `WaitEvent`, `ClearEvent`는 태스크만 부를 수 있다. 이 다섯을 인터럽트 레벨에서 부르면 extended status에서 E_OS_CALLEVEL을 돌려준다. 표에 없는 조합의 동작은 정의되지 않는다.[@osek-os-2-2-3-2005]

## AUTOSAR OS와의 관계

OSEK OS는 단일 프로세서를 전제한다.[@osek-os-2-2-3-2005] AUTOSAR Classic Platform의 OS 명세는 OSEK OS를 바탕으로 삼아, 그것의 확장과 제한으로 AUTOSAR OS를 정한다.[@autosar-cp-sws-os-2025]
