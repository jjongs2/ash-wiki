---
title: 부트로더
tags:
  - platform
verified: 2026-10-03
---

**부트로더**는 전원이 켜지거나 리셋된 뒤 먼저 실행되어 하드웨어를 초기화하고, 다음 소프트웨어(응용 프로그램이나 다른 부트로더)를 시작해 제어를 넘기는 프로그램이다.[@ti-mcu-plus-sdk-am64x-bootflow-2026][@infineon-an73854-2023]

## 1단계와 2단계 부트로더

- **1단계 부트로더**는 칩 안의 ROM에 들어 있어 고칠 수 없고, 리셋할 때마다 실행된다. 내장 플래시가 있는 MCU에서는 1단계 부트로더가 곧바로 내장 플래시의 응용 프로그램으로 넘어가기도 한다.[@nxp-an12278-2020][@ti-sprujh3-2025]
- **2단계 부트로더**는 플래시에 두는, 고칠 수 있는 부트로더다. 1단계 부트로더가 이를 불러 실행하고, 2단계 부트로더가 실행할 응용 프로그램을 고른다.[@espressif-esp-idf-bootloader-2026][@nxp-an13843-2023]
- ESP-IDF(Espressif IoT Development Framework)에서는 ROM의 1단계 부트로더가 플래시에서 2단계 부트로더를 읽어 실행하고, 2단계 부트로더가 파티션 테이블을 읽어 부팅할 앱 파티션을 정한다.[@espressif-esp-idf-startup-2026]

![[diagrams/bootloader-two-stage-boot.svg]]

## 업데이트에서 맡는 일

- 이미지가 여럿이면 실행할 이미지를 골라 그 시작 주소로 분기한다.[@nxp-an13843-2023][@espressif-esp-idf-startup-2026] 어느 이미지를 고르는지는 [[ab-update#부팅할 슬롯의 선택|A/B 업데이트]]에서 다룬다.
- 새 이미지를 실행하기 전에 검증한다.[@infineon-an73854-2023][@espressif-esp-idf-startup-2026] [[digital-signature|서명]] 검증은 [[secure-boot|secure boot]]에서 다룬다.
- 새 이미지를 플래시에 쓴다.[@infineon-an73854-2023][@silabs-bootloader-fundamentals-2026]

## 응용 프로그램이 업데이트할 때와 부트로더가 할 때

- 응용 프로그램이 새 이미지를 받아 쉬는 영역에 쓰면, 다음 부팅에서 부트로더가 그 이미지를 실행하거나 실행 영역으로 옮겨 쓴다.[@silabs-bootloader-fundamentals-2026][@espressif-esp-idf-ota-2026]
- Microchip TB3207에 따르면 응용 프로그램이 이미지를 받아 단순한 부트로더가 쓸 수 있는 저수준 꼴로 저장해 두면, 복잡한 업데이트 인터페이스를 쓰면서도 부트로더는 단순하고 작게 둘 수 있다.[@microchip-tb3207-2018]
- 부트로더가 다운로드와 쓰기까지 맡으면 응용 프로그램은 부트로더로 넘어가기만 한다.[@nxp-an13843-2023][@silabs-bootloader-fundamentals-2026]
- 부트로더가 맡는 기능이 늘면 부트로더를 작게 유지하기 어려워진다.[@infineon-an73854-2023][@microchip-tb3207-2018]
- Silicon Labs의 Gecko Bootloader는 standalone 모드에서, 응용 프로그램이 SRAM 맨 아래의 공유 메모리에 명령을 써 두고 소프트웨어 리셋을 하면 그 명령을 보고 업데이트 모드에 들어가 통신으로 받은 이미지를 플래시에 쓴다.[@silabs-gecko-bootloader-gsdk4-2026]

리셋을 거치지 않고 다른 이미지로 넘어가면, 앞서 실행한 코드가 설정한 주변 장치 레지스터가 리셋 기본값으로 돌아가지 않는다. 그래서 새 이미지가 리셋 기본값을 전제하면 예상과 다른 상태에서 시작한다.[@infineon-an73854-2023][@st-an2606-2025]

## 플래시 쓰기

부트로더는 받은 데이터를 RAM 버퍼에 담아 두었다가, 플래시가 한 번에 쓰는 단위로 플래시에 쓴다.[@ti-sprujh3-2025][@microchip-an851-2002] TI의 C2000 flash kernel은 받은 연속 블록을 버퍼에 모으다가, 버퍼가 차거나 불연속 블록이 오면 버퍼의 내용을 플래시에 쓴다.[@ti-sprujh3-2025] 플래시를 지우거나 쓰는 동안 같은 플래시 블록(뱅크)에서 코드를 읽을 수 없는 MCU에서는 쓰기 루틴을 RAM이나 다른 플래시 뱅크에서 실행한다.[@ti-sprujh3-2025][@nxp-an4695-2013]

## 부트로더 자체의 업데이트

Microchip TB3207에 따르면 USB, SD(Secure Digital) 카드, [[ethernet|이더넷]]처럼 제품 사용자가 쓰는 인터페이스까지 구현한 부트로더는, 그 프로토콜 구현의 결함을 고치거나 외부 기기의 변화에 맞추려면 부트로더 자체를 업데이트해야 한다.[@microchip-tb3207-2018] 부트로더를 고쳐 쓰는 도중 전원이 끊기는 등으로 부트로더 이미지가 망가지면 기기가 부팅하지 못하게 될 수 있다.[@infineon-an73854-2023][@espressif-esp-idf-ota-2026] 바꿀 수 없는 1단계 부트로더를 두고 그 뒤의 부트로더만 고칠 수 있게 하는 구성이 쓰인다.[@ti-mcu-plus-sdk-am64x-bootflow-2026][@silabs-gecko-bootloader-about-2026] Infineon 앱노트는 현장에서 스스로를 고쳐 쓰는 부트로더를 만들 수는 있지만 복잡하므로 피하기를 권한다.[@infineon-an73854-2023]

RFC 9019는 부트로더 업데이트가 실패하면 신뢰성이 위태로워지므로, 일반적으로 부트로더나 그 최소한의 부분은 업데이트하지 않는다고 가정한다.[@ietf-rfc-9019-2021]

RAUC는 부트로더를 이중으로 두어 되돌아가는 구성을 쓸 수 없는 플랫폼에서, 칩과 펌웨어, 저장 매체에 따라 부트로더 갱신을 원자적으로 할 수 있게 한다. 이 원자적 갱신은 갱신 중의 오류나 전원 손실로 부팅하지 못하게 되는 것을 막지만, 버그가 있는 부트로더에서 회복하지는 못한다. RAUC는 부트로더를 원자적으로 갱신하는 슬롯 종류로 아래 넷을 둔다.[@rauc-advanced-topics-2026]

- `boot-emmc`: eMMC의 boot 파티션 둘 가운데 하나를 eMMC의 설정 레지스터(`ext_csd`)로 원자적으로 켠다.
- `boot-mbr-switch`, `boot-gpt-switch`: 칩의 고정 ROM 코드가 MBR(Master Boot Record) 파티션 테이블의 첫 파티션에서 부팅하는 경우, 미리 정한 디스크 영역의 쉬는 반쪽에 새 부트로더를 쓴 뒤 첫 파티션 항목이 그 반쪽을 가리키게 MBR 전체(512바이트)를 한 번에 다시 쓴다. `boot-gpt-switch`는 GPT(GUID Partition Table)의 첫 파티션 항목을 같은 방식으로 두 반쪽 사이에서 바꾼다.[@rauc-advanced-topics-2026][@uefi-spec-2-11-gpt-2024]
- `boot-raw-fallback`: ROM 코드가 고정된 위치 여럿을 정해진 순서로 찾아 부트로더를 고르는 경우, 그 가운데 두 위치에 부트로더를 두고 쓰지 않던 위치부터 고친 뒤 다른 위치를 고친다. 위치마다 헤더를 먼저 지운 뒤 부트로더 이미지를 쓰고 헤더를 마지막에 써서, 두 위치 가운데 한 곳에는 늘 유효한 이미지가 있고 반쯤 쓴 이미지로는 부팅을 시도하지 않게 한다.[@rauc-advanced-topics-2026]

![[diagrams/rauc-boot-mbr-switch.svg]]
