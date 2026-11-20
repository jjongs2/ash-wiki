---
title: ADAS
tags:
  - applications/adas
aliases:
  - Advanced Driver Assistance Systems
verified: 2026-11-20
---

**ADAS**(Advanced Driver Assistance Systems)는 운전자를 돕는 차량 시스템이다. 위험한 상황의 경고 같은 정보로 운전자를 돕거나, 평상 주행 때와, 충돌을 피하거나 그 심각도를 줄일 때 차량의 횡·종 방향 제어를 일시적으로나 지속적으로 돕는다. ADAS는 운전자를 돕는 것이 목적이고, 차량 제어의 책임은 늘 운전자에게 남는다.[@unece-wp29-2025-7-2024]

## 기능

NHTSA에 따르면 운전자 보조 기술에는 충돌 위험을 경고하는 것과 충돌을 피하려 직접 작동하는 것이 있다. NHTSA는 이 기술을 아래 네 갈래로 나눈다.[@nhtsa-driver-assistance-technologies-2026]

| 갈래                                       | 드는 기능                                                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 충돌 경고(collision warning)               | FCW(forward collision warning), LDW(lane departure warning), blind spot warning, rear cross traffic warning[@nhtsa-driver-assistance-technologies-2026][@nhtsa-ncap-2022] |
| 충돌 개입(collision intervention)          | AEB(automatic emergency braking), 보행자 AEB, 후진 자동 제동, 사각지대 개입[@nhtsa-driver-assistance-technologies-2026][@sae-j3016-2026]                                  |
| 운전 제어 보조(driving control assistance) | ACC(adaptive cruise control), lane centering assistance, LKA(lane keeping assistance)[@nhtsa-driver-assistance-technologies-2026][@sae-j3016-2026]                        |
| 그 밖의 시스템                             | 자동 상향등, 후방 카메라, 자동 충돌 통보[@nhtsa-driver-assistance-technologies-2026]                                                                                      |

NHTSA의 설명에 따르면 FCW는 앞차와 충돌할 가능성을 감지해 운전자에게 경고만 하고, AEB는 전방 충돌이 임박하면 자동으로 제동한다. LDW는 차로 안에서 차량의 위치를 살피다 차량이 차선에 다가가거나 차선을 넘으면 경고한다. ACC는 앞차와 미리 정한 간격을 지키도록 차속을 자동으로 조절하고, LKA는 차량이 차로를 벗어나지 않도록 자동으로 부드럽게 조향한다.[@nhtsa-driver-assistance-technologies-2026]

## 능동 안전 시스템

[[sae-j3016#개정 이력|ISO/SAE PAS 22736]]:2021은 **능동 안전 시스템**(active safety system)을, 차량 안팎의 조건을 감지·감시해 차량과 탑승자, 다른 도로 사용자에게 닥친 위험과 닥칠 수 있는 위험을 찾아내고, 운전자 경고, 차량 시스템 조정, 제동·스로틀·서스펜션 같은 하위 시스템의 능동 제어로 충돌을 피하거나 줄이도록 자동으로 개입하는 차량 시스템으로 정의한다. 이 PAS는 정의의 주석에서, 이 정의에 드는 시스템은 편의나 일반 운전 보조보다 안전 향상을 주된 설계 목적으로 두고 위험이 큰 사건이나 기동 중에 경고하거나 개입한다고 제시한다.[@iso-sae-pas-22736-obp-2021]

NHTSA에 따르면 능동 안전 시스템은 ADAS의 한 종류이고, ADAS는 임박한 위험을 예측해 피하도록 운전자를 도와 낮은 수준의 자동화를 준다.[@nhtsa-automated-vehicles-safety-2026]

[[sae-j3016|SAE J3016]]:2026은 ESC(electronic stability control)·AEB 같은 능동 안전 시스템과 LKA 같은 일부 운전자 보조 시스템, 주행 환경의 위험원을 알리거나 경고하기만 하는 시스템을 [[levels-of-driving-automation|운전 자동화 레벨]]의 분류에서 뺀다.[@sae-j3016-2026]

## EU 규정

EU 규정 2019/2144는 모든 자동차에 ISA(intelligent speed assistance), 음주 시동 잠금 장치 설치 편의(alcohol interlock installation facilitation), DDAW, ADDW, 비상 정지 신호, 후진 감지, [[un-r160|EDR]]을 갖추게 한다. M1·N1 범주에는 [[un-r152|AEBS]]와 ELKS(emergency lane-keeping system)를 더 요구하고, AEBS는 앞의 장애물과 움직이는 차량을 감지하는 첫 단계와 보행자·자전거까지 감지하는 둘째 단계로 나눠 갖추게 한다. M2·M3·N2·N3 범주에는 LDWS(lane departure warning system)와 AEBS를 요구한다.[@eu-2019-2144-2026][@eu-2021-1958-2021][@eu-2021-646-2021]

![[diagrams/eu-2019-2144-systems-by-vehicle-category.svg]]

EU 규정 2019/2144는 **ISA**를 도로 환경에 맞는 속도를 지키도록 운전자에게 피드백을 주는 시스템으로, **ELKS**를 적어도 차로 이탈이 일어나거나 일어나려 하고 충돌이 임박할 수 있을 때 차로나 도로 경계에 대해 안전한 위치를 지키도록 운전자를 돕는 시스템으로 정의한다. ISA는 끌 수 있어야 하고, 운전자가 시스템이 제시한 속도를 넘는 것을 막지 않아야 한다. AEBS와 ELKS는 운전자가 일련의 조작을 거쳐 한 번에 하나씩만 끌 수 있어야 하고, 차량 주 제어 스위치(vehicle master control switch)를 켤 때마다 정상 모드여야 한다.[@eu-2019-2144-2026]

이 규정은 **automated vehicle**을 일정 시간 운전자의 지속적인 감독 없이 스스로 움직이도록 설계·제작되었지만 운전자의 개입이 여전히 기대되거나 요구되는 자동차로, **fully automated vehicle**을 운전자의 감독 없이 스스로 움직이도록 설계·제작된 자동차로 정의한다. 두 차량에는 운전자 제어를 대신하는 시스템, 차량 상태와 주변의 실시간 정보를 주는 시스템, 운전자 가용성 모니터링 시스템, automated vehicle용 EDR, 플래투닝 같은 데이터 교환의 통일 형식, 다른 도로 사용자에게 안전 정보를 주는 시스템에 관한 기술 사양을 따르게 한다. 운전자 가용성 모니터링 시스템의 사양은 fully automated vehicle에 적용하지 않는다.[@eu-2019-2144-2026]

EU 시행 규정 2022/1426은 M, N 범주 fully automated vehicle의 [[levels-of-driving-automation#ADS|ADS]] 형식 승인에 적용하고, 정해진 구역에서 승객이나 화물을 나르는 차량과, 출발점과 도착점이 정해진 경로를 다니는 hub-to-hub 차량을 use case로 둔다. 이 규정은 **ADS**를 특정 [[operational-design-domain|ODD]]에서 DDT(Dynamic Driving Task) 전체를 지속적으로 수행할 수 있는 하드웨어와 소프트웨어로 정의한다.[@eu-2022-1426-2022] EU 시행 규정 2026/481은 2022/1426의 셋째 use case인 AVP(Automated valet parking)를 ODD 안의 주차 용도로 ADS 기능을 갖춘 차량으로 고쳐 정한다.[@eu-2026-481-2026]
