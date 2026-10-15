---
title: 소프트웨어 품질 모델
tags:
  - sw-engineering
aliases:
  - 품질 모델
verified: 2026-10-02
---

**품질 모델**(quality model)은 품질 요구사항을 명세하고 품질을 평가하는 틀이 되는, 특성과 그 관계의 정의된 집합이다. ISO/IEC 25000:2014가 이렇게 정의한다.[@iso-iec-25000-obp-2014] ISO/IEC 25010:2023은 ICT(information and communication technology) 제품과 소프트웨어 제품에 적용하는 제품 품질 모델을 정의한다.[@iso-iec-25010-obp-2023]

## ISO/IEC 25010의 제품 품질 모델

이 표준은 제품 품질을 아홉 특성으로 나누고, 특성마다 부특성을 둔다.[@iso-iec-25010-obp-2023]

| 특성                   | 부특성                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Functional suitability | Functional completeness, Functional correctness, Functional appropriateness                                                                            |
| Performance efficiency | Time behaviour, Resource utilization, Capacity                                                                                                         |
| Compatibility          | Co-existence, Interoperability                                                                                                                         |
| Interaction capability | Appropriateness recognizability, Learnability, Operability, User error protection, User engagement, Inclusivity, User assistance, Self-descriptiveness |
| Reliability            | Faultlessness, Availability, Fault tolerance, Recoverability                                                                                           |
| Security               | Confidentiality, Integrity, Non-repudiation, Accountability, Authenticity, Resistance                                                                  |
| Maintainability        | Modularity, Reusability, Analysability, Modifiability, Testability                                                                                     |
| Flexibility            | Adaptability, Scalability, Installability, Replaceability                                                                                              |
| Safety                 | Operational constraint, Risk identification, Fail safe, Hazard warning, Safe integration                                                               |

## 내부 품질, 외부 품질, 사용 품질

ISO/IEC 25000:2014는 품질을 재는 척도를 둘로 나누어 정의한다.[@iso-iec-25000-obp-2014]

- **내부 품질 척도**(internal measure of software quality): 소프트웨어 제품의 정적 속성(아키텍처, 구조, 구성요소)이 명시된 요구와 암묵적 요구를 만족하는 정도의 척도
- **외부 품질 척도**(external measure of system or software quality): 시스템이나 소프트웨어 제품의 동작이 요구를 만족하는 정도의 척도[@iso-iec-25000-obp-2014]

ISO/IEC 25019:2023은 **사용 품질**(quality-in-use)을, 시스템이나 제품을 정한 사용 맥락에서 쓸 때 이해관계자의 요구를 만족하거나 넘어서 정한 이로운 목표나 결과를 이루는 정도로 정의한다. 사용 품질은 소프트웨어, 데이터, IT(information technology) 서비스의 품질 같은 여러 요인의 영향을 받는다.[@iso-iec-25019-obp-2023]

ISO/IEC 25010:2011은 내부 품질 모델과 외부 품질 모델을 제품 품질 모델 하나로 합쳤고, 사용 품질 모델을 effectiveness, efficiency, satisfaction, freedom from risk, context coverage의 다섯 특성으로 두었다. ISO/IEC 25010:2023도 제품 품질 모델 하나를 정의하고, ISO/IEC 25019:2023은 beneficialness, freedom from risk, acceptability의 세 특성으로 사용 품질 모델을 정의한다.[@iso-iec-25010-obp-2023][@iso-iec-25019-obp-2023][@iso-iec-25010-obp-2011]

## SQuaRE

ISO/IEC 25010:2023은 SQuaRE(Systems and software Quality Requirements and Evaluation)라 부르는 ISO/IEC 25000\~25099 계열의 품질 모델 부문에 속한다.[@iso-iec-25010-obp-2023] ISO/IEC 25000:2014는 SQuaRE를 번호대로 다섯 부문으로 나누고, ISO/IEC 25050\~25099는 확장 표준에 남겨 둔다.[@iso-iec-25000-obp-2014]

| 부문                          | 표준 번호            |
| ----------------------------- | -------------------- |
| Quality management division   | ISO/IEC 25000\~25009 |
| Quality model division        | ISO/IEC 25010\~25019 |
| Quality measurement division  | ISO/IEC 25020\~25029 |
| Quality requirements division | ISO/IEC 25030\~25039 |
| Quality evaluation division   | ISO/IEC 25040\~25049 |
| 확장 표준용                   | ISO/IEC 25050\~25099 |

## 판 이력

- ISO/IEC 9126:1991은 품질 특성 여섯을 정의했다.[@iso-iec-25010-obp-2011]
- ISO/IEC 25010:2011은 ISO/IEC 9126-1:2001을 대체했다. 그 품질 특성을 일부 고쳐 이어받아, 제품 품질 특성을 여덟으로 두고 기능성의 부특성이던 보안과 새 특성인 호환성을 따로 특성으로 세웠다.[@iso-iec-25010-obp-2011]
- ISO/IEC 25010:2023은 ISO/IEC 25002:2024, ISO/IEC 25019:2023과 함께 2011판을 대체했다. 2011판의 usability와 portability를 interaction capability와 flexibility로 바꾸고, safety를 새 특성으로 더해 아홉 특성을 둔다. 2011판의 제품 품질 모델 부분만 이어받고, 품질 모델 개요는 ISO/IEC 25002로, 사용 품질 모델은 ISO/IEC 25019로 옮겼다.[@iso-iec-25010-obp-2023][@iso-iec-25019-obp-2023][@iso-iec-25010-obp-2011]

![[diagrams/iso-iec-25010-2011-split.svg]]
