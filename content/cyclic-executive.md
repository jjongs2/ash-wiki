---
title: Cyclic executive
tags:
  - platform/rtos
aliases:
  - 순환 실행기
verified: 2026-09-30
---

**cyclic executive**(순환 실행기)는 주기 프로세스를 제어하는 실행 구조다.[@baker-cyclic-executive-1988] POSIX 근거 문서에 따르면 cyclic executive에서는 주기적인 타이머 인터럽트가 다음 일련의 계산을 시작한다.[@ieee-1003-1-rationale-clocks-and-timers-2024] 실시간 스케줄링 방식은 [[real-time-scheduling|실시간 스케줄링]]에서 다룬다.

## Baker와 Shaw의 모델

Baker와 Shaw는 1988년 IEEE Real-Time Systems Symposium 논문에서 이 모델을 제시하고 평가했고, Ada로 cyclic executive를 짤 때의 한계와 이를 피하는 기법을 다뤘다.[@baker-cyclic-executive-1988] 같은 제목의 논문이 1989년 Real-Time Systems 저널 1권에 실렸다.[@baker-cyclic-executive-1989]

## Time-triggered와 event-triggered

**time-triggered** 시스템에서는 활동이 미리 정한 실시간 시점에 주기적으로 시작된다. **event-triggered** 시스템에서는 의미 있는 사건이 일어나면 그 결과로 처리 활동이 시작된다.[@kopetz-event-triggered-time-triggered-1991]

Classical [[can|CAN]] 네트워크의 통신은 event-triggered라, 여러 메시지의 송신 요청이 한꺼번에 몰리면 첨두 부하가 생길 수 있다. ISO 11898-4의 time-triggered 통신에서는 모든 노드가 동기화되어 메시지를 정해진 시간 슬롯에 다른 메시지와 버스를 다투지 않고 보내므로, 지연 시간을 예측할 수 있다.[@iso-11898-4-obp-2004]

## AUTOSAR OS의 schedule table

[[autosar-os|AUTOSAR R25-11 OS]] 명세는 AUTOSAR OS의 핵심 기능의 바탕을 [[osek-os|OSEK OS]]에 두고, 정적으로 정한 expiry point의 묶음인 [[autosar-schedule-table|schedule table]]을 [[osek-alarm|counter]]가 구동하게 한다.[@autosar-cp-sws-os-2025] 서로 관련된 태스크들의 활성화를 정적으로 정하는 해법으로 흔히 time-triggered 운영체제가 제안되지만, 시간도 사건일 뿐이므로 event-triggered 운영체제로도 정적으로 스케줄한 실시간 소프트웨어의 스케줄러를 구현할 수 있다.[@autosar-cp-rs-os-2025]
