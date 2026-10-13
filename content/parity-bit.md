---
title: 패리티 비트
tags:
  - network
verified: 2026-09-29
---

**패리티 비트**(parity bit)는 비트 묶음에 덧붙이는 비트 하나로, 모든 비트에서 1의 개수가 늘 짝수이거나 늘 홀수가 되도록 값을 정한다. 주로 오류 검출에 쓴다.[@iec-60050-723-10-99-1997]

## 짝수 패리티와 홀수 패리티

데이터 비트와 패리티 비트를 합친 1의 개수를 짝수로 맞추는 방식이 **짝수 패리티**(even parity), 홀수로 맞추는 방식이 **홀수 패리티**(odd parity)다.[@st-rm0008-2021][@ti-tl16c550d-2008] 짝수 패리티 검사는 문자나 블록을 나타내는 비트 묶음에서 같은 값인 비트의 수가 짝수인지 확인하는 오류 제어 절차이고, 홀수 패리티 검사는 그 수가 홀수인지 확인한다.[@iec-60050-721-08-50-1991][@iec-60050-721-08-51-1991]

패리티 검사는 비트 하나의 오류를 모두 찾아낸다.[@ti-spna109-2008][@microchip-an730-2000] 일부 STM32 MCU가 SRAM의 8비트 워드마다 두는 패리티 비트는 비트 하나의 오류와 홀수 개 비트의 오류를 찾아낸다.[@st-an4750-2015]

패리티 비트는 오류를 찾아낼 뿐 고치지는 못한다.[@ti-spna109-2008][@st-an4750-2015] 패리티 비트 여러 개로 틀린 자리를 찾아 고치는 해밍 부호는 [[error-correction-code#해밍 부호|ECC]]에서 다룬다.

## UART의 패리티

UART(Universal Asynchronous Receiver/Transmitter)는 문자 프레임에서 데이터 비트 뒤, 정지 비트 앞에 패리티 비트를 둘 수 있다. 패리티를 쓸지와 짝수·홀수는 설정으로 고르고, 수신한 문자의 패리티가 맞지 않으면 패리티 오류로 알린다.[@st-rm0008-2021][@ti-tl16c550d-2008]

ATmega328P의 USART(Universal Synchronous/Asynchronous Receiver/Transmitter)는 데이터 비트를 모두 XOR해 패리티 비트를 계산하고, 홀수 패리티면 그 결과를 뒤집는다.[@microchip-atmega328p-2020]

![[diagrams/uart-parity-bit-generation.svg]]
