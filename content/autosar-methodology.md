---
title: AUTOSAR 방법론
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR 방법론**은 [[autosar-classic-platform|AUTOSAR Classic Platform]]으로 시스템을 개발하는 주요 단계, 곧 [[virtual-functional-bus|VFB]] 정의부터 ECU 실행 파일 생성까지를 다루며, 역할이 수행해 산출물(work product)을 만드는 작업(activity)을 정한다. 완전한 프로세스 기술이 아니고 작업의 정확한 순서도 정하지 않으며, 작업이 어떤 산출물에 의존하는지만 정하는 산출물 흐름이다.[@autosar-cp-tr-methodology-2025] [[autosar-adaptive-platform|Adaptive Platform]]의 방법론은 [[autosar-manifest#Adaptive Platform 방법론|AUTOSAR Manifest]]에서 다룬다.

## 작업 흐름

방법론이 보여 주는 주요 흐름은 시스템 개발, ECU Extract 추출, ECU 통합이다.[@autosar-cp-tr-methodology-2025]

- **시스템 개발**: VFB를 시스템으로 구체화한다. ECU와 네트워크의 토폴로지를 정하고, [[autosar-software-component|SW-C]]를 ECU에 배치하고, 통신 매트릭스를 도출해 System Description을 만든다.
- **ECU Extract 추출**: 시스템 설계가 끝나면 ECU마다 그 ECU에 관련된 부분을 뽑아 ECU Extract를 만든다.
- **ECU 통합**: ECU 설정 준비, BSW(Basic Software)와 [[autosar-rte|RTE]] 설정, BSW와 RTE 생성, 실행 파일 빌드의 네 작업으로 이루어진다. RTE를 생성한 뒤 전체 코드를 컴파일하고 링크해 실행 파일을 만든다.[@autosar-cp-tr-methodology-2025]

SW-C는 시스템 설계와 나란히, VFB가 정한 인터페이스를 바탕으로 구현한다. SW-C의 구현은 ECU 설정과 대부분 무관하다.[@autosar-cp-tr-methodology-2025]

![[diagrams/autosar-methodology-workflow.svg]]

AUTOSAR가 처음 제안한 방법은 차량 시스템 기술에서 시작해 기능을 각 ECU에 나누고, 그 결과로 네트워크의 통신 매트릭스를 얻는 top-down 접근이다. 실무에서는 늘 이렇게 할 수 있지는 않아, 기존 통신 매트릭스와 ECU 설정의 수동 설정만으로 개별 ECU를 정하는 프로젝트도 있다.[@autosar-standards-classic-platform-2026]

### System description

**System Description**은 AUTOSAR 시스템 전체의 System Configuration을 기술하며, category가 `SYSTEM_DESCRIPTION`인 System 요소가 그 중심이다. System Template은 다섯 가지 주요 요소로 Topology, Software, Communication, Mapping, Mapping Constraints를 정한다. 최상위 요소 System은 Software, Mapping, Mapping Constraints를 직접 모으고, Topology와 Communication은 직접 담는 대신 ASAM FIBEX(Field Bus Exchange Format)의 요소를 참조한다. 앞의 네 요소가 기술하는 것은 아래와 같다.[@autosar-cp-tps-systemtemplate-2025]

| 요소          | 기술하는 것                                                                             |
| ------------- | --------------------------------------------------------------------------------------- |
| Topology      | 어떤 ECU가 있고 어떻게 이어지는지, 곧 ECU 인스턴스와 통신 클러스터                      |
| Software      | 시스템의 모든 SW-C를 계층 구조로 담은 루트 소프트웨어 합성                              |
| Communication | SystemSignal, ISignal, PDU(Protocol Data Unit), 프레임을 주요 요소로 하는 통신 매트릭스 |
| Mapping       | SW-C를 ECU에 배치하는 것, 데이터 요소를 시그널에 대응시키는 것, 매핑 제약               |

![[diagrams/autosar-system-template-elements.svg]]

### ECU extract

**ECU Extract**는 전체 System Description 가운데 한 ECU에 해당하는 부분을 보는 기술이고, System Template의 System 요소(category `ECU_EXTRACT`)로 기술한다. ECU Extract는 완전히 분해되어 atomic SW-C만 담으며, ECU 설정의 기반이 된다.[@autosar-cp-tps-systemtemplate-2025] 방법론에서 ECU Extract를 만드는 과정에는 ECU의 소프트웨어 합성을 뽑아 평탄화하는 작업이 있다.[@autosar-cp-tr-methodology-2025]

### ECU 설정

ECU 설정의 입력은 ECU Extract와 BSW Module Delivered Bundle이다.[@autosar-cp-tps-ecuconfiguration-2025] 설정의 결과인 **ECU Configuration Values**는 한 ECU의 모든 설정값을 모은 것이고, RTE를 포함한 모듈마다의 설정을 담는다.[@autosar-cp-tr-methodology-2025] AUTOSAR 용어집은 이 산출물을 ECU Configuration Description이라는 표제어로 싣는다.[@autosar-fo-tr-glossary-2025]

**ECU Configuration Parameter Definition**은 설정 파라미터가 있는지와 그 타입, 속성을 정하고, 컨테이너와 파라미터로 구조를 짠다. 어떤 컨테이너에 어떤 파라미터가 오는지, 값의 범위, 개수, 설정 클래스 같은 제약이 여기에 담긴다. AUTOSAR가 내놓는 표준 모듈 정의가 있고, 벤더는 여기에 파라미터, 컨테이너, 참조를 더한 벤더별 모듈 정의를 둔다.[@autosar-cp-tps-ecuconfiguration-2025]

**설정 클래스**는 파라미터를 어느 단계에서 설정하느냐에 따라 pre-compile time, link time, post-build time으로 나뉜다.[@autosar-cp-tr-methodology-2025]

- **Pre-compile time**: 소스 코드를 컴파일하기 전에 값을 정한다. 컴파일한 뒤에는 바꿀 수 없어, 값을 바꾸려면 다시 컴파일해야 한다.
- **Link time**: BSW 모듈의 오브젝트 코드가 설정 일부를 다른 오브젝트 파일에서 받거나 링커 옵션으로 받는다. 모듈을 오브젝트 코드로 통합자에게 넘길 때 주로 쓴다.
- **Post-build time**: BSW 모듈이나 ECU 소프트웨어를 빌드한 뒤에 설정한다. 별도 파일을 ECU 메모리에 내려받아, 다시 컴파일하거나 빌드하지 않고 설정을 바꾼다.[@autosar-cp-tr-methodology-2025]

![[diagrams/autosar-configuration-classes.svg]]

[[autosar-layered-architecture|Layered Software Architecture]] 설명서에 따르면 pre-compile time 설정에 쓰는 `#define`은 대개 상수나 포인터로 값을 읽는 것보다 효율적인 코드를 낸다. 여러 설정 세트는 설정 클래스와 상관없이 variation point로 둘 수 있고, variation point가 실행 중에 묶이면 쓸 세트를 실행 중에 고른다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

pre-compile time 설정은 모듈의 설정 파일 두 개(`*_Cfg.h`, `*_Cfg.c`)나 코드 생성으로 하며, `*_Cfg.h`에는 매크로와 `#define`을, `*_Cfg.c`에는 상수를 둔다. post-build time 설정 데이터는 따로 다시 올릴 수 있는 메모리 구역의 외부 상수 구조체에 두고, 모듈은 초기화 때 기본 구조체를 가리키는 포인터를 받는다. 설정 세트가 여럿이면 초기화할 때마다 그 가운데 하나를 고를 수 있다. post-build 설정의 메모리 배치 예에서 [[ecu-state-manager|EcuM]]은 모든 모듈 설정의 주소가 든 색인을 알고, 모듈을 초기화할 때 그 모듈 설정 데이터의 시작 주소를 넘겨 설정 데이터의 크기가 달라질 수 있게 한다. 설정 세트가 여럿이면 색인이 세트마다 주소 목록을 담고, EcuM은 고른 세트의 항목을 가리키는 포인터를 넘긴다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

BSW 모듈에는 쓰임새마다 다른 설정 가능성을 주는 설정 variant가 셋 있다. `VARIANT-PRE-COMPILE`은 파라미터를 pre-compile time에만, `VARIANT-LINK-TIME`은 pre-compile time이나 link time에, `VARIANT-POST-BUILD`는 pre-compile time, link time, post-build time 가운데 하나에 정할 수 있게 한다. 한 variant 안에서 파라미터 하나는 설정 클래스 하나에만 속한다. BSW 모듈의 설정 소스 파일 이름에는 [[autosar#규격 항목 ID와 API 명세|모듈 구현 접두어]] 뒤에 설정 클래스에 따라 `_Cfg`, `_Lcfg`, `_PBcfg`를 붙이며, 예를 들어 [[autosar-com|COM]] 모듈의 파일은 `Com_Cfg.c`, `Com_Lcfg.c`, `Com_PBcfg.c`다.[@autosar-cp-sws-bswgeneral-2025]

## Variant handling

variant handling은 Generic Structure Template이 정한다. variant handling에서 변형 대상으로 지정한 AUTOSAR 메타모델의 자리를 **variation point**라 하며, variation point는 그 변형이 활성인 조건과 변형을 풀 때를 정하는 binding time으로 이뤄진다. 모델에 variation point가 많아도 실제로 쓰는 조합은 적어서, 그 조합 하나하나를 미리 정한 variant(predefined variant)로 둔다. binding time은 시점이 아니라 개발 단계를 뜻하며, 이른 것부터 BlueprintDerivationTime, SystemDesignTime, CodeGenerationTime, PreCompileTime, LinkTime, PostBuild가 있다. variation point마다 메타모델이 정한 latest binding time이 있어 그보다 늦게 풀 수 없고, 모델에서 variation point에 정하는 실제 binding time은 이보다 이를 수 있다.[@autosar-cp-tr-methodology-2025]

![[diagrams/variant-binding-times.svg]]

AUTOSAR R25-11 용어집은 시스템이 variant의 집합을 기술하는 성질을 **variability**로, 모든 속성이 정해지고 골라져 그 binding time에 대해 더는 variability가 없는 시스템의 구체적 실현을 **variant**로 정의한다. **코드 변형**(code variant coding)은 외부 요구에 따라 기능 대안을 골라 소프트웨어를 맞추는 것으로, 늘 pre-compile time이나 link time에 하며 C 언어에서는 `#if`나 `#ifdef`로 만들 수 있다. **데이터 변형**(data variant coding)은 외부 요구에 따라 특성 데이터를 설정해 소프트웨어를 맞추는 것으로, 설정 파라미터 세트가 여럿 필요하고 생산 라인 끝 프로그래밍이나 정비소 프로그래밍으로 variant를 고른다. **calibration**은 제어 기능을 맡은 소프트웨어 컴포넌트의 파라미터를 조정하는 것으로, RTE 위의 소프트웨어와 [[ecu-abstraction-layer|ECU 추상화]], [[autosar-layered-architecture#층 사이 접근|Complex Driver]]만 calibration할 수 있고 늘 post-build time에 한다. variant coding과 달리 calibration은 소프트웨어 기능 자체를 바꾸지 않고, 특성 데이터를 하드웨어·소프트웨어 환경에 맞추기만 한다.[@autosar-fo-tr-glossary-2025]

## AUTOSAR XML

XML로 AUTOSAR 모델을 나타낸 것을 **AUTOSAR XML 기술**이라 한다. 각 파일은 AUTOSAR XML Schema에 맞아야 하고, 이 스키마는 AUTOSAR 메타모델에서 도출되며 AUTOSAR의 데이터 교환 형식을 정한다.[@autosar-fo-tr-glossary-2025] 방법론에서 SW-C 기술, System Description, ECU Extract, 표준과 벤더별 모듈 정의는 종류가 AUTOSAR XML인 산출물이다.[@autosar-cp-tr-methodology-2025] ECU Configuration Values는 ARXML 파일로 저장되고, Parameter Definition도 XML 파일이다. AUTOSAR는 AUTOSAR 호환 도구가 시스템 개발 중에 정보를 정의하고 공유하는 기술로 XML을 골랐다.[@autosar-cp-tps-ecuconfiguration-2025]

AUTOSAR R25-11 용어집은 **AUTOSAR 메타모델**을 AUTOSAR 시스템과 관련 산출물을 기술하는 언어를 정하는 UML 2.0 모델로 정의한다. **AUTOSAR 도구**는 방법론이 정한 작업을 하나 이상 지원하는 소프트웨어 도구이고, 지원하는 작업에 따라 authoring 도구, converter 도구, processor 도구나 그 조합으로 동작한다. authoring 도구는 AUTOSAR XML 기술을 만들고 고치며(예: System Description 편집기), converter 도구는 다른 AUTOSAR XML 파일의 정보를 바꿔 AUTOSAR XML 파일을 만들고(예: ECU flattener), processor 도구는 AUTOSAR XML 파일의 정보로 AUTOSAR가 아닌 파일을 만든다(예: RTE 생성기).[@autosar-fo-tr-glossary-2025]

**Artop**은 AUTOSAR 규격을 따르는 시스템과 ECU를 설계하고 설정하는 개발 도구에 공통인 기반 기능을 구현한 인프라 플랫폼이다. Eclipse Platform과 EMF(Eclipse Modeling Framework) 위에 지어졌고, AUTOSAR 메타모델 릴리스의 구현, AUTOSAR XML 스키마를 따르는 직렬화, 규칙 기반 검증 같은 구성 요소를 담는다. 최종 사용자 기능은 Artop의 범위 밖이어서 도구 벤더가 독자 플러그인으로 더한다. Artop 4.19는 AUTOSAR R25-11을 지원하며, 그 SDK(Software Development Kit)는 AUTOSAR 아티팩트 서버에서 AUTOSAR 파트너만 내려받을 수 있다.[@autosar-artop-2026]

## 네트워크 기술 형식

System Template은 통신과 토폴로지 기술에 ASAM FIBEX의 기술을 담고, AUTOSAR의 요구에 맞게 PDU 개념 등을 더해 확장했다. FIBEX는 버스 통신 시스템을 다루는 도구 사이의 데이터 교환을 위한 XML 형식이다.[@autosar-cp-tps-systemtemplate-2025] ASAM MCD-2 NET(FIBEX) 4.1.2는 [[flexray|FlexRay]], [[can|CAN]], [[lin|LIN]], [[ethernet|이더넷]] 등을 기술 확장으로 다룬다.[@asam-mcd-2-net-2017]

Vector의 [[signal-based-communication#통신 기술 파일|DBC 데이터베이스]]는 CAN·[[can-fd|CAN FD]] 네트워크, 버스에 이어진 ECU, 메시지와 시그널을 기술한다.[@vector-candb-admin-factsheet-2024] LIN을 규정하는 ISO 17987 시리즈 가운데 ISO 17987-2:2025는 약어 LDF를 LIN description file로 정의한다.[@iso-17987-2-obp-2025] Vector DaVinci Configurator Classic의 Ecu Extract Producer는 DBC 같은 기존 형식의 파일을 ECU Extract로 변환한다.[@vector-davinci-configurator-classic-ecuxpro-2026] ECU Extract를 만들 때 DBC, LDF, FIBEX 같은 기존 통신 파일을 함께 넣으면, 따로 설치하는 Legacy Converter가 이 파일들을 ARXML로 변환해 함께 넣은 ARXML 파일에 합친다.[@vector-davinci-configurator-classic-invariant-ecu-extract-2026]
