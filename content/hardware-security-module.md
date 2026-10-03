---
title: HSM
tags:
  - security
aliases:
  - 하드웨어 보안 모듈
verified: 2026-10-03
---

**HSM**(Hardware Security Module)은 암호 키를 지키고 관리하며 암호 처리를 해 주는 물리적 컴퓨팅 장치다.[@nist-sp-800-57-pt2-r1-2019]

## 차량용 MCU의 HSM

차량용 MCU 가운데에는 HSM을 칩 안에 넣고, 그 HSM에 주 CPU와 따로 자기 프로세서, 메모리, 암호 가속기를 두는 제품이 있다.[@infineon-aurix-tc3xx-hsm-training-2020][@renesas-rh850-rcar-secure-boot-part-2-2021]

- Infineon AURIX TC3xx의 HSM은 32비트 Arm Cortex-M3 코어를 두고, AES(Advanced Encryption Standard)-128 암호, 256비트 ECC(Elliptic Curve Cryptography) 공개키 연산, SHA(Secure Hash Algorithm)-224/256 해시를 하드웨어로 가속하며 TRNG(True Random Number Generator)를 갖는다. 브리지가 방화벽 노릇을 해 HSM 안의 자원을 다른 버스 마스터의 접근에서 지킨다. 키 저장에 쓰는 데이터 플래시를 비롯한 HSM 몫의 플래시는 설정으로 HSM만 쓰게 해 주 코어의 접근을 막을 수 있다.[@infineon-aurix-tc3xx-hsm-training-2020]
- NXP S32K3는 HSE(Hardware Security Engine)라는 하드웨어 보안 서브시스템을 두고, AES-128/192/256, RSA(Rivest-Shamir-Adleman)와 ECC 암호, secure boot, 키 저장을 지원한다.[@nxp-s32kbra4-2026]
- Renesas RH850 계열에는 ICU-S와 ICU-M(Intelligent Cryptographic Unit Master) 두 가지 보안 IP가 있다. ICU-M 안에서는 별도 프로세서가 암호 가속기와 보안 플래시를 혼자 다루고, 주 CPU는 이들에 직접 닿지 못한다.[@renesas-rh850-rcar-secure-boot-part-2-2021]

![[diagrams/hsm-aurix-tc3xx-structure.svg]]

**SHE**(Secure Hardware Extension)는 HIS가 정한 온칩 보안 확장으로, 키 저장 영역과 AES 블록 암호를 두고 모든 암호 연산을 AES-128로 처리한다.[@autosar-fo-tr-securehardwareextensions-2025]

AUTOSAR R25-11의 Layered Software Architecture는 SHE나 HSM 같은 온칩 암호 장치를 [[microcontroller-abstraction-layer|MCAL]]의 Crypto Driver가 다루게 한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## EVITA의 HSM 등급

EVITA(E-safety Vehicle Intrusion proTected Applications)는 유럽 공동체 제7차 연구 프레임워크 프로그램의 공동 프로젝트로, 2008년 7월부터 2011년 12월까지 차량 온보드 네트워크의 보안 구조를 설계했다. EVITA는 충분한 처리량과 공격 저항성을 얻으려고 신뢰의 뿌리를 HSM에 두고, 서로 다른 비용 제약과 보안 요구에 맞춰 HSM을 세 등급으로 정했다.[@evita-d0-2012]

- Full HSM: V2X(Vehicle-to-X) 통신 장치나 중앙 게이트웨이처럼 차량 밖과 통신하는 자리를 위한 등급이다. 타원 곡선 암호와 해시를 하드웨어로 가속해 V2X 메시지의 서명을 빠르게 만들고 검증한다.[@evita-d1-2-5-2-2011]
- Medium HSM: 차량 안 통신을 지키는 등급이다. 대칭키 암호 엔진은 하드웨어로 두지만 비대칭 암호 엔진은 두지 않고, 시간이 급하지 않은 비대칭 연산은 소프트웨어로 처리한다.[@evita-d0-2012]
- Light HSM: ECU와 센서·액추에이터 사이의 통신을 지키는 등급이다. 센서와 액추에이터의 빠듯한 비용·효율 요구에 맞춰, 암호 엔진으로는 대칭키 암호 엔진만 둔다.[@evita-d0-2012]

## TPM과의 차이

**TPM**(Trusted Platform Module)은 컴퓨팅 플랫폼을 신뢰할 수 있게 하는 장치로, TCG가 펴내는 TPM 2.0 Library 명세가 정한다. 명세는 여러 부로 나뉘며, Part 2가 구조를, Part 3이 명령을 정한다.[@tcg-tpm-2-0-library-part-1-2026] TPM 2.0 Library 명세는 2015년에 ISO/IEC 11889:2015로도 발행됐다.[@tcg-tpm-library-specification-2026]

TPM 2.0 Library 명세(Version 185)는 PCR(Platform Configuration Register)을 측정 로그의 내용을 검증하는 데 쓰는 보호된 위치로 둔다. 측정 로그는 적어도 부팅 과정 동안 플랫폼의 보안 상태에 영향을 준 이벤트를 기록한 것이고, 명세는 TPM이 로그 항목의 다이제스트를 PCR에 누적 해시로 더하게 정한다. 명세는 또 PCR 값 같은 내부 데이터에 서명키로 서명하는 증명(attestation)을 정하고, PCR 값의 증명 명령으로 TPM2_Quote를 둔다.[@tcg-tpm-2-0-library-part-1-2026]

EVITA는 스마트카드나 TPM 같은 기성 보안 솔루션이 차량 환경을 위해 설계되지 않아, 실시간성과 비용 효율 같은 차량의 요구를 채우지 못한다고 보았다.[@evita-d0-2012]
