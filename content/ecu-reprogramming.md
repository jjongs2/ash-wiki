---
title: ECU 재프로그래밍
tags:
  - security/ota
  - network/diagnostics
verified: 2026-10-03
---

[[iso-13400-2|ISO 13400-2]]:2025는 소개에서, 차량 진단 통신의 쓰임이 배출가스 관련 진단에서 시작해 캘리브레이션, 전자 부품의 소프트웨어 업데이트 같은 제조사별 쓰임으로 넓어졌다고 밝힌다.[@iso-13400-2-obp-2025] [[iso-14229-1|ISO 14229-1:2026]]은 부트 소프트웨어를 [[uds|서버]] 메모리의 특별한 영역에서 실행되며 주로 ECU를 부팅하고 서버를 프로그래밍하는 소프트웨어로 정의하고, 부트 소프트웨어 가운데 ECU를 재프로그래밍할 수 있게 하는 부분을 **재프로그래밍 소프트웨어**라 한다. 부트 소프트웨어가 있는 영역은 보통의 프로그래밍 과정에서 지워지지 않으므로, 서버 애플리케이션이 없거나 유효하지 않을 때도 부트 소프트웨어가 실행되어 서버를 다시 프로그래밍할 수 있다.[@iso-14229-1-obp-2026]

## AUTOSAR Dcm의 부트로더 전환

[[autosar|AUTOSAR]] R25-11의 Dcm(Diagnostic Communication Manager) 명세는 [[uds|UDS]]의 DiagnosticSessionControl로 요청된 세션이 [[bootloader|부트로더]] 전환을 허용하도록 설정돼 있으면(`DcmDspSessionForBoot`), Dcm이 모드 전환을 일으켜 OEM 부트로더나 시스템 공급자 부트로더로 넘어갈 준비를 하도록 정한다. Dcm은 이 모드 전환으로 [[basic-software-mode-manager|BswM]]에 부트로더로 넘어갈 준비를 하라고 알린다. Dcm은 하위 기능 `0x02`로 [[uds#진단 세션|programming session]]을 시작하는 DiagnosticSessionControl 요청을 받으면 `Dcm_SetProgConditions`로 재프로그래밍을 요청하는 ReprogrammingRequest 플래그를 세운다. 이 명세는 Dcm을 부트로더 안에서 쓰도록 의도하지 않는다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

부트로더가 애플리케이션 재프로그래밍을 마치면 ApplUpdated 플래그를 갱신한다. ECU가 리셋된 뒤 새로 프로그래밍된 애플리케이션이 처음 시작되면, Dcm은 `Dcm_GetProgConditions`로 이 플래그를 읽어 BswM에 애플리케이션이 갱신됐음을 알린다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

![[diagrams/dcm-bootloader-jump-flow.svg]]

## 다운로드 서비스

이 명세는 다운로드에 쓰는 세 서비스를 다음처럼 다룬다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

- RequestDownload: 다운로드의 시작을 요청한다. Dcm은 데이터를 쓸 서버 메모리의 시작 주소와 압축하기 전의 크기를 [[autosar-layered-architecture#Integration Code와 callout|콜아웃]] `Dcm_ProcessRequestDownload`에 넘기고, 긍정 응답의 maxNumberOfBlockLength로 한 블록의 최대 길이를 돌려준다.
- TransferData: 다운로드나 업로드 중에 데이터를 보낸다. Dcm은 그 앞에 RequestDownload나 RequestUpload를 받았는지 추적해 순서 오류를 검사하고, 블록 순서 계수기를 초기화한다.
- RequestTransferExit: 다운로드나 업로드를 끝낸다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

같은 명세는 RequestDownload의 DataFormatIdentifier에서 상위 4비트를 압축 방식, 하위 4비트를 암호화 방식으로 둔다. 압축 방식의 `0x0`은 압축하지 않음, 암호화 방식의 `0x0`은 암호화하지 않음이고, 두 방식 모두 `0x1`부터 `0xF`는 제조사가 정하는 값이다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]

## Vector Flash Bootloader의 다운로드 시퀀스

Vector의 Flash Bootloader 기술 문서가 정한 UDS 다운로드 시퀀스에서, 테스터는 DiagnosticSessionControl로 programming session에 들어가고 [[uds#보안 접근과 인증|SecurityAccess]]를 거친다. 그 뒤 논리 블록마다 RoutineControl로 메모리를 지우고, RequestDownload, TransferData, RequestTransferExit로 데이터를 보낸 다음 RoutineControl로 검사한다. 모든 블록을 마치면 RoutineControl로 프로그래밍 의존성을 확인하고, ECUReset으로 하드 리셋한다.[@vector-fbl-oem-download-sequence-2024]

이 시퀀스의 단계 가운데 다음 셋은 이렇게 동작한다.[@vector-fbl-oem-download-sequence-2024]

- SecurityAccess: 이 부트로더에서 ECU에 데이터를 쓰는 서비스 같은 일부 서비스의 접근을 제한한다. 테스터는 seed를 요청한 뒤, 자기가 계산한 key를 보낸다.
- 메모리 지우기: RoutineControl로 루틴 식별자 `0xFF00`(Erase Memory)을 시작하며, 지울 메모리 주소와 길이를 함께 보낸다.
- 검사: 루틴 `0x0202`는 [[checksum|체크섬]] 계산이나 [[digital-signature|서명]] 검증으로 내려받은 데이터의 무결성을 확인하고, 루틴 `0xFF01`은 프로그래밍 의존성을 확인한다.[@vector-fbl-oem-download-sequence-2024]

플래싱에 성공해 하드 리셋한 뒤의 사후 프로그래밍 단계는 업데이트된 애플리케이션 소프트웨어가 실행한다.[@vector-fbl-oem-download-sequence-2024]

## 전송 경로

재프로그래밍에 쓰는 진단 메시지를 [[can|CAN]]과 IP([[doip|DoIP]]) 위로 나르는 방법은 [[uds#전송|UDS의 전송]]에서 다룬다. [[automotive-ethernet|차량용 이더넷]]을 쓰면 펌웨어 업데이트가 빨라진다.[@ieee-tsn-automotive-flyer-2026][@ti-szzy009-2018]

## 정비소와 OTA

ISO 15765 시리즈는 점검, 진단, 수리를 위해 차량에 연결하는 외부 시험 장비를 전제한다. [[iso-15765-2|ISO 15765-2]]:2024는 차량 안의 CAN 네트워크가 진단 링크 커넥터에 연결된 외부 장치와 통신을 맺고 유지하고 끝내는 요구사항을 정한다.[@iso-15765-2-obp-2024] ISO 14229-1:2026은 테스터의 예로 정비사가 쓰는 오프보드 스캔 툴을 들고, ECU 안에 온보드 테스터를 구현해 차량 통신 링크에서 진단 서비스를 쓰는 것도 막지 않는다.[@iso-14229-1-obp-2026]

AUTOSAR R25-11의 [[autosar-update-and-configuration-management|UCM]] 명세에서 UCM은 [[over-the-air-update|OTA 업데이트]]와 진단으로 하는 정비소 업데이트를 구별하지 않는다. 진단 애플리케이션이나 V-UCM(Vehicle Update and Configuration Management) 같은 UCM 클라이언트가 그 차이를 감추고 데이터와 순서 제어 명령을 UCM에 넘긴다.[@autosar-ap-sws-updateandconfigurationmanagement-2025] V-UCM은 [[autosar-classic-platform|Classic Platform]] ECU처럼 진단으로 플래시하는 플랫폼을 업데이트할 때 Flashing Adapter를 쓴다. Flashing Adapter는 OEM마다의 진단 시퀀스를 담고 D-PDU(Diagnostic Protocol Data Unit) API(ISO 22900-2)로 [[vehicle-bus|차량 버스]]의 ECU와 통신하며, 그 D-PDU API 구현은 CAN 위의 UDS와 DoIP 위의 UDS를 지원해야 한다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

![[diagrams/autosar-v-ucm-update-targets.svg]]

Flashing Adapter는 업데이트 중 타임아웃 문제를 피하도록 Classic Platform ECU를 알맞은 업데이트 모드로 넣는 로직을 담는다. Flashing Adapter에서 대상 ECU로 가는 진단 통신의 데이터 전송은 우선순위가 더 높은 프로토콜의 통신이 끼면 끊길 수 있고, 그러면 Flashing Adapter는 프로젝트마다 정한 전략으로 끊김을 감지해 전송을 처음부터 다시 할 수 있다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

진단 애플리케이션은 UCM 클라이언트로서 V-UCM 없이 [[autosar-adaptive-platform|Adaptive Platform]]의 ECU나 [[autosar-adaptive-platform#Machine과 프로세스|Machine]] 하나를 업데이트하고, V-UCM 클라이언트로서는 차량 업데이트의 일부로 Adaptive, Classic, 독자 플랫폼의 어느 ECU든 업데이트한다. V-UCM 클라이언트일 때 진단 애플리케이션은 OTA Client처럼 V-UCM의 서비스로 [[autosar-update-and-configuration-management#패키지|Vehicle Package와 Software Package]]를 넘긴다. 대상 ECU가 지금의 [[autosar-software-cluster#Adaptive Platform의 Software Cluster와의 차이|Software Cluster]]와 새 Software Cluster 사이를 전환할 수 없으면, 새 버전에서 옛 버전으로 롤백할 수 있도록 캠페인이 새 버전과 함께 지금 설치된 버전도 내려받게 하는 것이 권고된다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

NHTSA의 2022년 모범 사례는 차량과 진단 도구의 제조사가 진단과 재프로그래밍을 할 수 있는 도구의 차량 시스템 접근을 인증과 접근 제어로 통제하기를 권한다. 자동차 제조사에는 펌웨어를 고치는 능력을 인가되고 알맞게 인증된 당사자로 제한하는 최신 기법을 쓰기를 권한다.[@nhtsa-cybersecurity-best-practices-2022]
