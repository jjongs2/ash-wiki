---
title: 대칭키 암호
tags:
  - security
aliases:
  - 비밀키 암호
verified: 2026-10-03
---

**대칭키 암호**(symmetric-key cryptography)는 암호화와 복호화에 같은 비밀키를 쓰는 암호 방식이다. 대칭키는 그 키를 함께 쓰기로 한 쪽들만 나눠 갖고 비밀로 지킨다.[@iso-iec-18033-1-obp-2021] NIST SP 800-175B Rev. 1에 따르면 데이터를 계속 보호하려면 키를 비밀로 지켜야 한다.[@nist-sp-800-175b-r1-2020]

## 블록 암호와 스트림 암호

**블록 암호**(block cipher)는 정해진 길이의 평문 블록을 같은 길이의 암호문 블록으로 바꾸는 대칭 암호다.[@nist-fips-197-upd1-2023] 복호화는 같은 키로 암호화를 되돌린다.[@iso-iec-18033-1-obp-2021][@nist-sp-800-175b-r1-2020] FIPS 197-upd1은 블록 암호를 키를 매개변수로 하는 블록 순열의 모임으로 정의하고, 키가 그 가운데 순열 하나를 고르게 한다.[@nist-fips-197-upd1-2023] NIST SP 800-175B Rev. 1에 따르면 여러 블록으로 된 메시지를 블록마다 따로 암호화하면 블록을 바꿔치기하기 쉽고 반복 패턴이 드러나므로, 블록 암호는 [[block-cipher-mode-of-operation|운용 모드]]와 함께 쓴다.[@nist-sp-800-175b-r1-2020]

**스트림 암호**(stream cipher)는 평문 기호열과 키 스트림 기호열을 한 기호씩 결합해 암호화하는 대칭 암호다.[@iso-iec-18033-1-obp-2021][@ietf-rfc-4949-2007] ISO/IEC 18033-4:2011은 키 스트림을 비밀키와 초기화 벡터에서 만들게 하고, 자기 동기식 스트림 암호는 앞선 암호문도 쓰게 한다. 또 키 스트림을 비트 단위나 블록 단위로 평문과 결합하게 하고, 결합하는 출력 함수의 흔한 예로 비트별 XOR을 든다.[@iso-iec-18033-4-obp-2011]

## DES

**DES**(Data Encryption Standard)는 NBS(National Bureau of Standards)가 1977년 FIPS 46으로 발표한 블록 암호다.[@nist-fips-46-1977] NBS는 1974년 IBM이 제출한 알고리즘을 DES의 바탕으로 골랐다.[@nist-cyber-history-cryptography-2022] FIPS 46-3(1999)은 DES를 64비트 블록을 64비트 키로 암호화하는 블록 암호로 정하고, 그 키 가운데 56비트만 알고리즘이 쓰며 나머지 8비트는 오류 검출용 [[parity-bit|패리티]]로 두게 했다. NIST는 2005년 FIPS 46-3을 철회했다.[@nist-fips-46-3-1999]

NIST SP 800-67 Rev. 2는 **TDEA**(Triple Data Encryption Algorithm)를 DES의 연산을 암호화, 복호화, 암호화 순서로 세 번 거치고 64비트 블록에 키 세 개를 쓰는 블록 암호로 정했다.[@nist-sp-800-67-r2-2017] NIST는 TDEA를 Triple DES라고도 부른다. NIST SP 800-131A Rev. 2는 three-key TDEA 암호화를 2023년 12월 31일까지 deprecated로 두고, 그 뒤에는 다른 NIST 지침이 따로 허용하지 않으면 금지한다. 이미 암호화된 데이터의 복호화는 legacy use로 허용하고, two-key TDEA 암호화는 이미 금지한다.[@nist-sp-800-131a-r2-2019] NIST는 2024년 1월 1일 SP 800-67 Rev. 2를 철회했고, 이로써 TDEA는 승인된 블록 암호가 아니게 되어 이미 보호된 데이터를 복호화하는 등의 용도로만 쓸 수 있다.[@nist-sp-800-67-r2-2017]

## AES

**AES**(Advanced Encryption Standard)는 NIST가 1997년 후보 알고리즘을 공개 모집해 2000년에 고른 Rijndael을 바탕으로, 2001년 FIPS 197로 발표한 블록 암호다. FIPS 197-upd1은 Rijndael 가운데 세 가지인 AES-128, AES-192, AES-256을 AES로 정한다. 블록은 128비트이고 키는 128, 192, 256비트이며, 이름의 숫자가 키 길이다. Rijndael이 지원하는 다른 블록 길이와 키 길이는 AES에 들지 않았다.[@nist-fips-197-upd1-2023]

2001년판 FIPS 197은 2023년 5월 FIPS 197-upd1로 갱신됐다. FIPS 197-upd1은 앞부분, 용어와 기호의 정의, 조판, 키 스케줄 도해 같은 편집 사항만 고쳤고, 알고리즘의 기술 사양은 바꾸지 않았다.[@nist-fips-197-upd1-2023][@nist-fips-197-2001]

## 키 분배 문제

NIST SP 800-175B Rev. 1에 따르면 암호 알고리즘을 쓰기 전에 당사자 사이에 키를 먼저 갖춰 두어야 하고, 키는 믿을 만한 전달자를 통한 수동 방법이나 출처를 인증하는 자동 방법으로 둔다. 짝마다 다른 키를 쓰면 필요한 키가 짝의 수만큼 늘어, 개체 4개에는 키 6개, 개체 1,000개에는 499,500개가 필요하다.[@nist-sp-800-175b-r1-2020] 공개키 암호와의 비교는 [[public-key-cryptography|공개키 암호]]에서 다룬다.
