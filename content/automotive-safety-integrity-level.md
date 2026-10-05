---
title: ASIL
tags:
  - process/sw-process
verified: 2026-10-01
---

**ASIL**(Automotive Safety Integrity Level)은 [[iso-26262|ISO 26262]]가 [[safety-lifecycle#ISO 26262의 안전 생명주기|아이템]]이나 요소에 적용할 요구사항과 안전 조치를 정해 불합리한 리스크를 피하려고 두는 네 등급 가운데 하나다. ASIL D가 가장 엄격하고 ASIL A가 가장 덜 엄격하다.[@iso-26262-1-obp-2018]

## S·E·C 파라미터

ASIL은 [[hazard-analysis-and-risk-assessment|HARA]]에서 [[hazard-analysis-and-risk-assessment#Safety goal|safety goal]]과 함께 정한다. ISO 26262-1:2018은 HARA의 파라미터 셋을 다음처럼 정의한다.[@iso-26262-1-obp-2018]

- **심각도**(severity, S): 잠재적 해저드 사건에서 한 명 이상이 입을 수 있는 해의 정도를 추정한 값
- **노출**(exposure, E): 분석하는 failure mode와 겹치면 위험해질 수 있는 운용 상황에 놓인 상태
- **통제 가능성**(controllability, C): 관련된 사람이 제때 반응해 특정한 해나 손상을 피할 수 있는 능력. 관련된 사람에는 운전자, 승객, 차 밖의 사람이 들 수 있고, 외부 조치가 그 반응을 도울 수 있다.[@iso-26262-1-obp-2018]

이 표준은 QM(Quality Management)을 ASIL로 보지 않지만, HARA에서 QM을 지정할 수 있게 한다.[@iso-26262-1-obp-2018]

![[diagrams/hara-hazardous-event-parameters-results.svg]]

## ASIL decomposition

ISO 26262-1:2018은 **ASIL decomposition**을 같은 safety goal에 기여하는 중복된 [[safety-requirement|안전 요구사항]]을 충분히 독립된 요소들에 나누어 할당하는 것으로 정의한다. 그 요소들에 할당한 중복 요구사항의 ASIL을 낮추는 것이 목적이다.[@iso-26262-1-obp-2018]

## SIL과의 차이

[[safety-integrity-level|SIL]]은 [[iec-61508|IEC 61508]]이 E/E/PE(Electrical/Electronic/Programmable Electronic) 안전 관련 시스템이 수행할 안전 기능의 목표 안전 무결성을 정하려고 두는 등급이다.[@iec-61508-1-preview-2010] ISO 26262는 IEC 61508을 도로 차량의 E/E(Electrical/Electronic) 시스템에 맞게 고친 표준이고, 자동차에 맞춘 리스크 기반 방법으로 ASIL을 정한다.[@iso-26262-1-obp-2018]

- 등급의 방향: 둘 다 네 등급이다. SIL은 4가 안전 무결성이 가장 높고[@iec-acos-61508-overview-2022], ASIL은 D가 가장 엄격하다.[@iso-26262-1-obp-2018]
- 정하는 근거: IEC 61508-1:2010은 SIL마다 안전 기능의 [[safety-integrity-level#Target failure measure|target failure measure]]를 묶어 둔다. 다만 SIL을 어떻게 정할지는 강제하지 않고, 리스크 기반 개념 틀과 예시 기법을 준다.[@iec-61508-1-preview-2010] ISO 26262-1:2018은 HARA가 safety goal과 함께 ASIL을 정한다고 정의하고, HARA의 파라미터로 심각도, 노출, 통제 가능성을 둔다.[@iso-26262-1-obp-2018]
