---
title: UN GTR 22
tags:
  - applications/battery-charging
aliases:
  - UN Global Technical Regulation No. 22
verified: 2026-11-20
publisher: UNECE
edition: 2022
status: 유효
---

**UN GTR 22**는 전동화 경량 차량의 차량 내 배터리 내구성에 관한 UN 세계 기술 규정이다.[@unece-gtr22-amend1-2024] 1998 협정에 따라 만든 Global Registry에 2022년 3월 9일 올랐다.[@unece-gtr22-2022]

UN GTR 22는 PEV(Pure Electric Vehicle)와 OVC-HEV(Off-vehicle Charging Hybrid Electric Vehicle)의 차량 내 배터리 내구성에 최소 성능 요구를 두고, 이를 확인하는 방법을 정한다.[@unece-gtr22-amend1-2024]

## 범위

UN GTR 22는 범주 1-1 차량과, 최대 허용 적재 질량 $m$이 $m \le 3855\,\mathrm{kg}$인 범주 1-2와 2 차량 가운데, PEV나 OVC-HEV이면서 원래 단 배터리를 그대로 단 차량에 적용한다. 체약 당사국은 해당 범주에서 질량 한도를 3500 kg으로 좁힐 수 있다. 주행 거리에 관한 조항은 인증 시험 절차로 잰 인증 주행 거리만 다룬다.[@unece-gtr22-amend1-2024]

### SOCE와 SOCR monitor

**SOCE**(State of Certified Energy)는 사용 가능 배터리 에너지를 차량 생애의 한 시점에 재거나 차량이 추정해, 인증 때의 사용 가능 배터리 에너지에 대한 백분율로 나타낸 값이다. **SOCR**(State of Certified Range)은 전기 주행 거리를 같은 방식으로 재거나 추정해, 인증 주행 거리에 대한 백분율로 나타낸 값이다.[@unece-gtr22-amend1-2024]

제조사는 차량 생애 동안 도는 SOCE monitor와 SOCR monitor를 차량에 달고, 그 추정 알고리즘을 스스로 정해야 한다. 차량이 추정한 SOCE와 SOCR은 적어도 1/100 단위의 분해능을 가져야 하고, 제조사는 가장 최근에 정한 값을 [[on-board-diagnostics|OBD]] 포트로, 선택적으로는 [[over-the-air-update|OTA]]로도 내야 한다. 소비자 정보로는 가장 최근의 SOCE를 계기판, 인포테인먼트 시스템, 원격 접근 같은 방법 가운데 하나 이상으로 차량 소유자가 쉽게 볼 수 있게 해야 한다.[@unece-gtr22-amend1-2024]

이 GTR이 monitor의 알고리즘을 정하지 않은 것은, 시장에서 쓰는 셀 화학과 배터리 관리 전략이 다양해 이를 모두 정확히 다루는 알고리즘을 정하기가 매우 복잡하기 때문이다. 대신 제조사가 추정 방법을 정하게 하고, 그 정확도는 사용 중 검증으로 확인한다.[@unece-gtr22-amend1-2024]

### 최소 성능 요구

**MPR**(Minimum Performance Requirement)은 차량 생애의 한 시점에서 내구성 조항을 지켰다고 볼 SOCE나 SOCR의 최소값이다. 제조사는 MPR보다 높은 값을 DPR(Declared Performance Requirement)로 밝힐 수 있고, 그러면 DPR이 그 제조사의 MPR을 대신한다.[@unece-gtr22-amend1-2024]

SOCE 기준 MPR은 범주 1-1과 1-2 차량에서 처음부터 5년 또는 10만 km 가운데 먼저 오는 때까지 80 %이고, 그 뒤로는 처음부터 8년 또는 16만 km 가운데 먼저 오는 때까지 70 %다. 범주 2 차량에서는 같은 두 기간에 75 %와 65 %다. 이 값은 OVC-HEV와 PEV에 같고, 체약 당사국은 두 기간 가운데 하나의 MPR만 적용할 수 있다. SOCR 기준 MPR은 비워 두었고, SOCR monitor는 장래 개정에서 그 값을 정하려고 설치해 값을 지켜본다.[@unece-gtr22-amend1-2024]

![[diagrams/un-gtr-22-soce-mpr.svg]]

### 사용 중 검증

사용 중 검증은 SOCE monitor와 SOCR monitor의 정확도를 확인하는 Part A, 배터리 내구성이 MPR을 채우는지 확인하는 Part B, 제조사가 보고하는 가상 주행 거리의 정확도를 확인하는 Part C로 나뉜다. **가상 주행 거리**는 V2X(Vehicle-to-X) 용도와 범주 2 차량의 추진 밖 용도로 방전한 에너지를 주행 거리로 환산한 값이다. V2X는 트랙션 배터리로 전력망, 집, 연결한 부하 같은 외부의 전력 수요를 대는 용도다. 제조사가 요청하면 MPR 준수를 확인하는 거리에 이 가상 주행 거리를 더한다.[@unece-gtr22-amend1-2024]

## 개정 이력

UN GTR 22는 GRPE(UNECE의 국제 차량 규정 포럼 산하의 오염·에너지 작업반)에 보고하는 EVE(전기차와 환경을 다루는 비공식 작업반)가 만들었다.[@unece-gtr22-amend1-2024][@unece-wp29-introduction-2025]

- 2022년: 원판. 3월 9일 Global Registry에 올랐다. 범주 2 차량의 SOCE 기준 MPR은 비워 두었다.[@unece-gtr22-2022]
- 2024년: Amendment 1. 6월 26일 Global Registry에 올랐다. 범주 2 차량의 SOCE 기준 MPR을 75 %와 65 %로 정하고, 가상 주행 거리를 확인하는 Part C를 더했다. 제목의 "Electrified Vehicles"를 "Electrified Light Duty Vehicles"로 바꿨다.[@unece-gtr22-amend1-2024][@unece-gtr22-2022]

## EU 규정과의 관계

EU 규정 2024/1257(Euro 7)은 범주 M1 차량의 배터리 에너지 기준 MPR을 5년 또는 10만 km까지 80 %, 그 뒤 8년 또는 16만 km까지 72 %로 둔다.[@eu-2024-1257-2024] 같은 두 기간에 UN GTR 22는 범주 1-1과 1-2 차량의 SOCE 기준 MPR을 80 %와 70 %로 둔다.[@unece-gtr22-amend1-2024] EU 규정 2024/1257의 전문은 승용차와 소형 상용차의 배터리 내구성 최소 성능 요구를 UN GTR 22를 고려해 두어야 한다고 본다.[@eu-2024-1257-2024]

EU 규정 2023/1542는 배터리의 [[state-of-health|SOH]]와 기대 수명을 판단하는 파라미터를 위임 법률로 고칠 수 있게 하고, 그 목적의 하나로 UN GTR 22의 파라미터와의 시너지를 든다.[@eu-2023-1542-2026]
