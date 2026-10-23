---
title: AUTOSAR Identity and Access Management
tags:
  - platform/autosar
  - security/cybersecurity
aliases:
  - IAM
verified: 2026-10-07
---

AUTOSAR R25-11 Identity and Access Management 설명서는 **Identity and Access Management**(IAM)를 [[autosar-adaptive-platform|AUTOSAR Adaptive Platform]]의 구성 요소가 인증과 접근을 관리하도록 표준화한 모델로 정의한다. IAM은 functional cluster도 API도 아니어서, 접근 제어가 필요한 functional cluster와 API가 그 기능을 구현한다.[@autosar-ap-exp-identityandaccessmanagement-2025]

IAM은 인가받은 신원만 알맞은 자원에 접근하게 한다. 신원은 Adaptive Application이나 그 호스트이고, 자원은 IAM이 접근을 다루는 범위에 드는 인터페이스다. IAM의 목적은 잘못 동작하거나 공격받은 Adaptive Application이 응용 설계자와 통합자가 의도하지 않은 서비스나 자원에 접근하지 못하게 하는 것이다. 예를 들어 인터넷에 연결된 인포테인먼트 응용이 공격받더라도, 차량을 제동하는 서비스에는 접근하지 못하게 해야 한다.[@autosar-ap-exp-identityandaccessmanagement-2025]

IAM은 Adaptive Application의 권한을 분리하고, 공격받았을 때 권한 상승을 막는다. IAM은 또 통합자가 Adaptive Application이 요청하는 자원 접근을 배치할 때 미리 검증할 수 있게 한다. IAM은 Adaptive Application이 서비스 인터페이스, [[autosar-adaptive-platform#Functional cluster|Adaptive Platform Foundation]]의 functional cluster, 관련된 모델 자원에 보내는 요청의 접근 제어 틀을 준다.[@autosar-ap-exp-platformdesign-2025]

## PDP와 PEP

IAM은 크게 두 논리 개체로 구현된다. **PDP**(Policy Decision Point)는 접근 제어 결정을 내리는 논리로, 응용이 요청한 일을 해도 되는지 정한다. **PEP**(Policy Enforcement Point)는 그 결정을 집행하는 논리로, 연관된 PDP와 직접 통신해 결정을 받는다.[@autosar-ap-exp-platformdesign-2025]

이 설명서는 PDP의 구현과 설정을 정하지 않는다. 응용 인터페이스의 접근을 제한해야 하는 functional cluster는 PEP를 구현하고, Adaptive Application이 그 인터페이스에 접근을 요청하면 PEP가 PDP와 통신한다. PDP는 요청한 Adaptive Application의 Application Manifest에 든 intent와 정책으로 결정을 내린다. 공격자가 이 모델을 악용하지 못하도록 아래를 지켜야 한다.[@autosar-ap-exp-identityandaccessmanagement-2025]

- Adaptive Application의 intent 집합은 Manifest에서 그 응용과 진정하게 묶여야 하고, 서명된 갱신으로만 늘리거나 줄일 수 있어야 한다.
- Adaptive Platform Foundation과 Services 인터페이스의 접근 제어는 객체의 프로세스, 운영체제, Adaptive Platform Foundation의 프로세스 가운데 하나 이상에 있는 PEP가 집행해야 한다. 주체인 Adaptive Application의 맥락에서 도는 PEP로 그 주체 자신의 요청을 통제해서는 안 된다.
- Adaptive Application은 공격받았을 수 있다고 보아, 자기 요청을 제한하는 정책 결정을 통제할 수 없어야 한다. 요청하는 응용을 제한하는 PEP는 그 응용이 통제하지 않는 별도 프로세스에서 돌고, IPC(Inter-Process Communication)나 네트워크 통신으로 그 응용과 떨어져 있어야 한다.[@autosar-ap-exp-identityandaccessmanagement-2025]

![[diagrams/iam-pep-pdp.svg]]

AUTOSAR는 Adaptive Application의 식별을 완전히 정하지 않는다. 한 방법은 응용 프로세스를 운영체제 사용자(POSIX 사용자 등)로 따로 돌리는 것이다. 이때 [[autosar-execution-management|Execution Management]]가 응용 프로세스를 서로 다른 운영체제 사용자로 시작하고, IPC 채널에서 상대의 자격 증명을 묻는 운영체제 기능(Unix 도메인 소켓의 `getpeereid()` 등)을 쓸 수 있다. PEP는 실행 중의 신원(Unix 사용자 식별자 등)을 모델의 Process로 옮기고, PDP는 그 Process와 연관된 Grant로 접근을 허용하거나 거부한다.[@autosar-ap-exp-identityandaccessmanagement-2025]

IAM 모델링을 정한 functional cluster는 [[autosar-communication-management|Communication Management]], [[autosar-firewall|Firewall]], [[autosar-crypto-stack#Adaptive Platform의 Cryptography|Cryptography]], [[autosar-diagnostic-management|Diagnostic Management]], [[intrusion-detection-system-manager|Intrusion Detection System Manager]], [[autosar-platform-health-management|Platform Health Management]]다. PEP의 구현은 각 functional cluster의 소프트웨어 명세가 정한다.[@autosar-ap-exp-identityandaccessmanagement-2025]

## 정책과 intent

AUTOSAR R25-11 용어집은 **Access Control Policy**를 호출 대상(서비스 인터페이스)에 묶여, 그 인터페이스에 접근하는 데 필요한 신원 정보를 나타내는 정책으로 정의한다. 정책은 설정이나 모델링으로 주거나 PDP에 정적으로 미리 프로그래밍할 수 있다. **Access Control Decision**은 요청한 동작을 허용하는지를 나타내는 불 값으로, 호출자의 신원과 Access Control Policy를 바탕으로 정해진다. IAM에서 호출자는 Adaptive Application이다.[@autosar-fo-tr-glossary-2025]

AUTOSAR R25-11 Identity and Access Management 설명서는 **intent**를 Adaptive Application이 의도한 접근을 나타내는 그 응용의 속성으로 정의한다. Adaptive Application은 어느 자원에 필요한 intent를 모두 승인받아 가지고 있을 때 그 자원에 접근할 수 있다. 자원에는 서비스 인터페이스와 그 Method, Event, Field, 암호 키 슬롯 등이 있다. intent는 설계 단계에서 Application Manifest에 모델링하고, 통합자가 배치 단계에서 GrantDesign을 Grant로 옮겨 승인한다. Grant는 PDP 구현을 위한 접근 제어 목록으로 처리될 수 있다.[@autosar-ap-exp-identityandaccessmanagement-2025]

접근 권한을 배치하는 방법에는 주체마다 접근할 수 있는 객체 목록(intent)을 두는 것과, 객체마다 접근할 수 있는 주체 목록을 두는 것이 있다. 한 주체의 접근 대상은 대개 시간이 지나도 바뀌지 않지만, 한 객체의 접근 목록은 응용이 더 배치될 때마다 바뀌기 쉽다. 그래서 Adaptive Platform은 Adaptive Application과 함께 intent를 배치한다. 통합자는 요청된 intent마다 Grant를 명시적으로 만들어 승인해야 하고, 승인하지 않으면 유효한 모델을 만들 수 없다.[@autosar-ap-exp-identityandaccessmanagement-2025]

## 명세 이력

AUTOSAR Adaptive Platform R25-11은 Identity and Access Management의 요구사항 명세(RS IdentityAndAccessManagement)를 removed 상태로 두었다.[@autosar-ap-tr-releaseoverview-2025] Adaptive Platform의 개정 이력은 [[autosar-adaptive-platform#개정 이력|AUTOSAR Adaptive Platform]]에서 다룬다.
