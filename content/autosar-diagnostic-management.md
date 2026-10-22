---
title: AUTOSAR Diagnostic Management
tags:
  - platform/autosar
  - network/diagnostics
verified: 2026-10-07
---

AUTOSAR R25-11 Adaptive Platform 설계 설명서는 **Diagnostic Management**를 ISO 14229-5(UDSonIP)를 구현하는 [[autosar-adaptive-platform|AUTOSAR Adaptive Platform]]의 functional cluster로 정의한다. Diagnostic Management는 [[autosar-adaptive-platform#Functional cluster|Adaptive Platform Foundation]]에 속하고, 그 설정은 [[autosar-classic-platform|Classic Platform]]의 DEXT(Diagnostic Extract Template)를 바탕으로 한다.[@autosar-ap-exp-platformdesign-2025]

지원하는 전송 계층은 [[doip|DoIP]]다. 차량 안이나 원격 진단에는 다른 전송 프로토콜을 쓰는 일이 많아, 사용자 전송 계층으로 플랫폼을 넓히는 API를 둔다. [[ee-architecture#존 아키텍처|고성능 컴퓨터]]에서는 [[uds|UDS]]와 DoIP에 더해 [[service-oriented-vehicle-diagnostics|SOVD]]도 지원한다.[@autosar-ap-exp-platformdesign-2025]

Diagnostic Management는 [[iso-14229-1|ISO 14229-1]]에 따른 UDS 서버 인스턴스와 ASAM의 SOVD를 구현하는 진단 서버 구현이다. UDS의 전송 계층으로는 [[iso-13400-2|ISO 13400-2]]:2019(ISO 13400-2:2019/Amd 1:2023 포함)에 따른 DoIP나 사용자 구현 전송 프로토콜을 쓸 수 있고, SOVD에는 HTTP나 HTTPS 위의 REST(Representational State Transfer) 서비스를 쓴다. DEXT는 Diagnostic Management의 설정 입력이다.[@autosar-ap-sws-diagnostics-2025]

## 진단 주소와 Diagnostic Server

Diagnostic Management는 설치된 [[autosar-software-cluster#Adaptive Platform의 Software Cluster와의 차이|Software Cluster]]마다 진단 주소(DiagnosticAddress)를 따로 두는 것과, [[autosar-adaptive-platform#Machine과 프로세스|Machine]] 전체에 진단 주소 하나를 두는 것, 그 사이의 배치를 모두 지원한다. 진단 주소를 따로 두면 그 주소의 Diagnostic Server 인스턴스도 따로 생기므로, Software Cluster마다 진단도 독립적으로 개발할 수 있다. 이 Software Cluster는 [[autosar-update-and-configuration-management|UCM]]의 Software Package와 짝을 이뤄, Machine에 갱신하거나 새로 들일 수 있다.[@autosar-ap-exp-platformdesign-2025]

모든 Diagnostic Server 인스턴스는 전송 계층 인스턴스 하나(예: [[internet-protocol-suite|TCP/IP]] 포트 13400의 DoIP)를 함께 쓴다. Diagnostic Communication Management의 응답 처리는 대체로 Classic Platform의 Dcm(Diagnostic Communication Manager) 모듈과 같은 일을 한다.[@autosar-ap-sws-diagnostics-2025]

- 네트워크 계층에서 DoIP나 사용자 전송 프로토콜의 UDS 요청과 SOVD의 HTTP·REST 요청을 받는다.
- 요청에서 정보를 뽑아, UDS 요청은 대상 주소와 주소 종류(물리·기능)에 따라, SOVD 요청은 URI의 대상 개체와 경로에 따라 Diagnostic Server 인스턴스로 보낸다.
- 여러 요청과 클라이언트를 다룬다. UDS 요청은 기존 UDS 세션에 연결하고, SOVD 요청은 요청한 자원의 모드와 잠금으로 접근을 보호한다.
- UDS 요청은 현재 세션과 보안 설정으로, SOVD 요청은 인가와 검증으로 허용 여부를 확인한다. 허용하지 않으면 UDS 부정 응답이나 SOVD 오류 코드를 담은 HTTP 오류 응답을 보낸다.
- 허용한 요청은 설정과 요청 종류에 따라 Diagnostic Communication Management나 Diagnostic Event Management 기능 블록 안에서 처리하거나, Diagnostic Management 밖의 Adaptive Application에 넘긴다.[@autosar-ap-sws-diagnostics-2025]

![[diagrams/diagnostic-management-request-routing.svg]]

## 진단 통신

진단 통신 하위 클러스터는 Classic Platform의 Dcm처럼 진단 서버를 구현한다. 지원하는 UDS 서비스는 아직 제한되어 있다. Diagnostic Management는 ISO 14229-1에 따른 다중 클라이언트 처리를 지원해, 데이터 수집, 백엔드 접근, 정비와 생산을 위한 여러 진단 클라이언트(테스터)를 함께 다룬다. 특정 서비스는 인증서로 인증할 수 있다.[@autosar-ap-exp-platformdesign-2025]

Diagnostic Management는 진단 서버로서 받은 루틴 제어나 DID(Data Identifier) 서비스 같은 진단 요청을, 해당 Adaptive Application의 매핑된 제공 포트로 보낸다. 이를 위해 Adaptive Application은 DiagnosticPortInterface를 제공해야 한다. DiagnosticPortInterface에는 요청·응답 메시지의 파라미터를 모두 API 시그니처에 담고 직렬화를 Diagnostic Management가 맡는 typed 인터페이스와, 바이트 벡터만 주고받고 직렬화를 응용이 맡는 generic 인터페이스가 있다.[@autosar-ap-exp-platformdesign-2025]

Diagnostic Management는 의사 병렬 처리를 위해 Diagnostic Conversation을 지원한다. **Diagnostic Conversation**은 진단 클라이언트와 Diagnostic Server 사이의 대화 하나다. Diagnostic Server는 UDS 요청의 대상 주소로 식별되고, 실행 중에 동적으로 할당된다.[@autosar-ap-exp-platformdesign-2025]

## 이벤트 메모리

이벤트 메모리 하위 클러스터는 Classic Platform의 [[diagnostic-event-manager|Dem]]처럼 [[uds#데이터 식별자와 고장 코드|DTC]]를 관리한다. 활성 DTC는 차량에서 확실히 검출한 문제를 나타낸다. Diagnostic Management는 DTC와, 그 DTC에 설정한 SnapshotRecord(DTC가 생긴 때의 환경 데이터)나 ExtendedDataRecord(재발 횟수 같은 통계 데이터)를 저장한다.[@autosar-ap-exp-platformdesign-2025]

검출 논리를 **Diagnostic Monitor**라 하고, Diagnostic Monitor는 최근 시험 결과를 Diagnostic Management의 DiagnosticEvent에 보고한다. UDS의 DTC 상태는 DiagnosticEvent 하나 이상에서 끌어낸다. DTC는 PrimaryMemory나 설정한 UserMemory에 둘 수 있다. 카운터 기반과 시간 기반 디바운싱을 지원하고, DTC 상태 바이트가 바뀌는 것 같은 내부 전이를 관심 있는 쪽에 알린다. 설정한 수의 운전 사이클 동안 활성이 아닌 DTC는 메모리에서 사라질 수 있다. enable condition으로는 특별한 조건에서 DTC의 갱신을 제어한다. 예를 들어 저전압 상태에서 네트워크 관련 DTC를 모두 막을 수 있다.[@autosar-ap-exp-platformdesign-2025]

이벤트 메모리는 시스템이 검출한 고장의 데이터베이스로, 이벤트와 DTC의 상태 정보와 DTC 관련 데이터를 저장한다. 이벤트 메모리는 ISO 14229-1의 fault memory에 해당한다. Diagnostic Management는 ISO 14229-1에 따라 primary 이벤트 메모리와, 256개까지의 사용자 정의 이벤트 메모리를 지원해야 하고, 사용자 정의 메모리는 primary 메모리와 똑같이 동작해야 한다.[@autosar-ap-sws-diagnostics-2025]

## SOVD

Diagnostic Management의 SOVD 기능에는 SOVD 게이트웨이, SOVD에서 UDS로의 변환, 백엔드 연결, 인가, proximity challenge, 로깅, bulk data, SOVD operation, 고장 처리가 있다. Diagnostic Management의 SOVD는 ASAM SOVD 1.1과 ISO 17978-3 문서를 바탕으로 한다. 보안 기능으로 Diagnostic Management는 UDS의 [[uds#보안 접근과 인증|SecurityAccess]](`0x27`)와 Authentication(`0x29`) 서비스, SOVD의 인가를 지원한다.[@autosar-ap-exp-platformdesign-2025]

독점 접근에는 UDS가 extended session을, SOVD가 SOVD 잠금을 쓰고, 둘 가운데 어느 방식이든 독점 접근을 가진 클라이언트는 한 번에 하나만 허용된다. SOVD 잠금은 extended session에 있는 UDS 클라이언트가 없을 때만 얻을 수 있고, 잠금이 없는 SOVD 클라이언트는 병렬 클라이언트 처리에서 UDS 클라이언트처럼 다룬다.[@autosar-ap-sws-diagnostics-2025]
