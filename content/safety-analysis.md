---
title: 안전 분석
tags:
  - sw-engineering/functional-safety
verified: 2026-10-02
---

**안전 분석**(safety analysis)은 [[iso-26262|ISO 26262]]-9:2018이 dependent failure 분석과 함께 요구사항을 정하는 분석이다. 이 표준은 7절에서 dependent failure 분석을, 8절에서 안전 분석을 다룬다. 이 표준은 [[automotive-safety-integrity-level#ASIL decomposition|ASIL tailoring을 위한 요구사항 분해]]와 [[freedom-from-interference|요소의 공존 기준]]에 대한 요구사항도 정한다.[@iso-26262-9-obp-2018] 분석 기법인 FMEA(Failure Modes and Effects Analysis), FTA(Fault Tree Analysis), HAZOP(Hazard and Operability study)은 IEC 60812:2018[@iec-60812-2018], IEC 61025:2006[@iec-61025-preview-2006], IEC 61882:2016이 각각 적용 지침을 둔다.[@iec-61882-preview-2016] [[stpa|STPA]]는 어느 것도 고장 나지 않은 시스템 구성 요소 사이의 안전하지 않은 상호작용도 사고를 일으킬 수 있다고 보는 해저드 분석 기법이다.[@leveson-stpa-handbook-2018]

## FMEA

IEC 60050은 **FMEA**를 하위 항목에서 일어날 수 있는 failure mode와 [[fault-error-failure|fault]], 그리고 그것이 여러 계층(indenture level)에 주는 영향을 살피는 정성적 분석으로 정의한다.[@iec-60050-192-11-05-2015] IEC 60812:2018은 FMEA를 계획하고 수행하고 문서로 남기고 유지하는 지침을 둔다.[@iec-60812-2018]

**Failure mode**는 요소나 [[safety-lifecycle#ISO 26262의 안전 생명주기|아이템]]이 고장 나는 방식이다.[@iso-26262-1-obp-2018][@iec-60050-192-03-17-2024]

IEC 60812:2018은 FMEA의 목적을 아이템이나 프로세스가 기능을 다하지 못하게 될 수 있는 방식을 밝혀 필요한 처치를 찾는 것으로 둔다. FMEA는 failure mode와 그것이 국부적·전역적으로 주는 영향을 체계적으로 찾고, failure mode의 원인을 찾는 것까지 포함할 수 있다. 이 표준은 하드웨어, 소프트웨어, 사람의 행동을 포함한 프로세스, 그리고 그 인터페이스에 어떤 조합으로든 적용한다. FMEA는 규제 등의 목적으로 안전 분석에 쓸 수 있지만, 이 표준은 일반 표준이라 안전 응용에 특정한 지침을 주지 않는다.[@iec-60812-preview-2018]

Failure mode의 순위를 매길 때 적어도 결과의 심각도를 쓰는 분석을 **FMECA**(Failure Modes, Effects and Criticality Analysis)라 하고, 이 표준은 FMEA라는 말에 FMECA를 포함한다.[@iec-60812-preview-2018]

IEC 60812:2018은 안전, 자동차, 소프트웨어, (서비스) 프로세스의 적용 예를 참고 Annex로 더하고, RPN(Risk Priority Number)을 계산하는 다른 방법과 criticality matrix에 기반한 방법을 새로 넣었다.[@iec-60812-preview-2018]

IEC 60050은 FMECA를 FMEA에 failure mode의 발생 확률과 영향의 심각도에 대한 고려를 더한 정량적이거나 정성적인 분석 방법으로 정의한다.[@iec-60050-192-11-06-2015]

TMS320F28003x의 정량적 안전 분석인 FMEDA(Failure Modes, Effects and Diagnostics Analysis)는 비밀 유지 계약을 맺어야만 볼 수 있는 FMEDA 보고서의 상세 안전 분석 보고서 절에 있다.[@ti-sffs277-2023]

## FTA

IEC 60050은 **FTA**를 fault tree를 쓰는 연역적 분석으로 정의하고[@iec-60050-192-11-08-2015], **fault tree**를 하위 항목의 fault, 외부 사건, 또는 그 조합이 미리 정한 원치 않는 사건을 일으키는 관계를 보이는 논리 그림으로 정의한다.[@iec-60050-192-11-07-2015]

IEC 61025:2006은 FTA를 정해 둔 top event를 일으키거나 그에 기여하는 조건과 요인을 찾아 분석하는 방법으로 둔다. **Top event**는 fault tree를 전개하는 대상 사건으로, 모든 입력 사건이 조합된 결과다. Fault tree에서 게이트는 입력 사건의 조합을 나타내고, 그 결과는 중간 사건이거나 top event다. 이 표준은 FTA의 원리, 수행 단계, 가정·사건·failure mode의 식별, 기호에 대한 지침을 둔다.[@iec-61025-preview-2006]

![[diagrams/fault-tree-structure.svg]]

이 표준은 FTA의 두 접근을 다룬다. 정성적 접근(전통적 FTA)은 사건과 기여 요인의 확률이나 빈도를 다루지 않고 잠재 원인과 fault를 찾는 자세한 분석이고, 원자력 산업에서 많이 쓴다. 정량적 접근은 제품, 프로세스, 시스템 전체를 모델로 만들고 기본 사건 대부분에 분석이나 시험으로 정한 발생 확률을 주어, top event의 발생 확률을 결과로 낸다. FTA의 사건이 대개 시스템 성능이나 안전의 상실·저하인 것과 달리, **success tree analysis**의 사건은 성공을 나타내는 속성이다.[@iec-61025-preview-2006]

IEC 61025:2006은 1990년 1판을 대체하며 fault tree 방법론의 자세한 설명, FTA의 정량적·신뢰성 측면, 분석 예를 더하고, 다른 dependability 기법과의 관계를 넓히고, 기호를 지금 쓰이는 것으로 고쳤다.[@iec-61025-preview-2006]

## HAZOP

IEC 61882:2016은 **HAZOP**을 정해진 시스템을 구조적이고 체계적으로 살펴 해저드 같은 리스크와 운용상의 문제를 찾는 기법으로 두고, guide word로 설계 의도에서 벗어난 것(deviation)을 찾게 정한다.[@iec-61882-preview-2016]

HAZOP의 특징은 study leader가 이끄는 여러 분야의 팀이 설계나 시스템의 관련 부분을 모두 체계적으로 살피는 검토 회의다. 이 기법은 공정 산업에서 나왔다. 이 표준은 checklist HAZOP, knowledge-based HAZOP처럼 다른 해저드 식별 기법에 HAZOP이라는 이름을 쓰는 것을 부적절하다고 보아, 그런 기법을 범위에서 뺀다.[@iec-61882-preview-2016]

IEC 61882:2016은 개선된 절차(procedural) HAZOP 사례 연구를 새로 넣었다.[@iec-61882-preview-2016]

## Event tree analysis와 reliability block diagram

IEC 60050은 **ETA**(Event Tree Analysis)를 주어진 시작 사건(initiating event)과 대책의 상태에서 이어질 수 있는 결과를 모델로 만드는 귀납적 절차로 정의하고[@iec-60050-192-11-09-2015], **RBD**(Reliability Block Diagram)를 하위 항목(블록)과 그 조합의 신뢰성이 시스템의 신뢰성에 어떻게 영향을 주는지 보이는 시스템의 논리적 그림 표현으로 정의한다.[@iec-60050-192-11-03-2015]

## Dependent failure 분석

ISO 26262-1:2018은 **Dependent failure**를 통계적으로 독립이 아닌 failure, 곧 failure들이 함께 일어날 확률이 고려한 각 failure의 발생 확률의 곱과 같지 않은 failure로 정의한다. Dependent failure에는 다음 둘이 있다.[@iso-26262-1-obp-2018]

- **Common cause failure**: 아이템의 둘 이상의 요소가, 그 모든 요소의 안이나 밖에 있는 하나의 특정 사건이나 근본 원인 때문에 직접 고장 나는 것
- **Cascading failure**: 아이템의 한 요소가 요소 안팎의 근본 원인으로 고장 나고, 그것이 같은 아이템이나 다른 아이템의 다른 요소를 고장 나게 하는 것[@iso-26262-1-obp-2018]

![[diagrams/dependent-failure-common-cause-cascading.svg]]

Dependent failure 정의의 주석은 dependent failure가 동시에, 또는 동시에 일어난 것과 같은 영향을 낼 만큼 짧은 간격 안에 나타날 수 있고, failure 확률을 계산하지 않더라도 소프트웨어 failure를 포함할 수 있다고 제시한다. 또 어떤 failure가 cascading failure인지 common cause failure인지는 요소의 계층 구조와 시간 거동에 따라 달라질 수 있다고 제시한다.[@iso-26262-1-obp-2018]

**Common mode failure**는 여러 요소가 같은 방식으로 고장 나는 common cause failure다. 같은 정의의 주석은 같은 방식이 꼭 똑같다는 뜻은 아니며 failure mode가 얼마나 가까워야 common mode failure로 분류되는지는 맥락에 달려 있다고 제시하고, 예로 두 CPU의 출력을 사이클마다 견주는 [[fault-tolerance#다중 채널과 비교|lockstep]] 구조에서 두 CPU가 똑같이 고장 나 failure가 검출되지 않는 경우를 든다.[@iso-26262-1-obp-2018]

**Coupling factor**는 요소들의 failure를 서로 의존하게 만드는 요소들의 공통 특성이나 관계다. **DFI**(Dependent Failure Initiator)는 coupling factor를 거쳐 여러 요소를 고장 나게 하는 하나의 근본 원인이고, 그 요소들의 failure는 동시에 또는 차례로 일어날 수 있다. DFI 정의의 예는 같은 RAM을 쓰는 두 소프트웨어 유닛(coupling factor)에서 한 유닛이 다른 유닛이 쓰는 데이터를 뜻하지 않게 망가뜨리는 것(근본 원인)과, 같은 3.3 V 전원을 쓰는 두 마이크로컨트롤러에 과전압이 걸려 둘 다 망가지는 것을 든다.[@iso-26262-1-obp-2018]

독립성(independence)은 [[functional-safety-management#독립성|기능 안전 관리]]에서 다룬다.
