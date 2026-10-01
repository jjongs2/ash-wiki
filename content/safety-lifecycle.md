---
title: 안전 생명주기
tags:
  - process/sw-process
verified: 2026-10-01
---

**안전 생명주기**(safety lifecycle)는 개념부터 폐기까지 이어지는 단계 전체다.[@iso-26262-1-obp-2018][@iec-61508-1-preview-2010] [[iso-26262|ISO 26262]]는 자동차 안전 생명주기의 기준을 두고,[@iso-26262-1-obp-2018] IEC 61508-1:2010은 E/E/PE(Electrical/Electronic/Programmable Electronic) 안전 관련 시스템의 기능 안전을 다루는 틀로 overall safety lifecycle 모델을 쓴다.[@iec-61508-1-preview-2010]

## ISO 26262의 안전 생명주기

ISO 26262-1:2018은 안전 생명주기를 다섯 단계로 나누고, 단계마다 그것을 정하는 부를 둔다.[@iso-26262-1-obp-2018]

| 단계                      | 정하는 부 |
| ------------------------- | --------- |
| Concept phase             | Part 3    |
| 시스템 수준 제품 개발     | Part 4    |
| 하드웨어 수준 제품 개발   | Part 5    |
| 소프트웨어 수준 제품 개발 | Part 6    |
| 생산, 운용, 서비스, 폐기  | Part 7    |

Concept phase는 item definition, [[hazard-analysis-and-risk-assessment|HARA]], functional safety concept으로 이뤄진다. **아이템**(item)은 ISO 26262를 적용하는 시스템이나 시스템 묶음으로, 차량 수준에서 기능이나 그 일부를 구현한다. **Item definition**은 concept phase의 첫 활동으로, 아이템을 정의한다.[@iso-26262-1-obp-2018]

ISO 26262는 제품 개발 단계의 참조 프로세스 모델로 V 모델을 쓴다.[@iso-26262-1-obp-2018]

![[diagrams/iso-26262-safety-lifecycle-phases.svg]]

## 다른 기술과 외부 조치

ISO 26262는 기계, 유압, 공압처럼 다른 기술에 바탕을 둔 안전 관련 시스템도 고려할 수 있는 틀을 둔다. ISO 26262-1:2018은 관련 용어를 다음처럼 정의한다.[@iso-26262-1-obp-2018]

- **다른 기술**(other technology): ISO 26262 범위의 E/E(Electrical/Electronic) 기술과 다른 기술. 기계와 유압이 그 예다. Functional safety concept을 명세할 때, 안전 요구사항을 할당할 때, 또는 외부 조치로 고려할 수 있다.
- **외부 조치**(external measure): 아이템과 따로 떨어진 조치로, 아이템에서 생기는 리스크를 줄이거나 누그러뜨린다. HARA의 통제 가능성은 관련된 사람이 제때 반응해 해를 피하는 능력인데, 외부 조치가 그 반응을 도울 수 있다.[@iso-26262-1-obp-2018]

## 소프트웨어 수준의 단계

ISO 26262-6:2018은 소프트웨어 수준 제품 개발의 요구사항을 다음 단계로 나누어 정한다.[@iso-26262-6-obp-2018]

1. 소프트웨어 안전 요구사항 명세
2. 소프트웨어 아키텍처 설계
3. 소프트웨어 단위 설계와 구현
4. 소프트웨어 단위 검증
5. 소프트웨어 통합과 검증
6. 임베디드 소프트웨어 테스트[@iso-26262-6-obp-2018]

## IEC 61508의 overall safety lifecycle

IEC 61508-1:2010은 **overall safety lifecycle**을 개념에서 시작해 폐기나 처분으로 끝나는 16개 단계로 정한다. 개념과 전체 범위 정의 뒤에 해저드와 리스크 분석, 전체 안전 요구사항의 명세와 할당이 온다. 할당은 E/E/PE 안전 관련 시스템과 다른 리스크 감소 수단에 나뉜다. 이어 운용·유지보수, 안전 확인, 설치·시운전을 계획하고, E/E/PE 시스템의 안전 요구사항을 명세한 뒤, E/E/PE 안전 관련 시스템과 다른 리스크 감소 수단을 실현한다. 그 뒤로 설치와 시운전, 전체 안전 확인, 운용·유지보수·수리, 수정과 개조, 폐기나 처분이 이어진다.[@iec-61508-1-preview-2010]
