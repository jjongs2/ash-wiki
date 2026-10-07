---
title: Implementation Conformance Class
tags:
  - platform/autosar
aliases:
  - ICC
verified: 2026-10-07
---

**Implementation Conformance Class**(ICC)는 [[autosar-classic-platform|AUTOSAR Classic Platform]]의 BSW(Basic Software)가 AUTOSAR 모듈 구조를 얼마나 잘게 따르는지에 따라 나눈 등급이다. AUTOSAR R25-11 용어집은 ICC1, ICC2, ICC3 셋을 정의하며, ICC3이 가장 잘게 나뉜 등급이다.[@autosar-fo-tr-glossary-2025]

## 등급

- **ICC3**: BSW가 BSW 모듈 목록에 정의된 BSW 모듈들과 [[autosar-rte|RTE]]로 이루어진다. RTE를 포함해 BSW 일반 명세에 정의된 모든 BSW 모듈은 저마다의 SWS(Software Specification)가 정한 인터페이스와 기능을 따라야 한다.
- **ICC2**: 논리적으로 관련된 ICC3 BSW 모듈을 둘 이상 묶은 클러스터다. 클러스터의 기능은 묶은 ICC3 모듈들이 가진 기능의 부분집합이고, 클러스터는 그 모듈들이 가진 인터페이스의 일부를 드러낸다. 클러스터의 내부 구조는 독자적이어도 되고, 매우 최적화된 코드로 이루어질 수도 있지만, 기능 동작은 ICC3 수준의 명세대로다. ICC2 클러스터와 ICC3 모듈을 한 BSW 구조 안에 섞어 쓸 수 있다.
- **ICC1**: BSW를 블랙박스로 보는 클러스터다. ICC1 클러스터는 Software Component Interface(SW-CI)나 Network Interface(NWI)를 주고, 이 인터페이스로 ICC3 수준의 명세대로 기능 동작을 준다. 대개 BSW 모듈이나 모듈 클러스터로 나뉘지 않고 독자적인 내부 구조를 가지며, 기존 플랫폼이 AUTOSAR 네트워크에 들어가고 [[autosar-software-component|SW-C]]를 지원하도록 AUTOSAR로 옮겨 오게 한다. ICC1 클러스터는 부트로더와의 인터페이스를 주어야 한다.[@autosar-fo-tr-glossary-2025]

![[diagrams/icc-bsw-granularity.svg]]

AUTOSAR R25-11 Layered Software Architecture는 ICC2의 클러스터를 정해진 클러스터로 제한하지 않는다. 제약과 최적화 기준이 많아 ICC2 클러스터 구성도 여러 가지가 될 수 있기 때문이다. ICC1을 따르는 BSW에는 요구되는 모듈이나 클러스터가 없고, 이 독자적 BSW의 내부 구조는 정하지 않는다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

ICC3 모듈이 놓이는 층은 [[autosar-layered-architecture#BSW의 층|AUTOSAR 계층 구조]]에서 다룬다.

## 바깥에 대한 동작

ICC1부터 ICC3까지 어느 등급이든 AUTOSAR를 따르는 BSW(RTE 포함)는 바깥에 대해 ICC3 모듈 명세대로 동작해야 한다. 바깥에는 버스, 부트로더, 응용이 든다. 또 ICC1·ICC2의 설정은 시스템 기술에 대해 ICC3에서와 호환되어야 한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]
