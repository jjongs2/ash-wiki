---
title: HARA
tags:
  - sw-engineering/functional-safety
verified: 2026-10-01
---

**HARA**(Hazard Analysis and Risk Assessment)는 [[safety-lifecycle#ISO 26262의 안전 생명주기|아이템]]의 해저드 사건을 찾아 분류하고, 불합리한 리스크를 피하도록 그 해저드를 막거나 줄이는 safety goal과 [[automotive-safety-integrity-level|ASIL]]을 정하는 방법이다.[@iso-26262-1-obp-2018] [[iso-26262|ISO 26262]]-3:2018은 HARA 절을 concept phase의 [[safety-lifecycle#ISO 26262의 안전 생명주기|item definition]] 절 바로 다음에 둔다.[@iso-26262-3-obp-2018] 안전 생명주기 전체에서의 자리는 [[safety-lifecycle|안전 생명주기]]에서 다룬다.

## 용어

ISO 26262-1:2018은 HARA의 용어를 다음처럼 정의한다.[@iso-26262-1-obp-2018]

- **해**(harm): 사람이 입는 신체 부상이나 건강의 손상
- **해저드**(hazard): 아이템의 오동작이 일으키는, 해의 잠재적 원천. 주석은 이 정의가 ISO 26262 범위로 좁힌 것이라 하고, 더 일반적인 정의로 해의 잠재적 원천을 제시한다.
- **non-functional hazard**: E/E(Electrical/Electronic) 시스템, 다른 기술의 안전 관련 시스템, [[safety-lifecycle#다른 기술과 외부 조치|외부 조치]]의 오동작이 아닌 다른 요인으로 생기는 해저드. 이 표준은 안전 관련 E/E 시스템의 오동작이 일으킬 수 있는 해저드를 다루고, 감전, 화재, 연기, 열 같은 해저드는 그 오동작이 바로 일으킨 것이 아니면 다루지 않는다.
- **해저드 사건**(hazardous event): 해저드와 운용 상황의 조합
- **운용 상황**(operational situation): 차량의 수명 동안 일어날 수 있는 시나리오. 고속 주행, 경사로 주차, 정비를 예로 든다.
- **오동작**(malfunctioning behaviour): 설계 의도에 비춘 아이템의 failure나 의도하지 않은 동작[@iso-26262-1-obp-2018]

안전과 리스크의 정의는 [[functional-safety#안전과 리스크|기능 안전]]에서, HARA의 파라미터인 심각도, 노출, 통제 가능성과 [[automotive-safety-integrity-level#S·E·C 파라미터|QM]]은 ASIL에서, functional safety concept은 [[safety-requirement#요구사항의 전개|안전 요구사항]]에서 다룬다.

![[diagrams/hara-hazardous-event-parameters-results.svg]]

## Safety goal

ISO 26262-1은 **safety goal**을 차량 수준에서 HARA의 결과로 나오는 최상위 안전 요구사항으로 정의한다. Safety goal 하나가 여러 해저드에 관련될 수 있고, 여러 safety goal이 해저드 하나에 관련될 수도 있다. 또 [[fault-tolerant-time-interval|FTTI]]를 safety goal의 속성으로 두고, [[safety-mechanism#안전 상태와 성능 저하|안전 상태]]를 고장이 났을 때 불합리한 리스크가 없는 아이템의 운용 모드로 정의한다.[@iso-26262-1-obp-2018]

## ISO/IEC Guide 51과의 차이

ISO/IEC Guide 51:2014는 해를 사람의 부상이나 건강 손상, 또는 재산이나 환경의 손상으로 정의한다. 해저드는 해의 잠재적 원천이고, 해저드 사건은 해를 일으킬 수 있는 사건이다. 이 지침은 **해저드 상황**(hazardous situation)도 사람, 재산, 환경이 하나 이상의 해저드에 노출된 상황으로 정의한다.[@iso-iec-guide-51-obp-2014]

ISO 26262-1:2018의 정의는 세 곳에서 이와 다르다. 해에 재산과 환경의 손상을 넣지 않고 사람의 신체 부상과 건강 손상만 두며, 해저드를 아이템의 오동작이 일으키는 것으로 좁히고, 해저드 사건을 사건 대신 해저드와 운용 상황의 조합으로 둔다.[@iso-26262-1-obp-2018][@iso-iec-guide-51-obp-2014]

[[iso-21448|ISO 21448]]의 해저드 정의는 [[sotif#ISO 26262와의 차이|SOTIF]]에서 다루고, [[stpa#Loss와 hazard|STPA]]가 쓰는 정의는 그 페이지에서 다룬다.
