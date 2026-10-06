---
title: 경계값 분석
tags:
  - process/sw-testing
verified: 2026-10-03
---

**경계값 분석**(boundary value analysis)은 [[equivalence-partitioning|동치 분할]]로 나눈 분할의 경계를 실행하는 데 바탕을 두고 [[test-case|테스트 케이스]]를 끌어내는 [[black-box-testing|블랙박스]] 기법이다.[@iso-iec-ieee-29119-4-obp-2021][@istqb-ctfl-syllabus-2024]

ISTQB CTFL 강의계획서에 따르면 개발자는 경계값에서 실수하기 쉬워서, 경계값 분석은 분할의 경계값에 초점을 둔다. 이 기법으로 찾는 전형적인 결함은 구현한 경계가 의도한 자리보다 위나 아래로 어긋나 있거나 아예 빠진 것이다.[@istqb-ctfl-syllabus-2024]

## 경계값

이 강의계획서는 분할의 최솟값과 최댓값을 **경계값**(boundary value)이라 부른다. 이 강의계획서에 따르면 경계값 분석은 분할의 경계를 실행하는 기법이라 순서가 있는 분할에만 쓸 수 있다.[@istqb-ctfl-syllabus-2024]

## 2값과 3값 경계값 분석

이 강의계획서는 경계값 분석을 두 갈래로 나눈다. 두 갈래는 경계마다 [[test-coverage|커버리지]] 100%에 필요한 커버리지 항목의 수가 다르다.[@istqb-ctfl-syllabus-2024]

- **2값 경계값 분석**: 경계값마다 그 경계값과, 이웃한 분할에 속하는 가장 가까운 값을 커버리지 항목으로 삼는다. 이웃한 분할에서 가장 가까운 값은 그 분할의 경계값이므로, 커버리지 항목은 모두 경계값이다.
- **3값 경계값 분석**: 경계값마다 그 경계값과 양쪽 이웃 값을 커버리지 항목으로 삼는다.[@istqb-ctfl-syllabus-2024]

식별한 커버리지 항목의 수가 $N$이고 그 가운데 실행한 항목의 수가 $N_\mathrm{exec}$이면, 커버리지는 다음과 같다.[@istqb-ctfl-syllabus-2024]

$$
C = \frac{N_\mathrm{exec}}{N} \times 100\,\%
$$

3값 경계값 분석은 2값보다 엄격해서, 2값이 놓치는 결함을 찾을 수 있다. 예를 들어 `x <= 10`이어야 할 조건을 `x == 10`으로 잘못 구현하면, 2값의 테스트 데이터인 10과 11로는 이 결함을 찾지 못하지만, 3값이 더하는 9로는 찾을 가능성이 높다.[@istqb-ctfl-syllabus-2024]

![[diagrams/boundary-value-analysis-two-three-value.svg]]

## 동치 분할과의 관계

동치 분할은 분할마다 값 하나를 테스트하면 된다고 보지만, 경계값 분석은 분할의 경계값을 테스트한다.[@istqb-ctfl-syllabus-2024]
