---
title: Back-to-back 테스트
tags:
  - process/sw-testing
verified: 2026-10-03
---

ISTQB(International Software Testing Qualifications Board) 용어집은 **back-to-back 테스트**(back-to-back testing)를 pseudo-oracle을 쓰는 테스트 접근법으로 정의한다. 용어집에 따르면 **pseudo-oracle**은 테스트 대상과 독립적으로 만든 변형으로, 같은 테스트 입력에서 낸 결과를 원래 테스트 대상의 결과와 견주는 데 쓴다.[@istqb-glossary-back-to-back-testing-2026][@istqb-glossary-pseudo-oracle-2026]

ISTQB CT-AuT(Certified Tester Automotive Software Tester) 강의계획서에 따르면 back-to-back 테스트에서는 모든 변형에 같은 테스트 케이스를 실행해 결과를 견주고, 같으면 통과로 보며, 다르면 그 차이의 원인을 분석한다. 이 테스트는 테스트 대상끼리나 그 환경 사이에 생긴 의도하지 않은 차이를 아주 작은 것까지 드러내려는 것이다.[@istqb-ct-aut-syllabus-2025]

## 모델과 생성 코드

모델 기반 개발에서는 실행 가능한 모델과 그 모델에서 만든 코드를 같은 입력으로 실행해 결과를 견주는 데 back-to-back 테스트를 쓴다. 모델 시뮬레이션([[x-in-the-loop|MiL]])의 결과를 SiL에서 실행한 생성 코드의 결과와 견주는 것이 그 예다.[@istqb-ct-aut-syllabus-2025][@mathworks-sltest-back-to-back-equivalence-2026]

Embedded Coder에서는 수치적 동등성을 확인하려고 normal mode 시뮬레이션의 결과를 software-in-the-loop나 processor-in-the-loop 시뮬레이션의 결과와 견준다. processor-in-the-loop 시뮬레이션은 생성 코드를 대상 프로세서나 그에 맞먹는 명령어 집합 시뮬레이터에서 실행한다.[@mathworks-ecoder-sil-pil-2026]

## 허용 오차

Simulink Test 문서에 따르면 normal mode 시뮬레이션과 생성 코드의 결과는 부동소수점 값을 비교할 때의 허용 오차 같은 수치 차이나 시간 지연, 컴파일러 문제로 다를 수 있다.[@mathworks-sltest-back-to-back-equivalence-2026] Simulink Test의 equivalence 테스트 케이스는 두 시뮬레이션의 신호를 견줄 때 절대·상대 허용 오차와 leading·lagging 시간 허용 오차를 정해 합격 기준을 둘 수 있다.[@mathworks-sltest-test-properties-2026]

## N-version programming과의 차이

Back-to-back 테스트는 변형들의 결과가 다르면 그 차이의 원인을 분석한다.[@istqb-ct-aut-syllabus-2025] [[n-version-programming|N-version programming]]은 같은 초기 명세로 따로 만든 버전들을 운용 중에 함께 실행하고, 범용 결정 알고리즘이 그 결과에서 합의 결과를 정해 소프트웨어 결함을 견딘다.[@avizienis-n-version-methodology-1995]
