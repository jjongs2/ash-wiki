---
title: SOTIF
tags:
  - sw-engineering/functional-safety
aliases:
  - Safety of the intended functionality
verified: 2026-10-01
---

**SOTIF**(Safety Of The Intended Functionality)는 의도된 기능이나 그 구현의 기능 부족에서 오는 [[hazard-analysis-and-risk-assessment#용어|해저드]] 때문에 생기는 불합리한 리스크가 없는 상태다. [[iso-21448|ISO 21448:2022]]가 SOTIF를 확보하는 조치의 틀과 지침을 준다.[@iso-21448-obp-2022]

## 기능 부족

이 표준은 **기능 부족**(functional insufficiency)을 명세의 부족이나 성능의 부족으로 정의한다. 기능 부족은 차량 수준에서도, 시스템의 E/E(Electrical/Electronic) 요소에서도 생길 수 있다.[@iso-21448-obp-2022]

- **명세의 부족**(insufficiency of specification): 하나 이상의 triggering condition으로 활성화되면 해저드 동작에 기여하거나, 합리적으로 예견할 수 있는 간접 오용을 막거나 감지하거나 완화하지 못하는 결과에 기여하는 명세. 이런 명세는 불완전할 수 있다.
- **성능의 부족**(performance insufficiency): triggering condition으로 활성화되면 같은 결과에 기여하는 기술적 능력의 한계. 제한된 연산 성능, 센서의 제한된 인식 범위, 제한된 구동 능력이 그 예다.[@iso-21448-obp-2022]

요소 수준의 기능 부족이 triggering condition으로 활성화되면 **출력 부족**(output insufficiency)이 된다. 출력 부족은 혼자서, 또는 다른 요소의 출력 부족과 함께 차량 수준의 해저드 동작이나, 합리적으로 예견할 수 있는 간접 오용을 막거나 감지해 완화하지 못하는 결과에 기여한다. 요소의 기능 부족 가운데 triggering condition으로 활성화되면 바로 이런 결과로 이어지는 것을 **single-point functional insufficiency**, 다른 요소의 기능 부족과 함께일 때만 이어지는 것을 **multiple-point functional insufficiency**라 한다.[@iso-21448-obp-2022]

## Triggering condition

이 표준은 **triggering condition**을 시나리오의 특정 조건으로 정의한다. 이 조건이 뒤따르는 시스템 반응을 일으켜, 해저드 동작이나 간접 오용에 대처하지 못하는 결과로 이어지게 한다. 기능 부족을 활성화하는 것이 triggering condition이다. Triggering condition이 속하는 시나리오는 이어진 장면(scene) 사이의 시간 관계를 기술한 것이고, 장면에는 날씨나 조명 같은 환경 요소, 도로와 교통 표지 같은 기반 시설, 움직이거나 서 있는 객체와 행위자가 들 수 있다.[@iso-21448-obp-2022]

![[diagrams/sotif-triggering-condition-chain.svg]]

## 합리적으로 예견할 수 있는 오용

이 표준은 **오용**(misuse)을 제조사나 서비스 제공자가 의도하지 않은 방식으로 쓰는 것으로 정의한다. 의도하지 않은 사람의 행동은 여기에 들고, 고의로 시스템을 바꾸거나 해를 끼치려고 쓰는 것은 들지 않는다.[@iso-21448-obp-2022] [[iso-26262|ISO 26262]]-1:2018은 합리적으로 예견할 수 있다는 것을 기술적으로 가능하고 일어나는 빈도가 믿을 만하거나 잴 수 있는 것으로 정의한다.[@iso-26262-1-obp-2018]

ISO 21448:2022는 합리적으로 예견할 수 있는 오용을 범위에 넣고, 시스템의 의도된 사용을 고의로 명백히 어기는 행위는 범위에서 뺀다.[@iso-21448-obp-2022]

이 표준은 해저드 동작과의 인과 관계에 따라 오용을 직접 오용과 간접 오용으로 나눈다. 직접 오용은 시스템의 해저드 동작을 일으킬 수 있어 potential triggering condition으로 보고, 해저드 동작에 기여할 수 있음이 확인되면 triggering condition으로 본다. 다른 시나리오 조건과 함께 triggering condition의 일부가 되기도 한다. 고속도로용 기능을 도심에서 켜 차량이 정지 표지를 감지하지 못하는 것이 그 예다. 간접 오용은 해저드 동작의 통제 가능성을 낮추거나 사고의 심각도를 높일 수 있지만, 시스템의 해저드 동작 자체에는 기여하지 못하므로 potential triggering condition으로 보지 않는다. 운전자가 레벨 2 고속도로 보조 기능을 쓰다가 잠들어 감시하지 않는 것이 그 예다.[@iso-21448-obp-2022]

## 해저드의 원천

이 표준은 Introduction의 표 1에서 해저드 사건의 원인을 시스템과 외부 요인으로 나누고, 원인마다 그것을 다루는 표준을 제시한다. 그 가운데 몇 가지는 다음과 같다.[@iso-21448-obp-2022]

- 시스템의 E/E fault: ISO 26262 시리즈
- 시스템의 기능 부족, 잘못되거나 부적절한 HMI(Human Machine Interface) 설계(사용자의 혼동, 과부하, 부주의 등), AI 기반 알고리즘의 기능 부족: ISO 21448
- 라이다 빔에 의한 눈 손상처럼 시스템 기술이 일으키는 해저드: 개별 표준(IEC 60825 등)
- 외부 요인인 차량 보안 취약점을 노린 공격: [[iso-sae-21434|ISO/SAE 21434]][@iso-21448-obp-2022]

이 표준은 사용자가 기능과 그 거동, HMI를 포함한 한계를 제대로 이해하는 것이 안전에 꼭 필요하다고 보고, 레벨 2 자동 운전 시스템을 쓰면서 운전자가 주의를 기울이지 않는 것과 모드 혼동을 예로 든다. 모드 혼동은 기능이 꺼져 있는데 운전자가 켜져 있다고 여기는 것처럼 해저드로 바로 이어질 수 있다. 인프라가 주는 정보(V2X(Vehicle-to-X) 통신, 지도 등)도 SOTIF에 영향을 줄 수 있으면 기능 부족 평가에 든다.[@iso-21448-obp-2022]

AI 시스템의 기능 부족에서 오는 리스크는 [[iso-pas-8800|ISO/PAS 8800]]:2024가 ISO 21448의 개념과 지침을 넓혀 다룬다.[@iso-pas-8800-obp-2024] SAE J3187-2:2023은 [[stpa|STPA]]를 SOTIF 평가에 적용하는 권고 실무를 둔다.[@sae-j3187-2-2023]

## SOTIF 조치의 단계

ISO 21448:2022는 SOTIF를 위해 해저드를 없애거나 리스크를 줄이는 조치를 아래 세 단계에 두고, 단계마다 예를 든다.[@iso-21448-obp-2022]

- 명세와 설계 단계: 찾아낸 시스템의 부족이나 해저드 시나리오에 따라 차량 기능이나 센서 성능 요구사항을 고친다.
- [[verification-and-validation|검증과 확인]] 단계: 기술 검토, 관련 시나리오를 넓게 덮는 [[test-case|테스트 케이스]], potential triggering condition의 주입, 고른 시나리오의 software·hardware·model in the loop 테스트, 장기 차량 시험, 시험장 차량 시험, 시뮬레이션 시험
- 운용 단계: SOTIF incident의 현장 모니터링[@iso-21448-obp-2022]

## Acceptance criterion과 validation target

이 표준은 **acceptance criterion**을 불합리한 수준의 리스크가 없음을 나타내는 기준으로 정의한다. 이 기준은 정성적일 수도 정량적일 수도 있고, 어떤 거동을 해저드 동작으로 볼지 정하는 물리 파라미터, 시간당 최대 incident 수, ALARP(as low as reasonably practicable)가 그 예다. **Validation target**은 acceptance criterion을 만족한다고 논증하는 값이다. SOTIF에서 확인(validation)은 찾아낸 해저드의 acceptance criterion이 충분한 신뢰도로 달성될 것이라는, 검사와 시험에 근거한 보증이다. Acceptance criterion 하나를 완전히 만족하려면 validation target이 둘 이상 필요할 수 있다.[@iso-21448-obp-2022]

## ISO 26262와의 차이

ISO 26262-1:2018은 [[functional-safety|기능 안전]]을 E/E 시스템의 [[hazard-analysis-and-risk-assessment#용어|오동작]]이 일으키는 해저드에 관한 것으로 정의한다.[@iso-26262-1-obp-2018] ISO 26262가 다루는 failure가 없어도, 의도된 기능과 그 구현이 해저드 동작을 일으킬 수 있다. ISO 21448:2022는 이런 기능 부족과 합리적으로 예견할 수 있는 오용에서 오는 해저드를 다루고, ISO 26262가 다루는 failure는 범위에서 뺀다.[@iso-21448-obp-2022]

![[diagrams/functional-safety-sotif-hazard-sources.svg]]

이 표준은 기능 안전과 SOTIF를 안전의 서로 보완하는 측면으로 보며, E/E 시스템의 [[functional-safety#Systematic failure와 random hardware failure|random hardware failure와 systematic failure]]는 ISO 26262 시리즈로 다룬다고 가정한다.[@iso-21448-obp-2022]

이 표준은 ISO 26262 시리즈가 의도된 기능이 안전하다고 가정하고, 의도된 기능에서 벗어나 해저드를 일으킬 수 있는 E/E 시스템의 fault를 다룬다고 본다. 또 ISO 26262 시리즈가 다루는 fault가 없어도 해저드 동작을 낳을 수 있는 원인으로, 기능이 환경을 바르게 인식하지 못하는 것, 센서 입력의 변화나 융합에 쓴 휴리스틱이나 다양한 환경 조건에 대한 기능·시스템·알고리즘의 강건성 부족, 의사 결정 알고리즘이나 사람의 기대와의 어긋남에서 오는 예상치 못한 거동을 예로 든다. 이런 요인은 머신러닝을 쓰는 기능, 시스템, 알고리즘에 특히 관련된다.[@iso-21448-obp-2022]

이 표준은 **해저드**를 차량 수준의 해저드 동작이 일으키는 해의 잠재적 원천으로 정의한다. 이 정의는 ISO 26262-1:2018의 해저드 정의(3.75)에서 'malfunctioning'을 'hazardous'로, 'of the item'을 'at the vehicle level'로 바꾸고 첫째 주석을 뺀 것이다. **의도된 기능**(intended functionality)은 명세된 기능이며, 차량 수준에서 정의된다.[@iso-21448-obp-2022] ISO 26262-1:2018은 의도된 기능을 아이템에 명세된 거동 가운데 [[safety-mechanism|안전 메커니즘]]을 뺀 것으로 정의하고, 이 거동이 차량 수준의 것이라고 둔다.[@iso-26262-1-obp-2018]
