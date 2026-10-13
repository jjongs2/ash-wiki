---
title: ASPICE 프로세스 참조 모델
tags:
  - process/sw-process
verified: 2026-10-02
---

**ASPICE 프로세스 참조 모델**(process reference model, PRM)은 [[automotive-spice|ASPICE]]가 평가할 프로세스를 모아 두고, 프로세스마다 ID(identifier), 이름, 목적, 성과를 정의한 모델이다. [[automotive-spice-process-assessment-model|프로세스 평가 모델]]은 이 모델에서 프로세스를 골라 지표를 더하고, 평가자는 그 지표로 객관적 증거를 모아 프로세스를 평정한다. 이 모델은 프로세스가 무엇을 이뤄야 하는지를 정할 뿐, 그것을 [[software-process#프로세스 모델과 조직의 프로세스|어떻게 이룰지]]와 작업 산출물의 구조는 정하지 않는다.[@vda-automotive-spice-pam-4-1-2026]

## 프로세스의 정의 요소

ASPICE 4.1은 프로세스마다 다음 네 가지를 정의한다.[@vda-automotive-spice-pam-4-1-2026]

| 요소          | 내용                                                                |
| ------------- | ------------------------------------------------------------------- |
| 프로세스 ID   | 프로세스마다 고유한 식별자. 그룹 약어 뒤에 번호를 붙인다. 예: SWE.1 |
| 프로세스 이름 | 예: Software Requirements Analysis                                  |
| 프로세스 목적 | 프로세스를 특정 환경에서 수행할 때 이루려는 고유한 기능 목표        |
| 프로세스 성과 | 목적마다 딸린 목록. 프로세스를 수행해 기대하는 긍정적 결과          |

이 표준은 프로세스마다 표 하나에 이 네 요소와 프로세스 평가 모델의 수행 지표인 BP(base practice)와 출력 정보 항목을 함께 싣는다.[@vda-automotive-spice-pam-4-1-2026]

## 프로세스 범주와 그룹

이 표준은 프로세스를 다루는 활동 분야에 따라 그룹으로 묶고, 그룹을 주 프로세스(primary processes), 조직 프로세스(organizational processes), 지원 프로세스(supporting processes)의 세 범주로 나눈다. 주 프로세스에는 ACQ(획득), SPL(공급), SYS(시스템 엔지니어링), VAL(확인), SWE(소프트웨어 엔지니어링), MLE(머신러닝 엔지니어링), HWE(하드웨어 엔지니어링)가, 조직 프로세스에는 MAN(관리), PIM(프로세스 개선), REU(재사용)가, 지원 프로세스에는 SUP(지원)가 든다.[@vda-automotive-spice-pam-4-1-2026]

세 범주의 뜻은 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

- **주 프로세스**: 공급자에게서 제품을 획득하는 쪽에 적용되거나, 이해관계자의 요구에 대응해 제품을 개발하고 인도하는 쪽에 적용될 수 있는 프로세스. 명세, 설계, 구현, 통합, 검증에 필요한 엔지니어링 프로세스를 포함한다.
- **조직 프로세스**: 프로세스, 제품, 자원의 자산을 개발하는 프로세스. 조직의 프로젝트가 이 자산을 쓰면 조직이 사업 목표를 이루는 데 도움이 될 수 있다.
- **지원 프로세스**: 다른 어느 프로세스든 생명주기의 여러 시점에서 쓸 수 있는 프로세스.[@vda-automotive-spice-pam-4-1-2026]

![[diagrams/aspice-process-categories-groups.svg]]

그룹마다의 프로세스와 그룹이 다루는 일은 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

| 그룹                       | 프로세스                                                                                                                                                                                                                                                           | 다루는 일                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| ACQ(획득)                  | ACQ.4 Supplier Monitoring                                                                                                                                                                                                                                          | 고객이, 또는 자기 공급자에게 고객 역할을 하는 공급자가 제품이나 서비스를 획득하려고 수행하는 프로세스 하나                                  |
| SPL(공급)                  | SPL.2 Product Release                                                                                                                                                                                                                                              | 공급자가 제품이나 서비스를 공급하려고 수행하는 프로세스 하나                                                                                |
| SYS(시스템 엔지니어링)     | SYS.1 Requirements Elicitation, SYS.2 System Requirements Analysis, SYS.3 System Architectural Design, SYS.4 System Integration and Integration Verification, SYS.5 System Verification                                                                            | 외부와 내부 요구사항의 도출과 관리, [[system-architecture\|시스템 아키텍처]] 정의, 시스템 수준의 통합과 검증                                |
| VAL(확인)                  | VAL.1 Validation                                                                                                                                                                                                                                                   | 인도할 제품이 의도한 용도의 기대를 충족한다는 증거를 내는 프로세스 하나                                                                     |
| SWE(소프트웨어 엔지니어링) | SWE.1 Software Requirements Analysis, SWE.2 Software Architectural Design, SWE.3 Software Detailed Design and Unit Construction, SWE.4 Software Unit Verification, SWE.5 Software Component Verification and Integration Verification, SWE.6 Software Verification | 시스템 요구사항에서 끌어낸 소프트웨어 요구사항의 관리, [[software-architecture\|소프트웨어 아키텍처]]와 설계, 소프트웨어의 구현, 통합, 검증 |
| MLE(머신러닝 엔지니어링)   | MLE.1 Machine Learning Requirements Analysis, MLE.2 Machine Learning Architecture, MLE.3 Machine Learning Training, MLE.4 Machine Learning Model Testing                                                                                                           | 소프트웨어 요구사항에서 끌어낸 ML(Machine Learning) 요구사항의 관리, ML 아키텍처 개발, ML 모델 학습, ML 요구사항에 대한 ML 모델 테스트      |
| HWE(하드웨어 엔지니어링)   | HWE.1 Hardware Requirements Analysis, HWE.2 Hardware Design, HWE.3 Verification against Hardware Design, HWE.4 Verification against Hardware Requirements                                                                                                          | 시스템 요구사항에서 끌어낸 하드웨어 요구사항의 관리, 하드웨어 아키텍처와 설계, 하드웨어 검증                                                |
| SUP(지원)                  | SUP.1 Quality Assurance, SUP.8 Configuration Management, SUP.9 Problem Resolution Management, SUP.10 Change Request Management, SUP.11 Machine Learning Data Management                                                                                            | 다른 어느 프로세스든 생명주기의 여러 시점에서 쓸 수 있는 프로세스                                                                           |
| MAN(관리)                  | MAN.3 Project Management, MAN.5 Risk Management, MAN.6 Measurement                                                                                                                                                                                                 | 생명주기 안에서 어떤 프로젝트나 프로세스든 관리하는 사람이 쓸 수 있는 프로세스                                                              |
| PIM(프로세스 개선)         | PIM.3 Process Improvement                                                                                                                                                                                                                                          | 조직 단위가 수행하는 프로세스를 개선하는 실천을 담은 프로세스 하나                                                                          |
| REU(재사용)                | REU.2 Management of Products for Reuse                                                                                                                                                                                                                             | 조직의 제품 포트폴리오에서 재사용 기회를 체계적으로 살리는 프로세스 하나                                                                    |

ASPICE 3.1은 세 범주를 primary life cycle processes, organizational life cycle processes, supporting life cycle processes라 불렀고, 프로세스 32개를 두었다. ACQ에 ACQ.3, ACQ.4, ACQ.11\~ACQ.15를, SPL에 SPL.1과 SPL.2를, SUP에 SUP.1, SUP.2, SUP.4, SUP.7\~SUP.10을 두었고, HWE, MLE, VAL 그룹은 없었다. ASPICE 4.1은 범주 이름에 life cycle을 쓰지 않고, 3.1의 ACQ, SPL, SUP 프로세스 가운데 ACQ.4, SPL.2, SUP.1, SUP.8\~SUP.10만 둔다. SUP.11과 HWE, MLE, VAL 그룹은 3.1에 없던 것이다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## 프로세스 목적

ASPICE 4.1이 정의하는 프로세스 목적 가운데 일부는 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

| 프로세스                                         | 목적                                                                                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| ACQ.4 Supplier Monitoring                        | 외부 계약 공급자의 수행을 합의한 약속에 비추어 추적하고 평가한다.                                                             |
| SPL.2 Product Release                            | 의도한 고객에게 제품을 출시하는 일을 통제한다.                                                                                |
| MLE.1 Machine Learning Requirements Analysis     | ML 관련 소프트웨어 요구사항을 ML 요구사항의 집합으로 구체화한다.                                                              |
| MLE.2 Machine Learning Architecture              | ML 모델의 학습과 배포를 받치고 ML 요구사항과 일관된 ML 아키텍처를 세우고, 정한 기준으로 평가한다.                             |
| MLE.3 Machine Learning Training                  | 정한 ML 요구사항을 충족하도록 ML 모델을 최적화한다.                                                                           |
| MLE.4 Machine Learning Model Testing             | 학습된 ML 모델과 배포된 ML 모델이 ML 요구사항을 따르는지 보장한다.                                                            |
| HWE.1 Hardware Requirements Analysis             | 시스템 요구사항, 시스템 아키텍처 설계와 일관되게, 구조화되고 분석된 하드웨어 요구사항을 세운다.                               |
| HWE.2 Hardware Design                            | 하드웨어 요구사항과 일관되고 제조에 알맞은, 동적 측면을 포함한 분석된 설계를 내고 생산 관련 데이터를 끌어낸다.                |
| HWE.3 Verification against Hardware Design       | 생산 데이터에 맞게 만든 하드웨어를 검증해 하드웨어 설계를 따른다는 증거를 낸다.                                               |
| HWE.4 Verification against Hardware Requirements | 완성된 하드웨어가 하드웨어 요구사항과 일관되는지 검증한다.                                                                    |
| SUP.11 Machine Learning Data Management          | ML 데이터를 ML 데이터 요구사항에 맞춰 정의하고, ML 데이터의 무결성과 품질을 유지하며, 영향받는 모든 당사자가 쓸 수 있게 한다. |
| MAN.3 Project Management                         | 프로젝트의 요구사항과 제약 안에서, 프로젝트가 제품을 개발하는 데 필요한 활동을 식별하고 통제하며 자원을 마련한다.             |
| MAN.5 Risk Management                            | 프로세스 관련 리스크와 제품 관련 리스크를 정기적으로 식별, 분석, 처리, 감시한다.                                              |
| MAN.6 Measurement                                | 조직과 프로젝트의 개발 결과와 프로세스에 관한 데이터를 모으고 분석해, 프로세스를 효과적으로 관리하도록 돕는다.                |
| REU.2 Management of Products for Reuse           | 재사용하는 (작업) 산출물을 대상 맥락에 맞게 분석하고 검증하고 승인한다.                                                       |

PIM.3 Process Improvement의 목적과 BP는 [[process-improvement#Process Improvement 프로세스|프로세스 개선]]에서 다룬다.

## 관리와 공급 프로세스의 BP

MAN.3 Project Management는 다음 BP를 둔다.[@vda-automotive-spice-pam-4-1-2026]

| BP   | 내용                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| BP1  | 프로젝트의 목표, 동기, 경계를 밝혀 작업 범위를 정한다.                                                                                    |
| BP2  | 프로젝트의 범위, 맥락, 복잡도에 맞는 [[v-model#반복 적용\|프로젝트 생명주기]]를 정하고, 주요 마일스톤마다 릴리스 범위를 정한다.           |
| BP3  | 시간, 추정치, 가용 자원에 비추어 프로젝트 목표를 이룰 수 있는지 평가한다.                                                                 |
| BP4  | 알맞은 크기의 작업 패키지와 그 의존 관계를 정하고 감시한다.                                                                               |
| BP5  | 공수와 자원의 추정치를 정하고 감시한다.                                                                                                   |
| BP6  | 필요한 기술, 지식, 경험을 정하고 감시한다.                                                                                                |
| BP7  | 이해관계자와의 인터페이스와 합의한 약속을 정하고 감시하며, 지켜지지 않은 약속의 에스컬레이션 방식을 정한다.                               |
| BP8  | 작업 패키지에 자원을 배정하고 일정을 짜고 감시한다.                                                                                       |
| BP9  | 추정치, 자원, 기술, 작업 패키지, 일정, 계획, 인터페이스, 약속을 정기적으로 조정해 작업 범위와 [[traceability#일관성\|일관성]]을 유지한다. |
| BP10 | 프로젝트 상태와 작업 패키지의 진척을 정기적으로 검토해 영향받는 모든 당사자에게 보고한다.                                                 |

MAN.5 Risk Management의 BP4는 리스크마다 수용, 완화, 회피, 공유(이전) 가운데 처리 옵션을 정하게 한다.[@vda-automotive-spice-pam-4-1-2026]

SPL.2 Product Release는 다음 BP를 둔다.[@vda-automotive-spice-pam-4-1-2026]

| BP  | 내용                                                                                             |
| --- | ------------------------------------------------------------------------------------------------ |
| BP1 | 릴리스마다 담을 기능을 고객과 정해 합의하고, 릴리스 기준을 정한다.                               |
| BP2 | 릴리스와 그것을 받치는 도구와 정보를 묶은 릴리스 패키지를 정한다.                                |
| BP3 | 릴리스마다 고유하게 식별되게 한다.                                                               |
| BP4 | 무결성을 지키도록 [[configuration-management\|형상 관리]]로 통제하는 항목으로 릴리스를 빌드한다. |
| BP5 | 인도 전에 릴리스 기준을 충족했는지 승인한다.                                                     |
| BP6 | 릴리스마다 주요 특성을 담은 릴리스 노트를 붙인다.                                                |
| BP7 | 릴리스마다 지원의 종류, 서비스 수준, 기간을 정해 알린다.                                         |
| BP8 | 합의대로 고객에게 릴리스 패키지를 인도한다.                                                      |

## 머신러닝 프로세스

MLE.1이 구체화한 ML 요구사항에는 ML 데이터 요구사항이 들고, 이것이 SUP.11의 입력이 된다. SUP.11을 적용하면 품질과 무결성을 보증받고 ML 데이터 요구사항을 충족하는 ML 데이터가 수집, 처리되어 영향받는 모든 당사자에게 제공된다.[@vda-automotive-spice-pam-4-1-2026]

SUP.11은 ML 데이터 생명주기와 상태 모델을 포함한 ML 데이터 관리 시스템을 세우고, ML 데이터 품질 기준을 담은 품질 접근을 마련하며, 데이터 편향을 피하는 활동을 하게 한다. 원시 데이터는 ML 데이터 요구사항에 따라 수집하고, 주석을 달고 분석하고 구조화해 처리한다.[@vda-automotive-spice-pam-4-1-2026]

MLE.4는 학습된 ML 모델을 시험한 뒤, ML 아키텍처에 따라 학습된 모델에서 배포된 ML 모델을 끌어내 그것도 따로 시험하게 한다. 두 시험 모두 SUP.11이 내준 ML 데이터로 만든 ML 테스트 데이터 세트를 쓰고, 이 데이터 세트는 학습에 쓰지 않는다. 배포된 모델은 대상 시스템에 통합되므로, 강력한 하드웨어가 필요하고 인터프리터 언어를 쓰는 경우가 많은 학습된 모델과 다를 수 있다.[@vda-automotive-spice-pam-4-1-2026]

## ISO/IEC 12207과의 관계

이 모델은 [[iso-iec-ieee-12207|ISO/IEC 12207]]을 바탕으로 만들어, 자동차 산업의 필요에 맞게 더 발전시키고 고친 것이다. 범위 밖의 프로세스가 필요하면 ISO/IEC 12207이나 [[iso-iec-ieee-15288|ISO/IEC/IEEE 15288]] 같은 다른 프로세스 참조 모델에서 프로세스를 더할 수 있다.[@vda-automotive-spice-pam-4-1-2026]

## Plug-in 컨셉

**Plug-in 컨셉**은 맨 위에 시스템 엔지니어링 프로세스를 두고, 개발할 제품에 따라 해당 엔지니어링 분야의 도메인 프로세스(예: HWE, SWE)를 평가 범위에 더하는 방식이다. 이 표준은 시스템 엔지니어링 프로세스를 시스템 V로 배치하고, plug-in 그림에서 SWE와 HWE 프로세스도 V 모양으로 그린다. 관리, 지원, 획득 같은 나머지 프로세스는 도메인에 묶이지 않아 시스템 수준과 도메인 수준 어디에나 적용할 수 있다.[@vda-automotive-spice-pam-4-1-2026] 개발 프로세스와 검증 프로세스를 마주 놓는 V 배치는 [[v-model|V 모델]]에서 다룬다.

이 표준의 엔지니어링 프로세스 그룹은 SYS, SWE, MLE, HWE이고, 기계 엔지니어링 프로세스는 없다. 그 밖의 도메인 프로세스는 VDA가 만들지 않았고 ASPICE에도 들지 않는다. 소프트웨어 아키텍처에서 머신러닝으로 개발할 소프트웨어 요소를 정하면, 그 요소에는 MLE 프로세스를, 나머지 component에는 SWE.3과 SWE.4를 적용한다.[@vda-automotive-spice-pam-4-1-2026]

ASPICE 3.1은 plug-in 컨셉의 도메인 예로 하드웨어(HWE), 기계(MEE), 소프트웨어(SWE)를 들고, HWE와 MEE 프로세스는 VDA QMC가 만들지 않은 예시로 그렸다. ASPICE 4.1은 예로 HWE와 SWE만 들고, 프로세스 참조 모델에 HWE.1\~HWE.4를 둔다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## VDA scope

**VDA scope**는 ASPICE 3.x가 쓴 이름으로, 자동차 산업에서 평가하는 매우 중요한 프로세스의 묶음이다. ASPICE 3.0은 4장을 고치며 이 묶음에 초점을 맞췄고, 3.1의 plug-in 그림은 SYS.1\~SYS.5, SWE.1\~SWE.6, MAN.3, ACQ.4, SUP.1, SUP.8, SUP.9, SUP.10을 VDA scope로 표시했다. ASPICE 4.1은 VDA scope라는 이름을 쓰지 않고, plug-in 그림에서 같은 프로세스에 HWE.1\~HWE.4를 더해 ASPICE 4.0의 프로세스 참조 모델과 프로세스 평가 모델로 표시한다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## Element, component, unit

ASPICE 4.1은 아키텍처와 설계의 구성 요소를 가리키는 용어로 system element, software element, software component, software unit, hardware element, hardware component, hardware part를 정의한다. 이 가운데 element와 소프트웨어 쪽 용어의 뜻은 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

| 용어               | 뜻                                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| System element     | 아키텍처나 설계 수준의 논리적·구조적 개체로, 더 잘게 나눌 수 있다. 그 개체를 물리적으로 나타낸 것(주변 장치, 센서, 액추에이터, 기계 부품, 소프트웨어 실행 파일)도 system element다. |
| Software element   | software component나 software unit                                                                                                                                                  |
| Software component | 소프트웨어 아키텍처가 소프트웨어를 여러 계층에 걸쳐 가장 낮은 수준까지 나눈 단위. 상세 설계는 software component마다 그 unit의 동작, 구조, 인터페이스를 정한다.                     |
| Software unit      | software component를 나눈 결과로, 더 나누지 않기로 정한 소프트웨어 단위                                                                                                             |

이 표준은 unit을 소프트웨어 도메인에만 쓰고, hardware part를 software unit의 하드웨어 짝으로 본다. 검증 쪽 프로세스에서는 software component와 unit이 소스 코드, 오브젝트 파일, 라이브러리, 실행 파일 같은 구현물로 나타난다고 정의한다.[@vda-automotive-spice-pam-4-1-2026]

ASPICE 3.1은 component를 소프트웨어 아키텍처의 가장 낮은 수준의 element이자 상세 설계를 정의하는 단위로 정의했고, V 모델 오른쪽에서 왼쪽의 element에 대응하는 것(오브젝트 파일, 라이브러리, 실행 파일 등)을 item이라 불렀다. 대응은 1:1일 수도 m:n일 수도 있었다. ASPICE 4.1은 software component를 여러 계층에 걸쳐 두고, item을 정의하지 않는다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## intacs Hardware SPICE

intacs는 전자 하드웨어 개발을 위한 프로세스 참조 모델이자 프로세스 평가 모델로 Hardware SPICE 4.0을 펴낸다. 이 모델은 ASPICE 4.1에 맞추고, [[iso-26262|ISO 26262-1]]:2018과 ISO 26262-5:2018에 대응시켜 만들었다. 이 모델의 HWE.1\~HWE.4는 ASPICE 4.1을 확장한 것으로, ISO 26262:2018과 [[iso-sae-21434|ISO/SAE 21434]]:2021에 대한 참조와 설명을 더 담는다. Hardware SPICE 4.0은 ASPICE와 따로 떼어 독립된 프로세스 평가 모델로 쓸 수 있다.[@intacs-spice-center-2026]
