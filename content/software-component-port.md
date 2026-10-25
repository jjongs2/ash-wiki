---
title: 소프트웨어 컴포넌트 포트
tags:
  - platform/autosar
verified: 2026-09-30
---

**소프트웨어 컴포넌트 포트**는 [[autosar-software-component|SW-C]]가 바깥의 다른 컴포넌트와 상호 작용하는 자리로, 늘 컴포넌트 하나에 딸린다.[@autosar-fo-tr-glossary-2025][@autosar-cp-tr-vfb-2025] 포트의 타입은 port interface이며, 두 포트 사이에 무엇이 오가는지는 port interface가 정한다. 같은 port interface로 여러 포트의 타입을 정할 수 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

SW-C는 BSW(Basic Software)가 제공하는 AUTOSAR 서비스와도 포트로 이어진다. AUTOSAR 서비스는 표준 port interface로 타입을 정한 포트를 두고, [[autosar-rte|RTE]]가 이 서비스 포트를 SW-C의 포트에 잇는다.[@autosar-cp-sws-rte-2025]

> [!note]
> AUTOSAR의 [[microcontroller-abstraction-layer|MCAL]]에는 [[autosar-port-driver|Port Driver]]라는 BSW 모듈도 있다. Port Driver는 마이크로컨트롤러의 포트 구조 전체를 초기화하고 포트 핀을 설정한다.[@autosar-cp-sws-portdriver-2025]

## P-Port와 R-Port

**P-Port**는 port interface에 정의된 요소를 제공하고, **R-Port**는 요구하며, **PR-Port**는 둘을 함께 한다. sender-receiver 통신에서는 데이터를 내보내는 쪽이 P-Port이고, connector로 이은 R-Port가 그 데이터를 받는다. client-server 통신에서는 operation을 제공하는 서버가 P-Port이고, 그 operation을 호출하는 클라이언트가 R-Port다.[@autosar-cp-tr-vfb-2025] operation의 인자는 operation에 넘기는 in, 돌려받는 out, 넘기고 돌려받는 inout으로 나뉘어서, R-Port 쪽 클라이언트도 operation을 호출하며 서버에 데이터를 넘긴다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## Port interface

port interface는 여섯 종류다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

| 종류                                                   | 메타클래스              | 쓰임                                                                                                                                                   |
| ------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [[autosar-sender-receiver-interface\|Sender-Receiver]] | SenderReceiverInterface | 보내고 받을 [[autosar-sender-receiver-interface#Data element\|data element]]를 정한다.[@autosar-cp-tps-softwarecomponenttemplate-2025]                 |
| NV Data                                                | NvDataInterface         | [[autosar-software-component#종류\|NV Block SW-C]]와 다른 SW-C 사이에서 비휘발성 데이터를 주고받는다.[@autosar-cp-tps-softwarecomponenttemplate-2025]  |
| Parameter                                              | ParameterInterface      | 캘리브레이션 데이터나 고정 데이터, 상수 같은 파라미터를 SW-C가 읽을 수 있게 한다.[@autosar-cp-tr-vfb-2025]                                             |
| [[autosar-mode-switch-interface\|Mode Switch]]         | ModeSwitchInterface     | mode manager가 모드 전환을 알리는 데 쓴다.[@autosar-cp-tps-softwarecomponenttemplate-2025] |
| [[autosar-client-server-interface\|Client-Server]]     | ClientServerInterface   | 클라이언트가 서버에서 호출할 수 있는 operation을 정한다.[@autosar-cp-tps-softwarecomponenttemplate-2025]                                               |
| Trigger                                                | TriggerInterface        | trigger source가 이어진 trigger sink의 [[runnable-entity\|runnable]] 실행을 시작하게 한다.[@autosar-cp-tps-softwarecomponenttemplate-2025]             |

connector로 잇는 두 포트는 서로 호환되어야 한다. 한쪽의 P-Port나 PR-Port를 다른 쪽의 호환되는 R-Port나 PR-Port에 잇는다. 같은 port interface로 타입을 정한 포트끼리는 정의상 이을 수 있고, port interface가 달라도 호환되면 이을 수 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

포트는 [[autosar-sender-receiver-interface#Com spec|com spec]]으로 port interface의 요소마다 통신 속성을 덧붙인다. 요구하는 포트는 RPortComSpec을, 제공하는 포트는 PPortComSpec을 둔다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## Connector

[[autosar-software-component#Composition|composition]]은 connector로 그 안에 있는 [[autosar-software-component#Type과 prototype|component prototype]]의 포트를 잇는다. connector에는 아래 것들이 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

- **assembly connector**: 같은 composition 안의 component prototype들의 포트를 잇는다. 한쪽의 P-Port나 PR-Port를 다른 쪽의 R-Port나 PR-Port에 잇는다.
- **delegation connector**: composition 안 component prototype의 포트(inner)를 composition 자신의 포트(outer)에 잇는다. inner와 outer는 방향이 같아야 해서 R-Port끼리나 P-Port끼리만 잇고, R-Port를 P-Port에 잇지는 못한다. PR-Port가 끼면 허용되는 짝은 port interface 종류마다 다르다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

![[diagrams/composition-assembly-delegation-connectors.svg]]
