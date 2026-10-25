---
title: 소프트웨어 메트릭
tags:
  - sw-engineering/sw-testing
aliases:
  - 코드 메트릭
verified: 2026-10-03
---

[[software-engineering|소프트웨어 공학]]에서 **메트릭**(metric)은 측정 척도와 측정 방법을 함께 정한 것이다.[@istqb-glossary-metric-2026][@ieee-cs-sevocab-2026] ISO/IEC/IEEE 24765 용어집은 품질 메트릭(quality metric)을, 어떤 항목이 주어진 품질 속성을 갖는 정도를 정량적으로 나타낸 척도로 정의한다. 소프트웨어 데이터를 받아 그 정도로 해석할 수 있는 수치 하나를 내는 함수로도 정의한다.[@ieee-cs-sevocab-2026]

이 용어집은 제품 자체를 재는 척도를 내부 척도(internal measure)로 정의하고, 코드 줄 수와 복잡도 척도를 그 예로 든다.[@ieee-cs-sevocab-2026] 내부 품질과 외부 품질은 [[software-quality-model#내부 품질, 외부 품질, 사용 품질|소프트웨어 품질 모델]]에서 다룬다.

## 규모

이 용어집은 SLOC(source lines of code)를 컴파일하기 전 프로그램에 든 프로그래밍 언어 코드의 줄 수로 정의하고, LOC를 lines of code의 약어로 둔다. 이 용어집은 **line of code**를 주석도 빈 줄도 아닌, 인도되는(delivered) 소스 문장으로 정의한다.[@ieee-cs-sevocab-2026]

SonarQube Server는 물리적 줄 수(lines)와, 공백이나 탭이 아니고 주석의 일부도 아닌 글자를 하나 이상 담은 줄의 수(lines of code)를 따로 센다.[@sonarsource-sonarqube-metrics-definition-2026]

## 복잡도

McCabe는 1976년 IEEE Transactions on Software Engineering 논문 "A Complexity Measure"에서 그래프 이론에 기반한 프로그램 복잡도 척도를 제안했고[@mccabe-complexity-measure-1976], 이 척도의 이름은 [[cyclomatic-complexity|순환 복잡도]](cyclomatic complexity)다.[@nist-sp-500-235-1996]

SonarSource는 2016년 12월 cognitive complexity를 내놓았다. 메서드의 제어 흐름을 이해하기 어려운 정도를 상대적으로 재려는 메트릭이다.[@sonarsource-cognitive-complexity-blog-2016] SonarSource 백서가 정한 셈법은 다음과 같다.

- 코드의 선형 흐름을 끊는 구조마다 1을 더한다. 반복문, 조건문, `catch`, `switch`, 같은 종류의 이항 논리 연산자 열, 재귀 고리에 든 메서드, `goto`와 레이블로 가는 `break`·`continue`가 그런 구조다. 조기 `return` 같은 다른 점프에는 더하지 않는다.
- 반복문, 조건문, `catch` 같은 구조가 다른 구조 안에 중첩되면 중첩 수준마다 1을 더 더한다. `else if`와 `else`는 중첩 가산을 받지 않는다.
- 백서에 따르면 순환 복잡도는 `switch`의 `case`마다 1을 더하지만, cognitive complexity는 `switch` 전체에 1만 더한다. 같은 이항 논리 연산자가 이어지면 그 열 전체를 한 번만 센다.[@sonarsource-cognitive-complexity-2023]

## 결합

Robert C. Martin은 1994년 글 "OO Design Quality Metrics: An Analysis of Dependencies"에서 클래스 카테고리의 instability $I$를 정의했다. 카테고리 밖에 있으면서 카테고리 안의 클래스에 의존하는 클래스의 수를 $C_\mathrm{a}$, 카테고리 안에 있으면서 밖의 클래스에 의존하는 클래스의 수를 $C_\mathrm{e}$라 하면 다음과 같다.[@martin-oo-design-quality-metrics-1994]

$$
I = \frac{C_\mathrm{e}}{C_\mathrm{a} + C_\mathrm{e}}
$$

$I$는 0에서 1 사이이며, 0이면 가장 안정적이고 1이면 가장 불안정하다.[@martin-oo-design-quality-metrics-1994]

![[diagrams/martin-instability-ca-ce.svg]]

결합도 자체의 정의는 [[cohesion-and-coupling#결합도|응집도와 결합도]]에서 다룬다.

## 결함 밀도

**결함 밀도**(defect density)는 작업 산출물의 규모 단위당 결함 수다.[@ieee-cs-sevocab-2026][@istqb-glossary-defect-density-2026] ISO/IEC/IEEE 24765 용어집은 그 예로 코드 1000줄당 문제 보고 수를 든다.[@ieee-cs-sevocab-2026]

## HIS 소스 코드 메트릭

[[automotive-spice#개정 이력|HIS]]는 Audi, BMW Group, DaimlerChrysler, Porsche, Volkswagen 같은 독일 완성차 업체가 함께 꾸린 이니셔티브다.[@his-wg-assessment-2006] HIS는 소프트웨어를 평가하는 기본 메트릭 세트를 문서 HIS-SC-Metriken으로 정했고, 2008년 판은 1.3.1이다.[@his-softwaretest-2008]
