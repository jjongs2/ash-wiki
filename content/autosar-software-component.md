---
title: AUTOSAR 소프트웨어 컴포넌트
aliases:
  - SW-C
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR 소프트웨어 컴포넌트**는 인터페이스를 제공하거나 요구하고, [[virtual-functional-bus|VFB]]로 서로 연결되는 아키텍처 요소다. 줄여서 SW-C(Software Component)나 SWC라 한다. 소프트웨어 컴포넌트는 원자 컴포넌트, 파라미터 컴포넌트, composition 가운데 하나다.[@autosar-fo-tr-glossary-2025]

AUTOSAR는 애플리케이션을 서로 연결된 컴포넌트의 composition으로 모델링하며, 컴포넌트는 [[software-component-port|포트]]를 거쳐서만 다른 컴포넌트와 상호 작용한다.[@autosar-cp-exp-vfb-2024] 애플리케이션 소프트웨어는 자기 완결적인 원자 SW-C 단위로 짜이고, 각 단위는 포트로만 바깥과 연결된다. SW-C는 ECU나 통신 버스에 의존하지 않는 추상 통신 채널인 VFB를 대상으로 개발된다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

ECU에 매핑된 원자 SW-C는 그 ECU용으로 생성된 [[autosar-rte|RTE]]에 연결된다. RTE는 컴포넌트 사이, 그리고 컴포넌트와 BSW(Basic Software) 사이의 구체적인 인터페이스다.[@autosar-cp-exp-vfb-2024]

## Type과 prototype

**component type**(SwComponentType)은 SW-C의 포트를 정의하고, 원자 SW-C의 type은 여기에 internal behavior를 더 가질 수 있다. **component prototype**(SwComponentPrototype)은 composition 안에서 어떤 component type을 특정 역할로 쓴 것이다. 같은 component type으로 prototype을 몇 개든 만들 수 있고, prototype마다 그 type을 다른 역할로 쓴다. 예를 들어 DoorControl type을 LeftDoorControl과 RightDoorControl 두 prototype으로 쓸 수 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

한 SW-C 기술에서 인스턴스를 여럿 만드는 것을 **multiple instantiation**이라 한다.[@autosar-cp-sws-rte-2025] 원자 SW-C를 한 ECU에서 여러 번 인스턴스화할 수 있는지는 SwcInternalBehavior의 supportsMultipleInstantiation 속성이 나타낸다.[@autosar-cp-tps-softwarecomponenttemplate-2025] 같은 component type의 인스턴스는 보통 내부 상태를 따로 가지면서 코드는 함께 쓴다.[@autosar-cp-exp-vfb-2024]

multiple instantiation이 필요한데 supportsMultipleInstantiation이 거짓이면 RTE 생성기는 그 구성을 거부한다. RTE는 multiple instantiation을 코드를 함께 쓰는 방식으로만 지원하며, SW-C가 multiple instantiation을 지원하면 인스턴스 핸들을 API의 첫 인자로 넘겨 인스턴스를 가른다.[@autosar-cp-sws-rte-2025]

## 종류

component type은 아홉 종류다. SwComponentType 아래에 AtomicSwComponentType, ParameterSwComponentType, CompositionSwComponentType이 있고, AtomicSwComponentType 아래에 일곱 종류가 있다. Composition과 Parameter를 뺀 일곱 종류는 원자 SW-C(AtomicSwComponentType)이고, 원자 SW-C는 더 쪼개 여러 ECU에 나눠 둘 수 없다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

![[diagrams/swc-component-type-hierarchy.svg]]

| 종류                  | 메타클래스                         | 하는 일                                                                                                                                                                                                                                                                                                                |
| --------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application           | ApplicationSwComponentType         | 하드웨어와 독립적인 애플리케이션 소프트웨어를 나타낸다.[@autosar-cp-tps-softwarecomponenttemplate-2025]                                                                                                                                                                                                                |
| Sensor-Actuator       | SensorActuatorSwComponentType      | 특정 센서나 액추에이터를 위해 쓰이며, [[ecu-abstraction-layer\|ECU Abstraction]]의 인터페이스를 써서 센서와 액추에이터의 물리값을 다른 SW-C에 제공한다. 구현은 마이크로컨트롤러와 ECU 하드웨어에 독립적이고, 센서와 액추에이터에 의존한다.[@autosar-cp-exp-vfb-2024][@autosar-cp-exp-layeredsoftwarearchitecture-2025] |
| ECU Abstraction       | EcuAbstractionSwComponentType      | ECU마다 다른 입출력 기능을 쓸 수 있게 해 준다. ECU 주변장치에 접근하려는 SW-C와 [[microcontroller-abstraction-layer\|Microcontroller Abstraction]] 사이에 놓인다.[@autosar-cp-tps-softwarecomponenttemplate-2025]                                                                                                      |
| Complex Device Driver | ComplexDeviceDriverSwComponentType | ECU 하드웨어에 직접 접근하므로 특정 ECU나 하드웨어에 묶인다. AUTOSAR가 다루지 않는 하드웨어용 드라이버도 이 종류로 만든다.[@autosar-cp-exp-vfb-2024][@autosar-cp-tps-softwarecomponenttemplate-2025]                                                                                                                   |
| Service               | ServiceSwComponentType             | 표준화된 인터페이스로 표준 서비스를 제공하며, 이를 위해 BSW 모듈과 직접 상호 작용할 수 있다.[@autosar-cp-exp-vfb-2024]                                                                                                                                                                                                 |
| Service Proxy         | ServiceProxySwComponentType        | 한 ECU 안의 서비스를 다른 ECU에서 쓸 수 있게 하는 대리(proxy)다. prototype 하나를 여러 ECU에 매핑할 수 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]                                                                                                                                                           |
| NV Block              | NvBlockSwComponentType             | [[nvram-manager\|NvM]]이 관리하는 블록과 비휘발성 데이터 요소를 짝지어, 다른 SW-C가 비휘발성 데이터를 쓸 수 있게 한다.[@autosar-cp-exp-vfb-2024]                                                                                                                                                                       |
| Parameter             | ParameterSwComponentType           | 캘리브레이션 데이터나 고정 데이터 같은 파라미터 값을 다른 SW-C에 내준다. internal behavior를 가질 수 없고, 포트로는 parameter interface 타입의 제공 포트만 가질 수 있다.[@autosar-cp-exp-vfb-2024][@autosar-cp-tps-softwarecomponenttemplate-2025]                                                                     |
| Composition           | CompositionSwComponentType         | 기존 SW-C들을 담아 특정 기능을 캡슐화한다.[@autosar-cp-tps-softwarecomponenttemplate-2025]                                                                                                                                                                                                                             |

Service Proxy의 대표적인 쓰임은 차량 모드 전환 요청을 전달하는 것이다.[@autosar-cp-tps-softwarecomponenttemplate-2025] 모드 요청을 모든 ECU의 BswM(BSW Mode Manager)에 나눠 보낼 때 Service Proxy SW-C를 쓴다.[@autosar-cp-exp-vfb-2024]

## Composition

composition은 component prototype과 connector를 담고, delegation 포트로 자기 포트를 드러낸다. composition 자체가 component type이어서 더 큰 composition 안에 다시 들어갈 수 있으며, 그래서 SW-C는 계층 구조를 이룬다. 차량 전체의 애플리케이션 소프트웨어는 결국 composition 하나로 나타내며, 이를 **top-level composition**이라 한다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

![[diagrams/composition-assembly-delegation-connectors.svg]]

System Description의 System은 RootSwCompositionPrototype 하나로 top-level composition을 가리킨다. 네트워크만 다루는 System에는 이 요소가 없어도 된다. ECU Extract를 만들 때는 계층 구조인 composition을 한 층으로 펼쳐, 그 ECU에 매핑된 원자 SW-C의 prototype만 root composition에 남긴다. 이 변환을 **flattening**이라 한다.[@autosar-cp-tps-systemtemplate-2025]

## Internal behavior

원자 SW-C의 **internal behavior**(SwcInternalBehavior)는 RTE에 관련된 SW-C의 측면, 곧 [[runnable-entity|runnable]]과 그것이 반응하는 [[rte-event|RTE 이벤트]]를 기술한다. internal behavior에는 runnable, RTE 이벤트, inter-runnable 변수, exclusive area가 든다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

SW-C의 실제 구현은 internal behavior와 따로 implementation 기술이 기술하며, 여기에는 메모리 사용량 같은 자원 소비가 든다.[@autosar-cp-sws-rte-2025]
