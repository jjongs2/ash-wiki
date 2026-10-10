---
title: AUTOSAR Manifest
tags:
  - platform/autosar
verified: 2026-10-07
---

AUTOSAR R25-11 용어집은 **Manifest**를 [[autosar-adaptive-platform|AUTOSAR Adaptive Platform]] 제품의 설정을 돕도록 만들어 그 제품에 올리는 AUTOSAR 모델 기술의 한 부분으로 정의한다. Manifest는 그것이 적용되는 실행 코드를 담은 바이너리 파일 같은 다른 산출물과 함께 올리기도 한다. Manifest라는 말은 흔히 소프트웨어와 함께 실려 그 소프트웨어를 현장에 배치하는 데 쓰는 설정 내용을 가리킨다.[@autosar-fo-tr-glossary-2025]

AUTOSAR R25-11 Adaptive Platform 설계 설명서는 Manifest의 쓰임을 Adaptive Platform으로 한정한다. 그렇다고 Adaptive Platform을 대상으로 한 개발 프로젝트에서 만든 AUTOSAR 모델 파일(ARXML)이 모두 Manifest인 것은 아니다. 차량에는 대개 [[autosar-classic-platform|Classic Platform]]으로 만든 ECU도 함께 있어서, 차량 전체의 시스템 설계는 두 플랫폼의 ECU를 모두 다뤄야 하기 때문이다.[@autosar-ap-exp-platformdesign-2025]

Uptane의 차량 버전 매니페스트는 이와 다른 것으로, [[uptane|Uptane]]에서 다룬다.

## 종류

Manifest와 관련된 모델 요소는 개발 프로젝트의 전혀 다른 단계에서 쓰인다. 그래서 Application Design과 따로 Manifest를 셋으로 나눈다.[@autosar-ap-exp-platformdesign-2025]

- **Application Design**: Adaptive Platform용 응용 소프트웨어를 만드는 데 드는 설계 측면을 모두 기술한다. [[autosar-adaptive-platform#Machine과 프로세스|Machine]]에 반드시 배치하지는 않으며, Execution Manifest와 Service Instance Manifest에서 응용 소프트웨어의 배치를 정하는 것을 돕는다.
- **Execution Manifest**: Adaptive Platform에서 도는 응용의 배치 정보를 기술한다. 실제 실행 코드와 함께 묶여, 그 코드를 Machine에 통합하는 것을 돕는다.
- **Service Instance Manifest**: [[service-oriented-communication|서비스 지향 통신]]을 하부 전송 프로토콜의 요구에 맞춰 어떻게 설정하는지 기술한다. 그 서비스 지향 통신을 쓰는 실행 코드와 함께 묶인다.
- **Machine Manifest**: 응용 없이 Adaptive Platform을 돌리는 Machine 자체의 설정에 관한 배치 내용을 기술한다. Adaptive Platform 인스턴스를 세우는 소프트웨어와 함께 묶인다.[@autosar-ap-exp-platformdesign-2025]

![[diagrams/autosar-manifest-kinds.svg]]

정의하고 쓰는 시점이 서로 달라서, 대개 세 Manifest의 내용은 서로 다른 물리 파일에 저장한다.[@autosar-ap-exp-platformdesign-2025]

## 담는 내용

### Application Design

Application Design은 데이터 타입, 서비스 지향 통신의 중심 요소인 서비스 인터페이스, 영속 데이터와 파일에 접근하는 [[autosar-persistency|Persistency]] 인터페이스, 데이터를 네트워크로 나르려고 직렬화하는 방식, 클라이언트와 서버의 능력 등을 다룬다. 또 응용이 서비스 지향 통신, 영속 저장소, 파일, 암호 소프트웨어, [[autosar-platform-health-management|Platform Health Management]], 시간 기준에 어떻게 접근하는지를 정한다. 여기서 정한 산출물은 특정 배치와 상관없으므로, 응용 구현을 여러 배치 시나리오에 재사용하기 쉽다.[@autosar-ap-exp-platformdesign-2025]

### Execution Manifest

Execution Manifest는 응용을 Adaptive Platform에 실제로 배치하는 데 필요한 정보를 준다. 응용 소프트웨어 코드를 배치 시나리오에서 되도록 떼어 내어 여러 시나리오에서 재사용할 수 있게 하려는 것이다. Execution Manifest로 응용의 인스턴스화를 제어하므로, 같은 응용 소프트웨어를 한 Machine에서 여러 번 인스턴스화하거나 여러 Machine에 배치해 Machine마다 인스턴스화할 수 있다. Execution Manifest가 다루는 것은 아래 둘이다.[@autosar-ap-exp-platformdesign-2025]

- **시작 설정**: 응용 인스턴스를 어떻게 시작할지를 정하고, 시작 옵션과 접근 역할을 담는다. 시작 설정마다 Machine State나 Function Group State에 따를 수 있다.
- **자원 관리**: 특히 resource group 배정을 다룬다.[@autosar-ap-exp-platformdesign-2025]

Machine State와 Function Group State는 [[autosar-state-management|State Management]]에서, resource group은 [[autosar-execution-management#Resource group|Execution Management]]에서 다룬다.

Execution Manifest의 최상위 요소는 Process다. Adaptive Platform에서 배치의 단위가 실행 중에 POSIX 프로세스가 되는 바이너리이기 때문이다. 응용 코드는 구체적인 서비스 인스턴스 대신 PortPrototype을 그 정보의 상징으로 쓰고, 서비스 인스턴스를 구체적으로 정하는 일은 Service Instance Manifest에 맡긴다.[@autosar-ap-tps-manifestspecification-2025]

### Service Instance Manifest

네트워크에서 서비스 지향 통신을 구현하는 데 필요한, [[some-ip|SOME/IP]] 같은 통신 기술에 고유한 설정은 Service Instance Manifest에 둔다. 통신 인프라는 서비스의 제공자와 요청자 쪽에서 똑같이 동작해야 하므로, 서비스 구현이 양쪽에서 호환되어야 한다. Service Instance Manifest가 다루는 것은 아래와 같다.[@autosar-ap-exp-platformdesign-2025]

- **서비스 인터페이스 배치**: 서비스를 특정 통신 기술에서 어떻게 나타낼지 정한다.
- **서비스 인스턴스 배치**: 제공하거나 요구하는 서비스 인스턴스마다 통신 기술에 필요한 자격 정보를 정한다.
- E2E 보호, 보안 보호, Log and Trace의 설정[@autosar-ap-exp-platformdesign-2025]

ApApplicationEndpoint는 EthernetCommunicationConnector의 [[udp|UDP]]나 [[tcp|TCP]] 포트를 정하고, 같은 커넥터가 unicastNetworkEndpoint 역할로 가리키는 NetworkEndpoint와 함께 네트워크 통신 경로의 로컬 종단, 곧 소켓을 이룬다.[@autosar-ap-tps-manifestspecification-2025]

### Machine Manifest

Machine Manifest로는 특정 하드웨어에서 도는 Adaptive Platform 인스턴스를 설정한다. Machine Manifest가 다루는 것은 아래와 같다.[@autosar-ap-exp-platformdesign-2025]

- 네트워크 연결 설정과 네트워크 기술의 기본 자격 정보. 예: [[ethernet|이더넷]]의 고정 IP(Internet Protocol) 주소나 DHCP(Dynamic Host Configuration Protocol) 설정
- 서비스 발견 기술의 설정. 예: SOME/IP가 쓸 IP 포트와 IP 멀티캐스트 주소
- 쓰는 Machine State와 Function Group의 정의
- functional cluster 구현의 설정. 예: 운영체제가 특정 권한을 가진 운영체제 사용자 목록을 제공하는 것
- 암호 플랫폼 모듈, Platform Health Management, 시간 동기화의 설정
- 쓸 수 있는 하드웨어 자원의 기록. 예: RAM(Random-Access Memory) 용량, 프로세서 코어 수[@autosar-ap-exp-platformdesign-2025]

## Processed Manifest

AUTOSAR R25-11 용어집은 **Processed Manifest**를 Adaptive Platform 제품에 구현 고유의 형식으로 저장한 Manifest로 정의한다.[@autosar-fo-tr-glossary-2025]

## Adaptive Platform 방법론

AUTOSAR R25-11 Adaptive Platform 설계 설명서는 기능 응용을 분산해 독립적이고 애자일하게 개발하도록 Adaptive Platform 방법론을 둔다. 이 방법론은 서비스, 응용, Machine과 그 설정 같은 산출물을 기술하는 작업 산출물과, 이 작업 산출물이 제품 개발의 여러 활동 사이에서 설계 정보를 주고받는 작업을 표준화한다.[@autosar-ap-exp-platformdesign-2025]

AUTOSAR 방법론은 Application Design과 여러 Manifest 밖에도, 한 시스템에 쓰일 두 AUTOSAR 플랫폼의 소프트웨어 컴포넌트를 한 모델에 기술하는 System Design을 지원한다. 플랫폼이 다른 소프트웨어 컴포넌트끼리 서비스 지향으로 통신할 수 있고, 시그널을 서비스에 대응시켜 서비스 지향 통신과 [[signal-based-communication|시그널 기반 통신]]을 잇는 것도 기술할 수 있다.[@autosar-ap-exp-platformdesign-2025] Classic Platform의 방법론은 [[autosar-methodology|AUTOSAR 방법론]]에서 다룬다.
