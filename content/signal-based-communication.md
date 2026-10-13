---
title: 시그널 기반 통신
tags:
  - network
verified: 2026-09-29
---

[[autosar|AUTOSAR]]는 Classic Platform의 통신을 **시그널 기반 통신**(signal-based communication)이라 부르고, [[autosar-adaptive-platform|Adaptive Platform]]의 [[service-oriented-communication|서비스 지향 통신]]과 구분한다.[@autosar-cp-tps-systemtemplate-2025] [[autosar-com|AUTOSAR COM]]은 사용자에게 시그널 단위의 데이터 인터페이스를 준다. 송신할 시그널은 I-PDU(Interaction Layer Protocol Data Unit)에 채워 넣고, 받은 I-PDU에서는 시그널을 꺼내 사용자에게 준다.[@autosar-cp-sws-com-2025] [[lin|LIN]]에서도 서로 다른 노드의 애플리케이션은 시그널 기반 통신으로 정보를 주고받는다.[@iso-17987-2-obp-2025]

Vector의 DBC 형식에서 시그널은 가장 작은 정보 단위이고, 메시지에 실려 버스로 전송된다.[@vector-an-ion-1-0521-2019]

## 시그널 배치

AUTOSAR COM은 시그널마다 I-PDU 안의 시작 비트 위치(`ComBitPosition`), 비트 크기(`ComBitSize`), [[byte-order|바이트 순서]](`ComSignalEndianness`)를 설정값으로 미리 정한다.[@autosar-cp-sws-com-2025]

## 통신 매트릭스

AUTOSAR R25-11 System Template은 어떤 시그널을 어느 프레임에 싣고 ECU마다 무엇을 보내고 받는지를 System Configuration Description의 통신 매트릭스로 정하고, 이 기술을 입력으로 ECU 설정을 만든다. 통신 매트릭스는 프레임, 시그널, 타이밍을 담고, System Template은 [[gateway|게이트웨이]] 표도 기술한다.[@autosar-cp-tps-systemtemplate-2025]

Vector의 CANdb++ Admin은 통신 매트릭스를 설계하는 도구로, 통신 객체를 정의하고 송수신 관계를 정한다.[@vector-candb-admin-factsheet-2024]

CAN의 [[can-identifier|식별자]]는 목적지가 아니라 데이터의 뜻을 나타내고, 모든 노드가 메시지 필터링으로 받을지 정한다. 메시지는 모든 노드가 함께 받아들이거나 어느 노드도 받아들이지 않는다. 그래서 CAN 네트워크에 노드를 더해도 어느 노드의 소프트웨어나 하드웨어도 바꿀 필요가 없다.[@bosch-can-2-0-1991]

## 통신 기술 파일

ASAM MCD-2 NET, 곧 **FIBEX**(Field Bus Data Exchange Format)는 차량 네트워크의 통신을 기술하는 XML 기반 인터페이스 기술 표준이며, [[can|CAN]], LIN, [[flexray|FlexRay]], [[ethernet|이더넷]] 등을 위한 기술별 확장을 둔다. FIBEX 기술은 주고받는 시그널의 정의와 ECU마다 보내고 받는 시그널 목록을 담는다.[@asam-mcd-2-net-2017][@asam-mcd-2-net-toc-2017]

ISO 17987 시리즈는 LIN의 통신 동작을 기술하는 네트워크 기술 파일로 LDF(LIN description file)를 두고, 그 형식은 ISO 17987-2:2025가 다룬다.[@iso-17987-2-obp-2025]

Vector는 DBC 형식을 통신 데이터를 기술하는 사실상의 표준(de facto standard)이라 부른다. DBC 데이터베이스는 CAN·[[can-fd|CAN FD]] 네트워크, 버스에 이어진 ECU, 메시지와 시그널을 기술하고, 메시지의 송신 노드와 노드가 받는 시그널을 관계로 둔다.[@vector-candb-admin-factsheet-2024] 메시지 안에서 시그널의 위치는 시작 비트로 정한다.[@vector-an-ion-1-0521-2019] Vector의 DBC 편집 도구 CANdb++에서 메시지는 이름, ID, [[data-length-code|DLC]]를 갖고, 시그널은 비트 길이, 바이트 순서, 부호 여부를 나타내는 값 형식, 계수(factor)와 오프셋, 최솟값과 최댓값, 단위를 갖는다.[@vector-candb-manual-2019]

## 물리값 변환

AUTOSAR Classic Platform R25-11의 System Template은 ISignal의 네트워크 표현을 CompuMethod로 물리값과 잇도록 정한다.[@autosar-cp-tps-systemtemplate-2025] `LINEAR` 범주의 CompuMethod는 내부값 $x$에 계수 $a$를 곱한 뒤 오프셋 $b$를 더해 물리값 $y = a\,x + b$를 얻는다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## 송신과 수신 감시

AUTOSAR COM은 I-PDU를 주기 송신, 이벤트 송신, 둘을 섞은 [[autosar-com#전송 속성과 전송 모드|전송 모드]]로 보내고, 수신 시그널이 정해진 시간 안에 오지 않으면 [[autosar-com#수신 notification과 감시|수신 데드라인 감시]]로 알아챈다.[@autosar-cp-sws-com-2025]

## 서비스 지향 통신과의 차이

통신 경로를 실행 중에 세우는 방식은 [[service-oriented-communication#시그널 기반 통신과의 차이|서비스 지향 통신]]에서 다룬다.
