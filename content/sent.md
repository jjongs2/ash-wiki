---
title: SENT
tags:
  - network
aliases:
  - Single Edge Nibble Transmission
verified: 2026-09-29
---

**SENT**(Single Edge Nibble Transmission)는 센서가 ECU로 데이터를 보내는 단방향 통신이다.[@nxp-an4856-2014][@microchip-ds70005145-2014] SAE J2716:2016은 센서 정보를 SENT 부호화로 보내는 디지털 펄스 방식을 정한다.[@sae-j2716-2016] SENT는 세 선으로 센서와 ECU를 잇는다.[@ti-sprab22-2010][@allegro-an296244-2022] TI 앱노트에 따르면 세 선은 센서 전원, 접지, 데이터 선 하나다.[@ti-sprab22-2010]

Microchip 레퍼런스 매뉴얼에 따르면 SENT는 점대점 전송용으로 설계되었다.[@microchip-ds70005145-2014] NXP 앱노트에 따르면 SENT는 아날로그 전압 출력 센서와 PWM(Pulse Width Modulation) 출력 센서의 대안이다.[@nxp-an4856-2014]

## 니블 부호화

SENT 신호에서 정보는 연속한 두 하강 에지의 간격에 담긴다. 기본 시간 단위는 **틱**(tick)이고, 틱의 길이는 3\~90 µs다. 니블(4비트) 하나는 12\~27틱 길이의 펄스로 보내며, 니블 값이 $v$이면 펄스 길이는 $12 + v$틱이다. 그래서 12틱이 0, 27틱이 15를 나타낸다.[@nxp-an4856-2014][@microchip-ds70005145-2014]

## 메시지

SENT 메시지는 56틱 길이의 동기·보정 펄스로 시작하고[@nxp-an4856-2014][@microchip-ds70005145-2014], 상태·통신 니블 1개가 뒤따른다.[@microchip-ds70005145-2014][@allegro-an296244-2022] 그 뒤에 데이터 니블 1\~6개와, 4비트 [[cyclic-redundancy-check|CRC]]를 담은 CRC 니블 1개가 온다.[@nxp-an4856-2014][@microchip-ds70005145-2014] 끝에는 휴지 펄스를 선택 사항으로 둘 수 있다. 휴지 펄스는 메시지 길이를 채워 메시지가 일정한 간격으로 나가게 하며, 길이는 12틱 이상이다.[@microchip-ds70005145-2014][@allegro-an296244-2022]

![[diagrams/sent-message-pulses.svg]]

## 클록 보정

수신 측은 동기·보정 펄스의 길이를 재서 송신 측의 실제 틱 길이를 알아낸다. 그래서 송신 측 클록이 틱 길이의 ±20%까지 어긋나도 수신 측이 니블을 읽을 수 있고, 센서는 값싼 발진기를 쓸 수 있다.[@nxp-an4856-2014][@ti-sprab22-2010]

## 직렬 메시지

상태·통신 니블의 비트 두 개를 여러 메시지에 걸쳐 모아 더 긴 직렬 메시지를 보낸다.[@nxp-an4856-2014][@microchip-ds70005145-2014] Melexis 데이터시트는 이 경로를 slow channel이라 부른다.[@melexis-mlx90825-2025] 상태·통신 니블과 직렬 메시지로는 센서 진단 정보를 보낼 수 있다.[@allegro-an296244-2022][@melexis-mlx90825-2025] MLX90825는 직렬 메시지로 센서 종류, 제조사 코드, SENT 개정판 같은 정보도 보낸다.[@melexis-mlx90825-2025]

직렬 메시지에는 short serial message와 enhanced serial message 두 꼴이 있다.[@nxp-an4856-2014][@microchip-ds70005145-2014] NXP 앱노트에 따르면 short serial message는 상태·통신 니블의 비트 2로 연속한 SENT 메시지 16개에 걸쳐 4비트 메시지 식별자, 8비트 데이터, 4비트 CRC를 보내고, 첫 메시지에서 비트 3을 1로 두어 시작을 알린다. enhanced serial message는 비트 2와 3으로 연속한 SENT 메시지 18개에 걸쳐 보내며, 8비트 메시지 식별자와 12비트 데이터를 싣거나 4비트 메시지 식별자와 16비트 데이터를 싣는다.[@nxp-an4856-2014]

![[diagrams/sent-short-serial-message.svg]]

## SPC

SENT는 원래 단방향이지만, SPC(Short PWM Code)를 쓰면 양방향 통신을 할 수 있다.[@nxp-an4856-2014][@microchip-ds70005145-2014] NXP 앱노트에 따르면 SPC의 통신은 반이중 동기 방식으로, 수신 측 MCU가 선을 정해진 시간 동안 low로 끌어 master trigger 펄스를 내고, 센서는 그 펄스의 폭이 정해진 범위 안일 때만 SENT 전송을 시작한다. 예를 들어 TLE4998C는 병렬로 이은 센서 최대 넷 가운데 어느 센서가 보낼지를 master trigger 펄스의 폭으로 고르는 모드도 둔다.[@nxp-an4856-2014]

dsPIC33/PIC24 제품군의 SENT 모듈은 동기 모드에서 사용자 소프트웨어로 SPC를 구현할 수 있게 한다.[@microchip-ds70005145-2014]

## 구현

마이크로컨트롤러의 [[autosar-icu-driver#측정 모드|타이머 입력 캡처]]로 하강 에지 간격을 재서 SENT를 받을 수 있다.[@ti-sprab22-2010][@renesas-r01an5553-2020] NXP 앱노트가 권하는 SENT 수신 회로는 트랜시버 없이, 풀업 저항과 560 Ω·2.2 nF 저역 통과 필터를 거쳐 MCU 입력 핀에 잇는다.[@nxp-an4856-2014] 전용 SENT 수신 모듈을 둔 마이크로컨트롤러도 있다.[@nxp-an4856-2014][@microchip-ds70005145-2014]

## 아날로그 출력과의 차이

A17700은 SENT로 압력과 함께 온도와 진단 정보를 보낼 수 있는데, 이는 아날로그 출력으로는 할 수 없다.[@allegro-an296244-2022]
