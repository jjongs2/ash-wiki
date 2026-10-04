---
title: 소프트웨어 유닛 설계
tags:
  - process/sw-process
aliases:
  - 소프트웨어 상세 설계
verified: 2026-10-02
---

**소프트웨어 유닛 설계**는 [[software-architecture|소프트웨어 아키텍처]]를 받아 소프트웨어 유닛의 내부 구조와 동작을 정하는 설계로, **상세 설계**(detailed design)라고도 부른다.[@vda-automotive-spice-pam-4-1-2026][@ieee-cs-sevocab-2026] ISO/IEC/IEEE 24765 용어집은 상세 설계 단계를 시스템 설계와 소프트웨어 아키텍처를 받아 유닛마다 코딩할 수 있는 상세 로직을 만드는 단계로 정의하고, 상세 설계를 앞선 설계를 구현할 수 있을 만큼 다듬고 넓히는 것으로 정의한다.[@ieee-cs-sevocab-2026]

Automotive SPICE 4.1은 소프트웨어 유닛을, 소프트웨어 컴포넌트를 분해해 얻은 것 가운데 더 나누지 않기로 정한 소프트웨어 요소로 정의한다.[@vda-automotive-spice-pam-4-1-2026]

![[diagrams/aspice-software-decomposition.svg]]

## 설계가 정하는 것

Automotive SPICE 4.1은 상세 설계에서 컴포넌트마다 그 유닛들의 동작, 정적 구조와 관계, 인터페이스를 명세하게 한다. 소프트웨어 상세 설계는 소프트웨어 요소의 내부 구조와 동작으로 정하고, 상세 설계가 밝힐 것으로 다음을 든다.[@vda-automotive-spice-pam-4-1-2026]

- 데이터: 데이터 구조와 변수, 입출력 데이터의 형식
- 로직: 알고리즘과 제어 흐름
- 인터페이스: 유닛이 주고받는 입력과 출력. 입출력의 유효 값 범위와 물리 단위나 측정 단위를 넣는다.[@vda-automotive-spice-pam-4-1-2026]

Automotive SPICE 4.1은 동적 측면으로, 컴포넌트의 동적 동작을 이루는 유닛 사이의 상호작용을 아키텍처에 맞춰 명세하게 한다.[@vda-automotive-spice-pam-4-1-2026] ISO/IEC/IEEE 24765 용어집도 상세 설계 기술(detailed design description)이 하위 컴포넌트마다 입력, 출력, 데이터 구조, 제어 로직, 알고리즘을 밝힌다고 정의한다.[@ieee-cs-sevocab-2026] SWEBOK V4.0a에 따르면 동적 동작을 기술하는 표기 가운데 다수는 주로 상세 설계에서 쓸모가 있지만, 거기에만 쓰이지는 않는다. 그 가운데 상태 다이어그램은 컴포넌트가 상태 사이를 옮겨 가며 현재 상태와 입력 이벤트에 따라 동작이 바뀌는 모습을, 시퀀스 다이어그램은 객체 사이에 오가는 메시지의 시간 순서를 보인다.[@ieee-swebok-v4-0a-2026]

## Automotive SPICE SWE.3

Automotive SPICE 4.1은 유닛 설계와 코딩을 한 프로세스 SWE.3(Software Detailed Design and Unit Construction)으로 둔다. 그 목적은 정적·동적 측면을 담고 아키텍처와 일관된 상세 설계를 세우고, 그 설계와 일관된 유닛을 만드는 것이다. SWE.3의 BP(base practice)는 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

| BP  | 하는 일                                                                                   |
| --- | ----------------------------------------------------------------------------------------- |
| BP1 | 상세 설계의 정적 측면 명세                                                                |
| BP2 | 상세 설계의 동적 측면 명세                                                                |
| BP3 | 소프트웨어 유닛 개발                                                                      |
| BP4 | [[traceability#일관성\|일관성]] 확보와 [[traceability#양방향 추적성\|양방향 추적성]] 수립 |
| BP5 | 합의한 상세 설계와 개발한 유닛의 전달                                                     |

코딩은 BP3이다. BP3은 유닛을 상세 설계와 일관되게, 코딩 원칙에 따라 개발하고 문서로 남기게 한다. Automotive SPICE 4.1은 코딩 원칙의 예로 암묵적 형 변환을 쓰지 않기, 서브프로그램의 입구와 출구를 하나씩 두기, 범위 검사를 들고, 더 많은 예로 ISO 26262-6의 8.4.5와 표 6을 가리킨다.[@vda-automotive-spice-pam-4-1-2026] 추적성과 일관성은 [[traceability|추적성]]에서 다룬다.

Automotive SPICE 3.1은 SWE.3의 목적을 컴포넌트의 평가된 상세 설계를 내고 유닛을 명세해 만드는 것으로 두었고, BP 여덟 개를 두어 마지막 BP8에서 유닛을 개발하게 했다. Automotive SPICE 4.1은 이를 BP 다섯 개로 묶고 유닛 개발을 BP3에 둔다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## ISO 26262-6

ISO 26262-6:2018은 8절에서 소프트웨어 유닛 설계와 구현을 다룬다.[@iso-26262-6-obp-2018]
