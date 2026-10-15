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

IEEE 802.1Q-2022는 학습한 주소 정보를 [[virtual-lan|VLAN]]끼리 함께 쓰는지에 따라 두 방식을 정의한다. **SVL**(Shared VLAN Learning)은 정해진 VLAN 집합에서 한 VLAN에서 배운 개별 MAC 주소를 집합의 다른 모든 VLAN에 대한 전달 결정에도 쓰는 방식이고, SVL만 지원하는 브리지에서 그 집합은 모든 VLAN이다. **IVL**(Independent VLAN Learning)은 정해진 VLAN 식별자 집합에서 한 VLAN 식별자와 함께 배운 개별 MAC 주소를 집합의 다른 VLAN 식별자에 대한 전달 결정에 쓰지 않는 방식이다. 이 표준의 Annex F(참고)는 대부분의 경우 두 방식이 똑같이 잘 동작해 섞어 쓸 수 있다고 보고, IVL이 필요한 가장 단순한 예로 서로 다른 장치가 같은 개별 MAC 주소를 쓰거나 여러 네트워크에 이어진 한 장치가 모든 인터페이스에 같은 개별 MAC 주소를 쓰는 경우를 제시한다.[@ieee-802-1q-2022]

## 전달

목적지 주소가 주소 표에 있으면 스위치는 그 포트로만 프레임을 보낸다.[@microchip-ksz9477s-2019][@nxp-um10944-2017]

브리지의 전달 프로세스는 반사 릴레이(reflective relay)를 쓰는 포트가 아니면 받은 포트를 뺀 포트를 전달 후보로 삼고, 목적지 MAC 주소, VLAN 식별자, 필터링 데이터베이스의 정보, 포트의 기본 그룹 필터링 동작 등을 바탕으로 후보를 걸러 낸다. VLAN을 모르는 MAC 브리지는 VLAN 식별자를 쓰지 않는다. 그룹 주소 프레임의 기본 동작 가운데 Forward All Groups는 정적 필터링 항목이 걸러 내라고 명시하지 않는 한 프레임을 전달하고, 동적으로 등록된 그룹 주소 정보는 무시한다. 기본 필터링 서비스만 지원하는 브리지는 모든 포트에서 Forward All Groups로 동작하고, 확장 필터링 서비스를 지원하는 브리지도 관리로 바꾸지 않은 초기 상태에서는 Forward All Groups로 동작한다.[@ieee-802-1q-2022]

KSZ9477S는 찾은 목적지 포트가 프레임을 받은 포트와 같으면 그 프레임을 전달하지 않는다. 기본 설정에서는 목적지 주소가 주소 표에 없는 유니캐스트·멀티캐스트 프레임과 브로드캐스트 프레임을, 받은 포트를 뺀 모든 포트로 보낸다. KSZ9477S 데이터시트는 목적지를 몰라 여러 포트로 보내는 유니캐스트 프레임을 flooded unicast라 부른다.[@microchip-ksz9477s-2019] SJA1105TEL은 목적지를 모르는 프레임과 브로드캐스트 프레임을 받은 포트마다 설정한 포트 집합으로 보내며, 받은 포트는 그 집합에서 빼야 한다.[@nxp-um10944-2017]

![[diagrams/ethernet-switch-learning-forwarding.svg]]

[[spanning-tree-protocol|스패닝 트리 프로토콜]]은 브리지 포트마다 전달과 학습을 동적으로 관리해 일시적인 루프를 막는다.[@ieee-802-1q-2022]

## 전달 방식

KSZ9477S의 스위칭 엔진은 store-and-forward로 동작하고, FCS(Frame Check Sequence) 오류가 있는 패킷 등은 전달하지 않는다. KSZ9477S의 cut-through 모드는 패킷 전체를 기다리지 않고 처음 64바이트를 받은 뒤 전달을 시작해, 1 Gbit/s에서 지연이 패킷 크기와 상관없이 약 900 ns다. cut-through가 아닌 패킷의 최소 지연은 패킷 크기에 비례한다.[@microchip-ksz9477s-2019] SJA1105TEL의 수신 MAC은 [[cyclic-redundancy-check|CRC]] 오류를 찾으면 프레임을 바로 버리고, 검사를 통과한 프레임만 프레임 메모리에 저장한다.[@nxp-um10944-2017]

![[diagrams/switch-store-and-forward-cut-through.svg]]

KSZ9477S의 cut-through 모드는 [[time-aware-shaper|TAS]]와 함께 동작해, TAS를 켠 상태에서 출구 포트마다 켜고 끈다. 패킷이 cut-through로 전달되려면 출구 포트의 큐에 TAS가 걸려 있고, 패킷이 TAS를 쓰는 scheduled traffic 클래스에 속하고, TAS 전송 창이 열려 있고, 그 포트가 다른 패킷을 보내고 있지 않고, 그 포트의 TAS 큐가 비어 있고, 출구 포트와 입구 포트의 속도가 같고, 패킷이 유니캐스트여야 한다. 조건을 채우지 못한 패킷은 보통처럼 저장했다가 큐에 넣는다.[@microchip-ksz9477s-2019]

KSZ9477S의 포트는 전이중과 반이중을 모두 지원한다.[@microchip-ksz9477s-2019] 스위치 안의 큐나 버퍼가 넘치면 스위치는 프레임을 버린다.[@microchip-ksz9477s-2019][@nxp-um10944-2017]

브리지를 지나는 프레임의 전송 지연에는 출력 포트에서 전송 차례가 올 때까지 기다리는 큐 지연이 들어간다. 이 표준의 Annex L은 여러 입력 포트에서 거의 같은 때 들어와 한 출력 포트의 큐에 쌓인 같은 클래스의 프레임 때문에 생기는 지연을 **fan-in 지연**이라 부른다.[@ieee-802-1q-2022]

NXP SJA1110은 [[tsn|TSN]] 표준을 여럿 지원하는 [[automotive-ethernet|차량용 이더넷]] 스위치 제품군이다.[@nxp-sja1110autesfs-2022]

OPEN Alliance TC11은 차량용 이더넷 네트워크에 맞는 이더넷 스위치 반도체의 하드웨어 요구사항과 적합성 시험을 정한다. 그 범위는 MAC 주소와 VLAN 처리에 기반한 스위칭, 큐잉·하드웨어 타임스탬프·policing·셰이핑에 기반한 서비스 품질 기능([[avb|AVB]]·TSN 기능 포함), 성능, 설정과 진단, 필터링과 미러링이다. TC11은 2016년 9월에 Ethernet Switch Requirements V1.0을, 2018년 11월에 Ethernet Switch Test Specification V1.0을 승인했다.[@open-alliance-tc11-2026]

## 관리형과 비관리형

KSZ9477S는 레이어 2 관리형 스위치로, SPI(Serial Peripheral Interface)나 I2C(Inter-Integrated Circuit) 같은 호스트 인터페이스, 또는 인밴드 관리로 내부 레지스터에 접근해 설정한다.[@microchip-ksz9477s-2019] Microchip의 기가비트 이더넷 스위치(KSZ9896C, KSZ9477S 등)는 VLAN과 QoS를 마이크로컨트롤러, 인밴드 접근, 호스트 프로세서로 설정하고, 설정 스트랩으로는 기본 설정과 자동 협상만 정한다. Microchip AN2577에 따르면 비관리형 이더넷 스위치는 기능을 관리할 외부 마이크로컨트롤러나 프로세서 없이 스트랩 설정만으로 동작한다.[@microchip-an2577-2017]

## AUTOSAR의 스위치 모델

[[autosar|AUTOSAR]] Classic Platform R25-11의 Ethernet Switch Driver 명세는 스위치 포트에 역할을 줄 수 있게 한다. Host port는 스위치를 제어하는 ECU(host ECU)와 이어진 포트이고, up link port는 같은 ECU 안의 다른 스위치 포트와 이어져 cascaded switch를 나타내는 포트다. 역할을 주지 않은 포트는 보통 포트다. 스위치 하나는 host port를 꼭 하나 갖거나 up link port를 하나 이상 가지며, host port가 있는 스위치도 up link port를 여럿 가질 수 있다. Master switch는 host port 하나로 host ECU와 잇고, slave switch는 up link port 하나로 master switch와 잇는다. 내부 클록을 동기화할 수 있는 스위치끼리 up link port로 이어져 있을 때 그 클록 동기화를 켜면(`EthSwtClockSynchronizationSupport`가 `TRUE`), 이어진 두 up link port 사이의 지연은 잴 필요가 없다.[@autosar-cp-sws-ethernetswitchdriver-2025]

![[diagrams/autosar-switch-port-roles.svg]]

Ethernet Interface는 스위치 포트를 묶은 switch port group을 두고, 위층의 켜기 요청과 끄기 요청을 포트 묶음 단위로 받아 판단한다. 켜기 요청은 끄기 요청보다 늘 앞선다. [[autosar-network-management#Partial networking|Partial network]] 요청에 따라 포트 묶음을 켜고 끌 때는 [[basic-software-mode-manager|BswM]]의 규칙이 포트 묶음을 제어한다. 포트 묶음의 링크 상태는 묶음에 든 모든 포트의 링크 상태를 모아 계산하며, 이를 **링크 상태 누적**이라 한다. 이때 포트의 링크 상태는 [[ieee-802-1ae|MACsec]]으로 보호하는 포트와 보호하지 않는 포트를 나누어 따진다. 묶음 안의 host port나 up link port의 링크 상태가 down이거나, 역할이 없는 포트의 링크 상태가 모두 down이면 묶음의 링크도 down으로 보고, 그렇지 않으면 active로 본다.[@autosar-cp-sws-ethernetinterface-2025]

이더넷에서 이더넷으로 보내는 미러링은 [[autosar-communication-stack#Bus Mirroring|Bus Mirroring]] 모듈이 아니라 Ethernet Switch Driver의 port mirroring 기능이 맡는다.[@autosar-cp-sws-busmirroring-2025]

## 리피터, 브리지, 라우터와의 차이

ISO/IEC 2382:2015는 LAN에서 신호를 증폭하거나 재생해 데이터 스테이션 사이의 전송 거리를 늘리거나 두 갈래를 잇는 장치를 리피터로 정의한다. 브리지는 같은 LLC(Logical Link Control) 프로토콜을 쓰되 MAC 프로토콜은 다를 수 있는 두 LAN을 잇는 기능 단위이고, [[osi-model|OSI]] 모델을 따르는 네트워크에서는 데이터 링크 계층에서 동작하므로 라우팅 기능이 없다. 라우터는 하나 이상의 컴퓨터 네트워크를 거치는 경로를 정하는 기능 단위이고, OSI 모델을 따르는 네트워크에서는 네트워크 계층에서 동작한다.[@iso-iec-2382-obp-2015] IEEE 802.1Q-2022는 브리지로 이어진 네트워크의 원리와 MAC 브리지, VLAN 브리지의 동작을 정한다.[@ieee-802-1q-2022]

[[ieee-802-3|IEEE 802.3]]-2022는 브리지를 IEEE 802.1Q를 따르는 레이어 2 연결 장치로 정의하고, 스위치라고도 부른다. 이 표준은 리피터를 한 세그먼트에서 받은 데이터를 타이밍과 진폭을 되살려 연결된 다른 모든 세그먼트로 다시 보내는 장치로 두고, 10BASE-T 같은 스타 토폴로지에서는 허브로 쓴다. 리피터로 나뉜 MAC 부계층들은 한 충돌 도메인에 들고, 브리지로 나뉜 MAC 부계층들은 서로 다른 충돌 도메인에 든다. 충돌은 반이중에서만 생긴다. 전이중은 LAN에 스테이션이 정확히 둘일 때 쓸 수 있고, 이때는 공유 매체를 다툴 일이 없어 [[bus-access-method#경쟁 방식|CSMA/CD]](Carrier Sense Multiple Access with Collision Detection)가 필요 없다. 이 표준은 전이중 동작의 가장 흔한 구성으로, 가운데 둔 브리지의 각 포트에 장치 하나씩을 전용 LAN으로 잇는 것을 상정한다.[@ieee-802-3-2022]
