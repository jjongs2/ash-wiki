---
title: AUTOSAR Application Interfaces
tags:
  - platform/autosar
verified: 2026-10-07
---

**AUTOSAR Application Interfaces**는 [[autosar|AUTOSAR]]가 표준화하는 응용 사이의 인터페이스 명세다. AUTOSAR는 소프트웨어 재사용과 교환을 위해 응용의 인터페이스 명세에 초점을 둔다. 응용은 ECU의 경쟁력이 되는 부분이어서, AUTOSAR는 알고리즘 같은 응용 내부의 기능 동작은 표준화하지 않고 응용 사이에 주고받는 내용을 표준화한다. 표준 인터페이스는 특정 하드웨어나 ECU와 상관없이 [[autosar-software-component|소프트웨어 컴포넌트]]를 확장하거나 재사용할 때 쓸 수 있다. 응용의 예로는 전기 모터 제어, 엔진 제어, 변속기 제어, ESC(Electronic Stability Control), 조향, 전자식 주차 브레이크, 주차 거리 제어, 외부 조명, 도난 방지, 원격 키리스 엔트리가 있다.[@autosar-standards-classic-platform-application-interfaces-2026]

AUTOSAR R25-11 Application Interfaces 사용자 안내서는 [[autosar-classic-platform|Classic Platform]] 표준에 속한다. Application Interfaces의 정의는 Classic Platform 릴리스의 Application Interfaces 부분에 파일 묶음으로 나온다. Application Interfaces는 ECU 네트워크에 거의 마음대로 배치할 수 있는 소프트웨어 컴포넌트들이 서로 통신해 기능을 내는 것을 목표로 한다. 공급자가 다른 소프트웨어 컴포넌트끼리 상호운용되도록 그 인터페이스를 통일하고, 안정되고 널리 받아들여지는 응용 인터페이스를 정의해 펴내는 것도 목표다.[@autosar-cp-exp-aiuserguide-2025]

Adaptive Platform의 Sensor Interfaces는 [[autosar-adaptive-platform#그 밖의 functional cluster|AUTOSAR Adaptive Platform]]에서 다룬다.

## 산출물

Application Interfaces를 정의하는 데이터는 Application Interface Tool(AI-Tool)로 관리한다. AI-Tool은 [[autosar-methodology|AUTOSAR 방법론]] 메타모델에 따른 데이터를 입력으로 받아, 표준화한 응용 인터페이스의 상세 정보를 모두 담은 [[autosar-methodology#AUTOSAR XML|.arxml]] 파일 묶음을 낸다. 이 파일은 소프트웨어 개발사의 저작 도구 등에 입력으로 쓸 수 있다. 최종 정의는 AUTOSAR_CP_MOD_AISpecification과 AUTOSAR_CP_MOD_AISpecificationExamples로 펴낸다.[@autosar-cp-exp-aiuserguide-2025]

AISpecification 패키지는 응용 데이터 타입, 계산 방법(CompuMethod), 데이터 제약, 키워드 집합, [[software-component-port|포트]] 인터페이스, 포트 프로토타입 blueprint, 소프트웨어 컴포넌트 타입 예시 등의 정의를 모은다. 물리 차원과 단위의 정의는 PhysicalUnits 패키지에 따로 둔다.[@autosar-cp-exp-aiuserguide-2025]

인터페이스를 일관되게 정하려고, AI-Tool 안에서는 소프트웨어 컴포넌트를 큰 function group(예전 이름은 도메인)과 그 주요 기능으로 나눠 기술한다. 포트는 컴포넌트에 연결되어야 제대로 정할 수 있기 때문이며, 이 컴포넌트들은 예시일 뿐이다. 도메인마다 그 Application Interfaces에 이른 설계 결정과 경계 조건을 설명하는 문서가 있고, 도메인은 Body and Comfort, Powertrain, Chassis, Occupant and Pedestrian Safety, Multimedia·Telematics·HMI(Human Machine Interface)다.[@autosar-cp-exp-aiuserguide-2025]

## 모델 요소의 범주

Application Interfaces의 모델 요소는 모두 STANDARD, BLUEPRINT, EXAMPLE 가운데 한 범주에 든다.[@autosar-cp-exp-aiuserguide-2025]

- **STANDARD**: 프로젝트에 넣기만 하면 정의된 그대로 쓸 수 있어, 쓰기 전에 고칠 필요가 없는 요소다.
- **BLUEPRINT**: 더 모델링할 바탕이 되는 미리 정의한 모델 요소로, 복사해서 다른 모델 요소를 끌어낼 수 있다. 모든 면에서 완전하지는 않고, 프로젝트가 실제 요소를 만드는 틀이 된다. 응용 데이터 타입, 계산 방법, 데이터 제약, 키워드 집합, 포트 인터페이스, 포트 프로토타입 blueprint, 물리 차원, 단위가 여기에 든다.
- **EXAMPLE**: 다시 쓸 수 있으면서 이해를 돕도록 만든 요소로, 프로젝트별 구현을 만드는 여러 방법 가운데 하나를 보인다. 소프트웨어 컴포넌트 타입과, blueprint에서 끌어낸 응용 데이터 타입, 계산 방법, 데이터 제약, 포트 인터페이스가 여기에 든다.[@autosar-cp-exp-aiuserguide-2025]

AUTOSAR R25-11 용어집은 blueprint를 복사하고 다듬어 다른 모델을 끌어낼 수 있는 모델로 정의하고, 이 과정은 메타모델과 타입의 관계와 달리 인스턴스화가 아니다. AUTOSAR blueprint는 AUTOSAR 요소의 blueprint로, 어느 AUTOSAR 요소 종류의 blueprint에 어떤 속성을 반드시 정해야 하는지와 blueprint에서 AUTOSAR 객체를 끌어내는 방법을 AUTOSAR가 정한다.[@autosar-fo-tr-glossary-2025]

[[autosar-methodology#AUTOSAR XML|AUTOSAR 메타모델]]은 blueprint, 곧 더 모델링할 바탕으로 미리 정의한 모델 요소를 지원한다. 예를 들어 저작 도구는 미리 정의한 PortInterface를 도구 상자처럼 내놓아, 프로젝트에 복사해 쓰게 할 수 있다. blueprint는 객체를 끌어내는 입력이 되고, 끌어낸 객체를 검증하는 데도 쓰인다. Application Interfaces에서 [[virtual-functional-bus|VFB]] 인터페이스, 곧 PortInterface를 끌어내는 것이 그 예다.[@autosar-fo-tps-standardizationtemplate-2025]

![[diagrams/application-interfaces-element-categories.svg]]
