---
title: MCU
tags:
  - hardware/mcu-soc
aliases:
  - 마이크로컨트롤러
  - Microcontroller unit
verified: 2026-11-12
---

**MCU**(Microcontroller Unit)는 마이크로컨트롤러를 가리키는 이름이다.[@renesas-engineer-school-mcu-01-2026][@ti-spry337-2020] MCU는 CPU 코어, 메모리, 주변장치 회로를 갖춘 장치다.[@renesas-engineer-school-mcu-01-2026][@nxp-fvnecua4wp-2017]

NXP의 2017년 백서에 따르면 그 무렵 [[electronic-control-unit|ECU]]는 MCU를 가운데 두었다.[@nxp-fvnecua4wp-2017] MCU를 둘러싼 블록은 ECU의 [[electronic-control-unit#구성|구성]]에서 다룬다.

Renesas 자료에 따르면 MCU는 메모리에 담긴 프로그램에 따라 주변 회로를 제어한다.[@renesas-engineer-school-mcu-01-2026]

## 구성과 동작

CPU, ROM, RAM, 발진 회로, 타이머 회로, 직렬 인터페이스 등을 LSI(large scale integration) 칩 하나에 담은 MCU를 **single-chip MCU**라 하고, 칩에 시스템의 주요 주변 회로까지 넣으면 **system LSI**라 부른다.[@renesas-engineer-school-mcu-01-2026]

CPU는 메모리에 저장된 프로그램의 명령을 정해진 순서로 읽고 해석해 실행한다. 다음에 실행할 명령의 주소는 CPU 안의 레지스터인 프로그램 카운터가 담고, 프로그램 카운터의 값은 기본으로 명령을 실행할 때마다 저절로 늘어난다.[@renesas-engineer-school-mcu-01-2026]

MCU는 순차 회로로 이뤄져 클록 신호가 필요하다. 전원을 넣은 직후에는 내부 회로가 안정되지 않아 CPU가 제대로 돌지 못하므로, 전원과 클록이 안정될 때까지 리셋 핀에 리셋 신호를 넣어 둔다. 리셋은 프로그램 카운터를 다시 정해 첫 프로그램의 시작 주소를 담게 한다. 시작 주소는 MCU 모델마다 정해진 고정 주소이거나, ROM의 고정 주소에 담긴 포인터 값이다. 둘째 방식에서 포인터를 담은 ROM의 고정 주소를 **reset vector**라 한다.[@renesas-engineer-school-mcu-02-2015]

![[diagrams/mcu-reset-start-address.svg]]

## 메모리

MCU의 메모리는 프로그램 코드와 데이터를 담는다. 많은 Renesas MCU는 ROM 대신 플래시를 쓰는데, 플래시는 ROM처럼 전원이 꺼져도 내용을 지키면서 ROM과 달리 다시 쓸 수 있다. 많은 single-chip MCU는 내부 RAM으로 SRAM을 쓴다. DRAM(dynamic RAM)은 고속 로직과 한 웨이퍼에 함께 만들기 어려워 single-chip MCU 안에는 대개 두지 않고, 칩 밖에 달아 주변 회로로 다룬다.[@renesas-engineer-school-mcu-01-2026]

코어에 가까이 붙은 RAM은 코어가 빠르게 접근한다.[@arm-100026-2024][@infineon-aurix-tc3xx-memory-maps-training-2020] Arm Cortex-R52는 코어마다 지연이 가장 짧은 TCM(Tightly Coupled Memory)을 세 개 둘 수 있다. 이 TCM은 코어 전용이고, 접근 시간을 가장 잘 예측할 수 있다.[@arm-100026-2024] Infineon AURIX TC3xx의 프로그램 scratch-pad RAM(PSPR)과 데이터 scratch-pad RAM(DSPR)은 TriCore에 가까이 붙어, CPU가 다른 RAM과 플래시보다 빨리 코드와 데이터에 접근하게 한다.[@infineon-aurix-tc3xx-memory-maps-training-2020]

## 주변장치

MCU의 ADC(Analog To Digital Converter) 변환은 소프트웨어로도, 하드웨어 이벤트로도 시작할 수 있다.[@ti-spnu499c-2018][@infineon-aurix-tc3xx-evadc-training-2020]

MCU의 타이머 주변장치는 펄스 폭 측정 같은 시간 측정과, PWM(pulse width modulation) 같은 펄스 생성에 쓰인다.[@ti-spnu499c-2018][@infineon-aurix-tc3xx-gpt12-training-2020] AURIX TC3xx의 STM(System Timer)은 CPU마다 하나씩 있는 64비트 자유 계수 타이머로, 운영체제 같은 소프트웨어가 쓸 시간 기준과 트리거 이벤트를 만든다.[@infineon-aurix-tc3xx-stm-training-2020]

Bosch의 GTM(Generic Timer Module)은 기능이 다른 하위 모듈을 가운데의 ARU(Advanced Routing Unit) 둘레에 두고 설정으로 묶어 복잡한 타이머 기능을 이루는 타이머 모듈이다. 한 번 설정하면 GTM 안의 작업 대부분이 CPU 소프트웨어와 따로 나란히 돌도록 해, CPU의 인터럽트 부하를 덜게 설계됐다.[@bosch-gtm-4-1-specification-2026] GTM은 차량 파워트레인과 능동 안전 응용에서 여러 입력의 데이터 수집과 여러 출력 신호의 생성을 맡는다.[@bosch-gtm-2026]

이 주변장치들을 다루는 [[autosar|AUTOSAR]] 드라이버는 [[microcontroller-abstraction-layer|MCAL]]과 [[autosar-adc-driver|ADC Driver]], [[autosar-pwm-driver|PWM Driver]], [[autosar-icu-driver|ICU Driver]]에서 다룬다.

## CPU 아키텍처

Arm 아키텍처는 쓰임에 맞춰 A(Applications), R(Real-Time), M(Microcontroller) 세 프로파일을 둔다. A 프로파일은 Linux 같은 복잡한 운영체제를 돌리도록 설계된 고성능 프로파일이고, R 프로파일은 실시간·결정적 요구가 있는 시스템을 겨냥해 네트워크 장비와 임베디드 제어 시스템에 흔히 쓰이며, M 프로파일은 작고 전력 효율이 높은 장치용이다.[@arm-102404-2026]

Armv7에서 A 프로파일은 메모리 관리 모델에 가상 주소 지원을, R 프로파일은 물리 주소만의 지원을 요구한다. M 프로파일은 Thumb 명령어 집합만 지원하고, 구현의 전체 크기와 결정적 동작을 절대 성능보다 앞세운다. Armv7-M은 결정적 동작(적은 사이클의 명령 실행, 짧은 파이프라인으로 최소화한 인터럽트 지연, 캐시 없이도 되는 동작)과 깊이 임베디드된 시스템을 설계 기준으로 둔다.[@arm-ddi-0403-2021]

Arm Cortex-R52는 주로 차량·산업 응용용으로 나온 중간 성능의 in-order superscalar 프로세서다. 코어를 1\~4개 두고, 코어마다 Armv8-R AArch32를 따르는 processing element 하나를 구현한다.[@arm-100026-2024]

TriCore 명령어 집합 아키텍처는 MCU의 실시간성, DSP(Digital Signal Processor)의 계산 능력, RISC(Reduced Instruction Set Computer) load-store 구조의 성능을 한 코어에 합친다. TriCore는 실시간 임베디드 시스템에 맞춘 32비트 아키텍처다.[@infineon-aurix-tc4xx-cpu-2025]

## 멀티코어

Infineon AURIX는 TriCore CPU 여럿, 프로그램·데이터 메모리, 인터커넥트와 그 중재, 인터럽트 시스템, DMA 컨트롤러와, 직렬 컨트롤러·타이머·ADC 같은 온칩 주변장치를 갖춘 멀티코어 MCU 제품군이다. AURIX TC3xx와 TC4xx에서는 모든 주변장치가 FPI(Flexible Peripheral Interconnect)와 SRI(Shared Resource Interconnect)로 TriCore CPU와 시스템에 이어진다.[@infineon-aurix-tc3xx-overview-2025][@infineon-aurix-tc4xx-overview-2025]

Infineon AURIX TC4xx, Renesas RH850/U2A, NXP S32K3, TI AM263x의 CPU와 코어 구성은 다음과 같다.

| 제품                 | CPU                       | 코어 구성                                                                                                                     |
| -------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Infineon AURIX TC4xx | TriCore 1.8, 최대 500 MHz | 멀티코어. [[automotive-safety-integrity-level\|ASIL]] D를 위해 모두 lockstep으로 묶는다.[@infineon-aurix-tc4xx-overview-2025] |
| Renesas RH850/U2A    | RH850 G4MH, 400 MHz       | 넷까지, dual-core lockstep 구조[@renesas-rh850-u2a-2026]                                                                      |
| NXP S32K3            | Arm Cortex-M7             | 단일, 이중, lockstep[@nxp-s32kbra4-2026]                                                                                      |
| TI AM263x            | Arm Cortex-R5F, 400 MHz   | 넷까지. R5F 서브시스템을 lockstep이나 dual-core 모드로 돌도록 프로그램할 수 있다.[@ti-am2634-2026]                            |

AURIX TC3xx의 CPU는 저마다 자기 PSPR과 DSPR을 둔다.[@infineon-aurix-tc3xx-memory-maps-training-2020] TriCore 코어는 이들과 데이터·프로그램 캐시에 이어진다.[@infineon-aurix-tc3xx-cpu-2024] AURIX TC3xx의 LMU(Local Memory Unit)는 SRI에 붙은 주변장치로, 범용으로 쓸 로컬 메모리를 256 KB까지 준다.[@infineon-aurix-tc3xx-lmu-2024] AURIX TC4xx의 SRI 크로스바는 CPU와 DMA 같은 모듈을 메모리와 주변장치에 잇고, 서로 다른 master와 slave 사이의 전송을 동시에 처리한다.[@infineon-aurix-tc4xx-sri-2025] TI AM263x는 R5F 코어들을 클러스터 서브시스템으로 묶고, 256 KB 공유 TCM과 2 MB 공유 SRAM을 둔다.[@ti-am2634-2026]

![[diagrams/aurix-tc3xx-cpu-scratch-pad-lmu.svg]]

MCU+ SDK는 TI AM263x의 SDK(Software development kit)다.[@ti-am2634-2026] 이 SDK의 IPC(inter-processor communication)는 여러 CPU에서 도는 소프트웨어를 메시지를 주고받아 맞추는 통신이다. RPMessage는 패킷 버퍼를 두 CPU가 모두 보는 공유 메모리에 두고, 하드웨어 인터럽트로 상대 CPU에 새 패킷을 알린다. IPC Notify는 28비트 메시지 식별자만 인터럽트와 함께 보내 지연이 아주 짧다. RPMessage의 공유 메모리는 모든 CPU에서 같은 주소로 매핑하고, 각 CPU의 메모리 보호·관리 설정에서 캐시하지 않는 영역으로 둔다.[@ti-mcu-plus-sdk-am263x-ipc-2026]

![[diagrams/am263x-ipc-rp-message-notify.svg]]

다중 프로세서의 분류와 스케줄링은 [[multiprocessor-scheduling|다중 프로세서 스케줄링]]에서, 코어 사이의 상호 배제와 통신은 [[spinlock|스핀락]]과 [[autosar-os|AUTOSAR OS]]의 [[inter-os-application-communicator|IOC]]에서, MCU의 가상화 지원은 [[hypervisor|하이퍼바이저]]에서 다룬다.

## 차량용 MCU

TI의 2020년 백서에 따르면 그 무렵 흔한 차의 ECU는 대부분 단순한 MCU였다. 흔한 차량 MCU는 다음을 갖춘다.[@ti-spry337-2020]

- [[can|CAN]]·[[lin|LIN]]·[[ethernet|이더넷]]으로 차량 네트워크의 다른 노드와 통신하는 인터페이스
- 범용 입출력·ADC·직렬 인터페이스 같은 입출력 인터페이스
- 데이터와 프로그램을 담을 고속 메모리
- 저전력 대기 모드
- 차량 네트워크 메시지에 응답하는 빠른 부팅(CAN 응답 50\~100 ms)
- AUTOSAR 스택과 응용
- 필요하면 시스템의 안전 목표를 맞추는 ASIL D 안전 지원[@ti-spry337-2020]

시스템이 복잡해지고 기능이 늘수록 차량 MCU에는 더 큰 계산 능력, 더 큰 내장 플래시와 고속 메모리, 여러 이더넷 포트, 더 많은 입출력 인터페이스, 더 높은 [[cybersecurity|사이버보안]] 요구가 따른다.[@ti-spry337-2020]

AURIX TC3xx 제품군 가운데 TC375의 핵심 대상 응용은 다음과 같다.[@infineon-aurix-tc3xx-overview-2025]

- 파워트레인: 엔진·변속기 제어와, 전동차의 인버터, BMS(battery management system), 온보드 충전기 등
- 섀시·안전: 제동, 조향, 서스펜션, 에어백
- ADAS(Advanced Driver Assistance Systems): 센서 데이터 융합, 차량 레이더 센서
- 연결 [[gateway|게이트웨이]]: 텔레매틱스, 게이트웨이·도메인 제어, 존 제어[@infineon-aurix-tc3xx-overview-2025]

Renesas RH850/U2A와 RH850/U2B는 바뀌어 가는 [[ee-architecture|E/E 아키텍처]]에서 여러 응용을 칩 하나에 모아 통합 ECU를 이루도록 나온 cross-domain MCU이고, 존·도메인용 MCU 시리즈에 든다.[@renesas-rh850-u2a-2026][@renesas-rh850-u2b-2026]

응용 프로세서와 차량 MCU에 계산을 나누는 구성과, 차량 MCU를 응용 프로세서에 넣은 칩은 [[system-on-chip#도메인 분리|SoC]]에서 다룬다.
