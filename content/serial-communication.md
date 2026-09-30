---
title: 직렬 통신
tags:
  - network
verified: 2026-09-29
---

**직렬 전송**(serial transmission)은 문자 같은 데이터 단위를 이루는 신호 요소를 한 전송 채널로 차례로 보내는 방식이다.[@iso-iec-2382-obp-2015][@iec-60050-704-16-27-1993] 이와 달리 병렬 전송은 신호 요소를 따로 떨어진 여러 전송 채널로 동시에 보낸다.[@iso-iec-2382-obp-2015] IEC 60050은 병렬 전송을 신호 요소 묶음을 그 수만큼의 병렬 경로로 동시에 보내는 방식으로 정의한다.[@iec-60050-704-16-28-1993]

[[can|CAN]]은 직렬 통신 프로토콜이다.[@bosch-can-2-0-1991] UART(Universal Asynchronous Receiver/Transmitter)는 비동기 직렬 통신을 하고[@ti-tl16c550d-2008][@st-rm0008-2021], SPI(Serial Peripheral Interface)는 동기 직렬 통신을 한다.[@st-rm0008-2021][@microchip-atmega328p-2020] I2C는 직렬로 데이터를 보내며, 그 이름은 Inter-IC 버스에서 왔다.[@nxp-um10204-2021] TI의 TMS570LS31x/21x 기술 참조 매뉴얼에 따르면 [[flexray|FlexRay]]는 직렬 통신 프로토콜이다.[@ti-spnu499c-2018] [[ieee-802-3|IEEE 802.3]]-2022에서 [[ethernet|이더넷]]의 MAC(Medium Access Control) 부계층은 물리 계층에 직렬 비트 스트림을 넘긴다.[@ieee-802-3-2022]

## 비트율

ISO/IEC 2382는 비트율을 비트를 전송하는 속도로 정의하고, 보통 초당 비트 수(bit/s)로 나타낸다.[@iso-iec-2382-obp-2015] IEC 60050은 비트율을 초당 전송되는 이진 숫자의 수로 정의한다.[@iec-60050-704-16-07-1993]

## 동기 전송

**동기 전송**에서는 각 신호 요소가 나타나는 시점이 고정된 시간 기준에 묶인다.[@iso-iec-2382-obp-2015] IEC 60050에 따르면 동기 전송에서 송신 장치와 수신 장치는 대응하는 유의 순간 사이에 일정한 시간 차를 두고 계속 동작한다.[@iec-60050-721-03-05-1991]

SPI는 데이터 선과 따로 클록 선(SCK)을 두고, 마스터가 클록을 낸다. SPI는 클록 극성(CPOL)과 클록 위상(CPHA)의 조합으로 데이터를 잡는 클록 에지를 정하고, 마스터는 칩 선택(슬레이브 선택) 신호로 통신할 장치를 고른다.[@st-rm0008-2021][@microchip-atmega328p-2020]

I2C는 직렬 데이터 선 SDA와 직렬 클록 선 SCL, 두 선을 쓰고, 전송을 시작하는 controller가 클록 신호를 낸다.[@nxp-um10204-2021]

I2C 명세에 따르면 2선 직렬 버스인 I2C는 연결을 줄여 IC(Integrated Circuit)의 핀과 PCB(Printed Circuit Board) 배선이 적어진다.[@nxp-um10204-2021] TI의 LVDS(Low-Voltage Differential Signaling) 핸드북에 따르면 직렬화기(serializer)는 병렬 데이터를 직렬 스트림으로 바꿔 보내 연결선의 비용과 크기를 줄이고, 넓은 병렬 데이터를 더 적은 수의 전송 선로로 보낼 수 있게 한다.[@ti-slld009-2002]

## 비동기 전송

**비동기 전송**에서는 문자나 문자 블록의 시작 시점이 임의이지만, 시작한 뒤에는 각 신호 요소가 고정된 시간 기준과 같은 관계로 나타난다.[@iso-iec-2382-obp-2015] **start-stop 전송**은 문자마다 신호 요소 묶음의 앞에 start 신호를, 뒤에 stop 신호를 붙이는 비동기 전송이다.[@iso-iec-2382-obp-2015][@iec-60050-721-03-07-1991]

UART는 문자마다 앞에 start 비트를, 뒤에 stop 비트를 붙여 보낸다. UART 선은 쉬는 동안 high이고, start 비트는 low, stop 비트는 high다.[@st-rm0008-2021][@microchip-atmega328p-2020] TL16C550D 데이터시트는 선의 high 수준을 marking 상태라 부른다.[@ti-tl16c550d-2008] UART 수신기는 idle(high)에서 start 비트(low)로 떨어지는 에지를 보고 문자의 시작을 알고, start 비트에 자기 클록을 맞춘 뒤 각 비트의 가운데를 샘플링한다. USART(Universal Synchronous/Asynchronous Receiver/Transmitter)는 클록 핀을 동기 모드에서만 쓴다.[@st-rm0008-2021][@microchip-atmega328p-2020]

![[diagrams/uart-frame-sampling.svg]]

비동기 수신기는 송신 측과 수신 측 클록의 편차가 허용 오차 안에 있어야 제대로 받으며, 허용되는 편차는 프레임이 길수록 작다.[@st-rm0008-2021][@microchip-atmega328p-2020] Analog Devices 기술 문서에 따르면 UART 수신기는 프레임마다 다시 동기하므로 클록 차이에 따른 타이밍 오차는 한 프레임 안에서 쌓이고, 가장 큰 오차는 마지막 샘플링 지점인 stop 비트에서 난다.[@adi-uart-clock-accuracy-2003]

Bosch CAN 2.0 규격에서 버스는 비트를 나르는 채널 하나로 이루어지고, 이 데이터에서 재동기화 정보를 얻는다. 이 규격은 비트 값이 바뀌는 에지로 재동기화하고, 위상 버퍼 세그먼트를 늘이거나 줄여 에지의 위상 오차를 보정하도록 정한다.[@bosch-can-2-0-1991] 이 과정은 [[can-synchronization#재동기화|CAN 동기화]]에서 다룬다.

UART 프레임은 오류 검사용 [[parity-bit|패리티 비트]]를 둘 수 있다.[@ti-tl16c550d-2008][@microchip-atmega328p-2020] [[lin|LIN]] 프레임은 끝에 프레임 검증용 [[checksum|체크섬]] 바이트를 둔다.[@iso-17987-1-obp-2025] CAN 데이터 프레임은 [[cyclic-redundancy-check|CRC]] 필드를 두고, 수신 측은 CRC 오류를 검출한다.[@bosch-can-2-0-1991]
