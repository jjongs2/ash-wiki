---
title: 100BASE-T1
tags:
  - network/ethernet
aliases:
  - IEEE 802.3bw
verified: 2026-09-29
---

**100BASE-T1**은 꼬임쌍선 한 쌍으로 100 Mbit/s를 전이중으로 주고받는 이더넷 물리 계층이다.[@ieee-802-3-2022][@ti-dp83tc811r-q1-2018] IEEE 802.3bw-2015가 100BASE-T1을 IEEE 802.3에 넣었다.[@ieee-802-3bw-2015] IEEE 802.3 작업 그룹은 이 프로젝트가 필요한 까닭으로, 이더넷이 차량 시장에 들어오면서 한 쌍 균형 케이블로 100 Mbit/s를 내는 방식이 필요해졌다는 점을 들었다.[@ieee-802-3bw-par-2014]

BroadR-Reach는 Broadcom의 이더넷 [[ethernet-phy|PHY]] 기술이고, OPEN Alliance가 이를 OABR(OPEN Alliance BroadR-Reach) PHY로 받아들였다.[@broadcom-broadr-reach-3-0-2014][@open-alliance-incorporation-2021] P802.3bw PAR(Project Authorization Request)는 표준이 Broadcom이 저작권을 가진 기존 공개 자료에 크게 기댈 것이라고 밝혔고[@ieee-802-3bw-par-2014], 태스크 포스는 기존 OABR PHY와 전기적으로 상호 운용하는 것을 목표로 삼았다.[@ieee-802-3bw-objectives-2014] IEEE 802.3 작업 그룹에 따르면 OABR PHY는 2013년부터 양산차에 쓰였다.[@ieee-802-3bw-csd-2014]

## 부호화

100BASE-T1 PHY는 세 준위(−1, 0, +1)의 PAM3(Pulse Amplitude Modulation 3) 심볼로 보내고, 스크램블러와 디스크램블러를 둔다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017] IEEE 802.3은 100BASE-T1의 PCS(Physical Coding Sublayer)가 25 MBd의 4비트 단어 흐름을 33.333 MBd의 3비트 단어 흐름으로 바꾸고(4B/3B 변환), 이 비트를 스크램블한 뒤 3비트마다 PAM3 심볼 둘로 바꾸도록 정한다. PMA(Physical Medium Attachment)는 이 심볼을 66.666 MBd로 보낸다.[@ieee-802-3-2022] DP83TC811R-Q1은 25 MHz로 도는 4비트 데이터 경로를 33.334 MHz로 도는 3비트 경로로 줄이는 4B/3B 변환을 하고, PAM3 심볼을 66.667 MHz로 보낸다.[@ti-dp83tc811r-q1-2018] PAM3는 같은 데이터를 보내는 데 드는 신호 대역을 줄여 EMI(Electromagnetic Interference)를 줄인다.[@broadcom-broadr-reach-3-0-2014][@ti-szzy009-2018] BroadR-Reach 명세에 따르면 대역을 줄이면 꼬임쌍선 채널의 좋은 대역에서 통신할 수 있다.[@broadcom-broadr-reach-3-0-2014]

![[diagrams/100base-t1-4b3b-data-path.svg]]

## 에코 제거

**에코 제거**(echo cancellation)는 같은 쌍으로 받은 신호에서 자기가 보낸 신호를 없애 링크 상대가 보낸 정보를 뽑아내는 일이다. 100BASE-T1 PHY는 hybrid를 두고 에코 제거를 한다.[@ti-szzy009-2018] 꼬임쌍선 한 쌍으로 전이중 통신을 하면 에코 제거가 따라온다.[@broadcom-broadr-reach-3-0-2014][@ti-szzy009-2018] IEEE 802.3은 100BASE-T1 PMA의 수신 기능에 신호 등화와 에코 제거를 하위 기능으로 둔다. IEEE 802.3은 hybrid를, 같은 쌍으로 심볼을 동시에 보내고 받게 해 전이중 전송을 가능하게 하며 송신 신호와 수신 신호를 충분히 떼어 내려고 흔히 에코 제거기와 함께 쓰는 회로로 정의한다. IEEE 802.3에서 자기 송신기의 에코는 양방향 전송을 위한 hybrid와 링크 세그먼트의 임피던스 불연속에서 생기는 잡음원이고, 표준은 에코 제거 기법을 PHY 구현자에게 맡긴다.[@ieee-802-3-2022] DP83TC811R-Q1은 MDI(Medium Dependent Interface) 쪽에 hybrid를 두고, 아날로그 루프백에서는 끝이 열린 MDI에서 돌아온 에코 신호를 hybrid에서 디코딩한다.[@ti-dp83tc811r-q1-2018] TJA1103은 케이블 길이 25 m까지 에코 제거를 한다.[@nxp-tja1103-2026]

## 마스터와 슬레이브

링크의 두 PHY 가운데 하나는 마스터, 다른 하나는 슬레이브이며, 역할은 핀 설정(bootstrap)이나 레지스터로 정한다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017] IEEE 802.3은 두 PHY가 같은 역할로 설정되면 동작을 정하지 않는다. 마스터는 로컬 클럭 소스에서, 슬레이브는 받은 신호에서 복구한 클럭에서 송신 클럭을 얻는다.[@ieee-802-3-2022] TJA1103은 두 역할을 LEADER와 FOLLOWER라 부르며, LEADER일 때는 외부 클럭이나 크리스털에서, FOLLOWER일 때는 MDI에서 복구한 클럭에서 [[mii|MII]] 클럭을 얻는다.[@nxp-tja1103-2026]

![[diagrams/t1-master-slave-clock.svg]]

## 링크 수립

자율 동작(autonomous)으로 설정한 100BASE-T1 PHY는 전원이 들어오면 스스로 링크를 맺는다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017] DP83TC811R-Q1은 자동 협상을 지원하지 않는다.[@ti-dp83tc811r-q1-2018] 현행 IEEE 802.3에서 100BASE-T1의 자동 협상은 선택 사항이다. 자동 협상을 구현하지 않거나 켜지 않으면 초기화 때 관리 제어나 하드웨어 기본 설정으로 마스터와 슬레이브를 미리 정한다.[@ieee-802-3-2022] P802.3bw 태스크 포스는 미리 정한 설정으로 전원이 안정된 뒤 100 ms 안에 데이터를 주고받게 하는 빠른 시작을 목표로 삼았고, 표준이 한 쌍 자동 협상을 막지 않게 했다.[@ieee-802-3bw-objectives-2014]

## 링크 세그먼트

P802.3bw 태스크 포스는 인라인 커넥터를 4개까지 둔 한 쌍 균형 케이블에서 적어도 15 m를 잇는 링크 세그먼트와 PHY의 성능 특성을 정하는 것을 목표로 삼았다.[@ieee-802-3bw-objectives-2014] 현행 IEEE 802.3은 100BASE-T1 링크 세그먼트를 인라인 커넥터 4개까지와 짝 커넥터 2개를 둔, 15 m까지의 평형 꼬임쌍선 한 쌍으로 정한다.[@ieee-802-3-2022] TJA1100은 비차폐 꼬임쌍선 한 쌍에서 적어도 15 m 길이의 케이블을 지원한다.[@nxp-tja1100-2017]

![[diagrams/link-segment-inline-connectors.svg]]

## 100BASE-TX와의 차이

[[100base-tx|100BASE-TX]]는 송신 쌍과 수신 쌍, 두 쌍을 쓴다.[@ti-szzy009-2018][@microchip-ksz8081mlx-2022] 100BASE-TX가 차량에서 걸림돌이 된 점은 [[100base-tx#100BASE-T1과의 차이|100BASE-TX]]에서 다룬다.

![[diagrams/ethernet-phy-pair-comparison.svg]]
