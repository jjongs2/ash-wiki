---
title: SIL
tags:
  - sw-engineering/functional-safety
verified: 2026-10-01
---

**SIL**(Safety Integrity Level)은 [[iec-61508|IEC 61508]]이 E/E/PE(Electrical/Electronic/Programmable Electronic) 안전 관련 시스템이 수행할 안전 기능의 목표 안전 무결성을 정하려고 두는 등급이다.[@iec-61508-1-preview-2010] 네 단계로 나뉘며, 단계마다 안전 기능이 실패할 목표 가능성의 구간 하나가 대응한다.[@iec-functional-safety-faq-2023] SIL 4가 안전 무결성이 가장 높고 SIL 1이 가장 낮다. 안전 무결성이 높다는 것은 dangerous failure rate나, 동작이 요구될 때 안전 기능이 실패할 확률이 낮다는 뜻이다.[@iec-acos-61508-overview-2022] 안전 무결성 요구사항은 [[functional-safety#안전 기능과 안전 무결성|기능 안전]]에서 다룬다.

IEC 61508:2010은 SIL을 시스템이나 그 일부가 아니라 안전 기능의 속성으로 둔다. SIL은 개별 서브시스템, 요소, 부품에 바로 적용되지 않고 안전 관련 시스템이 수행하는 안전 기능에 적용되므로, 공급자가 어느 SIL에 맞는다고 밝힌 제품을 쓰는 것만으로는 이 표준을 따른 것이 되지 않는다. 그런 제품들로 이룬 설계는 제품마다 주어진 정보와 함께 평가해, 그 제품이 정말 맞는지 가려야 한다.[@iec-functional-safety-faq-2023]

## Demand mode

IEC 61508은 안전 기능의 동작 모드를 low demand mode와 high demand or continuous mode로 나누고, 안전 기능이 요구되는 빈도 $f_\mathrm{d}$가 1년에 한 번을 넘는지로 가른다.[@iec-functional-safety-faq-2023]

- **Low demand mode**: 안전 기능이 요구될 때만 수행되고, $f_\mathrm{d} \le 1\,\mathrm{yr^{-1}}$이다.
- **High demand mode**: 안전 기능이 요구될 때만 수행되고, $f_\mathrm{d} > 1\,\mathrm{yr^{-1}}$이다.
- **Continuous mode**: 안전 기능이 EUC(Equipment Under Control)를 늘 제어해 정상의 안전 상태에 머물게 한다. IEC는 continuous mode를 매우 높은 요구로 본다.[@iec-functional-safety-faq-2023]

## Target failure measure

SIL마다 target failure measure의 구간이 대응한다. 척도는 low demand mode에서 PFDavg(average probability of dangerous failure on demand)이고, high demand mode와 continuous mode에서 PFH(average frequency of dangerous failure)다.[@iec-61508-1-preview-2010] PFDavg는 요구 시 dangerous failure가 일어날 평균 확률이고, PFH는 dangerous failure의 평균 빈도로 단위는 $\mathrm{h^{-1}}$이다.[@iec-61508-4-preview-2010]

IEC 61508-1:2010은 E/E/PE 안전 관련 시스템 하나가 수행하는 안전 기능의 target failure measure에 하한을 둔다. 하한은 low demand mode에서 PFDavg $10^{-5}$이고, high demand mode와 continuous mode에서 PFH $10^{-9}\,\mathrm{h^{-1}}$이다.[@iec-61508-1-preview-2010]

![[diagrams/sil-demand-mode-failure-measure.svg]]

SIL과 ASIL의 비교는 [[automotive-safety-integrity-level#SIL과의 차이|ASIL]]에서 다룬다.

## SIL을 정하는 방법

IEC 61508:2010은 SIL을 정하는 데 정량적 리스크 분석을 요구하지 않고, 정량적 접근과 정성적 접근을 모두 허용한다.[@iec-functional-safety-faq-2023]

정량적 접근에서 SIL을 정하는 길은 동작 모드에 따라 다르다. 해저드 발생률 $h$는 다른 보호 조치가 없을 때 지정된 해저드 사건이 일어날 것으로 추정되는 비율이다. Low demand mode에서는 $h = f_\mathrm{d} \cdot \mathrm{PFDavg}$이다. 그래서 [[functional-safety#안전과 리스크|허용 리스크]]를 이루는 데 필요한 PFDavg는 아래 식으로 얻고, 이 $h/f_\mathrm{d}$를 리스크 감소 계수(risk reduction factor)라 부르기도 한다.[@iec-functional-safety-faq-2023]

$$
\mathrm{PFDavg} = \frac{h}{f_\mathrm{d}}
$$

이 관계는 E/E/PE 안전 관련 시스템이 EUC와 EUC 제어 시스템에서 생기는 지정된 상황에 대한 보호 시스템으로 동작할 때, EUC·EUC 제어 시스템과 안전 관련 시스템이 충분히 독립인 경우에만 성립한다. 독립성이 모자라면 둘 사이의 [[safety-analysis#Dependent failure 분석|common cause failure]]의 영향을 따져야 한다. High demand mode와 continuous mode에서는 PFH가 곧 해저드 발생률이고, 허용 리스크를 이룰 만큼 낮아야 한다.[@iec-functional-safety-faq-2023]

IEC 61508-5:2010은 SIL을 정하는 여러 방법을 정량적 접근과 정성적 접근의 예로 제시한다. 어느 방법을 고를지는 응용 분야와 상황에 달렸고, 예는 원리를 보이려고 단순화한 것이라 결정판 설명이 아니다.[@iec-61508-5-preview-2010]
