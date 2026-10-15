---
title: ISO/PAS 8800
tags:
  - sw-engineering/functional-safety
verified: 2026-10-12
publisher: ISO
edition: 2024
status: 유효
---

**ISO/PAS 8800**은 AI 기술을 쓰는 E/E(Electrical/Electronic) 시스템을 하나 이상 포함하고 양산 도로 차량에 설치되는 안전 관련 시스템의 안전을 다루는 ISO의 PAS(Publicly Available Specification)다. 모페드는 대상에서 빠진다. 정식 제목은 "Road vehicles — Safety and artificial intelligence"이고, ISO/TC 22/SC 32가 맡는다.[@iso-pas-8800-2024]

## 범위

이 문서는 차량 안 AI 요소의 [[sotif#기능 부족|출력 부족]], systematic error, random hardware error 때문에 차량 수준에서 생기는 원치 않는 안전 관련 거동의 리스크를 다룬다. 차량 밖 AI 요소와의 상호작용 가운데 차량 안전에 직접이나 간접으로 영향을 줄 수 있는 것도 여기에 든다. 장애가 있는 운전자를 위한 E/E 시스템처럼 특수 차량에만 있는 E/E 시스템은 다루지 않는다. AI 방법을 쓰는 소프트웨어 도구에 대한 지침은 주지 않는다. AI 방법 가운데 주로 머신러닝을 다루며, 심층 신경망 같은 특정 AI 방법의 세부에는 초점을 두지 않는다.[@iso-pas-8800-obp-2024]

이 문서는 [[iso-26262|ISO 26262]] 시리즈와 [[iso-21448|ISO 21448]]의 기존 접근을 tailoring하거나 넓혀 AI 안전을 관리하는 틀을 정한다. AI 시스템의 오동작에 따른 [[functional-safety|기능 안전]] 리스크는 ISO 26262 시리즈의 관련 조항을 tailoring하거나 넓혀 다루고, AI 시스템의 기능 부족에 따른 리스크는 ISO 21448의 개념과 지침을 넓혀 다룬다. [[hazard-analysis-and-risk-assessment#용어|해저드]] 분석과 리스크 분석은 범위 밖이며, ISO 26262 시리즈와 ISO 21448이 다루는 차량 수준 시스템 안전 공학 활동에 속한다.[@iso-pas-8800-obp-2024]

![[diagrams/iso-pas-8800-iso-26262-iso-21448.svg]]

이 문서가 ISO 26262, ISO 21448 등 관련 문서에 더하는 내용은 다음과 같다.[@iso-pas-8800-obp-2024]

- AI 요소에 필요한 ISO 26262와 ISO 21448의 tailoring이나 확장
- AI 시스템에 고유한 error와 그 원인을 따지는 개념 모델
- 참조 AI [[safety-lifecycle|안전 생명주기]]
- AI 시스템의 safety assurance argument
- AI [[safety-requirement|안전 요구사항]]을 끌어내는 방법
- 안전한 AI 시스템 설계의 고려 사항
- AI 시스템의 데이터 관리 고려 사항
- AI 시스템의 [[verification-and-validation|검증과 확인]] 전략
- 부족에 초점을 둔 AI 시스템의 [[safety-analysis|안전 분석]] 접근
- 운용 중 AI 안전을 계속 지키는 활동[@iso-pas-8800-obp-2024]

이 문서는 안전 요구사항을 안전에 관련된 요구사항으로 넓게 정의하고, [[sotif|SOTIF]] 요구사항과 functional safety requirement, technical safety requirement를 예로 든다. 주석은 기능 안전에서 오는 안전 요구사항과 SOTIF에서 오는 안전 요구사항이 모두 여기에 든다고 제시한다.[@iso-pas-8800-obp-2024]

## 개정 이력

- 2024년: ISO/PAS 8800:2024(1판)가 12월에 나왔다.[@iso-pas-8800-2024]
