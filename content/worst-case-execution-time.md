---
title: 최악 실행 시간
tags:
  - platform/rtos
aliases:
  - WCET
verified: 2026-09-29
---

AUTOSAR 용어집은 **최악 실행 시간**(WCET, Worst-Case Execution Time)을 프로그램이 실제로 실행되는 시간 가운데 가능한 최댓값으로 정의한다.[@autosar-fo-tr-glossary-2025] 스케줄 가능성 분석은 태스크의 WCET를 입력으로 쓴다.[@autosar-fo-tr-glossary-2025][@freescale-cwperformwp-2005]

## 실행 시간이 달라지는 까닭

같은 코드라도 캐시 상태에 따라 실행 시간이 달라진다.[@autosar-cp-tps-bswmoduledescriptiontemplate-2025][@microchip-tb3186-2018]

AUTOSAR BSW(Basic Software) 모듈 기술 템플릿에 따르면 실행 시간은 하드웨어 플랫폼, 캐시와 파이프라인 같은 하드웨어 상태, 입력 매개변수와 소프트웨어 상태 같은 논리적 맥락, 호출한 외부 코드에 따라 달라진다. 이 템플릿은 WCET를 유효한 모든 논리적 맥락에 걸쳐 기술하는 경우와 그 일부에 걸쳐 기술하는 경우를 둔다.[@autosar-cp-tps-bswmoduledescriptiontemplate-2025]

Microchip TB3186에 따르면 캐시를 쓰는 시스템에서 코드 성능은 캐시 적중과 실패의 빈도로 정해지고, 버스 마스터가 여럿인 복잡한 실시간 애플리케이션에서는 캐시 실패가 잦아지고 버스 매트릭스 지연이 더해진다.[@microchip-tb3186-2018]

AUTOSAR 타이밍 분석 보고서에 따르면 분기 예측은 같은 코드의 실행 시간을 달라지게 하고 WCET 분석을 복잡하고 지나치게 비관적으로 만들 수 있으며, 파이프라인 때문에 실행 시간을 계산할 때 명령어 순서를 따져야 한다.[@autosar-fo-tr-timinganalysis-2025]

FAA 보고서 DOT/FAA/TC-19/22에 따르면 프로세서 설계는 평균값으로 재는 IPC(Instructions Per Cycle)를 높이는 쪽으로 발전해 왔다. 분기 예측 같은 추측 실행은 파이프라인을 채워 두어 IPC를 크게 높이지만, 명령어 열의 WCET를 알아내기 어렵게 만든다.[@faa-tc-19-22-2019]

여러 소프트웨어가 캐시, 버스와 인터커넥트, 메모리 같은 자원을 함께 쓰면, 한 소프트웨어의 자원 접근 시간이 함께 실행되는 다른 소프트웨어에 따라 달라진다.[@microchip-tb3186-2018][@arm-ddi-0598-2022] FAA의 AC 20-193에 따르면 멀티코어 프로세서에서 다른 코어의 소프트웨어가 동시에 실행되면 메모리, 캐시, 인터커넥트 같은 공유 자원의 경합으로 시간 간섭이 생겨 WCET가 크게 늘 수 있다. 이 AC는 시간 간섭을 완화했음을 보이지 못한 소프트웨어의 WCET를, 모든 소프트웨어가 최종 구성으로 함께 실행되는 대상 프로세서에서 분석으로 정하고 시험으로 확인하기를 권한다.[@faa-ac-20-193-2024]

## 측정과 정적 분석

AUTOSAR 타이밍 분석 보고서에 따르면 측정은 쓴 입력 데이터가 어느 분기를 밟았느냐에 따라 값이 달라져 평균이나 분포만 줄 수 있고, 실행 시간의 상한은 정적 분석으로 얻는다. 측정과 시뮬레이션의 최댓값은 실제로 관측한 값이고, 분석이 내는 최악값은 분석 알고리즘 때문에 과대평가되기도 한다. 최악값은 실행 중에 가질 수 있는 모든 값의 상한이므로, 실제 시스템에서 관측한 최댓값보다 작을 수 없다. 이 보고서는 분석이 최악값 같은 단일 값을 내고, 시뮬레이션과 측정은 실행 시간의 분포를 낸다고 나눈다. 정적 코드 분석은 소스 코드나 바이너리에서 호출 그래프와 명령어 순서를 재구성해 BCET(Best-Case Execution Time)의 하한과 WCET의 상한을 계산하며, 메모리 영역별 접근 시간이나 캐시 같은 대상 하드웨어의 동작을 자세히 알아야 한다. 코드 조각이 인터럽트되지 않는 한 실제 실행 시간은 이 구간 안에 든다. WCET 분석은 안전하면서도 정확한 값을 내야 하고, 하드웨어 동작 모델이 복잡하면 결과의 정밀도에 한계가 생길 수 있다.[@autosar-fo-tr-timinganalysis-2025]

![[diagrams/wcet-analysis-measurement-bounds.svg]]

측정이 서로 독립이고, 표본이 여러 환경 조건에 걸쳐 있으며, 일반화할 만큼 크면, 측정한 실행 시간 표본으로 확률 밀도 모델을 세워 정한 신뢰 수준에서 WCET를 추정할 수 있다.[@edgar-statistical-wcet-2001]

## 선점과 실행 시간

AUTOSAR는 실행 시간을 선점되거나 중단된 시간, 태스크 전환, 다른 소프트웨어의 실행을 뺀, 실제로 실행된 시간으로 둔다.[@autosar-fo-tr-glossary-2025][@autosar-fo-tr-timinganalysis-2025]

AUTOSAR R25-11 타이밍 확장 명세는 다른 개체가 끼어든 시간과 외부 호출까지 포함해 실행을 끝내기까지 걸린 시간을 응답 시간이라 부른다. 이 명세의 실행 시간 제약(ExecutionTimeConstraint)은 실행 시간의 종류로 net과 gross를 둔다. 둘 다 다른 개체가 끼어든 시간을 빼고, gross는 외부 호출에 쓴 시간을 포함하며 net은 포함하지 않는다.[@autosar-cp-tps-timingextensions-2025]

![[diagrams/execution-time-net-gross-response.svg]]
