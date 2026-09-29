---
title: 100BASE-T1
tags:
  - network/ethernet
aliases:
  - IEEE 802.3bw
verified: 2026-09-29
---

**100BASE-T1**은 꼬임쌍선 한 쌍으로 100 Mbit/s를 전이중으로 주고받는 이더넷 물리 계층이다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017][@ti-dp83tc814r-q1-2026] IEEE 802.3bw-2015가 100BASE-T1을 IEEE 802.3에 넣었다.[@ieee-802-3bw-2015] IEEE 802.3 작업 그룹은 이 프로젝트가 필요한 까닭으로, 이더넷이 차량 시장에 들어오면서 한 쌍 균형 케이블로 100 Mbit/s를 내는 방식이 필요해졌다는 점을 들었다.[@ieee-802-3bw-par-2014]

BroadR-Reach는 Broadcom의 이더넷 [[ethernet-phy|PHY]] 기술이고, OPEN Alliance가 이를 OABR(OPEN Alliance BroadR-Reach) PHY로 받아들였다.[@broadcom-broadr-reach-3-0-2014][@open-alliance-incorporation-2021] P802.3bw PAR(Project Authorization Request)는 표준이 Broadcom이 저작권을 가진 기존 공개 자료에 크게 기댈 것이라고 밝혔고[@ieee-802-3bw-par-2014], 태스크 포스는 기존 OABR PHY와 전기적으로 상호 운용하는 것을 목표로 삼았다.[@ieee-802-3bw-objectives-2014] IEEE 802.3 작업 그룹에 따르면 OABR PHY는 2013년부터 양산차에 쓰였다.[@ieee-802-3bw-csd-2014]

## 구조·동작

### 부호화

100BASE-T1 PHY는 세 준위(−1, 0, +1)의 PAM3(Pulse Amplitude Modulation 3) 심볼로 보내고, 스크램블러와 디스크램블러를 둔다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017][@ti-dp83tc814r-q1-2026] DP83TC811R-Q1은 25 MHz로 도는 4비트 데이터 경로를 33.334 MHz로 도는 3비트 경로로 줄이는 4B3B 부호화를 쓰고, PAM3 심볼을 66.667 MHz로 보낸다.[@ti-dp83tc811r-q1-2018] BroadR-Reach 명세에 따르면 BroadR-Reach는 신호 대역을 줄여 꼬임쌍선 채널의 좋은 대역에서 통신하고 EMI(Electromagnetic Interference)를 줄이려고 PAM3를 택했다.[@broadcom-broadr-reach-3-0-2014]

![[diagrams/100base-t1-4b3b-data-path.svg]]

### 에코 제거

**에코 제거**(echo cancellation)는 같은 쌍으로 받은 신호에서 자기가 보낸 신호를 없애 링크 상대가 보낸 정보를 뽑아내는 일이다. 100BASE-T1 PHY는 hybrid를 두고 에코 제거를 한다.[@ti-szzy009-2018] BroadR-Reach 명세에 따르면 꼬임쌍선 한 쌍으로 전이중 통신을 하면 에코 제거가 따라온다. 자기 송신기에서 온 에코는 양방향 전송을 위한 hybrid와 링크 세그먼트의 임피던스 불연속에서 생기며, 에코 제거 기법은 PHY 구현자에게 맡긴다.[@broadcom-broadr-reach-3-0-2014] DP83TC811R-Q1은 MDI(Medium Dependent Interface) 쪽에 hybrid를 두고, 아날로그 루프백에서는 끝이 열린 MDI에서 돌아온 에코 신호를 hybrid에서 디코딩한다.[@ti-dp83tc811r-q1-2018] TJA1103은 케이블 길이 25 m까지 에코 제거를 한다.[@nxp-tja1103-2026]

### 마스터와 슬레이브

링크의 두 PHY 가운데 하나는 마스터, 다른 하나는 슬레이브이며, 역할은 핀 설정(bootstrap)이나 레지스터로 정한다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017] BroadR-Reach 명세는 MASTER가 로컬 클럭 소스에서, SLAVE가 복구한 클럭에서 송신 클럭을 얻도록 정한다.[@broadcom-broadr-reach-3-0-2014] TJA1103은 두 역할을 LEADER와 FOLLOWER라 부르며, LEADER일 때는 외부 클럭이나 크리스털에서, FOLLOWER일 때는 MDI에서 복구한 클럭에서 [[mii|MII]] 클럭을 얻는다.[@nxp-tja1103-2026]

![[diagrams/t1-master-slave-clock.svg]]

### 링크 수립

자율 동작(autonomous)으로 설정한 100BASE-T1 PHY는 전원이 들어오면 스스로 링크를 맺는다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017] DP83TC811R-Q1은 자동 협상을 지원하지 않는다.[@ti-dp83tc811r-q1-2018] P802.3bw 태스크 포스는 미리 정한 설정으로 전원이 안정된 뒤 100 ms 안에 데이터를 주고받게 하는 빠른 시작을 목표로 삼았고, 표준이 한 쌍 자동 협상을 막지 않게 했다.[@ieee-802-3bw-objectives-2014]

### 링크 세그먼트

P802.3bw 태스크 포스는 인라인 커넥터를 4개까지 둔 한 쌍 균형 케이블에서 적어도 15 m를 잇는 링크 세그먼트와 PHY의 성능 특성을 정하는 것을 목표로 삼았다.[@ieee-802-3bw-objectives-2014] TJA1100은 비차폐 꼬임쌍선 한 쌍에서 적어도 15 m 길이의 케이블을 지원한다.[@nxp-tja1100-2017]

![[diagrams/link-segment-inline-connectors.svg]]

## 비교·한계

[[100base-tx|100BASE-TX]]는 송신 쌍과 수신 쌍, 두 쌍을 쓴다.[@ti-szzy009-2018][@microchip-ksz8081mlx-2022] 100BASE-TX가 차량에서 걸림돌이 된 점은 100BASE-TX에서 다룬다.

![[diagrams/ethernet-phy-pair-comparison.svg]]
