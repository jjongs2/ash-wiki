---
title: Automotive SPICE for Cybersecurity
tags:
  - security/cybersecurity
  - sw-engineering/sw-process
aliases:
  - ASPICE for Cybersecurity
verified: 2026-10-03
publisher: VDA QMC
edition: 2025
status: 유효
---

**Automotive SPICE for Cybersecurity**는 [[cybersecurity|사이버보안]] 엔지니어링을 위한 [[automotive-spice-process-reference-model|프로세스 참조 모델]]과 [[automotive-spice-process-assessment-model|프로세스 평가 모델]]을 정의해 [[automotive-spice|ASPICE]]를 보완하는 VDA QMC의 문서다.[@vda-automotive-spice-cybersecurity-2025]

## 범위

Automotive SPICE for Cybersecurity 2.0은 ASPICE 4.0을 보완해, ASPICE의 평가 범위에 사이버보안 프로세스를 더하려고 아래 여섯 프로세스를 정의한다. [[cybersecurity-interface-agreement#Automotive SPICE for Cybersecurity의 ACQ.2|ACQ.2]]와 SEC(사이버보안 엔지니어링) 그룹은 주 프로세스 범주에, [[threat-analysis-and-risk-assessment#Automotive SPICE for Cybersecurity의 MAN.7|MAN.7]]은 조직 프로세스 범주에 든다.[@vda-automotive-spice-cybersecurity-2025]

| 프로세스                                                                                              | 이름                                   | 범주          |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------- |
| ACQ.2                                                                                                 | Supplier Request and Selection         | 주 프로세스   |
| MAN.7                                                                                                 | Cybersecurity Risk Management          | 조직 프로세스 |
| [[cybersecurity-goal#Automotive SPICE for Cybersecurity의 SEC.1\|SEC.1]]                              | Cybersecurity Requirements Elicitation | 주 프로세스   |
| [[cybersecurity-specification#Automotive SPICE for Cybersecurity의 SEC.2\|SEC.2]]                     | Cybersecurity Implementation           | 주 프로세스   |
| [[cybersecurity-verification-and-validation#Automotive SPICE for Cybersecurity의 SEC.3·SEC.4\|SEC.3]] | Risk Treatment Verification            | 주 프로세스   |
| [[cybersecurity-verification-and-validation#Automotive SPICE for Cybersecurity의 SEC.3·SEC.4\|SEC.4]] | Risk Treatment Validation              | 주 프로세스   |

ACQ.2는 ASPICE 4.1의 프로세스 참조 모델에는 없고, Automotive SPICE for Cybersecurity 2.0이 정의한다.[@vda-automotive-spice-cybersecurity-2025][@vda-automotive-spice-pam-4-1-2026]

[[automotive-spice-process-reference-model#VDA scope|VDA scope]]는 ASPICE 3.x가 쓴 이름이고, ASPICE 4.1은 이 이름을 쓰지 않는다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017] Automotive SPICE for Cybersecurity 2.0으로 평가하려면 권장 VDA scope에 대한 ASPICE 평가 결과가 먼저 있어야 한다. 이 평가 모델은 VDA scope를 정의하지 않고, 권장 VDA scope에 드는 프로세스도 나열하지 않는다. 그 ASPICE 평가 결과가 없으면 VDA scope의 프로세스를 이 문서의 프로세스 평가 모델과 ASPICE의 프로세스 평가 모델로 함께 평가해야 한다. 평가 범위는 평가 의뢰자가 정한다. 기존 평가 결과를 쓰면 SUP(지원) 그룹은 다시 평가하지 않아도 되고, 공급자가 [[cybersecurity-goal|cybersecurity goal]]의 확인(validation)에 관여하지 않으면 SEC.4를 범위에서 뺄 수 있다.[@vda-automotive-spice-cybersecurity-2025]

이 모델은 [[iso-sae-21434|ISO/SAE 21434]] 가운데 개발 프로젝트 안에서 하지 않는 측면을 범위에서 빼고, 이 측면을 ISO/PAS(Publicly Available Specification) 5112와 [[cybersecurity-management-system#감사|CSMS 감사]]의 몫으로 둔다. 이 문서로 한 평가는 사이버보안 활동을 하는 프로젝트의 빈틈과 프로세스 약점을 찾아 조직의 사이버보안 프로세스를 개선하는 입력으로 주고, 조직은 그 개선으로 CSMS를 조정하고 다듬을 수 있다.[@vda-automotive-spice-cybersecurity-2025]

![[diagrams/aspice-cybersecurity-iso-sae-21434-scope.svg]]

Automotive SPICE for Cybersecurity 2.0의 인쇄본(2판)은 두 부로 이뤄진다. Part I은 사이버보안 엔지니어링의 프로세스 참조 모델과 프로세스 평가 모델이고, Part II는 Part I의 프로세스에 대해 프로세스 수행([[process-capability-level|능력 수준]] 1)을 평정하는 지침이다. VDA QMC는 Part I에 해당하는 프로세스 참조 모델과 프로세스 평가 모델 2.0을 무료 PDF로 공개하고, 두 부를 묶은 인쇄본을 판다.[@vda-automotive-spice-cybersecurity-webshop-2025][@vda-automotive-spice-publications-2026]

## 개정 이력

- 2021년: 1.0. 7월 16일 나왔다. Part I은 ASPICE 3.1의 프로세스 평가 모델을 보완했고, Part II는 [[process-assessment#ASPICE Guidelines|ASPICE Guideline]] 1판을 보완하는 해석·평정 지침이었다. 무료로 내려받는 판에는 Part II가 빠져 있었다. 1.0의 SEC.1은 [[threat-analysis-and-risk-assessment#Automotive SPICE for Cybersecurity의 MAN.7|리스크 처리 결정]]이 리스크 감소를 요구하는 위협 시나리오에 대해서만 cybersecurity goal을 끌어내게 했고, 범위 밖의 ISO/SAE 21434 측면은 ACSMS(Automotive Cybersecurity Management System Audit)가 다룬다고 했다.[@vda-automotive-spice-cybersecurity-2021] 1.0은 ASPICE 3.1의 프로세스 참조 모델에 없던 ACQ.2를 정의했다.[@vda-automotive-spice-pam-3-1-2017][@vda-automotive-spice-cybersecurity-2021]
- 2025년: 2.0. 3월 28일 나왔다. 현행판이다. 프로세스 평가 모델을 고쳐 ASPICE 4.0에 맞췄다.[@vda-automotive-spice-cybersecurity-2025] 1.0은 ASPICE 3.1과 함께 시스템과 소프트웨어 엔지니어링만 다뤘고, 2.0은 ASPICE 4.0과 함께 하드웨어 엔지니어링까지 다룬다.[@vda-automotive-spice-cybersecurity-2025][@vda-automotive-spice-cybersecurity-2021]
