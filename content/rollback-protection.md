---
title: 롤백 방지
tags:
  - security/ota
aliases:
  - Anti-rollback
verified: 2026-10-03
---

**롤백 방지**는 기기에 기록해 둔 버전보다 낮은 버전, 곧 알려진 [[vulnerability-management|취약점]]이 있을 수 있는 이전 버전으로 되돌리는 다운그레이드를 막는 기능이다.[@google-android-verified-boot-2026][@mcuboot-design-2026] 새 이미지가 기능 점검을 통과하지 못할 때 이전 이미지로 돌아가는 [[ab-update#확인 대기와 확정|롤백]]과 달리, 롤백 방지는 정해 둔 보안 버전보다 낮은 이미지가 실행되지 않게 한다.[@espressif-esp-idf-ota-2026][@google-avb-readme-2026]

## 차량 보안 지침의 권고

NHTSA의 2022년 모범 사례에 따르면 공격자는 소프트웨어 업데이트 메커니즘으로 더 오래되고 취약한 소프트웨어를 대상 기기에 올릴 수 있고, 이 지침은 이 공격을 firmware version rollback 공격 또는 downgrade 공격이라 부른다. NHTSA는 제조사가 firmware version rollback 공격을 줄이는 조치를 쓰기를 권한다.[@nhtsa-cybersecurity-best-practices-2022]

ENISA(EU의 [[cybersecurity|사이버보안]] 기관)의 2019년 보고서 Good practices for security of smart cars는 [[over-the-air-update|OTA]] 펌웨어 업데이트를 안전하게 해, 펌웨어가 조작되거나 드러나거나 취약한 버전으로 되돌려지는 것을 막기를 권한다.[@enisa-smart-cars-2019]

## 보안 버전과 그 저장

이미지에 보안 버전 번호를 넣고, [[bootloader|부트로더]]는 이미지의 보안 버전이 기기에 저장된 값보다 낮으면 그 이미지를 실행하지 않는다.[@espressif-esp-idf-ota-2026][@google-avb-readme-2026] 저장된 값은 OTP(One-Time Programmable) 메모리나 eFuse처럼 되돌릴 수 없는 저장소에 두기도 한다.[@espressif-esp-idf-ota-2026][@ti-sdaa376-2026] ESP32에서는 eFuse 비트를 한 번 1로 쓰면 0으로 되돌릴 수 없고, 보안 버전은 1로 쓴 비트의 수라서 올라가기만 한다.[@espressif-esp-idf-ota-2026]

보안 버전은 릴리스마다 올릴 필요는 없고, 보안 결함을 고칠 때 올린다.[@mcuboot-design-2026][@google-avb-readme-2026] 보안 버전이 같은 이미지끼리는 서로 오갈 수 있다.[@mcuboot-design-2026][@espressif-esp-idf-ota-2026] MCUboot 설계 문서는 security counter를 이미지 버전 번호와 따로 다루기를 권한다.[@mcuboot-design-2026]

## 카운터를 올리는 순서

이전 이미지로 롤백할 수 있는 구성에서는, 저장된 보안 버전을 새 이미지가 정상 동작으로 확인되어 유효로 표시된 뒤에 올린다.[@espressif-esp-idf-ota-2026][@google-avb-readme-2026] Android 문서에 따르면, 슬롯이 부팅 성공으로 표시되기 전에 롤백 방지 메타데이터를 갱신하면, 업데이트가 실패해 이전 슬롯으로 돌아가더라도 이전 버전은 부팅되지 않는다.[@google-android-boot-flow-2026]

![[diagrams/rollback-protection-counter-update-order.svg]]

## 구현 예

- ESP-IDF(Espressif IoT Development Framework)의 anti-rollback은 앱 이미지의 `secure_version`을 eFuse에 둔 보안 버전과 비교한다.[@espressif-esp-idf-ota-2026]
- Android Verified Boot는 VBMeta 구조체마다 rollback index를 두고, 그 값이 변조를 드러내는 저장소에 둔 값보다 작으면 이미지를 거부한다.[@google-avb-readme-2026]
- MCUboot는 `MCUBOOT_HW_ROLLBACK_PROT`를 켜면, [[digital-signature|서명]]된 이미지의 보호 영역에 둔 security counter를 기기의 비휘발성이며 신뢰할 수 있는 구성 요소에 둔 현재 값과 비교해 그보다 작은 이미지를 거부한다. 이미지 버전 번호를 비교하는 소프트웨어 기반 다운그레이드 방지(`MCUBOOT_DOWNGRADE_PREVENTION`)는 overwrite 방식의 이미지 업데이트(`MCUBOOT_OVERWRITE_ONLY`)를 쓸 때만 쓸 수 있다.[@mcuboot-design-2026]
- [[autosar|AUTOSAR]] R25-11 [[autosar-update-and-configuration-management|Update and Configuration Management]] 명세는 들어온 [[autosar-software-cluster#Adaptive Platform의 Software Cluster와의 차이|Software Cluster]]의 버전이 지금 있는 것보다 새롭지 않으면 ApplicationError kOldVersion을 내고 그 Software Package를 지우도록 정한다. 그래서 고장 난 Software Cluster를 예전 것으로 되돌리려면, 잘 동작하던 예전 Software Cluster를 더 높은 버전 번호로 다시 패키징해야 한다.[@autosar-ap-sws-updateandconfigurationmanagement-2025]

## 업데이트 메타데이터 쪽의 방어

[[the-update-framework|TUF]] 명세 1.0.37은 rollback 공격을 막는 점검으로, 클라이언트가 새로 받은 메타데이터의 버전이 이미 믿는 메타데이터의 버전보다 낮으면 그 메타데이터를 버리도록 정한다.[@tuf-specification-1-0-37-2026]

[[uptane|Uptane]] Deployment Best Practices 2.1.0에 따르면 Uptane은 기본적으로 업데이트를 되돌리지 못하게 하고, 이를 두 장치로 강제한다. 하나는 이전 메타데이터보다 버전 번호가 낮은 새 메타데이터를 거부해 공격자가 옛 메타데이터를 다시 보내지 못하게 한다. 다른 하나는 이전 Targets 메타데이터의 release counter보다 release counter가 낮은 새 이미지를 거부해, director repository를 침해한 공격자도 옛 이미지를 고르지 못하게 한다.[@uptane-deployment-best-practices-2-1-0-2023]

이 지침은 release counter를 올리지 않고 두는 방법은 director repository를 침해한 공격자가 낡은 이미지로 rollback 공격을 할 수 있게 하므로 쓰지 말고, ECU가 release counter가 낮은 이미지를 설치하지 않는 것이 중요할 때마다 그 이미지의 release counter를 올리는 방법을 더 안전하므로 택하기를 권한다.[@uptane-deployment-best-practices-2-1-0-2023]

RFC 9124에 따르면 IoT 기기의 펌웨어 업데이트 [[suit|매니페스트]]에는 단조 증가 시퀀스 번호를 두고, 이 번호는 펌웨어 버전이 아니라 매니페스트의 순번이다. 그래서 펌웨어 설치 권한을 가진 주체는 옛 펌웨어 버전에 더 큰 시퀀스 번호를 단 새 매니페스트를 만들어 펌웨어를 되돌릴 수 있고, 시퀀스 번호가 막는 것은 악의적 행위자가 그 주체의 정책을 어기고 펌웨어를 되돌리는 것이다. 또 안전한 시계가 있고 매니페스트에 만료 시각이 있으면, 기기는 현재 시각이 만료 시각보다 늦은 매니페스트를 거부해야 한다.[@ietf-rfc-9124-2022]
