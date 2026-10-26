---
title: ISO/IEC/IEEE 12207
tags:
  - sw-engineering/sw-process
verified: 2026-10-02
publisher: ISO/IEC/IEEE
edition: 2026
status: 유효
---

**ISO/IEC/IEEE 12207**은 소프트웨어 생명주기 프로세스의 공통 틀을 정하는 국제 표준이다.[@iso-iec-ieee-12207-obp-2026] 정식 제목은 "Systems and software engineering — Software life cycle processes"이다.[@iso-iec-ieee-12207-2026] ISO/IEC JTC 1/SC 7이 IEEE Computer Society의 Systems and Software Engineering Standards Committee와 협력해 준비했다.[@iso-iec-ieee-12207-obp-2026]

## 범위

이 표준은 소프트웨어 시스템과 소프트웨어 제품·서비스를 획득하고 공급하고 개발하고 운용하고 유지보수하고 폐기할 때 적용할 프로세스, 활동, 태스크를 정한다. 소프트웨어 시스템과 서비스의 맥락을 주는 데 필요한 만큼은 시스템 정의의 측면도 담는다. 조직 안에서 하든 밖에서 하든 적용하고, 한 조직 안에서도 여러 당사자 사이에서도 쓸 수 있으며, 획득자와 공급자가 합의를 만들 때도 쓴다. 특정 소프트웨어 생명주기 모델이나 개발 방법론을 정하거나 요구하지 않는다.[@iso-iec-ieee-12207-obp-2026]

이 표준은 펌웨어의 소프트웨어 부분도 소프트웨어에 넣고, 여러 공식 공학 접근을 쓰는 조직과 소프트웨어 프로젝트에 적용할 수 있다. 소프트웨어 개발과 유지보수에 가장 널리 쓰이는 [[agile-software-development|애자일]] 접근과 방법에도 적용할 수 있다. 원하는 품질 수준을 이루는 데 공학적 판단을 쓰는 일은 이 표준의 범위 밖이다.[@iso-iec-ieee-12207-obp-2026]

이 표준은 다음 쓰임 가운데 하나 이상으로 쓸 수 있다.[@iso-iec-ieee-12207-obp-2026]

| 쓰는 쪽         | 쓰임                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 조직            | 원하는 프로세스의 환경을 세우고, 그 환경으로 프로젝트를 수행·관리한다. 선언한 환경이 이 표준을 따르는지 평가하는 데도 쓴다.                                           |
| 프로젝트        | 세운 환경의 요소를 골라 짜고 써서 제품과 서비스를 내놓는다. 프로젝트가 선언한 환경을 따르는지 평가하는 데도 쓴다.                                                     |
| 획득자와 공급자 | 프로세스와 활동에 대한 합의를 만든다. 합의로 이 표준의 프로세스와 활동을 고르고, 협상하고, 수행한다.                                                                  |
| 프로세스 평가자 | 조직의 [[process-improvement\|프로세스 개선]]을 뒷받침하는 [[process-assessment\|프로세스 평가]]에서 [[process-assessment#프로세스 모델\|프로세스 참조 모델]]로 쓴다. |

이 표준은 생명주기 프로세스를 네 그룹으로 나누고, 그룹마다 다음 프로세스를 둔다.[@iso-iec-ieee-12207-obp-2026]

| 그룹                                                           | 프로세스                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 합의(agreement) 프로세스                                       | Acquisition, Supply                                                                                                                                                                                                                                                                  |
| 조직의 프로젝트 지원(organizational project-enabling) 프로세스 | Life cycle model management, Infrastructure management, Portfolio management, Human resource management, Quality management, Knowledge management                                                                                                                                    |
| 기술 관리(technical management) 프로세스                       | Project planning, Project assessment and control, Decision management, Risk management, Configuration management, Information management, Measurement, Quality assurance                                                                                                             |
| 기술(technical) 프로세스                                       | Business or mission analysis, Stakeholder needs and requirements definition, System requirements definition, System architecture definition, Design definition, System analysis, Implementation, Integration, Verification, Transition, Validation, Operation, Maintenance, Disposal |

이 표준은 시스템 생명주기 프로세스 표준 [[iso-iec-ieee-15288|ISO/IEC/IEEE 15288]]:2023과 프로세스의 목적과 결과는 같고, 활동과 태스크는 [[software-engineering|소프트웨어 공학]]용과 시스템 공학용으로 서로 다르다고 둔다.[@iso-iec-ieee-12207-obp-2026]

[[iso-iec-ieee-15288#ISO/IEC/IEEE 12207과의 관계|ISO/IEC/IEEE 15288]]:2023은 두 문서가 활동과 태스크 대부분을 함께 가지며, 주로 설명 노트에서 다르다고 둔다.[@iso-iec-ieee-15288-obp-2023]

## 개정 이력

- 1995년: ISO/IEC 12207:1995. 첫판.[@iso-iec-12207-1995]
- 2008년: ISO/IEC 12207:2008. 2판으로, 1995년판과 그 개정 두 건(Amd 1:2002, Amd 2:2004)을 대체했다.[@iso-iec-12207-2008] ISO/IEC와 IEEE가 함께 개발했고, IEEE에서는 IEEE Std 12207-2008로 나왔다.[@ieee-12207-2008]
- 2017년: ISO/IEC/IEEE 12207:2017. ISO/IEC/IEEE 12207로는 첫판이고, ISO/IEC 12207:2008을 대체했다.[@iso-iec-ieee-12207-obp-2017]
- 2026년: ISO/IEC/IEEE 12207:2026. 2판으로, 2017년판을 대체했다. 사업·임무 분석, [[system-architecture|시스템 아키텍처]] 정의, 구현, 통합, 운용, 유지보수 같은 기술 프로세스를 그때의 관행에 맞게 다듬고, 리스크 관리와 [[configuration-management|형상 관리]] 같은 기술 관리 프로세스를 개선했다. 핵심 개념을 다루는 5절에서 반복, 재귀, 시스템의 시스템, 품질 특성의 설명을 고치고, 구상과 시스템 정의에 관한 내용을 새로 넣고, 애자일 방법과 프로세스 적용, 시스템 개념의 내용을 넓혔다. MBSSE(model-based systems and software engineering)를 다루는 Annex D도 고쳤다.[@iso-iec-ieee-12207-obp-2026]

## ASPICE, ISO/IEC TS 33061과의 관계

[[automotive-spice|ASPICE]] 4.1은 그 [[automotive-spice-process-reference-model|프로세스 참조 모델]]을 ISO/IEC 12207을 바탕으로 자동차 산업에 맞게 발전시킨 것으로 두고, 자기 범위 밖의 프로세스는 ISO/IEC 12207이나 ISO/IEC/IEEE 15288 같은 다른 프로세스 참조 모델에서 가져와 더할 수 있게 둔다.[@vda-automotive-spice-pam-4-1-2026] ASPICE의 프로세스 참조 모델 4.5판(2010)은 ISO/IEC 12207 Amd 1:2002의 Annex F와 H, Amd 2:2004에서 프로세스 일부를 가져와 자동차 분야에 맞게 고쳤다.[@automotive-sig-aspice-prm-4-5-2010]

ISO/IEC TS 33061:2021은 ISO/IEC 330xx 계열의 소프트웨어 생명주기 [[process-assessment#프로세스 모델|프로세스 평가 모델]]로, ISO/IEC/IEEE 12207이 정의한 프로세스 참조 모델을 바탕으로 한다. ISO/IEC TS 33061은 ISO/IEC 12207:2008의 프로세스 정의로 프로세스 참조 모델을 삼았던 ISO/IEC 15504-5:2012를 대체했다.[@iso-iec-ts-33061-obp-2021][@iso-iec-15504-5-2012]

![[diagrams/iso-iec-12207-edition-lineage.svg]]
