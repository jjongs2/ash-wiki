---
title: Mode switch 인터페이스
tags:
  - platform/autosar
verified: 2026-09-30
---

**Mode switch 인터페이스**는 mode manager가 실제 모드 전환을 mode user에게 알리는 데 쓰는 port interface다. 인터페이스는 mode declaration group prototype을 많아야 하나 가진다. mode user는 현재 모드를 읽거나, 모드가 바뀔 때 [[runnable-entity|runnable]]을 시작하거나, 특정 모드에서 runnable의 시작을 막을 수 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## Mode declaration group

**mode declaration group**은 mode declaration의 모음이며, 모드 전환이 일어나기 전에 활성인 초기 모드를 그 가운데 하나로 반드시 가리킨다. mode declaration group의 모드들은 계층 없는 상태 기계를 이루고, 한 시점에 활성일 수 있는 모드는 하나다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

runnable이 도는 동안에는 mode declaration group prototype마다 모드 하나나 모드 전환 하나가 활성이다. 전환 중에는 `Rte_Mode`가 `RTE_TRANSITION_<ModeDeclarationGroup>`을 돌려준다.[@autosar-cp-sws-rte-2025]

## Mode manager와 mode user

모드를 내는 쪽인 **mode manager**는 [[software-component-port|P-Port]]를 두고, 그 모드를 쓰는 쪽인 **mode user**는 R-Port를 둔다. mode switch 통신은 mode manager 하나에서 여러 mode user로 가는 1:n 연결을 지원하고, [[autosar-rte|RTE]]는 한 mode user에 mode manager 여럿을 잇는 n:1 연결을 거부한다. [[autosar-software-component|SW-C]]도 mode manager가 될 수 있다.[@autosar-cp-sws-rte-2025]

BSW(Basic Software)에서는 BswM(BSW Mode Manager)이 mode manager의 예로, SW-C와 다른 BSW 모듈의 모드 요청을 설정된 규칙으로 중재하고 그 결과에 따라 모드를 전환한다.[@autosar-cp-sws-rte-2025][@autosar-cp-sws-bswmodemanager-2025]

mode manager는 `Rte_Switch_<p>_<o>(<mode>)`로 다음 모드를 넘겨 모드 전환을 시작한다.[@autosar-cp-sws-rte-2025] 모드를 전환하는 mode manager의 runnable은 자기가 전환하는 mode declaration group prototype을 **mode switch point**로 선언한다.[@autosar-cp-tps-softwarecomponenttemplate-2025] RTE는 mode switch point가 있으면 `Rte_Switch` API를 만들고, 그 API는 해당 mode switch point를 가진 runnable만 쓸 수 있다.[@autosar-cp-sws-rte-2025]

RTE는 mode switch notification을 담는 FIFO(First-In First-Out) 큐를 mode machine instance마다 둔다. 큐 길이는 ECU 설정 파라미터 `RteModeSenderQueueLength`로 정하고, 이 값이 없으면 mode manager 쪽 com spec의 queueLength로 정한다. 전환 중에 온 요청은 큐에 쌓이고, 큐가 차 있으면 버려지며 `Rte_Switch`는 RTE_E_LIMIT을 돌려준다.[@autosar-cp-sws-rte-2025]

mode user와 mode manager는 `Rte_Mode_<p>_<o>`로 현재 활성인 모드를 읽는다.[@autosar-cp-sws-rte-2025] 현재 모드를 읽어야 하는 runnable은 **mode access point**를 정의한다.[@autosar-cp-tps-softwarecomponenttemplate-2025] RTE는 mode access point가 있으면 `Rte_Mode` API를 만들고, 그 API는 해당 mode access point를 가진 runnable만 쓸 수 있다.[@autosar-cp-sws-rte-2025]

## 모드 전환 때 시작하는 runnable

SwcModeSwitchEvent는 지정한 모드에 들어갈 때, 그 모드에서 나올 때, 또는 지정한 두 모드 사이를 전환할 때 runnable을 시작한다.[@autosar-cp-tps-softwarecomponenttemplate-2025] 이 가운데 어느 때인지는 on-entry, on-exit, on-transition 가운데 하나로 정한다.[@autosar-cp-sws-rte-2025]

모드 전환 중에 RTE는 이전 모드의 on-exit runnable, 두 모드 사이의 on-transition runnable, 새 모드의 on-entry runnable 순서로 실행한다. 이 순서는 같은 코어에 있는 mode user의 무리 안에서 지키고, 코어가 다른 무리끼리는 병렬로 실행할 수 있다.[@autosar-cp-sws-rte-2025]

mode manager의 제공 쪽에 acknowledgement를 켜면 RTE는 전환이 끝날 때 ModeSwitchedAckEvent를 일으키고, 이 이벤트는 mode manager의 runnable을 시작할 수 있다. RTE가 시간 초과를 감지해도 이 이벤트가 일어난다.[@autosar-cp-sws-rte-2025]

## 모드에 따른 비활성화

[[rte-event|RTE 이벤트]]에 disabled mode를 걸 수 있고, 그 모드가 활성인 동안에는 그 이벤트가 runnable을 시작하지 않는다.[@autosar-cp-tps-softwarecomponenttemplate-2025][@autosar-cp-sws-rte-2025] 이 비활성화는 그 모드 동안뿐 아니라 그 모드로 들어가는 전환과 그 모드에서 나오는 전환 동안에도 걸리며, 이미 돌고 있는 runnable을 멈추지는 않는다. 전형적인 쓰임은 어떤 모드에서 쓸 수 없는 자원을 쓰는 시간 구동 runnable을 그 모드에서 막는 것이다.[@autosar-cp-sws-rte-2025]

![[diagrams/mode-switch-transition-order.svg]]
