---
title: N-version programming
tags:
  - sw-engineering/functional-safety
verified: 2026-10-02
---

**N-version programming**은 같은 초기 명세에서 기능이 같은 프로그램 N개($N \ge 2$)를 서로 독립적으로 만드는 소프트웨어 결함 허용 방법이다. 이렇게 만든 버전들을 함께 실행하고, 범용 결정 알고리즘이 버전들의 결과에서 합의 결과를 정한다.[@avizienis-n-version-methodology-1995] 같은 기능을 서로 다른 설계와 구현으로 실현하는 설계 다양성의 한 형태이며[@avizienis-dependable-secure-computing-2004], 다양성은 [[fault-tolerance#중복과 다양성|결함 허용]]에서 다룬다.

Avizienis와 Chen은 1977년 COMPSAC(Computer Software and Applications Conference) 논문에서 이 방법을 처음 정의했다. UCLA(University of California, Los Angeles)는 1975년에 이 방법을 redundant programming이라는 이름으로 연구하기 시작했다.[@avizienis-n-version-methodology-1995]

## 독립 개발과 합의

N개의 버전은 개발 과정에서 서로 교류하지 않는 개인이나 팀이 따로 만든다. 버전들은 초기 명세에서 정해 둔 cross-check point(cc-point)에서 비교 벡터를 내고, 결정 알고리즘은 cc-point마다 버전들의 출력에서 합의 결과를 정한다.[@avizienis-n-version-methodology-1995]

![[diagrams/n-version-programming-decision.svg]]

결정 알고리즘은 N개 버전의 출력 가운데 둘 이상이 일치하는 합의를 찾는다. 버전을 더 두는 것은, 여러 버전이 cc-point에서 비슷한 [[fault-error-failure|error]]를 내는 fault에 함께 걸리지 않는 한 실패한 버전을 메우거나 가리기 위해서다. 버전이 둘이면 버전 사이의 불일치는 찾아내지만 합의를 정하지 못한다. 그래서 불일치가 나면 안전하게 멈추거나 따로 복구 과정을 불러야 한다.[@avizienis-n-version-methodology-1995]

## 다양화 요소

N-version programming에서는 버전 사이의 다양성을 다음 여섯 요소에 요구할 수 있다. 목적은 컴파일러 버그나 모호한 알고리즘 서술처럼 여러 버전에 같은 결함을 들이는 공통 원인을 줄이는 것이다.[@avizienis-n-version-methodology-1995]

- 개발 인력의 훈련, 경험, 위치
- 알고리즘과 자료 구조
- 프로그래밍 언어
- 개발 방법
- 프로그래밍 도구와 환경
- 시험 방법과 도구[@avizienis-n-version-methodology-1995]

## 독립성에 대한 실험

N-version programming은 개발을 독립시키면 둘 이상의 버전에 같은 결함이 생길 확률이 크게 준다는 추측에 근거하며, 방법의 효과는 이 추측이 맞는지에 달려 있다. Avizienis는 결함의 독립을 이 방법의 가정이 아니라 목표로 본다.[@avizienis-n-version-methodology-1995]

Knight와 Leveson은 1986년 논문에서 두 대학(버지니아 대학, UC 어바인)의 대학원생과 학부 4학년생이 같은 명세로 독립적으로 만든 27개 버전을 같은 100만 개의 무작위 시험 입력으로 시험했다. 둘 이상의 버전이 같은 입력에서 함께 실패한 시험은 독립 가정으로 기대한 것보다 훨씬 많은 1255회였고, Knight와 Leveson은 버전들이 독립적으로 실패한다는 가정을 99% 신뢰 수준으로 기각했다.[@knight-independence-multiversion-1986]

## Recovery block과의 차이

Avizienis는 두 방식의 가장 근본적인 차이를 판정 방식으로 본다. N-version programming은 실행 환경이 주는 범용 결정 알고리즘으로 여러 버전 출력의 합의를 찾는다. Recovery block은 응용마다 따로 설계한 acceptance test를 대체 루틴 하나의 출력에 적용한다.[@avizienis-n-version-methodology-1995] Recovery block의 동작은 [[fault-tolerance#소프트웨어의 결함 허용|결함 허용]]에서 다룬다.
