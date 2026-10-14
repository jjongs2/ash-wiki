---
title: 동치 분할
tags:
  - process/sw-testing
verified: 2026-10-03
---

**동치 분할**(equivalence partitioning)은 테스트 대상이 같게 다루리라 기대되는 입력이나 출력의 값을 분할(partition)로 묶고, 분할마다 대표값으로 그 분할을 실행하는 [[black-box-testing|블랙박스]] 기법이다.[@iso-iec-ieee-29119-4-obp-2021][@istqb-glossary-equivalence-partitioning-2026] [[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-4:2021은 동치 클래스(equivalence class)를 분할과 같은 뜻의 용어로 둔다.[@iso-iec-ieee-29119-4-obp-2021]

동치 분할은 한 분할의 값 하나로 결함이 드러나면 같은 분할의 다른 값으로도 그 결함이 드러나리라는 생각에 기댄다. 그래서 분할마다 테스트 하나면 된다.[@istqb-ctfl-syllabus-2024]

## 유효 분할과 무효 분할

유효한 값을 담은 분할을 **유효 분할**(valid partition), 무효한 값을 담은 분할을 **무효 분할**(invalid partition)이라 부른다. 유효와 무효의 정의는 팀과 조직마다 다르다. 유효한 값은 테스트 대상이 처리해야 하는 값으로도, 명세가 처리를 정한 값으로도 해석된다. 무효한 값은 테스트 대상이 무시하거나 거부해야 하는 값으로도, 명세가 처리를 정하지 않은 값으로도 해석된다.[@istqb-ctfl-syllabus-2024]

## 분할을 두는 곳

분할은 입력뿐 아니라 출력에도 둔다.[@iso-iec-ieee-29119-4-obp-2021][@istqb-ctfl-syllabus-2024] 분할은 설정 항목, 내부 값, 시간에 관련된 값, 인터페이스 매개변수에도 둘 수 있다. 분할은 연속이거나 이산일 수 있다. 분할끼리는 겹치지 않아야 하고, 빈 분할이 없어야 한다.[@istqb-ctfl-syllabus-2024]

## 커버리지

동치 분할의 [[test-coverage|커버리지]] 항목은 분할이다. 식별한 분할의 수가 $N$이고 그 가운데 [[test-case|테스트 케이스]]가 하나라도 실행한 분할의 수가 $N_\mathrm{exec}$이면, 커버리지는 다음과 같다.[@istqb-ctfl-syllabus-2024]

$$
C = \frac{N_\mathrm{exec}}{N} \times 100\,\%
$$

커버리지 100%를 이루려면 무효 분할을 포함해 식별한 모든 분할을 적어도 한 번씩 실행해야 한다.[@istqb-ctfl-syllabus-2024]

입력 매개변수가 여럿인 것처럼 분할 집합이 여럿이면, 집합마다 각 분할을 적어도 한 번 실행하게 하는 가장 단순한 기준이 **each choice 커버리지**다. each choice 커버리지는 분할의 조합을 따지지 않는다.[@istqb-ctfl-syllabus-2024] ISO/IEC/IEEE 29119-4:2021은 매개변수 값의 조합을 실행하는 [[pairwise-testing#조합 테스트|조합 테스트]] 설계 기법의 예로 [[pairwise-testing|페어와이즈 테스트]]와 each choice 테스트를 든다.[@iso-iec-ieee-29119-4-obp-2021]

분할의 경계를 실행하는 기법은 [[boundary-value-analysis|경계값 분석]]이다.[@iso-iec-ieee-29119-4-obp-2021][@istqb-ctfl-syllabus-2024]
