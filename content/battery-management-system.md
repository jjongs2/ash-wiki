---
title: BMS
tags:
  - applications/battery-charging
aliases:
  - 배터리 관리 시스템
verified: 2026-11-20
---

**BMS**(Battery Management System)는 배터리의 전기적·열적 기능을 제어하거나 관리하고, 배터리와 차량의 다른 제어기 사이 통신을 맡는 전자 장치다.[@iso-15118-1-obp-2019] 배터리와 폐배터리에 관한 EU 규정 2023/1542는 BMS의 정의에 배터리의 [[state-of-health|SOH]]와 기대 수명을 판단하는 파라미터의 데이터를 관리하고 저장하는 일까지 넣는다.[@eu-2023-1542-2026]

TI의 BMS 동향 백서에 따르면 BMS는 HEV(hybrid electric vehicle)와 EV(electric vehicle)가 널리 쓰이면서 발전했다. 분산 BMS에서는 셀 쪽 하위 시스템이 셀마다 전압과 온도를 재고, 제어 하위 시스템이 이 정보를 모아 [[state-of-charge|SOC]]와 SOH 같은 배터리 상태를 계산한다.[@ti-slyy218-2022]

## 쓰는 곳

BMS는 배터리를 손상에서 지키고, 지능적인 충방전 알고리즘으로 배터리 수명을 늘리며, 남은 수명을 예측하고, 배터리를 동작할 수 있는 상태로 유지한다.[@ti-slyy218-2022]

## 구성

분산 BMS는 흔히 CSU(Cell Supervision Unit), BCU(Battery Control Unit), BDU(Battery Disconnect Unit)의 세 하위 시스템으로 이뤄진다. 업계는 CSU를 CSC(cell supervision circuit)나 CMU(cell monitor unit)로, BCU를 BEC(battery electrical controller), BECM(battery energy control module), BMU(battery management unit)로, BDU를 BJB(battery junction box)로도 부른다.[@ti-slyy218-2022]

CSU는 셀마다 전압과 온도를 재고, [[cell-balancing|셀 밸런싱]]으로 셀 사이의 차이를 메운다. CSU는 팩의 셀 가까이에서 [[battery-monitor-ic|배터리 모니터 IC]]의 배선을 이어, 팩의 데이터를 BCU로 보낸다. BCU는 CSU가 모은 정보에 팩의 전압과 전류를 더해, 셀마다의 상태에 따라 배터리를 어떻게 충방전할지 정한다. BCU는 절연 감시, 충돌이나 단락 때의 컨택터 제어, 온도 센서 감시, 들어온 값이 유효한지 보는 진단도 하고, 그 정보를 [[can|CAN]]으로 차량 제어 장치나 [[electronic-control-unit|ECU]]에 보낸다.[@ti-slyy218-2022]

BCU는 통신 칩과 [[microcontroller|MCU]]로 이뤄진다. 통신 칩은 CSU와 BJB의 [[battery-monitor-ic#데이지 체인|데이지 체인]] 신호를 MCU가 읽을 비트열로 바꾸고, MCU는 CSU와 BJB가 잰 값을 모두 읽어 배터리 상태를 계산하며 CSU와 BJB의 [[fault-error-failure|fault]]와 진단 결과에 대응한다.[@ti-slyy218-2022]

![[diagrams/distributed-bms-subsystems.svg]]

분산 BMS는 셀을 재는 감시 장치를 리튬이온 셀 가까이 나눠 두고, 통신 인터페이스로 주 제어기에 데이터를 보낸다.[@ti-slyy218-2022] MC33771C 데이터시트에 따르면 집중형 배터리 감시 시스템은 제어 모듈이 배선 하네스로 셀마다 차동 전압을 잰다.[@nxp-mc33771c-2024] TI의 유무선 BMS 백서에 따르면 전동화 차량의 배터리 팩은 교류 모터의 큰 부하를 감당하려고 800 V 이상까지 올라가, 리튬이온 셀 100개 이상을 차체 안에 직렬로 쌓기도 한다. 이렇게 셀 수가 많은 팩에서는 정밀한 배터리 모니터 여러 개를 따로 된 PCB(printed circuit board)에 나눠 두는 분산 배터리 팩 구성이 흔한 설계 기법이다.[@ti-slyy197-2020]

## 셀 감시와 기능 안전

TI의 BMS [[functional-safety|기능 안전]] 백서에 따르면 고전압 팩에서는 배터리 모니터 IC 여러 개를 쌓아 IC마다 셀 여러 개를 재고, 명령과 데이터를 절연된 통신 인터페이스로 IC에서 IC로 넘긴다.[@ti-sliy006-2020]

리튬이온 셀은 가장 좋은 성능과 안전을 위해, 화학마다 정해진 온도·전압 범위 안에서 동작해야 한다. 범위를 벗어나면 셀 안에서 원치 않는 부반응이 일어나 지나친 자기 발열과, 길게는 내부 단락으로 이어질 수 있다. 지나친 자기 발열과 내부 단락은 연쇄 [[un-r100#경고와 열 전파|열 폭주]]와 안전 위험의 첫 단계가 될 수 있다.[@ti-sliy006-2020]

셀이 많은 팩에는 PCB 연결이 많아, 셀과 감시 IC 사이나 IC 사이의 통신 연결에 fault가 생길 수 있다. 센서 입력이 끊기거나 통신이 끊기면 배터리 제어 시스템은 필요한 측정값을 받지 못해 팩의 셀 상태를 관리할 수 없게 된다. 통신 fault나 셀과 센서 사이 연결의 fault 같은 오동작을 찾아 위험한 사건을 막는 일은 기능 안전의 일부다.[@ti-sliy006-2020]

## 절연 감시

TI의 BMS 동향 백서에 따르면 고전압 배터리 팩의 양극·음극 단자는 운전자나 정비사를 감전에서 지키도록 차체와 충분히 떨어져 있어야 하고, 이 분리를 주기적으로 감시하는 일을 **isolation check**나 **insulation resistance monitoring**이라 부른다. 지능형 BJB에서는 BQ79731-Q1 같은 팩 모니터가 단자와 차체 사이의 저항을 재어, 분리가 허용 범위 안인지 가린다.[@ti-slyy218-2022]

ISO 6469-1:2019는 **isolation resistance monitoring system**을 live part와 전기적 섀시 사이의 절연 저항을 주기적으로나 연속으로 감시하는 시스템으로 정의한다.[@iso-6469-1-obp-2019]

## 제어기

TI의 BMS 설계 백서에 따르면 BMS 안의 MCU는 센서와 이어져 데이터를 받고, 그 정보를 차량 네트워크로 보내는 두 일을 한다. BMS의 MCU에는 기능 안전 능력이 가장 중요한 기준이고 보안도 중요해져, MCU는 [[automotive-safety-integrity-level|ASIL]] D를 지원하고 [[hardware-security-module|HSM]]을 내장해야 한다.[@ti-slyy226-2025]

[[ee-architecture|도메인·존 아키텍처]]에서 MCU 기능을 한곳에 모으면, BMS 가장자리에는 MCU가 없고 셀과 팩의 고전압 칩셋 데이터가 원시 데이터로 오간다. 그러면 인터페이스의 대역과 시간 배분을 빠듯하게 관리해야 한다. 스마트 BJB처럼 BMS 가장자리에 작은 안전 MCU를 두면, 그 MCU가 원시 데이터 대신 그 자리에서 얻은 OK/nOK 판정만 중앙 MCU로 보내 시간과 대역의 부담을 크게 줄인다.[@ti-slyy226-2025]

## 무선 BMS

TI의 유무선 BMS 백서에 따르면 유선 BMS는 배터리 모니터를 꼬임쌍선 데이지 체인 케이블로 잇고, 무선 BMS는 데이지 체인 케이블 대신 무선 통신 인터페이스를 쓴다. TI의 무선 BMS 프로토콜은 Bluetooth Low Energy 기술에 바탕을 두고 2.4 GHz 대역에서 도는 독자 프로토콜로, 중앙 장치 하나에 노드를 32개까지 붙이는 스타 네트워크 구성을 지원한다.[@ti-slyy197-2020]

TI의 BMS 동향 백서에 따르면 무선 BMS는 배터리 팩의 조립과 생산을 단순하게 한다. 케이블 하네스와 커넥터는 팩 failure의 주요 원인 가운데 하나가 될 수 있는데, 무선 BMS는 저전압 배선을 줄인다. 또 그 자체로 절연이 되어, 절연에 쓰던 변압기, 커패시터, 공통 모드 초크를 쓰지 않아도 된다.[@ti-slyy218-2022]

## 규제

[[un-r100|UN R100]] 03 시리즈는 REESS(Rechargeable Electrical Energy Storage System)의 안전 운용을 관리하는 차량 제어가 동작 중에 고장 나면 REESS나 차량 시스템이 경고를 켜는 신호를 내도록 요구하고, REESS 관리 시스템의 입출력 신호를 그런 차량 제어의 예로 든다.[@unece-r100-rev3-2022]

EU 규정 2023/1542는 2024년 8월 18일부터 전기차 배터리의 BMS가 SOH와 기대 수명을 판단하는 파라미터의 최신 데이터를 담도록 요구한다. 배터리를 적법하게 구매한 자와 그를 대리하는 제3자는 이 데이터에 차별 없이 읽기 전용으로 접근할 수 있어야 하고, 접근의 목적은 에너지 저장을 거쳐 independent aggregator나 시장 참여자에게 배터리를 내놓는 일, SOH 추정에 바탕해 잔존 가치나 남은 수명을 평가하는 일, 그리고 재사용 준비, 용도 전환 준비, 용도 전환, 재제조를 쉽게 하는 일이다. 재사용 준비나 재제조 등을 하는 사업자가 다른 BMS 소프트웨어를 올려야 할 때를 위해, BMS는 소프트웨어 리셋 기능을 갖춰야 한다.[@eu-2023-1542-2026]
