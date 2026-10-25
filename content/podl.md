---
title: PoDL
tags:
  - network/ethernet
aliases:
  - Power over Data Lines
  - IEEE 802.3bu
verified: 2026-10-06
---

**PoDL**(Power over Data Lines)은 한 쌍 [[ethernet|이더넷]]에서 데이터를 보내는 선 한 쌍으로 전력도 함께 보내는 방식이다. [[ieee-802-3|IEEE 802.3]]-2022의 Clause 104는 한 쌍 평형 꼬임쌍선 이더넷 [[ethernet-phy|PHY]]와 함께 쓰는 선택 사항인 전력 엔티티로, 전력을 대는 PSE(Power Sourcing Equipment)와 전력을 받는 PD(Powered Device)를 정한다. 장치는 PSE와 PD로 데이터를 보낼 수 있는 같은 케이블에서 전력을 대거나 받으며, PoDL은 PHY에 데이터와 그 데이터를 처리할 전력을 한 인터페이스로 주려는 것이다.[@ieee-802-3-2022]

IEEE 802.3bu-2016이 한 쌍 꼬임쌍선 이더넷의 PoDL을 IEEE 802.3에 넣었다.[@ieee-802-3-2022] IEEE 802.3dd-2022는 IEEE 802.3-2022에 대한 개정으로, Clause 104와 관련 부분을 편집과 기술 면에서 고치고 다듬으며 새 기능은 더하지 않는다.[@ieee-802-3dd-2022]

## 구성

IEEE 802.3-2022는 PoDL 시스템을 PSE, 링크 세그먼트, PD로 이루어진 것으로 정하고, [[10base-t1s#동작 모드|mixing segment]]용 PoDL 시스템은 정하지 않는다. PSE와 PD는 전력을 넣기 전과 전체 동작 전압을 걷어 낸 뒤에, 보통의 이더넷 트래픽 밖에 있는 데이터를 MDI(Medium Dependent Interface)로 SCCP(Serial Communication Classification Protocol)를 써서 주고받을 수 있다. Clause 104는 전력을 요청하는 장치를 검출하고 그 전력 요구에 따라 분류하는 물리 계층 프로토콜, PSE와 PD가 전력을 협상하고 할당하는 방법, 전체 동작 전압이 더는 필요 없을 때 공급 전압을 sleep 수준으로 낮추는 방법을 정한다.[@ieee-802-3-2022]

![[diagrams/podl-pse-pd-link-segment.svg]]

mixing segment 위의 전력 공급은 [[10base-t1s#멀티드롭 보강|10BASE-T1S의 멀티드롭 보강]]에서 다룬다.

## 타입

이 표준은 PSE와 PD를 타입으로 나누고, 타입마다 함께 쓸 수 있는 PHY를 아래와 같이 정한다.[@ieee-802-3-2022]

| 타입   | 함께 쓸 수 있는 PHY                                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type A | [[10base-t1s\|10BASE-T1S]], [[100base-t1\|100BASE-T1]][@ieee-802-3-2022]                                                                                            |
| Type B | [[1000base-t1\|1000BASE-T1]][@ieee-802-3-2022]                                                                                                                      |
| Type C | 10BASE-T1S, 100BASE-T1, 1000BASE-T1[@ieee-802-3-2022]                                                                                                               |
| Type D | IEEE 802.3 PHY와 맞지 않을 수 있고, 데이터 엔티티가 없을 수도 있다.[@ieee-802-3-2022]                                                                               |
| Type E | [[ieee-802-3#범위\|10BASE-T1L]][@ieee-802-3-2022]                                                                                                                   |
| Type F | [[multigbase-t1\|2.5GBASE-T1, 5GBASE-T1, 10GBASE-T1]][@ieee-802-3-2022], IEEE 802.3cy-2023이 더한 [[automotive-ethernet#물리 계층\|25GBASE-T1]][@ieee-802-3cy-2023] |

## 도입 배경

P802.3bu PAR(Project Authorization Request)는 IEEE P802.3bp처럼 개발 중인 한 쌍 꼬임쌍선 이더넷 링크에서 차량 센서나 산업 장치 같은 응용이 링크로 전력을 받아야 하는데, Clause 33의 DTE(Data Terminal Equipment) 전력 공급은 쓸 수 없어 새 표준이 필요하다고 밝혔다.[@ieee-802-3bu-par-2013] PoDL 연구 그룹은 한 쌍 링크 세그먼트용 전력 분배 기법을 정하고, 데이터가 없어도 동작하며, 차량, 운송, 산업 제어의 전압과 전류 수준을 지원하고, 미리 정한 전압·전류 설정으로 빠르게 시작하는 동작을 지원하며, IEEE P802.3bp와 호환되게 하는 것을 목표로 두었다.[@ieee-802-3bu-objectives-2013]
