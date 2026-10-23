---
title: AUTOSAR 암호 스택
tags:
  - platform/autosar
  - security/cryptography
verified: 2026-10-07
---

**AUTOSAR 암호 스택**은 [[autosar-classic-platform|AUTOSAR Classic Platform]]의 BSW(Basic Software) 가운데 암호 기능을 주는 모듈들로, 맨 아래 [[microcontroller-abstraction-layer|MCAL]]의 Crypto Driver, 그 위 Crypto Hardware Abstraction 층의 CryIf(Crypto Interface), 다시 그 위 서비스 층의 Csm(Crypto Service Manager)으로 쌓인다.[@autosar-cp-sws-cryptodriver-2025] AUTOSAR R25-11의 BSW 일반 명세는 Csm, KeyM(Key Manager), [[intrusion-detection-system-manager|IdsM]]을 Crypto Services 층에, CryIf를 Crypto Hardware Abstraction 층에, Crypto Driver를 Crypto Drivers 층에 둔다.[@autosar-cp-sws-bswgeneral-2025]

## Crypto Service Manager

Csm은 암호 서비스와 [[key-management|키 관리]] 두 서비스를 준다. Csm은 모든 소프트웨어 모듈이 기본 암호 기능에 한결같은 방식으로 접근하게 하는 추상화 층으로, 위 소프트웨어 층에 표준 인터페이스를 준다. 서비스는 동기나 비동기로 주고, 쓰는 모듈마다 따로 설정하고 초기화한다. 다만 동기와 비동기 가운데 어느 쪽으로 처리할지는 아래에서 다루는 job마다 설정한다. 암호 서비스는 `Csm_<Service>` 꼴의 API로 부른다.[@autosar-cp-sws-cryptoservicemanager-2025]

Csm이 처리하는 단위를 **job**이라 하며, job은 설정한 암호 primitive의 인스턴스다. Job은 키, 암호 primitive, 채널을 가리킨다. **채널**은 Csm의 큐에서 CryIf를 거쳐 특정 Crypto Driver Object에 이르는 경로다. Csm은 서로 다른 job을 나란히 처리할 수 있지만, 같은 job을 동시에 두 번 처리하지는 않는다. Job을 큐에 넣어야 하는데 큐가 차 있으면 요청을 CRYPTO_E_BUSY로 거절한다.[@autosar-cp-sws-cryptoservicemanager-2025]

동기 인터페이스를 쓰면 함수가 아래 암호 스택 모듈의 도움으로 결과를 바로 계산한다. 비동기 인터페이스를 쓰면 함수는 필요한 정보만 아래로 넘기고, 처리가 끝나면 job 설정의 콜백으로 사용자에게 알린다. 비동기 인터페이스를 설정하면 Csm은 주기적으로 불리는 `Csm_MainFunction`에서 상태 기계로 job 처리를 다룬다.[@autosar-cp-sws-cryptoservicemanager-2025]

암호 연산은 START, UPDATE, FINISH 세 operation mode로 나눠 부를 수 있고, 한 번 부를 때 여러 mode를 함께 줄 수도 있다. START, UPDATE, FINISH로 나눠 데이터를 흘려 넣는 동안에는 그 Crypto Driver Object가 FINISH까지 입력을 기다리므로, 그 사이 다른 job을 처리하지 못한다.[@autosar-cp-sws-cryptoservicemanager-2025]

[[ieee-802-1ae|MACsec]] 키 합의를 맡는 MKA(MACsec Key Agreement) 모듈은 [[key-derivation-function|키를 유도]]하고 MKA 메시지의 무결성 검사 값을 만들고 검증하는 데 Csm의 암호 서비스를 쓴다.[@autosar-cp-sws-macseckeyagreement-2025] [[secure-onboard-communication|SecOC]]도 Csm의 암호 서비스를 쓴다.[@autosar-cp-sws-secureonboardcommunication-2025]

## Crypto Interface와 Crypto Driver

**CryIf**는 Csm과 그 아래의 Crypto Driver·소프트웨어 기반 CDD(Complex Driver) 사이에 놓여 Csm에 Crypto Driver의 서비스를 내놓는 인터페이스다. CryIf는 [[hardware-security-module|HSM]], SHE(Secure Hardware Extension), 소프트웨어 기반 CDD 같은 여러 암호 하드웨어·소프트웨어 해법을 한 인터페이스로 다루고, 그 사이의 매핑을 관리해 Csm이 칩 안팎의 여러 해법을 쓸 수 있게 한다. CryIf는 Csm을 거쳐 오는 위 BSW의 암호 연산 요청이 지나는 유일한 인터페이스이자 Crypto Driver의 유일한 사용자다. 하드웨어 접근과 소프트웨어 접근의 차이를 감싸므로, CryIf의 구현은 Crypto Driver가 하드웨어로 구현되든 소프트웨어로 구현되든 그에 매이지 않는다.[@autosar-cp-sws-cryptointerface-2025]

**Crypto Driver**는 특정 장치를 위한 드라이버다. Crypto Driver에는 동시에 들어온 요청을 따로 처리할 **Crypto Driver Object**(예: [[symmetric-key-cryptography#AES|AES]] 가속기, 소프트웨어 컴포넌트)를 여럿 둘 수 있고, 하드웨어 객체마다 우선순위에 따라 job을 처리한다. 소프트웨어로 만든 암호 해법(소프트웨어 기반 CDD)도 위 층과 주고받는 인터페이스를 Crypto Driver와 똑같이 둘 수 있다. Crypto Driver Object는 암호 primitive를 하드웨어로도 소프트웨어로도 줄 수 있고, 한 Crypto Driver의 Crypto Driver Object는 기본 [[random-bit-generator|난수 생성기]]를 함께 쓰는 것 말고는 서로 독립이다. Crypto Driver Object마다 작업 공간이 하나뿐이어서, 한 번에 암호 primitive 하나만 수행한다.[@autosar-cp-sws-cryptodriver-2025]

![[diagrams/autosar-crypto-stack-channel.svg]]

## Key Manager

KeyM은 암호 키 하위 모듈과 인증서 하위 모듈로 나뉜다. 암호 키 하위 모듈은 미리 정한 키 자료를 들이거나 갱신하는 API와 설정 항목을 준다. 이 하위 모듈은 키 클라이언트로서 키 서버가 준 데이터를 해석해 키 자료를 만들고, 그 키를 Csm에 넘긴다. 그래서 OEM은 양산이나 정비 단계에 응용과 따로 [[electronic-control-unit|ECU]]에 키 자료를 넣을 수 있다. 인증서 하위 모듈은 인증서 슬롯을 정하고 [[public-key-infrastructure|PKI]]처럼 계층으로 엮게 한다. 루트 인증서나 중간 인증서를 영구 저장해 두고 주어진 인증서를 인증서 체인으로 검증할 수 있고, 인증서의 요소에 접근하거나 내용을 검증할 수도 있다. KeyM 명세는 차량의 암호 키·인증서 관리 API의 골격을 주며, 모든 기능을 다 정하지는 않았다.[@autosar-cp-sws-keymanager-2025]

## Adaptive Platform의 Cryptography

AUTOSAR R25-11의 [[autosar-adaptive-platform|Adaptive Platform]] Cryptography 명세는 Cryptography functional cluster인 FC(Functional Cluster) Crypto가 응용과 다른 functional cluster에 암호 연산, 키 관리, 인증서 처리의 표준 인터페이스를 주도록 정한다. 이 인터페이스를 **CryptoAPI**라 하며, FC Crypto는 연산의 실제 구현, 설정, 응용과 구현 사이의 중개를 맡는다. FC Crypto는 암호 primitive를 Crypto Provider로, 인증서 관리를 X.509 Certificate Management Provider(CMP)로 내놓는다. SecOC나 [[transport-layer-security|TLS]] 같은 보안 통신, 서비스 `0x29`를 쓰는 인증 진단, 안전한 소프트웨어 업데이트 같은 쓰임새도 지원한다.[@autosar-ap-sws-cryptography-2025] [[autosar-diagnostic-management|Diagnostic Management]]는 설정에 따라 UDS의 [[uds#서비스|Authentication 서비스]](`0x29`)를 제공한다.[@autosar-ap-sws-diagnostics-2025]

Crypto Provider는 암호 primitive 구현 한 벌과 키 저장소에 접근하게 하는 래퍼다. 한 Machine에 Crypto Provider를 여럿 둘 수 있지만 서로 호환되지 않아, 한 Crypto Provider의 대칭 키를 다른 Crypto Provider의 암호화에 쓸 수 없다. 키는 저마다 정확히 한 Crypto Provider가 관리하고, 응용은 배치 때 한 Crypto Provider에 정적으로 매핑된 KeySlot으로 저장된 키에 접근한다. Crypto Provider와 달리 CMP는 Machine 하나에 하나만 둔다.[@autosar-ap-sws-cryptography-2025]

CMP는 X.509 인증서의 구문 분석, 검증, 저장, 속성별 검색을 맡고, [[public-key-infrastructure#폐지|CRL]]과 Delta CRL의 저장·관리·처리도 맡는다. Adaptive Platform의 암호 API는 보안상 민감한 연산과 결정을 HSM 같은 별도 구성 요소에 맡길 수 있게 설계됐다. 키를 특정 용도(예: 복호 전용)로 묶거나, [[autosar-identity-and-access-management|IAM]]이 알려 주는 대로 개별 응용에만 쓰게 해 키와 키 사용을 더 보호할 수도 있다.[@autosar-ap-exp-platformdesign-2025]

AUTOSAR Adaptive Platform R25-11은 Crypto Rework 개념을 새로 들였다. 이 개념은 사용법을 단순하게 하고 알고리즘 식별자를 표준화했으며, HSM의 제약을 반영하고, X.509 인증서의 검증과 관리를 더 유연하게 했고, [[dynamic-memory-allocation|동적 메모리 할당]]을 줄여 성능을 높였다.[@autosar-ap-tr-releaseoverview-2025]
