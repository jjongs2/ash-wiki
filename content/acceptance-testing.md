---
title: 인수 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

**인수 테스트**(acceptance testing)는 시스템을 받아들일지 정하는 데 초점을 둔 테스트 레벨이다.[@iso-iec-ieee-24765-obp-2017][@istqb-glossary-acceptance-testing-2026] ISTQB(International Software Testing Qualifications Board) CTFL(Certified Tester Foundation Level) 강의계획서에 따르면 인수 테스트는 [[verification-and-validation|확인]](validation)을 하고 배포 준비가 되었음을, 곧 시스템이 사용자의 업무상 필요를 채운다는 것을 보이는 데 초점을 두며, 의도한 사용자가 수행하는 것이 가장 좋다.[@istqb-ctfl-syllabus-2024]

## 인수 테스트의 형태

CTFL 강의계획서는 인수 테스트의 주된 형태로 사용자 인수 테스트, 운용 인수 테스트, 계약 인수 테스트, 규제 인수 테스트, 알파 테스트, 베타 테스트를 든다.[@istqb-ctfl-syllabus-2024] ISTQB 용어집은 이 가운데 다섯을 다음과 같이 정의한다.

| 형태                                             | 정의                                                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 사용자 인수 테스트(UAT, user acceptance testing) | 의도한 사용자가 시스템을 받아들일지 정하려고 수행하는 인수 테스트[@istqb-glossary-user-acceptance-testing-2026]                             |
| 운용 인수 테스트(operational acceptance testing) | 시스템 운용을 맡은 조직이 그 시스템을 받아들일 수 있는지 정하려고 수행하는 인수 테스트[@istqb-glossary-operational-acceptance-testing-2026] |
| 규제 인수 테스트(regulatory acceptance testing)  | 테스트 대상이 규정을 준수하는지 정하려고 수행하는 인수 테스트[@istqb-glossary-regulatory-acceptance-testing-2026]                           |
| 알파 테스트(alpha testing)                       | 개발 조직 밖의 역할이 개발자의 테스트 환경에서 수행하는 인수 테스트[@istqb-glossary-alpha-testing-2026]                                     |
| 베타 테스트(beta testing)                        | 개발 조직 밖의 역할이 개발자의 테스트 환경 밖의 현장에서 수행하는 인수 테스트[@istqb-glossary-beta-testing-2026]                            |

ISTQB CT-AcT(Certified Tester Acceptance Testing) 강의계획서에 따르면 운용 인수 테스트는 대개 시스템을 운용할 팀이 수행한다.[@istqb-ct-act-syllabus-2019]

## ASPICE VAL.1

[[automotive-spice|ASPICE]] 4.1의 VAL.1 Validation은 최종 사용자가 직접 다룰 수 있는 최종 제품이 운용 목표 환경에서 의도한 사용 기대를 만족한다는 증거를 내는 것을 목적으로 한다. ASPICE 4.1은 확인 수단을 고르는 기준의 예로 인도할 제품의 용도(테스트 벤치, 테스트 트랙, 공도 확인, 최종 사용자의 현장 사용), 형식 승인, 요구사항 확인, 이해관계자 요구사항이 바뀌어 생기는 회귀 확인의 필요를 든다.[@vda-automotive-spice-pam-4-1-2026] ASPICE 3.1에는 확인 프로세스 그룹이 없었고, VAL.1은 ASPICE 4.0에서 들어왔다.[@vda-automotive-spice-pam-3-1-2017][@vda-automotive-spice-pam-4-0-2023]

기능 안전의 안전 확인(safety validation)은 [[safety-lifecycle|안전 생명주기]]에서 다룬다.
