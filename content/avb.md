---
title: AVB
tags:
  - network/ethernet
aliases:
  - Audio Video Bridging
verified: 2026-09-29
---

**AVB**(Audio Video Bridging)는 IEEE 802 네트워크에서 시간 동기화된 저지연 스트리밍 서비스를 제공하려고 IEEE 802.1 작업 그룹이 만든 표준들이다. IEEE 802.1AS, IEEE 802.1Qat, IEEE 802.1Qav, IEEE 802.1BA가 여기에 든다.[@ieee-802-1-avb-tg-2013][@ieee-802-1-tsn-tg-2017] 이 표준들은 작업 그룹의 AV Bridging 태스크 그룹이 만들었고, 이 태스크 그룹은 2012년 11월에 이름을 Time-Sensitive Networking 태스크 그룹으로 바꾸었다.[@ieee-802-1-avb-tg-2013] AVB는 시간에 민감한 오디오·비디오 스트림을 나르는 네트워크를 겨냥한다.[@ieee-802-1ba-2021]

## 구조·동작

### 구성 표준

- [[ieee-802-1as|IEEE 802.1AS]]는 LAN에서 시각을 전달하는 프로토콜, 절차, 관리 객체를 정한다. 동기화된 시각의 전달과 시각 원천의 선택이 여기에 든다.[@ieee-802-1as-2025]
- IEEE 802.1BA는 시간에 민감한 오디오·비디오 스트림을 나를 수 있는 네트워크를 만들기 위해, 브리지·스테이션·LAN의 기능, 옵션, 설정, 기본값, 프로토콜, 절차를 고르는 프로파일을 정한다.[@ieee-802-1ba-2021]
- IEEE 802.1Qat-2010은 [[srp|SRP]]를 정했다.[@ieee-802-1-tsn-tg-2017] 이 개정은 브리지로 이어진 LAN을 지나는 스트림에 네트워크 자원을 예약하고 그 자원을 유지하는 프로토콜과 절차를 정했다.[@ieee-802-1qat-project-2010]
- IEEE 802.1Qav-2009는 credit-based shaper를 정했다.[@ieee-802-1-tsn-tg-2017] 이 개정은 브리지가 시간에 민감한 AV 트래픽에 지연과 전달 변동의 상한을 보장하게 하는 것을 목표로 했다.[@ieee-802-1qav-project-2009]

802.1Qat와 802.1Qav는 IEEE 802.1Q-2014에 합쳐졌다.[@ieee-802-1-tsn-tg-2017] [[ieee-1722|IEEE 1722]]는 브리지로 이어진 LAN에서 시간에 민감한 응용에 쓰는 전송 프로토콜을 정하며, 오디오·비디오·제어를 다루는 종단국이 IEEE 1722 기반 스트림으로 서로 운용되게 한다.[@ieee-1722-2025]

### talker와 listener

XMOS의 AVB 엔드포인트 설계 가이드에 따르면 스트림을 내보내는 엔드포인트를 talker, 받는 엔드포인트를 listener라 하고, 한 엔드포인트가 둘 다일 수 있다. talker가 스위치에 스트림을 알리고 listener가 받겠다고 등록하면, AVB 스위치가 대역폭이 보장된 종단 간 경로를 예약한다. 대역폭이 모자라면 등록이 실패한다.[@xmos-xm000102-2014]

![[diagrams/srp-roles-declarations.svg]]

802.1Qat 프로젝트는 전송을 시작하기 전에 스트림의 데이터 경로 전체에서 자원을 확보해야 한다고 보고, 이를 위해 스트림 기술자와 종단 간 예약 신호 프로토콜을 정의하려 했다.[@ieee-802-1qat-project-2010]

### SR 클래스

KSZ9477S 데이터시트에 따르면 AVB는 SR(Stream Reservation) 트래픽 클래스를 두고, 이 클래스에 큐잉과 egress 스케줄링의 높은 우선순위를 준다.[@microchip-ksz9477s-2019]

KSZ9477S는 포트당 egress 큐 넷으로 SR 트래픽 클래스를 둘까지 받을 수 있고, best effort 트래픽용 큐를 적어도 하나 남겨야 한다. SR 클래스 트래픽은 높은 우선순위 큐에 두고, 큐마다 credit-based shaper로 예약 대역폭까지만 내보낸다. SR 트래픽이 예약 대역폭을 넘지 않으면 shaper는 패킷을 비교적 고르게 내보낸다.[@microchip-ksz9477s-2019]

## 비교·한계

AV Bridging 태스크 그룹은 네트워크 지연을 더 줄이려고 프레임 선점(P802.1Qbu)과 scheduled traffic(P802.1Qbv) 프로젝트를 시작했다.[@ieee-802-1-avb-tg-2013] [[tsn|TSN]] 태스크 그룹은 AVB 태스크 그룹에서 이어졌고 AVB 표준을 이어받았으며, scheduled traffic(IEEE 802.1Qbv)과 프레임 선점(IEEE 802.1Qbu)을 더했다.[@ieee-802-1-tsn-tg-2017] 이중 전송을 위해 프레임을 복제하고 중복을 없애는 IEEE 802.1CB도 TSN 태스크 그룹에서 나왔다.[@ieee-802-1cb-project-2017]

Avnu Alliance는 네트워크·IT 인프라, 반도체, 장치 제조사가 모인 단체로, ProAV·자동차·산업 분야의 TSN 부품과 네트워크 장치에 상호운용성 인증 프로그램을 운영한다.[@avnu-certification-2025]
