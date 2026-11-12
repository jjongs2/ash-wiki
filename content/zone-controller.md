---
title: 존 제어기
tags:
  - hardware/ee-architecture
aliases:
  - ZCU
verified: 2026-11-07
---

**존 제어기**(zone controller)는 차량의 한 물리적 구역을 맡아 그 구역의 통신을 모으고, 가까운 부하를 구동하며, 전원을 나누는 [[electronic-control-unit|ECU]]다.[@infineon-zcu-2026][@ti-ssztd02-2025] ZCU(Zone Control Unit)라고도 부른다.[@infineon-zcu-2026][@guo-virtualisation-technologies-2025]

[[ee-architecture#존 아키텍처|존 아키텍처]]에서 존 제어기는 그 구역의 센서와 액추에이터를 [[high-performance-computer|중앙 컴퓨터]]에 잇는다.[@ti-ssztd02-2025][@nxp-s32g2zoneconfs-2021] Infineon에 따르면 존 제어기는 [[gateway|게이트웨이]] 기능, 전원 분배, 바디 제어 모듈이 하던 국소 부하 구동처럼 기존 ECU 여럿의 기능을 모은다.[@infineon-zcu-2026] TI 기술 기사에 따르면 차량은 도메인마다 전용 [[domain-controller|도메인 제어기]]를 두는 대신, 기능을 통합한 존 제어기 두세 개를 둘 수 있다.[@ti-ssztd31-2024]

## 존 계층

Bosch는 차량 컴퓨터가 이루는 계산 계층과 수많은 센서, 액추에이터, 스마트 ECU 사이에 새로 들어설, 존 ECU로 된 계층을 **존 계층**(zonal layer)이라 부른다.[@bosch-zone-ecu-2026] 존 아키텍처용 모듈 키트로 차종마다 규모를 맞추므로, 작은 차량은 큰 차량보다 존 ECU를 적게 달게 된다.[@bosch-ee-architecture-2026]

![[diagrams/computing-zonal-layers.svg]]

## 데이터 전달

TI 자료에 따르면 존 제어기는 구역의 센서와 ECU에서 받은 데이터를 모아 백본으로 중앙 컴퓨터에 보내고, 중앙 컴퓨터에서 받은 데이터를 구역의 액추에이터로 나눈다.[@ti-ssztd02-2025][@ti-spry345-2024]

## 전원 분배

TI 백서에 따르면 구역마다 존 제어기가 전원 분배에 필요한 퓨즈와 릴레이를 품고 배터리에서 구역까지 전원선을 하나씩만 끌면, 중앙에서 전원을 나눌 때보다 전원선이 짧아진다.[@ti-spry345-2024]

![[diagrams/central-zonal-power-distribution.svg]]

존 아키텍처에서 전원 분배는 중앙 집중에서 벗어나 존 제어기에 둔 스마트 퓨즈로 분산될 것이고, 시스템 설계자는 녹는 퓨즈를 반도체 퓨즈로 바꾸는 방안도 함께 따진다. 그 방안의 하나는 반도체 하이사이드 스위치를 쓰는 것이다.[@ti-spry345-2024] Renesas 백서도 도메인·존 아키텍처의 제어 장치에서는 기계식 릴레이와 퓨즈를 반도체 스위치로 바꾸기를 권한다. 모듈이 놓인 자리 때문에 사용자가 닳은 릴레이나 퓨즈를 갈기 어렵기 때문이다.[@renesas-ipd-power-distribution-2025]

Infineon에 따르면 저전압 부하에 전원을 나누는 2차 전원 분배 장치의 기능을 반도체로 만들면 존 제어기에 넣을 수 있고, 그만큼 부하 가까이 옮겨 가므로 배선이 크게 짧고 단순해진다.[@infineon-automotive-power-distribution-2026]

## 입출력과 실시간 제어

TI 백서에 따르면 존 제어기는 여러 ECU의 논리 입출력 기능을 넘겨받고 센서와 액추에이터는 제자리에 남아, 물리 입출력과 논리 입출력이 갈린다. 실시간 제어 루프도 존 제어기로 옮길 수 있다. 제어 루프를 포함한 여러 논리 입출력 기능을 한 존 제어기에 모으면 그 요구를 모두 물려받으므로, 존 제어기의 [[microcontroller|MCU]]에는 다음이 필요하다.[@ti-spry345-2024]

- 높은 실시간 성능
- 큰 프로그램·데이터 메모리
- 가상화로 [[automotive-safety-integrity-level|ASIL]]이 서로 다른 기능을 함께 돌리는 혼합 임계도(mixed-criticality) 지원
- 백본 쪽 고속 통신 인터페이스
- 스마트 센서·액추에이터와 잇는 [[can-fd|CAN FD]]나 [[lin|LIN]] 같은 저속 통신 주변장치 여러 개[@ti-spry345-2024]

## 제품

Bosch Zone ECU는 인터페이스와 전원 출력을 아래 수까지 둘 수 있다.[@bosch-zone-ecu-2026]

| 항목                            | 최대 수 |
| ------------------------------- | ------- |
| [[ethernet\|이더넷]] 인터페이스 | 8       |
| [[can\|CAN]] 인터페이스         | 20      |
| LIN 인터페이스                  | 25      |
| 전원 출력                       | 150     |

NXP S32G2는 [[gateway#중앙 게이트웨이|중앙 게이트웨이]]와 [[ee-architecture#도메인 아키텍처|도메인 아키텍처]]뿐 아니라 존 제어기에도 쓰도록 나온 차량 네트워크 프로세서다.[@nxp-s32g2zoneconfs-2021]
