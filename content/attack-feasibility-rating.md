---
title: Attack feasibility rating
tags:
  - security/cybersecurity
verified: 2026-10-03
---

**Attack feasibility**는 attack path가 가진 속성으로, 그 attack path에 해당하는 행위들을 성공시키기가 얼마나 쉬운지를 말한다. [[iso-sae-21434|ISO/SAE 21434]]:2021은 이를 3절에서 이렇게 정의하고, attack feasibility rating을 15절에 모은 [[threat-analysis-and-risk-assessment#ISO/SAE 21434의 TARA 방법|TARA 방법]] 가운데 하나로 둔다. 이 표준은 attack feasibility rating과 그 설명을 표 1에 둔다.[@iso-sae-21434-obp-2021] Attack feasibility로 리스크를 정하는 분석은 [[threat-analysis-and-risk-assessment|TARA]]에서 다룬다.

## Attack potential

CC:2022(Common Criteria for Information Technology Security Evaluation)는 **attack potential**을 평가 대상인 TOE(Target of Evaluation)의 [[vulnerability-management|취약점]]을 악용하는 데 드는 노력의 척도로 정의하고, 그 노력을 공격자의 전문성, 자원, 동기와 window of opportunity 같은 취약점의 성질로 나타낸다.[@ccra-cc-part-1-2022]

CEM:2022(Common Methodology for Information Technology Security Evaluation)는 attack potential을 정할 때 다섯 요소에 값을 매겨 합한다. 요소와 값은 다음과 같다.[@ccra-cem-2022]

| 요소                  | 뜻                                | 값                                                                                                                                                  |
| --------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Elapsed time          | 공격을 찾고 실행하는 데 드는 시간 | 하루 이하 0, 일주일 이하 1, 2주 이하 2, 한 달 이하 4, 두 달 이하 7, 석 달 이하 10, 넉 달 이하 13, 다섯 달 이하 15, 여섯 달 이하 17, 여섯 달 초과 19 |
| Specialist expertise  | 공격자에게 필요한 전문성          | Layman 0, proficient 3, expert 6, multiple experts 8                                                                                                |
| Knowledge of the TOE  | 대상에 대해 알아야 하는 정보      | Public 0, restricted 3, sensitive 7, critical 11                                                                                                    |
| Window of opportunity | 대상에 접근할 기회                | Unnecessary 또는 unlimited 0, easy 1, moderate 4, difficult 10                                                                                      |
| Equipment             | 필요한 장비                       | Standard 0, specialised 4, bespoke 7, multiple bespoke 9                                                                                            |

CEM:2022는 합계를 그 공격 시나리오를 실행하는 데 필요한 attack potential 수준에 대응시킨다. 0\~9는 basic, 10\~13은 enhanced-basic, 14\~19는 moderate, 20\~24는 high, 25 이상은 beyond high다. 합계가 클수록 시나리오에 필요한 attack potential이 높다. 예를 들어 합계 21인 high 시나리오로 TOE를 뚫을 수 있으면, 그 TOE는 moderate attack potential의 공격자까지 견디는 것으로 본다.[@ccra-cem-2022]

CEM v3.1 Revision 5의 표는 TOE가 견디는 attack potential을 열로 따로 두어, 합계 0\~9를 no rating, 10\~13을 basic, 14\~19를 enhanced-basic, 20\~24를 moderate, 25 이상을 high에 대응시켰다.[@ccra-cem-3-1-r5-2017] CEM:2022의 표에는 이 열이 없다.[@ccra-cem-2022]

![[diagrams/cem-attack-potential-ranges.svg]]

Henniger 외는 2009년 논문에서 [[hardware-security-module#EVITA의 HSM 등급|EVITA]]의 공격 성공 확률을, 경과 시간, 전문성, 시스템 지식, 기회의 창, 장비 다섯 요소의 값을 더한 attack potential로 매겼다.[@henniger-security-requirements-2009] Islam 외는 2016년 논문에서 [[threat-analysis-and-risk-assessment#EVITA와 HEAVENS의 방법|HEAVENS]] 프로젝트의 결과를 바탕으로 한 리스크 평가 틀을 내놓으며, threat level은 경과 시간을 뺀 네 요소로 매겼다.[@islam-risk-assessment-framework-2016]

## ISO/SAE 21434의 rating 예

ISO/SAE 21434:2021은 attack vector 기반 방법과 attack potential 기반 방법으로 attack feasibility를 매긴 예를 Annex H의 표로 든다. Annex G에는 attack vector 기반 방법의 표와 [[common-vulnerability-scoring-system|CVSS]] exploitability를 대응시키는 예의 표가 있다. 또 Elapsed time, Specialist expertise, Knowledge of the item or component, Window of opportunity, Equipment를 제목으로 한 표 다섯과, attack potential을 합산하는 예와 대응시키는 예의 표가 있다.[@iso-sae-21434-obp-2021]

Annex G는 attack feasibility rating의 지침으로 attack potential 기반(G.2), CVSS 기반(G.3), attack vector 기반(G.4) 세 접근을 제시한다.[@iso-sae-21434-obp-2021]

## ISO/IEC 18045와의 관계

CCRA에 참여하는 기관들은 ISO/IEC가 CEM:2022를 ISO/IEC 18045의 개정판에 옮겨 싣도록 허락했다.[@ccra-cem-2022] ISO/IEC 18045의 현행판은 2026년에 나온 4판이고, 2022년 판은 폐지되었다.[@iso-iec-18045-2026]
