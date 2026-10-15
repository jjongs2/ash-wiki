---
title: 디지털 서명
tags:
  - security
aliases:
  - 전자 서명
verified: 2026-10-03
---

**디지털 서명**(digital signature)은 데이터에 암호 변환을 적용한 결과로, 바르게 구현하면 데이터의 출처 인증, 데이터 무결성, 서명자의 [[cybersecurity-property#Authenticity, 부인 방지, 인가|부인 방지]]를 확인하는 수단이 된다. 서명자마다 개인 키와 [[public-key-cryptography|공개 키]]의 쌍을 갖고, 서명을 만들 때는 개인 키를, 검증할 때는 그에 대응하는 공개 키를 쓴다.[@nist-fips-186-5-2023]

## 서명 생성과 검증

RSA(Rivest-Shamir-Adleman), ECDSA(Elliptic Curve Digital Signature Algorithm), HashEdDSA는 서명을 만들기 전에 승인된 [[cryptographic-hash-function|해시 함수]]로 서명할 데이터의 메시지 다이제스트를 구하고, 그 다이제스트로 서명을 만든다. 검증자는 받은 데이터에서 같은 해시 함수로 다이제스트를 다시 구하고, 그 다이제스트와 서명자의 공개 키로 서명을 검증한다. EdDSA(Edwards-curve Digital Signature Algorithm)는 메시지를 해시하지 않고 그대로 서명 생성에 넣는다. 디지털 서명으로는 서명한 뒤 데이터가 바뀌었는지 알아낼 수 있다.[@nist-fips-186-5-2023] NIST SP 800-175B Rev. 1에 따르면 데이터가 전송이나 저장 중에 바뀌면, 검증 때 다시 구한 해시 값이 서명할 때의 해시 값과 달라진다.[@nist-sp-800-175b-r1-2020]

![[diagrams/digital-signature-generation-verification.svg]]

## 출처 인증과 부인 방지

승인된 서명 알고리즘은 개인 키를 모르는 공격자가 서명자 명의로 유효한 서명을 만들지 못하게 설계되어, 개인 키를 가진 쪽만 서명을 만들 수 있다. 그래서 서명으로 서명자의 신원을 확인할 수 있다. 공개 키는 비밀로 둘 필요가 없어서, 누구나 서명자의 공개 키로 서명을 검증할 수 있다. 다만 검증자는 서명자가 그 키 쌍의 실제 소유자라는 보증이 있어야 하고, 이 보증은 [[public-key-cryptography#공개 키를 믿게 하는 수단|인증서]]처럼 소유자의 신원과 공개 키를 묶는 수단으로 얻는다. 서명을 받은 쪽은 서명을 그 서명자가 만들었다는 것을 제3자에게 보이는 증거로 쓸 수 있고, 서명자는 나중에 서명을 쉽게 부인하지 못한다.[@nist-fips-186-5-2023]

## 서명 표준

FIPS 186-5는 디지털 서명 기법으로 RSA, ECDSA, EdDSA 셋을 승인한다. ECDSA는 FIPS 186-5가 직접 정하고, RSA는 RFC 8017이, EdDSA는 RFC 8032가 정한 것을 승인하면서 요구사항을 더한다. 이 표준은 DSA(Digital Signature Algorithm)를 서명 생성에 더는 승인하지 않고, 이 표준이 시행되기 전에 만든 서명의 검증에만 쓰게 한다.[@nist-fips-186-5-2023]

## MAC과의 차이

[[message-authentication-code|메시지 인증 코드]](MAC)는 메시지의 출처와 무결성을 인증하며, 대개 비밀 키를 나눠 가진 두 쪽 사이에서 쓴다. [[message-authentication-code#해시 기반: HMAC|HMAC]]은 MAC의 계산과 검증에 모두 비밀 키를 쓰고 그 키는 송신자와 의도한 수신자만 알므로, 검증도 키를 가진 쪽만 할 수 있다.[@nist-fips-198-1-2008] NIST SP 800-224 초안에 따르면 MAC은 송신자가 비밀 키로 만들고 수신자가 같은 키로 다시 만들어 검증하므로, 그 보증을 제3자에게 넘길 수 없어 디지털 서명이 주는 부인 방지와 다르다.[@nist-sp-800-224-ipd-2024]

디지털 서명은 서명하는 키를 서명자만 갖고 검증하는 키를 공개하므로, 부인 방지를 주고 누구나 검증할 수 있다.[@nist-fips-186-5-2023] NIST SP 800-175B Rev. 1에 따르면 디지털 서명은 MAC과 달리 부인 방지를 지원하지만, 성능 비용이 더 크다.[@nist-sp-800-175b-r1-2020]
