---
title: 변형 조건/결정 커버리지
aliases:
  - MC/DC
tags:
  - sw-engineering/sw-testing
verified: 2026-10-03
---

**변형 조건/결정 커버리지**(modified condition/decision coverage, MC/DC)는 [[test-coverage#조건과 결정|결정]] 안의 각 조건이 결정의 결과에 독립적으로 영향을 준다는 것을 보이도록 요구하는 [[test-coverage#기법마다 다른 커버리지 항목|구조적 커버리지]] 기준이다.[@hayhurst-practical-tutorial-mcdc-2001][@chilenski-applicability-mcdc-1994] MC/DC를 이루려면 다음을 모두 만족해야 한다.

- 프로그램의 모든 진입점과 출구가 적어도 한 번 실행되었다.
- 모든 결정이 가능한 모든 결과를 적어도 한 번 가졌다.
- 결정 안의 모든 조건이 가능한 모든 값을 적어도 한 번 가졌다.
- 결정 안의 각 조건이 결정의 결과에 독립적으로 영향을 준다는 것이 보였다.[@hayhurst-practical-tutorial-mcdc-2001]

[[iso-26262|ISO 26262]]-1:2018은 MC/DC를, 결정 결과에 독립적으로 영향을 주는 개별 조건의 결과 모두 가운데 제어 흐름에서 실행된 것의 백분율로 정의한다.[@iso-26262-1-obp-2018]

## 독립적인 영향

조건 하나의 독립적인 영향은 두 케이스로 보인다. 두 케이스는 결정의 결과가 서로 다르고 그 조건의 값이 서로 다르며, 다른 조건은 값이 그대로이거나 가려져(masked) 있다. 이 두 케이스를 **독립성 쌍**(independence pair)이라 한다.[@chilenski-three-forms-mcdc-2001]

예를 들어 `a && b`에서 a의 영향은 (참, 참)과 (거짓, 참)의 짝이, b의 영향은 (참, 참)과 (참, 거짓)의 짝이 보인다. 세 케이스 (참, 참), (거짓, 참), (참, 거짓)으로 MC/DC를 이룬다.[@hayhurst-practical-tutorial-mcdc-2001]

![[diagrams/mcdc-independence-pairs.svg]]

## Unique-cause와 masking

독립적인 영향을 보이는 방식으로 unique-cause MC/DC와 masking MC/DC가 있고, 강하게 결합된 조건에만 masking을 허용하는 unique-cause+masking MC/DC도 있다.[@chilenski-three-forms-mcdc-2001]

- **Unique-cause MC/DC**: 독립성 쌍의 두 케이스 사이에 그 조건과 결정의 결과만 값이 바뀌고, 다른 조건은 모두 그대로다.
- **Masking MC/DC**: 결정 안의 다른 조건도 값이 바뀔 수 있다. 다만 Boolean 논리로 따져서 다른 조건이 결정의 결과에 영향을 주지 않는다는 것을 확인해야 한다.[@hayhurst-practical-tutorial-mcdc-2001]

and 연산자에서는 한쪽 피연산자를 거짓으로 두면 다른 쪽이 가려진다. `a && b`에서 a가 거짓이면 b의 값은 결과에 영향을 주지 못한다.[@chilenski-three-forms-mcdc-2001]

**결합 조건**(coupled conditions)은 하나를 바꾸면 다른 것도 바뀔 수 있는 조건들이다. 하나를 바꾸면 늘 다른 것도 바뀌는 조건을 강하게 결합된(strongly coupled) 조건이라 하고, 결정 안에 되풀이된 같은 조건도 여기에 든다.[@chilenski-three-forms-mcdc-2001] 결정 안에 되풀이되거나 강하게 결합된 조건이 있으면 그 조건만 바꿀 수 없어서, 그 결정에는 unique-cause 방식을 쓸 수 없다. `(A and B) or (A and C)`가 그런 예다.[@hayhurst-practical-tutorial-mcdc-2001][@chilenski-three-forms-mcdc-2001] masking MC/DC는 unique-cause MC/DC보다 더 많은 결정에서 이룰 수 있고, 결합 조건이 있는 결정에도 쓸 수 있다.[@chilenski-three-forms-mcdc-2001]

## 케이스 수

결정의 조건 $n$개가 서로 다르고 각각 한 번씩만 나오며 커버리지를 이루는 케이스 집합이 있으면, unique-cause MC/DC는 적어도 $n+1$개의 케이스가 필요하다. 같은 가정에서 masking MC/DC의 최소 케이스 수는 $\lceil 2\sqrt{n} \rceil$이다.[@chilenski-three-forms-mcdc-2001]

다중 조건 커버리지는 조건 값의 모든 조합, 곧 $2^n$개의 케이스가 필요하다. MC/DC는 다중 조건 커버리지의 이점을 상당 부분 얻으면서, 필요한 케이스 수가 조건 수에 선형으로 늘도록 만든 기준이다. 다중 조건 커버리지의 케이스 수는 조건 수에 지수로 는다.[@hayhurst-practical-tutorial-mcdc-2001] 예를 들어 조건이 10개면 다중 조건 커버리지는 1024개의 케이스가 필요하고, unique-cause MC/DC는 적어도 11개의 케이스가 필요하다.[@hayhurst-practical-tutorial-mcdc-2001][@chilenski-three-forms-mcdc-2001]

## 도구

GCC(GNU Compiler Collection)는 `-fcondition-coverage` 옵션으로 프로그램의 조건을 계측한다. 실행 중에 조건문의 어느 항이 결정에 기여했는지 기록해, Boolean 함수의 모든 항이 시험되었고 결정의 결과에 독립적으로 영향을 주는지 확인할 수 있게 하고, 그 결과는 gcov의 `--conditions` 옵션으로 읽는다.[@gcc-instrumentation-options-2026] gcov는 결정에 독립적으로 영향을 준 조건 결과를 덮은 것으로 세며, 이 방식은 masking MC/DC다.[@gcc-invoking-gcov-2026]

Clang은 `-fprofile-instr-generate`, `-fcoverage-mapping`에 더해 `-fcoverage-mcdc`를 주면 MC/DC를 계측하고, llvm-cov는 `-show-mcdc-summary`를 줄 때 MC/DC 통계를 보인다. llvm-cov는 조건의 결과를 바꿀 때 결정의 결과도 바뀌고 다른 조건의 결과는 그대로이거나 단락 평가로 평가되지 않아 가려지는 것을, 식을 지나며 실행된 제어 흐름인 테스트 벡터를 분석해 보인다. 조건 하나뿐인 Boolean 식은 분기 커버리지로 바로 알 수 있어 MC/DC 분석에서 뺀다.[@llvm-source-based-code-coverage-2026]

Clang은 MC/DC 계측에 두 한도를 둔다. 식 하나의 항 수는 32767까지이고, 식에서 나올 수 있는 조합의 최대 수인 테스트 벡터 수는 2,147,483,646까지다. 옵션으로 항 수와 식마다의 테스트 벡터 수를 더 좁힐 수 있고, 그렇게 정한 값을 넘는 식은 경고를 내고 MC/DC 커버리지에서 뺀다. 항이 $n$개인 식의 테스트 벡터 수는 최악의 경우 $2^n$까지 늘 수 있지만 대개 훨씬 적고, 연산자 하나가 이어지는 단순한 식에서는 $n+1$이다.[@llvm-source-based-code-coverage-2026]

MathWorks의 커버리지 분석 소프트웨어인 Simulink Coverage의 모델 커버리지에서는 MCDC가 위 정의와 달리 결정 커버리지나 조건 커버리지를 다 이루지 않을 수 있어서, 결정 커버리지 100% 없이 MCDC 100%를 이룰 수 있다.[@mathworks-slcoverage-model-coverage-2026]

## 기원

Chilenski와 Miller는 1994년 논문에서 MC/DC 기준과 그 성질을 제시했다.[@chilenski-applicability-mcdc-1994]
