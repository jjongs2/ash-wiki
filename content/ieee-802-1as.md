---
title: IEEE 802.1AS
tags:
  - network/ethernet
aliases:
  - gPTP
verified: 2026-09-29
publisher: IEEE
edition: 2025
status: 개정 중
---

**IEEE 802.1AS**는 시간에 민감한 응용을 위해 LAN(Local Area Network)에서 시각을 전달하는 프로토콜, 절차, 관리 객체를 정하는 IEEE 표준이다. 정식 제목은 "IEEE Standard for Local and Metropolitan Area Networks — Timing and Synchronization for Time-Sensitive Applications"이다.[@ieee-802-1as-2025] 이 표준의 시각 동기화 프로토콜을 gPTP(generalized Precision Time Protocol)라 한다.[@ieee-802-1ased-2026]

## 범위

동기화된 시각의 전달, 시각의 원천(best timeTransmitter) 선택, 위상이나 주파수가 끊기는 시각 장애가 일어났는지와 그 크기의 표시를 다룬다.[@ieee-802-1as-2025] IEEE 802.1Q의 맥락에서 해당하는 곳에는 [[ieee-1588|IEEE 1588]] 규격을 쓰도록 정한다.[@ieee-802-1as-2020-rev-2026]

gPTP는 IEEE 1588-2019가 정하는 [[ptp|PTP]]에 바탕을 두며, 특정한 구성에서는 IEEE 1588-2019의 프로파일이다. 전이중 점대점 링크로 시각을 전달하는 규정이 PTP 프로파일 하나를 이룬다.[@ieee-802-1as-2025]

동기화에 참여하는 장치를 **time-aware system**이라 한다. 브리지, 라우터, 종단국 등 어떤 네트워크 장치든 time-aware system이 될 수 있다. time-aware system은 PTP Instance를 하나 이상 담으며, **PTP Instance**는 한 gPTP 도메인에서 gPTP를 실행하는 실체다. time-aware system은 gPTP 도메인을 여럿 지원할 수 있고, 도메인마다 PTP Instance를 따로 둔다. PTP Instance는 두 가지다.[@ieee-802-1as-2025]

- **PTP End Instance**: PTP 포트가 하나인 PTP Instance. Grandmaster PTP Instance가 아니면 시각 정보를 받는 쪽이다.
- **PTP Relay Instance**: Grandmaster PTP Instance가 아니면 Grandmaster PTP Instance에서 온 시각 정보를 받아, LAN과 자기 안에서 걸린 지연을 보정한 뒤 다시 내보낸다.[@ieee-802-1as-2025]

gPTP 도메인의 모든 PTP Instance가 같은 Grandmaster PTP Instance를 따르도록 고르는 방법은 BTCA(best timeTransmitter clock algorithm)다.[@ieee-802-1as-2025] IEEE 802.1AS-2020은 이 알고리즘을 BMCA(best master clock algorithm)라 불렀고, 2025년판은 BTCA라 부른다.[@ieee-802-1as-2025][@ieee-802-1as-2020]

gPTP는 매체에 상관없는 부분과 매체마다 다른 부분으로 나누어 정한다. 다루는 매체는 전이중 점대점 링크의 [[ieee-802-3|IEEE 802.3]] 이더넷, IEEE 802.3 EPON(Ethernet Passive Optical Network), IEEE 802.11 무선, 일반 CSN(Coordinated Shared Network)이다.[@ieee-802-1as-2025]

전이중 점대점 링크에서는 링크 양 끝의 포트가 저마다 피어 지연(peer-to-peer delay) 방식으로 링크의 전파 지연을 잰다. 시각 정보는 Sync와 Follow_Up 메시지로 전한다. PTP Relay Instance는 상류 링크의 전파 지연과 자기 체류 시간(residence time)을 더해 correctionField에 보태고, 이를 하류로 보내는 시각 정보에 싣는다.[@ieee-802-1as-2025]

IEEE 802.1 작업 그룹의 [[tsn|TSN]] 태스크 그룹은 IEEE 802.1AS-2025를 TSN의 기반 표준 가운데 하나로 꼽는다.[@ieee-802-1-tsn-tg-2026]

## 개정 이력

- 2011년: 첫판. AV Bridging 태스크 그룹이 [[avb|AVB]]의 목표 가운데 하나인 2계층 시각 동기화 서비스로 만들었다.[@ieee-802-1as-2011][@ieee-802-1-avb-tg-2013]
- 2020년: 2판. 2011년판을 대체했고, time-aware system이 gPTP 도메인을 여럿 둘 수 있게 했다. 이 판 뒤로 개정(amendment) 802.1ASdr-2024, 802.1ASdn-2024, 802.1ASdm-2024와 정오표 802.1AS-2020/Cor 1-2021이 나왔다.[@ieee-802-1as-2020]
- 2025년: 3판. 2020년판을 대체했다.[@ieee-802-1as-2025] 2020년판에 정오표 Cor 1과 개정 802.1ASdr 등을 합친 판이다.[@ieee-802-1as-2020-rev-2026] 이 판 뒤로 개정 802.1ASds-2026과 802.1ASed-2026이 나왔다.[@ieee-802-1as-2025]
- 2026년: 2025년판을 대체할 개정 프로젝트 P802.1AS가 승인되어 진행 중이다.[@ieee-p802-1as-2026]

## IEEE 1588과의 차이

gPTP는 IEEE 1588-2019의 PTP와 다음이 다르다.[@ieee-802-1as-2025]

- 통신: gPTP는 PTP Instance 사이의 모든 통신이 IEEE 802 MAC(Medium Access Control) PDU(Protocol Data Unit)와 주소로만 이루어진다고 가정한다. IEEE 1588-2019는 2계층과 3·4계층의 여러 통신 방식을 지원한다.
- 도메인 구성: gPTP는 gPTP 도메인 안의 모든 시스템이 time-aware system이기를 요구하며, time-aware가 아닌 시스템을 거쳐서는 시각을 전하지 않는다. PTP Relay Instance가 아닌 장치는 gPTP 정보를 중계할 수 없다. IEEE 1588-2019에서는 IEEE 1588을 모르는 중계 장치를 도메인 안에 둘 수 있다.
- 지연 측정: 전이중 이더넷 링크에서 gPTP는 피어 지연 방식을 요구하고, IEEE 1588-2019는 종단 간(end-to-end) 지연 측정도 허용한다.[@ieee-802-1as-2025]
