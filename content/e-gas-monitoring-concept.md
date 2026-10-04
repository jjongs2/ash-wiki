---
title: E-Gas 감시 개념
tags:
  - process/sw-process
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

### Level 2의 독립성

E-Gas 감시 개념 6.0판은 Level 2가 감시 대상 기능을 Level 1과 따로 계산하게 하고, 두 층을 독립으로 개발해 체계적 error가 두 층에 같은 영향을 주지 않게 한다.[@egas-monitoring-concept-2015]

### Level 3의 질의-응답

E-Gas 감시 개념 6.0판의 감시 모듈은 질의를 주기적으로 기능 제어기에 보내고, 기능 제어기의 Level 3 소프트웨어는 응답을 계산해 정한 시간 안에 돌려준다. 응답이 틀리거나 정한 때에 오지 않으면 감시 모듈은 오류 계수기를 올리고 질의를 되풀이하며, 계수기가 한계에 이르면 액추에이터 출력단을 끈다.[@egas-monitoring-concept-2015]

기능 제어기도 자기 오류 계수기가 한계에 이르면 액추에이터 출력단을 끈다. 이 개념은 주행 주기마다 중복 차단 경로(redundant shutoff path)의 효과를 시험하게 한다.[@egas-monitoring-concept-2015]

## 개정 이력

- 2015년: 6.0판이 나왔다.[@egas-monitoring-concept-2015]
