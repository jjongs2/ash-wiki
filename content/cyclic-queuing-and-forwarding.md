---
title: Cyclic queuing and forwarding
tags:
  - network/ethernet
aliases:
  - CQF
  - IEEE 802.1Qch
verified: 2026-09-29
---

**Cyclic queuing and forwarding**(CQF)는 IEEE 802.1Qch-2017이 IEEE 802.1Q-2014의 개정(Amendment 29)으로 넣은 기능이다. 이 개정은 IEEE 802.1Q-2018에 합쳐졌다.[@ieee-802-1-tsn-tg-2026][@ieee-802-1qch-2017] IEEE 802.1Qch 프로젝트는 브리지와 종단국이 프레임을 큐에 넣고 큐를 비우는 절차를 주기적으로 맞춰 프레임 전송을 동기화하고, 혼잡 손실 없이 결정적인 지연을 얻는 것을 범위로 삼았다.[@ieee-802-1qch-project-2017] IEEE 802.1 작업 그룹의 [[tsn|TSN]] 요약은 CQF를 지연 상한을 위한 도구로 분류한다.[@ieee-802-1-tsn-summary-2026]

## 구조·동작

IEEE 802.1Qch-2017은 traffic scheduling과 스트림별 필터링과 policing(Per-Stream Filtering and Policing)으로 CQF를 지원하는 방법을 IEEE 802.1Q-2014에 더했다.[@ieee-802-1qch-2017]

NXP Real-time Edge 소프트웨어는 802.1Qch의 정의를 따라 IEEE 802.1Qbv와 IEEE 802.1Qci를 설정해 CQF를 구성하며, 이 CQF 설정은 기존 802.1Qbv 설정과 섞어 쓸 수 없다. NXP Real-time Edge 사용자 가이드에 따르면 CQF 설정에서 패킷은 경로의 노드마다 게이트가 열려 있는 시간(gate open time)만큼 지연된다. 모든 스트림의 cycle time과 gate open time은 같아야 하고, cycle time은 gate open time의 정수배여야 한다.[@nxp-realtimeedgeug-2026]

![[diagrams/cqf-per-node-delay.svg]]

## 비교·한계

IEEE 802.1Qch 프로젝트 페이지에 따르면 CQF가 있으면 네트워크 토폴로지와 상관없이 브리지 네트워크를 지나는 결정적인 지연을 쉽게 계산할 수 있다. CQF는 기존 기법보다 네트워크 지연을 훨씬 쉽게 정하게 하고, 전달 변동을 줄인다.[@ieee-802-1qch-project-2017]
