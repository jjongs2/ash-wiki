---
title: TSN
tags:
  - network/ethernet
aliases:
  - Time-Sensitive Networking
verified: 2026-09-29
---

**TSN**(Time-Sensitive Networking)은 IEEE 802가 정한 표준들의 묶음을 부르는 이름이다. 이 표준들을 만드는 곳은 IEEE 802.1 작업 그룹의 TSN 태스크 그룹이며, 태스크 그룹은 IEEE 802 네트워크에서 결정적인 연결, 곧 지연에 상한이 있고 지연 변동과 패킷 손실이 적은 전달을 보장하는 것을 목표로 한다.[@ieee-802-1-tsn-tg-2026] TSN 태스크 그룹은 옛 [[avb|AVB]] 태스크 그룹에서 이어졌다. AV Bridging 태스크 그룹이 2012년 11월에 이름을 TSN 태스크 그룹으로 바꾸었다.[@ieee-802-1-tsn-tg-2026][@ieee-802-1-avb-tg-2013]

## 도구

IEEE 802.1 작업 그룹의 TSN 요약은 TSN 도구를 네 갈래로 나눈다.[@ieee-802-1-tsn-summary-2026]

- 시간 동기화: [[ieee-802-1as|IEEE 802.1AS]]
- 지연 상한: credit-based shaper(IEEE 802.1Qav), 프레임 선점(IEEE 802.1Qbu, IEEE 802.3br), scheduled traffic(IEEE 802.1Qbv), cyclic queuing and forwarding(IEEE 802.1Qch), asynchronous traffic shaping(IEEE 802.1Qcr)
- 고가용성과 초신뢰성: IEEE 802.1CB, IEEE 802.1Qca, IEEE 802.1Qci
- 전용 자원과 API(Application Programming Interface): [[srp|SRP]](IEEE 802.1Qat), IEEE 802.1Qcc[@ieee-802-1-tsn-summary-2026]

시간 동기화는 시간 기반 스케줄링 같은 여러 TSN QoS(Quality of Service) 기능의 바탕이다.[@ieee-tsn-industrial-flyer-2026][@microchip-an1185-2025]

IEEE 802.1Q의 scheduled traffic은 큐마다 전송 게이트를 두고, 포트의 게이트 제어 목록에 따라 알려진 시간 척도에 맞춰 게이트를 열고 닫는다. 게이트가 닫힌 큐의 프레임은 전송에 선택되지 않는다. 게이트 동작의 타이밍은 [[ptp|PTP]]가 동작해 브리지나 엔드 스테이션이 PTP 시각을 쓸 수 있다고 전제한다.[@ieee-802-1q-2022]

TSN 태스크 그룹이 마친 프로젝트에는 802.1AS, 802.1CB, 802.1Qbv, 802.1Qbu, 802.1Qci, 802.1Qch, 802.1Qcc, 802.1Qcr, 802.1CM, 802.1DG 등이 있다.[@ieee-802-1-tsn-tg-2026]

IEEE 802.1CB-2017은 중복 전송을 위해 패킷을 식별하고 복제하며, 중복된 패킷을 식별해 없애는 절차와 프로토콜을 정한다. 복제본이 지나갈 여러 경로를 만드는 일은 다루지 않는다.[@ieee-802-1cb-2017]

다른 도구 가운데 몇몇은 IEEE 802.1Q의 개정으로 나왔다.[@ieee-802-1-tsn-tg-2026]

- IEEE 802.1Qbv-2015는 알려진 시간 척도에 맞춰 큐를 비워 프레임 전송을 스케줄하는 방식을 넣었다.[@ieee-802-1-tsn-tg-2017]
- IEEE 802.1Qci-2017은 스트림별 필터링과 policing(Per-Stream Filtering and Policing)을 넣었다.[@ieee-802-1-tsn-tg-2026]
- IEEE 802.1Qcc-2018은 SRP를 개선하고, 시간에 민감한 스트림의 설정을 보강했다.[@ieee-802-1-tsn-tg-2026][@ieee-802-1qcc-2018]

## 프로파일

IEEE 802.1 작업 그룹의 TSN 요약은 TSN 프로파일을 "TSN 도구의 선택과 사용"이라 부른다.[@ieee-802-1-tsn-summary-2026] TSN 태스크 그룹이 꼽는 프로파일 표준은 아래와 같다.[@ieee-802-1-tsn-tg-2026]

- IEEE 802.1BA: AVB 시스템
- IEEE 802.1CM: 이동통신 fronthaul
- IEC/IEEE 60802: 산업 자동화
- IEEE 802.1DG: 차량 내 이더넷 통신
- IEEE 802.1DP/SAE AS 6675: 항공기 탑재 네트워크[@ieee-802-1-tsn-tg-2026]

![[diagrams/tsn-tools-profiles.svg]]

IEEE 802.1BA-2021은 시간에 민감한 오디오·비디오 스트림을 나를 수 있는 네트워크를 만들기 위해, 브리지·스테이션·LAN(Local Area Network)의 기능, 옵션, 설정, 기본값, 프로토콜, 절차를 고르는 프로파일을 정한다.[@ieee-802-1ba-2021] IEEE 802.1CM-2018은 같은 방식으로 fronthaul 스트림을 나르는 네트워크를 위한 프로파일을 정하며, 셀룰러 네트워크의 무선 장비와 원격 제어기를 패킷 네트워크로 잇는 IEEE의 첫 표준이다.[@ieee-802-1cm-2018] IEC/IEEE 60802는 산업 자동화 네트워크를 위해 브리지·엔드 스테이션·LAN의 기능과 설정을 고르는 TSN 프로파일을 정한다.[@iec-ieee-60802-2026] 이 표준은 TSN 기능, 공통 관리 방식, 보안, 기본값을 골라 변형을 제한하고, 이로써 여러 벤더의 장치로 네트워크를 꾸릴 수 있게 한다.[@ieee-tsn-industrial-flyer-2026]

## AVB와의 관계

AV Bridging 태스크 그룹은 802 네트워크에서 시간 동기화된 저지연 스트리밍 서비스를 가능하게 하는 명세를 목표로 했다. 이 태스크 그룹은 802.1Qav의 전달 규칙보다 지연을 더 줄이려고 프레임 선점(P802.1Qbu)과 scheduled traffic(P802.1Qbv) 프로젝트를 시작했고, 이중화를 위한 다중 경로 작업도 검토했다.[@ieee-802-1-avb-tg-2013]

IEEE 802.1Q의 traffic scheduling은 산업·자동차 제어처럼 프레임의 전송 시각과 지연, 지터를 매우 예측할 수 있어야 하는 응용을 겨냥한다. 이런 응용은 제어 데이터를 정해진 주기로 보내고, 프레임이 늦게 도착하면 제어 루프가 불안정해지거나 실패할 수 있다. 우선순위만으로는 이런 요구를 맞추지 못한다. 낮은 우선순위 프레임이 이미 전송 중이면 높은 우선순위 프레임은 최대 크기 프레임 하나만큼 기다릴 수 있고, 이 지연이 홉마다 쌓이기 때문이다.[@ieee-802-1q-2022] IEEE SA 자료에 따르면 TSN은 요구가 크게 다른 여러 트래픽 클래스를 지원해, 실시간 제어 데이터를 best-effort 트래픽과 같은 네트워크 인프라로 나를 수 있게 한다.[@ieee-tsn-industrial-flyer-2026]

TSN 태스크 그룹은 AVB 표준인 IEEE 802.1AS-2011, 802.1Qat-2010, 802.1Qav-2009, 802.1BA-2011도 TSN 표준에 넣는다.[@ieee-802-1-tsn-tg-2026] IEEE SA 자료에 따르면 TSN 도구 모음은 AVB 표준 모음에서 발전했고, 일부는 자율 주행 쪽으로 넓어진 작업 범위를 반영한다.[@ieee-tsn-automotive-flyer-2026]
