---
title: Lockstep
tags:
  - hardware/mcu-soc
  - sw-engineering/functional-safety
verified: 2026-11-13
---

**Lockstep**은 같은 입력을 받아 함께 도는 두 처리 장치의 출력을 비교기로 견주어, 어긋나면 이를 시스템에 알리는 구조다.[@ti-spry178-2011][@infineon-aurix-tc3xx-an0001-2025]

TI Hercules [[microcontroller|MCU]]와 Infineon AURIX TC3xx는 CPU를 lockstep으로 지킨다. 두 제품 모두 lockstep의 두 코어를 몇 클록 사이클 어긋나게 돌린다.[@ti-spry178-2011][@infineon-aurix-tc3xx-an0001-2025]

## 쓰는 곳

AURIX TC3xx는 제품에 따라 lockstep CPU를 넷까지 둔다. 이 CPU에서는 CPU를 주기적으로 시험하는 소프트웨어 자체 시험 없이 [[automotive-safety-integrity-level|ASIL]] D 응용까지 돌릴 수 있다.[@infineon-aurix-tc3xx-an0001-2025]

TI Hercules의 RM4x와 TMS570 MCU는 safe island라는 안전 구조 개념을 함께 쓴다. 이 개념은 소프트웨어가 바르게 돌려면 꼭 있어야 하는 요소인 전원·클록·리셋, CPU, 플래시, SRAM과 그 연결에 상시 도는 하드웨어 [[safety-mechanism|안전 메커니즘]]을 두고, 이 요소들 위에서 도는 소프트웨어로 주변장치 같은 나머지 요소를 진단한다. 그 가운데 CPU에 두는 메커니즘이 lockstep이다.[@ti-spry178-2011]

TPS65381A-Q1은 TI의 Hercules TMS570 MCU와 C2000 MCU 제품군, dual-core lockstep이나 loosely-coupled 구조의 여러 MCU에 전원을 주도록 만든 다중 레일 전원 칩이다.[@ti-tps65381a-q1-2017] 이런 전원 칩이 MCU의 error 핀을 감시하는 것은 [[safety-mechanism#MCU의 하드웨어 안전 메커니즘|MCU의 하드웨어 안전 메커니즘]]에서 다룬다.

## 동작

TI Hercules MCU는 기능 CPU와 같은 입력을 받는 checker CPU를 lockstep으로 둔다. Core compare 모듈이 두 CPU의 출력을 사이클마다 감시하다가 다르면 시스템에 error를 알린다.[@ti-spry178-2011]

![[diagrams/lockstep-core-compare.svg]]

Hercules는 클록에서 오는 [[safety-analysis#Dependent failure 분석|common mode failure]]를 줄이려, 두 CPU를 1.5나 2 사이클 어긋나게 돌린다.[@ti-spry178-2011] AURIX TC3xx는 두 코어에 똑같이 미쳐 lockstep이 놓칠 외부 외란을 피하려, checker 코어의 입력과 비교기로 가는 주 코어의 출력을 두 클록 사이클 늦춘다.[@infineon-aurix-tc3xx-an0001-2025]

Hercules는 common mode failure를 줄이는 방법으로 CPU 둘레에 전압 guard ring도 두고, checker CPU를 기능 CPU에 대해 뒤집고 돌려 배치해 물리 설계를 다르게 한다.[@ti-spry178-2011] AURIX TC3xx는 lockstep 비교기를 배경에서 늘 자체 시험한다. 이 시험은 감시하는 노드마다 두 입력에 fault를 넣고, 감시 로직이 그 fault를 바르게 검출하는지 확인한다.[@infineon-aurix-tc3xx-an0001-2025]

TI 백서에 따르면 lockstep은 회로가 쓰이기 전에는 그 회로의 failure를 검출하지 못한다. 그래서 Hercules는 LBIST(logic built-in self-test)로 진단을 한 층 더 둔다.[@ti-spry178-2011] LBIST를 언제 돌리는지는 [[safety-mechanism#MCU의 하드웨어 안전 메커니즘|MCU의 하드웨어 안전 메커니즘]]에서 다룬다.

## Split-lock

Arm Cortex-A78AE에서는 DSU-AE(DynamIQ Shared Unit AE)가 클러스터를 Split-mode, Lock-mode, Hybrid-mode 가운데 하나로 돌리도록 부팅 때 고르게 한다. 세 모드는 흔한 DCLS(Dual-Core Lock-Step) 시스템의 기능을 넓혀, 리셋 때 실행 모드를 바꾼다. Split-mode에서는 코어가 따로 돈다. Lock-mode에서는 core pair의 한 코어가 주 기능 코어의 중복 사본으로서 주 기능 코어와 lockstep으로 돌고, 클러스터 전체가 DCLS 시스템으로 돌며 출력과 중복 로직의 어긋남을 시스템에 알린다. Hybrid-mode에서는 코어는 Split-mode처럼 따로 돌고, DSU-AE만 Lock-mode처럼 lockstep으로 돈다.[@arm-101779-2022]
