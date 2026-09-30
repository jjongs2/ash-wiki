---
title: 우선순위 역전
tags:
  - platform/rtos
verified: 2026-09-30
---

**우선순위 역전**(priority inversion)은 높은 우선순위 태스크의 실행이 더 낮은 우선순위 태스크 때문에 늦어지는 상황이다. 우선순위 기반 선점형 스케줄링에서 우선순위가 다른 태스크들이 공유 자원을 두고 다툴 때 생길 수 있다.[@sha-real-time-scheduling-ada-1989][@davari-unbounded-priority-inversions-1992]

## 구조·동작

### 생기는 과정

태스크 T1, T2, T3의 우선순위가 이 순서로 높다고 하자. 단일 프로세서에서 T3가 세마포어로 보호한 [[critical-section|임계 구역]]을 실행하는 동안 T1이 준비되면, T1이 T3를 선점한다. T1이 같은 세마포어를 요청하면 블록된다.[@sha-real-time-scheduling-ada-1989][@davari-unbounded-priority-inversions-1992]

### 제한 없는 우선순위 역전

T1이 블록된 동안 T1, T3와 자원을 공유하지 않는 T2가 준비되면 T2가 T3를 선점하고, 그동안 T1도 실행되지 못한다.[@sha-real-time-scheduling-ada-1989][@davari-unbounded-priority-inversions-1992][@lampson-processes-monitors-mesa-1980] T1의 블로킹은 T2와 대기 중인 다른 중간 우선순위 태스크가 모두 끝날 때까지 이어진다. 그래서 T1의 블로킹 시간은 중간 우선순위 태스크들의 실행 시간에 달려 있어, 임계 구역 길이로 제한되지 않고 얼마든지 길어질 수 있다.[@sha-real-time-scheduling-ada-1989][@davari-unbounded-priority-inversions-1992] 이처럼 역전 시간이 임계 구역 길이로 제한되지 않을 때를 **제한 없는 우선순위 역전**(unbounded priority inversion)이라 한다.[@davari-unbounded-priority-inversions-1992]

![[diagrams/priority-inversion-unbounded-timeline.svg]]

## 비교·한계

우선순위 역전은 완전히 없앨 수 없다. 낮은 우선순위 태스크가 임계 구역에 있는 동안에는 그 공유 데이터가 필요한 높은 우선순위 태스크가 기다려야 한다.[@sha-real-time-scheduling-ada-1989][@davari-unbounded-priority-inversions-1992]

[[priority-inheritance-protocol|기본 우선순위 상속 프로토콜]]과 [[priority-ceiling-protocol|우선순위 상한 프로토콜]]은 모두 제어되지 않는 우선순위 역전 문제를 푼다.[@sha-priority-inheritance-1990] 태스크가 이진 세마포어로 임계 구역을 보호하는 단일 프로세서에서, 우선순위 상한 프로토콜은 높은 우선순위 태스크의 최악 블로킹 시간을 더 낮은 우선순위 태스크의 임계 구역 하나를 실행하는 시간 이하로 줄이고, [[deadlock|교착 상태]]를 막는다. 이 프로토콜을 쓰는 주기 태스크 집합은 태스크마다 최악 블로킹 시간을 넣은 충분조건으로 rate monotonic 스케줄 가능성을 판정할 수 있다.[@sha-real-time-scheduling-ada-1989][@sha-priority-inheritance-1990]

POSIX 근거 설명에 따르면 기본 우선순위 상속 프로토콜은 우선순위 역전을 임계 구역 길이로 제한해 타이밍 분석을 가능하게 한다.[@ieee-1003-1-preface-2024][@ieee-1003-1-rationale-threads-2024]
