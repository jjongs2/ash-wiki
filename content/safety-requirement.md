---
title: 안전 요구사항
tags:
  - sw-engineering/functional-safety
verified: 2026-10-02
---

**안전 요구사항**(safety requirement)은 [[iso-26262|ISO 26262]]에서 [[hazard-analysis-and-risk-assessment#Safety goal|safety goal]]에서 시작해 단계마다 구체화되는 요구사항이다. ISO 26262-1:2018은 safety goal을 최상위 안전 요구사항으로 정의하고, functional safety requirement가 안전 상태를 이루거나 유지하려고 E/E(Electrical/Electronic) 시스템이나 다른 기술의 시스템이 구현하는 안전 요구사항일 수 있다고 둔다.[@iso-26262-1-obp-2018] ISO 26262-8:2018은 6절에서 안전 요구사항의 명세와 관리를 다룬다.[@iso-26262-8-obp-2018] 안전 상태는 [[safety-mechanism#안전 상태와 성능 저하|안전 메커니즘]]에서 다룬다.

[[iso-pas-8800|ISO/PAS 8800]]:2024는 안전 요구사항을 안전에 관련된 요구사항으로 넓게 정의하고, [[sotif|SOTIF]] 요구사항, functional safety requirement, technical safety requirement를 예로 든다. 주석은 [[functional-safety|기능 안전]]과 SOTIF에서 오는 안전 요구사항이 여기에 들되 그것에 한정되지 않는다고 제시한다.[@iso-pas-8800-obp-2024]

## 요구사항의 전개

ISO 26262-1:2018에서 요구사항은 safety goal에서 아래 두 요구사항으로 차례로 내려간다. 같은 표준은 그 두 요구사항과 두 concept을 다음처럼 정의한다.[@iso-26262-1-obp-2018]

- **Functional safety requirement**(FSR): 구현과 상관없는 안전 동작이나 안전 조치를 안전 관련 속성과 함께 명세한 것
- **Technical safety requirement**(TSR): 관련 FSR을 구현하려고 끌어낸 요구사항. 끌어낸 요구사항에는 완화 요구사항이 든다.
- **Functional safety concept**: FSR과 관련 정보, 아키텍처 안 요소로의 할당, safety goal을 이루는 데 필요한 상호작용을 정한 명세
- **Technical safety concept**: TSR과 그 시스템 요소로의 할당을, 시스템 수준 기능 안전의 근거가 되는 정보와 함께 정한 명세[@iso-26262-1-obp-2018]

![[diagrams/safety-requirement-hierarchy.svg]]

단계마다의 요구사항은 ISO 26262의 여러 부가 나누어 다룬다.

| 부               | 다루는 것                                                    |
| ---------------- | ------------------------------------------------------------ |
| ISO 26262-3:2018 | Functional safety concept[@iso-26262-3-obp-2018]             |
| ISO 26262-4:2018 | TSR의 명세와 technical safety concept[@iso-26262-4-obp-2018] |
| ISO 26262-5:2018 | 하드웨어 안전 요구사항의 명세[@iso-26262-5-obp-2018]         |
| ISO 26262-6:2018 | 소프트웨어 안전 요구사항의 명세[@iso-26262-6-obp-2018]       |

## ASIL과 상속

ISO 26262-1:2018은 **상속**(inheritance)을 개발 과정에서 요구사항의 속성을 바꾸지 않고 다음 상세 수준으로 넘기는 것으로 정의하고, FSR의 안전 관련 속성에 [[automotive-safety-integrity-level|ASIL]] 정보가 든다고 둔다.[@iso-26262-1-obp-2018]
