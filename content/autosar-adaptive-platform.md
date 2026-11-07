---
title: AUTOSAR Adaptive Platform
tags:
  - platform/autosar
aliases:
  - Adaptive Platform
verified: 2026-10-07
publisher: AUTOSAR
edition: 2025
status: 유효
---

**AUTOSAR Adaptive Platform**은 [[autosar|AUTOSAR]]가 펴내는, 고성능 연산 [[electronic-control-unit|ECU]]를 위한 표준이다. 고도 자동 주행과 자율주행 같은 쓰임새에서 safety-related 시스템을 만드는 데 쓴다.[@autosar-ap-tr-releaseoverview-2025]

AUTOSAR Adaptive Platform R25-11은 깊이 임베디드된 ECU의 요구를 다루는 [[autosar-classic-platform|Classic Platform]]으로는 채울 수 없는 요구, 곧 고도 자동 주행처럼 연산 자원을 많이 쓰고 차량 수명 동안 갱신해야 하는 소프트웨어의 요구를 위한 AUTOSAR의 둘째 소프트웨어 플랫폼이다. 주로 고성능 연산과 통신 메커니즘을 제공하고, [[over-the-air-update|무선 소프트웨어 업데이트]] 같은 유연한 소프트웨어 구성을 지원한다. 전기 신호 접근이나 차량 전용 버스 시스템처럼 Classic Platform을 위해 정한 기능은 Adaptive Platform에 통합할 수 있지만 표준화의 초점은 아니다.[@autosar-ap-exp-platformdesign-2025]

응용은 C++로 작성할 수 있고, Adaptive Platform은 [[service-oriented-communication|서비스 지향]] 아키텍처를 따른다. 개발 중에는 응용을 점진적으로 배치하며 자원과 통신을 동적으로 관리하고, 양산용으로는 시스템 통합자가 동적 동작을 신중하게 제한할 수 있다. 이를 **planned dynamics**라 한다. 응용의 동적 동작은 [[autosar-manifest#Execution Manifest|Execution Manifest]]에 적은 제약 안으로 제한된다. 서비스 발견 과정을 미리 정해 두는 것, [[dynamic-memory-allocation|동적 메모리 할당]]을 시작 단계로 한정하는 것, 프로세스를 CPU 코어에 고정 배정하는 것, 인증된 코드만 실행하는 것이 그 예다.[@autosar-ap-exp-platformdesign-2025]

## 범위

Adaptive Platform은 Classic Platform과 달리 모듈 대신 functional cluster를 명세한다. AUTOSAR는 Classic Platform의 개발 이력을 바탕으로, 특정 [[software-architecture|소프트웨어 아키텍처]]를 정하지 않고 구현자가 표준 기능을 효율적으로 구현할 방법을 찾을 수 있게 이렇게 정했다.[@autosar-ap-tr-releaseoverview-2025]

### Functional cluster

Adaptive Platform은 응용인 Adaptive Application(AA)을 ARA(AUTOSAR Runtime for Adaptive Applications) 위에서 돌게 한다. ARA는 functional cluster가 제공하는 응용 인터페이스로 이뤄지고, functional cluster는 아래 네 묶음 가운데 하나에 속한다.[@autosar-ap-exp-platformdesign-2025]

- **Adaptive Platform Foundation**: Adaptive Platform의 기본 기능을 제공한다.
- **Adaptive Platform Services**: Adaptive Platform의 플랫폼 표준 서비스를 제공한다.
- **Standard Application/Interfaces**: Adaptive Platform이 표준화한 응용이나 인터페이스다.
- **Vehicle Services**: 차량 수준의 기능을 제공하는 서비스다.[@autosar-ap-exp-platformdesign-2025]

AUTOSAR 표준인 Foundation은 Adaptive Platform Foundation과 다른 것으로, [[autosar#표준|AUTOSAR]]에서 다룬다.

AA는 다른 AA에 서비스를 제공할 수도 있다. Adaptive Platform Foundation이든 Adaptive Platform Services든 functional cluster의 인터페이스는 AA가 보기에 차이가 없고, 정해진 C++ 인터페이스를 제공할 뿐이다. functional cluster와 AA는 대개 서로 다른 프로세스라 IPC(Inter-Process Communication)로 상호작용하며, 그 설계는 둘로 나뉜다. Library 기반 설계에서는 functional cluster가 제공해 AA에 링크하는 인터페이스 라이브러리가 IPC를 직접 부른다. Service 기반 설계에서는 AA에 링크한 프록시 라이브러리가 [[autosar-communication-management|Communication Management]]의 인터페이스를 부르고, Communication Management가 AA 프로세스와 서버 프로세스 사이의 IPC를 조율한다. 한 Adaptive Platform 인스턴스 안에서만 쓰는 functional cluster에는 단순하고 효율적인 Library 기반이, 다른 인스턴스에서 분산해 쓰는 functional cluster에는 Service 기반이 알맞다. Adaptive Platform Foundation의 functional cluster는 Library 기반이고, Adaptive Platform Services의 functional cluster는 Service 기반이다.[@autosar-ap-exp-platformdesign-2025]

![[diagrams/adaptive-platform-library-service-design.svg]]

### Machine과 프로세스

Adaptive Platform은 자신이 도는 하드웨어를 **Machine**이라 부른다. Machine은 실제 물리 머신일 수도 있고, [[hypervisor#완전 가상화와 반가상화|완전 가상화]] 머신, 반가상화 운영체제, 운영체제 수준 가상화 컨테이너 같은 가상 환경일 수도 있다. 어떤 가상화 기술을 쓰든 플랫폼을 일관되게 보려는 것이다. 하드웨어 하나에 Machine이 하나 이상 있을 수 있고, Machine마다 Adaptive Platform 인스턴스는 하나만 돈다.[@autosar-ap-exp-platformdesign-2025]

운영체제는 다중 프로세스 POSIX 기능을 제공해야 하고, 운영체제가 보기에 Adaptive Platform과 AA는 프로세스의 집합이다. 각 AA는 자기 논리 메모리 공간과 네임스페이스를 가진 독립 프로세스로 구현된다. 다만 AA 하나가 그런 프로세스를 여러 개 담을 수도 있고, 그 프로세스들은 Adaptive Platform 인스턴스 하나에 배치하거나 여러 인스턴스에 나눠 배치할 수 있다. AA는 Executable 여러 개로 이뤄질 수 있고, Executable은 대개 파일 시스템의 실행 파일에 해당한다. 운영체제는 Executable에서 프로세스를 만들고, Executable 하나에서 프로세스 여러 개를 만들 수 있다. functional cluster도 대개 프로세스로 구현된다.[@autosar-ap-exp-platformdesign-2025]

![[diagrams/adaptive-platform-machine-processes.svg]]

응용의 생명주기는 [[autosar-execution-management|Execution Management]]가 관리한다. Execution Management 자신을 뺀 모든 functional cluster도 Execution Management가 보기에는 응용이어서, 같은 방식으로 띄운다.[@autosar-ap-exp-platformdesign-2025]

AA는 운영체제 API로 POSIX의 단일 프로세스 프로필인 PSE51 인터페이스만 쓰도록 정의상 제한된다. AA의 이식성을 주고 응용 사이의 [[freedom-from-interference|FFI]]를 이루려고 PSE51을 골랐다. C++ 표준 라이브러리도 ARA의 일부로 쓸 수 있다. 반면 functional cluster인 프로세스는 쓸 수 있는 운영체제 서비스를 모두 써도 된다.[@autosar-ap-exp-platformdesign-2025] 운영체제 인터페이스 명세가 요구하는 PSE51 인터페이스는 [[rtos#차량용 RTOS|RTOS]]에서 다룬다.

### 지원 프로토콜

functional cluster마다 지원하는 프로토콜은 다음과 같다.[@autosar-ap-exp-platformdesign-2025]

| functional cluster                                                         | 지원 프로토콜                                                                                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Communication Management                                                   | [[some-ip\|SOME/IP]]와 [[some-ip-sd\|SOME/IP-SD]], Signal2Service, DDS(Data Distribution Service), zero-copy IPC |
| [[autosar-diagnostic-management\|Diagnostic Management]]                   | [[doip\|DoIP]], [[uds\|UDS]], [[service-oriented-vehicle-diagnostics\|SOVD]]                                     |
| [[intrusion-detection-system-manager\|Intrusion Detection System Manager]] | 침입 탐지 시스템 프로토콜                                                                                        |
| Sensor Interfaces                                                          | ISO 23150                                                                                                        |
| [[autosar-network-management\|Network Management]]                         | UdpNm([[udp\|UDP]] Network Management)                                                                           |
| [[autosar-time-synchronization\|Time Synchronization]]                     | [[ieee-802-1as\|gPTP]](IEEE 802.1AS)와, 이를 확장하고 프로파일링한 AUTOSAR 시간 동기화 프로토콜                  |
| Raw Data Stream                                                            | [[ipv4\|IPv4]]와 [[ipv6\|IPv6]] 위의 [[tcp\|TCP]]와 UDP, 데이터 링크 계층의 [[ieee-1722\|IEEE 1722]]             |
| [[autosar-log-and-trace\|Log and Trace]]                                   | AUTOSAR Log and Trace 프로토콜                                                                                   |

보안 기능으로 Communication Management는 [[secure-onboard-communication|SecOC]], [[transport-layer-security|TLS]]와 DTLS(Datagram Transport Layer Security), IPsec(Internet Protocol Security), [[ieee-802-1ae|MACsec]]을 지원한다.[@autosar-ap-exp-platformdesign-2025]

### 기능 안전

AUTOSAR는 Adaptive Platform을 [[functional-safety|기능 안전]] 프로젝트에 통합하는 것을 돕도록 안전 개요 설명 문서와 [[safety-requirement|안전 요구사항]] 문서를 펴낸다. Adaptive Platform을 쓴다고 [[iso-26262|ISO 26262]]를 준수하는 것은 아니고, Adaptive Platform의 안전 수단과 메커니즘을 쓰고도 안전하지 않은 시스템을 만들 수 있다. Adaptive Platform의 아키텍처는 잘해야 [[safety-element-out-of-context|SEooC]]로만 볼 수 있다.[@autosar-ap-exp-platformdesign-2025]

### 그 밖의 functional cluster

- **Core Types**: 여러 functional cluster가 공개 인터페이스에 함께 쓰는 클래스와 기능을 정한다. [[automotive-safety-integrity-level|ASIL]] 인증 C++ 컴파일러가 대개 예외를 지원하지 않아, Adaptive Platform은 C++ 예외 없이 오류를 다루는 개념을 두고 그 중심 타입으로 `ara::core::ErrorCode`와 `ara::core::Result`를 정한다.
- **Raw Data Stream**: 센서나 오디오·비디오 스트리밍처럼 외부 ECU와 원시 바이너리 데이터 스트림을 주고받는 독립 통신 API를 제공한다. 네트워크 계층의 IP 기반 프로토콜과 데이터 링크 계층의 IEEE 1722 프로토콜을 지원하고, 주고받는 데이터를 [[autosar-e2e-protection|E2E 보호]]하지 않으므로 그 보호는 응용 계층이 맡는다.
- **Automotive API Gateway**: Vehicle Services 묶음의 functional cluster로, 차량 밖과 안의 클라이언트에 VISS(Vehicle Information Service Specification)를 따르는 인터페이스를 준다. 그 인터페이스의 [[vehicle-signal-specification|VSS]] 데이터를 차량 안의 `ara::com` 서비스 인터페이스 데이터에 대응시킨다.
- **Sensor Interfaces**: ISO 23150을 따르는 공통 인터페이스로, 비플랫폼 서비스가 센서 정보를 `ara::com` 미들웨어로 클라이언트 응용에 내준다.
- **Safe Hardware Acceleration**: 응용과 다른 functional cluster가 하드웨어 가속기로 작업하는 API를 제공한다.[@autosar-ap-exp-platformdesign-2025]

IP 기반 프로토콜을 쓰는 Raw Data Stream은 TCP나 UDP를 쓰는 [[internet-protocol-suite|TCP/IP]] 소켓을, IEEE 1722 프로토콜을 쓰는 Raw Data Stream은 데이터 링크 소켓을 전송 계층으로 쓴다.[@autosar-ap-sws-rawdatastream-2025]

Safe Hardware Acceleration 개념의 생명주기 상태는 draft다. Hardware Test Manager는 하드웨어 시험을 위한 표준 인터페이스를 주는, R25-11에 새로 든 구성 요소로, 하드웨어 시험 패턴의 등록과 실행, 시험 결과의 수집과 보고를 맡는다.[@autosar-ap-tr-releaseoverview-2025]

AUTOSAR Adaptive Platform R25-11은 AUTOSAR 코드 기반의 최소 C++ 버전을 C++17로 올렸다. MISRA C++:2023에 공식적으로 맞추려는 것과, QNX v8처럼 C++14 지원을 그만두는 운영체제 공급사가 있다는 것이 그 까닭이다.[@autosar-ap-tr-releaseoverview-2025]

### 대상 ECU

AUTOSAR 소개 자료는 Adaptive Platform의 대상을 실시간 요구가 밀리초 수준이고, 안전 중요도가 ASIL B 이상으로 높으며, 연산 능력이 20,000 DMIPS(Dhrystone Million Instructions Per Second)를 넘는 ECU로 든다.[@autosar-exp-introduction-part1-2026] Classic Platform과의 차이는 [[autosar-classic-platform#Adaptive Platform과의 차이|AUTOSAR Classic Platform]]에서 다룬다.

## 개정 이력

- 2016년 10월: AUTOSAR가 Foundation 1.0.0을 내놓았다.
- 2017년 3월: AUTOSAR가 Adaptive Platform을 시작하며 17-03을 내놓았다.[@autosar-history-2026] Adaptive Platform R17-03은 Adaptive Platform 표준의 모든 문서가 처음 나온 릴리스였고, Foundation 1.1.0에 기댔다. 이 릴리스의 개요는 Adaptive Platform이 Classic Platform과 다른 표준화 방식으로 릴리스 전략, 소프트웨어 구현을 통한 규격 병행 검증, 모듈 대신 functional cluster 명세를 들었다. Adaptive Platform은 Development 단계 동안 6개월 주기로 새 판을 낼 계획이었고, 그동안 하위 호환을 보장하지 않았다. AUTOSAR는 내부 구현인 Adaptive Platform Demonstrator로 Adaptive Platform을 검증했고, 이를 모든 파트너에게 제공했다.[@autosar-ap-releaseoverview-r17-03-2017]
- 2017년 10월: 17-10이 나왔다.[@autosar-ap-tr-releaseoverview-2025]
- 2018년 3월, 2018년 10월, 2019년 3월: AUTOSAR가 18-03, 18-10, 19-03을 내놓았다.[@autosar-history-2026]
- 2019년 11월: R19-11부터 Adaptive Platform을 Classic Platform, Foundation과 함께 한 AUTOSAR 릴리스로 해마다 낸다. 그 전에는 Classic Platform R4.4.0과 Adaptive Platform R19-03까지 플랫폼마다 따로 냈고, 플랫폼 릴리스마다 Foundation 릴리스가 함께 나왔다.
- 2024년 11월: AUTOSAR가 R24-11을 안정화 릴리스로 정했다. 양산급 응용을 위한 안정되고 일관된 API와, 릴리스와 벤더 사이의 호환성을 목표로 했고, 남은 문제는 R25-11에서 풀었다.
- 2025년 11월 27일: R25-11이 나왔다. [[autosar#릴리스 생명주기|Evolution 단계]]의 minor release다. Safe Hardware Acceleration과 [[autosar-persistency#Remote Persistency|Remote Persistency]]의 소프트웨어 명세, Hardware Test Manager의 요구사항 명세가 새로 들어왔고, Manifest Specification과 [[autosar-identity-and-access-management|Identity and Access Management]]의 요구사항 명세가 빠졌다.[@autosar-ap-tr-releaseoverview-2025]

AUTOSAR는 Adaptive Platform R20-11을 따르는 구현인 CAPI(Common Adaptive Platform Implementation) 1.0을 내놓았고, CAPI 1.0은 일부 R23-11 인터페이스와도 호환된다. CAPI 1.0은 핵심 functional cluster 15개를 모두 구현하고, 코드 생성기의 소스 코드와 데모를 담는다.[@autosar-capi-release-2026]
