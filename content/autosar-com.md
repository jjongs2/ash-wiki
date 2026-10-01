---
title: AUTOSAR COM
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR COM**은 [[autosar-communication-stack|AUTOSAR 통신 스택]]에서 RTE 같은 사용자와 [[pdu-router|PduR]] 사이에 놓여, 사용자에게 [[signal-based-communication|시그널]] 단위의 데이터 인터페이스를 주는 모듈이다. 송신할 시그널은 I-PDU(Interaction Layer Protocol Data Unit)에 채워 넣고(packing), 받은 I-PDU에서는 시그널을 꺼내 사용자에게 넘긴다(unpacking).[@autosar-cp-sws-com-2025]

AUTOSAR R25-11 COM 명세는 [[osek-vdx|OSEK/VDX]] COM인 ISO 17356-4:2005를 기능의 바탕으로 두고, 그 기능 가운데 일부는 빼거나 다르게 정한다.[@autosar-cp-sws-com-2025]

## 시그널과 I-PDU

시그널이 I-PDU에서 차지하는 자리는 시작 비트 위치(`ComBitPosition`), 비트 크기(`ComBitSize`), 네트워크 표현의 [[byte-order|바이트 순서]](`ComSignalEndianness`)로 설정한다. AUTOSAR COM은 시그널 그룹도 다룬다. 사용자가 복합 데이터 타입을 쪼갠 여러 시그널을 한 시그널 그룹으로 묶으면, AUTOSAR COM은 이 시그널들을 일관되게 다룬다.[@autosar-cp-sws-com-2025]

![[diagrams/com-signal-ipdu-layout.svg]]

AUTOSAR COM은 송신할 I-PDU를 PduR에 넘기고, 받은 I-PDU는 PduR에게서 통지받는다.[@autosar-cp-sws-com-2025]

## 전송 속성과 전송 모드

전송 속성(`ComTransferProperty`)은 시그널과 시그널 그룹마다 두며, 시그널을 쓸 때 I-PDU의 송신을 일으킬 수 있는지 정한다. 실제로 송신이 일어나는지는 I-PDU의 전송 모드에도 달려 있다.[@autosar-cp-sws-com-2025]

| 전송 속성                                | 시그널을 쓸 때                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `PENDING`                                | 송신을 일으키지 않는다.                                                                    |
| `TRIGGERED`                              | I-PDU의 전송 모드가 `DIRECT`나 `MIXED`이면 송신을 일으키고, 반복 횟수 설정만큼 되풀이한다. |
| `TRIGGERED_ON_CHANGE`                    | 새 값이 저장된 값(마지막으로 보낸 값이나 초깃값)과 길이나 값이 다를 때만 송신을 일으킨다.  |
| `TRIGGERED_WITHOUT_REPETITION`           | `TRIGGERED`와 조건이 같지만 반복 없이 한 번만 보낸다.                                      |
| `TRIGGERED_ON_CHANGE_WITHOUT_REPETITION` | `TRIGGERED_ON_CHANGE`와 조건이 같지만 반복 없이 한 번만 보낸다.                            |

I-PDU마다 전송 모드(`ComTxModeMode`)를 둔다.[@autosar-cp-sws-com-2025]

| 전송 모드  | 보내는 때                                                                                |
| ---------- | ---------------------------------------------------------------------------------------- |
| `PERIODIC` | 설정한 주기마다 보낸다.                                                                  |
| `DIRECT`   | 시그널이 송신을 일으킬 때 보낸다.                                                        |
| `MIXED`    | 주기 송신과 이벤트 송신을 함께 쓴다.                                                     |
| `NONE`     | AUTOSAR COM이 스스로 송신을 일으키지 않고, `Com_TriggerTransmit`로 요청받을 때만 보낸다. |

I-PDU마다 전송 모드를 두 벌(`ComTxModeTrue`, `ComTxModeFalse`) 정해 둘 수 있다. 어느 벌을 쓸지는 I-PDU에 매핑된 시그널 값으로 계산하는 전송 모드 선택자(TMS, Transmission Mode Selector)가 참인지 거짓인지로 고른다.[@autosar-cp-sws-com-2025]

## I-PDU 그룹

I-PDU 그룹은 송신 I-PDU끼리나 수신 I-PDU끼리 묶은 것으로, `Com_IpduGroupStart`와 `Com_IpduGroupStop`으로 한꺼번에 시작하고 멈춘다. I-PDU는 속한 그룹 가운데 하나라도 시작되어 있으면 시작 상태다. 멈춘 I-PDU는 보내지 않고 수신 처리도 하지 않는다.[@autosar-cp-sws-com-2025]

I-PDU 그룹의 상태는 BswM(Basic Software Mode Manager)이 관리한다. BswM은 `BswMPduGroupSwitch` 동작을 실행할 때 `Com_IpduGroupStart`와 `Com_IpduGroupStop`을 불러 그룹을 시작하고 멈춘다.[@autosar-cp-sws-com-2025][@autosar-cp-sws-bswmodemanager-2025]

## 시그널 게이트웨이

AUTOSAR COM에는 시그널 게이트웨이가 들어 있다. 받은 I-PDU의 시그널과 그룹 시그널을 보낼 I-PDU로 옮기며(1:n), 옮길 관계는 `ComGwMapping`으로 정적으로 설정한다.[@autosar-cp-sws-com-2025] [[gateway|게이트웨이]] 일반은 따로 다룬다.

## 수신 통지와 감시

AUTOSAR COM은 시그널이나 시그널 그룹을 받으면 사용자에게 수신 통지 콜백을 부른다. I-PDU마다 시그널 처리 방식(`ComIPduSignalProcessing`)을 `IMMEDIATE`와 `DEFERRED` 가운데 하나로 정한다. `IMMEDIATE`는 수신 indication 함수(`Com_RxIndication`, TP(Transport Protocol) 수신이면 `Com_TpRxIndication`) 안에서 곧바로 통지한다. `DEFERRED`는 받은 I-PDU의 필요한 데이터를 그 안에서 먼저 복사해 두고, 다음 `Com_MainFunctionRx` 호출에서 통지한다.[@autosar-cp-sws-com-2025]

AUTOSAR COM은 수신 데드라인 감시로, 시그널이나 I-PDU가 설정한 시간(`ComFirstTimeout`, `ComTimeout`) 안에 들어오지 않았는지 감시한다.[@autosar-cp-sws-com-2025]

## System Template과의 연결

원자 시그널에 대한 AUTOSAR COM의 설정은 대부분 System Template에서 끌어낼 수 있다. System Template은 송수신하는 I-PDU에 매핑된 ISignalToIPduMapping마다 `ComSignal`을 하나씩 두도록 정한다. ISignal은 Interaction Layer의 시그널이고, ISignalToIPduMapping이 ISignal을 I-PDU에 넣으면서 그 안의 자리를 정한다. System Signal은 서로 다른 ECU에 있는 SW-C끼리 주고받는 데이터를 통신 시스템 쪽에서 본 것으로, 주고받는 data element마다 하나씩 둔다.[@autosar-cp-tps-systemtemplate-2025]

SW-C의 data element는 SenderReceiverToSignalMapping으로 System Signal에 매핑되고, ISignal이 그 System Signal을 가리킨다. AUTOSAR COM 설정의 `ComSignal`은 자신이 나타내는 ISignal의 ISignalToIPduMapping을 참조한다.[@autosar-cp-sws-com-2025][@autosar-cp-tps-systemtemplate-2025]

![[diagrams/com-system-template-signal-mapping.svg]]
