---
title: Cybersecurity concept
tags:
  - security/cybersecurity
verified: 2026-10-03
---

[[iso-sae-21434|ISO/SAE 21434]]:2021은 **cybersecurity concept**을 세 가지, 곧 [[cybersecurity-lifecycle#아이템과 운용 환경|아이템]]의 사이버보안 요구사항, [[cybersecurity-lifecycle#아이템과 운용 환경|운용 환경]]이 맞춰야 할 요구사항, 관련 cybersecurity control의 정보로 정의한다. 이 표준의 9절(concept)은 아이템의 사이버보안 리스크, [[cybersecurity-goal|cybersecurity goal]], 사이버보안 요구사항을 정하는 활동을 담는다.[@iso-sae-21434-obp-2021]

![[diagrams/cybersecurity-concept-specification-contents.svg]]

## Cybersecurity requirement

[[automotive-spice-for-cybersecurity|Automotive SPICE for Cybersecurity]] 2.0은 SEC.1 프로세스에서 사이버보안 요구사항을 cybersecurity goal에서 끌어내게 한다.[@vda-automotive-spice-cybersecurity-2025] 설계 단계에서 요구사항에 대응하는 설계를 함께 정한 것은 [[cybersecurity-specification|cybersecurity specification]]에서 다룬다.

## Cybersecurity control

ISO/SAE 21434:2021은 **cybersecurity control**을 리스크를 바꾸는 조치로 정의한다.[@iso-sae-21434-obp-2021] Automotive SPICE for Cybersecurity 2.0은 control을 대개 사이버보안 리스크를 탐지하거나, 그에 대응하거나, 줄이는 기술적 조치나 그 밖의 해결책으로 두고, 하나 이상의 사이버보안 요구사항과 연결된 것으로 둔다.[@vda-automotive-spice-cybersecurity-2025]

NIST 용어집은 security control을 시스템과 그 컴포넌트, 프로세스, 데이터의 기밀성, 무결성, 가용성을 지키려고 시스템에 정한 관리적, 운영적, 기술적 control로 정의하며, safeguard나 countermeasure라고도 부른다.[@nist-csrc-glossary-security-control-2026]

[[un-r155|UN R155]]는 Annex 5의 완화 조치 목록에서, 암호 키를 보관하는 security control의 예로 [[hardware-security-module|HSM]]을 든다.[@unece-r155-2021] [[autosar|AUTOSAR]] R25-11의 Explanation of Security Overview는 HSM을 hardware trust anchor의 한 예로 든다.[@autosar-fo-exp-securityoverview-2025]

ENISA의 2016년 보고서 Cyber Security and Resilience of Smart Cars는 차량의 중요한 데이터나 부품의 진정성을 지키는 조치의 예로 [[secure-boot|secure boot]]를 든다.[@enisa-smart-cars-2016]
