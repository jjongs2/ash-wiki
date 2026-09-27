---
title: 메시지 주소 지정
tags:
  - network
verified: 2026-09-27
---

## 정의

[[can|CAN]] 노드는 다른 노드의 주소 같은 시스템 구성 정보를 쓰지 않는다. CAN 메시지의 내용은 [[can-identifier|식별자]]로 이름 붙고, 식별자는 받을 노드가 아니라 데이터의 뜻을 나타낸다. 프레임은 버스의 모든 노드에 전해지고, 각 노드가 식별자를 보고 그 데이터를 쓸지 스스로 정한다.[@bosch-can-2-0-1991] 식별자로 데이터의 내용을 나타내 주소를 정하는 방식을 **content addressing**(내용 주소 지정), 노드의 주소로 정하는 방식을 **node addressing**(노드 주소 지정)이라 부른다.[@cia-can-cc-2026][@bosch-can-xl-overview-2023]

## 구조·동작

### 멀티캐스트

CAN에서는 여러 노드가 한 메시지를 동시에 받아 쓸 수 있다.[@bosch-can-2-0-1991] **멀티캐스트**는 프레임 하나를 여러 노드에 보내는 주소 지정 방식이다. CAN은 여러 노드가 받아야 할 데이터도 프레임 하나로 보낸다.[@iso-11898-1-obp-2024]

### 필터링

STM32F10x의 bxCAN은 하드웨어 필터로 소프트웨어에 필요한 식별자의 메시지만 받아들이고, 나머지는 소프트웨어가 관여하지 않고 버린다.[@st-rm0008-2021] 이 기능은 [[acceptance-filter|수용 필터]]에서 다룬다.

![[diagrams/can-broadcast-identifier-filter.svg]]

### 우선순위

식별자는 버스 접근에서 메시지의 우선순위도 정한다.[@bosch-can-2-0-1991] 어느 식별자가 중재에서 이기는지는 [[can-arbitration|CAN 중재]]에서 다룬다.

### 주소를 싣는 프레임

STM32F107의 이더넷 MAC(Media Access Control)이 다루는 프레임에는 목적지 주소 필드와 출발지 주소 필드가 있고, 두 필드는 각각 6바이트다. 이 MAC에서 **개별 주소**는 네트워크에서 특정 스테이션 하나에 붙은 물리 주소다.[@st-rm0008-2021] ISO/IEC 2382는 LAN(Local Area Network) 개별 주소를 LAN의 특정 데이터 스테이션 하나를 가리키는 주소로 정의한다. 로컬 주소 관리에서는 한 LAN 안의 개별 주소가 모두 서로 다르고, 전역 주소 관리에서는 다른 LAN의 주소와도 겹치지 않는다.[@iso-iec-2382-obp-2015] **전역 관리 MAC 주소**는 전역에서 유일하도록 만든 주소다.[@ieee-ra-eui-2017]

## 비교·한계

CAN에서는 노드를 더해도 어느 노드의 소프트웨어나 하드웨어, 응용 계층도 고칠 필요가 없다.[@bosch-can-2-0-1991]

STM32F107의 이더넷 MAC에서 목적지 주소가 그룹 주소인 프레임은 여러 스테이션이나 LAN의 모든 스테이션을 가리킨다.[@st-rm0008-2021]

CAN 위의 전송 프로토콜인 ISO 15765-2는 네트워크 계층 파라미터로 출발지 주소 N_SA와 목적지 주소 N_TA를 둔다. 네트워크 계층 PDU(Protocol Data Unit)의 파라미터를 [[can-frame|CAN 프레임]]에 대응시키는 주소 지정 형식으로는 normal addressing, normal fixed addressing, extended addressing, mixed addressing을 둔다.[@iso-15765-2-obp-2016][@iso-15765-2-obp-2024] AUTOSAR의 CanTp는 1대1 통신에 물리 주소 지정을 쓰고, normal addressing 형식에서는 N_SA, N_TA, 주소 종류, 메시지 종류의 조합마다 CAN 식별자를 하나씩 배정한다. extended addressing 형식은 N_SA와 메시지 종류의 조합마다 CAN 식별자를 하나씩 배정하고, N_TA는 CAN 프레임 데이터 필드의 첫 바이트에 싣는다. mixed addressing 형식은 N_SA, N_TA, 주소 종류의 조합마다 CAN 식별자를 하나씩 배정하고, 주소 확장 N_AE를 데이터 필드의 첫 바이트에 싣는다.[@autosar-cp-sws-cantransportlayer-2023]
