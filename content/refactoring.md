---
title: 리팩터링
tags:
  - process
verified: 2026-10-03
---

ISO/IEC/IEEE 24765 용어집은 **리팩터링**(refactoring)을 소프트웨어 코드의 동작을 바꾸지 않고 구조를 고치는 일로 정의하고, 그 목적으로 품질 특성 개선, 이후의 확장과 적응을 쉽게 하는 것, 아키텍처 스타일을 따르는 것을 든다.[@ieee-cs-sevocab-2026] SWEBOK(Software Engineering Body of Knowledge) V4.0a에 따르면 리팩터링은 프로그램의 동작을 바꾸지 않고 재구성하는 리엔지니어링 기법으로, 소프트웨어의 내부 구조와 유지보수성을 높이려는 것이다.[@ieee-swebok-v4-0a-2026]

Martin Fowler는 『Refactoring』에서 명사 리팩터링을, 겉보기 동작을 바꾸지 않고 소프트웨어의 내부 구조를 바꿔 이해하기 쉽고 고치기 싸게 만드는 변경으로 정의했다. 동사 리팩터링은 그런 리팩터링을 잇달아 적용해 겉보기 동작을 바꾸지 않고 소프트웨어를 재구성하는 일로 정의했다.[@fowler-refactoring-2026]

## 동작 보존

Opdyke가 정의한 객체지향 프로그램의 리팩터링은 사전 조건(precondition)이 충족되면 프로그램의 동작을 보존한다.[@opdyke-refactoring-frameworks-1992]

Fowler는 리팩터링의 핵심을, 동작을 보존하는 작은 변환을 잇달아 적용하는 데 둔다. 변환 하나하나가 작아 틀릴 가능성이 낮고, 변환마다 시스템을 완전히 동작하는 상태로 두므로 재구성 도중 시스템이 크게 망가질 가능성이 줄어든다.[@fowler-refactoring-2026] Fowler에 따르면 작은 단계로 리팩터링하면 재구성하는 동안에도 시스템이 깨지지 않아, 오랜 기간에 걸쳐 조금씩 리팩터링할 수 있다.[@fowler-refactoring-book-2026]

Fowler는 리팩터링을 재구성(restructuring)의 한 특정 기법으로 구별한다. 리팩터링하는 동안 시스템이 몇 분 넘게 깨져 있으면 안 되고, 며칠씩 깨진 채 하는 재구성은 리팩터링이 아니라고 본다.[@fowler-refactoring-malapropism-2004] 또 리팩터링과 기능 추가를 두 모자(two hats)로 나눠, 리팩터링 중의 변경은 모두 동작을 보존하는 작은 변경이고 그 밖의 코드 변경은 모두 기능 추가라고 한다.[@fowler-workflows-of-refactoring-2014]

![[diagrams/refactoring-small-steps-vs-restructuring.svg]]

## Code smell

ISTQB(International Software Testing Qualifications Board) 용어집은 **code smell**을, 설계나 유지보수성에 문제가 있을 수 있음을 드러내되 코드가 동작하는 것을 꼭 막지는 않는 소스 코드의 특징으로 정의한다.[@istqb-glossary-code-smell-2026] Fowler는 code smell을 대개 시스템의 더 깊은 문제와 맞닿아 있는, 겉으로 드러난 징후로 보고, smell이 늘 문제를 뜻하지는 않는다고 했다.[@fowler-code-smell-2006]

Fowler와 Kent Beck은 『Refactoring』에서 언제 리팩터링할지를 smell로 설명하고, smell을 리팩터링으로 풀 수 있는 문제가 있다는 신호로 두었다. 이 착상은 Beck이 처음 내놓았다. 두 사람은 smell의 예로, 같은 코드 구조가 여러 곳에 나타나는 중복 코드(duplicated code)와 길수록 이해하기 어려운 긴 함수(long function)를 든다.[@fowler-bad-smells-2018]

## 기법

Fowler는 『Refactoring』에서 동작을 보존하는 변환 하나하나를 리팩터링이라 부르고, 2판에 이런 리팩터링 70개 남짓을 동기, 안전하게 하는 절차, 예제와 함께 실었다.[@fowler-refactoring-book-2026]

- **함수 추출**(extract function): 코드 조각을, 코드가 어떻게 동작하는지가 아니라 무엇을 하려는지를 이름으로 삼은 새 함수로 뽑아낸다.[@fowler-bad-smells-2018][@fowler-extract-function-2026] 같은 클래스의 두 메서드에 같은 식이 있는 가장 단순한 중복은, 그 식을 함수로 추출해 두 곳에서 부르면 없앨 수 있다.[@fowler-bad-smells-2018]
- **중첩 조건을 보호 구문으로 바꾸기**(replace nested conditional with guard clauses): if-else로 겹겹이 중첩된 조건문을, 조건마다 곧바로 반환하는 문장들로 풀어 중첩을 없앤다.[@fowler-replace-nested-conditional-2026]

## 테스트와의 관계

Fowler는 테스트가 모두 통과하는 상태에서만 리팩터링하고, 테스트가 하나라도 실패하면 실수가 있다는 뜻으로 본다.[@fowler-workflows-of-refactoring-2014] 그는 『Refactoring』에서 기능 코드와 함께 포괄적인 자동 테스트를 써서 명령 하나로 실행하는 관행을 self-testing code라 불렀다. self-testing code가 있으면 실수했을 때 테스트가 곧 알려 주므로, 코드를 정리하는 작은 수정을 안심하고 할 수 있다고 한다.[@fowler-self-testing-code-2014] 리팩터링 도구가 없는 언어에서는 작은 단계로 나눠 자주 테스트해 실수를 잡는다.[@fowler-refactoring-2026]

## 원 저자와 자료

William Opdyke는 1992년 일리노이 대학교 어배너-섐페인의 박사 논문에서, 객체지향 애플리케이션 프레임워크의 설계, 진화, 재사용을 돕는 프로그램 재구성 연산의 집합을 리팩터링으로 정의했다.[@opdyke-refactoring-frameworks-1992] Fowler는 『Refactoring』 초판을 1999년에, 2판을 2018년 말에 냈다.[@fowler-refactoring-book-2026] martinfowler.com의 일부인 refactoring.com은 2판의 리팩터링을 요약한 온라인 카탈로그를 싣는다.[@fowler-refactoring-2026]
