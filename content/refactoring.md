---
title: 리팩터링
tags:
  - sw-engineering
verified: 2026-10-03
---

Martin Fowler는 『Refactoring』에서 명사 **리팩터링**을, 겉보기 동작을 바꾸지 않고 소프트웨어의 내부 구조를 바꿔 이해하기 쉽고 고치기 싸게 만드는 변경으로 정의했다. 동사 리팩터링은 그런 리팩터링을 잇달아 적용해 겉보기 동작을 바꾸지 않고 소프트웨어를 재구성하는 일로 정의했다.[@fowler-refactoring-2026]

ISO/IEC/IEEE 24765 용어집은 refactor(리팩터링하다)를 소프트웨어 코드의 동작을 바꾸지 않고 구조를 고치는 일로 정의하고, 그 목적으로 [[software-quality-model|품질 특성]] 개선, 이후의 확장과 적응을 쉽게 하는 것, 아키텍처 스타일을 따르는 것을 든다. 이 정의는 PMI의 Software Extension to the PMBOK Guide Fifth Edition에서 왔다.[@ieee-cs-sevocab-2026] 리팩터링은 프로그램의 동작을 바꾸지 않고 재구성하는 리엔지니어링 기법으로, 소프트웨어의 내부 구조와 유지보수성을 높이려는 것이다.[@ieee-swebok-v4-0a-2026]

## 기원

William Opdyke는 1992년 일리노이 대학교 어배너-섐페인의 박사 논문에서, 객체지향 애플리케이션 프레임워크의 설계, 진화, 재사용을 돕는 프로그램 재구성 연산의 집합을 리팩터링으로 정의했다.[@opdyke-refactoring-frameworks-1992] Fowler는 『Refactoring』 초판을 1999년에, 2판을 2018년 말에 냈다.[@fowler-refactoring-book-2026] martinfowler.com의 일부인 refactoring.com은 2판의 리팩터링을 요약한 온라인 카탈로그를 싣는다.[@fowler-refactoring-2026]

## 동작 보존

Opdyke가 정의한 객체지향 프로그램의 리팩터링은 사전 조건(precondition)이 충족되면 프로그램의 동작을 보존한다.[@opdyke-refactoring-frameworks-1992]

Fowler는 리팩터링의 핵심을, 동작을 보존하는 작은 변환을 잇달아 적용하는 데 둔다. 변환 하나하나가 작아 틀릴 가능성이 낮고, 변환마다 시스템을 완전히 동작하는 상태로 두므로 재구성 도중 시스템이 크게 망가질 가능성이 줄어든다.[@fowler-refactoring-2026] 그는 작은 단계로 리팩터링하면 오랜 기간에 걸쳐 조금씩 리팩터링할 수 있다고 본다.[@fowler-refactoring-book-2026]

Fowler에게 재구성(restructuring)은 방법을 가리지 않고 전체의 부분을 다시 배열하는 일을 두루 이르는 말이고, 리팩터링은 그 일을 하는 매우 특정한 기법이다. 그는 리팩터링 중이라면 시스템이 한 번에 몇 분 넘게 깨져 있어서는 안 되고, 며칠씩 깨진 채 하는 재구성은 리팩터링이 아니라고 본다.[@fowler-refactoring-malapropism-2004] 또 리팩터링과 기능 추가를 두 모자(two hats)로 나눠, 리팩터링 중의 변경은 모두 동작을 보존하는 작은 변경이고 그 밖의 코드 변경은 모두 기능 추가라고 한다.[@fowler-workflows-of-refactoring-2014]

![[diagrams/refactoring-small-steps-vs-restructuring.svg]]

## Code smell

**Code smell**은 설계나 유지보수성에 문제가 있을 수 있음을 드러내되 코드가 동작하는 것을 꼭 막지는 않는 소스 코드의 특징이다.[@istqb-glossary-code-smell-2026] Fowler는 code smell을 대개 시스템의 더 깊은 문제와 맞닿아 있는, 겉으로 드러난 징후로 보고, smell이 늘 문제를 뜻하지는 않는다고 했다.[@fowler-code-smell-2006]

Fowler와 Kent Beck은 『Refactoring』에서 언제 리팩터링할지를 smell로 설명하고, smell을 리팩터링으로 풀 수 있는 문제가 있다는 신호로 두었다. 이 착상은 Beck이 처음 내놓았다. 두 사람은 smell의 예로, 같은 코드 구조가 여러 곳에 나타나는 중복 코드(duplicated code)와 길수록 이해하기 어려운 긴 함수(long function)를 든다.[@fowler-bad-smells-2018]

## 기법

Fowler는 『Refactoring』 2판에 리팩터링 70개 남짓을 동기, 안전하게 하는 절차, 예제와 함께 실었다.[@fowler-refactoring-book-2026]

- **함수 추출**(extract function): 코드 조각을, 코드가 어떻게 동작하는지가 아니라 무엇을 하려는지를 이름으로 삼은 새 함수로 뽑아낸다.[@fowler-bad-smells-2018][@fowler-extract-function-2026] 같은 클래스의 두 메서드에 같은 식이 있는 가장 단순한 중복은, 그 식을 함수로 추출해 두 곳에서 부르면 없앨 수 있다.[@fowler-bad-smells-2018]
- **중첩 조건을 보호 구문으로 바꾸기**(replace nested conditional with guard clauses): if-else로 겹겹이 중첩된 조건문을, 조건마다 곧바로 반환하는 문장들로 풀어 중첩을 없앤다.[@fowler-replace-nested-conditional-2026]

## 테스트와의 관계

Fowler는 테스트가 모두 통과하는 상태에서만 리팩터링하고, 테스트가 하나라도 실패하면 실수가 있다는 뜻으로 본다.[@fowler-workflows-of-refactoring-2014] 그는 『Refactoring』에서 기능 코드와 함께 포괄적인 자동 테스트를 써서 명령 하나로 실행하는 관행을 self-testing code라 불렀다. self-testing code가 있으면 실수했을 때 테스트가 곧 알려 주므로, 코드를 정리하는 작은 수정을 안심하고 할 수 있다고 한다.[@fowler-self-testing-code-2014] 리팩터링 도구가 없는 언어에서는 작은 단계로 나눠 자주 테스트해 실수를 잡는다고 한다.[@fowler-refactoring-2026]

## 리팩터링의 흐름

리팩터링 기법은 유지보수 중에 코드를 바꾸기 전과 후에 코드베이스의 [[software-maintenance#비용과 기술 부채|기술 부채]]를 줄이는 데 쓸 수 있다. [[agile-software-development|애자일 개발]]에서는 [[continuous-integration|지속적 통합]]으로 변경을 조금씩 쌓아 가므로, 품질과 신뢰성을 높이려고 코드를 계속 리팩터링해야 하는 일이 흔하다.[@ieee-swebok-v4-0a-2026]

Fowler는 리팩터링을 제대로 하면 프로젝트 계획에 따로 오르는 특별한 작업이 아니라 일상 프로그래밍의 일부가 된다고 본다.[@fowler-refactoring-2026] 그는 리팩터링이 개발 작업에 섞여 들어가는 흐름(workflow)을 아래 여섯으로 나눈다.[@fowler-workflows-of-refactoring-2014]

| 흐름                                         | 언제, 무엇을 하는가                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [[test-driven-development\|TDD]] refactoring | 테스트가 통과하게 기능을 더한 뒤, 모두 통과한 테스트를 바탕으로 작은 단계로 설계를 다듬는다.                             |
| litter-pickup refactoring                    | 작업하다 지저분한 코드를 만나면 정리해, 처음 봤을 때보다 나은 상태로 남긴다.                                             |
| comprehension refactoring                    | 코드가 하는 일을 알아내느라 머릿속에 쌓은 이해를 코드로 옮겨, 누구도 그 이해를 처음부터 다시 쌓을 필요가 없게 한다.      |
| preparatory refactoring                      | 새 기능을 넣기 전에 기존 코드를 그 기능에 맞는 모양으로 먼저 고쳐, 기능 추가를 쉽게 한다.                                |
| planned refactoring                          | 따로 시간을 들여야 할 큰 문제 영역을 "refactoring story" 같은 방식으로 작업 계획에 넣어 고친다.                          |
| long-term refactoring                        | 몇 달에 걸친 큰 재구조화를 위해 팀이 대략의 목표 상태와 계획을 정하고, 평소 작업에서 그쪽으로 가는 리팩터링을 해 나간다. |

그는 planned refactoring이 대부분의 팀에 필요한 요소이지만, 팀이 다른 흐름으로 리팩터링을 충분히 하지 않았다는 신호이기도 하다고 본다. 리팩터링 대부분이 이렇게 작업 계획에 올린 일에서만 일어나면 좋지 않은 징후로 보고, 다른 흐름을 작업에 들이기를 권한다.[@fowler-workflows-of-refactoring-2014]
