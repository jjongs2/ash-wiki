---
title: Virtual functional bus
aliases:
  - VFB
tags:
  - platform/autosar
verified: 2026-09-30
---

**VFB**(Virtual Functional Bus)는 [[autosar-software-component#종류|원자 SW-C]]와 AUTOSAR 서비스 사이의 통신을 추상화한 것이다. 이 추상화에서는 통신 메커니즘을, 그 통신을 실현하는 구체적인 기술과 상관없이 정한다.[@autosar-fo-tr-glossary-2025]

VFB 개념은 애플리케이션과 인프라를 엄격히 나눈다. 애플리케이션을 구현하는 SW-C는 다른 컴포넌트나 하드웨어와 주고받는 데 쓰는 통신 메커니즘에서 대체로 독립하며, 이것으로 AUTOSAR의 재배치성(relocatability) 목표를 채운다.[@autosar-cp-tr-vfb-2025]

## VFB view

**VFB view**는 차량의 시스템이나 하위 시스템을 ECU의 종류와 수, 각 요소가 어느 ECU에서 도는지, ECU를 잇는 네트워크 기술과 토폴로지에 상관없이 기술하는 관점이다. VFB view에서 시스템은 컴포넌트와 [[software-component-port#Connector|connector]]로 이루어진 [[autosar-software-component#Composition|composition]]이다.[@autosar-fo-tr-glossary-2025] AUTOSAR R25-11의 [[autosar-rte|RTE]] 명세는 이 이름을 관점이 아니라 그 관점이 기술하는 대상에 써서, 실제 ECU에 매핑하기 전의 서로 연결된 SW-C의 모음을 VFB view라 부른다.[@autosar-cp-sws-rte-2025]

VFB에서 애플리케이션은 서로 연결된 컴포넌트의 composition으로 모델링된다. 컴포넌트는 자기 [[software-component-port|포트]]로만 서로 상호 작용하고, 통신할 포트끼리는 assembly connector로 잇는다. 포트마다 타입은 port interface 하나로 정해진다. port interface는 그 인터페이스를 제공하거나 요구하는 포트가 지킬 계약으로, [[autosar-client-server-interface|client-server 인터페이스]]는 operation을, [[autosar-sender-receiver-interface|sender-receiver 인터페이스]]는 [[autosar-sender-receiver-interface#Data element|data element]]를 정한다.[@autosar-cp-tr-vfb-2025]

VFB로 시스템의 통신 전체를 모든 송신원과 수신처까지 지정할 수 있어서, SW-C 사이 통신이 타당한지 검사하는 데 VFB를 쓸 수 있다. 통신 연결과 연결된 SW-C는 기술(description) 하나에 저장되어, 매핑과 소프트웨어 구성 같은 다음 단계에 쓰인다.[@autosar-cp-tr-vfb-2025]

[[autosar-methodology|AUTOSAR 방법론]]에서는 시스템의 모든 SW-C를 ECU와 네트워크에 상관없이 VFB로 먼저 정의할 수 있다.[@autosar-cp-tr-methodology-2025] 응용의 타이밍을 결정적으로 구현하려면, 마지막에 SW-C를 ECU에 통합할 때만이 아니라 그보다 앞선 VFB 수준의 가상 통합에서도 타이밍 제약을 정하고 분석할 수 있어야 한다.[@autosar-cp-exp-functionalsafetymeasures-2025] 가상 통합은 소프트웨어를 실제로 묶지 않고 모의나 계산으로 묶어 보는 것이어서, 실제 하드웨어가 없어도 타이밍, 메모리, 인터페이스에 걸린 요구를 확인할 수 있다.[@autosar-fo-tr-glossary-2025]

AUTOSAR 서비스는 ECU 인프라인 BSW(Basic Software)의 표준화된 기능을 애플리케이션 SW-C에 제공한다. AUTOSAR 서비스는 대개 [[autosar-layered-architecture#인터페이스|Standardized AUTOSAR Interface]]로 통신하며, VFB에서는 그 서비스를 요청하는 SW-C의 포트로만 보이고 BSW 쪽 상대는 보이지 않는다.[@autosar-cp-tr-vfb-2025]

## ECU 안과 밖 통신

원자 SW-C와 assembly connector로 이루어진 하위 시스템을 ECU 네트워크에 배치하면, 모든 원자 SW-C가 ECU에 매핑된다. 그러면 SW-C 사이의 connector는 ECU 안 통신 메커니즘이나 ECU 사이 통신 메커니즘으로 구현된다. 가상 연결이 ECU 하나 안의 로컬 연결이나, [[can|CAN]]·[[flexray|FlexRay]] 프레임 같은 네트워크 기술별 통신 메커니즘으로 바뀌는 것이다.[@autosar-cp-tr-vfb-2025]

![[diagrams/vfb-view-ecu-mapping.svg]]

SW-C는 상대 SW-C가 같은 ECU에 있든 다른 ECU에 있든 자기 포트로만 통신한다. RTE는 통신 상대가 같은 파티션, 같은 ECU의 다른 파티션, 다른 ECU 가운데 어디에 있든 통신 메커니즘의 의미를 바꾸지 않는다. SW-C가 포트에 접근할 때 쓰는 API는 SW-C 자신의 기술(포트, 인터페이스, [[autosar-software-component#Internal behavior|internal behavior]])만으로 생성된다. 통신 연결은 RTE가 구현하므로 SW-C는 연결이 1:1, n:1, 1:n 가운데 무엇인지 모르고, 그래서 SW-C를 고치지 않고 다른 구성에 다시 배치할 수 있다.[@autosar-cp-sws-rte-2025]

## ECU 배치

[[autosar-software-component#종류|application SW-C]]는 ECU와 위치에 독립적이어서, 시스템 설계자가 정한 제약 안에서 시스템을 구성할 때 어느 ECU에나 배치할 수 있다. sensor-actuator SW-C는 ECU 하드웨어에 의존하므로 쉽게 옮길 수 없다. 자기 ECU의 [[ecu-abstraction-layer|ECU Abstraction]]에만 직접 접근할 수 있어서, 효율적인 접근이 필요하면 다른 ECU로 옮길 때 연결된 센서나 액추에이터도 그 ECU로 옮겨야 할 수 있다.[@autosar-cp-sws-rte-2025]

SW-C를 ECU에 매핑하는 것은 [[autosar-methodology#System description|System Description]]의 mapping이 담는다. 그 가운데 SwcToEcuMapping은 [[autosar-software-component#Type과 prototype|SW-C prototype]] 하나 이상을 ECU 인스턴스 하나에 매핑한다.[@autosar-cp-tps-systemtemplate-2025]

시스템을 만드는 과정에서는 SW-C를 ECU에 매핑한 뒤, SW-C 사이에 오가는 data element를 버스 프레임에 매핑한다. data mapping은 SW-C 포트의 data element나 client-server operation을 [[autosar-com#System Template과의 연결|system signal]]에 매핑한다.[@autosar-cp-tps-systemtemplate-2025]

VFB 개념은 ECU마다 생성되는 RTE가 [[autosar-os|운영체제]]와 통신 모듈 같은 BSW 모듈과 함께 구현한다.[@autosar-cp-sws-rte-2025]

배치가 끝나면 ECU마다 System Description에서 그 ECU의 몫만 담은 [[autosar-methodology#ECU extract|ECU Extract]]를 만들어, ECU 구성의 바탕으로 쓴다.[@autosar-cp-tps-systemtemplate-2025]
