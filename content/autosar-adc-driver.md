---
title: AUTOSAR ADC driver
tags:
  - platform/autosar
verified: 2026-09-30
---

**ADC Driver**는 [[autosar-classic-platform|AUTOSAR Classic Platform]]에서 [[microcontroller-abstraction-layer|MCAL]]의 I/O Drivers 그룹에 드는 모듈이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] 마이크로컨트롤러 안의 ADC(Analogue Digital Converter) 유닛을 초기화하고 제어하며, 변환의 시작과 정지, 하드웨어 트리거와 notification의 켜고 끄기, 변환 상태와 결과 읽기를 서비스로 준다.[@autosar-cp-sws-adcdriver-2025]

## Hardware unit과 channel group

**ADC hardware unit**은 AD 변환에 필요한 부분을 모두 담은 마이크로컨트롤러의 입력 장치이고, 마이크로컨트롤러 하나에 여럿 있을 수 있다. ADC Driver는 변환을 ADC channel group 단위로 다루며, 그룹 전체가 트리거 소스 하나로 변환된다.[@autosar-cp-sws-adcdriver-2025]

## 트리거

변환을 시작하는 트리거 소스는 두 가지다.[@autosar-cp-sws-adcdriver-2025]

- **Software trigger**: `Adc_StartGroupConversion` 호출이 변환을 시작하고, `Adc_StopGroupConversion`이 멈춘다.
- **Hardware trigger**: 타이머 만료나 입력선의 edge 같은 하드웨어 이벤트가 변환을 시작하며, 이벤트 한 번에 그룹을 한 번 변환한다. `Adc_EnableHardwareTrigger`로 켜고 `Adc_DisableHardwareTrigger`로 끈다.[@autosar-cp-sws-adcdriver-2025]

하드웨어 트리거가 없는 ADC에서는 GPT(General Purpose Timer)나 [[autosar-icu-driver|ICU]](Input Capture Unit) Driver와 software trigger를 함께 써서 비슷한 동작을 만들 수 있다. 예로 GPT 타이머의 notification에서 변환을 시작한다.[@autosar-cp-sws-adcdriver-2025]

## One-shot과 continuous

변환 모드는 두 가지다.[@autosar-cp-sws-adcdriver-2025]

- **One-shot**: 트리거 한 번에 그룹의 channel을 하나씩 정확히 한 번 변환한다. hardware trigger 그룹은 이 모드만 쓴다.
- **Continuous**: 한 번 시작하면 트리거를 더 받지 않고 그룹 변환을 되풀이하며, 멈춤 함수로 멈출 수 있다. software trigger 그룹에만 쓴다.[@autosar-cp-sws-adcdriver-2025]

![[diagrams/adc-trigger-conversion-modes.svg]]

## Single access와 streaming access

변환 결과는 사용자가 `Adc_SetupResultBuffer`로 그룹마다 지정한 결과 버퍼에 담긴다. 담는 방식은 두 가지다.[@autosar-cp-sws-adcdriver-2025]

- **Single access**: 그룹의 channel마다 결과를 하나씩 담는다.
- **Streaming access**: channel마다 설정한 개수만큼 결과를 담는다.[@autosar-cp-sws-adcdriver-2025]

두 방식 모두 `Adc_GetStreamLastPointer`와 `Adc_ReadGroup`으로 결과를 읽는다. `Adc_GetStreamLastPointer`는 최신 결과의 위치와 유효한 결과 수를 알려 주고, `Adc_ReadGroup`은 최신 결과를 사용자 버퍼로 복사한다.[@autosar-cp-sws-adcdriver-2025]

streaming 버퍼는 두 가지 가운데 하나로 설정한다.[@autosar-cp-sws-adcdriver-2025]

- **Linear**: 버퍼가 차는 즉시 ADC Driver가 변환을 멈춘다.
- **Circular**: 버퍼가 차도 처음으로 돌아가 덮어쓰며 변환을 이어 간다.[@autosar-cp-sws-adcdriver-2025]

## Notification

notification이 설정되어 있고 켜져 있으면, ADC Driver는 그룹의 모든 channel 변환이 끝날 때마다 그 그룹의 notification 함수를 부른다. streaming access에서도 버퍼가 찼을 때만이 아니라 그룹 변환이 한 번 끝날 때마다 부른다. `Adc_EnableGroupNotification`으로 켜고 `Adc_DisableGroupNotification`으로 끈다.[@autosar-cp-sws-adcdriver-2025]

## 다른 드라이버와의 관계

칩 안의 클록 소스와 clock prescaler는 MCU Driver가 초기화하고 제어한다. 하드웨어가 지원하면 변환 유닛이 쓸 ADC 전용 클록 소스와 prescale 계수는 ADC Driver 설정에서 고른다. ADC가 쓰는 아날로그 입력 핀과 외부 트리거 핀은 [[autosar-port-driver|Port Driver]]가 설정한다.[@autosar-cp-sws-adcdriver-2025]
