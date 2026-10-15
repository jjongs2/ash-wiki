---
title: AUTOSAR Update and Configuration Management
tags:
  - platform/autosar
aliases:
  - UCM
verified: 2026-10-07
---

AUTOSAR R25-11 Update and Configuration Management 명세는 **Update and Configuration Management**(UCM)를 [[autosar-adaptive-platform|AUTOSAR Adaptive Platform]]의 소프트웨어를 안전하고 보안을 지키며 설치, 갱신, 제거하는 일을 맡는 [[autosar-adaptive-platform#Functional cluster|Adaptive Platform Services]]의 functional cluster로 정의한다. UCM은 응용뿐 아니라 모든 functional cluster와 하부 POSIX 운영체제, 그 커널을 포함한 Adaptive Platform 자체의 갱신도 맡는다. 기능은 직접 부르는 API가 아니라 `ara::com` 서비스 인터페이스로 내놓아, UCM을 쓰는 쪽이 같은 ECU에 있지 않아도 된다.[@autosar-ap-sws-updateandconfigurationmanagement-2025]

UCM이 맡는 일은 아래와 같다.[@autosar-ap-sws-updateandconfigurationmanagement-2025]

- Adaptive Platform에 있는 소프트웨어의 버전 보고
- 소프트웨어 갱신을 받아 버퍼에 두기
- 갱신에 필요한 자원이 충분한지 확인하기
- 갱신을 수행하고 로그 메시지와 진행 정보 제공하기
- 갱신 결과 검증하기
- 실패하면 알려진 정상 상태로 되돌리는 롤백[@autosar-ap-sws-updateandconfigurationmanagement-2025]

[[over-the-air-update|OTA 업데이트]]로 소프트웨어와 그 설정을 유연하게 갱신하는 것은 Adaptive Platform의 목표 가운데 하나이고, 이를 위해 UCM이 소프트웨어 갱신 요청을 처리한다. UCM의 역할은 Linux의 dpkg나 YUM(Yellowdog Updater, Modified) 같은 패키지 관리 시스템과 비슷하고, 소프트웨어를 안전하고 보안을 지키며 갱신하는 기능이 더해져 있다.[@autosar-ap-exp-platformdesign-2025]

## Software Cluster와 설정 관리

UCM은 Adaptive Platform의 소프트웨어를 [[autosar-software-cluster#Adaptive Platform의 Software Cluster와의 차이|Software Cluster]] 단위로 관리한다. Software Cluster는 한 번에 통째로 갱신할 수 있는 소프트웨어 단위가 될 수 있고, UCM은 Software Cluster마다 버전을 보고한다. UCM이 처리하는 Software Package는 정확히 한 Software Cluster를 가리키고, 그 Software Cluster를 더할지, 갱신할지, 지울지를 담는다.[@autosar-ap-exp-platformdesign-2025]

UCM은 패키지 관리 서비스 인터페이스 밖에 설정 관리를 위한 인터페이스를 따로 두지 않고, 갱신과 설정 관리를 이 인터페이스 하나로 묶는다. 그래서 설정 파라미터 하나를 바꾸더라도 Software Package를 만들어 처리해야 하고, Software Cluster의 버전이 새로 생긴다. 소프트웨어 버전을 대개 바꾸지 않는 calibration이나 variant coding 같은 쓰임새는 지원하지 않는다.[@autosar-ap-exp-platformdesign-2025]

## 패키지

Software Package는 UCM이 입력으로 받는 설치 단위다. 응용의 실행 파일, 운영체제나 펌웨어 갱신, 갱신한 설정과 calibration 데이터 같은 실제로 더하거나 바꿀 데이터에 더해, 패키지 이름, 버전, 의존성 같은 메타데이터를 주는 Software Package Manifest를 담는다. Software Package의 형식은 정하지 않으며, UCM 벤더의 도구가 패키지를 만든다. 통합자는 실행 파일, [[autosar-manifest|Manifest]], 영속 데이터 등을 모은 뒤 대상 UCM과 호환되는 패키저로 Software Package를 만든다.[@autosar-ap-exp-platformdesign-2025]

OEM 백엔드가 여러 공급자의 패키지를 이해할 수 있도록 벤더에 매이지 않는 Backend Package 형식도 제안한다. Software Package의 형식은 벤더마다 다르지만, Backend Package에 든 Software Package Manifest는 ARXML(AUTOSAR Extensible Markup Language) 파일 형식이어야 한다. Vehicle Package는 대개 OEM 백엔드가 만든다. 백엔드에 저장된 Backend Package에서 뽑은 Software Package Manifest들과, 갱신 캠페인의 조율 정보를 비롯해 차량 안에서 패키지를 나누는 데 필요한 항목을 담은 Vehicle Package Manifest를 담는다. 정비소에서도 쓸 수 있도록 Vehicle Package Manifest도 ARXML 형식이어야 한다.[@autosar-ap-exp-platformdesign-2025]

## 갱신 단계

전송한 Software Package에서 활성화된 Software Cluster까지 이르는 갱신 사이클은 세 단계로 나뉜다.[@autosar-ap-sws-updateandconfigurationmanagement-2025]

- **준비 단계**: UCM Client가 Software Package를 UCM에 전송하고, UCM이 이를 처리해 갱신에 드는 Software Cluster를 설치, 갱신, 제거한다.
- **활성화 단계**: 갱신 사이클의 중요한 단계로, UCM이 관련 Software Cluster의 의존성을 검사하고 Software Cluster를 활성화한 뒤, [[autosar-state-management|State Management]]의 도움으로 설치를 검증한다.
- **정리 단계**: Software Package 같은 불필요한 산출물을 지워 시스템을 깨끗한 상태로 되돌리고, 다음 갱신 사이클을 준비한다.[@autosar-ap-sws-updateandconfigurationmanagement-2025]

갱신 사이클은 [[ab-update|A/B 업데이트]]와 [[ab-update#In-place 업데이트와의 차이|in-place]] 갱신을 지원하고, 필요하면 이전 버전으로 되돌릴 수 있다. Software Package의 처리는 한 번에 한 클라이언트만 요청할 수 있고, 여러 클라이언트는 차례로 요청한다. 처리를 마친 패키지는 요청한 클라이언트와 상관없이 한꺼번에 활성화한다. 활성화 전에 UCM은 설치된 소프트웨어의 요구에 시스템이 맞는지 의존성을 검사하고, 맞지 않으면 활성화를 거부한다.[@autosar-ap-exp-platformdesign-2025]

활성화할 때 UCM은 `ara::com`으로 State Management에 UpdateSession을 열고, 영향받는 Software Cluster의 [[autosar-state-management#Machine State와 Function Group State|Function Group]]마다 PrepareUpdate 메서드를 불러 Function Group별 준비를 하게 한다. 준비가 끝나면 UCM은 갱신의 종류에 따라 State Management에 Machine 리셋이나 Function Group 재시작을 요청하고, 대상 Function Group이 제대로 도는지 검증해 달라고 요청한다. 재시작이 성공하면 갱신은 활성화된 상태가 되고, UCM Client나 V-UCM이 Finish로 변경을 확정하거나 Rollback으로 이전 버전으로 되돌린다. Rollback이면 UCM은 영향받는 Function Group마다 PrepareRollback 메서드를 불러 이전 버전을 다시 활성화한다. 어느 쪽이든 UCM은 State Management의 갱신 세션을 끝내야 한다.[@autosar-ap-exp-platformdesign-2025]

![[diagrams/ucm-update-activation-sequence.svg]]

UCM이 State Management의 UpdateRequest 서비스 인터페이스로 요청한 갱신 세션은 상태 충돌이나 안전을 이유로 거부될 수 있다. UCM은 VerifyUpdate 메서드로 갱신, 설치, 제거를 검증하고, 검증에 실패하면 Function Group 상태를 되돌리도록 요청할 수 있다. Machine을 리셋하지 않으면 활성화 뒤 Manifest를 다시 읽어 플랫폼 설정을 일관되게 유지해야 한다.[@autosar-ap-exp-platformdesign-2025]

## 인증과 접근 제어

UCM과 V-UCM은 패키지 전체를 덮는 인증 태그로 각자의 패키지를 인증해야 한다. Adaptive Platform은 패키지를 검증할 [[checksum|체크섬]] 알고리즘, 암호 서명이나 벤더·OEM 고유의 메커니즘을 제공해야 하고, 검증하지 못하면 UCM이나 V-UCM이 오류를 돌려준다. 인증 알고리즘이 맞도록, 패키지는 대개 대상 UCM이나 V-UCM을 만든 벤더의 도구로 만든다. 인증 알고리즘이 해시를 쓰므로 인증하면서 일관성도 확인하고, 이 확인은 UCM이나 V-UCM이 패키지를 처리하기 전에 해야 한다.[@autosar-ap-exp-platformdesign-2025]

UCM과 V-UCM의 갱신 프로토콜에는 클라이언트를 인증하는 단계가 없다. `ara::com`으로 서비스를 요청하는 클라이언트가 정당한지는 [[autosar-identity-and-access-management|IAM]]이 보장한다.[@autosar-ap-exp-platformdesign-2025]

## Vehicle UCM

**Vehicle Update and Configuration Management**(V-UCM)는 차량의 소프트웨어와 그 설정을 진단 테스터로 하는 로컬 갱신이나 OTA 업데이트로 갱신하는 서비스를 주는 Adaptive Platform Services의 functional cluster다. V-UCM은 차량 안의 갱신 캠페인을 조율하며, 이를 위해 아래 일을 한다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

- 백엔드와 함께 갱신, 설치, 제거할 수 있는 Software Cluster를 찾고, Vehicle Package를 인증하고, 캠페인을 시작하기 전에 차량 안 Software Cluster 사이의 의존성을 확인하고, 필요한 Software Package를 받아 대상 ECU로 나눈다.
- Vehicle State Manager에 Vehicle Package에 따라 적용할 안전 조건을 알리고, 계산된 차량 상태를 캠페인에 관련된 다른 응용과 functional cluster에 나눈다.
- 운전자와의 상호작용을 일으키도록 캠페인 상태를 주고, Vehicle Package에 설정되어 있으면 운전자의 승인이나 동의를 받는다.
- 차량에 설치된 소프트웨어와 갱신 캠페인 이력의 정보를 주고, 실패하면 복구한다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

V-UCM은 백엔드나, 진단 애플리케이션을 거친 진단 도구에서 패키지를 받아 Vehicle Package를 해석하고, Software Package를 대상 UCM이나 Flashing Adapter로 전송하며, 처리와 활성화와 롤백을 조율한다. 이 전체를 **캠페인**이라 한다. UCM과 V-UCM은 서비스 인스턴스가 따로 있고, 한 네트워크 도메인에서 V-UCM의 서비스 인터페이스를 제공하는 V-UCM은 어느 때든 많아야 하나다. 차량에 V-UCM이 여럿 돌아도 나머지는 예비다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

V-UCM은 Adaptive Platform의 표준 UCM Client다. V-UCM은 차량 안 여러 UCM 사이에서 패키지를 조율하고 나눈다. V-UCM의 상태 기계는 CampaignState와 TransferState 필드로 볼 수 있고, V-UCM은 `ara::com`의 서비스 발견으로 차량 안의 UCM 서비스 인스턴스를 계속 찾는다.[@autosar-ap-exp-platformdesign-2025]

OEM마다 다른 갱신 측면은 설계상 Adaptive Application 쪽에 둔다. V-UCM은 아래 응용과 상호작용한다고 가정한다.[@autosar-ap-exp-platformdesign-2025]

- **OTA Client**: 백엔드와 V-UCM 사이의 통신 채널을 맺는다. 백엔드와 OTA Client 사이의 통신 프로토콜은 정하지 않는다.[@autosar-ap-exp-platformdesign-2025] OTA Client는 차량 식별 번호를 백엔드에 보내는 식으로 차량을 식별해, 백엔드가 차량에 맞는 정보와 패키지를 주는지 확인하는 것이 권고된다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]
- **Vehicle driver**: 갱신 중 데이터 전송 비용이 드는 다운로드와 처리, 활성화에 운전자의 동의를 받거나, 안전을 위해 차량을 멈추고 엔진을 끄는 것처럼 차량을 특정 상태에 두게 한다.
- **Vehicle State Manager**: 차량의 모든 ECU나 Machine의 상태를 모아, Vehicle Package에 든 V-UCM의 SafetyConditions 필드를 바탕으로 차량 상태를 계산한다. 계산한 차량 상태가 바뀌면 V-UCM의 PublishSafetyState 메서드를 부르고, 갱신의 안전 조건이 채워지지 않으면 V-UCM은 갱신을 미루거나 멈추거나 취소할 수 있다.[@autosar-ap-exp-platformdesign-2025]

![[diagrams/vucm-campaign-participants.svg]]

진단으로 플래시하는 ECU를 Flashing Adapter로 갱신하는 경로와, UCM이 정비소 갱신과 OTA 업데이트를 구별하지 않는다는 것은 [[ecu-reprogramming#정비소와 OTA|ECU 재프로그래밍]]에서 다룬다.

## 캠페인 진행

V-UCM이 캠페인을 이어 가고 끝내는 방식을 상태, 취소, 이력으로 나눠 다룬다.

### 상태

V-UCM은 한 번에 캠페인을 하나만 조율한다. V-UCM은 캠페인 상태를 TransferState 필드로도 내놓는데, CampaignState의 값은 TransferState에서 아래처럼 보인다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

| CampaignState                 | TransferState      |
| ----------------------------- | ------------------ |
| kIdle                         | kIdle              |
| kSyncing                      | kSyncing           |
| kVehiclePackageTransferring   | kTransferring      |
| kSoftwarePackage_Transferring | kTransferring      |
| kProcessing                   | kUpdating          |
| kActivating                   | kUpdating          |
| kVehicleChecking              | kUpdating          |
| kCancelling                   | kCancelling        |
| kRollingBackFailed            | kRollingBackFailed |

OTA Client는 TransferState 필드를 구독해 캠페인 상태를 아는 것이 권고된다. V-UCM은 의도했든 아니든 재부팅된 뒤에 진행 중인 캠페인을 이어 갈 수 있도록 자기 상태를 영속 저장한다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

캠페인에 든 모든 UCM이 활성화에 성공하면 V-UCM은 kVehicleChecking 상태로 간다. 이 상태로 바뀌면 Vehicle State Manager가 먼저 활성화 뒤의 차량 상태를 점검한다. 점검 결과가 참으로 오면 V-UCM은 캠페인의 모든 UCM에 Finish로 소프트웨어를 확정하고, 거짓으로 오면 kCancelling 상태로 가서 활성화되었거나 검증 중인 Software Cluster를 Rollback으로 되돌린다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

V-UCM은 Software Cluster 사이의 의존성을 검사할 때 버전의 MajorVersion과 MinorVersion만 견준다. 캠페인이 성공해 kVehicleChecking에서 kIdle로 가면, V-UCM은 그 캠페인에 쓰려고 저장해 둔 Software Package를 지운다. 더는 필요 없고, 남겨 두면 UCM의 [[rollback-protection#구현 예|롤백 방지]]에도 어긋나기 때문이다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

### 취소

캠페인에 든 UCM 가운데 하나라도 활성화에 실패하거나, 캠페인 중에 V-UCM이 닿지 못하는 UCM이 생기면 V-UCM은 kCancelling 상태로 가 캠페인을 취소한다. TransferData가 kBlockInconsistent를, ProcessSwPackage가 kServiceBusy를, Activate가 kUpdateSessionRejected를 돌려주거나, 전송 메서드를 부를 때 UCM에 닿지 못하면 V-UCM은 `UcmRetryStrategy` 설정대로 다시 시도할 수 있고, 같은 일이 `retryIntervalTime` 안에 `maximumNumberOfRetries`를 넘게 되풀이되면 캠페인을 취소한다. 캠페인 시간이 `maximumDurationOfCampaign`을 넘어도 취소한다. 이 시간은 Machine이 켜져 있던 시간만 세고 운전자 승인을 기다린 시간은 빼며, Machine을 껐다 켜도 이어 셀 수 있게 영속 저장한다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

![[diagrams/vucm-campaign-end-states.svg]]

CancelCampaign 메서드는 정비소에서 막힌 업데이트를 푸는 데 쓸 수 있다. disableCampaign을 참으로 주고 CancelCampaign을 부르면, V-UCM은 전원을 껐다 켜거나 재부팅해도 kIdle이나 kSyncing에 머물러 새 캠페인을 시작하지 않는다. 이 상태는 disableCampaign을 거짓으로 주고 CancelCampaign을 다시 부르거나 AllowCampaign을 부를 때까지 이어진다. 진단 테스터가 V-UCM에 끼어들어 캠페인이 거듭 실패하는 일을 막으려는 것이다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

### 이력

V-UCM은 TransferVehiclePackage 메서드가 불린 시각과 캠페인이 끝나 kIdle 상태에 든 시각, 캠페인 결과를 저장하고, GetCampaignHistory 메서드로 이력을 내준다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025] 이 이력은 백엔드가 차량 무리의 캠페인 통계를 모으거나, 정비소에서 진단 테스터로 문제를 찾는 데 쓸 수 있다.[@autosar-ap-exp-platformdesign-2025]
