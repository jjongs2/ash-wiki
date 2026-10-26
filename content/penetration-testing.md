---
title: 침투 테스트
tags:
  - security/cybersecurity
  - sw-engineering/sw-testing
verified: 2026-10-03
---

[[iso-sae-21434|ISO/SAE 21434]]:2021은 **침투 테스트**(penetration testing)를 실제 공격을 흉내 내어 [[cybersecurity-goal|cybersecurity goal]]을 침해할 방법을 찾는 사이버보안 테스트로 정의한다.[@iso-sae-21434-obp-2021] NIST SP 800-115는 평가자가 실제 공격을 흉내 내어 애플리케이션, 시스템, 네트워크의 보안 기능을 우회할 방법을 찾는 보안 테스트로 정의한다. 침투 테스트에서는 흔히 공격자가 쓰는 도구와 기법으로 실제 시스템과 데이터에 실제 공격을 가한다.[@nist-sp-800-115-2008]

## 단계

NIST SP 800-115는 침투 테스트를 네 단계로 나누는 방법을 한 예로 든다.[@nist-sp-800-115-2008]

1. 계획(planning): 규칙을 정하고, 경영진의 승인을 받아 문서로 남기고, 목표를 정한다. 이 단계에서는 시험하지 않는다.
2. 발견(discovery): 대상의 정보를 모으고 스캔한 뒤, 취약점 데이터베이스와 시험자의 지식으로 [[vulnerability-management|취약점]]을 찾는다.
3. 공격(attack): 찾은 취약점을 악용해 보아 실제로 있는지 확인한다. 악용으로 더 많은 접근이나 정보를 얻으면 발견 단계로 돌아가 더 시험한다.
4. 보고(reporting): 다른 세 단계와 함께 진행되고, 테스트가 끝나면 찾은 취약점, 리스크 등급, 완화 방법을 보고서에 적는다.[@nist-sp-800-115-2008]

![[diagrams/penetration-testing-four-phases.svg]]

## 시나리오와 공개 범위

NIST SP 800-115는 외부 공격 시나리오에서 시험자에게 대상 IP 주소나 주소 범위 말고는 대상 환경의 실제 정보를 주지 않게 하고, 내부 공격 시나리오에서는 그 접근 수준의 사용자, 대개 일반 직원이 가질 네트워크 정보를 주게 한다. 또 이 가이드는 조직의 IT(information technology) 직원이 알고 동의한 가운데 하는 overt 테스트와, IT 직원 모르게 상위 경영진의 승인만 받고 하는 covert 테스트를 나눈다.[@nist-sp-800-115-2008]

PCI SSC(결제 데이터 보안 표준을 만드는 국제 협의체)의 2017년 Penetration Testing Guidance는 테스트를 시작하기 전에 시험자에게 대상 정보를 얼마나 주는지에 따라 침투 테스트를 블랙박스, 화이트박스, 그레이박스의 세 가지로 나눈다. 블랙박스에서는 정보를 주지 않고, 화이트박스에서는 네트워크와 애플리케이션의 세부를 모두 줄 수 있으며, 그레이박스에서는 일부를 줄 수 있다.[@pci-ssc-penetration-testing-guidance-2017]

## 차량 사이버보안에서의 자리

ISO/SAE 21434:2021의 11절은 [[cybersecurity-lifecycle#아이템과 운용 환경|아이템]]의 [[cybersecurity-verification-and-validation|cybersecurity validation]]을 차량 수준에서 다룬다.[@iso-sae-21434-obp-2021] [[automotive-spice-for-cybersecurity|Automotive SPICE for Cybersecurity]] 2.0의 SEC.4 Risk Treatment Validation에서 [[cybersecurity-verification-and-validation#Automotive SPICE for Cybersecurity의 SEC.3·SEC.4|BP1]]은 risk treatment validation 조치를 정하게 하고, 그 노트는 이런 조치에 흔히 쓰는 방법으로 침투 테스트처럼 아직 찾지 못한 취약점을 찾는 사이버보안 방법을 든다.[@vda-automotive-spice-cybersecurity-2025]

NHTSA의 2022년 Cybersecurity Best Practices for the Safety of Modern Vehicles는 제조사가 개발 과정에서 침투 테스트를 포함한 제품 사이버보안 테스트를 하기를 권한다. 또 테스트 단계에 자격을 갖추고 취약점을 찾을 동기가 있으며 개발팀에 속하지 않았던 시험자를 쓰기를 권한다.[@nhtsa-cybersecurity-best-practices-2022]

ENISA(EU의 사이버보안 기관)의 2019년 보고서 Good practices for security of smart cars는 개발 단계에서, 그리고 그 뒤에는 새 위협이나 취약점이 나왔을 때나 큰 업데이트 뒤처럼 사건을 계기로 정기적으로 침투 테스트 같은 보안 평가를 하기를 권한다(PS-14).[@enisa-smart-cars-2019]

[[un-r155|UN R155]] 5.3.1 (a)는 승인 당국과 기술 기관이 사이버보안 역량을 갖춘 인력을 두게 하고, R155 해석 문서는 이 인력에 침투 테스트, [[fuzz-testing|퍼즈 테스트]], 부채널 테스트 같은 차량 사이버보안 실험실 시험의 방법을 적용하는 데 역량과 경험이 있는 인력이 든다고 본다.[@unece-r155-interpretation-2023]

Auto-ISAC(자동차 업계의 차량 사이버보안 정보 공유 조직)의 2025년 백서는 [[automotive-threat-matrix|ATM]]의 전술과 기법을 침투 테스트 같은 탐색적 활동을 계획하는 출발점으로 든다.[@auto-isac-atm-white-paper-2025][@auto-isac-about-us-2026]

## 취약점 스캐닝과 퍼즈 테스트

NIST SP 800-115는 취약점 스캐닝(vulnerability scanning)을 대상 식별·분석 기법으로, 침투 테스트를 대상 취약점 검증 기법으로 나눈다. 취약점 스캐닝은 호스트의 운영체제와 소프트웨어를 알아낸 뒤, 스캐너의 데이터베이스에 담긴 알려진 취약점과 맞춰 본다. 침투 테스트의 발견 단계도 이런 대조를 한다. 다만 취약점 스캐너는 취약점이 있을 가능성만 확인하고, 침투 테스트는 공격 단계에서 취약점을 악용해 실제로 있는지 확인한다.[@nist-sp-800-115-2008] NIST 용어집에 따르면 퍼즈 테스트(fuzz testing)는 대상에 잘못된 데이터를 넣어 대상이 어떻게 반응하는지 드러낸다.[@nist-csrc-glossary-fuzz-testing-2026]

## 명세 준수 테스트와의 차이

CC:2022(Common Criteria for Information Technology Security Evaluation)는 평가 대상의 보안 기능이 기능 명세와 설계대로 동작하는지 확인하는 테스트에 침투 테스트를 넣지 않고, 설계와 구현의 취약점을 찾는 침투 테스트를 취약점 평가의 한 부분으로 따로 다룬다.[@ccra-cc-part-3-2022]
