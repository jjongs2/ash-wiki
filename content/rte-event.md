---
title: RTE 이벤트
tags:
  - platform/autosar
verified: 2026-09-30
---

**RTE 이벤트**(RTEEvent)는 [[autosar-rte|RTE]]가 [[runnable-entity|runnable]]을 시작하는 계기다. RTE만이 runnable의 실행을 촉발하며, 여러 RTE 이벤트에 응해 촉발한다.[@autosar-cp-sws-rte-2025] RTE 이벤트는 [[autosar-software-component|SW-C]]의 internal behavior에 속하며, 자신이 일어나는 계기와 일어났을 때 시작할 runnable을 정한다. 가리키는 runnable은 많아야 하나이고, 한 runnable은 여러 RTE 이벤트로 시작될 수 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## 종류

RTE 이벤트는 열여섯 종류다. 종류마다 runnable을 시작하는 때는 아래와 같다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

| 계기        | 이벤트                             | runnable을 시작하는 때                                                                          |
| ----------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| 시간        | TimingEvent                        | 정해진 주기(초 단위)마다                                                                        |
| 시간        | BackgroundEvent                    | 백그라운드에서 실행할 때                                                                        |
| 시작        | InitEvent                          | 파티션을 시작하거나 다시 시작할 때처럼 초기화할 때                                              |
| 태스크      | OsTaskExecutionEvent               | 이 이벤트를 매핑한 태스크가 실행될 때마다                                                       |
| 데이터 수신 | DataReceivedEvent                  | 참조한 data element를 받았을 때                                                                 |
| 데이터 수신 | DataReceiveErrorEvent              | COM 계층이 참조한 data element의 수신 오류를 알렸을 때                                          |
| 데이터 송신 | DataSendCompletedEvent             | 명시적으로 쓴 data element의 송신이 끝났거나 오류가 났을 때                                     |
| 데이터 송신 | DataWriteCompletedEvent            | 암묵적 쓰기가 성공했거나 오류가 났을 때                                                         |
| 서버 호출   | OperationInvokedEvent              | 클라이언트가 operation 실행을 요청했을 때(서버 runnable)                                        |
| 서버 호출   | AsynchronousServerCallReturnsEvent | 비동기 서버 호출이 끝났을 때                                                                    |
| 모드        | SwcModeSwitchEvent                 | 지정한 모드에 들어가거나 나올 때, 또는 지정한 두 모드 사이를 전환할 때                          |
| 모드        | ModeSwitchedAckEvent               | mode manager가 요청한 모드 전환이 처리되었거나 오류가 났을 때                                   |
| 모드        | SwcModeManagerErrorEvent           | mode manager가 다루는 모드 그룹을 처리하다 오류가 났을 때                                       |
| trigger     | ExternalTriggerOccurredEvent       | R-Port로 참조한 trigger가 일어났을 때                                                           |
| trigger     | InternalTriggerOccurredEvent       | 참조한 internal triggering point가 일어났을 때                                                  |
| 변환 오류   | TransformerHardErrorEvent          | 서버 operation이나 external trigger를 일으킬 데이터를 변환하다 hard transformer error가 났을 때 |

background event는 고정된 주기 없이 되풀이해 일어나며, 보통 가장 낮은 우선순위로만 활성화된다. RTE는 background event를 전용 백그라운드 태스크로 구현하거나, 알람이나 schedule table 만료점으로 ECU 통합자가 정한 고정 반복에 따라 timing event처럼 구현한다. 백그라운드 태스크로 구현하면 그 태스크는 코어에서 가장 낮은 우선순위여야 한다.[@autosar-cp-sws-rte-2025]

RTE는 `Rte_Start`를 실행할 때 init event로 촉발되는 runnable을 한 번 활성화한다.[@autosar-cp-sws-rte-2025] 그렇다고 init event가 가리키는 runnable이 다른 runnable보다 먼저 실행된다는 보장은 없고, 실행 순서는 태스크 매핑에 달려 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

external trigger occurred event는 trigger source인 SW-C나 BSW(Basic Software) 모듈이 trigger를 일으켰을 때, 연결된 trigger sink의 runnable을 시작한다. internal trigger occurred event는 같은 SW-C 인스턴스의 runnable이 internal triggering point로 trigger를 일으켰을 때 시작한다.[@autosar-cp-sws-rte-2025]

os task execution event는 조건 없이 runnable을 시작하며, 주된 용도는 태스크 실행에 반응해야 하는 complex driver의 runnable이다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## 태스크 매핑

RTE 모듈의 ECU 설정에서 `RteEventToTaskMapping` 컨테이너는 runnable 인스턴스를, 그것을 시작하는 RTE 이벤트에 따라 [[osek-task|태스크]] 하나에 매핑한다. `RteMappedToTaskRef`는 매핑할 태스크를 가리킨다. 태스크를 가리키지 않으면 그 runnable은 직접 함수 호출이나 trusted function call로 실행된다.[@autosar-cp-sws-rte-2025]

`RtePositionInTask`는 태스크에 매핑된 runnable이 태스크 실행 안에서 차지하는 위치다. 주기로 실행하는 태스크는 이 순서대로 runnable을 실행하고, 이벤트로 활성화되는 runnable을 담은 태스크는 이 순서대로 실행할 runnable을 평가한다.[@autosar-cp-sws-rte-2025]

![[diagrams/rte-event-runnable-task-mapping.svg]]

RTE 생성기는 runnable이 매핑된 태스크의 본문을 만들고, 태스크 본문은 runnable 호출을 담는다. 태스크 자체는 만들지 않으며, 매핑은 RTE 설정의 일부로 생성기에 입력된다. RTE는 `SetEvent`나 `ActivateTask` 같은 운영체제 서비스를 불러 태스크를 직접 활성화하거나 재개한다. 시간 기반 활성화에서는 알람을 초기화하거나 schedule table을 시작해 태스크를 간접적으로 활성화한다.[@autosar-cp-sws-rte-2025]

## Timing event와 알람

RTE는 timing event를 [[osek-alarm|알람]]이나 schedule table 만료점으로 구현한다. 둘 다 설정하지 않으면 RTE가 골라 구현할 수 있다. `RteUsedOsAlarmRef`는 RTE 이벤트가 매핑된 태스크를 활성화하는 데 쓸 알람을 가리킨다. 이 참조를 설정하고 `RteEventRef`가 timing event를 가리키면, RTE는 그 알람으로 timing event를 구현한다.[@autosar-cp-sws-rte-2025]

`RteActivationOffset`은 `RteEventToTaskMapping`에 두는 초 단위 활성화 오프셋이다. RTE는 한 태스크에 매핑된 runnable의 활성화 오프셋을 지켜야 한다. 이 오프셋은 시간으로 촉발되는 runnable에만 쓰며, 태스크가 공유하는 기준점에서 잰다.[@autosar-cp-sws-rte-2025]
