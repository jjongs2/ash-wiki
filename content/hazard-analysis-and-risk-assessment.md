---
title: HARA
tags:
  - process/sw-process
verified: 2026-10-01
---

**HARA**(Hazard Analysis and Risk Assessment)는 아이템의 해저드 사건을 찾아 분류하고, 불합리한 리스크를 피하도록 그 해저드를 막거나 줄이는 safety goal과 [[automotive-safety-integrity-level|ASIL]]을 정하는 방법이다.[@iso-26262-1-obp-2018] ISO 26262-3:2018은 HARA 절을 concept phase의 item definition 절 바로 다음에 둔다.[@iso-26262-3-obp-2018] 안전 생명주기 전체에서의 자리는 [[safety-lifecycle|안전 생명주기]]에서 다룬다.

## 용어

ISO 26262-1:2018은 HARA의 용어를 다음처럼 정의한다.[@iso-26262-1-obp-2018]

- **해**(harm): 사람이 입는 신체 부상이나 건강의 손상
- **해저드**(hazard): 아이템의 오동작이 일으키는, 해의 잠재적 원천
- **해저드 사건**(hazardous event): 해저드와 운용 상황의 조합
- **운용 상황**(operational situation): 차량의 수명 동안 일어날 수 있는 시나리오
- **오동작**(malfunctioning behaviour): 설계 의도에 비춘 아이템의 고장이나 의도하지 않은 동작[@iso-26262-1-obp-2018]

안전과 리스크의 정의는 [[functional-safety#안전과 리스크|기능 안전]]에서, HARA의 파라미터인 심각도, 노출, 통제 가능성은 [[automotive-safety-integrity-level#S·E·C 파라미터|ASIL]]에서 다룬다.

![[diagrams/hara-hazardous-event-parameters-results.svg]]

## Safety goal

ISO 26262-1:2018은 **safety goal**을 차량 수준에서 HARA의 결과로 나오는 최상위 안전 요구사항으로 정의한다. Safety goal 하나가 여러 해저드에 관련될 수 있고, 여러 safety goal이 해저드 하나에 관련될 수도 있다. 또 FTTI를 safety goal의 속성으로 두고, **safe state**를 고장이 났을 때 불합리한 리스크가 없는 아이템의 운용 모드로 정의한다.[@iso-26262-1-obp-2018]
