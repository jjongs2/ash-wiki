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
- ESP-IDF(Espressif IoT Development Framework)는 [[over-the-air-update|OTA]] 데이터 파티션(`otadata`)에 다음에 부팅할 OTA 앱 파티션을 기록한다. `otadata`는 플래시 섹터 둘로 이루어지며, 두 섹터를 따로 지워 같은 데이터를 쓰고 둘이 다르면 카운터로 더 최근에 쓴 섹터를 고른다. 기록하는 도중 전원이 끊겨 생기는 문제를 막기 위해서다.[@espressif-esp-idf-ota-2026]
- MCUboot는 두 슬롯(primary, secondary) 각각의 끝에 둔 이미지 트레일러를 읽어 이미지를 맞바꿀지 정한다.[@mcuboot-design-2026]

새 이미지를 쓰기 전에는 대상 슬롯을 부팅할 수 없는 슬롯으로 표시해 두고, 다 쓴 뒤에 다시 활성 슬롯으로 돌린다.[@google-android-ota-ab-2026][@rauc-basics-2026]

## 확인 대기와 확정

새 이미지로 처음 부팅하면 곧바로 확정하지 않고 확인 대기 상태로 둔다. 새 이미지가 스스로 점검해 이상이 없으면 자신을 유효로 표시하고, 점검에 실패하거나 표시하기 전에 재부팅되면 부트로더가 이전 이미지로 돌아간다. 이를 **롤백**이라 한다.[@espressif-esp-idf-ota-2026][@mcuboot-design-2026]

![[diagrams/ab-update-slot-switch.svg]]

- ESP-IDF는 앱 롤백 기능(`CONFIG_BOOTLOADER_APP_ROLLBACK_ENABLE`)을 켜면 새 앱을 확인 대기 상태로 부팅하고, 앱이 유효 표시 함수를 부르지 않은 채 재부팅되면 이전 앱으로 돌아간다.[@espressif-esp-idf-ota-2026]
- Android는 새 슬롯으로 부팅한 뒤 `update_verifier`의 검증이 끝나야 그 슬롯을 부팅 성공으로 표시하고, 표시 전에 부팅이 여러 번 실패하면 이전 슬롯으로 돌아간다.[@google-android-ota-ab-2026]
- MCUboot는 새 이미지를 시험(test) swap으로 맞바꾼 뒤, 이미지가 자신을 확정하지 않은 채 재부팅되면 이전 이미지로 되돌린다.[@mcuboot-design-2026]

부트로더는 확정되지 않은 슬롯으로 부팅을 시도한 횟수를 세어, 정한 횟수를 다 쓰면 다른 슬롯으로 부팅한다.[@google-android-ota-ab-2026][@rauc-integration-2026] RAUC 문서는 아무것도 부팅하지 않거나 부팅한 시스템이 갑자기 멈추는 경우처럼 잘못된 부팅을 스스로 알아채지 못할 때가 많다고 보아, 부팅하는 동안 하드웨어 [[safety-mechanism#Watchdog|watchdog]]을 쓰고 부트로더가 watchdog 리셋을 부팅 실패로 보게 하기를 권한다.[@rauc-basics-2026]

## 장점과 비용

- 기기가 동작하는 동안 쓰지 않는 슬롯에 새 이미지를 쓸 수 있다.
- 전환에 재부팅 한 번만 들어서, 업데이트로 기기를 쓰지 못하는 시간이 짧다.[@google-android-ota-ab-2026][@nxp-an12323-2018]
- 새 이미지를 쓰다가 실패해도 부팅할 수 있는 이미지가 남는다.[@google-android-ota-ab-2026][@espressif-esp-idf-ota-2026]
- 이미지 한 벌만큼 저장 공간이 더 든다.[@nxp-an12323-2018][@google-android-ota-2026]
- 패키지를 내려받으면서 곧바로 대상 슬롯에 쓰는 스트리밍 설치를 하면, 패키지를 담아 둘 임시 저장 공간이 거의 들지 않는다.[@google-android-ota-ab-2026][@rauc-basics-2026]
- SWUpdate는 받은 이미지를 임시 사본 없이 대상에 바로 스트리밍해 설치할 수 있지만, 그렇게 하면 받은 소프트웨어 전체를 설치 전에 검사할 수 없다.[@swupdate-swupdate-2026]
- 기기에서 바뀌는 데이터는 슬롯 밖의 데이터 파티션에 둘 수 있다.[@mender-introduction-2026][@rauc-advanced-topics-2026]
- Android에서 A/B 업데이트는 사용자 데이터 파티션(`/data`)이 바뀐 뒤의 롤백을 지원하지 않는다. Android 10의 User Data Checkpoint는 업데이트가 실패하면 바뀐 사용자 데이터 파티션도 이전 상태로 되돌린다.[@google-android-ota-user-data-checkpoint-2026]
- RAUC 문서에 따르면 딸린 장치(모듈 보드의 마이크로컨트롤러 펌웨어 등)의 펌웨어를 루트 파일 시스템에 넣어 두고 부팅할 때 맞는 버전으로 업데이트하면, 딸린 장치가 늘 본 시스템의 버전과 짝이 맞는 버전으로 돈다. 부트로더가 본 시스템을 이전 버전으로 되돌리면 같은 방식으로 딸린 장치도 필요에 따라 다운그레이드된다.[@rauc-advanced-topics-2026]

## 구현 예

- 일부 MCU는 플래시를 두 뱅크로 나누어, 한 뱅크에서 코드를 실행하면서 다른 뱅크를 지우고 쓸 수 있게 하고 두 뱅크의 주소를 맞바꾸는 기능을 둔다.[@st-an4767-2019][@ti-spradn2-2025]
- 뱅크 주소를 맞바꾸는 MCU에서 맞바꿈 설정은 다음 리셋 때 반영되고, 실행하는 주소 범위는 맞바꾼 뒤에도 같아 코드를 복사할 필요가 없다. 플래시를 쓰고 지우는 동작은 맞바꿈 설정과 상관없이 물리 주소를 쓴다.[@infineon-aurix-tc3xx-firmware-2026][@renesas-r01an5913-2022]
- NXP의 S32K1에는 플래시 재배치(remapping)가 없고 OTA에 위치 독립 코드나 링커 관리가 필요하지만, S32K3에는 플래시 재배치가 있고 위치 독립 코드나 링커 관리가 필요 없다.[@nxp-an13414-2021]
- Renesas의 RH850/U2A-EVA OTA 앱노트는 MCU의 OTA를, 차가 멈춘 동안 받아 플래시에 쓰는 Wait OTA, 외부 플래시에 받아 두었다가 차가 멈춘 동안 MCU 안의 플래시를 고치는 Semi-non wait OTA, 한 뱅크에서 소프트웨어를 돌리면서 다른 뱅크를 고치는 Non wait OTA로 나눈다.[@renesas-r01an5913-2022]
- MCUboot는 보통 primary 슬롯의 이미지만 실행하므로, secondary 슬롯의 이미지를 실행하려면 두 이미지를 맞바꾸거나(swap) primary 슬롯을 덮어써서(overwrite) 그 내용을 primary 슬롯으로 옮긴다. direct-xip 모드에서는 두 슬롯 가운데 버전 번호가 가장 높은 이미지를 옮기지 않고 그 슬롯에서 바로 실행한다. 맞바꾸는 도중 리셋되면 이미지 트레일러의 swap status를 읽어 중단된 맞바꿈을 이어 간다.[@mcuboot-design-2026]
- Android의 A/B 업데이트는 Android 7.0 Nougat에서 새 기기용 기능으로 들어왔다.[@google-android-7-0-nougat-2016] Android는 이를 seamless update라고도 부른다.[@google-android-ota-ab-2026]
- ESP-IDF는 파티션 테이블에 OTA 앱 파티션(`ota_0`, `ota_1` 등)을 둘 이상 두고, 지금 부팅 대상이 아닌 쪽에 새 이미지를 쓴다.[@espressif-esp-idf-ota-2026]

RFC 9019는 부트로더가 새 펌웨어를 무효로 판단했을 때 회복하는 길을 둘로 본다. 다른 유효한 펌웨어를 고르거나, 새로 유효한 펌웨어를 받는 것이다. 위치 독립 코드를 쓰지 않는 저가형 IoT 기기에서는 부트로더가 새로 받은 이미지를 옛 이미지 자리로 옮겨 쓰거나(그 반대도), 위치마다 다른 펌웨어 판을 준비해야 한다고 본다.[@ietf-rfc-9019-2021]

## Virtual A/B

**Virtual A/B**는 부팅에 꼭 필요한 파티션만 물리 슬롯을 둘 두고, 나머지 파티션(dynamic partition)에는 새 데이터를 압축 스냅샷으로 써서 슬롯이 둘 있는 것처럼 동작하게 하는 Android의 업데이트 방식이다. 모든 파티션을 두 벌씩 두던 legacy A/B보다 저장 공간이 덜 든다.[@google-android-ota-2026] 새 데이터는 스냅샷에 쓰고, 새 슬롯으로 부팅에 성공한 것을 확인한 뒤 기준 파티션(base partition)에 병합한다. 병합하는 도중 재부팅되면 재부팅 뒤 병합을 이어 간다. Android 11 이상으로 출시하는 기기에서 Virtual A/B는 GMS(Google Mobile Services) 요구사항이다.[@google-android-ota-ab-2026][@google-android-ota-virtual-ab-2026]

![[diagrams/android-virtual-ab-snapshot.svg]]

## In-place 업데이트와의 차이

NXP 앱노트는 이미지를 하나만 두고 그 자리를 새 이미지로 바꾸는 방식을 **in-place 방식**이라 부른다. 이 앱노트에 따르면 in-place 방식에서는 MCU가 동작하는 동안 업데이트할 수 없고, 업데이트가 제대로 끝나지 않으면 옛 이미지를 되찾기 어렵다.[@nxp-an12323-2018]

이미지 하나를 덮어쓰는 업데이트는 덮어쓰는 동안 평소 이미지로 동작할 수 없어, 업데이트를 맡는 별도 환경(부트로더, 복구 모드)에서 진행한다.[@nxp-an12323-2018][@google-android-ota-nonab-2026] Android의 non-A/B 업데이트는 업데이트 패키지를 받아 [[digital-signature|서명]]을 확인한 뒤 복구(recovery) 모드로 재부팅하고, 복구 모드에서 서명을 다시 확인한 뒤 파티션을 덮어쓴다.[@google-android-ota-nonab-2026]

이미지 한 벌에 작은 업데이트 전용 시스템을 더한 구성에서는, 업데이트가 실패하면 다시 업데이트에 성공하기 전까지 본 애플리케이션으로 돌아갈 수 없다.[@rauc-scenarios-2026][@swupdate-overview-2026] RAUC는 대칭 A/B 구성에 더해, 평소의 업데이트가 고치지 않는 rescue 슬롯을 둘 수 있다.[@rauc-scenarios-2026]

Android에서 A/B 기기는 recovery 파티션과 cache 파티션이 필요 없다. 복구 모드의 코드는 boot 파티션에 두고, 내려받은 업데이트 패키지는 data 파티션에 둔다.[@google-android-ota-ab-implement-2026] Android는 Android 15부터 non-A/B 업데이트를 deprecated로 두었다.[@google-android-ota-2026]
