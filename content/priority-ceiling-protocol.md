---
title: 우선순위 상한 프로토콜
tags:
  - platform/rtos
aliases:
  - PCP
  - IPCP
verified: 2026-09-30
---

**우선순위 상한 프로토콜**(priority ceiling protocol)은 자원(세마포어)마다 그것을 잠글 수 있는 모든 태스크 가운데 가장 높은 우선순위를 **우선순위 상한**(priority ceiling)으로 두고, 이 값으로 임계 구역 진입과 태스크의 우선순위를 다루는 실시간 동기화 프로토콜이다.[@sha-real-time-scheduling-ada-1989] 태스크가 이진 세마포어로 임계 구역을 보호하는 단일 프로세서에서, 이 프로토콜은 태스크의 최악 블로킹 시간을 더 낮은 우선순위 태스크의 [[critical-section|임계 구역]] 하나를 실행하는 시간 이하로 줄이고, [[deadlock|교착 상태]]를 막는다.[@sha-real-time-scheduling-ada-1989][@sha-priority-inheritance-1990] Sha, Rajkumar, Lehoczky는 1987년 Carnegie Mellon University 기술 보고서(CMU-CS-87-181)에서 [[priority-inheritance-protocol|기본 우선순위 상속 프로토콜]]과 함께 이 프로토콜을 정의하고, 교착 상태를 막고 블로킹을 제한한다는 성질을 보였다.[@sha-real-time-scheduling-ada-1989][@borger-implementing-priority-inheritance-1989] 이 보고서는 1990년 IEEE Transactions on Computers 논문으로 실렸다.[@sha-real-time-scheduling-ada-1989][@sha-priority-inheritance-1990]

## 원형 프로토콜

태스크는 자기 우선순위가, 다른 태스크들이 지금 잠근 모든 세마포어의 우선순위 상한보다 높을 때만 임계 구역에 들어갈 수 있고, 그렇지 않으면 블록된다. 이때 상한이 가장 높은 세마포어를 쥔 태스크가 블록된 태스크의 우선순위를 물려받는다. 그래서 원형 프로토콜은 임계 구역에 들어가려는 시점에 상한과 비교해 허용 여부를 정하고, 다른 태스크를 블록시킬 때만 우선순위를 올린다. 임계 구역에 들어가려 하지 않는 동안 태스크는 제 우선순위로 실행된다.[@sha-real-time-scheduling-ada-1989]

## 자원을 잡는 즉시 올리는 방식

자원을 잡는 즉시 태스크의 우선순위를 그 자원의 우선순위 상한으로 올리고, 자원을 놓으면 되돌리는 방식도 있다.[@osek-os-2-2-3-2005][@ieee-1003-1-pthread-mutexattr-getprotocol-2024]

POSIX.1-2024는 [[mutex|뮤텍스]]의 우선순위 상한을 그 뮤텍스를 잠글 수 있는 모든 스레드 가운데 가장 높은 우선순위 이상으로 두게 한다.[@ieee-1003-1-preface-2024][@ieee-1003-1-pthread-mutexattr-getprioceiling-2024] 또 뮤텍스 속성 protocol이 `PTHREAD_PRIO_PROTECT`이면, 뮤텍스를 쥔 스레드가 다른 스레드가 블록되었는지와 상관없이 자기 우선순위와 쥔 뮤텍스들의 우선순위 상한 가운데 가장 높은 값으로 실행되도록 정한다.[@ieee-1003-1-pthread-mutexattr-getprotocol-2024] POSIX 근거 설명은 이 방식을 우선순위 상한 프로토콜 에뮬레이션(priority ceiling protocol emulation)이라 부른다.[@ieee-1003-1-rationale-threads-2024]

RTEMS(Real-Time Executive for Multiprocessor Systems) 문서는 이 방식을 ICPP(Immediate Ceiling Priority Protocol)라 부른다. 이 문서에 따르면 ICPP는 상한을 그 뮤텍스를 얻으려 할 스레드 가운데 가장 높은 우선순위로 정해야 해서 애플리케이션 전체를 알아야 하고, 크고 복잡한 시스템에서는 그 스레드를 가려내기 어려울 수 있으며, 우선순위 상속 프로토콜은 이런 사전 정보가 필요 없다.[@rtems-key-concepts-2025]

OSEK/VDX OS 2.2.3 명세는 resource 관리에 이 방식인 OSEK 우선순위 상한 프로토콜을 쓰게 한다. 상한은 시스템을 생성하는 단계에서 고정되고, resource에 접근하는 태스크 가운데 가장 높은 우선순위보다 낮지 않다. 같은 resource를 쓰는 태스크는 쥔 쪽보다 우선순위가 높을 수 없어 그동안 실행되지 못하므로, 이미 쥔 resource를 다른 태스크가 요청하는 일이 아예 일어나지 않는다.[@osek-os-2-2-3-2005] OSEK의 규칙은 [[osek-resource|OSEK resource]]에서 다룬다.

원형 프로토콜은 다른 태스크를 블록시킬 때만 우선순위를 올리고[@sha-real-time-scheduling-ada-1989], 자원을 잡는 즉시 올리는 방식은 블록된 태스크가 있든 없든 올린다.[@ieee-1003-1-pthread-mutexattr-getprotocol-2024] OSEK/VDX OS 2.2.3 명세는 이 방식이 상한 이하의 우선순위를 가진 태스크를, 그 resource를 쓰지 않아도 기다리게 할 수 있다고 밝히고, 그 대기가 더 낮은 우선순위 태스크가 resource를 쥐는 가장 긴 시간을 넘지 않는다고 정한다.[@osek-os-2-2-3-2005]

![[diagrams/priority-ceiling-original-vs-immediate.svg]]
