---
title: 메시지 인증 코드
tags:
  - security/cryptography
verified: 2026-10-03
---

**메시지 인증 코드**(message authentication code, MAC)는 비밀 키를 써서 데이터로 계산한 고정 길이의 비트 열이다. NIST SP 800-38B가 이렇게 정의한다.[@nist-sp-800-38b-2016] MAC은 메시지의 출처와 [[cybersecurity-property#기밀성, 무결성, 가용성|무결성]]을 함께 인증한다.[@nist-fips-198-1-2008] NIST SP 800-175B Rev. 1에 따르면 키를 나눠 가진 쪽만 데이터에 맞는 MAC을 계산할 수 있다.[@nist-sp-800-175b-r1-2020]

NIST는 MAC 알고리즘의 출력을 MacTag라고도 부르고[@nist-csrc-glossary-mactag-2026], 비밀 키가 있어야 계산하고 검증할 수 있는 암호 체크섬을 tag라고도 부른다.[@nist-csrc-glossary-tag-2026]

## 생성과 검증

MAC은 대개 비밀 키를 나눠 가진 두 쪽 사이에서 쓴다. 송신자는 비밀 키와 메시지로 MAC을 만들어, 대개 메시지와 함께 수신자에게 보낸다. 어느 MAC 알고리즘이든 키를 가진 쪽이 데이터에 MAC 생성을 적용하고, 키를 가진 쪽이 받은 데이터와 MAC에 검증을 적용한다. 검증에 성공하면 메시지가 키를 나눠 가진 쪽에게서 왔고 바뀌지 않았다는 보증을 얻는다.[@nist-sp-800-38b-2016][@nist-fips-198-1-2008]

![[diagrams/mac-generation-verification.svg]]

## 블록 암호 기반: CMAC

NIST SP 800-38B는 대칭 키 [[symmetric-key-cryptography#블록 암호와 스트림 암호|블록 암호]]에 기반한 MAC 알고리즘인 **CMAC**(Cipher-based Message Authentication Code)을 정하고, 바탕 블록 암호로 [[symmetric-key-cryptography#AES|AES]] 같은 승인된 블록 암호를 쓰게 한다. CMAC의 검증은 받은 메시지에 MAC 생성을 다시 적용해 얻은 값이 받은 MAC과 같은지 보는 것이다.[@nist-sp-800-38b-2016]

## 해시 기반: HMAC

FIPS 198-1은 [[cryptographic-hash-function|암호학적 해시 함수]]와 비밀 키로 MAC을 만드는 **HMAC**(keyed-Hash Message Authentication Code)을 정하고, HMAC에 승인된 해시 함수를 쓰게 한다. HMAC은 키에서 만든 두 값으로 해시를 두 번 적용한다. 메시지 $\mathit{text}$의 HMAC은 $H\big((K_0 \oplus \mathrm{opad}) \,\|\, H((K_0 \oplus \mathrm{ipad}) \,\|\, \mathit{text})\big)$이다. 여기서 $H$는 해시 함수, $K_0$은 비밀 키 $K$를 해시 함수의 입력 블록 길이에 맞춘 키, ipad와 opad는 각각 바이트 `0x36`과 `0x5c`를 블록 길이만큼 되풀이한 값, $\|$는 이어 붙이기, $\oplus$는 XOR이다. 수신자는 같은 키와 HMAC 함수로 MAC을 다시 계산해 받은 MAC과 견준다.[@nist-fips-198-1-2008]

![[diagrams/hmac-nested-hash.svg]]

이 표준은 응용이 HMAC의 출력을 잘라 쓸 수 있게 하고, 자를 때는 HMAC 함수 출력의 왼쪽에서 MAC 길이 $\lambda$만큼의 비트를 MAC으로 쓰도록 정한다.[@nist-fips-198-1-2008]

Krawczyk, Bellare, Canetti는 1997년 RFC 2104로 HMAC을 기술했다. HMAC은 반복형 암호학적 해시 함수라면 어느 것과도 공유 비밀 키를 함께 써서 만들 수 있고, 그 암호 강도는 바탕 해시 함수의 성질에 달려 있다.[@ietf-rfc-2104-1997]

NIST SP 800-175B Rev. 1은 HMAC을 FIPS 180-4나 FIPS 202에 정한 승인된 해시 함수와 함께 쓰도록 승인한다.[@nist-sp-800-175b-r1-2020]

## 해시만 쓸 때와의 차이

해시 함수는 데이터 무결성을 어느 정도만 보증하고, MAC 알고리즘은 무결성과 출처 인증을 함께 줄 수 있다. 해시 함수를 비밀 키 없이 쓰면 공격자가 데이터를 바꾸고 해시 값을 새로 계산했을 수 있어서, 데이터가 바뀌지 않았다는 보증이 없다. 키를 모르는 공격자는 데이터를 바꾼 뒤 그 데이터에 맞아 검증을 통과할 MAC을 계산해 내지 못한다.[@nist-sp-800-175b-r1-2020]

NIST SP 800-63-4에 따르면 MAC은 authenticity와 무결성은 보호하지만 부인 방지는 주지 않는다.[@nist-sp-800-63-4-2025] 디지털 서명과의 비교는 [[digital-signature#MAC과의 차이|디지털 서명]]에서 다룬다.

## GMAC과 KMAC

NIST SP 800-38D는 [[block-cipher-mode-of-operation#인증 암호 모드|GCM]]의 입력을 암호화하지 않을 데이터로 한정해 입력 데이터를 인증하기만 하는 특수형인 **GMAC**(Galois Message Authentication Code)을 정한다.[@nist-sp-800-38d-2007][@ietf-rfc-4543-2006]

NIST SP 800-185는 [[cryptographic-hash-function#SHA 계열|Keccak]]에 기반한 가변 길이 MAC 알고리즘인 **KMAC**(Keccak Message Authentication Code)을 정하며, KMAC은 PRF(Pseudorandom Function)로도 쓸 수 있다.[@nist-sp-800-185-2016]
