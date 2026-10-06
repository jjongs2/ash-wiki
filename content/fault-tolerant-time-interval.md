---
title: Fault tolerant time interval
tags:
  - process/sw-process
aliases:
  - FTTI
verified: 2026-10-02
---

[[iso-26262|ISO 26262]]-1:2018은 **FTTI**(Fault Tolerant Time Interval)를 [[safety-mechanism|안전 메커니즘]]이 동작하지 않을 때, [[safety-lifecycle#ISO 26262의 안전 생명주기|아이템]]에서 [[fault-error-failure|fault]]가 일어난 때부터 [[hazard-analysis-and-risk-assessment#용어|해저드 사건]]이 일어날 수 있는 때까지의 최소 시간 간격으로 정의한다. FTTI는 그 해저드에서 끌어낸 [[hazard-analysis-and-risk-assessment#Safety goal|safety goal]]의 속성이고, 아이템 수준에서만 정의한다.[@iso-26262-1-obp-2018]

## 시간 구간과 운용 모드

이 표준은 FTTI와 관련된 시간 구간과 운용 모드를 다음처럼 정의한다.[@iso-26262-1-obp-2018]

| 용어                                               | 정의                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| FDTI(Fault Detection Time Interval)                | fault가 일어난 때부터 그것을 검출할 때까지의 시간 간격                          |
| FRTI(Fault Reaction Time Interval)                 | fault를 검출한 때부터 안전 상태나 emergency operation에 이를 때까지의 시간 간격 |
| FHTI(Fault Handling Time Interval)                 | FDTI와 FRTI의 합. 안전 메커니즘의 속성                                          |
| Emergency operation                                | fault에 반응한 뒤 안전 상태로 옮길 때까지 안전을 주는 아이템의 운용 모드        |
| EOTTI(Emergency Operation Tolerance Time Interval) | 불합리한 리스크 없이 emergency operation을 유지할 수 있도록 정해 둔 시간 간격   |

## 구간 사이의 관계

이 표준은 FDTI와 FRTI의 합이 관련 FTTI보다 짧으면 안전 메커니즘이 그 fault를 제때 다룬 것으로 둔다. 곧 $\mathrm{FHTI} = \mathrm{FDTI} + \mathrm{FRTI} < \mathrm{FTTI}$다.[@iso-26262-1-obp-2018]

![[diagrams/ftti-time-intervals.svg]]

안전 상태는 [[safety-mechanism#안전 상태와 성능 저하|안전 메커니즘]]에서 다룬다.

## 2011판과의 차이

ISO 26262-1:2011은 FTTI를 해저드 사건이 일어나기 전까지 fault가 시스템에 있을 수 있는 시간 간격으로 정의했다. 2018판은 안전 메커니즘이 동작하지 않을 때 아이템에서 잰 최소 시간 간격으로 정의한다.[@iso-26262-1-obp-2018][@iso-26262-1-obp-2011]

ISO 26262-1:2011은 diagnostic test interval을 안전 메커니즘이 온라인 진단 시험을 실행하는 사이의 시간으로 정의했다. 2018판은 이를 diagnostic test time interval이라 부르고 시험 실행에 걸리는 시간을 포함한다.[@iso-26262-1-obp-2018][@iso-26262-1-obp-2011]

ISO 26262-1:2011은 fault reaction time을 fault를 검출한 때부터 안전 상태에 이를 때까지의 시간으로 정의했다. 2018판은 fault reaction time 대신 FRTI를 두어 그 끝점에 emergency operation 도달을 더했고, FDTI를 새로 넣어 diagnostic test time interval과 따로 정한다.[@iso-26262-1-obp-2018][@iso-26262-1-obp-2011]
