---
title: AUTOSAR ICU driver
tags:
  - platform/autosar
verified: 2026-09-30
---

**ICU Driver**는 [[autosar-classic-platform|AUTOSAR Classic Platform]]에서 [[microcontroller-abstraction-layer|MCAL]]의 I/O Drivers 그룹에 드는 모듈이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] ICU(Input Capture Unit)를 써서 PWM(Pulse Width Modulation) 신호를 복조하고, 펄스를 세고, 주파수와 duty cycle을 재고, 단순 인터럽트와 wakeup 인터럽트를 만든다.[@autosar-cp-sws-icudriver-2025]

## 측정 모드

ICU Driver는 [[microcontroller-abstraction-layer#Channel, channel group, port|channel]]마다 측정 모드를 하나 정하며, 모드는 넷이다.[@autosar-cp-sws-icudriver-2025]

- **Signal edge detection**: notification이 켜져 있으면, 설정한 edge(rising, falling, 둘 다)가 들어올 때마다 notification을 한 번 부른다.
- **Signal measurement**: 설정에 따라 low 구간, high 구간, 주기, 또는 duty cycle을 계산할 active 구간과 주기의 쌍을 잰다. `Icu_StartSignalMeasurement`로 시작하고, `Icu_GetTimeElapsed`(low 구간, high 구간, 주기)와 `Icu_GetDutyCycleValues`(active 구간과 주기)로 결과를 읽는다.
- **Timestamp**: `Icu_StartTimestamp`를 부르면 설정한 edge가 들어온 순간의 타이머 값을 호출자가 넘긴 버퍼에 적어 나간다. 주기적이지 않은 신호를 받아 두는 데 쓸 수 있다.
- **Edge counter**: 설정한 edge가 몇 번 들어왔는지 센다. `Icu_EnableEdgeCount`로 세기 시작하고, `Icu_GetEdgeNumbers`로 센 수를 읽고, `Icu_ResetEdgeCount`로 0으로 되돌린다.[@autosar-cp-sws-icudriver-2025]

![[diagrams/icu-signal-measurement-times.svg]]

`Icu_GetInputState`는 마지막 호출이나 `Icu_Init` 뒤에 activation edge가 들어왔는지 읽으며, signal edge detection channel과 signal measurement channel에 쓸 수 있다.[@autosar-cp-sws-icudriver-2025]

## Wakeup

ICU Driver의 모드는 ICU_MODE_NORMAL과 ICU_MODE_SLEEP 둘이고, `Icu_SetMode`로 바꾼다. ICU_MODE_SLEEP에서는 설정에서 wakeup capable로 두고 `Icu_EnableWakeup`으로 wakeup을 켠 channel만 동작하며, 나머지 channel은 멈춘다. `Icu_EnableWakeup`과 `Icu_DisableWakeup`으로 바꾼 설정은 ICU_MODE_SLEEP에 들어갈 때 효력이 난다.[@autosar-cp-sws-icudriver-2025]

ICU Driver는 wakeup 인터럽트를 [[ecu-state-manager|EcuM]]에 알린다. 그 edge가 유효한 wakeup인지는 ICU Driver가 아니라 상위 계층이 가린다.[@autosar-cp-sws-icudriver-2025]

## Notification

`Icu_EnableNotification`과 `Icu_DisableNotification`은 channel의 notification을 켜고 끈다. timestamp channel은 notification이 켜져 있으면, `Icu_StartTimestamp`에 넘긴 간격만큼 timestamp가 쌓였을 때 notification을 부른다.[@autosar-cp-sws-icudriver-2025]

## 다른 드라이버와의 관계

ICU 입력으로 쓰는 포트 핀은 [[autosar-port-driver|Port Driver]]가 설정하므로, ICU 함수를 쓰기 전에 Port Driver를 초기화해야 한다. 전역 클록, 전역 prescaler, PLL(Phase-Locked Loop) 설정은 [[microcontroller-abstraction-layer#모듈 그룹|MCU Driver]]가 맡고, ICU Driver는 ICU 주변장치의 로컬 클록과 prescaler만 설정한다.[@autosar-cp-sws-icudriver-2025]
