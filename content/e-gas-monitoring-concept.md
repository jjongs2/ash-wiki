---
title: E-Gas 감시 개념
tags:
  - sw-engineering/functional-safety
aliases:
  - Standardized E-Gas Monitoring Concept
verified: 2026-10-04
publisher: EGAS Workgroup
edition: 2015
status: 유효
---

**E-Gas 감시 개념**(Standardized E-Gas Monitoring Concept for Gasoline and Diesel Engine Control Units)은 drive-by-wire로 제어하는 가솔린·디젤 엔진에서, 엔진 제어기가 허용되지 않게 큰 구동 토크로 생기는 의도하지 않은 가속을 검출하도록 감시를 세 층으로 나눈 개념이다.[@egas-monitoring-concept-2015] 독일 자동차 제조사 Audi, BMW, Daimler, Porsche, Volkswagen으로 이루어진 EGAS 작업 그룹(Arbeitskreis EGAS)이 만들었다.[@egas-monitoring-concept-2015][@iav-e-gas-monitoring-concepts-2019] TI F28003x 안전 매뉴얼에 따르면 이 작업 그룹은 독일 VDA의 작업 그룹 E-Gas-Arbeitskreis다.[@ti-sffs277-2023]

## 범위

E-Gas 감시 개념 6.0판은 엔진 제어기의 감시를 세 층으로 나눈다.[@egas-monitoring-concept-2015]

- **Level 1**(기능 층): 요구된 엔진 토크를 구현하는 엔진 제어 기능과 부품 감시, 입출력 진단을 담고, [[fault-error-failure|fault]]를 검출하면 시스템 반응을 제어한다.
- **Level 2**(기능 감시 층): 따로 계산한 허용 엔진 토크와 실제 엔진 토크를 견주어(가속도로 감시하는 시스템은 허용 차량 가속도와 실제 차량 가속도를 견주어) Level 1 기능 소프트웨어의 잘못된 처리를 검출하고, fault면 시스템 반응을 일으킨다.
- **Level 3**(제어기 감시 층): 기능 제어기와 따로 된 하드웨어인 감시 모듈이 질의-응답으로 기능 제어기가 프로그램을 올바로 실행하는지 시험하고, fault면 기능 제어기와 따로 시스템 반응을 일으킨다.[@egas-monitoring-concept-2015]

![[diagrams/e-gas-three-level-monitoring.svg]]

이 개념은 참조 문서로 [[iso-26262|ISO 26262]] 1판(2011-11-15)을 들고, 시스템 정의, 해저드 분석과 리스크 분석, functional safety concept, technical safety concept의 순서로 절을 둔다.[@egas-monitoring-concept-2015]

해저드 분석과 리스크 분석의 결과로 이 개념은 [[hazard-analysis-and-risk-assessment#Safety goal|safety goal]] 넷을 정한다. 의도하지 않은 가속의 방지(SZ-01)는 [[automotive-safety-integrity-level|ASIL]] B다. 가속이 없는 것의 방지(SZ-02), 의도하지 않은 감속의 방지(SZ-03), 감속이 없는 것의 방지(SZ-04)는 통제 가능한 상태를 나타내므로 이 개념에서 다루지 않는다.[@egas-monitoring-concept-2015]

이 개념에서 **주행 주기**(driving cycle)는 키로 엔진을 시동한 때부터 정지할 때까지의 운용 시간이고, 엔진 제어기의 power latch 시간을 포함한다. **Latent error**는 다음 주행 주기에 엔진 제어기도 운전자도 검출하지 못한 error다.[@egas-monitoring-concept-2015]

이 개념은 단일 error와, latent error와 겹친 단일 error가 통제 가능한 시스템 반응으로 이어지도록 시스템을 설계하게 하고, 시스템 가용성을 위해 단계적인 error 반응을 지향한다. 신호 경로는 명시적으로 검출한 뒤(예: debouncing 사건이나 시간 뒤) 반응을 일으키기 전에 confirmed defect로, 그 전에는 assumed defect로 분류하고, 두 경우마다 기능에 알맞은 반응 메커니즘을 정한다. 엔진 정지는 다른 통제 가능한 시스템 반응을 보장할 수 없을 때만 허용한다.[@egas-monitoring-concept-2015]

### Level 2의 독립성

이 개념은 Level 2가 감시 대상 기능을 Level 1과 따로 계산하게 하고, 두 층을 독립으로 개발해 systematic error가 두 층에 같은 영향을 주지 않게 한다.[@egas-monitoring-concept-2015]

### Level 3의 질의-응답

이 개념의 감시 모듈은 질의를 주기적으로 기능 제어기에 보내고, 기능 제어기의 Level 3 소프트웨어는 응답을 계산해 정한 시간 안에 돌려준다. 응답이 틀리거나 정한 때에 오지 않으면 감시 모듈은 오류 계수기를 올리고 질의를 되풀이하며, 계수기가 한계에 이르면 액추에이터 출력단을 끈다.[@egas-monitoring-concept-2015]

기능 제어기도 자기 오류 계수기가 한계에 이르면 액추에이터 출력단을 끈다. 이 개념은 주행 주기마다 중복 차단 경로(redundant shutoff path)의 효과를 시험하게 한다.[@egas-monitoring-concept-2015]

질의-응답의 반복 주기 $T$는 $T \le 80\,\mathrm{ms}$여야 한다. Level 3 소프트웨어의 시험 경로 가운데 명령어 집합 시험은 프로세서 코어와 Level 2 기능 처리의 error를 검출하고, 제어기 내부의 error 검출 하드웨어를 쓰는 방식에서는 [[fault-tolerance#다중 채널과 비교|lockstep]] core의 결과를 base core의 결과와 견주어 다르면 error 반응을 일으킨다. 멀티코어 제어기에서는 Level 2 모듈이 실행되는 코어를 모두 이 명령어 집합 시험의 방식으로 시험한다.[@egas-monitoring-concept-2015]

TMS320F28003x는 E-Gas 감시 개념의 Level 3 checker가 외부 부품으로 구현할 [[safety-requirement|안전 요구사항]]을 가정하고, 그 부품으로 공급 전원을 감시하는 외부 전압 감시기, 진단에 쓰는 외부 [[safety-mechanism#Watchdog|watchdog]] 타이머, 안전 상태로 옮기는 데 필요한 부품을 든다.[@ti-sffs277-2023]

## 개정 이력

- 2013년: 5.5판(2013-07-05)이 나왔다.[@egas-monitoring-concept-2013]
- 2015년: 6.0판이 나왔다.[@egas-monitoring-concept-2015]

## ISO 26262·AUTOSAR와의 관계

ISO 26262-11:2018은 참고문헌에 E-Gas 감시 개념 6.0판을 든다.[@iso-26262-11-obp-2018]

[[autosar|AUTOSAR]] R25-11의 Functional Safety Measures 문서는 E-Gas 감시 개념을 EGAS 작업 그룹이 표준화한, AUTOSAR 표준에 들지 않는 안전 개념으로 둔다. 이 문서는 감시 소프트웨어를 CDD(Complex Driver)에 두어 관련 입출력에 직접 접근하게 하는 설계를 AUTOSAR Release 4.0으로 쓸 수 있게 하는 기능으로 데이터 손상·손실에 대한 통신 보호, 입출력 데이터와 입출력 하드웨어의 시험·감시, 감시 소프트웨어의 입력 원시 값 접근 같은 것을 든다.[@autosar-cp-exp-functionalsafetymeasures-2025]
