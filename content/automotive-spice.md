---
title: Automotive SPICE
tags:
  - process/sw-process
aliases:
  - ASPICE
verified: 2026-10-02
publisher: VDA QMC
edition: 2026
status: 유효
---

**Automotive SPICE**는 차량용 임베디드 시스템을 개발하는 조직의 프로세스 능력을 평가하는 데 쓰는 프로세스 참조 모델이자 프로세스 평가 모델이다. 그 지표는 프로세스 개선에도 쓸 수 있다. 이름의 SPICE는 Systems/Software Process Improvement and Capability dEtermination을 줄인 것이다. 독일 자동차산업협회 VDA의 품질경영센터인 VDA QMC(VDA Quality Management Center)가 펴낸다.[@vda-automotive-spice-pam-4-1-2026]

## 범위

Automotive SPICE 4.1은 프로세스 참조 모델(PRM, process reference model)과 프로세스 평가 모델(PAM, process assessment model)을 한 문서에 담는다. 프로세스 참조 모델은 프로세스마다 목적과 성과(outcome)를 정의하고, 프로세스 평가 모델은 프로세스 성과와 프로세스 속성 달성이 있는지를 평가자가 판단할 지표를 둔다. Automotive SPICE 4.1은 ISO/IEC 33020:2019를 고쳐 맞춘 자체 측정 프레임워크를 두고, 이 프레임워크로 프로세스마다 능력 수준을 따로 매긴다.[@vda-automotive-spice-pam-4-1-2026]

Automotive SPICE 4.1의 프로세스 참조 모델과 프로세스 평가 모델은 프로세스가 무엇을 이뤄야 하는지를 다루고, 그것을 이룰 방법, 도구, 템플릿은 정하지 않는다. 문서는 VDA QMC 웹사이트에서 내려받아서만 얻을 수 있고, 받은 사람이 다시 배포할 수 없다.[@vda-automotive-spice-pam-4-1-2026]

프로세스 목록과 평가 범위를 짜는 plug-in 컨셉은 [[automotive-spice-process-reference-model|Automotive SPICE 프로세스 참조 모델]]에서, 지표의 구조는 [[automotive-spice-process-assessment-model|Automotive SPICE 프로세스 평가 모델]]에서, 능력 수준과 등급은 [[process-capability-level|프로세스 능력 수준]]에서 다룬다.

VDA QMC는 Automotive SPICE에 사이버보안 내용을 더하는 확장으로 Automotive SPICE for Cybersecurity를 따로 펴낸다.[@vda-automotive-spice-publications-2026] 그 2.0판은 Automotive SPICE 4.0을 보완하는 문서로, 사이버보안 엔지니어링 프로세스 그룹과 사이버보안 위험 관리, 공급자 요청·선정 프로세스를 더한다.[@vda-automotive-spice-cybersecurity-pam-2-0-2025]

## 배경

Audi, BMW, DaimlerChrysler, Porsche, Volkswagen은 HIS(Herstellerinitiative Software)를 꾸려 공동 표준을 만들었다. HIS의 평가 작업 그룹은 협력업체의 소프트웨어 프로세스 능력을 판정하는 공통 방식을 세우려고 만들어졌다. HIS 회원사를 포함한 유럽 완성차 업체들은 Procurement Forum, SPICE User Group과 함께 Automotive SPICE 이니셔티브를 시작했다.[@his-wg-assessment-2006]

이 이니셔티브 안에서 Procurement Forum과 SPICE User Group의 공동 Automotive SIG(Special Interest Group)가 완성차 업체들의 합의로, 프로세스 평가 표준 ISO/IEC 15504에 맞춘 프로세스 참조 모델과 프로세스 평가 모델을 만들었다. 이것이 Automotive SPICE다.[@automotive-sig-aspice-pam-2-5-2010] Automotive SIG의 완성차 업체들은 평가 결과를 협력업체의 개선점을 찾고 협력업체를 고르는 기준으로 썼다.[@automotive-sig-release-statement-2008] VDA QMC에 따르면 주요 완성차 업체와 협력업체가 Automotive SPICE로 차량 소프트웨어 기반 시스템의 개발 프로세스를 평가한다.[@vda-automotive-spice-2026]

ISO/IEC 330xx 계열은 ISO/IEC 15504 시리즈의 여러 부를 대체하고 넓히도록 만들어졌다.[@iso-iec-33020-obp-2019] Automotive SPICE 2.5는 ISO/IEC 15504-2에 맞춘 평가에 쓰는 모델이었고, 3.0은 ISO/IEC 330xx 계열에 맞춰 고치면서 측정 프레임워크를 ISO/IEC 33020에 맞췄다. Automotive SPICE 4.1은 ISO/IEC 33004:2015의 요구사항에 맞춰 만들어졌다.[@vda-automotive-spice-pam-4-1-2026][@automotive-sig-aspice-pam-2-5-2010][@vda-automotive-spice-pam-3-1-2017]

## 개정 이력

- 2005년: Automotive SIG가 프로세스 참조 모델 4.2와 프로세스 평가 모델 2.2를 정식으로 펴냈다.[@vda-automotive-spice-pam-4-1-2026][@automotive-sig-aspice-prm-4-5-2010]
- 2010년: Automotive SIG가 프로세스 참조 모델 4.5와 프로세스 평가 모델 2.5를 함께 펴냈다. 프로세스 참조 모델은 별도 문서였다.[@automotive-sig-aspice-pam-2-5-2010][@automotive-sig-aspice-prm-4-5-2010]
- 2015년: 3.0. VDA QMC 워킹 그룹 13이 맡아, 따로 있던 프로세스 참조 모델과 프로세스 평가 모델을 한 문서로 합쳤다.[@vda-automotive-spice-pam-3-1-2017]
- 2017년: 3.1. 3.0을 조금 고친 판이다.[@vda-automotive-spice-pam-3-1-2017]
- 2023년: 4.0. 하드웨어 엔지니어링(HWE), 머신러닝 엔지니어링(MLE), 확인(VAL) 프로세스 그룹을 더했고, 결과 쪽 지표를 작업 산출물 특성(WPC, work product characteristics)에서 정보 항목 특성(IIC, information item characteristics)으로 바꿨다.[@vda-automotive-spice-pam-3-1-2017][@vda-automotive-spice-pam-4-0-2023]
- 2026년: 4.1. 현행판이다. MLE.2의 다섯째 BP(base practice)를 빼고 문구를 다듬었다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-publications-2026]

## CMMI와의 차이

ISACA의 [[cmmi|CMMI]]는 업종을 가리지 않고 쓰는 프로세스 개선 모델이고,[@isaca-cmmi-performance-solutions-2026] Automotive SPICE 4.1은 차량용 임베디드 시스템 개발을 대상으로 한다.[@vda-automotive-spice-pam-4-1-2026]

Automotive SPICE 4.1은 평가 대상 프로세스마다 능력 수준을 0부터 5까지 여섯 단계로 매긴다.[@vda-automotive-spice-pam-4-1-2026] CMMI는 프랙티스 영역마다 매기는 능력 수준 0\~3과, 정해 둔 프랙티스 영역 묶음에 매기는 성숙도 수준 0\~5를 함께 둔다.[@cmmi-institute-levels-2026]

Automotive SPICE 4.1은 측정 프레임워크를 ISO/IEC 33003:2015에 맞춰 두고, 평정 방법은 ISO/IEC 33020:2019에서 가져온다.[@vda-automotive-spice-pam-4-1-2026] CMMI 평가는 ISACA가 정한 CMMI Appraisal Method를 따른다.[@cmmi-institute-appraisal-method-2026]
