---
title: SOTIF
tags:
  - process/sw-process
aliases:
  - Safety of the intended functionality
verified: 2026-10-01
---

**SOTIF**(Safety Of The Intended Functionality)는 의도된 기능이나 그 구현의 기능 부족에서 오는 [[hazard-analysis-and-risk-assessment|해저드]] 때문에 생기는 불합리한 리스크가 없는 상태다. [[iso-21448|ISO 21448:2022]]가 SOTIF를 확보하는 조치의 틀과 지침을 준다.[@iso-21448-obp-2022]

## 기능 부족

ISO 21448:2022는 **기능 부족**(functional insufficiency)을 명세의 부족이나 성능의 부족으로 정의한다. 기능 부족은 차량 수준에서도, 시스템의 E/E(Electrical/Electronic) 요소에서도 생길 수 있다.[@iso-21448-obp-2022]

- **명세의 부족**(insufficiency of specification): 하나 이상의 triggering condition으로 활성화되면 해저드 동작에 기여하거나, 합리적으로 예견할 수 있는 간접 오용을 막거나 감지하거나 완화하지 못하는 결과에 기여하는 명세. 이런 명세는 불완전할 수 있다.
- **성능의 부족**(performance insufficiency): triggering condition으로 활성화되면 같은 결과에 기여하는 기술적 능력의 한계. 제한된 연산 성능, 센서의 제한된 인식 범위, 제한된 구동 능력이 그 예다.[@iso-21448-obp-2022]

## Triggering condition

ISO 21448:2022는 **triggering condition**을 시나리오의 특정 조건으로 정의한다. 이 조건이 뒤따르는 시스템 반응을 일으켜, 해저드 동작이나 간접 오용에 대처하지 못하는 결과로 이어지게 한다. 기능 부족을 활성화하는 것이 triggering condition이다.[@iso-21448-obp-2022]

![[diagrams/sotif-triggering-condition-chain.svg]]

## 합리적으로 예견할 수 있는 오용

ISO 21448:2022는 **오용**(misuse)을 제조사나 서비스 제공자가 의도하지 않은 방식으로 쓰는 것으로 정의한다. 의도하지 않은 사람의 행동은 여기에 들고, 고의로 시스템을 바꾸거나 해를 끼치려고 쓰는 것은 들지 않는다.[@iso-21448-obp-2022] ISO 26262-1:2018은 합리적으로 예견할 수 있다는 것을 기술적으로 가능하고 일어나는 빈도가 믿을 만하거나 잴 수 있는 것으로 정의한다.[@iso-26262-1-obp-2018]

ISO 21448:2022는 합리적으로 예견할 수 있는 오용을 범위에 넣고, 시스템의 의도된 사용을 고의로 명백히 어기는 행위는 범위에서 뺀다.[@iso-21448-obp-2022]

## ISO 26262와의 차이

ISO 26262-1:2018은 기능 안전을 E/E 시스템의 오동작이 일으키는 해저드 때문에 생기는 불합리한 리스크가 없는 상태로 정의한다. 오동작은 아이템이 설계 의도에 비춰 고장 나거나 의도하지 않게 동작하는 것이다.[@iso-26262-1-obp-2018] [[iso-26262|ISO 26262]]가 다루는 고장이 없어도, 의도된 기능과 그 구현이 해저드 동작을 일으킬 수 있다. ISO 21448:2022는 이런 기능 부족과 합리적으로 예견할 수 있는 오용에서 오는 해저드를 다루고, ISO 26262가 다루는 고장은 범위에서 뺀다.[@iso-21448-obp-2022]

![[diagrams/functional-safety-sotif-hazard-sources.svg]]

ISO 21448:2022는 기능 안전과 SOTIF를 안전의 서로 보완하는 측면으로 보며, E/E 시스템의 무작위 하드웨어 고장과 체계적 고장은 ISO 26262 시리즈로 다룬다고 가정한다.[@iso-21448-obp-2022]
