---
title: SIL
tags:
  - process/sw-process
verified: 2026-10-01
---

**SIL**(Safety Integrity Level)은 [[iec-61508|IEC 61508]]이 E/E/PE(Electrical/Electronic/Programmable Electronic) 안전 관련 시스템이 수행할 안전 기능의 목표 안전 무결성을 정하려고 두는 등급이다.[@iec-61508-1-preview-2010] 네 단계로 나뉘며, 단계마다 안전 기능이 실패할 목표 가능성의 구간 하나가 대응한다.[@iec-functional-safety-faq-2023] SIL 4가 안전 무결성이 가장 높고 SIL 1이 가장 낮다. 안전 무결성이 높다는 것은 dangerous failure rate나, 동작이 요구될 때 안전 기능이 실패할 확률이 낮다는 뜻이다.[@iec-acos-61508-overview-2022] 안전 무결성 요구사항은 [[functional-safety#안전 기능과 안전 무결성|기능 안전]]에서 다룬다.

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
