---
title: I/O hardware abstraction
tags:
  - platform/autosar
aliases:
  - IoHwAb
verified: 2026-09-30
---

**I/O Hardware Abstraction**(IoHwAb)은 [[autosar-classic-platform|AUTOSAR Classic Platform]]에서 [[ecu-abstraction-layer|ECU Abstraction Layer]]에 속하는 모듈 그룹이다. IoHwAb는 주변 I/O 장치가 칩 안에 있는지 보드 위에 있는지와, 마이크로컨트롤러 핀 연결이나 신호 레벨 반전 같은 ECU 하드웨어 배치를 위 소프트웨어 계층에서 가린다. 센서와 액추에이터 자체를 가리지는 않는다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] IoHwAb는 모듈 하나로 보지 않으며, 여러 모듈로 구현될 수 있다.[@autosar-cp-sws-iohardwareabstraction-2025]

## 신호 경로의 추상화

IoHwAb가 다루는 입출력은 마이크로컨트롤러 포트에 바로 물리거나 보드 위의 주변장치를 거친다. IoHwAb는 자기 전체를 초기화하는 서비스를 둔다.[@autosar-cp-sws-iohardwareabstraction-2025]

센서 신호는 ECU 입력 단자에서 마이크로컨트롤러 핀까지 오는 동안 보드 회로의 증폭, 분압, 반전을 거쳐 마이크로컨트롤러 주변장치에 닿는다. 출력 신호도 마이크로컨트롤러 핀과 ECU 출력 단자 사이의 경로를 지난다. IoHwAb의 정적 추상화는 이 경로가 값에 남기는 정적인 영향(분압기, 하드웨어 반전 등)을 보상하는 것이다.[@autosar-cp-rs-iohwabstraction-2025]

IoHwAb는 I/O 신호를 전류, 전압, 주파수처럼 ECU 하드웨어에 물린 상태의 양으로 표현하고, ECU 하드웨어와 배치의 속성을 위 계층에서 감춘다. 그래서 IoHwAb의 구현은 마이크로컨트롤러에는 독립적이고 ECU 하드웨어에는 의존한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 신호 기반 인터페이스

IoHwAb는 위 계층에 I/O 신호 인터페이스를 주며, 이 인터페이스의 모양은 신호 종류에 따라 정해진다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

IoHwAb 규격은 ECU 신호마다 포트를 적어도 하나 두기를 권하고, 출력 신호에 딸린 진단 신호는 예외로 둔다. 위 계층은 입력 신호 포트의 GET 연산으로 값을 읽고, 출력 신호 포트의 SET 연산으로 값을 쓴다. IoHwAb가 ECU 신호의 기호 이름으로 신호를 기능과 핀에 이어 주므로, [[autosar-software-component|SW-C]] 설계자는 [[microcontroller-abstraction-layer|MCAL]] 드라이버의 API(Application Programming Interface)를 자세히 몰라도 된다. 포트는 설정 과정에서 ECU 전자 설계에 맞춰 만든다. ECU 신호에는 범위, 분해능, 정확도, 반전, 샘플링 속도 같은 속성이 붙고, 이 속성은 설정할 수 있는 특성이다.[@autosar-cp-sws-iohardwareabstraction-2025]

IoHwAb가 SW-C에 주는 것은 AUTOSAR Interface다. 위쪽 인터페이스가 신호를 얻는 경로에 크게 좌우되어 Standardized AUTOSAR Interface는 주지 못한다.[@autosar-cp-sws-iohardwareabstraction-2025] [[autosar-layered-architecture|AUTOSAR 계층 구조]]에서 I/O 신호 접근은 ECU Abstraction Layer가 맡고, Services Layer에는 I/O 서비스가 없다. ECU Abstraction Layer의 모듈 가운데 SW-C와 [[autosar-rte|RTE]]가 바로 쓸 수 있는 것은 IoHwAb뿐이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## ECU마다 다른 구현

AUTOSAR는 IoHwAb 모듈을 표준화하지 않고, 기능 인터페이스를 구현하는 지침만 둔다. IoHwAb는 SW-C의 요구를 특정 MCAL 구현이 가진 기능에 맞춰야 하므로 언제나 ECU마다 따로 구현한다. ECU 신호라는 개념은 하드웨어 플랫폼을 서로 바꿔 쓸 수 있게 하려고 둔 것이다.[@autosar-cp-sws-iohardwareabstraction-2025] 신호마다 고유한 기호 이름을 정적으로 설정할 수 있어야 하는 것도, 하드웨어 할당이 바뀌어도 위 계층은 바뀌지 않게 하려는 것이다.[@autosar-cp-rs-iohwabstraction-2025] 예를 들어 출력 전력단 드라이버가 여러 MCAL 드라이버와 통신 핸들러를 불러 출력을 다루어도, IoHwAb의 신호 추상화는 이 출력들을 모두 포트에 매핑된 신호로 SW-C에 보인다.[@autosar-cp-sws-iohardwareabstraction-2025]

## 드라이버와 notification

IoHwAb는 MCAL의 [[autosar-port-driver|Port]], [[autosar-dio-driver|DIO]], [[autosar-adc-driver|ADC]], [[autosar-pwm-driver|PWM]], [[autosar-icu-driver|ICU]], [[autosar-ocu-driver|OCU]], GPT(General Purpose Timer) 드라이버의 API를 부르고, 보드 위 장치를 다룰 때는 SPI(Serial Peripheral Interface) 같은 통신 드라이버에도 접근한다. 외부 ADC와, SPI로 연결된 외부 I/O ASIC(Application-Specific Integrated Circuit)의 드라이버도 IoHwAb에 든다. IoHwAb가 반드시 써야 하는 인터페이스는 없고, 어느 인터페이스를 쓸지는 SW-C가 정의한 채널에 기대하는 기능에 달렸다.[@autosar-cp-sws-iohardwareabstraction-2025]

notification은 MCAL 드라이버가 내고 IoHwAb 안에서 처리된다. IoHwAb는 ADC, ICU, OCU, PWM, GPT 드라이버에게서 notification을 받으며, 신호마다 notification을 쓰려면 시스템 설계자가 드라이버 설정에서 켜야 한다. Port와 DIO 드라이버에게서는 notification을 받지 않는다.[@autosar-cp-sws-iohardwareabstraction-2025] 두 드라이버에는 callback notification이 없다.[@autosar-cp-sws-portdriver-2025][@autosar-cp-sws-diodriver-2025]

![[diagrams/iohwab-driver-calls-notifications.svg]]

## Sensor/actuator SW-C와의 관계

Sensor/actuator SW-C는 RTE 위에 놓이며, RTE를 통해 IoHwAb의 I/O 신호에 접근한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]
