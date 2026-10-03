---
title: Secure boot
tags:
  - security
verified: 2026-10-03
---

**Secure boot**는 부팅할 때 다음에 실행할 코드([[bootloader|부트로더]], 운영체제 로더 등)의 [[digital-signature|서명]]을 확인해, 검증을 통과한 코드만 실행하게 하는 기능이다.[@uefi-spec-2-11-secure-boot-2024][@espressif-esp32-secure-boot-v2-2026]

NIST SP 800-193은 펌웨어 손상을 탐지하는 기법의 하나로, 탐지를 맡는 root of trust나 신뢰 사슬이 그 밖의 코드를 실행하기 전에 승인된 디지털 서명 알고리즘이나 [[cryptographic-hash-function|암호 해시]]로 펌웨어 코드의 무결성을 확인하는 방법을 둔다.[@nist-sp-800-193-2018] NIST SP 800-147은 시스템 BIOS(Basic Input/Output System)의 업데이트가 디지털 서명으로 진본성을 확인하는 인증된 업데이트 메커니즘이나, 선택 사항인 보안 로컬 업데이트 메커니즘을 거치게 한다.[@nist-sp-800-147-2011]

## 신뢰 사슬

부팅의 각 단계는 다음 단계의 이미지를 서명으로 검증하고, 검증을 통과해야 그 이미지로 제어를 넘긴다. 검증에 실패하면 그 이미지를 실행하지 않는다.[@espressif-esp32-secure-boot-v2-2026][@trustedfirmware-tf-a-trusted-board-boot-2026] Root of trust에 뿌리를 두고, 각 요소가 다음 요소로 제어를 넘길 때 신뢰를 이어 주는 요소의 연쇄를 **신뢰 사슬**(chain of trust)이라 한다.[@nist-sp-800-193-2018][@trustedfirmware-tf-a-trusted-board-boot-2026]

## Root of trust

**Root of trust**는 그 오동작을 탐지할 수 없어 늘 기대대로 동작하리라고 믿어야 하는 구성 요소다.[@nist-sp-800-193-2018][@tcg-glossary-1-1-2017] 신뢰 사슬의 첫 고리는 대개 root of trust다.[@nist-sp-800-193-2018][@trustedfirmware-tf-a-trusted-board-boot-2026]

NIST SP 800-193은 모든 root of trust와 신뢰 사슬을 바꿀 수 없게 두거나, 무결성을 지키는 메커니즘으로 보호하게 한다. 또 업데이트, 탐지, 복구를 맡는 root of trust를 논리 구성 요소로 나누되, 이들이 서로 다른 구성 요소일 필요는 없다고 둔다.[@nist-sp-800-193-2018]

TF-A(Trusted Firmware-A)의 Trusted Board Boot에서는 root of trust [[public-key-cryptography|공개키]](ROTPK)나 그 해시와, ROM(Read-Only Memory)에 있어 바꿀 수 없다고 가정한 첫 부트로더 BL1이 신뢰의 기점이 된다.[@trustedfirmware-tf-a-trusted-board-boot-2026]

## 구현 예

- UEFI(Unified Extensible Firmware Interface) 2.11 명세는 부트 매니저가 UEFI 이미지(운영체제 로더, 옵션 ROM, 드라이버 등)를 시작하기 전에 그 서명이 허가 서명 데이터베이스(db)에 있고 금지 서명 데이터베이스(dbx)에 없는지 확인하게 하며, 그렇지 않은 이미지는 시작하지 않게 한다. User mode에서 db와 dbx는 KEK(Key Exchange Key)나 PK(Platform Key)의 개인키로 서명한 데이터로만, KEK는 PK의 개인키로 서명한 데이터로만 고칠 수 있게 한다.[@uefi-spec-2-11-secure-boot-2024]
- TF-A의 Trusted Board Boot에서는 BL1이 ROTPK 해시로 BL2 인증서를 검증하고 BL2 이미지의 해시를 확인한 뒤 제어를 넘기며, 나머지 이미지(BL31, BL32, BL33 등)는 BL2가 인증서 사슬로 확인한다.[@trustedfirmware-tf-a-trusted-board-boot-2026]
- ESP32의 Secure Boot v2는 부트로더와 앱의 서명을 확인하고, 서명 공개키의 해시를 eFuse에 기록한다.[@espressif-esp32-secure-boot-v2-2026]

![[diagrams/uefi-secure-boot-key-databases.svg]]

![[diagrams/tf-a-trusted-board-boot-chain.svg]]

부트로더가 보안 버전이 기기에 저장된 값보다 낮은 이미지를 실행하지 않게 하는 기능은 [[rollback-protection|롤백 방지]]다.[@espressif-esp-idf-ota-2026][@google-avb-readme-2026]

## Measured boot와의 차이

부팅의 각 단계가 다음 코드로 제어를 넘기기 전에 그 코드를 측정(해시)해 기록하는 방식도 있다.[@tcg-pc-client-pfp-1-06-2023][@trustedfirmware-tf-a-measured-boot-2026] TF-A 문서는 이를 **measured boot**라 부른다.[@trustedfirmware-tf-a-measured-boot-2026]

측정의 시작점은 CRTM(Core Root of Trust for Measurement)이다.[@nist-sp-800-147-2011][@tcg-pc-client-pfp-1-06-2023] TCG PC Client Platform Firmware Profile 1.06은 플랫폼 펌웨어가 코드의 다이제스트를 TPM의 PCR(Platform Configuration Register)에 extend하고 그 측정을 이벤트 로그에 기록하게 한다.[@tcg-pc-client-pfp-1-06-2023] 부팅 측정값은 증명(attestation)에 쓰인다.[@tcg-pc-client-pfp-1-06-2023][@trustedfirmware-tf-a-measured-boot-2026]

TF-A 문서에 따르면 measured boot는 코드나 중요 데이터를 인증하지 않고 부팅 중 무엇이 있었는지 기록할 뿐이며, 측정값은 부팅 뒤 원격 검증자에게 보내 증명에 쓸 수 있다. 그래서 TF-A에서 Trusted Board Boot는 인증에 실패하면 부팅을 멈추는 데 비해, measured boot는 기록만 한다.[@trustedfirmware-tf-a-trusted-board-boot-2026][@trustedfirmware-tf-a-measured-boot-2026]
