---
title: 침투 테스트
tags:
  - security/cybersecurity
verified: 2026-10-03
---

ISO/SAE 21434:2021은 **침투 테스트**(penetration testing)를 실제 공격을 흉내 내어 cybersecurity goal을 침해할 방법을 찾는 사이버보안 테스트로 정의한다.[@iso-sae-21434-obp-2021] NIST SP 800-115는 평가자가 실제 공격을 흉내 내어 애플리케이션, 시스템, 네트워크의 보안 기능을 우회할 방법을 찾는 보안 테스트로 정의한다. NIST SP 800-115에 따르면 침투 테스트에서는 흔히 공격자가 쓰는 도구와 기법으로 실제 시스템과 데이터에 실제 공격을 가한다.[@nist-sp-800-115-2008]

## 단계

NIST SP 800-115는 침투 테스트를 네 단계로 나누는 방법을 한 예로 든다.[@nist-sp-800-115-2008]

1. 계획(planning): 규칙을 정하고, 경영진의 승인을 받아 문서로 남기고, 목표를 정한다. 이 단계에서는 시험하지 않는다.
2. 발견(discovery): 대상의 정보를 모으고 스캔한 뒤, 취약점 데이터베이스와 시험자의 지식으로 취약점을 찾는다.
3. 공격(attack): 찾은 취약점을 악용해 보아 실제로 있는지 확인한다. 악용으로 더 많은 접근이나 정보를 얻으면 발견 단계로 돌아가 더 시험한다.
4. 보고(reporting): 다른 세 단계와 함께 진행되고, 테스트가 끝나면 찾은 취약점, 위험 등급, 완화 방법을 보고서에 적는다.[@nist-sp-800-115-2008]

![[diagrams/penetration-testing-four-phases.svg]]

## 시나리오와 공개 범위

NIST SP 800-115는 외부 공격 시나리오에서 시험자에게 대상 IP(Internet Protocol) 주소나 주소 범위 말고는 대상 환경의 실제 정보를 주지 않게 하고, 내부 공격 시나리오에서는 그 접근 수준의 사용자, 대개 일반 직원이 가질 네트워크 정보를 주게 한다. 또 NIST SP 800-115는 조직의 IT(information technology) 직원이 알고 동의한 가운데 하는 overt 테스트와, IT 직원 모르게 상위 경영진의 승인만 받고 하는 covert 테스트를 나눈다.[@nist-sp-800-115-2008]

## 차량 사이버보안에서의 자리

ISO/SAE 21434:2021의 11절은 아이템의 cybersecurity validation을 차량 수준에서 다룬다.[@iso-sae-21434-obp-2021] Automotive SPICE for Cybersecurity 2.0의 SEC.4 Risk Treatment Validation에서 BP1은 risk treatment validation 조치를 정하게 하고, BP1의 노트는 이런 조치가 흔히 침투 테스트처럼 아직 찾지 못한 취약점을 찾는 사이버보안 방법을 쓴다고 적는다.[@vda-automotive-spice-cybersecurity-2025]

NHTSA의 2022년 Cybersecurity Best Practices for the Safety of Modern Vehicles는 제조사가 개발 과정에서 침투 테스트를 포함한 제품 사이버보안 테스트를 하기를 권한다. 또 테스트 단계에 자격을 갖추고 취약점을 찾을 동기가 있으며 개발팀에 속하지 않았던 시험자를 쓰기를 권한다.[@nhtsa-cybersecurity-best-practices-2022]

## 취약점 스캐닝과 퍼즈 테스트

NIST SP 800-115에 따르면 취약점 스캐닝(vulnerability scanning)은 호스트의 운영체제와 소프트웨어를 알아낸 뒤, 스캐너의 데이터베이스에 담긴 알려진 취약점과 맞춰 본다. 스캐너는 취약점이 있을 가능성을 알려 줄 뿐이고, 침투 테스트의 공격 단계는 실제로 악용해 그것을 확인한다.[@nist-sp-800-115-2008] NIST 용어집에 따르면 퍼즈 테스트(fuzz testing)는 대상에 잘못된 데이터를 넣어 대상이 어떻게 반응하는지 드러낸다.[@nist-csrc-glossary-fuzz-testing-2026]
