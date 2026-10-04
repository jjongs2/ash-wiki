---
title: CMMI
tags:
  - process/sw-process
aliases:
  - Capability Maturity Model Integration
verified: 2026-10-02
publisher: ISACA
edition: 2023
status: 유효
---

**CMMI**(Capability Maturity Model Integration)는 조직이 업무 성과를 높이도록 돕는 모범 사례(best practice) 모델이다.[@isaca-cmmi-performance-solutions-2026] 처음에는 산업계, 정부, SEI 사람으로 꾸린 CMMI Product Team이 만들었고,[@sei-cmmi-short-history-2009] 지금은 ISACA가 펴낸다.[@isaca-cmmi-three-new-domains-2023]

## 범위

ISACA에 따르면 CMMI는 [[software-engineering|소프트웨어 공학]]을 넘어 업종에 관계없이 쓰인다.[@isaca-cmmi-performance-solutions-2026] CMMI 모델과 조직의 프로세스 사이의 관계는 [[software-process#프로세스 모델과 조직의 프로세스|소프트웨어 프로세스]]에서 다룬다. CMMI 3.0은 개발(Development), 서비스(Services), 공급자 관리(Supplier Management), 보안(Security), 안전(Safety), 데이터 관리(Data Management), 인력 관리(People Management), 가상 업무(Virtual Work)의 여덟 도메인을 한 모델 안에 둔다.[@isaca-cmmi-three-new-domains-2023] CMMI 3.0은 모범 사례를 프랙티스 영역(practice area)으로 묶고, 프랙티스 영역 안의 프랙티스를 Level 0\~3의 프랙티스 그룹으로 나눈다.[@cmmi-institute-levels-2026]

### 성숙도 수준과 능력 수준

CMMI 3.0은 프랙티스 영역마다 **능력 수준**(capability level)을 두고, 정해 둔 프랙티스 영역 묶음에는 단계형 경로로 **성숙도 수준**(maturity level)을 둔다. 성숙도 수준은 0\~5(Incomplete, Initial, Managed, Defined, Quantitatively Managed, Optimizing), 능력 수준은 0\~3(Incomplete, Initial, Managed, Defined)이다.[@cmmi-institute-levels-2026]

CMMI 1.3은 두 표현 방식을 두었다. 연속형 표현(continuous representation)은 프로세스 영역마다 능력 수준 0\~3(Incomplete, Performed, Managed, Defined)을 매겼고, 단계형 표현(staged representation)은 여러 프로세스 영역에 걸친 조직의 개선 성취에 성숙도 수준 1\~5(Initial, Managed, Defined, Quantitatively Managed, Optimizing)를 매겼다. CMMI 3.0에서는 성숙도 수준 0이 생겼고, 능력 수준 1의 이름이 Performed에서 Initial로 바뀌었다.[@cmmi-institute-levels-2026][@cmmi-product-team-cmmi-development-2010]

![[diagrams/cmmi-capability-maturity-levels.svg]]

### 평가

CMMI 평가(appraisal)는 조직의 프로세스가 CMMI 모범 사례와 얼마나 맞는지 견주어 강점과 약점을 찾는 활동이다. 평가 방법은 CMMI Appraisal Method이고, 그 정의는 Method Definition Document에 있다.[@cmmi-institute-appraisals-2026] CMMI 1.3은 평가 방법으로 SCAMPI(Standard CMMI Appraisal Method for Process Improvement)를 두었다. SCAMPI에는 A, B, C 등급이 있고, 벤치마크 등급은 SCAMPI A로만 낼 수 있었다.[@cmmi-product-team-cmmi-development-2010] CMMI 2.0은 새 성과 중심 평가 방법을 들였다.[@cmmi-institute-cmmi-development-v2-0-2018]

ASPICE와의 차이는 [[automotive-spice#CMMI와의 차이|ASPICE]]에서, ASPICE가 쓰는 능력 수준은 [[process-capability-level|프로세스 능력 수준]]에서 다룬다.

## 개정 이력

- 1991년: SEI가 소프트웨어용 CMM(Capability Maturity Model for Software) 1.0을 냈다.[@paulk-capability-maturity-model-1993]
- 1993년: 소프트웨어용 CMM 1.1이 나왔다.[@paulk-capability-maturity-model-1993]
- 2000년: CMMI Product Team이 첫 CMMI 모델(V1.02)을 냈다. 소프트웨어용 CMM v2.0 draft C, SECM(Systems Engineering Capability Model, EIA 731), IPD-CMM(Integrated Product Development CMM) v0.98의 세 원천 모델을 합친 것이다.[@cmmi-product-team-cmmi-development-2010]
- 2002년: CMMI 1.1이 나왔다.[@cmmi-product-team-cmmi-development-2010]
- 2006년: CMMI 1.2가 나왔다. 첫 모델의 이름이 CMMI for Development로 바뀌고 컨스텔레이션(constellation) 개념이 생겼다. 같은 1.2판으로 획득(CMMI for Acquisition, 2007)과 서비스(CMMI for Services, 2009) 모델이 뒤따랐다.[@cmmi-product-team-cmmi-development-2010]
- 2010년: 획득, 개발, 서비스 세 모델의 1.3판이 함께 나왔다.[@cmmi-product-team-cmmi-development-2010]
- 2018년: CMMI Institute가 CMMI Development V2.0을 냈다.[@cmmi-institute-cmmi-development-v2-0-2018]
- 2023년: CMMI 3.0. 현행판이다. 데이터 관리, 인력 관리, 가상 업무 도메인을 더했다.[@isaca-cmmi-three-new-domains-2023][@isaca-cmmi-updates-next-level-2023]

SEI는 미 국방부가 후원하는 연방 출연 연구개발센터다.[@cmmi-product-team-cmmi-development-2010] 2012년 카네기멜런 대학이 CMMI Institute를 세웠다.[@cmmi-institute-company-2026] SEI의 CMMI 연구, 교육, 정보 업무는 CMMI Institute로 넘어갔다.[@sei-cmmi-short-history-2009] 2016년 ISACA가 CMMI Institute를 인수했다.[@cmmi-institute-company-2026]
