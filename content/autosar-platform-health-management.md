---
title: AUTOSAR Platform Health Management
tags:
  - platform/autosar
  - sw-engineering/functional-safety
aliases:
  - PHM
verified: 2026-10-07
---

AUTOSAR R25-11 Platform Health Management 명세는 **Platform Health Management**(PHM)를 응용을 타이밍 제약과 논리적 프로그램 순서에 대해 감시하는 [[autosar-adaptive-platform|AUTOSAR Adaptive Platform]]의 functional cluster로 정의한다. 같은 수단으로 [[autosar-state-management|State Management]]나 [[autosar-execution-management|Execution Management]] 같은 functional cluster도 감시할 수 있다. failure를 검출하면 Platform Health Management는 State Management에 알리고, 플랫폼의 조정자인 State Management가 그 오류를 어떻게 다룰지 정해 알맞은 복구 동작을 일으킨다. Platform Health Management는 하드웨어 watchdog과의 인터페이스도 가져, State Management에 알리는 것으로는 부족한 치명적 failure에서 watchdog 반응을 일으킬 수 있다.[@autosar-ap-sws-platformhealthmanagement-2025]

## 감시

Platform Health Management는 Supervised Entity를 감시한다. Supervised Entity는 프로세스의 전체나 일부에 대응하고, 감시는 그 프로세스가 활성인 동안 이어진다. Supervised Entity를 감시하는 수단은 Alive Supervision, Deadline Supervision, Logical Supervision 셋이고, 감시는 Supervised Entity 인스턴스가 보고하는 [[safety-mechanism#Watchdog|체크포인트]]를 바탕으로 한다.[@autosar-ap-sws-platformhealthmanagement-2025] 세 감시의 뜻은 안전 메커니즘의 [[safety-mechanism#오류 검출 기법|오류 검출 기법]]에서 다룬다.

감시 결과는 Elementary Supervision Status에 반영된다. Elementary Supervision Status는 Alive, Deadline, Logical 감시 하나하나마다 따로 두고, 각 Elementary Supervision Status는 그 감시가 Manifest에서 속한 Global Supervision의 Status로 모인다. Global Supervision은 [[autosar-state-management#Machine State와 Function Group State|Function Group]] 하나의 전체나 일부에 대응한다. Global Supervision을 이루는 감시는 모두 한 Function Group 안에서 제어하는 프로세스의 것이어야 하고, 감시 하나는 Global Supervision 하나에만 속할 수 있다. 그래서 같은 프로세스들의 Alive·Deadline 감시와 Logical 감시를 서로 다른 Global Supervision에 나눠 둘 수도 있다.[@autosar-ap-sws-platformhealthmanagement-2025]

## 복구

Platform Health Management는 Supervised Entity의 failure를 디바운싱한 뒤 복구 동작이 필요하면 State Management에 알린다. State Management에 연결한 Global Supervision의 상태가 `kEXPIRED`로 바뀌면, Platform Health Management는 `ara::phm::RecoveryAction::RecoveryHandler` 메서드로 State Management에 알린다. 이때 `executionError` 파라미터에 해당 Function Group과, 지금 쓰는 프로세스 시작 설정(StartupConfig)에 정의한 오류 값(ApApplicationError)을 담고, `supervision` 파라미터에 그 전이를 일으킨 감시의 종류를 담아 넘긴다. State Management는 대개 문제가 된 Function Group을 다른 상태로 바꾸는 식으로 복구하고, failure를 처리할 수 없으면 `RecoveryHandler`의 반환값인 오류 코드 `kSMCanNotHandleRecovery`로 Platform Health Management에 watchdog 반응을 요청할 수 있다.[@autosar-ap-sws-platformhealthmanagement-2025]

Platform Health Management는 안전 관련 failure 뒤 반응이 반드시 일어나도록 State Management가 알림을 받았는지 확인한다. `RecoveryHandler`의 반환을 State Management의 응답으로 보고, failure를 검출한 때부터 이 응답을 받기까지를 설정한 타임아웃 `recoveryNotificationTimeout`으로 지켜보며, 제때 응답이 없으면 WatchdogInterface에 보내던 alive 알림을 멈추고 watchdog 반응을 일으킨다.[@autosar-ap-sws-platformhealthmanagement-2025]

## 하드웨어 watchdog

Platform Health Management는 하드웨어 watchdog과 인터페이스를 가진 유일한 functional cluster다. 그래서 watchdog이 Platform Health Management를 감시하고, Platform Health Management는 WatchdogInterface를 거쳐 하드웨어 watchdog의 트리거를 멈추거나 잘못된 트리거를 보내게 해 watchdog 반응을 일으킬 수 있다. Platform Health Management가 WatchdogInterface에 주기적으로 alive를 알리는 동안 WatchdogInterface는 하드웨어 watchdog을 제대로 트리거하고, 설정한 시간 안에 alive 알림이 없으면 watchdog 반응을 일으킨다. 이 반응은 대개 [[autosar-adaptive-platform#Machine과 프로세스|Machine]]의 리셋이어서 모든 기능에 영향을 주므로, [[freedom-from-interference|FFI]]를 지키는 마지막 수단으로만 써야 한다.[@autosar-ap-sws-platformhealthmanagement-2025]

State Management와 Execution Management의 감시 failure에는 watchdog 반응이 필요하다. 이때는 State Management를 거친 복구가 불가능하기 때문이다. 그래서 State Management나 Execution Management에 대응하는 Global Supervision Status가 `kSTOPPED`로 바뀌면, Platform Health Management는 WatchdogInterface에 보내던 alive 알림을 멈추고 watchdog 반응을 일으킨다. State Management를 거친 복구가 이뤄지지 않을 때도 같다. 앞 절의 `kSMCanNotHandleRecovery` 반환과 타임아웃에 더해, State Management가 `RecoveryHandler`를 제공(Offer)하기 전이나 제공을 멈춘(StopOffer) 뒤에 State Management에 연결한 Global Supervision의 상태가 `kEXPIRED`로 바뀔 때가 그렇다.[@autosar-ap-sws-platformhealthmanagement-2025]

![[diagrams/phm-supervision-recovery.svg]]

## Health Monitoring과의 관계

[[autosar-classic-platform|Classic Platform]]과 Adaptive Platform이 공유하는 기능은 [[autosar#표준|Foundation]] 문서의 Health Monitoring이 다루고, Adaptive Platform에만 있는 명세는 Adaptive Platform 문서의 Platform Health Management가 다룬다.[@autosar-ap-exp-platformdesign-2025]

AUTOSAR R25-11 Health Monitoring 명세는 Health Monitoring의 오류 검출 기능으로 Alive Supervision, Deadline Supervision, Logical Supervision을 둔다. Health Monitoring은 Classic Platform과 Adaptive Platform이 구현하도록 되어 있고, 다른 플랫폼도 구현할 수 있다. Health Monitoring은 설정한 수의 Supervised Entity의 실행과 그 Health Status를 감시하고, 프로그램 실행에 설정한 시간·논리 제약이나 health 제약의 위반을 검출하면 알맞은 오류 처리기를 부르며, watchdog도 그에 맞게 제어한다.[@autosar-fo-asws-healthmonitoring-2025]

AUTOSAR R22-11 Platform Health Management 명세의 개정 이력에 따르면, R21-11 명세는 Health Channel을 obsolete로 두었다.[@autosar-ap-sws-platformhealthmanagement-2022] R24-11 명세는 Health Channel을 뺐다.[@autosar-ap-sws-platformhealthmanagement-2025][@autosar-ap-sws-platformhealthmanagement-2024]
