---
title: 버스 접근 방식
tags:
  - network
aliases:
  - 다중 접속
verified: 2026-09-27
---

여러 단말이 한 전송 링크의 용량을 미리 정한 방식으로, 또는 트래픽 요구에 따라 나눠 쓰는 기법을 **다중 접속**(multiple access)이라 한다.[@iec-60050-701-03-11-2016] [[can|CAN]] 표준 [[iso-11898-1|ISO 11898-1:2024]]는 여러 노드가 동시에 버스에 접근할 때 생기는 경합을 푸는 방법을 버스 접근 방식(bus access method)이라는 절에서 다룬다.[@iso-11898-1-obp-2024]

ISO/IEC 2382:2015는 LAN의 MAC(Medium Access Control) 프로토콜을, 데이터 스테이션 사이에 데이터를 주고받도록 전송 매체 접근을 다스리는 프로토콜로 정의한다. 매체 접근 제어는 어느 데이터 스테이션이 차례로 전송 매체를 잠시 제어할지 정하는 기법이다.[@iso-iec-2382-obp-2015]

## 시분할

**TDMA**(Time Division Multiple Access)는 링크에 접근하는 단말마다 되풀이되는 시간 구간을 따로 배정해, 그 구간에 송신하게 하는 다중 접속 기법이다.[@iec-60050-725-14-12-1994]

NXP 앱노트에 따르면 [[flexray|FlexRay]]의 정적 세그먼트는 버스 접근에 TDMA를 쓰고, 동적 세그먼트는 FTDMA(Flexible TDMA)를 쓴다.[@nxp-an12233-2021] 세그먼트의 구성은 [[flexray#통신 사이클|통신 사이클]]에서 다룬다.

## 경쟁 방식

전송 매체에서 송신이 동시에 일어나 생기는 상태를 **충돌**(collision)이라 한다. LAN에서 MAC 프로토콜이 둘 이상의 데이터 스테이션에 동시에 송신을 시작하도록 허용해 충돌 위험이 있는 상황은 **경합**(contention)이다.[@iso-iec-2382-obp-2015]

[[ethernet|이더넷]]의 CSMA/CD(Carrier Sense Multiple Access with Collision Detection) MAC 프로토콜은 공유 매체에서의 반이중 동작을 규정한다.[@ieee-802-3-2022] ISO/IEC 2382:2015는 CSMA/CD 네트워크를 MAC 프로토콜이 캐리어 감지를 요구하는 버스 네트워크로 정의한다. 캐리어 감지는 데이터 스테이션이 다른 스테이션이 송신 중인지 계속 살피는 활동이고, 전송 매체가 사용 중이면 스테이션은 진행 중인 송신과 충돌하지 않도록 송신을 미룬다. CSMA/CD 네트워크는 충돌로 생긴 예외 상황을 재전송으로 해결한다. truncated binary exponential backoff는 충돌 뒤 재전송을 [[ethernet-frame#필드|slot time]]과 재전송 시도 횟수로 정한 시간만큼 늦추는 알고리즘이다.[@iso-iec-2382-obp-2015]

반이중 이더넷 MAC은 다른 스테이션이 송신하는 동안 송신을 미루고, 그 송신이 끝나면 송신을 시도한다. 충돌 뒤에는 무작위로 정한 백오프 시간만큼 기다렸다가 다시 송신한다.[@microchip-enc28j60-2012][@st-rm0008-2021] STM32F107의 이더넷 MAC은 반이중에서 송신 중 충돌을 감지하면 [[ethernet-frame#필드|잼 패턴]]을 보내 다른 스테이션에 알리고, 백오프만큼 기다렸다가 프레임을 다시 보낸다.[@st-rm0008-2021]

CAN에서는 버스가 [[dominant-and-recessive#버스가 비어 있을 때|idle]]이면 어느 노드든 송신을 시작할 수 있고, 여러 노드가 동시에 시작하면 [[can-identifier|식별자]]로 비트 단위 [[can-arbitration|중재]]를 해 이긴 한 메시지가 정보도 시간도 잃지 않고 송신을 이어 간다.[@bosch-can-2-0-1991] ISO 11898-1:2024는 이 식별자 기반 중재를 CSMA/CR(Collision Resolution)이라 부른다.[@iso-11898-1-obp-2024] CAN의 버스 접근은 이벤트 구동이다.[@ti-sloa101b-2016][@nxp-can-101-2021] TI 앱노트에 따르면 버스 접근은 무작위로 일어난다.[@ti-sloa101b-2016]

## Commander-responder

[[lin|LIN]]에서는 네트워크에 하나뿐인 commander가 프레임을 스케줄한다.[@iso-17987-1-obp-2025] 그 동작은 [[lin#Commander와 responder|commander와 responder]]에서 다룬다.

## 토큰 원리

LAN의 **토큰**은 데이터 스테이션에서 다음 데이터 스테이션으로 차례로 넘겨지는 권한 표지로, 전송 매체를 잠시 제어하는 스테이션을 가리킨다. 토큰 전달 프로토콜은 데이터 스테이션이 토큰을 얻고, 쓰고, 넘기는 방법을 정한 규칙이다.[@iso-iec-2382-obp-2015]

[[osek-vdx|OSEK/VDX]] NM(Network Management)은 노드를 [[autosar-network-management#Direct NM과 indirect NM|직접 감시]]할 때 전용 NM 통신과 토큰 원리를 쓴다. 노드마다 논리적 후속 노드를 정해 논리 링을 만들고, 링 메시지를 후속 노드로 넘기며 NM 통신을 동기화한다. 링 메시지를 받은 노드는 논리 링 알고리즘에 따라 자기 NM 메시지를 보내기 시작하며, NM 통신은 그 아래 버스 프로토콜과 독립이다.[@osek-nm-2-5-3-2004]

![[diagrams/osek-nm-logical-ring.svg]]
