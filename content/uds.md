---
title: UDS
tags:
  - network
aliases:
  - Unified Diagnostic Services
verified: 2026-09-28
---

**UDS**(Unified Diagnostic Services)는 진단 장비와 차량의 ECU 사이에서 주고받는 진단 통신 서비스를 정한 응용 계층 프로토콜이며, ISO 14229 시리즈가 정한다. 진단 서비스는 클라이언트가 시작해 서버에 진단 정보를 요구하는 정보 교환이고, 클라이언트는 진단 장비(tester)의 기능, 서버는 ECU의 기능이다. [[iso-14229-1|ISO 14229-1]]은 특정 데이터 링크에 매이지 않는 진단 통신 서비스 요구사항을 정한다.[@iso-14229-1-obp-2026]

## 구조·동작

### 문서 구성

ISO 14229는 현재 1부부터 8부까지 있다.[@iso-14229-1-obp-2026] 그 가운데 몇 부는 아래와 같다.

| 문서        | 정하는 것                                              |
| ----------- | ------------------------------------------------------ |
| ISO 14229-1 | 응용 계층[@iso-14229-1-obp-2026]                       |
| ISO 14229-2 | 세션 계층 서비스[@iso-14229-2-obp-2021]                |
| ISO 14229-3 | [[can\|CAN]] 위의 UDS(UDSonCAN)[@iso-14229-3-obp-2022] |
| ISO 14229-4 | FlexRay 위의 UDS(UDSonFR)[@iso-14229-4-obp-2012]       |
| ISO 14229-5 | IP 위의 UDS(UDSonIP)[@iso-14229-5-obp-2022]            |
| ISO 14229-6 | K-Line 위의 UDS(UDSonK-Line)[@iso-14229-6-obp-2013]    |
| ISO 14229-7 | LIN 위의 UDS(UDSonLIN)[@iso-14229-7-obp-2022]          |

ISO 14229-2는 ISO 14229-1과, DoCAN(Diagnostic communication over Controller Area Network)이나 [[doip|DoIP]] 같은 전송 프로토콜 사이의 독립성을 준다.[@iso-14229-2-obp-2021]

### 요청과 응답

ISO 14229-1은 서브펑션(SubFunction) 파라미터가 있는 요청 메시지와 없는 요청 메시지를 나눠 정한다.[@iso-14229-1-obp-2026] AUTOSAR의 진단 통신 관리자 Dcm(Diagnostic Communication Manager)은 진단 메시지의 첫 바이트를 서비스 식별자(SID, Service Identifier)로 보고 지원하는 서비스인지 검사한다. 서브펑션이 있는 서비스에서 메시지 둘째 바이트의 비트 7(`suppressPosRspMsgIndicationBit`)이 1이면 긍정 응답을 보내지 않는다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

### 서비스

ISO 14229-1은 서비스를 기능 단위(functional unit)로 묶는다. 진단·통신 관리 기능 단위에는 DiagnosticSessionControl, ECUReset, SecurityAccess, CommunicationControl이 속한다.[@iso-14229-1-obp-2026] ISO 14229-1과, UDS를 쓰는 ISO 14229-4, ISO 27145-3의 공개된 목차가 밝힌 서비스의 SID는 아래와 같다.

| 서비스                       | SID                           |
| ---------------------------- | ----------------------------- |
| DiagnosticSessionControl     | `0x10`[@iso-14229-1-obp-2026] |
| ECUReset                     | `0x11`[@iso-14229-1-obp-2026] |
| ClearDiagnosticInformation   | `0x14`[@iso-27145-3-obp-2012] |
| ReadDTCInformation           | `0x19`[@iso-27145-3-obp-2012] |
| ReadDataByIdentifier         | `0x22`[@iso-27145-3-obp-2012] |
| SecurityAccess               | `0x27`[@iso-14229-1-obp-2026] |
| CommunicationControl         | `0x28`[@iso-14229-1-obp-2026] |
| ReadDataByPeriodicIdentifier | `0x2A`[@iso-14229-4-obp-2012] |
| RoutineControl               | `0x31`[@iso-27145-3-obp-2012] |
| ResponseOnEvent              | `0x86`[@iso-14229-4-obp-2012] |
| LinkControl                  | `0x87`[@iso-14229-4-obp-2012] |

AUTOSAR Dcm 명세는 이 밖에 Authentication(`0x29`), TesterPresent(`0x3E`), ControlDTCSetting(`0x85`), ReadMemoryByAddress(`0x23`), ReadScalingDataByIdentifier(`0x24`), DynamicallyDefineDataIdentifier(`0x2C`), WriteDataByIdentifier(`0x2E`), WriteMemoryByAddress(`0x3D`), InputOutputControlByIdentifier(`0x2F`), RequestDownload(`0x34`), RequestUpload(`0x35`), TransferData(`0x36`), RequestTransferExit(`0x37`), RequestFileTransfer(`0x38`)의 처리를 정한다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

### 진단 세션

ISO 14229-1은 기본 세션과 기본이 아닌 세션을 두고, 세션마다 쓸 수 있는 서비스를 정한다.[@iso-14229-1-obp-2026]

AUTOSAR Dcm은 초기화할 때 세션을 기본 세션으로 두고, 기본이 아닌 세션에서 S3Server 타이머가 만료되면 기본 세션으로 돌아간다. Dcm의 세션 형은 기본 세션이 `0x01`, 프로그래밍 세션이 `0x02`, 확장 진단 세션이 `0x03`이다. Dcm 명세에서 Concurrent TesterPresent는 기본이 아닌 세션을 유지하고 S3 타이머를 다시 시작하는 데 쓴다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

![[diagrams/uds-diagnostic-session-states.svg]]

### 데이터 식별자와 고장 코드

AUTOSAR Dcm은 데이터 식별자(DID, Data Identifier)를 2바이트로 구성하고, ReadDataByIdentifier 요청 하나에 DID 여럿을 담은 요청을 처리한다. WriteDataByIdentifier 요청에서는 2바이트 DID와 기록할 `dataRecord`를 받는다. 진단 고장 코드(DTC, Diagnostic Trouble Code)는 상위·중간·하위 3바이트로 다룬다. ReadDTCInformation으로 서버에 저장된 DTC 정보를 보고하고, ClearDiagnosticInformation으로 고장 메모리를 지운다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

### 전송

CAN 위의 UDS(ISO 14229-3)는 ISO 15765-2(DoCAN)를 전송 계층과 네트워크 계층으로 쓴다.[@iso-14229-3-obp-2022] ISO 15765-2는 ISO 14229-2의 서비스 프리미티브 인터페이스를 지원하고, 한 프레임에 담기지 않는 메시지를 여러 CAN 프레임으로 [[segmentation-and-reassembly|나눠]] 보낸다.[@iso-15765-2-obp-2024] IP 위의 UDS(ISO 14229-5)는 DoIP(ISO 13400-2)를 전송 계층과 네트워크 계층으로 쓴다.[@iso-14229-5-obp-2022][@iso-13400-2-obp-2025]

![[diagrams/uds-can-ip-layers.svg]]

## 비교·한계

WWH-OBD(World-Wide Harmonized On-Board Diagnostics)를 정하는 ISO 27145 시리즈는 ISO 14229-1의 UDS를 WWH-OBD 시스템에 적용하려고 만들어졌다.[@iso-27145-3-obp-2012][@iso-27145-1-obp-2012] ISO 27145-3은 서버가 ReadDataByIdentifier 요청 하나에서 지원해야 하는 DID의 최소 개수를 정한다.[@iso-27145-3-obp-2012]
