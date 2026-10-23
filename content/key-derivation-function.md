---
title: 키 유도 함수
tags:
  - security/cryptography
aliases:
  - KDF
verified: 2026-10-22
---

**키 유도 함수**(KDF, Key Derivation Function)는 비밀 키나 초기 키 재료를 입력으로 받아 암호 키로 쓸 키 재료를 유도하는 함수다.[@nist-sp-800-108-r1-upd1-2024][@ietf-rfc-5869-2010]

## 의사 난수 함수 기반 KDF

NIST SP 800-108r1-upd1은 이미 있는 암호 키에서 키를 더 유도하는 KDF를 정한다. 이 KDF는 PRF(Pseudorandom Function)로 [[message-authentication-code#해시 기반: HMAC|HMAC]], [[message-authentication-code#블록 암호 기반: CMAC|CMAC]], [[message-authentication-code#GMAC과 KMAC|KMAC]]을 쓰고, PRF를 여러 번 호출하는 반복 방식으로 counter 모드, feedback 모드, double-pipeline 모드를 둔다.[@nist-sp-800-108-r1-upd1-2024]

## 추출과 확장

NIST SP 800-56C Rev. 2는 [[key-establishment|키 설정]]에서 얻은 공유 비밀로부터 키 재료를 유도하는 방법을 두 갈래로 정한다. 하나는 한 단계로 원하는 길이의 키 재료를 내는 one-step 키 유도 함수이고, 다른 하나는 randomness extraction으로 키 유도 키 하나를 얻은 뒤 key expansion으로 원하는 길이의 키 재료를 내는 두 단계 절차다.[@nist-sp-800-56c-r2-2020]

![[diagrams/kdf-one-step-two-step.svg]]

RFC 5869에 따르면 **HKDF**(HMAC-based Extract-and-Expand Key Derivation Function)는 extract-then-expand 꼴을 따르는 HMAC 기반 KDF다. 첫 단계는 입력 키 재료에서 고정 길이의 의사 난수 키를 추출하고, 둘째 단계는 그 키를 여러 의사 난수 키로 확장한다.[@ietf-rfc-5869-2010]

## 쓰는 곳

[[transport-layer-security#TLS 1.3 핸드셰이크|TLS 1.3]]과 [[autosar-crypto-stack#Crypto Service Manager|AUTOSAR 암호 스택]]이 키를 유도하는 방식은 각 페이지에서 다룬다.
