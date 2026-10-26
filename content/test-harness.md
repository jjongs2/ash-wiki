---
title: 테스트 하네스
tags:
  - sw-engineering/sw-testing
verified: 2026-10-03
---

ISTQB 용어집은 **테스트 하네스**(test harness)를 [[test-case#테스트 스위트|테스트 스위트]]를 실행하는 데 필요한 드라이버와 test double의 모음으로 정의한다.[@istqb-glossary-test-harness-2026] ISO/IEC/IEEE 24765 용어집은 테스트 하네스를 상위 코드가 아직 없을 때 하위 코드를 실행해 보려고 작성한 비계 코드(scaffolding)로 정의한다.[@ieee-cs-sevocab-2026] SWEBOK V4.0a는 드라이버와 스텁 같은 테스트 하네스를 테스트 도구의 한 갈래로 두고, 테스트를 시작하고 그 출력을 기록할 수 있는 통제된 환경을 주는 도구로 정의한다.[@ieee-swebok-v4-0a-2026]

테스트 구현 활동이 만드는 테스트 환경 항목의 예로는 스텁과 드라이버 말고도 시뮬레이터와 서비스 가상화가 있다.[@istqb-ctfl-syllabus-2024]

[[test-automation#아키텍처와 프레임워크|테스트 자동화 프레임워크]]는 흔히 테스트 하네스를 담는다. ISTQB CTAL-TAE v2.0 강의계획서는 이 테스트 하네스를 test runner라고도 부른다.[@istqb-ctal-tae-syllabus-2024] xUnit 프레임워크의 구성 요소인 test runner는 [[xunit#공통 구성|xUnit]]에서 다룬다.

## 드라이버와 스텁

**드라이버**(driver)는 test driver라고도 부르며, 다른 컴포넌트를 잠시 대신해 테스트 항목을 따로 떼어 놓은 채 제어하거나 호출하는 컴포넌트나 도구다.[@istqb-glossary-driver-2026]

ISO/IEC/IEEE 24765 용어집은 **스텁**(stub)을 소프트웨어 모듈을 뼈대만 두거나 특정 목적에 맞게 만든 구현으로, 그 모듈을 호출하거나 그것에 의존하는 모듈을 개발하거나 시험할 때 쓰는 것으로 정의한다.[@ieee-cs-sevocab-2026] 스텁은 미리 정한 응답을 주는 test double의 한 종류다.[@istqb-glossary-stub-2026]

드라이버는 SUT(system under test)의 한 부분을 부르는 모듈을, 스텁은 그 부분이 부르는 모듈을 흉내 낸다.[@ieee-swebok-v4-0a-2026]

![[diagrams/test-harness-driver-stub.svg]]

## 단위 테스트와 통합 테스트에서의 쓰임

[[unit-testing#컴포넌트 테스트|컴포넌트 테스트]]에는 테스트 하네스나 [[xunit|단위 테스트 프레임워크]] 같은 지원이 필요한 경우가 많다.[@istqb-ctfl-syllabus-2024]

[[integration-testing|통합 테스트]]를 점진적으로 하면 대개 스텁, 드라이버, mock object 같은 테스트 인프라가 더 쓰인다.[@ieee-swebok-v4-0a-2026]

[[basis-path-testing|구조적 테스트]]에서 모듈 테스트와 [[integration-testing#통합 전략|상향식 통합]]을 함께 하는 전략은 스텁 없이 드라이버만 쓴다. 가장 낮은 모듈부터 드라이버로 모듈마다 구조적 테스트를 하고, 설계 계층을 한 단계씩 올라가며 새 모듈을 그 아래 모듈 전체와 통합해 드라이버로 같은 테스트를 한다.[@nist-sp-500-235-1996]

## Test double

**Test double**은 테스트 대상이 부르는 대체 컴포넌트로, 테스트를 하려고 둔다.[@istqb-glossary-test-double-2026] Meszaros는 xUnit Test Patterns에서 SUT가 의존하는 실제 컴포넌트를 테스트에서 대신하는 객체들을 아우르는 이름으로 Test Double을 쓰고, 이를 다음 다섯으로 나눈다.[@meszaros-test-double-2008][@meszaros-mocks-fakes-stubs-2008]

| 종류         | 하는 일                                                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dummy object | 메서드 인자 자리를 채우려고 넘기기만 하고, 테스트도 SUT도 쓰지 않는다. 이 점에서 엄밀히는 test double이라기보다, 이 책이 값 패턴으로 드는 Literal Value, Derived Value, Generated Value의 대안이다. |
| Test stub    | SUT의 간접 입력을 테스트가 정한 값으로 준다.                                                                                                                                                        |
| Test spy     | SUT가 내보낸 간접 출력을 기록해 두었다가 테스트가 나중에 확인하게 한다.                                                                                                                             |
| Mock object  | 받을 호출을 기대값으로 미리 설정받고, SUT의 간접 출력이 그와 맞는지 스스로 확인한다.                                                                                                                |
| Fake object  | 실제 의존 컴포넌트와 같은 기능을 훨씬 단순하고 가볍게 구현한다.                                                                                                                                     |
