---
title: DMA
tags:
  - hardware/mcu-soc
verified: 2026-11-13
---

**DMA**(Direct Memory Access)는 CPU가 개입하지 않고, CPU가 다른 일을 하는 동안 메모리 맵 안의 한 곳에서 다른 곳으로 데이터를 옮기는 하드웨어 기능이다. 이 일을 하는 모듈을 DMA 컨트롤러라 한다. [[microcontroller|MCU]]에서는 주변장치와 메모리 사이에서 데이터를 옮기는 데 DMA를 쓴다. 예를 들어 ADC(Analog To Digital Converter)가 변환 결과를 내면 DMA 컨트롤러가 그 결과를 메모리로 옮긴다. 전송은 채널마다 소프트웨어 요청이나 주변장치의 하드웨어 요청으로 시작된다.[@ti-spnu499c-2018][@infineon-aurix-tc3xx-dma-training-2020]

## 쓰는 곳

TI 기술 참조 매뉴얼에 따르면 DMA는 대개 외부와 내부의 데이터 메모리 사이에서 블록을 옮기는 일, 내부 데이터 메모리의 일부를 재배치하는 일, 주변장치를 계속 서비스하는 일, 내부 프로그램 메모리에 섹션을 페이지 단위로 쓰는 일에 쓴다.[@ti-spnu499c-2018]

NXP S32K1xx에서는 ADC가 변환을 마치면 DMA 요청을 내게 할 수 있고, DMA 컨트롤러가 변환 결과를 SRAM으로 옮긴 뒤 원하는 횟수만큼 변환이 끝나면 그 채널의 인터럽트 요청을 낼 수 있다. 주변장치와 함께 DMA를 쓰려면 주변장치를 DMA 채널에 이어 주는 멀티플렉서가 있어야 하고, 소프트웨어로 시작하는 전송에는 이 멀티플렉서가 필요 없다.[@nxp-an5413-2020]

![[diagrams/s32k1xx-adc-dma-transfer.svg]]

[[autosar|AUTOSAR]] R25-11의 Ethernet Driver 명세는 하드웨어가 지원하면, 상위 층의 송신 데이터를 송신 큐로 옮기는 데 DMA 같은 하드웨어 지원 데이터 전송을 쓰도록 설정할 수 있게 하고, 이 전송이 CPU 부하를 덜기를 권한다. 전송마다 준비에 CPU가 들어서, 준비가 전송만큼 CPU를 쓰면 CPU 성능에 나쁘다. 그래서 이 명세는 [[ethernet|이더넷]] 컨트롤러마다 데이터 길이 문턱값을 설정하게 하고, 송신할 데이터가 문턱값을 넘으면 하드웨어 지원 전송으로, 넘지 않으면 CPU 복사로 옮기도록 정한다.[@autosar-cp-sws-ethernetdriver-2025]

## 전송의 시작

Infineon AURIX TC3xx의 DMA 채널은 아래 네 가지 요청으로 전송을 시작한다.[@infineon-aurix-tc3xx-dma-training-2020]

| 요청             | 시작하는 것                                             |
| ---------------- | ------------------------------------------------------- |
| 소프트웨어 요청  | CPU                                                     |
| 하드웨어 요청    | 인터럽트를 낼 수 있는 주변장치(interrupt router를 거침) |
| daisy chain 요청 | 바로 위 우선순위 채널                                   |
| auto start 요청  | linked list 동작에서 다음 전송 설정을 올리는 일         |

## 전송 설정

전송을 기술하는 설정(source와 destination 주소, 길이 등)은 DMA 컨트롤러 안의 RAM에 채널마다 둔다.[@ti-spnu499c-2018][@nxp-an5413-2020] TI TMS570LS31x/21x의 DMA는 채널 제어 정보를 parity로 지킨 로컬 RAM에 control packet으로 둔다.[@ti-spnu499c-2018] NXP S32K1xx의 eDMA에서는 이 설정을 **TCD**(Transfer Control Descriptor)라 하고, TCD 하나가 eDMA 안 RAM의 32비트 워드 8개를 차지한다.[@nxp-an5413-2020]

DMA 요청 하나로 서로 다른 전송을 여럿 이어서 할 수 있다.[@infineon-aurix-tc3xx-dma-training-2020][@nxp-an5413-2020] AURIX TC3xx의 DMA는 한 채널이 전송 여럿을 차례로 하는 linked list로, 이어지지 않은 메모리 영역 사이의 전송을 채널 하나로 처리한다. 또 double buffering으로, 주기적인 소프트웨어 [[task|태스크]]가 목적지 버퍼 하나를 붙들어 두는 동안 다른 버퍼를 계속 채운다.[@infineon-aurix-tc3xx-dma-training-2020] S32K1xx의 eDMA는 channel linking과 scatter-gather로 DMA 요청 하나에 서로 다른 전송을 여럿 하게 한다.[@nxp-an5413-2020]

## 버스 접근과 보호

Infineon AURIX TC3xx의 DMA는 두 시스템 버스에 마스터 인터페이스로 이어져, 어느 모듈이든 읽고 쓸 수 있다.[@infineon-aurix-tc3xx-dma-training-2020]

TI TMS570LS31x/21x의 DMA는 자기가 접근할 수 있는 주소 범위를, 설정할 수 있는 메모리 영역 4개로 제한하는 메모리 보호 기능을 둔다.[@ti-spnu499c-2018]

DMA 컨트롤러를 가상 머신에 배정할 때의 보호는 [[hypervisor#AArch64의 가상화 지원|하이퍼바이저]]에서 다룬다.
