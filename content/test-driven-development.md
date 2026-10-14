---
title: 테스트 주도 개발
tags:
  - process/sw-testing
aliases:
  - TDD
verified: 2026-10-03
---

**테스트 주도 개발**(test-driven development, TDD)은 실패하는 자동 테스트가 있을 때만 제품 코드를 새로 쓰는 개발 방법이다. 아직 통과하지 못하는 테스트를 하나 만들고, 이를 통과시킬 코드를 더한 다음 생긴 중복을 없애는 작은 단계를 되풀이한다.[@beck-test-driven-development-2002] ISTQB 용어집은 TDD를 [[test-case|테스트 케이스]]를 먼저 만들어 자동화한 뒤, 그 테스트를 통과하도록 소프트웨어를 점진적으로 개발하는 기법으로 정의한다.[@istqb-glossary-test-driven-development-2026]

## Red-green-refactor 사이클

TDD의 한 주기는 Red, Green, Refactor 세 단계다.[@beck-test-driven-development-2002]

1. Red: 작동하지 않는 작은 테스트를 하나 쓴다. 처음에는 컴파일조차 되지 않을 수 있다.
2. Green: 그 테스트를 빨리 통과시키는 데만 집중하고, 그 과정에서 생기는 지저분한 코드는 받아들인다.
3. Refactor: 테스트를 통과시키느라 생긴 중복을 [[refactoring|리팩터링]]으로 없앤다.[@beck-test-driven-development-2002]

![[diagrams/tdd-red-green-refactor-cycle.svg]]

Kent Beck은 2023년 글 "Canon TDD"에서 TDD의 흐름을 다음처럼 적었다. 먼저 다룰 테스트 시나리오의 목록을 적는다. 목록의 항목 하나를 실행할 수 있는 테스트로 바꿔 실패하는 테스트를 만들고, 그 테스트를 통과시킨 뒤, 필요하면 리팩터링한다. 이를 목록이 빌 때까지 되풀이하고, 하다가 떠오른 시나리오는 목록에 더한다. 통과시키는 단계에 리팩터링을 섞는 것과, 목록의 항목을 미리 모두 테스트로 바꿔 두는 것은 실수로 든다.[@beck-canon-tdd-2023]

## 작은 단계

TDD에서는 테스트를 한 번에 하나만 더한다.[@beck-canon-tdd-2023] 새 코드는 실패한 테스트가 요구하는 만큼만 쓴다. 문제가 어려울수록 테스트 하나가 다루는 범위를 좁힌다.[@beck-test-driven-development-2002]

## 기원

Beck은 자기가 TDD를 재발견했다고 말한다. 그는 1994년에 [[xunit|SUnit]]을 썼고, 1995년 10월 OOPSLA(Object-Oriented Programming, Systems, Languages, and Applications) 학회에서 Ward Cunningham에게 TDD를 시연했다.[@beck-canon-tdd-2023] Beck은 2002년에 『Test-Driven Development: By Example』을 내 TDD를 정리했다. 이 책의 2부에서는 TDD로 xUnit 테스트 프레임워크를 만들어 보이고, 3부에서는 xUnit으로 테스트를 쓰는 패턴을 다룬다.[@beck-test-driven-development-2002]

## 효과에 관한 연구

- Nagappan 등은 Microsoft의 세 팀과 IBM의 한 팀을 사례 연구했다. TDD를 쓴 네 제품의 출시 전 [[software-metric#결함 밀도|결함 밀도]]는 TDD를 쓰지 않은 비슷한 프로젝트보다 40\~90% 낮았다(IBM 40%, Microsoft 60\~90%). 관리자들은 초기 개발 시간이 15\~35% 늘었다고 추정했다.[@nagappan-realizing-quality-improvement-2008]
- Fucci 등은 전문 개발자 39명의 작업 82건을 분석해, 품질과 생산성의 향상이 주로 주기가 잘고 고른 것과 관련이 있고 테스트와 제품 코드를 쓰는 순서는 뚜렷한 영향이 없었다고 보고했다. 이들은 TDD의 효과가 테스트를 먼저 쓰는 것보다 잘고 꾸준한 단계에서 올 수 있다고 결론지었다.[@fucci-dissection-tdd-2017]

## 다른 테스트와의 관계

TDD는 [[unit-testing|단위 테스트]]를 정의하고 유지해야 하는 관행이고, [[regression-testing|회귀 테스트]]는 TDD의 기본 활동이다.[@ieee-swebok-v4-0a-2026] TDD 같은 테스트 주도 접근에서 만든 테스트는 자동 테스트로 남아, 이후의 수정과 리팩터링에서 코드 품질을 지키는 데 쓰일 수 있다.[@istqb-ctfl-syllabus-2024]
