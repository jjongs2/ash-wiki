---
title: 안전 메커니즘
tags:
  - sw-engineering/functional-safety
verified: 2026-10-02
---

[[iso-26262|ISO 26262]]-1:2018은 **안전 메커니즘**(safety mechanism)을 E/E(Electrical/Electronic) 기능이나 요소, 또는 다른 기술로 구현해 fault를 검출하고 완화하거나 허용하며, failure를 제어하거나 피해서 의도한 기능을 유지하거나 안전 상태에 이르거나 머물게 하는 기술적 해결책으로 정의한다. 같은 정의의 주석은 안전 메커니즘이 [[safety-lifecycle#ISO 26262의 안전 생명주기|아이템]]을 안전 상태로 옮기거나 그 상태에 머물게 하거나, [[safety-requirement#요구사항의 전개|functional safety concept]]에 정한 대로 운전자에게 경고해 운전자가 failure의 영향을 제어하게 하는 것으로 둔다.[@iso-26262-1-obp-2018] Fault와 failure의 정의는 [[fault-error-failure|Fault, error, failure]]에서 다룬다.

**안전 조치**(safety measure)는 [[functional-safety#Systematic failure와 random hardware failure|systematic failure]]를 피하거나 제어하고 random hardware failure를 검출하거나 제어하거나 그 해로운 영향을 완화하는 활동이나 기술적 해결책이고, 안전 메커니즘은 안전 조치에 든다. 같은 정의는 [[safety-analysis#FMEA|FMEA]]와 전역 변수를 쓰지 않는 소프트웨어를 예로 든다.[@iso-26262-1-obp-2018]

## 안전 상태와 성능 저하

이 표준은 **안전 상태**(safe state)를 failure가 났을 때 불합리한 리스크가 없는 아이템의 운용 모드로 정의하고, fault tolerant가 아닌 시스템의 안전 상태 예로 꺼진 모드를 든다. 같은 표준은 fault를 검출한 뒤 안전 상태에 바로 또는 제때 이르지 못하거나 그 상태에 머물 수 없으면, 안전 메커니즘이 아이템을 [[fault-tolerant-time-interval#시간 구간과 운용 모드|emergency operation]]으로 옮겨 안전 상태에 이를 때까지 안전을 지킬 수 있게 둔다.[@iso-26262-1-obp-2018]

이 표준은 **성능 저하**(degradation)를 아이템이나 요소의 기능, 성능 또는 둘 다가 줄어든 상태나 그 상태로 옮겨 가는 것으로 정의한다. 또 **warning and degradation strategy**를, 기능이 줄 수 있음을 운전자에게 어떻게 알리고 줄어든 기능을 어떻게 제공해 안전 상태에 이를지 정한 명세로 정의한다. 이 strategy는 운전자에게 주는 경고 신호, 안전 상태, 안전 상태로 옮기는 조건과 돌아오는 조건, 해당하면 emergency operation을 담는다.[@iso-26262-1-obp-2018]

[[iso-21448|ISO 21448]]:2022는 **MRC**(Minimal Risk Condition)를 주어진 주행(trip)을 마칠 수 없을 때 리스크를 줄이려는 차량 상태로 정의한다. 같은 정의의 주석은 ISO 26262 시리즈에서 이에 대응하는 [[functional-safety|기능 안전]]의 개념으로 안전 상태를 든다.[@iso-21448-obp-2022]

IEC 60050은 **fail-safe**를 failure가 나도 안전을 지킬 수 있는 시스템의 성질로 정의하고[@iec-60050-192-10-06-2015], **fail-soft**를 fault가 났거나 failure가 임박했을 때 영향받은 기능을 우선순위에 따라 차츰 끝낼 수 있는 시스템의 성질로 정의한다.[@iec-60050-192-10-07-2015]

안전 메커니즘이 대응을 마쳐야 하는 시간은 [[fault-tolerant-time-interval#구간 사이의 관계|FTTI]]에서 다룬다.

## 오류 검출 기법

ISO 26262-1:2018은 **diagnostic point**를 fault의 검출이나 정정이 관측되는 요소의 출력 신호로 정의한다. 같은 정의의 주석은 diagnostic point를 alarm, error flag, correction flag라고도 부른다고 제시하고, 예로 다시 읽은 정보(read back information)를 든다.[@iso-26262-1-obp-2018]

TI Hercules MCU는 하드웨어 안전 메커니즘으로 [[fault-tolerance#다중 채널과 비교|lockstep]] CPU, [[error-correction-code|ECC]], BIST(Built-In Self-Test)를 둔다.[@ti-spry178-2011]

[[autosar|AUTOSAR]] Watchdog Manager는 소프트웨어 실행을 세 가지로 감시한다.[@autosar-cp-sws-watchdogmanager-2025]

- **Alive supervision**: 주기적인 실행이 너무 잦거나 너무 드물지 않은지 본다.
- **Deadline supervision**: 두 체크포인트 사이의 시간이 설정한 범위 안인지 본다.
- **Logical supervision**: 체크포인트를 정한 순서대로 지나는지 본다.[@autosar-cp-sws-watchdogmanager-2025]

![[diagrams/watchdog-supervision-kinds.svg]]

[[autosar-classic-platform|AUTOSAR Classic Platform]] R25-11은 Watchdog Manager에서 deadline supervision을 중첩해 쓰는 것(시작 1, 시작 2, 끝 2, 끝 1의 순서)을 지원하지 않고, Supervised Entity가 여러 파티션(EcucPartition)에 걸치는 것도 지원하지 않는다.[@autosar-cp-tr-releaseoverview-2025]

AUTOSAR R25-11은 통신 경로의 fault를 실행 중에 검출하는 [[autosar-e2e-protection|E2E 통신 보호]]를 둔다.[@autosar-fo-prs-e2eprotocol-2025] 수신 시그널이 정한 시간 안에 오지 않는 것은 [[autosar-com|AUTOSAR COM]]의 수신 데드라인 감시가 검출한다.[@autosar-cp-sws-com-2025]

## Watchdog

**Window watchdog**은 정한 하한과 상한 사이에서 트리거해야 하는 watchdog이다.[@autosar-cp-sws-watchdogdriver-2025][@ti-tps3430-q1-2021]

TPS3430-Q1은 watchdog 입력이 window 밖이면 watchdog 출력으로 fault를 알린다.[@ti-tps3430-q1-2021] TI는 F28003x 안전 매뉴얼에서 [[safety-analysis#Dependent failure 분석|common mode failure]]의 리스크를 줄이려 내부 watchdog보다 외부 watchdog을 쓰기를 권하고, 단일 임계값 watchdog보다 더 많은 failure mode를 검출하는 program sequence, window, 질의-응답 watchdog을 쓰기를 권한다. 클록, 전원, 리셋 같은 common cause failure에도 외부 watchdog을 쓰기를 권한다.[@ti-sffs277-2023]

AUTOSAR R25-11의 Watchdog Driver 명세는 Slow-Mode의 예로 트리거 시점에 제약이 없는 toggle mode를, Fast-Mode의 예로 timeout 주기 안의 최소·최대 경계 사이에서 트리거해야 하는 window mode를 든다. Watchdog Driver는 Watchdog Manager 같은 상위 개체가 준 트리거 조건이 유효한 동안 watchdog 하드웨어를 트리거하고, 트리거 계수기가 0에 이르면 트리거하지 않아 watchdog이 만료된다.[@autosar-cp-sws-watchdogdriver-2025]

![[diagrams/watchdog-window-toggle-mode.svg]]

Watchdog Manager는 감시하는 논리 단위를 **Supervised Entity**라 하고, Supervised Entity 안의 중요한 자리를 **체크포인트**(checkpoint)라 한다. Supervised Entity의 코드에는 체크포인트에 이르렀음을 Watchdog Manager에 알리는 함수 호출이 들어 있다.[@autosar-cp-exp-functionalsafetymeasures-2025]

체크포인트의 거칠기는 Watchdog Manager가 정하지 않는다. 체크포인트가 적고 거칠면 Watchdog Manager의 검출 능력이 제한되고, 촘촘하면 Watchdog Manager의 설정이 복잡하고 커진다. 라이브러리는 [[autosar-layered-architecture|Basic Software]]를 부를 수 없어 Watchdog Manager가 감시하지 못하지만, 모듈 코드에서 라이브러리 호출 앞뒤에 체크포인트를 두면 deadline supervision으로 감시할 수 있다. Logical supervision을 deadline supervision과 함께 쓰면 높은 [[hardware-architectural-metrics#진단 커버리지와 failure rate|진단 커버리지]]를 얻는다.[@autosar-cp-exp-functionalsafetymeasures-2025] Supervised Entity 하나에 alive supervision 체크포인트를 여럿 두는 기능은 일관되게 명세되지 않아, Supervised Entity마다 alive supervision 체크포인트를 하나만 지원하기를 권한다.[@autosar-cp-sws-watchdogmanager-2025]

[[autosar-adaptive-platform|Adaptive Platform]]의 Supervised Entity는 Platform Health Management의 [[autosar-platform-health-management#감시|감시]]에서, Foundation의 Health Monitoring은 [[autosar-platform-health-management#Health Monitoring과의 관계|Health Monitoring과의 관계]]에서, 내부·외부 watchdog 드라이버의 계층 배치는 [[ecu-abstraction-layer#Watchdog Interface|Watchdog Interface]]에서 다룬다.
