---
title: Secure Onboard Communication
tags:
  - platform/autosar
aliases:
  - SecOC
verified: 2026-10-07
---

**Secure Onboard Communication**(SecOC)는 [[autosar|AUTOSAR]]가 정한, 차량 안 ECU 사이의 PDU(Protocol Data Unit) 기반 통신에서 데이터의 authenticity와 신선도(freshness)를 검증하는 메커니즘이다. 받은 데이터가 맞는 ECU에서 왔고 값이 바른지를 보장해, 차량 시스템이 바르고 안전하게 동작하도록 지킨다. AUTOSAR R25-11의 SecOC 프로토콜 명세는 보내는 ECU와 받는 ECU가 모두 SecOC 모듈을 갖추도록 정한다.[@autosar-fo-prs-secocprotocol-2025]

SecOC 프로토콜은 자원을 적게 쓰는 인증 메커니즘을 PDU 수준에서 주고, 기존 AUTOSAR 통신 시스템에 매끄럽게 넣어 기존 시스템에 덧붙이는 보호로도 쓸 수 있게 하는 것을 목표로 둔다. SecOC 프로토콜은 주로 [[message-authentication-code|MAC]]을 쓰는 대칭 방식을 전제한다. 대칭 방식은 비대칭 방식보다 훨씬 짧은 키로 같은 보안 수준을 얻고 소프트웨어와 하드웨어에서 작고 효율적으로 구현할 수 있기 때문이다. 그러면서도 비대칭 방식도 쓸 수 있도록 추상화한다. 비대칭 방식에서는 MAC 대신 [[digital-signature|디지털 서명]]을 쓰고, 수신자가 서명 전체를 받아야 검증할 수 있으므로 서명을 잘라 실을 수 없다.[@autosar-fo-prs-secocprotocol-2025]

## Secured I-PDU

AUTOSAR [[autosar-classic-platform|Classic Platform]] R25-11의 SecOC 명세는 무단 조작과 재전송 공격에서 지킬 I-PDU(Interaction Layer Protocol Data Unit)를 **Authentic I-PDU**라 하고, Authentic I-PDU의 페이로드에 인증 정보를 덧붙인 I-PDU를 **Secured I-PDU**라 한다. 인증 정보는 Authenticator와, 선택적으로 Freshness Value로 이루어진다. Authenticator는 대칭 방식에서는 MAC, 비대칭 방식에서는 디지털 서명이다.[@autosar-cp-sws-secureonboardcommunication-2025]

송신 측 SecOC는 나가는 Authentic I-PDU에 인증 정보를 붙여 Secured I-PDU를 만든다. Freshness Value를 Secured I-PDU에 싣든 싣지 않든 Authenticator를 만들 때는 반영한다. Authenticator는 키로 Secured I-PDU의 Data Identifier, Authentic I-PDU의 보호할 부분, 완전한 Freshness Value를 이어 붙인 데이터를 계산해 얻는다. 수신 측 SecOC는 송신 측이 붙인 인증 정보를 검증해 Authentic I-PDU의 authenticity와 신선도를 확인한다. 그러려면 수신 측이 송신 측이 만든 Secured I-PDU를 그대로 받고, 송신 측이 Authenticator를 만들 때 쓴 Freshness Value를 알아야 한다.[@autosar-cp-sws-secureonboardcommunication-2025]

인증 알고리즘에 따라 Authenticator는 잘라서 실을 수 있고, 자를 때는 상위 비트만 남긴다. 실을 길이는 Secured I-PDU마다 따로 설정한다. Freshness Value도 설정한 길이가 실제 값보다 짧으면 하위 비트만 싣고, 길이를 0으로 설정하면 싣지 않는다. 상대에게 가는 SecOC 데이터(Freshness Value, Authenticator, Data Identifier 등)는 모두 [[byte-order|빅 엔디언]]으로 인코딩한다.[@autosar-cp-sws-secureonboardcommunication-2025]

![[diagrams/secoc-secured-ipdu-authenticator.svg]]

## Freshness Value

**Freshness Value**는 Secured I-PDU의 신선도를 보장하는 단조 카운터의 값으로, 메시지마다 세는 Freshness Counter나 시간 값인 Freshness Timestamp로 구현한다. Secured I-PDU마다 Freshness Value를 하나 이상 설정한다. 송신 측과 수신 측 SecOC는 Secured I-PDU마다 외부의 Freshness Manager에서 Freshness Value를 받는다. SecOC는 설정에 따라 Freshness Manager를 C 함수(`SecOC_GetTxFreshness` 등)로 부르거나, [[autosar-rte|RTE]]를 거쳐 FreshnessManagement 서비스의 operation으로 부른다. Freshness 관리는 AUTOSAR가 표준화하지 않았다.[@autosar-cp-sws-secureonboardcommunication-2025]

AUTOSAR R25-11의 SecOC 프로토콜 명세도 신선도 정보를 주는 [[autosar-software-component|소프트웨어 컴포넌트]]가 따로 있다고 전제한다.[@autosar-fo-prs-secocprotocol-2025]

## 통신 스택 안의 배치

AUTOSAR Classic Platform R25-11의 SecOC 명세는 SecOC 모듈을 [[pdu-router|PduR]]와 같은 수준에 통합하도록 둔다. PduR는 보안 관련 I-PDU를 SecOC로 보내고, SecOC는 보안 정보를 더하거나 처리한 결과를 I-PDU로 PduR에 돌려주며, PduR가 그 I-PDU를 다시 라우팅한다. SecOC는 PduR가 지원하는 통신 방식, 특히 멀티캐스트, 전송 프로토콜, PduR 게이트웨이를 모두 지원한다. 송신과 수신 양쪽의 SecOC 모듈은 PduR의 상위 계층 API와 하위 계층 API를 함께 갖춘다.[@autosar-cp-sws-secureonboardcommunication-2025]

SecOC는 I-PDU가 지나는 경로마다 모듈 안에 버퍼를 두고, `SecOC_Init`이 이 버퍼를 초기화한다. 다른 모듈은 SecOC에 기대지 않게 구현하므로, 필요 없으면 SecOC 없이 시스템을 만들 수 있다. SecOC는 받은 I-PDU를 검증한 뒤 다른 하위 모듈로 라우팅하면서 바로 다시 인증하는 게이트웨이도 지원하지만, [[pdu-router#라우팅 테이블|on-the-fly 게이트웨이]]는 지원하지 않는다.[@autosar-cp-sws-secureonboardcommunication-2025]

## 암호 서비스와 키

SecOC는 [[autosar-crypto-stack#Crypto Service Manager|Csm]]이 주는 암호 서비스를 쓰고, 키와 카운터 관리를 위해 RTE와 주고받는다.[@autosar-cp-sws-secureonboardcommunication-2025] SecOC와 다른 서비스의 연동에서 이 키·카운터 관리는 RTE 위의 Key & Counter Management SW-C가 맡는다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 검증 결과의 보고

보안 이벤트 보고가 켜져 있으면 SecOC는 보안 이벤트를 [[intrusion-detection-system-manager|IdsM]]에 보고한다. 수신 Freshness Value를 얻지 못하거나 Authenticator 검증이 복구할 수 없는 오류로 끝나면 보안 이벤트를 보낸다. `SECOC_E_VERIFICATIONERROR`가 정의돼 있으면 SecOC는 Secured I-PDU 검증이 실패할 때 [[diagnostic-event-manager|Dem]]에 `DEM_EVENT_STATUS_PREFAILED`를, 통과할 때 `DEM_EVENT_STATUS_PREPASSED`를 알린다.[@autosar-cp-sws-secureonboardcommunication-2025]

## Classic Platform과 Adaptive Platform 사이

AUTOSAR R25-11의 SecOC 프로토콜 명세는 Classic Platform과 [[autosar-adaptive-platform|Adaptive Platform]] 사이의 호환을 목표로 하고, 통신이 [[ethernet|이더넷]] 위에서 이뤄진다고 전제한다. 쓰임새로는 [[some-ip|SOME/IP]]를 쓰는 보안 통신과, [[signal-based-communication|시그널 기반]] 통신을 서비스로 옮겨 하는 보안 통신을 든다. SOME/IP에서는 Authentic PDU와 암호 PDU를 따로 보내는 방식과 페이로드의 일부를 신선도 정보로 쓰는 방식을 지원하지 않는다.[@autosar-fo-prs-secocprotocol-2025]
