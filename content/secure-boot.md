---
title: Secure boot
tags:
  - security
verified: 2026-10-03
---

**Secure boot**는 부팅할 때 다음에 실행할 코드([[bootloader|부트로더]], 운영체제 로더 등)의 [[digital-signature|서명]]을 확인해, 검증을 통과한 코드만 실행하게 하는 기능이다.[@uefi-spec-2-11-secure-boot-2024][@espressif-esp32-secure-boot-v2-2026]

NIST SP 800-193은 펌웨어 손상을 탐지하는 기법의 하나로, 탐지를 맡는 root of trust나 신뢰 사슬이 그 밖의 코드를 실행하기 전에 승인된 디지털 서명 알고리즘이나 [[cryptographic-hash-function|암호 해시]]로 펌웨어 코드의 [[cybersecurity-property|무결성]]을 확인하는 방법을 둔다.[@nist-sp-800-193-2018]

## 신뢰 사슬

부팅의 각 단계는 다음 단계의 이미지를 서명으로 검증하고, 검증을 통과해야 그 이미지로 제어를 넘긴다. 검증에 실패하면 그 이미지를 실행하지 않는다.[@espressif-esp32-secure-boot-v2-2026][@trustedfirmware-tf-a-trusted-board-boot-2026] Root of trust에 뿌리를 두고, 각 요소가 다음 요소로 제어를 넘길 때 신뢰를 이어 주는 요소의 연쇄를 **신뢰 사슬**(chain of trust)이라 한다.[@nist-sp-800-193-2018][@trustedfirmware-tf-a-trusted-board-boot-2026]

## Root of trust

**Root of trust**는 그 오동작을 탐지할 수 없어 늘 기대대로 동작하리라고 믿어야 하는 구성 요소다.[@nist-sp-800-193-2018][@tcg-glossary-1-1-2017] 신뢰 사슬의 첫 고리는 대개 root of trust다.[@nist-sp-800-193-2018][@trustedfirmware-tf-a-trusted-board-boot-2026]

NIST SP 800-193은 모든 root of trust와 신뢰 사슬을 바꿀 수 없게 두거나, 무결성을 지키는 메커니즘으로 보호하게 한다. 또 업데이트, 탐지, 복구를 맡는 root of trust를 논리 구성 요소로 나누되, 이들이 서로 다른 구성 요소일 필요는 없다고 둔다.[@nist-sp-800-193-2018]

TF-A(Trusted Firmware-A)의 Trusted Board Boot에서는 root of trust [[public-key-cryptography|공개 키]](ROTPK)나 그 해시와, ROM에 있어 바꿀 수 없다고 가정한 첫 부트로더 BL1이 신뢰의 기점이 된다.[@trustedfirmware-tf-a-trusted-board-boot-2026]

Arm Platform Security Boot Guide 1.1은 리셋 직후 실행되는 첫 부트 코드를 온칩 boot ROM이나 그에 준하는 쓰기 잠금 영역, 보안 프로세서에 둔 바꿀 수 없는 부트로더로 두고, 이를 하드웨어 root of trust로 본다. 이 가이드는 ROTPK를 바꿀 수 없게 두게 하고, 잠근 온칩 플래시 섹터, secure element, 온칩 OTP(One-Time Programmable) 메모리에 둘 수 있게 한다. ROTPK를 신뢰할 수 없는 저장소에 두면, 바꿀 수 없게 둔 그 해시로 무결성을 확인해도 된다. 이 가이드는 OTP 메모리의 예로 eFuse를 든다.[@arm-den0072-2020]

## 구현 예

- UEFI(Unified Extensible Firmware Interface) 2.11 명세는 부트 매니저가 UEFI 이미지(운영체제 로더, 옵션 ROM, 드라이버 등)를 시작하기 전에 그 서명이 허가 서명 데이터베이스(db)에 있고 금지 서명 데이터베이스(dbx)에 없는지 확인하게 하며, 그렇지 않은 이미지는 시작하지 않게 한다. User mode에서 db와 dbx는 KEK(Key Exchange Key)나 PK(Platform Key)의 개인 키로 서명한 데이터로만, KEK는 PK의 개인 키로 서명한 데이터로만 고칠 수 있게 한다.[@uefi-spec-2-11-secure-boot-2024]
- TF-A의 Trusted Board Boot에서는 BL1이 ROTPK 해시로 BL2 인증서를 검증하고 BL2 이미지의 해시를 확인한 뒤 제어를 넘기며, 나머지 이미지(BL31, BL32, BL33 등)는 BL2가 인증서 사슬로 확인한다.[@trustedfirmware-tf-a-trusted-board-boot-2026]
- ESP32의 Secure Boot v2는 부트로더와 앱의 서명을 확인하고, 서명 공개 키의 해시를 eFuse에 기록한다.[@espressif-esp32-secure-boot-v2-2026]

![[diagrams/uefi-secure-boot-key-databases.svg]]

![[diagrams/tf-a-trusted-board-boot-chain.svg]]

부트로더가 보안 버전이 기기에 저장된 값보다 낮은 이미지를 실행하지 않게 하는 기능은 [[rollback-protection|롤백 방지]]다.[@espressif-esp-idf-ota-2026][@google-avb-readme-2026]

## 차량 사이버보안 지침의 권고

NHTSA의 2022년 지침(Cybersecurity Best Practices for the Safety of Modern Vehicles)은 자동차 제조사가 최신 기법을 써서, 펌웨어를 고치는 능력을 인가되고 적절히 인증된 주체로 제한하기를 권한다. 이 지침은 디지털 서명 기법을 쓰면 ECU가 변조되었거나 인가되지 않은 펌웨어 이미지로 부팅하는 것을 막을 수 있다고 본다.[@nhtsa-cybersecurity-best-practices-2022] (8.8 T.22와 그 아래 문단, 16쪽)

ENISA의 2019년 보고서 Good practices for security of smart cars는 시스템의 무결성과 진정성을 보장하는 secure boot 프로세스를 구현하기를 권하고, secure boot가 실제로 필요한 곳은 리스크 기반 접근으로 정해도 된다고 둔다. Annex C에 따르면 secure boot는 실행되는 소프트웨어의 진정성과 무결성을 보장하는 데 필수이고, 제조사가 가진 개인 키로 소프트웨어에 서명한 뒤 secure boot 과정에서 대응하는 인증서로 그 서명을 검증하는 방식이다. 소프트웨어가 바뀌어 검증에 실패하면, 차량의 [[functional-safety|기능 안전]]을 지키려고 비상 프로그램을 실행하는 것처럼 부팅 과정이 그에 맞게 대응해야 한다.[@enisa-smart-cars-2019] (첫 문장: 4.4.3 TM-20, 31쪽; 둘째·셋째 문장: Annex C의 Software security 행 "Use of secure boot mechanisms", 87쪽)

## Measured boot와의 차이

부팅의 각 단계가 다음 코드로 제어를 넘기기 전에 그 코드를 측정(해시)해 기록하는 방식도 있다.[@tcg-pc-client-pfp-1-06-2023][@trustedfirmware-tf-a-measured-boot-2026] TF-A 문서는 이를 **measured boot**라 부른다.[@trustedfirmware-tf-a-measured-boot-2026]

측정의 시작점은 CRTM(Core Root of Trust for Measurement)이다.[@tcg-pc-client-pfp-1-06-2023][@nist-sp-800-147-2011] TCG PC Client Platform Firmware Profile 1.06은 플랫폼 펌웨어가 코드의 다이제스트를 [[hardware-security-module#TPM과의 차이|TPM]]의 PCR(Platform Configuration Register)에 extend하고 그 측정을 이벤트 로그에 기록하게 한다.[@tcg-pc-client-pfp-1-06-2023] 부팅 측정값은 증명(attestation)에 쓰인다.[@tcg-pc-client-pfp-1-06-2023][@trustedfirmware-tf-a-measured-boot-2026]

TF-A 문서에 따르면 measured boot는 코드나 중요 데이터를 인증하지 않고 부팅 중 무엇이 있었는지 기록할 뿐이다. 그래서 TF-A에서 Trusted Board Boot는 인증에 실패하면 부팅을 멈추는 데 비해, measured boot는 기록만 한다.[@trustedfirmware-tf-a-trusted-board-boot-2026][@trustedfirmware-tf-a-measured-boot-2026]
