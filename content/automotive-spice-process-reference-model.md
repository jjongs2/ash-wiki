---
title: ASPICE 프로세스 참조 모델
tags:
  - process/sw-process
verified: 2026-10-02
---

**ASPICE 프로세스 참조 모델**(process reference model, PRM)은 [[automotive-spice|ASPICE]]가 평가할 프로세스를 모아 두고, 프로세스마다 ID(identifier), 이름, 목적, 성과를 정의한 모델이다. [[automotive-spice-process-assessment-model|프로세스 평가 모델]]은 이 모델에서 프로세스를 골라 지표를 더하고, 평가자는 그 지표로 객관적 증거를 모아 프로세스를 평정한다.[@vda-automotive-spice-pam-4-1-2026]

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

![[diagrams/aspice-process-categories-groups.svg]]

그룹마다의 프로세스는 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

| 그룹                       | 프로세스                                                                                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ACQ(획득)                  | ACQ.4 Supplier Monitoring                                                                                                                                                                                                                                          |
| SPL(공급)                  | SPL.2 Product Release                                                                                                                                                                                                                                              |
| SYS(시스템 엔지니어링)     | SYS.1 Requirements Elicitation, SYS.2 System Requirements Analysis, SYS.3 System Architectural Design, SYS.4 System Integration and Integration Verification, SYS.5 System Verification                                                                            |
| VAL(확인)                  | VAL.1 Validation                                                                                                                                                                                                                                                   |
| SWE(소프트웨어 엔지니어링) | SWE.1 Software Requirements Analysis, SWE.2 Software Architectural Design, SWE.3 Software Detailed Design and Unit Construction, SWE.4 Software Unit Verification, SWE.5 Software Component Verification and Integration Verification, SWE.6 Software Verification |
| MLE(머신러닝 엔지니어링)   | MLE.1 Machine Learning Requirements Analysis, MLE.2 Machine Learning Architecture, MLE.3 Machine Learning Training, MLE.4 Machine Learning Model Testing                                                                                                           |
| HWE(하드웨어 엔지니어링)   | HWE.1 Hardware Requirements Analysis, HWE.2 Hardware Design, HWE.3 Verification against Hardware Design, HWE.4 Verification against Hardware Requirements                                                                                                          |
| SUP(지원)                  | SUP.1 Quality Assurance, SUP.8 Configuration Management, SUP.9 Problem Resolution Management, SUP.10 Change Request Management, SUP.11 Machine Learning Data Management                                                                                            |
| MAN(관리)                  | MAN.3 Project Management, MAN.5 Risk Management, MAN.6 Measurement                                                                                                                                                                                                 |
| PIM(프로세스 개선)         | PIM.3 Process Improvement                                                                                                                                                                                                                                          |
| REU(재사용)                | REU.2 Management of Products for Reuse                                                                                                                                                                                                                             |

ASPICE 3.1은 세 범주를 primary life cycle processes, organizational life cycle processes, supporting life cycle processes라 불렀고, 프로세스 32개를 두었다. ACQ에 ACQ.3, ACQ.4, ACQ.11\~ACQ.15를, SPL에 SPL.1과 SPL.2를, SUP에 SUP.1, SUP.2, SUP.4, SUP.7\~SUP.10을 두었고, HWE, MLE, VAL 그룹은 없었다. ASPICE 4.1은 범주 이름에 life cycle을 쓰지 않고, 3.1의 ACQ, SPL, SUP 프로세스 가운데 ACQ.4, SPL.2, SUP.1, SUP.8\~SUP.10만 둔다. SUP.11과 HWE, MLE, VAL 그룹은 3.1에 없던 것이다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## ISO/IEC 12207과의 관계

ASPICE 4.1의 프로세스 참조 모델은 [[iso-iec-ieee-12207|ISO/IEC 12207]]을 바탕으로 만들어, 자동차 산업의 필요에 맞게 더 발전시키고 고친 것이다. 범위 밖의 프로세스가 필요하면 ISO/IEC 12207이나 ISO/IEC/IEEE 15288 같은 다른 프로세스 참조 모델에서 프로세스를 더할 수 있다.[@vda-automotive-spice-pam-4-1-2026]

## Plug-in 컨셉

**Plug-in 컨셉**은 맨 위에 시스템 엔지니어링 프로세스를 두고, 개발할 제품에 따라 해당 엔지니어링 분야의 도메인 프로세스(예: HWE, SWE)를 평가 범위에 더하는 방식이다. 이 표준은 시스템 엔지니어링 프로세스를 시스템 V로 배치하고, plug-in 그림에서 SWE와 HWE 프로세스도 V 모양으로 그린다. 관리, 지원, 획득 같은 나머지 프로세스는 도메인에 묶이지 않아 시스템 수준과 도메인 수준 어디에나 적용할 수 있다.[@vda-automotive-spice-pam-4-1-2026] 개발 프로세스와 검증 프로세스를 마주 놓는 V 배치는 [[v-model|V 모델]]에서 다룬다.

이 표준의 엔지니어링 프로세스 그룹은 SYS, SWE, MLE, HWE이고, 기계 엔지니어링 프로세스는 없다. 그 밖의 도메인 프로세스는 VDA가 만들지 않았고 ASPICE에도 들지 않는다. [[software-architecture|소프트웨어 아키텍처]]에서 머신러닝으로 개발할 소프트웨어 요소를 정하면, 그 요소에는 MLE 프로세스를, 나머지 component에는 SWE.3과 SWE.4를 적용한다.[@vda-automotive-spice-pam-4-1-2026]

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
