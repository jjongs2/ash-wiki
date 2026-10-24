---
title: Cybersecurity specification
tags:
  - security/cybersecurity
verified: 2026-10-03
---

[[iso-sae-21434|ISO/SAE 21434]]:2021은 **cybersecurity specification**을 [[cybersecurity|사이버보안]] 요구사항과 이에 맞춘 architectural design으로 정의한다. 이 표준은 **architectural design**을 컴포넌트와 그 경계, 인터페이스, 상호작용을 식별할 수 있게 하는 표현으로 정의한다. 이 표준의 10절(product development)은 cybersecurity specification을 정하고 사이버보안 요구사항을 구현하고 검증하는 활동을 담는다.[@iso-sae-21434-obp-2021]

![[diagrams/cybersecurity-concept-specification-contents.svg]]

## 보안 설계 원칙과 코딩 표준

NIST SP 800-160 Vol. 1 Rev. 1은 신뢰할 수 있는 보안 설계 원칙 30개를 표 하나에 나열하며, least privilege, least sharing, reduced complexity, protective defaults가 그 가운데 있다. Rev. 1은 2016년 11월에 나온 이전 판(2018년 3월 갱신)에 견주어, 설계 원칙 분류 두 가지를 없애 설계 원칙을 간추렸다. 또 원칙을 지켜야 할 규칙이나 적합성을 판단하는 근거로 쓰지 말고, 시스템을 추론하는 바탕으로 삼으라고 한다.[@nist-sp-800-160v1r1-2022]

C 언어에서는 SEI CERT C(CERT: 카네기멜런 대학 [[software-engineering|소프트웨어 공학]] 연구소의 사이버보안 연구 부문) 코딩 표준이 보안 코딩 규칙을 담고[@sei-cert-c-introduction-2026][@sei-cert-division-2026], MISRA C:2012 Amendment 1이 보안 관련 지침을 더했다.[@misra-c-2012-amd1-2016] ISO/SAE 21434:2021은 참고문헌에 MISRA C:2012와 SEI CERT C 코딩 표준을 든다.[@iso-sae-21434-obp-2021] SEI CERT C 코딩 표준은 [[coding-standard|코딩 표준]]에서, MISRA C는 [[misra-c|MISRA C]]에서 다룬다.

## Automotive SPICE for Cybersecurity의 SEC.2

[[automotive-spice-for-cybersecurity|Automotive SPICE for Cybersecurity]] 2.0은 SEC.2(Cybersecurity Implementation) 프로세스의 목적을 시스템, 소프트웨어, 하드웨어의 설계를 사이버보안 요구사항에 맞게 정련하고, 요구사항이 구현되도록 보장하는 것으로 둔다. SEC.2의 BP(base practice)는 다음 일곱이다.[@vda-automotive-spice-cybersecurity-2025]

| BP  | 하는 일                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------- |
| BP1 | 아키텍처의 세부 정련                                                                                            |
| BP2 | 사이버보안 요구사항의 [[traceability#일관성\|일관성]] 확보와 [[traceability#양방향 추적성\|양방향 추적성]] 수립 |
| BP3 | Cybersecurity control 선택                                                                                      |
| BP4 | 아키텍처의 약점 분석                                                                                            |
| BP5 | 상세 설계의 정련                                                                                                |
| BP6 | 아키텍처와 상세 설계의 일관성 확보와 양방향 추적성 수립                                                         |
| BP7 | 합의한 구현 결과의 전달                                                                                         |

- BP1의 정련은 사이버보안 요구사항을 근거로 시스템, 소프트웨어, 하드웨어 아키텍처의 요소를 더하거나, 맞추거나, 다시 만드는 것이다.
- BP4는 인터페이스와 상세 설계를 포함한 시스템, 소프트웨어, 하드웨어 아키텍처를 약점의 관점에서 분석해 [[vulnerability-management|취약점]]을 찾고, 설계 결정을 문서로 남긴다.
- BP6이 잇는 짝은 [[software-architecture|소프트웨어 아키텍처]]와 [[software-unit-design|소프트웨어 상세 설계]]의 짝, 하드웨어 아키텍처의 컴포넌트와 하드웨어 상세 설계의 짝이다.
- BP7은 합의한 구현 결과를 영향받는 모든 당사자에게 전하며, 전하는 내용에는 아키텍처에서 찾은 취약점이 들 수 있다.[@vda-automotive-spice-cybersecurity-2025]

Control 자체는 [[cybersecurity-concept#Cybersecurity control|cybersecurity concept]]에서, 추적성과 일관성은 [[traceability|추적성]]에서 다룬다.
