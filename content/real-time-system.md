---
title: 실시간 시스템
tags:
  - platform/rtos
verified: 2026-09-29
---

IEC 60050은 **실시간**(real-time)을, 컴퓨터가 바깥의 다른 프로세스와 이어져 그 프로세스가 정한 시간 요구에 따라 데이터를 처리하는 것으로 정의한다.[@iec-60050-171-05-53-2019] 실시간 애플리케이션은 일반 애플리케이션과 달리 수행할 동작에 [[deadline|마감 시한]]이라는 시간 제약이 걸린다.[@atmel-at04056-2014][@renesas-res05b0008-2010] Renesas 앱노트에 따르면 실시간에서 기대하는 응답은 논리적으로 옳은 결과이고, 사건이 일어난 시점은 그 결과를 내야 하는 마감 시한을 정한다.[@renesas-res05b0008-2010] Micrium 문서에 따르면 실시간 시스템은 논리적 정확성뿐 아니라 시간적 정확성을 지키지 못해도 심각한 결과가 생긴다는 점이 특징이다.[@micrium-ucos-ii-rtsc-2026]

## Hard와 soft

hard real-time과 soft real-time 요구의 구분은 [[deadline#Hard와 soft|마감 시한]]에서 다룬다.

Liu와 Layland는 1973년 논문에서, 각 [[task|태스크]]가 요청 뒤 정해진 시간 안에 끝나야 하고 그 시간 안의 서비스를 보장해야 하는 환경을 hard-real-time 환경이라 부르고, 응답 시간의 통계적 분포를 받아들이는 soft-real-time 환경과 대비했다. 이 논문은 그런 환경에서 단일 프로세서의 멀티프로그래밍 스케줄링을 분석했다.[@liu-hard-real-time-1973]

## 태스크와 스케줄링

Liu와 Layland의 논문은 스케줄링 알고리즘을 특정 시점에 실행할 태스크를 정하는 규칙의 집합으로 정의했다.[@liu-hard-real-time-1973] 이 논문의 가정과 태스크 모델은 [[periodic-task-model|주기 태스크 모델]], 실행 시간의 상한은 [[worst-case-execution-time|WCET]], 스케줄링 방식은 [[real-time-scheduling|실시간 스케줄링]]에서 다룬다.

[[autosar|AUTOSAR]]의 Timing Analysis and Design 보고서에 따르면 실행 시간의 최악, 최선, 평균 가운데 실시간 시스템의 타이밍 속성을 검증하는 데 가장 흔히 쓰는 것은 최악인 WCET이고, [[schedulability-analysis|타이밍 분석]]은 대개 응답 시간의 상한인 [[response-time-analysis|최악 응답 시간]]을 구해 타이밍 요구를 채우는지 가린다.[@autosar-fo-tr-timinganalysis-2025]

[[rtos|RTOS]]는 실행 준비가 된 태스크 가운데 어느 것을 실행할지 정해 CPU를 배정하는 스케줄러를 둔다.[@atmel-at04056-2014][@renesas-res05b0008-2010]

Renesas 앱노트에 따르면 RTOS의 응답성은 처리 속도가 아니라 결정적 동작에 달려 있고, 정해진 시간 안에 응답한다고 해서 빠르다는 뜻은 아니다.[@renesas-res05b0008-2010] 실시간 시스템에서는 시간 동작이 결정적이어서, 태스크가 언제 실행될지 미리 예측할 수 있어야 한다.[@atmel-at04056-2014][@renesas-res05b0008-2010]

## 차량

FreeRTOS 문서에 따르면 RTOS는 의료 기기나 차량 ECU처럼 엄격한 시간 제약 안에서 외부 사건에 반응해야 하는 임베디드 시스템에 흔히 쓰인다.[@freertos-rtos-fundamentals-2026]

[[autosar-classic-platform|AUTOSAR Classic Platform]] R25-11의 Timing Extensions 명세는 주어진 시간 요구를 채우는 임베디드 실시간 시스템을 만들고 그 타이밍을 분석·검증하도록 돕는 것을 주목적으로 둔다. 이 명세는 센서 샘플링에서 액추에이터 접근까지의 인과 경로를 [[autosar-event-chain|event chain]]으로 기술하고, event chain의 자극과 응답 사이 시간을 지연 제약(LatencyTimingConstraint)으로 제한한다.[@autosar-cp-tps-timingextensions-2025]

![[diagrams/event-chain-latency-constraint.svg]]

## 임베디드 시스템과의 관계

IEC 60050은 임베디드 시스템을 더 큰 시스템 안에서 특정 기능을 하도록 설계한 데이터 처리 시스템으로 정의하고, 흔히 실시간 제약이 따른다는 주석을 둔다.[@iec-60050-171-09-10-2019] 실시간은 이와 별도의 항목으로 정의한다.[@iec-60050-171-05-53-2019]
