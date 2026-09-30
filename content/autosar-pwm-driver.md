---
title: AUTOSAR PWM driver
tags:
  - platform/autosar
verified: 2026-09-30
---

**PWM Driver**는 AUTOSAR Classic Platform에서 MCAL의 I/O Drivers 그룹에 드는 모듈이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] 마이크로컨트롤러 안의 PWM(Pulse Width Modulation) 하드웨어를 초기화하고 제어하며, 내보낼 펄스의 duty cycle과 주기를 고르게 한다.[@autosar-cp-sws-pwmdriver-2025]

## 용어

PWM Driver 규격은 아래 용어를 정의한다.[@autosar-cp-sws-pwmdriver-2025]

| 용어       | 뜻                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Period     | PWM 신호의 주기                                                                                                    |
| Polarity   | 채널이 주기를 시작하는 출력 상태. `PWM_HIGH`면 high로 시작해 duty cycle만큼 지나면 low가 되고, `PWM_LOW`면 반대다. |
| Duty cycle | 주기 가운데 시작 레벨(polarity의 레벨)이 차지하는 비율                                                             |
| Idle state | `Pwm_SetOutputToIdle`이나 `Pwm_DeInit`을 부른 뒤 채널이 머무는 출력 상태. `PWM_HIGH`나 `PWM_LOW`로 설정한다.       |

![[diagrams/pwm-polarity-duty-period.svg]]

## Channel class

PWM Driver 규격은 채널을 주기를 바꿀 수 있는지에 따라 세 class로 나눈다.[@autosar-cp-sws-pwmdriver-2025]

- **Fixed period**: 주기가 고정되고 duty cycle만 바꿀 수 있다.
- **Fixed period shifted**: 주기가 shift된 채 고정되고 duty cycle만 바꿀 수 있다. 하드웨어가 지원할 때만 쓴다.
- **Variable period**: 주기와 duty cycle을 모두 바꿀 수 있다.[@autosar-cp-sws-pwmdriver-2025]

## 출력 설정과 읽기

`Pwm_SetDutyCycle`은 채널의 duty cycle을 정하고, `Pwm_SetPeriodAndDuty`는 주기와 duty cycle을 함께 정한다. 주기를 바꿀 수 있는 채널은 variable period뿐이어서, 개발 오류 검출을 켠 상태로 다른 class의 채널에 `Pwm_SetPeriodAndDuty`를 부르면 PWM_E_PERIOD_UNCHANGEABLE 오류가 보고된다. `Pwm_GetOutputState`는 PWM 출력 신호의 내부 상태를 읽어 PWM_HIGH나 PWM_LOW로 돌려준다.[@autosar-cp-sws-pwmdriver-2025]

## Duty cycle 표현

duty cycle 파라미터는 16비트 부호 없는 정수이고, `0x0000`이 0%, `0x8000`이 100%다. `0x8000`은 $2^{15}$이므로, 파라미터 값 $D$와 주기 $T$가 주어지면 polarity 레벨 구간의 길이 $t$는 아래와 같다.[@autosar-cp-sws-pwmdriver-2025]

$$
t = \frac{D}{2^{15}}\,T
$$

그래서 `0x4000`은 50%다. duty cycle이 0%면 출력은 polarity의 반대 레벨에, 100%면 polarity 레벨에 머문다.[@autosar-cp-sws-pwmdriver-2025]

![[diagrams/pwm-duty-cycle-values.svg]]

## Notification

`Pwm_EnableNotification`은 채널의 rising edge, falling edge, 두 edge 가운데 인자로 고른 쪽에서 notification이 불리게 하고, `Pwm_DisableNotification`은 이를 끈다.[@autosar-cp-sws-pwmdriver-2025]

## 다른 드라이버와의 관계

PWM Driver는 prescaler, 시스템 클록, PLL(Phase-Locked Loop) 설정을 MCU Driver에 맡기고, 포트 핀의 기능 설정을 [[autosar-port-driver|Port Driver]]에 맡긴다.[@autosar-cp-sws-pwmdriver-2025]
