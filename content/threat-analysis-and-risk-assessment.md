---
title: TARA
tags:
  - security/cybersecurity
verified: 2026-10-03
---

**TARA**(Threat Analysis and Risk Assessment)는 사이버보안 리스크가 어느 정도인지 정해 리스크 처리로 이어 가게 하는 분석·평가 방법이다. [[iso-sae-21434|ISO/SAE 21434]]:2021은 이 방법들을 모듈 꼴로 15절에 모아 둔다.[@iso-sae-21434-obp-2021] [[automotive-spice-for-cybersecurity|Automotive SPICE for Cybersecurity]] 2.0은 사이버보안 리스크 관리를 MAN.7 프로세스로 두고, 리스크를 분석하는 방법의 하나로 TARA를 든다.[@vda-automotive-spice-cybersecurity-2025]

## 용어

ISO/SAE 21434:2021은 TARA에 쓰는 용어를 다음처럼 정의한다.[@iso-sae-21434-obp-2021]

- **자산**(asset): 가치를 지니거나 가치에 이바지하는 대상. 자산은 [[cybersecurity-property|사이버보안 속성]]을 하나 이상 가지며, 그 속성이 침해되면 damage scenario로 이어질 수 있다.
- **Damage scenario**: 차량이나 차량 기능이 관여해 도로 사용자에게 미치는 부정적 결과
- **위협 시나리오**(threat scenario): 하나 이상의 자산이 가진 사이버보안 속성을 침해해 damage scenario를 일으킬 수 있는 잠재적 원인
- **Attack path**: 위협 시나리오를 이루려고 일부러 하는 행위들의 묶음
- **Impact**: damage scenario가 낳는 피해나 물리적 해의 크기를 추정한 값
- **Road user**: 도로를 쓰는 사람. 운전자와 승객, 보행자, 자전거 타는 사람, 차량 소유자가 그 예다.
- **Risk**: 불확실성이 도로 차량의 사이버보안에 주는 영향으로, attack feasibility와 impact로 나타낸다.[@iso-sae-21434-obp-2021]

사이버보안 속성은 보호할 가치가 있을 수 있는 속성으로, [[cybersecurity-property#기밀성, 무결성, 가용성|기밀성, 무결성, 가용성]]이 그 예다.[@iso-sae-21434-obp-2021] Attack path가 얼마나 쉽게 실행되는지는 [[attack-feasibility-rating|attack feasibility]]에서 다룬다.

![[diagrams/tara-risk-elements.svg]]

이 표준은 [[cybersecurity-goal|cybersecurity goal]]을 위협 시나리오에 관련된 concept 수준의 사이버보안 요구사항으로, cybersecurity claim을 리스크를 retain하거나 share하는 근거를 담을 수 있는, 리스크에 관한 진술로 정의한다.[@iso-sae-21434-obp-2021]

## ISO/SAE 21434의 TARA 방법

ISO/SAE 21434:2021은 15절의 TARA 방법을 15.3절부터 15.9절까지 일곱 절로 나눠 둔다. 절 제목은 15.3절부터 차례로 asset identification, threat scenario identification, impact rating, attack path analysis, attack feasibility rating, risk value determination, risk treatment decision이다.[@iso-sae-21434-obp-2021]

이 표준은 부속서 F에 safety, financial, operational, privacy 각각의 impact rating 기준을 예로 들고, 부속서 H에 리스크 매트릭스의 예를 둔다.[@iso-sae-21434-obp-2021]

## Automotive SPICE for Cybersecurity의 MAN.7

Automotive SPICE for Cybersecurity 2.0의 MAN.7 Cybersecurity Risk Management는 관련 이해관계자에게 미칠 피해의 리스크를 정기적으로 찾고, 분석하고, 우선순위를 매기고, 감시하는 것을 목적으로 둔다. 성과는 다섯이다.[@vda-automotive-spice-cybersecurity-2025]

1. [[cybersecurity-lifecycle#아이템과 운용 환경|아이템]]을 그 기능과 경계까지 정의한다.
2. 관련 자산, 위협, damage scenario를 찾고 정기적으로 갱신한다.
3. 처리 우선순위를 정할 수 있게 impact rating과 attack feasibility rating으로 리스크를 분석한다.
4. 리스크의 상태와 처리 활동의 진척을 파악한다.
5. 우선순위, 가능성, 결과나 정해 둔 리스크 문턱에 따라 적절한 처리를 한다.[@vda-automotive-spice-cybersecurity-2025]

Base practice는 일곱이고, 성과와 일대일로 대응하지 않는다. 예를 들어 BP1은 성과 1과 2에 대응한다.[@vda-automotive-spice-cybersecurity-2025]

| BP  | 이름                                         |
| --- | -------------------------------------------- |
| BP1 | Identify cybersecurity risk management scope |
| BP2 | Identify cybersecurity events                |
| BP3 | Analyze risks                                |
| BP4 | Define risk treatment options                |
| BP5 | Define and perform risk treatment activities |
| BP6 | Monitor risks                                |
| BP7 | Take corrective action                       |

BP3의 노트는 리스크를 분석하는 방법의 예로 attack path analysis를 포함한 TARA, 시뮬레이션, ATA(Attack Tree Analysis), FTA(Fault Tree Analysis) 등을 든다. BP4는 리스크마다 retain, reduce, avoid, transfer(share) 가운데 하나를 처리 옵션으로 고르게 한다.[@vda-automotive-spice-cybersecurity-2025] Attack tree와 FTA는 각각 [[attack-tree|attack tree]]와 [[safety-analysis#FTA|안전 분석]]에서 다룬다.

Automotive SPICE for Cybersecurity 1.0은 MAN.7에 성과 여덟과 BP 여덟을 두어 성과마다 BP 하나를 대응시켰고, 처리 옵션을 accept, reduce, avoid, share(transfer)로 두었으며, accept나 share로 고른 리스크가 대개 cybersecurity claim을 정한다는 노트를 두었다.[@vda-automotive-spice-cybersecurity-2021] 2.0은 성과를 다섯, BP를 일곱으로 고치고, 옵션을 retain, reduce, avoid, transfer(share)로 둔다.[@vda-automotive-spice-cybersecurity-2025]

## HARA와의 차이

[[hazard-analysis-and-risk-assessment|HARA]]는 아이템의 오동작이 일으키는 해저드 사건을 심각도, 노출, 통제 가능성으로 분류해 [[hazard-analysis-and-risk-assessment#Safety goal|safety goal]]과 [[automotive-safety-integrity-level|ASIL]]을 정한다.[@iso-26262-1-obp-2018] TARA가 다루는 attack path는 공격자가 일부러 하는 행위들이고, 리스크는 attack feasibility와 impact로 나타낸다.[@iso-sae-21434-obp-2021]
