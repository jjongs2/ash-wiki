---
title: Intrusion Detection System Manager
tags:
  - platform/autosar
  - security/cybersecurity
aliases:
  - IdsM
verified: 2026-10-07
---

**Intrusion Detection System Manager**(IdsM)는 [[autosar|AUTOSAR]]의 IDS(Intrusion Detection System)를 이루는 요소로, 보안 센서가 보고한 차량 안 보안 이벤트를 받아 설정한 규칙으로 걸러 qualified security event로 만들고, 이를 저장하거나 다른 곳으로 보낸다. [[autosar-classic-platform|Classic Platform]]의 IdsM은 BSW(Basic Software) 모듈이고[@autosar-cp-sws-intrusiondetectionsystemmanager-2025], [[autosar-adaptive-platform|Adaptive Platform]]의 IdsM은 [[autosar-adaptive-platform#Functional cluster|functional cluster]]다.[@autosar-ap-sws-intrusiondetectionsystemmanager-2025] AUTOSAR R25-11의 BSW 일반 명세는 Classic Platform의 IdsM을 [[autosar-crypto-stack|Crypto Services]] 층에 둔다.[@autosar-cp-sws-bswgeneral-2025]

## 보안 이벤트의 수집

IdsM은 차량 안 보안 이벤트(security event, SEv)를 받는 표준 인터페이스를 준다. 보안 이벤트는 BSW 모듈과 [[autosar-software-component|SW-C]]에 구현된 보안 센서가 보고하며, 이벤트 종류나 의심스러운 데이터 같은 context data를 덧붙일 수 있다. Context data는 백엔드에서 하는 보안 포렌식에 쓸모 있을 수 있는 정보다.[@autosar-cp-sws-intrusiondetectionsystemmanager-2025]

**보안 이벤트**는 공격이 진행 중임을 가리키거나 차량의 보안 상태를 평가하는 데 알맞은 이벤트로, 공격이 없는 정상 동작 중에도 생길 수 있다. 보안 이벤트를 보고하는 **센서**는 BSW 모듈, 독자 CDD(Complex Driver), SW-C 응용일 수 있다. Context data의 내용과 인코딩은 센서가 바깥에서 정하며, IdsM은 이를 알지 못한다.[@autosar-cp-sws-intrusiondetectionsystemmanager-2025]

[[secure-onboard-communication|SecOC]]는 수신 [[secure-onboard-communication#Freshness Value|Freshness Value]]를 얻지 못하거나 [[secure-onboard-communication#Secured I-PDU|Authenticator]] 검증이 복구할 수 없는 오류로 끝나면 IdsM에 보안 이벤트를 보고한다.[@autosar-cp-sws-secureonboardcommunication-2025] [[autosar-firewall|AUTOSAR firewall]]도 IDS 센서로서 보안 이벤트를 IdsM에 보고한다.[@autosar-cp-sws-firewall-2025]

AUTOSAR R25-11의 Adaptive Platform IdsM 명세는 [[autosar-software-cluster#Adaptive Platform의 Software Cluster와의 차이|Software Cluster]]와 functional cluster가 IdsM의 API로 새 보안 이벤트를 만들 수 있게 한다. Software Cluster가 만들 수 있는 이벤트 종류는 manifest에 설정해 그 Software Cluster의 PortPrototype에 잇고, 응용은 `ara::idsm::EventReporter`로 이벤트를 보고하면서 타임스탬프, 카운터, context data를 함께 줄 수 있다.[@autosar-ap-sws-intrusiondetectionsystemmanager-2025]

## Qualification

AUTOSAR Classic Platform R25-11의 IdsM 명세는 IdsM이 보고된 보안 이벤트를 설정한 규칙에 따라 qualify하도록 정한다. 이 규칙을 **filter chain**이라 하며, 필터를 차례로 이어 만든다. 보고된 이벤트를 걸러 바꾼 결과가 **qualified security event**(QSEv)이고, IdsM은 이를 이어서 저장하거나 전달한다. 필터는 들어온 보안 이벤트를 버리거나 바꿀 수 있고, filter chain을 통과한 보안 이벤트가 qualified security event가 되어 설정한 sink로 간다.[@autosar-cp-sws-intrusiondetectionsystemmanager-2025]

## 저장과 전달

Qualified security event는 보안 개념에 따라 ECU 안에 저장하거나, 다른 곳으로 전달하거나, 둘 다 한다. Classic Platform에서는 어느 쪽이든 설정한 sink로 보내며, sink는 [[diagnostic-event-manager|Dem]] 모듈과 IdsR(Intrusion Detection System Reporter) 둘이다. Dem sink로 보낸 qualified security event는 Dem을 거쳐 Sem(Security Event Memory)에 저장된다. Sem은 Dem의 기본 메모리와 따로 둔, Dem 모듈의 사용자 정의 메모리다. IdsR은 qualified security event를 백엔드의 SOC(Security Operation Center)로 넘길 수 있다. IdsM은 [[autosar-crypto-stack#Crypto Service Manager|Csm]]과 암호 스택으로 만든 Authenticator([[digital-signature|디지털 서명]]이나 [[message-authentication-code|MAC]] 등)를 qualified security event에 붙여 무결성과 authenticity를 줄 수 있다.[@autosar-cp-sws-intrusiondetectionsystemmanager-2025]

![[diagrams/idsm-security-event-flow.svg]]

AUTOSAR R25-11의 Adaptive Platform 설계 설명서는 IdsR과 SOC를 AUTOSAR 표준화 작업의 범위 밖에 둔다.[@autosar-ap-exp-platformdesign-2025]

## IDS 프로토콜

AUTOSAR R25-11의 IDS 프로토콜 명세는 IdsM 인스턴스가 qualified security event를 IdsR 인스턴스로 보내는 메시지의 형식, 순서, 의미를 정한다. 이 프로토콜은 IdsM이 IdsR로 밀어 보내는 push 방식만 다루고, 끌어오는 방식은 다루지 않는다. 모든 버스 시스템에서 쓰도록 설계됐고, IdsM은 qualified security event를 받지 않는다.[@autosar-fo-prs-intrusiondetectionsystem-2025]

IDS 메시지는 기본 Event Frame에, 타임스탬프, context data, Authenticator 가운데 필요한 것을 선택적으로 덧붙인 꼴이다. 세 선택 항목은 저마다 따로 켜고 끌 수 있다. 이 명세는 context data의 크기에 한도를 정하지 않지만, qualified security event 하나를 16 kB 이하로 두기를 권한다. IdsR은 필요하면 IDS 프로토콜의 요소를 SOC에 맞춰 syslog 형식으로 옮길 수 있다.[@autosar-fo-prs-intrusiondetectionsystem-2025]
