---
title: UDS
tags:
  - network/diagnostics
aliases:
  - Unified Diagnostic Services
verified: 2026-09-28
---

**UDS**(Unified Diagnostic Services)는 진단 장비와 차량의 [[electronic-control-unit|ECU]] 사이에서 주고받는 진단 통신 서비스를 정한 응용 계층 프로토콜이며, ISO 14229 시리즈가 정한다. 진단 서비스는 클라이언트가 시작해 서버에 진단 정보를 요구하는 정보 교환이고, 클라이언트는 진단 장비(tester)의 기능, 서버는 ECU의 기능이다. [[iso-14229-1|ISO 14229-1:2026]]은 특정 데이터 링크에 매이지 않는 진단 통신 서비스 요구사항을 정한다.[@iso-14229-1-obp-2026]

## 문서 구성

2026년 10월 기준 ISO 14229는 1부부터 8부까지 있다.[@iso-14229-1-obp-2026] 부마다 정하는 것은 아래와 같다.

| 문서        | 정하는 것                                                                             |
| ----------- | ------------------------------------------------------------------------------------- |
| ISO 14229-1 | 응용 계층[@iso-14229-1-obp-2026]                                                      |
| ISO 14229-2 | 세션 계층 서비스[@iso-14229-2-obp-2021]                                               |
| ISO 14229-3 | [[can\|CAN]] 위의 UDS(UDSonCAN)[@iso-14229-3-obp-2022]                                |
| ISO 14229-4 | [[flexray\|FlexRay]] 위의 UDS(UDSonFR)[@iso-14229-4-obp-2012]                         |
| ISO 14229-5 | IP 위의 UDS(UDSonIP)[@iso-14229-5-obp-2022]                                           |
| ISO 14229-6 | K-Line 위의 UDS(UDSonK-Line)[@iso-14229-6-obp-2013]                                   |
| ISO 14229-7 | [[lin\|LIN]] 위의 UDS(UDSonLIN)[@iso-14229-7-obp-2022]                                |
| ISO 14229-8 | CXPI(Clock eXtension Peripheral Interface) 위의 UDS(UDSonCXPI)[@iso-14229-8-obp-2020] |

ISO 14229-1:2026은 소개에서 ISO 14229 시리즈를 [[osi-model|OSI 참조 모델]]에 맞춰, 7계층(응용 계층)에 이 표준과 ISO 14229-3(UDSonCAN) 같은 UDS 표준을, 6계층(표현 계층)에 제조사별 정의와 SAE J1979-DA, ISO 22901 같은 문서를, 5계층(세션 계층)에 ISO 14229-2의 세션 계층 서비스를 둔다고 제시한다.[@iso-14229-1-obp-2026]

ISO 14229-2:2021은 ISO 14229-1과, DoCAN(Diagnostic communication over Controller Area Network)이나 [[doip|DoIP]] 같은 전송 프로토콜 사이의 독립성을 준다.[@iso-14229-2-obp-2021] ISO 14229-5:2022는 ISO 14229-1과 ISO 14229-2를 참조해, IP 위의 진단 통신에 쓸 진단 서비스의 구현 요구사항을 정한다.[@iso-14229-5-obp-2022] ISO 14229-8:2020은 CXPI 네트워크에 UDS를 구현하는 법을 정하고, 클라이언트와 CXPI slave 노드 사이의 진단 데이터 전송은 CXPI master 노드를 거친다.[@iso-14229-8-obp-2020]

[[on-board-diagnostics#WWH-OBD|WWH-OBD]]를 정하는 ISO 27145 시리즈는 ISO 14229-1의 UDS를 WWH-OBD 시스템에 적용하려고 만들어졌다.[@iso-27145-3-obp-2012][@iso-27145-1-obp-2012]

## 요청과 응답

ISO 14229-1:2026은 서브펑션(SubFunction) 파라미터가 있는 요청 메시지와 없는 요청 메시지를 나눠 정한다.[@iso-14229-1-obp-2026] [[autosar|AUTOSAR]]의 진단 통신 관리자 Dcm(Diagnostic Communication Manager)은 진단 메시지의 첫 바이트를 서비스 식별자(SID, Service Identifier)로 보고 지원하는 서비스인지 검사한다. 서브펑션이 있는 서비스에서 메시지 둘째 바이트의 비트 7(suppressPosRspMsgIndicationBit)이 1이면 긍정 응답을 보내지 않는다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

## 부정 응답 코드

Dcm은 응용이 지원하고 `Dcm_NegativeResponseCodeType`에 정의된 NRC(Negative Response Code)를 모두 다룬다. 이 형이 정하는 값 가운데 몇은 아래와 같다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

| NRC    | 이름                                   |
| ------ | -------------------------------------- |
| `0x10` | generalReject                          |
| `0x11` | Service not supported                  |
| `0x12` | SubFunction not supported              |
| `0x13` | incorrectMessageLengthOrInvalidFormat  |
| `0x22` | conditionsNotCorrect                   |
| `0x24` | requestSequenceError                   |
| `0x31` | requestOutOfRange                      |
| `0x33` | securityAccessDenied                   |
| `0x7E` | subFunctionNotSupportedInActiveSession |
| `0x7F` | serviceNotSupportedInActiveSession     |

기능 주소 지정(functional addressing)으로 받은 요청의 처리 결과가 부정이면, Dcm은 NRC `0x11`, `0x12`, `0x31`, `0x7E`, `0x7F`의 부정 응답을 보내지 않는다. 요청받은 진단 작업을 할 수는 있지만 마치고 응답을 준비하는 데 시간이 더 걸리면, Dcm은 응답 시간에 이를 때 NRC `0x78`(Response pending) 부정 응답을 보낸다. 응답 시간은 P2ServerMax 쪽이 $\mathrm{DcmDspSessionP2ServerMax} - \mathrm{DcmTimStrP2ServerAdjust}$, P2*ServerMax 쪽이 $\mathrm{DcmDspSessionP2StarServerMax} - \mathrm{DcmTimStrP2StarServerAdjust}$이다. 한 요청에 보내는 NRC `0x78` 부정 응답 수의 상한은 `DcmDslDiagRespMaxNumRespPend`로 설정할 수 있고, 설정하지 않으면 무한이다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

## 서비스

ISO 14229-1:2026은 서비스를 기능 단위(functional unit)로 묶는다. 진단·통신 관리 기능 단위에는 DiagnosticSessionControl, ECUReset, SecurityAccess, CommunicationControl이 속한다.[@iso-14229-1-obp-2026] ISO 14229-1과, UDS를 쓰는 ISO 14229-4, ISO 27145-3의 공개된 목차가 밝힌 서비스의 SID는 아래와 같다.

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

AUTOSAR R25-11 Dcm 명세는 이 밖에 아래 서비스의 처리를 정한다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

| 서비스                          | SID    |
| ------------------------------- | ------ |
| ReadMemoryByAddress             | `0x23` |
| ReadScalingDataByIdentifier     | `0x24` |
| Authentication                  | `0x29` |
| DynamicallyDefineDataIdentifier | `0x2C` |
| WriteDataByIdentifier           | `0x2E` |
| InputOutputControlByIdentifier  | `0x2F` |
| RequestDownload                 | `0x34` |
| RequestUpload                   | `0x35` |
| TransferData                    | `0x36` |
| RequestTransferExit             | `0x37` |
| RequestFileTransfer             | `0x38` |
| WriteMemoryByAddress            | `0x3D` |
| TesterPresent                   | `0x3E` |
| ControlDTCSetting               | `0x85` |

Dcm은 AccessTimingParameter(`0x83`)와 SecuredDataTransmission(`0x84`) 요청에는 NRC ServiceNotSupported로 답하고, LinkControl(`0x87`)의 지원은 사용자 선택(user optional)으로 둔다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

## 보안 접근과 인증

요청한 보안 수준이 아직 활성이 아니면, Dcm은 SecurityAccess(`0x27`)의 requestSeed 요청을 받아 설정한 `Xxx_GetSeed()`를 불러 seed를 구한다. 그 보안 수준이 아직 활성이 아니고 그 수준의 requestSeed가 성공한 뒤 sendKey 요청을 받으면, `Xxx_CompareKey()`를 불러 키 비교 결과를 구한다. 키 비교가 실패했을 때 그 보안 수준에 들어가려다 실패한 횟수 AttemptCounter가 설정한 한도보다 작으면($\mathrm{AttemptCounter} < \mathrm{DcmDspSecurityNumAttDelay}$) NRC `0x35`(InvalidKey)를 보내고, 한도 이상이면($\mathrm{AttemptCounter} \ge \mathrm{DcmDspSecurityNumAttDelay}$) 그 보안 수준의 지연 타이머 SecurityDelayTimer를 켜고 NRC `0x36`(exceededNumberOfAttempts)을 보낸다. 두 경우 모두 Dcm의 보안 수준은 바뀌지 않는다. 지연 타이머가 도는 동안 그 보안 수준의 requestSeed 요청에는 NRC `0x37`(requiredTimeDelayNotExpired)을 보낸다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

![[diagrams/uds-security-access-nrc.svg]]

Dcm은 Authentication(`0x29`)을 PKI 인증서 교환으로만 구현하고, challenge-response 인증은 AUTOSAR의 범위 밖에 둔다. Dcm은 진단 연결(`DcmDslConnection`)마다 인증 상태를 둔다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

## 진단 세션

ISO 14229-1:2026은 기본 세션과 기본이 아닌 세션을 두고, 세션마다 쓸 수 있는 서비스를 정한다.[@iso-14229-1-obp-2026]

AUTOSAR Dcm은 초기화할 때 세션을 기본 세션으로 두고, 기본이 아닌 세션에서 S3Server 타이머가 만료되면 기본 세션으로 돌아간다. Dcm의 세션 형은 기본 세션이 `0x01`, 프로그래밍 세션이 `0x02`, 확장 진단 세션이 `0x03`이다. AUTOSAR R25-11의 Dcm 명세는 Concurrent TesterPresent의 목적을 기본이 아닌 세션을 유지하고 S3 타이머를 다시 시작하는 것으로 둔다. Dcm은 ISO 14229-2에 따라 프로토콜 타이밍 파라미터 P2ServerMin, P2ServerMax, P2*ServerMin, P2*ServerMax, S3Server를 다룬다. `DcmS3ServerTimeoutOverwrite`를 설정하지 않으면 S3Server 타임아웃을 5000 ms로 둔다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

![[diagrams/uds-diagnostic-session-states.svg]]

## 데이터 식별자와 고장 코드

AUTOSAR Dcm은 데이터 식별자(DID, Data Identifier)를 2바이트로 구성하고, ReadDataByIdentifier 요청 하나에 DID 여럿을 담은 요청을 처리한다. WriteDataByIdentifier 요청에서는 2바이트 DID와 기록할 dataRecord를 받는다. 진단 고장 코드(DTC, Diagnostic Trouble Code)는 상위·중간·하위 3바이트로 다룬다. ReadDTCInformation으로 서버에 저장된 DTC 정보를 보고하고, ClearDiagnosticInformation으로 고장 메모리를 지운다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

ISO 14229-1:2026은 **DTC**를 [[on-board-diagnostics|OBD]] 시스템이 찾아낸 고장 상태의 고유한 숫자 식별자로 정의하고, **permanent DTC**를 DTC 삭제 요청 뒤에도 다른 조건(대개 법규가 정한 조건)을 채울 때까지 비휘발성 메모리에 남는 DTC로 정의한다.[@iso-14229-1-obp-2026]

ISO 27145-3:2012는 서버가 ReadDataByIdentifier 요청 하나에서 지원해야 하는 DID의 최소 개수를 정한다.[@iso-27145-3-obp-2012]

## 전송

CAN 위의 UDS(ISO 14229-3)는 [[iso-15765-2|ISO 15765-2]](DoCAN)를 전송 계층과 네트워크 계층으로 쓴다.[@iso-14229-3-obp-2022] ISO 15765-2:2024는 ISO 14229-2의 서비스 프리미티브 인터페이스를 지원하고, 한 프레임에 담기지 않는 메시지를 여러 [[can-frame|CAN 프레임]]으로 [[segmentation-and-reassembly|나눠]] 보낸다.[@iso-15765-2-obp-2024] IP 위의 UDS(ISO 14229-5)는 DoIP([[iso-13400-2|ISO 13400-2]])를 전송 계층과 네트워크 계층으로 쓴다.[@iso-14229-5-obp-2022][@iso-13400-2-obp-2025]

![[diagrams/uds-can-ip-layers.svg]]
