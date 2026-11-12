---
title: SBC
tags:
  - hardware/mcu-soc
verified: 2026-11-13
---

**SBC**(System Basis Chip)는 [[microcontroller|MCU]]에 전원을 주는 전압 레귤레이터, [[can-transceiver|CAN 트랜시버]], [[watchdog|watchdog]], 리셋 출력, SPI(Serial Peripheral Interface) 제어, 웨이크업을 받는 저전력 모드 같은 기능을 칩 하나에 모은 장치다.[@nxp-uja1169-2016][@infineon-tle9471-3es-2022] 제품에 따라 [[lin|LIN]] 트랜시버도 둔다.[@infineon-optireg-sbc-2026][@ti-tcan2845-q1-2025]

SBC는 차체 제어 모듈과 조명 제어 같은 차체 전장의 [[electronic-control-unit|ECU]]에 쓰인다.[@infineon-tle9263-3bqx-2026][@ti-tcan2845-q1-2025] SBC는 저전력 모드에서 웨이크업을 기다리고, MCU는 SPI로 SBC의 watchdog을 트리거한다.[@nxp-uja1169-2016][@infineon-tle9471-3es-2022]

## 쓰는 곳

NXP의 2017년 백서에 따르면 SBC 같은 통합 제품을 만드는 동기는 시스템 비용 절감이다.[@nxp-fvnecua4wp-2017] ECU의 블록을 SBC로 합치는 구성은 ECU의 [[electronic-control-unit#구성|구성]]에서 다룬다.

## 저전력 모드와 웨이크업

SBC는 전류를 줄인 저전력 모드를 두고, 버스의 웨이크업이나 웨이크업 입력 핀으로 깨어난다.[@nxp-uja1169-2016][@infineon-tle9471-3es-2022] TLE9471-3ES의 저전력 모드는 배터리에 늘 이어진 응용의 전류 소모를 줄인다.[@infineon-tle9471-3es-2022]

UJA1169의 Normal 모드에서는 V1 레귤레이터가 MCU에 전원을 주고, [[can|CAN]] 인터페이스가 통신할 수 있다. Standby 모드에서도 V1은 켜져 있지만 트랜시버는 송수신하지 않고, 원격 CAN 웨이크업을 켜 두면 수신기가 버스의 웨이크업 요청을 감시한다. Sleep 모드에서는 V1까지 끈다.[@nxp-uja1169-2016] 트랜시버의 저전력 모드와 웨이크업은 [[can-transceiver#저전력 모드와 웨이크업|CAN 트랜시버]]에서 다룬다.

## Watchdog

SBC의 watchdog은 MCU가 SPI로 트리거하고, timeout 모드와 [[watchdog#Timeout과 window|window 모드]]를 둔다.[@nxp-uja1169-2016][@infineon-tle9471-3es-2022] UJA1169는 Watchdog control register에 유효하게 쓰는 것을 트리거로 보고, MCU와 따로 된 클록으로 watchdog을 돌린다. Timeout 모드의 watchdog은 Standby나 Sleep 모드에서 MCU를 주기적으로 깨우는 데도 쓸 수 있다.[@nxp-uja1169-2016]

## Fail 출력

SBC는 failure를 알리는 fail 출력을 둔다.[@ti-tcan2845-q1-2025][@infineon-tle9471-3es-2022] UJA1169의 LIMP 핀은 ECU에 심한 failure가 났을 때 limp-home 하드웨어를 켜는 데 쓴다. 과온, watchdog 서비스 상실, 리셋 핀이나 V1 출력의 단락이 LIMP 핀을 켜는 조건에 든다.[@nxp-uja1169-2016]

## Safety SBC

FS26은 S32K3 시리즈 같은 안전 MCU를 위한 safety SBC 제품군으로, [[automotive-safety-integrity-level|ASIL]] B나 ASIL D의 응용에 쓴다. FS26은 독립된 감시 회로와 MCU 감시 전용 인터페이스, simple이나 challenger watchdog을 둔다. 시동 때 ABIST1(analog built-in self-test)과 LBIST(logical built-in self-test)를 돌리고, 요청이 있을 때 ABIST2를 돌린다. 안전 출력에는 [[hardware-architectural-metrics#Fault와 failure의 종류|latent fault]]를 검출하는 메커니즘이 있다.[@nxp-fs26-2026]

SBC 밖의 안전 전원 칩이 MCU를 감시하는 것은 [[safety-mechanism#MCU의 하드웨어 안전 메커니즘|MCU의 하드웨어 안전 메커니즘]]에서 다룬다.
