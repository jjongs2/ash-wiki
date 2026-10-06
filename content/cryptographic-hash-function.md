---
title: 암호학적 해시 함수
tags:
  - security
aliases:
  - 해시 함수
verified: 2026-10-03
---

**암호학적 해시 함수**(cryptographic hash function)는 길이가 정해지지 않은 비트 열을 받아 길이가 고정된 비트 열을 내는 해시 함수 가운데, 역상 저항, 제2역상 저항, 충돌 저항을 갖도록 설계된 것이다.[@nist-sp-800-107-r1-2012] 출력은 **해시 값**(hash value) 또는 **메시지 다이제스트**(message digest)라 부른다.[@nist-fips-202-2015] 해시 함수는 키를 쓰지 않는다.[@nist-sp-800-175b-r1-2020][@ietf-rfc-4949-2007]

FIPS 180-4가 정한 해시 알고리즘은 메시지가 조금이라도 바뀌면 매우 높은 확률로 다른 메시지 다이제스트를 낸다. 해시 값은 메시지의 [[cybersecurity-property|무결성]] 확인과 [[digital-signature|디지털 서명]], [[message-authentication-code|메시지 인증 코드]](MAC)의 생성과 검증에 쓰인다.[@nist-fips-180-4-2015]

## 보안 성질

- **역상 저항**(preimage resistance): 해시 값 하나가 주어질 때, 그 해시 값을 내는 입력을 찾는 것이 계산상 불가능하다.
- **제2역상 저항**(second preimage resistance): 입력 하나가 주어질 때, 같은 해시 값을 내는 다른 입력을 찾는 것이 계산상 불가능하다.
- **충돌 저항**(collision resistance): 해시 값이 같은 서로 다른 두 입력을 찾는 것이 계산상 불가능하다.[@nist-sp-800-107-r1-2012][@ietf-rfc-4949-2007]

![[diagrams/hash-function-security-properties.svg]]

출력이 $n$비트인 해시 함수의 충돌 저항 강도는 $n/2$비트로 기대된다.[@nist-sp-800-107-r1-2012] RFC 4949에 따르면 이는 생일 공격 때문으로, $n$비트 출력 함수에 무작위 입력 $2^{n/2}$개를 넣으면 같은 출력이 둘 이상 나올 확률이 절반을 넘는다.[@ietf-rfc-4949-2007] NIST SP 800-107 Rev. 1에 따르면 역상 저항의 기대 강도는 $n$비트다.[@nist-sp-800-107-r1-2012]

## SHA 계열

NIST는 1993년 FIPS 180으로 SHS(Secure Hash Standard)를 펴내고, 그 안에 SHA(Secure Hash Algorithm)를 정했다.[@nist-fips-180-1993] RFC 6194는 이 첫 알고리즘을 SHA-0이라 부른다.[@ietf-rfc-6194-2011]

- FIPS 180-1(1995)은 SHA의 계산에 순환 왼쪽 시프트를 더해 고친 SHA-1을 정했다.[@nist-fips-180-1-1995]
- FIPS 180-2(2002)는 SHA-256, SHA-384, SHA-512를 더했고[@nist-fips-180-2-2002], 2004년의 Change Notice 1이 SHA-224를 더했다.[@nist-fips-180-2-change-notice-1-2004]
- FIPS 180-4는 SHA-512/224와 SHA-512/256을 더했다.[@nist-fips-180-4-2015]

FIPS 180-4는 SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224, SHA-512/256을 정하고, SHA-1의 메시지 다이제스트를 160비트로 정한다.[@nist-fips-180-4-2015] 이 가운데 SHA-1을 뺀 여섯을 **SHA-2 계열**이라 부른다. FIPS 202는 Keccak에 바탕을 둔 **SHA-3 계열**을 정한다. 이 계열은 해시 함수 SHA3-224, SHA3-256, SHA3-384, SHA3-512와 확장 출력 함수(XOF, extendable-output function) SHAKE128, SHAKE256으로 이루어진다.[@nist-fips-202-2015] NIST는 2007년에 SHA-3 공모를 열고, 2012년에 Keccak을 뽑았다.[@nist-sha-3-project-2024]

NIST는 2022년에 충돌 공격이 SHA-1을 약화시켰다고 보고, SHA-1을 2030년 12월 31일까지 단계적으로 퇴역시킨다고 발표했다.[@nist-sha-1-retirement-2022] NIST SP 800-131A Rev. 2는 NIST의 프로토콜별 지침이 따로 허용하지 않으면 디지털 서명 생성에 SHA-1을 쓰지 못하게 한다.[@nist-sp-800-131a-r2-2019]

## CRC·체크섬과의 차이

RFC 4949에 따르면 [[cyclic-redundancy-check|CRC]]는 암호학적 해시가 아니라, 데이터가 우연히 바뀔 수 있는 곳에서 무결성을 확인하는 데 쓰는 [[checksum|체크섬]]이다. 체크섬은 데이터의 우연한 변경을 찾는 데 쓰고, 데이터를 바꾸는 능동 공격자는 붙은 체크섬도 바뀐 데이터에 맞춰 고칠 수 있어서 체크섬만으로는 능동 공격을 막지 못한다. 그래서 이 RFC는 체크섬 결과를 디지털 서명이나 키를 쓰는 해시로 보호하라고 한다.[@ietf-rfc-4949-2007]

NIST SP 800-57 Part 1 Rev. 5에 따르면 메시지의 특정 비트가 바뀌면 CRC-32 값도 예측할 수 있게 바뀌어서, 공격자는 이를 이용해 CRC-32 검사를 통과하는 변조 메시지를 만들 수 있다.[@nist-sp-800-57-pt1-r5-2020]

암호학적 해시 함수도 키가 없으므로, 키 없이 홀로 쓸 때의 한계는 [[message-authentication-code#해시만 쓸 때와의 차이|메시지 인증 코드]]에서 다룬다. NIST SP 800-175B Rev. 1은 해시 함수만으로 무결성을 보호하지 말기를 권한다. 데이터가 믿을 수 있는 출처에서 오고 해시 값으로 전송 매체의 열화만 찾는 경우처럼 위험이 매우 낮을 때만 예외로 둔다.[@nist-sp-800-175b-r1-2020]
