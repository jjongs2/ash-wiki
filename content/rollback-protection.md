---
title: 롤백 방지
tags:
  - security/ota
aliases:
  - Anti-rollback
verified: 2026-10-03
---

**롤백 방지**는 기기에 기록된 버전보다 오래된 버전, 곧 알려진 취약점이 있을 수 있는 이전 버전으로 되돌리는 다운그레이드를 막는 기능이다.[@google-android-verified-boot-2026][@mcuboot-design-2026] 업데이트가 실패했을 때 이전 이미지로 돌아가는 [[ab-update|롤백]]과는 다른 기능이다. 롤백은 새 이미지가 기능 점검을 통과하지 못하면 그 대신 이전에 동작하던 이미지로 돌아가는 동작이고, 롤백 방지는 정해 둔 보안 버전보다 낮은 이미지가 실행되지 않게 한다.[@espressif-esp-idf-ota-2026][@google-avb-readme-2026]

## 보안 버전과 그 저장

이미지에 보안 버전 번호를 넣고, [[bootloader|부트로더]]는 이미지의 보안 버전이 기기에 저장된 값보다 낮으면 그 이미지를 실행하지 않는다.[@espressif-esp-idf-ota-2026][@google-avb-readme-2026] 저장된 값은 OTP(One-Time Programmable) 메모리나 eFuse처럼 되돌릴 수 없는 저장소에 두기도 한다.[@espressif-esp-idf-ota-2026][@ti-sdaa376-2026] ESP32에서는 eFuse 비트를 한 번 1로 쓰면 0으로 되돌릴 수 없고, 보안 버전은 1로 쓴 비트의 수라서 올라가기만 한다.[@espressif-esp-idf-ota-2026]

보안 버전은 릴리스마다 올릴 필요는 없고, 보안 결함을 고칠 때 올린다.[@mcuboot-design-2026][@google-avb-readme-2026] 보안 버전이 같은 이미지끼리는 서로 오갈 수 있다.[@mcuboot-design-2026][@espressif-esp-idf-ota-2026] MCUboot 설계 문서는 security counter를 이미지 버전 번호와 따로 다루기를 권한다.[@mcuboot-design-2026]

## 카운터를 올리는 순서

이전 이미지로 롤백할 수 있는 구성에서는, 저장된 보안 버전을 새 이미지가 정상 동작으로 확인되어 유효로 표시된 뒤에 올린다.[@espressif-esp-idf-ota-2026][@google-avb-readme-2026] Android 문서에 따르면, 슬롯이 부팅 성공으로 표시되기 전에 롤백 방지 메타데이터를 갱신하면 업데이트가 실패해 이전 슬롯으로 돌아가도 이전 버전이 부팅되지 않는다.[@google-android-boot-flow-2026]

![[diagrams/rollback-protection-counter-update-order.svg]]

## 구현 예

- ESP-IDF의 anti-rollback은 앱 이미지의 `secure_version`을 eFuse에 둔 보안 버전과 비교하고, 앱이 유효로 표시된 뒤에 eFuse의 보안 버전을 올린다.[@espressif-esp-idf-ota-2026]
- Android Verified Boot는 VBMeta 구조체마다 rollback index를 두고, 그 값이 변조를 드러내는 저장소에 둔 값보다 작으면 이미지를 거부한다. 저장된 값은 슬롯이 부팅 성공으로 표시된 뒤에 갱신한다.[@google-avb-readme-2026]
- MCUboot는 `MCUBOOT_HW_ROLLBACK_PROT`를 켜면, 서명된 이미지의 보호 영역에 둔 security counter를 기기의 비휘발성이며 신뢰할 수 있는 구성 요소에 둔 현재 값과 비교해 그보다 작은 이미지를 거부한다.[@mcuboot-design-2026]

## 업데이트 메타데이터 쪽의 방어

[[the-update-framework|TUF]] 명세 1.0.36은 클라이언트가 새로 받은 메타데이터의 버전이 이미 믿는 메타데이터의 버전보다 낮으면 그 메타데이터를 버리고 업데이트를 멈추게 해, rollback 공격을 막는다.[@tuf-specification-1-0-36-2026]
