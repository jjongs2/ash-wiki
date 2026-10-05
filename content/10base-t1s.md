---
title: 10BASE-T1S
tags:
  - network/ethernet
verified: 2026-10-06
---

**10BASE-T1S**는 평형 도체 한 쌍으로 10 Mbit/s를 보내는 [[ethernet|이더넷]] 물리 계층이다. [[ieee-802-3|IEEE 802.3]]-2022는 10BASE-T1S의 도달 거리를 적어도 15 m로 두고, 같은 평형 도체 한 쌍 위에서 적어도 1000 m를 잇는 10 Mbit/s 물리 계층으로 10BASE-T1L을 따로 둔다.[@ieee-802-3-2022]

P802.3cg PAR(Project Authorization Request)는 차량과 자동화 산업이 기존 네트워크를 이더넷으로 옮기기 시작하면서 평형 도체 한 쌍으로 동작하는 10 Mbit/s 방식이 필요해졌지만, IEEE 802.3에는 아직 그런 방식이 없다고 밝혔다.[@ieee-802-3cg-par-2018] P802.3cg 목표에는 노드 8개 이상이 붙은 25 m 이상의 세그먼트에서 반이중 멀티드롭으로 동작하는 선택 사항이 있었다.[@ieee-802-3cg-objectives-2018]

## 동작 모드

IEEE 802.3-2022는 모든 10BASE-T1S [[ethernet-phy|PHY]]가 링크 상대 하나와 점대점 링크 세그먼트에서 반이중으로 동작할 수 있도록 정한다. 여기에 서로 함께 쓸 수 없는 선택 모드 둘을 더 둔다. 하나는 점대점 링크 세그먼트의 전이중 모드이고, 다른 하나는 여러 스테이션이 mixing segment에 이어지는 반이중 공유 매체 모드로, **멀티드롭 모드**라 부른다. 이 표준은 MDI(Medium Dependent Interface)가 셋 이상 이어질 수 있는 매체를 **mixing segment**라 부른다.[@ieee-802-3-2022]

점대점 링크 세그먼트는 인라인 커넥터를 4개까지 두고 적어도 15 m를 잇는다. 반이중에서는 두 방향이 10 Mbit/s를 나눠 쓰고, 전이중에서는 방향마다 10 Mbit/s를 동시에 쓴다. 멀티드롭 모드의 mixing segment는 적어도 25 m의 trunk에 PHY를 적어도 8개 잇고, PHY는 trunk에 바로 붙거나 10 cm까지의 스텁 끝에 붙는다. 노드들은 10 Mbit/s를 나눠 쓴다.[@ieee-802-3-2022]

10BASE-T1S의 [[ethernet-phy#자동 협상|자동 협상]]은 Clause 98이 정하며 멀티드롭 모드에서는 쓸 수 없고, 멀티드롭과 점대점 가운데 어느 모드로 동작할지는 설정 비트로 고른다.[@ieee-802-3-2022]

## 부호화

IEEE 802.3-2022는 10BASE-T1S PHY를 PCS(Physical Coding Sublayer)와 PMA(Physical Medium Attachment)로 이루고, 두 [[ethernet-phy#부계층|부계층]]을 하나로 묶은 구조라 AUI(Attachment Unit Interface)를 두지 않는다. PCS는 데이터를 17비트 자기 동기 스크램블러로 스크램블한 뒤 4B/5B로 부호화하고, PMA는 두 준위의 DME(Differential Manchester Encoding)로 보낸다. DME는 클럭이 신호에 실리고 그 자체로 균형 잡힌 선로 부호여서, 직류 기준선이 거의 흔들리지 않고 잡음이 많은 환경에서도 클럭과 데이터를 복구할 수 있다.[@ieee-802-3-2022]

## PLCA

IEEE 802.3-2022는 mixing segment에서 동작하는 10BASE-T1S에 송신 기회를 만들어 주는 방법을 **PLCA**(Physical Layer Collision Avoidance)라 부르고, Clause 148의 RS(Reconciliation Sublayer)로 정한다. PLCA는 멀티드롭 모드의 반이중 10BASE-T1S PHY에서 쓰는 선택 기능이고, 관리 인터페이스로 켜고 끌 수 있으며, 끄면 RS의 대응은 Clause 22와 같다. 켜면 PLCA RS는 MAC(Medium Access Control)의 데이터를 물리 계층의 송신 기회에 맞춘다. PLCA를 켠 물리 계층은 부하가 큰 [[bus-access-method#경쟁 방식|CSMA/CD]](Carrier Sense Multiple Access with Collision Detection) 반이중 공유 매체 네트워크에서 대역을 더 쓰게 하고 접근 지연을 줄일 수 있다.[@ieee-802-3-2022]

mixing segment의 송신 기회는 로컬 충돌 도메인 안에서 겹치지 않는 노드 ID(identifier) 순서로 돌아가며 주어진다. 노드 ID는 관리 엔티티가 정하며, 정하는 방법은 이 표준의 범위 밖이다. ID가 0인 노드가 매체에 BEACON을 보내고, BEACON을 받으면 송신 기회의 새 주기가 시작된다. 노드는 자기 송신 기회에 패킷 하나를 보내고, 설정한 한도까지 패킷을 더 보내도록 할 수도 있다.[@ieee-802-3-2022]

ID 0인 노드가 고장 나도 네트워크는 PLCA가 없는 CSMA/CD 네트워크와 같은 성능으로 계속 동작한다. PLCA를 켠 노드와 켜지 않은 노드는 같은 mixing segment에서 함께 IEEE 802.3 CSMA/CD로 동작할 수 있지만, 켜지 않은 노드의 비율이 늘수록 성능 이득은 줄어든다.[@ieee-802-3-2022]

## 멀티드롭 보강

IEEE 802.3da-2026은 IEEE 802.3-2022에 대한 개정으로, 10BASE-T1S 물리 계층의 10 Mbit/s 공유 매체(멀티드롭) 모드를 보강하는 멀티드롭 전용 물리 계층을 새로 정한다. 여기에는 RS, 관리 파라미터, 시간 동기 프로토콜을 위한 이더넷 지원, mixing segment에 이어진 여러 PD(Powered Device)에 대한 선택 전력 공급이 든다.[@ieee-802-3da-2026] P802.3da 태스크 포스는 적어도 노드 16개를 적어도 50 m에 잇는 mixing segment, 선택 사항인 PLCA 노드 ID 할당 방법, Clause 147을 따르는 mixing segment에서 Clause 147 PHY와의 하위 호환, 선택 사항인 TSSI(Time Synchronization Service Interface) 지원을 목표로 두었다.[@ieee-802-3da-objectives-2023]

2026년 7월 17일 IEEE 802 LMSC(LAN/MAN Standards Committee)는 IEEE 802.3 작업 그룹 아래에, PLCA의 멀티드롭 지연, 지터, 확장성 보강을 다룰 PAR와 CSD(Criteria for Standards Development)를 만드는 연구 그룹을 세웠다.[@ieee-802-3-plca-enhancements-sg-2026] 이 연구 그룹이 낸 P802.3dx 초안 PAR는 지금 PLCA의 최대 지연이 일부 제어 응용에 모자라, 일부 멀티드롭 공유 네트워크에서 최대 지연을 줄이고 결정성을 높일 필요가 있다고 밝힌다.[@ieee-802-3dx-par-2026]

## OPEN Alliance 명세

OPEN Alliance TC14는 차량에서 10BASE-T1S를 쓸 수 있게 하려고 적합성, 상호 운용성, EMC(Electromagnetic Compatibility) 시험 명세와 고급 진단 기능, 시스템 구현 명세, PMD(Physical Medium Dependent) 트랜시버 인터페이스, PLCA 레지스터, 토폴로지 탐색 방법을 정한다. TC14는 TC6와 꾸린 공동 작업 그룹에서 [[mii|MII]]·SPI(Serial Peripheral Interface) 명세의 표준화도 돕는다.[@open-alliance-tc14-2026]

LAN8650/1은 MAC과 10BASE-T1S PHY를 한 칩에 담아, MAC이 없는 마이크로컨트롤러도 10BASE-T1S 네트워크에 붙게 한다. 마이크로컨트롤러와는 4핀 SPI 하나로 잇고, 이더넷 패킷을 OPEN Alliance 10BASE-T1x MAC-PHY Serial Interface 명세에 따라 나누어 보낸다.[@microchip-lan8650-2025]
