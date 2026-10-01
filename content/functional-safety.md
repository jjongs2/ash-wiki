---
title: 기능 안전
tags:
  - process/sw-process
verified: 2026-10-01
---

IEC 60050은 **기능 안전**(functional safety)을 전체 안전 가운데, 기능 단위와 물리 단위가 입력에 맞게 올바르게 동작하는 데 달린 부분으로 정의한다.[@iec-60050-351-57-06-2013] ISO 26262-1:2018은 기능 안전을 E/E(Electrical/Electronic) 시스템의 오동작이 일으키는 해저드 때문에 생기는 불합리한 리스크가 없는 상태로 정의한다.[@iso-26262-1-obp-2018]

[[iec-61508|IEC 61508]]은 응용 분야와 상관없이 모든 E/E/PE(Electrical/Electronic/Programmable Electronic) 안전 관련 시스템에 적용하는 일반 표준이다.[@iec-61508-1-preview-2010] [[iso-26262|ISO 26262]]는 양산 도로 차량의 E/E 시스템을 대상으로 IEC 61508을 고친 표준이다.[@iso-26262-1-obp-2018]

![[diagrams/iec-61508-sector-standards.svg]]

## 안전과 리스크

ISO/IEC Guide 51:2014는 **안전**(safety)을 허용할 수 없는 리스크가 없는 상태로 정의한다.[@iso-iec-guide-51-obp-2014] IEC 61508-4:2010도 안전을 허용할 수 없는 리스크가 없는 상태로 정의하되, 리스크의 대상을 사람의 신체 상해나 건강 피해로 둔다. 재산이나 환경 피해를 거쳐 간접으로 생기는 상해와 피해도 여기에 든다.[@iec-functional-safety-faq-2023] ISO 26262-1:2018은 안전을 불합리한 리스크가 없는 상태로 정의한다.[@iso-26262-1-obp-2018]

ISO/IEC Guide 51:2014는 리스크에 관한 용어를 다음처럼 정의한다.[@iso-iec-guide-51-obp-2014]

- **리스크**(risk): 해(harm)가 일어날 확률과 그 해의 심각도의 조합
- **허용 리스크**(tolerable risk): 그 시점 사회의 가치에 따라 주어진 맥락에서 받아들여지는 리스크 수준
- **잔여 리스크**(residual risk): 리스크 감소 조치를 한 뒤에도 남는 리스크[@iso-iec-guide-51-obp-2014]

ISO/IEC Guide 51:2014는 안전하다는 것을 모든 해저드가 아니라 해를 일으킬 수 있다고 알려진 해저드로부터 보호된 상태로 보며, 제품과 시스템에는 어느 정도의 리스크가 늘 따른다고 둔다. 이 지침이 내놓는 접근의 목표는 사람, 재산, 환경에 대해 허용 리스크를 이루는 것이다.[@iso-iec-guide-51-obp-2014] IEC에 따르면 리스크를 0으로 만들 수는 없고, 기능 안전은 내장된 안전 메커니즘을 작동시켜 리스크를 허용 수준까지 낮춘다.[@iec-functional-safety-2025]

![[diagrams/functional-safety-risk-reduction.svg]]

해저드(hazard), 해저드 사건(hazardous event) 같은 용어는 [[hazard-analysis-and-risk-assessment|HARA]]에서 다룬다.

## 능동적인 수단

IEC 61508이 다루는 기능 안전은 능동적인 시스템에 기댄다. 내화문이나 고온을 견디는 절연재 같은 수동적인 수단은 같은 해저드를 막더라도 기능 안전에 들지 않는다.[@iec-functional-safety-faq-2023]

IEC는 그 예로 모터 권선의 온도 센서로 과열 전에 모터 전원을 끊는 과온 보호 장치를 기능 안전으로 든다. 고온을 견디는 특수 절연재는 같은 해저드를 막고 안전에 기여하지만, 기능 안전으로 들지 않는다.[@iec-tr-61508-0-draft-2005]

## 안전 기능과 안전 무결성

IEC 61508은 안전 기능의 명세를 둘로 나눈다.[@iec-functional-safety-faq-2023]

- **안전 기능 요구사항**(safety function requirements): 안전 기능이 무엇을 하는지
- **안전 무결성 요구사항**(safety integrity requirements): 안전 기능이 만족스럽게 수행될 가능성[@iec-functional-safety-faq-2023]

IEC 61508은 필요한 안전 기능을 해저드와 리스크 분석에서 끌어낸다.[@iec-functional-safety-faq-2023] IEC 61508-1:2010은 안전 무결성 요구사항을 리스크 기반 접근으로 정한다.[@iec-61508-1-preview-2010] 안전 무결성은 네 단계의 [[safety-integrity-level|SIL]]로 나타내며, 단계마다 안전 기능이 실패할 가능성의 목표 구간 하나가 대응한다.[@iec-functional-safety-faq-2023]
