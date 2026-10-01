---
title: OS-Application
tags:
  - platform/autosar
verified: 2026-09-30
---

**OS-Application**은 [[autosar-os|AUTOSAR OS]]에서 태스크, [[osek-isr|ISR]], 알람, schedule table, counter처럼 하나의 기능 단위를 이루는 OS 객체의 모음이다. 다른 OS-Application 객체에 대한 접근 권한과 memory protection은 OS-Application 단위로 준다.[@autosar-cp-sws-os-2025]

## 소속

OS-Application을 쓰면 모든 태스크, ISR, counter, 알람, [[autosar-schedule-table|schedule table]]이 어느 한 OS-Application의 소속이어야 한다. [[osek-resource|resource]]는 OS-Application의 소속이 아니지만, 쓰려면 접근 권한을 명시적으로 받아야 한다. 멀티코어의 [[spinlock|스핀락]]도 같다.[@autosar-cp-sws-os-2025]

OS-Application은 한 코어에 통째로 놓이는 단위로, 같은 OS-Application의 태스크와 ISR은 모두 같은 코어에서 실행된다. 어느 코어인지는 설정(`OsAppEcucPartitionRef`)으로 정한다.[@autosar-cp-sws-os-2025]

![[diagrams/os-application-core-ownership.svg]]

OS-Application마다 자기 [[osek-hook-routine|hook]]으로 `StartupHook_<App>`, `ShutdownHook_<App>`, `ErrorHook_<App>`을 둘 수 있고, 이 hook은 그 OS-Application의 접근 권한으로 실행된다.[@autosar-cp-sws-os-2025]

## Trusted와 non-trusted

OS-Application은 trusted와 non-trusted 둘로 나뉜다.[@autosar-cp-sws-os-2025]

- **Trusted OS-Application**: 실행 중 감시나 보호를 끈 채 실행될 수 있고, 메모리와 OS API(Application Programming Interface)에 제한 없이 접근할 수 있으며, 실행 때 타이밍 동작을 강제받지 않아도 된다. 프로세서가 지원하면 privileged mode에서 실행될 수 있다. 다른 OS-Application에 서비스를 제공할 수 있다.
- **Non-trusted OS-Application**: 감시나 보호를 끈 채 실행될 수 없고, 메모리와 OS API에 제한된 접근만 하며, 타이밍 동작을 강제받는다. privileged mode에서 실행될 수 없다. 주변장치는 자기에게 배정된 것에만 쓸 수 있고, `ShutdownOS`를 불러도 무시된다.[@autosar-cp-sws-os-2025]

## 접근 권한

같은 OS-Application의 객체끼리는 서로 접근할 수 있고, 다른 OS-Application의 객체에 대한 접근은 설정으로 명시해 준 경우에만 허용된다. 객체마다 접근할 수 있는 OS-Application을 참조로 설정하며, 태스크에서는 `OsTaskAccessingApplication`이 그 참조다.[@autosar-cp-sws-os-2025]

`CheckObjectAccess`는 어떤 OS-Application이 태스크, resource, counter, 알람, schedule table의 ID를 API 호출에 쓸 수 있는지 알려 주고, `CheckObjectOwnership`은 태스크, ISR, counter, 알람, schedule table이 어느 OS-Application에 속하는지 알려 준다.[@autosar-cp-sws-os-2025]

## 상태

OS-Application은 두 상태 가운데 하나에 있다. APPLICATION_ACCESSIBLE은 다른 OS-Application에서 그 객체에 접근할 수 있는 상태로, 시작 때의 기본 상태다. APPLICATION_TERMINATED에서는 다른 OS-Application이 그 객체에 접근할 수 없고, 상태가 더는 바뀌지 않는다. OS-Application이 `TerminateApplication`이나 [[autosar-os#Protection hook|protection hook]]으로 끝나면 APPLICATION_TERMINATED가 되며, `TerminateApplication`의 RestartOption 인자는 쓰이지 않고 무시된다. `GetApplicationState`는 현재 상태를 읽는다.[@autosar-cp-sws-os-2025]

AUTOSAR Classic Platform R23-11의 OS 명세는 OS-Application을 다시 시작할 수 있게 했다. 다시 시작을 요청하며 끝낸 OS-Application을 APPLICATION_RESTARTING 상태에 두고 그 OS-Application의 restart 태스크(`OsRestartTask`)를 활성화했으며, 그 OS-Application이 `AllowAccess`를 부르면 APPLICATION_ACCESSIBLE로 돌아왔다.[@autosar-cp-sws-os-2023] R24-11에서 다시 시작하는 선택지가 빠져, R25-11에는 이 상태와 restart 태스크, `AllowAccess`가 없다.[@autosar-cp-sws-os-2025]

## Memory protection

**Memory protection**은 실행 프로그램의 데이터, 코드, 스택 섹션을 바탕으로 하는 AUTOSAR OS의 보호다. scalability class 가운데 SC3과 SC4에 들고, 하드웨어 요건은 MPU(Memory Protection Unit)다. memory protection은 하드웨어 지원이 있는 프로세서에서만 할 수 있다. 보호는 OS가 관리하는 객체에만 할 수 있어, category 1 ISR이 실행되는 동안이나, 같은 태스크나 category 2 ISR 본문에서 부른 함수 사이는 보호하지 못한다.[@autosar-cp-sws-os-2025]

OS는 non-trusted OS-Application이 OS 자신의 데이터 섹션과 스택, 다른 OS-Application의 private 데이터 섹션, 태스크와 ISR의 private 스택과 데이터에 쓰는 것을 막는다. 다른 non-trusted OS-Application이 한 OS-Application의 데이터 섹션을 읽는 것도 막을 수 있다. 메모리 접근 위반을 감지하면 OS는 `ProtectionHook`을 E_OS_PROTECTION_MEMORY로 부른다.[@autosar-cp-sws-os-2025]

## Trusted function

trusted OS-Application은 다른 OS-Application이 부를 수 있는 서비스인 **trusted function**을 내놓을 수 있다. OS-Application은 trusted든 non-trusted든 `CallTrustedFunction`으로 trusted function을 부르고, 그 함수는 그것을 내놓은 OS-Application의 프로세서 모드, memory protection 경계, service protection 제한으로 실행된다. 멀티코어 시스템에서 `CallTrustedFunction`은 같은 코어의 OS-Application 사이에서만 쓸 수 있고, 대상 trusted function이 다른 코어의 OS-Application에 있으면 extended status에서 E_OS_ACCESS를 돌려준다.[@autosar-cp-sws-os-2025]
