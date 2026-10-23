---
title: 타원 곡선 암호
tags:
  - security/cryptography
verified: 2026-10-22
---

**타원 곡선 암호**(elliptic curve cryptography)는 큰 유한체 위 타원 곡선의 점이 이루는 군을 [[public-key-cryptography|공개 키 암호]]에 쓴다.[@koblitz-elliptic-curve-1987] 타원 곡선 암호는 ECDSA(Elliptic Curve Digital Signature Algorithm) 같은 [[digital-signature|디지털 서명]]과 [[diffie-hellman-key-exchange|ECDH]](Elliptic Curve Diffie-Hellman) 같은 [[key-establishment#키 합의와 키 전송|키 합의]] 방식에 쓰인다.[@nist-sp-800-186-2023][@ietf-rfc-9846-2026]

## 곡선의 꼴

NIST SP 800-186에 따르면 타원 곡선은 예부터 흔히 short Weierstrass 꼴로 나타냈다. 그러나 Montgomery 곡선과 twisted Edwards 곡선처럼 다른 꼴로 나타낸 곡선도 여러 응용에 쓰이게 되었고, 이런 곡선은 더 나은 성능과 더 높은 부채널 저항을 줄 수 있다.[@nist-sp-800-186-2023]

## 권고 곡선

이 간행물은 권고 곡선마다 대략의 [[public-key-cryptography#보안 강도|보안 강도]]를 제시한다. 128비트 강도에는 P-256, W-25519, Curve25519, Edwards25519 등을 둔다.[@nist-sp-800-186-2023]

곡선마다 쓸 수 있는 용도도 정한다. P-224, P-256, P-384, P-521은 ECDSA와 타원 곡선 키 합의에, Edwards25519와 Edwards448은 EdDSA(Edwards Curve Digital Signature Algorithm)에 쓰게 한다. Curve25519와 W-25519는 Edwards25519를 각각 Montgomery 꼴과 short Weierstrass 꼴로 나타낸 곡선이다. 이 둘과 Curve448, E448, W-448은 구현의 유연성을 위해 넣은 다른 표현으로 두고, ECDSA나 EdDSA에 바로 쓰지 않게 한다.[@nist-sp-800-186-2023]

이 간행물은 자기가 정한 키 쌍을 디지털 서명 생성과 검증, 또는 키 합의에만 쓰고 [[key-management#용도와 cryptoperiod|다른 용도]]로는 쓰지 않기를 권한다.[@nist-sp-800-186-2023]
