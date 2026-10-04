---
title: IEEE 802.1Q
tags:
  - network/ethernet
verified: 2026-09-29
publisher: IEEE
edition: 2022
status: 개정 중
---

**IEEE 802.1Q**는 브리지와 브리지로 이어진 네트워크를 정하는 IEEE 표준이다. 정식 제목은 "IEEE Standard for Local and Metropolitan Area Networks — Bridges and Bridged Networks"이다.[@ieee-802-1q-2022] IEEE 802.1 작업 그룹에 따르면 802.1Q는 예로부터 [[virtual-lan|VLAN]]과 VLAN 브리지를 정하는 표준이었다.[@ieee-802-1q-project-2014]

## 범위

브리지로 이어진 네트워크가 MAC(Medium Access Control) 서비스를 어떻게 지원하는지와 그 네트워크의 동작 원리를 정하고, MAC 브리지와 VLAN 브리지의 동작을 관리, 프로토콜, 알고리즘까지 정한다. [[virtual-lan#VLAN 태그|VLAN 태그]]를 단 프레임이 VID(VLAN Identifier)와 우선순위 정보를 싣는 프레임 형식을 정하고, 우선순위와 drop precedence 표시로 서비스 품질이 서로 다른 [[traffic-class|트래픽 클래스]]를 지원하는 파라미터와 대응을 정한다. 브리지의 전달 과정에 flow metering, 전송 큐 관리, [[traffic-class#전송 선택|전송 선택 알고리즘]]을 넣는 것도 이 표준이 정한다.[@ieee-802-1q-2022] 2022년판의 개정 802.1Qdy-2025는 이 표준의 MSTP(Multiple Spanning Tree Protocol) 요구사항을 다루고, RSTP(Rapid Spanning Tree Protocol)와 MSTP의 설정과 상태 보고에 쓰는 YANG(Yet Another Next Generation) 모델을 정한다.[@ieee-802-1qdy-2025]

C-TAG(Customer VLAN Tag), S-TAG(Service VLAN Tag), B-TAG(Backbone VLAN Tag)는 이 표준이 정한 VLAN 태그이고, MVRP(Multiple VLAN Registration Protocol)도 이 표준이 정한다.[@ieee-ra-ethertype-2024]

## 개정 이력

- 1998년: 이 표준이 IEEE 802.1Q-1998로 처음 나왔다.[@ieee-802-1q-2022] VLAN 브리지 LAN(Virtual Bridged Local Area Network)의 구조, 서비스, 프로토콜과 알고리즘을 정했다.[@ieee-802-1q-1998]
- 2001년: 개정 802.1v-2001이 데이터 링크 계층의 프로토콜 식별에 따라 프레임을 VLAN으로 분류하는 규칙을 더했다.[@ieee-802-1v-2001]
- 2003년: 2003 Edition이 1998년판에 802.1u-2001, 802.1v-2001, 802.1s-2002를 합쳤다.[@ieee-802-1q-1998]
- 2005년: 2005년판도 1998년판과 802.1u-2001, 802.1v-2001, 802.1s-2002를 합쳤다. 2003 Edition을 투표에 부친 결과로, 802.1D의 개선에 맞춘 유지보수 변경을 더한 개정판이었다.[@ieee-802-1q-2005]
- 2011년: 2005년판에 802.1ad-2005, 802.1ak-2007, 802.1Qav-2009, 802.1Qat-2010 등을 합쳤다.[@ieee-802-1q-2011] 802.1ak는 MRP(Multiple Registration Protocol)와 그 응용인 MVRP, MMRP(Multiple MAC Registration Protocol)를 정한 개정이고, 802.1ad는 provider bridge를 다룬 개정이다.[@ieee-802-1ak-project-2015]
- 2014년: 2011년판에 802.1Qbe, 802.1Qbc, 802.1Qbb, 802.1Qaz, 802.1Qbf, 802.1Qbg, 802.1aq, 802.1Qbp와 정오표 Cor 2를 합쳤다.[@ieee-802-1q-2014][@ieee-802-1q-2014-project-2020] IEEE 802.1D-2004를 대체했고[@ieee-802-1q-2014], 802.1D가 정하던 기능의 상당 부분을 담았다.[@ieee-802-1q-2014-project-2020]
- 2018년: 2014년판을 대체했고, 그 뒤의 개정 802.1Qcd, 802.1Qca, 802.1Qbv, 802.1Qbu, 802.1Qbz, 802.1Qci, 802.1Qch와 정오표 Cor 1을 합쳤다.[@ieee-802-1q-2018] [[tsn|TSN]] 기능 가운데 [[time-aware-shaper|scheduled traffic]]을 넣은 802.1Qbv-2015는 802.1Q-2014를 개정한 뒤 이 판에 합쳐졌다.[@ieee-802-1-tsn-tg-2026]
- 2022년: 현행판. 2018년판을 대체했고[@ieee-802-1q-2022], 2018년판에 개정 802.1Qcc, 802.1Qcp, 802.1Qcy, 802.1Qcr, 802.1Qcx를 합친 판이다.[@ieee-802-1q-rev-2025]
- 2023년: 2022년판을 대체할 개정 프로젝트 P802.1Q가 승인되어 진행 중이다.[@ieee-p802-1q-2023]
