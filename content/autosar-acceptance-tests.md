---
title: AUTOSAR Acceptance Tests for Classic Platform
tags:
  - platform/autosar
verified: 2026-10-07
publisher: AUTOSAR
edition: 2016
status: 유효
---

**AUTOSAR Acceptance Tests for Classic Platform**은 [[autosar|AUTOSAR]]가 펴내는, [[autosar-classic-platform|Classic Platform]]의 [[implementation-conformance-class#등급|ICC1]] 스택에 대한 [[system-testing|시스템 테스트]]를 명세 수준에서 정한 표준이다.[@autosar-tc-exp-acceptancetestsoverview-2016]

## 범위

이 표준은 소프트웨어 명세를 바탕으로, 시험 범위를 응용 수준과 버스 수준에서 보이는 AUTOSAR 기능으로 좁힌다.[@autosar-tc-exp-acceptancetestsoverview-2016]

- **응용 수준**: 응용에 영향을 주는 [[autosar-rte|RTE]] 요구사항(산출물에서의 생성, API의 존재, 동작 등), BSW(Basic Software) 서비스, 라이브러리
- **버스 수준**: 송신 동작, 버스 오프 처리, [[autosar-network-management|네트워크 관리]] 같은 버스 동작과, 전송 프로토콜, 네트워크 관리, 진단 통신 같은 버스 프로토콜[@autosar-tc-exp-acceptancetestsoverview-2016]

![[diagrams/acceptance-test-levels.svg]]

인수 시험을 쓰는 것은 선택이고, 표준 인수 시험을 펴낸다고 특정 사업 모델을 강제하지는 않는다. 주된 목적은 시험 노력과 비용을 줄이는 것이다. 사용자가 [[test-case|테스트 케이스]] 명세를 따로 만들고 유지하지 않아도 되고, 표준 시험 묶음을 넓힐 방법론을 주며, 믿을 수 있는 시험 결과를 주고받게 한다. 그래서 공급자와 고객이 같은 시험을 둘 다 돌리지 않아도 되고, 한 번 돌린 결과를 여러 고객에게 쓰며, 시험 묶음 구현 하나로 여러 스택 구현을 시험할 수 있다. 테스트 케이스는 함께 합의한 기능에만 정하고, 프로젝트마다의 설정에서 돌리도록 만들지 않는다.[@autosar-tc-exp-acceptancetestsoverview-2016]

AUTOSAR는 글로 쓴 시험 명세를 표준화하며, 그 명세는 반형식적이다. 표준은 구현 하나를 보장하지 않으며, 구현자의 구현 설계가 필요하다. 도구의 시험은 범위 밖이지만, [[autosar-rte#생성되는 코드|RTE 생성기]]처럼 ECU 코드 생성에 참여하는 도구는 간접적으로 시험된다. 표준 인수 시험은 다른 시험 활동을 대신하지 않고, 스택 검증을 위한 시험 묶음을 완전히 대신하지도 않는다.[@autosar-tc-exp-acceptancetestsoverview-2016]

시험 명세의 적용 대상은 Classic Platform R4.2.2의 소프트웨어 명세다. 테스트 케이스가 R4.2.1, R4.1.1, R4.0.3, R3.2.2에도 적용되는지는 각 테스트 케이스 명세의 AUTOSAR Releases 필드에, 그 릴리스에 맞춰 고칠 점은 Needed Adaptation to other Releases 필드에 둔다.[@autosar-tc-tr-acceptancetestsreleaseoverview-2016]

산출물은 아래와 같다.[@autosar-tc-exp-acceptancetestsoverview-2016]

- **ATS**(Acceptance Test Specification): [[can|CAN]], [[flexray|FlexRay]], [[lin|LIN]] 위의 통신, 통신 관리, 버스를 거친 통신, 진단 서비스, ECU 모드 관리, [[autosar-memory-stack|메모리 스택]], RTE, [[ipv4|IPv4]], [[udp|UDP]], [[tcp|TCP]], [[autosar-time-synchronization|전역 시간 동기화]], [[can-fd|CAN FD]] 위의 통신의 인수 시험 명세
- Specification of Testability Protocol and Service Primitives
- Feature Specification of the Acceptance Tests는 인수 시험이 무엇을 시험할지 정한다.
- Requirements on Acceptance Tests는 인수 시험이 시험할 요구사항을 응용, 버스, 설정의 호환 수준으로 묶어 나열하고, 테스트 케이스의 추적 요소로 쓰인다.
- Overview of Acceptance Tests, 테스트 케이스별로 AUTOSAR 소프트웨어 릴리스에 대한 적용성을 적은 문서, 테스트 케이스의 XML 내보내기[@autosar-tc-exp-acceptancetestsoverview-2016]

## 개정 이력

- 2014년 6월: AUTOSAR가 Acceptance Test Release 1.0.0을 내놓았다.
- 2015년 10월: AUTOSAR가 Acceptance Test Release 1.1.0을 내놓았다.[@autosar-history-2026]
- 2016년 12월 15일: AUTOSAR가 Acceptance Tests for Classic Platform R1.2.0을 내놓았다. 인수 시험의 셋째 릴리스로 R1.1을 대체했다. CAN FD, NV(Non-Volatile) 데이터 처리, LdCom(Large Data COM) 같은 Classic Platform R4.2.x 개념의 테스트 케이스를 더하고, R1.1.0의 테스트 케이스를 고치고, 테스트 케이스를 Classic Platform R4.2.2에 맞췄다. CAN FD 위의 통신과 전역 시간 동기화의 인수 시험 명세, 테스트 케이스 XML 내보내기 문서가 새로 들어왔고, Acceptance Tests Main Requirements는 취소되어 그 내용이 [[autosar#표준|Foundation]]의 Main Requirements로 옮겨졌다.[@autosar-tc-tr-acceptancetestsreleaseoverview-2016]
