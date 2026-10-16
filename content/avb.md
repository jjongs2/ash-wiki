---
title: AVB
tags:
  - network/ethernet
aliases:
  - Audio Video Bridging
verified: 2026-09-29
---

**AVB**(Audio Video Bridging)는 IEEE 802 네트워크에서 시간 동기화된 저지연 스트리밍 서비스를 제공하려고 IEEE 802.1 작업 그룹이 만든 표준들이다. IEEE 802.1AS, IEEE 802.1Qat, IEEE 802.1Qav, IEEE 802.1BA가 여기에 든다.[@ieee-802-1-avb-tg-2013][@ieee-802-1-tsn-tg-2017] 이 표준들은 작업 그룹의 AV Bridging 태스크 그룹이 만들었고, 이 태스크 그룹은 2012년 11월에 이름을 Time-Sensitive Networking 태스크 그룹으로 바꾸었다.[@ieee-802-1-avb-tg-2013] AVB는 시간에 민감한 오디오·비디오 스트림을 나르는 네트워크를 겨냥한다.[@ieee-802-1ba-2021]

[[tsn|TSN]] 태스크 그룹에 따르면 AVB의 처음 작업은 IEEE 802.3의 Residential Ethernet Study Group에서 이루어졌다.[@ieee-802-1-tsn-tg-2026] 이 연구 그룹의 작업은 IEEE 802.1 작업 그룹의 Residential Bridges 태스크 그룹으로 옮겨 갔다.[@ieee-802-3-re-study-2006] 그에 앞서 2004년 7월 IEEE 802.3 총회의 관심 조사(Call for Interest)는 시간에 민감한 소비자 오디오·비디오 장치에 이더넷을 쓰는 연구 그룹을 만들지 물었다.[@ieee-802-3-re-cfi-2004]

Avnu Alliance는 네트워크·IT 인프라, 반도체, 장치 제조사가 모인 단체로, ProAV·자동차·산업 분야의 TSN 부품과 네트워크 장치에 상호운용성 인증 프로그램을 운영한다.[@avnu-certification-2025] 2011년 당시 Avnu Alliance는 IEEE 802.1 AVB와 이에 관련된 [[ieee-1722|IEEE 1722]], IEEE 1733 표준의 채택을 촉진하는 업계 포럼으로, AVB 장치의 상호운용성을 보장할 적합성 시험 절차를 만들고 AVB 기술의 이점을 알리는 것을 목표로 했다.[@avnu-about-us-2011] IEEE 1733-2011은 RTP(Real-time Transport Protocol) 계열 프로토콜과 IEEE 802.1 AVB를 써서 시간에 민감한 오디오·비디오 엔드 스테이션이 서로 운용되게 하는 3계층 전송 프로토콜 표준이며, 2026년 10월 16일에 확인한 상태로는 2022년 3월부터 IEEE의 Inactive-Reserved로 남아 있다.[@ieee-1733-2011]

## 구성 표준

- [[ieee-802-1as|IEEE 802.1AS-2025]]는 LAN에서 시각을 전달하는 프로토콜, 절차, 관리 객체를 정한다. 동기화된 시각의 전달과 timing source의 선택이 여기에 든다.[@ieee-802-1as-2025]
- IEEE 802.1BA-2021은 시간에 민감한 오디오·비디오 스트림을 나를 수 있는 네트워크를 만들기 위해, 브리지·스테이션·LAN의 기능, 옵션, 설정, 기본값, 프로토콜, 절차를 고르는 [[tsn#프로파일|프로파일]]을 정한다. 기능과 옵션을 고르는 대상은 [[virtual-lan|VLAN]] 브리지를 정하는 [[ieee-802-1q|IEEE 802.1Q]], 시간 동기화 표준인 IEEE 802.1AS, 그리고 [[ieee-802-3|IEEE 802.3]], IEEE 802.11처럼 LAN 기술마다 매체 접근 제어와 물리 계층을 정하는 표준이다.[@ieee-802-1ba-2021]
- IEEE 802.1Qat-2010은 [[srp|SRP]]를 정했다.
- IEEE 802.1Qav-2009는 [[credit-based-shaper|credit-based shaper]]를 정했다.[@ieee-802-1-tsn-tg-2017]

802.1Qat와 802.1Qav는 IEEE 802.1Q-2011에 합쳐졌다.[@ieee-802-1q-2011] IEEE 1722-2025는 브리지로 이어진 LAN에서 시간에 민감한 응용에 쓰는 전송 프로토콜을 정하며, 오디오·비디오·제어를 다루는 엔드 스테이션이 IEEE 1722 기반 스트림으로 서로 운용되게 한다.[@ieee-1722-2025]

## Talker와 listener

스트림을 내보내는 엔드포인트를 talker, 받는 엔드포인트를 listener라 한다.[@xmos-xm000102-2014][@ti-snaa333-2020] XMOS의 AVB 엔드포인트 설계 가이드에 따르면 한 엔드포인트가 둘 다일 수 있다. talker가 스위치에 스트림을 알리고 listener가 받겠다고 등록하면, AVB 스위치가 대역폭이 보장된 종단 간 경로를 예약한다. 대역폭이 모자라면 등록이 실패한다.[@xmos-xm000102-2014]

## SR 클래스

IEEE 802.1Q-2022는 SRP로 시간에 민감한 스트림에 대역폭을 예약할 수 있는 [[traffic-class|트래픽 클래스]]를 **SR 클래스**(Stream Reservation class)라 한다. 기본 설정은 SR 클래스 A와 B 두 개를 전제하며, 클래스 A는 우선순위 3, 클래스 B는 우선순위 2를 쓴다. talker에서 스트림의 트래픽 명세를 재는 구간인 class measurement interval의 기본값은 클래스 A가 125 µs, 클래스 B가 250 µs다.[@ieee-802-1q-2022]

SR 클래스 트래픽은 높은 우선순위 큐에 두고, 큐마다 credit-based shaper로 예약 대역폭까지만 내보낸다.[@ieee-802-1q-2022][@microchip-ksz9477s-2019] KSZ9477S는 포트당 egress 큐 넷으로 SR 클래스를 둘까지 받을 수 있다.[@microchip-ksz9477s-2019]

IEEE 802.1BA-2021은 talker에서 listener까지의 최악 지연 목표를 SR 클래스 A는 2 ms, 클래스 B는 50 ms로 둔다. 100 Mbit/s [[ethernet|이더넷]]에서 최대 프레임 크기가 1522바이트면 클래스 A의 2 ms는 7홉까지 맞출 수 있다. 이 지연 목표는 흔한 배치의 요구를 반영한 값으로, 종단 간 지연의 엄격한 한계가 아니라 plug-and-play 상호운용의 기준이다. IEEE 802.11 무선 홉은 한 홉이 지연을 적어도 20 ms 보태므로 클래스 A 네트워크에는 쓸 수 없고, 클래스 B 네트워크에는 두 홉까지 쓸 수 있다.[@ieee-802-1ba-2021]

## AVB 도메인

**AVB 도메인**은 AVB 동작이 지원되는, 장치와 LAN이 이어진 집합이다. 이 집합은 SRP 도메인과 [[ieee-802-1as|gPTP]] 도메인 0이 겹치는 부분이다.[@ieee-802-1ba-2021]

IEEE 802.1Q-2022는 수신 포트마다 SRP 도메인 경계 포트용 우선순위 재생성 표를 두어, 포트가 어떤 SR 클래스의 도메인 경계에 있으면 이 표의 값을 재생성한 우선순위로 쓴다. 기본값은 클래스 A의 우선순위 3과 클래스 B의 우선순위 2를 모두 0으로 바꾸므로, 도메인 밖에서 SR 클래스의 우선순위를 달고 들어온 트래픽은 경계의 브리지에서 더 낮은 우선순위로 전달된다. 예약한 트래픽과 예약하지 않은 트래픽이 같은 우선순위를 나눠 쓰면 예약한 트래픽의 최악 지연을 예측할 수 없게 된다.[@ieee-802-1q-2022]

IEEE 802.1BA-2021은 포트가 gPTP를 지원하지 않거나, gPTP가 그 포트의 도메인 0에서 asCapable을 거짓으로 정했거나, 포트에 붙은 LAN이 AVB를 지원하지 못하면 그 포트를 그 포트가 지원하는 모든 SR 클래스의 SRP 도메인 경계 포트로 둔다. 이 포트로 넘어갈 Talker Advertise는 실패 코드 8("Egress port is not AVB-capable")을 단 Talker Failed로 바뀌므로, 스트림 예약은 talker와 listener가 같은 SRP 도메인에 있을 때만 이루어진다. 이 표준은 반이중이거나 100 Mbit/s보다 느린 IEEE 802.3을 AVB를 지원하지 못하는 LAN 기술로 꼽는다.[@ieee-802-1ba-2021]

![[diagrams/avb-domain-boundary-port.svg]]

IEEE 802.1AS-2025는 전이중 점대점 링크에 붙은 포트에서 잰 평균 전파 지연이 문턱값 meanLinkDelayThresh를 넘으면, 그 포트를 IEEE 802.1AS에 참여할 수 없는 것으로 보고 asCapableAcrossDomains를 거짓으로 둔다. [[100base-tx|100BASE-TX]]와 1000BASE-T 링크에서 이 문턱값을 넘는 지연은 gPTP를 구현하지 않은 장비가 끼어 있어서 생긴다고 본다.[@ieee-802-1as-2025]

## 기본 적합성

IEEE 802.1BA-2021은 AVB를 지원한다고 내세우는 장치의 최소 요구로, talker와 listener에는 스트림 하나, 브리지에는 포트마다 스트림 하나를 다룰 능력을 요구한다. 브리지와 talker에 대한 요구는 아래와 같다.[@ieee-802-1ba-2021]

- 브리지: AVB를 지원하는 모든 포트가 FQTSS(Forwarding and Queuing Enhancements for Time-Sensitive Streams)를 지원하는 트래픽 클래스에 묶인 스트림 예약 하나, 스트림 하나의 MSRP(Multiple Stream Registration Protocol) 속성의 등록·선언·전파, BMCA(best master clock algorithm)를 구현한 gPTP 도메인 0을 지원해야 한다. 모든 브리지는 SR 클래스 B를 지원하고, IEEE 802.3 포트가 둘 이상인 브리지는 그 포트 모두에서 SR 클래스 A도 지원해야 한다. talker pruning은 지원하지 않아야 한다.
- talker: 스트림 하나를 보낼 수 있고, 그 스트림의 talker 선언을 하고 그에 따른 listener 선언을 등록할 수 있어야 한다. 포트는 BMCA를 구현한 gPTP 도메인 0을 지원하고, talker를 동기화하는 [[ieee-802-1as#범위|PTP Instance]]는 grandmaster가 될 수 있어야 한다.[@ieee-802-1ba-2021]

이 표준은 [[ethernet-flow-control|흐름 제어]]를 지원하는 AVB 시스템에 AV 스트림을 나르는 포트의 MAC(Medium Access Control) control PAUSE를 끄게 한다. SR 클래스의 우선순위에 PFC(Priority-based Flow Control)를 켠 포트는 그 SR 클래스의 SRP 도메인 경계 포트로 둔다. 흐름 제어가 AVB의 지연 보장을 깨뜨릴 수 있기 때문이다.[@ieee-802-1ba-2021]

이 표준은 활성 예약이 있는 포트에서 [[energy-efficient-ethernet|EEE]]를 지원하는 AVB 시스템에, 그 포트에서 LPI(Low Power Idle)를 아예 쓰지 않거나, 보낼 프레임이 없을 때만 LPI에 들어가고 깨어나는 시간(wake time)을 30 µs와 그 [[ethernet-phy|PHY]]의 최대 크기 [[ethernet-frame|이더넷 프레임]] 전송 시간 가운데 큰 값 이하로 두게 한다.[@ieee-802-1ba-2021]

이 표준은 AV 트래픽을 나르는 포트가 매체와 상관없이 IEEE 802.3의 최대 프레임 크기 규칙을 따르게 하고, 2000옥텟보다 큰 MAC PDU(Protocol Data Unit)를 받도록 설정한 포트는 SRP에서 AVB를 지원하지 않는 포트로 본다.[@ieee-802-1ba-2021]

## 차량 프로파일

Avnu Alliance의 Automotive Ethernet AVB Functional and Interoperability Specification은 자동차 AVB 장치의 기본 기능을 정해 인증의 바탕으로 삼는 명세로, Revision 1.6이 2019년 11월에 나왔다. 이 명세는 인포테인먼트와 기본 카메라를 대상으로 하고, 엔진 제어나 운전자 보조 같은 장치는 범위 밖에 둔다.[@avnu-automotive-avb-1-6-2019]

이 명세는 차량 네트워크가 닫혀 있고 미리 설정되어 바뀌지 않는다는 점을 들어 gPTP의 동작을 단순화한다. 차량 네트워크에 grandmaster를 하나로 고정해 두고, BMCA를 돌리지 않으며, Announce 메시지도 쓰지 않는다. 장치가 모든 AVB 스트림에 정적으로 설정한 예약을 지원하게 한다. 시험 모드의 엔드 스테이션이 보내는 Test Status Message는 [[ieee-1722-1|IEEE 1722.1]]의 응답 메시지를 바탕으로 정하지만, 엔드 스테이션이 스스로 보내므로 처리하는 데 1722.1 제어 기반이 필요 없다고 둔다.[@avnu-automotive-avb-1-6-2019]

이 명세는 측정 간격이 다른 SR 클래스 템플릿 넷 가운데 하나 이상을 지원하게 하고, 템플릿마다 최대 전달 시간(Maximum Transit Time)의 기본값을 둔다.[@avnu-automotive-avb-1-6-2019]

| 템플릿   | 측정 간격  | 최대 전달 시간 |
| -------- | ---------- | -------------- |
| tpl_125  | 125 µs     | 2 ms           |
| tpl_250  | 250 µs     | 10 ms          |
| tpl_1333 | 1333.33 µs | 15 ms          |
| tpl_1451 | 1451.25 µs | 15 ms          |

tpl_250의 10 ms는 무선 구간 둘을 전제한 IEEE 802.1BA의 클래스 B 값을 차량에 맞게 줄인 값이다. 장치가 SR 클래스를 동시에 둘보다 많이 지원할 필요는 없다.[@avnu-automotive-avb-1-6-2019]

미디어 형식으로는, AAF(AVTP Audio Format)를 지원하는 오디오 장치가 IEEE 1722-2016의 AAF와 16비트 정수 샘플 형식, 48 kHz와 44.1 kHz 가운데 하나 이상의 샘플링 레이트를 지원하게 한다. 미디어 클럭 기준을 주고받는 장치 가운데 오디오 talker가 IEEE 1722-2016의 오디오 샘플 CRF(Clock Reference Format)를 지원하게 한다.[@avnu-automotive-avb-1-6-2019]

## TSN과의 관계

AV Bridging 태스크 그룹은 네트워크 지연을 더 줄이려고 [[frame-preemption|프레임 선점]](P802.1Qbu)과 [[time-aware-shaper|scheduled traffic]](P802.1Qbv) 프로젝트를 시작했고, 이중화와 처리량 향상을 위한 다중 경로 작업도 검토했다.[@ieee-802-1-avb-tg-2013] TSN 태스크 그룹은 AVB 태스크 그룹에서 이어졌고 AVB 표준을 이어받았으며, scheduled traffic(IEEE 802.1Qbv)과 프레임 선점(IEEE 802.1Qbu)을 더했다.[@ieee-802-1-tsn-tg-2017] 이중 전송을 위해 프레임을 복제하고 중복을 없애는 [[ieee-802-1cb|IEEE 802.1CB]]도 TSN 태스크 그룹에서 나왔다.[@ieee-802-1cb-project-2017]
