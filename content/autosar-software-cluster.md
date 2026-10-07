---
title: AUTOSAR software cluster
tags:
  - platform/autosar
verified: 2026-10-07
---

AUTOSAR R25-11 용어집은 [[autosar-classic-platform|Classic Platform]]의 **Software Cluster**를 ECU에 소프트웨어 일부를 정적으로 배치하는 데 관련된 AUTOSAR 산출물을 묶는 단위로 정의한다. Software Cluster는 저마다 따로 빌드하는 단위이고, 그 빌드의 결과물이 Binary Object다. cluster라는 말은 [[implementation-conformance-class#등급|ICC2]]에서도 쓰지만, 그때는 BSW(Basic Software) 모듈의 묶음을 가리킨다.[@autosar-fo-tr-glossary-2025]

AUTOSAR R25-11 [[autosar-layered-architecture|Layered Software Architecture]]는 Software Cluster로 한 덩어리인 Classic Platform 구조를 작은 단위로 나누고, 각 Software Cluster를 따로 빌드하고 따로 갱신할 수 있게 한다. Software Cluster 사이의 연결은 Binary Object와 그 Binary Manifest에 담긴 정보로 만든다. 이 방식은 주소 가상화가 없는 것처럼 지금 마이크로컨트롤러 구조의 한계를 고려한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## Host와 Application Software Cluster

AUTOSAR R25-11의 Software Cluster Connection 명세는 Software Cluster를 역할에 따라 아래처럼 나눈다.[@autosar-cp-sws-softwareclusterconnection-2025]

- **Host Software Cluster**: BSW의 대부분, 특히 [[autosar-os|OS]]와 [[microcontroller-abstraction-layer|MCAL]] 같은 마이크로컨트롤러 의존 하위 층 BSW 모듈을 담는 Software Cluster로, 하나뿐이다.
- **Application Software Cluster**: 주로 [[autosar-software-component|SW-C]]를 담고, 서비스 모듈이나 트랜스포머 같은 고른 BSW 모듈만 함께 담는 Software Cluster다.
- **Substitution Software Cluster**: 버그를 고치려고 다른 Software Cluster가 제공하는 자원을 덮어쓸 수 있는 Software Cluster로, 하나뿐이다.[@autosar-cp-sws-softwareclusterconnection-2025]

Substitution Software Cluster는 개발 중에 한 Software Cluster의 출력을 잠시 덮어쓰려는 것으로, 양산 시스템에서는 지원하지 않는다. 고친 자원을 원래 자원과 같은 global resource Id로 제공하면, 그 자원을 요구하는 Software Cluster는 모두 원래 제공자 대신 Substitution Software Cluster에 이어진다.[@autosar-cp-sws-softwareclusterconnection-2025]

## Software Cluster Connection

AUTOSAR R25-11의 Software Cluster Connection 명세는 **Software Cluster Connection**(SwCluC)을 같은 machine에 배치된 Binary Object를 잇고, Application Software Cluster에 없는 BSW 모듈 가운데 통합한 소프트웨어가 그 인터페이스를 요구하는 것을 Proxy Module로 대신하고, [[autosar-rte|RTE]]와 함께 RTE Implementation Plug-In으로 Software Cluster 사이의 [[virtual-functional-bus|VFB]] 통신을 구현하는 BSW 모듈로 정의한다.[@autosar-cp-sws-softwareclusterconnection-2025]

AUTOSAR R25-11 Layered Software Architecture는 SwCluC를 세 부분으로 나눈다. Cross Software Cluster Communication(SwCluC_Xcc)은 Software Cluster 사이의 통신 방식과 RTE 쪽 인터페이스를 구현한다. Proxy Module은 Software Cluster 안에 없는 BSW 모듈과 그 API(Application Programming Interface)를 추상화한다. Binary Manifest는 Software Cluster를 잇는 데 필요한 인터페이스의 바이너리 메타 정보를 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

### Binary Manifest

AUTOSAR R25-11의 Software Cluster Connection 명세는 **Binary Manifest**를 Software Cluster의 Binary Object가 밖에 내놓는 잘 정의된 인터페이스로 정의한다. Software Cluster 안의 자원에 접근하고 Software Cluster끼리 제공 자원과 요구 자원을 잇는 데 필요한 정보를 담으며, 여기서 자원은 sender-receiver 인터페이스나 NV(Non-Volatile) 블록처럼 소프트웨어가 동작하는 데 필요한 것이면 무엇이든 된다. Binary Manifest는 데이터·함수 주소처럼 빌드에 따라 달라지는 정보를 담으므로 Software Cluster를 빌드할 때 만들어지고, 대상 machine이 쉽게 해석할 수 있는 꼴이다. 연결에는 자원마다 명시적으로 준 고유 식별자를 쓰며, 호환되는 인터페이스끼리만 이어지도록 인터페이스 속성의 해시로 된 보호 값을 둔다. SwCluC의 Binary Manifest는 헤더 파일 `SwCluC_BManif.h`를 준다.[@autosar-cp-sws-softwareclusterconnection-2025]

### 연결

Software Cluster를 잇는 방식은 둘이다. On-board 방식에서는 따로 빌드한 Binary Object를 대상 ECU에 쓴 뒤, 재프로그래밍 단계에 ECU에서 도는 On-board Software Cluster Connector가 연결 결과를 Binary Manifest의 고칠 수 있는 영역에 저장한다. Off-board 방식에서는 ECU 밖의 도구인 Off-board Software Cluster Connector가 Binary Object 파일을 읽어 연결 결과를 파일에 저장하므로, ECU에는 이미 이어진 Binary Object를 쓴다. Binary Manifest에 기댄 직접 연결은 같은 machine 안에서만 하고, 한 마이크로컨트롤러 위의 서로 다른 가상 machine 사이에서는 하지 않는다.[@autosar-cp-sws-softwareclusterconnection-2025]

Software Cluster Connector는 요구 자원과 제공 자원의 machine Id, global resource Id, resource type Id, 보호 값, handle 수가 모두 맞고, Notifier Handle이 있으면 제공 자원에 요구 자원 몫의 Notifier Handle Set이 있을 때 둘을 잇는다. global resource Id 0은 유효한 Id가 없다는 뜻이어서 잇지 않는다. 짝을 찾지 못한 자원에는 Binary Manifest에 미리 둔 기본 handle을 넣고 연결되지 않은 것으로 표시한다.[@autosar-cp-sws-softwareclusterconnection-2025]

AUTOSAR R25-11 Layered Software Architecture는 이 연결 과정에서 요구하는 쪽을 찾지 못한 인터페이스는 열린 채로 두고, 제공하는 쪽을 찾지 못한 인터페이스는 열린 채로 두되 기본값을 준다고 둔다. 그래서 인터페이스가 바뀌어도 Software Cluster를 갱신할 수 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

### Proxy Module

AUTOSAR R25-11의 Software Cluster Connection 명세는 **Proxy Module**을 Application Software Cluster에서 BSW 모듈을 대신하는 모듈로 정의하고, High Proxy Module과 Low Proxy Module로 나눈다. Application Software Cluster에 놓이는 High Proxy Module은 위 층이나 같은 층의 모듈에 인터페이스를 주고, Binary Manifest를 거쳐 Host Software Cluster에 놓이는 Low Proxy Module로 이어진다. Proxy Module에는 OS, [[nvram-manager|NvM]], [[autosar-com|Com]], Dcm(Diagnostic Communication Manager), [[diagnostic-event-manager|Dem]], [[diagnostic-event-manager#FiM|FiM]]의 것이 있다. Low Proxy Module은 저마다 대신하는 BSW 모듈에 기댄다.[@autosar-cp-sws-softwareclusterconnection-2025]

![[diagrams/software-cluster-proxy-binary-manifest.svg]]

AUTOSAR R25-11은 Software Cluster Connection의 Com proxy와 LdCom proxy를 공통 Com Proxy 하나로 합쳤다.[@autosar-cp-tr-releaseoverview-2025]

## Adaptive Platform의 Software Cluster와의 차이

AUTOSAR R25-11 용어집은 [[autosar-adaptive-platform|Adaptive Platform]]의 Software Cluster를 Adaptive Platform Machine에 배치하는 데 관련된 AUTOSAR 산출물을 묶는 것으로 따로 정의한다. 그 내용은 범주에 따라 달라, 실행 파일(Adaptive Platform Application), Functional Cluster, [[autosar-manifest|매니페스트]], 영속 저장소 데이터베이스, 트랜스포머나 암호 같은 플랫폼 라이브러리, 부트로더를 담을 수 있다. 이 Software Cluster는 [[autosar-update-and-configuration-management|UCM]]이 Software Package에 담아 Machine에 배치하며, Machine에서 도는 응용을 저마다 갱신할 수 있는 cluster로 나누는 데 쓴다. Classic Platform의 Software Cluster가 ECU에 정적으로 배치하는 빌드 단위인 것과 다르다.[@autosar-fo-tr-glossary-2025]
