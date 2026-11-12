---
title: SoC
tags:
  - hardware/mcu-soc
verified: 2026-11-12
---

**SoC**(System on Chip)는 여러 칩으로 나눠 구현하던 전자 시스템의 기능을 칩 하나에 모은 집적 회로다.[@bosch-soc-glossary-2026][@nxp-fvnecua4wp-2017] Bosch에 따르면 SoC에는 CPU 코어, 메모리 컨트롤러, 입출력 인터페이스, 아날로그 프런트엔드와, 디지털 신호 프로세서나 그래픽 가속기 같은 특수 처리 장치가 흔히 들고, 전원 관리 장치와 클록 생성 회로도 흔히 넣는다. 차량용 SoC는 [[can|CAN]], [[ethernet|이더넷]], [[flexray|FlexRay]] 통신 컨트롤러를 흔히 넣는다. 차량에서 SoC는 [[electronic-control-unit|ECU]], 인포테인먼트, ADAS(Advanced Driver Assistance Systems), [[gateway|게이트웨이]] 모듈에 쓰인다.[@bosch-soc-glossary-2026]

TI Jacinto 7 SoC는 차량 [[microcontroller|MCU]]를 응용 프로세서에 넣어, 칩 안에 따로 된 MCU domain을 둔다.[@ti-spry337-2020]

## 차량에서의 쓰임

Bosch에 따르면 SoC는 레이더 처리, 센서 융합 알고리즘, 통신 프로토콜을 칩 하나에 넣어 차량 시스템을 작게 만든다.[@bosch-soc-glossary-2026] 차량용 SoC는 범용 SoC와 달리 긴 공급 기간, [[functional-safety|기능 안전]] 준수, 환경 견고성을 앞세운다. 차량용 SoC는 lockstep 코어, MPU, [[hardware-security-module|HSM]] 같은 [[safety-mechanism|안전 메커니즘]]을 선택 사항이 아니라 표준 기능으로 둔다.[@bosch-automotive-soc-glossary-2026]

ECU의 블록을 SoC로 합치는 구성은 [[electronic-control-unit#구성|ECU의 구성]]에서, 중앙 컴퓨터용 칩은 [[high-performance-computer#칩|HPC]]에서, 도메인 제어기용 칩은 [[domain-controller#제품|도메인 제어기]]에서, SoC의 하드웨어 가상화 지원은 [[hypervisor|하이퍼바이저]]에서 다룬다.

TI 백서에 따르면 ADAS나 자동차 게이트웨이처럼 복잡한 차량 임베디드 시스템은 차량 MCU에 더해 더 강력한 응용 프로세서를 두고, 계산을 둘로 나눈다. 응용 프로세서는 단일·멀티코어일 수 있고, 고수준 운영체제 하나나 여럿을 돌리며 디스플레이, 그래픽, 카메라·비전 처리를 맡는다. 차량 MCU는 wake-up MCU라고도 부르며, 응용 프로세서를 감시해 그 계산 결과를 평가하고, 차량 네트워크와의 통신과 웨이크업·대기를 맡는다.[@ti-spry337-2020]

## 도메인 분리

Jacinto 7 프로세서 제품군에는 DRA8xx와 TDA4xx SoC가 든다. Jacinto 7 SoC는 차량 MCU를 응용 프로세서에 넣어 칩을 서로 독립된 main domain과 MCU domain으로 나눈다. main domain은 마이크로프로세서와 그래픽 처리 장치 같은 고성능 계산 코어, 멀티미디어 가속기, 디지털 신호 프로세서를 포함한 비전 하드웨어 가속기와, 입출력·영상 인터페이스를 둔다. MCU domain은 흔히 외부 차량 MCU가 맡던 기능을 대신한다. 두 도메인은 전압, 전원, 클록, 리셋을 따로 두고, 하드웨어 방화벽이 둘 사이의 [[freedom-from-interference|freedom from interference]]를 보장한다.[@ti-spry337-2020]

MCU domain은 lockstep이나 split 모드로 설정하는 Arm Cortex-R5F 둘과, [[can-fd|CAN FD]] 여럿, 이더넷, 여러 입출력 주변장치를 두고, SoC 전체의 부트 마스터이자 보안 마스터다. MCU domain에는 전원을 따로 주므로, 흔한 쓰임에서는 MCU domain을 꺼 두었다가 CAN 활동이 있을 때만 깨우고, 받은 메시지에 따라 시스템 전체를 켜거나 다시 끈다.[@ti-spry337-2020]

![[diagrams/jacinto-7-main-mcu-domain.svg]]

## 코어 구성

Renesas R-Car S4, NXP S32G2, TI TDA4VM의 코어 구성은 다음과 같다.

| 제품             | 용도                       | 코어                                                                                                                            | 그 밖의 처리 장치                                                                                                                                                                                                               |
| ---------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renesas R-Car S4 | 차량 서버, 통신 게이트웨이 | 1.2 GHz Cortex-A55 여덟, lockstep으로 묶은 1.0 GHz Cortex-R52 이중 코어 하나, lockstep으로 묶은 400 MHz RH850 G4MH 이중 코어 둘 | G4MH 코어가 코드를 짧은 지연으로 실행하도록 넣은 8 MB SRAM[@renesas-r-car-s4-2026]                                                                                                                                              |
| NXP S32G2        | 차량 네트워킹              | 응용과 서비스용 Cortex-A53 넷(두 클러스터에 둘씩, 클러스터 lockstep 선택), 실시간 응용용 lockstep Cortex-M7 셋                  | 차량 네트워크를 가속하는 LLCE(Low Latency Communication Engine), 이더넷 네트워크를 가속하는 PFE(Packet Forwarding Engine), [[secure-boot\|secure boot]]와 보안 서비스를 가속하는 HSE(Hardware Security Engine)[@nxp-s32g2-2026] |
| TI TDA4VM        | 비전 인식과 분석           | Cortex-A72 둘, Cortex-R5F 여섯(분리된 MCU 서브시스템에 둘, 일반 계산 파티션에 넷)                                               | C7x 디지털 신호 프로세서 하나, C66x 디지털 신호 프로세서 둘, 3D 그래픽 처리 장치[@ti-tda4vm-2026]                                                                                                                               |

Jacinto 7의 코어 구성은 [[domain-controller#제품|도메인 제어기]]에서도 다룬다.

## 외부 차량 MCU와의 차이

TI 백서에 따르면 외부 차량 MCU는 내장 플래시를 써서 플래시가 커질수록 MCU 값이 크게 오르고, 응용 프로세서와 직렬 인터페이스 같은 외부 인터페이스로 통신한다. 이와 달리 Jacinto 7에 넣은 MCU는 외부 플래시를 쓰고, 칩 안의 IPC(inter-processor communication)로 더 빠르고 안전하게 통신한다.[@ti-spry337-2020]

![[diagrams/external-vehicle-mcu-jacinto-7-mcu.svg]]
