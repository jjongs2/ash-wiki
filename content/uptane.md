---
title: Uptane
tags:
  - security/ota
verified: 2026-10-03
publisher: Joint Development Foundation Projects, LLC, Uptane Series
edition: 2023
status: 유효
---

**Uptane**은 지상 차량의 소프트웨어 업데이트를 지키는 보안 프레임워크다. 여러 종류의 침해에 버티는 것이 목표로, 공격자가 업데이트 메커니즘을 뚫으려면 모듈을 둘 이상 침해해야 하게 한다.[@uptane-standard-2-1-0-2023] Uptane은 [[the-update-framework|TUF]]의 기본 설계를 출발점으로 삼아 개발됐다.[@uptane-history-2026]

## 범위

Uptane Standard 2.1.0은 구현 세부를 구현자에게 맡기고, 표준을 따르는 구현이 갖출 구성 요소와 그 요구사항을 정한다. 서버 쪽의 두 저장소와 차량 안의 primary ECU, secondary ECU가 그 중심이고, 공격자의 목표와 공격은 위협 모델로 따로 정리한다.[@uptane-standard-2-1-0-2023]

이 표준은 차량이 셀룰러, Wi-Fi, 유선 같은 수단으로 필요한 백엔드 서비스에 연결할 수 있고, ECU가 [[public-key-cryptography|공개 키 암호]] 연산과 이미지·메타데이터 파일의 해시 계산을 할 수 있다고 전제한다. 대상은 승용차, 소형·대형 트럭, 오토바이를 포함한 지상 차량이다. 차량 밖에서 ECU를 손대는 것 같은 물리 공격, 신뢰된 패키지에 심긴 악성 코드, 빌드 시스템이나 패키징 과정 같은 공급망의 침해, ECU의 [[on-board-diagnostics|OBD]]나 [[uds|UDS]] 프로그래밍에 얽힌 문제, 버전 번호가 같은 악성 패키지로 원래 패키지를 바꿔치는 패키지 저장소의 악성 미러는 범위 밖에 둔다.[@uptane-standard-2-1-0-2023]

Uptane Deployment Best Practices 2.1.0은 한 Uptane 구현의 프로토콜, 운영, 사용, 형식을 담은 문서를 [[the-update-framework#TAP과 POUF|POUF]]라 부른다.[@uptane-deployment-best-practices-2-1-0-2023] Uptane Standard 2.1.0은 형식을 맞추려는 구현자가 구현 선택과 데이터 바인딩 형식을 적은 POUF를 쓸 수 있게 하고, 같은 POUF를 채택한 구현끼리 상호운용할 수 있게 한다.[@uptane-standard-2-1-0-2023]

### 두 저장소

이 표준은 저장소 둘을 정한다.[@uptane-standard-2-1-0-2023]

- **Image repository**: OEM이나 공급사가 올린 설치용 이미지와 그 [[digital-signature|서명]]된 메타데이터를 차량에 내준다. 주로 사람이 관리하고 드물게 갱신된다.
- **Director repository**: 차량 버전 매니페스트와 비공개 인벤토리 데이터베이스를 보고 어느 ECU에 어느 이미지를 설치할지 정하고, 그 지시를 담은 메타데이터를 그때그때 서명해 만든다. 대개 자동화된 온라인 프로세스가 다룬다.[@uptane-standard-2-1-0-2023]

Director repository는 인벤토리 데이터베이스에 차량마다 VIN(Vehicle Identification Number) 같은 고유 식별자를, ECU마다 고유 식별자(일련번호 등), 연결된 차량의 식별자, ECU 키와 그 식별자, primary ECU인지 secondary ECU인지를 기록한다. 이 표준은 director repository가 차량에 이미지 설치를 지시하는 절차를 여섯 단계로 정한다. 차량을 식별하고, 인벤토리 데이터베이스에서 그 차량의 ECU 정보를 찾고, 차량 버전 매니페스트가 데이터베이스와 맞는지 검사하고, 설치된 이미지 정보로 설치할 이미지 묶음을 정하고, 필요하면 이미지를 암호화하고, 그 묶음을 나타내는 Targets, Snapshot, Timestamp 메타데이터를 만들어 primary ECU에 보낸다. 설치할 이미지를 정할 때는 이미지 사이의 의존성과 충돌을 고려해야 한다.[@uptane-standard-2-1-0-2023]

![[diagrams/uptane-director-install-steps.svg]]

Uptane Deployment Best Practices 2.1.0은 image repository의 root, targets와 위임 역할의 키를 오프라인에 두어, 저장소가 뚫려도 full verification을 하는 ECU에 곧바로 영향이 가지 않게 하기를 권한다. Director repository에는 timestamp, snapshot, targets 메타데이터를 온라인 키로 서명해 자동으로 곧바로 새 메타데이터를 만들고, root 메타데이터만 오프라인 키로 서명하기를 권한다.[@uptane-deployment-best-practices-2-1-0-2023]

### 메타데이터

Uptane Standard 2.1.0은 메타데이터 전체의 형식이나 인코딩을 정하지 않고, 필요한 구조를 담을 수 있는 인코딩이면 무엇이든 쓸 수 있게 한다. 네 역할(Root, Targets, Snapshot, Timestamp)의 메타데이터는 서명할 페이로드와 그 서명을 담는 공통 구조를 따르고, 페이로드에는 역할의 종류, 만료 일시, 메타데이터를 고칠 때마다 올리기를 권하는 정수 버전 번호, 역할별 메타데이터가 든다.[@uptane-standard-2-1-0-2023]

Targets 메타데이터에는 이미지마다 release counter와 hardware identifier를 두기를 권한다. release counter는 이미지의 새 버전을 낼 때마다 올리는 값이고, hardware identifier는 그 이미지와 호환되는 ECU 모델을 나타낸다. 두 값은 director repository가 침해돼도 rollback 공격과 호환되지 않는 이미지의 설치를 막는 데 쓸 수 있다. Director repository의 Targets 메타데이터는 이미지마다 그 이미지를 설치할 ECU의 식별자(일련번호 등)를 담아야 한다. Primary ECU는 이미지나 이미지 경로마다 어느 저장소를 믿을지 알려 주는 repository mapping metadata를 갖춰야 하고, 이 메타데이터로 저장소를 둘보다 많이 두는 구현도 표준을 따를 수 있다.[@uptane-standard-2-1-0-2023] Release counter로 rollback을 막는 방법은 [[rollback-protection#업데이트 메타데이터 쪽의 방어|롤백 방지의 업데이트 메타데이터 쪽 방어]]에서 다룬다.

### Primary ECU와 secondary ECU

이 표준은 두 ECU의 일을 아래처럼 나눈다.[@uptane-standard-2-1-0-2023]

- **Primary ECU**는 자신과 secondary ECU의 몫으로 최신 메타데이터와 이미지를 받아 검증하고, secondary ECU에 메타데이터와 이미지를 보낸다.
- **Secondary ECU**는 primary ECU에게서 받은 메타데이터와 이미지를 설치하기 전에 스스로 검증한다.[@uptane-standard-2-1-0-2023]

![[diagrams/uptane-repositories-primary-secondary.svg]]

ECU에는 만들 때나 차량에 설치할 때 충분히 최근의 Uptane 메타데이터, 현재 시간이나 충분히 최근 시간의 안전한 증명, ECU마다 고유한 ECU 키를 넣어 둔다. ECU 키는 ECU version report에 서명하고 이미지를 복호화하는 데 쓴다.[@uptane-standard-2-1-0-2023]

이 표준은 새 이미지를 담아 둘 저장 공간이 모자란 secondary ECU에는, 그 secondary ECU가 메타데이터를 검증하고 요청할 때까지 primary ECU가 기다렸다가 이미지를 스트리밍하기를 권한다. 이런 ECU는 새 이미지를 받기 전에 이전에 동작하던 이미지를 primary ECU 같은 다른 곳에 백업해 두기를 권한다.[@uptane-standard-2-1-0-2023]

### Full verification과 partial verification

이 표준은 primary ECU가 full verification을 하게 하고, secondary ECU는 할 수 있으면 full verification을, 못 하면 적어도 partial verification을 하게 한다.[@uptane-standard-2-1-0-2023]

- **Full verification**: 두 저장소의 root, timestamp, snapshot, targets 메타데이터를 차례로 검증한 뒤, 두 저장소의 targets 메타데이터가 같은 이미지에 대해 일치하는지 대조한다.
- **Partial verification**: 적어도 시간을 확인하고 director repository의 targets 메타데이터를 검증한다. ECU는 검사를 더할 수 있다.[@uptane-standard-2-1-0-2023]

Uptane Deployment Best Practices 2.1.0은 partial verification을 느리거나 메모리가 적은 마이크로컨트롤러의 ECU를 위한 선택지로 둔다. 이 지침에 따르면 partial verification을 하는 ECU는 image repository의 메타데이터를 보지 않아, director repository의 targets 키를 가진 공격자가 악성 소프트웨어를 설치하게 할 수 있으므로 full verification보다 덜 안전하다. Partial verification을 하는 secondary ECU도 적어도 director repository의 Targets 메타데이터는 저장해야 하고, 그만한 저장 공간도 없는 ECU는 Uptane secondary ECU로 볼 수 없다.[@uptane-deployment-best-practices-2-1-0-2023]

### 차량 버전 매니페스트

Uptane Standard 2.1.0은 각 ECU가 지금 설치된 이미지의 파일 이름, 길이, [[cryptographic-hash-function|해시]]를 담아 서명한 ECU version report를 primary ECU에 보내게 한다. 또 primary ECU가 이를 모아 서명한 **차량 버전 매니페스트**(vehicle version manifest)를 director repository에 보내고, director repository가 여기서 설치된 이미지 정보를 읽어 차량이 최신인지와 무엇을 설치할지 정하게 한다.[@uptane-standard-2-1-0-2023]

![[diagrams/uptane-vehicle-version-manifest.svg]]

ECU version report에는 감지한 보안 공격의 표시, 보고서를 만들 때 ECU가 검증할 수 있는 가장 최근 시간, 보고서의 replay를 막는 nonce나 카운터도 들고, 이 값은 업데이트 주기마다 바뀌어야 한다. 모든 ECU는 slow retrieval 공격을 알아채고 대응하도록 메타데이터와 이미지의 내려받기 속도를 감시해야 하고, 속도가 정해 둔 문턱보다 느리면 다음 차량 버전 매니페스트 등으로 director repository에 경고를 보내기를 권한다.[@uptane-standard-2-1-0-2023]

### 위협 모델

이 표준은 공격자의 목표를 심각도가 낮은 것부터 넷으로 나누고, 위협 모델의 공격을 이 목표로 분류한다.[@uptane-standard-2-1-0-2023]

| 목표            | 내용                                                                                                                 | 공격                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 업데이트 읽기   | 기밀 정보를 알아내거나 펌웨어를 역공학하거나, 두 이미지를 견주어 고친 [[vulnerability-management\|취약점]]을 찾는다. | eavesdrop                                                                                             |
| 설치 막기       | 차량이 업데이트를 설치하지 못하게 한다.                                                                              | drop-request, slow retrieval, freeze, partial bundle installation, 저장소와 인프라에 대한 서비스 거부 |
| ECU 기능 방해   | ECU가 제대로 동작하지 못하게 한다.                                                                                   | [[rollback-protection\|rollback]], endless data, mix-and-match                                        |
| ECU나 차량 제어 | 공격자가 고른 코드를 ECU가 설치하고 실행하게 한다. 가장 심각한 목표다.                                               | arbitrary software                                                                                    |

### 시간

이 표준은 ECU가 안전한 시간 소스를 갖추게 하고, 안전함을 보일 수 있는 외부 시간 소스라면 무엇이든 쓸 수 있게 한다. Primary ECU는 안전한 소스에서 현재 시간을 받아야 하고, 각 ECU에 그 시간을 보내기를 권한다.[@uptane-standard-2-1-0-2023]

Uptane Deployment Best Practices 2.1.0에 따르면 ECU의 시간이 너무 앞서 있으면 지금 유효한 메타데이터를 만료된 것으로 보아 업데이트하지 못하고, 너무 뒤처져 있으면 공격자가 낡은 메타데이터로 freeze 공격이나 replay 공격을 할 수 있다. 이 지침은 ECU가 정확한 시간을 얻는 데 RFC 5905의 NTP(Network Time Protocol) 버전 4와 RFC 8915의 NTS(Network Time Security)를 쓰기를 권하고, GPS(Global Positioning System)는 보호되지 않은 민간 신호를 속이는 공격이 흔하므로 안전한 시간 소스로 쓰지 않기를 권한다.[@uptane-deployment-best-practices-2-1-0-2023]

### 운영

정비소가 ECU를 바꾸면 같은 모델이어도 ECU 키가 달라 차량 버전 매니페스트가 바뀌고, director repository는 이를 공격으로 볼 수 있다. 이 지침은 인가된 정비사가 바뀐 구성을 OEM에 알려 인벤토리 데이터베이스에 기록하는 대역 외 프로세스를 두기를 권하되, 이를 위한 프로토콜은 정하지 않는다. 구현자는 저장소와 primary ECU 사이의 연결을 [[transport-layer-security|TLS]]로 암호화할 수 있고, primary ECU와 secondary ECU 사이에서 Uptane 메타데이터와 이미지를 UDS로 나를 수 있다. Uptane은 이 구간들의 네트워크 트래픽 인증을 요구하지 않는다. 묶음에 든 이미지를 모두 설치하거나 하나도 설치하지 않는 원자적 설치는 Uptane의 범위 밖이다. 이 지침은 원자적 설치가 필요한 OEM을 위해 묶음 설치의 실패를 다루는 방법으로, 실패를 차량 버전 매니페스트로 보고하고 다시 시도하지 않는 것, 정한 횟수까지 다시 시도하는 것, 모든 ECU가 이전 이미지로 되돌릴 수 있으면 [[gateway|게이트웨이]] ECU가 조정하는 two-phase commit을 든다. 이 가운데 two-phase commit은 게이트웨이 ECU가 올바르게 동작하고 침해되지 않았으며 영구히 고장 나지 않는 한 원자적 설치를 이룬다.[@uptane-deployment-best-practices-2-1-0-2023]

## 개정 이력

NYU Tandon은 2015년 미국 국토안보부의 지원을 받아 차량 소프트웨어 업데이트를 지키는 과제를 시작했다. 2016년에는 University of Michigan Transportation Research Institute, Southwest Research Institute, NYU Tandon의 연구자 컨소시엄이 Uptane 개발을 시작했다.[@uptane-history-2026]

Uptane 연구자들은 개발 초기에 TUF를 ECU에 그대로 적용할 수 없음을 알았다. ECU는 단일 클라이언트가 아니고, 성능이 그리 높지 않으며, 구성 요소끼리 서로 믿지 않는다. 그래서 Uptane은 TUF의 기본 설계에 저장소를 하나 더 두어 검증의 일과 책임을 나눴다.[@uptane-design-2026]

Kuppusamy 외는 자동차 고유의 취약점과 한계를 다루려고 TUF에 기능을 더해 Uptane을 만들었고, 2016년 escar Europe에서 발표했다.[@kuppusamy-uptane-2016] Kuppusamy, DeLong, Cappos는 2018년 IEEE Vehicular Technology Magazine에 Uptane을 다룬 글을 실었다.[@kuppusamy-uptane-customizability-2018]

Uptane Alliance는 2018년 IEEE-ISTO 아래 비영리 단체로 세워졌다. Uptane은 Standard 1.0.0을 낸 뒤 Linux Foundation의 Joint Development Foundation 프로젝트가 됐다.[@uptane-about-2026] Uptane Standard 1.0.0은 2019년 IEEE-ISTO 6100.1.0.0이라는 이름으로 Uptane Alliance가 펴냈고, 2.1.0은 Joint Development Foundation Projects, LLC, Uptane Series의 이름으로 나왔다.[@uptane-standard-2-1-0-2023][@uptane-standard-1-0-0-2019] 판은 2019년 1.0.0, 2021년 1.1.0과 1.2.0, 2022년 2.0.0, 2023년 2.1.0 순으로 나왔다.[@uptane-history-2026]

2021년에는 커뮤니티 구성원이 Uptane 명세의 추가나 변경을 제안하는 공식 절차인 PURE(Proposed Uptane Revision and Enhancement)가 마련됐다.[@uptane-history-2026] Uptane 2.0.0판은 Uptane Time Server에 대한 언급을 모두 없앴다. Uptane Standard 2.1.0은 "Uptane-compliant"라는 말을 "Uptane-conformant"로 바꿨다.[@uptane-deployment-best-practices-2-1-0-2023] 이 판은 표준을 따르는 구현으로 인정받으려면 이 판의 규칙을 모두 따라야 한다고 정한다.[@uptane-standard-2-1-0-2023]

## 채택

- aktualizr는 Uptane [[over-the-air-update|OTA]] 업데이트 클라이언트의 C++ 구현이다.[@uptane-aktualizr-readme-2026]
- Toradex의 Torizon은 aktualizr를 포크한 Aktualizr-Torizon을 Uptane 클라이언트 구현으로 쓴다.[@toradex-torizon-updates-architecture-2026]
- ENISA의 2019년 보고서 Good practices for security of smart cars는 안전한 OTA 펌웨어 업데이트 지침의 예로 Uptane 프로젝트 문서를 든다.[@enisa-smart-cars-2019]
