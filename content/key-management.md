---
title: 키 관리
tags:
  - security/cryptography
verified: 2026-10-22
---

**키 관리**(key management)는 키 재료의 생성, 저장, 분배 같은 기능을 아우르는 일이다.[@nist-sp-800-57-pt1-r5-2020][@iso-iec-11770-1-2010]

ISO/IEC 11770-1:2010은 키 관리를 정해진 보안 정책의 맥락 안에서만 제공할 수 있는 것으로 둔다.[@iso-iec-11770-1-2010]

## 생명주기와 키 상태

NIST SP 800-57 Part 1 Rev. 5는 키 관리가 암호 키와 그에 관련된 키 정보를 키의 생명주기 내내 다룬다고 보고, 키의 생성, 저장, [[key-establishment|설정]], 입력과 출력, 사용, 파기를 든다. 이 문서는 키가 생성된 뒤 파기될 때까지 거치는 상태를 **키 상태**(key state)라 하고, pre-activation, active, suspended, deactivated, compromised, destroyed를 든다.[@nist-sp-800-57-pt1-r5-2020]

## 용도와 cryptoperiod

이 문서는 원칙적으로 키 하나를 한 가지 용도에만 쓰도록 정한다. **Cryptoperiod**는 특정 키를 정당한 개체가 쓰도록 허가된 기간이다.[@nist-sp-800-57-pt1-r5-2020]

## 쓰는 곳

[[autosar-crypto-stack|AUTOSAR 암호 스택]]과 [[hardware-security-module|HSM]]이 키를 다루는 방식은 각 페이지에서 다룬다.
