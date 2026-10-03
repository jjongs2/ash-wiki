---
title: A/B 업데이트
tags:
  - security/ota
verified: 2026-10-03
---

**A/B 업데이트**는 이미지를 담는 영역(슬롯)을 둘 두고, 한 슬롯의 이미지로 기기를 돌리는 동안 다른 슬롯에 새 이미지를 쓴 뒤 다음 부팅부터 그 슬롯으로 바꾸는 업데이트 방식이다. 새 이미지가 제대로 돌지 않으면 이전 이미지가 남은 슬롯으로 돌아갈 수 있다.[@google-android-ota-ab-2026][@nxp-an12323-2018]

## 부팅할 슬롯의 선택

[[bootloader|부트로더]]는 슬롯마다의 상태를 담은 메타데이터를 읽어 어느 슬롯으로 부팅할지 정한다.[@google-android-ota-ab-2026][@espressif-esp-idf-ota-2026]

- Android는 두 슬롯을 접미사 `_a`, `_b`로 부른다.[@google-android-ota-ab-implement-2026] 슬롯마다 부팅할 수 있는지(bootable)와 부팅에 성공했는지(successful)를 기록하고, 이 상태를 부트 제어 HAL(Hardware Abstraction Layer)로 읽고 바꾼다.[@google-android-ota-ab-2026]
- ESP-IDF는 OTA 데이터 파티션(otadata)에 다음에 부팅할 OTA 앱 파티션을 기록한다. otadata는 플래시 섹터 둘로 이루어지며, 두 섹터를 따로 지워 같은 데이터를 쓰고 둘이 다르면 카운터로 더 최근에 쓴 섹터를 고른다. 기록하는 도중 전원이 끊겨 생기는 문제를 막기 위해서다.[@espressif-esp-idf-ota-2026]
- MCUboot는 두 슬롯(primary, secondary) 각각의 끝에 둔 이미지 트레일러를 읽어 이미지를 맞바꿀지 정한다.[@mcuboot-design-2026]

## 확인 대기와 확정

새 이미지로 처음 부팅하면 곧바로 확정하지 않고 확인 대기 상태로 둔다. 새 이미지가 스스로 점검해 이상이 없으면 자신을 유효로 표시하고, 점검에 실패하거나 표시하기 전에 재부팅되면 부트로더가 이전 이미지로 돌아간다. 이를 **롤백**이라 한다.[@espressif-esp-idf-ota-2026][@mcuboot-design-2026]

- ESP-IDF는 앱 롤백 기능(`CONFIG_BOOTLOADER_APP_ROLLBACK_ENABLE`)을 켜면 새 앱을 확인 대기 상태로 부팅하고, 앱이 유효 표시 함수를 부르지 않은 채 재부팅되면 이전 앱으로 돌아간다.[@espressif-esp-idf-ota-2026]
- Android는 새 슬롯으로 부팅한 뒤 `update_verifier`의 검증이 끝나야 그 슬롯을 부팅 성공으로 표시하고, 표시 전에 부팅이 여러 번 실패하면 이전 슬롯으로 돌아간다.[@google-android-ota-ab-2026]
- MCUboot는 새 이미지를 시험(test) swap으로 맞바꾼 뒤, 이미지가 자신을 확정하지 않은 채 재부팅되면 이전 이미지로 되돌린다.[@mcuboot-design-2026]

## 장점과 비용

- 기기가 동작하는 동안 쓰지 않는 슬롯에 새 이미지를 쓸 수 있다.
- 전환에 재부팅 한 번만 들어서, 업데이트로 기기를 쓰지 못하는 시간이 짧다.[@google-android-ota-ab-2026][@nxp-an12323-2018]
- 새 이미지를 쓰다가 실패해도 부팅할 수 있는 이미지가 남는다.[@google-android-ota-ab-2026][@espressif-esp-idf-ota-2026]
- 이미지 한 벌만큼 저장 공간이 더 든다.[@nxp-an12323-2018][@google-android-ota-2026]

## 구현 예

- 일부 MCU는 플래시를 두 뱅크로 나누어, 한 뱅크에서 코드를 실행하면서 다른 뱅크를 지우고 쓸 수 있게 하고 두 뱅크의 주소를 맞바꾸는 기능을 둔다.[@st-an4767-2019][@ti-spradn2-2025]
- Android의 A/B 업데이트는 Android 7.0 Nougat에서 새 기기용 기능으로 들어왔다.[@google-android-7-0-nougat-2016] Android는 이를 seamless update라고도 부른다.[@google-android-ota-ab-2026]
- ESP-IDF는 파티션 테이블에 OTA 앱 파티션(`ota_0`, `ota_1` 등)을 둘 이상 두고, 지금 부팅 대상이 아닌 쪽에 새 이미지를 쓴다.[@espressif-esp-idf-ota-2026]

## In-place 업데이트와의 차이

NXP 앱노트는 이미지를 하나만 두고 그 자리를 새 이미지로 바꾸는 방식을 **in-place 방식**이라 부른다. 이 앱노트에 따르면 in-place 방식에서는 MCU가 동작하는 동안 업데이트할 수 없고, 업데이트가 제대로 끝나지 않으면 옛 이미지를 되찾기 어렵다.[@nxp-an12323-2018]

이미지 하나를 덮어쓰는 업데이트는 덮어쓰는 동안 평소 이미지로 동작할 수 없어, 업데이트를 맡는 별도 환경(부트로더, 복구 모드)에서 진행한다.[@nxp-an12323-2018][@google-android-ota-nonab-2026] Android의 non-A/B 업데이트는 업데이트 패키지를 받아 서명을 확인한 뒤 복구(recovery) 모드로 재부팅하고, 복구 모드에서 서명을 다시 확인한 뒤 파티션을 덮어쓴다.[@google-android-ota-nonab-2026]
