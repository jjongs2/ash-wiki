---
title: AUTOSAR 방법론
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR 방법론**은 [[autosar-classic-platform|AUTOSAR Classic Platform]]으로 시스템을 개발하는 주요 단계, 곧 [[virtual-functional-bus|VFB]] 정의부터 ECU 실행 파일 생성까지를 다루며, 역할이 수행해 산출물(work product)을 만드는 작업(activity)을 정한다. 완전한 프로세스 기술이 아니고 작업의 정확한 순서도 정하지 않으며, 작업이 어떤 산출물에 의존하는지만 정하는 산출물 흐름이다.[@autosar-cp-tr-methodology-2025]

## 작업 흐름

방법론이 보여 주는 주요 흐름은 시스템 개발, ECU Extract 추출, ECU 통합이다.[@autosar-cp-tr-methodology-2025]

- **시스템 개발**: VFB를 시스템으로 구체화한다. ECU와 네트워크의 토폴로지를 정하고, [[autosar-software-component|SW-C]]를 ECU에 배치하고, 통신 매트릭스를 도출해 System Description을 만든다.
- **ECU Extract 추출**: 시스템 설계가 끝나면 ECU마다 그 ECU에 관련된 부분을 뽑아 ECU Extract를 만든다.
- **ECU 통합**: ECU 설정 준비, BSW(Basic Software)와 [[autosar-rte|RTE]] 설정, BSW와 RTE 생성, 실행 파일 빌드의 네 작업으로 이루어진다. RTE를 생성한 뒤 전체 코드를 컴파일하고 링크해 실행 파일을 만든다.[@autosar-cp-tr-methodology-2025]

SW-C는 시스템 설계와 나란히, VFB가 정한 인터페이스를 바탕으로 구현한다. SW-C의 구현은 ECU 설정과 대부분 무관하다.[@autosar-cp-tr-methodology-2025]

![[diagrams/autosar-methodology-workflow.svg]]

## System description

**System Description**은 AUTOSAR 시스템 전체의 System Configuration을 기술하며, category가 `SYSTEM_DESCRIPTION`인 System 요소가 그 중심이다. System Template은 다섯 가지 주요 요소로 Topology, Software, Communication, Mapping, Mapping Constraints를 정한다. 최상위 요소 System은 Software, Mapping, Mapping Constraints를 직접 모으고, Topology와 Communication은 직접 담는 대신 ASAM FIBEX(Field Bus Exchange Format)의 요소를 참조한다. 앞의 네 요소가 기술하는 것은 아래와 같다.[@autosar-cp-tps-systemtemplate-2025]

| 요소          | 기술하는 것                                                                             |
| ------------- | --------------------------------------------------------------------------------------- |
| Topology      | 어떤 ECU가 있고 어떻게 이어지는지, 곧 ECU 인스턴스와 통신 클러스터                      |
| Software      | 시스템의 모든 SW-C를 계층 구조로 담은 루트 소프트웨어 합성                              |
| Communication | SystemSignal, ISignal, PDU(Protocol Data Unit), 프레임을 주요 요소로 하는 통신 매트릭스 |
| Mapping       | SW-C를 ECU에 배치하는 것, 데이터 요소를 시그널에 대응시키는 것, 매핑 제약               |

![[diagrams/autosar-system-template-elements.svg]]

## ECU extract

**ECU Extract**는 전체 System Description 가운데 한 ECU에 해당하는 부분을 보는 기술이고, System Template의 System 요소(category `ECU_EXTRACT`)로 기술한다. ECU Extract는 완전히 분해되어 atomic SW-C만 담으며, ECU 설정의 기반이 된다.[@autosar-cp-tps-systemtemplate-2025] 방법론에서 ECU Extract를 만드는 과정에는 ECU의 소프트웨어 합성을 뽑아 평탄화하는 작업이 있다.[@autosar-cp-tr-methodology-2025]

## ECU 설정

ECU 설정의 입력은 ECU Extract와 BSW Module Delivered Bundle이다.[@autosar-cp-tps-ecuconfiguration-2025] 설정의 결과인 **ECU Configuration Values**는 한 ECU의 모든 설정값을 모은 것이고, RTE를 포함한 모듈마다의 설정을 담는다.[@autosar-cp-tr-methodology-2025] AUTOSAR 용어집은 ECU 설정 작업의 이 출력을 ECU Configuration Description이라는 표제어로 싣는다.[@autosar-fo-tr-glossary-2025]

**ECU Configuration Parameter Definition**은 설정 파라미터가 있는지와 그 타입, 속성을 정하고, 컨테이너와 파라미터로 구조를 짠다. 어떤 컨테이너에 어떤 파라미터가 오는지, 값의 범위, 개수, 설정 클래스 같은 제약이 여기에 담긴다. AUTOSAR가 내놓는 표준 모듈 정의가 있고, 벤더는 여기에 파라미터, 컨테이너, 참조를 더한 벤더별 모듈 정의를 둔다.[@autosar-cp-tps-ecuconfiguration-2025]

### 설정 클래스

**설정 클래스**는 파라미터를 어느 단계에서 설정하느냐에 따라 pre-compile time, link time, post-build time으로 나뉜다.[@autosar-cp-tr-methodology-2025]

- **Pre-compile time**: 소스 코드를 컴파일하기 전에 값을 정한다. 컴파일한 뒤에는 바꿀 수 없어, 값을 바꾸려면 다시 컴파일해야 한다.
- **Link time**: BSW 모듈의 목적 코드가 설정 일부를 다른 목적 파일에서 받거나 링커 옵션으로 받는다. 모듈을 목적 코드로 통합자에게 넘길 때 주로 쓴다.
- **Post-build time**: BSW 모듈이나 ECU 소프트웨어를 빌드한 뒤에 설정한다. 별도 파일을 ECU 메모리에 내려받아, 다시 컴파일하거나 빌드하지 않고 설정을 바꾼다.[@autosar-cp-tr-methodology-2025]

![[diagrams/autosar-configuration-classes.svg]]

Layered Software Architecture 설명서에 따르면 pre-compile time 설정에 쓰는 `#define`은 대개 상수나 포인터로 값을 읽는 것보다 효율적인 코드를 낸다. 여러 설정 세트는 설정 클래스와 상관없이 variation point로 둘 수 있고, variation point가 실행 중에 묶이면 쓸 세트를 실행 중에 고른다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## AUTOSAR XML

XML(Extensible Markup Language)로 AUTOSAR 모델을 나타낸 것을 **AUTOSAR XML 기술**이라 한다. 각 파일은 AUTOSAR XML Schema에 맞아야 하고, 이 스키마는 AUTOSAR 메타모델에서 도출되며 AUTOSAR의 데이터 교환 형식을 정한다.[@autosar-fo-tr-glossary-2025] 방법론에서 SW-C 기술, System Description, ECU Extract, 표준과 벤더별 모듈 정의는 종류가 AUTOSAR XML인 산출물이다.[@autosar-cp-tr-methodology-2025] ECU Configuration Values는 ARXML 파일로 저장되고, Parameter Definition도 XML 파일이다. AUTOSAR는 AUTOSAR 호환 도구가 시스템 개발 중에 정보를 정의하고 공유하는 기술로 XML을 골랐다.[@autosar-cp-tps-ecuconfiguration-2025]

## 네트워크 기술 형식

System Template은 통신과 토폴로지 기술에 ASAM FIBEX의 기술을 담고, AUTOSAR의 요구에 맞게 PDU 개념 등을 더해 확장했다. FIBEX는 버스 통신 시스템을 다루는 도구 사이의 데이터 교환을 위한 XML 형식이다.[@autosar-cp-tps-systemtemplate-2025] ASAM MCD-2 NET(FIBEX) 4.1.2는 [[flexray|FlexRay]], [[can|CAN]], [[lin|LIN]], [[ethernet|이더넷]] 등을 기술 확장으로 다룬다.[@asam-mcd-2-net-2017]

Vector의 [[signal-based-communication#통신 기술 파일|DBC 데이터베이스]]는 CAN·[[can-fd|CAN FD]] 네트워크, 버스에 이어진 ECU, 메시지와 시그널을 기술한다.[@vector-candb-admin-factsheet-2024] LIN을 규정하는 ISO 17987 시리즈 가운데 ISO 17987-2:2025는 약어 LDF를 LIN description file로 정의한다.[@iso-17987-2-obp-2025] Vector DaVinci Configurator Classic의 Ecu Extract Producer는 DBC 같은 기존 형식의 파일을 ECU Extract로 변환한다.[@vector-davinci-configurator-classic-ecuxpro-2026] ECU Extract를 만들 때 DBC, LDF, FIBEX 같은 기존 통신 파일을 함께 넣으면, 따로 설치하는 Legacy Converter가 이 파일들을 ARXML로 변환해 함께 넣은 ARXML 파일에 합친다.[@vector-davinci-configurator-classic-invariant-ecu-extract-2026]
