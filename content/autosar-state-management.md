---
title: AUTOSAR State Management
tags:
  - platform/autosar
verified: 2026-10-07
---

AUTOSAR R25-11 Adaptive Platform 설계 설명서는 **State Management**(SM)를 [[autosar-adaptive-platform|AUTOSAR Adaptive Platform]]의 운영 상태 전반을 맡는 functional cluster로 정의한다. State Management는 들어오는 이벤트를 다루고, 이벤트와 요청의 우선순위를 정해 그에 맞는 내부 상태를 정한다. 대부분 ECU 개발 프로젝트마다 고유하게 만들고 최종 구현은 대개 시스템 통합자가 맡는 독특한 functional cluster이며, 프로젝트에 따라 상태 기계 하나 이상으로 이뤄질 수 있다.[@autosar-ap-exp-platformdesign-2025]

State Management는 시스템 설계에 따라 [[autosar-execution-management|Execution Management]]에 명령하고 여러 상태를 중재해 [[autosar-adaptive-platform#Machine과 프로세스|Machine]] 전체의 동작을 제어하며, 다른 functional cluster와도 상호작용한다. 여러 Adaptive Platform 스택 구현 사이의 이식성을 지키도록 표준 [[autosar-adaptive-platform#Functional cluster|ARA]] 인터페이스만 쓰는 것이 좋다.[@autosar-ap-exp-platformdesign-2025]

## 책임

AUTOSAR R25-11 State Management 명세는 State Management에 현재 내부 상태를 정하고, Function Group과 Machine State의 전이를 Execution Management에 요청해 시작하는 일을 맡긴다. Function Group의 상태 변경 요청은 아래처럼 여러 곳에서 온다.[@autosar-ap-sws-statemanagement-2025]

- [[autosar-platform-health-management|Platform Health Management]]가 오류 복구를 일으킬 감시 오류를 알린다.
- [[autosar-update-and-configuration-management|Update and Configuration Management]]가 소프트웨어나 설정을 갱신하고 그 갱신을 검증할 수 있는 상태로 시스템을 바꾸려 한다.
- Network Management는 능동적으로 요청하지 않는다. State Management가 Network Management가 주는 NetworkHandle에 등록해 그 변화에 반응한다.
- Suspend-to-RAM 처리에서 State Management는 Function Group State 전이로, Suspend-to-RAM을 지원하지 않는 응용을 저전력 모드에 들기 전에 끝내고 깨어나는 단계에서 다시 시작하게 조율한다.[@autosar-ap-sws-statemanagement-2025]

어떤 효과를 낼지 최종 결정은 프로젝트 요구사항에 따른 State Management의 내부 논리나, StateMachine 방식을 쓸 때는 그 설정이 내린다. State Management 기능은 중요하므로 다른 Adaptive Application의 접근을 [[autosar-identity-and-access-management|IAM]] 등으로 보호해야 하고, State Management는 Platform Health Management가 감시한다. AUTOSAR는 Classic Platform의 BswM 같은 기능을 Adaptive Platform에는 명세하지 않기로 했다. State Management 기능이 프로젝트마다 크게 다르기 때문이다.[@autosar-ap-sws-statemanagement-2025]

AUTOSAR R25-11 Adaptive Platform 설계 설명서는 State Management가 요청할 수 있는 일을 아래처럼 둔다.[@autosar-ap-exp-platformdesign-2025]

- Function Group을 특정 상태로 바꾸기
- (부분) 네트워크를 활성화하거나 비활성화하기
- Machine을 종료하거나 재시작하기
- Platform Health Management나 Execution Management가 알린 (감시) 오류에서 복구하기
- Update and Configuration Management의 요청에 따라, 설치·갱신·제거할 Software Cluster를 준비하고 검증하기
- 슬립 모드에 들기 전과 시스템이 재개된 뒤 Suspend-to-RAM을 아는 응용을 조율하기[@autosar-ap-exp-platformdesign-2025]

## Machine State와 Function Group State

AUTOSAR R25-11 State Management 명세는 **Machine State**를 Function Group State의 특수한 종류로 정의한다. Machine State를 포함한 Function Group State는 지금 돌고 있는 Modelled Process의 집합을 정하고, 각 Adaptive Application은 자기 Modelled Process가 어느 Function Group State에서 돌아야 하는지를 [[autosar-manifest#종류|Execution Manifest]]에 선언한다. 상태 변경 요청을 받으면 Execution Management는 더는 필요 없는 Modelled Process를 끝내고 새 상태에서 돌 Modelled Process를 시작한 뒤, State Management에 상태 변경을 확인해 준다.[@autosar-ap-sws-statemanagement-2025]

한 Machine에 기능상 응집된 Adaptive Application 묶음이 둘 이상 있으면, Machine State만으로는 이 묶음들을 따로 제어하기에 유연하지 않다. 그래서 Function Group과 Function Group State를 더 설정할 수 있다. 대체로 Machine State는 Machine의 생명주기(시작, 종료, 재시작)와 플랫폼 수준 응용의 Modelled Process를 제어하고, 다른 Function Group State는 사용자 수준 응용 묶음의 Modelled Process를 따로 제어한다.[@autosar-ap-sws-statemanagement-2025]

## StateMachine

AUTOSAR R25-11 Adaptive Platform 설계 설명서는 State Management 기능을 만드는 것을 돕도록 가벼운 StateMachine 방식을 둔다. StateMachine은 적은 설정으로 표준 쓰임새를 다루도록 설계됐고, 쓰는 것은 선택이다. 복잡한 쓰임새에는 여전히 사용자가 만든 소스 코드가 필요할 것이다. StateMachine 자체는 프로젝트 고유 논리를 구현하지 않고, 그 논리를 담아 다음에 요청할 StateMachine 상태를 정하는 Adaptive Application(SMControlApplication)에 입력 인터페이스를 준다. Execution Management와 Platform Health Management가 알린 오류에 대한 반응은 StateMachine 안에 바로 설정한다.[@autosar-ap-exp-platformdesign-2025]

AUTOSAR R25-11 State Management 명세는 StateMachine이 StateMachine State들로 이뤄지고, 적어도 Initial State, Off, PrepareUpdate, VerifyUpdate, PrepareRollback의 다섯 상태를 두게 한다. 각 상태는 ActionList를 가리키고, 상태에 들어서면 그 ActionList의 ActionListItem을 모두 실행한다. ActionListItem에는 Function Group State 요청, SYNC, StateMachine의 시작과 정지, 다음 항목의 처리를 늦추는 Sleep, NetworkHandle 전환, Suspend-to-RAM 제어가 있다.[@autosar-ap-sws-statemanagement-2025]

SMControlApplication은 StateMachineService의 RequestTransition 메서드로 다른 StateMachine State를 요청한다. 모든 전이가 가능하지는 않으므로, TransitionRequestTable이 SMControlApplication의 입력값과 현재 상태로 다음 상태를 정한다. ErrorRecoveryTable은 실패한 프로세스, 실패한 Function Group 전이 요청, 실패한 NmNetworkHandle 전이 요청, 실패한 StateMachine 전이가 낸 ErrorCode를 복구용 다음 StateMachine State에 대응시킨다. 오류를 Platform Health Management, Execution Management, State Management 가운데 어디서 알렸든 반응은 같다. ErrorRecoveryTable마다 ErrorCode가 `ANY`인 항목을 정확히 하나 두어, 설정하지 않은 ErrorCode도 다루게 한다.[@autosar-ap-sws-statemanagement-2025]

## Suspend-to-RAM

AUTOSAR R25-11 Adaptive Platform은 State Management에 Suspend-to-RAM 지원을 두어, 운영 맥락을 메모리에 보존한 채 시스템을 저전력 상태에 들게 한다.[@autosar-ap-tr-releaseoverview-2025]

AUTOSAR R25-11 State Management 명세는 Machine이 시작과 종료 시간을 줄이려고 완전한 종료와 첫 부팅 대신 Suspend-to-RAM을 쓸 수 있게 한다. 운영체제가 suspend 상태에 들기 전에, Suspend-to-RAM을 지원하지 않는 Executable이 든 Function Group을 모두 끄거나 그 프로세스가 돌지 않는 상태로 바꾸고, Suspend-to-RAM을 아는 프로세스에 알린다. 운영체제가 suspend 상태에 들기 전에 상태 동기화가 필요한 Adaptive Application을 위해 State Management는 S2R(Suspend-to-RAM) Hub를 둔다. S2R Hub는 동적으로 등록하는 S2R Satellite와 통신하며, StateMachine 방식이나 C++ API(Application Programming Interface)인 `ara::sm::s2r::S2RHub` 가운데 하나로만 쓴다. S2R Satellite는 Suspend-to-RAM을 아는 응용 안에서 S2R Hub에 등록하고, suspend 모드에 들기 전과 나온 뒤 알림을 받는다. S2R Hub는 IAM으로 인증된 S2R Satellite만 등록하게 한다. 이 규격 항목들의 상태는 DRAFT다.[@autosar-ap-sws-statemanagement-2025]
