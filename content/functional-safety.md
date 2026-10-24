---
title: 기능 안전
tags:
  - sw-engineering/functional-safety
verified: 2026-10-01
---

IEC 60050은 **기능 안전**(functional safety)을 전체 안전 가운데, 기능 단위와 물리 단위가 입력에 맞게 올바르게 동작하는 데 달린 부분으로 정의한다.[@iec-60050-351-57-06-2013] [[iso-26262|ISO 26262]]-1:2018은 기능 안전을 E/E(Electrical/Electronic) 시스템의 오동작이 일으키는 해저드 때문에 생기는 불합리한 리스크가 없는 상태로 정의한다.[@iso-26262-1-obp-2018]

[[iec-61508|IEC 61508]]은 응용 분야와 상관없이 모든 E/E/PE(Electrical/Electronic/Programmable Electronic) 안전 관련 시스템에 적용하는 일반 표준이다.[@iec-61508-1-preview-2010] ISO 26262는 양산 도로 차량의 E/E 시스템을 대상으로 IEC 61508을 고친 표준이다.[@iso-26262-1-obp-2018]

![[diagrams/iec-61508-sector-standards.svg]]

## 안전과 리스크

ISO/IEC Guide 51:2014는 **안전**(safety)을 허용할 수 없는 리스크가 없는 상태로 정의한다.[@iso-iec-guide-51-obp-2014] IEC 61508-4:2010도 안전을 허용할 수 없는 리스크가 없는 상태로 정의하되, 리스크의 대상을 사람의 신체 상해나 건강 피해로 둔다. 재산이나 환경 피해를 거쳐 간접으로 생기는 상해와 피해도 여기에 든다.[@iec-functional-safety-faq-2023] ISO 26262-1:2018은 안전을 불합리한 리스크가 없는 상태로 정의한다.[@iso-26262-1-obp-2018]

이 표준은 **불합리한 리스크**(unreasonable risk)를 그 시점에 통용되는 사회의 도덕 관념에 비추어 주어진 맥락에서 받아들일 수 없다고 판단되는 리스크로 정의한다. 또 잔여 리스크를 [[safety-mechanism|안전 조치]](safety measure)를 적용한 뒤에도 남는 리스크로 정의한다.[@iso-26262-1-obp-2018]

NASA-STD-8739.8B는 **safety-critical**을, 잘못 수행되거나 잘못 만들어지거나 고쳐지지 않은 채 남으면 심각한 부상, 큰 피해, 임무 실패를 일으키거나 그리로 이어질 수 있는 조건, 사건, 운용, 프로세스, 장비, 시스템을 가리키는 말로 정의한다.[@nasa-std-8739-8b-2022]

ISO/IEC Guide 51:2014는 리스크에 관한 용어를 다음처럼 정의한다.[@iso-iec-guide-51-obp-2014]

- **리스크**(risk): 해(harm)가 일어날 확률과 그 해의 심각도의 조합. 주석은 해가 일어날 확률에 해저드 상황에 노출되는 것, 해저드 사건이 일어나는 것, 해를 피하거나 줄일 가능성이 든다고 제시한다.
- **허용 리스크**(tolerable risk): 그 시점 사회의 가치에 따라 주어진 맥락에서 받아들여지는 리스크 수준
- **잔여 리스크**(residual risk): 리스크 감소 조치를 한 뒤에도 남는 리스크
- **리스크 분석**(risk analysis): 쓸 수 있는 정보를 체계적으로 써서 해저드를 찾고 리스크를 추정하는 것
- **risk evaluation**: 리스크 분석을 바탕으로 허용 리스크를 넘었는지 정하는 절차
- **리스크 평가**(risk assessment): 리스크 분석과 risk evaluation을 아우르는 전체 프로세스
- **리스크 감소 조치**(risk reduction measure): 해저드를 없애거나 리스크를 줄이는 행동이나 수단. Inherently safe design, 보호 장치, 개인 보호구, 사용·설치 정보, 작업 조직, 교육, 장비 사용, 감독이 그 예다.
- **inherently safe design**: 제품이나 시스템의 설계나 운용 특성을 바꿔 해저드를 없애거나 리스크를 줄이는 조치[@iso-iec-guide-51-obp-2014]

CENELEC Guide 32:2026(CENELEC: 유럽 전기기술 표준화 기구)은 저전압 기기의 리스크를 줄이는 길로, 해저드를 없애는 것과 리스크를 정하는 두 요소인 해의 심각도와 해가 일어날 확률을 따로 또는 함께 낮추는 것을 둔다.[@cenelec-guide-32-2026][@cenelec-about-2026]

ISO/IEC Guide 51:2014는 안전하다는 것을 모든 해저드가 아니라 해를 일으킬 수 있다고 알려진 해저드로부터 보호된 상태로 보며, 제품과 시스템에는 어느 정도의 리스크가 늘 따른다고 둔다. 이 지침이 내놓는 접근의 목표는 사람, 재산, 환경에 대해 허용 리스크를 이루는 것이다.[@iso-iec-guide-51-obp-2014] IEC에 따르면 리스크를 0으로 만들 수는 없고, 기능 안전은 내장된 안전 메커니즘을 작동시켜 리스크를 허용 수준까지 낮춘다.[@iec-functional-safety-2025]

![[diagrams/functional-safety-risk-reduction.svg]]

IEC에 따르면 기능 안전은 해저드를 다루는 여러 방법 가운데 하나일 뿐이고, 설계로 이루는 inherent safety처럼 해저드를 없애거나 줄이는 다른 수단이 가장 중요하다. IEC 61508-1:2010은 해저드를 없애는 것을 고려하도록 요구하고, 해저드를 원천에서 없애는 것을 무엇보다 중요하게 본다.[@iec-functional-safety-faq-2023]

해저드(hazard), 해저드 사건(hazardous event) 같은 용어는 [[hazard-analysis-and-risk-assessment#용어|HARA]]에서 다룬다.

## 능동적인 수단

IEC 61508이 다루는 기능 안전은 능동적인 시스템에 기댄다. 내화문이나 고온을 견디는 절연재 같은 수동적인 수단은 같은 해저드를 막더라도 기능 안전에 들지 않는다.[@iec-functional-safety-faq-2023]

IEC는 그 예로 모터 권선의 온도 센서로 과열 전에 모터 전원을 끊는 과온 보호 장치를 기능 안전으로 든다. 고온을 견디는 특수 절연재는 같은 해저드를 막고 안전에 기여하지만, 기능 안전으로 들지 않는다.[@iec-tr-61508-0-draft-2005]

## 안전 기능과 안전 무결성

IEC에 따르면 기능 안전은 지정된 안전 기능이 모두 수행되고, 안전 기능마다 요구되는 성능 수준이 충족될 때 이뤄진다. IEC 61508:2010은 **안전 관련 시스템**(safety-related system)을 하나 이상의 안전 기능을 수행하는 데 필요한 하드웨어, 소프트웨어, 사람 요소 전부로 두고, 그 안전 기능이 실패하면 사람이나 환경의 안전에 대한 리스크가 크게 늘어나는 시스템으로 본다.[@iec-functional-safety-faq-2023]

IEC 61508은 안전 기능의 명세를 둘로 나눈다.[@iec-functional-safety-faq-2023]

- **안전 기능 요구사항**(safety function requirements): 안전 기능이 무엇을 하는지
- **안전 무결성 요구사항**(safety integrity requirements): 안전 기능이 만족스럽게 수행될 가능성[@iec-functional-safety-faq-2023]

IEC 61508은 **안전 무결성**(safety integrity)을 안전 관련 시스템이 명시된 모든 조건에서, 명시된 기간 안에 지정된 안전 기능을 수행할 확률로 정의한다.[@iec-acos-61508-overview-2022]

IEC 61508은 필요한 안전 기능을 해저드와 리스크 분석에서 끌어낸다.[@iec-functional-safety-faq-2023] IEC 61508-1:2010은 안전 무결성 요구사항을 리스크 기반 접근으로 정한다.[@iec-61508-1-preview-2010] 안전 무결성은 네 단계의 [[safety-integrity-level|SIL]]로 나타내며, 단계마다 안전 기능이 실패할 가능성의 목표 구간 하나가 대응한다.[@iec-functional-safety-faq-2023]

## Systematic failure와 random hardware failure

ISO 26262-1:2018은 **systematic failure**를 어떤 원인과 결정론적으로 이어져 있어, 설계나 제조 프로세스, 운용 절차, 문서 같은 관련 요인을 바꿔야만 없앨 수 있는 [[fault-error-failure|failure]]로 정의한다. **Random hardware failure**는 하드웨어 요소의 수명 동안 예측할 수 없게 일어날 수 있고 확률 분포를 따르는 failure다.[@iso-26262-1-obp-2018]

이 표준은 fault도 같은 축으로 나눈다. **Systematic fault**는 그 failure가 결정론적으로 드러나 프로세스나 설계 조치로만 막을 수 있는 fault이고, **random hardware fault**는 확률 분포를 갖는 하드웨어 fault다.[@iso-26262-1-obp-2018]

이 표준의 Introduction은 기술 복잡도, 소프트웨어 비중, 메카트로닉스 구현이 늘면서 systematic failure와 random hardware failure의 리스크가 커진다고 보고, 둘이 모두 기능 안전의 범위에 든다고 제시한다.[@iso-26262-1-obp-2018]
