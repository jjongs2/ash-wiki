---
title: V2X 보안
tags:
  - network/v2x
  - security/cryptography
verified: 2026-11-21
---

ETSI TS 102 940 V2.1.1은 ITS(Intelligent Transport Systems) 통신의 보안 구조를 정하고, 그 안에서 식별자·인증서 관리, [[public-key-infrastructure|PKI]] 절차와 인터페이스, 신뢰 수립의 기본 정책을 다룬다.[@etsi-ts-102-940-2021]

ETSI TS 102 941 V2.2.1은 [[cooperative-awareness-message|CAM]]과 [[decentralized-environmental-notification-message|DENM]] 같은 방송 응용에 기밀성 없이 인증, 인가, 무결성을 요구하고, 송신자가 AT(Authorization Ticket)로 서명해 이를 얻도록 정한다. 이 명세는 ITS 안전 메시지에 임시 식별자를 써 가명성을 주도록 하고, PKI 기관의 역할을 ITS-S(ITS Station)의 고유 식별자를 확인하는 EA(Enrolment Authority)와 서비스를 인가하고 관리하는 AA(Authorization Authority)로 나눈다.[@etsi-ts-102-941-2022]

ETSI TS 103 097 V2.2.1은 보안 헤더와 인증서 형식을 [[ieee-1609|IEEE 1609.2-2025]]를 기본 표준으로 삼는 프로파일로 정한다.[@etsi-ts-103-097-2026]

## 보안 구조

ETSI EN 302 665 V1.1.1은 ITS station 참조 구조에 보안 개체를 두고, 그 개체가 방화벽·침입 관리, 인증·인가와 프로파일 관리, 식별자·암호 키·인증서 관리, [[hardware-security-module|HSM]] 같은 보안 기능을 담도록 한다.[@etsi-en-302-665-2010]

ETSI TS 102 940 V2.1.1은 ITS-S의 보안 방어 계층이 misbehaviour detection 기능을 담도록 요구한다. 보안 방어 계층은 시스템의 중요한 자산과 데이터에 대한 직접 공격을 막고, 공격자가 드러날 가능성을 높인다. 이 명세는 키 저장과 암호 기능을 보안 모듈, 되도록 tamper-resistant 하드웨어에 모아 키 재료를 지키고, 적절한 인가 아래 다른 응용과 보안 서비스에 암호 연산을 서비스로 주기를 권한다. 이 보안 모듈이 HSM이다.[@etsi-ts-102-940-2021]

## PKI 개체

PKI의 기능 요소와 그 역할은 다음과 같다.[@etsi-ts-102-940-2021]

| 개체                                  | 역할                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Root CA(Root Certification Authority) | 인증 계층의 맨 위에 있는 CA로, EA와 AA에 각각 등록 인증서와 AT를 발급할 수 있다는 증명을 준다.        |
| EA                                    | 등록 인증서의 생명주기를 관리하는 보안 관리 개체로, ITS-S를 인증해 ITS 통신에 접근하게 한다.          |
| AA                                    | AT를 발급하고 그 쓰임을 지켜보는 보안 관리 개체로, ITS-S에 특정 ITS 서비스를 써도 된다는 증명을 준다. |
| MA(Misbehaviour Authority)            | misbehaviour 보고를 처리하고, misbehaviour가 의심되는 ITS-S를 조사해 대응한다.                        |

Root CA는 늘 오프라인으로 쓰고 어떤 네트워크에도 잇지 않는다. 신뢰 영역에 root CA가 여럿 있어 서로 협력하면 보안 관리 시스템은 Certificate Trust List 방식을 따르고, 유럽에서는 최상위 관리 역할을 C-ITS(Cooperative Intelligent Transport Systems) Platform의 인증서 정책 문서가 정한다.[@etsi-ts-102-940-2021]

최상위 신뢰 관리에서 TLM(Trust List Manager)은 root CA 인증서와 TLM 인증서의 목록을 만들어 서명한다. CPOC(C-ITS Point Of Contact)는 root CA 인증서를 모아 TLM에 건네고, TLM이 서명한 목록을 관심 있는 개체에 배포한다. TLM이 서명한 이 목록을 **ECTL**(European Certificate Trust List)이라 부른다.[@etsi-ts-102-940-2021][@etsi-ts-102-941-2022]

![[diagrams/v2x-pki-entities.svg]]

## ITS-S 생명주기

ETSI TS 102 941 V2.2.1은 ITS-S 보안 생명주기를 제조 때의 초기 설정, 등록(enrolment), 인가(authorization), 운영과 유지, 수명 끝(end of life)의 단계로 둔다.[@etsi-ts-102-941-2022]

ETSI TS 102 940 V2.1.1은 초기화 과정에서 ITS-S에 고유 식별자와 함께 넣는 자격 증명, 곧 적어도 공개 키와 개인 키의 쌍을 마련하는 두 방법을 제시한다. 하나는 ITS-S의 보안 모듈(HSM) 안에서 키 쌍을 만들어 제조사에 안전하게 알리는 것이고, 다른 하나는 제조사가 제조 시스템에서 키 쌍을 만들어 안전한 채널로 ITS-S에 넣은 뒤 제조 시스템에서 지우는 것이다.[@etsi-ts-102-940-2021]

## 가명과 AT

CAM은 모든 ITS-S가 초당 여러 번까지 주기적으로 보내고 위치 같은 상태 정보를 담으므로, 그 데이터가 어떤 개인과도 이어지지 않게 해야 한다.[@etsi-ts-102-940-2021]

이 명세는 ITS-S의 프라이버시를 지키도록 AA가 ITS-S의 장기 신원인 등록 인증서를 알지 못하게 하고, EA가 단기 신원인 AT를 장기 신원에 잇지 못하게 한다. AA는 ITS-S에 수명 동안 쓸 AT, 곧 가명 인증서를 여럿 준다.[@etsi-ts-102-940-2021]

프라이버시가 필요한 ITS-S는 가명 인증서를 자주 바꾸는 수단을 두어야 한다. AT를 바꿔도 모든 식별자를 함께 바꿔야 연결 불가능한 가명성이 되므로, 통신 스택의 모든 계층에서 ITS-S에 묶인 식별자를 AT와 함께 바꾼다. CAM과 DENM의 통신 프로파일에서는 [[mac-address|MAC 주소]], [[v2x#GeoNetworking과 BTP|GeoNetworking]] 주소, stationID 같은 계층의 식별자를 보안 개체가 알려 주는 AT의 해시(HashedID8)에서 끌어내고, 더 짧은 식별자를 쓰는 계층은 그 하위 비트를 쓴다.[@etsi-ts-102-940-2021]

ETSI TS 102 941 V2.2.1은 ITS가 안전을 위해 ITS-S를 관찰할 수 있어야 하므로 익명성만으로는 ITS 사용자의 프라이버시를 지키기에 모자라다고 보고, 가명성(pseudonymity)과 연결 불가능성(unlinkability)을 기본 안전 메시지 송신자의 알맞은 보호로 둔다. **가명성**은 ITS-S가 신원을 드러내지 않고 자원이나 서비스를 쓰되 그 쓰임에 책임은 지는 것이고, **연결 불가능성**은 남이 한 ITS-S의 여러 쓰임을 서로 잇지 못하는 것이다.[@etsi-ts-102-941-2022]

## Butterfly key

이 명세는 IEEE 1609.2.1의 방식에 바탕한 butterfly key 방식을 AT 공급의 다른 방법으로 둔다. 가명이 필요한 차량에 AT를 많이 공급할 때, 이 방식에서는 ITS-S가 요청을 한 번만 보내면 PKI가 그 요청을 펼쳐 여러 AT를 발급하고, ITS-S는 그 AT들을 비동기로 내려받는다.[@etsi-ts-102-941-2022]

## 폐지

이 명세는 ITS-S 상태도가 AT [[public-key-infrastructure#폐지|폐지]]를 할 수 없다고 가정한다고 제시한다. passive revocation을 더 낫게 보기 때문으로, 이 방식에서 ITS-S는 유효 기간과 미리 받아 둘 수 있는 기간이 제한된 AT를 받아 자주 새로 받고, 침해된 ITS-S는 새 AT를 받지 못해 ITS 네트워크에서 밀려난다. 이 명세는 수명이 다했거나 침해된 ITS-S를 passive revocation으로 폐지하기를 권하고, 그 방식으로 EA가 그 ITS-S의 다음 AT 요청을 모두 거절하도록 정한다.[@etsi-ts-102-941-2022]

ETSI TS 103 097 V2.2.1은 인증서의 유효성을 판단할 때 EA·AA 인증서에는 Hash ID 기반 폐지 방법을 쓰고, AT와 등록 인증서에는 폐지 방법을 두지 않는다.[@etsi-ts-103-097-2026]

## 메시지·인증서 형식

이 명세는 데이터 구조를 ITU-T X.696의 COER(Canonical Octet Encoding Rules)로 인코딩하도록 정한다. 승인한 알고리즘은 서명에 [[elliptic-curve-cryptography|타원 곡선 암호]]의 ECDSA(Elliptic Curve Digital Signature Algorithm), 해시에 [[cryptographic-hash-function#SHA 계열|SHA-256]]과 SHA-384, [[public-key-cryptography|공개 키 암호]]화에 ECIES(Elliptic Curve Integrated Encryption Scheme), 대칭 암호화에 128비트 키의 [[symmetric-key-cryptography#AES|AES]]다.[@etsi-ts-103-097-2026]

CAM 보안 프로파일에서 서명자(signer)는 기본으로 인증서 digest를 넣고, 인증서 전체는 마지막으로 넣은 때부터 1초가 지나면 다시 한 번 넣는다. DENM 보안 프로파일에서 서명자는 늘 인증서다.[@etsi-ts-103-097-2026]

이 명세는 explicit 인증서에 더해 implicit 인증서도 쓸 수 있게 해, 보안 데이터 구조를 보내는 쪽은 앞 판과 호환되지만 받는 쪽은 상호 운용을 위해 implicit 인증서도 구현해야 한다. 앞 판들이 implicit 인증서를 허용하지 않았다는 것도 제시한다.[@etsi-ts-103-097-2026]

## 쓰는 곳

NHTSA는 2017년 차량 간 통신을 의무로 두자는 제안 규칙에서, Security Credential Management System에 바탕한 PKI [[digital-signature|디지털 서명]]으로 basic safety message를 서명하고 검증하는 메시지 인증 방식을 의무로 두자고 제안했다.[@nhtsa-v2v-nprm-2017]

NXP SXF1800은 IEEE 1609.2와 ETSI TS 103 097에 따른 암호 서비스를 주는 [[v2x|V2X]] secure element다.[@nxp-sxf1800-2026] NXP SAF5400은 초당 메시지 2000개까지 ECDSA 서명을 검증한다.[@nxp-saf5400-2026]
