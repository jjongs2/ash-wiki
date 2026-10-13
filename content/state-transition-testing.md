---
title: 상태 전이 테스트
tags:
  - process/sw-testing
verified: 2026-10-13
---

**상태 전이 테스트**(state transition testing)는 상태 모델의 전이를 실행하는 데 바탕을 둔 [[black-box-testing|블랙박스]] 기법이다.[@iso-iec-ieee-29119-4-obp-2021][@istqb-glossary-state-transition-testing-2026] [[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-4:2021은 상태 모델의 예로 상태 전이 다이어그램과 상태 표를 든다.[@iso-iec-ieee-29119-4-obp-2021] ISTQB 용어집은 이 기법의 테스트 조건을 상태 전이나 상태 전이의 열로 정의한다.[@istqb-glossary-state-transition-testing-2026]

ISTQB CTAL-TA(Certified Tester Advanced Level Test Analyst) 강의계획서에 따르면 복잡한 시스템 가운데 다수는 이벤트에 대한 반응이 현재 상태에 달린, 상태를 갖는(stateful) 시스템이다. 임베디드 시스템, 대화 기반 시스템, 제어 시스템, 엔티티와 그 생명주기를 다루는 시스템이 그 예다. 상태 전이 테스트는 어느 [[software-testing#테스트 레벨|테스트 레벨]]에서나 쓸 수 있다.[@istqb-ctal-ta-syllabus-2025]

## 상태 다이어그램과 상태 표

ISTQB CTFL 강의계획서에 따르면 **상태 다이어그램**(state diagram)은 시스템이 가질 수 있는 상태와 유효한 상태 전이를 보여 시스템의 동작을 모델링한다. 전이는 이벤트로 시작되고, 이벤트에는 가드 조건(guard condition)이 더 붙을 수 있다. 전이는 순간에 일어난다고 가정하며, 그 결과로 소프트웨어가 동작(action)을 하기도 한다. 전이에는 흔히 event [guard condition] / action 꼴의 이름표를 달고, 가드 조건과 동작이 없거나 테스터에게 상관없으면 뺀다.[@istqb-ctfl-syllabus-2024]

**상태 표**(state table)는 상태 다이어그램과 동등한 모델이다. 행은 상태를, 열은 이벤트(가드 조건이 있으면 함께)를 나타내고, 칸은 전이로서 목표 상태와, 정해져 있으면 그 결과인 동작을 담는다. 상태 다이어그램과 달리 상태 표는 무효 전이를 빈칸으로 드러낸다.[@istqb-ctfl-syllabus-2024]

상태 다이어그램이나 상태 표에 바탕을 둔 [[test-case|테스트 케이스]]는 대개 이벤트의 열로 나타내고, 그 결과로 상태 변화의 열(필요하면 동작도)이 생긴다. 테스트 케이스 하나는 보통 상태 사이의 전이 여럿을 덮는다.[@istqb-ctfl-syllabus-2024]

## 커버리지

상태 전이 테스트에는 [[test-coverage|커버리지]] 기준이 많고, 이 강의계획서는 그 가운데 셋을 다룬다. 세 기준 모두 커버리지를 백분율로 나타낸다. all states와 valid transitions 커버리지는 전체 커버리지 항목의 수가 $N$이고 그 가운데 실행한 항목의 수가 $N_\mathrm{exec}$이면 다음과 같다.[@istqb-ctfl-syllabus-2024]

$$
C = \frac{N_\mathrm{exec}}{N} \times 100\,\%
$$

- **all states 커버리지**: 커버리지 항목은 상태다. 100%를 이루려면 모든 상태를 실행해야 한다.
- **valid transitions 커버리지**: 0-switch 커버리지라고도 부른다. 커버리지 항목은 유효한 전이 하나하나다. 100%를 이루려면 유효한 전이를 모두 실행해야 한다.
- **all transitions 커버리지**: 커버리지 항목은 상태 표에 있는 모든 전이다. 100%를 이루려면 유효한 전이를 모두 실행하고 무효 전이를 모두 실행하려 시도해야 한다. 커버리지는 위 식에서 $N_\mathrm{exec}$를 실행했거나 실행을 시도한 유효·무효 전이의 수로, $N$을 전체 유효·무효 전이의 수로 둔 값이다.[@istqb-ctfl-syllabus-2024]

테스트 케이스 하나에서 무효 전이를 하나만 테스트하면, 한 결함이 다른 결함의 검출을 막는 **결함 가림**(defect masking)을 피하는 데 도움이 된다.[@istqb-ctfl-syllabus-2024]

all states 커버리지는 대개 모든 전이를 실행하지 않고도 이룰 수 있어서 valid transitions 커버리지보다 약하다. valid transitions 커버리지는 가장 널리 쓰이는 기준이고, 이를 100% 이루면 all states 커버리지도 100%가 된다. all transitions 커버리지를 100% 이루면 나머지 두 기준도 100%가 된다. 이 강의계획서는 mission-critical과 [[functional-safety#안전과 리스크|safety-critical]] 소프트웨어에는 all transitions 커버리지를 최소한의 요구로 삼기를 권한다.[@istqb-ctfl-syllabus-2024]

## N-switch와 round-trip 커버리지

CTAL-TA 강의계획서는 CTFL 강의계획서의 커버리지 기준에 더해 두 기준을 다룬다. 이 강의계획서에 따르면 두 기준은 결함 검출 효과가 높다는 것이 실증되었다.[@istqb-ctal-ta-syllabus-2025]

- **N-switch 커버리지**: 연이은 유효한 전이 $N+1$개의 열을 N-switch라 부르고, 이를 커버리지 항목으로 삼는다. 0-switch 커버리지는 valid transitions 커버리지와 같다. 1-switch는 한 상태로 들어오는 전이와 나가는 전이의 쌍이다. N-switch의 끝에 이어지는 유효한 전이를 붙이면 $(N+1)$-switch가 된다. 실무에서는 0-switch와 1-switch 커버리지를 자주 쓴다. N-switch의 수는 $N$에 따라 지수로 늘 수 있어서, 2-switch 이상의 커버리지 100%는 예상하지 못한 이벤트 순서로 failure가 날 리스크가 높을 때만 권한다.
- **round-trip 커버리지**: 상태 기반 모델에서 루프를 이루는 경로를 대상으로 한다. round trip은 시작 상태와 끝 상태가 같고, 루프 안의 다른 상태가 두 번 나오지 않는 루프다. 커버리지 항목은 round trip이다.[@istqb-ctal-ta-syllabus-2025]

![[diagrams/state-transition-n-switch-round-trip.svg]]

이 강의계획서에 따르면 상태 전이 테스트는 [[model-based-testing|모델 기반 테스트]] 도구로 자동화하기에 알맞다. 대부분의 블랙박스 기법처럼, 모델링하는 동안 명세의 결함을 찾아 결함 예방에도 이바지한다.[@istqb-ctal-ta-syllabus-2025]
