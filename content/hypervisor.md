---
title: 하이퍼바이저
tags:
  - hardware/ee-architecture
aliases:
  - 가상 머신 모니터
  - VMM
verified: 2026-11-07
---

[[autosar|AUTOSAR]] R25-11 용어집은 **하이퍼바이저**를 물리 머신 하나에서 가상 머신 여럿을 제공하고 관리하는 저수준 소프트웨어로 정의한다. 하이퍼바이저는 따로 된 소프트웨어일 수도, 운영체제의 기능으로 들어 있을 수도 있다. 물리 자원은 가상 머신 하나에 전용으로 배정하거나, 하이퍼바이저가 관리하는 가상 장치를 거쳐 여러 가상 머신이 함께 쓰게 한다.[@autosar-fo-tr-glossary-2025]

가상 머신(VM, Virtual Machine)을 관리하는 하이퍼바이저는 VMM(Virtual Machine Monitor)이라고도 부른다.[@guo-virtualisation-technologies-2025] 차량에서는 여러 [[electronic-control-unit|ECU]]의 기능을 프로세서나 MCU 하나에 모으면서, 그 기능들이 [[freedom-from-interference|freedom from interference]]를 지키도록 서로 떼어 놓는 데 가상화를 쓴다.[@renesas-ecu-virtualization-2022][@nxp-s32n55fs-2024]

## 차량에서의 쓰임

중앙 집중형 [[ee-architecture|E/E 아키텍처]]에서 가상화로 하드웨어 플랫폼 하나 위에 여럿 만들어 함께 돌리는 ECU를 **virtual ECU**라 부른다.[@guo-virtualisation-technologies-2025]

Arm의 Armv8-R 가상화 가이드에 따르면, ECU마다 프로세서가 [[rtos|RTOS]]를 돌리는 차량에서 ECU의 처리를 더 적은 프로세서로 모으면 제조 비용과 공간, 차량 무게가 준다. 이렇게 통합한 시스템에서도 ECU마다 RTOS가 돌지만, 그 RTOS는 하이퍼바이저가 다스리는 하드웨어 시스템 하나 위에서, 하이퍼바이저가 관리하는 가상 머신 안의 게스트 운영체제로 돈다.[@arm-102909-2026]

Renesas는 2022년 RH850/U2x MCU와 ETAS의 하이퍼바이저 RTA-HVR을 묶은 ECU 가상화 플랫폼을 내놓았다. 이 플랫폼으로 MCU 기반의 [[ee-architecture#존 아키텍처|존]] ECU 하나에 논리 ECU 여럿을 둘 수 있다. RH850/U2x는 하이퍼바이저 하드웨어 지원과, freedom from interference를 위한 안전·보안 기능을 갖춘다. RTA-HVR은 하드웨어 가상화를 지원하는 MCU용 하이퍼바이저로, RH850/U2x의 하드웨어 가상화 기능으로 가상 머신을 하나 이상 만든다. 가상 머신끼리는 공간으로는 RH850/U2x의 memory protection unit과 guard 기능으로, 시간으로는 RTA-HVR의 VM 스케줄러로 떼어 놓는다. 가상 머신 하나는 가상 CPU 코어 하나 이상과 장치 메모리 공간의 일부, 주변장치 묶음으로 이뤄진다.[@renesas-ecu-virtualization-2022]

3세대 R-Car SoC(System on Chip)는 하이퍼바이저와 함께 쓰는 것을 전제로 설계되어, Arm CPU 코어와 그래픽 코어, 비디오·오디오 처리 블록 같은 기능에 가상화 기능이 있다. R-Car용 하이퍼바이저는 통합 콕핏과 커넥티드 카 응용에서 Linux, Android, RTOS 같은 게스트 운영체제 여럿을 칩 하나에서 서로 독립적으로 돌린다.[@renesas-rcar-virtualization-2018]

Infineon의 AURIX TC4xx MCU는 CPU 가상화와 시스템 가상화를 지원한다.[@infineon-aurix-tc4xx-overview-2025]

## 가상화의 조건

Popek과 Goldberg는 1974년 논문에서 VMM이 갖출 세 성질을 정했다. 첫째, VMM 아래에서 도는 프로그램은 원래 머신에서 바로 돌 때와 본질적으로 같은 효과를 낸다. 다만 쓸 수 있는 자원의 양과 타이밍에 따른 차이는 예외다. 둘째, 가상 프로세서 명령의 통계적으로 대부분을 VMM의 개입 없이 실제 프로세서가 바로 실행한다. 그래서 에뮬레이터와 소프트웨어 인터프리터는 가상 머신이 아니다. 셋째, VMM은 시스템 자원을 완전히 다스려, 그 아래 프로그램은 자기에게 배정되지 않은 자원에 닿지 못한다. 이 정의에서 가상 머신은 VMM이 만든 환경으로, 실제 머신의 효율적이고 격리된 복제다.[@popek-formal-requirements-1974]

감독자 모드와 사용자 모드, 재배치·경계 레지스터, 트랩을 갖추고 I/O 명령과 인터럽트는 없는 관례적인 3세대 컴퓨터 모형에서, 민감 명령이 모두 특권 명령이면 그 컴퓨터에 VMM을 만들 수 있다. **특권 명령**은 감독자 모드에서는 트랩하지 않고 사용자 모드에서는 트랩하는 명령이다. **민감 명령**은 쓸 수 있는 자원의 양이나 프로세서 모드를 바꾸는 명령과, 실행 결과가 실제 메모리에서의 위치나 모드에 따라 달라지는 명령이다. 민감하지 않은 명령은 해롭지 않은(innocuous) 명령이다. 이 조건을 갖춘 VMM은 가상 머신의 프로그램을 사용자 모드로 돌려, 해롭지 않은 명령은 하드웨어가 바로 실행하게 두고, 특권 명령이 트랩하면 그 명령의 효과를 흉내 내는 루틴으로 처리한다.[@popek-formal-requirements-1974]

## 하이퍼바이저의 갈래

하이퍼바이저는 하드웨어 위에서 바로 도는 Type-1과, 호스트 운영체제 위에서 도는 Type-2로 나뉜다.[@mauser-mixed-criticality-2025] Arm의 AArch64 가상화 가이드에 따르면 Type-1(standalone) 하이퍼바이저는 호스트 운영체제 없이 하드웨어 위에서 돌며, CPU와 물리 메모리를 비롯한 하드웨어 플랫폼과 그 자원을 모두 다스린다. Type-2(hosted) 하이퍼바이저에서는 호스트 운영체제가 하드웨어를 모두 다스리고, 하이퍼바이저는 호스트 운영체제 안에서 돌며 그 기능으로 하드웨어를 관리한다. 두 갈래 모두 가상 머신을 두고, 가상 머신 안에서는 게스트 운영체제가 돈다.[@arm-102142-2025]

![[diagrams/hypervisor-type-1-type-2.svg]]

Goldberg는 1973년 학위논문에서 가상 컴퓨터 시스템을, VMM이 bare machine 위에서 도는 Type I과 VMM이 호스트 운영체제가 돌리는 프로그램으로서 확장 호스트(extended host) 위에서 도는 Type II로 나눴다.[@goldberg-architectural-principles-1973]

## 완전 가상화와 반가상화

가상화는 완전 가상화와 반가상화로 나뉜다.[@guo-virtualisation-technologies-2025][@mauser-mixed-criticality-2025] Arm의 AArch64 가상화 가이드에 따르면 엄밀한 뜻의 완전 가상화는 실제 물리 머신을 흉내 내고, 반가상화는 게스트 운영체제의 핵심 부분을 물리 머신 대신 가상 하드웨어 플랫폼에서 돌도록 고쳐 성능을 높인다. 이 가이드가 나온 2025년 무렵에는 Arm을 비롯해 가상화 하드웨어 지원이 있는 대부분의 아키텍처에서 게스트 운영체제를 대부분 고치지 않고 돌렸고, 블록 저장장치와 네트워크 같은 I/O 주변장치의 드라이버만 Virtio 같은 반가상화 장치와 드라이버를 썼다.[@arm-102142-2025]

VIRTIO(Virtual I/O Device) 1.4 명세는 가상 장치를 환경이나 운영체제마다 따로 만든 방식이 아니라, 단순하고 효율적이며 표준적이고 확장할 수 있는 방식으로 가상 환경과 게스트에 주는 것을 목적으로 한다. virtio 장치는 가상 환경에 있지만 게스트에게는 물리 장치처럼 보이도록 설계되어, 게스트가 표준 드라이버와 장치 발견 방식을 그대로 쓸 수 있다.[@oasis-virtio-1-4-2026]

## I/O 가상화

I/O 가상화 방식은 가상 머신이 주변장치에 직접 접근하는 방식, VMM이 트랩한 접근을 받아 장치의 동작을 흉내 내는 trap-emulation, SR-IOV(Single-Root I/O Virtualisation)로 나뉜다. 주변장치의 DMA(direct memory access) 요청을 다시 매핑해 가상 머신이 자기에게 배정된 메모리에만 닿게 하는 장치를 **IOMMU**(I/O Memory Management Unit)라 부른다.[@guo-virtualisation-technologies-2025]

NXP 앱노트 AN14355는 S32G3 기준 보드에서 QNX Hypervisor로 QNX와 Linux 게스트를 돌리며, 게스트를 네트워크에 잇는 두 방식을 보인다. 하나는 QNX Hypervisor의 VirtIO-Net 가상 네트워크 브리지를 거치는 간접 연결이고, 다른 하나는 드라이버 passthrough로 게스트가 네트워크 주변장치에 바로 닿는 직접 연결이다.[@nxp-an14355-2024]

## AArch64의 가상화 지원

AArch64에서는 EL(Exception level) 가운데 EL2 이상에서 도는 소프트웨어가 가상화 제어로 stage 2 변환, EL1·EL0의 명령과 레지스터 접근 트랩, 가상 예외 생성을 쓸 수 있다. Type-1 하이퍼바이저는 EL2에서, 가상 머신은 EL0과 EL1에서 돈다.[@arm-102142-2025]

stage 2 변환에서는 게스트 운영체제가 다스리는 stage 1 변환이 가상 주소를 IPA(Intermediate Physical Address)로 옮기고, 하이퍼바이저가 다스리는 stage 2 변환이 IPA를 실제 물리 주소로 옮긴다. IPA 공간은 게스트 운영체제가 물리 메모리로 여기는 주소 공간이다. 하이퍼바이저는 stage 2 변환으로 가상 머신이 어느 메모리 매핑 자원에 닿고 그 자원이 가상 머신의 주소 공간 어디에 보일지를 정해, 가상 머신이 자기에게 배정된 자원만 보게 한다.[@arm-102142-2025]

![[diagrams/aarch64-stage-1-stage-2-translation.svg]]

가상 머신은 IPA 공간의 주변장치 영역으로 실제 주변장치와 가상 주변장치를 쓴다. **할당된 주변장치**(assigned peripheral)는 가상 머신에 배정해 IPA 공간에 매핑한 실제 장치로, 가상 머신 안의 소프트웨어가 바로 다룬다. **가상 주변장치**는 하이퍼바이저가 소프트웨어로 흉내 내는 장치다. 가상 주변장치의 stage 2 변환표 항목은 fault로 표시되어 있어 접근마다 stage 2 fault가 나서 EL2로 예외가 가고, 하이퍼바이저가 예외 처리기에서 그 접근을 흉내 낸다.[@arm-102142-2025]

DMA 컨트롤러 같은 다른 마스터도 가상 머신에 배정할 수 있다. 이 마스터는 stage 2 표를 따르지 않아, 가상 머신 안의 드라이버가 직접 다루면 가상 머신의 격리를 깰 수 있다. 그래서 그 마스터에 SMMU(System Memory Management Unit)를 붙이고, 하이퍼바이저가 SMMU를 설정해 stage 2 보호를 그 마스터에도 넓힌다. 그러면 마스터는 자신이 배정된 가상 머신과 같은 메모리를 본다. SMMU는 IOMMU라고도 부른다.[@arm-102142-2025]

![[diagrams/smmu-dma-master-stage-2.svg]]

## Armv8-R의 가상화 지원

Armv8-R 프로세서에서는 게스트 운영체제가 도는 EL1 위의 EL2에서 코드가 돌 수 있어 가상화가 된다. 하이퍼바이저는 이 특권 수준에서 게스트 운영체제 하나 이상 위에 놓인다. PMSA(Protected Memory System Architecture)는 메모리 영역을 정의하고 다른 영역의 접근을 막아 공간 분리를 이룬다. 그래서 한 게스트 운영체제는 대개 다른 게스트 운영체제가 쓰는 영역에 닿지 못하고, 게스트 운영체제의 코드는 하이퍼바이저의 코드나 데이터 영역에 닿지 못한다.[@arm-102909-2026]
