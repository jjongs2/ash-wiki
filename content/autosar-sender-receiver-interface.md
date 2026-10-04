---
title: Sender-receiver 인터페이스
tags:
  - platform/autosar
verified: 2026-09-30
---

**Sender-receiver 인터페이스**는 보내고 받을 data element를 선언하는 port interface다. sender가 내는 데이터를 receiver 하나 이상이 받는 통신 패턴을 기술한다.[@autosar-cp-tps-softwarecomponenttemplate-2025] 이 인터페이스로 타입을 정한 [[software-component-port#P-Port와 R-Port|P-Port]]는 data element를 쓰고, R-Port는 읽는다. sender-receiver 통신은 한 방향이며, receiver가 보내는 응답은 별도의 sender-receiver 통신으로 보낸다.[@autosar-cp-sws-rte-2025] 이 인터페이스로 타입을 정한 포트는 sender 하나와 receiver 여럿의 1:n으로도, sender 여럿과 receiver 하나의 n:1로도 이을 수 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## Data element

인터페이스는 data element를 여럿 가질 수 있고, data element마다 따로 보낸다.[@autosar-cp-sws-rte-2025] data element는 type 속성으로 자기 데이터 타입을 가리킨다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## Com spec

초기값 같은 통신 속성은 인터페이스가 아니라 포트에 매이며, 포트가 이 속성을 적어 두는 것을 **com spec**이라 한다. com spec은 data element 하나를 가리키고, 두지 않아도 된다. P-Port에는 sender com spec을, R-Port에는 receiver com spec을 둔다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

data element가 큐에 쌓이는지(queued)는 data element의 swImplPolicy가 정한다. swImplPolicy가 queued인 data element는 queued com spec을, 그 밖의 data element는 nonqueued com spec을 쓴다. queued가 아닌 data element는 last-is-best 의미를 따른다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

[[autosar-rte|RTE]]는 queued가 아닌 data element를 receiver 쪽 한 벌에 버퍼링한다. 새 값이 오면 이전 값은 읽혔는지와 상관없이 버리고, 읽기는 늘 마지막으로 받은 값을 돌려준다.[@autosar-cp-sws-rte-2025] data element를 아직 받지 않았는데 값을 읽으면 com spec의 초기값(initValue)을 쓴다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

RTE는 receive 포트에서 queued data element마다 수신 큐를 둔다. 값은 큐의 끝에 넣고 앞에서부터 꺼내 읽는 FIFO(First-In First-Out)다. 큐 길이는 ECU 설정 파라미터 `RteQueuedReceiverQueueLength`로 정하고, 이 값이 없으면 receiver com spec의 queueLength로 정한다. 큐가 가득 찼을 때 새 값이 오면 RTE는 그 값을 버리고 오류 플래그를 세운다.[@autosar-cp-sws-rte-2025]

![[diagrams/sender-receiver-last-is-best-queue.svg]]

[[rte-event|RTE 이벤트]]의 하나인 DataReceivedEvent는 data element와 [[runnable-entity|runnable]]을 가리키며, 새 데이터가 오면 RTE가 그 runnable을 시작한다.[@autosar-cp-sws-rte-2025]

## 명시적 접근과 암묵적 접근

**명시적 접근**은 runnable이 API를 직접 불러 data element를 보내거나 받는 방식으로, 언제 몇 번 보내고 받을지를 runnable이 정한다. queued가 아닌 data element는 `Rte_Write`로 보내고 `Rte_Read`로 읽으며, queued인 data element는 `Rte_Send`로 보내고 `Rte_Receive`로 받는다.[@autosar-cp-sws-rte-2025]

**암묵적 접근**은 `Rte_IRead`로 읽고 `Rte_IWrite`로 쓰는 방식이다. 읽을 때 RTE는 runnable이 시작되기 전에 데이터를 읽어 복사본으로 넘기므로, runnable이 실행되는 동안 그 값은 바뀌지 않는다. 쓴 값은 runnable이 끝난 뒤에 RTE가 보내며, 그보다 먼저 다른 쪽에 보이지 않는다.[@autosar-cp-sws-rte-2025] 암묵적 읽기는 swImplPolicy가 queued인 data element에 쓸 수 없다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

![[diagrams/sender-receiver-explicit-implicit-access.svg]]

runnable은 data element에 어떻게 접근할지를 [[runnable-entity#Access point|access point]]로 선언하며, 접근마다 쓰는 access point와 RTE가 만드는 API는 아래와 같다.[@autosar-cp-tps-softwarecomponenttemplate-2025][@autosar-cp-sws-rte-2025]

| 접근        | access point                   | API                       |
| ----------- | ------------------------------ | ------------------------- |
| 명시적 송신 | data send point                | `Rte_Write`, `Rte_Send`   |
| 명시적 수신 | data receive point by argument | `Rte_Read`, `Rte_Receive` |
| 명시적 수신 | data receive point by value    | `Rte_DRead`               |
| 암묵적 읽기 | data read access               | `Rte_IRead`               |
| 암묵적 쓰기 | data write access              | `Rte_IWrite`              |
