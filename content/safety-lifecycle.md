---
title: 안전 생명주기
tags:
  - process/sw-process
verified: 2026-10-01
---

**안전 생명주기**(safety lifecycle)는 개념부터 폐기까지 이어지는 단계 전체다.[@iso-26262-1-obp-2018][@iec-61508-1-preview-2010] [[iso-26262|ISO 26262]]는 자동차 안전 생명주기의 기준을 두고[@iso-26262-1-obp-2018], [[iec-61508|IEC 61508]]-1:2010은 E/E/PE(Electrical/Electronic/Programmable Electronic) 안전 관련 시스템의 [[functional-safety|기능 안전]]을 다루는 틀로 overall safety lifecycle 모델을 쓴다.[@iec-61508-1-preview-2010]

## ISO 26262의 안전 생명주기

ISO 26262-1:2018은 안전 생명주기의 단계로 concept phase, 시스템 수준 제품 개발, 하드웨어 수준 제품 개발, 소프트웨어 수준 제품 개발, 생산·운용·서비스·폐기를 들고, 이를 차례로 Part 3부터 Part 7까지가 정한다.[@iso-26262-1-obp-2018]

ISO 26262-3:2018은 concept phase를 item definition, [[hazard-analysis-and-risk-assessment|HARA]], [[safety-requirement#요구사항의 전개|functional safety concept]]으로 나누어 정한다. **Item definition**은 concept phase의 첫 활동으로, 아이템을 정의한다.[@iso-26262-3-obp-2018] ISO 26262-1:2018은 **아이템**(item)을 ISO 26262를 적용하는 시스템이나 시스템 묶음으로, 차량 수준에서 기능이나 그 일부를 구현하는 것으로 정의한다.[@iso-26262-1-obp-2018]

**Sub-phase**는 안전 생명주기의 단계를 나눈 것으로, ISO 26262의 한 절이 정한다. ISO 26262-3:2018의 6절이 정하는 HARA가 그 예다. **Modification**은 기존 아이템에서 새 아이템을 만드는 것이고, 재사용에 따른 생명주기 tailoring에 쓰인다. 주석은 change가 아이템의 생명주기 동안 적용되는 것과 달리 modification은 기존 아이템에서 새 아이템을 만들 때 적용된다고 둘을 가른다. **Safety validation**은 검사와 테스트를 바탕으로, [[hazard-analysis-and-risk-assessment#Safety goal|safety goal]]이 적절하고 충분한 무결성 수준으로 이뤄졌다는 보증이다. 알맞은 방법은 ISO 26262-4가 제시한다.[@iso-26262-1-obp-2018]

ISO 26262는 제품 개발 단계의 참조 프로세스 모델로 [[v-model|V 모델]]을 쓴다.[@iso-26262-1-obp-2018]

![[diagrams/iso-26262-safety-lifecycle-phases.svg]]

## 다른 기술과 외부 조치

ISO 26262는 기계, 유압, 공압처럼 다른 기술에 바탕을 둔 안전 관련 시스템도 고려할 수 있는 틀을 둔다. 이 표준은 관련 용어를 다음처럼 정의한다.[@iso-26262-1-obp-2018]

- **다른 기술**(other technology): ISO 26262 범위의 E/E(Electrical/Electronic) 기술과 다른 기술. 기계와 유압이 그 예다. Functional safety concept을 명세할 때, [[safety-requirement|안전 요구사항]]을 할당할 때, 또는 외부 조치로 고려할 수 있다.
- **외부 조치**(external measure): 아이템과 따로 떨어진 조치로, 아이템에서 생기는 리스크를 줄이거나 누그러뜨린다.[@iso-26262-1-obp-2018]

## 시스템 수준의 단계

ISO 26262-4:2018은 시스템 수준 제품 개발의 요구사항을 다음 주제로 나누어 정한다.[@iso-26262-4-obp-2018]

- 시스템 수준 제품 개발을 시작할 때의 일반 사항
- [[safety-requirement#요구사항의 전개|technical safety requirement]]의 명세
- Technical safety concept
- 시스템 아키텍처 설계
- 아이템 통합과 테스트
- Safety validation[@iso-26262-4-obp-2018]

## 소프트웨어 수준의 단계

ISO 26262-6:2018은 소프트웨어 수준 제품 개발의 요구사항을 다음 단계로 나누어 정한다.[@iso-26262-6-obp-2018]

1. 소프트웨어 안전 요구사항 명세
2. [[software-architecture|소프트웨어 아키텍처]] 설계
3. 소프트웨어 단위 설계와 구현
4. 소프트웨어 단위 검증
5. 소프트웨어 통합과 검증
6. 임베디드 소프트웨어 테스트[@iso-26262-6-obp-2018]

이 표준은 configurable software의 사용에 관한 요구사항도 정한다.[@iso-26262-6-obp-2018]

## IEC 61508의 overall safety lifecycle

IEC 61508-1:2010은 **overall safety lifecycle**을 다음 16개 단계로 정한다.[@iec-61508-1-preview-2010]

1. 개념
2. 전체 범위 정의
3. 해저드와 리스크 분석
4. 전체 안전 요구사항
5. 전체 안전 요구사항의 할당. E/E/PE 안전 관련 시스템과 다른 리스크 감소 수단에 나눈다.
6. 전체 운용·유지보수 계획
7. 전체 안전 확인 계획
8. 전체 설치·시운전 계획
9. E/E/PE 시스템 안전 요구사항 명세
10. E/E/PE 안전 관련 시스템의 실현
11. 다른 리스크 감소 수단의 명세와 실현
12. 전체 설치와 시운전
13. 전체 안전 확인
14. 전체 운용, 유지보수, 수리
15. 전체 수정과 개조
16. 폐기나 처분[@iec-61508-1-preview-2010]

IEC 61508-2:2010은 E/E/PE 안전 관련 시스템의 설계와 제조 동안 할 활동의 요구사항으로 E/E/PE 시스템 안전 생명주기 모델을 세우고, 소프트웨어는 IEC 61508-3:2010에 맡긴다.[@iec-61508-2-preview-2010] IEC 61508-3:2010은 안전 관련 소프트웨어의 설계와 개발에 적용할 단계와 활동의 요구사항으로 소프트웨어 안전 생명주기 모델을 세운다.[@iec-61508-3-preview-2010]

[[functional-safety#안전 기능과 안전 무결성|기능 안전]]에서 다루듯, IEC 61508은 필요한 안전 기능을 해저드와 리스크 분석에서 끌어낸다.[@iec-functional-safety-faq-2023]
