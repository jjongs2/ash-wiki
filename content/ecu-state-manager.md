---
title: ECU State Manager
tags:
  - platform/autosar
aliases:
  - EcuM
verified: 2026-10-07
---

AUTOSAR R25-11의 EcuM 명세는 **ECU State Manager**(EcuM)를 ECU 상태의 공통 측면을 관리하는 BSW(Basic Software) 모듈로 정의한다. EcuM은 [[autosar-os|AUTOSAR OS]], [[basic-software-scheduler|SchM]], [[basic-software-mode-manager|BswM]]과 일부 BSW 드라이버 모듈을 초기화하고 해제하며, 요청을 받으면 ECU를 SLEEP과 SHUTDOWN에 맞게 설정하고, ECU의 모든 wakeup 이벤트를 관리한다. wakeup이 진짜인지 잘못 일어난 것인지는 EcuM이 주는 wakeup validation 프로토콜로 가린다.[@autosar-cp-sws-ecustatemanager-2025]

## BswM과의 분담

EcuM은 STARTUP, UP, SHUTDOWN, SLEEP, OFF 단계를 거친다. Flexible ECU management에서는 대부분의 ECU 상태를 EcuM 안에서 구현하지 않고, [[autosar-rte|RTE]]·SchM의 모드 관리 기능과 BswM의 규칙·[[basic-software-mode-manager#Action list|action list]]로 다룬다. EcuM은 이 일반 모드 관리 기능을 쓸 수 없을 때, 곧 STARTUP의 이른 단계, SHUTDOWN의 늦은 단계, 스케줄러가 기능을 막는 SLEEP 단계에서 제어를 맡는다. UP 단계에서는 BswM이 그다음 일을 맡고, EcuM은 [[autosar-software-component|SW-C]]의 RUN·POST_RUN 요청을 중재해 그 모드의 상태를 BswM에 알린다.[@autosar-cp-sws-ecustatemanager-2025]

![[diagrams/ecum-phases-control.svg]]

## Shutdown target

**Shutdown target**은 UP 단계를 떠난 상태 기계가 향하는, 코드를 실행하지 않는 상태로, Off, Sleep, Reset이 있다. BswM이 ECU 자원 대부분을 다루므로, shutdown target을 언제 무엇으로 정할지도 BswM이 직접이나 간접으로 정한다. Off에 닿으려면 ECU가 스스로 전원을 끌 수 있어야 하는데, 모든 하드웨어 설계가 이를 갖추지는 않는다. EcuM은 설정할 수 있는 sleep 모드 묶음을 둘 수 있고 설정할 수 있는 reset 모드 묶음은 반드시 두며, reset 모드에는 적어도 `Mcu_PerformReset`, `WdgM_PerformReset`과 DIO(Digital Input/Output)·SPI(Serial Peripheral Interface)로 I/O 핀 토글하기가 든다.[@autosar-cp-sws-ecustatemanager-2025]

EcuM 명세에는 ECU를 늘 끌 수 있는 것은 아니라는 한계가 있다. OFF에는 power hold 회로 같은 ECU 전용 하드웨어가 있어야 닿을 수 있고, 그 하드웨어가 없으면 EcuM 명세는 reset을 대신 하기를 권하되 다른 기본 동작도 허용한다.[@autosar-cp-tr-releaseoverview-2025]

## 멀티코어

멀티코어 ECU에서는 EcuM을 코어마다 하나씩 둔다. [[bootloader|부트로더]]가 master core를 정하고 그 코어에서 `EcuM_Init`으로 master EcuM을 띄운다. master EcuM은 몇몇 드라이버를 시작하고 [[autosar-methodology#ECU 설정|post-build]] 설정을 정한 뒤, 나머지 코어와 그 코어의 satellite EcuM을 모두 띄운다. 나머지 코어는 **slave core**라 부른다. 각 EcuM은 자기 코어의 OS와 BswM을 시작하고, BswM은 파티션마다 하나씩 있다. EcuM은 모든 코어에서 SchM과 OS를 시작하고, master core와 slave core의 BswM을 모두 초기화한다. [[safety-mechanism|안전 메커니즘]]을 쓰면 EcuM은 full trust level로 돌아야 한다.[@autosar-cp-sws-ecustatemanager-2025]

BSW 모듈을 파티션과 코어에 나눠 두는 일은 [[autosar-layered-architecture#BSW 분산|AUTOSAR 계층 구조]]에서 다룬다.
