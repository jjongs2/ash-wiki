---
title: TSN 설정
tags:
  - network/ethernet
aliases:
  - IEEE 802.1Qcc
verified: 2026-10-06
---

**TSN 설정**은 [[avb#Talker와 listener|talker]]와 listener가 자기 요구를 네트워크에 넘기면, 네트워크가 스트림마다 talker에서 listener까지의 브리지에 [[tsn|TSN]] 기능을 설정하는 과정이다. [[ieee-802-1q|IEEE 802.1Q]]-2022는 46장에서 이 설정을 정한다.[@ieee-802-1q-2022]

## UNI

이 표준은 UNI(User/Network Interface)로 오가는 TSN 설정 정보를 정한다. 사용자 쪽은 엔드 스테이션 안의 talker와 listener이고, 네트워크 쪽은 스트림의 프레임을 talker에서 listener로 나르는 브리지다. 사용자는 네트워크를 자세히 알지 못한 채 자기 데이터의 요구를 밝힌다. 네트워크는 사용자 요구를 받고, 토폴로지와 브리지의 TSN 능력을 분석해 브리지를 설정한 뒤, 스트림마다 설정의 성공이나 실패를 사용자에게 돌려준다.[@ieee-802-1q-2022]

## 세 모델

이 표준은 사용자와 네트워크 사이에서 설정 정보가 흐르는 방식에 따라 세 모델을 둔다.[@ieee-802-1q-2022]

### 완전 분산 모델

이 표준은 완전 분산 모델에서 talker와 listener가 있는 엔드 스테이션이 UNI로 요구를 직접 전하고, 네트워크는 중앙 설정 실체 없이 분산 방식으로 설정되도록 정한다. 설정 정보는 스트림의 활성 토폴로지, 곧 talker에서 listener까지의 트리에 있는 브리지들을 따라 퍼지고, 각 브리지는 자기가 아는 정보로만 자원을 관리하므로 네트워크 전체를 알지 못할 수 있다. 이 모델에서 브리지가 설정하는 기능은 [[credit-based-shaper|credit-based shaper]]이고, [[srp|SRP]]를 UNI로도, 네트워크 안에서 설정 정보를 퍼뜨리는 데에도 쓸 수 있다.[@ieee-802-1q-2022]

![[diagrams/tsn-config-fully-distributed.svg]]

### 중앙 네트워크/분산 사용자 모델

이 표준은 중앙 네트워크/분산 사용자 모델에서도 엔드 스테이션이 UNI로 요구를 직접 전하되, 설정 정보는 CNC(Centralized Network Configuration)로 가도록 정한다. **CNC**는 TSN 응용(사용자)을 대신해 네트워크 자원을 설정하는 중앙 구성 요소다.[@ieee-802-1q-2022]

이 모델은 [[time-aware-shaper|scheduled traffic]]의 포트별 게이트 제어 목록 계산처럼 오래 걸리는 계산을 한곳에 모으거나, 네트워크의 모든 스트림을 알아야 더 나은 경로를 고를 수 있는 경우를 위한 것이다. CNC는 네트워크의 물리 토폴로지와 각 브리지의 능력을 모두 알며, 엔드 스테이션이나 브리지 안에 둘 수 있다. CNC는 엔드 스테이션이 붙은 에지 브리지가 talker·listener 정보를 네트워크 안쪽으로 퍼뜨리지 않고 CNC와 직접 주고받도록 설정하며, 원격 네트워크 관리 프로토콜로 모든 브리지의 TSN 기능을 설정한다. 이런 프로토콜의 예로 SNMP(Simple Network Management Protocol), NETCONF(Network Configuration Protocol), RESTCONF가 있다.[@ieee-802-1q-2022]

![[diagrams/tsn-config-centralized-network.svg]]

### 완전 중앙 모델

이 표준은 완전 중앙 모델에 CUC(Centralized User Configuration)를 둔다. **CUC**는 엔드 스테이션을 찾고, 그 능력과 사용자 요구를 가져오며, 엔드 스테이션의 TSN 기능을 설정하는 중앙 실체다.[@ieee-802-1q-2022]

이 모델은 자동차와 산업 제어 응용처럼 물리 입출력의 타이밍이 제어 대상 환경으로 정해지고, 스트림의 타이밍 요구가 그 입출력 타이밍에서 나오는 경우를 위한 것이다. 사용자 요구는 모두 CNC와 CUC 사이에서 오가므로 UNI는 CNC와 CUC 사이에 있다. CUC가 엔드 스테이션과 주고받는 프로토콜은 응용마다 정해지며 IEEE 802.1Q의 범위 밖이다.[@ieee-802-1q-2022]

![[diagrams/tsn-config-fully-centralized.svg]]

## CNC가 설정하는 기능

이 표준은 두 중앙 모델에서 CNC가 설정할 수 있는 TSN 기능을 아래처럼 정한다.[@ieee-802-1q-2022]

- credit-based shaper
- [[frame-preemption|프레임 선점]]
- scheduled traffic
- [[ieee-802-1cb|FRER]](IEEE 802.1CB)
- [[per-stream-filtering-and-policing|스트림별 필터링과 policing]]
- [[cyclic-queuing-and-forwarding|cyclic queuing and forwarding]][@ieee-802-1q-2022]

## 관련 표준

IEEE 802.1Qcc-2018은 IEEE 802.1Q-2018의 개정으로, 시간에 민감한 스트림의 설정을 보강했다.[@ieee-802-1qcc-2018] IEEE 802.1Qdj-2024는 IEEE 802.1Q-2022의 개정으로, 엔드 스테이션의 TSN 기능 사용을 설정하는 CUC 구성 요소들과 한 관리 도메인 안의 네트워크 자원을 설정하는 CNC 구성 요소 사이의 관계와 책임 분담을 다룬다. CNC와 CUC 사이의 통신에 NETCONF 같은 네트워크 설정 프로토콜이 쓸 YANG(Yet Another Next Generation) 모델과 모듈도 정한다.[@ieee-802-1qdj-2024]

IEEE 802.1Q-2022의 Annex U(참고)는 TSN 설정의 구현 예를 제시한다. 시간 동기화를 아는 talker의 예와, CUC 하나와 CNC 하나를 둔 완전 중앙 모델의 작업 흐름 예가 여기에 있다.[@ieee-802-1q-2022]
