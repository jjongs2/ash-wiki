---
title: PTP
tags:
  - network
aliases:
  - Precision Time Protocol
verified: 2026-09-29
---

**PTP**(Precision Time Protocol)는 [[ieee-1588|IEEE 1588]]이 정하는 프로토콜로, 패킷 네트워크에 연결된 시스템의 시계를 정밀하게 맞춘다.[@ieee-1588-2019][@ieee-1588-2019-changes-2020] 기준이 되는 시계가 시각을 담은 메시지를 보내고, 받는 쪽은 메시지가 오간 시각으로 자기 시계와의 차이를 구해 고친다.[@nxp-an12149-2025][@microchip-an6354-2026]

## 시계의 계층

PTP 네트워크의 시계들은 master–slave 계층을 이룬다.[@nxp-an12149-2025][@microchip-an6354-2026] 네트워크의 모든 시계가 따르는 기준 시계를 grandmaster라 한다.[@microchip-an6354-2026][@intel-eci-gptp-2024] 어느 시계가 grandmaster가 될지는 BMCA(Best Master Clock Algorithm)가 정한다.[@microchip-an6354-2026][@adi-ieee-1588-blackfin-2009]

IEEE 1588g-2022는 구현이나 PTP 프로파일에서 master와 slave 대신 쓸 수 있는 대체 용어를 정한다.[@ieee-1588g-2022] Microchip 앱노트 AN6354는 master–slave 계층을 timeTransmitter–timeReceiver 계층이라 부르고[@microchip-an6354-2026], [[ieee-802-1as|IEEE 802.1AS]]-2025는 시각의 원천을 best timeTransmitter라 부른다.[@ieee-802-1as-2025]

시계들은 Announce 메시지로 우선순위, 클럭 등급 같은 자기 속성을 알린다. BMCA는 포트마다 돌며, 받은 Announce의 속성을 비교해 포트의 역할을 정한다.[@intel-eci-gptp-2024][@microchip-an1295-2026] BMCA는 되풀이해 돌므로, 노드가 더해지거나 빠져 네트워크 구성이 바뀌면 best master를 다시 고른다.[@nxp-an12149-2025][@intel-eci-gptp-2024]

시계는 포트 수와 역할에 따라 나뉜다.[@intel-eci-gptp-2024][@ti-snla104a-2013]

- **ordinary clock**: PTP 포트가 하나인 시계. master가 되어 시각을 내주거나, slave로서 다른 시계에 동기화한다.
- **boundary clock**: PTP 포트가 여럿인 시계. 한 포트로 상위 master에 동기화하고, 나머지 포트에서는 master로서 하위 시계에 시각을 전한다.
- **transparent clock**: master나 slave가 되지 않는다. PTP 메시지가 자기를 지나는 데 걸린 체류 시간을 재어 메시지의 correctionField에 더해 넘긴다.[@intel-eci-gptp-2024][@ti-snla104a-2013]

![[diagrams/ptp-clock-types.svg]]

Microchip ZLS30390 API(Application Programming Interface)는 ordinary clock으로 동작할 때 포트 상태로 MASTER, PASSIVE, SLAVE를 둔다.[@microchip-an4025-2022]

Micrel 백서에 따르면 boundary clock을 여러 단 이으면 단마다 제어 루프 오차가 더해져 동기화 지터가 커진다. transparent clock은 단마다 동기화를 새로 하지 않고 체류 시간만 보정해 넘기므로, boundary clock을 이을 때보다 오차가 덜 쌓인다.[@micrel-get-in-sync-2012]

## 메시지

PTP 메시지는 두 부류다. 이벤트 메시지는 보내고 받을 때 타임스탬프를 찍는 메시지로 Sync, Delay_Req, Pdelay_Req, Pdelay_Resp가 있다. 일반 메시지는 타임스탬프를 찍지 않으며 Announce, Follow_Up, Delay_Resp, Pdelay_Resp_Follow_Up, Signaling, Management가 있다.[@microchip-an4025-2022][@intel-i210-2019]

## 지연 요청-응답

master와 slave는 네 시각을 모아 경로 지연과 시계 차이를 구한다.[@microchip-an6354-2026][@ti-snla116a-2013]

1. master가 Sync를 보낸 시각이 $t_1$, slave가 받은 시각이 $t_2$다.
2. slave가 Delay_Req를 보낸 시각이 $t_3$, master가 받은 시각이 $t_4$다.
3. master는 Delay_Resp에 $t_4$를 실어 돌려준다.[@microchip-an6354-2026][@ti-snla116a-2013]

![[diagrams/ptp-delay-request-response.svg]]

이 방식은 두 방향의 경로 지연이 같다고 가정한다.[@adi-ieee-1588-blackfin-2009][@intel-i210-2019] 평균 경로 지연 $d$는 두 방향 시간 차의 합의 절반이고, slave 시계가 master 시계보다 앞선 양인 offset $\theta$는 두 방향 시간 차의 차의 절반이다.[@nxp-an12149-2025][@microchip-an6354-2026]

$$
d = \frac{(t_2 - t_1) + (t_4 - t_3)}{2}
$$

$$
\theta = \frac{(t_2 - t_1) - (t_4 - t_3)}{2}
$$

slave는 구한 $\theta$만큼 자기 시계를 고치고, 이 교환을 되풀이해 동기를 유지한다.[@nxp-an12149-2025][@microchip-an6354-2026]

PTP는 두 방향 경로 지연의 차이를 보정하지 못한다. 그래서 지연이 비대칭이면 그만큼 동기화 오차가 생긴다.[@adi-ieee-1588-blackfin-2009][@ti-snla098a-2013] gPTP에서 링크의 두 방향 전파 시간이 다를 때 생기는 오차는 두 전파 시간 차의 절반이고, 이 오차는 홉을 거듭하며 쌓이거나 부호가 서로 다르면 상쇄된다.[@ieee-802-1as-2025]

## One-step과 two-step

one-step 방식에서는 Sync가 나가는 순간 하드웨어가 송신 시각 $t_1$을 Sync 메시지 안에 써 넣는다. two-step 방식은 Sync를 먼저 보내고, 실제 송신 시각 $t_1$을 뒤따르는 Follow_Up에 실어 보낸다.[@nxp-an12149-2025][@intel-i210-2019]

## 피어 지연

지연 요청-응답은 master와 slave 사이 경로 전체의 지연을 한 번에 잰다. 피어 지연 방식은 직접 이어진 두 포트 사이의 링크마다 Pdelay_Req, Pdelay_Resp, Pdelay_Resp_Follow_Up으로 지연을 따로 잰다.[@adi-ieee-1588-blackfin-2009][@ti-snla104a-2013] peer-to-peer transparent clock은 이렇게 잰 상류 링크 지연과 자기 체류 시간을 correctionField에 더한다.[@intel-eci-gptp-2024][@ti-snla104a-2013]

## 하드웨어 타임스탬프

타임스탬프를 소프트웨어에서 찍으면 운영체제와 프로토콜 스택의 들쭉날쭉한 지연이 섞여 정밀도가 떨어진다.[@nxp-an12149-2025][@ti-snla098a-2013] 그래서 정밀한 구현은 MAC(Medium Access Control)이나 PHY 가까이의 하드웨어가 프레임이 오가는 순간의 시각을 찍는다.[@nxp-an12149-2025][@intel-i210-2019] TI 앱노트 AN-1728에 따르면 소프트웨어만으로 구현한 PTP는 단일 링크에서 100 µs 안팎의 동기화에 이르고, 나노초 영역의 동기화에는 하드웨어 지원이 필요하다.[@ti-snla098a-2013]

## 프로파일

IEEE 1588-2019는 응용 분야에 맞춘 설정을 프로파일로 정하게 한다.[@ieee-1588-2019] [[ieee-802-1as|IEEE 802.1AS]]는 해당하는 곳에 IEEE 1588 규격을 쓰도록 정하고[@ieee-802-1as-2020-rev-2026], 그 시각 동기화 프로토콜을 gPTP라 부른다.[@ieee-802-1ased-2026] gPTP는 IEEE 1588-2019의 PTP에 바탕을 두며, 특정한 구성에서는 IEEE 1588-2019의 프로파일이다. 전이중 [[ethernet|이더넷]] 링크에서 gPTP는 피어 지연 방식을 요구하고, IEEE 1588-2019는 종단 간(end-to-end) 지연 측정도 허용한다. 같은 링크에서 gPTP는 two-step 방식을 요구하고, Sync의 one-step 방식은 선택으로 둔다.[@ieee-802-1as-2025]
