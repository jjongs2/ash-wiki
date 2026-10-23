---
title: 난수 생성기
tags:
  - security/cryptography
aliases:
  - RBG
verified: 2026-10-22
---

**난수 생성기**(random bit generator)는 통계적으로 서로 독립이고 치우치지 않아 보이는 비트 열을 내는 장치나 알고리즘이다. NIST SP 800-90A Rev. 1이 이렇게 정의하고, 난수 생성기를 DRBG(Deterministic Random Bit Generator)와 NRBG(Non-deterministic Random Bit Generator) 둘로 나눈다.[@nist-sp-800-90a-r1-2015]

## NRBG와 DRBG

**NRBG**는 엔트로피 소스에 늘 접근할 수 있는 난수 생성기로, 흔히 True Random Number (or Bit) Generator라 부른다. 출력 비트 하나하나가 예측할 수 없는 물리 과정에 바탕을 둔다.[@nist-sp-800-90a-r1-2015]

**DRBG**는 알고리즘으로 비트를 결정적으로 계산하는 난수 생성기다. DRBG의 알고리즘은 seed에서 정해지는 초기값으로부터 비트 열을 만들고, 과정이 결정적이므로 DRBG의 출력은 난수가 아니라 의사 난수다.[@nist-sp-800-90a-r1-2015]

seed를 비밀로 두고 알고리즘이 잘 설계되었으면, DRBG의 출력은 인스턴스화한 [[public-key-cryptography#보안 강도|보안 강도]]까지 예측할 수 없다. 이 간행물은 [[cryptographic-hash-function|해시 함수]]나 [[symmetric-key-cryptography#블록 암호와 스트림 암호|블록 암호]]에 기반한 DRBG 메커니즘을 정한다.[@nist-sp-800-90a-r1-2015]

## NIST SP 800-90 계열

NIST SP 800-90C에 따르면 SP 800-90 계열은 DRBG 메커니즘을 정하는 SP 800-90A, 엔트로피 소스의 개발과 검증을 안내하는 SP 800-90B, 난수 생성기의 구성을 정하는 SP 800-90C 셋으로 이루어진다. 이 간행물은 RBG1, RBG2, RBG3, RBGC 네 갈래의 구성을 정한다.[@nist-sp-800-90c-2025]

## 쓰는 곳

[[hardware-security-module#차량용 MCU의 HSM|HSM]]과 [[autosar-crypto-stack#Crypto Interface와 Crypto Driver|AUTOSAR 암호 스택]]의 난수 생성기는 각 페이지에서 다룬다.
