---
title: Telematics control unit
tags:
  - hardware/ee-architecture
  - network/v2x
aliases:
  - TCU
  - 텔레매틱스 유닛
verified: 2026-11-21
---

**TCU**(Telematics Control Unit)는 차량에 탑재되어 차량을 오가는 무선 통신을 맡는 장치로, 차량을 클라우드에 잇고, 그 쓰임에 [[ecall|eCall]]이 든다.[@ti-telematics-control-unit-2026][@infineon-telematics-control-unit-2026]

## 쓰는 곳

TCU의 쓰임으로 TI는 eCall 사고 통지, 전자 통행료 징수, 차량 추적을[@ti-telematics-control-unit-2026], Infineon은 차량과 클라우드·다른 차량·인프라 사이의 통신, 함대 관리와 정비, 도로 지원, eCall, 소비자 기기 연동을 든다.[@infineon-telematics-control-unit-2026]

TI 기술 기사(2018)에 따르면 TCU는 eCall 기능에 더해 위치 같은 데이터, [[over-the-air-update|OTA]] 업데이트, 전화 통화를 주고받는다.[@ti-sszt633-2018]

## 설계

TCU 설계는 백업 배터리에서 시작하기 좋다. 백업 배터리는 6\~20 W의 음성 출력과, GSM(Global System for Mobile) 모듈이 끌어 쓰는 약 2 A(평소 350 mA)의 최대 전류를 감당해야 한다. 백업 배터리의 화학 종류와 셀 수, 전류 능력에 따라 나머지 시스템이 정해진다. TCU의 입력 전압은 대개 4.5 V부터 최고 42 V까지 걸린다. 스위칭 레귤레이터는 차량 라디오의 AM·FM 대역을 방해하지 않아야 하므로, 스위칭 주파수를 약 2.1 MHz(AM 대역 위, FM 대역 아래)나 약 400 kHz(AM 대역 아래)에 둔다. 텔레매틱스 시스템은 앞유리, 실내, 트렁크, 엔진 같은 뜨거워지는 자리에 놓이기도 해, IC 접합 온도는 150 °C까지 견뎌야 한다.[@ti-sszt633-2018]

![[diagrams/tcu-switching-frequency-am-fm-bands.svg]]

## 차량 안 연결

기사가 나온 2018년 무렵 TCU가 헤드 유닛이나 [[gateway#중앙 게이트웨이|중앙 게이트웨이]]와 잇는 데이터 속도는 높아지고 있었고, [[can|CAN]], [[lin|LIN]], USB만 쓰던 링크는 10/100 Mbit/s와 1 Gbit/s 링크로 바뀌었다.[@ti-sszt633-2018]

## 제품 예

Infineon의 TCU 솔루션에서 차량 안 네트워크의 OTA 업데이트는 TRAVEO T2G나 AURIX [[microcontroller|MCU]]가 관리하고, 이 MCU들은 A/B swap을 위한 듀얼 뱅크 플래시와 [[hardware-security-module#EVITA의 HSM 등급|EVITA Full HSM]]을 갖춘다. 플랫폼 보안을 높이고 셀룰러 연결을 지키는 일은 별도 보안 IC인 OPTIGA [[hardware-security-module#TPM과의 차이|TPM]]이 맡는다.[@infineon-telematics-control-unit-2026]

NXP의 S32K3 Automotive T-Box는 S32K344 MCU 기반의 참조 설계로, TCU, 차량 [[gateway|게이트웨이]], 커넥티드 차량 시스템의 개발에 쓰인다. [[ethernet|이더넷]] 포트 7개, CAN/[[can-fd|CAN FD]] 포트 6개, LIN 포트 4개를 두고, 5G와 Wi-Fi 6 모듈을 골라 달 수 있다.[@nxp-s32k3-t-box-2026]

## 보안

NXP 백서(2016)에 따르면 그 무렵 흔한 차량 네트워크는 보호되지 않아, TCU나 [[on-board-diagnostics|OBD]] 포트에 들어간 공격자가 위조한 CAN 메시지를 보내 브레이크 같은 안전에 중요한 기능을 조종할 수 있었다.[@nxp-multi-layer-vehicle-security-wp-2016]

이 백서가 제시하는 첫 보호층은 TCU에 Secure Element를 붙여 보안을 더한다. Secure Element는 셀룰러나 Wi-Fi 연결 위에 [[transport-layer-security|TLS]] 같은 바깥과의 종단 간 보안 채널을 맺는 데 쓰이고, 키와 인증서를 지키는 금고 구실도 한다. 둘째 보호층에서는 중앙 게이트웨이 [[electronic-control-unit|ECU]]가 TCU와 OBD를 나머지 네트워크와 갈라 놓고, 차량 네트워크를 [[gateway#네트워크 분리|기능 도메인]]으로 나눈다.[@nxp-multi-layer-vehicle-security-wp-2016]

![[diagrams/tcu-gateway-protection-layers.svg]]
