---
title: 배터리 모니터 IC
tags:
  - applications/battery-charging
aliases:
  - Battery monitor
  - Battery cell controller
verified: 2026-11-20
---

**배터리 모니터 IC**는 직렬로 이은 셀 여러 개의 전압과 온도를 재고 [[cell-balancing|셀 밸런싱]]을 하는 IC다. HEV(hybrid electric vehicle)와 EV(electric vehicle)의 [[battery-management-system|BMS]]에 쓰인다.[@nxp-mc33771c-2024] 여러 개를 데이지 체인으로 이어 쓰고, IC 사이의 통신을 절연한다.[@ti-bq79616-q1-2026][@adi-adbms6830b-2024]

## 쓰는 곳

배터리 모니터 IC는 고전압 배터리 팩뿐 아니라 48 V 배터리에도 쓰인다.[@st-l9963e-2022] TLE9012DQU는 12 V 리튬이온 배터리도 응용으로 든다.[@infineon-tle9012dqu-2023]

TI의 BMS 동향 백서에 따르면 LFP(lithium-iron phosphate) 셀은 NMC(nickel manganese cobalt) 셀보다 방전 곡선이 평평해, EV의 주행 가능 거리를 판단하려면 셀 전압을 더 정밀하게 재야 한다.[@ti-slyy218-2022]

## 데이지 체인

TI의 BMS [[functional-safety|기능 안전]] 백서에 따르면 고전압 팩에서는 모니터 IC 여러 개를 쌓아 IC마다 셀 여러 개를 나란히 재고, 명령과 데이터를 절연된 통신 인터페이스로 IC에서 IC로 넘긴다.[@ti-sliy006-2020]

| 제품       | 셀 수    | 절연 방식                           | 체인 통신                                                                                                                                          |
| ---------- | -------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| BQ7961x-Q1 | 6\~16    | 커패시터만, 커패시터와 초크, 변압기 | -[@ti-bq79616-q1-2026]                                                                                                                             |
| MC33771C   | 7\~14    | -                                   | 절연된 2.0 Mbit/s 차동 통신, 노드 63개까지[@nxp-mc33771c-2024]                                                                                     |
| TLE9012DQU | 12개까지 | -                                   | 절연 데이지 체인 인터페이스 iso UART(universal asynchronous receiver-transmitter), 2 Mbit/s, 38개까지[@infineon-tle9012dqu-2023][@ti-slyy197-2020] |
| ADBMS6830B | 16개까지 | 커패시터나 변압기                   | isoSPI(절연 직렬 포트), 2 Mbit/s[@adi-adbms6830b-2024]                                                                                             |
| L9963E     | 4\~14    | 변압기, 커패시터                    | 절연 [[serial-communication\|직렬 통신]], 2.66 Mbit/s[@st-l9963e-2022]                                                                             |
| ISL78714   | 14개까지 | 커패시터나 변압기                   | 독자 2선 데이지 체인, 1 Mbit/s까지, 마스터에 29개를 더[@renesas-isl78714-2026]                                                                     |

MC33771C는 측정값을 SPI(Serial Peripheral Interface)나 TPL(Transformer physical layer)로 [[microcontroller|MCU]]에 보낸다.[@nxp-mc33771c-2024]

ADBMS6830B는 고전압 배터리 팩에 쌓아 쓰는 모니터로, 여러 개를 데이지 체인으로 이으면 호스트 프로세서와는 한 곳에서 이어진다. ADBMS6830B의 isoSPI는 꼬임쌍선 한 쌍을 구간마다 20 m까지 쓴다.[@adi-adbms6830b-2024]

LTC6820은 절연된 두 장치 사이의 SPI 통신을 꼬임쌍선 한 쌍으로 양방향으로 잇는 isoSPI 인터페이스 칩이다. 논리 상태를 신호로 바꿔 절연 장벽 너머의 다른 LTC6820으로 보내고, 절연 장벽에는 간단한 펄스 변압기를 쓸 수 있다.[@adi-ltc6820-2019]

ISL78714의 흔한 구성에서는 마스터 ISL78714 하나가 SPI로 호스트 MCU와 통신하고, 나머지를 데이지 체인으로 잇는다.[@renesas-isl78714-2026]

데이지 체인을 양방향으로 돌릴 수 있게 해, 통신 경로 중간에 [[fault-error-failure|fault]]가 생겨도 반대 방향으로 통신을 이어 가게 하는 제품이 있다.[@adi-adbms6830b-2024] BQ7961x-Q1에서는 선택 기능인 링 연결이, 케이블이 끊겼을 때 데이지 체인의 통신 방향을 뒤집게 한다.[@ti-bq79616-q1-2026]

![[diagrams/battery-monitor-daisy-chain-ring.svg]]

BQ7961x-Q1의 데이지 체인은 [[differential-signaling|차동 신호]]로 전자기 내성을 높이고, 비트마다 그 보수(complement)를 함께 보내 직류 성분 없이 반이중으로 주고받는다. 장치마다 통신을 다시 클럭해, 먼 거리에서도 통신의 무결성을 지킨다.[@ti-bq79616-q1-2026]

## 측정과 fault 알림

측정 경로를 이중으로 두는 제품이 있다.[@st-l9963e-2022] ADBMS6830B는 ADC(analog-to-digital converter) 둘로 모든 셀을 동시에, 중복해 잰다.[@adi-adbms6830b-2024] TLE9012DQU는 같은 평균 필터 특성을 가진 보조 ADC를 종단 간 [[safety-mechanism|안전 메커니즘]]으로 둔다.[@infineon-tle9012dqu-2023] L9963E는 완전히 중복된 셀 측정 경로를 둔다.[@st-l9963e-2022] BQ7961x-Q1은 ADC 측정과 따로 도는 과전압·저전압 하드웨어 비교기와 과온·저온 하드웨어 비교기를 두어, 셀 전압과 써미스터 온도의 2차 보호에 쓸 수 있게 한다.[@ti-bq79616-q1-2026]

BQ7961x-Q1은 체인 안의 장치가 fault를 찾으면 그 정보를 응답 프레임에 실어 맨 아래 장치로 보내고, 맨 아래 장치가 fault 핀으로 시스템에 인터럽트를 걸도록 설정할 수 있다. fault 정보를 응답 프레임에 싣기 때문에, fault를 빨리 알리려고 꼬임쌍선 케이블과 절연을 따로 더하지 않아도 된다.[@ti-bq79616-q1-2026]

MC33771C는 전류도 재고, [[state-of-charge#쿨롱 카운팅|쿨롱 카운팅]]을 위해 전류를 재는 ADC2의 변환마다 내부 카운터를 늘려 전류 표본의 이산 적분을 레지스터에 둔다.[@nxp-mc33771c-2024] L9963E도 쿨롱 카운터를 갖추고, 이를 팩 과전류 검출에도 쓴다.[@st-l9963e-2022]

## 기능 안전

MC33771C는 [[safety-element-out-of-context|SEooC]]로, [[automotive-safety-integrity-level|ASIL]] C에 맞게 개발됐다. 다만 시스템 통합자가 safety manual이 권하는 안전 메커니즘을 모두 쓰고 safety manual이 정한 사용 조건과 가정한 요구사항을 채우면 [[iso-26262|ISO 26262]]의 [[hardware-architectural-metrics|hardware architectural metrics]]를 채울 수 있어, ASIL D 기능을 하는 시스템에도 쓸 수 있다.[@nxp-mc33771c-2024] TLE9012DQU는 ASIL D까지의 [[safety-requirement|안전 요구사항]]을 위한 SEooC다.[@infineon-tle9012dqu-2023]
