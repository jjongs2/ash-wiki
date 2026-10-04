---
title: 안전 메커니즘
tags:
  - process/sw-process
verified: 2026-10-02
---

ISO 26262-1:2018은 **안전 메커니즘**(safety mechanism)을 E/E(Electrical/Electronic) 기능이나 요소, 또는 다른 기술로 구현해 fault를 검출하고 완화하거나 허용하며, failure를 제어하거나 피해서 의도한 기능을 유지하거나 안전 상태에 이르거나 머물게 하는 기술적 해결책으로 정의한다. 같은 정의의 주석은 안전 메커니즘이 아이템을 안전 상태로 옮기거나 그 상태에 머물게 하거나, functional safety concept에 정한 대로 운전자에게 경고해 운전자가 failure의 영향을 제어하게 하는 것으로 둔다.[@iso-26262-1-obp-2018] Fault와 failure의 정의는 [[fault-error-failure|Fault, error, failure]]에서 다룬다.

## 안전 상태와 성능 저하

ISO 26262-1:2018은 **안전 상태**(safe state)를 failure가 났을 때 불합리한 리스크가 없는 아이템의 운용 모드로 정의하고, fault tolerant가 아닌 시스템의 안전 상태 예로 꺼진 모드를 든다. 같은 표준은 fault를 검출한 뒤 안전 상태에 바로 또는 제때 이르지 못하거나 그 상태에 머물 수 없으면, 안전 메커니즘이 아이템을 emergency operation으로 옮겨 안전 상태에 이를 때까지 안전을 지킬 수 있게 둔다.[@iso-26262-1-obp-2018]

이 표준은 **성능 저하**(degradation)를 아이템이나 요소의 기능, 성능 또는 둘 다가 줄어든 상태나 그 상태로 옮겨 가는 것으로 정의한다. 또 **warning and degradation strategy**를, 기능이 줄 수 있음을 운전자에게 어떻게 알리고 줄어든 기능을 어떻게 제공해 안전 상태에 이를지 정한 명세로 정의한다. 이 strategy는 운전자에게 주는 경고 신호, 안전 상태, 안전 상태로 옮기는 조건과 돌아오는 조건, 해당하면 emergency operation을 담는다.[@iso-26262-1-obp-2018]

안전 메커니즘이 대응을 마쳐야 하는 시간은 [[fault-tolerant-time-interval|FTTI]]에서 다룬다.

## 오류 검출 기법

TI Hercules MCU는 하드웨어 안전 메커니즘으로 lockstep CPU, [[error-correction-code|ECC]], BIST(Built-In Self-Test)를 둔다.[@ti-spry178-2011]

AUTOSAR Watchdog Manager는 소프트웨어 실행을 세 가지로 감시한다.[@autosar-cp-sws-watchdogmanager-2025]

- **Alive supervision**: 주기적인 실행이 너무 잦거나 너무 드물지 않은지 본다.
- **Deadline supervision**: 두 체크포인트 사이의 시간이 설정한 범위 안인지 본다.
- **Logical supervision**: 체크포인트를 정한 순서대로 지나는지 본다.[@autosar-cp-sws-watchdogmanager-2025]

![[diagrams/watchdog-supervision-kinds.svg]]

AUTOSAR R25-11은 통신 경로의 fault를 실행 중에 검출하는 E2E(End-to-End) 통신 보호를 둔다.[@autosar-fo-prs-e2eprotocol-2025] 수신 시그널이 정한 시간 안에 오지 않는 것은 [[autosar-com|AUTOSAR COM]]의 수신 데드라인 감시가 검출한다.[@autosar-cp-sws-com-2025]
