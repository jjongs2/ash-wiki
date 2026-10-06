---
title: 100BASE-T1
tags:
  - network/ethernet
aliases:
  - IEEE 802.3bw
verified: 2026-09-29
---

**100BASE-T1**은 꼬임쌍선 한 쌍으로 100 Mbit/s를 전이중으로 주고받는 [[ethernet|이더넷]] 물리 계층이다.[@ieee-802-3-2022][@ti-dp83tc811r-q1-2018] IEEE 802.3bw-2015가 100BASE-T1을 [[ieee-802-3|IEEE 802.3]]에 넣었다.[@ieee-802-3bw-2015] IEEE 802.3 작업 그룹은 이 프로젝트가 필요한 까닭으로, 이더넷이 차량 시장에 들어오면서 한 쌍 균형 케이블로 100 Mbit/s를 내는 방식이 필요해졌다는 점을 들었다.[@ieee-802-3bw-par-2014]

BroadR-Reach는 Broadcom의 이더넷 [[ethernet-phy|PHY]] 기술이고, OPEN Alliance가 이를 OABR(OPEN Alliance BroadR-Reach) PHY로 받아들였다.[@broadcom-broadr-reach-3-0-2014][@open-alliance-incorporation-2021] P802.3bw PAR(Project Authorization Request)는 표준이 Broadcom이 저작권을 가진 기존 공개 자료에 크게 기댈 것이라고 밝혔고[@ieee-802-3bw-par-2014], 태스크 포스는 기존 OABR PHY와 전기적으로 상호 운용하는 것을 목표로 삼았다.[@ieee-802-3bw-objectives-2014] IEEE 802.3 작업 그룹에 따르면 OABR PHY는 2013년부터 양산차에 쓰였다.[@ieee-802-3bw-csd-2014]

## 부호화

100BASE-T1 PHY는 세 준위(−1, 0, +1)의 PAM3(Pulse Amplitude Modulation 3) 심볼로 보내고, 스크램블러와 디스크램블러를 둔다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017] IEEE 802.3-2022는 100BASE-T1의 PCS(Physical Coding Sublayer)가 25 MBd의 4비트 단어 흐름을 33.333 MBd의 3비트 단어 흐름으로 바꾸고(4B/3B 변환), 이 비트를 스크램블한 뒤 3비트마다 PAM3 심볼 둘로 바꾸도록 정한다. PMA(Physical Medium Attachment)는 이 심볼을 66.666 MBd로 보낸다. 패킷의 비트 수가 3의 배수가 아니면 4B/3B 변환은 패킷 끝에 스터프 비트를 1비트나 2비트 붙이고, 받는 쪽은 [[mii|MII]] 수신 쪽의 마지막 니블 경계에서 이 비트를 버린다. 스터프 비트의 값은 구현에 맡긴다. 패킷 사이의 최소 12바이트 [[ethernet-frame#프레임 사이 간격|프레임 사이 간격]] 동안 남은 스터프 비트를 내보내 FIFO(First-In First-Out) 넘침을 막는다.[@ieee-802-3-2022] DP83TC811R-Q1은 25 MHz로 도는 4비트 데이터 경로를 33.334 MHz로 도는 3비트 경로로 줄이는 4B/3B 변환을 하고, PAM3 심볼을 66.667 MHz로 보낸다.[@ti-dp83tc811r-q1-2018] PAM3는 같은 데이터를 보내는 데 드는 신호 대역을 줄여 EMI(Electromagnetic Interference)를 줄인다.[@broadcom-broadr-reach-3-0-2014][@ti-szzy009-2018] BroadR-Reach 명세에 따르면 대역을 줄이면 꼬임쌍선 채널의 좋은 대역에서 통신할 수 있다.[@broadcom-broadr-reach-3-0-2014] TI 백서에 따르면 100BASE-T1에 드는 대역은 약 33.3 MHz로, 100BASE-TX의 절반에 가깝다.[@ti-szzy009-2018]

![[diagrams/100base-t1-4b3b-data-path.svg]]

## 에코 제거

**에코 제거**(echo cancellation)는 같은 쌍으로 받은 신호에서 자기가 보낸 신호를 없애 링크 상대가 보낸 정보를 뽑아내는 일이다. 100BASE-T1 PHY는 hybrid를 두고 에코 제거를 한다.[@ti-szzy009-2018] 꼬임쌍선 한 쌍으로 전이중 통신을 하면 에코 제거가 따라온다.[@broadcom-broadr-reach-3-0-2014][@ti-szzy009-2018] IEEE 802.3-2022는 100BASE-T1 PMA의 수신 기능에 신호 등화와 에코 제거를 하위 기능으로 둔다. 이 표준은 hybrid를, 같은 쌍으로 심볼을 동시에 보내고 받게 해 전이중 전송을 가능하게 하며 송신 신호와 수신 신호를 충분히 떼어 내려고 흔히 에코 제거기와 함께 쓰는 회로로 정의한다. 자기 송신기의 에코는 양방향 전송을 위한 hybrid와 링크 세그먼트의 임피던스 불연속에서 생기는 잡음원이고, 이 표준은 에코 제거 기법을 PHY 구현자에게 맡긴다.[@ieee-802-3-2022] DP83TC811R-Q1은 MDI(Medium Dependent Interface) 쪽에 hybrid를 두고, 아날로그 루프백에서는 끝이 열린 MDI에서 돌아온 에코 신호를 hybrid에서 디코딩한다.[@ti-dp83tc811r-q1-2018] TJA1103은 케이블 길이 25 m까지 에코 제거를 한다.[@nxp-tja1103-2026]

## 마스터와 슬레이브

링크의 두 PHY 가운데 하나는 마스터, 다른 하나는 슬레이브이며, 역할은 핀 설정(bootstrap)이나 레지스터로 정한다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017] IEEE 802.3-2022는 두 PHY가 같은 역할로 설정되면 동작을 정하지 않는다. 마스터는 로컬 클럭 소스에서, 슬레이브는 받은 신호에서 복구한 클럭에서 송신 클럭을 얻는다.[@ieee-802-3-2022] TJA1103은 두 역할을 LEADER와 FOLLOWER라 부르며, LEADER일 때는 외부 클럭이나 크리스털에서, FOLLOWER일 때는 MDI에서 복구한 클럭에서 MII 클럭을 얻는다.[@nxp-tja1103-2026]

![[diagrams/t1-master-slave-clock.svg]]

## 링크 수립

자율 동작(autonomous)으로 설정한 100BASE-T1 PHY는 전원이 들어오면 스스로 링크를 맺는다.[@ti-dp83tc811r-q1-2018][@nxp-tja1100-2017] DP83TC811R-Q1은 [[ethernet-phy#자동 협상|자동 협상]]을 지원하지 않는다.[@ti-dp83tc811r-q1-2018] IEEE 802.3-2022는 100BASE-T1의 자동 협상을 선택 사항으로 둔다. 자동 협상을 구현하지 않거나 켜지 않으면 초기화 때 관리 제어나 하드웨어 기본 설정으로 마스터와 슬레이브를 미리 정한다. 전원이 켜진 때(power_on이 TRUE가 될 때)부터 link_status가 OK가 될 때까지의 시간 $t_\mathrm{link}$는 어느 경우든 $t_\mathrm{link} < 100\,\mathrm{ms}$여야 한다.[@ieee-802-3-2022] P802.3bw 태스크 포스는 미리 정한 설정으로 전원이 안정된 뒤 100 ms 안에 데이터를 주고받게 하는 빠른 시작을 목표로 삼았고, 표준이 한 쌍 자동 협상을 막지 않게 했다.[@ieee-802-3bw-objectives-2014]

IEEE 802.3-2022는 100BASE-T1 PHY에 정상 동작과 링크 트레이닝 동작을 둔다. 트레이닝 동안 PCS는 MII의 신호를 무시하고, 링크 상대가 트레이닝이 끝났다고 알릴 때까지 PMA에 idle 신호만 보낸다. 트레이닝에는 보통 디스크램블러 잠금, 타이밍 획득, 에코 제거와 등화기의 수렴 같은 과정이 든다. 트레이닝 동안에는 3진 쌍(TAn, TBn)이 가질 수 있는 값 아홉 가운데 여섯만 쓴다.[@ieee-802-3-2022]

## 링크 세그먼트

P802.3bw 태스크 포스는 인라인 커넥터를 4개까지 둔 한 쌍 균형 케이블에서 적어도 15 m를 잇는 링크 세그먼트와 PHY의 성능 특성을 정하는 것을 목표로 삼았다.[@ieee-802-3bw-objectives-2014] IEEE 802.3-2022는 100BASE-T1 링크 세그먼트를 인라인 커넥터 4개까지와 짝 커넥터 2개를 둔, 15 m까지의 평형 꼬임쌍선 한 쌍으로 정한다.[@ieee-802-3-2022] TJA1100은 비차폐 꼬임쌍선 한 쌍에서 적어도 15 m 길이의 케이블을 지원한다.[@nxp-tja1100-2017]

![[diagrams/link-segment-inline-connectors.svg]]

## MDI

IEEE 802.3-2022는 100BASE-T1 PMA가 MDI에 AC 결합으로 이어지도록 정한다. 100 Ω 종단에서 잰 MDI의 송신 차동 신호의 피크-피크 전압 $V_\mathrm{pp}$는 SEND_I와 SEND_N을 비롯한 모든 송신 모드에서 $V_\mathrm{pp} < 2.2\,\mathrm{V}$여야 한다. MDI의 반사 손실은 PHY가 송신하는 동안 1 MHz부터 66 MHz까지 정해진 식의 값 이상이어야 하고, MDI에서 잰 모드 변환 손실(LCL, Longitudinal Conversion Loss)은 1 MHz부터 200 MHz까지 정해진 한도 이상이어야 한다. MDI의 선 쌍은 어떤 동작 조건에서도 같은 쌍의 다른 선이나 접지와의 단락, 전류를 150 mA로 제한한 50 V dc까지의 양전압이 무기한 걸려도 손상되지 않아야 하고, 단락이 풀리면 정상 동작으로 돌아와야 한다.[@ieee-802-3-2022]

100BASE-T1 PHY는 보통 커패시터로 선에 결합하고, 공통 모드 초크(CMC, Common-Mode Choke)로 공통 모드 잡음을 거르며, ESD(Electrostatic Discharge) 보호 소자를 둔다.[@nxp-tja1100-2017][@ti-szzy009-2018] TJA1100의 MDI는 저역 통과 필터, ESD 보호, CMC, 용량성 결합, 선택 사항인 공통 모드 종단, 커넥터로 이뤄진다.[@nxp-tja1100-2017] TI 백서에 따르면 100BASE-TX가 보통 트랜스포머로 직류 절연을 하는 것과 달리, 100BASE-T1은 커패시터 둘로 직류 절연을 하고 회로 크기를 줄인다.[@ti-szzy009-2018]

![[diagrams/tja1100-mdi-components.svg]]

## 100BASE-TX와의 차이

[[100base-tx|100BASE-TX]]는 송신 쌍과 수신 쌍, 두 쌍을 쓴다.[@ti-szzy009-2018][@microchip-ksz8081mlx-2022] 100BASE-TX가 차량에서 걸림돌이 된 점은 [[100base-tx#100BASE-T1과의 차이|100BASE-T1과의 차이]]에서 다룬다.

![[diagrams/ethernet-phy-pair-comparison.svg]]
