---
title: Safety element out of context
tags:
  - sw-engineering/functional-safety
aliases:
  - SEooC
verified: 2026-10-12
---

[[iso-26262|ISO 26262]]-1:2018은 **SEooC**(Safety Element out of Context)를 특정 [[safety-lifecycle#ISO 26262의 안전 생명주기|아이템]]의 맥락에서 개발하지 않은 안전 관련 요소로 정의한다. 정의의 주석은 SEooC가 될 수 있는 것으로 시스템, 시스템의 조합, 소프트웨어 컴포넌트, 소프트웨어 유닛, 하드웨어 컴포넌트, 하드웨어 부품을 제시한다. 정의의 예는 가정한 [[safety-requirement|안전 요구사항]]을 두고 여러 OEM의 시스템에 통합할 일반 와이퍼 시스템을 든다.[@iso-26262-1-obp-2018]

## 요소와 안전 관련 요소

이 표준은 **요소**(element)를 시스템, 하드웨어나 소프트웨어의 컴포넌트, 하드웨어 부품, 소프트웨어 유닛으로 정의하고, 주석은 요소가 SEooC일 수도 있다고 제시한다. **안전 관련 요소**(safety-related element)는 [[hazard-analysis-and-risk-assessment#Safety goal|safety goal]]을 위반하거나 이루는 데 기여할 수 있는 요소다. 정의의 주석은 fail-safe 요소도 safety goal 하나 이상에 기여할 수 있으면 안전 관련으로 본다고 제시한다.[@iso-26262-1-obp-2018]

가정한 안전 요구사항을 만족하는 요소의 능력은 [[automotive-safety-integrity-level#ASIL capability|ASIL capability]]에서 다룬다.

## IEC 61508의 compliant item

[[iec-61508|IEC 61508]]-2:2010은 IEC 61508 시리즈의 준수를 주장하며 compliant item을 공급하는 공급자에게, 그 item마다 Annex D에 따른 safety manual for compliant items를 내도록 요구한다. 이 매뉴얼은 compliant item을 안전 관련 시스템이나 서브시스템, 요소에 IEC 61508의 요구사항대로 통합하는 데 필요한 정보를 모두 담는다. 공급자는 매뉴얼에 담은 정보마다 그 근거를 문서로 남겨야 한다.[@iec-functional-safety-faq-2023]

[[iso-sae-21434|ISO/SAE 21434]]의 out-of-context 컴포넌트는 [[cybersecurity-assessment#Tailoring과 out-of-context|cybersecurity assessment]]에서 다룬다.
