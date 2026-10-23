---
title: Diffie-Hellman 키 교환
tags:
  - security/cryptography
aliases:
  - Diffie-Hellman
verified: 2026-10-03
---

**Diffie-Hellman 키 교환**은 미리 비밀을 나누지 않은 두 당사자가 공개된 채널로 값을 주고받아 공통의 키를 얻는 방법이다. 도청자는 들은 값만으로 그 키를 계산하기 어렵다.[@diffie-new-directions-1976] Diffie-Hellman은 두 당사자가 공유 비밀에 합의하는 [[key-establishment|키 합의]] 알고리즘이다.[@ietf-rfc-2631-1999] Diffie와 Hellman은 1976년 논문에서 이 방법을 제안했다.[@diffie-new-directions-1976]

## 절차

Diffie와 Hellman의 방식에서 사용자들은 소수 $p$와, $p$를 법으로 하는 원시원소 $g$를 고정된 공개 매개변수로 함께 쓴다. 각 사용자는 $1 \le x \le p-1$인 비밀 정수 $x$를 골라, $g$를 그 수만큼 거듭제곱한 값을 $p$를 법으로 공개한다. 사용자 A와 B가 고른 비밀 정수를 $x_A$, $x_B$라 하면, A는 B의 공개값을 $x_A$제곱하고 B는 A의 공개값을 $x_B$제곱해 둘 다 같은 값 $g^{x_A x_B} \bmod p$를 얻는다.[@diffie-new-directions-1976]

![[diagrams/diffie-hellman-exchange.svg]]

NIST SP 800-56A Rev. 3의 dhEphem 방식은 이 교환을 두 당사자가 값을 서로 보내는 꼴로 정한다. 각 당사자는 [[key-establishment#정적 키, 임시 키, 세션 키|임시 키 쌍]]을 만들어 [[public-key-cryptography|공개 키]]를 상대에게 보내고, 자기 개인 키와 상대 공개 키로 Diffie-Hellman 원시 연산을 해서 공유 비밀 $Z$를 얻는다. 이 권고는 이렇게 얻은 공유 비밀을 승인된 [[key-derivation-function|키 유도]] 방법의 입력으로만 쓰고, 다른 용도로는 쓰지 않게 한다.[@nist-sp-800-56a-r3-2018]

## 안전성

도청자는 $p$, $g$와 두 공개값을 모두 볼 수 있다. $p$를 법으로 하는 이산 로그를 쉽게 계산할 수 있으면, 도청자는 공개값에서 비밀 정수를 구해 키를 계산하므로 이 방식은 깨진다. Diffie와 Hellman은 비밀 정수를 먼저 구하지 않고 공유된 값을 계산하는 길을 찾지 못했지만, 이산 로그가 어려우면 안전하다는 역은 증명하지 않았다. 그들은 알맞게 고른 $p$에서는 알려진 가장 좋은 로그 계산 알고리즘이 최적에 가깝다고 가정하고, 이 방식의 안전성을 이산 로그 계산의 어려움에 기댔다.[@diffie-new-directions-1976]

## 유한체와 타원 곡선

NIST SP 800-56A Rev. 3은 Diffie-Hellman 원시 연산을 둘 둔다.[@nist-sp-800-56a-r3-2018]

- FFC(Finite Field Cryptography) DH(Diffie-Hellman): 도메인 매개변수 $(p, q, g)$를 쓰고, 상대 공개 키를 자기 개인 키로 거듭제곱해 $p$를 법으로 공유 비밀을 계산한다. 여기서 $g$는 위수가 $q$인 부분군의 생성원이다.
- [[elliptic-curve-cryptography|타원 곡선]] CDH(Cofactor Diffie-Hellman): 상대 공개 키인 타원 곡선 위의 점에 cofactor $h$와 자기 개인 키를 곱한 점 $P$를 구하고, $P$의 x좌표를 공유 비밀로 쓴다.[@nist-sp-800-56a-r3-2018]

이 권고는 키 합의 방식을 두 당사자가 쓰는 임시 키 쌍의 수에 따라 C(2e), C(1e), C(0e)로 나누고, 정적 키 쌍의 수로 다시 C(2e, 2s) 같은 하위 갈래로 나눈다. 두 당사자가 모두 임시 키 쌍을 쓰는 C(2e) 방식은 두 당사자 모두에게 [[key-establishment#안전성 성질|forward secrecy]]를 준다.[@nist-sp-800-56a-r3-2018]

## 중간자 공격

NIST 용어집은 통신하는 두 당사자 사이에 자리 잡고 오가는 데이터를 가로채거나 바꾸는 공격을 중간자 공격(man-in-the-middle attack)이라 정의한다.[@nist-glossary-man-in-the-middle-attack-2026]

RFC 4949에 따르면 두 당사자가 서로를 인증하는 장치 없이 Diffie-Hellman으로 [[key-establishment#정적 키, 임시 키, 세션 키|세션 키]]를 설정하면 중간자 공격에 당할 수 있다. 중간자는 양쪽과 따로 세션 키를 설정한 뒤, 숨은 프록시가 되어 둘이 서로에게만 보낸다고 여기는 정보를 가로채거나 바꾼다.[@ietf-rfc-4949-2007]

SP 800-56A Rev. 3은 임시 키 쌍만 쓰는 C(2e, 0s) 방식이 그것만으로는 상대가 누구인지 보증하지 않으므로, 임시 공개 키와 신원의 연결을 방식 밖에서, 예를 들어 그 방식을 쓰는 프로토콜에서 보장하게 한다. 이 권고의 방식 가운데 암묵적 키 인증을 주는 것은 정적 키 쌍을 쓰는 방식뿐이다.[@nist-sp-800-56a-r3-2018]

인증을 키 교환과 떼어 [[digital-signature|서명]]이 지수값과 상관없는 값에만 걸리면, 중간자 공격이 성립한다. 공격자는 오가는 지수값을 자기 것으로 바꿔 A와는 키 $K_A$를, B와는 키 $K_B$를 공유하고, 한 키로 복호한 메시지를 다른 키로 다시 암호화해 넘긴다. A와 B는 서로를 받아들이지만, 실제로 키를 나눈 상대는 공격자다.[@diffie-authenticated-key-exchanges-1992]

![[diagrams/diffie-hellman-man-in-the-middle.svg]]

## STS 프로토콜

**STS**(Station-to-Station) 프로토콜은 Diffie-Hellman 키 설정 뒤에 인증 서명을 주고받는 프로토콜이다. Diffie, van Oorschot, Wiener는 1992년 논문에서 STS를 자세히 다뤘다. 이른 판은 1987년에 발표했고, 1989년에 이 논문이 다루는 꼴이 됐다. [[public-key-infrastructure#공개 키 인증서|인증서]]를 쓰는 STS의 절차는 아래와 같다.[@diffie-authenticated-key-exchanges-1992]

1. A는 임의의 $x$를 골라 $g^x$를, 자기가 쓰는 Diffie-Hellman 매개변수 $g$, $p$와 함께 B에게 보낸다.
2. B는 임의의 $y$로 $g^y$를 만들고 공유 키 $K = (g^x)^y$를 계산한다. B는 $g^y$와 자기 인증서, 그리고 $(g^y, g^x)$에 대한 자기 서명을 $K$로 암호화한 것을 보낸다.
3. A는 $K$를 계산해 받은 서명을 복호하고, B의 인증서에서 꺼낸 B의 공개 키로 서명을 검증한다. A는 자기 인증서와, $(g^x, g^y)$에 대한 자기 서명을 $K$로 암호화한 것을 보낸다.
4. B는 $K$와 A의 공개 키로 A의 서명을 검증하고, 1단계에서 받은 매개변수가 A의 인증서에 든 매개변수와 같은지 확인한다.[@diffie-authenticated-key-exchanges-1992]

서명은 이번 실행의 두 지수값에 걸리므로 그 실행에 묶인다. 서명을 $K$로 암호화해 보내면, 서명한 쪽이 지수를 만들어 $K$를 아는 당사자임을 보인다. 이 보증은 받는 쪽이 상대의 진짜 공개 키를 안다는 가정 아래에서 성립한다. 원 논문은 이 가정에 더해 바탕이 되는 개별 암호 메커니즘이 깨지지 않는다고 보고, 프로토콜 자체에 대한 공격만 따진다.[@diffie-authenticated-key-exchanges-1992]
