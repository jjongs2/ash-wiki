---
title: OSEK hook 루틴
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK hook 루틴**은 [[osek-os|OSEK OS]]가 내부 처리 도중에 사용자 정의 동작을 하도록 부르는 루틴이다. 인터페이스는 명세가 표준화하고, 기능은 사용자가 정의해 구현한다.[@osek-os-2-2-3-2005] hook 루틴은 다섯이며, 쓸지 말지를 [[osek-implementation-language|OIL]]의 `OS` 객체에서 하나씩 정한다.[@osek-oil-2-5-2004]

## 다섯 hook

hook 루틴마다 운영체제가 부르는 시점과, 쓸지 정하는 OIL 속성은 다음과 같다.[@osek-os-2-2-3-2005][@osek-oil-2-5-2004]

| hook 루틴      | 운영체제가 부르는 시점                                                      | OIL 속성       |
| -------------- | --------------------------------------------------------------------------- | -------------- |
| `ErrorHook`    | 시스템 서비스가 E_OK가 아닌 값을 돌려줄 때                                  | `ERRORHOOK`    |
| `PreTaskHook`  | 새 [[osek-task\|태스크]]가 running에 들어간 직후, 태스크 코드를 실행하기 전 | `PRETASKHOOK`  |
| `PostTaskHook` | 태스크가 running을 떠나기 직전                                              | `POSTTASKHOOK` |
| `StartupHook`  | 운영체제 초기화가 끝난 뒤, 스케줄러가 돌기 전                               | `STARTUPHOOK`  |
| `ShutdownHook` | `ShutdownOS`가 불린 뒤, 운영체제가 멈추기 전                                | `SHUTDOWNHOOK` |

`StartupHook`에서는 애플리케이션이 장치 드라이버 초기화 같은 일을 할 수 있다. `PreTaskHook`과 `PostTaskHook`은 태스크가 running 상태인 채로 불리므로, 그 안에서 `GetTaskID`가 INVALID_TASK를 돌려주지 않는다. 두 hook은 디버깅이나, [[context-switch|context switch]] 시간을 포함한 시간 측정에 쓸 수 있다.[@osek-os-2-2-3-2005]

![[diagrams/osek-pre-post-task-hook.svg]]

hook 루틴은 모든 태스크보다 우선순위가 높고, category 2 [[osek-isr|ISR]]이 끼어들지 못한다. hook 루틴은 시스템 서비스 가운데 일부만 부를 수 있으며, 허용되지 않은 서비스를 부른 동작은 정의되지 않는다.[@osek-os-2-2-3-2005]

OSEK OS 2.2.3 명세는 hook 루틴의 인터페이스를 표준화하지만, hook 루틴의 환경과 동작 같은 기능은 표준화하지 않는다. 그래서 hook 루틴은 대개 이식성이 없고, OSEK 구현마다 hook 루틴의 규약을 기술해야 한다.[@osek-os-2-2-3-2005]

## 오류의 두 부류

운영체제는 오류를 두 부류로 나눈다.[@osek-os-2-2-3-2005]

- **애플리케이션 오류**: 운영체제가 요청받은 서비스를 올바르게 수행하지 못했지만 내부 데이터는 올바르다고 보는 경우다. 중앙 오류 처리를 부르고, 상태 정보로도 오류를 돌려준다.
- **치명적 오류**: 운영체제가 내부 데이터가 올바르다고 더는 볼 수 없는 경우다. 운영체제가 `ShutdownOS`를 부른다.[@osek-os-2-2-3-2005]

대부분의 시스템 서비스는 상태를 StatusType으로 돌려주며, 제약 없이 수행하면 E_OK(값 0)다.[@osek-os-2-2-3-2005]

## Standard status와 extended status

운영체제는 오류 검사를 **standard status**와 **extended status** 두 수준으로 제공한다.[@osek-os-2-2-3-2005] 어느 쪽을 쓸지는 OIL의 `OS` 객체에서 `STATUS` 속성(`STANDARD` 또는 `EXTENDED`)으로 고른다.[@osek-oil-2-5-2004]

standard status는 디버깅을 마친 애플리케이션을 위한 것이다. standard status에서 돌아오는 E_OK가 아닌 값은 경고다. extended status는 standard status보다 오류를 더 검사해 값을 더 돌려주며, 디버깅이 끝나지 않은 애플리케이션의 시험에 쓴다. extended status에서만 돌아오는 값은 대상 애플리케이션을 실행할 때는 더 나오지 않아야 하므로, 실행 시 버전은 그 오류를 가로채지 않는다.[@osek-os-2-2-3-2005]

오류 코드와 그것이 돌아오는 경우는 다음과 같다. standard status에서도 돌아오는 것은 E_OS_LIMIT, E_OS_NOFUNC, E_OS_STATE의 일부 경우뿐이다.[@osek-os-2-2-3-2005]

| 값  | 오류 코드     | standard status에서도 돌아오는 경우                                               | extended status에서 더 돌아오는 경우                                                                                                                                                       |
| --- | ------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | E_OS_ACCESS   | —                                                                                 | 이미 점유된 [[osek-resource\|resource]]를 얻으려 하거나 우선순위가 resource의 ceiling보다 높을 때, extended 태스크가 아닌 태스크가 [[osek-event\|이벤트]] 서비스를 쓰거나 대상으로 삼을 때 |
| 2   | E_OS_CALLEVEL | —                                                                                 | `TerminateTask`, `ChainTask`, `Schedule`, `ClearEvent`, `WaitEvent`를 인터럽트 레벨에서 부를 때                                                                                            |
| 3   | E_OS_ID       | —                                                                                 | 태스크, resource, [[osek-alarm\|알람]]의 ID가 잘못됐을 때                                                                                                                                  |
| 4   | E_OS_LIMIT    | `ActivateTask`, `ChainTask`에서 활성화 요청이 너무 많을 때. 그 활성화는 무시된다. | —                                                                                                                                                                                          |
| 5   | E_OS_NOFUNC   | `GetAlarm`, `CancelAlarm`에서 알람이 쓰이고 있지 않을 때                          | `ReleaseResource`에서 점유하지 않은 resource를 놓거나 다른 resource를 먼저 놓아야 할 때                                                                                                    |
| 6   | E_OS_RESOURCE | —                                                                                 | `TerminateTask`, `ChainTask`, `Schedule`, `WaitEvent`를 부른 태스크가 아직 resource를 점유하고 있을 때                                                                                     |
| 7   | E_OS_STATE    | `SetRelAlarm`, `SetAbsAlarm`에서 알람이 이미 쓰이고 있을 때                       | `SetEvent`, `GetEvent`에서 대상 태스크가 suspended일 때                                                                                                                                    |
| 8   | E_OS_VALUE    | —                                                                                 | 알람 서비스의 시작값이나 주기가 카운터 상수가 허용하는 범위를 벗어날 때                                                                                                                    |

## `ErrorHook`

`ErrorHook`은 오류 코드를 StatusType 인자로 받는다. 그 안에서 `OSErrorGetServiceId`로 오류가 난 서비스를 알아낼 수 있으며, 이 매크로는 구현이 반드시 갖춰야 한다. 오류가 난 서비스에 넘긴 인자는 `OSError_<서비스 이름>_<인자 이름>` 꼴의 매크로로 읽는다. 첫 인자가 객체 ID인 서비스에서는 이 매크로가 필수이고, OIL로 매크로를 끌 수 있다.[@osek-os-2-2-3-2005] OIL의 `OS` 객체에서는 `USEGETSERVICEID`와 `USEPARAMETERACCESS` 속성이 이 두 가지 매크로를 켠다.[@osek-oil-2-5-2004]

`ErrorHook` 안에서 부른 시스템 서비스에서 오류가 나도 `ErrorHook`은 다시 불리지 않으며, 그 오류는 반환값으로만 알 수 있다.[@osek-os-2-2-3-2005]
