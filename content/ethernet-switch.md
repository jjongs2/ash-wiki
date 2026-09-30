---
title: 이더넷 스위치
tags:
  - network/ethernet
verified: 2026-09-29
---

**이더넷 스위치**는 받은 [[ethernet-frame|이더넷 프레임]]의 목적지 MAC(Medium Access Control) 주소를 찾아, 그 주소에 연결된 포트로 프레임을 전달하는 장치다.[@microchip-ksz9477s-2019][@nxp-um10944-2017]

## 주소 학습

스위치는 받은 프레임의 출발지 [[mac-address|MAC 주소]]와 받은 포트를 주소 표에 기록하며, 이를 **학습**이라 한다. 학습한 기록은 그 주소에서 일정 시간 프레임이 오지 않으면 지워지며, 이를 **에이징**이라 한다.[@microchip-ksz9477s-2019][@nxp-um10944-2017]

[[ieee-802-1q|IEEE 802.1Q]]-2022는 브리지가 프레임을 어느 포트로 전달할지 정하는 데 쓰는 필터링 정보를 필터링 데이터베이스(Filtering Database)에 두고, 동적으로 학습한 정보의 에이징 시간 기본값을 300초로 둔다.[@ieee-802-1q-bridge-yang-2022] KSZ9477S의 에이징 주기는 기본 약 300초(±75초)이고, 1초에서 30분 사이로 바꿀 수 있다.[@microchip-ksz9477s-2019]

## 전달

목적지 주소가 주소 표에 있으면 스위치는 그 포트로만 프레임을 보낸다.[@microchip-ksz9477s-2019][@nxp-um10944-2017]

KSZ9477S는 찾은 목적지 포트가 프레임을 받은 포트와 같으면 그 프레임을 전달하지 않는다. 기본 설정에서는 목적지 주소가 주소 표에 없는 유니캐스트·멀티캐스트 프레임과 브로드캐스트 프레임을, 받은 포트를 뺀 모든 포트로 보낸다. KSZ9477S 데이터시트는 목적지를 몰라 여러 포트로 보내는 유니캐스트 프레임을 flooded unicast라 부른다.[@microchip-ksz9477s-2019] SJA1105TEL은 목적지를 모르는 프레임과 브로드캐스트 프레임을 받은 포트마다 설정한 포트 집합으로 보내며, 받은 포트는 그 집합에서 빼야 한다.[@nxp-um10944-2017]

![[diagrams/ethernet-switch-learning-forwarding.svg]]

## 전달 방식

KSZ9477S의 스위칭 엔진은 store-and-forward로 동작하고, FCS(Frame Check Sequence) 오류가 있는 패킷 등은 전달하지 않는다. KSZ9477S의 cut-through 모드는 패킷 전체를 기다리지 않고 처음 64바이트를 받은 뒤 전달을 시작해, 1 Gbit/s에서 지연이 패킷 크기와 상관없이 약 900 ns다. cut-through가 아닌 패킷의 최소 지연은 패킷 크기에 비례한다.[@microchip-ksz9477s-2019] SJA1105TEL의 수신 MAC은 [[cyclic-redundancy-check|CRC]] 오류를 찾으면 프레임을 바로 버리고, 검사를 통과한 프레임만 프레임 메모리에 저장한다.[@nxp-um10944-2017]

![[diagrams/switch-store-and-forward-cut-through.svg]]

KSZ9477S의 포트는 전이중과 반이중을 모두 지원한다.[@microchip-ksz9477s-2019] 스위치 안의 큐나 버퍼가 넘치면 스위치는 프레임을 버린다.[@microchip-ksz9477s-2019][@nxp-um10944-2017]

NXP SJA1110은 [[tsn|TSN]] 표준을 여럿 지원하는 차량용 이더넷 스위치 제품군이다.[@nxp-sja1110autesfs-2022]

## 관리형과 비관리형

KSZ9477S는 레이어 2 관리형 스위치로, SPI(Serial Peripheral Interface)나 I2C(Inter-Integrated Circuit) 같은 호스트 인터페이스, 또는 인밴드 관리로 내부 레지스터에 접근해 설정한다.[@microchip-ksz9477s-2019] Microchip의 기가비트 이더넷 스위치(KSZ9896C, KSZ9477S 등)는 [[virtual-lan|VLAN]]과 QoS(Quality of Service)를 마이크로컨트롤러, 인밴드 접근, 호스트 프로세서로 설정하고, 설정 스트랩으로는 기본 설정과 자동 협상만 정한다. Microchip AN2577에 따르면 비관리형 이더넷 스위치는 기능을 관리할 외부 마이크로컨트롤러나 프로세서 없이 스트랩 설정만으로 동작한다.[@microchip-an2577-2017]

## 리피터, 브리지, 라우터와의 차이

ISO/IEC 2382는 LAN(Local Area Network)에서 신호를 증폭하거나 재생해 데이터 스테이션 사이의 전송 거리를 늘리거나 두 갈래를 잇는 장치를 리피터로 정의한다. 브리지는 같은 LLC(Logical Link Control) 프로토콜을 쓰되 MAC 프로토콜은 다를 수 있는 두 LAN을 잇는 기능 단위이고, [[osi-model|OSI]] 모델을 따르는 네트워크에서는 데이터 링크 계층에서 동작하므로 라우팅 기능이 없다. 라우터는 하나 이상의 컴퓨터 네트워크를 거치는 경로를 정하는 기능 단위이고, OSI 모델을 따르는 네트워크에서는 네트워크 계층에서 동작한다.[@iso-iec-2382-obp-2015] IEEE 802.1Q-2022는 브리지로 이어진 네트워크의 원리와 MAC 브리지, VLAN 브리지의 동작을 정한다.[@ieee-802-1q-2022]
