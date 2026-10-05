---
title: 안전 분석
tags:
  - process/sw-process
verified: 2026-10-02
---

**안전 분석**(safety analysis)은 [[iso-26262|ISO 26262]]-9:2018이 dependent failure 분석과 함께 요구사항을 정하는 분석이다. ISO 26262-9:2018은 7절에서 dependent failure 분석을, 8절에서 안전 분석을 다룬다.[@iso-26262-9-obp-2018] 분석 기법인 FMEA(Failure Modes and Effects Analysis), FTA(Fault Tree Analysis), HAZOP(Hazard and Operability study)은 IEC 60812:2018[@iec-60812-2018], IEC 61025:2006[@iec-61025-preview-2006], IEC 61882:2016이 각각 적용 지침을 둔다.[@iec-61882-preview-2016]

## FMEA

IEC 60050은 **FMEA**를 하위 항목에서 일어날 수 있는 failure mode와 [[fault-error-failure|fault]], 그리고 그것이 여러 계층(indenture level)에 주는 영향을 살피는 정성적 분석으로 정의한다.[@iec-60050-192-11-05-2015] IEC 60812:2018은 FMEA를 계획하고 수행하고 문서로 남기고 유지하는 지침을 둔다.[@iec-60812-2018]

**Failure mode**는 요소나 [[safety-lifecycle#ISO 26262의 안전 생명주기|아이템]]이 고장 나는 방식이다.[@iso-26262-1-obp-2018][@iec-60050-192-03-17-2024]

미국 NRC(Nuclear Regulatory Commission)가 펴낸 Fault Tree Handbook에 따르면 시스템 분석의 접근은 귀납적 접근과 연역적 접근 둘이다. 귀납적 접근은 부품의 어떤 상태나 초기 사건을 가정하고 그것이 시스템 전체에 주는 영향을 찾고, 연역적 접근은 시스템이 어떤 방식으로 고장 났다고 가정하고 그 failure에 기여하는 부품이나 시스템의 동작을 찾는다. FMEA는 귀납적 접근의 예다.[@nrc-nureg-0492-1981]

## FTA

IEC 60050은 **FTA**를 fault tree를 쓰는 연역적 분석으로 정의하고[@iec-60050-192-11-08-2015], **fault tree**를 하위 항목의 fault, 외부 사건, 또는 그 조합이 미리 정한 원치 않는 사건을 일으키는 관계를 보이는 논리 그림으로 정의한다.[@iec-60050-192-11-07-2015]

IEC 61025:2006은 FTA를 정해 둔 top event를 일으키거나 그에 기여하는 조건과 요인을 찾아 분석하는 방법으로 둔다. **Top event**는 fault tree를 전개하는 대상 사건으로, 모든 입력 사건이 조합된 결과다. Fault tree에서 게이트는 입력 사건의 조합을 나타내고, 그 결과는 중간 사건이거나 top event다. IEC 61025:2006은 FTA의 원리, 수행 단계, 가정·사건·failure mode의 식별, 기호에 대한 지침을 둔다.[@iec-61025-preview-2006]

NRC가 펴낸 Fault Tree Handbook에 따르면 **basic event**는 분해의 한계에 이르러 더 전개하지 않는 기본 초기 fault 사건이다. AND 게이트는 입력 fault가 모두 일어날 때, OR 게이트는 입력 fault가 하나라도 일어날 때 출력 fault가 일어남을 나타낸다.[@nrc-nureg-0492-1981]

![[diagrams/fault-tree-structure.svg]]

## HAZOP

IEC 61882:2016은 **HAZOP**을 정해진 시스템을 구조적이고 체계적으로 살펴 해저드 같은 위험과 운용상의 문제를 찾는 기법으로 두고, guide word로 설계 의도에서 벗어난 것(deviation)을 찾게 정한다.[@iec-61882-preview-2016]

## Dependent failure 분석

ISO 26262-1:2018은 **Dependent failure**를 통계적으로 독립이 아닌 failure, 곧 failure들이 함께 일어날 확률이 고려한 각 failure의 발생 확률의 곱과 같지 않은 failure로 정의한다. Dependent failure에는 다음 둘이 있다.[@iso-26262-1-obp-2018]

- **Common cause failure**: 아이템의 둘 이상의 요소가, 그 모든 요소의 안이나 밖에 있는 하나의 특정 사건이나 근본 원인 때문에 직접 고장 나는 것
- **Cascading failure**: 아이템의 한 요소가 요소 안팎의 근본 원인으로 고장 나고, 그것이 같은 아이템이나 다른 아이템의 다른 요소를 고장 나게 하는 것[@iso-26262-1-obp-2018]

![[diagrams/dependent-failure-common-cause-cascading.svg]]

요소 사이에 cascading failure가 없는 것은 [[freedom-from-interference|FFI]]에서 다룬다.
