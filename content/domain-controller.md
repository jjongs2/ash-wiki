---
title: 도메인 제어기
tags:
  - hardware/ee-architecture
aliases:
  - DCU
verified: 2026-11-07
---

**도메인 제어기**(domain controller)는 [[ee-architecture#도메인 아키텍처|도메인 아키텍처]]에서 파워트레인, 바디처럼 기능 도메인 하나의 기능을 모아 다스리는 제어기로, 그 도메인의 [[electronic-control-unit|ECU]]들이 그 아래에 붙어 계층을 이룬다.[@renesas-ipd-power-distribution-2025][@ti-sszt211-2023] DCU(Domain Control Unit)라고도 부른다.[@guo-virtualisation-technologies-2025]

TI 기술 기사에 따르면 도메인 제어기는 [[gateway|게이트웨이]] 기능을 품어, 도메인 안의 ECU 사이와 도메인과 차량의 나머지 사이로 데이터를 넘긴다.[@ti-sszt211-2023] NXP의 2017년 백서에 따르면 센서 데이터 처리와 알고리즘을 도메인 제어기가 맡을 수 있어, 그 아래 ECU는 덜 강력한 마이크로컨트롤러를 쓸 수 있다.[@nxp-fvnecua4wp-2017]

## 도메인의 예

Renesas 백서에 따르면 파워트레인 도메인 제어기는 엔진 ECU와 변속기 ECU를 다스리고, 바디 도메인 제어기는 와이퍼, 도어 래치, 잠금, 창, 시트, 실내등처럼 차량 곳곳의 바디 기능을 다룬다.[@renesas-ipd-power-distribution-2025]

NXP 백서는 2017년에 도메인 기반 네트워크에는 도메인 제어기가 여럿 생길 것으로 보고, 그 예로 반자율·자율주행 차량을 여는 데 핵심인 ADAS(Advanced Driver Assistance Systems) 도메인 제어기를 들었다. NXP는 그 개발 플랫폼으로 BlueBox를 내놓았고, BlueBox는 카메라, 레이더, 라이다에서 오는 센서 데이터 여러 흐름을 처리하며 센서 퓨전을 지원한다.[@nxp-fvnecua4wp-2017]

## 전원망의 계층

Renesas 백서에 따르면 도메인 아키텍처와 [[ee-architecture#존 아키텍처|존 아키텍처]]에서는 통신망뿐 아니라 전원망도 계층을 이뤄, 부모 ECU가 자식 ECU의 전원 공급을 관리한다.[@renesas-ipd-power-distribution-2025]

## 제품

TI Jacinto 7 프로세서는 도메인 제어기용으로, 데이터 처리용 Arm Cortex-A72 코어, 실시간 제어용 Arm Cortex-R5F, 고속 네트워크용 기가비트 [[tsn|TSN]] [[ethernet-switch|이더넷 스위치]]를 함께 둔다.[@ti-sszt211-2023]

NXP S32G2는 서비스 지향 게이트웨이, 도메인 제어기, [[zone-controller|존 제어기]]용 프로세서에 두루 쓰도록 나온 차량 네트워크 프로세서다.[@nxp-s32g2-2026]
