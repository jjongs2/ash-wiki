---
title: 안전 메커니즘
tags:
  - sw-engineering/functional-safety
  - hardware/mcu-soc
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

[[autosar|AUTOSAR]] Watchdog Manager는 감시하는 논리 단위를 **Supervised Entity**라 하고, Supervised Entity 안의 중요한 자리를 **체크포인트**(checkpoint)라 한다. Supervised Entity의 코드에는 체크포인트에 이르렀음을 Watchdog Manager에 알리는 함수 호출이 들어 있다.[@autosar-cp-exp-functionalsafetymeasures-2025]

Watchdog Manager는 소프트웨어 실행을 세 가지로 감시한다.[@autosar-cp-sws-watchdogmanager-2025]

- **Alive supervision**: 주기적인 실행이 너무 잦거나 너무 드물지 않은지 본다.
- **Deadline supervision**: 두 체크포인트 사이의 시간이 설정한 범위 안인지 본다.
- **Logical supervision**: 체크포인트를 정한 순서대로 지나는지 본다.[@autosar-cp-sws-watchdogmanager-2025]

![[diagrams/watchdog-supervision-kinds.svg]]

체크포인트의 거칠기는 Watchdog Manager가 정하지 않는다. 체크포인트가 적고 거칠면 Watchdog Manager의 검출 능력이 제한되고, 촘촘하면 Watchdog Manager의 설정이 복잡하고 커진다. 라이브러리는 [[autosar-layered-architecture|Basic Software]]를 부를 수 없어 Watchdog Manager가 감시하지 못하지만, 모듈 코드에서 라이브러리 호출 앞뒤에 체크포인트를 두면 deadline supervision으로 감시할 수 있다. Logical supervision을 deadline supervision과 함께 쓰면 높은 [[hardware-architectural-metrics#진단 커버리지와 failure rate|진단 커버리지]]를 얻는다.[@autosar-cp-exp-functionalsafetymeasures-2025] Supervised Entity 하나에 alive supervision 체크포인트를 여럿 두는 기능은 일관되게 명세되지 않아, Supervised Entity마다 alive supervision 체크포인트를 하나만 지원하기를 권한다.[@autosar-cp-sws-watchdogmanager-2025]

[[autosar-classic-platform|AUTOSAR Classic Platform]] R25-11은 Watchdog Manager에서 deadline supervision을 중첩해 쓰는 것(시작 1, 시작 2, 끝 2, 끝 1의 순서)을 지원하지 않고, Supervised Entity가 여러 파티션(EcucPartition)에 걸치는 것도 지원하지 않는다.[@autosar-cp-tr-releaseoverview-2025]

AUTOSAR R25-11은 통신 경로의 fault를 실행 중에 검출하는 [[autosar-e2e-protection|E2E 통신 보호]]를 둔다.[@autosar-fo-prs-e2eprotocol-2025] 수신 시그널이 정한 시간 안에 오지 않는 것은 [[autosar-com|AUTOSAR COM]]의 수신 데드라인 감시가 검출한다.[@autosar-cp-sws-com-2025]

## MCU의 하드웨어 안전 메커니즘

TI Hercules [[microcontroller|MCU]]는 하드웨어 안전 메커니즘으로 [[lockstep|lockstep]] CPU, [[error-correction-code|ECC]], BIST(Built-In Self-Test)를 둔다.[@ti-spry178-2011]

TI Hercules와 AURIX TC3xx는 시동 때 LBIST(logic built-in self-test)로 로직을 시험한다.[@ti-spry178-2011][@infineon-aurix-tc3xx-an0001-2025] Hercules는 LBIST를 시동이나 정지 때 돌리거나, 동작 중에 작은 시험 조각으로 나눠 돌린다. Hercules에서 SRAM을 시험하는 PBIST(programmable memory BIST)는 메모리 내용을 지우므로 대개 시동이나 정지 때 돌린다.[@ti-spry178-2011] AURIX TC3xx에서 디지털 블록의 [[hardware-architectural-metrics#Fault와 failure의 종류|latent fault]]는 주로 LBIST와 동작 중의 안전 메커니즘이 맡는다.[@infineon-aurix-tc3xx-an0001-2025] [[system-basis-chip#Safety SBC|Safety SBC]]가 품은 BIST는 그 절에서 다룬다.

TI Hercules의 ESM(error signaling module)과 AURIX TC3xx의 SMU(safety management unit)는 MCU 안 안전 메커니즘의 error를 모아, 설정에 따라 인터럽트나 NMI(non-maskable interrupt)를 일으키거나 error 핀으로 MCU 밖에 알린다.[@ti-spry178-2011][@infineon-aurix-tc3xx-an0001-2025] SMU는 CPU 리셋과 응용·시스템 리셋도 요청할 수 있다. AURIX TC3xx의 SMU는 common cause fault를 줄이려 core 영역의 SMU와 stand-by 영역의 SMU로 나뉜다. 둘은 서로 다르게 설계되어, 물리적으로 떨어진 서로 다른 클록·전원 영역에 놓인다.[@infineon-aurix-tc3xx-an0001-2025] Hercules의 ESM에 기록된 치명적 error는 warm reset 뒤에도 남아, 리셋 뒤 CPU가 진단하는 데 쓸 수 있다.[@ti-spry178-2011]

TI Hercules와 AURIX TC3xx는 모두 클록을 독립된 기준 클록과 견주어 클록의 이상을 검출한다.[@ti-spry178-2011][@infineon-aurix-tc3xx-an0001-2025] Hercules는 칩 안 LPO(low power oscillator)를 기준 클록으로 써 입력 클록의 끊김을 검출하고, DCC(dual clock compare)로 칩 안 클록과 고른 기준 클록의 비를 견주어 주파수 drift와 클록 slip을 검출한다. Hercules의 PLL(phase lock loop)에도 slip 검출 기능이 있다.[@ti-spry178-2011] AURIX TC3xx는 PLL 출력을 따로 된 backup 클록과 견주고, PLL의 lock이 풀리면 SMU alarm을 낸다.[@infineon-aurix-tc3xx-an0001-2025]

TI Hercules와 AURIX TC3xx의 칩 안 전압 감시는 공급 전압이 감시 범위를 벗어나면 리셋이나 alarm을 일으킨다.[@ti-spry178-2011][@infineon-aurix-tc3xx-an0001-2025] TI는 Hercules에서 전원의 1차 진단을 칩 밖에 두기를 권한다. 정확도를 높이고 [[safety-analysis#Dependent failure 분석|common mode failure]]의 확률을 줄이기 위해서다.[@ti-spry178-2011] AURIX TC3xx는 두 주 전원의 과전압 감시를 MCU 밖의 시스템 수준 안전 조치로 요구한다.[@infineon-aurix-tc3xx-an0001-2025]

TPS65381A-Q1은 안전 관련 응용의 MCU에 전원을 주는 칩으로, 출력 전압을 감시하고, [[watchdog|watchdog]]을 두며, MCU의 error 핀도 감시한다. Fault를 검출하면 enable 출력으로 안전 경로나 외부 출력단을 끄고, MCU를 리셋하는 회로도 둔다.[@ti-tps65381a-q1-2017] AURIX TC3xx 옆에 두는 전원 칩 TLF35584는 시스템의 공급 전압을 감시하고 외부 watchdog을 맡으며, MCU가 내부 failure를 알리는 FSP(fault signaling protocol) 핀도 감시한다.[@infineon-aurix-tc3xx-an0001-2025] Watchdog이 잘못된 동작을 검출했을 때 출력단을 끄는 것은 [[watchdog#Fail-safe 출력|fail-safe 출력]]에서 다룬다.

![[diagrams/tps65381a-q1-mcu-monitoring.svg]]
