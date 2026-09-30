---
title: Time-aware shaper
tags:
  - network/ethernet
aliases:
  - TAS
  - IEEE 802.1Qbv
verified: 2026-09-29
---

**Time-aware shaper**(TAS)는 브리지나 종단국의 포트에서 큐마다 전송 게이트를 두고, 게이트 제어 목록에 따라 게이트를 여닫아 큐가 전송할 수 있는 시각을 정하는 기능이다.[@ti-processor-sdk-linux-am62x-est-2026][@intel-eci-gptp-2024] IEEE 802.1Qbv-2015가 IEEE 802.1Q-2014의 개정(Amendment 25: Enhancements for Scheduled Traffic)으로 넣었고, 이 개정은 IEEE 802.1Q-2018에 합쳐졌다.[@ieee-802-1-tsn-tg-2026] 802.1Qbv의 scheduled traffic은 time-aware shaper라고도 불린다.[@ti-processor-sdk-linux-am62x-est-2026][@microchip-an1185-2025]

IEEE 802.1Qbv 프로젝트는 브리지와 종단국이 [[ieee-802-1as|IEEE 802.1AS]]에서 얻은 시각에 따라 프레임 전송을 스케줄하도록 time-aware queue-draining 절차를 정하는 것을 범위로 삼았다.[@ieee-802-1qbv-project-2016] IEEE 802.1 작업 그룹의 [[tsn|TSN]] 요약은 scheduled traffic을 지연 상한을 위한 도구로 분류한다.[@ieee-802-1-tsn-summary-2026]

## 게이트

IEEE 802.1Q의 scheduled traffic은 포트의 [[traffic-class|트래픽 클래스]]마다 게이트를 두고, 게이트는 열림과 닫힘 두 상태를 가진다.[@ieee-802-1qcw-sched-yang-2023] 전송할 수 있는 것은 게이트가 열린 큐뿐이고, 게이트가 닫힌 큐의 프레임은 전송에 선택되지 않는다.[@ti-processor-sdk-linux-am62x-est-2026][@intel-eci-gptp-2024] TI Processor SDK 문서에 따르면 게이트가 열린 큐의 프레임은 그 큐에 지정된 전송 선택 알고리즘에 따라 전송에 선택된다.[@ti-processor-sdk-linux-am62x-est-2026]

![[diagrams/egress-queue-transmission-selection.svg]]

## 게이트 제어 목록

포트마다 게이트 제어 목록을 두며, 목록은 게이트 동작을 순서대로 적은 것이다.[@intel-eci-gptp-2024][@microchip-an1185-2025] 목록의 항목마다 큐별 게이트의 열림·닫힘 상태와 그 상태를 유지할 시간을 적는다.[@microchip-an1185-2025][@nxp-an13995-2023] 게이트 스케줄은 정해진 길이의 주기로 되풀이된다.[@ti-processor-sdk-linux-am62x-est-2026][@nxp-an13995-2023]

게이트 스케줄은 노드들이 [[ptp|PTP]]로 공유하는 시각을 기준으로 하므로, 여러 노드에 같은 시각에 적용할 수 있다.[@microchip-an1185-2025][@nxp-an13995-2023]

![[diagrams/tas-gate-control-list-cycle.svg]]

TAS는 정해진 시각에 한 트래픽 클래스나 그 묶음만 네트워크에 접근하게 해, 시간이 중요한 트래픽이 결정적인 지연으로 전달되게 한다.[@intel-eci-gptp-2024][@nxp-an13995-2023]

## Guard band

guard band는 시간이 중요한 큐의 창 앞에 두어, 앞 창에서 보내던 프레임이 그 창을 침범하지 않게 하는 구간이다.[@ti-processor-sdk-linux-am62x-est-2026][@microchip-an1185-2025] 그 길이는 끼어들 수 있는 가장 긴 프레임 하나를 보내는 시간을 기준으로 잡는다.[@ti-processor-sdk-linux-am62x-est-2026][@microchip-pd-ies008x-tsn-2025]

Microchip AN1185에 따르면 guard band 시간 $t_\mathrm{gb}$는 큐마다 설정한 `max-sdu`(바이트)와 링크 속도 $\mathrm{portTransmitRate}$로 아래와 같이 계산한다.[@microchip-an1185-2025]

$$
t_\mathrm{gb} = \frac{8 \cdot \mathrm{max\text{-}sdu}}{\mathrm{portTransmitRate}}
$$

TI CPSW의 EST(Enhancements for Scheduled Traffic) 하드웨어는 게이트가 닫히기 직전 큐에 들어온 프레임도 보내, 그 프레임이 다음 창으로 넘어갈 수 있다. TI는 이를 막으려면 창 사이에 모든 게이트를 닫은 항목을 guard band로 넣고, 그 길이를 MTU(Maximum Transmission Unit) 프레임의 전송 시간에 292 wire clock(1 Gbit/s에서 2336 ns)을 더한 값으로 잡기를 권한다.[@ti-processor-sdk-linux-am62x-est-2026]

[[frame-preemption|프레임 선점]]을 함께 쓰면 guard band를 줄일 수 있다.[@adi-adin3310-adin6310-2025][@ti-processor-sdk-linux-am64x-iet-2026] Microchip의 TSN 앱노트에 따르면 이때 guard band는 끼어들 수 있는 가장 긴 프레임의 크기에서 가장 긴 조각의 크기로 줄어든다.[@microchip-pd-ies008x-tsn-2025]

![[diagrams/guard-band-with-preemption.svg]]

## Credit-based shaper와의 차이

Microchip AN1185에 따르면 [[credit-based-shaper|credit-based shaper]]는 우선순위에 따라 큐가 쓰는 대역폭을 조절하고, TAS는 큐마다 전송을 전역 시간 척도에 맞춰 스케줄한다.[@microchip-an1185-2025]

802.1Qbv 프로젝트 페이지에 따르면 이 개정은 engineered LAN에서 지연과 전달 변동을 보장하려 했다. credit-based shaper는 engineered가 아닌 네트워크에서도 잘 동작하며, 이 개정으로 두 종류의 네트워크를 하나로 합칠 수 있다.[@ieee-802-1qbv-project-2016]
