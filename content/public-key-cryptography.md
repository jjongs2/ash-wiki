---
title: 공개 키 암호
tags:
  - security/cryptography
aliases:
  - 비대칭키 암호
verified: 2026-10-03
---

**공개 키 암호**(public-key cryptography)는 사용자마다 공개하는 암호화 키인 **공개 키**(public key)와 비밀로 두는 복호화 키인 **개인 키**(private key)의 쌍을 쓰는 암호 방식이다. 공개 키는 누구에게나 알리고, 개인 키는 소유자만 비밀로 지닌다. 공개 키 암호는 거의 모든 키에 대해 공개 키로부터 개인 키를 계산해 내기가 계산상 불가능하도록 만든다.[@diffie-new-directions-1976] NIST SP 800-175B Rev. 1에 따르면 비대칭 키 알고리즘은 흔히 공개 키 알고리즘이라 불린다.[@nist-sp-800-175b-r1-2020]

## 기원

Diffie와 Hellman은 1976년 IEEE Transactions on Information Theory에 낸 논문 "New Directions in Cryptography"에서 공개 키 암호 시스템을 제안했다. 같은 논문에서 두 사용자가 공개된 채널로만 값을 주고받아 공유 비밀 키를 정하는 [[diffie-hellman-key-exchange|공개 키 분배 방법]]도 제안했다.[@diffie-new-directions-1976]

Rivest, Shamir, Adleman은 1977년 4월 MIT(Massachusetts Institute of Technology) 기술 보고서 MIT/LCS/TM-82로 공개 키 암호 방식을 먼저 내고[@rivest-digital-signatures-1977], 1978년 Communications of the ACM에 논문 "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems"로 발표했다. 이 방식의 안전성은 일부, 공개된 법 $n$을 소인수분해하기 어렵다는 데 기댄다. $n$은 큰 두 비밀 소수 $p$와 $q$의 곱이다.[@rivest-digital-signatures-1978] NIST SP 800-175B Rev. 1에 따르면 RSA(Rivest-Shamir-Adleman)는 Rivest, Shamir, Adleman이 만든 것으로 알려진 공개 키 알고리즘이다.[@nist-sp-800-175b-r1-2020]

Miller는 CRYPTO '85에서 발표하고 1986년 논문집에 실린 논문 "Use of Elliptic Curves in Cryptography"에서 타원 곡선을 암호에 쓰는 방법을 다루고, 타원 곡선판 Diffie-Hellman 키 교환을 제안했다.[@miller-elliptic-curves-1986] Koblitz는 1987년 Mathematics of Computation에 낸 논문 "Elliptic Curve Cryptosystems"에서 유한체 위 타원 곡선에 기반한 공개 키 암호 시스템을 제안했다. **타원 곡선 암호**(elliptic curve cryptography)는 큰 유한체 위 타원 곡선의 점이 이루는 군을 공개 키 암호에 쓴다.[@koblitz-elliptic-curve-1987]

## 쓰임

- 암호화: 송신자가 수신자의 공개 키로 암호화하고, 수신자가 자기 개인 키로 복호화한다.
- [[digital-signature|디지털 서명]]: 서명자가 자기 개인 키로 메시지를 변환하고, 누구나 서명자의 공개 키로 그 결과를 검증한다. 이 꼴은 암호화와 복호화가 서로의 역인 공개 키 암호 시스템을 전제한다.[@diffie-new-directions-1976]
- [[key-establishment|키 설정]]: NIST SP 800-175B Rev. 1에 따르면 공개 키 알고리즘은 키 전송과 키 합의로 키를 설정하는 데 쓰인다.[@nist-sp-800-175b-r1-2020]

![[diagrams/symmetric-public-key-encryption.svg]]

공개 키 알고리즘으로 [[symmetric-key-cryptography|대칭 키]]를 정한 뒤 그 대칭 키로 데이터를 암호화하는 혼합 방식을 흔히 쓴다.[@nist-sp-800-175b-r1-2020]

## 공개 키를 믿게 하는 수단

NIST SP 800-57 Part 1 Rev. 5는 공개 키를 배포할 때, 받는 쪽이 키의 소유자로 주장된 쪽이 실제 소유자임을 확신할 수 있게 하기를 권한다. 익명이 허용되는 경우는 예외다.[@nist-sp-800-57-pt1-r5-2020] 디지털 서명에서 검증자가 서명자가 그 키 쌍의 실제 소유자라는 보증을 얻지 못하면, 수학적으로 맞는 키 쌍을 가진 누구나 메시지에 서명하고 다른 사람을 서명자로 내세울 수 있어서, 서명 위조는 신원을 거짓으로 주장하는 일로 줄어든다.[@nist-fips-186-5-2023] NIST SP 800-175B Rev. 1에 따르면 공개 키는 흔히 공개 키 인증서로 배포된다. **공개 키 인증서**(public key certificate)는 개체를 식별하고 그 공개 키를 담으며, 믿을 수 있는 쪽이 디지털 서명해 공개 키를 그 개체에 묶는 데이터로, 공개 키의 무결성을 보호한다.[@nist-sp-800-175b-r1-2020]

## 대칭 키 암호와의 차이

대칭 키 암호와 공개 키 암호는 아래처럼 다르다. 속도와 키 길이 행은 NIST SP 800-175B Rev. 1을 따른다.

| 항목         | 대칭 키 암호                                                                      | 공개 키 암호                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 키 공유      | 통신하는 양쪽이 같은 비밀 키를 미리 안전한 채널로 나눠 가져야 한다.               | 수신자가 공개 키만 알리면 되어, 연락한 적 없는 두 사람도 비밀 키를 미리 나누지 않고 비밀 통신을 할 수 있다.[@diffie-new-directions-1976] |
| 속도         | 빠르다.                                                                           | 훨씬 느려서 많은 데이터를 처리하는 데는 쓰지 않는다.[@nist-sp-800-175b-r1-2020]                                                          |
| 키 길이      | 같은 보안 강도에서 더 짧다.                                                       | 같은 보안 강도에서 더 길다.[@nist-sp-800-175b-r1-2020]                                                                                   |
| 관리할 키 수 | 사용자 $n$명이 저마다 따로 비밀 통신하려면 짝마다 하나씩 $n(n-1)/2$개가 필요하다. | 사람마다 키 쌍 하나씩 $n$쌍이면 된다.[@diffie-new-directions-1976]                                                                       |

NIST SP 800-57 Part 1 Rev. 5는 128비트 보안 강도에 128비트 키의 [[symmetric-key-cryptography#AES|AES]], 3072비트 RSA, 256~383비트 타원 곡선 암호를 대응시킨다.[@nist-sp-800-57-pt1-r5-2020]
