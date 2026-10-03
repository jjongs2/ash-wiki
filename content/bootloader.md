---
title: 부트로더
tags:
  - platform
verified: 2026-10-03
---

**부트로더**는 전원이 켜지거나 리셋된 뒤 먼저 실행되어 하드웨어를 초기화하고, 다음 소프트웨어(응용 프로그램이나 다른 부트로더)를 시작해 제어를 넘기는 프로그램이다.[@ti-mcu-plus-sdk-am64x-bootflow-2026][@infineon-an73854-2023]

## 1단계와 2단계 부트로더

- **1단계 부트로더**는 칩 안의 ROM(Read-Only Memory)에 들어 있어 고칠 수 없고, 리셋할 때마다 실행된다. 내장 플래시가 있는 MCU에서는 1단계 부트로더가 곧바로 내장 플래시의 응용 프로그램으로 넘어가기도 한다.[@nxp-an12278-2020][@ti-sprujh3-2025]
- **2단계 부트로더**는 플래시에 두는, 고칠 수 있는 부트로더다. 1단계 부트로더가 이를 불러 실행하고, 2단계 부트로더가 실행할 응용 프로그램을 고른다.[@espressif-esp-idf-bootloader-2026][@nxp-an13843-2023]
- ESP-IDF에서는 ROM의 1단계 부트로더가 플래시에서 2단계 부트로더를 읽어 실행하고, 2단계 부트로더가 파티션 테이블을 읽어 부팅할 앱 파티션을 정한다.[@espressif-esp-idf-startup-2026]

## 업데이트에서 맡는 일

- 이미지가 여럿이면 실행할 이미지를 골라 그 시작 주소로 분기한다.[@nxp-an13843-2023][@espressif-esp-idf-startup-2026] 어느 이미지를 고르는지는 [[ab-update|A/B 업데이트]]에서 다룬다.
- 새 이미지를 실행하기 전에 검증한다.[@infineon-an73854-2023][@espressif-esp-idf-startup-2026] 서명 검증은 [[secure-boot|secure boot]]에서 다룬다.
- 새 이미지를 플래시에 쓴다.[@infineon-an73854-2023][@silabs-bootloader-fundamentals-2026]

## 응용 프로그램이 업데이트할 때와 부트로더가 할 때

- 응용 프로그램이 새 이미지를 받아 쉬는 영역에 쓰면, 다음 부팅에서 부트로더가 그 이미지를 실행하거나 실행 영역으로 옮겨 쓴다.[@silabs-bootloader-fundamentals-2026][@espressif-esp-idf-ota-2026]
- 부트로더가 다운로드와 쓰기까지 맡으면 응용 프로그램은 부트로더로 넘어가기만 한다.[@nxp-an13843-2023][@silabs-bootloader-fundamentals-2026]
- Silicon Labs의 Gecko Bootloader는 standalone 모드에서, 응용 프로그램이 SRAM(Static Random-Access Memory) 맨 아래의 공유 메모리에 명령을 써 두고 소프트웨어 리셋을 하면 그 명령을 보고 업데이트 모드에 들어가 통신으로 받은 이미지를 플래시에 쓴다.[@silabs-gecko-bootloader-gsdk4-2026]

리셋을 거치지 않고 다른 이미지로 넘어가면, 앞서 실행한 코드가 설정한 주변 장치 레지스터가 리셋 기본값으로 돌아가지 않는다. 그래서 새 이미지가 리셋 기본값을 전제하면 예상과 다른 상태에서 시작한다.[@infineon-an73854-2023][@st-an2606-2025]

## 플래시 쓰기

TI의 C2000 flash kernel은 받은 연속 블록을 버퍼에 모으다가, 버퍼가 차거나 불연속 블록이 오면 버퍼의 내용을 플래시에 쓴다.[@ti-sprujh3-2025] 플래시를 지우거나 쓰는 동안 같은 플래시 블록(뱅크)에서 코드를 읽을 수 없는 MCU에서는 쓰기 루틴을 RAM(Random-Access Memory)이나 다른 플래시 뱅크에서 실행한다.[@ti-sprujh3-2025][@nxp-an4695-2013]

## 부트로더 자체의 업데이트

부트로더를 고쳐 쓰는 도중 전원이 끊기는 등으로 부트로더 이미지가 망가지면 기기가 부팅하지 못하게 될 수 있다.[@infineon-an73854-2023][@espressif-esp-idf-ota-2026] 바꿀 수 없는 1단계 부트로더를 두고 그 뒤의 부트로더만 고칠 수 있게 하는 구성이 쓰인다.[@ti-mcu-plus-sdk-am64x-bootflow-2026][@silabs-gecko-bootloader-about-2026] Infineon 앱노트는 현장에서 스스로를 고쳐 쓰는 부트로더를 만들 수는 있지만 복잡하므로 피하기를 권한다.[@infineon-an73854-2023]
