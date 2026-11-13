---
title: 플래시 메모리
tags:
  - hardware/mcu-soc
verified: 2026-11-13
---

**플래시 메모리**는 전기로 지우고 다시 쓸 수 있는 비휘발성 메모리로, [[microcontroller|MCU]] 안에서는 실행할 코드나 데이터를 담는다.[@ti-spnu499c-2018][@nxp-an4695-2013]

NXP 앱노트 AN4695에 따르면 운용 중에 소프트웨어로 플래시를 지우고 다시 쓸 수 있으면 [[bootloader|부트로더]]로 응용 소프트웨어를 업그레이드하거나 중요한 데이터를 저장할 수 있다. 플래시는 블록마다 그 블록을 읽고, 쓰고, 지우는 회로를 두고, 대부분의 플래시 기술은 한 블록에서 지우거나 쓰는 동안 같은 블록을 읽지 못한다.[@nxp-an4695-2013]

## 코드 플래시와 데이터 플래시

MCU의 온칩 플래시는 프로그램을 두는 코드 플래시와 데이터를 두는 데이터 플래시로 나뉘기도 한다.[@infineon-aurix-tc3xx-memory-maps-training-2020][@nxp-an11983-2019] Infineon AURIX TC3xx는 코드 플래시 PFlash와 데이터 플래시 DFlash를 두고, DFlash의 한 영역인 UCB(User Configuration Block)에 칩 고유 식별자와 trimming 데이터 같은 보호 데이터를 둔다.[@infineon-aurix-tc3xx-memory-maps-training-2020]

Infineon AURIX TC3xx는 PFlash 뱅크들과 DFlash를 크로스바 인터커넥트의 저마다 다른 인터페이스로 병렬로 읽고, PFlash 뱅크마다 prefetch buffer를 두어 읽기 처리량을 높인다.[@infineon-aurix-tc3xx-nvm-training-2020]

NXP S32K1xx는 주로 프로그램을 두는 P-Flash 블록과, 설정에 따라 주로 데이터를 두는 D-flash나 EEPROM emulation의 백업 메모리(E-flash)로 쓰는 FlexNVM 블록을 따로 둔다. P-Flash에도 데이터를 담을 수 있고, D-flash에도 P-Flash처럼 명령어와 데이터를 모두 담을 수 있다.[@nxp-an11983-2019]

## 쓰기와 지우기

NXP S32K1xx의 플래시는 한 번 쓴 자리를 지우지 않은 채 다시 쓰는 것(cumulative programming)을 허용하지 않는다.[@nxp-an12522-2019]

Infineon AURIX TC3xx에서는 메모리 맵 읽기를 뺀 모든 플래시 조작을 명령 시퀀스로 한다. DFlash 주소 범위에 쓰는 접근은 데이터를 그 자리에 쓰지 않고 모두 명령 시퀀스의 명령 사이클로 해석되고, PFlash 주소 범위에 쓰는 접근은 버스 오류로 거절된다. 플래시에 데이터를 쓸 때는 [[error-correction-code#메모리의 ECC|ECC]] 부호가 저절로 만들어지고, 읽을 때 그 부호가 평가된다.[@infineon-aurix-tc3xx-nvm-training-2020]

TI TMS570LS0914의 쓰기·지우기 허용 횟수는 15년 data retention을 요구할 때, 온도 $T$가 $-40\,{}^\circ\mathrm{C} \le T \le 125\,{}^\circ\mathrm{C}$인 조건에서 코드 플래시가 1000회, EEPROM emulation용 데이터 플래시(bank 7)가 100000회다.[@ti-tms570ls0914-2016]

## 뱅크와 RWW

TI TMS570LS31x/21x의 F021 플래시에서 **뱅크**(bank)는 입출력 버퍼, 데이터 경로, sense amplifier, 제어 논리를 함께 쓰는 섹터들의 묶음이다. **섹터**는 한꺼번에 지워야 하는 연속된 플래시 영역이다. F021 플래시는 한 뱅크를 쓰거나 지우는 동안 나머지 뱅크를 읽을 수 있고, suspend 명령으로 쓰기나 지우기를 잠시 멈추면 그 섹터도 읽을 수 있다.[@ti-spnu499c-2018]

NXP 앱노트 AN4695에 따르면 한 블록의 섹터를 지우거나 쓰는 동안에는, 읽는 섹터가 다르더라도 같은 블록에서 코드를 실행할 수 없다. 명령어를 가져오는 것도 읽기이기 때문이다. 이를 어기는 것을 **RWW**(read-while-write) 위반이라 하고, Kinetis 같은 MCU에서는 RWW 위반이 read collision 오류가 된다. 이를 피하려면 지우기·쓰기 루틴을 지우거나 쓰는 블록과 다른 플래시 블록에서 실행하거나, 블록이 하나뿐이거나 모든 블록을 고쳐 써야 하면 루틴의 핵심 부분을 SRAM에 옮겨 실행한다.[@nxp-an4695-2013]

![[diagrams/flash-rww-violation-avoidance.svg]]

Renesas RH850/U2A-EVA의 double map mode는 코드 플래시 뱅크들을 valid area와 invalid area에 나눠 매핑해, valid area의 뱅크에서 프로그램을 실행하는 동안 invalid area의 뱅크를 쓰고 지울 수 있게 한다. 두 area의 뱅크는 option byte 설정으로 맞바꾼다.[@renesas-r01an5913-2022] 뱅크를 맞바꿔 소프트웨어를 고치는 방식은 [[ab-update#구현 예|A/B 업데이트]]에서 다룬다.

## EEPROM emulation

NXP 앱노트 AN11983에 따르면 EEPROM 기능은 실제 EEPROM을 두거나, 소프트웨어로 플래시에 EEPROM 기능을 구현하거나, S32K1xx처럼 펌웨어로 구현하는 세 방법으로 만든다. 소프트웨어 방식은 값이 싸지만 구현 코드와 EEPROM을 흉내 낼 공간으로 플래시를 차지하고, 펌웨어 방식은 EEPROM 기능이 사용자에게 드러나지 않고 구현 코드를 담을 플래시도 따로 필요 없다.[@nxp-an11983-2019]

S32K1xx의 EEPROM emulation은 RAM 블록인 FlexRAM을 EEPROM 공간으로 쓰고, 상태 기계가 그 데이터를 FlexNVM의 일부인 E-flash에 레코드로 백업한다. 리셋 때 EEPROM 이미지를 RAM으로 올리고, 읽기와 쓰기는 RAM에서 하며, RAM의 이미지는 플래시와 자동으로 맞춰진다. 데이터시트에 적힌 쓰기·지우기 endurance를 얻으려면 E-flash 백업 크기 $S_\mathrm{E}$와 FlexRAM의 EEPROM 영역 크기 $S_\mathrm{R}$가 $S_\mathrm{E} \ge 16\,S_\mathrm{R}$를 만족해야 한다. 응용이 쓰는 FlexRAM 주소를 줄이면 이 비가 커져 endurance가 는다. 예를 들어 S32K14x에서 4 KB FlexRAM 가운데 2 KB에만 쓰면 비가 1:16에서 1:32가 되어 쓰기·지우기 endurance가 두 배가 된다.[@nxp-an11983-2019]

![[diagrams/s32k1xx-eeprom-emulation-flexram-eflash.svg]]

TI TMS570LS31x/21x의 F021 플래시는 EEPROM 대신 쓰는 FEE(Flash EEPROM Emulation) 뱅크를 늘 bank 7에 둔다. EEPROM은 워드 단위로 지울 수 있지만 F021 플래시는 섹터 단위로만 지울 수 있다. 주 플래시 뱅크의 ECC는 CPU가 평가하고, FEE 뱅크의 ECC는 Flash Wrapper가 평가한다.[@ti-spnu499c-2018]

플래시로 EEPROM을 흉내 내는 [[autosar|AUTOSAR]] 모듈은 [[autosar-memory-stack#Fee와 Ea|AUTOSAR 메모리 스택]]에서 다룬다.
