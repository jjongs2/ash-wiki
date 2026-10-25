---
title: IEEE 802.1DG
tags:
  - network/ethernet
verified: 2026-10-06
publisher: IEEE
edition: 2025
status: 유효
---

**IEEE 802.1DG**는 차량 안의 [[ethernet-switch|브리지]]로 이어진 [[ieee-802-3|IEEE 802.3]] [[ethernet|이더넷]] 네트워크를 위한 [[tsn|TSN]] 프로파일을 정하는 IEEE 표준이다. 정식 제목은 "IEEE Standard for Local and metropolitan area networks — Time-Sensitive Networking Profile for Automotive In-Vehicle Ethernet Communications"이다.[@ieee-802-1dg-2025]

## 범위

이 표준은 IEEE 802.1 TSN 표준을 바탕으로, 지연에 상한이 있는 차량 안의 브리지 IEEE 802.3 이더넷 네트워크를 위한 프로파일을 정한다. 차량 안의 여러 응용을 지원하는 네트워크를 설계하고 구현하는 사람에게 프로파일을 주는 것이 목적이다. 이 표준은 IEEE 802.1 표준의 넓은 기능 가운데 차량 내 네트워크에 바로 쓸 수 있는 기능을 고르고, 선택 파라미터의 설정 권고를 포함해 그 기능을 어떻게 쓰는지 다룬다.[@ieee-802-1dg-2025]

이 표준은 자신을 따른다는 스테이션에 IEEE 802.3의 점대점 전이중 링크 세그먼트를 지원하도록 요구한다. 브리지에는 모든 포트에서 [[virtual-lan#VLAN 태그|C-VLAN 태그]], [[ethernet-switch#주소 학습|학습 과정]], 최대 SDU(Service Data Unit) 크기 필터링, ingress·egress 필터링, [[per-stream-filtering-and-policing#스트림 게이트|stream gating]]을 지원하고, [[ethernet-switch#주소 학습|필터링 데이터베이스]]에 MAC(Medium Access Control) 주소 등록 항목을 1024개 이상 둘 수 있도록 요구한다. 브리지에는 시간 동기화 방식을 하나 이상 지원하기를 권하고, [[ieee-802-1ae|MACsec]] 지원은 선택으로 둔다. 이 표준은 [[asynchronous-traffic-shaping|ATS]], [[credit-based-shaper|credit-based shaper]], [[time-aware-shaper|scheduled traffic]]의 설정을 저마다 따로 다룬다.[@ieee-802-1dg-2025]

IEEE 802.1 작업 그룹의 P802.1DG 프로젝트 페이지에 따르면, 이 프로젝트의 범위는 보안, 고가용성과 신뢰성, 유지보수성, 지연 상한을 요구하는 응용까지 차량 안의 모든 응용을 지원하는 결정적 이더넷 네트워크의 프로파일이다. 이 프로젝트의 연락 기관은 [[autosar|AUTOSAR]], [[avb|Avnu Alliance]], JASPAR(Japan Automotive Software Platform and Architecture)다.[@ieee-802-1dg-project-2025]

IEEE SA 자료에 따르면 차량에서 TSN은 다른 IEEE 기술과 함께 시간 동기화, 매우 낮은 지터, 지연 상한, 초신뢰성을 주고, 타이밍과 대역 예약의 값을 미리 설정해 빨리 기동하게 한다.[@ieee-tsn-automotive-flyer-2026]

## 개정 이력

- 2025년: 첫판. 2019년 2월에 PAR(Project Authorization Request)이 승인된 프로젝트로, 2025년 5월에 승인되어 6월에 나왔다.[@ieee-802-1dg-project-2025]
- 2026년: 차량 내 네트워크를 위해 [[ieee-802-1as|IEEE 802.1AS]] 시간 동기화의 옵션, 기본값, 파라미터 값을 고르고 설정 지침과 제약을 주는 개정 프로젝트 [[tsn#도구|P802.1DGei]]의 PAR이 2026년 9월에 승인되었다.[@ieee-p802-1dgei-2026]
