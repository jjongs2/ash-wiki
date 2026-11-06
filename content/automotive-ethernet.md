---
title: 차량용 이더넷
tags:
  - network/ethernet
verified: 2026-09-29
---

**차량용 이더넷**(Automotive Ethernet)은 차량 안에서 쓰는 [[ethernet|이더넷]]이다. ISO 21111-1:2020은 차량 내 이더넷(in-vehicle Ethernet)을 차량 안 구현에 맞춘 이더넷 네트워크 시스템으로 정의한다.[@iso-21111-1-obp-2020] "automotive Ethernet"이라는 이름은 [[ieee-802-3|IEEE 802.3]] 작업 그룹과 OPEN Alliance가 쓴다.[@ieee-802-3ch-objectives-2017][@open-alliance-about-2026]

ISO 21111 시리즈는 차량 내 이더넷의 요구사항과 시험 계획을 담는다. 이더넷 요구사항은 대체로 [[ieee-802-3#개정 이력|ISO/IEC/IEEE 8802-3]]에 있고, ISO 21111은 [[ethernet-sleep-wake-up|웨이크업]]과 입출력 기능처럼 차량 응용에 필요한 보충 명세를 더한다.[@iso-21111-1-obp-2020]

OPEN Alliance는 2011년에 설립되었다.[@open-alliance-about-2026][@ti-sszt730-2018] 설립 무렵 OPEN Alliance의 핵심 목표는 100 Mbit/s [[100base-t1|BroadR-Reach]] 물리 계층 명세를 개방된 업계 표준이자 사실상 표준으로 세우는 것이었다.[@open-alliance-about-2014]

## 물리 계층

IEEE 802.3-2022는 여러 속도의 이더넷을 공통 MAC(Medium Access Control) 명세 하나로 정하고, 속도마다 다른 [[ethernet-phy|PHY]]를 골라 쓰게 한다.[@ieee-802-3-2022] 차량용 PHY를 만든 IEEE 802.3의 네 태스크 포스(P802.3bw, P802.3bp, P802.3ch, P802.3cg)는 모두 MAC 클라이언트 서비스 인터페이스에서 IEEE 802.3의 프레임 포맷과 최소·최대 프레임 크기를 유지하고, EMC(Electromagnetic Compatibility)와 온도 같은 조건이 걸리는 차량 환경에서 동작하는 것을 목표로 두었다.[@ieee-802-3ch-objectives-2017][@ieee-802-3bw-objectives-2014][@ieee-802-3bp-objectives-2014][@ieee-802-3cg-objectives-2018]

IEEE SA에 따르면 차량 배선의 무게와 공간이 큰 과제여서 차량을 겨냥한 PHY가 여럿 나왔고, 10 Mbit/s(IEEE 802.3cg), 100 Mbit/s(IEEE 802.3bw), 1 Gbit/s(IEEE 802.3bp), 2.5·5·10 Gbit/s(IEEE 802.3ch)가 그 예다.[@ieee-tsn-automotive-flyer-2026] IEEE 802.3-2022와 그 개정 IEEE 802.3cy-2023, IEEE 802.3cz-2023이 정하는 차량용 PHY는 아래와 같다. 각 PHY를 넣은 개정은 [[ieee-802-3#개정 이력|IEEE 802.3의 개정 이력]]에서 다룬다.

| PHY                                                                     | 속도                      | 매체                    | 도달 거리                                                                                                        |
| ----------------------------------------------------------------------- | ------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [[10base-t1s\|10BASE-T1S]]                                              | 10 Mbit/s                 | 평형 도체 한 쌍         | 점대점 적어도 15 m, 멀티드롭은 PHY를 적어도 8개 잇는 trunk 적어도 25 m[@ieee-802-3-2022][@ieee-802-3cg-par-2018] |
| [[100base-t1\|100BASE-T1]]                                              | 100 Mbit/s                | 평형 꼬임쌍선 한 쌍     | 15 m까지[@ieee-802-3-2022][@ieee-802-3bw-par-2014]                                                               |
| [[1000base-t1\|1000BASE-T1]]                                            | 1 Gbit/s                  | 꼬임쌍선 한 쌍          | type A 적어도 15 m, 선택 사항인 type B 적어도 40 m[@ieee-802-3-2022]                                             |
| [[optical-automotive-ethernet\|1000BASE-RHC]]                           | 1 Gbit/s                  | 플라스틱 광섬유 두 가닥 | 광섬유 채널 type II(적어도 40 m)와 type III(적어도 15 m)에서 동작[@ieee-802-3-2022]                              |
| [[multigbase-t1\|2.5GBASE-T1, 5GBASE-T1, 10GBASE-T1]]                   | 2.5, 5, 10 Gbit/s         | 평형 도체 한 쌍         | 적어도 15 m[@ieee-802-3-2022]                                                                                    |
| 25GBASE-T1                                                              | 25 Gbit/s                 | 평형 도체 한 쌍         | 적어도 11 m[@ieee-802-3cy-2023]                                                                                  |
| [[optical-automotive-ethernet#BASE-AU\|2.5GBASE-AU부터 50GBASE-AU까지]] | 2.5, 5, 10, 25, 50 Gbit/s | 다중 모드 유리 광섬유   | 요구 동작 범위 0.2 m부터 40 m까지(다른 광 사양을 모두 지키면 넘어서 동작해도 적합)[@ieee-802-3cz-2023]           |

10BASE-T1S는 여러 노드가 한 쌍을 나눠 쓰는 [[10base-t1s#동작 모드|멀티드롭 모드]]도 선택 사항으로 둔다.[@ieee-802-3-2022]

P802.3cy PAR(Project Authorization Request)는 차량 내 네트워크가 도메인 기반 구조에서 이더넷 링크로 이은 [[ee-architecture#존 아키텍처|존 아키텍처]]로 옮겨 가며 완전 자율 주행을 지원하려면 차량 환경에서 10 Gbit/s를 넘는 속도가 필요해졌지만, IEEE 802.3은 아직 그 속도를 지원하지 않는다고 밝혔다.[@ieee-802-3cy-par-2020] 2026년 10월 기준 P802.3dm이 IEEE 802.3-2022에 대해 진행 중인 개정안이다.[@ieee-802-3-2022] P802.3dm PAR는 이 프로젝트가 차량 끝 노드의 카메라 링크에 맞춰, 한 방향으로 10 Gbit/s까지 내고 반대 방향은 더 낮은 속도로 동작하는 비대칭 전기 물리 계층을 정한다고 밝힌다. 이 PAR는 이 범위의 물리 계층 부분이 MIPI A-PHY(MIPI: 모바일 기기의 인터페이스 명세를 만드는 국제 단체)를 채택한 IEEE 2977-2021과 일부 겹치고, ASA(Automotive SerDes Alliance)의 MLE(Motion Link Ethernet) 명세도 일부 겹칠 수 있다고 밝힌다.[@ieee-802-3dm-par-2024][@mipi-about-us-2026]

## 케이블

P802.3ch 태스크 포스는 비차폐 꼬임쌍선, 차폐 꼬임쌍선, 차폐 쿼드, 차폐 평행쌍, 동축, twinax 같은 차량용 케이블 가운데 적어도 한 종류에서, 인라인 커넥터를 4개까지 둔 15 m 이상의 점대점 링크를 지원하는 것을 목표로 두었다.[@ieee-802-3ch-objectives-2017]

![[diagrams/link-segment-inline-connectors.svg]]

100BASE-T1은 비차폐 꼬임쌍선 한 쌍으로 동작할 수 있어 차폐 케이블이 필요 없고, 케이블의 무게와 비용이 준다.[@ti-sszt730-2018][@open-alliance-about-2014] IEEE 802.3 작업 그룹은 P802.3bw의 CSD(Criteria for Standards Development)에서, 선 쌍 수를 줄이면 무게가 줄어 설치와 운용 비용이 크게 떨어질 것으로 보았다.[@ieee-802-3bw-csd-2014]

## 상위 프로토콜

[[doip|DoIP]]를 정하는 [[iso-13400-2|ISO 13400-2]]:2025는 IP, [[tcp|TCP]], [[udp|UDP]]를 써서 진단 테스터와 차량 안 서버 사이의 진단 통신 요구사항을 정한다.[@iso-13400-2-obp-2025] [[some-ip|SOME/IP]]는 [[service-oriented-communication|서비스 지향 통신]]을 제공하며, 메시지를 IP 기반 차량 내 네트워크의 UDP나 TCP 페이로드로 나른다.[@autosar-fo-prs-someipprotocol-2025]

![[diagrams/automotive-ethernet-protocol-stack.svg]]

IEEE 802.1 [[tsn|TSN]] 태스크 그룹은 IEEE 802 네트워크에서 지연 상한이 있는 패킷 전달을 목표로 삼으며, 옛 [[avb|AVB]] 태스크 그룹에서 이어졌다.[@ieee-802-1-tsn-tg-2026] IEEE SA에 따르면 AVB 표준은 차량 인포테인먼트 시스템에 쓰인다.[@ieee-tsn-automotive-flyer-2026] IEEE 802.1DG-2025는 TSN 표준에 기반해, 지연 상한이 있는 차량 내 브리지 IEEE 802.3 이더넷 네트워크의 [[tsn#프로파일|프로파일]]을 정한다.[@ieee-802-1dg-2025]

## OPEN Alliance 명세

OPEN Alliance TC12는 100BASE-T1과 1000BASE-T1 PHY의 적합성 시험과 상호 운용성 시험 명세를 만들고 관리하며[@open-alliance-tc12-2026], OPEN Alliance는 두 PHY의 상호 운용성 시험 명세를 펴낸다.[@open-alliance-100base-t1-iop-2024][@open-alliance-1000base-t1-iop-2024]

TC8은 [[osi-model|OSI]] 일곱 계층 전체에 걸쳐 차량용 이더넷 ECU의 시험 명세와 적합성 명세를 만들고 유지해, ECU 적합성 인증의 통일된 바탕을 세우려 한다. 시험 서비스를 하는 시험 기관의 자격을 위한 시험 절차와 요구사항도 정한다.[@open-alliance-tc8-2026]

TC9는 케이블 채널과 그에 딸린 부품(커넥터, 케이블, 케이블 어셈블리)의 전기적 요구사항과 시험 절차를 정하며, 이를 속도별 IEEE 802.3 차량용 이더넷 표준의 링크 세그먼트 요구사항에 맞춘다.[@open-alliance-tc9-2026]

## 차량 응용

IEEE 802.3 작업 그룹은 차량용 이더넷 수요를 이끄는 것으로 카메라, 충돌 회피, 인포테인먼트처럼 대역을 많이 쓰는 차량 응용을 들었다.[@ieee-802-3bw-csd-2014] 이더넷을 쓰면 차량의 펌웨어 업데이트가 빨라진다.[@ieee-tsn-automotive-flyer-2026][@ti-szzy009-2018] TI 기술 기사에 따르면 IEEE 802.3bw와 802.3bp의 차량용 요구사항은 인포테인먼트, ADAS(Advanced Driver Assistance Systems), 온보드 진단, 5G나 V2X(Vehicle-to-X) 같은 외부 연결이 퍼지는 바탕이 되었다.[@ti-sszt730-2018] 차량용 이더넷 PHY는 ADAS의 레이더, 라이다, 카메라 같은 센서에도 쓰인다.[@nxp-tja1103-2026][@ti-dp83tg720s-q1-2026] TI 백서에 따르면 ADAS에서 카메라의 압축하지 않은 영상은 1 Gbit/s가 넘는 대역을 요구하기 쉽다.[@ti-szzy009-2018]

## 차량 버스와의 차이

TI 기술 기사에 따르면 이더넷은 스위치 네트워크를 이루어, [[can|CAN]], [[lin|LIN]], [[flexray|FlexRay]], [[most|MOST]] 같은 공유 버스 토폴로지로는 얻을 수 없는 대역과 데이터 속도를 낸다.[@ti-sszt730-2018] [[ieee-802-1q|IEEE 802.1Q]]-2022는 브리지가 필터링 정보로 프레임을 출발지와 목적지 사이의 경로에 가두어 트래픽을 줄이게 한다.[@ieee-802-1q-2022] IEEE 802.3-2022가 상정하는 전이중 동작의 가장 흔한 구성은 브리지([[ethernet-switch|스위치]])의 포트마다 장치 하나를 전용 링크로 잇는 것이고, 이때는 공유 매체를 두고 다투는 일이 없다.[@ieee-802-3-2022]

차량 버스 전반은 [[vehicle-bus|차량 버스]]에서 다룬다.
