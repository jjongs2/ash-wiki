---
title: 기능 안전 관리
tags:
  - sw-engineering/functional-safety
verified: 2026-10-12
---

[[iso-26262|ISO 26262]]-2:2018은 자동차 응용의 **기능 안전 관리**(functional safety management) 요구사항을 정하고, 이를 프로젝트와 무관한, 관련 조직에 대한 요구사항(overall safety management)과 [[safety-lifecycle|안전 생명주기]]의 관리 활동에 대한 프로젝트별 요구사항으로 나눈다. 프로젝트별 요구사항은 [[safety-lifecycle#ISO 26262의 안전 생명주기|concept phase]], 시스템·하드웨어·소프트웨어 수준의 제품 개발 단계, 그리고 생산·운용·서비스·폐기에서의 관리를 다룬다.[@iso-26262-2-obp-2018]

이 표준은 5절에서 overall safety management를 다루고, 프로젝트별 요구사항은 6절의 프로젝트에 따른 safety management와 7절의 생산·운용·서비스·폐기에 관한 safety management에 나누어 둔다. Annex B는 safety culture를, Annex C는 confirmation measure의 지침을 다룬다.[@iso-26262-2-obp-2018]

## Safety plan과 safety manager

ISO 26262-1:2018은 기능 안전 관리에 쓰는 말을 다음처럼 정의한다.[@iso-26262-1-obp-2018]

- **Safety activity**: 안전 생명주기의 한 단계나 하위 단계 이상에서 수행하는 활동
- **Safety plan**: 프로젝트의 safety activity 실행을 관리하고 이끄는 계획. 일정, 마일스톤, 작업, 인도물, 책임, 자원을 담는다.
- **Safety manager**: [[functional-safety|기능 안전]]을 이루는 데 필요한 활동의 실행을 감독하고 보장할 책임을 진 사람이나 조직. 정의의 주석은 [[safety-lifecycle#ISO 26262의 안전 생명주기|아이템]] 개발의 여러 수준에서 관련 회사마다 내부 매트릭스 조직에 따라 역할을 나눠 한 사람 이상을 지정할 수 있다고 제시한다.
- **Safety culture**: 결정과 행동에서 안전을 경쟁하는 다른 목표보다 앞세우는 조직의 지속적인 가치, 태도, 동기, 지식[@iso-26262-1-obp-2018]

고객과 공급자가 개발의 책임을 나누는 합의는 [[development-interface-agreement|development interface agreement]]에서 다룬다.

## Safety case

이 표준은 **safety case**를 아이템이나 요소에 대해 기능 안전이 이뤄졌다는 논증으로, 개발 중 활동의 작업 산출물에서 모은 증거가 뒷받침하는 것으로 정의한다. 정의의 주석은 safety case를 ISO 26262 시리즈의 범위를 넘는 안전 문제까지 넓힐 수 있다고 제시한다.[@iso-26262-1-obp-2018]

[[iso-pas-8800|ISO/PAS 8800]]:2024는 **assurance argument**를 최상위 주장이나 주장의 묶음이 충족된다는 것을 뒷받침하려고 만든, 추론에 기반하고 감사할 수 있는 산출물로 정의한다. Assurance argument는 체계적인 논증과 그 밑의 증거, 명시적인 가정을 담는다. 정의의 주석은 assurance argument에 드는 것으로 속성에 대한 하나 이상의 주장, 증거와 가정을 주장에 논리적으로 잇는 논증, 그 논증을 뒷받침하는 증거와 가정, 최상위 주장과 추론 방법을 고른 근거를 제시한다. 이 정의는 ISO/IEC/IEEE 15026-1:2019의 정의를 가져와 "argumentation"을 "arguments"로 바꾼 것이다.[@iso-pas-8800-obp-2024]

[[cybersecurity|사이버보안]]에서 이에 대응하는 논증은 [[cybersecurity-assessment#Cybersecurity case|cybersecurity case]]에서 다룬다.

## Confirmation measure

ISO 26262-1:2018은 **confirmation measure**를 기능 안전에 관한 confirmation review, audit, assessment로 정의하고, 셋을 다음처럼 정의한다.[@iso-26262-1-obp-2018]

- **Confirmation review**: 작업 산출물이 ISO 26262의 해당 목표와 요구사항에 비추어, 기능 안전 달성에 기여한다는 충분하고 설득력 있는 증거를 주는지 확인하는 것. 정의의 주석은 confirmation review의 전체 목록이 ISO 26262-2에 있다고 제시한다.
- **Audit**: 구현된 프로세스를 프로세스 목표에 비추어 살피는 것
- **Assessment**: 아이템이나 요소의 특성이 ISO 26262의 목표를 이루는지 살피는 것[@iso-26262-1-obp-2018]

ISO 26262-1:2011은 confirmation review를 작업 산출물이 ISO 26262의 요구사항을 충족하는지를, 요구되는 수준의 독립성을 갖춘 검토자가 확인하는 것으로 정의했다.[@iso-26262-1-obp-2011] 2018판은 목표와 요구사항에 비추어 기능 안전 달성에 기여하는 증거가 충분하고 설득력 있는지 확인하는 것으로 정의한다.[@iso-26262-1-obp-2018]

## 독립성

이 표준은 **독립성**(independence)을 [[safety-requirement|안전 요구사항]] 위반으로 이어질 수 있는 [[safety-analysis#Dependent failure 분석|dependent failure]]가 둘 이상의 요소 사이에 없는 것, 또는 어떤 행위를 수행하는 당사자들이 조직적으로 분리된 것으로 정의한다. 정의의 주석은 [[automotive-safety-integrity-level#ASIL decomposition|ASIL decomposition]]과 confirmation measure에 독립성 요구사항이 든다고 제시한다.[@iso-26262-1-obp-2018]

## IEC 61508의 기능 안전 관리

[[iec-61508|IEC 61508]]-1:2010은 6절에서 기능 안전 관리를, 8절에서 functional safety assessment를 다룬다.[@iec-61508-1-preview-2010]

IEC 61508:2010은 **functional safety assessment**를, 표준의 관련 조항 준수를 바탕으로 E/E/PE(Electrical/Electronic/Programmable Electronic) 안전 관련 시스템이나 [[safety-element-out-of-context#IEC 61508의 compliant item|compliant item]]이 이룬 기능 안전이 적절한지 조사해 판단하는 활동으로 둔다. 평가를 하는 사람은 역량과 적절한 독립성을 갖추고, 모든 생명주기의 단계마다 수행한 활동과 얻은 산출물을 살펴 IEC 61508의 목표와 요구사항이 얼마나 충족되었는지 판단해야 한다.[@iec-functional-safety-faq-2023]

이 표준은 E/E/PE 안전 관련 시스템의 모든 부분과 생명주기의 모든 단계에 functional safety assessment를 요구하고, 그 요구사항을 IEC 61508-1의 8절에 둔다. 평가자에게 요구하는 독립성은 [[safety-integrity-level|SIL]] 1의 같은 조직 안 독립된 사람부터 SIL 4의 독립된 조직까지 오르고, SIL 2와 SIL 3에서는 시스템 복잡도, 설계의 새로움, 개발자의 이전 경험 같은 요인에 따라 달라진다. 평가자는 맡은 활동에 필요한 역량을 갖춰야 한다.[@iec-functional-safety-faq-2023]

![[diagrams/iec-61508-assessor-independence.svg]]

이 표준은 제3자 인증을 요구하지 않는다. 독립된 사람이나 부서에 대한 요구를 외부 조직으로 채우더라도 그 조직이 인증 기관일 필요는 없고, 리스크 평가와 안전 관련 시스템 적용에 숙련되고 주 개발 책임자와 관리·자원으로 분리된 내부 조직은 독립된 조직에 대한 요구를 채울 수 있다.[@iec-functional-safety-faq-2023]

## Verification review와의 차이

ISO 26262-1:2018은 **verification review**를 개발 활동의 결과가 프로젝트 요구사항이나 기술 요구사항, 또는 둘 다를 충족하는지 보장하는 검증 활동으로 정의한다. 두 정의의 주석은 confirmation review의 목표를 ISO 26262 시리즈 준수를 보장하는 것으로, verification review의 목표를 아이템이나 요소의 기술적 정확성과 완전성으로 제시한다. Review 정의의 주석은 개발 단계의 관점에서 review로 verification review와 confirmation review를 든다.[@iso-26262-1-obp-2018]
