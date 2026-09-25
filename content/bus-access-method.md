---
title: 버스 접근 방식
tags:
  - network
aliases:
  - 매체 접근 제어
  - medium access control
verified: 2026-09-25
---

## 정의

FDDI(Fibre Distributed Data Interface) 규격에서 매체 접근 제어(MAC, Media Access Control)는 데이터 링크 계층의 가운데 부계층으로, 매체에 공정하고 결정적으로 접근하게 한다.[@iso-iec-9314-8-1998] ISO 11898-1:2024도 [[can|CAN]]의 데이터 링크 계층을 LLC(Logical Link Control) 부계층과 MAC 부계층으로 나눈다.[@iso-11898-1-2024]

![[diagrams/osi-can-standards.svg]]

## 구조·동작

### 이더넷

IEEE 802.3에서 공유 매체(반이중) 동작은 CSMA/CD(Carrier Sense Multiple Access with Collision Detection) MAC 프로토콜이 규정한다.[@ieee-802-3-2022]

### CAN

CAN은 멀티마스터 방식이라, 버스가 비어 있으면 어느 노드든 프레임을 보내기 시작할 수 있다.[@iso-11898-1-obp-2024] 여러 노드가 한꺼번에 보내기 시작하면 식별자를 한 비트씩 겨루는 중재가 일어난다. 중재에서 진 노드는 물러나 수신 노드가 되고, 이긴 프레임은 정보도 시간도 잃지 않고 전송된다.[@bosch-can-2-0-1991]

![[diagrams/can-arbitration.svg]]

### FlexRay

FlexRay 프로토콜은 동기 프레임 전송과 비동기 프레임 전송을 지원한다. 동기 전송에서는 프레임 지연과 지터를 보장하고, 비동기 전송에서는 프레임에 우선순위를 둔다.[@iso-17458-2-2013]

### LIN

ISO 17987-3은 LIN(Local Interconnect Network) 프로토콜의 프레임 전송과 스케줄 테이블 처리를 규정하고, 노드를 커맨더 노드와 리스판더 노드로 나눈다.[@iso-17987-3-2025] 2016년판은 이 둘을 마스터 노드와 슬레이브 노드라 불렀다.[@iso-17987-3-2016]

### 토큰 링

IEEE 802.5 토큰 링은 토큰 패싱 링 접근 방식을 쓴다.[@ieee-802-5-1998]
