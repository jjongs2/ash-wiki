---
title: Cyclic queuing and forwarding
tags:
  - network/ethernet
aliases:
  - CQF
  - IEEE 802.1Qch
verified: 2026-09-29
---

**Cyclic queuing and forwarding**(CQF)는 브리지와 엔드 스테이션이 프레임을 큐에 넣고 큐를 비우는 절차를 주기적으로 맞춰 프레임 전송을 동기화하는 방식이다. IEEE 802.1Qch 프로젝트는 이 방식으로 혼잡 손실 없이 결정적인 지연을 얻는 것을 범위로 삼았다.[@ieee-802-1qch-project-2017] IEEE 802.1Qch-2017이 [[ieee-802-1q|IEEE 802.1Q]]-2014의 개정(Amendment 29)으로 CQF를 넣었고, 이 개정은 IEEE 802.1Q-2018에 합쳐졌다.[@ieee-802-1-tsn-tg-2026][@ieee-802-1qch-2017] IEEE 802.1 작업 그룹의 [[tsn|TSN]] 요약은 CQF를 지연 상한을 위한 도구로 분류한다.[@ieee-802-1-tsn-summary-2026] IEEE 802.1Q-2022의 Annex T(참고)는 CQF가 초기 논의에서 불린 이름으로 Peristaltic Shaper를 제시한다.[@ieee-802-1q-2022]

## 구성과 지연

CQF는 시간을 길이 $d$의 번호 붙은 주기로 나눈다. 브리지가 주기 $i$에 보낸 프레임은 다음 브리지가 같은 주기 $i$ 안에 받고, 다음 주기 $i+1$에 내보낸다. 이는 [[traffic-class|트래픽 클래스]]마다 브리지들과 거기 연결된 엔드 스테이션이 주기의 시작 시각과 길이 $d$를 알려진 정확도로 똑같이 안다는 가정에서 출발한다.[@ieee-802-1q-2022]

IEEE 802.1Qch-2017은 [[time-aware-shaper|scheduled traffic]]과 [[per-stream-filtering-and-policing|PSFP]]로 CQF를 지원하는 방법을 IEEE 802.1Q-2014에 더했다.[@ieee-802-1qch-2017] IEEE 802.1Q-2022는 이 두 기능을 함께 설정해, 출구 포트마다 큐 두 개와 주기 타이머를 쓰는 구현을 제시한다. 짝수 주기에는 큐 1이 받은 프레임을 모으기만 하고 큐 2가 앞 홀수 주기에 모은 프레임을 내보내며, 홀수 주기에는 두 큐의 역할이 바뀐다. 받는 쪽에서 PSFP의 스트림 게이트는 주기마다 받은 프레임을 두 큐에 번갈아 보내고, 내보내는 포트의 [[time-aware-shaper#게이트 제어 목록|게이트 제어 목록]]은 같은 주기로 한 큐의 게이트를 열고 다른 큐의 게이트를 닫기를 되풀이한다.[@ieee-802-1q-2022]

홉 수를 $h$라 하면 프레임이 겪는 지연은 최소 $(h-1)\,d$, 최대 $(h+1)\,d$다. 그래서 지연은 주기 길이와 홉 수만으로 정해지고, 토폴로지의 다른 특성이나 시간이 중요하지 않은 다른 트래픽의 간섭에 영향을 받지 않는다. 이는 프레임이 저마다 배정된 주기를 지킬 때만 성립한다. 주기 길이는 스트림의 class measurement interval 동안 받을 수 있는 데이터에 가장 긴 간섭 프레임 하나를 더한 만큼을 담을 수 있어야 하고, [[frame-preemption|프레임 선점]]을 지원하면 간섭 프레임 대신 가장 긴 [[frame-preemption#조각|조각]]을 더한다.[@ieee-802-1q-2022]

NXP Real-time Edge 소프트웨어는 802.1Qch의 정의를 따라 IEEE 802.1Qbv와 IEEE 802.1Qci를 설정해 CQF를 구성하며, 이 CQF 설정은 기존 802.1Qbv 설정과 섞어 쓸 수 없다. NXP Real-time Edge 사용자 가이드에 따르면 CQF 설정에서 패킷은 경로의 노드마다 게이트가 열려 있는 시간(gate open time)만큼 지연된다. 모든 스트림의 cycle time $T_\mathrm{cycle}$과 gate open time $T_\mathrm{open}$은 같아야 하고, $T_\mathrm{cycle} = n\,T_\mathrm{open}$($n$은 자연수)이어야 한다.[@nxp-realtimeedgeug-2026]

![[diagrams/cqf-per-node-delay.svg]]

IEEE 802.1Qch 프로젝트 페이지에 따르면 CQF가 있으면 네트워크 토폴로지와 상관없이 브리지 네트워크를 지나는 결정적인 지연을 쉽게 계산할 수 있다. CQF는 기존 기법보다 네트워크 지연을 훨씬 쉽게 정하게 하고, 전달 변동을 줄인다.[@ieee-802-1qch-project-2017]
