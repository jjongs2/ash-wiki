---
title: 차량용 이더넷
tags:
  - network/ethernet
verified: 2026-09-29
---

**차량용 이더넷**(Automotive Ethernet)은 차량 안에서 쓰는 이더넷이다. ISO 21111-1은 차량 내 이더넷(in-vehicle Ethernet)을 차량 안 구현에 맞춘 이더넷 네트워크 시스템으로 정의한다.[@iso-21111-1-obp-2020] "automotive Ethernet"이라는 이름은 IEEE 802.3 작업 그룹과 OPEN Alliance가 쓴다.[@ieee-802-3ch-objectives-2017][@open-alliance-about-2026]

ISO 21111 시리즈는 차량 내 이더넷의 요구사항과 시험 계획을 담는다. 이더넷 요구사항은 대체로 ISO/IEC/IEEE 8802-3에 있고, ISO 21111은 웨이크업과 입출력 기능처럼 차량 응용에 필요한 보충 명세를 더한다.[@iso-21111-1-obp-2020]

OPEN Alliance는 2011년에 설립되었다.[@open-alliance-about-2026][@ti-sszt730-2018] 설립 무렵 OPEN Alliance의 핵심 목표는 100 Mbit/s BroadR-Reach 물리 계층 명세를 개방된 업계 표준이자 사실상 표준으로 세우는 것이었다.[@open-alliance-about-2014] OPEN Alliance는 100BASE-T1과 1000BASE-T1의 상호 운용성 시험 명세를 펴낸다.[@open-alliance-100base-t1-iop-2024][@open-alliance-1000base-t1-iop-2024]

## 물리 계층

IEEE 802.3은 여러 속도의 이더넷을 공통 MAC(Media Access Control) 명세 하나로 정하고, 속도마다 다른 [[ethernet-phy|PHY]]를 골라 쓰게 한다.[@ieee-802-3-2022] 차량용 PHY를 만든 IEEE 802.3의 네 태스크 포스(P802.3bw, P802.3bp, P802.3ch, P802.3cg)는 모두 MAC 클라이언트 서비스 인터페이스에서 IEEE 802.3의 프레임 포맷과 최소·최대 프레임 크기를 유지하고, EMC(Electromagnetic Compatibility)와 온도 같은 조건이 걸리는 차량 환경에서 동작하는 것을 목표로 두었다.[@ieee-802-3ch-objectives-2017][@ieee-802-3bw-objectives-2014][@ieee-802-3bp-objectives-2014][@ieee-802-3cg-objectives-2018]

IEEE SA에 따르면 차량 배선의 무게와 공간이 큰 과제여서, 차량용 PHY로 10 Mbit/s부터 10 Gbit/s까지 나왔다.[@ieee-tsn-automotive-flyer-2026] 이 PHY들을 넣은 IEEE 802.3 개정은 아래와 같다.

| 개정              | 속도              | 넣은 것                                                                                                          |
| ----------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| IEEE 802.3cg-2019 | 10 Mbit/s         | 평형 도체 한 쌍 위의 PHY와 선택 사항인 전력 공급[@ieee-802-3cg-2019]                                             |
| IEEE 802.3bw-2015 | 100 Mbit/s        | 평형 꼬임쌍선 한 쌍 위의 점대점 전이중 PHY인 [[100base-t1\|100BASE-T1]][@ieee-802-3bw-2015]                      |
| IEEE 802.3bp-2016 | 1 Gbit/s          | 꼬임쌍선 한 쌍 위의 점대점 PHY인 [[1000base-t1\|1000BASE-T1]][@ieee-802-3bp-objectives-2014][@ieee-802-3bp-2016] |
| IEEE 802.3ch-2020 | 2.5, 5, 10 Gbit/s | 평형 도체 한 쌍 위의 PHY[@ieee-802-3ch-2020]                                                                     |

IEEE 802.3da-2026은 10BASE-T1S 물리 계층의 10 Mbit/s 공유 매체(멀티드롭) 모드를 보강한다.[@ieee-802-3da-2026] P802.3cg 목표에는 노드 8개 이상이 붙은 25 m 이상의 세그먼트에서 반이중 멀티드롭으로 동작하는 선택 사항이 있었다.[@ieee-802-3cg-objectives-2018]

## 케이블

P802.3ch 태스크 포스는 비차폐 꼬임쌍선, 차폐 꼬임쌍선, 차폐 쿼드, 차폐 평행쌍, 동축, twinax 같은 차량용 케이블 가운데 적어도 한 종류에서, 인라인 커넥터를 4개까지 둔 15 m 이상의 점대점 링크를 지원하는 것을 목표로 두었다.[@ieee-802-3ch-objectives-2017]

![[diagrams/link-segment-inline-connectors.svg]]

100BASE-T1은 비차폐 꼬임쌍선 한 쌍으로 동작할 수 있어 차폐 케이블이 필요 없고, 케이블의 무게와 비용이 준다.[@ti-sszt730-2018][@open-alliance-about-2014] IEEE 802.3 작업 그룹은 P802.3bw의 CSD(Criteria for Standards Development)에서, 선 쌍 수를 줄이면 무게가 줄어 설치와 운용 비용이 크게 떨어질 것으로 보았다.[@ieee-802-3bw-csd-2014]

## 상위 프로토콜

[[doip|DoIP]]를 정하는 ISO 13400-2는 IP(Internet Protocol), TCP, UDP를 써서 진단 테스터와 차량 안 서버 사이의 진단 통신 요구사항을 정한다.[@iso-13400-2-obp-2025] [[some-ip|SOME/IP]]는 서비스 지향 통신을 제공하며, 메시지를 IP 기반 차량 내 네트워크의 UDP나 TCP 페이로드로 나른다.[@autosar-fo-prs-someipprotocol-2025]

![[diagrams/automotive-ethernet-protocol-stack.svg]]

IEEE 802.1 [[tsn|TSN]] 태스크 그룹은 IEEE 802 네트워크에서 지연 상한이 있는 패킷 전달을 목표로 삼으며, 옛 [[avb|AVB]] 태스크 그룹에서 이어졌다.[@ieee-802-1-tsn-tg-2026] IEEE SA에 따르면 AVB 표준은 차량 인포테인먼트 시스템에 쓰인다.[@ieee-tsn-automotive-flyer-2026] IEEE 802.1DG-2025는 TSN 표준에 기반해, 지연 상한이 있는 차량 내 브리지 IEEE 802.3 이더넷 네트워크의 프로파일을 정한다.[@ieee-802-1dg-2025]

## 차량 응용

IEEE 802.3 작업 그룹은 차량용 이더넷 수요를 이끄는 것으로 카메라, 충돌 회피, 인포테인먼트처럼 대역을 많이 쓰는 차량 응용을 들었다.[@ieee-802-3bw-csd-2014] 이더넷을 쓰면 차량의 펌웨어 업데이트가 빨라진다.[@ieee-tsn-automotive-flyer-2026][@ti-szzy009-2018] TI 기술 기사에 따르면 IEEE 802.3bw와 802.3bp의 차량용 요구사항은 인포테인먼트, ADAS(Advanced Driver Assistance Systems), 온보드 진단, 5G나 V2X(Vehicle-to-Everything) 같은 외부 연결이 퍼지는 바탕이 되었다.[@ti-sszt730-2018]

## 차량 버스와의 차이

TI 기술 기사에 따르면 이더넷은 스위치 네트워크를 이루어, [[can|CAN]], LIN, FlexRay, MOST(Media Oriented Systems Transport) 같은 공유 버스 토폴로지로는 얻을 수 없는 대역과 데이터 속도를 낸다.[@ti-sszt730-2018]

차량 버스 전반은 [[vehicle-bus|차량 버스]]에서 다룬다.
