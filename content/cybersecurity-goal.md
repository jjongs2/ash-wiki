---
title: Cybersecurity goal
tags:
  - security/cybersecurity
verified: 2026-10-03
---

[[iso-sae-21434|ISO/SAE 21434]]:2021은 **cybersecurity goal**을 하나 이상의 [[threat-analysis-and-risk-assessment#용어|위협 시나리오]]에 연관된 concept 수준의 사이버보안 요구사항으로 정의한다. 같은 표준은 **cybersecurity claim**을 리스크에 관한 진술로 정의하고, claim에 리스크를 보유하거나 공유하는 근거가 들 수 있다고 둔다. Goal을 정하는 활동(9.4절)은 이 표준의 concept 단계에 든다. 리스크 처리 결정은 이 표준이 15절에 모은 [[threat-analysis-and-risk-assessment#ISO/SAE 21434의 TARA 방법|TARA 방법]]의 하나(15.9절)다.[@iso-sae-21434-obp-2021] 단계의 구성은 [[cybersecurity-lifecycle|사이버보안 생명주기]]에서 다룬다.

Goal에서 끌어낸 요구사항은 [[cybersecurity-concept|cybersecurity concept]]에서 다룬다. Goal이 적절하고 이루어졌는지는 [[cybersecurity-verification-and-validation|validation]]이 확인한다.[@iso-sae-21434-obp-2021]

## Automotive SPICE for Cybersecurity의 SEC.1

[[automotive-spice-for-cybersecurity|Automotive SPICE for Cybersecurity]] 2.0은 goal과 요구사항을 정하는 일을 SEC.1(Cybersecurity Requirements Elicitation) 프로세스로 두고, 그 목적을 위협 시나리오를 다루는 사이버보안 리스크 관리의 결과로부터 cybersecurity goal과 사이버보안 요구사항을 정하는 것으로 둔다. SEC.1의 성과는 다음 넷이다.[@vda-automotive-spice-cybersecurity-2025]

| 성과 | 내용                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Cybersecurity goal이 정해진다.                                                                                                           |
| 2    | 사이버보안 요구사항이 goal에서 도출된다.                                                                                                 |
| 3    | 요구사항과 goal, goal과 위협 시나리오 사이에 [[traceability#일관성\|일관성]]과 [[traceability#양방향 추적성\|양방향 추적성]]이 유지된다. |
| 4    | 요구사항이 합의되어 영향받는 모든 당사자에게 전달된다.                                                                                   |

SEC.1의 BP(base practice)는 셋으로, goal과 요구사항의 명세(BP1), 일관성 확보와 양방향 추적성 수립(BP2), 합의한 요구사항의 전달(BP3)이다.[@vda-automotive-spice-cybersecurity-2025]

- BP1은 리스크 감소를 이루도록 리스크 처리 결정에 따라 위협 시나리오에 대한 goal을 정하고, goal에 대해 기능·비기능 사이버보안 요구사항을 정해 둔 요구사항 특성에 따라 쓰게 한다. 요구사항에는 생산, 운용, 정비, 폐기 같은 post-development 단계에 대한 것도 든다.
- BP2가 잇는 짝은 둘로, 사이버보안 요구사항과 cybersecurity goal, cybersecurity goal과 위협 시나리오다.[@vda-automotive-spice-cybersecurity-2025]

![[diagrams/aspice-cybersecurity-traceability.svg]]

같은 문서의 정보 항목 17-51(Cybersecurity goals)은 goal에 담을 수 있는 정보로 핵심 지표와 성공 기준 등을 든다.[@vda-automotive-spice-cybersecurity-2025] 양방향 추적성과 일관성 자체는 [[traceability|추적성]]에서 다룬다.
