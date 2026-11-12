---
title: Watchdog
tags:
  - hardware/mcu-soc
  - sw-engineering/functional-safety
aliases:
  - Watchdog timer
verified: 2026-11-13
---

**Watchdog**은 [[microcontroller|MCU]]가 정한 때에 트리거하는지 감시해, 제때 트리거하지 않으면 MCU가 바르게 돌지 않는다고 보고 이를 알리거나 리셋을 일으키는 장치다.[@ti-ssztah7-2017][@infineon-tlf35584-2017]

Watchdog은 MCU 안에 넣기도 하고 MCU 밖의 칩에 두기도 한다.[@ti-ssztah7-2017][@infineon-aurix-tc3xx-an0001-2025] 트리거를 받아도 되는 때는 watchdog 주기 전체이기도 하고, 주기 안의 정한 window로 좁혀지기도 한다.[@nxp-uja1169-2016][@infineon-tle9471-3es-2022]

## MCU 안과 밖

AURIX TC3xx는 CPU마다 watchdog timer를 두고, 공유 자원을 위한 safety watchdog timer를 더 둔다. 이 watchdog들은 Endinit이나 safety Endinit으로 보호한 레지스터의 접근을 감시한다. 리셋 뒤에는 CPU0의 watchdog과 safety watchdog이 저절로 켜진다. 시스템 수준에서는 MCU 밖의 외부 watchdog도 안전 조치로 요구한다.[@infineon-aurix-tc3xx-an0001-2025]

TI 기술 기사에 따르면 MCU에 넣은 watchdog은 다른 칩이 필요 없어 쓰기 쉽지만, MCU를 오동작하게 한 코드 문제가 그 watchdog을 뜻하지 않게 꺼 버릴 수도 있다. 그래서 watchdog을 품은 voltage supervisor로 전원 전압과 watchdog 신호를 MCU 밖에서 함께 감시하기도 한다.[@ti-ssztah7-2017]

TI는 TMS320F28003x 실시간 MCU의 기능 안전 매뉴얼에서 [[safety-analysis#Dependent failure 분석|common mode failure]]의 리스크를 줄이려, 감시 대상과 따로 된 클록·리셋·전원을 쓰는 외부 watchdog을 내부 watchdog보다 쓰기를 권하고, 클록·전원·리셋 같은 common cause failure에도 외부 watchdog을 쓰기를 권한다.[@ti-sffs277-2023] 단일 임계값 watchdog보다 더 많은 failure mode를 검출하는 program sequence, window, 질의-응답 watchdog을 쓰기도 권한다.[@ti-sffs277-2023]

MCU 밖의 watchdog은 [[system-basis-chip|SBC]]나 안전 전원 칩에 들기도 한다.[@infineon-tlf35584-2017][@nxp-uja1169-2016] 안전 전원 칩이 watchdog과 함께 MCU의 전원과 error 신호를 감시하는 것은 [[safety-mechanism#MCU의 하드웨어 안전 메커니즘|MCU의 하드웨어 안전 메커니즘]]에서 다룬다.

## Timeout과 window

**Window watchdog**은 정한 하한과 상한 사이에 트리거를 받아야 하는 watchdog이다.[@autosar-cp-sws-watchdogdriver-2025][@ti-tps3430-q1-2021] Window watchdog은 트리거가 너무 늦을 때뿐 아니라 너무 이를 때도 fault로 본다.[@infineon-tlf35584-2017][@nxp-uja1169-2016]

TPS3430-Q1은 TI의 차량용 window watchdog 타이머로, watchdog 입력이 window 밖이면 watchdog 출력으로 fault를 알린다.[@ti-tps3430-q1-2021]

UJA1169는 Window 모드와 함께, watchdog 주기 안 아무 때나 트리거할 수 있는 Timeout 모드를 둔다.[@nxp-uja1169-2016]

TI 백서에 따르면 단일 임계값 watchdog에서는 시스템이 fault 상태에 빠져도 임계에 이르기 전에 watchdog이 여러 번 리셋되어, 그 상태를 놓칠 수 있다. Window watchdog은 정한 window 안에서 CPU의 응답을 요구해 이를 막고, CPU가 돈다는 것과 함께 CPU가 맞는 시간 기준으로 돈다는 것도 보인다.[@ti-spry178-2011]

## 질의-응답 watchdog

질의-응답 watchdog은 MCU에 질의를 주고, 그 질의에 맞는 응답 바이트 넷을 정한 시간 안에 정한 순서로 받는다. 응답이 틀리면 watchdog의 오류 계수기를 올린다.[@infineon-tlf35584-2017][@ti-tps65381a-q1-2017] TPS65381A-Q1에서는 MCU가 질의에 정해진 산술 연산을 차례로 해 응답을 계산한다.[@ti-tps65381a-q1-2017]

## Fail-safe 출력

Watchdog이 MCU의 잘못된 동작을 검출하면, MCU를 리셋하는 데 더해 출력단의 전원을 끊는 신호를 내기도 한다.[@infineon-aurix-tc3xx-an0001-2025][@ti-tps65381a-q1-2017] TPS65381A-Q1은 watchdog이 MCU의 잘못된 동작을 검출하면 ENDRV(enable output) 핀을 low로 내린다. 이 핀으로 모터 드라이버 같은 출력단을 끌 수 있다.[@ti-tps65381a-q1-2017] SBC의 fail 출력은 [[system-basis-chip#Fail 출력|SBC]]에서 다룬다.

## Watchdog Driver 모드

[[autosar|AUTOSAR]] R25-11의 Watchdog Driver 명세는 **Off-Mode**를 watchdog 하드웨어를 끈 상태로 정의한다. Off-Mode는 [[electronic-control-unit|ECU]] 전체를 끌 때 아직 도는 외부 watchdog이 주기적으로 리셋하지 않게 하는 데 필요할 수 있지만, 안전 관련 시스템에서는 허용되지 않을 수 있다. 그때는 이 모드로 바뀌지 않도록 Watchdog Driver를 설정해야 한다.[@autosar-cp-sws-watchdogdriver-2025]

이 명세는 Slow-Mode의 예로 트리거 시점에 제약이 없는 toggle mode를, Fast-Mode의 예로 timeout 주기 안의 최소·최대 경계 사이에서 트리거해야 하는 window mode를 든다. Watchdog Driver는 [[safety-mechanism#오류 검출 기법|Watchdog Manager]] 같은 상위 개체가 준 트리거 조건이 유효한 동안 watchdog 하드웨어를 트리거하고, 트리거 계수기가 0에 이르면 트리거하지 않아 watchdog이 만료된다.[@autosar-cp-sws-watchdogdriver-2025]

![[diagrams/watchdog-window-toggle-mode.svg]]

[[autosar-adaptive-platform|Adaptive Platform]]의 Supervised Entity는 Platform Health Management의 [[autosar-platform-health-management#감시|감시]]에서, Foundation의 Health Monitoring은 [[autosar-platform-health-management#Health Monitoring과의 관계|Health Monitoring과의 관계]]에서, 내부·외부 watchdog 드라이버의 계층 배치는 [[ecu-abstraction-layer#Watchdog Interface|Watchdog Interface]]에서 다룬다.
