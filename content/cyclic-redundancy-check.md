---
title: CRC
tags:
  - network
aliases:
  - 순환 중복 검사
verified: 2026-09-29
---

**CRC**(Cyclic Redundancy Check)는 순환 부호를 쓰는 오류 제어 방법으로, 주로 오류 검출에 쓴다. 보호할 데이터 블록의 비트를 다항식의 계수로 보고 정해진 생성 다항식으로 모듈로 2 나눗셈을 해, 그 나머지를 블록 검사 시퀀스로 데이터 블록에 붙인다.[@iec-60050-723-10-100-1997] 이 나머지 값도 CRC라 부른다.[@microchip-an730-2000][@autosar-cp-sws-crclibrary-2025]

CRC는 전송하거나 저장하는 데이터의 오류를 찾아내는 간단한 방법이다.[@microchip-an730-2000][@ti-spra530-1999]

## 구조·동작

### 다항식 나눗셈

CRC의 나눗셈은 모듈로 2 산술로 하며, 모듈로 2 덧셈과 뺄셈은 XOR다.[@microchip-an730-2000][@ti-spra530-1999]

생성 다항식의 차수가 $r$이면 송신 측은 데이터 뒤에 0을 $r$개 붙인 비트열을 생성 다항식으로 나누고, 나머지 $r$비트를 데이터 뒤에 붙여 보낸다. 이렇게 만든 비트열은 생성 다항식으로 나누어떨어진다.[@autosar-cp-sws-crclibrary-2025][@ti-spra530-1999]

수신 측은 받은 비트열 전체를 생성 다항식으로 나누어, 나머지가 0이 아니면 오류로 판정한다.[@microchip-an730-2000][@ti-spra530-1999] 받은 데이터로 CRC를 다시 계산해 받은 CRC와 비교하고, 다르면 오류로 판정하기도 한다.[@bosch-can-2-0-1991][@microchip-enc28j60-2012]

### 하드웨어 구현

하드웨어에서는 CRC를 시프트 레지스터와 XOR로 계산한다. 시프트 레지스터의 비트 수는 생성 다항식의 차수와 같고, 데이터를 한 비트씩 밀어 넣으면서 생성 다항식의 계수가 1인 자리에서 XOR를 한다. 데이터를 모두 넣은 뒤 레지스터에 남은 값이 CRC다.[@microchip-an730-2000][@ti-spra530-1999] 아래 그림은 [[can|CAN]]이 쓰는 생성 다항식으로 그린 예다.

![[diagrams/can-crc-shift-register.svg]]

### 쓰는 곳

CRC는 Ethernet 같은 LAN(Local Area Network)에서 쓰인다.[@microchip-an730-2000][@ti-spra530-1999]

Bosch CAN 2.0 규격은 CAN의 CRC 시퀀스를 15비트로 둔다.[@bosch-can-2-0-1991] 자세한 것은 [[can-crc|CAN CRC]]에서 다룬다.

모뎀의 오류 정정 절차를 정한 ITU-T V.42는 LAPM(Link Access Procedure for Modems)의 32비트 FCS(Frame Check Sequence) 생성 다항식을 차수가 32, 26, 23, 22, 16, 12, 11, 10, 8, 7, 5, 4, 2, 1, 0인 항으로 정한다.[@itu-t-v-42-2002]

$$
x^{32} + x^{26} + x^{23} + x^{22} + x^{16} + x^{12} + x^{11} + x^{10} + x^{8} + x^{7} + x^{5} + x^{4} + x^{2} + x + 1
$$

## 비교·한계

CRC는 이웃한 비트들에 몰린 오류인 버스트 오류를 찾아내는 데 쓴다.[@microchip-an730-2000][@ti-spra530-1999] 오류 버스트의 길이는 첫 오류 비트부터 마지막 오류 비트까지의 비트 수다.[@iec-60050-721-08-10-1991]

AUTOSAR CRC 라이브러리 규격은 32비트 다항식 `0xF4ACFB13`의 [[hamming-distance|해밍 거리]]를 CRC를 포함해 4096바이트까지 6으로 제시한다.[@autosar-cp-sws-crclibrary-2025]

AUTOSAR CRC 라이브러리 규격에 따르면 생성 다항식이 추가로 대수적 성질을 가지면 오류 위치를 찾아 부호어를 고칠 수도 있다.[@autosar-cp-sws-crclibrary-2025]

ENC28J60은 `ERXFCON.CRCEN`이 설정되어 있으면 CRC가 틀린 패킷을 버린다.[@microchip-enc28j60-2012] [[automatic-repeat-request|ARQ]]는 오류 검출 부호로 찾은 오류를 되돌림 통로로 알려, 송신 측이 다시 보내게 한다.[@iec-60050-721-08-21-1991]
