---
title: AUTOSAR OS
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR OS**는 [[autosar-classic-platform|AUTOSAR Classic Platform]]의 운영체제다. [[osek-os|OSEK OS]]를 바탕으로 삼아 그것을 확장하고 일부를 제한하는 것으로 정의되며, OSEK OS의 API와 하위 호환되는 API를 제공한다. OSEK OS 기능에 더해 counter API, [[autosar-schedule-table|schedule table]], stack monitoring, [[autosar-os-application#Memory protection|memory protection]], [[autosar-timing-protection|timing protection]], service protection 등을 둔다.[@autosar-cp-sws-os-2025]

## Scalability class

AUTOSAR OS는 기능을 SC1부터 SC4까지 네 scalability class로 묶고, OS마다 애플리케이션의 필요에 맞춰 하나를 고른다. 기능마다 드는 등급은 다음과 같다.[@autosar-cp-sws-os-2025]

| 기능                                                                | SC1 | SC2 | SC3 | SC4 |
| ------------------------------------------------------------------- | --- | --- | --- | --- |
| OSEK OS 기능(모든 [[osek-os#Conformance class\|conformance class]]) | 예  | 예  | 예  | 예  |
| counter API                                                         | 예  | 예  | 예  | 예  |
| 소프트웨어 free-running timer API                                   | 예  | 예  | 예  | 예  |
| schedule table                                                      | 예  | 예  | 예  | 예  |
| stack monitoring                                                    | 예  | 예  | 예  | 예  |
| protection hook                                                     | —   | 예  | 예  | 예  |
| timing protection                                                   | —   | 예  | —   | 예  |
| 전역 시간·동기화 지원                                               | —   | 예  | —   | 예  |
| memory protection                                                   | —   | —   | 예  | 예  |
| OS-Application                                                      | —   | —   | 예  | 예  |
| service protection                                                  | —   | —   | 예  | 예  |
| `CallTrustedFunction`                                               | —   | —   | 예  | 예  |

SC2와 SC3은 서로를 포함하지 않는다. SC2는 SC1에 timing protection을, SC3은 SC1에 memory protection을 더한 갈래이며, SC4는 두 갈래를 아우른다.[@autosar-cp-sws-os-2025][@autosar-cp-rs-os-2025]

![[diagrams/autosar-os-scalability-classes.svg]]

멀티코어 시스템에도 scalability class가 적용되며, 멀티코어에서는 SC1과 SC2에서도 OS-Application을 지원한다. 서로 다른 코어의 [[osek-task|태스크]] 사이의 상호 배제에는 [[spinlock|스핀락]]을 쓴다.[@autosar-cp-sws-os-2025]

## Counter API

OSEK OS는 [[osek-alarm|counter]]를 직접 다루는 표준 API를 두지 않는다.[@osek-os-2-2-3-2005] AUTOSAR OS에서는 `IncrementCounter`가 소프트웨어 counter를 한 틱 올리고, `GetCounterValue`가 counter의 현재 틱 값을 읽으며, `GetElapsedValue`가 앞서 읽은 값 이후 흐른 틱 수를 돌려준다.[@autosar-cp-sws-os-2025]

## Stack monitoring

**Stack monitoring**은 태스크와 [[osek-isr#Category 2|category 2 ISR]]이 정해 둔 스택 사용량을 넘었는지 검사하는 기능이다. 검사는 [[context-switch|context switch]] 때 하므로, 넘침이 일어난 뒤 그것을 찾기까지 시간이 꽤 걸릴 수 있다. 넘침을 찾으면 OS는 protection hook을 E_OS_STACKFAULT로 부르고, protection hook이 없으면 E_OS_STACKFAULT로 `ShutdownOS`를 부른다. MPU(Memory Protection Unit)를 쓰는 SC3·SC4 시스템에서는 stack monitoring이 찾기 전에 스택 넘침이 메모리 예외를 일으킬 수 있다.[@autosar-cp-sws-os-2025]

## Service protection

**Service protection**은 OS-Application이 OS 서비스를 잘못 불러 OS를 망가뜨리지 않게 막는 기능이다. OS는 서비스마다 부를 수 있는 context(태스크, [[osek-isr#Category 1|category 1]]·2 ISR, 각 [[osek-hook-routine|hook]], 알람 callback 등)를 정해 둔다. OSEK OS 서비스는 이미 잘못된 객체에 E_OS_ID를, 범위 밖 값에 E_OS_VALUE를 돌려주고, AUTOSAR OS는 이를 service protection의 바탕으로 쓴다.[@autosar-cp-sws-os-2025]

잘못된 사용마다 OS가 하는 일은 다음과 같다.[@autosar-cp-sws-os-2025]

| 잘못된 사용                                                                                | OS의 처리                                                                                         |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 허용되지 않은 context에서 서비스를 부른다. 예: `StartupHook`에서 `ActivateTask`            | category 1 ISR 안이 아니면 요청을 수행하지 않고 E_OS_CALLEVEL이나 그 서비스의 무효 값을 돌려준다. |
| 태스크가 `TerminateTask`나 `ChainTask` 없이 끝난다.                                        | 태스크를 끝내고, error hook이 있으면 `ErrorHook`을 E_OS_MISSINGEND로 부른다.                      |
| category 2 ISR이 인터럽트를 막은 채 끝난다.                                                | 빠진 해제를 대신 하고 `ErrorHook`을 E_OS_DISABLEDINT로 부른다.                                    |
| category 2 ISR이 [[osek-resource\|resource]]를 쥔 채 끝난다.                               | resource를 대신 놓고 `ErrorHook`을 E_OS_RESOURCE로 부른다.                                        |
| [[autosar-os-application#접근 권한\|접근 권한]]이 설정되지 않은 OS 객체를 서비스로 다룬다. | E_OS_ACCESS를 돌려준다.                                                                           |
| non-trusted OS-Application이 `ShutdownOS`를 부른다.                                        | 무시한다.                                                                                         |

## Protection hook

**Protection hook**은 OS가 보호 오류 같은 심각한 오류를 찾았을 때 부르는, 사용자가 구현하는 함수 `ProtectionHook`이다. 인자로 받는 오류의 종류는 다음과 같다.[@autosar-cp-sws-os-2025]

| 인자                      | 오류                                            |
| ------------------------- | ----------------------------------------------- |
| E_OS_PROTECTION_MEMORY    | 메모리 접근 위반                                |
| E_OS_PROTECTION_TIME      | 실행 시간 예산 초과                             |
| E_OS_PROTECTION_ARRIVAL   | 정해진 간격보다 이른 도착                       |
| E_OS_PROTECTION_LOCKED    | resource 점유나 인터럽트 차단이 예산보다 길어짐 |
| E_OS_PROTECTION_EXCEPTION | 명령 실행 중 예외(trap). 예: 0으로 나누기       |
| E_OS_STACKFAULT           | stack monitoring이 찾은 스택 오류               |

반환값은 OS가 이어서 할 일을 정한다.[@autosar-cp-sws-os-2025]

| 반환값                   | OS의 처리                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| PRO_IGNORE               | 요청된 동작을 그대로 수행한다. E_OS_PROTECTION_ARRIVAL일 때만 유효하고, 다른 오류에서 돌려주면 `ShutdownOS`를 부른다. |
| PRO_PREVENT_ARRIVAL_RATE | E_OS_PROTECTION_ARRIVAL일 때, 도착률 오류를 일으킨 동작을 수행하지 않는다.                                            |
| PRO_TERMINATETASKISR     | 오류를 낸 태스크나 category 2 ISR을 강제로 끝낸다.                                                                    |
| PRO_TERMINATEAPPL        | 오류를 낸 태스크나 ISR이 속한 OS-Application을 강제로 끝낸다.                                                         |
| PRO_SHUTDOWN             | `ShutdownOS`를 불러 OS를 멈춘다.                                                                                      |

protection hook을 두지 않으면 OS는 보호 오류에서 `ShutdownOS`를 부른다.[@autosar-cp-sws-os-2025]

## 하드웨어와 API의 전제

OS는 인터럽트 제어 레지스터, 프로세서 상태 워드, 스택 포인터 같은 하드웨어 자원에 자유롭게 접근해 스스로 관리하는 것을 전제로 한다. 확장 기능은 하드웨어 요건을 더하며, 그 기능을 쓰지 않는 시스템에는 그 요건이 없다.[@autosar-cp-sws-os-2025]

- [[autosar-os-application#Memory protection|memory protection]]에는 하드웨어 MPU(Memory Protection Unit)가 있어야 한다.
- timing protection에는 실행 시간과 도착률을 감시할 타이머 하드웨어가 있어야 한다.
- 보호에는 MCU의 privileged mode와 non-privileged mode가 있어야 한다. OS가 제어하는 레지스터에 쓰는 일로 OS 내부가 망가지지 않게 하려는 것으로, OS-Application이 이 모드로 memory protection 레지스터나 프로세서 상태 워드에 써서 보호를 우회할 수 없어야 한다. privileged mode는 보호받는 OS가 온전히 제어하며, OS 안에서 쓰고 non-trusted OS-Application과 trusted OS-Application 사이에서 제어를 넘기는 데 쓴다.
- 로컬·전역 시간 동기화에는 전역 시간 소스가 있어야 한다.[@autosar-cp-sws-os-2025]

OS는 대개 프로세서의 하드웨어 고장을 감지하지 못하며, 하드웨어가 고장 나면 OS가 올바로 동작한다고 보장할 수 없다. OS의 API는 C 함수 호출이나 매크로로 정의되며, 다른 언어를 쓰면 이 C 인터페이스에 맞춰야 한다. OS는 동적 메모리 관리 서비스를 주지 않는다.[@autosar-cp-sws-os-2025]

## OSEK OS와 달라진 점

알람이 만료될 때 할 수 있는 동작에는 AUTOSAR OS에서 소프트웨어 counter를 올리는 것이 더해졌다.[@autosar-cp-sws-os-2025]

OSEK OS는 스케줄러를 잠그는 resource `RES_SCHEDULER`를 자동으로 만든다.[@osek-os-2-2-3-2005] AUTOSAR OS는 `RES_SCHEDULER`를 다른 resource와 똑같이 다루며 자동으로 만들지 않는다.[@autosar-cp-sws-os-2025]

OSEK OS는 `ShutdownHook`이 돌아온 뒤 `ShutdownOS`가 어떻게 동작할지를 구현에 맡긴다.[@osek-os-2-2-3-2005] AUTOSAR OS에서는 `ShutdownHook`이 돌아오면 OS가 모든 인터럽트를 끄고 끝없는 루프에 든다.[@autosar-cp-sws-os-2025]
