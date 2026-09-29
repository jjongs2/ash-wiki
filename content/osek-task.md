---
title: OSEK 태스크
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK 태스크**는 [[osek-os|OSEK OS]]에서 함수를 실행하는 틀이다. 제어 소프트웨어를 실시간 요구가 다른 부분들로 쪼개, 부분마다 태스크로 구현할 수 있다. 태스크의 실행 순서는 스케줄러가 정하며, 운영체제는 상태 전이에 맞춰 태스크 문맥을 저장하고 복원한다. 태스크는 basic 태스크와 extended 태스크 두 종류다.[@osek-os-2-2-3-2005]

## 구조·동작

### 태스크 상태

**Basic 태스크**는 세 상태를 오간다.[@osek-os-2-2-3-2005]

- running: CPU를 받아 명령을 실행하고 있는 상태다. running인 태스크는 언제나 하나뿐이다.
- ready: 실행 조건이 모두 갖춰져 CPU 할당만 기다리는 상태다. 다음에 running이 될 태스크는 스케줄러가 ready 태스크 중에서 고른다.
- suspended: 실행에 참여하지 않는 수동 상태다. 활성화되기를 기다린다.[@osek-os-2-2-3-2005]

**Extended 태스크**는 여기에 waiting이 더해진 네 상태를 가진다. waiting은 적어도 하나의 [[osek-event|이벤트]]를 기다리느라 실행을 이어가지 못하는 상태다.[@osek-os-2-2-3-2005]

두 종류 모두 시스템 서비스로 활성화되면(activate) suspended에서 ready로 옮긴다. 스케줄러가 고른 ready 태스크는 실행되며 running이 되고(start), 스케줄러가 다른 태스크를 시작하기로 하면 running에서 ready로 돌아간다(preempt). running 태스크가 시스템 서비스로 스스로 끝나면 suspended가 된다(terminate). extended 태스크만 가지는 전이는 둘이다. `WaitEvent`로 running에서 waiting으로 가고(wait), 기다리던 이벤트 가운데 적어도 하나가 일어나면 waiting에서 ready로 옮긴다(release). suspended에서 waiting으로 곧바로 가는 전이는 없다.[@osek-os-2-2-3-2005]

![[diagrams/osek-task-state-model.svg]]

### 활성화와 종료

태스크는 `ActivateTask`나 `ChainTask`로 활성화하며, 활성화된 태스크는 첫 문장부터 실행된다. 태스크는 자기 코드 끝에서 `TerminateTask`나 `ChainTask`로 스스로 끝나야 하고, 둘 다 부르지 않고 끝내면 동작이 정의되지 않는다. 태스크는 스스로만 끝낼 수 있고, 다른 태스크가 끝낼 수 없다.[@osek-os-2-2-3-2005]

`ChainTask`는 호출한 태스크를 끝낸 뒤 뒤이을 태스크를 활성화한다. 뒤이을 태스크는 호출한 태스크가 끝난 뒤에야 실행되며, 호출한 태스크 자신이어도 된다.[@osek-os-2-2-3-2005]

BCC2와 ECC2에서는 basic 태스크가 활성화 요청을 여러 번 받아 둘 수 있다. ECC2에서도 extended 태스크는 그럴 수 없다. Conformance class는 [[osek-os|OSEK OS]]에서 다룬다. 받아 둘 수 있는 요청 수는 시스템 생성 때 basic 태스크마다 정한다. 받아 둔 요청은 우선순위별로 활성화 순서대로 큐에 쌓이고, 태스크의 현재 인스턴스가 끝나면 다음 인스턴스가 ready가 된다. 요청이 최대 개수를 넘으면 `ActivateTask`와 `ChainTask`는 E_OS_LIMIT을 돌려주고 그 활성화는 무시된다.[@osek-os-2-2-3-2005]

### 우선순위와 스케줄링

태스크의 우선순위는 정적으로 정해져, 실행 중에 사용자가 바꿀 수 없다. 가장 낮은 우선순위는 0이고, 값이 클수록 우선순위가 높다.[@osek-os-2-2-3-2005][@osek-oil-2-5-2004]

스케줄러는 ready와 running 태스크 가운데 우선순위가 가장 높은 것들을 고르고, 그 안에서 가장 오래된 것을 고른다. 선점된 태스크는 그 우선순위에서 가장 오래된 것으로, waiting에서 풀린 태스크는 가장 새로운 것으로 친다. 같은 우선순위에 태스크를 여럿 두는 것은 BCC2와 ECC2에서만 된다.[@osek-os-2-2-3-2005]

선점할 수 있는지는 태스크의 속성이다.[@osek-os-2-2-3-2005] 선점할 수 있는 태스크는 더 높은 우선순위 태스크가 ready가 되는 즉시 ready로 돌아가며, 문맥이 저장되어 선점된 자리에서 이어진다. 선점할 수 없는 태스크는 `TerminateTask`, `ChainTask`, `Schedule`을 부르거나 `WaitEvent`로 waiting에 들어갈 때만 재스케줄링된다. 선점할 수 있는 태스크와 없는 태스크를 한 시스템에 섞을 수 있으며, 이때 스케줄링 방식은 running 태스크의 속성을 따른다.[@osek-os-2-2-3-2005]

### 설정

태스크는 [[osek-implementation-language|OIL]]의 `TASK` 객체로 선언한다. 속성에는 아래 넷이 있고, 그 밖에 태스크가 쓰는 리소스, 이벤트, 메시지를 참조한다.[@osek-oil-2-5-2004]

| 속성         | 뜻                                                                       |
| ------------ | ------------------------------------------------------------------------ |
| `PRIORITY`   | 우선순위. 0이 가장 낮다                                                  |
| `SCHEDULE`   | 선점할 수 있는지. `FULL`이면 선점할 수 있고, `NON`이면 선점할 수 없다    |
| `ACTIVATION` | 큐에 쌓아 둘 수 있는 활성화 요청의 최대 수                               |
| `AUTOSTART`  | 시스템 시작 때 활성화할지와, 활성화한다면 어느 application mode에서 할지 |

## 비교·한계

basic 태스크는 waiting 상태가 없어 태스크의 시작과 끝에서만 동기화하며, 실행 문맥에 드는 RAM이 적다.[@osek-os-2-2-3-2005] 예를 들어 OSEKturbo OS/ARM7에서는 basic 태스크가 모두 한 스택을 함께 쓰고, extended 태스크는 저마다 정적으로 할당된 스택을 둔다.[@freescale-osekturbo-arm7-tr-2002]

extended 태스크는 끝나지 않은 채 waiting 상태로 들어가 CPU를 낮은 우선순위 태스크에 내줄 수 있다. 대신 운영체제가 관리하기에 더 복잡하고 시스템 자원을 더 쓴다.[@osek-os-2-2-3-2005]
