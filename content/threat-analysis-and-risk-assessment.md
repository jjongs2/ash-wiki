---
title: TARA
tags:
  - security/cybersecurity
verified: 2026-10-03
---

**TARA**(Threat Analysis and Risk Assessment)는 사이버보안 리스크가 어느 정도인지 정해 리스크 처리로 이어 가게 하는 분석·평가 방법이다. [[iso-sae-21434|ISO/SAE 21434]]:2021은 이 방법들을 모듈 꼴로 15절에 모아 둔다.[@iso-sae-21434-obp-2021] [[automotive-spice-for-cybersecurity|Automotive SPICE for Cybersecurity]] 2.0은 사이버보안 리스크 관리를 MAN.7 프로세스로 두고, 리스크를 분석하는 방법의 하나로 TARA를 든다.[@vda-automotive-spice-cybersecurity-2025]

## 용어

[[un-r155|UN R155]]는 risk를 주어진 위협이 차량의 [[vulnerability-management|취약점]]을 악용해 조직이나 개인에게 해를 끼칠 가능성으로, **threat**를 시스템이나 조직, 개인에게 해를 끼칠 수 있는 원치 않는 incident의 잠재적 원인으로 정의한다. **Risk assessment**는 리스크를 찾아 인식하고 기술하는 risk identification, 리스크의 성질을 이해하고 수준을 정하는 risk analysis, 그 결과를 리스크 기준과 견주어 리스크나 그 크기를 받아들일 수 있는지 정하는 risk evaluation을 아우르는 전체 과정이다. Risk management는 리스크에 관해 조직을 지휘하고 통제하는 조정된 활동이다.[@unece-r155-2021]

ISO/SAE 21434:2021은 TARA에 쓰는 용어를 다음처럼 정의한다.[@iso-sae-21434-obp-2021]

- **자산**(asset): 가치를 지니거나 가치에 이바지하는 대상. 자산은 [[cybersecurity-property|사이버보안 속성]]을 하나 이상 가지며, 그 속성이 침해되면 damage scenario로 이어질 수 있다.
- **Damage scenario**: 차량이나 차량 기능이 관여해 도로 사용자에게 미치는 부정적 결과
- **위협 시나리오**(threat scenario): 하나 이상의 자산이 가진 사이버보안 속성을 침해해 damage scenario를 일으킬 수 있는 잠재적 원인
- **Attack path**: 위협 시나리오를 이루려고 일부러 하는 행위들의 묶음. Attack이라고도 부른다.
- **Attacker**: attack path를 실행하는 사람, 집단, 조직
- **Impact**: damage scenario가 낳는 피해나 물리적 해의 크기를 추정한 값
- **Road user**: 도로를 쓰는 사람. 운전자와 승객, 보행자, 자전거 타는 사람, 차량 소유자가 그 예다.
- **Risk**: 불확실성이 도로 차량의 사이버보안에 주는 영향으로, attack feasibility와 impact로 나타낸다. Cybersecurity risk라고도 부른다.
- **Risk management**: risk에 관해 조직을 지휘하고 통제하는 조정된 활동. ISO 31000:2018의 3.2 정의를 그대로 가져왔다.[@iso-sae-21434-obp-2021]

사이버보안 속성은 보호할 가치가 있을 수 있는 속성으로, [[cybersecurity-property#기밀성, 무결성, 가용성|기밀성, 무결성, 가용성]]이 그 예다.[@iso-sae-21434-obp-2021] Attack path가 얼마나 쉽게 실행되는지는 [[attack-feasibility-rating|attack feasibility]]에서 다룬다.

![[diagrams/tara-risk-elements.svg]]

이 표준은 [[cybersecurity-goal|cybersecurity goal]]을 위협 시나리오에 관련된 concept 수준의 사이버보안 요구사항으로, cybersecurity claim을 리스크를 retain하거나 share하는 근거를 담을 수 있는, 리스크에 관한 진술로 정의한다.[@iso-sae-21434-obp-2021]

## ISO/SAE 21434의 TARA 방법

이 표준은 15절의 TARA 방법을 15.3절부터 15.9절까지 일곱 절로 나눠 둔다. 절 제목은 15.3절부터 차례로 asset identification, threat scenario identification, impact rating, attack path analysis, attack feasibility rating, risk value determination, risk treatment decision이다.[@iso-sae-21434-obp-2021]

이 표준은 Annex F에 safety, financial, operational, privacy 각각의 impact rating 기준을 예로 들고, Annex H에 리스크 매트릭스의 예를 둔다.[@iso-sae-21434-obp-2021]

Annex H는 헤드램프 시스템에 TARA 방법을 적용한 예를 든다. 운용 환경의 설명(표 H.1)부터 자산과 damage scenario, impact rating, 위협 시나리오, attack path, attack feasibility rating, 리스크 매트릭스와 리스크 값을 거쳐 리스크 처리 결정의 결과(표 H.11)까지, 표 H.1\~H.11이 차례로 예를 보인다.[@iso-sae-21434-obp-2021]

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

## EVITA와 HEAVENS의 방법

[[hardware-security-module#EVITA의 HSM 등급|EVITA]] 프로젝트는 차량 온보드 네트워크의 보안 리스크 분석과 안전 리스크 분석을 하나로 묶은 접근을 만들었다. 프로젝트는 보안 조치가 필요할 [[use-case|use case]]를 먼저 고르고, 이를 바탕으로 e-safety 애플리케이션이 악용될 가능성을 그린 dark-side scenario를 세워 attack tree로 구조화했다.[@evita-d0-2012]

Henniger 외는 2009년 논문에서 EVITA의 리스크 평가 절차를 내놓았다. 이 절차는 공격의 리스크를 심각도와 공격 성공 확률의 함수로 보고, 안전에 관한 위협에는 통제 가능성을 더한다. 심각도는 차량 안전 공학의 심각도 분류를 바탕으로, 안전, 프라이버시(제조사와 공급자의 지적 재산 포함), 재정, 운용 네 측면마다 0\~4 등급을 매겨 네 성분의 벡터로 나타낸다. 성공 확률은 ISO/IEC 15408과 ISO/IEC 18045의 [[attack-feasibility-rating#Attack potential|attack potential]]을 바탕으로, 경과 시간, 전문성, 시스템 지식, 기회의 창, 장비 다섯 요소의 값을 더한 합계를 Basic부터 Beyond High까지 다섯 수준으로 나누고, 이를 확률 5\~1에 대응시킨다. 확률은 attack tree의 리프 노드에서 매기고, 위 노드로 올릴 때 OR 관계면 자식 가운데 가장 높은 확률을, AND 관계면 가장 낮은 확률을 취한다. 통제 가능성은 보통의 반응으로 사고를 대개 피할 수 있는 1부터 사람의 반응으로 상황에 영향을 줄 수 없는 4까지 네 등급으로 매긴다.[@henniger-security-requirements-2009]

HEAVENS(HEAling Vulnerabilities to ENhance Software Security and Safety) 프로젝트는 2013년 4월부터 2016년 3월까지 진행되었고, Volvo Technology AB가 조정을 맡았다.[@olsson-heavens-final-report-2016] Islam 외는 2016년 논문에서 HEAVENS 프로젝트의 결과를 바탕으로, [[functional-safety|기능 안전]] 프로세스와 맞추고 보안 비전문가도 쓸 수 있게 한 차량 임베디드 시스템용 리스크 평가 틀을 내놓았다. 위협 식별에는 보안 비전문가가 쓰기 쉽다는 까닭으로 [[stride|STRIDE]]를 쓰자고 했다. 이 틀은 위협이 실현될 가능성을 추정한 threat level과 피해의 크기를 추정한 impact level을 합쳐 security level을 정한다. Threat level은 전문성, 대상에 대한 지식, 기회의 창, 장비 네 요소로 매기고, Common Criteria의 attack potential 계산과 달리 경과 시간은 다른 요소에서 끌어낼 수 있다는 까닭으로 따로 두지 않는다. Impact level은 안전, 재정, 운용, 프라이버시와 법규 네 요소로 매긴다. Security level은 QM(Quality Management), Low, Medium, High, Critical 다섯이고, QM인 자산·위협 쌍에는 보안 요구사항을 세우지 않는다.[@islam-risk-assessment-framework-2016]

Lautenbach 외는 2021년 HEAVENS 모델을 ISO/SAE 21434의 리스크 평가 요구에 맞추는 갱신 12가지와 약점을 보완하는 갱신 5가지, 모두 17가지를 담은 HEAVENS 2.0을 제안했다.[@lautenbach-heavens-2-2021]

## 규제와 지침

UN R155의 [[un-r155#범위|Annex 5]]는 위협 분석이 가능한 공격 영향도 고려하도록 요구한다.[@unece-r155-2021]

NHTSA의 2022년 지침(Cybersecurity Best Practices for the Safety of Modern Vehicles)은 리스크를 평가할 때 차량 탑승자와 다른 도로 사용자의 안전을 가장 먼저 고려하기를 권한다(G.5). 또 센서 취약점과, GPS 스푸핑, 도로 표지 변조, 라이다·레이더 재밍과 스푸핑, 카메라 블라인딩, 머신러닝의 false positive 유발 같은 센서 신호 조작의 리스크를 고려하기를 권한다(G.6).[@nhtsa-cybersecurity-best-practices-2022]

ENISA의 2019년 보고서 Good practices for security of smart cars는 사이버보안 리스크 분석을 설계 과정의 아주 이른 단계부터 하고, 적어도 해마다, 그리고 큰 변경이 있거나 심각한 보안 취약점을 찾거나 심각한 보안 incident가 일어났을 때 다시 보기를 권한다(PS-12).[@enisa-smart-cars-2019]

[[vulnerability-management#취약점 보고와 정보 공유|Auto-ISAC]]은 [[automotive-threat-matrix|ATM]]이 쓰일 곳의 하나로 위협·리스크 평가 모델링을 든다.[@auto-isac-about-us-2026]

## HARA와의 차이

[[hazard-analysis-and-risk-assessment|HARA]]는 아이템의 오동작이 일으키는 해저드 사건을 심각도, 노출, 통제 가능성으로 분류해 [[hazard-analysis-and-risk-assessment#Safety goal|safety goal]]과 [[automotive-safety-integrity-level|ASIL]]을 정한다.[@iso-26262-1-obp-2018] TARA가 다루는 attack path는 공격자가 일부러 하는 행위들이고, 리스크는 attack feasibility와 impact로 나타낸다.[@iso-sae-21434-obp-2021]
