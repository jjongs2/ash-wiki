---
title: E/E 아키텍처
tags:
  - network
aliases:
  - 존 아키텍처
verified: 2026-09-29
---

차량의 **E/E 아키텍처**(electrical/electronic architecture)는 기능 도메인으로 [[electronic-control-unit|ECU]]를 묶는 도메인 아키텍처에서, 차량 안의 위치로 ECU를 묶는 존 아키텍처와 소수의 중앙 컴퓨터를 쓰는 구조로 옮겨 가고 있다.[@bosch-ee-architecture-2026][@ti-spry345-2024] Renesas 백서에 따르면 ECU가 늘면서 ECU를 기능 도메인이나 차량 안의 위치로 묶어 연결을 계층화하는 방식으로 복잡도를 줄인다.[@renesas-ipd-power-distribution-2025]

## 기능별 ECU

기능마다 ECU를 따로 두는 E/E 아키텍처를 **분산 아키텍처**(distributed architecture)라 부른다.[@guo-virtualisation-technologies-2025] NXP 백서에 따르면 백서가 나온 2017년 무렵 차량 네트워크의 ECU는 대개 엔진 제어, 윈도 리프터, 전동 조향처럼 응용 하나만 맡았고, 센서 처리와 알고리즘도 그 ECU 안에서 돌았다.[@nxp-fvnecua4wp-2017]

ECU 수가 늘수록 전원 분배, 네트워크, 배선이 복잡해진다.[@ti-spry345-2024][@renesas-ipd-power-distribution-2025]

## 도메인 아키텍처

ECU는 파워트레인, 섀시, 바디, 인포테인먼트 같은 기능 도메인으로 나뉜다. **도메인 아키텍처**는 도메인마다 **도메인 제어기**(domain controller)를 두어 그 도메인의 기능을 모으고, 도메인 아래의 ECU는 도메인 제어기에 붙어 계층을 이룬다.[@renesas-ipd-power-distribution-2025][@ti-sszt211-2023] 도메인 제어기는 DCU(Domain Control Unit)라고도 부른다.[@guo-virtualisation-technologies-2025]

도메인마다 네트워크가 다를 수 있어 [[gateway|게이트웨이]]가 도메인 사이를 잇고, [[gateway#중앙 게이트웨이|중앙 게이트웨이]] 모듈이 여러 도메인에 붙는다.[@ti-sszt211-2023][@nxp-autogwdevwpus-2018] NXP 백서에 따르면 도메인 기반 네트워크에서는 [[ethernet|이더넷]]이 도메인 제어기들을 잇는 통신 백본이 된다. 센서 데이터 처리와 알고리즘을 도메인 제어기가 맡을 수 있어, 그 아래 ECU는 덜 강력한 마이크로컨트롤러를 쓸 수 있다.[@nxp-fvnecua4wp-2017]

## 존 아키텍처

**존 아키텍처**(zonal architecture)는 ECU를 기능 도메인이 아니라 차량 안의 물리적 위치로 묶는다.[@renesas-ipd-power-distribution-2025][@ti-sszt211-2023] 차량을 여러 구역으로 나누고, 구역마다 둔 존 제어기가 그 구역의 센서, 액추에이터, ECU를 중앙 컴퓨터에 잇는다.[@ti-ssztd02-2025][@infineon-zcu-2026] 존 제어기는 ZCU(Zone Control Unit)라고도 부른다.[@guo-virtualisation-technologies-2025] Infineon에 따르면 ZCU는 바디 제어 모듈이 하던 그 구역의 부하 구동을 모은다.[@infineon-zcu-2026] 존 제어기는 게이트웨이 기능을 맡고[@ti-spry345-2024][@infineon-zcu-2026], 그 구역의 전원 분배도 맡을 수 있다.[@renesas-ipd-power-distribution-2025][@infineon-zcu-2026]

TI 백서에 따르면 존 아키텍처에서 전원 분배는 중앙 집중에서 벗어나 존 모듈에 둔 스마트 퓨즈로 분산될 것이고, 시스템 설계자는 녹는 퓨즈를 반도체 퓨즈로 바꾸는 방안도 함께 따진다. 그 방안의 하나는 반도체 하이사이드 스위치를 쓰는 것이다.[@ti-spry345-2024] Renesas 백서도 도메인·존 아키텍처의 제어 장치에서는 기계식 릴레이와 퓨즈를 반도체 스위치로 바꾸기를 권한다. 모듈이 놓인 자리 때문에 사용자가 닳은 릴레이나 퓨즈를 갈기 어렵기 때문이다.[@renesas-ipd-power-distribution-2025]

존 아키텍처는 배선의 길이와 무게를 줄인다.[@bosch-ee-architecture-2026][@nxp-s32g2zoneconfs-2021] Renesas 백서에 따르면 가까이 있는 ECU를 그 구역의 존 제어기가 맡으므로 배선이 오가지 않아도 되어 배선량이 준다.[@renesas-ipd-power-distribution-2025]

존 제어기들은 고속 이더넷 백본으로 중앙 컴퓨터에 이어진다.[@bosch-ee-architecture-2026][@ti-ssztd02-2025] 기능을 모으는 소수의 강력한 중앙 컴퓨터를 HPC(High-Performance Computer)라 부르며[@mauser-mixed-criticality-2025], Bosch는 이를 차량 컴퓨터(vehicle computer)라 부른다.[@bosch-vehicle-computer-2026] 존 아키텍처는 차량 기능의 처리를 중앙 컴퓨터로 모으는 쪽으로 간다.[@ti-sszt211-2023][@bosch-zone-ecu-2026]

![[diagrams/domain-zonal-architecture.svg]]

TI 자료에 따르면 존 모듈은 스마트 센서·액추에이터와 [[can-fd|CAN FD]]나 [[lin|LIN]] 같은 저속 버스로 잇고[@ti-spry345-2024], 대역폭이 작은 바디 모듈에는 [[can|CAN]], LIN과 10 Mbit/s 이더넷([[10base-t1s|10BASE-T1S]])을 쓴다.[@ti-ssztd02-2025] Bosch Zone ECU는 이더넷 인터페이스를 최대 8개, CAN 인터페이스를 20개, LIN 인터페이스를 25개 둔다.[@bosch-zone-ecu-2026]

TI 백서에 따르면 여러 기능을 한 존 모듈에 모으면, 그 MCU는 [[automotive-safety-integrity-level|ASIL]]이 서로 다른 기능을 가상화로 함께 돌리는 혼합 임계도(mixed-criticality)를 지원해야 한다.[@ti-spry345-2024] [[iso-26262|ISO 26262]]-1:2018은 ASIL을 안전 요구와 안전 조치를 정하는 네 등급 가운데 하나로 정의하며, D가 가장 엄격하고 A가 가장 느슨하다. 또 둘 이상의 요소 사이에 안전 요구를 어기게 할 수 있는 [[safety-analysis#Dependent failure 분석|cascading failure]]가 없는 것을 [[freedom-from-interference|freedom from interference]]라 정의한다.[@iso-26262-1-obp-2018] ISO 26262-9:2018은 요소의 공존 기준에 대한 요구사항을 정한다.[@iso-26262-9-obp-2018]

## 중앙 컴퓨터

Bosch에 따르면 [[software-defined-vehicle|SDV]]는 소프트웨어를 하드웨어에서 떼어 내, 차량의 동작과 기능이 대부분 소프트웨어로 정해지는 차량이며, [[over-the-air-update|OTA]] 업데이트로 기능을 더하거나 고친다.[@bosch-software-defined-mobility-2026]

기능을 중앙 컴퓨터에 모으면 OTA 소프트웨어 업데이트로 차량 기능을 바꾸거나 더하기 쉬워진다.[@bosch-ee-architecture-2026][@ti-slyy236-2025]

Bosch의 차량 컴퓨터용 플랫폼 소프트웨어는 운영체제와, 응용 도메인을 서로 떼어 놓는 하이퍼바이저를 포함한다.[@bosch-vehicle-computer-2026] NXP S32N55는 중앙 차량 제어기용 프로세서로, 온칩 하드웨어 격리와 가상화를 두고 Type-1 하이퍼바이저를 지원한다.[@nxp-s32n55fs-2024] ISO 17978-1:2026의 HPC 정의에 붙은 Note는 ISO 17978 시리즈에서 쓰는 HPC가 대개 가상화한 게스트 시스템 여럿을 돌린다고 제시한다.[@iso-17978-1-obp-2026]

## 이행

기존 차량 플랫폼에서는 E/E 아키텍처를 한 번에 바꾸지 않고 단계적으로 옮겨 간다.[@bosch-ee-architecture-2026][@ti-slyy236-2025] Bosch에 따르면 이때는 여러 도메인을 아우르는 차량 컴퓨터를 기존 도메인 아키텍처에 넣는다. 새 플랫폼에서는 차량 컴퓨터와 존 ECU로 된 존 아키텍처를 체계적으로 구현하는 편이 이점이 가장 크다.[@bosch-ee-architecture-2026]

TI 백서에 따르면 존 아키텍처에서도 차량 기능을 다스리는 소프트웨어를 어디에 둘지는 OEM마다 다르며, 소프트웨어 제어를 모으는 방식으로는 중앙 컴퓨터에 모두 두는 것, 중앙 컴퓨터와 존 제어기가 나눠 맡는 것, 소수의 도메인 제어기와 존 제어기로 나누는 것 셋이 있다.[@ti-slyy236-2025]
