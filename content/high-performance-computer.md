---
title: HPC
tags:
  - hardware/ee-architecture
aliases:
  - 중앙 컴퓨터
  - 차량 컴퓨터
  - 중앙 컴퓨팅 플랫폼
verified: 2026-11-07
---

ISO 17978-1:2026은 **HPC**(High Performance Computer)를 차량 안에서 높은 계산 능력을 가진 장치로 정의하고, 정의의 주석에서 ISO 17978 시리즈의 HPC가 대개 가상화한 게스트 시스템 여럿을 돌린다고 제시한다.[@iso-17978-1-obp-2026]

기능을 모으는 소수의 강력한 중앙 컴퓨터를 HPC라 부른다.[@mauser-mixed-criticality-2025] Bosch는 앞으로 차량 기능을 다스릴 소수의 아주 강력한 중앙 컴퓨터를 차량 컴퓨터(vehicle computer)라 부른다. 차량 컴퓨터는 모든 도메인에 걸쳐 동작해, 따로 된 제어기들이 돌리던 파워트레인, 섀시, 운전자 보조, 인포테인먼트 같은 도메인의 여러 소프트웨어 기능을 컴퓨터 하나가 함께 돌리게 된다.[@bosch-vehicle-computer-2026] TI 기술 기사에 따르면 [[ee-architecture#존 아키텍처|존 아키텍처]]에 더하는 중앙 컴퓨터는 기능과 상관없이 모든 계산을 맡는, 처리 능력이 큰 컴퓨터다.[@ti-sszt211-2023]

2017년 NXP 백서는 여러 [[domain-controller|도메인 제어기]]를 중앙 컴퓨팅 플랫폼 하나로 합치면 발열이 커 팬이나 수랭이 필요할 수 있고, 그 중앙 컴퓨팅 플랫폼 모듈이 [[iso-26262|ISO 26262]]를 따라야 한다고 보았다. 결론에서는 단·중기에는 [[ee-architecture#도메인 아키텍처|도메인 아키텍처]]가 도입되는 쪽이 더 현실적이고, 중앙 컴퓨팅 플랫폼에는 안전, 신뢰성, 비용 같은 물음이 아직 남았다고 보았다.[@nxp-fvnecua4wp-2017] 중앙 집중 방식의 과제는 [[ee-architecture#이행|E/E 아키텍처의 이행]]에서도 다룬다.

## 칩

Renesas R-Car X5H는 ADAS(Advanced Driver Assistance Systems), 인포테인먼트, [[gateway|게이트웨이]] 기능을 칩 하나에 모아, 중앙 집중형 [[electronic-control-unit|ECU]]로 옮겨 가도록 나온 다중 도메인 칩이다. 소프트웨어 격리에 더해 하드웨어 기반 [[freedom-from-interference|freedom from interference]] 기술을 두어, 브레이크 바이 와이어 같은 안전 기능을 안전과 무관한 기능과 떼어 놓는다. 안전 기능에는 저마다 독립된 CPU 코어, 메모리, 인터페이스를 가진 이중화 영역을 따로 줄 수 있다.[@renesas-r-car-x5h-2024]

NXP S32N55는 중앙 차량 제어기용 프로세서로, 온칩 하드웨어 격리와 가상화를 두고 Type 1 하이퍼바이저를 지원한다. 공유 자원에는 QoS 장치를 두어 통합한 ECU마다 접근과 대역을 보장한다.[@nxp-s32n55fs-2024] S32N5 제품군은 여러 ECU를 한 칩에 통합할 때 ECU마다 런타임 동작 모드, 안전 정지, 리셋을 따로 다룬다.[@nxp-s32n5-2026]

## 차량 컴퓨터 플랫폼

Bosch의 차량 컴퓨터인 vehicle integration platform은 [[autosar-classic-platform|AUTOSAR Classic]], [[autosar-adaptive-platform|AUTOSAR Adaptive]], Linux 같은 차량 운영체제를 품는다. 차량 안 데이터의 중앙 허브로서 [[over-the-air-update|OTA]]·원격 기능을 위한, 차량과 백엔드를 잇는 다리 역할을 하고, 중앙 보안 게이트웨이 기능도 둔다.[@bosch-vehicle-integration-platform-2026] 차량 컴퓨터용 플랫폼 소프트웨어는 운영체제와, 응용 도메인을 서로 떼어 놓는 하이퍼바이저를 포함한다.[@bosch-vehicle-computer-2026]
