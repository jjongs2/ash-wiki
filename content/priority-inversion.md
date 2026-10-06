---
title: 우선순위 역전
tags:
  - platform/rtos
verified: 2026-09-30
---

**우선순위 역전**(priority inversion)은 높은 우선순위 태스크의 실행이 더 낮은 우선순위 태스크 때문에 늦어지는 상황이다. 우선순위 기반 [[real-time-scheduling#선점|선점형 스케줄링]]에서 우선순위가 다른 태스크들이 공유 자원을 두고 다툴 때 생길 수 있다.[@sha-real-time-scheduling-ada-1989][@davari-unbounded-priority-inversions-1992]

[[ieee-1003-1|POSIX.1]]-2024는 우선순위 역전을, 스스로 멈추지 않은(사건이나 시간 지연을 기다리지 않는) 스레드가 실행되지 못하는 동안 더 낮은 우선순위 스레드가 실행되는 상태로 정의한다. 높은 우선순위 스레드가 이렇게 블록되는 것은 흔히 공유 자원을 두고 다투기 때문이다.[@ieee-1003-1-definitions-2024]

## 생기는 과정

태스크 T1, T2, T3의 우선순위가 이 순서로 높다고 하자. 단일 프로세서에서 T3가 [[semaphore|세마포어]]로 보호한 [[critical-section|임계 구역]]을 실행하는 동안 T1이 준비되면, T1이 T3를 선점한다. T1이 같은 세마포어를 요청하면 블록된다.[@sha-real-time-scheduling-ada-1989][@davari-unbounded-priority-inversions-1992]

우선순위 역전은 완전히 없앨 수 없다. 낮은 우선순위 태스크가 임계 구역에 있는 동안에는 그 공유 데이터가 필요한 높은 우선순위 태스크가 기다려야 한다.[@sha-real-time-scheduling-ada-1989][@davari-unbounded-priority-inversions-1992] FreeRTOS 책에 따르면 작은 임베디드 시스템에서는 설계 단계에서 자원에 어떻게 접근하는지 살펴 우선순위 역전을 흔히 피할 수 있다.[@freertos-resource-management-2026]

Linux 커널의 계수 세마포어에는 소유자 개념이 없어, [[preempt-rt|PREEMPT_RT]]도 세마포어에는 우선순위 상속을 줄 수 없다. 그래서 세마포어에서 블록되면 우선순위 역전이 생길 수 있다.[@linux-locktypes-2026]

## 제한 없는 우선순위 역전

T1이 블록된 동안 T1, T3와 자원을 공유하지 않는 T2가 준비되면 T2가 T3를 선점하고, 그동안 T1도 실행되지 못한다. T1의 블로킹은 T2와 대기 중인 다른 중간 우선순위 태스크가 모두 끝날 때까지 이어진다. 그래서 T1의 블로킹 시간은 중간 우선순위 태스크들의 실행 시간에 달려 있어, 임계 구역 길이로 제한되지 않고 얼마든지 길어질 수 있다.[@sha-real-time-scheduling-ada-1989][@davari-unbounded-priority-inversions-1992] 이처럼 역전 시간이 임계 구역 길이로 제한되지 않을 때를 **제한 없는 우선순위 역전**(unbounded priority inversion)이라 한다.[@davari-unbounded-priority-inversions-1992]

![[diagrams/priority-inversion-unbounded-timeline.svg]]

[[priority-inheritance-protocol|기본 우선순위 상속 프로토콜]]과 [[priority-ceiling-protocol|우선순위 상한 프로토콜]]은 모두 제한 없는 우선순위 역전 문제를 푼다.[@sha-priority-inheritance-1990] 태스크가 이진 세마포어로 임계 구역을 보호하는 단일 프로세서에서, 우선순위 상한 프로토콜은 높은 우선순위 태스크의 최악 블로킹 시간을 더 낮은 우선순위 태스크의 임계 구역 하나를 실행하는 시간 이하로 줄이고, [[deadlock|교착 상태]]를 막는다. 이 프로토콜을 쓰는 [[periodic-task-model|주기 태스크]] 집합은 태스크마다 최악 블로킹 시간을 넣은 충분조건으로 [[rate-monotonic-scheduling|rate monotonic]] 스케줄 가능성을 판정할 수 있다.[@sha-real-time-scheduling-ada-1989][@sha-priority-inheritance-1990]

POSIX 근거 설명에 따르면 기본 우선순위 상속 프로토콜은 우선순위 역전을 임계 구역 길이로 제한해 타이밍 분석을 가능하게 한다.[@ieee-1003-1-rationale-mutex-scheduling-attributes-2024]

## Mars Pathfinder의 리셋

JPL(Jet Propulsion Laboratory)은 Mars Pathfinder가 화성에 내린 뒤 우주선 컴퓨터가 리셋되는 문제를 겪었고, 실험실에서 같은 활동을 되풀이해 문제를 재현한 끝에 원인이 우선순위 역전임을 밝혔다. 역전이 일어난 자원은 VxWorks의 `select()`가 기다릴 파일 디스크립터 목록을 보호하려고 만드는 상호 배제 세마포어였다. 기상 관측 장비의 데이터를 받는 낮은 우선순위 태스크가 이 세마포어를 쥔 채 여러 중간 우선순위 태스크에 선점된 사이, 버스에서 모은 데이터를 나눠 주는 높은 우선순위 태스크가 같은 세마포어에서 블록돼 그 주기의 실행을 끝내지 못했다. 주기마다 이를 점검하는 더 높은 우선순위의 버스 스케줄링 태스크가 다음 주기를 준비하러 깨어나 이를 오류로 선언했고, 우주선은 그 대응으로 컴퓨터를 리셋했다. JPL은 `select()`가 쓰는 세마포어의 생성 옵션을 정하는 전역 변수를 바꿔 우선순위 상속을 켜는 방식으로 문제를 고쳤고, 이 변경을 탑재 소프트웨어와의 차이만 우주선에 보내는 패치로 반영했다.[@reeves-what-really-happened-on-mars-1998]
