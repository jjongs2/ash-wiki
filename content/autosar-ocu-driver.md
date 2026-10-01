---
title: AUTOSAR OCU driver
tags:
  - platform/autosar
verified: 2026-09-30
---

**OCU Driver**는 AUTOSAR Classic Platform에서 MCAL의 I/O Drivers 그룹에 드는 모듈이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] 마이크로컨트롤러 안의 OCU(Output Compare Unit) 기능을 초기화하고 제어하며, counter 값이 정해 둔 threshold에 닿으면 notification을 부르거나 출력 핀을 바꾼다.[@autosar-cp-sws-ocudriver-2025]

## Free running counter와 compare threshold

OCU Driver 규격에서 OCU channel의 두 요소는 free running counter와 compare threshold다. free running counter는 최솟값부터 최댓값까지 센 뒤 저절로 최솟값부터 다시 세며, 최댓값에서 최솟값으로 세는 counter도 이 정의에 든다. OCU는 counter가 한 단위 늘 때마다 counter 값을 threshold와 견주고, 둘이 같으면 설정한 동작을 한다.[@autosar-cp-sws-ocudriver-2025]

![[diagrams/ocu-counter-threshold-match.svg]]

`Ocu_StartChannel`은 채널을 시작해 일치 때 설정한 동작이 일어나게 한다. `Ocu_StopChannel`은 그 동작을 멈추지만 free running counter는 멈추지 않는다. `Ocu_GetCounter`는 채널 counter의 현재 값을 tick 단위로 돌려준다.[@autosar-cp-sws-ocudriver-2025]

## 절대 threshold와 상대 threshold

OCU Driver는 threshold를 두 방식으로 정한다.[@autosar-cp-sws-ocudriver-2025]

- **절대 threshold**: `Ocu_SetAbsoluteThreshold`는 threshold를 주어진 값 그대로 정한다. 호출자가 함께 넘기는 참조값에서 새 threshold까지의 구간(reference interval)을 보고, 이 구간 안에서 일치가 일어나거나 이미 일어났으면 OCU_CM_IN_REF_INTERVAL을, 일어나지 않으면 OCU_CM_OUT_REF_INTERVAL을 돌려준다.
- **상대 threshold**: `Ocu_SetRelativeThreshold`는 호출하는 순간의 counter 값 $C$와 주어진 값 $R$로 threshold를 $C + R$로 정하고, 반환값은 절대 threshold와 같은 방식으로 준다.[@autosar-cp-sws-ocudriver-2025]

## 일치 때 동작

counter가 threshold와 같아지면 OCU Driver는 두 가지 동작을 할 수 있다.[@autosar-cp-sws-ocudriver-2025]

- 채널의 notification 함수를 부른다. `Ocu_EnableNotification`과 `Ocu_DisableNotification`으로 켜고 끈다.
- 출력 핀을 바꾼다. `Ocu_SetPinAction`은 다음 일치 때 하드웨어가 출력 핀에 할 동작을 high로 두기, low로 두기, 뒤집기, 그대로 두기 가운데 하나로 정한다.[@autosar-cp-sws-ocudriver-2025]

`Ocu_SetPinState`는 일치와 상관없이 출력 핀을 곧바로 high나 low로 두며, 채널이 RUNNING 상태가 아닐 때만 쓸 수 있다.[@autosar-cp-sws-ocudriver-2025]

## 다른 드라이버와의 관계

OCU Driver는 전역 클록, 전역 prescaler, PLL(Phase-Locked Loop) 설정을 MCU Driver에 맡기고, OCU 주변장치에 고유한 자원만 스스로 설정한다. OCU 출력으로 쓰는 핀은 [[autosar-port-driver|Port Driver]]가 설정하므로, OCU 함수를 쓰기 전에 Port Driver를 초기화해야 한다.[@autosar-cp-sws-ocudriver-2025]
