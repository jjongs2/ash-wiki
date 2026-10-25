---
title: OSEK 태스크
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK 태스크**는 [[osek-os|OSEK OS]]에서 함수를 실행하는 틀이다. 제어 소프트웨어를 실시간 요구가 다른 부분들로 쪼개, 부분마다 태스크로 구현할 수 있다. 태스크의 실행 순서는 스케줄러가 정하며, 운영체제는 상태 전이에 맞춰 태스크 context를 저장하고 복원한다. 태스크는 basic 태스크와 extended 태스크 두 종류다.[@osek-os-2-2-3-2005]

## 태스크 상태

basic 태스크는 세 상태를 오간다.[@osek-os-2-2-3-2005]

- running: CPU를 받아 명령을 실행하고 있는 상태다. running인 태스크는 언제나 하나뿐이다.
- ready: 실행 조건이 모두 갖춰져 CPU 할당만 기다리는 상태다. 다음에 running이 될 태스크는 스케줄러가 ready 태스크 중에서 고른다.
- suspended: 실행에 참여하지 않는 수동적인 상태다. 활성화되기를 기다린다.[@osek-os-2-2-3-2005]

extended 태스크는 여기에 waiting이 더해진 네 상태를 가진다. waiting은 적어도 하나의 [[osek-event|이벤트]]를 기다리느라 실행을 이어가지 못하는 상태다.[@osek-os-2-2-3-2005]

두 종류 모두 시스템 서비스로 활성화되면(activate) suspended에서 ready로 옮긴다. 스케줄러가 고른 ready 태스크는 실행되며 running이 되고(start), 스케줄러가 다른 태스크를 시작하기로 하면 running에서 ready로 돌아간다(preempt). running 태스크가 시스템 서비스로 스스로 끝나면 suspended가 된다(terminate). extended 태스크만 가지는 전이는 둘이다. `WaitEvent`로 running에서 waiting으로 가고(wait), 기다리던 이벤트 가운데 적어도 하나가 일어나면 waiting에서 ready로 옮긴다(release). suspended에서 waiting으로 곧바로 가는 전이는 없다.[@osek-os-2-2-3-2005]

![[diagrams/osek-task-state-model.svg]]

basic 태스크는 waiting 상태가 없어 태스크의 시작과 끝에서만 동기화하며, 실행 context에 드는 RAM이 적다.[@osek-os-2-2-3-2005] 예를 들어 OSEKturbo OS/ARM7에서는 basic 태스크가 모두 한 스택을 함께 쓰고, extended 태스크는 저마다 정적으로 할당된 스택을 둔다.[@freescale-osekturbo-arm7-tr-2002]

extended 태스크는 끝나지 않은 채 waiting 상태로 들어가 CPU를 낮은 우선순위 태스크에 내줄 수 있다. 대신 운영체제가 관리하기에 더 복잡하고 시스템 자원을 더 쓴다.[@osek-os-2-2-3-2005]

## 활성화와 종료

태스크는 `ActivateTask`나 `ChainTask`로 활성화하며, 활성화된 태스크는 첫 문장부터 실행된다. 태스크를 시작할 때 C 함수처럼 인자를 넘기지 않으며, 넘길 값은 메시지나 전역 변수로 전한다. 태스크는 자기 코드 끝에서 `TerminateTask`나 `ChainTask`로 스스로 끝나야 하고, 둘 다 부르지 않고 끝내면 동작이 정의되지 않는다. 태스크는 스스로만 끝낼 수 있고, 다른 태스크가 끝낼 수 없다.[@osek-os-2-2-3-2005]

`ChainTask`는 호출한 태스크를 끝낸 뒤 뒤이을 태스크를 활성화한다. 뒤이을 태스크는 호출한 태스크가 끝난 뒤에야 실행되며, 호출한 태스크 자신이어도 된다. `ChainTask`로 활성화된 태스크는 그 우선순위 큐의 맨 뒤에 놓인다. 자기 자신을 체인하면 다중 활성화 요청으로 세지 않으며, 태스크는 suspended로 가지 않고 곧바로 다시 ready가 된다.[@osek-os-2-2-3-2005]

`TerminateTask`와 `ChainTask`는 호출한 태스크에 배정된 [[osek-resource#Internal resource|internal resource]]를 자동으로 푼다. `ChainTask`는 자기 자신을 체인할 때도 푼다.[@osek-os-2-2-3-2005]

[[osek-os#Conformance class|BCC2와 ECC2]]에서는 basic 태스크가 활성화 요청을 여러 번 받아 둘 수 있다. ECC2에서도 extended 태스크는 그럴 수 없다. 받아 둘 수 있는 요청 수는 시스템 생성 때 basic 태스크마다 정한다. 받아 둔 요청은 우선순위별로 활성화 순서대로 큐에 쌓이고, 태스크의 현재 인스턴스가 끝나면 다음 인스턴스가 ready가 된다. 요청이 최대 개수를 넘으면 `ActivateTask`와 `ChainTask`는 E_OS_LIMIT을 돌려주고 그 활성화는 무시된다.[@osek-os-2-2-3-2005]

## 우선순위와 스케줄링

태스크의 우선순위는 정적으로 정해져, 실행 중에 사용자가 바꿀 수 없다. 가장 낮은 우선순위는 0이고, 값이 클수록 우선순위가 높다.[@osek-os-2-2-3-2005][@osek-oil-2-5-2004]

스케줄러는 ready와 running 태스크 가운데 우선순위가 가장 높은 것들을 고르고, 그 안에서 가장 오래된 것을 고른다. 선점된 태스크는 그 우선순위에서 가장 오래된 것으로, waiting에서 풀린 태스크는 가장 새로운 것으로 친다. 같은 우선순위에 태스크를 여럿 두는 것은 BCC2와 ECC2에서만 된다.[@osek-os-2-2-3-2005]

선점할 수 있는지는 태스크의 속성이다. 선점할 수 있는 태스크는 더 높은 우선순위 태스크가 ready가 되는 즉시 ready로 돌아가며, context가 저장되어 선점된 자리에서 이어진다. [[real-time-scheduling#선점|선점할 수 없는 태스크]]는 `TerminateTask`, `ChainTask`, `Schedule`을 부르거나 `WaitEvent`로 waiting에 들어갈 때만 재스케줄링된다. 선점할 수 있는 태스크와 없는 태스크를 한 시스템에 섞을 수 있으며, 이때 스케줄링 방식은 running 태스크의 속성을 따른다.[@osek-os-2-2-3-2005]

완전 선점 스케줄링에서 재스케줄링이 일어나는 경우는 다음과 같다.[@osek-os-2-2-3-2005]

- `TerminateTask`로 태스크가 성공적으로 끝날 때
- `ChainTask`로 태스크가 성공적으로 끝나고 뒤이을 태스크를 활성화할 때
- [[osek-os#처리 레벨|태스크 레벨]]에서 태스크를 활성화할 때. `ActivateTask`, 메시지 통지, 태스크 활성화를 정한 알람의 만료가 여기에 든다.
- `WaitEvent`로 waiting 상태에 들어갈 때
- 태스크 레벨에서 waiting 태스크에 이벤트를 설정할 때. `SetEvent`, 메시지 통지, 이벤트 설정을 정한 알람의 만료가 여기에 든다.
- 태스크 레벨에서 `ReleaseResource`로 resource를 풀 때
- 인터럽트 레벨에서 태스크 레벨로 돌아올 때[@osek-os-2-2-3-2005]

`Schedule`은 시스템 생성 때 internal resource가 배정된 태스크에서만 재스케줄링을 일으킨다. 그런 태스크가 `Schedule`을 부르면, 더 높은 우선순위 태스크가 ready일 때 internal resource를 풀고 호출한 태스크를 ready로 돌려, 우선순위가 호출한 태스크보다 높고 internal resource의 [[osek-resource#Ceiling priority|ceiling priority]] 이하인 태스크에 CPU를 넘긴다. `Schedule`에서 돌아올 때는 internal resource를 다시 쥔 상태다. internal resource가 없는 선점할 수 있는 태스크에는 `Schedule`이 영향을 주지 않는다. 선점할 수 없는 태스크는 가장 높은 태스크 우선순위의 internal resource가 배정된 태스크로 본다.[@osek-os-2-2-3-2005]

태스크 종류(basic, extended)와 선점할 수 있는지는 서로 독립이다. 그래서 완전 선점 시스템에 basic 태스크가, 비선점 시스템에 extended 태스크가 있을 수 있다.[@osek-os-2-2-3-2005]

## 조회

`GetTaskID`는 지금 running인 태스크의 ID(identifier)를 돌려준다. running인 태스크가 없으면 INVALID_TASK를 돌려준다.[@osek-os-2-2-3-2005]

`GetTaskState`는 부른 시점의 태스크 상태(running, ready, waiting, suspended)를 돌려준다. 완전 선점 시스템에서 태스크가 부르면 결과를 쓸 때는 이미 맞지 않을 수 있다. 여러 번 활성화된 태스크는 인스턴스 하나라도 running이면 running으로 돌려준다.[@osek-os-2-2-3-2005]

## 설정

태스크는 [[osek-implementation-language|OIL]]의 `TASK` 객체로 선언한다. 속성에는 아래 넷이 있고, 그 밖에 태스크가 쓰는 [[osek-resource|resource]], 이벤트, 메시지를 참조한다.[@osek-oil-2-5-2004]

| 속성         | 뜻                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------- |
| `PRIORITY`   | 우선순위. 0이 가장 낮다.                                                                          |
| `SCHEDULE`   | 선점할 수 있는지. `FULL`이면 선점할 수 있고, `NON`이면 선점할 수 없다.                            |
| `ACTIVATION` | 큐에 쌓아 둘 수 있는 활성화 요청의 최대 수                                                        |
| `AUTOSTART`  | 시스템 시작 때 활성화할지와, 활성화한다면 어느 [[osek-os#시작과 종료\|application mode]]에서 할지 |

`PRIORITY` 값은 태스크 사이의 상대 순서만 뜻한다. `SCHEDULE`이 `NON`인 태스크에는 internal resource를 배정할 수 없다. OIL의 `OS` 객체에는 conformance class와 스케줄링 방식을 정하는 속성이 없다.[@osek-oil-2-5-2004]
