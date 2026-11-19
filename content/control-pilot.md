---
title: Control pilot
tags:
  - applications/battery-charging
aliases:
  - CP
verified: 2026-11-19
---

**Control pilot**(CP) 선으로는 IEC 61851-1에 따른 차량 상태를 알리고, [[iso-15118|ISO 15118-2:2014]]는 이 상태를 CP state로 정의한다.[@iso-15118-2-obp-2014] ISO 15118-1:2019는 IEC 61851-1에 맞는 pilot function에 따른 물리 신호를 basic signalling으로 정의한다.[@iso-15118-1-obp-2019]

SAE J2847/2:2023은 차량 밖 충전기가 직류를 공급하는 충전의 통신을 SAE J1772 pilot line 위의 PLC(powerline communications)로 하도록 정한다.[@sae-j2847-2-2023]

ISO 15118-3:2015는 충전 설비가 내는 CP의 nominal duty cycle을 10 %부터 96 %까지로 정의한다.[@iso-15118-3-obp-2015]

## 쓰는 곳

SAE J2847/2:2023은 SAE J1772 coupler로 차량의 충전용 에너지 저장 장치에 직류를 공급하는 차량 밖 충전기와 차량 사이의 통신을 정하고, 그 통신을 SAE J1772 pilot line 위의 PLC로 하도록 하며, PLC의 세부는 SAE J2931/4에 맡긴다.[@sae-j2847-2-2023] SAE J2931/4:2023은 이 PLC를 SAE J1772의 Control Pilot 선 위 차량 충전 응용에 맞춘 [[homeplug-green-phy|HomePlug Green PHY]]로 정한다.[@sae-j2931-4-2023]

## 동작

ISO 15118-3:2015는 충전 설비가 내는 duty cycle 가운데 5 %이거나 10 %부터 96 %까지인 것을 valid duty cycle로 정의한다. 이 부는 충전 설비 쪽에서 CP 선을 관리하는 시스템을 pilot function controller로 정의하고, CP duty cycle 같은 하드웨어 입출력 제어와 CP 선을 잇는 인터페이스도 따로 정의한다.[@iso-15118-3-obp-2015]

![[diagrams/control-pilot-duty-cycle-ranges.svg]]

TI 레퍼런스 디자인 TIDA-010939의 설계 가이드에 따르면 충전 설비는 ±12 V, 1 kHz의 PWM(pulse-width modulated) 신호를 내고, 차량이 부하 저항을 달리 걸어 떨어뜨린 CP 전압으로 아래 상태를 가려낸다.[@ti-tidufe6a-2025]

| 상태 | CP 전압 | 뜻                    |
| ---- | ------- | --------------------- |
| A    | 12 V    | 차량이 연결되지 않음  |
| B    | 9 V     | 차량이 연결됨         |
| C    | 6 V     | 충전 중               |
| D    | 3 V     | 환기가 필요한 충전 중 |
| E    | 0 V     | 오류                  |
| F    | -       | 알 수 없는 오류       |

## 이력

IEC 61851-1:2017의 Annex A는 IEC TS 62763 1판을 대체했고, 이 판은 다른 pilot function 방식을 설명하는 Annex D(informative)를 새로 넣었다.[@iec-61851-1-2017]
