---
title: RTOS
tags:
  - platform/rtos
verified: 2026-09-29
---

**RTOS**(Real-Time Operating System)는 사건에 제때, 결정적으로 응답하는 것을 주목적으로 하는 운영체제다.[@freertos-faq-what-is-this-all-about-2026][@st-um1722-2019] RTOS는 흔히 우선순위 기반 선점형 스케줄러를 두고, 실행할 수 있는 태스크 가운데 우선순위가 가장 높은 것을 실행한다.[@freertos-rtos-fundamentals-2026][@silabs-intro-rtos-2019][@micrium-ucos-ii-rtsc-2026] 실시간이라는 요구는 [[real-time-system|실시간 시스템]]에서 다룬다.

## 구조·동작

### superloop

운영체제를 쓰지 않는 임베디드 소프트웨어는 흔히 **superloop** 구조를 쓰며, 복잡도가 낮은 작은 시스템이 대개 이렇게 설계된다. superloop는 무한 루프 안에서 할 일을 맡은 모듈의 함수를 호출한다. 루프 밖의 인터럽트 처리기는 비동기 사건을 맡고, 시간이 급한 일을 제때 하려면 인터럽트 처리기에서 해야 한다. 인터럽트가 넘긴 일도 루프가 그 모듈의 차례에 이르러야 처리되므로, 최악의 응답 시간은 루프 한 바퀴의 실행 시간에 달린다.[@micrium-ucos-ii-rtsc-2026][@microchip-harmony-overview-2017]

Microchip MPLAB Harmony의 main 함수는 모든 모듈을 초기화한 뒤, 무한 루프에서 각 모듈의 상태 기계 함수를 차례로 호출한다.[@microchip-harmony-overview-2017]

RTOS 기반 소프트웨어는 일을 여러 태스크로 나누고, 태스크마다 우선순위를 준다.[@freertos-rtos-fundamentals-2026][@silabs-intro-rtos-2019]

![[diagrams/superloop-vs-rtos-tasks.svg]]

### 구성

**스케줄러**는 커널에서 어느 태스크를 언제 실행할지 정하는 부분이다.[@freertos-rtos-fundamentals-2026][@micrium-ucos-ii-rtsc-2026] RTOS가 다른 태스크를 실행하기로 하면 [[context-switch|문맥 전환]]이 일어나, 지금 태스크를 내보내고 새 태스크를 들인다.[@freertos-rtos-fundamentals-2026][@silabs-intro-rtos-2019] 스케줄링 방식은 [[real-time-scheduling|실시간 스케줄링]]에서 다룬다.

RTOS는 흔히 주기적인 타이머 인터럽트인 **시스템 틱**으로 시간을 재고, 이것으로 태스크의 지연과 대기 타임아웃을 처리한다.[@silabs-intro-rtos-2019][@freertos-rtos-tick-2026]

RTOS는 태스크 사이의 동기화와 통신에 세마포어, 뮤텍스, 메시지 큐, 이벤트 플래그 같은 객체를 제공한다.[@silabs-intro-rtos-2019][@arm-cmsis-rtos2-using-2026] 인터럽트 처리기는 태스크를 깨워 처리를 그 태스크에 넘길 수 있다.[@silabs-intro-rtos-2019][@freertos-deferred-interrupt-handling-2026]

### 차량용 RTOS

ISO 17356-3은 차량용 멀티태스킹 실시간 운영체제인 OSEK/VDX OS의 개념을 기술하고, 그 API(Application Programming Interface)를 정한다. 이 운영체제는 분산 임베디드 제어 유닛용 단일 프로세서 운영체제다. ISO 17356-3은 특정 구현의 제품 설명이 아니다.[@iso-17356-3-2005] OSEK/VDX OS 2.2.3 규격에 따르면 이 규격을 따르는 구현은 여럿이고, 인증 절차로 각 구현이 규격에 맞는지 확인한다.[@osek-os-2-2-3-2005]

AUTOSAR Classic Platform의 OS 명세는 ISO 17356-3을 바탕으로 두고 이를 확장하거나 제한하며, OSEK OS의 API와 하위 호환되는 API를 요구한다. 이 명세는 OSEK OS의 기능에 더해 schedule table, 타이밍 보호, 메모리 보호 같은 기능을 정한다.[@autosar-cp-sws-os-2025]

## 비교·한계

FreeRTOS 문서에 따르면 비실시간 다중 사용자 시스템의 스케줄링 정책은 각 태스크에 처리기 시간을 공정하게 나누고, RTOS의 스케줄링 정책은 실세계 사건의 마감 시한을 지켜야 한다.[@freertos-rtos-fundamentals-2026]

AUTOSAR Adaptive Platform은 주로 고성능 연산과 통신 기능을 제공하는 플랫폼이고, 그 설계 설명서는 이 플랫폼의 운영체제가 다중 프로세스 POSIX(Portable Operating System Interface) 운영체제 기능을 제공하도록 한다.[@autosar-ap-exp-platformdesign-2025] 운영체제 인터페이스 명세는 IEEE 1003.13-2003의 PSE51 인터페이스로 운영체제 기능을 제공하도록 요구한다.[@autosar-ap-sws-operatingsysteminterface-2025]

RTOS를 쓰면 틱을 돌리고 태스크를 전환하는 데 CPU 시간이 더 든다.[@freertos-faq-what-is-this-all-about-2026][@silabs-intro-rtos-2019] Silicon Labs 자료에 따르면 RTOS의 서비스 부담은 대개 CPU 사이클의 2\~10%이고, RTOS 코드는 플래시를 대개 6\~20 KB 더 쓰며, 태스크마다 스택과 TCB(Task Control Block)로 RAM(Random Access Memory)을 더 쓴다.[@silabs-intro-rtos-2019]

MPLAB Harmony 문서에 따르면 폴링 superloop는 가장 이해하기 쉬운 구성이다.[@microchip-harmony-overview-2017] 대신 superloop에 모듈이 늘수록 모든 일의 시간 요구를 맞추기 어려워지고, 코드를 고치면 루프의 타이밍이 바뀐다.[@micrium-ucos-ii-rtsc-2026][@microchip-harmony-overview-2017]
