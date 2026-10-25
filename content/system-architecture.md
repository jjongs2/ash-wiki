---
title: 시스템 아키텍처
tags:
  - sw-engineering/sw-process
verified: 2026-10-12
---

[[automotive-spice|ASPICE]] 4.1은 **시스템 아키텍처**(system architecture)를 시스템의 상위 수준 설계와 구조로 정의한다. 이 모델은 시스템 아키텍처 설계를 SYS.3(System Architectural Design) 프로세스로 두고, 그 목적을 정적·동적 측면을 갖추고 시스템 요구사항과 일관되며 분석을 거친 시스템 아키텍처를 세우는 것으로 둔다.[@vda-automotive-spice-pam-4-1-2026]

차량 안의 ECU를 어떻게 묶고 잇는지는 [[ee-architecture|E/E 아키텍처]]에서 다룬다.

## 정적 측면과 동적 측면

SYS.3은 시스템 아키텍처를 정적 측면과 동적 측면으로 나누어, 기능·비기능 시스템 요구사항에 맞춰 명세하고 문서로 남기게 한다.[@vda-automotive-spice-pam-4-1-2026]

- 정적 측면: 외부 인터페이스와, 정해 둔 [[automotive-spice-process-reference-model#Element, component, unit|시스템 요소]] 집합 및 그 인터페이스와 관계
- 동적 측면: 시스템 요소의 동작과, 시스템 모드마다의 요소 사이 상호작용[@vda-automotive-spice-pam-4-1-2026]

[[automotive-spice-process-assessment-model#프로세스 수행 지표|BP2]]의 주석은 시스템 요소 사이 상호작용의 예로 기계 부품의 관성을 반영한 타이밍 다이어그램, ECU의 처리 시간, 버스 시스템의 신호 전파 시간을 든다.[@vda-automotive-spice-pam-4-1-2026]

## 아키텍처 분석

BP3은 제품 생명주기와 관련한 기술적 설계 측면과 프로젝트 추정 지원의 관점에서 시스템 아키텍처를 분석하고, 소프트웨어가 아닌 시스템 요소의 특별특성(special characteristics)을 도출하고, 아키텍처 설계 결정의 근거를 문서로 남기게 한다.[@vda-automotive-spice-pam-4-1-2026]

BP3의 주석은 생명주기 단계의 예로 생산, 유지보수와 수리, 폐기를 들고, 기술적 측면의 예로 생산을 위한 제조 용이성, 기존 시스템 요소를 다시 쓰기에 알맞은지, 시스템 요소를 구할 수 있는지를 든다. 이런 측면을 분석하는 방법으로는 prototype, 시뮬레이션, [[safety-analysis#FMEA|FMEA]] 같은 정성 분석을 예로 든다. 설계 근거의 예로는 proven-in-use, 제품 플랫폼이나 제품군의 재사용, make-or-buy 결정, set-based design 같은 진화적 방식을 든다.[@vda-automotive-spice-pam-4-1-2026]

## 일관성, 추적성, 전달

BP4는 시스템 아키텍처의 요소와, 물리적 최종 제품의 속성이나 특성을 나타내는 시스템 요구사항 사이에 [[traceability#일관성|일관성]]을 확보하고 [[traceability#양방향 추적성|양방향 추적성]]을 세우게 한다. BP5는 합의한 시스템 아키텍처를 특별특성과 함께 모든 관련 당사자에게 전달하게 한다.[@vda-automotive-spice-pam-4-1-2026]

## 시스템 아키텍처가 밝힐 내용

[[automotive-spice-process-assessment-model#프로세스 수행 지표|정보 항목]] 04-06(System architecture)은 시스템 아키텍처가 밝힐 내용으로 다음을 든다.[@vda-automotive-spice-pam-4-1-2026]

- 시스템 구조의 개관과 시스템 요소
- 운용 모드, 캘리브레이션 순서, 성능 같은 시스템 요소의 동작과, 환경과 맞물린 동작
- 시스템 요소와 환경 사이의 인터페이스
- 마이크로컨트롤러의 입출력 핀 같은 하드웨어-소프트웨어 인터페이스
- 자원·성능 특성 같은 파라미터
- 열 영향에 대한 기계 공학 평가 같은 도메인별 공학 참조[@vda-automotive-spice-pam-4-1-2026]

04-06은 고른 아키텍처의 근거와, 하드웨어 아키텍처(04-52), [[software-architecture|소프트웨어 아키텍처]], ML(machine learning) 아키텍처(04-51) 같은 밑에 놓인 아키텍처의 참조를 담을 수 있는 것으로 든다. 예로는 배선 기술, 제어 장치, 연결용 무선 인터페이스를 밝힌 차량 배선 개관을 든다.[@vda-automotive-spice-pam-4-1-2026]

## 특별특성

정보 항목 17-57(Special characteristics)은 **특별특성**을 안전, 법규 준수, 맞춤(fit), 기능, 성능, 후속 가공에 영향을 주어 특별히 다뤄야 하는 제품이나 프로세스의 특성으로 정의한다. 밝힐 것으로는 제품 특성, 생산 프로세스 파라미터, 보안 같은 도메인 영향의 참조, 규정 참조, 적합성 요구사항을 들고, 담을 수 있는 것으로 처리·성능 요구사항을 든다. 참고할 자료로 [[iso-26262|ISO 26262]]와 [[iso-sae-21434|ISO/SAE 21434]] 등을 들고, FMEA의 평가가 특별특성을 고려할 수 있다고 제시한다.[@vda-automotive-spice-pam-4-1-2026]

SYS.3은 시스템 아키텍처를 정한 기준에 비추어 분석하면서 특별특성을 식별하는 것을 프로세스 성과의 하나로 둔다.[@vda-automotive-spice-pam-4-1-2026]

## 하드웨어-소프트웨어 인터페이스

SWE.1(Software Requirements Analysis) BP1의 주석은 HSI(hardware-software-interface) 정의가 하드웨어를 맥락에 넣으므로 시스템 설계 수준의 인터페이스 결정이라 하고, HSI가 있으면 소프트웨어 요구사항의 입력이 될 수 있다고 제시한다. SWE.2(Software Architectural Design) BP1의 주석도 같은 까닭으로 HSI 정의를 시스템 설계(SYS.3)의 한 측면으로 제시한다.[@vda-automotive-spice-pam-4-1-2026]

SWE.1 BP1의 주석은 소프트웨어만 개발할 때는 시스템 아키텍처가 주어진 운용 환경을 가리킨다고 제시한다.[@vda-automotive-spice-pam-4-1-2026]
