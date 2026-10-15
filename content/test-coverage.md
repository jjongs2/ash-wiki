---
title: 테스트 커버리지
tags:
  - sw-engineering/sw-testing
verified: 2026-10-03
---

**테스트 커버리지**(test coverage)는 테스트가 정해진 커버리지 항목을 얼마나 실행했는지를 백분율로 나타낸 정도다.[@istqb-glossary-coverage-2026][@ieee-cs-sevocab-2026] **커버리지 항목**(coverage item)은 테스트 기법으로 하나 이상의 테스트 조건에서 끌어낸 속성이나 속성의 조합이다.[@istqb-glossary-coverage-item-2026] 달성한 커버리지는 테스트가 얼마나 철저한지 재는 척도이고, 테스트를 끝낼지 정하는 흔한 종료 기준 가운데 하나다.[@istqb-ctfl-syllabus-2024]

## 기법마다 다른 커버리지 항목

커버리지 항목은 테스트 기법마다 다르다. [[equivalence-partitioning|동치 분할]]은 분할을, [[boundary-value-analysis|경계값 분석]]은 [[boundary-value-analysis#경계값|경계값]]을, 구문 테스트는 구문을, 분기 테스트는 분기를 커버리지 항목으로 삼는다. ISTQB CTFL v4.0.1 강의계획서가 다루는 [[black-box-testing|블랙박스]] 기법은 명세된 동작에서 고른 항목으로 커버리지를 재고, [[white-box-testing|화이트박스]] 기법인 구문 테스트와 분기 테스트는 코드의 구문과 분기로 커버리지를 잰다. 코드와 상관없는 커버리지를 쓰는 화이트박스 기법도 있다.[@istqb-ctfl-syllabus-2024]

[[traceability|추적성]]은 커버리지 평가를 돕는다.[@istqb-ctfl-syllabus-2024]

[[black-box-testing#요구사항 기반 테스트|요구사항 기반 테스트]]의 **요구사항 커버리지** $C_\mathrm{req}$는 적어도 한 [[test-case|테스트 케이스]]가 다룬 원자 요구사항의 수 $n_\mathrm{covered}$와 전체 원자 요구사항의 수 $n_\mathrm{total}$로 다음과 같이 잰다.[@istqb-ct-aut-syllabus-2025]

$$
C_\mathrm{req} = \frac{n_\mathrm{covered}}{n_\mathrm{total}}
$$

**구조적 커버리지**(structural coverage)는 구성 요소나 시스템의 내부 구조에 바탕을 둔 커버리지 척도다.[@istqb-glossary-structural-coverage-2026]

## 조건과 결정

ISO/IEC/IEEE 24765 용어집은 **조건**(condition)을 불 연산자를 담지 않은 불 식으로, **결정**(decision)을 둘 이상의 가능한 결과 사이의 선택이 어떤 동작들이 일어날지를 정하는 문의 종류로, **결정 결과**(decision outcome)를 실행할 분기를 정하는 결정의 결과로 정의한다.[@ieee-cs-sevocab-2026]

## 구조적 커버리지 기준

구조적 커버리지 기준마다 이루어야 하는 상태는 다음과 같다.

| 기준                                            | 이루어야 하는 상태                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 구문 커버리지(statement coverage)               | 실행 가능한 구문이 모두 적어도 한 번 실행되었다.[@istqb-ctfl-syllabus-2024]                                                                 |
| 결정 커버리지(decision coverage)                | 각 결정이 가능한 모든 결과를 적어도 한 번씩 가졌다.[@istqb-glossary-decision-coverage-2026]                                                 |
| 조건 커버리지(condition coverage)               | 각 결정 안의 각 조건이 가능한 모든 값을 적어도 한 번씩 가졌다.[@istqb-glossary-condition-coverage-2026]                                     |
| [[modified-condition-decision-coverage\|MC/DC]] | 결정 커버리지와 조건 커버리지에 더해, 각 조건이 결정의 결과에 독립적으로 영향을 준다는 것을 보였다.[@hayhurst-practical-tutorial-mcdc-2001] |
| 다중 조건 커버리지(multiple condition coverage) | 각 결정 안 조건 값의 모든 조합이 실행되었다.[@istqb-glossary-multiple-condition-coverage-2026]                                              |

구문 커버리지 100%를 이뤄도, 분모가 0일 때만 실패하는 나눗셈처럼 데이터에 따라 드러나는 결함은 찾지 못할 수 있고, 결정 논리의 분기를 모두 실행하지 않았을 수도 있다. 분기 커버리지 100%를 이뤄도 특정 경로를 실행해야 드러나는 결함은 찾지 못할 수 있다.[@istqb-ctfl-syllabus-2024]

llvm-cov의 커버리지 요약에서 **함수 커버리지**(function coverage)는 적어도 한 번 실행된 함수의 비율이다.[@llvm-source-based-code-coverage-2026]

## 포함 관계

어떤 커버리지를 100% 이룬 테스트 케이스 집합이 언제나 다른 커버리지도 100% 이루는 관계를 포함한다(subsume)고 부른다.[@istqb-ctfl-syllabus-2024] 분기 커버리지는 구문 커버리지를 포함한다. 분기 커버리지 100%를 이룬 테스트는 구문 커버리지도 100% 이룬다.[@istqb-ctfl-syllabus-2024][@iso-26262-1-obp-2018] 그 역은 성립하지 않는다.[@istqb-ctfl-syllabus-2024]

MC/DC는 결정 커버리지와 조건 커버리지의 요구를 모두 담으므로 두 커버리지를 포함한다. 다중 조건 커버리지는 결정 입력의 모든 조합을 실행하므로 대개 각 조건의 [[modified-condition-decision-coverage#독립적인 영향|독립적인 영향]]도 보이게 된다. 그러나 이를 명시적으로 요구하지는 않고, 어떤 조건도 독립적인 영향을 가질 수 없는 논리식도 있다.[@hayhurst-practical-tutorial-mcdc-2001]

![[diagrams/structural-coverage-subsumption.svg]]

## 결정 커버리지와 분기 커버리지

ISTQB 용어집은 결정 커버리지를 결정 결과의 커버리지로, **분기 커버리지**(branch coverage)를 [[basis-path-testing#제어 흐름 그래프|제어 흐름 그래프]]의 분기의 커버리지로 따로 정의한다.[@istqb-glossary-decision-coverage-2026][@istqb-glossary-branch-coverage-2026]

NIST SP 500-235에 따르면 분기 커버리지 방식에서는 테스트 중에 모든 결정 결과를 실행해야 한다.[@nist-sp-500-235-1996] ISO/IEC/IEEE 24765 용어집은 **분기 테스트**(branch testing)를 프로그램의 각 결정 지점의 각 결과를 실행하도록 설계한 테스트로 정의한다.[@ieee-cs-sevocab-2026]

ISTQB CTFL v4.0.1 강의계획서는 **분기**(branch)를 제어 흐름 그래프의 두 노드 사이의 제어 이동으로 정의하고, 이 이동에 직선 코드 같은 무조건 이동과 결정 결과에 따른 조건부 이동을 모두 넣는다. 그래서 이 정의를 따르면 분기 커버리지 100%는 무조건 분기와 조건부 분기를 모두 실행한 것이다.[@istqb-ctfl-syllabus-2024] [[iso-26262|ISO 26262]]-1:2018은 분기 커버리지를 테스트 중에 실행된, 컴퓨터 프로그램 제어 흐름의 분기의 백분율로, 구문 커버리지를 소프트웨어 안에서 실행된 구문의 백분율로 정의한다. 분기 커버리지의 정의에 단 Note는 `if` 문이 `else` 절이 있든 없든 늘 참과 거짓의 두 분기를 갖는다는 것을 제시한다.[@iso-26262-1-obp-2018]

## 도구의 정의

llvm-cov의 커버리지 요약에서 branch coverage는 참 분기와 거짓 분기 가운데 적어도 한 번 지난 것의 백분율이고, 각 분기는 소스 코드의 개별 조건에 묶인다. 예를 들어 `x = (y == 2) || (z < 10)`은 조건 둘로 이루어져 분기 결과가 넷이다.[@llvm-source-based-code-coverage-2026]

Simulink Coverage의 코드 커버리지에서 조건은 관계 연산자, 등가 연산자, 논리 부정 연산자를 담되 논리 연산자 `&&`, `||`를 담지 않는 C/C++ 불 식이고, `if`, `while`, `do-while` 같은 분기 구문 안의 조건은 조건 커버리지가 아니라 결정 커버리지로 보고된다. 결정은 조건과 하나 이상의 `&&`나 `||`로 이루어진 불 식이며, 분기 구문 안의 조건도 결정이다.[@mathworks-slcoverage-code-coverage-2026]

같은 제품의 모델 커버리지에서는 MCDC가 결정 커버리지나 조건 커버리지를 다 이루지 않을 수 있어서, 결정 커버리지 100% 없이 MCDC 100%를 이룰 수 있다.[@mathworks-slcoverage-model-coverage-2026]

## ISO 26262-6

ISO 26262-6:2018은 소프트웨어 유닛 검증을 9절에, 소프트웨어 통합과 검증을 10절에 둔다. 소프트웨어 유닛 수준의 구조적 커버리지 척도는 표 9에서, [[software-architecture|소프트웨어 아키텍처]] 수준의 구조적 커버리지는 표 12에서 다룬다.[@iso-26262-6-obp-2018]
