---
title: 변이 테스트
aliases:
  - 뮤테이션 테스트
tags:
  - sw-engineering/sw-testing
verified: 2026-10-13
---

ISO/IEC/IEEE 24765 용어집은 **변이 테스트**(mutation testing)를, 둘 이상의 프로그램 변이를 같은 [[test-case|테스트 케이스]]로 실행해 테스트 케이스가 변이 사이의 차이를 가려내는 능력을 평가하는 테스트 방법론으로 정의한다. 이 용어집은 **프로그램 변이**(program mutation)를, 테스트 케이스가 바뀐 곳을 가려내는 능력을 평가하려고 의도한 판에서 일부러 바꾼 컴퓨터 프로그램으로 정의한다.[@ieee-sevocab-mutation-testing-2026]

## 변이체와 죽이기

변이 테스트는 처음에 [[test-case#테스트 스위트|테스트 스위트]]를 평가하는 기법으로 고안되었다. **변이체**(mutant)는 테스트 대상을 작은 구문 변경 하나만큼 조금 고친 판이고, 고치기 전의 원래 프로그램은 gold라고도 부른다. 테스트 케이스마다 원래 프로그램과 만든 변이체를 모두 실행한다.[@ieee-swebok-v4-0a-2026]

테스트 케이스가 원래 프로그램과 변이체의 차이를 드러내면 그 변이체를 **죽였다**(killed)고 한다.[@ieee-swebok-v4-0a-2026][@jia-mutation-testing-2011] 테스트를 모두 실행한 뒤에도 죽지 않은 변이체는 **살아남았다**(survived)고 한다. 늘 원래 프로그램과 같은 출력을 내서 결코 죽일 수 없는 변이체를 **동등 변이체**(equivalent mutant)라 부른다.[@jia-mutation-testing-2011]

![[diagrams/mutation-testing-kill.svg]]

## 변이 연산자

원래 프로그램에서 변이체를 만드는 변환 규칙을 **변이 연산자**(mutation operator)라 부른다. 변이 연산자는 mutant operator, mutagenic operator, mutagen, mutation rule이라고도 부른다.[@jia-mutation-testing-2011]

## Coupling effect

단순한 구문 결함을 찾다 보면 더 복잡한 실제 결함도 찾게 된다는, 변이 테스트가 깔고 있는 가정을 **coupling effect**라 부른다. SWEBOK V4.0a에 따르면 변이 테스트가 효과를 내려면 변이체를 많이 자동으로 만들어 체계적으로 실행해야 한다.[@ieee-swebok-v4-0a-2026]

DeMillo, Lipton, Sayward는 1978년 논문의 초록에서, 단순한 오류를 드러내는 프로그램 테스트가 많은 경우 훨씬 복잡한 오류를 드러내는 데도 효과적인 현상을 coupling effect라 불렀다.[@demillo-test-data-selection-1978]

## Testing criterion으로서의 변이 테스트

변이 테스트는 그 자체로 testing criterion이기도 해서, 변이체를 죽이는 것을 기준으로 테스트를 만들 수 있다. 충분한 변이체를 죽일 때까지 테스트 케이스를 무작위로 만들거나, 살아남은 변이체를 죽이도록 테스트를 설계한다. 이렇게 설계하는 경우에는 변이 테스트를 [[white-box-testing|구조 기반 기법]]으로 분류할 수도 있다.[@ieee-swebok-v4-0a-2026] Fault seeding은 [[fault-injection#Fault seeding|결함 주입]]에서 다룬다.
