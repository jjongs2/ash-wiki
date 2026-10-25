---
title: Client-server 인터페이스
tags:
  - platform/autosar
verified: 2026-09-30
---

**Client-server 인터페이스**는 클라이언트가 서버에서 호출할 수 있는 operation들을 선언하는 port interface다.[@autosar-cp-tps-softwarecomponenttemplate-2025] 서버는 operation을 제공하는 [[software-component-port#P-Port와 R-Port|P-Port]]를, 클라이언트는 그것을 요구하는 R-Port를 가진다. [[autosar-rte|RTE]]는 여러 클라이언트가 같은 서버 operation을 호출하는 n:1 통신을 지원한다.[@autosar-cp-sws-rte-2025]

## Operation과 argument

client-server 인터페이스는 operation을 하나 이상 가진다.[@autosar-cp-sws-rte-2025] operation은 argument를 0개 이상 가지며, argument마다 방향을 in, out, inout 가운데 하나로 반드시 정한다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

**application error**는 client-server 인터페이스에 possible error로 정의되고, operation은 그 가운데 자기가 일으킬 수 있는 것을 참조한다. application error는 이름과 오류 코드를 가지며, 오류 코드는 1에서 63 사이다. 0은 E_OK를 나타낼 때만 쓴다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

`Rte_Call`은 [[runnable-entity#Access point|server call point]]가 반환값을 두지 않도록 정한 경우를 빼면 Std_ReturnType을 돌려준다. 반환값은 성공이면 RTE_E_OK이고, RTE가 호출 중에 감지한 인프라 오류를 알린다. 동기 호출이면 서버가 실행되는 동안의 인프라 오류와 application error도 알린다.[@autosar-cp-sws-rte-2025]

## 동기 호출과 비동기 호출

동기 호출에서 클라이언트는 요청을 넘긴 뒤 서버의 응답을 받을 때까지 막힌다. 비동기 호출에서 클라이언트는 요청을 넘긴 뒤 막히지 않고, 결과는 나중에 `Rte_Result`로 받는다.[@autosar-cp-sws-rte-2025] 클라이언트 [[runnable-entity|runnable]]의 synchronous server call point는 runnable이 서버의 응답을 막힌 채 기다린다는 뜻이다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

![[diagrams/client-server-sync-async-call.svg]]

[[rte-event#종류|AsynchronousServerCallReturnsEvent]]가 runnable을 가리키면, RTE는 결과가 준비되거나 타임아웃을 감지했을 때 그 runnable을 시작한다.[@autosar-cp-sws-rte-2025]

server call point의 timeout 속성은 서버 호출이 시간 초과로 오류를 내며 돌아오기까지의 시간(초)이다.[@autosar-cp-tps-softwarecomponenttemplate-2025] 응답이 그 안에 오지 않으면 동기 호출은 `Rte_Call`이, 비동기 호출은 `Rte_Result`가 RTE_E_TIMEOUT을 돌려준다. `Rte_Call`에서 응답 시간 초과를 알리는 RTE_E_TIMEOUT은 태스크 사이와 ECU 사이의 동기 호출에만 해당한다.[@autosar-cp-sws-rte-2025]

## 서버 runnable의 실행 context

서버 runnable은 [[rte-event|RTE 이벤트]] 가운데 OperationInvokedEvent로만 시작된다. OperationInvokedEvent를 [[osek-task|태스크]]나 [[osek-isr#Category 2|category 2 ISR]]에 [[rte-event#태스크 매핑|매핑]]하면 서버는 그 태스크에서 실행되고, RTE는 들어온 요청을 큐에 넣어 받은 순서대로 하나씩 처리한다.[@autosar-cp-sws-rte-2025]

OperationInvokedEvent를 태스크나 ISR에 매핑하지 않으면, 서버는 직접 함수 호출이나 [[autosar-os-application#Trusted function|trusted function call]]로 실행된다. 이때 서버 runnable은 호출한 쪽의 context, 곧 server call point를 가진 클라이언트 runnable의 태스크에서 실행된다.[@autosar-cp-sws-rte-2025]

RTE 생성기는 아래 조건을 모두 채우면 이 통신을 직접 함수 호출로 구현한다.[@autosar-cp-sws-rte-2025]

- 서버 runnable의 [[runnable-entity#동시 호출|canBeInvokedConcurrently]]가 참이다.
- 클라이언트와 서버가 같은 파티션에 있다.
- server call point가 동기다.
- OperationInvokedEvent가 태스크에 매핑되지 않았다.[@autosar-cp-sws-rte-2025]

클라이언트와 서버가 서로 다른 파티션에 있고 나머지 조건이 같으면, RTE 생성기는 이 통신을 trusted function call로 구현한다. canBeInvokedConcurrently가 거짓이어도 태스크 매핑상 서버가 병렬로나 재진입으로 불릴 수 없으면, RTE 생성기는 직접 함수 호출이나 trusted function call로 구현해도 된다.[@autosar-cp-sws-rte-2025]
