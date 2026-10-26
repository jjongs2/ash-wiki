---
title: Back-to-back 테스트
tags:
  - sw-engineering/sw-testing
verified: 2026-10-03
---

**Back-to-back 테스트**는 pseudo-oracle을 쓰는 테스트 접근법이다.[@istqb-glossary-back-to-back-testing-2026] **pseudo-oracle**은 테스트 대상과 독립적으로 만든 변형으로, 같은 테스트 입력에서 낸 결과를 원래 테스트 대상의 결과와 견주는 데 쓴다.[@istqb-glossary-pseudo-oracle-2026]

Back-to-back 테스트에서는 모든 변형에 같은 [[test-case|테스트 케이스]]를 실행해 결과를 견주고, 결과가 똑같으면 통과로 보며, 다르면 그 차이의 원인을 분석한다. 이 테스트는 테스트 대상들 사이에서나 각 대상이 놓인 환경들 사이에서 생긴 의도하지 않은 차이를 아주 작은 것까지 드러내려는 것이다.[@istqb-ct-aut-syllabus-2025]

![[diagrams/back-to-back-test-comparison.svg]]

## 모델과 생성 코드

모델 기반 개발에서는 실행 가능한 모델과 그 모델에서 만든 코드를 같은 입력으로 실행해 결과를 견주는 데 back-to-back 테스트를 쓰고, 이때 모델이 pseudo-oracle이 된다. [[x-in-the-loop#SiL|SiL]]에서 실행한 생성 코드가 모델 시뮬레이션([[x-in-the-loop#MiL|MiL]])과 같은 결과를 내는지 견주는 것이 그 예다.[@istqb-ct-aut-syllabus-2025][@mathworks-sltest-back-to-back-equivalence-2026]

모델에서 만든 코드는 기대와 다르게 동작할 수 있다. 모델은 대개 부동소수점을, 컴파일한 코드는 대개 고정소수점을 쓰는 것처럼 데이터 타입이 다르거나 메모리 공간이 다르면 그런 차이가 생길 수 있다.[@istqb-ct-aut-syllabus-2025]

Embedded Coder에서는 수치적 동등성을 확인하려고 normal mode 시뮬레이션의 결과를 [[x-in-the-loop#SiL|software-in-the-loop]]나 [[x-in-the-loop#PiL|processor-in-the-loop]] 시뮬레이션의 결과와 견준다.[@mathworks-ecoder-sil-pil-2026]

## 허용 오차

Simulink Test 문서에 따르면 normal mode 시뮬레이션과 생성 코드의 결과는 부동소수점 값을 비교할 때 쓰는 허용 오차가 서로 다른 경우 같은 수치 차이나 시간 지연, 컴파일러 문제로 다를 수 있다. 결과가 맞지 않으면 이미 있던 문제가 드러날 수 있고, 그 문제를 고쳐 모델과 생성 코드가 산업 표준과 인증을 따르게 할 수 있다.[@mathworks-sltest-back-to-back-equivalence-2026] equivalence 테스트 케이스는 두 시뮬레이션의 신호를 견줄 때 절대·상대 허용 오차와 leading·lagging 시간 허용 오차를 정해 합격 기준으로 삼을 수 있어서, 결과가 똑같지 않아도 정한 허용 오차 안이면 합격으로 볼 수 있다.[@mathworks-sltest-test-properties-2026]

## N-version programming과의 차이

Back-to-back 테스트는 테스트 중에 변형들의 결과를 견주어 차이를 찾고 그 원인을 분석하는 데 쓰고[@istqb-ct-aut-syllabus-2025], [[n-version-programming|N-version programming]]은 따로 만든 버전들을 운용 중에 함께 실행해 결정 알고리즘이 정한 합의 결과로 소프트웨어 결함을 견디는 데 쓴다.[@avizienis-n-version-methodology-1995]
