---
title: AUTOSAR DIO driver
tags:
  - platform/autosar
verified: 2026-09-30
---

**DIO Driver**(Digital Input/Output Driver)는 [[autosar-classic-platform|AUTOSAR Classic Platform]]에서 [[microcontroller-abstraction-layer|MCAL]]의 I/O Drivers 그룹에 드는 모듈이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-fo-tr-glossary-2025] DIO Driver는 마이크로컨트롤러 칩 안의 DIO 핀과 port를 읽고 쓰는 서비스를 준다. 핀에 기능과 방향을 정하고 초기화하는 일은 하지 않으며, [[autosar-port-driver|Port Driver]]가 설정해 둔 핀을 쓴다.[@autosar-cp-sws-diodriver-2025]

## 읽기와 쓰기

DIO Driver는 channel, port, channel group 세 단위로 핀을 읽고 쓴다. channel은 `Dio_ReadChannel`과 `Dio_WriteChannel`로, port는 `Dio_ReadPort`와 `Dio_WritePort`로, channel group은 `Dio_ReadChannelGroup`과 `Dio_WriteChannelGroup`으로 다룬다.[@autosar-cp-sws-diodriver-2025]

![[diagrams/dio-read-write-units.svg]]

`Dio_FlipChannel`은 출력 channel에 부르면 레벨을 뒤집어 쓰고 뒤집힌 레벨을 돌려준다. 입력 channel에 부르면 물리 출력에는 손대지 않고 그 channel의 레벨만 돌려준다.[@autosar-cp-sws-diodriver-2025]

읽기 함수는 입력 channel에도 출력 channel에도 쓸 수 있다. 출력 channel을 읽을 때, 마이크로컨트롤러가 핀 값을 직접 되읽을 수 있으면 실제 핀 레벨이 오고, 그렇지 않으면 출력 레지스터에 든 값이 온다. 입력 channel에 쓰기 함수를 불러도 물리 출력 레벨은 달라지지 않는다.[@autosar-cp-sws-diodriver-2025]

## 동기, 비버퍼

DIO Driver의 읽기·쓰기 서비스는 동기식이고 데이터를 버퍼에 두지 않는다.[@autosar-cp-sws-diodriver-2025] 동기식 함수는 호출자에게 돌아가는 순간 기능이 끝나 있음이 보장되는 함수다.[@autosar-fo-tr-glossary-2025] 그래서 DIO 함수가 돌아올 때 핀 읽기나 쓰기는 이미 끝나 있고, 값을 쌓아 두었다가 나중에 반영하는 일이 없다.[@autosar-cp-sws-diodriver-2025]

## STD_HIGH와 STD_LOW

channel의 레벨은 STD_HIGH와 STD_LOW 두 값이다. DIO Driver 규격은 STD_LOW를 물리 상태 0 V로, STD_HIGH를 물리 상태 5 V나 3.3 V로 정한다.[@autosar-cp-sws-diodriver-2025]

## Port Driver와의 관계

DIO 함수는 Port Driver가 초기화된 뒤에만 불러야 하고, 그 전에 부르면 DIO Driver가 어떻게 동작할지 정해져 있지 않다.[@autosar-cp-sws-diodriver-2025] 초기화 순서는 [[autosar-port-driver#DIO보다 먼저 초기화|Port Driver]]에서 다룬다.
